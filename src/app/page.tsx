import Link from "next/link";
import { fetchShiftSlots } from "@/lib/api";
import type { ShiftSlot } from "@/types";

function remainingCount(slot: ShiftSlot): number {
  return Math.max(0, slot.capacity - slot.applicationCount);
}


function StatusBadge({ slot }: { slot: ShiftSlot }) {
  const remaining = remainingCount(slot);
  const isClosed = slot.status === "締切" || remaining === 0;

  if (isClosed) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-500">
        締切
      </span>
    );
  }
  if (remaining <= 2) {
    return (
      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
        残り{remaining}名
      </span>
    );
  }
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
      残り{remaining}名
    </span>
  );
}

async function ShiftList() {
  let slots: ShiftSlot[] = [];
  let errorMessage = "";

  try {
    slots = await fetchShiftSlots();
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "不明なエラーが発生しました";
  }

  if (errorMessage) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        {errorMessage}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-gray-200 p-8 text-center text-gray-500">
        現在募集中のシフト枠はありません
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {slots.map((slot) => {
        const remaining = remainingCount(slot);
        const isClosed = slot.status === "締切" || remaining === 0;

        return (
          <li
            key={slot.slotId}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="font-semibold text-gray-800 text-base leading-tight">
                  {slot.slotName}
                </h2>
                <StatusBadge slot={slot} />
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                <div className="col-span-2">
                  <dt className="sr-only">日付</dt>
                  <dd className="flex items-center gap-1">
                    <span>📅</span>
                    {slot.date}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">時間</dt>
                  <dd className="flex items-center gap-1">
                    <span>🕐</span>
                    {slot.startTime}〜{slot.endTime}
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">場所</dt>
                  <dd className="flex items-center gap-1">
                    <span>📍</span>
                    {slot.location}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="sr-only">業務内容</dt>
                  <dd className="flex items-center gap-1">
                    <span>📋</span>
                    {slot.jobContent}
                  </dd>
                </div>
              </dl>

              {isClosed ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  募集締切
                </button>
              ) : (
                <Link
                  href={`/apply/${slot.slotId}?name=${encodeURIComponent(slot.slotName)}`}
                  className="block w-full py-2.5 rounded-lg text-sm font-medium text-center bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
                >
                  申請する
                </Link>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Home() {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        申請したいシフト枠を選んでください
      </p>
      <ShiftList />
    </div>
  );
}
