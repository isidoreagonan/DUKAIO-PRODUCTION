import { createFileRoute } from "@/dukaio-site/router";
import { AuthPage } from "@/dukaio-site/auth/AuthPage";

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [
    { title: "Inscription — Dukaio" },
    { name: "description", content: "Créez votre compte Dukaio et commencez votre aventure de créateur, sans abonnement." },
    { property: "og:title", content: "Inscription — Dukaio" },
    { property: "og:description", content: "Votre aventure de créateur commence sur Dukaio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AuthPage mode="signup" />,
});