# SDD: Paralelo entre o Sistema AI Actual e a Arquitectura Skills-First

> Status: Comparativo para decisão
> Criado: 2026-03-25
> Última actualização: 2026-03-25
> Objectivo: avaliar, de forma neutra, o melhor approach para o FUSE
> Referências: [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md), [05-migracao-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/05-migracao-skills-first.sdd.md)

---

## 1. Contexto

O FUSE já tem um sistema AI funcional e coerente baseado em `.ai/`. Esse sistema não está "errado" nem obsoleto por definição. Ele resolve problemas reais de organização, especialização por agente e documentação de processo.

A proposta de migração para `.claude/` com abordagem Skills-First não parte da premissa de que o sistema actual falhou. Parte da premissa de que o ecossistema evoluiu e agora existe uma forma diferente de organizar as mesmas capacidades com mais modularidade, melhor carregamento de contexto e maior aderência ao padrão emergente do mercado.

Este documento serve apenas para comparar os dois modelos e facilitar uma decisão consciente.

---

## 2. Resumo Executivo

### O que existe hoje

Uma arquitectura centrada em:

- um orquestrador principal em `.ai/system.md`
- agentes especializados em `.ai/agents/`
- skills como documentação de referência em `.ai/skills/`
- rules gerais em `.ai/rules/`

### O que ficaria depois

Uma arquitectura centrada em:

- `CLAUDE.md` curto como entrypoint permanente
- `rules/` activadas por path
- `skills/` invocáveis e carregadas on-demand
- agentes mais curtos, focados em execução
- memória por agente e melhor isolamento por contexto

### Síntese neutra

- o sistema actual favorece **clareza centralizada**
- o sistema futuro favorece **modularidade contextual**
- o sistema actual é mais simples de ler como bloco único
- o sistema futuro é mais simples de escalar sem inflacionar contexto

Nenhum dos dois approaches é universalmente melhor. A escolha depende do que se quer optimizar agora: **estabilidade e centralização**, ou **modularidade e evolução futura**.

---

## 3. Visão de Alto Nível

### Modelo actual

```text
.ai/system.md
  -> define identidade, routing, regras e exemplos
.ai/agents/
  -> agentes com responsabilidades mais amplas
.ai/skills/
  -> conhecimento reutilizável, mas essencialmente documental
.ai/rules/
  -> guardrails gerais
```

### Modelo proposto

```text
.claude/CLAUDE.md
  -> define identidade, invariantes e routing mínimo
.claude/rules/
  -> guardrails activados pelo path do ficheiro
.claude/skills/
  -> conhecimento especializado, carregado apenas quando relevante
.claude/agents/
  -> agentes lean com tools/model/skills adequadas
.claude/agent-memory/
  -> base preparada para memória por agente
```

---

## 4. Paralelo Estrutural

| Dimensão             | Sistema actual em `.ai/`                             | Sistema proposto em `.claude/`                  | Leitura neutra                                     |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Entry point          | `system.md` centraliza visão, regras e routing       | `CLAUDE.md` concentra apenas o essencial        | centralização vs concisão                          |
| Organização          | estrutura proprietária do projecto                   | estrutura alinhada com convenção `.claude/`     | identidade própria vs alinhamento com standard     |
| Agentes              | mais completos e explicativos                        | mais curtos e orientados à execução             | autonomia documental vs foco operacional           |
| Skills               | documentação de referência                           | unidades invocáveis e lazy-loaded               | consulta manual vs activação contextual            |
| Rules                | mais gerais e transversais                           | activadas por path                              | consistência global vs precisão contextual         |
| Contexto             | tende a carregar muito upfront                       | tende a carregar apenas o necessário            | previsibilidade vs eficiência                      |
| Escalabilidade       | cresce adicionando texto ao sistema e aos agentes    | cresce adicionando skills/rules separadas       | crescimento centralizado vs modular                |
| Portabilidade        | mais acoplado ao modelo actual                       | mais compatível com tooling emergente           | controlo local vs interoperabilidade               |
| Documentação pública | baseada no sistema histórico                         | pode ser gerada a partir da configuração viva   | narrativa manual vs auto-documentação              |
| Evolução futura      | fácil de manter enquanto o número de peças é pequeno | melhor quando o sistema aumenta em complexidade | simplicidade inicial vs sustentabilidade de escala |

---

## 5. O que o Sistema Actual Faz Bem

Sem desmerecer o modelo actual, há várias qualidades importantes nele:

- existe um ponto de entrada claro para qualquer pessoa nova
- a arquitectura está relativamente toda visível num único sítio
- agentes com mais contexto próprio podem ser mais fáceis de perceber isoladamente
- skills como documentos ajudam a consolidar padrões do projecto
- a estrutura foi suficiente para organizar a operação real até aqui
- como artefacto de design, `.ai/` já representa uma maturidade acima do improviso

### Quando este modelo tende a ser melhor

- equipas pequenas
- baixa rotatividade de instruções
- número controlado de agentes e regras
- necessidade de onboarding rápido por leitura linear
- prioridade em estabilidade sobre experimentação estrutural

---

## 6. O que a Arquitectura Skills-First Faz Bem

A proposta futura também tem vantagens claras:

- reduz o volume de contexto sempre carregado
- separa melhor conhecimento, regras e execução
- melhora a activação contextual de padrões
- facilita crescimento sem inchar o entrypoint
- torna mais natural isolar tools, modelos e responsabilidades
- aproxima o projecto de convenções que outras ferramentas já entendem
- favorece geração automática de documentação do sistema vivo

### Quando este modelo tende a ser melhor

- o sistema AI começa a crescer de forma contínua
- há muitas regras específicas por tipo de ficheiro
- o custo de contexto começa a afectar qualidade e consistência
- quer-se maior portabilidade e alinhamento com práticas actuais
- a equipa pretende investir no sistema como plataforma, não apenas como prompt set

---

## 7. Tradeoffs Reais

## 7.1 Clareza centralizada vs modularidade distribuída

No modelo actual, quase tudo pode ser encontrado mais rapidamente porque está mais concentrado. No modelo Skills-First, a informação fica mais bem separada, mas deixa de estar tão visível num único documento.

## 7.2 Simplicidade de leitura vs simplicidade de crescimento

O sistema actual tende a ser mais simples para ler. O futuro tende a ser mais simples para crescer.

## 7.3 Menos ficheiros vs responsabilidades mais limpas

`.ai/` tem menos peças conceptuais. `.claude/` introduz mais peças, mas com responsabilidade mais explícita.

## 7.4 Maturidade interna vs alinhamento externo

O sistema actual reflecte a evolução própria do FUSE. O futuro aproxima o projecto do padrão de mercado e facilita reaproveitamento entre ferramentas.

## 7.5 Documentação estática vs configuração-documentação

Hoje a documentação depende mais de curadoria manual. Na proposta futura, parte da documentação pode ser derivada automaticamente da própria configuração.

---

## 8. Paralelo por Área

### 8.1 Routing e coordenação

**Hoje**

- routing mais explícito no orquestrador
- maior previsibilidade por leitura do documento central

**Depois**

- routing mais leve no `CLAUDE.md`
- maior dependência de skills e regras bem descritas

**Leitura**

Se a prioridade for controlo directo e visível, o modelo actual é confortável. Se a prioridade for desacoplar routing de conhecimento especializado, a proposta futura é mais adequada.

### 8.2 Conhecimento reutilizável

**Hoje**

- skills funcionam como playbooks e docs

**Depois**

- skills passam a ser unidades operacionais activáveis

**Leitura**

O valor actual continua a existir; a diferença é que esse conhecimento deixa de viver apenas como referência e passa a participar mais activamente na execução.

### 8.3 Agentes

**Hoje**

- agentes carregam mais responsabilidade, mais instruções e mais contexto

**Depois**

- agentes ficam mais curtos, delegando conhecimento para skills e regras

**Leitura**

O sistema actual favorece agentes mais auto-suficientes. O futuro favorece agentes mais especializados na execução do papel.

### 8.4 Rules

**Hoje**

- rules são mais gerais e aplicadas como convenção transversal

**Depois**

- rules tornam-se mais específicas e associadas ao path

**Leitura**

O ganho futuro está menos em "ter mais regras" e mais em "carregar a regra certa no momento certo".

### 8.5 Documentação e Pages

**Hoje**

- a narrativa pública precisa ser actualizada manualmente

**Depois**

- a arquitectura pode ser parcialmente documentada por geração automática

**Leitura**

Se a documentação do sistema AI for estratégica, o modelo novo reduz divergência entre implementação e comunicação.

---

## 9. Custos de Cada Approach

### Manter o sistema actual

Custos prováveis:

- continuar a crescer em cima de documentos mais pesados
- maior risco de inflacionar `system.md`
- mais esforço manual para manter coerência entre agentes, skills e docs

### Migrar para Skills-First

Custos prováveis:

- investimento inicial de estruturação
- aumento do número de ficheiros e metadados
- necessidade de disciplina maior na escrita de skills/rules curtas e boas descrições
- período transitório em que coexistem arquivo e sistema novo

---

## 10. Critérios para Escolha

### Escolher manter `.ai/` como sistema principal se:

- o sistema actual ainda responde bem ao volume real de uso
- a equipa valoriza mais centralização do que modularidade
- o custo de migração agora compete com entregas mais urgentes
- ainda não há dor operacional suficiente para justificar a troca

### Escolher migrar para `.claude/` se:

- já existe fricção com tamanho de contexto e manutenção
- o número de responsabilidades continua a crescer
- a equipa quer consolidar um padrão mais moderno e portável
- a documentação pública do AI system deve representar a configuração viva
- a migração agora evita mais retrabalho depois

---

## 11. Opções de Decisão

### Opção A. Manter como está

Conservar `.ai/` como sistema principal, fazendo apenas melhorias incrementais.

Bom quando:

- a prioridade é entrega rápida
- a arquitectura actual ainda está confortável

Risco principal:

- adiar uma mudança estrutural até que ela fique mais cara

### Opção B. Migrar totalmente agora

Executar o plano de `.claude/` como nova fonte de verdade.

Bom quando:

- a decisão estratégica já está madura
- a equipa quer estabilizar logo o padrão futuro

Risco principal:

- absorver custo de migração num momento de maior carga

### Opção C. Fazer transição faseada

Criar `.claude/` em paralelo, validar a estrutura, e só depois despromover `.ai/` para arquivo.

Bom quando:

- se quer comparar na prática sem ruptura imediata
- a decisão ainda precisa de validação operacional

Risco principal:

- coexistência prolongada criar ambiguidade se não houver corte bem definido

---

## 12. Recomendação Neutra

