<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Last Asylum BR — Agent Orchestration

Este arquivo contém regras obrigatórias para qualquer agente trabalhando no projeto Last Asylum BR.

As regras abaixo devem ser consideradas requisitos do projeto e não sugestões.

---

## Specialized Agents

O projeto possui os seguintes Custom Agents:

- `last-asylum-designer`
- `backend-engineer`
- `security-engineer`

Sempre que uma tarefa estiver dentro da especialidade de um desses agentes,
prefira delegar a análise relevante ao especialista correspondente.

---

# Backend Responsibility

Mudanças relacionadas a Backend devem utilizar o `backend-engineer` quando
delegação por subagente estiver disponível.

Considere Backend qualquer alteração envolvendo:

- APIs;
- Route Handlers;
- Server Actions;
- lógica server-side;
- banco de dados;
- ORM;
- migrations;
- autenticação;
- autorização;
- sessão;
- cookies;
- webhooks;
- uploads;
- storage;
- integrações externas;
- variáveis de ambiente;
- secrets;
- cache;
- jobs;
- serviços;
- lógica de negócio executada no servidor.

---

# Mandatory Security Gate

Toda alteração que afete Backend ou uma superfície sensível deve passar por
revisão do `security-engineer` antes de ser considerada concluída.

Esta regra é OBRIGATÓRIA.

## Security Gate Trigger

A Security Gate deve ser executada sempre que houver alteração envolvendo:

- APIs;
- endpoints;
- Server Actions;
- banco de dados;
- queries;
- migrations;
- autenticação;
- autorização;
- sessões;
- cookies;
- roles;
- permissões;
- middleware;
- dados privados;
- uploads;
- storage;
- webhooks;
- integrações externas;
- secrets;
- variáveis de ambiente;
- rate limiting;
- validação server-side;
- áreas administrativas;
- processamento de dados fornecidos pelo usuário.

Alterações Frontend também devem passar pela Security Gate quando envolverem:

- autenticação;
- autorização;
- armazenamento de tokens;
- sessões;
- cookies;
- dados sensíveis;
- HTML não confiável;
- upload;
- comunicação com APIs sensíveis.

---

# Security Review Procedure

Após implementar uma alteração que ative a Security Gate:

1. Execute os testes técnicos relevantes.
2. Identifique os arquivos modificados.
3. Invoque o `security-engineer` como subagente.
4. Solicite que ele analise diretamente o código e o diff.
5. Não limite a auditoria ao resumo fornecido pelo agente implementador.
6. Corrija vulnerabilidades Critical e High encontradas.
7. Execute novamente os testes relevantes.
8. Somente então considere a implementação concluída.

O agente que implementou a funcionalidade não pode substituir a revisão
independente por uma autoavaliação de segurança.

---

# Security Review Scope

O Security Engineer deve considerar, quando aplicável:

- Authentication;
- Authorization;
- IDOR / BOLA;
- privilege escalation;
- input validation;
- SQL / NoSQL Injection;
- command injection;
- XSS;
- CSRF;
- SSRF;
- uploads;
- sessions;
- cookies;
- CORS;
- security headers;
- secrets;
- error disclosure;
- rate limiting;
- abuse;
- database integrity;
- webhooks;
- dependencies.

---

# Prevent Recursive Reviews

Alterações realizadas pelo próprio `security-engineer` durante uma auditoria
não devem criar uma cadeia infinita de novas auditorias.

O Security Engineer deve validar seus próprios patches antes de encerrar sua
execução.

---

# Design Responsibility

Toda mudança visual significativa deve respeitar o Design System do
Last Asylum BR.

Para trabalhos envolvendo:

- UI;
- UX;
- layout;
- Design System;
- componentes visuais;
- tipografia;
- cores;
- Hero Sections;
- cards;
- identidade visual;
- responsividade;

utilize `last-asylum-designer` quando a delegação especializada for apropriada.

A identidade visual do produto deve permanecer baseada em:

Plague × Sanctuary × Dark Fantasy × Strategy.

Não introduza estética:

- cyberpunk;
- sci-fi;
- SaaS genérico;
- militar moderna;
- RPG medieval caricatural.

---

# Definition of Done

Uma alteração não está concluída apenas quando funciona.

Antes de concluir uma tarefa relevante, verifique:

- implementação correta;
- TypeScript/typecheck quando aplicável;
- lint;
- testes existentes;
- build quando relevante;
- ausência de regressões evidentes;
- Security Gate quando acionada;
- Design System quando houver impacto visual.

Não declare uma tarefa concluída enquanto uma etapa obrigatória aplicável
estiver pendente.

## Security Gate Failure Policy

Se uma alteração exigir Security Gate, mas o `security-engineer` não puder ser
invocado por indisponibilidade, erro de ferramenta ou limitação da sessão:

1. Não considere a tarefa concluída.
2. Informe explicitamente que a revisão de segurança está pendente.
3. Não declare a implementação pronta para produção.
4. Informe quais arquivos precisam ser revisados pelo `security-engineer`.
5. Não substitua a auditoria obrigatória por uma autoavaliação.

# Mandatory Design Delegation

Toda tarefa que introduza ou modifique significativamente uma interface
visual deve utilizar o subagente `last-asylum-designer` antes da
implementação visual ser considerada concluída.

Considere impacto significativo de Design qualquer alteração envolvendo:

- nova página;
- nova seção;
- novo componente visual;
- redesign;
- layout;
- Hero Section;
- cards;
- navegação;
- Design System;
- design tokens;
- tipografia;
- cores;
- hierarquia visual;
- responsividade;
- experiência mobile;
- estados de interação;
- representação visual de Heróis;
- Calculadoras;
- Eventos;
- Guias.

## Design Delegation Procedure

Quando uma tarefa ativar esta regra:

1. Invoque `last-asylum-designer`.
2. Informe o objetivo funcional da interface.
3. Permita que o Designer investigue os componentes e padrões existentes.
4. Utilize sua especificação de UX/UI como orientação para a implementação.
5. Preserve componentes e tokens existentes sempre que apropriado.
6. Após a implementação, verifique se o resultado respeita a especificação.

Alterações exclusivamente técnicas sem impacto perceptível na interface
não precisam invocar o Designer.