import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Política de Privacidade - Last Asylum BR",
  description: "Entenda como o portal Last Asylum BR protege seus dados, a utilização de cookies e nossa conformidade com a LGPD e termos do Google AdSense.",
  robots: "noindex, follow", // Páginas legais geralmente não precisam disputar ranking, mas devem ser seguidas
};

export default function PrivacidadePage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-slate-100 selection:bg-[#00ff88] selection:text-slate-950 overflow-x-hidden">
      {/* BACKGROUND VILA */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/village_banner_2.png"
          alt="Background Vila"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-[#080c14]/30 backdrop-blur-[1px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/75 via-[#080c14]/65 to-[#080c14]/85"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 py-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#101623]/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-8">
            
            {/* Título Principal */}
            <div className="border-b border-slate-800/80 pb-6">
              <h1 className="text-3xl sm:text-4xl font-black text-white">Política de Privacidade</h1>
              <p className="text-xs text-slate-400 mt-2 font-mono">Última atualização: 10 de agosto de 2026</p>
            </div>

            {/* Conteúdo */}
            <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
              
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">1. Introdução</h2>
                <p>
                  A sua privacidade é de extrema importância para nós. Esta Política de Privacidade explica como o portal <strong>Last Asylum BR</strong> coleta, utiliza, armazena e protege as suas informações ao navegar em nosso site.
                </p>
                <p>
                  Este site opera de acordo com a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) do Brasil.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">2. Coleta de Informações</h2>
                <p>
                  Coletamos informações das seguintes formas:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm">
                  <li><strong>Dados de Acesso (Analytics)</strong>: Dados técnicos como endereço IP, navegador utilizado, páginas visitadas e tempo de permanência são processados de forma anônima para métricas de desempenho.</li>
                  <li><strong>Mecanismo de Contagem de Visualizações</strong>: Para fins de controle de leitura de artigos e guias, o site pode armazenar localmente em seu navegador (LocalStorage) um identificador temporário para evitar contagens duplicadas, sem reter dados que revelem sua identidade civil.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">3. Cookies e Anúncios do Google AdSense</h2>
                <p>
                  Este site exibe anúncios servidos pelo <strong>Google AdSense</strong>. O Google utiliza cookies para veicular anúncios com base nas suas visitas anteriores a este ou a outros sites na internet.
                </p>
                <p>
                  O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios direcionados de acordo com os seus interesses. Você pode optar por desativar a publicidade personalizada acessando as <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Configurações de anúncios do Google</a>.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">4. Compartilhamento de Dados</h2>
                <p>
                  Nós não vendemos, alugamos ou comercializamos dados pessoais de usuários a terceiros. Informações genéricas de tráfego podem ser compartilhadas com serviços de análise confiáveis (como Google Analytics) e redes de publicidade parceiras estritamente para a manutenção do portal.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">5. Links para Sites de Terceiros</h2>
                <p>
                  Nosso site pode conter links para ambientes externos que não são operados por nós (como sites oficiais do jogo, grupos externos de chats ou redes sociais). Não temos controle sobre o conteúdo e práticas de privacidade desses portais e não podemos aceitar responsabilidade por suas respectivas políticas.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">6. Alterações a Esta Política</h2>
                <p>
                  Reservamo-nos o direito de atualizar ou modificar esta Política de Privacidade a qualquer momento. Recomendamos a leitura periódica deste documento para manter-se informado sobre como protegemos suas informações.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">7. Contato</h2>
                <p>
                  Se você tiver dúvidas, solicitações de remoção ou comentários relativos a esta Política de Privacidade, entre em contato direto pelo e-mail:
                </p>
                <p className="font-mono text-cyan-400">
                  <a href="mailto:contato@lastasylumbr.com.br" className="underline">contato@lastasylumbr.com.br</a>
                </p>
              </section>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