Se o objectivo desta análise for apenas escolher o melhor approach, a decisão mais equilibrada tende a ser:

**manter o valor do sistema actual reconhecido e escolher a migração apenas se houver intenção real de escalar o sistema AI como plataforma do projecto.**

Em termos práticos:

- se queres optimizar o presente, `.ai/` ainda é defensável
- se queres optimizar os próximos ciclos de evolução, `.claude/` é o melhor investimento

Ou seja, a diferença não é entre "bom" e "mau". É entre:

- um sistema mais **centralizado e estável**
- um sistema mais **modular e preparado para crescer**

---

## 13. Conclusão

O sistema actual em `.ai/` foi uma boa solução para trazer ordem, especialização e documentação ao FUSE. A proposta Skills-First não invalida esse trabalho; ela reutiliza essa base e redistribui as responsabilidades de forma mais modular.

A melhor escolha depende menos de preferência estética e mais da pergunta certa:

**o FUSE quer apenas manter um sistema AI útil, ou quer investir numa arquitectura AI evolutiva, documentável e portável como parte da plataforma do projecto?**

Se a resposta for a primeira, manter `.ai/` ainda faz sentido. Se a resposta for a segunda, a migração para `.claude/` tem coerência estratégica.

# SDD: Paralelo entre o Sistema AI Actual e a Arquitectura Skills-First

> Status: Comparativo para decisão
> Criado: 2026-03-25
> Última actualização: 2026-03-25
> Objectivo: avaliar, de forma neutra, o melhor approach para o FUSE
> Referências: [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md), [05-migracao-skills-first.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/05-migracao-skills-first.sdd.md)

---

## 1. Contexto

O FUSE já tem um sistema AI funcional e coerente baseado em .ai/. Esse sistema não está "errado" nem obsoleto por definição. Ele resolve problemas reais de organização, especialização por agente e documentação de processo.

A proposta de migração para .claude/ com abordagem Skills-First não parte da premissa de que o sistema actual falhou. Parte da premissa de que o ecossistema evoluiu e agora existe uma forma diferente de organizar as mesmas capacidades com mais modularidade, melhor carregamento de contexto e maior aderência ao padrão emergente do mercado.

Este documento serve apenas para comparar os dois modelos e facilitar uma decisão consciente.

---

## 2. Resumo Executivo

### O que existe hoje

Uma arquitectura centrada em:

- um orquestrador principal em .ai/system.md
- agentes especializados em .ai/agents/
- skills como documentação de referência em .ai/skills/
- rules gerais em .ai/rules/

### O que ficaria depois

Uma arquitectura centrada em:

- CLAUDE.md curto como entrypoint permanente
- rules/ activadas por path
- skills/ invocáveis e carregadas on-demand
- agentes mais curtos, focados em execução
- memória por agente e melhor isolamento por contexto

### Síntese neutra

- o sistema actual favorece **clareza centralizada**
- o sistema futuro favorece **modularidade contextual**
- o sistema actual é mais simples de ler como bloco único
- o sistema futuro é mais simples de escalar sem inflacionar contexto

Nenhum dos dois approaches é universalmente melhor. A escolha depende do que se quer optimizar agora: **estabilidade e centralização**, ou **modularidade e evolução futura**.

---

## 3. Visão de Alto Nível

### Modelo actual

text
.ai/system.md
-> define identidade, routing, regras e exemplos
.ai/agents/
-> agentes com responsabilidades mais amplas
.ai/skills/
-> conhecimento reutilizável, mas essencialmente documental
.ai/rules/
-> guardrails gerais

### Modelo proposto

text
.claude/CLAUDE.md
-> define identidade, invariantes e routing mínimo
.claude/rules/
-> guardrails activados pelo path do ficheiro
.claude/skills/
-> conhecimento especializado, carregado apenas quando relevante
.claude/agents/
-> agentes lean com tools/model/skills adequadas
.claude/agent-memory/
-> base preparada para memória por agente

---

## 4. Paralelo Estrutural

| Dimensão             | Sistema actual em .ai/                               | Sistema proposto em .claude/                    | Leitura neutra                                     |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------- | -------------------------------------------------- |
| Entry point          | system.md centraliza visão, regras e routing         | CLAUDE.md concentra apenas o essencial          | centralização vs concisão                          |
| Organização          | estrutura proprietária do projecto                   | estrutura alinhada com convenção .claude/       | identidade própria vs alinhamento com standard     |
| Agentes              | mais completos e explicativos                        | mais curtos e orientados à execução             | autonomia documental vs foco operacional           |
| Skills               | documentação de referência                           | unidades invocáveis e lazy-loaded               | consulta manual vs activação contextual            |
| Rules                | mais gerais e transversais                           | activadas por path                              | consistência global vs precisão contextual         |
| Contexto             | tende a carregar muito upfront                       | tende a carregar apenas o necessário            | previsibilidade vs eficiência                      |
| Escalabilidade       | cresce adicionando texto ao sistema e aos agentes    | cresce adicionando skills/rules separadas       | crescimento centralizado vs modular                |
| Portabilidade        | mais acoplado ao modelo actual                       | mais compatível com tooling emergente           | controlo local vs interoperabilidade               |
| Documentação pública | baseada no sistema histórico                         | pode ser gerada a partir da configuração viva   | narrativa manual vs auto-documentação              |
| Evolução futura      | fácil de manter enquanto o número de peças é pequeno | melhor quando o sistema aumenta em complexidade | simplicidade inicial vs sustentabilidade de escala |

---

## 5. O que o Sistema Actual Faz Bem

Sem desmerecer o modelo actual, há várias qualidades importantes nele:

- existe um ponto de entrada claro para qualquer pessoa nova
- a arquitectura está relativamente toda visível num único sítio
- agentes com mais contexto próprio podem ser mais fáceis de perceber isoladamente
- skills como documentos ajudam a consolidar padrões do projecto
- a estrutura foi suficiente para organizar a operação real até aqui
- como artefacto de design, .ai/ já representa uma maturidade acima do improviso

### Quando este modelo tende a ser melhor

- equipas pequenas
- baixa rotatividade de instruções
- número controlado de agentes e regras
- necessidade de onboarding rápido por leitura linear
- prioridade em estabilidade sobre experimentação estrutural

---

## 6. O que a Arquitectura Skills-First Faz Bem

A proposta futura também tem vantagens claras:

- reduz o volume de contexto sempre carregado
- separa melhor conhecimento, regras e execução
- melhora a activação contextual de padrões
- facilita crescimento sem inchar o entrypoint
- torna mais natural isolar tools, modelos e responsabilidades
- aproxima o projecto de convenções que outras ferramentas já entendem
- favorece geração automática de documentação do sistema vivo

### Quando este modelo tende a ser melhor

- o sistema AI começa a crescer de forma contínua
- há muitas regras específicas por tipo de ficheiro
- o custo de contexto começa a afectar qualidade e consistência
- quer-se maior portabilidade e alinhamento com práticas actuais
- a equipa pretende investir no sistema como plataforma, não apenas como prompt set

---

## 7. Tradeoffs Reais

## 7.1 Clareza centralizada vs modularidade distribuída

No modelo actual, quase tudo pode ser encontrado mais rapidamente porque está mais concentrado. No modelo Skills-First, a informação fica mais bem separada, mas deixa de estar tão visível num único documento.

## 7.2 Simplicidade de leitura vs simplicidade de crescimento

O sistema actual tende a ser mais simples para ler. O futuro tende a ser mais simples para crescer.

## 7.3 Menos ficheiros vs responsabilidades mais limpas

.ai/ tem menos peças conceptuais. .claude/ introduz mais peças, mas com responsabilidade mais explícita.

## 7.4 Maturidade interna vs alinhamento externo

O sistema actual reflecte a evolução própria do FUSE. O futuro aproxima o projecto do padrão de mercado e facilita reaproveitamento entre ferramentas.

## 7.5 Documentação estática vs configuração-documentação

Hoje a documentação depende mais de curadoria manual. Na proposta futura, parte da documentação pode ser derivada automaticamente da própria configuração.

---

## 8. Paralelo por Área

### 8.1 Routing e coordenação

**Hoje**

- routing mais explícito no orquestrador
- maior previsibilidade por leitura do documento central

**Depois**

- routing mais leve no CLAUDE.md
- maior dependência de skills e regras bem descritas

**Leitura**

Se a prioridade for controlo directo e visível, o modelo actual é confortável. Se a prioridade for desacoplar routing de conhecimento especializado, a proposta futura é mais adequada.

### 8.2 Conhecimento reutilizável

**Hoje**

- skills funcionam como playbooks e docs

**Depois**

- skills passam a ser unidades operacionais activáveis

**Leitura**

O valor actual continua a existir; a diferença é que esse conhecimento deixa de viver apenas como referência e passa a participar mais activamente na execução.

### 8.3 Agentes

**Hoje**

- agentes carregam mais responsabilidade, mais instruções e mais contexto

**Depois**

- agentes ficam mais curtos, delegando conhecimento para skills e regras

**Leitura**

O sistema actual favorece agentes mais auto-suficientes. O futuro favorece agentes mais especializados na execução do papel.

### 8.4 Rules

**Hoje**

- rules são mais gerais e aplicadas como convenção transversal

**Depois**

- rules tornam-se mais específicas e associadas ao path

**Leitura**

O ganho futuro está menos em "ter mais regras" e mais em "carregar a regra certa no momento certo".

### 8.5 Documentação e Pages

**Hoje**

- a narrativa pública precisa ser actualizada manualmente

**Depois**

- a arquitectura pode ser parcialmente documentada por geração automática

**Leitura**

Se a documentação do sistema AI for estratégica, o modelo novo reduz divergência entre implementação e comunicação.

---

## 9. Custos de Cada Approach

### Manter o sistema actual

Custos prováveis:

- continuar a crescer em cima de documentos mais pesados
- maior risco de inflacionar system.md
- mais esforço manual para manter coerência entre agentes, skills e docs

### Migrar para Skills-First

Custos prováveis:

- investimento inicial de estruturação
- aumento do número de ficheiros e metadados
- necessidade de disciplina maior na escrita de skills/rules curtas e boas descrições
- período transitório em que coexistem arquivo e sistema novo

---

## 10. Critérios para Escolha

### Escolher manter .ai/ como sistema principal se:

- o sistema actual ainda responde bem ao volume real de uso
- a equipa valoriza mais centralização do que modularidade
- o custo de migração agora compete com entregas mais urgentes
- ainda não há dor operacional suficiente para justificar a troca

### Escolher migrar para .claude/ se:

- já existe fricção com tamanho de contexto e manutenção
- o número de responsabilidades continua a crescer
- a equipa quer consolidar um padrão mais moderno e portável
- a documentação pública do AI system deve representar a configuração viva
- a migração agora evita mais retrabalho depois

