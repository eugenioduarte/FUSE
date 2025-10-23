![Project Preview](https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExajRhbjJjaWRjdXBub3psbXl5bmthNjNwaXBuZnJqamxtMWhkeG90NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NEvPzZ8bd1V4Y/giphy.gif)

<!-- 
# ![Project Preview](https://drive.google.com/uc?export=view&id=1QPJMTfk6NiYWgswb47cSkuK1WyKaKd5P)

Mobile challenge application built with React Native (Expo), designed for browsing and managing auction vehicles.

---

## 🚀 Technologies

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Zustand](https://github.com/pmndrs/zustand)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Testing Library](https://testing-library.com/)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) + [Husky](https://typicode.github.io/husky)

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/autoauction.git

# Move into the project folder
cd autoauction

# Install dependencies
yarn

# Start the app with Expo (clean cache recommended)
npx expo start -c
```

## CI/CD, SonarCloud e Publicação (EAS)

Este projeto agora possui:

- GitHub Actions CI (`.github/workflows/ci.yml`):
  - Lint (ESLint)
  - Testes (Jest) com cobertura
  - SonarCloud (se `SONAR_TOKEN` configurado)

- GitHub Actions Release (`.github/workflows/release.yml`):
  - Build com EAS (profiles: development/preview/production)
  - Submit para App Store Connect e Google Play (produção)

- Configurações:
  - `sonar-project.properties` (ajuste organização e projectKey)
  - `eas.json` (perfis de build/submit)

### Pré-requisitos

- Secrets no GitHub (Settings > Secrets and variables > Actions):
  - SonarCloud:
    - SONAR_TOKEN
  - Expo/EAS:
    - EXPO_TOKEN
  - Apple (para submit iOS):
    - APPLE_ID
    - APPLE_TEAM_ID
    - APPLE_APP_SPECIFIC_PASSWORD
  - Android (para submit Android):
    - GOOGLE_SERVICE_ACCOUNT_KEY (JSON da Service Account)

### Rodando os workflows

- CI dispara em PR/push para `main` ou `setup`.
- Release (manual): Actions > Build and Submit (EAS)
  - profile: production (gera build para loja)
  - platform: all/ios/android

### Ajustes necessários

- Edite `sonar-project.properties` com sua org e project key do SonarCloud.
- Configure `app.json` com `bundleIdentifier` (iOS) e `package` (Android) definitivos.
- Crie os certificados/credenciais na sua conta Expo (EAS) e conecte as lojas.
- Caso use Yarn Berry, garanta o `.yarnrc.yml` com `enableGlobalCache: true` ou adapte o cache do workflow.

### Dicas

- Para builds internas, use o profile `preview` e instale builds do EAS no dispositivo/testers.
- Se quiser publicar em TestFlight/Play Internal, use o workflow `release.yml` com profile `production` e os secrets configurados.

---

## 👤 Perfil do Utilizador (Profile)

A app inclui uma tela de Perfil acessível pelo menu lateral (Menu → Profile), onde podes:

- Definir o Nome de exibição (autosave ao sair do campo). Se não definires, é usado um nome padrão como Explorador(a) ou Utilizador(a) #1234.
- Gerar um Avatar ilustrativo aleatório (DiceBear) e escolher entre estilos (ex.: adventurer, bottts, identicon, pixel-art, fun-emoji). A alteração é guardada automaticamente.
- Alterar o Email com validação básica e envio de email de confirmação. Por segurança, é necessário informar a senha atual.
- Alterar a Palavra‑passe, com indicador de força (fraca/média/forte/muito forte) e confirmação de senha.

Notas técnicas:

- Autenticação e perfil via Firebase Auth (updateProfile, updateEmail, updatePassword, reauthenticate).
- Estado do utilizador persistido com Zustand + AsyncStorage (`src/store/useAuthStore.ts`).
- Serviço de avatares em `src/services/profile/avatar.service.ts` (DiceBear, PNG).
