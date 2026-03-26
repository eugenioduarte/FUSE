.github/workflows/build.yml
name: Build Android and iOS

on:
workflow_dispatch:
inputs:
version:
description: "Version of the app"
required: true
type: string
release_notes:
description: "Release notes for testers"
required: true
type: string

jobs:
setup:
runs-on: ubuntu-latest
outputs:
deploy-env: ${{ steps.setup.outputs.deploy-env }}
name: "Setup"
steps: - name: "Check branch and set env variable"
id: setup
uses: GitHub-EDP/ccdevops-shared-utils-actions/.github/actions/setup@v1.1.0

sonarqube:
needs: [setup]
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/sonarqube.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
secrets: inherit

remote_config_analysis:
needs: [setup, sonarqube]
if: ${{ needs.setup.outputs.deploy-env == 'prd' }}
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/remote_config_analysis.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
secrets:
MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}
PRD_FB_SA: ${{ secrets.PRD_FB_SA }}
PRE_FB_SA: ${{ secrets.PRE_FB_SA }}

build_android:
needs: [setup, sonarqube]
if: ${{ needs.setup.outputs.deploy-env == 'pre' || needs.setup.outputs.deploy-env == 'prd' }}
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/build_android.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
with:
VERSION: ${{ inputs.version }}
BUNDLE: ${{ needs.setup.outputs.deploy-env == 'prd' }}
RELEASE_NOTES: ${{ inputs.release_notes }}
secrets:
MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}
ANDROID_FIREBASE_CONFIG: ${{ secrets.ANDROID_FIREBASE_CONFIG }}
MAPBOX_DL_TOKEN: ${{ secrets.MAPBOX_DL_TOKEN }}
ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
ANDROID_KEYSTORE_PASS: ${{ secrets.ANDROID_KEYSTORE_PASS }}
ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
ANDROID_KEY_PASS: ${{ secrets.ANDROID_KEY_PASS }}
ANDROID_FIREBASE_APP_ID: ${{ secrets.ANDROID_FIREBASE_APP_ID }}
FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
FASTLANE_API_KEY_JSON_ANDROID: ${{ secrets.FASTLANE_API_KEY_JSON_ANDROID }}
KOBITON_TOKEN: ${{ secrets.KOBITON_TOKEN }}

build_ios:
needs: [setup, sonarqube]
if: ${{ (needs.setup.outputs.deploy-env == 'pre' || needs.setup.outputs.deploy-env == 'prd') }}
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/build_ios.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
with:
VERSION: ${{ inputs.version }}
RELEASE_NOTES: ${{ inputs.release_notes }}
secrets:
MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}
IOS_BUILD_CERTIFICATE_BASE64: ${{ secrets.IOS_BUILD_CERTIFICATE_BASE64 }}
IOS_P12_PASSWORD: ${{ secrets.IOS_P12_PASSWORD }}
IOS_PROVISION_PROFILES_BASE64: ${{ secrets.IOS_PROVISION_PROFILES_BASE64 }}
IOS_FIREBASE_CONFIG: ${{ secrets.IOS_FIREBASE_CONFIG }}
MAPBOX_DL_TOKEN: ${{ secrets.MAPBOX_DL_TOKEN }}
FASTLANE_API_KEY_JSON: ${{ secrets.FASTLANE_API_KEY_JSON }}
KOBITON_TOKEN: ${{ secrets.KOBITON_TOKEN }}

build_web:
needs: [setup, sonarqube]
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/build_web.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
with:
VERSION: ${{ inputs.version }}
secrets:
MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}
GAE_AUTH_JSON: ${{ secrets.GAE_AUTH_JSON }}

e2e_tests:
needs: [build_ios, build_android]
if: ${{ needs.setup.outputs.deploy-env == 'pre' }}
uses: GitHub-EDP/ol-mob-tests/.github/workflows/tests_e2e.yml@main
secrets: inherit

.github/workflows/expo_install.yml
name: Expo Install

on:
workflow_dispatch:
schedule: - cron: '0 4 \* \* 1' # sheduled at 04:00 on Monday.

jobs:
workflow_testing:
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/expo_install.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
secrets:
DEPS_TOKEN: ${{ secrets.DEPS_TOKEN }}
MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}

.github/workflows/test.yml
name: Workflow testing

on:
workflow_dispatch:

jobs:
workflow_testing:
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/test.yml@main
secrets: inherit

.github/workflows/tests_e2e.yml
name: Workflow testing

on:
workflow_dispatch:

jobs:
workflow_testing:
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/test.yml@main
secrets: inherit

.github/workflows/tests_e2e.yml
name: Kobiton Regression Tests

on:
workflow_dispatch:

jobs:
e2e_tests:
uses: GitHub-EDP/ol-mob-tests/.github/workflows/tests_e2e.yml@main
secrets: inherit

.github/workflows/tests_unit.yml
name: Quality Checks

on:
workflow_dispatch:
pull_request:
push:
branches: - main

jobs:
sonarqube:
if: ${{ !startsWith(github.head_ref, 'dependabot/') }}
uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/sonarqube.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
secrets: inherit

.github/CODEOWNERS

- @EX151385_edp @EX150591_edp @EX150592_edp @EX146644_edp @EX159065_edp @E347609_edp @EX156619_edp @EX156070_edp

primeiro abaixo cria um mini curso explicando tudo que esta sendo usado acima e pq

---

# Mini Curso: GitHub Actions & Workflows para Apps Mobile

> Baseado nos workflows reais do projeto FUSE.
> Nível: Intermediário | Duração estimada: ~2h de leitura + prática

---

