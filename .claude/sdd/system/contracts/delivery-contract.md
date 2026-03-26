# Delivery Contract

The `delivery-agent` is responsible for packaging already-validated work for Git and PR flow.

## Responsibilities

- create branch names from approved work-item identity
- prepare commit groupings
- enforce commit conventions
- open PR with evidence references
- attach validation summary

## Non-Responsibilities

- defining architecture
- writing feature code
- approving its own delivery without validation evidence

## Required Evidence

- linked work item
- linked SDD modules
- lint/test results
- screenshots when UI changed
- security or analytics notes when applicable
