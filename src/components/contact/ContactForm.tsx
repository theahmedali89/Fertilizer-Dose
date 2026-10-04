"use client";

import { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/fields";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <Card className="mt-8">
      <CardBody className="sm:p-8">
        {sent ? (
          <div role="status" className="text-center py-10">
            <div className="mx-auto w-14 h-14 rounded-full bg-leaf-100 dark:bg-leaf-950 grid place-items-center text-leaf-700 dark:text-leaf-300 mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-semibold">Message noted</h2>
            <p className="text-ink-soft mt-2">Thanks for writing — we&apos;ll get back to you soon.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-5"
          >
            <Field label="Name">
              <Input required placeholder="Your name" />
            </Field>
            <Field label="Email">
              <Input required type="email" placeholder="you@example.com" />
            </Field>
            <Field label="Message">
              <Textarea required placeholder="How can we help?" />
            </Field>
            <Button type="submit" size="lg">Send message</Button>
            <p className="text-xs text-ink-faint">
              This form will connect to our email service when the backend launches.
            </p>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