## Módulo 1 — O que é GitHub Actions?

GitHub Actions é a plataforma de CI/CD nativa do GitHub. Com ela você define **workflows** (fluxos automatizados) em arquivos `.yml` dentro de `.github/workflows/`.

Cada vez que um evento acontece no repositório (push, pull request, manual, agendado), o GitHub roda seu workflow em uma máquina virtual.

### Estrutura básica de um workflow

```yaml
name: Nome do Workflow # nome exibido na UI do GitHub

on: # GATILHO — quando esse workflow roda
  push:
    branches:
      - main

jobs: # TRABALHOS — unidades de execução paralela/sequencial
  meu-job:
    runs-on: ubuntu-latest # qual máquina virtual usar
    steps: # PASSOS — comandos executados em sequência
      - name: Meu passo
        run: echo "Hello World"
```

---

## Módulo 2 — Gatilhos (`on:`)

Define **quando** o workflow é disparado. O projeto usa três tipos:

### 2.1 `workflow_dispatch` — Disparo manual

```yaml
on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version of the app'
        required: true
        type: string
      release_notes:
        description: 'Release notes for testers'
        required: true
        type: string
```

**Por quê?**  
O build de Android/iOS é disparado **manualmente** pelo time — não a cada commit. Isso evita builds desnecessários e dá controle total sobre versão e release notes.  
Os `inputs` aparecem como campos de formulário na UI do GitHub Actions antes de rodar.

---

### 2.2 `schedule` — Agendamento com Cron

```yaml
on:
  schedule:
    - cron: '0 4 * * 1' # toda segunda-feira às 04:00 UTC
```

**Por quê?**  
O workflow `expo_install.yml` roda toda semana automaticamente para checar se há atualizações de dependências Expo disponíveis — sem precisar que alguém lembre de fazer isso.

#### Sintaxe cron resumida

```
┌─── minuto (0-59)
│  ┌─── hora (0-23)
│  │  ┌─── dia do mês (1-31)
│  │  │  ┌─── mês (1-12)
│  │  │  │  ┌─── dia da semana (0=dom, 1=seg ... 6=sáb)
│  │  │  │  │
0  4  *  *  1
```

---

### 2.3 `pull_request` e `push`

```yaml
on:
  pull_request:
  push:
    branches:
      - main
```

**Por quê?**  
O `tests_unit.yml` (Quality Checks) roda em todo PR aberto e em todo push na `main`. Garante que nenhum código quebrado entre na branch principal.

---

## Módulo 3 — Jobs

Um **job** é um conjunto de steps que roda em uma máquina virtual própria. Por padrão, jobs rodam **em paralelo**.

### 3.1 `needs:` — Dependência entre jobs

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    # ...

  sonarqube:
    needs: [setup] # só roda DEPOIS que setup terminar
    # ...

  build_android:
    needs: [setup, sonarqube] # espera AMBOS terminarem
    # ...
```

**Por quê?**  
Garante ordem de execução. Não faz sentido construir o app sem antes validar a qualidade do código (sonarqube). E o `setup` define variáveis que todos os outros precisam.

### Diagrama de dependências do build.yml

```
workflow_dispatch
       │
    [setup]
       │
  [sonarqube]
    /    \    \
[build_  [build_ [build_
android]  ios]    web]
    \    /
  [e2e_tests]
       │
  [remote_config]  ← só em prd
```

---

### 3.2 `if:` — Execução condicional

```yaml
build_android:
  needs: [setup, sonarqube]
  if: ${{ needs.setup.outputs.deploy-env == 'pre' || needs.setup.outputs.deploy-env == 'prd' }}
```

```yaml
remote_config_analysis:
  needs: [setup, sonarqube]
  if: ${{ needs.setup.outputs.deploy-env == 'prd' }}
```

```yaml
e2e_tests:
  needs: [build_ios, build_android]
  if: ${{ needs.setup.outputs.deploy-env == 'pre' }}
```

**Por quê?**

- Build Android/iOS só acontece em ambientes `pre` (pré-produção) e `prd` (produção) — environments de desenvolvimento não precisam de build nativo pesado.
- `remote_config_analysis` analisa configurações críticas — só relevante em produção.
- Testes E2E rodam em `pre` para validar antes de promover para `prd`.

---

### 3.3 `outputs:` — Passando dados entre jobs

```yaml
jobs:
  setup:
    outputs:
      deploy-env: ${{ steps.setup.outputs.deploy-env }} # exporta o valor
    steps:
      - name: 'Check branch and set env variable'
        id: setup
        uses: ...

  sonarqube:
    needs: [setup]
    # consome: ${{ needs.setup.outputs.deploy-env }}
```

**Por quê?**  
O job `setup` descobre em qual ambiente estamos (dev/pre/prd) com base na branch atual. Esse valor é compartilhado com todos os outros jobs via `outputs`, evitando código duplicado.

---

## Módulo 4 — Reusable Workflows (`uses:`)

Em vez de copiar e colar centenas de linhas de YAML entre repositórios, o projeto usa **workflows reutilizáveis** hospedados em repositórios centrais.

```yaml
jobs:
  sonarqube:
    needs: [setup]
    uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/sonarqube.yml@012cf1ecce6311bf2c163bc0e4aff24116454443
    secrets: inherit
