const BASE_URL = "https://portal.packzy.com/api/v1";

function headers() {
  return {
    "Api-Key": process.env.STEADFAST_API_KEY!,
    "Secret-Key": process.env.STEADFAST_SECRET_KEY!,
    "Content-Type": "application/json",
  };
}

export interface SteadfastConsignmentPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
}

export interface SteadfastConsignmentResult {
  consignment_id: number;
  tracking_code: string;
  status: string;
}

// Bulk create returns a flat array — each item has consignment fields directly
interface SteadfastBulkItem {
  invoice: string;
  consignment_id: number;
  tracking_code: string;
  status: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `Steadfast error ${res.status}`);
  return json;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: headers(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || `Steadfast error ${res.status}`);
  return json;
}

export async function createConsignment(
  payload: SteadfastConsignmentPayload,
): Promise<SteadfastConsignmentResult> {
  // Response: { status, message, consignment: { consignment_id, tracking_code, status, ... } }
  const data = await post<{ consignment: SteadfastConsignmentResult }>("/create_order", payload);
  return data.consignment;
}

export async function bulkCreateConsignments(
  payloads: SteadfastConsignmentPayload[],
): Promise<{ invoice: string; result: SteadfastConsignmentResult | null }[]> {
  // Response: flat array [{ invoice, consignment_id, tracking_code, status }]
  const items = await post<SteadfastBulkItem[]>("/create_order/bulk-order", payloads);
  return items.map((item) => ({
    invoice: item.invoice,
    result: item.consignment_id
      ? { consignment_id: item.consignment_id, tracking_code: item.tracking_code, status: item.status }
      : null,
  }));
}

export async function getStatusByConsignmentId(consignmentId: string): Promise<string> {
  // Response: { status: 200, delivery_status: "in_review" }
  const data = await get<{ delivery_status: string }>(`/status_by_cid/${consignmentId}`);
  return data.delivery_status;
}

export async function getStatusByInvoice(invoice: string): Promise<string> {
  const data = await get<{ delivery_status: string }>(`/status_by_invoice/${invoice}`);
  return data.delivery_status;
}

export async function getBalance(): Promise<number> {
  const data = await get<{ current_balance: number }>("/get_balance");
  return data.current_balance;
}

// Maps Steadfast delivery_status to JoyToy OrderStatus
export function mapSteadfastStatus(
  steadfastStatus: string,
): "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | null {
  switch (steadfastStatus) {
    case "pending":
    case "in_review":
    case "hold":
      return "Processing";
    case "delivered":
    case "partial_delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return null;
  }
}
