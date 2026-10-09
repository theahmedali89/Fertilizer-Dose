# Known Issues (reported 2026-10-05)

## 1. Language switcher not applying — FIXED 2026-10-05
- **Symptom tha:** Koi bhi language apply nahi ho rahi thi.
- **Wajah:** 17 locale files mein sirf scaffold metadata tha, koi tarjuma nahi tha — sab English fallback par chalta tha. Saath hi switcher next-intl ka canonical API use nahi kar raha tha.
- **Fix:** Switcher ab `router.replace(pathname, { locale })` use karta hai; 17 zubaano ke liye mukammal UI tarjume add hue (383 keys each). Technical terms (DAP, Urea, NPK) aur brand name English mein rakhe gaye.
- **Note:** Data content (fertilizer/crop descriptions) abhi English-only hai — is liye non-English locales abhi bhi `noindex` hain (SEO safety). Data tarjume ke baad per-locale revisit karna hai.

## 2. Logo tagline showing in Urdu — FIXED 2026-10-05
- **Symptom tha:** Logo ke saath tagline Urdu mein aa rahi thi.
- **Fix:** Tagline ab English hai: "Fertilizer Dose Calculator for Crops, Plants & Vegetables". `urduTagline` config se remove kar di gayi.

## 3. Duplicate `potato` slug in seed code (vegetable definition shadowed) — RESOLVED 2026-10-08
- **Masla tha:** `src/lib/growing.ts` mein `potato` slug do jagah defined tha — ek field-crop ke tor par (`CROPS` via `src/lib/agronomy.ts:502`) aur ek vegetable ke tor par (commit dcd8752, `vegetable("potato", "Potato", "آلو", ...)`).
- **Fix (Ahmed ki approval par):** shadowed `vegetable("potato", ...)` line hata di gayi; potato ab single canonical item hai (category "crop", slug "potato"). Taxonomy faisla: potato crop rahega — verified dose data aur live traffic isi par hai.
- **Asar:** zero data movement — tamam planting windows, veg doses aur translations pehle bhi crop-potato item se resolve ho rahe thay, ab bhi wahi honge. `/crops/potato` unchanged. `/vegetables/potato` ab bhi 404 dega (by design — potato vegetable category mein nahi hai).
- **Note:** dcd8752 ki report mein "2 new: potato, cabbage-chinese" likha tha — potato asal mein new nahi tha, pehle se crop ke tor par maujood tha.

## 4. Mobile drawer country list shows only Pakistan + India — REPORTED 2026-10-09
- **Symptom:** Mobile drawer mein COUNTRY dropdown sirf Pakistan aur India dikhata hai, baqi 15 countries nahi.
- **Wajah (code se confirm):** `src/server/country.ts` ka `getCountries()` DB se `country` table (status=active) parhta hai; DB read fail ho ya zero rows aain to static fallback `STATIC_COUNTRIES` (sirf PK + IN) use hota hai. Live site par fallback chal raha hai — ya to DB read fail ho raha hai ya table mein active countries nahi hain.
- **Fix (Ahmed ki approval ka muntazir):** DB mein `country` table check/seed karna ya fallback list ko poori 17-country list se replace karna.
- **Note:** Desktop par wohi component hai — wahan bhi sirf 2 aate honge.

## 5. Plant Doctor "Diagnosis failed" — REPORTED 2026-10-09
- **Symptom:** Plant Doctor mein photo + symptoms par "Diagnosis failed. Please try again in a moment." (HTTP 502).
- **Wajah (code se):** `src/app/api/plant-doctor/diagnose/route.ts` Gemini ki har error ko isi generic message mein lapet deta hai; asal error sirf server logs mein hai (`console.error("[plant-doctor]")`). Mumkina wajuhat: GEMINI_API_KEY ka masla, rate limit (10/hour per IP), ya Gemini API ki transient error.
- **Fix (Ahmed ki approval ka muntazir):** Vercel logs check kar ke asal error dekhna; zaroorat ho to error message ko specific banana (rate-limit vs API-key vs transient).
- **Note:** GEMINI_API_KEY 2026-10-06 ko working confirm hua tha.