```

### Anatomia da referência

```
GitHub-EDP/ol-mob-pipelines   → organização/repositório que hospeda o workflow
.github/workflows/sonarqube.yml  → caminho do arquivo dentro desse repo
@012cf1ecce6311bf2c163bc0e4aff24116454443  → commit SHA exato (pin de versão)
```

**Por quê usar SHA em vez de tag/branch?**  
Usar SHA garante **imutabilidade** — o workflow nunca muda por baixo dos panos. Se a equipe de plataforma atualizar o pipeline, o projeto não é afetado até que o time decida atualizar o SHA explicitamente. É uma prática de segurança da cadeia de suprimentos (supply chain security).

### `with:` — Passando parâmetros para o workflow

```yaml
build_android:
  uses: GitHub-EDP/ol-mob-pipelines/.github/workflows/build_android.yml@...
  with:
    VERSION: ${{ inputs.version }} # versão digitada no dispatch
    BUNDLE: ${{ needs.setup.outputs.deploy-env == 'prd' }} # true só em prd
    RELEASE_NOTES: ${{ inputs.release_notes }}
```

**Por quê `BUNDLE` só em prd?**  
Um **bundle** (AAB para Android, IPA para iOS) é o artefato final enviado às lojas. Em `pre` gera-se apenas um APK/IPA de teste direto — processo mais rápido. Em `prd` gera o bundle otimizado para as stores.

---

## Módulo 5 — Secrets

Secrets são variáveis sensíveis (tokens, senhas, chaves) armazenadas de forma segura no GitHub e nunca expostas em logs.

```yaml
secrets:
  MOBPT_MAPSDK_TOKEN: ${{ secrets.MOBPT_MAPSDK_TOKEN }}
  ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
  ANDROID_KEYSTORE_PASS: ${{ secrets.ANDROID_KEYSTORE_PASS }}
  ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
  ANDROID_KEY_PASS: ${{ secrets.ANDROID_KEY_PASS }}
```

### Secrets usados e o que são

| Secret                          | Para que serve                                                    |
| ------------------------------- | ----------------------------------------------------------------- |
| `MOBPT_MAPSDK_TOKEN`            | Token de acesso ao SDK de mapas (MapBox/similar)                  |
| `ANDROID_KEYSTORE_BASE64`       | Keystore do Android em Base64 — usada para assinar o APK/Bundle   |
| `ANDROID_KEYSTORE_PASS`         | Senha da keystore                                                 |
| `ANDROID_KEY_ALIAS`             | Alias da chave dentro da keystore                                 |
| `ANDROID_KEY_PASS`              | Senha da chave (pode diferir da keystore)                         |
| `ANDROID_FIREBASE_CONFIG`       | `google-services.json` em Base64                                  |
| `IOS_BUILD_CERTIFICATE_BASE64`  | Certificado de distribuição Apple (.p12) em Base64                |
| `IOS_P12_PASSWORD`              | Senha do certificado .p12                                         |
| `IOS_PROVISION_PROFILES_BASE64` | Perfis de provisionamento Apple                                   |
| `FASTLANE_API_KEY_JSON`         | Chave de API para o Fastlane publicar na App Store                |
| `FASTLANE_API_KEY_JSON_ANDROID` | Chave de serviço para publicar na Google Play                     |
| `KOBITON_TOKEN`                 | Token para a plataforma de testes em dispositivos reais Kobiton   |
| `FIREBASE_TOKEN`                | Token do Firebase para distribuição via Firebase App Distribution |
| `GAE_AUTH_JSON`                 | Credencial do Google App Engine (para o build web)                |
| `MAPBOX_DL_TOKEN`               | Token de download de artefatos do Mapbox                          |
| `DEPS_TOKEN`                    | Token para acessar pacotes privados de dependências               |

### `secrets: inherit`

```yaml
sonarqube:
  uses: ...
  secrets: inherit # repassa TODOS os secrets do repositório atual
```

**Por quê?**  
Em vez de listar cada secret individualmente, `inherit` repassa todos automaticamente para o workflow reutilizável. Usado quando o workflow precisa de muitos secrets e conveniência supera a necessidade de listar explicitamente.

---

## Módulo 6 — Jobs Específicos do Projeto

### 6.1 `setup`

```yaml
setup:
  runs-on: ubuntu-latest
  outputs:
    deploy-env: ${{ steps.setup.outputs.deploy-env }}
  steps:
    - name: 'Check branch and set env variable'
      id: setup
      uses: GitHub-EDP/ccdevops-shared-utils-actions/.github/actions/setup@v1.1.0
```

**O que faz:** Inspeciona a branch atual e determina o ambiente de deploy (`dev`, `pre`, `prd`). Esse valor orienta todas as decisões condicionais dos outros jobs.

---

### 6.2 `sonarqube`

Análise estática de código usando SonarQube. Verifica:

- Code smells
- Bugs potenciais
- Vulnerabilidades de segurança
- Cobertura de testes
- Duplicação de código

Roda em **todo build** e em **todo PR/push na main** (via `tests_unit.yml`). É o guardião de qualidade do projeto.

---

### 6.3 `remote_config_analysis`

Analisa as configurações do Firebase Remote Config antes de ir para produção. Valida que nenhuma configuração crítica foi acidentalmente alterada ou removida.

**Só roda em `prd`** — é a última verificação antes de o binário ser publicado nas lojas.

---

### 6.4 `build_android` e `build_ios`

Os jobs de build nativo. Executam:

1. Checkout do código
2. Setup do ambiente (Node, Java/Xcode)
3. Instalação de dependências
4. Download de certificados/keystores dos secrets
5. Build com Gradle (Android) ou Xcode (iOS)
6. Assinatura do binário
7. Upload para Firebase App Distribution (pre) ou lojas (prd) via Fastlane

---

### 6.5 `build_web`

Build da versão web do app (React Native Web/Expo Web) e deploy no Google App Engine.

---

### 6.6 `e2e_tests`

Testes end-to-end em dispositivos **reais** via plataforma **Kobiton**. Roda após os builds de Android e iOS em `pre`, executando fluxos completos do app como um usuário real faria.

---

## Módulo 7 — Outros Workflows

### 7.1 `expo_install.yml` — Manutenção semanal de dependências

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: '0 4 * * 1'
```

