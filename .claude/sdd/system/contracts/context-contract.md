# Domain Context Contract

Each domain context is a long-lived memory boundary for design and delivery decisions.

## Required Context Files

```text
contexts/<domain>/
  _context.md
  _architecture.md
  _decisions.md
  _shared-components.md
```

## Meaning

- `_context.md`: domain purpose, owned flows, boundaries, and vocabulary
- `_architecture.md`: key layers, service boundaries, state ownership, integrations
- `_decisions.md`: durable domain decisions and tradeoffs
- `_shared-components.md`: reusable screens, hooks, components, models, or tokens

## Rules

- one domain per bounded business capability
- do not mix unrelated flows in the same context
- write decisions once and reference them from work items
- update context files after meaningful delivery decisions

## Work Item Placement

Every work item lives under one domain context:

`contexts/<domain>/<epic>/<work-item>/`

If no epic exists yet, use:

`contexts/<domain>/backlog/<work-item>/`
