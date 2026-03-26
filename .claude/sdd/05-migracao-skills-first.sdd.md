# SDD: Enterprise Migration Blueprint — AI System to Skills-First Architecture

> Status: Proposed for execution
> Criado: 2026-03-25
> Última actualização: 2026-03-25
> Classificação: Architecture Transformation / Enterprise Operating Model
> Owner proposto: AI Architecture
> Co-owners propostos: Developer Experience, Frontend Platform, Documentation
> Referências: [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md), [06-paralelo-sistema-atual-vs-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/06-paralelo-sistema-atual-vs-skills-first.sdd.md)

---

## 1. Executive Summary

O FUSE já possui um sistema AI funcional, útil e relativamente maduro em `.ai/`. A decisão de migração não deve ser tratada como troca cosmética de estrutura nem como rejeição do sistema actual. Deve ser tratada como uma **transformação de operating model**.

O mercado actual convergiu para um padrão mais profissional para sistemas de coding agents:

- entrypoint curto e estável
- instruções especializadas carregadas sob demanda
- regras activadas por contexto real de ficheiros
- agentes leves, com responsabilidade clara e tooling restrito
- documentação derivada da configuração viva
- maior portabilidade para ecossistemas que adoptam `.claude/` e Agent Skills

Por isso, a recomendação profissional não é uma migração "big bang". A recomendação correcta é uma **migração faseada, governada, mensurável e reversível**, em que `.claude/` é introduzido como novo target architecture, validado operacionalmente, e só depois promovido a source of truth.

O resultado esperado é um sistema AI:

- mais modular
- mais eficiente em contexto
- mais governável
- mais auditável
- mais portável
- mais alinhado com práticas enterprise de documentação, rollout e quality gates

---

## 2. Strategic Position

### 2.1 O que este documento propõe

Este documento define **como** a migração deve acontecer para ser considerada enterprise-grade:

- com transição controlada
- com arquitectura alvo explícita
- com governance
- com readiness gates
- com pilot e cutover formal
- com rollback simples
- com documentação pública consistente com a configuração real

### 2.2 O que este documento não propõe

Este documento não assume que o sistema actual deve ser desactivado imediatamente. Também não assume que a mera criação da estrutura `.claude/` representa sucesso. Sucesso só existe quando a nova arquitectura estiver:

- implementada
- testada
- adoptada
- documentada
- operacionalmente confiável

---

## 3. Decision Framing

Com base no paralelo entre o sistema actual e a proposta futura, a abordagem mais profissional para o mercado actual é:

**preservar o valor do sistema actual, evitar ruptura desnecessária e executar uma migração progressiva para uma arquitectura Skills-First em `.claude/`, com um cutover explícito apenas após validação operacional.**

Esta abordagem é superior a duas alternativas mais fracas:

### Alternativa fraca 1. Manter `.ai/` indefinidamente sem reorganização

Risco:

- o sistema continua útil, mas cresce de forma mais pesada e menos modular

### Alternativa fraca 2. Fazer cutover imediato para `.claude/`

Risco:

- cria-se estrutura nova sem tempo para validar comportamento real, activação das skills, manutenção e qualidade da documentação

### Abordagem recomendada

- coexistência curta e intencional
- pilot controlado
- critérios claros para promoção
- depreciação só depois de readiness comprovado

---

## 4. Transformation Objectives

### 4.1 Objectivo primário

Migrar o sistema AI do FUSE de um modelo centralizado em `.ai/` para um modelo Skills-First em `.claude/`, sem perda de conhecimento, com menor custo de contexto e com operating model alinhado ao mercado actual.

### 4.2 Objectivos secundários

- reduzir o tamanho e a responsabilidade do contexto base
- separar claramente entrypoint, rules, skills e execution contexts
- transformar conhecimento estático em unidades operacionais invocáveis
- introduzir activação contextual por path
- preparar memory boundaries por agente
- institucionalizar quality gates e ownership
- tornar a documentação do sistema derivável da configuração viva
- alinhar o layout com convenções externas portáveis

