# AI-Native Architecture — Implementation TODO

Step-by-step plan to add an AI teacher/peer assistant with a right-side chat panel and semantic grading for freeform answers.

**Prerequisites:** Current activity system (envelope + `pages[]`, `renderActivity.jsx`, Electron IPC, SQLite).

**Principle:** Additive changes only. Existing activities keep working without `ai` metadata until migrated.

---

## Progress summary (as of Phase 1 complete)

| Phase | Status |
|-------|--------|
| **0** Decisions | Not started |
| **1** Shell & session | **Done** (manual smoke test optional) |
| **2** IPC & settings | **Started** — global AI on/off only (localStorage stub) |
| **3–8** | Not started |

**Shipped in Phase 1:**
- 3-pane dashboard: chapters \| activity \| assistant (slide in/out like sidebar; drawer on narrow screens)
- `ActivitySessionProvider` + `AssistantPanel` stub chat
- `WritingActivity` registers fields and syncs inputs to session
- `MultiPageActivity` reports `currentPageId` to session
- `ActivitiesStepper` parity (fullscreen dialog + assistant)
- Teacher / Peer panel toggle; **`off` persona is Settings-driven only** (not a panel button)
- Settings: **AI assistant enabled** switch (`aiSettings.js`, localStorage for now)

**Next up:** Phase 2 — Electron IPC, provider settings, mock grading through `Check my answer`.

---

## Phase 0 — Decisions (do before coding)

- [ ] **0.1** Choose default LLM provider (local Ollama vs cloud API vs both)
- [ ] **0.2** Choose completion policy defaults:
  - Teacher grading: require pass vs soft feedback + student marks complete
  - Peer activities: transcript-based vs final written summary graded
- [ ] **0.3** Define privacy copy for Settings (what leaves the device)
- [ ] **0.4** Set cost controls (grade on button only, cache TTL, max chat turns per activity)

---

## Phase 1 — Shell & session (no LLM yet) ✅

Goal: 3-pane layout, shared activity context, chat UI stub, input lifting for one activity type.

### 1.1 Activity session context

- [x] Create `src/context/ActivitySessionContext.js`
  - State: `activity`, `currentPageId`, `chatPersona` (`teacher` | `peer`), `persona` (effective: `chatPersona` or `off` when Settings disables AI), `inputs`, `attempts`, `chat`, `grading`, `status`
  - Methods: `setInput(fieldId, value)`, `registerField(fieldId, meta)`, `addChatMessage()`, `setPersona()`, `resetSession()`
- [x] Create `src/utils/buildActivityBrief.js` — compact context string from `normalizeActivity()` + current page + inputs
- [x] Export `ActivitySessionProvider`, `useActivitySession()`, `useOptionalActivitySession()`
- [x] Create `src/utils/aiPersona.js` — `CHAT_PERSONAS`, `PERSONA_OFF`, `resolvePersona()`, `isAiActive()`

### 1.2 Dashboard layout (right chat panel)

- [x] Create `src/components/AssistantPanel.js`
  - Header: Teacher / Peer toggle (disabled when AI off in Settings)
  - Message list + input + Send
  - Stub response when AI not configured (“Configure API in Settings”)
  - “Check my answer” button (stub until Phase 2; blocked when AI off in Settings)
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

## Phase 2 — Electron IPC & settings

Goal: Secure API boundary, configurable provider, stub handlers that return mock grades.

### 2.1 Settings storage

- [x] **Partial:** Global AI on/off — `src/utils/aiSettings.js` + `useAiSettings()` hook (localStorage `dib.aiEnabled`; syncs across tabs via custom event)
- [x] **Partial:** `src/pages/SettingsPage.js` — “AI assistant” enable/disable switch + short description
- [ ] Migrate AI settings to userData via main process (per-account in Phase 4?)
- [ ] Full provider fields: `provider`, `apiKey`, `model`, `baseUrl` (Ollama), `enableCloud`
- [ ] IPC: `get-settings`, `update-settings` (never expose raw key to renderer logs)

### 2.2 Preload & main handlers

- [ ] Update `js/preload.js`:
  ```js
  gradeAnswer: (payload) => ipcRenderer.invoke('ai:grade', payload)
  chat: (payload) => ipcRenderer.invoke('ai:chat', payload)
  getAiSettings: () => ipcRenderer.invoke('ai:get-settings')
  updateAiSettings: (s) => ipcRenderer.invoke('ai:update-settings', s)
  ```
- [ ] Create `js/ai-service.js` (main process)
  - `gradeAnswer(payload)` → structured JSON response
  - `chat(payload)` → assistant message
  - Provider adapter interface: `ollama`, `openai`, etc.
  - Guard: no outbound calls when `aiEnabled === false`
