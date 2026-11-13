import { createFileRoute } from "@/dukaio-site/router";
import { useRevealAll } from "@/dukaio-site/site/Reveal";
import { Hero } from "@/dukaio-site/landing/Hero";
import { Stats } from "@/dukaio-site/landing/Stats";
import { Bento } from "@/dukaio-site/landing/Bento";
import { Dome } from "@/dukaio-site/landing/Dome";
import { Personas } from "@/dukaio-site/landing/Personas";
import { Share } from "@/dukaio-site/landing/Share";
import { Tools } from "@/dukaio-site/landing/Tools";
import { Pricing } from "@/dukaio-site/landing/Pricing";
import { Faq } from "@/dukaio-site/landing/Faq";
import { FinalCta } from "@/dukaio-site/landing/FinalCta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dukaio — Vendez vos produits digitaux, sans abonnement" },
      { name: "description", content: "Vendez fichiers, cours, services et licences en ligne et encaissez en Mobile Money. Aucun abonnement : 5 % par vente seulement." },
      { property: "og:title", content: "Dukaio — Vendez ce que vous savez" },
      { property: "og:description", content: "La boutique en ligne des créateurs africains. Mobile Money, carte, PayPal. Sans abonnement, 5 % par vente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useRevealAll();
  return (
    <>
      <Hero />
      <Stats />
      <Bento />
      <Dome />
      <Personas />
      <Share />
      <Tools />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