### 4.3 Success Criteria

Um programa de migração só é concluído quando todos os critérios abaixo forem verdadeiros:

1. `.claude/` existe como arquitectura completa e consistente.
2. `CLAUDE.md` contém apenas identidade, invariantes, routing mínimo e pointers.
3. skills e rules assumem o conhecimento especializado antes concentrado em agentes e documentos extensos.
4. agentes são curtos, focados e consistentes com o seu papel.
5. a equipa consegue operar o sistema novo sem depender do sistema antigo para instruções primárias.
6. GitHub Pages reflecte a arquitectura activa.
7. `.ai/` fica claramente marcado como archive-only.

---

## 5. Enterprise Design Principles

### 5.1 Principle 1: Preserve institutional knowledge

Toda a migração deve reaproveitar o valor intelectual de `.ai/`. O objectivo não é recomeçar; é redistribuir conhecimento para unidades mais adequadas.

### 5.2 Principle 2: Separate policy from execution

`CLAUDE.md` define política e identidade. Rules definem guardrails contextuais. Skills concentram conhecimento reutilizável. Agents executam.

### 5.3 Principle 3: Minimize always-loaded context

O contexto permanente deve conter apenas o que precisa estar sempre disponível. O resto deve ser activado sob demanda.

### 5.4 Principle 4: Prefer governed modularity over monolithic convenience

O desenho enterprise correcto aceita mais ficheiros se isso reduzir ambiguidade e melhorar governança.

### 5.5 Principle 5: Cut over only after operational proof

Uma arquitectura não se torna oficial porque foi escrita. Torna-se oficial quando foi validada na prática.

### 5.6 Principle 6: Documentation must reflect runtime reality

Sempre que possível, documentação pública do sistema AI deve ser gerada a partir da configuração activa e não apenas redigida manualmente.

---

## 6. Target Enterprise Architecture

```text
.claude/
  CLAUDE.md
  rules/
    screens.md
    services.md
    hooks.md
    typescript.md
    tests.md
    git.md
  skills/
    sdd-creation/
    coupling-analysis/
    project-architecture/
    react-native-patterns/
    typescript-strict/
    api-integration/
    ux-standards/
    translations/
    clean-code/
    pr-workflow/
    owasp-security/
  agents/
    architect.md
    engineer.md
    reviewer.md
    test-writer.md
    quality.md
    design-docs.md
    pr-lifecycle.md
    security-analyst.md
  agent-memory/
    architect/README.md
    engineer/README.md
    reviewer/README.md
    test-writer/README.md
    quality/README.md
    design-docs/README.md
    pr-lifecycle/README.md
    security-analyst/README.md
```

### 6.1 Responsibility model

- `CLAUDE.md`: contract, identity, routing policy, critical invariants
- `rules/`: path-scoped guardrails
- `skills/`: specialized knowledge packs
- `agents/`: execution roles with bounded scope
- `agent-memory/`: persistent knowledge boundary per role

### 6.2 Enterprise architecture characteristics

- small stable entrypoint
- bounded responsibilities
- progressive loading
- auditability by file
- better future portability

---

## 7. Migration Strategy

### 7.1 Recommended approach

A migração deve acontecer em **5 estágios**, não em simples substituição estrutural:

1. Prepare
2. Build
3. Pilot
4. Cutover
5. Archive and optimize

Esta sequência é a forma mais profissional porque separa:

- construção da nova arquitectura
- validação de uso real
- mudança de source of truth

### 7.2 Why this is the market-correct approach

Equipas maduras não promovem nova plataforma porque a estrutura "parece melhor". Elas promovem apenas depois de:

- definir operating model
- preparar ownership
- medir readiness
- fazer pilot
- executar cutover explícito

---

## 8. Stage 1 — Prepare

### Objective

Preparar a organização da migração sem ainda declarar `.claude/` como sistema oficial.

### Deliverables

