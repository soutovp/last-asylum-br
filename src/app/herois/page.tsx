import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroesLanding from "@/components/heroes/HeroesLanding";
import { getAllHeroesAsync } from "@/lib/heroes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Central de Heróis — Guia Completo, Habilidades e Desbloqueio | Last Asylum BR",
  description:
    "Guia completo de todos os heróis de Last Asylum: Plague. Consulte habilidades, evolução por estrelas, facções, funções de combate, cronograma de desbloqueio por dia de servidor e calculadoras de recursos.",
  keywords: [
    "Last Asylum heróis",
    "Last Asylum Plague heróis",
    "Habilidades heróis Last Asylum",
    "Tier list Last Asylum",
    "Guia heróis Last Asylum",
    "Desbloqueio heróis Last Asylum",
    "Evolução de heróis Last Asylum",
    "Heróis UR Last Asylum",
    "Heróis SSR Last Asylum",
    "Warrior Ranger Warlock Last Asylum",
    "Calculadora heróis Last Asylum",
  ],
  alternates: {
    canonical: "https://lastasylumbr.com.br/herois",
  },
  openGraph: {
    title: "Central de Heróis — Guia Completo e Habilidades | Last Asylum BR",
    description:
      "Explore a base de dados oficial de heróis do Last Asylum: Plague. Filtros por facção, função, raridade, idade do servidor e simulação de habilidades por estrelas.",
    url: "https://lastasylumbr.com.br/herois",
    siteName: "Last Asylum BR",
    images: [
      {
        url: "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp",
        width: 1200,
        height: 630,
        alt: "Central de Heróis Last Asylum BR",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Central de Heróis — Guia Completo e Habilidades | Last Asylum BR",
    description:
      "Explore a base de dados de heróis do Last Asylum: Plague. Habilidades, progressão de estrelas e dias de liberação.",
    images: ["https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"],
  },
};

export default async function HeroesPage() {
  const allHeroes = await getAllHeroesAsync();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: "https://lastasylumbr.com.br",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Central de Heróis",
            item: "https://lastasylumbr.com.br/herois",
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": "https://lastasylumbr.com.br/herois",
        url: "https://lastasylumbr.com.br/herois",
        name: "Central de Heróis do Last Asylum: Plague — Guia Completo e Habilidades",
        description:
          "Base de dados completa de heróis de Last Asylum: Plague com habilidades, progressão de estrelas, cronograma de liberação por idade de servidor e calculadoras de evolução.",
        inLanguage: "pt-BR",
        mainEntity: {
          "@type": "ItemList",
          name: "Lista de Heróis de Last Asylum: Plague",
          numberOfItems: allHeroes.length,
          itemListElement: allHeroes.map((hero, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: hero.name,
            url: `https://lastasylumbr.com.br/herois/${hero.slug}`,
            image: hero.avatarUrl,
          })),
        },
      },
    ],
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950 overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* BACKGROUND FIXO DA VILA PARA PAGINAS INTERNAS (OPACIDADE 85%) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.webp"
          alt="Background Fixo da Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/25 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/70 via-transparent to-[#080c14]/80"></div>
      </div>

      {/* CONTEUDO PRINCIPAL */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <HeroesLanding initialHeroes={allHeroes} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