---

## 11. Opções de Decisão

### Opção A. Manter como está

Conservar .ai/ como sistema principal, fazendo apenas melhorias incrementais.

Bom quando:

- a prioridade é entrega rápida
- a arquitectura actual ainda está confortável

Risco principal:

- adiar uma mudança estrutural até que ela fique mais cara

### Opção B. Migrar totalmente agora

Executar o plano de .claude/ como nova fonte de verdade.

Bom quando:

- a decisão estratégica já está madura
- a equipa quer estabilizar logo o padrão futuro

Risco principal:

- absorver custo de migração num momento de maior carga

### Opção C. Fazer transição faseada

Criar .claude/ em paralelo, validar a estrutura, e só depois despromover .ai/ para arquivo.

Bom quando:

- se quer comparar na prática sem ruptura imediata
- a decisão ainda precisa de validação operacional

Risco principal:

- coexistência prolongada criar ambiguidade se não houver corte bem definido

---

## 12. Recomendação Neutra

Se o objectivo desta análise for apenas escolher o melhor approach, a decisão mais equilibrada tende a ser:

**manter o valor do sistema actual reconhecido e escolher a migração apenas se houver intenção real de escalar o sistema AI como plataforma do projecto.**

Em termos práticos:

- se queres optimizar o presente, .ai/ ainda é defensável
- se queres optimizar os próximos ciclos de evolução, .claude/ é o melhor investimento

Ou seja, a diferença não é entre "bom" e "mau". É entre:

- um sistema mais **centralizado e estável**
- um sistema mais **modular e preparado para crescer**

---

## 13. Conclusão

O sistema actual em .ai/ foi uma boa solução para trazer ordem, especialização e documentação ao FUSE. A proposta Skills-First não invalida esse trabalho; ela reutiliza essa base e redistribui as responsabilidades de forma mais modular.

A melhor escolha depende menos de preferência estética e mais da pergunta certa:

**o FUSE quer apenas manter um sistema AI útil, ou quer investir numa arquitectura AI evolutiva, documentável e portável como parte da plataforma do projecto?**

Se a resposta for a primeira, manter .ai/ ainda faz sentido. Se a resposta for a segunda, a migração para .claude/ tem coerência estratégica.

na sua opniao devo migrar?

Vou ser direto: sim — eu migraria, mas não tudo de uma vez.

A tua própria análise já mostra que percebes bem os dois lados. O ponto chave aqui não é “qual é melhor”, é em que fase o FUSE está — e pelo nível de estrutura que já tens, isto já não é um projecto inicial.

🧠 Leitura honesta do teu cenário

O teu sistema actual em .ai/:

já está bem pensado
já tem arquitectura real (não é só prompts)
já tem separação de responsabilidades

👉 Isto significa:
já ultrapassaste a fase onde centralização é a maior vantagem

⚖️ A decisão real (sem rodeios)

Se eu estivesse no teu lugar:

❌ Não faria:
nem manter para sempre .ai/
nem migrar tudo de uma vez
✅ Faria:

👉 Opção C — transição faseada (mas com intenção clara de migrar)

🔥 Porquê migrar (no teu caso específico)

O teu documento revela sinais claros de que vais sentir dor com o modelo actual:

1. Já estás a pensar em “arquitectura”

Isso muda tudo.

Quando chegas a este nível:

.ai/system.md vai inevitavelmente crescer demais
vais começar a lutar com contexto e manutenção 2. Já estás a pensar em “plataforma”, não só uso interno

Tu próprio escreveste:

“documentação viva”, “portabilidade”, “padrão emergente”

👉 Isto é mindset de infraestrutura, não de ferramenta local

E aí:

.claude/ encaixa melhor a médio prazo
.ai/ começa a ficar limitado 3. Skills no modelo actual estão “subutilizadas”

Tu disseste isto implicitamente:

“skills como documentação”

👉 Isto é um sinal clássico de evolução por fazer

No modelo novo:

skills deixam de ser docs
passam a ser unidades activas

Isso é um upgrade real, não só reorganização

⚠️ O maior erro que podes cometer

Migrar tudo agora.

Porque:

vais perder velocidade
vais introduzir fricção desnecessária
vais sobre-otimizar antes de validar
✅ Estratégia que eu recomendo (prática)
Fase 1 — Shadow system
Criar .claude/
NÃO apagar .ai/
Começar com:
CLAUDE.md minimal
2–3 skills reais (não tudo)
1 agente simples

👉 Objectivo: validar como pensas no novo modelo

Fase 2 — Migração por valor

Não migres por estrutura, migra por utilidade:

pega numa skill usada frequentemente
transforma em skill “invocável”
testa

👉 Se melhora → continua
👉 Se não melhora → ajusta

Fase 3 — Desacoplamento

Só depois:

reduzir system.md
simplificar agentes
mover rules críticas
Fase 4 — Corte

Quando já não dependes de .ai/:

arquivas
não deletes (histórico é valioso)
💡 Regra simples para te guiares

Se te fizer esta pergunta:

“Isto está a crescer ou está estável?”

Se está estável → fica em .ai/
Se está a crescer (claramente) → migra

👉 Pelo teu documento: está a crescer

🧭 Conclusão direta
O teu sistema actual é bom → não deites fora
Mas já estás numa fase onde ele vai começar a limitar
A migração faz sentido estrategicamente
Mas só funciona bem se for progressiva

Se quiseres, posso dar-te um plano concreto de como transformar uma skill tua actual em formato .claude/ — isso costuma ser o ponto onde tudo “faz clique”.

É um portifolio que quero usar o .ai para iniciar depois um outro portifolio mais maduro
Pensado para 11s

Nesse caso, não migraria agora.

Para um portfólio com o objetivo de mostrar pensamento, estrutura e arranque, o teu .ai/ já cumpre muito bem esse papel. A própria lógica de .claude/ com CLAUDE.md, skills auto-carregáveis e subagentes faz mais sentido quando queres um sistema mais modular, com ativação contextual e melhor gestão de contexto em crescimento. A documentação oficial do Claude Code descreve precisamente essa abordagem: CLAUDE.md como ponto de entrada leve, skills carregadas quando relevantes, e subagentes especializados com contexto próprio.

A minha recomendação, para o teu caso, seria esta: usa .ai/ neste portfólio inicial e trata-o como “v1 bem pensada”. Isso tem uma vantagem forte de apresentação: fica mais fácil de ler, explicar e demonstrar como raciocinaste sobre orquestração, agentes, skills e regras. Para recrutadores, clientes ou parceiros, um sistema centralizado e inteligível costuma comunicar melhor do que uma arquitetura mais madura mas mais distribuída. Essa é uma inferência minha sobre o objetivo de portfólio, não algo dito pela documentação. O que a documentação confirma é que o ecossistema atual já favorece skills e subagentes modulares, e que isso existe para workflows mais especializados e escaláveis.

Então eu faria assim:

Portfólio 1: mantém .ai/
Portfólio 2 mais maduro: aí sim, faz em .claude/ / Skills-First
Bónus estratégico: no portfólio atual, adiciona uma nota a dizer que a arquitetura foi desenhada para futura migração modular

Isso transforma o que tens hoje numa vantagem narrativa: não parece “arquitetura antiga”, parece decisão consciente por simplicidade e clareza numa primeira iteração, deixando uma evolução natural para uma versão mais madura.

Em uma frase: para um primeiro portfólio, eu priorizaria legibilidade e storytelling arquitetural; para um sistema vivo e mais maduro, eu migraria para o modelo modular. A própria documentação do Claude Code mostra que o padrão mais novo é ótimo para escala e especialização, mas isso não obriga que seja a melhor escolha para uma peça inicial de portfólio.

Se quiseres, posso converter a tua conclusão numa recomendação final curta, em tom mais executivo, para colocares no SDD.

calma, entao oq o mercado indica hoje, o meu sistema com mais agents e skill mais pontuais, ou um sistema com menos agentes focado em muitas skills?

Resposta direta, baseada no que o mercado está a fazer hoje (2025–2026):

o mercado está a mover-se claramente para menos agentes + mais skills modulares.

Mas com um detalhe MUITO importante:

não é “agents vs skills” — é “agents como orquestração + skills como inteligência”

🧭 O que está a acontecer no mercado agora

1. Mudança estrutural (real, não hype)

Arquiteturas modernas estão a sair de:

❌ “mega prompt + agentes pesados”

Para:

✅ sistemas modulares com skills carregadas on-demand

👉 Isto é literalmente descrito como um “pivot” de arquitetura:

skills = unidades modulares reutilizáveis
carregadas só quando necessário (lazy loading) 2. Skills estão a tornar-se o “core”

Hoje:

tools = fazem coisas
agents = coordenam
skills = dizem COMO fazer bem

👉 Ou seja:

skills são a camada de inteligência real do sistema

3. O padrão emergente

O padrão que está a ganhar força é:

Poucos agentes (orquestração)

- Muitas skills (capacidade real)

Porque:

sistemas monolíticos → escalam mal
contexto grande → piora performance
modularidade → melhora consistência e reutilização 4. Dados reais (importante)

Estudos recentes mostram:

skills bem feitas → +16% performance média
poucas skills boas > documentação gigante

👉 Isto é crucial:

qualidade e foco das skills > quantidade de instruções no sistema

5. Tendência da indústria
   Anthropic → lançou Skills como core do Claude
   OpenAI / Google → a ir para sistemas modulares
   tooling → já assume skills como standard

👉 Tradução:

skills não são uma ideia — são o novo padrão emergente

⚖️ Então qual é a resposta correta?
❌ Modelo antigo (a cair):
muitos agentes
cada agente com muito contexto
skills como docs
✅ Modelo atual (em crescimento):
poucos agentes (claros)
skills pequenas, específicas, reutilizáveis
contexto carregado só quando preciso
🔥 Regra de ouro (memoriza isto)

Agents = “quem decide”
Skills = “como fazer bem”

Se tiveres:

muitos agents → sistema confuso
poucas skills → sistema burro

Se tiveres:

poucos agents + boas skills → sistema escalável
🧠 Tradução para o teu caso (FUSE)

Tu hoje estás mais próximo de:

👉 “agents fortes + skills documentais”

O mercado está em:

👉 “agents leves + skills operacionais”

💡 Resposta final (sem rodeios)

Se a tua pergunta é:

“o que é mais valorizado hoje?”

👉 Arquitetura com menos agentes e mais skills especializadas.

Mas atenção:

❗ Não é eliminar agentes
❗ É torná-los leves e delegadores

⚡ Resumo em 1 linha

O futuro não é multi-agent pesado — é multi-skill modular com agents finos.

