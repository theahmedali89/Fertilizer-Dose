import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPosts, getPost } from "@/server/data";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { localizedMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  return localizedMetadata({
    locale,
    path: `/blog/${slug}`,
    title: p.title,
    description: p.excerpt,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = await getPost(slug);
  if (!post) notFound();
  const related = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);
  const postUrl = `${siteConfig.url}/blog/${post.slug}`;

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt}
        url={postUrl}
        datePublished={post.date}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Blog", url: `${siteConfig.url}/blog` },
          { name: post.title, url: postUrl },
        ]}
      />
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-xs text-ink-faint mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">Home</Link>
            <span aria-hidden> · </span>
            <Link href="/blog" className="hover:underline">Blog</Link>
            <span aria-hidden> · </span>
            <span className="text-ink-soft">{post.category}</span>
          </nav>
          <div className="flex items-center gap-2 text-xs mb-4">
            <Badge variant="neutral">{post.category}</Badge>
            <span className="text-ink-faint">{post.date} · {post.readMinutes} min read</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-balance leading-tight">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{post.excerpt}</p>
        </div>
      </section>

      <Section>
        <div className="max-w-3xl">
          <Card><CardBody className="sm:p-8">
            <div className="space-y-5 text-[16.5px] leading-[1.8] text-ink-soft">
              {post.body.map((para, i) => (
                <p key={i} className={i === 0 ? "text-lg text-ink font-medium" : ""}>{para}</p>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-line flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold">Share:</span>
              {[
                ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(post.title)}`],
                ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=`],
                ["X", `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="text-sm rounded-lg border border-line px-3.5 py-1.5 hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors">
                  {label}
                </a>
              ))}
            </div>
          </CardBody></Card>

          {related.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-semibold mb-4">Related articles</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="group">
                    <Card className="h-full group-hover:shadow-lift transition-all">
                      <CardBody>
                        <Badge variant="neutral">{r.category}</Badge>
                        <h3 className="mt-2.5 font-display text-lg font-semibold leading-snug group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                          {r.title}
                        </h3>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