- SDD de migração aprovado
- mapeamento completo `.ai/` -> `.claude/`
- owners definidos por domínio
- plano de rollout aprovado
- critérios de readiness aprovados

### Required activities

1. Catalogar activos actuais em `.ai/`.
2. Identificar o que vira `CLAUDE.md`, `rule`, `skill` ou `agent`.
3. Definir naming final da nova árvore.
4. Definir política de versionamento do AI system.
5. Definir qualidade mínima por skill, agent e rule.
6. Definir quais workflows e dashboards precisam ser alterados.

### Exit gate

Stage 1 só termina quando o desenho alvo e as regras de promoção estiverem fechados.

---

## 9. Stage 2 — Build

### Objective

Construir `.claude/` como arquitectura funcional, ainda sem despromover `.ai/`.

### Deliverables

- `.claude/CLAUDE.md`
- 6 rules
- 11 skills
- 8 agents
- structure for agent memory
- relocation of scripts to `.github/scripts/`
- generator for `docs/ai-system.html`

### Build standards

#### `CLAUDE.md`

Deve conter:

- identidade do projecto
- contract `Model -> Service -> Query -> Hook -> Screen`
- invariantes críticos
- routing table resumida
- ponteiros para `rules/`, `skills/`, `agents/`

Não deve conter:

- longos exemplos
- workflows extensos
- detalhes operacionais que pertencem a skills
- duplicação de regras por domínio

#### Rules

Cada rule deve:

- ser activada por `paths`
- ter escopo mínimo necessário
- evitar duplicação de policy de outras rules
- ser escrita como guardrail, não como tutorial longo

#### Skills

Cada skill deve:

- possuir `SKILL.md`
- possuir `evals/evals.json`
- ter description orientada a activação
- manter corpo enxuto
- usar `references/` para material longo
- usar `assets/` para templates
- usar `scripts/` apenas quando o script tiver valor operacional real

#### Agents

Cada agent deve:

- ter papel inequívoco
- ter tools mínimas necessárias
- ter skills adequadas ao papel
- evitar duplicar o conteúdo das skills
- manter prompt curto e operacional

### Exit gate

Stage 2 termina quando `.claude/` estiver completa, mas ainda não oficializada como source of truth.

---

## 10. Stage 3 — Pilot

### Objective

Validar a nova arquitectura em uso real antes de promover cutover.

### Pilot model

Durante o pilot:

- `.ai/` continua como referência oficial
- `.claude/` é usada em sessões controladas
- resultados, fricções e gaps são registados

### Validation dimensions

1. Qualidade de activação de skills
2. Clareza do `CLAUDE.md`
3. Qualidade do routing entre agentes
4. Redução perceptível de contexto desnecessário
5. Manutenibilidade dos ficheiros
6. Qualidade da documentação gerada

### Enterprise readiness questions

- os agentes funcionam bem sem instruções herdadas do sistema antigo?
- as skills estão descritas de forma suficientemente accionável?
- as rules activam nos paths correctos?
- a estrutura nova é mais fácil de evoluir sem inflacionar contexto?
- a equipa consegue operar o sistema novo sem ambiguity fallback?

### Exit gate

Cutover só pode acontecer se o pilot demonstrar que `.claude/` é operacionalmente suficiente.

---

## 11. Stage 4 — Cutover

### Objective

Promover `.claude/` a sistema oficial e relegar `.ai/` para arquivo explícito.

### Cutover activities

1. Marcar `.ai/system.md` como deprecated com data e ponteiro para `.claude/CLAUDE.md`.
2. Actualizar `.ai/README.md` e `.ai/CHANGELOG.md`.
3. Actualizar [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md) para reflectir estado de migração executada.
4. Actualizar `claude-self-modifying.md`.
5. Actualizar docs e dashboards para declarar `.claude/` como active architecture.
6. Publicar nova documentação em GitHub Pages.

### Cutover rule

Cutover é acto formal. Não deve acontecer implicitamente porque os ficheiros existem.

