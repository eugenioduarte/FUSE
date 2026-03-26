# Domain Context

## Purpose

Dashboard surfaces that summarize user state, metrics, and actionable entry points.

## Owned Flows

- home summary
- dashboard widgets
- KPI cards
- quick actions

## Boundaries

- owns aggregation and presentation of dashboard information
- does not own auth, payments, or profile editing

## Business Vocabulary

- widget
- KPI
- summary card
- refresh state
- empty state

## Upstream Dependencies

- multiple data providers
- analytics tracking

## Downstream Consumers

- home screen
- personalized entry flows

## Current Risks

- render complexity
- mixed responsibilities between data aggregation and screen composition
