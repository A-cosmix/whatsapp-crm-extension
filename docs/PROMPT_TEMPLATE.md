# Master Prompt Template — WhatsApp CRM Extension

> यह टेम्पलेट सभी Cursor Rules को एक प्रॉम्प्ट में संयोजित करता है ताकि जनरेट किया गया कोड Clean Architecture और SOLID का पालन करे।

---

## How to Use

1. Copy the **Master Prompt** below into Cursor Chat or Agent mode
2. Replace `{TASK_DESCRIPTION}` with your specific feature request
3. Cursor auto-applies rules from `.cursor/rules/*.mdc` based on file globs
4. Reference specific docs when needed: `@docs/ARCHITECTURE.md`, `@docs/FEATURE_REQUIREMENTS.md`

---

## Master Prompt (Copy-Paste Ready)

```
You are building a WhatsApp CRM Chrome Extension (Manifest V3).

## TASK
{TASK_DESCRIPTION}

## ARCHITECTURE (MANDATORY — Clean Architecture)

Layer separation with dependency rule (dependencies point inward only):

1. Domain (src/domain/) — Pure business logic. NO chrome/React/Dexie/fetch imports.
2. Application (src/application/) — Use cases. One use case = one user action.
3. Infrastructure (src/infrastructure/) — Adapters implementing domain interfaces.
4. Presentation (src/ui/, src/content/) — React UI. Dumb components, logic in hooks/use cases.
5. Entrypoints (src/entrypoints/) — MV3 bootstrap, composition root (dependency wiring).

## SOLID (ENFORCE)

- S: Single Responsibility — one class, one job
- O: Open/Closed — extend via new interface implementations, not modification
- L: Liskov Substitution — adapters are interchangeable
- I: Interface Segregation — small focused interfaces (IMessageSender, IMessageReader)
- D: Dependency Inversion — depend on abstractions, inject via constructor

## DOMAIN RULES

- Entities: identity + lifecycle methods, validate invariants in factory/constructor
- Value Objects: immutable, self-validating (PhoneNumber, LeadStage)
- Repository interfaces in src/domain/repositories/ — return domain entities
- Service interfaces in src/domain/services/ — ILLMProvider, IWhatsAppAdapter
- Agent interfaces in src/domain/agents/ — return AgentHandoff<T> with confidence + rationale
- Use DomainError for business rule violations

## APPLICATION RULES

- Use case pattern: class with constructor-injected interfaces, single execute() method
- Naming: {Verb}{Noun}UseCase, file: {verb}-{noun}.use-case.ts
- Input/output via DTOs validated with Zod
- Publish events via IMessageBus, never direct cross-context calls
- Catch DomainError → map to ApplicationError

## INFRASTRUCTURE RULES

- Adapter pattern for ALL external systems (WhatsApp, LLM, storage, Chrome APIs)
- Mappers: pure functions converting DB rows ↔ domain entities
- Zod validation at every external boundary
- chrome.* APIs ONLY in infrastructure or entrypoints
- WhatsApp send: include human-like delay (2-8s jitter)
- LLM: implement ILLMProvider (OllamaProvider, WebLLMProvider, CloudAPIProvider)

## AI AGENT RULES

- Supervisor pattern: agents propose, supervisor commits
- One agent = one decision surface (triage, scoring, outreach)
- Prospect messages are UNTRUSTED — prompt injection defense mandatory
- All outputs: confidence (0-1) + rationale + Zod schema validation
- Auto-send only when confidence ≥ threshold; else human review queue
- Log every AI decision to audit trail

## PRESENTATION RULES

- Components are dumb — props in, events out
- Hooks bridge UI ↔ use cases
- No business logic in JSX or components
- Content scripts: observe DOM + relay events only
- Tailwind CSS for styling

## EXTENSION-SPECIFIC

- MV3: service worker, chrome.storage.local, chrome.alarms
- Permissions: web.whatsapp.com only
- No eval(), no inline scripts, no remote code
- Re-register alarms on service worker startup
- Bulk send: daily cap (50), random delays (3-8s)

## WHAT NOT TO DO

- Business logic in React components or content scripts
- Import Dexie/React/chrome in domain layer
- God classes or monolithic agents
- Bulk messages without safety caps
- Store WhatsApp auth tokens
- Over-engineer — minimal correct solution first

## OUTPUT FORMAT

For each file you create/modify:
1. State which layer it belongs to
2. List which interfaces it implements or depends on
3. Write the complete file (no placeholders or TODOs)
4. Include Zod schemas for any external data
```

---

## Feature-Specific Prompt Add-ons

