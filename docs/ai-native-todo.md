# AI-Native Architecture — Implementation TODO

Step-by-step plan to add an AI teacher/peer assistant with a right-side chat panel and semantic grading for freeform answers.

**Prerequisites:** Current activity system (envelope + `pages[]`, `renderActivity.jsx`, Electron IPC, SQLite).

**Principle:** Additive changes only. Existing activities keep working without `ai` metadata until migrated.

---

## Chat history architecture (decided)

**Model:** Cursor-like — **one continuous timeline per student account**, not per activity. Activity is **live context** injected on each request, not the owner of chat history.

| Layer | Scope | What it holds |
|-------|--------|----------------|
| **Chat store** | Account + persona (`teacher` \| `peer`) | Durable message timeline; survives activity changes and app restart |
| **Activity session** | Current activity only | `inputs`, `fields`, `currentPageId`, grading state — resets or reloads per activity |
| **Request context** | Ephemeral | `buildActivityBrief()` + recent chat window sent to LLM on each call |

**Message shape (target):**
```json
{
  "id": "...",
  "role": "user | assistant | system",
  "content": "...",
  "at": "ISO8601",
  "activityKey": "1-11",
  "pageId": "main",
  "fieldId": "writing_task_0"
}
```
- `activityKey` / `pageId` / `fieldId` are **optional metadata** (for UI chips, filtering, grading) — not separate inboxes.
- **Do not clear chat** when the student switches activities; only update injected activity context.
- **Teacher** and **Peer** remain **two separate global threads** (already in UI); both are account-scoped.

**UI (later):** Optional message chip (“Aktivität 7”); optional filter “current activity only” — not separate chat rooms.

**Not in scope for default:** Per-activity isolated threads (assessment mode could add `scope: 'activity'` later).

**Current gap (Phase 1):** `chatsByPersona` lives inside `ActivitySessionProvider` and resets on activity change. Phase 4 lifts chat to account scope and persists to SQLite.

---

## Grading architecture (decided)

Two separate paths — **automatic never uses AI**; **AI never overrides automatic keys**.

| Path | When | AI required? | Where it runs |
|------|------|--------------|---------------|
| **Automatic** | Field has `acceptedAnswers` or `keywords` in JSON | No | Renderer (`answerMatch.js` + check handler) |
| **AI** | Freeform fields (no automatic keys) | Yes | Main process via IPC (`services/aiGrading.js` → `ai-service.js`) |

- If automatic keys exist → only rule-based check; wrong answers prompt student to **ask teacher in chat** for clarification (no AI grade on that field).
- If AI is off and field is freeform → “Check my answer” explains AI is needed; chat still off until AI enabled.
- Providers: `mock` \| `local` \| `remote` (not vendor-specific names).

---

## Progress summary (as of Phase 2 complete)

| Phase | Status |
|-------|--------|
| **0** Decisions | Partial (0.5 chat model decided) |
| **1** Shell & session | **Done** |
| **2** IPC & settings | **Done** (mock provider; real LLM in Phase 3) |
| **3–8** | Not started |

**Shipped in Phase 2:**
- Electron IPC: `ai:grade`, `ai:chat`, `ai:get-settings`, `ai:update-settings`
- `js/ai-settings-store.js` — settings in userData (`ai-settings.json`); apiKey never sent to renderer
- `js/ai-service.js` — mock teacher grading + mock chat; guards when AI disabled
- `src/utils/aiContracts.js`, `src/services/aiGrading.js`, `src/services/aiChat.js`
- Settings page: provider, model, base URL, API key, cloud toggle
- **Check my answer** → IPC mock grade; **Send** → IPC mock chat (includes activity brief)
- Browser-only fallback when not running in Electron

**Known limitation until Phase 4:** Chat history still resets on activity change (in-memory, activity-scoped provider).

**Next up:** Phase 3 — real Ollama/cloud adapters + SelfCheckReadingActivity grading.

---

## Phase 0 — Decisions (do before coding)

