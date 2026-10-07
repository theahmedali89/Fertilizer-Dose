import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Fraunces, Inter } from "next/font/google";
import { routing, getLocaleMeta } from "@/i18n/routing";
import { siteConfig } from "@/config/site";
import { Header } from "@/components/layout/Header";
import { CountrySelector } from "@/components/layout/CountrySelector";
import { Footer } from "@/components/layout/Footer";
import { TranslationNotice } from "@/components/TranslationNotice";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** Site-wide metadata; pages add their own canonical + hreflang via localizedMetadata(). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = `${siteConfig.name} — ${siteConfig.tagline}`;
  return {
    metadataBase: new URL(siteConfig.url),
    title: { absolute: title },
    description: siteConfig.description,
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title,
      description: siteConfig.description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: siteConfig.description,
    },
    robots: { index: true, follow: true },
    verification: {
      google: "D9sj8d0owhO9v-rR4pPZxhf7ia-XW_1nuEEXM6_Inzc",
    },
    other: {
      "msvalidate.01": "529DC86FB230334BA177507D238EC8CB",
    },
  };
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "en",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const { dir } = getLocaleMeta(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans bg-canvas text-ink antialiased`}
      >
        <NextIntlClientProvider>
          <AuthProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-[100] focus:rounded focus:bg-leaf-700 focus:px-3 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            <Header countrySelector={<CountrySelector />} />
            {locale !== "en" && <TranslationNotice />}
            <main id="main-content">
              <div className="field-texture" aria-hidden="true" />
              {children}
            </main>
            <Footer />
          </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
