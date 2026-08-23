<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Last Asylum BR — Agent Orchestration

Estas regras são obrigatórias para qualquer agente trabalhando neste projeto.

O agente principal deve classificar a tarefa antes de implementar e delegar aos especialistas aplicáveis.

A capacidade do agente principal de executar uma tarefa sozinho NÃO substitui um gate obrigatório.

## Specialists

* `last-asylum-designer` — UI, UX, layout, componentes e Design System.
* `backend-engineer` — APIs, banco, server-side, persistência e regras de negócio.
* `security-engineer` — Application Security e revisão de superfícies sensíveis.
* `last-asylum-content-editor` — conteúdo editorial, SEO e semântica de páginas indexáveis.

Uma tarefa pode ativar múltiplos especialistas.

---

# DESIGN GATE — MANDATORY

Invoque `last-asylum-designer` ANTES de implementar alterações visuais significativas, incluindo:

* nova página ou seção;
* redesign ou mudança relevante de layout;
* novos/alterados componentes de UI;
* tabelas, formulários, modais, cards, navegação, filtros, busca ou paginação;
* responsividade, experiência mobile ou hierarquia visual;
* tipografia, cores ou design tokens;
* interfaces administrativas;
* Heróis, Calculadoras, Eventos ou Guias quando houver impacto visual.

Não é necessário para correções textuais ou mudanças técnicas sem impacto visual relevante.

Se o agente ativo já for `last-asylum-designer`, o gate está atendido.

A revisão posterior NÃO substitui a participação prévia do Designer.

---

# BACKEND GATE — MANDATORY

Invoque `backend-engineer` ANTES de implementar alterações envolvendo:

* APIs, endpoints, Route Handlers ou Server Actions;
* CRUD ou persistência;
* banco de dados, ORM, queries, schemas ou migrations;
* autenticação, autorização, sessões, roles ou permissões;
* pesquisa, filtros ou paginação server-side;
* uploads, storage, webhooks ou integrações externas;
* cache, jobs ou serviços;
* secrets, variáveis de ambiente server-side;
* qualquer regra de negócio executada no servidor.

O agente principal NÃO deve implementar diretamente essas alterações quando o especialista estiver disponível.

Se o agente ativo já for `backend-engineer`, o gate está atendido.

Backend Gate NÃO elimina Security Gate.

---

# SECURITY GATE — MANDATORY

Invoque `security-engineer` para revisar ANTES DA CONCLUSÃO toda alteração que envolva Backend ou superfície sensível, especialmente:

* autenticação, autorização, sessões ou permissões;
* usuários, contas ou dados privados;
* painel/ações administrativas;
* criação, edição ou exclusão de dados persistentes;
* APIs protegidas;
* uploads, storage, webhooks ou integrações;
* secrets;
* operações destrutivas;
* dados fornecidos pelo usuário;
* controle de acesso no Front-End;
* HTML não confiável ou dados sensíveis no cliente.

## Security Preflight

Invoque também `security-engineer` ANTES da implementação quando a tarefa envolver:

* autenticação ou recuperação de conta;
* gerenciamento administrativo de usuários;
* roles ou permissões;
* exclusão de conta;
* operações administrativas destrutivas;
* secrets;
* webhooks;
* autorização complexa.

Preflight NÃO substitui a revisão final.

## Security Review

Após a implementação:

1. Execute testes técnicos relevantes.
2. Invoque `security-engineer`.
3. Solicite análise direta do código e do diff.
4. Corrija achados Critical e High.
5. Reexecute os testes relevantes.
6. Somente então considere a Security Gate concluída.

Autoavaliação do agente implementador NÃO substitui essa revisão.

Se o agente ativo for `security-engineer`, ele deve validar os próprios patches sem iniciar recursão.

---

# SEO CONTENT GATE — MANDATORY

Invoque `last-asylum-content-editor` quando uma página pública e indexável for criada ou alterada em aspectos que afetem:

* conteúdo editorial;
* headings e estrutura semântica;
* título SEO ou meta description;
* slug/URL ou canonical;
* links internos;
* alt text editorial;
* Schema.org;
* indexação/noindex;
* intenção de busca.

Não invoque para mudanças puramente visuais/técnicas sem impacto em conteúdo ou indexação, nem para páginas administrativas ou áreas autenticadas não indexáveis.

A revisão SEO é obrigatória antes da conclusão quando este gate for ativado.

Se o agente ativo já for `last-asylum-content-editor`, o gate está atendido.

---

# MULTI-DOMAIN TASKS

Todos os gates aplicáveis devem ser cumpridos.

Exemplos:

## Página pública nova com conteúdo

`last-asylum-designer` + `last-asylum-content-editor`

## Nova funcionalidade com UI e Backend

`last-asylum-designer` + `backend-engineer` + `security-engineer`

## Gestão administrativa de usuários

`last-asylum-designer` + `security-engineer` preflight + `backend-engineer` + `security-engineer` review

## Alteração Backend sem UI

`backend-engineer` + `security-engineer`

Design e Backend podem trabalhar em paralelo quando seus escopos forem independentes.

---

# NO OPTIONAL DELEGATION

Quando um gate for ativado:

* DEVE invocar o especialista automaticamente;
* NÃO pergunte ao usuário se deseja a delegação;
* NÃO trate o especialista como opcional;
* NÃO substitua a delegação por autoavaliação;
* NÃO implemente primeiro quando o gate exigir participação prévia;
* NÃO declare a tarefa concluída com gate obrigatório pendente.

Não use justificativas como:

* "a tarefa é simples";
* "eu também consigo fazer";
* "podemos revisar depois";
* "o especialista pode ser acionado se desejar".

---

# SPECIALIST FAILURE

Se um especialista obrigatório não puder ser invocado:

1. Não considere a tarefa concluída.
2. Informe qual gate está pendente.
3. Informe quais áreas/arquivos ainda precisam de revisão.
4. Não declare a implementação pronta para produção.
5. Não substitua o especialista por autoavaliação.

---

# PROJECT RULES

## Design

O `last-asylum-designer` deve seguir a skill `last-asylum-design-system`.

Não introduza estética incompatível com o projeto, como cyberpunk, sci-fi, SaaS genérico ou militar moderno.

## Backend

Toda entrada externa deve ser tratada como não confiável e validada server-side quando aplicável.

Autenticação não substitui autorização.

## Scope

Não transforme uma alteração localizada em redesign ou refactor global sem necessidade.

Preserve implementações válidas e reporte problemas fora do escopo em vez de alterá-los silenciosamente.

---

# TESTING

Após alterações relevantes, execute quando aplicável:

* typecheck;
* lint;
* testes existentes;
* testes relacionados à funcionalidade;
* build.

Não declare sucesso com verificações relevantes falhando sem explicar a causa.

---

# DEFINITION OF DONE

Antes de concluir, confirme:

1. Requisito funcional atendido.
2. Documentação local do Next.js consultada quando relevante.
3. Todos os gates aplicáveis foram cumpridos.
4. Critical/High de segurança foram corrigidos.
5. Verificações técnicas aplicáveis passaram.
6. Não há regressões evidentes.
7. Riscos residuais relevantes foram informados.

Se algum gate obrigatório estiver pendente, a tarefa NÃO está concluída.