- [ ] **0.1** Choose default LLM provider (local Ollama vs cloud API vs both)
- [ ] **0.2** Choose completion policy defaults:
  - Teacher grading: require pass vs soft feedback + student marks complete
  - Peer activities: transcript-based vs final written summary graded
- [ ] **0.3** Define privacy copy for Settings (what leaves the device)
- [ ] **0.4** Set cost controls (grade on button only, cache TTL, max chat turns per activity)
- [x] **0.5** Chat history model: **global per account**, split by persona; activity as injected context + message metadata (see above)

---

## Phase 1 — Shell & session (no LLM yet) ✅

Goal: 3-pane layout, shared activity context, chat UI stub, input lifting for one activity type.

### 1.1 Activity session context

- [x] Create `src/context/ActivitySessionContext.js`
  - Activity-scoped: `activity`, `currentPageId`, `inputs`, `fields`, `attempts`, `grading`, `status`
  - Chat (interim): `chatsByPersona`, `chatPersona`, effective `persona` (`chatPersona` or `off` via Settings)
  - Methods: `setInput()`, `registerField()`, `addChatMessage()`, `setPersona()`, `resetSession()`
  - **Phase 4:** move `chatsByPersona` → account-level store; keep activity state here
- [x] Create `src/utils/buildActivityBrief.js` — compact context string from `normalizeActivity()` + current page + inputs
- [x] Export `ActivitySessionProvider`, `useActivitySession()`, `useOptionalActivitySession()`
- [x] Create `src/utils/aiPersona.js` — `CHAT_PERSONAS`, `PERSONA_OFF`, `resolvePersona()`, `isAiActive()`, `createEmptyChats()`

### 1.2 Dashboard layout (right chat panel)

- [x] Create `src/components/AssistantPanel.js`
  - Header: Teacher / Peer toggle (disabled when AI off in Settings)
  - Message list + input + Send
  - Stub response when AI not configured (“Configure API in Settings”)
  - “Check my answer” button → IPC mock grade (Phase 2)
  - Slide in/out animation matching chapter sidebar (width transition on wide screens)
- [x] Update `src/pages/StudentDashboard.js`
  - Wrap selected activity in `ActivitySessionProvider`
  - Split main area: `activity pane | AssistantPanel` (~360px, collapsible)
  - Mirror sidebar pattern: drawer on narrow screens
- [x] Add panel visibility toggle to toolbar (Show/Hide assistant)

### 1.3 Wire session to activity router

- [x] Components consume session via `useOptionalActivitySession()` hook (no prop drilling through `renderActivity.jsx`)
- [x] Update `src/components/MultiPageActivity.js`
  - Report `currentPageId` to session on page change

### 1.4 First activity integration (WritingActivity)

- [x] Update `src/components/WritingActivity.js`
  - Register each task/speaker field with stable `fieldId`s via session hook
  - Sync `inputs` to session on change
  - Honor-system completion kept as fallback until Phase 2 grading
- [ ] Manual test: open Ch1 writing activity, type in fields, confirm session state updates and chat panel renders

### 1.5 ActivitiesStepper parity

- [x] Wrap `ActivitiesStepper` fullscreen dialog content in same `ActivitySessionProvider` + `AssistantPanel` (drawer on mobile)

**Phase 1 done when:** Student can work an activity with chat panel visible; inputs live in session; no API calls yet. ✅

---

## Phase 2 — Electron IPC & settings ✅

Goal: Secure API boundary, configurable provider, stub handlers that return mock grades.

### 2.1 Settings storage

- [x] Global AI on/off + provider settings via `js/ai-settings-store.js` (Electron `userData/ai-settings.json`)
- [x] `src/utils/aiSettings.js` — `useAiSettings()` loads/saves through IPC; localStorage fallback in browser-only dev
- [x] `src/pages/SettingsPage.js` — enable switch, provider, model, base URL, API key, cloud toggle
- [x] IPC: `ai:get-settings`, `ai:update-settings` (apiKey masked as `hasApiKey` in renderer)

### 2.2 Preload & main handlers

