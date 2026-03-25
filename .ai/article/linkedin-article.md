# Construindo um Sistema Multi-Agente com IA para Desenvolvimento React Native

<img src="./images/hive.png" alt="O System Orchestrator – Guardião das Regras Antigas" width="100%" height="200" style="object-fit: cover;" />

Há alguns meses decidi parar de usar o Claude apenas como assistente genérico e transformá-lo em parte de um **sistema de engenharia estruturado**.

Criei uma pasta `.ai/` que hoje contém cerca de 80 arquivos: um orquestrador central (`system.md`), agentes especializados, regras obrigatórias, skills reutilizáveis, templates, scripts e um arquivo de aprendizado contínuo (`claude-self-modifying.md`).

Não é um framework revolucionário.  
É simplesmente o que funcionou para mim para reduzir tarefas repetitivas e manter consistência arquitetural sem perder qualidade.

<img src="./images/mox.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="200" style="object-fit: cover;" />

### O Coração do Sistema: System Orchestrator

O arquivo `system.md` é lido primeiro pelo LLM. Ele define:

- “Você não é um assistente genérico. Você é o **System Orchestrator**.”
- Contexto completo do projeto (React Native + Expo)
- Arquitetura obrigatória: **Model → Service → Query → Hook → Screen**
- Todas as regras não negociáveis
- Matriz de roteamento (tipo de pedido → agente responsável)

A partir daí, cada solicitação é analisada e delegada.

### Agentes Especializados

- **architect**: Cria SDDs, decisões arquiteturais e análise de acoplamento
- **engineer**: Implementa código — screens, hooks, lógica de negócio
- **test-writer**: Gera testes unitários e flows Maestro E2E
- **reviewer**: Executa quality gate e resolve review comments
- **quality**: Analisa performance, FPS, JS thread e corrige issues Sonar
- **design-docs**: UI polish, README auto-update, business → SDD
- **pr-lifecycle**: Gerencia o ciclo completo de Pull Request

### Router Inteligente (Local vs Remote)

Para controlar custos, implementei um router simples:

- **70% das tarefas** → Ollama (qwen2.5-coder:14b) – boilerplate, testes, templates, E2E
- Tarefas complexas (arquitetura, revisão, performance, refatorações profundas) → Claude Sonnet

Resultado real (março 2026): redução de aproximadamente **65-70%** no custo de tokens.

### Regras Obrigatórias (Mandatory Rules)

O que mais impactou não foram os agentes em si, mas as regras que ninguém pode violar:

- TypeScript estrito (zero `any` implícito)
- `useState` sempre tipado explicitamente
- Nunca colocar lógica de negócio em `.screen.tsx`
- Listas dinâmicas sempre com `FlatList` ou `FlashList`
- Estilos apenas via tokens do theme + `StyleSheet.create`
- Coverage mínimo de 80% global / 90% em hooks
- Conventional Commits obrigatório
- Nunca auto-commit ou auto-push

O `reviewer` rejeita automaticamente qualquer violação.

<img src="./images/wall.png" alt="Code Reviewer – O guardião que não aceita violações" width="100%" height="200" style="object-fit: cover;" />

### Memória Permanente: claude-self-modifying.md

Criei um arquivo vivo de aprendizado. Toda decisão importante ou anti-pattern descoberto vira uma regra permanente.

Exemplo real:

```markdown
## Loading Global – Nunca mais manual

**Regra:** Proibido chamar overlayActions.open('loading') diretamente.  
**Motivo:** Criamos GlobalLoadingObserver baseado em useIsFetching + useIsMutating.  
**Aplica-se a:** Todos os hooks de query.
```

```

Isso eliminou grande parte das regressões do mesmo tipo.

<img src="./images/self-modifying.jpg" alt="Self-Modifying – O grimório que aprende com cada erro" width="100%" height="200" style="object-fit: cover;" />

### Fluxo Real de uma Feature

1. Solicito a feature
2. System roteia para o architect (se necessário)
3. Architect gera SDD
4. Engineer implementa (maioria local)
5. Test-writer gera testes
6. Code-reviewer valida tudo
7. Eu faço revisão rápida do diff e confirmo commit
8. (Opcional) Aciono pr-lifecycle

O tempo médio por feature diminuiu significativamente e, o mais importante, o código ficou muito mais consistente.

### O Que Melhorou

- Consistência arquitetural próxima de 100%
- Cobertura de testes subiu de ~60% para 92–95%
- Redução drástica de bugs por quebra de contrato
- Menos tempo gasto em correções repetitivas
- Decisões arquiteturais documentadas e versionadas

### O Que Ainda Limita

- Ainda reviso diffs manualmente (principalmente decisões de UX e trade-offs de produto)
- Contexto muito grande pode fazer o modelo “esquecer” regras antigas
- Criação e manutenção de novos agentes ainda é manual
- Análise de performance real em device físico continua exigindo trabalho manual

<img src="./images/scroll.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="200" style="object-fit: cover;" />

### Lições Aprendidas

1. Especialização vence generalização
2. Regras obrigatórias geram mais liberdade que bons prompts
3. Modelos locais resolvem a maior parte do volume quando separamos o mecânico
4. Memória persistente é mais valiosa que prompt engineering
5. Automação não substitui julgamento humano — ela apenas o amplifica

Se você também está experimentando setups agentic em React Native + Expo + Claude Code (ou Ollama), me conta:

- Como você organiza a sua pasta `.ai/`?
- Qual tem sido o maior gargalo até agora?
- Quantos agentes você considera gerenciável antes de virar bagunça?

Abraço e boa construção.

<img src="./images/lotus.png" alt="Frontend Architect – Definindo a estrutura antes do código" width="100%" height="200" style="object-fit: cover;" />

#ReactNative #Expo #TypeScript #AI #SoftwareEngineering

```
