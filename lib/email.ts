import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number(process.env.SMTP_PORT || "587");
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || "";
const smtpSecure = process.env.SMTP_SECURE === "true";

export interface ReceiptEmailPayload {
  to: string;
  subject: string;
  html: string;
  pdfBase64: string;
  filename: string;
}

const createTransporter = () => {
  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
};

export interface OrderConfirmationPayload {
  to: string;
  orderNumber: string;
  trackingUrl?: string;
  items: Array<{ name: string; qty: number; unitPrice: number }>;
  subtotal: number;
  deliveryCharge: number;
  total: number;
}

export const sendOrderConfirmationEmail = async (payload: OrderConfirmationPayload, attempts = 3) => {
  const transporter = createTransporter();
  if (!transporter) return { success: false, error: "SMTP not configured." };

  const itemRows = payload.items
    .map((i) => `<tr><td style="padding:4px 8px;">${i.name}</td><td style="padding:4px 8px;text-align:right;">x${i.qty}</td><td style="padding:4px 8px;text-align:right;">৳${i.unitPrice * i.qty}</td></tr>`)
    .join("");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222;max-width:560px;">
      <h2 style="color:#550000;">Thanks for shopping with DealHobe! 🎉</h2>
      <p>Your order <strong>${payload.orderNumber}</strong> has been placed successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:14px;">
        <thead><tr style="background:#f3f4f6;"><th style="padding:6px 8px;text-align:left;">Product</th><th style="padding:6px 8px;text-align:right;">Qty</th><th style="padding:6px 8px;text-align:right;">Amount</th></tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="font-size:14px;">Delivery: <strong>৳${payload.deliveryCharge}</strong></p>
      <p style="font-size:16px;">Total: <strong style="color:#550000;">৳${payload.total}</strong></p>
      ${payload.trackingUrl ? `<p><a href="${payload.trackingUrl}" style="color:#550000;">Track your order</a></p>` : ""}
      <p style="font-size:13px;color:#666;">We'll contact you to confirm delivery. Thank you!</p>
    </div>
  `;

  const mailOptions = { from: smtpFrom, to: payload.to, subject: `Order Confirmed – ${payload.orderNumber}`, html };
  let lastError: unknown = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (err) {
      lastError = err;
    }
  }
  return { success: false, error: lastError };
};

export const sendReceiptEmail = async (payload: ReceiptEmailPayload, attempts = 3) => {
  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      error: "SMTP configuration is incomplete. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.",
    };
  }
  const mailOptions = {
    from: smtpFrom,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    attachments: [
      {
        filename: payload.filename,
        content: Buffer.from(payload.pdfBase64, "base64"),
        contentType: "application/pdf",
      },
    ],
  };

  let lastError: unknown = null;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (err) {
      lastError = err;
    }
  }

  return { success: false, error: lastError };
};
