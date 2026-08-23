<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Last Asylum BR — Project Agent Rules

Este arquivo define regras obrigatórias para qualquer agente que trabalhe no projeto **Last Asylum BR**.

Estas regras são requisitos do projeto.

Elas **não são sugestões**.

Quando uma tarefa acionar um gate especializado, o agente principal não deve substituir o especialista apenas porque também possui capacidade técnica para realizar a tarefa.

---

# 1. Specialized Agents

O projeto possui os seguintes Custom Agents:

* `last-asylum-designer`
* `backend-engineer`
* `security-engineer`

Cada agente possui uma responsabilidade especializada.

## `last-asylum-designer`

Responsável por:

* UI;
* UX;
* Design System;
* direção visual;
* componentes;
* layouts;
* hierarquia visual;
* responsividade;
* acessibilidade visual;
* experiência mobile;
* design tokens;
* consistência visual.

## `backend-engineer`

Responsável por:

* APIs;
* Route Handlers;
* Server Actions;
* lógica server-side;
* banco de dados;
* ORM;
* migrations;
* autenticação;
* autorização;
* sessões;
* persistência;
* integrações;
* serviços;
* lógica de negócio;
* processamento server-side.

## `security-engineer`

Responsável por:

* Application Security;
* threat modeling;
* autenticação;
* autorização;
* controle de acesso;
* proteção de dados;
* auditoria de Backend;
* segurança de APIs;
* revisão de código sensível;
* vulnerabilidades;
* hardening;
* security review.

---

# 2. Mandatory Task Classification

ANTES de modificar código, classifique a tarefa.

Determine se ela possui impacto em:

* Design / UI / UX;
* Backend;
* Segurança;
* múltiplos domínios simultaneamente.

Não comece uma implementação relevante antes dessa classificação.

Uma única solicitação pode acionar vários gates.

---

# 3. DESIGN GATE — MANDATORY

Toda tarefa que introduza ou modifique significativamente uma interface visual deve passar pelo `last-asylum-designer`.

A delegação não é opcional.

## 3.1 Design Gate Trigger

O Design Gate é obrigatório quando a tarefa envolver qualquer um dos seguintes:

* nova página;
* nova seção;
* redesign;
* alteração relevante de layout;
* nova tabela;
* alteração significativa de tabela existente;
* novo modal;
* dialog;
* drawer;
* novo formulário;
* alteração relevante de formulário;
* novo card;
* alteração relevante de card;
* navegação;
* menu;
* tabs;
* filtros;
* campo de busca;
* paginação visual;
* estados vazios;
* estados de loading;
* feedback visual;
* experiência mobile;
* responsividade;
* hierarquia visual;
* tipografia;
* cores;
* Design System;
* design tokens;
* novo componente de UI;
* alteração significativa de componente existente;
* Hero Section;
* painel administrativo;
* visualização de dados;
* representação visual de Heróis;
* Calculadoras;
* Eventos;
* Guias.

## 3.2 Design Gate Procedure

Quando o Design Gate for ativado:

1. NÃO implemente primeiro para pedir revisão depois.
2. Invoque `last-asylum-designer`.
3. Informe ao Designer:

   * objetivo funcional;
   * contexto da tela;
   * componentes envolvidos;
   * restrições conhecidas.
4. Permita que o Designer investigue:

   * componentes existentes;
   * tokens;
   * padrões do produto;
   * Design System.
5. Utilize a especificação do Designer como orientação para a implementação.
6. Preserve padrões existentes quando forem válidos.
7. Após a implementação, valide que o resultado respeita a especificação.

Uma revisão visual posterior NÃO substitui a delegação prévia obrigatória.

## 3.3 Design Gate Exception

Não é necessário acionar o Designer para alterações exclusivamente triviais, como:

* correção ortográfica;
* alteração textual sem impacto estrutural;
* correção técnica sem impacto perceptível na interface;
* ajuste isolado extremamente pequeno que não altere layout, hierarquia ou comportamento visual.

Quando houver dúvida razoável, considere o Design Gate ativado.

## 3.4 When the Active Agent Is the Designer

Se o agente atualmente executando a tarefa já for o `last-asylum-designer`, não é necessário invocá-lo novamente como subagente.

Nesse caso, o Design Gate já está sendo atendido diretamente pelo especialista.

---

# 4. BACKEND GATE — MANDATORY

Toda tarefa que crie ou altere comportamento Backend deve passar pelo `backend-engineer`.

O agente principal NÃO deve implementar diretamente mudanças Backend quando o especialista estiver disponível.

## 4.1 Backend Gate Trigger

O Backend Gate é obrigatório para alterações envolvendo:

