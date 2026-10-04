"use client";

import { useRef, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Select, Textarea } from "@/components/ui/fields";
import { CROPS } from "@/lib/agronomy";

export function DiagnosisForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [crop, setCrop] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "info">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setStatus("error");
      setMessage("Photo must be JPG, PNG or WebP.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setStatus("error");
      setMessage("Photo must be under 5 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus("idle");
    setMessage("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus("error");
      setMessage("Please attach a plant photo first.");
      return;
    }
    if (symptoms.trim().length < 10) {
      setStatus("error");
      setMessage("Please describe the symptoms in at least a full sentence.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("symptoms", symptoms.trim());
      form.append("crop", crop);
      const res = await fetch("/api/plant-doctor/diagnose", { method: "POST", body: form });
      const data = await res.json();
      setStatus(res.ok ? "idle" : res.status === 501 ? "info" : "error");
      setMessage(data.error ?? "Unexpected response. Please try again.");
    } catch {
      setStatus("error");
      setMessage("Network error — please check your connection and try again.");
    }
  };

  return (
    <Card>
      <CardBody className="sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <Field
            label="Plant photo"
            hint="A clear, well-lit close-up of the affected leaf or area. JPG, PNG or WebP, max 5 MB."
          >
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pick(e.dataTransfer.files?.[0]);
              }}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-line hover:border-leaf-600 transition-colors bg-surface-2/50 p-6 text-center"
              role="button"
              tabIndex={0}
              aria-label="Upload plant photo"
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              {preview ? (
                <img src={preview} alt="Selected plant photo preview" className="mx-auto max-h-64 rounded-xl object-contain" />
              ) : (
                <>
                  <svg className="mx-auto text-ink-faint" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                    <path d="M12 16V4m0 0 4 4m-4-4L8 8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" strokeLinecap="round" />
                  </svg>
                  <p className="mt-3 font-semibold">Click or drop a photo here</p>
                </>
              )}
            </div>
            {file && (
              <p className="mt-2 text-xs text-ink-faint">
                {file.name} · {Math.round(file.size / 1024)} KB
              </p>
            )}
          </Field>

          <Field label="Crop (if known)">
            <Select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="">Not sure / other</option>
              {CROPS.map((c) => (
                <option key={c.slug} value={c.name}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <Field
            label="Describe the symptoms"
            hint="What do you see? Yellow spots, wilting, holes in leaves, when it started, which part of the plant…"
          >
            <Textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Yellow spots with brown edges on lower leaves of wheat, started about a week ago after rain…"
            />
          </Field>

          {message && (
            <div
              role={status === "error" ? "alert" : "status"}
              className={
                status === "error"
                  ? "text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3"
                  : "text-sm text-ink-soft bg-harvest-100 dark:bg-harvest-950/40 border border-harvest-200 dark:border-harvest-800 rounded-xl px-4 py-3"
              }
            >
              {message}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={status === "sending"}>
            {status === "sending" ? "Analyzing…" : "Diagnose my plant"}
          </Button>

          <p className="text-xs text-ink-faint leading-relaxed">
            AI-assisted guidance only — always confirm with your local agriculture
            officer before treating a crop, especially before spraying.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