### Auto-Reply Feature

```
## FEATURE: Auto-Reply

Implement auto-reply following docs/FEATURE_REQUIREMENTS.md section F1.

Create:
- src/domain/entities/auto-reply-config.ts
- src/domain/agents/reply-triage.agent.ts (interface)
- src/domain/agents/outreach.agent.ts (interface)
- src/application/use-cases/send-auto-reply.use-case.ts
- src/infrastructure/agents/reply-triage-agent.impl.ts
- src/infrastructure/llm/ollama-provider.ts
- src/infrastructure/whatsapp/dom-whatsapp-adapter.ts
- src/content/observer.ts (message detection)

Safety gates: per-chat toggle, debounce 3-5s, confidence threshold 0.75, delay 2-5s.
```

### Lead Management Feature

```
## FEATURE: Lead Management

Implement lead management following docs/FEATURE_REQUIREMENTS.md section F2.

Create:
- src/domain/entities/lead.ts (with stage FSM)
- src/domain/value-objects/phone-number.ts
- src/domain/value-objects/lead-stage.ts
- src/domain/repositories/lead.repository.ts (interface)
- src/application/use-cases/create-lead.use-case.ts
- src/application/use-cases/update-lead-stage.use-case.ts
- src/infrastructure/storage/dexie-lead-repository.ts
- src/ui/components/LeadList.tsx, LeadCard.tsx
- src/ui/hooks/use-leads.ts
```

### Bulk Follow-Up Feature

```
## FEATURE: Bulk Follow-Up

Implement bulk follow-up following docs/FEATURE_REQUIREMENTS.md section F3.

Create:
- src/domain/entities/campaign.ts
- src/domain/entities/campaign-recipient.ts
- src/application/use-cases/create-campaign.use-case.ts
- src/application/use-cases/execute-campaign-step.use-case.ts
- src/infrastructure/storage/dexie-campaign-repository.ts
- Campaign executor in service worker using chrome.alarms

SAFETY: daily cap 50, random delay 3-8s, pause/resume/cancel support.
State must survive service worker restarts.
```

### Reminders Feature

```
## FEATURE: Reminders

Implement reminders following docs/FEATURE_REQUIREMENTS.md section F4.

Create:
- src/domain/entities/reminder.ts
- src/application/use-cases/create-reminder.use-case.ts
- src/application/use-cases/handle-reminder-alarm.use-case.ts
- src/infrastructure/scheduling/chrome-alarm-scheduler.ts
- src/infrastructure/notifications/chrome-notifier.ts
- Re-register pending alarms on service worker startup.
```

---

## Cursor Rules File Map

| Rule File | Applies To | Key Enforcement |
|---|---|---|
| `project-core.mdc` | All files (`**/*`) | Architecture, SOLID, project context |
| `domain-layer.mdc` | `src/domain/**/*` | Pure logic, no framework imports |
| `application-layer.mdc` | `src/application/**/*` | Use case pattern, DTOs |
| `infrastructure-layer.mdc` | `src/infrastructure/**/*` | Adapters, mappers, Zod validation |
| `presentation-layer.mdc` | `src/ui/**/*`, `src/content/**/*` | Dumb components, hooks |
| `ai-agents.mdc` | Agent + LLM files | Supervisor pattern, safety gates |

---

## Example: Full Prompt for MVP

```
You are building a WhatsApp CRM Chrome Extension (Manifest V3).

## TASK
Scaffold the MVP with lead management and reminders:
1. WXT project setup with TypeScript + React
2. Domain entities: Lead, Reminder, PhoneNumber, LeadStage
3. Repository interfaces + Dexie implementations
4. Use cases: CreateLead, UpdateLeadStage, CreateReminder, HandleReminderAlarm
5. Service worker with alarm re-registration on startup
6. Side panel UI with lead list and reminder list
7. Content script that detects new WhatsApp chats

[Include full Master Prompt rules from above]
```

---

## Validation Checklist (Post-Generation)

After Cursor generates code, verify:

- [ ] Domain layer has zero imports from chrome/React/Dexie
- [ ] Every use case has single `execute()` method with injected interfaces
- [ ] WhatsApp interactions go through `IWhatsAppAdapter`
- [ ] LLM calls go through `ILLMProvider`
- [ ] External data validated with Zod schemas
- [ ] AI agents return `AgentHandoff<T>` with confidence
- [ ] No business logic in React components
- [ ] chrome.alarms used for scheduling (not setTimeout in service worker)
- [ ] Bulk send has daily cap and random delays
- [ ] Composition root wires all dependencies in entrypoints