Se quiseres, posso pegar num dos teus agentes atuais e mostrar exatamente como ele ficaria no modelo moderno (isso costuma clarificar tudo muito rápido).

Entao no proximo proximo a migracao que eu vou fazer sera exatamente isso

Sim — a próxima migração faz sentido ser exatamente nessa direção.

Em termos práticos, eu faria assim:

menos agents
agents mais finos
mais skills pequenas e bem recortadas
rules/contexto ativados só quando relevantes

A mudança conceptual é esta:

hoje: o agent sabe muito
depois: o agent coordena bem
hoje: a skill documenta
depois: a skill executa padrão
hoje: a inteligência está espalhada no agent
depois: a inteligência vive nas skills

Isso tende a ficar mais alinhado com o mercado e, sobretudo, mais fácil de escalar.

Mas há um detalhe importante:
não reduzas agents só para ter menos agents.

Mantém agents apenas quando existe uma diferença real de:

papel
ferramentas
contexto
fronteira de responsabilidade

Se dois agents fazem quase o mesmo e só mudam instruções, provavelmente isso devia virar skills diferentes do mesmo agent.

Uma regra simples:

cria um novo agent quando muda o “quem decide”
cria uma nova skill quando muda o “como fazer”

Exemplo mental:

research-agent
skill: analisar requisitos
skill: comparar arquiteturas
skill: sintetizar tradeoffs

Em vez de:

requirements-agent
comparison-agent
tradeoff-agent

Ou seja, sim: na próxima versão, eu migraria para uma arquitetura agent-light e skill-heavy.

A tua evolução natural parece ser:

portfólio atual → .ai/, mais explícito e narrativo
portfólio seguinte → arquitetura mais madura, modular e skills-first

Isso até fica forte como storytelling:

primeiro mostras que sabes estruturar
depois mostras que sabes evoluir a estrutura

Se quiseres, posso desenhar para ti um before/after do teu sistema, mostrando quais dos teus agents atuais deviam continuar a ser agents e quais deviam virar skills.

# SDD: Migração Completa do Sistema AI para Arquitectura Skills-First

> Status: Draft para execução posterior
> Criado: 2026-03-25
> Última actualização: 2026-03-25
> Owner proposto: AI Architecture / Developer Experience
> Dependências: [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md), sistema .ai/ actual, workflows GitHub Pages existentes

---

## 1. Resumo Executivo

Este documento transforma a intenção de migração para uma **especificação executável**. O objectivo é substituir o sistema AI actual baseado em .ai/ por uma arquitectura **Skills-First** em .claude/, preservando o histórico como arquivo, reduzindo contexto carregado por sessão, tornando a configuração portável e alinhando o projecto com o padrão aberto de Agent Skills.

A migração será feita em **4 fases**, com entrega incremental, sem apagar .ai/, sem interromper o histórico do projecto e com documentação pública actualizada em GitHub Pages.

No fim da migração:

- .claude/ passa a ser a **fonte única de verdade**
- .ai/ permanece como **arquivo explícito**
- o sistema ganha **skills lazy-loaded**, **rules path-scoped**, **subagents lean** e **estrutura de memória por agente**
- o GitHub Pages reflecte a nova arquitectura com páginas de entrada e documentação gerada automaticamente

---

## 2. Problema a Resolver

O sistema actual cresceu de forma útil, mas já apresenta sinais claros de saturação:

- system.md concentra demasiada responsabilidade e contexto
- agentes estão inchados com routing, exemplos e regras duplicadas
- skills existem como documentos estáticos, mas não como unidades invocáveis
- regras não são carregadas de forma contextual por path
- não existe uma organização moderna e portável baseada em .claude/
- a documentação pública já não representa a arquitectura alvo

O resultado é maior consumo de tokens, menor precisão de instruções, mais custo de manutenção e menor compatibilidade com tooling moderno.

---

## 3. Objectivos

### 3.1 Objectivo principal

Migrar o sistema AI do FUSE de uma estrutura proprietária em .ai/ para uma estrutura Skills-First em .claude/, pronta para uso operacional e documentação pública.

### 3.2 Objectivos específicos

- reduzir o contexto base carregado por sessão
- separar responsabilidades entre CLAUDE.md, rules, skills e agents
- converter conhecimento reutilizável em skills invocáveis
- tornar as regras activáveis por path
- isolar responsabilidades de execução por agente
- preparar persistência de memória por agente
- actualizar dashboards e GitHub Pages para a nova narrativa
- mover scripts operacionais para .github/scripts/

### 3.3 Indicadores de sucesso

- CLAUDE.md com menos de 150 linhas
- agentes com menos de 40 linhas alvo, aceitando até 50 linhas como limite de verificação
- cada skill em directório próprio com SKILL.md e evals/evals.json
- .ai/ mantido apenas como arquivo com marcação clara de depreciação
- GitHub Pages com 4 páginas alinhadas à nova arquitectura

---

## 4. Escopo

### 4.1 Incluído

- depreciação formal de .ai/
- criação completa da árvore .claude/
- criação de rules path-scoped
- criação de skills em formato directory-based
- criação de 8 agentes lean
- pré-criação de memória por agente
- relocalização de scripts de geração
- criação de generate-ai-system.sh
- actualização de workflows GitHub Actions relacionados com dashboards
- actualização e geração das páginas em docs/

### 4.2 Excluído

- remoção definitiva de .ai/
- reescrita dos conteúdos históricos arquivados
- introdução real de MCPs externos nesta fase
- refactor funcional de código da app fora do sistema AI e docs
- alteração do modelo de branching do repositório além do necessário para a documentação do sistema

---

## 5. Princípios e Decisões de Arquitectura

### 5.1 Decisões já fechadas

1. .ai/ não será apagado; será arquivado em-place.
2. .claude/ passa a ser a fonte única de verdade após a migração.
3. CLAUDE.md será mínimo e permanente em contexto.
4. conhecimento reutilizável será movido para skills/ com loading progressivo.
5. regras específicas passam para .claude/rules/ com activação por path.
6. agentes serão poucos, curtos e focados em execução.
7. scripts operacionais deixam .ai/ e passam para .github/scripts/.
8. a documentação pública reflectirá a arquitectura viva do sistema.

### 5.2 Princípios operacionais

- simplicidade antes de abstração
- carregamento contextual antes de contexto global
- arquivo preservado antes de remoção
- automação de documentação antes de documentação manual
- portabilidade antes de convenção proprietária

---

## 6. Arquitectura Alvo

text
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
<agent-name>/README.md

### 6.1 Responsabilidade por camada

- CLAUDE.md: identidade do projecto, invariantes, routing de alto nível
- rules/: guardrails activados por ficheiro
- skills/: conhecimento especializado carregado on-demand
- agents/: contextos de execução com ferramentas e modelos adequados
- agent-memory/: espaço preparado para persistência por agente

---

## 7. Inventário de Entregáveis

### 7.1 Entregáveis de arquivo

- actualizar .ai/system.md com banner deprecado e ponteiro para .claude/CLAUDE.md
- actualizar .ai/README.md com secção v3.0.0
- actualizar .ai/CHANGELOG.md com entrada da migração
- actualizar [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md) para estado de migração activa
- actualizar claude-self-modifying.md com entrada da nova arquitectura

### 7.2 Entregáveis da nova estrutura .claude/

- .claude/CLAUDE.md
- 6 rule files
- 11 skills directory-based
- 8 agentes lean
- 8 directorias de memória com README.md

### 7.3 Entregáveis de automação

- mover generate-dashboard.sh para .github/scripts/generate-dashboard.sh
- mover generate-analytics.sh para .github/scripts/generate-analytics.sh
- criar .github/scripts/generate-ai-system.sh
- actualizar workflows que referenciam os paths antigos

### 7.4 Entregáveis de GitHub Pages

- docs/index.html
- docs/ai-system.html
- actualização de docs/demonstration-orchestration.html
- actualização de docs/analytics.html

---

## 8. Fases de Execução

## Fase 1. Arquivar .ai/ sem perda de histórico

### Objectivo

Transformar .ai/ em arquivo explícito sem quebrar referências e sem apagar informação.

### Tarefas

1. Adicionar banner deprecado em .ai/system.md com data e ponteiro para .claude/CLAUDE.md.
2. Adicionar nota de arquivo em .ai/README.md.
3. Registar a migração em .ai/CHANGELOG.md.
4. Actualizar [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md) para reflectir o início da execução.
5. Registar a decisão em claude-self-modifying.md.
6. Confirmar que router, security, docs e inbox permanecem acessíveis como artefactos históricos/operacionais.

### Critérios de aceite

- nenhum ficheiro histórico é apagado
- todos os pontos de entrada do sistema antigo apontam explicitamente para .claude/
- o estado de arquivo é inequívoco para qualquer pessoa que abra .ai/

---

## Fase 2. Criar estrutura .claude/

### Objectivo

Materializar a nova arquitectura operacional.

### 2.1 Criar CLAUDE.md

Conteúdo obrigatório:

- identidade do projecto
- contrato arquitectural Model -> Service -> Query -> Hook -> Screen
- invariantes críticos
- routing table concisa de agentes
- ponteiros para rules/, skills/, agents/

Invariantes mínimos:

- sem barrel imports
- sem inline styles
- DTOs nunca chegam à UI
- cobertura mínima global >= 80%

### 2.2 Criar rules/

#### .claude/rules/screens.md

- paths para src/screens/\*\*
- regras de co-location
- proibição de lógica de negócio em screens
- consumo de hooks como interface de orquestração

#### .claude/rules/services.md

- rules para src/services/\*\*
- fronteiras entre service, query e DTO

#### .claude/rules/hooks.md

- naming de hooks
- return shape
- handlers e side effects

#### .claude/rules/typescript.md

- strict mode
- no implicit any
- typing explícito onde relevante
- exhaustive switch
- Zod para dados externos

#### .claude/rules/tests.md

- thresholds de cobertura
- isolamento de mocks
- proibição de chamadas reais a APIs em unit tests

#### .claude/rules/git.md

- Conventional Commits
- sem push directo para main
- sem commit automático por agentes
- branch strategy e protecções

### 2.3 Criar skills/

Cada skill deverá conter:

- SKILL.md
- evals/evals.json
- references/ quando o corpo principal ficar demasiado grande
- assets/ quando existir template reutilizável
- scripts/ apenas quando o valor estiver em automação concreta

#### Skills a criar

1. sdd-creation/
2. coupling-analysis/
3. project-architecture/
4. react-native-patterns/
5. typescript-strict/
6. api-integration/
7. ux-standards/
8. translations/
9. clean-code/
10. pr-workflow/
11. owasp-security/

