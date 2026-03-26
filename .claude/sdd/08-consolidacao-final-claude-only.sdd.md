# SDD: Consolidação Final para `.claude`-Only

> Status: Implemented
> Criado: 2026-03-26
> Última actualização: 2026-03-26
> Objectivo: consolidar todo o valor operacional relevante de `.ai/` dentro do padrão `.claude/`, tornar `.claude` a única fonte de verdade e remover `.ai/` da superfície operacional
> Referências: [05-migracao-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/05-migracao-skills-first.sdd.md), [06-paralelo-sistema-atual-vs-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/06-paralelo-sistema-atual-vs-skills-first.sdd.md), [07-sistema-de-agents-visao-geral.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/07-sistema-de-agents-visao-geral.sdd.md)

---

## 1. Resumo Executivo

O estado final desejado do FUSE é simples:

- **`.claude/` como único sistema AI activo**
- **zero dependência operacional de `.ai/`**
- **GitHub Pages reflectindo apenas a arquitectura `.claude/`**

Para isso, não basta marcar `.ai/` como archive. É necessário **absorver para `.claude/` tudo o que em `.ai/` ainda contém valor operacional real**.

O princípio desta consolidação é:

- **migrar o valor**
- **descartar duplicação**
- **preservar apenas o histórico estritamente necessário**
- **remover `.ai/` no fim, quando já não existir dependência funcional**

O plano deve seguir o padrão do ecossistema `.claude/`:

- `CLAUDE.md` como entrypoint
- `agents/` para papéis de execução
- `skills/` para conhecimento especializado
- `rules/` para guardrails path-scoped
- `commands/` para entrypoints operacionais
- `settings.json` para hooks/configuração runtime

---

## 2. Princípio Director

Não queremos “ter `.claude` e também `.ai`”.

Queremos:

- um único sistema operacional
- uma única taxonomia
- uma única documentação pública
- uma única superfície mental para manutenção

Em termos enterprise, dois sistemas em paralelo introduzem:

- ambiguidade
- drift de documentação
- duplicação de prompts
- routing inconsistente
- risco de conhecimento crítico ficar no sítio errado

Por isso, a decisão correcta é:

**ajustar `.claude` até ele conseguir representar sozinho tudo o que interessa de `.ai`, e depois remover `.ai`.**

---

## 3. Critério de Migração

Nem tudo em `.ai/` deve ser migrado.

Cada activo deve cair numa destas categorias:

### 3.1 Migrar obrigatoriamente

Se o conteúdo:

- influencia execução real
- define regras ou padrões ainda válidos
- contém conhecimento de domínio reutilizável
- descreve comandos operacionais ainda úteis
- representa fluxo de segurança, business ou qualidade ainda activo

então deve ser migrado para `.claude/`.

### 3.2 Migrar parcialmente

Se o conteúdo:

- contém valor, mas está demasiado verboso
- mistura regra, tutorial e histórico
- está num formato incompatível com `.claude`

então deve ser **destilado** para:

- `skill`
- `rule`
- `agent`
- `command`
- `reference`

### 3.3 Não migrar

Se o conteúdo:

- é apenas histórico
- descreve uma geração anterior já substituída
- não influencia mais operação

então não deve ir para `.claude`.

Pode:

- ser exportado para `docs/history/`
- ou removido junto com `.ai/` no cutover final

---

## 4. Arquitectura Alvo Final

```text
.claude/
  CLAUDE.md
  settings.json
  agents/
  skills/
  rules/
  commands/
  agent-memory/
  references/         # opcional, se necessário para conteúdo extenso
  templates/          # opcional, se necessário para assets reutilizáveis
```

### Características do estado final

- `.claude/` representa sozinho o sistema
- não há leitura obrigatória de `.ai/`
- tudo o que é operacional está modelado no padrão `.claude`
- GitHub Pages é gerado a partir da configuração final

---

## 5. Mapeamento proposto de `.ai/` para `.claude/`

## 5.1 `security/`

### Situação actual

`.ai/security/` contém um orquestrador e vários sub-agents especializados.

### Estado alvo

Não deve permanecer como mini-sistema paralelo.

Deve ser convertido para:

- **1 agent**: `security-analyst`
- **múltiplas skills internas** de segurança
- opcionalmente `references/` para frameworks e checklists

### Estrutura recomendada

