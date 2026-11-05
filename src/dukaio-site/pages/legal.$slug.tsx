import { createFileRoute, Link, notFound } from "@/dukaio-site/router";
import { getLegal, legalPages } from "@/dukaio-site/lib/legal";
import { useRevealAll } from "@/dukaio-site/site/Reveal";

export const Route = createFileRoute("/legal/$slug")({
  loader: ({ params }) => {
    const page = getLegal(params.slug);
    if (!page) throw notFound();
    return page;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.title} — Dukaio` : "Page légale — Dukaio";
    const d = loaderData?.intro ?? "Informations légales Dukaio.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: LegalPage,
});

function LegalPage() {
  const page = Route.useLoaderData();
  useRevealAll();
  return (
    <section className="wrap grid gap-12 pb-24 pt-32 md:pt-40 lg:grid-cols-[16rem_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">Légal</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {legalPages.map((l) => (
            <Link key={l.slug} to="/legal/$slug" params={{ slug: l.slug }} className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-muted !text-foreground font-medium" }}>
              {l.short}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="max-w-2xl">
        <h1 className="font-display text-4xl md:text-6xl">{page.title}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{page.intro}</p>
        <p className="mt-4 text-xs text-muted-foreground">Dernière mise à jour : 3 novembre 2026 · Dolapo ECOM LLC</p>
        <div className="prose-legal mt-10 border-t border-border pt-4">
          {page.sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => <p key={p}>{p}</p>)}
              {s.list && <ul>{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
