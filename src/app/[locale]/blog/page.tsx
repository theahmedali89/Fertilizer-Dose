import { getTranslations, setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/lib/seo";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/ui/Section";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPosts } from "@/server/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return localizedMetadata({
    locale,
    path: "/blog",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}


export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const posts = await getPosts();

  const POSTS_PER_PAGE = 12;
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  let page = parseInt(sp.page ?? "", 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700 dark:text-leaf-400 mb-3 flex items-center gap-2">
            <span className="inline-block h-px w-8 bg-leaf-600 dark:bg-leaf-400" aria-hidden />
            Blog
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-balance max-w-3xl">
            Learn the why behind the dose.
          </h1>
        </div>
      </section>
      <Section>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {pagePosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <Card className="h-full overflow-hidden transition-all duration-200 group-hover:shadow-lift group-hover:-translate-y-0.5">
                {post.image && (
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <CardBody>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="neutral">{post.category}</Badge>
                    <span className="text-ink-faint">{post.readMinutes} min read · {post.date}</span>
                  </div>
                  <h2 className="mt-3 font-display text-lg font-semibold leading-snug group-hover:text-leaf-700 dark:group-hover:text-leaf-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-ink-soft leading-relaxed">{post.excerpt}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-5" aria-label="Blog pages">
            {page > 1 ? (
              <Link
                href={{ pathname: "/blog", query: { page: page - 1 } }}
                className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <span className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-faint opacity-50">
                ← Previous
              </span>
            )}
            <span className="text-sm text-ink-faint">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={{ pathname: "/blog", query: { page: page + 1 } }}
                className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-soft hover:border-leaf-600 hover:text-leaf-700 dark:hover:text-leaf-300 transition-colors"
              >
                Next →
              </Link>
            ) : (
              <span className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink-faint opacity-50">
                Next →
              </span>
            )}
          </nav>
        )}
      </Section>
    </>
  );
}