- [x] Update `js/preload.js` — `gradeAnswer`, `chat`, `getAiSettings`, `updateAiSettings`
- [x] Create `js/ai-service.js` — mock `gradeAnswer` + `chat`; provider switch (`mock` default)
- [x] Create `js/register-ai-handlers.js`; register in `js/main.js`
- [x] Guard: no outbound calls when `aiEnabled === false`

### 2.3 Grading response contract

- [x] `src/utils/aiContracts.js` — grade/chat request/response shapes, `AI_PROVIDERS`, helpers
- [x] Mock adapter in `js/ai-service.js`

### 2.4 Client grading service

- [x] `src/services/aiGrading.js` — `gradeField`, `gradeSessionFields`; exact match via `answerMatch` first
- [x] `src/services/aiChat.js` — `sendChatMessage`
- [x] `ActivitySessionContext.checkMyAnswer` → `gradeSessionFields` → teacher thread
- [x] `AssistantPanel` Send → `sendChatMessage` via IPC; loading states

**Phase 2 done when:** Settings save/load works; “Check my answer” returns mock feedback through full IPC path. ✅

---

## Phase 3 — Teacher grading (real LLM)

Goal: Semantic correction for freeform writing and reading self-check.

### 3.1 Prompt templates

- [ ] Create `js/ai-prompts.js`
  - Teacher system prompt (German instructor, concise, encouraging)
  - Grade user prompt template (prompt + student answer + rubric + model answer)
  - Require JSON output schema from model

### 3.2 Implement provider adapter(s)

- [ ] Ollama adapter (local dev)
- [ ] Cloud adapter (production) — pick one to start
- [ ] Error handling: timeout, rate limit, invalid JSON → user-visible message in chat panel

### 3.3 Connect WritingActivity to grading

- [ ] “Check my answer” / per-field check → `aiGrading.gradeField`
- [ ] Show feedback inline (field border) and in AssistantPanel
- [ ] Completion: respect `ai.requirePass` when present, else current honor-system

### 3.4 Connect SelfCheckReadingActivity

- [ ] Register each `readingItems[].id` as session field
- [ ] Replace or augment `answerMatch` path with semantic grading when `ai.grading === 'semantic'` or no keywords
- [ ] Keep keyword/exact path as fast pre-check

### 3.5 AssistantPanel chat (teacher & peer)

- [ ] Send chat via `window.api.chat` with:
  - Global thread for active `chatPersona`
  - `buildActivityBrief()` for **current** activity (even if student asks about a past one, model can use full thread)
  - Stamp outgoing messages with `activityKey` / `pageId` when available
- [ ] Append assistant replies to the same persona thread; persist (Phase 4)

**Phase 3 done when:** Writing + reading self-check activities get real AI correction; chat is activity-aware via context injection, not separate per-activity histories.

---

## Phase 4 — Persistence & global chat

Goal: Survive refresh; global chat per account; activity-scoped answers/grading where needed.

### 4.1 Split session vs chat store

- [ ] Create `src/context/ChatHistoryContext.js` (or lift into account-level provider on dashboard)
  - Keyed by `user_id` + `persona` (`teacher` | `peer`) — **not** by activity
  - Load on account login / dashboard mount; survives activity navigation
- [ ] Refactor `ActivitySessionProvider`: activity fields only; consume chat from account store
- [ ] `StudentDashboard`: wrap with chat provider at account level (above activity selection)

### 4.2 SQLite schema

- [ ] Extend `js/database.js`:
  ```sql
  -- Global chat timeline (append-only messages)
  chat_messages (
    id, user_id, persona, role, content,
    activity_key, page_id, field_id,  -- nullable metadata
    created_at
  )

  -- Activity-scoped student work (not chat)
  activity_attempts (
    id, user_id, chapter, activity_id, page_id, field_id,
    answer, grading_json, created_at
  )

  activity_completion (
    user_id, chapter, activity_id, completed_at, summary_json
  )
  ```
