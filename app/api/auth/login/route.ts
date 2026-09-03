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

  const identifier = String(body?.identifier || body?.email || "").trim();
  const password = String(body?.password || "");

  if (!identifier || !password) {
    return NextResponse.json({ error: "Missing credentials." }, { status: 400 });
  }

  const normalizedEmail = identifier.includes("@") ? identifier.toLowerCase() : "";
  const user = await User.findOne(
    normalizedEmail
      ? { email: normalizedEmail }
      : { phone: identifier },
  );
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

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
