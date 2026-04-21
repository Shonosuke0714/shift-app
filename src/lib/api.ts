import type { ApplicationPayload, GasResponse, ShiftSlot } from "@/types";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? "";

export async function fetchShiftSlots(): Promise<ShiftSlot[]> {
  if (!GAS_URL) throw new Error("GAS_URLが設定されていません");

  const res = await fetch(`${GAS_URL}?action=getSlots`, { cache: "no-store" });
  if (!res.ok) throw new Error("シフト枠の取得に失敗しました");

  const json: GasResponse<ShiftSlot[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

export async function submitApplication(
  payload: ApplicationPayload
): Promise<void> {
  if (!GAS_URL) throw new Error("GAS_URLが設定されていません");

  const res = await fetch(GAS_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "submitApplication", ...payload }),
  });
  if (!res.ok) throw new Error("申請の送信に失敗しました");

  const json: GasResponse<null> = await res.json();
  if (!json.success) throw new Error(json.error);
}
