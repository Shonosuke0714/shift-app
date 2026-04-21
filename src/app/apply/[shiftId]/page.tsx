"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { submitApplication } from "@/lib/api";
import type { ApplicationPayload } from "@/types";

type FormState = {
  name: string;
  email: string;
  category: "バイト" | "タイミー";
  memo: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export default function ApplyPage() {
  const params = useParams<{ shiftId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slotId = params.shiftId;
  const slotName = searchParams.get("name") ?? slotId;

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    category: "バイト",
    memo: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const payload: ApplicationPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      slotId,
      slotName,
      category: form.category,
      memo: form.memo.trim(),
    };

    try {
      await submitApplication(payload);
      setStatus("success");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "送信に失敗しました"
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">申請が完了しました</h2>
        <p className="text-sm text-gray-500 mb-6">
          確認メールをご確認ください
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          シフト一覧に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4"
      >
        ← 戻る
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <p className="text-xs text-blue-600 font-medium mb-0.5">申請するシフト</p>
        <p className="text-sm font-semibold text-blue-900">{slotName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
            氏名 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="山田 太郎"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
            区分 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="バイト">バイト</option>
            <option value="タイミー">タイミー</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="memo">
            メモ（任意）
          </label>
          <textarea
            id="memo"
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows={3}
            placeholder="連絡事項があれば記入してください"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {status === "error" && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full py-3 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === "submitting" ? "送信中..." : "申請を送信する"}
        </button>
      </form>
    </div>
  );
}
