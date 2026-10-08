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
