import { jsPDF } from "jspdf";

const resolveInvoiceLogoUrl = async () => {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return "/logo/main-logo.png";
    const data = await res.json();
    return typeof data?.logoUrl === "string" && data.logoUrl ? data.logoUrl : "/logo/main-logo.png";
  } catch {
    return "/logo/main-logo.png";
  }
};

export const loadInvoiceLogoDataUrl = async () => {
  try {
    const logoUrl = await resolveInvoiceLogoUrl();
    const res = await fetch(logoUrl);
    if (!res.ok) return "";
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const buildInvoicePdf = (order: any, logoDataUrl = "") => {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let cursorY = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("INVOICE", margin, cursorY);
  doc.setFontSize(14);
  doc.text("DealHobe", margin, cursorY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("H 3, Rd - 19/A, Sector 4, Uttara, Dhaka", margin, cursorY + 38);
  doc.text("Phone: +8801339562735  |  bddealhobe@gmail.com", margin, cursorY + 52);

  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", 460, 30, 60, 60);
  }

  cursorY += 90;

  doc.setFont("helvetica", "bold");
  doc.text("Customer", margin, cursorY);
  doc.text("Invoice", 320, cursorY);

  doc.setFont("helvetica", "normal");
  cursorY += 18;
  doc.text(order.delivery.fullName, margin, cursorY);
  cursorY += 14;
  doc.text(order.delivery.phone, margin, cursorY);
  cursorY += 14;
  doc.text(order.delivery.address, margin, cursorY);
  if (order.delivery.email) {
    cursorY += 14;
    doc.text(order.delivery.email, margin, cursorY);
  }

  const invoiceY = cursorY - 28;
  doc.text(`Invoice No: ${order.orderNumber}`, 320, invoiceY);
  doc.text(`Order Date: ${formatDate(order.createdAt)}`, 320, invoiceY + 14);

  cursorY += 28;

  doc.setFont("helvetica", "bold");
  doc.text("#", margin, cursorY);
  doc.text("Product", margin + 24, cursorY);
  doc.text("Qty", 320, cursorY);
  doc.text("Unit (BDT)", 360, cursorY);
  doc.text("Total (BDT)", 460, cursorY);

  doc.setLineWidth(0.5);
  doc.line(margin, cursorY + 6, 560, cursorY + 6);
  cursorY += 22;

  doc.setFont("helvetica", "normal");
  order.items.forEach((item: any, index: number) => {
    doc.text(String(index + 1), margin, cursorY);
    doc.text(item.name, margin + 24, cursorY, { maxWidth: 270 });
    doc.text(String(item.qty), 320, cursorY);
    doc.text(`${item.unitPrice} BDT`, 360, cursorY);
    doc.text(`${item.lineTotal} BDT`, 460, cursorY);
    cursorY += 20;
  });

  doc.line(margin, cursorY - 6, 560, cursorY - 6);

  const summaryX = 360;
  const summaryStart = cursorY + 6;
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal", summaryX, summaryStart + 10);
  doc.text(`${order.subtotal} BDT`, 460, summaryStart + 10);
  doc.text("Delivery", summaryX, summaryStart + 28);
  doc.text(`${order.deliveryCharge} BDT`, 460, summaryStart + 28);
  doc.text("Total", summaryX, summaryStart + 46);
  doc.text(`${order.total} BDT`, 460, summaryStart + 46);

  return doc;
};
