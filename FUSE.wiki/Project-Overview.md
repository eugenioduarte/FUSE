# Visão Geral do Projeto Fuse

Este documento oferece um resumo de alto nível do projeto Fuse, sua arquitetura, principais pastas, dependências e comandos úteis para desenvolvimento e testes. O objetivo é ajudar novos contribuidores a entender rapidamente a estrutura do repositório e como executar o app localmente.

## Objetivo

Fuse é um aplicativo multiplataforma (mobile e web) baseado em React Native e Expo. Ele fornece funcionalidades relacionadas a desafios, calendários, perfil de usuário e sincronização com backend (Firebase é utilizado como dependência). O projeto segue boas práticas de organização em camadas e utiliza TypeScript em grande parte do código.

## Tecnologias principais

- React Native (0.81.x)
- Expo (~54)
- TypeScript
- Firebase
- React Navigation
- Zustand (state management)
- Zod (validação)
- React Query (`@tanstack/react-query`)
- Jest + Testing Library (testes)

## Estrutura de pastas (visão rápida)

- `apps/mobile/` — Entradas específicas do app mobile (quando existente).
- `src/` — Código-fonte principal do projeto.
  - `components/` — Componentes reutilizáveis (botões, headers, UI).
  - `screens/` — Telas agrupadas por rota/feature.
  - `services/` — Integrações com APIs, Firebase e repositories.
  - `store/` — Stores e hooks de estado (Zustand, hooks personalizados).
  - `navigation/` — Configuração de navegação e rotas.
  - `assets/` — Ícones, imagens e fontes.
- `Fuse.wiki/` — Documentação e guias do projeto.
- `ios/`, `android/` — Pastas nativas geradas/necessárias para builds nativos.

## Principais scripts (em `package.json`)

- `yarn start` — Inicia o Metro / Expo Dev Tools.
- `yarn start:clean` — Inicia o Expo limpando cache.
- `yarn ios` / `yarn android` — Abre o app no simulador/dispositivo via Expo.
- `yarn web` — Executa versão web.
- `yarn test` — Executa testes com Jest.
- `yarn test:coverage` — Executa testes e gera cobertura.
- `yarn lint` / `yarn lint:fix` — Roda ESLint (e tenta corrigir).
- `yarn format` / `yarn format:check` — Formatação com Prettier.
- `yarn e2e` — Executa testes E2E via Maestro (se configurado).
- `yarn reset-project` — Script custom de reset do projeto (`scripts/reset-project.js`).

## Requisitos e configuração inicial

- Node.js (versão compatível com as dependências; use nvm para gerenciar versões).
- Yarn (recomendado) ou npm.
- Expo CLI (opcional globalmente) — muitas vezes `yarn start` aciona o Expo localmente.
- Para iOS: Xcode e CocoaPods (instalar pods se abrir projeto nativo).
- Variáveis de ambiente: revisar `apps/` e `src/services` para chaves (Firebase, APIs). Use `.env` ou sistema de secrets conforme documentação interna.

Exemplo de passos iniciais:

```bash
yarn install
yarn start
# Em outro terminal para iOS
yarn ios
```

## Testes e qualidade

- Testes unitários e de integração: `yarn test` (Jest + Testing Library).
- Cobertura: `yarn test:coverage`.
- Lint e formatação: `yarn lint` e `yarn format`.
- Hooks de commit: Husky + lint-staged estão configurados para garantir qualidade antes do commit.

## Fluxo de desenvolvimento recomendado

1. Crie uma branch por feature/bugfix com nome descritivo.
2. Rode `yarn lint` e `yarn test` localmente antes de abrir PR.
3. Adicione testes para novas features e atualize a documentação na wiki.

## Observações sobre builds e deploy

- O repositório inclui `eas.json` (EAS Build) para builds de produção com Expo Application Services; revise as configurações antes de rodar `eas build`.
- Para mudanças nativas (iOS/Android), abra a pasta `ios/`/`android/` e siga os passos nativos padrão (pods, build settings).

## Onde procurar mais informação

- Documentos da wiki neste repositório: ver a pasta Fuse.wiki para guias específicos.
- Arquivos de configuração: `package.json`, `eas.json`, `app.config.js`.
- Código: comece por `src/navigation/` e `src/screens/` para entender o fluxo do app.

## Próximos passos sugeridos

- Adicionar um diagrama de arquitetura simples (fluxo: UI → store → services → Firebase).
- Mapear endpoints e contratos usados pelos serviços (API spec).
- Criar guias de contribuição (branching, PR template, release notes) caso não existam.

---

Se quiser, eu posso:

- Comitar este arquivo e abrir um PR (se desejar que eu faça commit localmente).
- Traduzir para inglês.
- Expandir seções (setup de CI, E2E, diagramas).
