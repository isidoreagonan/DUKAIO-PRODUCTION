import { Product } from "@/contexts/CartContext";

export const products: Product[] = [
  {
    id: "1",
    title: "Maîtrisez le Marketing Digital en Afrique",
    description: "Formation complète pour dominer le marketing digital sur le continent africain. Stratégies locales, réseaux sociaux, et croissance.",
    price: 25000,
    currency: "XOF",
    category: "course",
    image: "",
    badge: "Bestseller",
    rating: 4.8,
    students: 1240,
  },
  {
    id: "2",
    title: "Guide PDF : Lancer son E-commerce",
    description: "Tout ce qu'il faut savoir pour lancer votre boutique en ligne en Afrique de l'Ouest. De A à Z.",
    price: 5000,
    currency: "XOF",
    category: "ebook",
    image: "",
    rating: 4.5,
    students: 890,
  },
  {
    id: "3",
    title: "Templates Notion pour Entrepreneurs",
    description: "Pack de 15 templates Notion prêts à l'emploi pour gérer votre business efficacement.",
    price: 7500,
    currency: "XOF",
    category: "template",
    image: "",
    badge: "Nouveau",
    rating: 4.9,
    students: 320,
  },
  {
    id: "4",
    title: "Formation Développement Web Fullstack",
    description: "Apprenez React, Node.js et déployez vos apps. 40h de vidéo + projets pratiques.",
    price: 45000,
    currency: "XOF",
    category: "formation",
    image: "",
    badge: "Premium",
    rating: 4.7,
    students: 650,
  },
  {
    id: "5",
    title: "Guide : Investir en Bourse depuis l'Afrique",
    description: "PDF complet sur l'investissement boursier adapté au contexte africain. BRVM, marchés internationaux.",
    price: 8000,
    currency: "XOF",
    category: "ebook",
    image: "",
    rating: 4.6,
    students: 1100,
  },
  {
    id: "6",
    title: "Formation Design UI/UX Mobile",
    description: "Créez des interfaces mobiles exceptionnelles. Figma, prototypage, design system.",
    price: 35000,
    currency: "XOF",
    category: "formation",
    image: "",
    rating: 4.8,
    students: 480,
  },
];

export const categories = [
  { key: "all", label: "Tout" },
  { key: "course", label: "Cours" },
  { key: "formation", label: "Formations" },
  { key: "ebook", label: "E-books & PDF" },
  { key: "template", label: "Templates" },
];

export const formatPrice = (price: number, currency: string = "XOF") => {
  return new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
};
