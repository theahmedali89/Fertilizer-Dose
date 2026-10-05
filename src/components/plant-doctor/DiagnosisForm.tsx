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
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "info" | "done">("idle");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<{
    likelyIssues: { name: string; confidence: string; description: string }[];
    recommendations: string[];
    urgency: string;
    needsExpert: boolean;
    disclaimer: string;
  } | null>(null);
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
    setResult(null);
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("symptoms", symptoms.trim());
      form.append("crop", crop);
      const res = await fetch("/api/plant-doctor/diagnose", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok && data.result) {
        setStatus("done");
        setResult(data.result);
      } else {
        setStatus(res.status === 501 ? "info" : "error");
        setMessage(data.error ?? "Unexpected response. Please try again.");
      }
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

          {status === "done" && result && (
            <div className="rounded-2xl border border-line bg-surface-2/50 p-5 sm:p-6 space-y-5" aria-live="polite">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl font-semibold">Diagnosis</h2>
                <span
                  className={`text-xs font-bold uppercase tracking-wide rounded-full px-2.5 py-1 ${
                    result.urgency === "high"
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      : result.urgency === "medium"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-leaf-100 text-leaf-800 dark:bg-leaf-950 dark:text-leaf-300"
                  }`}
                >
                  {result.urgency} urgency
                </span>
              </div>

              <div className="space-y-3">
                {result.likelyIssues.map((issue, i) => (
                  <div key={i} className="rounded-xl bg-surface border border-line p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold">{issue.name}</p>
                      <span className="text-xs font-medium text-ink-faint shrink-0 capitalize">
                        {issue.confidence} confidence
                      </span>
                    </div>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{issue.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="font-semibold mb-2">What to do</h3>
                <ul className="space-y-1.5 text-sm text-ink-soft leading-relaxed">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-leaf-700 dark:text-leaf-400 mt-0.5" aria-hidden>•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {result.needsExpert && (
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-2.5">
                  This case needs an expert eye — please consult your local agriculture officer.
                </p>
              )}
              <p className="text-xs text-ink-faint leading-relaxed">{result.disclaimer}</p>
            </div>
          )}

          <p className="text-xs text-ink-faint leading-relaxed">
            AI-assisted guidance only — always confirm with your local agriculture
            officer before treating a crop, especially before spraying.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