```text
.claude/agents/security-analyst.md
.claude/skills/security-storage/
.claude/skills/security-crypto/
.claude/skills/security-network/
.claude/skills/security-auth/
.claude/skills/security-platform/
.claude/skills/security-code/
.claude/skills/security-resilience/
```

### Decisão

Em vez de um único skill `owasp-security` demasiado grande, o melhor desenho enterprise é:

- 1 agent operacional
- 1 skill umbrella opcional (`owasp-security`)
- 7 skills modulares por domínio

Isto dá:

- melhor activação
- melhor manutenção
- melhor explicabilidade no GitHub Pages

---

## 5.2 `business/`

### Situação actual

`.ai/business/` contém fluxo de entrada de summaries para transformação em SDD.

### Estado alvo

Migrar para `.claude` como:

- `commands/business-to-sdd.md`
- skill especializada de business analysis
- pasta de inbox fora de `.ai/`

### Estrutura recomendada

```text
.claude/skills/business-analysis/
.claude/commands/business-to-sdd.md
.claude/inbox/              # se fizer sentido manter
```

Se a inbox for operacional, ela não deve continuar em `.ai/business/inbox/`.

---

## 5.3 `router/`

### Situação actual

`.ai/router/` contém logs, csvs, scripts e documentação sobre token usage e roteamento anterior.

### Estado alvo

Separar em dois grupos:

- **observability activa**
- **histórico**

### O que migrar

- hooks úteis e scripts ainda activos para tracking
- documentação de observability que ainda descreva o sistema actual

### O que não migrar directamente

- material que só documenta o sistema antigo

### Estrutura recomendada

```text
.claude/observability/
.github/scripts/
docs/analytics.html
```

Os CSVs podem continuar como artefactos de observabilidade, mas não devem depender semanticamente de `.ai/`.

---

## 5.4 `scripts/`

### Situação actual

`.ai/scripts/` mistura automações de sistema, utilitários e legado.

### Estado alvo

Separar por natureza:

- scripts de CI/doc generation -> `.github/scripts/`
- scripts operacionais do sistema -> `.claude/scripts/` ou skills/commands
- scripts legados sem uso -> remover

### Regra

Se um script é necessário para o sistema `.claude`, ele não pode continuar a viver semanticamente em `.ai/scripts/`.

---

## 5.5 `templates/`

### Situação actual

Há templates em `.ai/templates/`.

### Estado alvo

Mover para:

- `skills/<name>/assets/`
- ou `.claude/templates/` se forem transversais

---

## 5.6 `docs/`

### Situação actual

`.ai/docs/` mistura revisão, backlog, arquitectura antiga e documentação de apoio.

### Estado alvo

Classificar:

- docs que viram `references/` de skills
- docs que viram `docs/history/`
- docs que já não têm valor operacional e podem ser removidas

Não devem permanecer escondidas em `.ai/docs/` se ainda forem necessárias para o sistema activo.

---

## 5.7 `agents/`, `rules/`, `skills/`

### Situação actual

`.ai/agents`, `.ai/rules` e `.ai/skills` são a geração anterior do sistema.

### Estado alvo

Tudo o que ainda presta deve ser:

- reescrito no formato `.claude`
- repartido por responsabilidade correcta
- absorvido em `agents/`, `skills/`, `rules/`, `commands/`

Quando esse trabalho terminar, estas três pastas deixam de ter razão de existir.

---

## 6. Design alvo para Security

Como referiste, security deve seguir o padrão `.claude`.

### Proposta enterprise

#### Agent

- `security-analyst.md`

#### Skills

- `security-storage`
- `security-crypto`
- `security-network`
- `security-auth`
- `security-platform`
- `security-code`
- `security-resilience`

#### Skill umbrella opcional

- `owasp-security`

### Benefícios

- modularidade real
- melhor loading progressivo
- melhor representação pública no Pages
- manutenção muito mais limpa do que um bloco gigante

---

## 7. Design alvo para Business

### Agent

O papel pode continuar em `design-docs` ou nascer um `business-analyst` separado apenas se houver volume para isso.

### Recomendação

Manter enxuto:

- `design-docs` continua responsável
- skill nova: `business-analysis`
- command: `business-to-sdd`

### Benefício

Evita inflar a lista de agents sem perder capacidade.

---

## 8. Design alvo para Commands

Hoje já existem commands em `.claude/commands/`, mas o estado final deve ser mais completo e coerente.

### Commands alvo

- `business-to-sdd`
- `implement-logic`
- `ui-polish`
- `pr-lifecycle`
- eventuais commands de security audit se forem úteis