- [ ] Register handlers in `js/main.js`

### 2.3 Grading response contract

- [ ] Define shared types/constants in `src/utils/aiContracts.js`:
  - Grade request/response shape (`correct`, `score`, `feedback`, `corrections`, `canComplete`)
  - Chat request/response shape
- [ ] Implement mock adapter for dev (returns canned feedback)

### 2.4 Client grading service

- [ ] Create `src/services/aiGrading.js`
  - `gradeField({ fieldId, prompt, answer, rubric, modelAnswer, acceptedAnswers })`
  - Try `answerMatch.js` first when keys exist; skip LLM on exact pass
  - Call `window.api.gradeAnswer` for semantic path
  - Respect `isAiActive(persona)` before any call
  - Update session `grading[fieldId]`
- [ ] Wire `ActivitySessionContext.checkMyAnswer` → `aiGrading.gradeField`
- [ ] Wire `AssistantPanel` Send → `window.api.chat` (mock)

**Phase 2 done when:** Settings save/load works (including provider); “Check my answer” returns mock feedback through full IPC path.

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

### 3.5 AssistantPanel chat (teacher)

- [ ] Send chat via `window.api.chat` with `buildActivityBrief()` context
- [ ] Append assistant messages to session; persist (Phase 4)

**Phase 3 done when:** Writing + reading self-check activities get real AI correction; chat answers activity-aware questions.

---

## Phase 4 — Persistence

Goal: Survive refresh; enable review and cheaper re-grades.

### 4.1 SQLite schema

- [ ] Extend `js/database.js`:
  ```sql
  activity_attempts (id, user_id, chapter, activity_id, page_id, field_id, answer, grading_json, created_at)
  chat_sessions (id, user_id, chapter, activity_id, persona, messages_json, updated_at)
  activity_completion (user_id, chapter, activity_id, completed_at, summary_json)
  ```
- [ ] IPC: `save-attempt`, `load-session`, `save-chat`, `mark-activity-complete`
- [ ] Grade cache: optional column or derive from `activity_attempts`

### 4.2 Wire StudentDashboard progress

- [ ] Replace in-memory-only `completedActivities` with load on mount + save on complete
- [ ] Restore chat history when reopening same activity

### 4.3 Session hydration

- [ ] On activity select: load prior attempts + chat into `ActivitySessionProvider`
- [ ] Pre-fill inputs from last attempt

**Phase 4 done when:** Close app, reopen, same student sees prior answers and chat.

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

### Full flow (after Phase 2+)

- [ ] Settings: save API key, invalid key shows error
- [ ] Writing activity: check answer → feedback → complete activity → persists
- [ ] Reading self-check: keyword item passes without LLM; freeform item uses LLM
- [ ] Peer mode: opening message, multi-turn chat, in-character replies

---

## File map

| File | Phase | Status |
|------|-------|--------|
| `src/context/ActivitySessionContext.js` | 1 | ✅ |
| `src/components/AssistantPanel.js` | 1 | ✅ |
| `src/utils/buildActivityBrief.js` | 1 | ✅ |
| `src/utils/aiPersona.js` | 1–2 | ✅ |
| `src/utils/aiSettings.js` | 2 | ✅ partial (on/off only) |
| `src/pages/StudentDashboard.js` | 1 | ✅ |
| `src/pages/SettingsPage.js` | 2 | ✅ partial |
| `src/components/WritingActivity.js` | 1, 3 | ✅ session wired |
| `src/components/MultiPageActivity.js` | 1 | ✅ |
| `src/components/ActivitiesStepper.js` | 1 | ✅ |
| `src/utils/aiContracts.js` | 2 | — |
| `src/services/aiGrading.js` | 2 | — |
| `js/ai-service.js` | 2 | — |
| `js/ai-prompts.js` | 3 | — |
| `js/preload.js`, `js/main.js`, `js/database.js` | 2–4 | — |
| `src/components/SelfCheckReadingActivity.js` | 3 | — |
| `src/components/WorkbookActivity.js` | 7 | — |
| `scripts/activity.schema.json`, `activity-schema.mjs` | 5 | — |

---

## Suggested next PR (Phase 2 mock)

1. Phase 2.2–2.4: IPC + `ai-service.js` mock adapter + `aiContracts.js` + `aiGrading.js`
2. Wire `checkMyAnswer` and chat Send through IPC (respect `aiEnabled` / `persona`)
3. Expand Settings: provider + model fields (store in Electron userData)
4. One pilot writing activity with `ai.rubric` (Phase 5.3 partial, optional)

Phase 1 is merged; no further Phase 1 PR needed unless doing the optional manual smoke test.