* APIs;
* endpoints;
* Route Handlers;
* Server Actions;
* lógica server-side;
* CRUD;
* leitura persistida de dados;
* criação de registros;
* atualização de registros;
* deleção de registros;
* banco de dados;
* queries;
* ORM;
* migrations;
* schemas persistentes;
* autenticação;
* autorização;
* sessões;
* cookies server-side;
* roles;
* permissões;
* middleware server-side;
* pesquisa server-side;
* filtros server-side;
* paginação server-side;
* uploads;
* storage;
* webhooks;
* integrações externas;
* APIs externas;
* cache;
* filas;
* jobs;
* serviços;
* processamento no servidor;
* variáveis de ambiente utilizadas no servidor;
* secrets;
* lógica de negócio executada no servidor.

## 4.2 Backend Gate Procedure

Quando o Backend Gate for ativado:

1. NÃO implemente diretamente a alteração Backend.
2. Invoque `backend-engineer`.
3. Informe:

   * requisito funcional;
   * comportamento esperado;
   * contexto existente;
   * arquivos ou módulos relevantes, quando conhecidos.
4. Permita que o Backend Engineer investigue a implementação atual.
5. O Backend Engineer deve realizar ou orientar a implementação Backend.
6. Execute testes técnicos aplicáveis após a implementação.
7. Se a alteração também acionar Security Gate, continue obrigatoriamente para a revisão de segurança.

## 4.3 When the Active Agent Is the Backend Engineer

Se o agente atualmente executando a tarefa já for o `backend-engineer`, não é necessário invocá-lo novamente.

Nesse caso, o Backend Gate está sendo atendido diretamente pelo especialista.

Isso NÃO elimina a Security Gate.

---

# 5. SECURITY GATE — MANDATORY

Toda alteração Backend relevante ou funcionalidade sensível deve passar pelo `security-engineer` antes de ser considerada concluída.

A Security Gate é uma revisão independente.

Autoavaliação do agente implementador NÃO substitui a Security Gate.

---

# 6. Security Gate Trigger

A Security Gate é obrigatória sempre que houver alteração envolvendo:

* APIs;
* endpoints;
* Route Handlers sensíveis;
* Server Actions;
* banco de dados;
* queries;
* migrations;
* autenticação;
* autorização;
* sessões;
* cookies;
* roles;
* permissões;
* middleware;
* usuários;
* contas;
* dados pessoais;
* dados privados;
* painel administrativo;
* áreas restritas;
* alteração de perfil;
* alteração de conta;
* exclusão de conta;
* operações destrutivas;
* uploads;
* storage;
* webhooks;
* integrações externas;
* secrets;
* variáveis de ambiente sensíveis;
* rate limiting;
* validação server-side;
* processamento de dados fornecidos pelo usuário;
* pesquisa em dados privados;
* paginação de dados privados;
* modificação de registros persistentes.

Frontend também ativa Security Gate quando envolver:

* autenticação;
* autorização;
* sessões;
* cookies;
* armazenamento de tokens;
* credenciais;
* dados sensíveis;
* dados administrativos;
* HTML não confiável;
* uploads;
* comunicação com APIs sensíveis;
* lógica que possa afetar controle de acesso.

---

# 7. HIGH-RISK SECURITY PREFLIGHT

Algumas funcionalidades devem consultar o `security-engineer` também ANTES da implementação.

O Security Preflight é obrigatório para:

* autenticação;
* cadastro de usuários;
* recuperação de conta;
* troca de senha;
* painel administrativo;
* gerenciamento de usuários;
* alteração de roles;
* alteração de permissões;
* exclusão de conta;
* operações administrativas destrutivas;
* tratamento de secrets;
* upload de arquivos sensíveis;
* webhooks;
* autorização complexa;
* novos sistemas de sessão.

## Security Preflight Procedure

Antes da implementação:

1. Invoque `security-engineer`.
2. Solicite análise de riscos e requisitos de segurança.
3. Utilize esses requisitos na implementação.
4. Após a implementação, a revisão final de segurança CONTINUA obrigatória.

Preflight não substitui Security Review.

---

# 8. SECURITY REVIEW — MANDATORY AFTER IMPLEMENTATION

Após uma implementação que ative Security Gate:

1. Execute os testes técnicos relevantes.
2. Identifique os arquivos modificados.
3. Invoque `security-engineer`.
4. Informe:

   * objetivo da alteração;
   * comportamento implementado;
   * arquivos afetados;
   * superfícies de ataque conhecidas.
5. Solicite explicitamente que o Security Engineer:

   * leia o código;
   * analise o diff;
   * investigue código adjacente necessário;
   * não dependa apenas do resumo fornecido.
6. Corrija todos os achados `Critical`.
7. Corrija todos os achados `High`.
8. Reexecute os testes relevantes.
9. Somente então considere a tarefa concluída.

Achados `Medium` ou `Low` que permaneçam devem ser informados ao usuário quando relevantes.

---

# 9. Security Review Scope

O `security-engineer` deve considerar, quando aplicável:

* Authentication;
* Authorization;
* IDOR;
* BOLA;
* privilege escalation;
* horizontal privilege escalation;
* vertical privilege escalation;
* ownership validation;
* input validation;
* mass assignment;
* SQL Injection;
* NoSQL Injection;
* command injection;
* path traversal;
* XSS;
* CSRF;
* SSRF;
* insecure direct object references;
* uploads;
* session security;
* cookies;
* CORS;
* security headers;
* secrets;
* error disclosure;
* stack traces;
* rate limiting;
* abuse;
* brute force;
* enumeration;
* database integrity;
* transactions;
* webhooks;
* dependency risk;
* exposição excessiva de dados;
* operações destrutivas;
* proteção de áreas administrativas.

---

# 10. MULTI-DOMAIN TASKS

Uma única solicitação pode ativar vários agentes.

Quando isso ocorrer, todos os gates aplicáveis são obrigatórios.

O agente principal NÃO deve escolher apenas um especialista se mais de uma área estiver sendo modificada.

---

# 11. Example — Administrative User Management

Solicitação:

> Alterar a gestão de usuários para tabela, adicionar edição em modal, permitir alteração e exclusão da conta, adicionar paginação e pesquisa.

Essa tarefa ativa obrigatoriamente:

## `last-asylum-designer`

Porque envolve:

* tabela;
* modal;
* formulário;
* edição;
* paginação;
* pesquisa;
* UX administrativa;
* hierarquia de dados;
* estados de interação.

## `backend-engineer`

Quando houver comportamento server-side envolvendo:

* listagem de usuários;
* pesquisa;
* paginação;
* atualização;
* deleção;
* persistência.

## `security-engineer`

Obrigatoriamente porque envolve:

* painel administrativo;
* usuários;
* dados pessoais;
* modificação de contas;
* exclusão de contas;
* autorização;
* operações destrutivas;
* exposição de dados.

Nesse caso, a sequência esperada é aproximadamente:

1. Classificação da tarefa.
2. Design Gate.
3. Security Preflight.
4. Backend Gate.
5. Implementação / integração.
6. Testes técnicos.
7. Security Review.
8. Correções.
9. Novos testes.
10. Conclusão.

O agente principal NÃO deve executar toda essa tarefa sozinho.

---

# 12. Parallel Delegation

Quando Design e Backend forem independentes o suficiente, eles podem ser delegados em paralelo.

Exemplo:

* Designer define tabela, modal e comportamento responsivo.
* Backend Engineer trabalha no contrato de dados, paginação e CRUD.

Depois as implementações podem ser integradas.

Security Review deve analisar o resultado integrado final.

---

# 13. NO OPTIONAL LANGUAGE

Quando um gate for ativado, não trate a delegação como opcional.

NÃO utilize raciocínios como:

* "o especialista pode ser usado";
* "seria interessante revisar";
* "se quiser, posso chamar";
* "a tarefa é simples, então posso fazer sozinho";
* "eu também sei implementar isso";
* "posso pedir revisão depois";
* "quando apropriado".

Quando uma regra determinar delegação:

* DEVE invocar o especialista;
* NÃO deve pedir permissão ao usuário;
* NÃO deve esperar o usuário solicitar;
* NÃO deve substituir o especialista por autoavaliação;
* NÃO deve declarar a tarefa concluída enquanto o gate obrigatório estiver pendente.

---

# 14. Specialist Unavailability Policy

Se um especialista obrigatório não puder ser invocado por:

* indisponibilidade;
* erro de ferramenta;
* limitação da sessão;
* falha de delegação;

então:

1. Não considere a tarefa concluída.
2. Informe explicitamente qual gate está pendente.
3. Não declare a implementação pronta para produção.
4. Informe quais arquivos ou áreas precisam ser revisados.
5. Não substitua a delegação obrigatória por autoavaliação.

---

# 15. Prevent Recursive Delegation

Evite ciclos de agentes.

## Security

Alterações feitas pelo próprio `security-engineer` durante uma auditoria não devem disparar uma cadeia infinita de novas auditorias.

O Security Engineer deve validar seus próprios patches antes de encerrar a execução.

## Design

O `last-asylum-designer` não deve invocar a si próprio.

## Backend

O `backend-engineer` não deve invocar a si próprio.

---

# 16. Design System Responsibility

Toda interface do Last Asylum BR deve respeitar o Design System do projeto.

A identidade visual deve permanecer baseada em:

**Plague × Sanctuary × Dark Fantasy × Strategy**

Não introduza estética:

* cyberpunk;
* sci-fi;
* SaaS genérico;
* militar moderna;
* HUD futurista;
* RPG medieval caricatural;
* glassmorphism genérico;
* neon tecnológico dominante.

A interface deve buscar:

**Last Asylum na atmosfera.**

**Produto digital moderno na experiência.**

**Last Asylum BR na identidade.**

---

# 17. Design System Source of Truth

Quando o `last-asylum-designer` estiver envolvido, ele deve utilizar a skill:

`last-asylum-design-system`

O Design Agent deve investigar também:

* componentes existentes;
* tokens existentes;
* estilos globais;
* padrões reutilizáveis;
* responsividade atual.

Não crie estilos isolados quando uma solução sistêmica for apropriada.

---

# 18. Backend Engineering Principles

Mudanças Backend devem priorizar:

1. simplicidade;
2. clareza;
3. segurança;
4. integridade de dados;
5. manutenção;
6. desempenho;
7. escalabilidade quando necessária.

Evite:

* overengineering;
* abstrações prematuras;
* microserviços sem necessidade;
* dependências desnecessárias;
* lógica duplicada;
* validação exclusivamente client-side.

---

# 19. Server Trust Boundary

Todo dado originado fora do servidor deve ser considerado não confiável.

Quando aplicável, valide no servidor:

* body;
* query parameters;
* route parameters;
* headers;
* cookies;
* formulários;
* uploads;
* webhooks;
* integrações externas.

Não dependa exclusivamente de validação frontend.

---

# 20. Authentication and Authorization

Autenticação responde:

> Quem é o usuário?

Autorização responde:

> O usuário pode executar esta ação neste recurso?

Nunca considere autenticação suficiente para autorização.

Controles de acesso relevantes devem existir no servidor.

Esconder elementos no frontend não constitui autorização.

---

# 21. Administrative Functionality

Toda funcionalidade administrativa deve assumir uma superfície de risco elevada.

Ao trabalhar com áreas administrativas:

* valide autenticação;
* valide autorização;
* valide role/permissão;
* minimize dados retornados;
* evite exposição desnecessária;
* valide ownership quando aplicável;
* registre operações relevantes quando apropriado;
* proteja operações destrutivas;
* considere abuso automatizado;
* considere IDOR/BOLA;
* considere enumeração;
* considere rate limiting;
* trate deleção com cuidado explícito.

Funcionalidade administrativa sempre ativa Security Gate.

---

# 22. Destructive Operations

Operações destrutivas incluem, entre outras:

* excluir conta;
* excluir usuário;
* excluir registro importante;
* remover permissão;
* revogar acesso;
* apagar conteúdo persistente.

Essas operações devem receber atenção especial de Backend e Security.

Quando apropriado, considere:

* confirmação explícita;
* autorização server-side;
* transações;
* auditoria;
* proteção contra chamadas acidentais;
* respostas idempotentes;
* integridade referencial.

---

# 23. Testing Requirements

Após alterações relevantes, execute quando disponíveis e aplicáveis:

* TypeScript / typecheck;
* lint;
* testes unitários;
* testes de integração;
* testes relacionados à funcionalidade;
* build.

Não declare sucesso se testes relevantes estiverem falhando sem explicar claramente a causa.

---

# 24. Change Scope

Não transforme uma tarefa localizada em redesign ou refactor global sem necessidade.

Preserve implementações válidas existentes.

Ao encontrar problemas fora do escopo:

* não os altere silenciosamente;
* reporte-os quando relevantes;
* mantenha foco na solicitação atual.

---

# 25. Definition of Done

Uma tarefa não está concluída apenas porque funciona.

Antes de declarar uma implementação concluída, confirme:

* requisito funcional atendido;
* implementação tecnicamente coerente;
* documentação local do Next.js consultada quando relevante;
* Design Gate concluído quando aplicável;
* Backend Gate concluído quando aplicável;
* Security Preflight concluído quando obrigatório;
* Security Review concluído quando aplicável;
* vulnerabilidades Critical corrigidas;
* vulnerabilidades High corrigidas;
* typecheck aprovado quando aplicável;
* lint aprovado quando aplicável;
* testes relevantes aprovados;
* build validado quando relevante;
* ausência de regressões evidentes;
* riscos residuais relevantes comunicados.

Nenhuma etapa obrigatória aplicável pode permanecer pendente.

---

# 26. Final Agent Behavior

Antes de responder que uma tarefa está concluída, o agente principal deve perguntar internamente:

1. Esta tarefa tinha impacto visual?
2. Se sim, o Design Gate foi cumprido?
3. Esta tarefa tinha Backend?
4. Se sim, o Backend Gate foi cumprido?
5. Esta tarefa era sensível ou administrativa?
6. Se sim, Security Preflight era obrigatório?
7. Houve alteração Backend ou superfície sensível?
8. Se sim, Security Review foi executada?
9. Critical e High foram resolvidos?
10. Os testes aplicáveis foram executados?

Se qualquer resposta obrigatória for "não", a tarefa ainda não está concluída.
