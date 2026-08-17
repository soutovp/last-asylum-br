import { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Serviço - Last Asylum BR",
  description: "Leia os Termos de Serviço do portal Last Asylum BR. Entenda as regras de uso de nossas calculadoras, conduta na seção de comentários e direitos autorais.",
  robots: "noindex, follow",
};

export default function TermosPage() {
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
              <h1 className="text-3xl sm:text-4xl font-black text-white">Termos de Serviço</h1>
              <p className="text-xs text-slate-400 mt-2 font-mono">Última atualização: 13 de agosto de 2026</p>
            </div>

            {/* Conteúdo */}
            <div className="space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed">
              
              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e utilizar o portal <strong>Last Asylum BR</strong>, você concorda expressamente em cumprir e respeitar os presentes Termos de Serviço. Caso não concorde com qualquer parte destas diretrizes, recomendamos que não utilize os nossos serviços, calculadoras ou área de comunidade.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">2. Natureza Não Oficial do Portal</h2>
                <p>
                  O <strong>Last Asylum BR</strong> é um portal brasileiro de fãs, de caráter estritamente educativo, informativo e de lazer. Nós <strong>não possuímos nenhum vínculo oficial</strong> com os desenvolvedores, publicadoras ou marcas detentoras do jogo "Last Asylum Plague". Todas as opiniões, tutoriais e análises expressas aqui são de responsabilidade da nossa comunidade de jogadores.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">3. Uso de Calculadoras e Precisão Matemática</h2>
                <p>
                  Nossas calculadoras de recursos (Antitoxinas, Fragmentos de Heróis, Insígnias de Reino, etc.) são desenvolvidas com base nas fórmulas matemáticas coletadas na versão ativa do jogo. 
                </p>
                <p>
                  Contudo, os desenvolvedores do jogo podem realizar atualizações silenciosas nas mecânicas, balanceamentos e quantidades exigidas. Portanto:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm">
                  <li>O portal **não garante** precisão matemática absoluta ou reembolso de recursos virtuais caso haja discrepância com o servidor do jogo.</li>
                  <li>As ferramentas servem estritamente como estimativa aproximada para o planejamento estratégico dos jogadores.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">4. Contas de Usuário e Cadastro</h2>
                <p>
                  Ao criar um cadastro em nosso portal para salvar suas informações de jogo ou deixar comentários:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm">
                  <li>Você se compromete a fornecer dados verídicos e a manter a segurança da sua senha.</li>
                  <li>É proibido assumir identidades falsas de moderadores do portal ou de funcionários do jogo.</li>
                  <li>Contas com nomes ofensivos, impróprios, racistas, xenófobos ou que promovam spam serão suspensas ou banidas permanentemente sem aviso prévio.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">5. Código de Conduta nos Comentários</h2>
                <p>
                  Queremos manter a nossa comunidade de sobreviventes unida e saudável. Ao publicar comentários em nossos guias e notícias, você concorda em:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-sm">
                  <li>Tratar outros jogadores, criadores e moderadores com respeito e cordialidade.</li>
                  <li>Não publicar links comerciais, vírus, malware, pirataria, cheats ou ferramentas que violem as regras oficiais do jogo.</li>
                  <li>Não praticar spam, flood ou discussões fora de contexto (off-topic).</li>
                </ul>
                <p>
                  A equipe administrativa do <strong>Last Asylum BR</strong> reserva-se o direito de excluir comentários e silenciar perfis infratores imediatamente a fim de preservar o ambiente do portal.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">6. Propriedade Intelectual e Assets</h2>
                <p>
                  Todas as imagens oficiais, logotipos, artes e designs de personagens pertencentes ao jogo "Last Asylum Plague" são propriedade exclusiva de seus respectivos criadores e desenvolvedores. O portal faz uso desses materiais estritamente sob as regras de uso justo (fair use) e divulgação comunitária.
                </p>
                <p>
                  Os layouts originais, a programação das calculadoras e as traduções personalizadas feitas no portal pertencem ao <strong>Last Asylum BR</strong> e sua reprodução comercial é proibida sem nossa autorização por escrito.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">7. Limitação de Responsabilidade</h2>
                <p>
                  O portal é disponibilizado "como está", sem qualquer garantia de funcionamento ininterrupto ou livre de bugs. Nós não nos responsabilizamos por perdas de contas virtuais do jogo, decisões tomadas com base em nossos guias ou links de terceiros contidos nas discussões.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-bold text-[#00ff88] font-mono">8. Alterações nos Termos e Contato</h2>
                <p>
                  Estes Termos podem ser atualizados periodicamente. Ao continuar utilizando o site após alterações serem publicadas, você aceita as novas regras. Caso tenha dúvidas sobre estes termos, entre em contato via e-mail:
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