Verifica semanalmente se há atualizações de pacotes Expo disponíveis. Mantém o projeto alinhado com o SDK Expo sem esforço manual.

---

### 7.2 `tests_unit.yml` — Quality Checks em PRs

```yaml
on:
  workflow_dispatch:
  pull_request:
  push:
    branches:
      - main
jobs:
  sonarqube:
    if: ${{ !startsWith(github.head_ref, 'dependabot/') }}
```

**Por quê ignorar Dependabot?**  
PRs do Dependabot (bot de atualização automática de deps) são gerados automaticamente — rodar SonarQube neles seria desperdício de minutos de CI, pois não há código de produto sendo alterado.

---

## Módulo 8 — CODEOWNERS

```
.github/CODEOWNERS
* @EX151385_edp @EX150591_edp @EX150592_edp @EX146644_edp @EX159065_edp @E347609_edp @EX156619_edp @EX156070_edp
```

O arquivo `CODEOWNERS` define quem **automaticamente** é adicionado como revisor em qualquer Pull Request que afete aquele caminho.

- `*` → qualquer arquivo no repositório
- Todos os handles listados são adicionados como **required reviewers**

**Por quê?**  
Garante que nenhum código entre na main sem aprovação de pelo menos um membro do time core. É uma política de governança — não depende de ninguém lembrar de adicionar revisores manualmente.

---

## Módulo 9 — Fluxo Completo: Do Branch ao Binário

```
1. Developer abre PR
        │
        ▼
2. tests_unit.yml dispara automaticamente
   └─► SonarQube analisa o código
        │
        ▼
3. CODEOWNERS adicionados como revisores
        │
        ▼
4. PR aprovado + merge na main (ou branch de release)
        │
        ▼
5. Time acessa GitHub Actions → build.yml → Run workflow
   └─► Digita version e release_notes
        │
        ▼
6. setup → detecta ambiente (pre/prd)
        │
        ▼
7. sonarqube → análise final
        │
       ├────────────────────────┐
       ▼                        ▼
8. build_android           build_ios
   └─► Gradle build         └─► Xcode build
   └─► Assina APK/AAB        └─► Assina IPA
   └─► Upload Firebase/Store └─► Upload Firebase/Store
        │                        │
        └────────┬───────────────┘
                 ▼
9. e2e_tests (só em pre)
   └─► Kobiton — dispositivos reais
                 │
                 ▼
10. remote_config_analysis (só em prd)
    └─► Valida Firebase Remote Config
                 │
                 ▼
11. ✅ Binário publicado
```

---

## Resumo Conceitual

| Conceito                     | Para que serve no projeto                     |
| ---------------------------- | --------------------------------------------- |
| `workflow_dispatch` + inputs | Builds manuais com versão e notas controladas |
| `schedule` (cron)            | Manutenção semanal automática de deps         |
| `pull_request` + `push`      | Quality gate em todo PR e na main             |
| `needs:`                     | Garante ordem: setup → lint → build → test    |
| `if:`                        | Diferentes comportamentos por ambiente        |
| `outputs:`                   | Compartilha env (pre/prd) entre jobs          |
| `uses:` (reusable workflows) | Centralização de pipelines numa equipe grande |
| SHA pin em `uses:`           | Segurança e imutabilidade dos pipelines       |
| `secrets:`                   | Distribui credenciais sensíveis com segurança |
| `CODEOWNERS`                 | Revisão obrigatória automatizada              |
| SonarQube                    | Qualidade e segurança do código               |
| Fastlane                     | Automação de publicação nas stores            |
| Kobiton                      | Testes E2E em dispositivos físicos reais      |
| Firebase App Distribution    | Distribuição de builds de teste para QA       |


---

# Plano de Melhorias: CI/CD Enterprise Level — FUSE

> Objetivo: transformar o pipeline atual num sistema de entrega contínua de nível enterprise, aprendendo cada conceito na prática.
> Organizado em 3 fases por complexidade e impacto.

---

## Fase 1 — Fundação Sólida (Quick Wins)

*Impacto alto, esforço baixo. Implementar primeiro.*

---

### 1.1 Branch Protection Rules

**O que é:** Regras no GitHub que impedem push direto em branches protegidas, exigem PRs, revisões e status checks aprovados.

**Por que importa:**
Nenhuma empresa saudável permite que alguém dê `git push origin main` e destrua produção. As rules são a primeira linha de defesa.

**Configurar em `Settings > Branches > main`:**

```
☑ Require a pull request before merging
  ☑ Require approvals: 1 (mínimo)
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners
☑ Require status checks to pass before merging
  Status checks obrigatórios:
    - sonarqube (do tests_unit.yml)
    - unit-tests
    - lint
    - typecheck
☑ Require branches to be up to date before merging
☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings (nem admins)
```

---

### 1.2 PR Template

**O que é:** Template padrão que aparece automaticamente ao abrir um PR.

**Por que importa:**
PRs sem contexto são revisados superficialmente. O template força o autor a explicar o que mudou, como testar e qual o impacto.

**Criar:** `.github/pull_request_template.md`

---

### 1.3 Issue Templates

