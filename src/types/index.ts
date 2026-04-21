export type ShiftSlot = {
  slotId: string;
  slotName: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  jobContent: string;
  capacity: number;
  applicationCount: number;
  status: string;
};

export type ApplicationPayload = {
  name: string;
  email: string;
  slotId: string;
  slotName: string;
  category: "バイト" | "タイミー";
  memo: string;
};

export type GasResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };
