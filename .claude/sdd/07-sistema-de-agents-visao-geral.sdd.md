# SDD: Sistema de Agents do FUSE — Visão Geral Completa

> Status: Active reference
> Criado: 2026-03-26
> Última actualização: 2026-03-26
> Objectivo: consolidar, num único SDD, a explicação completa do sistema de agents activo do FUSE
> Referências: [CLAUDE.md](/Users/eugeniosilva/Project/FUSE/.claude/CLAUDE.md), [05-migracao-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/05-migracao-skills-first.sdd.md), [06-paralelo-sistema-atual-vs-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/06-paralelo-sistema-atual-vs-skills-first.sdd.md), [ai-system.html](/Users/eugeniosilva/Project/FUSE/docs/ai-system.html), [demonstration-orchestration.html](/Users/eugeniosilva/Project/FUSE/docs/demonstration-orchestration.html), [analytics.html](/Users/eugeniosilva/Project/FUSE/docs/analytics.html)

---

## 1. Resumo Executivo

O FUSE opera hoje com um sistema AI **Skills-First**, centrado em `.claude/`, desenhado para suportar trabalho de engenharia mobile com regras explícitas, separação de responsabilidades e documentação pública alinhada ao sistema real.

O sistema não é apenas um conjunto de prompts. Ele funciona como uma **plataforma operacional de agents** composta por:

- um entrypoint estável em `CLAUDE.md`
- rules activadas por contexto de ficheiros
- skills reutilizáveis e carregadas sob demanda
- agentes de execução com papéis delimitados
- memória preparada por agente
- documentação pública gerada a partir da configuração viva

Em termos práticos, isto significa que o FUSE passou de um modelo de orquestração mais centralizado para um modelo mais modular, auditável e alinhado com o mercado actual de coding agents.

---

## 2. Porque este sistema existe

O sistema foi criado para resolver um problema real: **usar AI dentro de um projecto React Native de forma disciplinada, previsível e sustentável**, sem cair em improviso, prompts monolíticos ou automação sem governança.

Os objectivos principais são:

- manter consistência arquitectural
- reduzir erro de contexto
- separar política, conhecimento e execução
- tornar o sistema mais fácil de evoluir
- permitir documentação pública coerente com o sistema activo

---

## 3. Estrutura do sistema

O sistema activo vive em `.claude/` e está organizado em cinco blocos:

```text
.claude/
  CLAUDE.md
  rules/
  skills/
  agents/
  agent-memory/
```

### 3.1 `CLAUDE.md`

É o entrypoint do sistema.

Responsabilidades:

- definir a identidade do sistema
- declarar o contrato arquitectural do projecto
- declarar invariantes críticos
- definir o routing de alto nível entre tipos de pedido e agentes
- apontar para `rules/`, `skills/`, `agents/` e `agent-memory/`

O ficheiro foi intencionalmente mantido curto para evitar inflacionar o contexto base.

### 3.2 `rules/`

Contém guardrails activados por path.

Função:

- carregar apenas quando o tipo de ficheiro afectado o justificar
- impor restrições estruturais e técnicas sem despejar contexto global

Rules actuais:

- `screens.md`
- `services.md`
- `hooks.md`
- `typescript.md`
- `tests.md`
- `git.md`

### 3.3 `skills/`

São pacotes de conhecimento especializado.

Função:

- encapsular padrões reutilizáveis
- fornecer templates, referências e pequenas automações
- permitir loading progressivo em vez de instruções globais

### 3.4 `agents/`

São os contextos de execução.

Função:

- receber um papel claro
- operar com ferramentas adequadas ao papel
- usar um conjunto de skills coerente com o tipo de trabalho

### 3.5 `agent-memory/`

É a camada preparada para persistência por agente.

Função:

- permitir que cada papel mantenha uma fronteira própria de aprendizagem
- reduzir mistura de contexto entre responsabilidades diferentes

---

## 4. Contrato arquitectural do projecto

Todo o sistema de agents do FUSE foi desenhado em volta deste contrato:

`Model -> Service -> Query -> Hook -> Screen`

### Interpretação do contrato

- `Model`: representação de domínio
- `Service`: transporte, DTOs e boundary com APIs
- `Query`: orquestração assíncrona, cache e server state
- `Hook`: lógica de negócio e handlers
- `Screen`: apresentação

### Consequência prática

Os agents, skills e rules não são genéricos. Eles foram configurados para proteger este fluxo. Isso explica porque:

- DTOs não podem chegar à UI
- screens não devem conter lógica de negócio
- services não devem carregar responsabilidades de query
- hooks são o centro de orquestração funcional

---

## 5. Invariantes críticos do sistema

O sistema activo assume estes invariantes como não negociáveis:

- sem barrel imports
- sem inline styles
- DTOs nunca chegam à UI
- dados externos devem ser validados
- cobertura global `>= 80%`
- hooks e services com alvo `>= 90%`
- unit tests sem chamadas reais a APIs
- agents não fazem auto-commit nem auto-push

Estes invariantes vivem no entrypoint e são reforçados por rules e skills específicas.

---

## 6. Operating model

O sistema segue uma separação clara entre **policy**, **knowledge** e **execution**.

### Policy

Fica em:

- [CLAUDE.md](/Users/eugeniosilva/Project/FUSE/.claude/CLAUDE.md)
- [rules](/Users/eugeniosilva/Project/FUSE/.claude/rules)

### Knowledge

Fica em:

- [skills](/Users/eugeniosilva/Project/FUSE/.claude/skills)

### Execution

Fica em:

- [agents](/Users/eugeniosilva/Project/FUSE/.claude/agents)

### Documentation

Fica em:

- [docs/index.html](/Users/eugeniosilva/Project/FUSE/docs/index.html)
- [docs/ai-system.html](/Users/eugeniosilva/Project/FUSE/docs/ai-system.html)
- [docs/demonstration-orchestration.html](/Users/eugeniosilva/Project/FUSE/docs/demonstration-orchestration.html)
- [docs/analytics.html](/Users/eugeniosilva/Project/FUSE/docs/analytics.html)

Isto permite que o sistema tenha menos sobreposição e mais auditabilidade.

---

## 7. Routing do sistema

O routing activo é definido por tipo de pedido.

| Tipo de pedido | Agente primário |
| --- | --- |
| SDD, design de sistema, estratégia de refactor, acoplamento | `architect` |
| Implementação, bug fix, refactor executável | `engineer` |
| Review, regressões, comentários de PR | `reviewer` |
| Testes unitários e integração | `test-writer` |
| Quality gates, performance, static analysis | `quality` |
| Documentação, UX, business-to-SDD | `design-docs` |
| Fluxos de PR | `pr-lifecycle` |
| Segurança | `security-analyst` |

O sistema não tenta resolver tudo com um agent genérico. O objectivo é que o tipo de pedido encaminhe para o papel com melhor contexto e melhor conjunto de tools.

---

## 8. Agentes do sistema

## 8.1 `architect`

Papel:

- autoridade de arquitectura
- criação e revisão de SDDs
- análise de acoplamento
- definição de fronteiras e decisões estruturais

Tools:

- `Read`
- `Grep`
- `Glob`

Skills associadas:

- `sdd-creation`
- `coupling-analysis`
- `project-architecture`

### Quando deve ser usado

- antes de implementação significativa
- antes de refactors estruturais
- em pedidos de desenho técnico

---

## 8.2 `engineer`

Papel:

- implementação de features
- bug fixes
- refactors de execução

Tools:

- `Read`
- `Write`
- `Edit`
- `Bash`
- `Grep`
- `Glob`

Skills associadas:

- `react-native-patterns`
- `api-integration`
- `project-architecture`
- `clean-code`

### Quando deve ser usado

- quando já existe direcção arquitectural suficiente
- quando o trabalho envolve código executável

---

## 8.3 `reviewer`

Papel:

- revisão pré-merge
- detecção de regressões
- identificação de drift arquitectural
- avaliação de riscos de performance e manutenção

Tools:

- `Read`
- `Grep`
- `Glob`
- `Bash`

Skills associadas:

- `typescript-strict`
- `react-native-patterns`
- `clean-code`

### Quando deve ser usado

- depois de implementação
- antes de merge
- em análise de risco técnico

---

## 8.4 `test-writer`

Papel:

- criação de testes unitários e integração
- reforço de cobertura e isolamento

Tools:

- `Read`
- `Write`
- `Edit`
- `Bash`

Skills associadas:

- `project-architecture`
- `typescript-strict`

### Quando deve ser usado

- após implementação
- em reforço de cobertura
- em consolidação de comportamento esperado

---

## 8.5 `quality`

Papel:

- quality gates
- análise de performance
- análise estática
- separação entre problemas mecânicos e problemas arquitecturais

Tools:

- `Read`
- `Grep`
- `Bash`

Skills associadas:

- `react-native-patterns`

### Quando deve ser usado

- em auditorias de qualidade
- em temas de performance
- em verificação de hotspots

---

## 8.6 `design-docs`

Papel:

- documentação do sistema
- business-to-SDD
- padrões de UX e copy
- alinhamento entre narrativa e sistema real

Tools:

- `Read`
- `Write`
- `Edit`

Skills associadas:

- `ux-standards`
- `translations`
- `sdd-creation`

### Quando deve ser usado

- ao actualizar documentação
- ao refinar UX/copy
- ao transformar input de negócio em design executável

---

## 8.7 `pr-lifecycle`

Papel:

- agente determinístico de fluxo de PR
- criar, acompanhar e avaliar merge gate

Tools:

- `Read`
- `Bash`

Skills associadas:

- `pr-workflow`

### Regra crítica

Nunca faz merge autonomamente.

### Quando deve ser usado

- quando o pedido é explícito sobre o ciclo de PR

---

## 8.8 `security-analyst`

Papel:

- análise de segurança alinhada com OWASP
- revisão de storage, crypto, network, auth, platform, code e resilience

Tools:

- `Read`
- `Grep`
- `Glob`

Skills associadas:

- `owasp-security`

### Quando deve ser usado

- em alterações de auth
- em features sensíveis
- em auditorias de segurança

---

## 9. Skills do sistema

O sistema possui 11 skills activas.

| Skill | Função principal |
| --- | --- |
| `sdd-creation` | criar e refinar SDDs |
| `coupling-analysis` | medir acoplamento e detectar violações de fronteira |
| `project-architecture` | reforçar o contrato estrutural do projecto |
| `react-native-patterns` | impor padrões mobile e de performance |
| `typescript-strict` | impor segurança de tipos |
| `api-integration` | padronizar DTOs, services e queries |
| `ux-standards` | reforçar padrões de UX e estados |
| `translations` | tratar strings, i18n e copy |
| `clean-code` | manter legibilidade e baixo acoplamento local |
| `pr-workflow` | tratar comandos determinísticos de PR |
| `owasp-security` | consolidar revisão de segurança mobile |

### Como as skills funcionam

- não substituem os agentes
- não são regras globais
- são pacotes especializados de conhecimento
- podem usar `context: fork` quando faz sentido isolar contexto

---

## 10. Rules activas

As rules actuais foram desenhadas para carregar apenas quando relevantes.

### `screens.md`

Protege:

- ausência de lógica de negócio em screens
- consumo correcto de hooks
- co-location funcional

### `services.md`

Protege:

- fronteira de transportes
- normalização de DTOs
- testabilidade de services

### `hooks.md`

Protege:

- naming de hooks
- shape de retorno
- delimitação de side effects

### `typescript.md`

Protege:

- strict typing
- segurança em boundaries
- exaustividade e validação

### `tests.md`

Protege:

- cobertura mínima
- isolamento
- ausência de chamadas reais a APIs

### `git.md`

Protege:

- Conventional Commits
- ausência de push directo para `main`
- rastreabilidade de workflows e mudanças estruturais

---

## 11. Memória por agente

Cada agente tem um directório próprio em `agent-memory/`.

Isto não significa que o sistema já esteja a fazer aprendizagem complexa por si só. Significa que a arquitectura já foi preparada para:

- preservar padrões por papel
- evitar mistura de contexto entre funções diferentes
- permitir evolução futura com memory boundaries mais limpas

Exemplos:

- `architect`: decisões de arquitectura e tradeoffs aceites
- `reviewer`: padrões recorrentes de findings
- `quality`: hotspots e baseline de performance
- `security-analyst`: findings e critérios de severidade

---

## 12. Fluxo operacional típico

O fluxo típico do sistema é este:

1. O pedido entra.
2. O tipo de pedido determina o agent primário.
3. O `CLAUDE.md` fornece identidade, invariantes e routing base.
4. Rules carregam conforme os ficheiros afectados.
5. Skills relevantes entram sob demanda.
6. O agent executa com tools apropriadas ao papel.
7. A saída é validada por testes, review ou quality gates, consoante o caso.

### Exemplo prático

Pedido: “criar uma nova feature com integração API”.

Fluxo esperado:

1. `architect` define SDD e fronteiras.
2. `engineer` implementa usando `api-integration`, `project-architecture` e `clean-code`.
3. `test-writer` adiciona testes.
4. `reviewer` faz revisão final.
5. `quality` entra se houver tema de performance ou quality gate adicional.

---

## 13. Relação com a documentação pública

O sistema não depende apenas de documentação manual.

O repositório publica documentação em `docs/` para mostrar:

- o hub do sistema
- a arquitectura activa
- a orquestração prática
- os analytics históricos

### Páginas relevantes

#### [index.html](/Users/eugeniosilva/Project/FUSE/docs/index.html)

É a landing page do GitHub Pages.

#### [ai-system.html](/Users/eugeniosilva/Project/FUSE/docs/ai-system.html)

Mostra:

- arquitectura
- agentes
- skills
- rules
- memória
- timeline de migração

#### [demonstration-orchestration.html](/Users/eugeniosilva/Project/FUSE/docs/demonstration-orchestration.html)

Mostra:

- fluxo de execução
- invariantes centrais
- catálogo operacional resumido

#### [analytics.html](/Users/eugeniosilva/Project/FUSE/docs/analytics.html)

Mostra:

- histórico de custo e tokens
- distribuição por agents
- custo por PR

Importante:

os analytics continuam a incluir histórico da geração anterior `.ai/`, por isso parte dos nomes reflecte agentes antigos. Isso é histórico, não erro conceptual.

---

## 14. Geração automática e CI

As páginas activas são geradas por scripts em:

- [generate-dashboard.sh](/Users/eugeniosilva/Project/FUSE/.github/scripts/generate-dashboard.sh)
- [generate-analytics.sh](/Users/eugeniosilva/Project/FUSE/.github/scripts/generate-analytics.sh)
- [generate-ai-system.sh](/Users/eugeniosilva/Project/FUSE/.github/scripts/generate-ai-system.sh)

E publicadas pelos workflows:

- [dashboard-merge.yml](/Users/eugeniosilva/Project/FUSE/.github/workflows/dashboard-merge.yml)
- [dashboard-pr.yml](/Users/eugeniosilva/Project/FUSE/.github/workflows/dashboard-pr.yml)

Isto é importante porque o sistema de agents não vive isolado do repositório. Ele está ligado a uma camada de publicação e validação.

---

## 15. Governança do sistema

Mudanças nestas áreas devem ser tratadas como mudanças de arquitectura:

- `CLAUDE.md`
- taxonomy de agents
- taxonomy de skills
- rules base
- versionamento do sistema
- geradores de documentação pública

O motivo é simples: alterar qualquer um destes blocos muda o comportamento sistémico do AI stack, não apenas texto.

---

## 16. Estado actual vs arquivo

O sistema actual é `.claude/`.

O sistema anterior em `.ai/` continua preservado como:

- arquivo histórico
- trilha de migração
- referência para evolução do operating model

O objectivo não foi apagar o passado, mas separar claramente:

- o que é activo
- o que é arquivo

---

## 17. Forças do sistema actual

As principais forças do modelo actual são:

- entrypoint curto e governável
- menor sobrecarga de contexto sempre carregado
- melhor separação entre policy, knowledge e execution
- melhor portabilidade para ecossistemas `.claude/`
- documentação pública coerente com a arquitectura activa
- preparação para memory por agente

---

## 18. Limites e tradeoffs

Este sistema é mais profissional e modular, mas também traz tradeoffs:

- há mais ficheiros para manter
- qualidade depende de boas descriptions em skills e agents
- documentação gerada exige disciplina de metadados
- coexistência com histórico `.ai/` exige clareza para não criar ambiguidade

Isto é esperado num sistema enterprise: mais estrutura em troca de maior governança.

---

## 19. Como usar este documento

Este SDD deve ser usado como documento de referência quando alguém precisar de entender:

- o que é o sistema de agents do FUSE
- como ele está organizado
- que papel cada agente tem
- como skills e rules entram em jogo
- como a documentação pública se relaciona com o sistema activo

Ele não substitui os ficheiros operacionais em `.claude/`, mas serve como visão consolidada para leitura humana e onboarding técnico.

---

## 20. Conclusão

O sistema de agents do FUSE deixou de ser apenas um conjunto de instruções espalhadas e passou a ser uma arquitectura AI formalizada.

O centro do sistema hoje é:

- `CLAUDE.md` como contrato e entrypoint
- `rules/` como guardrails contextuais
- `skills/` como conhecimento especializado
- `agents/` como execution contexts
- `agent-memory/` como fronteira de persistência
- `docs/` como expressão pública da configuração viva

Em resumo, o FUSE opera com um sistema de agents **modular, enterprise e documentado**, preparado para evolução contínua sem voltar ao modelo monolítico anterior.