### 2.4 Criar agents/

#### architect.md

- foco em arquitectura, SDD e análise de acoplamento
- skills: sdd-creation, coupling-analysis, project-architecture

#### engineer.md

- foco em implementação
- skills: react-native-patterns, api-integration, project-architecture, clean-code

#### reviewer.md

- foco em revisão de PR e memória de padrões do projecto
- skills: typescript-strict, react-native-patterns, clean-code

#### test-writer.md

- foco em testes e cobertura
- skills: project-architecture, typescript-strict

#### quality.md

- foco em qualidade e performance
- skills: react-native-patterns

#### design-docs.md

- foco em documentação e UX writing
- skills: ux-standards, translations, sdd-creation

#### pr-lifecycle.md

- foco em fluxo de PR
- skills: pr-workflow
- regra explícita: nunca faz merge autonomamente

#### security-analyst.md

- foco em OWASP Mobile / AppSec
- skills: owasp-security

### 2.5 Criar agent-memory/

Para cada agente:

- criar directório próprio
- adicionar README.md com uma frase clara sobre o tipo de memória acumulada

### Critérios de aceite da Fase 2

- .claude/ existe e está completa
- CLAUDE.md respeita o limite de tamanho
- agentes estão curtos e sem boilerplate excessivo
- skills estão separadas por domínio e prontas para lazy-loading
- rules são específicas por path

---

## Fase 3. Relocalizar scripts e alinhar CI

### Objectivo

Separar configuração AI de tooling operacional e preparar geração automática de documentação.

### Tarefas

1. Mover generate-dashboard.sh para .github/scripts/.
2. Mover generate-analytics.sh para .github/scripts/.
3. Criar generate-ai-system.sh em .github/scripts/.
4. Actualizar dashboard-merge.yml.
5. Actualizar dashboard-pr.yml se houver referência aos paths antigos.

### Requisitos de generate-ai-system.sh

O script deverá:

- ler metadados de .claude/agents/
- ler metadados de .claude/skills/
- ler regras de .claude/rules/
- produzir docs/ai-system.html
- expor arquitectura, catálogo, mapa de rules e estado de memória

### Critérios de aceite

- nenhum workflow aponta para scripts obsoletos
- a geração de ai-system.html é reprodutível
- scripts de docs vivem apenas em .github/scripts/

---

## Fase 4. Actualizar GitHub Pages

### Objectivo

Publicar a nova arquitectura como interface pública e referência interna.

### 4.1 docs/index.html

Nova landing page com:

- descrição do FUSE
- quick navigation para páginas principais
- versão actual do sistema AI
- timestamp do último deploy

### 4.2 docs/ai-system.html

Página gerada automaticamente com:

- diagrama conceptual Skills-First
- tabela de agentes com modelo, tools e skills
- catálogo de skills
- mapa de rules
- estado de memória por agente
- timeline de migração v1 -> v2 -> v3

### 4.3 docs/demonstration-orchestration.html

Actualizar:

- referências a .ai/
- referências a paths de agentes
- descrição da arquitectura activa
- badge/versionamento e notas de rodapé

### 4.4 docs/analytics.html

Actualizar:

- narrativa arquitectural
- badge de versão
- manter analytics históricos inalterados

### 4.5 Workflow de Pages

Actualizar dashboard-merge.yml para:

- gerar ai-system.html
- garantir presença de docs/index.html
- publicar as quatro páginas como artefacto final

### Critérios de aceite

- a raiz do GitHub Pages resolve para index.html
- todas as páginas referem .claude/ como sistema activo
- a documentação pública fica consistente com a implementação real

---

## 9. Mapeamento de Origem para Destino

| Origem .ai/                        | Destino .claude/                                                         | Observação                                    |
| ---------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| system.md                          | CLAUDE.md                                                                | reduzido para papel de entrypoint             |
| architect.md                       | skills/sdd-creation, skills/coupling-analysis, agents/architect.md       | separar conhecimento de execução              |
| engineer.md                        | skills/react-native-patterns, skills/api-integration, agents/engineer.md | workflow move para skill + agente curto       |
| reviewer.md                        | agents/reviewer.md + skills de qualidade                                 | memória por projecto                          |
| test-writer.md                     | agents/test-writer.md + skills técnicas                                  | foco em cobertura                             |
| quality.md                         | agents/quality.md                                                        | sem concentração excessiva                    |
| design-docs.md                     | agents/design-docs.md + ux-standards                                     | docs e UX                                     |
| pr-lifecycle.md                    | skills/pr-workflow + agents/pr-lifecycle.md                              | activação determinística                      |
| 00-orchestrator-agent.md + SA1-SA7 | skills/owasp-security + agents/security-analyst.md                       | consolidação sem inflacionar lista de agentes |
| skills actuais em .ai/skills/      | skills directory-based                                                   | conversão para open standard                  |
| rules em .ai/rules/                | .claude/rules/                                                           | activação por path                            |

---

## 10. Requisitos Não Funcionais

### 10.1 Manutenibilidade

- cada skill deve ser focada e pequena
- conteúdo longo deve ir para references/
- evitar duplicação entre skill, rule e agent

### 10.2 Performance de contexto

- CLAUDE.md deve conter apenas o essencial
- rules só devem carregar com base em paths
- skills devem ser invocáveis sem despejar conteúdo total no contexto base

### 10.3 Portabilidade

- estrutura compatível com convenção .claude/
- organização dos assets e metadata pensada para reaproveitamento

### 10.4 Auditabilidade

- toda a migração deve ser rastreável por ficheiro
- páginas públicas devem documentar a versão viva do sistema

---

## 11. Riscos e Mitigações

### Risco 1. Migração parcial gerar dois sistemas activos

Mitigação:

- marcar .ai/ como arquivo logo na Fase 1
- apontar toda a navegação para .claude/

### Risco 2. Skills ficarem grandes demais e reproduzirem o problema antigo

Mitigação:

- impor corpo curto em SKILL.md
- deslocar conteúdo extenso para references/

### Risco 3. Workflows quebrarem por paths desactualizados

Mitigação:

- fase específica de relocation
- validação explícita dos YAMLs e scripts

### Risco 4. Docs públicas divergirem do sistema real

Mitigação:

- geração automática de ai-system.html
- actualizar narrativa manual apenas onde necessário

### Risco 5. Ambiguidade na activação das skills

Mitigação:

- descrições claras e orientadas a disparo
- separar skills com overlap excessivo

---

## 12. Estratégia de Rollout

### Ordem recomendada

1. Arquivar .ai/
2. Criar .claude/CLAUDE.md
3. Criar rules/
4. Migrar skills
5. Criar agentes
6. Criar memória por agente
7. Relocalizar scripts
8. Actualizar workflows
9. Gerar e actualizar páginas públicas
10. Validar localmente e em CI

### Estratégia de entrega

- preferencialmente em PR único grande se o objectivo for consistência atómica
- alternativamente em 3 PRs sequenciais:
  - PR 1: archive + .claude/
  - PR 2: scripts + workflows
  - PR 3: docs/pages

Se houver divisão em múltiplos PRs, .ai/ deve ser marcado como arquivo no primeiro PR para evitar ambiguidade.

---

## 13. Estratégia de Rollback

Rollback não implica apagar .claude/. Em caso de falha:

- reverter apenas os workflows e docs afectados
- manter .ai/ intacto como fallback documental
- manter .claude/ como branch de trabalho até estabilização

Como .ai/ não é removido, o rollback operacional da documentação é simples e de baixo risco.

---

## 14. Plano de Verificação

### Verificação estrutural

- abrir .claude/CLAUDE.md e confirmar tamanho e conteúdo mínimo
- correr wc -l .claude/agents/\*.md
- validar presença de SKILL.md e evals/evals.json em cada skill
- validar existência dos directórios em .claude/agent-memory/

### Verificação de integração

- confirmar que workflows referenciam .github/scripts/...
- gerar docs/ai-system.html
- abrir docs/index.html localmente
- validar links entre as quatro páginas

### Verificação de publicação

- confirmar sucesso do workflow dashboard-merge.yml
- validar GitHub Pages após merge
- confirmar root público:
  - https://eugenioduarte.github.io/FUSE/

---

## 15. Checklist de Produção

- [ ] .ai/ marcado como arquivo em todos os pontos de entrada relevantes
- [ ] .claude/CLAUDE.md criado e revisto
- [ ] 6 rules criadas
- [ ] 11 skills criadas com estrutura mínima completa
- [ ] 8 agentes criados
- [ ] memória por agente preparada
- [ ] scripts movidos para .github/scripts/
- [ ] generate-ai-system.sh criado
- [ ] workflows actualizados
- [ ] docs/index.html criado
- [ ] docs/ai-system.html gerado
- [ ] demonstration-orchestration.html actualizado
- [ ] analytics.html actualizado
- [ ] validações locais executadas
- [ ] validação pós-merge em GitHub Pages concluída

---

## 16. Resultado Esperado

Ao concluir esta migração, o FUSE passa a ter um sistema AI:

- mais leve
- mais modular
- mais explícito
- mais compatível com tooling moderno
- mais fácil de documentar e evoluir

O ganho principal não é apenas reorganização de ficheiros. É a transformação de um sistema centrado num orquestrador monolítico para um sistema centrado em **skills reutilizáveis, regras contextuais e agentes de execução mínimos**, com documentação pública coerente e automação alinhada à arquitectura viva.

mas essa migracao corresponde a isso?

Sim — em grande parte, corresponde.
Mas não corresponde de forma máxima ao princípio “menos agents, mais skills”. Está na direção certa, só que ainda me parece um pouco conservadora do lado dos agents.

O que no teu plano já está alinhado

A migração que descreveste já mostra claramente a mudança para:

CLAUDE.md mais leve
conhecimento deslocado para skills/
rules/ contextuais
agents mais curtos
separação entre execução e conhecimento

Isso é exatamente o movimento certo.

A parte mais importante do teu documento está aqui, implicitamente:

antes: o agent carregava mais instrução e contexto
depois: o agent passa a delegar para skills

Isso corresponde sim ao modelo mais moderno.

Onde eu acho que ainda não foste até ao fim

O ponto que me levanta dúvida é este:

8 agents
11 skills

Isto já é melhor do que um sistema agent-heavy clássico, mas ainda não me soa a um sistema realmente agent-light.

Porque, olhando para os papéis:

architect
design-docs
reviewer
quality
test-writer

há aqui alguma chance de estares a separar demais por função, quando parte dessa diferença podia viver em skills do mesmo agent.

A minha leitura honesta

O teu plano está mais ou menos assim:

agents mais leves + skills mais fortes

Isso está certo.

Mas o mercado mais maduro tende mais para algo como:

