export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  /** Feature image path (public/). */
  image: string;
  /** Full article body as simple markdown-ish paragraphs (rendered simply). */
  body: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "how-to-calculate-fertilizer-dose-per-acre",
    image: "/blog/fertilizer-calculation.webp",
    title: "How to Calculate Fertilizer Dose Per Acre (With a Worked Example)",
    excerpt:
      "The exact formula agronomists use to convert a nutrient recommendation into bags of urea, DAP and MOP — explained with a real wheat example.",
    category: "Guides",
    date: "2026-09-12",
    readMinutes: 7,
    body: [
      "Every fertilizer recommendation starts as nutrients, not products. An agronomist will tell you wheat needs 50 kg nitrogen, 25 kg phosphorus (P₂O₅) and 20 kg potash (K₂O) per acre — but you buy urea, DAP and MOP. The bridge between the two is one formula:",
      "Fertilizer required (kg) = (nutrient required × 100) ÷ nutrient percentage in the fertilizer.",
      "This works because the percentage on the bag tells you how many kilograms of nutrient are in every 100 kg of product. Urea is 46% nitrogen, DAP is 18% nitrogen and 46% phosphate, MOP is 60% potash.",
      "Worked example — wheat per acre needing 50–25–20:",
      "Step 1 — Phosphorus first. DAP is 46% P₂O₅: (25 × 100) ÷ 46 = 54.3 kg DAP per acre. That DAP also carries nitrogen: 54.3 × 18% = 9.8 kg N.",
      "Step 2 — Remaining nitrogen from urea. Needed 50 kg, already have 9.8 kg, so 40.2 kg remain: (40.2 × 100) ÷ 46 = 87.4 kg urea per acre.",
      "Step 3 — Potassium from MOP: (20 × 100) ÷ 60 = 33.3 kg MOP per acre.",
      "Final answer: about 54 kg DAP + 87 kg urea + 33 kg MOP per acre. Our calculator above does this instantly for any area in acres, kanal, marla or hectares — and shows every step, so you can verify the math yourself.",
      "One caution: recommendations vary by soil test and region. Use the calculated dose as your starting point and confirm with your local agriculture officer.",
    ],
  },
  {
    slug: "urea-vs-dap-what-each-does",
    image: "/blog/urea-vs-dap.webp",
    title: "Urea vs DAP: What Each Fertilizer Actually Does",
    excerpt:
      "Both supply nitrogen, but they are not interchangeable. Here's what each one does in the soil and when to use which.",
    category: "Fertilizers",
    date: "2026-08-28",
    readMinutes: 5,
    body: [
      "Urea (46% nitrogen) and DAP (18% nitrogen, 46% phosphate) are the two most-used fertilizers in Pakistan and India — and the most confused.",
      "Urea is a nitrogen specialist. Its 46% N is the highest concentration of any common solid fertilizer, which is why it is the go-to for top-dressing: quick nitrogen when the crop is growing fast. Split it into two or three applications; a single heavy dose risks losses to the air (volatilization) and causes lodging.",
      "DAP is primarily a phosphorus fertilizer that happens to carry nitrogen. Phosphorus barely moves in soil, so DAP must go down at sowing, near the seed zone — top-dressed phosphorus is largely wasted. Its 18% nitrogen is a bonus that counts toward the total nitrogen bill.",
      "The practical rule: DAP at sowing for phosphorus (plus its nitrogen), urea in splits for the remaining nitrogen. Never try to meet a phosphorus need with urea, and never pay DAP prices just for nitrogen.",
      "Check the NPK table in our fertilizer library before buying — the percentages on the bag are the only numbers that matter for the calculation.",
    ],
  },
  {
    slug: "why-soil-testing-saves-money",
    image: "/blog/soil-testing.webp",
    title: "Why Soil Testing Saves You Money Every Season",
    excerpt:
      "A soil test costs less than a single bag of DAP — and stops you buying fertilizer your field doesn't need.",
    category: "Soil Health",
    date: "2026-08-10",
    readMinutes: 6,
    body: [
      "Most farmers fertilize by habit: the same bags, every season, regardless of what the soil already holds. A soil test breaks that habit with facts.",
      "A basic soil health test reports available nitrogen, phosphorus, potassium, pH, organic matter and often zinc. With those numbers, the standard fertilizer recommendation can be adjusted up or down — many fields test high in phosphorus after years of DAP use, meaning the DAP dose can be cut without any yield penalty.",
      "The economics are simple: one test typically costs less than a single 50 kg bag of DAP, while skipping even half a bag per acre across your holding pays for the test many times over.",
      "How often? Test once every two to three years, or whenever you take over new land. Sample from 6–8 spots per field at 0–15 cm depth, mix, and send about half a kilogram to your district soil laboratory.",
      "Use our calculator with the adjusted nutrient figures from your soil health card, and keep the card — comparing tests over years shows whether your soil is improving or degrading.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
