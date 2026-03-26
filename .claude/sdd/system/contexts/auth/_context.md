# Domain Context

## Purpose

Authentication and session access flows for FUSE.

## Owned Flows

- login
- signup
- password reset
- token/session refresh
- biometric unlock

## Boundaries

- owns identity entry and session continuity
- does not own dashboard personalization or payments

## Business Vocabulary

- session
- access token
- refresh token
- biometric unlock
- authenticated user

## Upstream Dependencies

- identity provider
- secure storage

## Downstream Consumers

- protected navigation
- profile
- dashboard

## Current Risks

- token lifecycle drift
- mixed ownership between auth logic and navigation guards
