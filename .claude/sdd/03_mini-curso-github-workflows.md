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

Build da versão web do app (provavelmente React Native Web/Expo Web) e deploy no Google App Engine.

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
