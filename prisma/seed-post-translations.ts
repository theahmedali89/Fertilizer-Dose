/**
 * Seed localized blog post content (PostTranslation).
 *
 * Source: prisma/data/post-translations.json — machine-translated drafts
 * (scripts/translate-posts.mjs). Every row is stored with status "ai_draft".
 *
 * SAFETY:
 * - Idempotent: upserts on (postId, locale).
 * - NEVER touches rows with status "reviewed" (Ahmed-approved) — those are
 *   preserved exactly, following the seed-translations.ts precedent.
 * - Matches posts by slug; posts missing from the DB are reported, not created.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

interface TranslationEntry {
  title: string;
  excerpt: string;
  body: string[];
  complete?: boolean;
}

export async function seedPostTranslations(db: PrismaClient) {
  const file = path.join(__dirname, "data", "post-translations.json");
  if (!fs.existsSync(file)) {
    console.log("post translations: data file missing, skipping");
    return;
  }
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const translations = raw.translations as Record<string, Record<string, TranslationEntry>>;

  let upserted = 0;
  let skippedReviewed = 0;
  let missingPost = 0;
  let incomplete = 0;

  for (const [slug, perLocale] of Object.entries(translations)) {
    const post = await db.post.findUnique({ where: { slug }, select: { id: true } });
    if (!post) {
      missingPost++;
      continue;
    }
    for (const [locale, t] of Object.entries(perLocale)) {
      if (!t.complete || !t.title || !t.body?.length) {
        incomplete++;
        continue;
      }
      const existing = await db.postTranslation.findUnique({
        where: { postId_locale: { postId: post.id, locale } },
        select: { status: true },
      });
      if (existing?.status === "reviewed") {
        skippedReviewed++;
        continue;
      }
      const body = t.body.join("\n\n");
      await db.postTranslation.upsert({
        where: { postId_locale: { postId: post.id, locale } },
        update: { title: t.title, excerpt: t.excerpt, body, status: "ai_draft" },
        create: { postId: post.id, locale, title: t.title, excerpt: t.excerpt, body, status: "ai_draft" },
      });
      upserted++;
    }
  }
  console.log(
    `post translations: ${upserted} upserted (ai_draft), ${skippedReviewed} reviewed-preserved, ${missingPost} posts missing, ${incomplete} incomplete skipped`,
  );
}
