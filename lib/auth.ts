import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET || "";

export interface CustomerTokenPayload {
  userId: string;
  email: string;
  fullName: string;
}

export const signCustomerToken = (payload: CustomerTokenPayload) => {
  if (!JWT_SECRET) {
    return null;
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
};

export const verifyCustomerToken = (token: string) => {
  if (!JWT_SECRET) {
    return null;
  }
  return jwt.verify(token, JWT_SECRET) as CustomerTokenPayload;
};
