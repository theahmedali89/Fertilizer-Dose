"use client";

/**
 * Diagnostic global error page. Next.js renders this when a client-side
 * exception escapes. We show the real message (not the generic text) so
 * bug reports come with actionable info — screenshot this page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            padding: 24,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 640,
            margin: "48px auto",
            lineHeight: 1.5,
          }}
        >
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Something went wrong</h2>
          <p style={{ color: "#555", marginBottom: 16 }}>
            Please take a screenshot of this page and share it with us — the
            details below help us fix the problem.
          </p>
          <pre
            style={{
              background: "#f4f4f4",
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
              fontSize: 12,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {String(error?.message || "Unknown error")}
            {error?.digest ? `\nDigest: ${error.digest}` : ""}
          </pre>
          <button
            onClick={() => reset()}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              border: "none",
              background: "#2f7d32",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
