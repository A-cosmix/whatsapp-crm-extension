# HireMate AI — Architecture

## Overview

HireMate AI follows **Clean Architecture** with strict layer separation. Inner layers never import from outer layers.

```
┌─────────────────────────────────────────────────┐
│  Entrypoints (background, popup, options, content) │
├─────────────────────────────────────────────────┤
│  UI (React components, pages, Zustand stores)   │
├─────────────────────────────────────────────────┤
│  Infrastructure (chrome APIs, LLM, payments)    │
├─────────────────────────────────────────────────┤
│  Application (use cases, DTOs)                  │
├─────────────────────────────────────────────────┤
│  Domain (entities, interfaces, value objects)   │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Domain (`src/domain/`)

Pure TypeScript. No imports from `chrome.*`, React, fetch, or DOM.

- **Entities**: `Resume`, `JobMatch`, `CoverLetter`, `Subscription`, etc.
- **Repository interfaces**: `IResumeRepository`, `ILLMProvider`, `IPaymentService`
- **Value objects**: `scoreToGrade()`, `extractKeywords()`, `FREE_LIMITS`
- **Errors**: `UsageLimitExceededError`, `PremiumRequiredError`

### Application (`src/application/`)

Orchestrates domain logic via use cases. Depends only on domain interfaces.

Each use case = one user action:
- `AnalyzeResumeUseCase` — upload + ATS analysis + usage tracking
- `MatchJobUseCase` — premium-gated job matching
- `GenerateCoverLetterUseCase` — style-based letter generation
- `JobTrackerUseCase` — CRUD for kanban items

DTOs use Zod schemas for input validation at the application boundary.

### Infrastructure (`src/infrastructure/`)

Implements domain interfaces with concrete adapters:

| Interface | Implementation |
|-----------|---------------|
| `IResumeRepository` | `ChromeResumeRepository` (chrome.storage.local) |
| `ILLMProvider` | `MockLLMProvider` / `OpenAILLMProvider` |
| `IAuthService` | `LocalAuthService` |
| `IPaymentService` | `PaymentService` (Stripe + Razorpay) |
| `IJobBoardAdapter` | LinkedIn, Indeed, Naukri, Glassdoor adapters |

**Composition root**: `src/infrastructure/di/container.ts`
- Wires all dependencies
- Exposes `handleMessage()` for chrome.runtime message bus
- UI communicates exclusively via message types

### UI (`src/ui/`)

React presentation layer. No business logic in components.

- **Pages**: One page per feature (dashboard, resume analyzer, etc.)
- **Components**: Reusable glass cards, score rings, loading sequences
- **Stores**: Zustand for auth, subscription, settings state
- **TanStack Query**: Server-state for async operations

### Entrypoints (`src/entrypoints/`)

MV3 bootstrap and dependency wiring:

| Entrypoint | Purpose |
|------------|---------|
| `background.ts` | Message handler, alarms, notifications |
| `popup/` | Quick-access toolbar popup (360px) |
| `options/` | Full dashboard with sidebar navigation |
| `content.ts` | Job board detection + floating analyze panel |

## Message Bus

UI → Background communication:

```typescript
chrome.runtime.sendMessage({ type: 'ANALYZE_RESUME', payload: { fileName, content } })
```

Background routes to `handleMessage()` → use case → repository/LLM.

## Data Flow Example: Resume Analysis

```
1. User uploads file in ResumeAnalyzerPage (UI)
2. TanStack Query mutation calls sendMessage('ANALYZE_RESUME')
3. Background receives message → AnalyzeResumeUseCase.execute()
4. Use case checks usage limits (domain rule)
5. Resume saved via ChromeResumeRepository
6. MockLLMProvider.analyzeResume() returns scores
7. Analysis saved, usage incremented
8. Result returned to UI → ScoreRing + recommendations rendered
```

## Premium Gating

```typescript
// Use cases check premium via injected callback
if (!(await this.isPremium())) {
  throw new PremiumRequiredError('Job Match Scoring');
}
```

Subscription state stored in `chrome.storage.local` via `ChromeSubscriptionRepository`.

## Job Board Integration

Content script uses adapter pattern:

```typescript
const adapter = getAdapterForUrl(window.location.href);
const job = await adapter.extractJobDescription();
```

Each adapter implements `IJobBoardAdapter` with site-specific DOM selectors.

## Extending

### Add a new LLM provider
1. Implement `ILLMProvider` in `src/infrastructure/llm/`
2. Register in `container.ts` based on settings

### Add a new job board
1. Create adapter extending `BaseJobBoardAdapter`
2. Register in `JOB_BOARD_ADAPTERS` array
3. Add host permission in `wxt.config.ts`

### Add a new feature
1. Define entity in `domain/entities/`
2. Add repository interface if needed
3. Create use case in `application/use-cases/`
4. Wire in `container.ts` message handler
5. Build UI page + route