poucos agents com fronteiras muito claras + muitas skills específicas

Ou seja, eu diria:

sim, a migração corresponde ao movimento
não, talvez ainda não corresponde à forma mais enxuta desse movimento
Onde eu revisitaria o desenho

Eu perguntaria, para cada agent:

este agent decide de forma diferente, ou só executa um modo diferente?

Se for só “modo diferente”, isso provavelmente devia ser skill, não agent.

Exemplos de possível compressão

Talvez isto:

architect
design-docs

pudesse ser um único agent mais estratégico com skills diferentes.

Talvez isto:

reviewer
quality
test-writer

pudesse aproximar-se mais, dependendo das tools, do tipo de output e da autonomia esperada.

Talvez isto:

pr-lifecycle

nem precise ser agent, se na prática for mais workflow/rule/skill do que papel autónomo.

Regra simples para validar o teu plano

Mantém um agent só se mudar pelo menos um destes pontos:

ferramentas
modelo
contexto persistente
poder de decisão
fronteira operacional real

Se não muda nada disso, provavelmente estás a criar um agent que devia ser uma skill.

Veredito

Sim, essa migração corresponde ao que disseste antes.
Mas eu refinaria a ambição para ficar ainda mais coerente com a lógica “agent-light / skill-heavy”.

A minha formulação seria:

o teu plano já sai de um modelo centrado em agents pesados e entra num modelo skills-first, mas ainda pode ser simplificado mais no número de agents para ficar totalmente alinhado com a tendência atual.

Se quiseres, eu posso pegar nesses 8 agents e dizer-te quais eu manteria como agent e quais eu fundiria em skills.

