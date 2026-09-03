import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import { signCustomerToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const normalizeAddresses = (addresses: any, fallback?: { area?: string; address?: string }) => {
  const raw = Array.isArray(addresses) ? addresses : [];
  const mapped = raw
    .map((item: any) => {
      const fullAddress = String(item?.fullAddress || item?.address || "").trim();
      if (!fullAddress) return null;
      return {
        _id: item?._id ? String(item._id) : undefined,
        label: item?.label === "office" || item?.label === "other" ? item.label : "home",
        fullAddress,
        area: item?.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
        isDefault: Boolean(item?.isDefault),
      };
    })
    .filter(Boolean) as any[];

  if (!mapped.length && fallback?.address) {
    mapped.push({
      label: "home",
      fullAddress: String(fallback.address),
      area: fallback.area === "outside_dhaka" ? "outside_dhaka" : "inside_dhaka",
      isDefault: true,
    });
  }

  if (mapped.length && !mapped.some((item) => item.isDefault)) {
    mapped[0].isDefault = true;
  }

  return mapped;
};

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const fullName = String(body?.fullName || "").trim();
  const email = String(body?.email || "").toLowerCase().trim();
  const phone = String(body?.phone || "").trim();
  const area = body?.area;
  const address = String(body?.address || "").trim();
  const password = String(body?.password || "");

  if (!fullName || !phone || !address || !area) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const existing = await User.findOne({
    $or: [
      ...(email ? [{ email }] : []),
      { phone },
    ],
  });
  if (existing) {
    const match = await bcrypt.compare(password, existing.passwordHash);
    if (!match) {
      return NextResponse.json({ error: "Account already exists. Please use the correct password." }, { status: 400 });
    }
    const authToken = signCustomerToken({
      userId: existing._id.toString(),
      email: String(existing.email || ""),
      fullName: existing.fullName,
    });
    const addresses = normalizeAddresses(existing.addresses, {
      area: existing.area,
      address: existing.address,
    });
    const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];

    return NextResponse.json({
      authToken: authToken || null,
      user: {
        fullName: existing.fullName,
        email: existing.email,
        phone: existing.phone,
        area: defaultAddress?.area || existing.area,
        address: defaultAddress?.fullAddress || existing.address,
        addresses,
      },
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    ...(email ? { email } : {}),
    phone,
    area,
    address,
    passwordHash,
    addresses: [{ label: "home", fullAddress: address, area, isDefault: true }],
  });

  const authToken = signCustomerToken({
    userId: user._id.toString(),
    email: String(user.email || ""),
    fullName: user.fullName,
  });

  const addresses = normalizeAddresses(user.addresses, {
    area: user.area,
    address: user.address,
  });
  const defaultAddress = addresses.find((item) => item.isDefault) || addresses[0];

  return NextResponse.json({
    authToken: authToken || null,
    user: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      area: defaultAddress?.area || user.area,
      address: defaultAddress?.fullAddress || user.address,
      addresses,
    },
  });
}
