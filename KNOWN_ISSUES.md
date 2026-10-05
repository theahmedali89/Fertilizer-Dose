# Known Issues (reported 2026-10-05)

## 1. Language switcher not applying — FIXED 2026-10-05
- **Symptom tha:** Koi bhi language apply nahi ho rahi thi.
- **Wajah:** 17 locale files mein sirf scaffold metadata tha, koi tarjuma nahi tha — sab English fallback par chalta tha. Saath hi switcher next-intl ka canonical API use nahi kar raha tha.
- **Fix:** Switcher ab `router.replace(pathname, { locale })` use karta hai; 17 zubaano ke liye mukammal UI tarjume add hue (383 keys each). Technical terms (DAP, Urea, NPK) aur brand name English mein rakhe gaye.
- **Note:** Data content (fertilizer/crop descriptions) abhi English-only hai — is liye non-English locales abhi bhi `noindex` hain (SEO safety). Data tarjume ke baad per-locale revisit karna hai.

## 2. Logo tagline showing in Urdu — FIXED 2026-10-05
- **Symptom tha:** Logo ke saath tagline Urdu mein aa rahi thi.
- **Fix:** Tagline ab English hai: "Fertilizer Dose Calculator for Crops, Plants & Vegetables". `urduTagline` config se remove kar di gayi.
