import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { verifyCustomerToken } from "@/lib/auth";

type DeliveryArea = "inside_dhaka" | "outside_dhaka";
type AddressLabel = "home" | "office" | "other";

interface NormalizedAddress {
  _id?: string;
  label: AddressLabel;
  fullAddress: string;
  area: DeliveryArea;
  isDefault: boolean;
}

const getAuthToken = (req: NextRequest) => {
  const header = req.headers.get("authorization") || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
};

const normalizeAddresses = (
  addresses: any,
  fallback?: { area?: DeliveryArea; address?: string },
): NormalizedAddress[] => {
  const raw = Array.isArray(addresses) ? addresses : [];
  const mapped = raw
    .map((item: any): NormalizedAddress | null => {
      const fullAddress = String(item?.fullAddress || item?.address || "").trim();
      const area = item?.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
      if (!fullAddress) return null;

      const label: AddressLabel =
        item?.label === "office" || item?.label === "other" ? item.label : "home";

      return {
        _id: item?._id ? String(item._id) : undefined,
        label,
        fullAddress,
        area,
        isDefault: Boolean(item?.isDefault),
      };
    })
    .filter(Boolean) as NormalizedAddress[];

  if (!mapped.length && fallback?.address) {
    mapped.push({
      label: "home",
      fullAddress: String(fallback.address).trim(),
      area: fallback.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
      isDefault: true,
    });
  }

  if (mapped.length && !mapped.some((item) => item.isDefault)) {
    mapped[0].isDefault = true;
  }

  return mapped;
};

const normalizeBabies = (babies: any) => {
  const raw = Array.isArray(babies) ? babies : [];
  return raw
    .map((item: any) => {
      const name = String(item?.name || "").trim();
      const birthday = String(item?.birthday || "").trim();
      if (!name || !birthday) return null;
      return {
        _id: item?._id ? String(item._id) : undefined,
        name,
        birthday,
      };
    })
    .filter(Boolean);
};

const buildUserPayload = (user: any) => {
  const addresses = normalizeAddresses(user?.addresses, {
    area: user?.area,
    address: user?.address,
  });
  const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];

  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    area: defaultAddress?.area || user.area,
    address: defaultAddress?.fullAddress || user.address,
    addresses,
    babies: normalizeBabies(user?.babies),
    isBanned: Boolean(user.isBanned),
  };
};

export async function GET(req: NextRequest) {
  await connectDB();
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = verifyCustomerToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await User.findById(payload.userId).lean();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    return NextResponse.json({ user: buildUserPayload(user) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  await connectDB();
  const token = getAuthToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = verifyCustomerToken(token);
    if (!payload?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentAddresses = normalizeAddresses(user.addresses, {
      area: user.area,
      address: user.address,
    });

    user.addresses = currentAddresses.map((item) => ({
      ...(item._id ? { _id: item._id } : {}),
      label: item.label,
      fullAddress: item.fullAddress,
      area: item.area,
      isDefault: item.isDefault,
    }));
    user.babies = normalizeBabies(user.babies).map((item: any) => ({
      ...(item?._id ? { _id: item._id } : {}),
      name: item.name,
      birthday: item.birthday,
    }));

    const action = String(body?.action || "legacy_add_address");

    if (action === "legacy_add_address") {
      const area = body?.area;
      const address = String(body?.address || "").trim();
      if (!area || !address) {
        return NextResponse.json({ error: "Missing address fields." }, { status: 400 });
      }
      user.addresses.push({
        label: "home",
        fullAddress: address,
        area,
        isDefault: user.addresses.length === 0,
      });
    } else if (action === "add_address") {
      const label: AddressLabel =
        body?.label === "office" || body?.label === "other" ? body.label : "home";
      const fullAddress = String(body?.fullAddress || "").trim();
      const area: DeliveryArea = body?.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
      const setDefault = Boolean(body?.isDefault);

      if (!fullAddress) {
        return NextResponse.json({ error: "Full address is required." }, { status: 400 });
      }

      if (setDefault) {
        user.addresses = user.addresses.map((item: any) => ({
          ...item,
          isDefault: false,
        }));
      }

      user.addresses.push({
        label,
        fullAddress,
        area,
        isDefault: setDefault || user.addresses.length === 0,
      });
    } else if (action === "update_address") {
      const addressId = String(body?.addressId || "").trim();
      const label: AddressLabel =
        body?.label === "office" || body?.label === "other" ? body.label : "home";
      const fullAddress = String(body?.fullAddress || "").trim();
      const area: DeliveryArea = body?.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka";
      const setDefault = Boolean(body?.isDefault);

      if (!addressId) {
        return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
      }

      if (!fullAddress) {
        return NextResponse.json({ error: "Full address is required." }, { status: 400 });
      }

      if (setDefault) {
        user.addresses = user.addresses.map((item: any) => ({
          ...item,
          isDefault: false,
        }));
      }

      let found = false;
      user.addresses = user.addresses.map((item: any) => {
        if (String(item?._id) !== addressId) {
          return item;
        }

        found = true;
        return {
          ...item,
          label,
          fullAddress,
          area,
          isDefault: setDefault ? true : Boolean(item?.isDefault),
        };
      });

      if (!found) {
        return NextResponse.json({ error: "Address not found." }, { status: 404 });
      }
    } else if (action === "set_default_address") {
      const addressId = String(body?.addressId || "").trim();
      if (!addressId) {
        return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
      }

      let found = false;
      user.addresses = user.addresses.map((item: any) => {
        const isDefault = String(item?._id) === addressId;
        if (isDefault) found = true;
        return { ...item, isDefault };
      });

      if (!found) {
        return NextResponse.json({ error: "Address not found." }, { status: 404 });
      }
    } else if (action === "delete_address") {
      const addressId = String(body?.addressId || "").trim();
      if (!addressId) {
        return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
      }

      const next = user.addresses.filter((item: any) => String(item?._id) !== addressId);
      user.addresses = next;
    } else if (action === "add_baby") {
      const name = String(body?.name || "").trim();
      const birthday = String(body?.birthday || "").trim();
      if (!name || !birthday) {
        return NextResponse.json({ error: "Baby name and birthday are required." }, { status: 400 });
      }

      user.babies.push({ name, birthday });
    } else if (action === "delete_baby") {
      const babyId = String(body?.babyId || "").trim();
      if (!babyId) {
        return NextResponse.json({ error: "Baby ID is required." }, { status: 400 });
      }

      user.babies = user.babies.filter((item: any) => String(item?._id) !== babyId);
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    if (user.addresses.length && !user.addresses.some((item: any) => item.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    const defaultAddress = user.addresses.find((item: any) => item.isDefault) || user.addresses[0];
    if (defaultAddress) {
      user.area = defaultAddress.area;
      user.address = defaultAddress.fullAddress || user.address;
    }

    await user.save();

    return NextResponse.json({ user: buildUserPayload(user) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
