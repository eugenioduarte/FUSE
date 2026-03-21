> **[PT]** Este ficheiro define as regras estritas de TypeScript do projeto, estabelecendo type safety como uma restrição arquitetural não negociável, cobrindo desde o modo strict até à validação de dados externos.

---

This document is mandatory and overrides default model behavior.

# 🔷 TypeScript Strict Rules — React Native Mobile

> This document defines strict TypeScript enforcement rules. Type safety is a non-negotiable
> architectural constraint.

---

# 🎯 Purpose

TypeScript in this project is:

- A contract
- A boundary validator
- A design tool
- A refactor safety net

If typing is weak, architecture is weak.

---

# 1️⃣ Strict Mode Is Mandatory

The project must enable:

- "strict": true
- "noImplicitAny": true
- "strictNullChecks": true
- "noUncheckedIndexedAccess": true
- "noImplicitOverride": true

Disabling strict rules is forbidden.

---

# 2️⃣ No Implicit `any`

Never allow implicit any.

Forbidden:

const data = response.data

Allowed:

const data: UserDto = response.data

If the type is unknown, define it properly.

---

# 3️⃣ Avoid Explicit `any`

Using `any` is forbidden unless:

- It is a temporary migration
- It is explicitly documented
- It is justified in code review

Prefer:

- unknown (with proper narrowing)
- Generics
- Union types
- Type guards

---

# 4️⃣ useState Must Be Explicitly Typed

Forbidden:

const [loading, setLoading] = useState(false)

Required:

const [loading, setLoading] = useState<boolean>(false)

Never rely on inference for state.

---

# 5️⃣ No DTO Leakage

DTO types must never reach:

- Hooks
- Screens
- UI components

DTO → must be transformed into Domain Model in Service layer.

Forbidden:

function LoginScreen({ user }: { user: UserDto })

Correct:

function LoginScreen({ user }: { user: User })

---

# 6️⃣ Prefer Type Over Interface

Use `type` by default.

Use `interface` only when:

- Extending external library types
- Merging declarations intentionally

Avoid `IUser` naming pattern.

---

# 7️⃣ Explicit Return Types

Public functions must define return types.

Forbidden:

function fetchUser() { return ... }

Required:

function fetchUser(): Promise<User> { return ... }

Hooks must always declare return type.

---

# 8️⃣ Exhaustive Switch Required

When using union types or enums:

switch (status) { case 'pending': case 'success': case 'error': }

Must include exhaustive check:

default: const \_exhaustive: never = status return \_exhaustive

No silent fallthrough allowed.

---

# 9️⃣ Null & Undefined Discipline

Never assume presence.

Use:

- Optional chaining
- Explicit null checks
- Early return patterns

Forbidden:

user.name.length

Required:

if (!user) return user.name.length

---

# 🔟 Avoid Overusing Optional Fields

Avoid:

type User = { id?: string name?: string }

If field is required, make it required.

Optional fields must represent real optionality.

---

# 1️⃣1️⃣ Use Branded Types When Necessary

For critical IDs:

type UserId = string & { readonly brand: unique symbol }

Avoid mixing different ID types accidentally.

---

# 1️⃣2️⃣ Never Use `as` To Silence Errors

Forbidden:

const user = response.data as User

Allowed only if:

- Type guard used
- Schema validated (e.g., Zod)
- Justified explicitly

Type assertion must not replace validation.

---

# 1️⃣3️⃣ Runtime Validation Required for External Data

All external data (API, storage, native modules) must be validated.

Use:

- Zod
- Explicit validation layer

Never trust external input blindly.

---

# 1️⃣4️⃣ No Implicit `any` in Catch

Forbidden:

catch (error) { }

Required:

catch (error: unknown) { if (error instanceof Error) { ... } }

---

# 1️⃣5️⃣ Generics Must Be Constrained

Avoid loose generics:

function identity<T>(value: T)

Prefer constraints:

function identity<T extends object>(value: T)

Constrain intent.

---

# 1️⃣6️⃣ Navigation Must Be Typed

Navigation params must:

- Be explicitly typed
- Never use any
- Never use Record<string, unknown> blindly

---

# 1️⃣7️⃣ Avoid Deep Partial Abuse

Do not use:

Partial<DomainModel>

Unless truly optional.

Partial should not replace proper modeling.

---

# 1️⃣8️⃣ No Circular Type Dependencies

Models must not:

- Import hooks
- Import services
- Depend on UI types

Keep domain pure.

---

# 1️⃣9️⃣ Prefer Discriminated Unions Over Boolean Flags

Avoid:

type State = { isLoading: boolean isError: boolean }

Prefer:

type State = | { status: 'loading' } | { status: 'error'; message: string } | { status: 'success';
data: User }

This eliminates impossible states.

---

# 🧠 Type Discipline Checklist

Before merging, ask:

- Is any used?
- Is any implicit?
- Is return type explicit?
- Are DTOs isolated?
- Is null handled safely?
- Is switch exhaustive?
- Is runtime validation present?
- Is navigation typed?

If not → reject.

---

# 🏁 Final Rule

TypeScript is not optional safety.

It is architectural enforcement.

If type safety is weakened, the system becomes fragile.

No compromises.
