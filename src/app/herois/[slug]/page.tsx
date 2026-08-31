import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroDetail from "@/components/heroes/HeroDetail";
import { getAllHeroesAsync, getHeroBySlugAsync, getFactionLabel, getRoleLabel, sanitizeSlug, sanitizeUrl } from "@/lib/heroes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  const heroes = await getAllHeroesAsync();
  return heroes.map((hero) => ({
    slug: hero.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    return {
      title: "Herói Não Encontrado | Last Asylum BR",
      description: "O herói solicitado não foi encontrado na base de dados do Last Asylum BR.",
    };
  }

  const hero = await getHeroBySlugAsync(safeSlug);

  if (!hero) {
    return {
      title: "Herói Não Encontrado | Last Asylum BR",
      description: "O herói solicitado não foi encontrado na base de dados do Last Asylum BR.",
    };
  }

  const factionText = getFactionLabel(hero.faction);
  const roleText = getRoleLabel(hero.role);
  const unlockText = hero.unlockInfo.serverDay === 1 ? "Dia 1" : `Dia ${hero.unlockInfo.serverDay}`;
  const title = `${hero.name} — Guia de Herói, Habilidades e Desbloqueio | Last Asylum BR`;
  const description = `Guia completo de ${hero.name} (${hero.title}) no Last Asylum: Plague. Veja habilidades, progressão de estrelas, facção ${factionText}, desbloqueio no ${unlockText} e calculadoras de evolução.`;
  const url = `https://lastasylumbr.com.br/herois/${sanitizeSlug(hero.slug)}`;
  const imageUrl = sanitizeUrl(
    hero.avatarUrl || hero.fullImageUrl,
    "https://res.cloudinary.com/orrs3pvy/image/upload/v1786313785/preview-link-url_rcc5uk.webp"
  );

  return {
    title,
    description,
    keywords: [
      hero.name,
      `${hero.name} Last Asylum`,
      `${hero.name} Last Asylum Plague`,
      `${hero.name} guia`,
      `${hero.name} habilidades`,
      `${hero.name} desbloqueio`,
      `${hero.name} estrelas`,
      `${hero.name} ${factionText}`,
      `${hero.name} ${roleText}`,
      "Last Asylum heróis",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${hero.name} — Guia, Habilidades e Desbloqueio | Last Asylum BR`,
      description,
      url,
      siteName: "Last Asylum BR",
      images: [
        {
          url: imageUrl,
          width: 600,
          height: 600,
          alt: `Retrato oficial de ${hero.name} em Last Asylum: Plague`,
        },
      ],
      locale: "pt_BR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${hero.name} — Guia e Habilidades | Last Asylum BR`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function HeroPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const safeSlug = sanitizeSlug(slug);
  if (!safeSlug) {
    notFound();
  }

  const [hero, allHeroes] = await Promise.all([
    getHeroBySlugAsync(safeSlug),
    getAllHeroesAsync(),
  ]);

  if (!hero) {
    notFound();
  }

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
          {
            "@type": "ListItem",
            position: 3,
            name: hero.name,
            item: `https://lastasylumbr.com.br/herois/${hero.slug}`,
          },
        ],
      },
      {
        "@type": "ItemPage",
        "@id": `https://lastasylumbr.com.br/herois/${hero.slug}`,
        url: `https://lastasylumbr.com.br/herois/${hero.slug}`,
        name: `${hero.name} — Guia de Herói, Habilidades e Desbloqueio`,
        description: hero.bio,
        inLanguage: "pt-BR",
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: hero.avatarUrl,
        },
        mainEntity: {
          "@type": "Person",
          name: hero.name,
          description: hero.bio,
          jobTitle: hero.title,
          image: hero.avatarUrl,
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

      {/* BACKGROUND FIXO DA VILA PARA PAGINAS INTERNAS */}
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
          <HeroDetail hero={hero} initialAllHeroes={allHeroes} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
