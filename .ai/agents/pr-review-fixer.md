# Agent: pr-review-fixer

**Status:** TODO — implementar após Sonar e outros quality gates estarem no pipeline de CI

---

## Objetivo

Agente que, após abrir um PR, vai buscar automaticamente todos os comentários de revisão (Sonar, linters de CI, code reviewers), corrige os problemas identificados e faz push das correcções para a mesma branch.

---

## Fluxo esperado

1. Recebe o número do PR como argumento (ex: `/fix-pr 42`)
2. Obtém todos os comentários do PR via `gh pr view <number> --comments`
3. Obtém o estado dos checks de CI via `gh pr checks <number>` (Sonar Quality Gate, ESLint CI, etc.)
4. Para cada problema identificado:
   - Lê o ficheiro afectado
   - Aplica a correcção (lint, smell, code review feedback)
   - Corre os testes localmente para garantir que não quebrou nada
5. Cria um commit com as correcções e faz push para a branch do PR
6. Adiciona um comentário no PR indicando o que foi corrigido

---

## Trigger

- **Manual:** `/fix-pr <number>` — invoca o agente numa conversa Claude Code
- **Automático (futuro):** hook `PostToolUse` após `gh pr create` que dispara o agente em background

---

## Dependências necessárias

- `gh` CLI autenticado com permissões de leitura/escrita no repo
- Sonar configurado no pipeline (webhook ou API key para ler os issues)
- O agente deve ter acesso às ferramentas: `Bash`, `Read`, `Edit`, `Grep`, `Glob`

---

## Notas de implementação

- Usar `gh api repos/{owner}/{repo}/pulls/{number}/comments` para comentários inline (anotações em linhas específicas)
- Para issues do Sonar: usar a SonarQube/SonarCloud API para listar issues por branch
- O agente deve fazer `pnpm typecheck && pnpm lint && pnpm test` antes de fazer push
- Se os testes falharem após as correcções, o agente deve reportar e não fazer push

---

## Referências

- `gh pr view --help`
- `gh pr checks --help`
- SonarCloud API: `https://sonarcloud.io/web_api`
