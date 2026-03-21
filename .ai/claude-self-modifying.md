# 🧠 Claude Self-Modifying Learning Log

> Este ficheiro é um registo vivo de padrões aprendidos, correções e decisões arquiteturais
> confirmadas em sessões anteriores. **Deve ser lido antes de qualquer implementação.**
>
> Formato de cada entrada:
> - **Regra** — o que fazer / não fazer
> - **Porquê** — contexto ou incidente que gerou a regra
> - **Aplica-se a** — onde esta regra tem efeito

---

## 🔄 Loading Overlay — Centralizado no GlobalLoadingObserver

**Regra:** Nunca chamar `overlayActions.open('loading')` ou `overlayActions.close()` diretamente
em hooks ou screens para controlar o estado de loading de API calls.

**Porquê:** Foi criado o `GlobalLoadingObserver` (`src/providers/GlobalLoadingObserver.tsx`) que
usa `useIsFetching()` e `useIsMutating()` do React Query para observar globalmente todas as
chamadas de API e gerir o overlay de loading de forma centralizada e automática. Chamadas manuais
criam inconsistências e duplicação.

**Aplica-se a:** Todos os hooks em `src/services/query/`, todos os screen hooks, todos os
componentes. A única exceção aceite é quando se abre um overlay de tipo **diferente** de
`'loading'` (ex: `'chargerNotFound'`, `'chargingComplete'`).

---

## 🚫 Git — Sem Co-Author nos Commits

**Regra:** Nunca incluir linha `Co-Authored-By:` nos commits.

**Porquê:** Política da empresa. Os commits devem ter apenas o nome do utilizador.

**Aplica-se a:** Todos os commits neste repositório.

---

## 🏗 Arquitectura — Model → Service → Query → Hook → Screen

**Regra:** Respeitar estritamente a cadeia de responsabilidades. Sem atalhos entre camadas.

**Porquê:** Definido no `system.md` e confirmado em múltiplas sessões. Quebrar a cadeia cria
acoplamento e dificulta testes.

**Aplica-se a:** Qualquer nova feature ou refactor.

---

## 🏪 Store — Flat `.store.ts` Files (Sem Slices/Domains/Flows)

**Regra:** A store usa ficheiros planos `{name}.store.ts` — sem separação em `slices/`, `domains/`,
`flows/`. Cada ficheiro contém o `create()` do Zustand + estado + actions + hooks exportados.

**Porquê:** Decisão arquitetural tomada em 2026-03-20 para simplificar o modelo. A separação em
três ficheiros (`.slice.ts`, `.hooks.ts`, `.selectors.ts`) era over-engineering para o tamanho
atual do projeto.

**Aplica-se a:** Qualquer nova store. Ficheiros existentes: `auth.store.ts`, `overlay.store.ts`,
`theme.store.ts`.

Padrão correto:

```ts
export const useAuthStore = create<AuthState>()(persist(...))
export const useUser = () => useAuthStore((s) => s.user)
export const useAuthActions = () => useAuthStore((s) => ({ login: s.login, logout: s.logout }))
```

---

## 🧭 Navegação — `useEffect` + `router.replace()` (Não `<Redirect>`)

**Regra:** Para navegação condicional baseada em hydration (ex: `app/index.tsx`), usar
`router.replace()` dentro de um `useEffect`, nunca `<Redirect>`.

**Porquê:** O `<Redirect>` causa tela branca no Expo Router quando renderizado durante o mount
inicial antes de a navegação estar pronta. O `useEffect` garante que o router está inicializado.

**Aplica-se a:** `app/index.tsx` e qualquer rota raiz que precise redirecionar com base em estado
da store.

Padrão correto:

```tsx
export default function Index() {
  const router = useRouter()
  const rehydrated = useAuthStore((s) => s.rehydrated)
  // ...
  useEffect(() => {
    if (!rehydrated) return
    router.replace('/(auth)/onboarding')
  }, [rehydrated])
  return null
}
```

---

## 🔁 Hydration — `rehydrated` NÃO deve ser persistido

**Regra:** O campo `rehydrated` na store de auth NÃO deve ser incluído na persistência do Zustand.
Usar `partialize` para excluí-lo. É definido como `true` pelo `onRehydrateStorage` em cada launch.

**Porquê:** Se `rehydrated` for persistido, pode ser carregado como `false` antes do callback
`onRehydrateStorage` disparar, criando uma race condition que resulta em tela branca permanente.

**Aplica-se a:** `src/store/auth.store.ts` e qualquer futura store com flag de hydration.

---

## 📝 Como atualizar este ficheiro

Sempre que:
- O utilizador corrigir algo que foi feito de forma errada
- For tomada uma decisão arquitetural relevante
- For identificado um padrão recorrente de erro
- For estabelecida uma nova convenção no projeto

→ Adicionar uma nova entrada neste ficheiro com o formato acima.