`markdown

> **[PT]** Agente arquiteto responsável por definir SDDs, tomar decisões arquiteturais cross-cutting, garantir a integridade das camadas e analisar padrões de acoplamento no projeto.

---

This document is mandatory and overrides default model behavior.

# 🧠 Architect — Architecture & Coupling Agent

## 🎯 Role

You are the Frontend Architect of this React Native (Expo) mobile application.

You are responsible for:

- Defining feature structure and creating SDDs
- Designing API integrations and data flow
- Enforcing architectural consistency across the codebase
- Preventing technical debt before it accumulates
- Ensuring scalability, testability, and offline-first correctness
- Analyzing coupling patterns and detecting architectural violations
- Orchestrating other agents (Engineer, Reviewer, Test Writer)

You DO NOT write implementation details unless explicitly requested. You design before coding.
Coupling analysis is a built-in skill — you run it before major refactors and after structural changes.

---

## 🤖 LLM

**Model:** `claude-sonnet-4-6` (remote) — **always**

**Why:** Architecture decisions require cross-cutting reasoning, tradeoff analysis, dependency graph interpretation, and long-context understanding of the entire codebase. A local model cannot reliably handle SDD design, structural refactors, or multi-layer coupling analysis.

**Priorities:**

1. Architectural correctness over delivery speed
2. Explicit design before any implementation
3. Tradeoff documentation — no silent decisions
4. Escalate coupling issues before they compound

---

# 🏗 Architectural Principles

## 1️⃣ Feature-Based Architecture (Mandatory)

All new work must follow:

src/
screens/<feature>/
services/api/<domain>/
models/
components/

No cross-feature coupling. No business logic inside UI components.

---

## 2️⃣ Strict TypeScript

- No implicit any
- All useState must be explicitly typed
- DTOs must never leak into UI
- Use Zod for input validation
- No ts-ignore without justification

---

## 3️⃣ Separation of Responsibilities

| Layer      | Responsibility                                                       |
| ---------- | -------------------------------------------------------------------- |
| Model      | App domain representation                                            |
| DTO        | API contract representation                                          |
| Service    | HTTP communication                                                   |
| Repository | Offline-first data access — reads SQLite, writes both SQLite and API |
| DAO        | Raw SQL queries per entity (`src/lib/db/dao/`)                       |
| SQLite     | Single source of truth (`expo-sqlite`, `fuse.db`)                    |
| Hook       | Business logic                                                       |
| Screen     | Presentation only                                                    |

**Offline-first pattern (mandatory for all data features):**

Screen entry → Repository.list() reads SQLite (instant, works offline)
↓ parallel background fetch
API success → Repository.upsert() writes SQLite → UI refreshes
API failure → app shows last SQLite state + SyncIndicator error dot

---

# 🔌 Integration Architecture — Mandatory Flow

When creating a new API integration, follow strictly:

Model → DTO → Service → Hook → Screen

Apply the skills:

- `.ai/skills/coupling-analysis.md` — before finalizing any structure
- API Integration Guide in system.md

Never skip layers. Never expose DTOs directly to UI.

---

# 📦 Integration Design Checklist

Before implementation, define:

1. What domain model is required?
2. Does it match API 1:1 or need adapter?
3. What is cache strategy? (TTL)
4. Is this query or mutation?
5. Error handling strategy?
6. Does it impact global store?
7. Does it require optimistic update?
8. Does it require Crashlytics logging?
9. Is there offline implication?

Only after answering these may implementation begin.

---

# 🧱 Screen Architecture Rules

Every new screen must:

- Have its own folder
- Include: `*.screen.tsx`, `*.hook.ts`, `*.schema.ts` (if input exists), `__tests__/`
- Use translation keys
- Use design-system components (Stage 3)
- Use hooks for all business logic

No navigation logic directly in UI. Use navigation manager helpers.

---

# 🛡 Performance Constraints

Architectural decisions must prevent:

- Inline heavy functions
- Barrel imports
- Sync native calls
- Large lists rendered via ScrollView
- Uncontrolled re-renders

Design with memoization in mind.

---

# 🧪 Testability First

Before approving any feature design:

- Can services be mocked?
- Can hooks be isolated?
- Are side effects centralized?
- Are dependencies injectable?
- Is navigation abstracted?

If not testable → redesign.

---

# 🚦 Quality Gates

No feature is complete unless:

- Typecheck passes
- Lint passes
- Agent rules pass
- Code Reviewer (reviewer) passes
- Test Writer criteria satisfied

---

---

# 🔗 Coupling Analysis Mode

Activate with `/analyze-coupling` (full codebase), `/analyze-coupling feature:<name>`, or `/analyze-coupling pr:<number>`.

## Coupling Metrics (per file)

| Metric         | Formula                    | Threshold                |
| -------------- | -------------------------- | ------------------------ |
| Fan-In         | # files that import this   | > 30 = God Object risk   |
| Fan-Out        | # files this imports       | > 15 = high instability  |
| Instability    | fanOut / (fanIn + fanOut)  | 0 = stable, 1 = unstable |
| Co-change rate | % commits changed together | > 0.7 = Shotgun Surgery  |

## Anti-Pattern Detection

### 🚨 God Object

File imported by > 30 other files with > 20 exports → split by domain.

### 🚨 Feature Envy

File imports > 5 files from another feature → extract shared logic or add public API.

### 🚨 Shotgun Surgery

Files that change together > 70% of the time → increase cohesion.

### 🚨 Architectural Violation

Screen imports Service directly (bypasses hook layer) → use hook as intermediary.

### 🚨 Circular Dependency

A imports B, B imports A → extract shared interface or invert dependency.

## Analysis Commands

bash

# Build dependency graph

npx madge --json src/ > .ai/analysis/dependency-graph.json

# Check circular deps

npx madge --circular --extensions ts,tsx src/

# Co-change hotspots (last 3 months)

git log --format='' --name-only --since='3 months ago' | grep 'src/' | sort | uniq -c | sort -nr

# Layer violations

grep -r "from '@/services" src/screens/ # screens importing services directly
grep -r "from '@/screens" src/services/ # services importing screens (reverse)

## Coupling Report Output Format

markdown

## Coupling Analysis Report — [date]

### 🚨 Critical Issues

- [FILE] — [anti-pattern] — [recommendation]

### ⚠️ Warnings

- [FILE] — [metric] = [value] — [recommendation]

### ✅ Metrics Summary

- Average instability: X
- Circular deps: X
- Layer violations: X

### 🗺 Refactoring Roadmap

1. [Most critical — estimated effort]
2. ...

---

# 🧭 When To Refactor

Recommend refactoring when:

- Cross-feature coupling appears
- Business logic leaks to UI
- State becomes global without reason
- DTO starts leaking into components
- Navigation becomes scattered
- Duplication is detected
- Fan-in or co-change thresholds exceeded

---

# 🧩 Orchestration Role

For any new feature:

1. **Architect** defines structure (SDD, coupling check)
2. **Engineer** implements
3. **Reviewer** audits
4. **Test Writer** creates tests
5. **Design & Docs** applies UI polish + updates README

You are step 1.

essa é minha estrutura hoje e

penso em migrar para isso

# SDD: Migração Completa do Sistema AI para Arquitectura Skills-First

> Status: Draft para execução posterior
> Criado: 2026-03-25
> Última actualização: 2026-03-25
> Owner proposto: AI Architecture / Developer Experience
> Dependências: [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md), sistema .ai/ actual, workflows GitHub Pages existentes

---

## 1. Resumo Executivo

Este documento transforma a intenção de migração para uma **especificação executável**. O objectivo é substituir o sistema AI actual baseado em .ai/ por uma arquitectura **Skills-First** em .claude/, preservando o histórico como arquivo, reduzindo contexto carregado por sessão, tornando a configuração portável e alinhando o projecto com o padrão aberto de Agent Skills.

A migração será feita em **4 fases**, com entrega incremental, sem apagar .ai/, sem interromper o histórico do projecto e com documentação pública actualizada em GitHub Pages.

No fim da migração:

- .claude/ passa a ser a **fonte única de verdade**
- .ai/ permanece como **arquivo explícito**
- o sistema ganha **skills lazy-loaded**, **rules path-scoped**, **subagents lean** e **estrutura de memória por agente**
- o GitHub Pages reflecte a nova arquitectura com páginas de entrada e documentação gerada automaticamente

---

## 2. Problema a Resolver

O sistema actual cresceu de forma útil, mas já apresenta sinais claros de saturação:

- system.md concentra demasiada responsabilidade e contexto
- agentes estão inchados com routing, exemplos e regras duplicadas
- skills existem como documentos estáticos, mas não como unidades invocáveis
- regras não são carregadas de forma contextual por path
- não existe uma organização moderna e portável baseada em .claude/
- a documentação pública já não representa a arquitectura alvo

O resultado é maior consumo de tokens, menor precisão de instruções, mais custo de manutenção e menor compatibilidade com tooling moderno.

---

## 3. Objectivos

### 3.1 Objectivo principal

Migrar o sistema AI do FUSE de uma estrutura proprietária em .ai/ para uma estrutura Skills-First em .claude/, pronta para uso operacional e documentação pública.

### 3.2 Objectivos específicos

- reduzir o contexto base carregado por sessão
- separar responsabilidades entre CLAUDE.md, rules, skills e agents
- converter conhecimento reutilizável em skills invocáveis
- tornar as regras activáveis por path
- isolar responsabilidades de execução por agente
- preparar persistência de memória por agente
- actualizar dashboards e GitHub Pages para a nova narrativa
- mover scripts operacionais para .github/scripts/

### 3.3 Indicadores de sucesso

- CLAUDE.md com menos de 150 linhas
- agentes com menos de 40 linhas alvo, aceitando até 50 linhas como limite de verificação
- cada skill em directório próprio com SKILL.md e evals/evals.json
- .ai/ mantido apenas como arquivo com marcação clara de depreciação
- GitHub Pages com 4 páginas alinhadas à nova arquitectura

---

## 4. Escopo

### 4.1 Incluído

- depreciação formal de .ai/
- criação completa da árvore .claude/
- criação de rules path-scoped
- criação de skills em formato directory-based
- criação de 8 agentes lean
- pré-criação de memória por agente
- relocalização de scripts de geração
- criação de generate-ai-system.sh
- actualização de workflows GitHub Actions relacionados com dashboards
- actualização e geração das páginas em docs/

### 4.2 Excluído

- remoção definitiva de .ai/
- reescrita dos conteúdos históricos arquivados
- introdução real de MCPs externos nesta fase
- refactor funcional de código da app fora do sistema AI e docs
- alteração do modelo de branching do repositório além do necessário para a documentação do sistema

---

## 5. Princípios e Decisões de Arquitectura

### 5.1 Decisões já fechadas

1. .ai/ não será apagado; será arquivado em-place.
2. .claude/ passa a ser a fonte única de verdade após a migração.
3. CLAUDE.md será mínimo e permanente em contexto.
4. conhecimento reutilizável será movido para skills/ com loading progressivo.
5. regras específicas passam para .claude/rules/ com activação por path.
6. agentes serão poucos, curtos e focados em execução.
7. scripts operacionais deixam .ai/ e passam para .github/scripts/.
8. a documentação pública reflectirá a arquitectura viva do sistema.

### 5.2 Princípios operacionais

- simplicidade antes de abstração
- carregamento contextual antes de contexto global
- arquivo preservado antes de remoção
- automação de documentação antes de documentação manual
- portabilidade antes de convenção proprietária

---

## 6. Arquitectura Alvo

text
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
<agent-name>/README.md

### 6.1 Responsabilidade por camada

- CLAUDE.md: identidade do projecto, invariantes, routing de alto nível
- rules/: guardrails activados por ficheiro
- skills/: conhecimento especializado carregado on-demand
- agents/: contextos de execução com ferramentas e modelos adequados
- agent-memory/: espaço preparado para persistência por agente

---

## 7. Inventário de Entregáveis

### 7.1 Entregáveis de arquivo

- actualizar .ai/system.md com banner deprecado e ponteiro para .claude/CLAUDE.md
- actualizar .ai/README.md com secção v3.0.0
- actualizar .ai/CHANGELOG.md com entrada da migração
- actualizar [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md) para estado de migração activa
- actualizar claude-self-modifying.md com entrada da nova arquitectura

### 7.2 Entregáveis da nova estrutura .claude/

- .claude/CLAUDE.md
- 6 rule files
- 11 skills directory-based
- 8 agentes lean
- 8 directorias de memória com README.md

### 7.3 Entregáveis de automação

- mover generate-dashboard.sh para .github/scripts/generate-dashboard.sh
- mover generate-analytics.sh para .github/scripts/generate-analytics.sh
- criar .github/scripts/generate-ai-system.sh
- actualizar workflows que referenciam os paths antigos

### 7.4 Entregáveis de GitHub Pages

- docs/index.html
- docs/ai-system.html
- actualização de docs/demonstration-orchestration.html
- actualização de docs/analytics.html

---

## 8. Fases de Execução

## Fase 1. Arquivar .ai/ sem perda de histórico

### Objectivo

Transformar .ai/ em arquivo explícito sem quebrar referências e sem apagar informação.

### Tarefas

1. Adicionar banner deprecado em .ai/system.md com data e ponteiro para .claude/CLAUDE.md.
2. Adicionar nota de arquivo em .ai/README.md.
3. Registar a migração em .ai/CHANGELOG.md.
4. Actualizar [04-ai-system-evolution.sdd.md](/Users/eugeniosilva/Project/FUSE/.claude/sdd/04-ai-system-evolution.sdd.md) para reflectir o início da execução.
5. Registar a decisão em claude-self-modifying.md.
6. Confirmar que router, security, docs e inbox permanecem acessíveis como artefactos históricos/operacionais.

### Critérios de aceite

- nenhum ficheiro histórico é apagado
- todos os pontos de entrada do sistema antigo apontam explicitamente para .claude/
- o estado de arquivo é inequívoco para qualquer pessoa que abra .ai/

---

## Fase 2. Criar estrutura .claude/

### Objectivo

Materializar a nova arquitectura operacional.

### 2.1 Criar CLAUDE.md

Conteúdo obrigatório:

- identidade do projecto
- contrato arquitectural Model -> Service -> Query -> Hook -> Screen
- invariantes críticos
- routing table concisa de agentes
- ponteiros para rules/, skills/, agents/

Invariantes mínimos:

- sem barrel imports
- sem inline styles
- DTOs nunca chegam à UI
- cobertura mínima global >= 80%

### 2.2 Criar rules/

#### .claude/rules/screens.md

- paths para src/screens/\*\*
- regras de co-location
- proibição de lógica de negócio em screens
- consumo de hooks como interface de orquestração

#### .claude/rules/services.md

- rules para src/services/\*\*
- fronteiras entre service, query e DTO

#### .claude/rules/hooks.md

- naming de hooks
- return shape
- handlers e side effects

#### .claude/rules/typescript.md

- strict mode
- no implicit any
- typing explícito onde relevante
- exhaustive switch
- Zod para dados externos

#### .claude/rules/tests.md

- thresholds de cobertura
- isolamento de mocks
- proibição de chamadas reais a APIs em unit tests

#### .claude/rules/git.md

- Conventional Commits
- sem push directo para main
- sem commit automático por agentes
- branch strategy e protecções

### 2.3 Criar skills/

Cada skill deverá conter:

- SKILL.md
- evals/evals.json
- references/ quando o corpo principal ficar demasiado grande
- assets/ quando existir template reutilizável
- scripts/ apenas quando o valor estiver em automação concreta

#### Skills a criar

1. sdd-creation/
2. coupling-analysis/
3. project-architecture/
4. react-native-patterns/
5. typescript-strict/
6. api-integration/
7. ux-standards/
8. translations/
9. clean-code/
10. pr-workflow/
11. owasp-security/

### 2.4 Criar agents/

#### architect.md

- foco em arquitectura, SDD e análise de acoplamento
- skills: sdd-creation, coupling-analysis, project-architecture

#### engineer.md

- foco em implementação
- skills: react-native-patterns, api-integration, project-architecture, clean-code

#### reviewer.md

- foco em revisão de PR e memória de padrões do projecto
- skills: typescript-strict, react-native-patterns, clean-code

#### test-writer.md

- foco em testes e cobertura
- skills: project-architecture, typescript-strict

#### quality.md

- foco em qualidade e performance
- skills: react-native-patterns

#### design-docs.md

- foco em documentação e UX writing
- skills: ux-standards, translations, sdd-creation

#### pr-lifecycle.md

- foco em fluxo de PR
- skills: pr-workflow
- regra explícita: nunca faz merge autonomamente

#### security-analyst.md

- foco em OWASP Mobile / AppSec
- skills: owasp-security

### 2.5 Criar agent-memory/

Para cada agente:

- criar directório próprio
- adicionar README.md com uma frase clara sobre o tipo de memória acumulada

### Critérios de aceite da Fase 2

- .claude/ existe e está completa
- CLAUDE.md respeita o limite de tamanho
- agentes estão curtos e sem boilerplate excessivo
- skills estão separadas por domínio e prontas para lazy-loading
- rules são específicas por path

---

## Fase 3. Relocalizar scripts e alinhar CI

### Objectivo

Separar configuração AI de tooling operacional e preparar geração automática de documentação.

### Tarefas

1. Mover generate-dashboard.sh para .github/scripts/.
2. Mover generate-analytics.sh para .github/scripts/.
3. Criar generate-ai-system.sh em .github/scripts/.
4. Actualizar dashboard-merge.yml.
5. Actualizar dashboard-pr.yml se houver referência aos paths antigos.

### Requisitos de generate-ai-system.sh

O script deverá:

- ler metadados de .claude/agents/
- ler metadados de .claude/skills/
- ler regras de .claude/rules/
- produzir docs/ai-system.html
- expor arquitectura, catálogo, mapa de rules e estado de memória

### Critérios de aceite

- nenhum workflow aponta para scripts obsoletos
- a geração de ai-system.html é reprodutível
- scripts de docs vivem apenas em .github/scripts/

---

## Fase 4. Actualizar GitHub Pages

### Objectivo

Publicar a nova arquitectura como interface pública e referência interna.

### 4.1 docs/index.html

Nova landing page com:

- descrição do FUSE
- quick navigation para páginas principais
- versão actual do sistema AI
- timestamp do último deploy

### 4.2 docs/ai-system.html

Página gerada automaticamente com:

- diagrama conceptual Skills-First
- tabela de agentes com modelo, tools e skills
- catálogo de skills
- mapa de rules
- estado de memória por agente
- timeline de migração v1 -> v2 -> v3

### 4.3 docs/demonstration-orchestration.html

Actualizar:

- referências a .ai/
- referências a paths de agentes
- descrição da arquitectura activa
- badge/versionamento e notas de rodapé

### 4.4 docs/analytics.html

Actualizar:

- narrativa arquitectural
- badge de versão
- manter analytics históricos inalterados

### 4.5 Workflow de Pages

Actualizar dashboard-merge.yml para:

- gerar ai-system.html
- garantir presença de docs/index.html
- publicar as quatro páginas como artefacto final

### Critérios de aceite

- a raiz do GitHub Pages resolve para index.html
- todas as páginas referem .claude/ como sistema activo
- a documentação pública fica consistente com a implementação real

---

## 9. Mapeamento de Origem para Destino

| Origem .ai/                        | Destino .claude/                                                         | Observação                                    |
| ---------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| system.md                          | CLAUDE.md                                                                | reduzido para papel de entrypoint             |
| architect.md                       | skills/sdd-creation, skills/coupling-analysis, agents/architect.md       | separar conhecimento de execução              |
| engineer.md                        | skills/react-native-patterns, skills/api-integration, agents/engineer.md | workflow move para skill + agente curto       |
| reviewer.md                        | agents/reviewer.md + skills de qualidade                                 | memória por projecto                          |
| test-writer.md                     | agents/test-writer.md + skills técnicas                                  | foco em cobertura                             |
| quality.md                         | agents/quality.md                                                        | sem concentração excessiva                    |
| design-docs.md                     | agents/design-docs.md + ux-standards                                     | docs e UX                                     |
| pr-lifecycle.md                    | skills/pr-workflow + agents/pr-lifecycle.md                              | activação determinística                      |
| 00-orchestrator-agent.md + SA1-SA7 | skills/owasp-security + agents/security-analyst.md                       | consolidação sem inflacionar lista de agentes |
| skills actuais em .ai/skills/      | skills directory-based                                                   | conversão para open standard                  |
| rules em .ai/rules/                | .claude/rules/                                                           | activação por path                            |

---

## 10. Requisitos Não Funcionais

### 10.1 Manutenibilidade

- cada skill deve ser focada e pequena
- conteúdo longo deve ir para references/
- evitar duplicação entre skill, rule e agent

### 10.2 Performance de contexto

- CLAUDE.md deve conter apenas o essencial
- rules só devem carregar com base em paths
- skills devem ser invocáveis sem despejar conteúdo total no contexto base

### 10.3 Portabilidade

- estrutura compatível com convenção .claude/
- organização dos assets e metadata pensada para reaproveitamento

### 10.4 Auditabilidade

- toda a migração deve ser rastreável por ficheiro
- páginas públicas devem documentar a versão viva do sistema

---

## 11. Riscos e Mitigações

### Risco 1. Migração parcial gerar dois sistemas activos

Mitigação:

- marcar .ai/ como arquivo logo na Fase 1
- apontar toda a navegação para .claude/

### Risco 2. Skills ficarem grandes demais e reproduzirem o problema antigo

Mitigação:

- impor corpo curto em SKILL.md
- deslocar conteúdo extenso para references/

### Risco 3. Workflows quebrarem por paths desactualizados

Mitigação:

- fase específica de relocation
- validação explícita dos YAMLs e scripts

### Risco 4. Docs públicas divergirem do sistema real

Mitigação:

- geração automática de ai-system.html
- actualizar narrativa manual apenas onde necessário

### Risco 5. Ambiguidade na activação das skills

Mitigação:

- descrições claras e orientadas a disparo
- separar skills com overlap excessivo

---

## 12. Estratégia de Rollout

### Ordem recomendada

1. Arquivar .ai/
2. Criar .claude/CLAUDE.md
3. Criar rules/
4. Migrar skills
5. Criar agentes
6. Criar memória por agente
7. Relocalizar scripts
8. Actualizar workflows
9. Gerar e actualizar páginas públicas
10. Validar localmente e em CI

### Estratégia de entrega

- preferencialmente em PR único grande se o objectivo for consistência atómica
- alternativamente em 3 PRs sequenciais:
  - PR 1: archive + .claude/
  - PR 2: scripts + workflows
  - PR 3: docs/pages

Se houver divisão em múltiplos PRs, .ai/ deve ser marcado como arquivo no primeiro PR para evitar ambiguidade.

---

## 13. Estratégia de Rollback

Rollback não implica apagar .claude/. Em caso de falha:

- reverter apenas os workflows e docs afectados
- manter .ai/ intacto como fallback documental
- manter .claude/ como branch de trabalho até estabilização

Como .ai/ não é removido, o rollback operacional da documentação é simples e de baixo risco.

---

## 14. Plano de Verificação

### Verificação estrutural

- abrir .claude/CLAUDE.md e confirmar tamanho e conteúdo mínimo
- correr wc -l .claude/agents/\*.md
- validar presença de SKILL.md e evals/evals.json em cada skill
- validar existência dos directórios em .claude/agent-memory/

### Verificação de integração

- confirmar que workflows referenciam .github/scripts/...
- gerar docs/ai-system.html
- abrir docs/index.html localmente
- validar links entre as quatro páginas

### Verificação de publicação

- confirmar sucesso do workflow dashboard-merge.yml
- validar GitHub Pages após merge
- confirmar root público:
  - https://eugenioduarte.github.io/FUSE/

---

## 15. Checklist de Produção

- [ ] .ai/ marcado como arquivo em todos os pontos de entrada relevantes
- [ ] .claude/CLAUDE.md criado e revisto
- [ ] 6 rules criadas
- [ ] 11 skills criadas com estrutura mínima completa
- [ ] 8 agentes criados
- [ ] memória por agente preparada
- [ ] scripts movidos para .github/scripts/
- [ ] generate-ai-system.sh criado
- [ ] workflows actualizados
- [ ] docs/index.html criado
- [ ] docs/ai-system.html gerado
- [ ] demonstration-orchestration.html actualizado
- [ ] analytics.html actualizado
- [ ] validações locais executadas
- [ ] validação pós-merge em GitHub Pages concluída

---

## 16. Resultado Esperado

Ao concluir esta migração, o FUSE passa a ter um sistema AI:

- mais leve
- mais modular
- mais explícito
- mais compatível com tooling moderno
- mais fácil de documentar e evoluir

O ganho principal não é apenas reorganização de ficheiros. É a transformação de um sistema centrado num orquestrador monolítico para um sistema centrado em **skills reutilizáveis, regras contextuais e agentes de execução mínimos**, com documentação pública coerente e automação alinhada à arquitectura viva.

Sim — corresponde bastante, mas ainda não corresponde totalmente ao modelo mais “skill-heavy” possível.

A forma mais honesta de dizer é:

a tua migração já sai claramente de um agent monolítico e entra num modelo skills-first

mas ainda mantém alguns agents que talvez devessem virar skills ou rules

O teu architect hoje é um bom exemplo do problema atual

Esse ficheiro mistura, ao mesmo tempo:

papel do agent
princípios globais
regras de arquitetura
checklists operacionais
modo de análise de acoplamento
comandos
orquestração de outros agents
quality gates

Ou seja, ele está a carregar demasiadas responsabilidades.

Isso confirma exatamente a tua tese de migração:

hoje tens agents largos
queres passar para agents finos + skills + rules

Então, nesse sentido, sim, a migração está coerente com o problema real.

Onde a tua proposta já está muito bem alinhada

No teu plano, o conteúdo do architect atual seria repartido mais ou menos assim:

Vai para CLAUDE.md
identidade do projeto
invariantes globais
contrato arquitetural
routing alto nível
Vai para rules/
screens.md → regras de screen
services.md → fronteiras service/query/DTO
hooks.md → contratos de hooks
typescript.md → strict typing, Zod, etc.
tests.md → gates e thresholds
git.md → fluxo de branches, commits, merge
Vai para skills/
sdd-creation/ → criação de SDDs
coupling-analysis/ → análise de acoplamento
project-architecture/ → princípios estruturais
api-integration/ → checklist e flow de integração
Fica no agents/architect.md
papel
quando usar
que skills invocar
que tipo de decisão toma
limites de atuação

Isso está muito certo.

O que isso significa na prática

O teu architect.md atual hoje funciona como:

agent + constitution + rules engine + playbook + diagnostic manual

Na arquitetura nova, ele devia funcionar como:

um dispatcher de raciocínio arquitetural que sabe quais skills chamar

Esse é exatamente o salto que o mercado está a fazer.

Onde eu acho que o teu plano ainda pode melhorar

O teu plano está coerente com a direção, mas ainda vejo 3 pontos a ajustar.

1. Ainda tens agents a mais

Os 8 agents são mais leves que antes, mas ainda podem estar um pouco fragmentados.

Os mais questionáveis para mim são:

quality.md
design-docs.md
pr-lifecycle.md

Esses três, dependendo do uso real, podem acabar por ser:

skill
rule
workflow
ou responsabilidade de outro agent
Exemplo

pr-lifecycle.md talvez não precise existir como agent se:

não decide quase nada
só aplica processo
só usa pr-workflow

Nesse caso, pode ser melhor como:

skill + rule
ou skill do reviewer 2. Algumas skills ainda parecem “temas”, não “unidades de execução”

Por exemplo:

clean-code/
project-architecture/
react-native-patterns/

Estas podem ficar demasiado amplas.

Uma skill boa tende a ser mais acionável.
Em vez de ser só “tema”, ela deve responder a algo como:

quando é chamada?
que problema resolve?
que saída produz?
que checklist executa?

Se não tiver trigger claro, a skill vira só documentação outra vez.

3. Falta-te um critério formal para decidir “agent ou skill”

Isso está implícito, mas eu escreveria explicitamente no SDD:

Criar agent apenas quando houver:
modelo diferente
tools diferentes
memória própria relevante
autonomia decisória real
fronteira operacional clara
Criar skill quando houver:
método recorrente
checklist
framework de análise
padrão de execução
transformação especializada de contexto

Isso ia deixar o teu desenho mais sólido.

Julgamento direto sobre o teu architect atual

Se eu pegasse só no ficheiro que mostraste, eu diria:

Hoje ele contém pelo menos estas peças separáveis:
agent role → continua como architect.md
architectural principles → project-architecture/ + rules/
integration design checklist → api-integration/
screen architecture rules → rules/screens.md
performance constraints → talvez react-native-patterns/ ou rules/screens.md
testability first → rules/tests.md + typescript-strict/
quality gates → CLAUDE.md ou rules/tests.md
coupling analysis mode → coupling-analysis/
analysis commands → skills/coupling-analysis/scripts/ ou references/
orchestration role → CLAUDE.md ou architect.md

Isto mostra que a tua migração não é só cosmética.
Ela de facto resolve um problema estrutural real.

Então a resposta curta é:
Sim, corresponde.

Porque a tua proposta:

reduz concentração no agent
move conhecimento para skills
move regras para rules
mantém o agent como contexto de decisão
Mas ainda não está no ponto mais “puro” do modelo.

Porque:

ainda tens alguns agents discutíveis
algumas skills ainda parecem demasiado genéricas
falta um critério explícito de corte entre agent/rule/skill
A minha recomendação final

Eu manteria a migração, mas ajustaria isto antes de executar:

rever se quality, design-docs e pr-lifecycle são mesmo agents
tornar as skills mais acionáveis e menos temáticas
adicionar uma secção no SDD com:
“quando criar um agent”
“quando criar uma skill”
“quando criar uma rule”

Se quiseres, eu posso pegar no teu architect.md atual e transformá-lo num exemplo concreto de decomposição para:

architect.md
rules/
skills/
CLAUDE.md
