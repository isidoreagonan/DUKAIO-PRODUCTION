import { createFileRoute } from "@/dukaio-site/router";
import { AuthPage } from "@/dukaio-site/auth/AuthPage";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [
    { title: "Connexion — Dukaio" },
    { name: "description", content: "Connectez-vous à votre espace créateur Dukaio avec votre email ou Google." },
    { property: "og:title", content: "Connexion — Dukaio" },
    { property: "og:description", content: "Retrouvez votre espace créateur Dukaio." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AuthPage mode="login" />,
});