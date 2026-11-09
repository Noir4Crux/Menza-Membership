"use client";

import { useState, type FormEvent } from "react";
import type { SessionRole } from "@/lib/session";

type LoginFormProps = {
  role: SessionRole;
};

export default function LoginForm({ role }: LoginFormProps) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          identifier: formData.get("identifier"),
          password: formData.get("password"),
        }),
      });
      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("redirect" in result) ||
        typeof result.redirect !== "string"
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Login gagal. Silakan coba lagi.";
        setError(message);
        return;
      }

      window.location.assign(result.redirect);
    } catch {
      setError("Tidak dapat menghubungi server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-[20px]">
        <label className="block">
          <span className="sr-only">Email</span>
          <input
            type="text"
            name="identifier"
            autoComplete="username"
            placeholder="Email"
            required
            className="h-[38px] w-full border-b border-[#777777] bg-transparent px-0 text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#777777]"
          />
        </label>
        <label className="block">
          <span className="sr-only">Password</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="h-[38px] w-full border-b border-[#777777] bg-transparent px-0 text-[12px] text-[#1a1a1a] outline-none placeholder:text-[#777777]"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-[12px] text-[12px] text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-[24px] flex h-[36px] w-full items-center justify-center rounded-[6px] bg-[#0d0d0d] text-[12px] text-white"
      >
        Login
      </button>
    </form>
  );
}