- [ ] IPC: `append-chat-message`, `load-chat-history`, `save-attempt`, `load-attempts`, `mark-activity-complete`
- [ ] Grade cache: derive from `activity_attempts` or optional cache table
- [ ] Index: `(user_id, persona, created_at)` for chat; `(user_id, activity_key)` for optional filter

### 4.3 Wire StudentDashboard progress

- [ ] Replace in-memory-only `completedActivities` with load on mount + save on complete

### 4.4 Hydration rules

- [ ] **Chat:** load full persona thread(s) once per account session; append on send/grade
- [ ] **Activity inputs:** on activity select, load latest `activity_attempts` for that `activity_key` only; pre-fill fields
- [ ] Switching activities: chat **unchanged**; activity brief updates for next AI call
- [ ] Optional UI: activity chip on messages; filter toggle “This activity only”

**Phase 4 done when:** Close app, reopen — same student sees continuous teacher/peer chat across activities, plus restored field answers per activity.

---

## Phase 5 — JSON schema & validator

Goal: Curriculum authors can opt activities into AI behavior.

### 5.1 Schema additions

- [ ] Update `scripts/activity.schema.json` and `scripts/activity-schema.mjs`:
  ```json
  "ai": {
    "grading": "exact | keywords | semantic | honor",
    "requirePass": false,
    "rubric": "string",
    "allowHints": 3,
    "peerScenario": { "role": "string", "opening": "string" }
  }
  ```
- [ ] Allow `ai` on page level and optionally per task/reading item

### 5.2 Defaults in normalizer

- [ ] Update `src/utils/normalizeActivity.js` — merge page `ai` with sensible defaults by `type`:
  - `writing` → `semantic`
  - `reading_self_check` → `keywords` if keys exist, else `semantic`
  - `multiple_choice`, `matching_activity` → no AI grading
  - `prompt` → `honor` + peer-capable

### 5.3 Pilot content migration

- [ ] Add `ai` blocks to 2–3 pilot activities (one writing, one reading, one prompt/interview)
- [ ] Run `npm run validate:activities`

**Phase 5 done when:** Validator accepts `ai` metadata; pilot activities behave differently by config.

---

## Phase 6 — Peer mode

Goal: AI classmate for partner/oral-style activities.

### 6.1 Peer persona

- [ ] Add peer system prompt in `js/ai-prompts.js` (stay in character, B1 German, ask follow-ups)
- [x] Persona toggle in AssistantPanel switches UI label (Teacher / Peer) — prompts wired in Phase 3/6

### 6.2 Peer scenarios from JSON

- [ ] Read `ai.peerScenario.opening` to seed first assistant message
- [ ] Target activity types: `prompt`, interview-style `writing`, group activity prompts

### 6.3 Completion for peer activities

- [ ] Define rule: e.g. N exchanges completed + optional final summary field graded by teacher persona
- [ ] UI: “End conversation & write summary” flow where applicable

**Phase 6 done when:** At least one partner activity works end-to-end in peer mode.

---

## Phase 7 — Workbook & remaining types

Goal: Freeform blocks inside workbook; consistent grading everywhere it matters.

### 7.1 WorkbookActivity

- [ ] Register workbook blocks with ids (`text`, `cloze`, optionally `multi`) to session
- [ ] Per-block “Check” when `ai.grading` is semantic
- [ ] Leave TF/MC/multi as local deterministic grading (implement scoring if not already)

### 7.2 ClozeActivity

- [ ] Semantic or exact per blank via `ai` on page or line

### 7.3 PromptActivity

- [ ] Peer mode default when `peerScenario` present
- [ ] Optional reflection text field with teacher grading

**Phase 7 done when:** Workbook text/cloze and prompts participate in AI flow.

---

## Phase 8 — Polish & production readiness

- [ ] Streaming chat responses in AssistantPanel
- [ ] Loading states, cancel in-flight requests
- [ ] Hint budget (`allowHints`) before revealing model answer
- [ ] Offline mode: disable cloud, show “local model only” banner
- [ ] Telemetry/logging (main process only, no PII in logs)
- [ ] Documentation: teacher-facing note on AI limits
- [ ] E2E manual test checklist (below)

