> **[PT]** Este ficheiro define o padrão de internacionalização (i18n) do projeto, descrevendo como extrair strings hardcoded dos componentes e movê-las para os ficheiros de tradução, garantindo zero strings visíveis ao utilizador no código.

---

This document is mandatory and overrides default model behavior.

# 🌐 Translations — i18n Pattern

> This document defines how to extract hardcoded text from components and move it to the translation files.
> All user-visible strings must go through this process. No exceptions.

---

# 🎯 Purpose

This skill ensures:

- Zero hardcoded user-visible strings in the codebase
- All text lives in `en.json` and `pt.json`
- Components use `t()` from `useTranslation()` consistently
- Translation keys follow a predictable naming convention

---

# 📁 Translation File Locations

```
src/i18n/translations/en.json   ← English strings
src/i18n/translations/pt.json   ← Portuguese strings
```

Both files must always be kept in sync. Every key added to one must be added to the other.

---

# 🔑 Key Naming Convention

Format: `domain.section.key` — all `snake_case`, dot-separated.

| Segment  | Rule                                              | Example            |
| -------- | ------------------------------------------------- | ------------------ |
| `domain` | Screen or feature name (camelCase or snake_case)  | `chargeHeader`     |
| `section`| Sub-section if needed (optional)                  | `form`, `buttons`  |
| `key`    | Short descriptor of the string                    | `title`, `subtitle`|

**Examples:**

```
chargeHeader.title
chargeHeader.subtitle
fastPlug.biometric.confirm_identity
account.account_data_screen.name_label
common.back
common.start_charging
```

Use existing top-level domains when they fit (e.g. `common`, `auth`, `fastPlug`).
Create a new domain only when no existing one matches.

---

# 🔧 Step-by-Step Agent Workflow

When asked to apply translations to a file or component, follow these exact steps:

## 1️⃣ Read the target file

Read the component file completely. Identify every user-visible string, including:
- JSX text content: `<Text>Hello world</Text>`
- Prop values: `label="Name"`, `placeholder="Write here"`, `title="Confirm"`
- String variables used in rendered output

Ignore: log messages, test strings, internal identifiers, URLs, numeric values.

## 2️⃣ Determine the domain

Use the component's screen or feature context as the top-level domain.
Examples:
- `ChargeHeader.tsx` → domain: `chargeHeader`
- `FastPlugScreen.tsx` → domain: `fastPlug`
- A shared button → `common`

## 3️⃣ Define keys for each string

For each identified string, choose a key:
- Keep it short and descriptive
- Use `snake_case`
- Nest if there are multiple related strings (e.g. `chargeHeader.title`, `chargeHeader.subtitle`)

## 4️⃣ Add keys to `en.json`

Insert the new keys in the appropriate location in `en.json`.
Provide the English translation for each string.

```json
// en.json
"chargeHeader": {
  "title": "Unlock Charger",
  "subtitle": "Before connecting your vehicle, scan the QR Code on the socket or enter the code manually"
}
```

## 5️⃣ Add keys to `pt.json`

Insert the same keys in `pt.json` with Portuguese translations.

```json
// pt.json
"chargeHeader": {
  "title": "Desbloquear Carregador",
  "subtitle": "Antes de ligar o veículo, leia o QR Code da tomada ou introduza o código manualmente"
}
```

## 6️⃣ Update the component

Replace every hardcoded string with the corresponding `t()` call.

**Before:**
```tsx
<Text variant="semibold/body-lg">
  Unlock Charger
</Text>

<Text variant="semibold/body-sm">
  Before connecting your vehicle, scan the QR Code on the socket or enter the code manually
</Text>
```

**After:**
```tsx
<Text variant="semibold/body-lg">
  {t('chargeHeader.title')}
</Text>

<Text variant="semibold/body-sm">
  {t('chargeHeader.subtitle')}
</Text>
```

For props:

**Before:**
```tsx
<TextInput label="Email" placeholder="Write your email" />
```

**After:**
```tsx
<TextInput label={t('login.email_label')} placeholder={t('login.email_placeholder')} />
```

## 7️⃣ Add `useTranslation` if missing

If the component does not already import and use `useTranslation`:

Add the import at the top of the file:
```tsx
import { useTranslation } from 'react-i18next'
```

Add the hook inside the component function body, before the return:
```tsx
const { t } = useTranslation()
```

---

# ✅ Rules Summary

| Rule                                                        | Enforced |
| ----------------------------------------------------------- | -------- |
| No hardcoded user-visible strings in JSX or props           | ✅       |
| Every key exists in both `en.json` and `pt.json`            | ✅       |
| Keys use `snake_case` and dot-notation hierarchy            | ✅       |
| `useTranslation` imported from `'react-i18next'`            | ✅       |
| `const { t } = useTranslation()` declared in the component  | ✅       |
| New domains created only when no existing domain fits       | ✅       |

---

# 🏁 Final Rule

Every user-visible string must flow through:

```
Hardcoded text → en.json + pt.json → t('domain.key') in component
```

No shortcuts. No inline strings. No `strings.ts` workarounds.