### Exit gate

Cutover termina quando:

- `.claude/` é a fonte de verdade
- `.ai/` está claramente arquivado
- docs públicas já não descrevem `.ai/` como sistema activo

---

## 12. Stage 5 — Archive and Optimize

### Objective

Concluir a transformação, estabilizar governança e limpar ambiguidades remanescentes.

### Activities

- remover referências activas sobrantes a `.ai/`
- refinar descriptions de skills com base no pilot
- consolidar versão do AI system
- ajustar documentação de onboarding
- refinar gerador de documentação do sistema

### Exit gate

O programa termina quando não existir ambiguidade operacional entre arquivo e sistema activo.

---

## 13. Deliverables by Workstream

### 13.1 Workstream A — Archive and continuity

- deprecation banner em `.ai/system.md`
- actualizações em README/CHANGELOG do sistema actual
- marcação de artefactos históricos

### 13.2 Workstream B — Core architecture

- `.claude/CLAUDE.md`
- complete rules tree
- complete skills tree
- complete agents tree
- memory directories

### 13.3 Workstream C — Automation and CI

- move `generate-dashboard.sh`
- move `generate-analytics.sh`
- add `generate-ai-system.sh`
- update Pages workflows

### 13.4 Workstream D — Public documentation

- `docs/index.html`
- `docs/ai-system.html`
- updates in `demonstration-orchestration.html`
- updates in `analytics.html`

---

## 14. Governance Model

### 14.1 Ownership

- AI Architecture: target model, standards, approvals for structural changes
- Developer Experience: workflows, automation, generation, adoption
- Frontend Platform: enforcement of architectural invariants
- Documentation: Pages narrative and public consistency

### 14.2 Change control

Alterações em:

- `CLAUDE.md`
- routing table
- skill taxonomy
- agent taxonomy
- versioning policy

devem ser tratadas como mudanças de arquitectura, não como edições incidentais.

### 14.3 Versioning

Recomenda-se versionar a arquitectura AI como:

- `v2.x` para sistema actual `.ai/`
- `v3.0.0` para activation do modelo `.claude/`

---

## 15. Quality Gates

### 15.1 Structural gates

- `CLAUDE.md` < 150 linhas
- agents target < 40 lines, hard limit de verificação < 50
- every skill has `SKILL.md` and `evals/evals.json`
- every agent has memory directory
- no obvious duplication across rules, skills, agents

### 15.2 Operational gates

- scripts executam pelos novos paths
- docs são geradas sem passos manuais ocultos
- workflows não referenciam caminhos antigos
- links públicos resolvem correctamente

### 15.3 Documentation gates

- GitHub Pages reflecte a arquitectura activa
- `ai-system.html` deriva da configuração viva
- index page direcciona correctamente para as páginas relevantes

---

## 16. Migration Mapping

| Origem                       | Destino                                                                                                 | Estratégia                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `.ai/system.md`              | `.claude/CLAUDE.md`                                                                                     | reduzir a policy essencial       |
| `.ai/agents/architect.md`    | `skills/sdd-creation`, `skills/coupling-analysis`, `skills/project-architecture`, `agents/architect.md` | separar conhecimento de papel    |
| `.ai/agents/engineer.md`     | `skills/react-native-patterns`, `skills/api-integration`, `skills/clean-code`, `agents/engineer.md`     | reduzir agent prompt             |
| `.ai/agents/reviewer.md`     | `skills/typescript-strict`, `skills/clean-code`, `agents/reviewer.md`                                   | reforçar papel de review         |
| `.ai/agents/test-writer.md`  | `skills/typescript-strict`, `agents/test-writer.md`                                                     | focar test-writing               |
| `.ai/agents/quality.md`      | `agents/quality.md`                                                                                     | simplificar e especializar       |
| `.ai/agents/design-docs.md`  | `skills/ux-standards`, `skills/translations`, `agents/design-docs.md`                                   | separar standards de docs        |
| `.ai/agents/pr-lifecycle.md` | `skills/pr-workflow`, `agents/pr-lifecycle.md`                                                          | deterministic workflow           |
| segurança actual             | `skills/owasp-security`, `agents/security-analyst.md`                                                   | consolidar sem proliferar agents |
| `.ai/skills/*.md`            | `.claude/skills/*/SKILL.md`                                                                             | converter para skills invocáveis |
| `.ai/rules/*.md`             | `.claude/rules/*.md`                                                                                    | converter para rules path-scoped |

