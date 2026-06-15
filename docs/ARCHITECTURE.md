# WhatsApp CRM Extension — Clean Architecture

## Layer Diagram

```
┌──────────────────────────────────────────────────────────────┐
│  Presentation Layer                                          │
│  src/ui/          — React components (side panel, popup)     │
│  src/content/     — Content script UI injection              │
└──────────────────────────┬───────────────────────────────────┘
                           │ uses
┌──────────────────────────▼───────────────────────────────────┐
│  Application Layer (Use Cases)                                 │
│  src/application/use-cases/                                    │
│  — CreateLeadUseCase, SendAutoReplyUseCase, etc.               │
│  — Orchestrates domain + infrastructure; NO framework code   │
└──────────────────────────┬───────────────────────────────────┘
                           │ depends on
┌──────────────────────────▼───────────────────────────────────┐
│  Domain Layer (Core Business Logic)                            │
│  src/domain/                                                   │
│  ├── entities/       — Lead, Campaign, Reminder              │
│  ├── value-objects/  — PhoneNumber, LeadStage, MessageText     │
│  ├── repositories/   — ILeadRepository (interfaces only)       │
│  ├── services/       — ILLMProvider, IWhatsAppAdapter          │
│  └── agents/         — IReplyTriageAgent, ISupervisorAgent     │
│  ⚠ NO imports from chrome.*, React, Dexie, or fetch          │
└──────────────────────────┬───────────────────────────────────┘
                           │ implemented by
┌──────────────────────────▼───────────────────────────────────┐
│  Infrastructure Layer                                          │
│  src/infrastructure/                                           │
│  ├── storage/        — DexieLeadRepository                     │
│  ├── whatsapp/       — DomWhatsAppAdapter, StoreWhatsAppAdapter│
│  ├── llm/            — OllamaProvider, WebLLMProvider          │
│  ├── messaging/      — ChromeMessageBus                        │
│  └── agents/         — ReplyTriageAgentImpl                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│  Extension Runtime (MV3 Contexts)                              │
│  src/entrypoints/                                              │
│  ├── background.ts   — Service worker bootstrap                │
│  ├── content.ts      — Content script bootstrap                │
│  └── sidepanel/      — Side panel entry                        │
└──────────────────────────────────────────────────────────────┘
```

## Dependency Rule

**Dependencies point inward only.** Domain knows nothing about Chrome APIs, React, or IndexedDB.

```
Presentation → Application → Domain ← Infrastructure
```

## Directory Structure

```
whatsapp-crm-extension/
├── .cursor/
│   └── rules/                    # Cursor AI rules (see each .mdc file)
├── docs/
│   ├── RESEARCH.md
│   ├── FEATURE_REQUIREMENTS.md
│   ├── ARCHITECTURE.md           # This file
│   └── PROMPT_TEMPLATE.md
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/       # Interfaces only
│   │   ├── services/             # Interfaces only
│   │   └── agents/               # Interfaces only
│   ├── application/
│   │   ├── use-cases/
│   │   └── dto/
│   ├── infrastructure/
│   │   ├── storage/
│   │   ├── whatsapp/
│   │   ├── llm/
│   │   ├── messaging/
│   │   └── agents/
│   ├── ui/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── pages/
│   ├── content/
│   │   ├── observer.ts
│   │   └── injector.ts
│   └── entrypoints/
│       ├── background.ts
│       ├── content.ts
│       └── sidepanel/
├── wxt.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

## SOLID Mapping

| Principle | How We Apply It |
|---|---|
| **S** — Single Responsibility | Each use case = one action; each agent = one decision surface |
| **O** — Open/Closed | New LLM provider = new class implementing `ILLMProvider`; no changes to use cases |
| **L** — Liskov Substitution | `DomWhatsAppAdapter` and `StoreWhatsAppAdapter` interchangeable via `IWhatsAppAdapter` |
| **I** — Interface Segregation | Separate `IMessageReader`, `IMessageSender`, `IContactReader` instead of one fat interface |
| **D** — Dependency Inversion | Use cases depend on `ILeadRepository`, not `DexieLeadRepository` |

## Message Bus Pattern (Extension Contexts)

```typescript
// Domain defines the contract
interface MessageBus {
  send<T>(type: string, payload: T): Promise<void>;
  on<T>(type: string, handler: (payload: T) => void): void;
}

// Infrastructure implements with chrome.runtime
class ChromeMessageBus implements MessageBus { ... }
```

Message types (typed enum):
- `LEAD_CREATED`, `LEAD_UPDATED`
- `MESSAGE_RECEIVED`, `AUTO_REPLY_SENT`
- `CAMPAIGN_PROGRESS`, `REMINDER_FIRED`
- `AI_DECISION_LOGGED`

## Testing Strategy

| Layer | Test Type | Tools |
|---|---|---|
| Domain (entities, VOs) | Unit | Vitest |
| Application (use cases) | Unit with mocks | Vitest + manual mocks |
| Infrastructure | Integration | Vitest + fake IndexedDB |
| UI | Component | Vitest + Testing Library |
| E2E | End-to-end | Playwright (mocked WhatsApp) |

## Composition Root

Each entrypoint (background, content, sidepanel) has a `bootstrap.ts` that wires dependencies:

```typescript
// src/entrypoints/background/bootstrap.ts
export function createApp(): BackgroundApp {
  const storage = new DexieStorage();
  const leadRepo = new DexieLeadRepository(storage);
  const llm = new OllamaProvider(config.ollamaUrl);
  const whatsapp = new DomWhatsAppAdapter();
  const bus = new ChromeMessageBus();

  return new BackgroundApp({
    createLead: new CreateLeadUseCase(leadRepo, bus),
    autoReply: new SendAutoReplyUseCase(leadRepo, llm, whatsapp, bus),
    // ...
  });
}
```