---

## Manual test checklist

### Phase 1 (can verify now)

- [ ] Writing activity: type in fields; “Check my answer” appears when fields registered
- [x] Settings: AI assistant toggle disables chat input and “Check my answer”
- [x] Multi-page activity: session receives `currentPageId` on page change
- [x] Narrow viewport: assistant drawer works
- [x] Wide viewport: assistant slides in/out like chapter sidebar
- [x] ActivitiesStepper dialog: assistant + session same as dashboard
- [x] No API configured: stub chat reply, no crash
- [x] Persona `off` only via Settings (no redundant Off button in panel)

- [x] Teacher vs peer: separate threads; switching persona does not mix messages
- [ ] Switch activity and back: chat **still lost** until Phase 4 (expected)

### Phase 2 (verify in Electron app)

- [ ] Settings: provider/model persist after reload
- [ ] Settings: AI off → chat and check return disabled error
- [ ] Writing activity: type answer → Check my answer → mock teacher feedback in thread
- [ ] Send chat message → mock reply mentions activity context
- [ ] Switch Teacher/Peer → separate threads; each gets mock replies

### Full flow (after Phase 3+)

- [ ] Settings: save API key, invalid key shows error
- [ ] Writing activity: check answer → feedback → complete activity → persists
- [ ] Reading self-check: keyword item passes without LLM; freeform item uses LLM
- [ ] Peer mode: opening message, multi-turn chat, in-character replies

### After Phase 4 (global chat)

- [ ] Chat persists when switching activities and returning
- [ ] Chat persists across app restart (same account)
- [ ] Message from Aktivität 7 shows activity metadata; thread continues on Aktivität 12
- [ ] Field answers restore per activity; chat stays global

---

## File map

| File | Phase | Status |
|------|-------|--------|
| `src/context/ActivitySessionContext.js` | 1, 4 | ✅ activity scope; chat moves in 4 |
| `src/context/ChatHistoryContext.js` | 4 | — account-global chat |
| `src/components/AssistantPanel.js` | 1 | ✅ |
| `src/utils/buildActivityBrief.js` | 1 | ✅ |
| `src/utils/aiPersona.js` | 1–2 | ✅ |
| `src/utils/aiSettings.js` | 2 | ✅ |
| `src/pages/StudentDashboard.js` | 1 | ✅ |
| `src/pages/SettingsPage.js` | 2 | ✅ |
| `src/components/WritingActivity.js` | 1, 3 | ✅ session wired |
| `src/components/MultiPageActivity.js` | 1 | ✅ |
| `src/components/ActivitiesStepper.js` | 1 | ✅ |
| `src/utils/aiContracts.js` | 2 | ✅ |
| `src/utils/answerMatch.js` | 2 | ✅ (+ automatic key checks) |
| `src/services/aiGrading.js` | 2 | ✅ (AI IPC + check routing) |
| `src/services/aiChat.js` | 2 | ✅ |
| `js/ai-settings-store.js` | 2 | ✅ |
| `js/ai-service.js` | 2 | ✅ |
| `js/register-ai-handlers.js` | 2 | ✅ |
| `js/preload.js`, `js/main.js` | 2 | ✅ |
| `js/database.js` | 4 | — |
| `js/ai-prompts.js` | 3 | — |
| `src/components/SelfCheckReadingActivity.js` | 3 | — |
| `src/components/WorkbookActivity.js` | 7 | — |
| `scripts/activity.schema.json`, `activity-schema.mjs` | 5 | — |

---

## Suggested next PR (Phase 3)

1. `js/ai-prompts.js` + Ollama adapter (or one cloud provider)
2. Wire real LLM into `gradeAnswer` / `chat` when provider ≠ `mock`
3. `SelfCheckReadingActivity` session fields + semantic grading
4. Optional: pilot activity with `ai.rubric` (Phase 5.3 partial)

**Phase 4 PR (after 3):** Lift chat to `ChatHistoryContext` + SQLite `chat_messages`; stop resetting chat on activity change.