**Criar:**
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`

**Por que importa:**
Issues vagas geram trabalho dobrado. Templates estruturados aceleram triagem e estimativa.

---

### 1.4 Dependabot Configurado com Groups

**O que é:** Bot do GitHub que abre PRs automáticos para atualizações de deps e vulnerabilidades.

**Criar:** `.github/dependabot.yml` com `groups` para agrupar pacotes relacionados (ex: todos `@expo/*` num único PR em vez de 30 PRs separados).

**Por que `groups`?**
Sem grupos: 30 PRs por semana (1 por pacote). Com grupos: 1 PR para todos os pacotes Expo juntos.

---

### 1.5 Commitlint no CI

**Estado atual:** projeto já tem `commitlint.config.js` — mas não está sendo executado no CI.

**O que fazer:** adicionar job `commitlint` no `tests_unit.yml` usando `wagoid/commitlint-github-action@v6`.

**Por que é obrigatório no enterprise?**
Conventional Commits é o contrato que viabiliza CHANGELOG automático, semantic versioning e rastreabilidade entre commits e funcionalidades.

---

## Fase 2 — Qualidade e Segurança (Medium Term)

*Eleva o padrão de qualidade e segurança do pipeline.*

---

### 2.1 Semantic Versioning Automático + CHANGELOG

**Ferramenta:** `semantic-release` + `@semantic-release/changelog`

**Regra:**
- `fix:` — patch: `1.0.0 -> 1.0.1`
- `feat:` — minor: `1.0.0 -> 1.1.0`
- `feat!:` ou `BREAKING CHANGE:` — major: `1.0.0 -> 2.0.0`

**O que criar:**
- `.releaserc.json` — configuração do semantic-release
- `.github/workflows/release.yml` — roda no push para `main`, calcula versão, atualiza `CHANGELOG.md` e `package.json`, cria GitHub Release

**Por que `[skip ci]` na mensagem do release commit?**
O commit de release não deve disparar novo ciclo de CI — evita loop infinito.

---

### 2.2 Coverage Gate de Qualidade

**O que é:** CI falha se cobertura cair abaixo do threshold.

**Dois lugares para configurar:**
1. `jest.config.js` — `coverageThreshold` com 70% em branches/functions/lines/statements
2. `tests_unit.yml` — job `unit-tests` com `codecov/codecov-action@v4` e `minimum_coverage: 70`

---

### 2.3 CodeQL — Análise de Segurança Avançada

**O que é:** Análise semântica do código em busca de vulnerabilidades reais — muito mais profunda que linting ou SonarQube.

**Criar:** `.github/workflows/codeql.yml`
- Roda em push/PR para `main` e semanalmente (schedule)
- `queries: security-extended` — inclui segredos hardcoded, prototype pollution, injeções

---

### 2.4 Secret Scanning com Gitleaks

**O que é:** Detecta se alguém commitou token, senha ou chave privada.

**Duas camadas:**
1. GitHub nativo: ativar em `Settings > Security > Secret scanning`
2. CI ativo: `gitleaks/gitleaks-action@v2` no `tests_unit.yml`

---

### 2.5 Build Cache Otimizado

**Objetivo:** reduzir tempo de build de ~15min para ~5-7min.

**Três caches a adicionar nos workflows de build:**
- `node_modules` — key: hash do `yarn.lock`
- Gradle (`~/.gradle/caches`) — key: hash dos `*.gradle*`
- CocoaPods (`ios/Pods`) — key: hash do `Podfile.lock`

**Como funciona:** se o lockfile não mudou, o cache é restaurado em segundos. Se mudou, invalida e recria.

---

### 2.6 Lint + TypeCheck como Jobs Obrigatórios

**O que fazer:** adicionar dois jobs ao `tests_unit.yml`:
- `lint` — `yarn lint --max-warnings 0` (zero tolerância para warnings)
- `typecheck` — `yarn tsc --noEmit`

Ambos devem ser listados como status checks obrigatórios nas branch protection rules.

---

## Fase 3 — Enterprise Excellence (Long Term)

*Diferencial de time sênior. Observabilidade, confiabilidade e velocidade de entrega.*

---

### 3.1 GitHub Environments com Approval Gates

**O que é:** Ambientes formais no GitHub com aprovação manual obrigatória antes de deploy em produção.

**Configurar em `Settings > Environments`:**
- `production`: reviewers obrigatórios (tech lead + mobile lead), wait timer de 5 min, só permite deploy da `main`
- `pre-production`: sem revisores — auto-deploy

**No workflow:** `environment: production` no job de deploy faz o CI pausar e aguardar aprovação na UI do GitHub.

**Por que é enterprise?**
Deploy em produção sem aprovação humana é anti-pattern. O environment gate é auditável — log de quem aprovou, quando e qual SHA foi para produção.

---

### 3.2 DORA Metrics

As 4 métricas de elite DevOps (Google DevOps Research and Assessment):

| Métrica | O que mede | Meta Elite |
|---------|-----------|------------|
| Deployment Frequency | Com que frequência vai para prod | Múltiplas vezes/dia |
| Lead Time for Changes | Tempo commit até prod | menos de 1 hora |
| Change Failure Rate | % deploys que causam incidente | menos de 5% |
| Time to Restore Service | Tempo médio para recuperar de falha | menos de 1 hora |

**Ferramentas recomendadas:**
- LinearB: https://linearb.io
- Sleuth: https://www.sleuth.io

Ambas conectam ao GitHub automaticamente e calculam as 4 métricas sem configuração extra.

---

### 3.3 Slack Notifications Inteligentes

**Quando notificar (não tudo — só o que importa):**
- Build de produção publicado com sucesso
- Build falhou — com link direto para os logs e nome do autor
- Deploy aguardando aprovação — com link para o approval gate
- Vulnerabilidade crítica detectada pelo CodeQL

**Tool:** `slackapi/slack-github-action@v1` com `if: failure()` e `if: success()` separados.

---

### 3.4 Rollback Semi-Automatizado

**Estratégia:** se smoke tests falharem após deploy em produção, disparar automaticamente o workflow de build com a tag da versão anterior.

**Condição:**
```
if: failure() && needs.smoke_tests.result == 'failure'
```

O job ainda passa por `environment: production` — requer aprovação mesmo para rollback, garantindo auditabilidade.

---

### 3.5 PR Auto-Labeler + Size Labels

**Duas ferramentas:**
1. `actions/labeler@v5` com `.github/labeler.yml` — adiciona labels por categoria (feature/bugfix/infrastructure/tests) baseado nos arquivos alterados
2. `CodelyTV/pr-size-labeler@v1` — adiciona labels XS/S/M/L/XL baseado no número de linhas alteradas

**Por que importa:**
PRs grandes (+400 linhas) são revisados superficialmente. Labels de tamanho criam pressão cultural para PRs menores e mais focados.

---

### 3.6 Smoke Tests Pós-Deploy com Maestro

O projeto já tem `MAESTRO.md`. Usar Maestro Cloud para rodar subset mínimo de fluxos críticos logo após cada deploy em produção:
- Login
- Ação principal do app
- Navegação básica

Se qualquer smoke test falhar, dispara o rollback automatizado (3.4).

---

### 3.7 Deploy Freeze

**O que é:** Bloqueio automático de deploys em momentos de alto risco.

**Regras a implementar:**
- Sextas-feiras após 15h UTC — ninguém quer resolver incidente no fim de semana
- Período natalício (23-27 de dezembro) — equipe reduzida, risco alto

Implementado como job `check_freeze` usando `actions/github-script@v7` com lógica de data.

---

### 3.8 Composite Actions Próprias do FUSE

**O que é:** Encapsular steps repetitivos em actions compostas internas — como funções, mas para CI/CD.

**Problema atual:** os mesmos 5 steps (checkout + node + yarn install + cache) repetem em todo workflow.

**Solução:** criar `.github/actions/setup-node-env/action.yml` como action composta reutilizável internamente.

**Uso nos workflows:**
```yaml
steps:
  - uses: ./.github/actions/setup-node-env
```

---

## Roadmap de Implementação

```
SEMANA 1-2: Fase 1 — Fundação
  [ ] Branch protection rules no GitHub Settings
  [ ] .github/pull_request_template.md
  [ ] .github/ISSUE_TEMPLATE/bug_report.yml
  [ ] .github/ISSUE_TEMPLATE/feature_request.yml
  [ ] .github/dependabot.yml com groups configurados
  [ ] Commitlint como job obrigatório no tests_unit.yml

SEMANA 3-4: Fase 2 — Qualidade e Segurança
  [ ] .releaserc.json + workflow release.yml
  [ ] Coverage threshold no jest.config.js (70%)
  [ ] Coverage gate + Codecov no tests_unit.yml
  [ ] .github/workflows/codeql.yml
  [ ] Gitleaks no CI
  [ ] Build cache (node_modules + Gradle + CocoaPods)
  [ ] Lint e TypeCheck como jobs obrigatórios no PR

SEMANA 5-8: Fase 3 — Enterprise Excellence
  [ ] GitHub Environments: production + pre-production
  [ ] Approval gate no job de deploy prd
  [ ] Slack notifications (failure + deploy success)
  [ ] DORA metrics via LinearB ou Sleuth
  [ ] .github/labeler.yml + pr-size-labeler
  [ ] Smoke tests pos-deploy com Maestro Cloud
  [ ] Deploy freeze logic
  [ ] .github/actions/setup-node-env (composite action)
  [ ] .github/actions/notify-slack (composite action)
```

---

## Antes vs. Depois

| Dimensão | Estado Atual | Após Melhorias |
|----------|-------------|----------------|
| Proteção de branches | Parcial | Total — nenhum bypass possível |
| Versioning | Manual (input humano) | Automático via commits |
| CHANGELOG | Inexistente | Gerado automaticamente a cada release |
| Cobertura de testes | Medida mas sem gate | Gate: falha se abaixo de 70% |
| Segurança | SonarQube | SonarQube + CodeQL + Gitleaks |
| Deploy em prd | Automático após build | Requer aprovação humana explícita |
| Visibilidade | GitHub Actions UI | Slack + DORA metrics dashboard |
| Rollback | Manual | Semi-automático com smoke tests |
| Tempo de build | ~15min | ~5-7min (com cache) |
| PR quality | CODEOWNERS | CODEOWNERS + template + labels + commitlint |


---

# Plano de Melhorias: CI/CD Enterprise Level — FUSE

> Objetivo: transformar o pipeline atual num sistema de entrega contínua de nível enterprise, aprendendo cada conceito na prática.
> Organizado em 3 fases por complexidade e impacto.

---

## Fase 1 — Fundação Sólida (Quick Wins)

*Impacto alto, esforço baixo. Implementar primeiro.*

---

### 1.1 Branch Protection Rules

**O que é:** Regras no GitHub que impedem push direto em branches protegidas, exigem PRs, revisões e status checks aprovados.

**Por que importa:**
Nenhuma empresa saudável permite que alguém dê `git push origin main` e destrua produção. As rules são a primeira linha de defesa.

**Configurar em `Settings > Branches > main`:**

```
☑ Require a pull request before merging
  ☑ Require approvals: 1 (mínimo)
  ☑ Dismiss stale pull request approvals when new commits are pushed
  ☑ Require review from Code Owners
☑ Require status checks to pass before merging
  Status checks obrigatórios:
    - sonarqube (do tests_unit.yml)
    - unit-tests
    - lint
    - typecheck
☑ Require branches to be up to date before merging
☑ Require conversation resolution before merging
☑ Do not allow bypassing the above settings (nem admins)
```

---

### 1.2 PR Template

**O que é:** Template padrão que aparece automaticamente ao abrir um PR.

**Por que importa:**
PRs sem contexto são revisados superficialmente. O template força o autor a explicar o que mudou, como testar e qual o impacto.

**Criar:** `.github/pull_request_template.md`

---

### 1.3 Issue Templates

**Criar:**
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`

**Por que importa:**
Issues vagas geram trabalho dobrado. Templates estruturados aceleram triagem e estimativa.

---

### 1.4 Dependabot Configurado com Groups

**O que é:** Bot do GitHub que abre PRs automáticos para atualizações de deps e vulnerabilidades.

**Criar:** `.github/dependabot.yml` com `groups` para agrupar pacotes relacionados (ex: todos `@expo/*` num único PR em vez de 30 PRs separados).

**Por que `groups`?**
Sem grupos: 30 PRs por semana (1 por pacote). Com grupos: 1 PR para todos os pacotes Expo juntos.

---

### 1.5 Commitlint no CI

**Estado atual:** projeto já tem `commitlint.config.js` — mas não está sendo executado no CI.

**O que fazer:** adicionar job `commitlint` no `tests_unit.yml` usando `wagoid/commitlint-github-action@v6`.

**Por que é obrigatório no enterprise?**
Conventional Commits é o contrato que viabiliza CHANGELOG automático, semantic versioning e rastreabilidade entre commits e funcionalidades.

---

## Fase 2 — Qualidade e Segurança (Medium Term)

*Eleva o padrão de qualidade e segurança do pipeline.*

---

### 2.1 Semantic Versioning Automático + CHANGELOG

**Ferramenta:** `semantic-release` + `@semantic-release/changelog`

**Regra:**
- `fix:` — patch: `1.0.0 -> 1.0.1`
- `feat:` — minor: `1.0.0 -> 1.1.0`
- `feat!:` ou `BREAKING CHANGE:` — major: `1.0.0 -> 2.0.0`

**O que criar:**
- `.releaserc.json` — configuração do semantic-release
- `.github/workflows/release.yml` — roda no push para `main`, calcula versão, atualiza `CHANGELOG.md` e `package.json`, cria GitHub Release

**Por que `[skip ci]` na mensagem do release commit?**
O commit de release não deve disparar novo ciclo de CI — evita loop infinito.

---

### 2.2 Coverage Gate de Qualidade

**O que é:** CI falha se cobertura cair abaixo do threshold.

**Dois lugares para configurar:**
1. `jest.config.js` — `coverageThreshold` com 70% em branches/functions/lines/statements
2. `tests_unit.yml` — job `unit-tests` com `codecov/codecov-action@v4` e `minimum_coverage: 70`

---

### 2.3 CodeQL — Análise de Segurança Avançada

**O que é:** Análise semântica do código em busca de vulnerabilidades reais — muito mais profunda que linting ou SonarQube.

**Criar:** `.github/workflows/codeql.yml`
- Roda em push/PR para `main` e semanalmente (schedule)
- `queries: security-extended` — inclui segredos hardcoded, prototype pollution, injeções

---

### 2.4 Secret Scanning com Gitleaks

**O que é:** Detecta se alguém commitou token, senha ou chave privada.

**Duas camadas:**
1. GitHub nativo: ativar em `Settings > Security > Secret scanning`
2. CI ativo: `gitleaks/gitleaks-action@v2` no `tests_unit.yml`

---

### 2.5 Build Cache Otimizado

**Objetivo:** reduzir tempo de build de ~15min para ~5-7min.

**Três caches a adicionar nos workflows de build:**
- `node_modules` — key: hash do `yarn.lock`
- Gradle (`~/.gradle/caches`) — key: hash dos `*.gradle*`
- CocoaPods (`ios/Pods`) — key: hash do `Podfile.lock`

**Como funciona:** se o lockfile não mudou, o cache é restaurado em segundos. Se mudou, invalida e recria.

---

### 2.6 Lint + TypeCheck como Jobs Obrigatórios

**O que fazer:** adicionar dois jobs ao `tests_unit.yml`:
- `lint` — `yarn lint --max-warnings 0` (zero tolerância para warnings)
- `typecheck` — `yarn tsc --noEmit`

Ambos devem ser listados como status checks obrigatórios nas branch protection rules.

---

## Fase 3 — Enterprise Excellence (Long Term)

*Diferencial de time sênior. Observabilidade, confiabilidade e velocidade de entrega.*

---

### 3.1 GitHub Environments com Approval Gates

**O que é:** Ambientes formais no GitHub com aprovação manual obrigatória antes de deploy em produção.

**Configurar em `Settings > Environments`:**
- `production`: reviewers obrigatórios (tech lead + mobile lead), wait timer de 5 min, só permite deploy da `main`
- `pre-production`: sem revisores — auto-deploy

**No workflow:** `environment: production` no job de deploy faz o CI pausar e aguardar aprovação na UI do GitHub.

**Por que é enterprise?**
Deploy em produção sem aprovação humana é anti-pattern. O environment gate é auditável — log de quem aprovou, quando e qual SHA foi para produção.

---

### 3.2 DORA Metrics

As 4 métricas de elite DevOps (Google DevOps Research and Assessment):

| Métrica | O que mede | Meta Elite |
|---------|-----------|------------|
| Deployment Frequency | Com que frequência vai para prod | Múltiplas vezes/dia |
| Lead Time for Changes | Tempo commit até prod | menos de 1 hora |
| Change Failure Rate | % deploys que causam incidente | menos de 5% |
| Time to Restore Service | Tempo médio para recuperar de falha | menos de 1 hora |

**Ferramentas recomendadas:**
- LinearB: https://linearb.io
- Sleuth: https://www.sleuth.io

Ambas conectam ao GitHub automaticamente e calculam as 4 métricas sem configuração extra.

---

### 3.3 Slack Notifications Inteligentes

**Quando notificar (não tudo — só o que importa):**
- Build de produção publicado com sucesso
- Build falhou — com link direto para os logs e nome do autor
- Deploy aguardando aprovação — com link para o approval gate
- Vulnerabilidade crítica detectada pelo CodeQL

**Tool:** `slackapi/slack-github-action@v1` com `if: failure()` e `if: success()` separados.

---

### 3.4 Rollback Semi-Automatizado

**Estratégia:** se smoke tests falharem após deploy em produção, disparar automaticamente o workflow de build com a tag da versão anterior.

**Condição:**
```
if: failure() && needs.smoke_tests.result == 'failure'
```

O job ainda passa por `environment: production` — requer aprovação mesmo para rollback, garantindo auditabilidade.

---

### 3.5 PR Auto-Labeler + Size Labels

**Duas ferramentas:**
1. `actions/labeler@v5` com `.github/labeler.yml` — adiciona labels por categoria (feature/bugfix/infrastructure/tests) baseado nos arquivos alterados
2. `CodelyTV/pr-size-labeler@v1` — adiciona labels XS/S/M/L/XL baseado no número de linhas alteradas

**Por que importa:**
PRs grandes (+400 linhas) são revisados superficialmente. Labels de tamanho criam pressão cultural para PRs menores e mais focados.

---

### 3.6 Smoke Tests Pós-Deploy com Maestro

O projeto já tem `MAESTRO.md`. Usar Maestro Cloud para rodar subset mínimo de fluxos críticos logo após cada deploy em produção:
- Login
- Ação principal do app
- Navegação básica

Se qualquer smoke test falhar, dispara o rollback automatizado (3.4).

---

### 3.7 Deploy Freeze

**O que é:** Bloqueio automático de deploys em momentos de alto risco.

**Regras a implementar:**
- Sextas-feiras após 15h UTC — ninguém quer resolver incidente no fim de semana
- Período natalício (23-27 de dezembro) — equipe reduzida, risco alto

Implementado como job `check_freeze` usando `actions/github-script@v7` com lógica de data.

---

### 3.8 Composite Actions Próprias do FUSE

**O que é:** Encapsular steps repetitivos em actions compostas internas — como funções, mas para CI/CD.

**Problema atual:** os mesmos 5 steps (checkout + node + yarn install + cache) repetem em todo workflow.

**Solução:** criar `.github/actions/setup-node-env/action.yml` como action composta reutilizável internamente.

**Uso nos workflows:**
```yaml
steps:
  - uses: ./.github/actions/setup-node-env
```

---

## Roadmap de Implementação

```
SEMANA 1-2: Fase 1 — Fundação
  [ ] Branch protection rules no GitHub Settings
  [ ] .github/pull_request_template.md
  [ ] .github/ISSUE_TEMPLATE/bug_report.yml
  [ ] .github/ISSUE_TEMPLATE/feature_request.yml
  [ ] .github/dependabot.yml com groups configurados
  [ ] Commitlint como job obrigatório no tests_unit.yml

SEMANA 3-4: Fase 2 — Qualidade e Segurança
  [ ] .releaserc.json + workflow release.yml
  [ ] Coverage threshold no jest.config.js (70%)
  [ ] Coverage gate + Codecov no tests_unit.yml
  [ ] .github/workflows/codeql.yml
  [ ] Gitleaks no CI
  [ ] Build cache (node_modules + Gradle + CocoaPods)
  [ ] Lint e TypeCheck como jobs obrigatórios no PR

SEMANA 5-8: Fase 3 — Enterprise Excellence
  [ ] GitHub Environments: production + pre-production
  [ ] Approval gate no job de deploy prd
  [ ] Slack notifications (failure + deploy success)
  [ ] DORA metrics via LinearB ou Sleuth
  [ ] .github/labeler.yml + pr-size-labeler
  [ ] Smoke tests pos-deploy com Maestro Cloud
  [ ] Deploy freeze logic
  [ ] .github/actions/setup-node-env (composite action)
  [ ] .github/actions/notify-slack (composite action)
```

---

## Antes vs. Depois

| Dimensão | Estado Atual | Após Melhorias |
|----------|-------------|----------------|
| Proteção de branches | Parcial | Total — nenhum bypass possível |
| Versioning | Manual (input humano) | Automático via commits |
| CHANGELOG | Inexistente | Gerado automaticamente a cada release |
| Cobertura de testes | Medida mas sem gate | Gate: falha se abaixo de 70% |
| Segurança | SonarQube | SonarQube + CodeQL + Gitleaks |
| Deploy em prd | Automático após build | Requer aprovação humana explícita |
| Visibilidade | GitHub Actions UI | Slack + DORA metrics dashboard |
| Rollback | Manual | Semi-automático com smoke tests |
| Tempo de build | ~15min | ~5-7min (com cache) |
| PR quality | CODEOWNERS | CODEOWNERS + template + labels + commitlint |