---

## 17. Public Documentation Strategy

### Required pages

- `docs/index.html`
- `docs/ai-system.html`
- `docs/demonstration-orchestration.html`
- `docs/analytics.html`

### Documentation principle

A documentação pública deve apresentar:

- arquitectura vigente
- catálogo de agentes
- catálogo de skills
- mapa de rules
- histórico de migração

Sem isso, a percepção externa e interna do sistema fica desalinhada com a realidade.

---

## 18. Risk Management

### Risk 1. Coexistence becomes ambiguity

Mitigação:

- coexistência curta
- cutover formal
- marcações explícitas

### Risk 2. New structure replicates old verbosity

Mitigação:

- size limits
- use of `references/`
- review gate against duplication

### Risk 3. Skills do not trigger well

Mitigação:

- write descriptions as activation contracts
- pilot before cutover
- refine based on real use

### Risk 4. Documentation diverges from actual architecture

Mitigação:

- generated `ai-system.html`
- workflow-controlled publication

### Risk 5. Migration becomes architecture theatre

Mitigação:

- require operational validation
- only promote after pilot
- measure real adoption, not only file creation

---

## 19. Rollback Strategy

Rollback must be trivial.

If cutover introduces issues:

- revert documentation and workflow references
- keep `.claude/` as candidate architecture
- retain `.ai/` as stable archive/reference base

Because `.ai/` is preserved, rollback risk remains low.

---

## 20. Verification Plan

### Structural verification

- inspect `.claude/CLAUDE.md`
- run `wc -l .claude/agents/*.md`
- validate each skill directory
- validate agent memory directories

### CI verification

- validate workflows reference `.github/scripts/`
- generate `docs/ai-system.html`
- validate Pages artifact contents

### Publication verification

- open `docs/index.html`
- verify all four pages locally
- verify public root after deploy:
  - `https://eugenioduarte.github.io/FUSE/`

---

## 21. Recommended Execution Sequence

1. Approve target model and governance.
2. Finalize mapping from current assets to future assets.
3. Build `.claude/` completely.
4. Relocate scripts and adapt workflows.
5. Generate and update public documentation.
6. Run pilot.
7. Evaluate readiness.
8. Execute cutover.
9. Archive old system explicitly.
10. Optimize after adoption.

---

## 22. Production Checklist

- [ ] target architecture approved
- [ ] governance approved
- [ ] readiness gates approved
- [ ] `.claude/CLAUDE.md` created
- [ ] 6 rules created
- [ ] 11 skills created with evals
- [ ] 8 agents created
- [ ] memory directories created
- [ ] scripts moved to `.github/scripts/`
- [ ] `generate-ai-system.sh` created
- [ ] workflows updated
- [ ] docs pages updated/generated
- [ ] pilot executed
- [ ] cutover approved
- [ ] `.ai/` archived explicitly
- [ ] GitHub Pages verified after deployment

---

## 23. Final Recommendation

Se o objectivo é construir um sistema AI realmente enterprise, a migração deve ser feita como **programa de arquitectura e governança**, não como refactor de ficheiros.

O approach mais profissional para o mercado actual é:

- **adoptar `.claude/` como target architecture**
- **migrar de forma faseada**
- **validar em pilot**
- **fazer cutover formal**
- **preservar `.ai/` como archive**

Isto protege o investimento já feito, reduz risco de ruptura e coloca o FUSE num modelo mais compatível com a evolução do ecossistema actual de coding agents.
