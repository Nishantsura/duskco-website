"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're on the list. We'll be in touch.");
        setEmail("");
        setName("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-none border border-brand-chalk/30">
          <svg
            className="h-6 w-6 text-brand-chalk"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="font-primary text-sm font-light text-brand-chalk">
          {message}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-brand-chalk/20 bg-white/5 px-4 py-3 font-primary text-sm font-light text-brand-white placeholder:text-brand-medium-grey backdrop-blur-sm transition-colors focus:border-brand-chalk/50 focus:outline-none"
      />
      <input
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-brand-chalk/20 bg-white/5 px-4 py-3 font-primary text-sm font-light text-brand-white placeholder:text-brand-medium-grey backdrop-blur-sm transition-colors focus:border-brand-chalk/50 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="group w-full border border-brand-chalk bg-brand-chalk px-4 py-3 font-primary text-xs font-bold tracking-[0.2em] text-brand-black uppercase transition-all hover:bg-transparent hover:text-brand-chalk disabled:opacity-50"
      >
        {status === "loading" ? (
          <span className="animate-pulse-subtle">Joining...</span>
        ) : (
          "Join The Waitlist"
        )}
      </button>
      {status === "error" && (
        <p className="text-center font-primary text-xs font-light text-red-400">
          {message}
        </p>
      )}
    </form>
  );
}