### Regra

Qualquer comando importante que ainda dependa de `.ai/...` deve ser reescrito para depender apenas de `.claude/`.

---

## 9. Design alvo para GitHub Pages

O GitHub Pages final deve explicar **o sistema `.claude` completo**, não uma versão parcial.

### 9.1 `index.html`

Deve servir como hub do sistema final.

### 9.2 `ai-system.html`

Deve mostrar:

- `CLAUDE.md`
- agents
- skills
- rules
- commands
- memory
- settings/hooks
- observability surface
- timeline de evolução

### 9.3 `demonstration-orchestration.html`

Deve mostrar:

- fluxo real entre agents
- superfície de execução
- como skills entram por agent
- como rules entram por contexto
- como commands disparam workflows

### 9.4 `analytics.html`

Deve mostrar:

- observabilidade histórica
- e, idealmente, classificação nova por taxonomia `.claude`

Mesmo quando os dados forem históricos, a narrativa deve ser do sistema actual.

### 9.5 Agent Orchestration Network

A visualização do network deve ser redesenhada para o modelo final:

- nodes por agent
- agrupamento visual por domínio
- edges de fluxo principal
- edges opcionais para commands/entrypoints
- indicação de skills por tooltip/card/modal

Não deve mais representar a taxonomia `.ai`.

---

## 10. Fases do plano

## Fase 1 — Inventário final de valor

Objectivo:

descobrir o que em `.ai/` ainda precisa sobreviver

Entregáveis:

- matriz `migrar / destilar / remover`
- mapa por pasta

---

## Fase 2 — Redesign final de `.claude`

Objectivo:

ajustar a taxonomia final antes de mover mais conteúdo

Entregáveis:

- agent map final
- skill map final
- command map final
- estrutura final de references/templates/observability

---

## Fase 3 — Migração de domínio crítico

Ordem recomendada:

1. security
2. business
3. router/observability
4. templates e references úteis
5. docs operacionais restantes

---

## Fase 4 — Limpeza de dependências cruzadas

Objectivo:

garantir que nenhum ficheiro operacional em `.claude` ou `.github` depende semanticamente de `.ai/`

Isto inclui:

- commands
- scripts
- geração de docs
- Pages
- settings/hooks

---

## Fase 5 — Pages final

Objectivo:

regenerar o GitHub Pages para o estado final `.claude`-only

Entregáveis:

- páginas sem referências activas a `.ai`
- network de agents novo
- explicação completa dos agents activos

---

## Fase 6 — Remoção de `.ai`

Pré-condição:

nenhum activo operacional relevante pode restar em `.ai/`

Acções:

- remover `.ai/`
- manter, se necessário, um export histórico em `docs/history/` ou noutro local explícito

---

## 11. Critérios de aceitação

A consolidação só termina quando:

1. `.claude/` representa sozinho o sistema AI
2. nenhum command activo depende de `.ai/`
3. nenhum script activo depende de `.ai/`
4. GitHub Pages descreve apenas o sistema `.claude`
5. security, business e observability relevantes foram absorvidos
6. `.ai/` pode ser removido sem perda operacional

---

## 12. Riscos

### Risco 1. Migrar demais e levar lixo para `.claude`

Mitigação:

- aplicar estritamente o critério de valor operacional

### Risco 2. Deixar dependências escondidas em `.ai/`

Mitigação:

- fase específica de dependency cleanup

### Risco 3. Inflar `.claude`

Mitigação:

- usar skills modulares
- usar references para conteúdo longo
- manter agents curtos

### Risco 4. Pages continuar a mostrar geração antiga

Mitigação:

- regenerar tudo a partir de `.claude`
- rever analytics/network com a taxonomia nova

---

## 13. Recomendação Final

Sim: o melhor caminho é **fortalecer `.claude` até ele conseguir absorver todo o valor útil de `.ai`**.

Mas o desenho correcto não é “copiar tudo”.

O desenho correcto é:

- **reclassificar**
- **modularizar**
- **padronizar**
- **remover duplicação**

E depois:

- **eliminar `.ai`**
- **actualizar GitHub Pages para o sistema final**

O estado enterprise final deve ser:

- um único entrypoint
- uma única taxonomia
- uma única documentação pública
- um único sistema operacional

Ou seja:

**`.claude`-only, enxuto, modular e totalmente reflectido no GitHub Pages.**
