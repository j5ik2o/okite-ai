# Model Orchestration

You have access to GPT experts via MCP tools. Use them strategically based on these guidelines.

## Available Tools

| Tool | Provider | Use For |
|------|----------|---------|
| `mcp__codex__codex` | GPT | Delegate to an expert (stateless) |

> **Note:** `codex-reply` exists but requires a session ID not currently exposed to Claude Code. Each delegation is independent—include full context in every call.

## Available Experts

| Expert | Specialty | Prompt File |
|--------|-----------|-------------|
| **Architect** | System design, tradeoffs, complex debugging | `${CLAUDE_PLUGIN_ROOT}/prompts/architect.md` |
| **Plan Reviewer** | Plan validation before execution | `${CLAUDE_PLUGIN_ROOT}/prompts/plan-reviewer.md` |
| **Scope Analyst** | Pre-planning, catching ambiguities | `${CLAUDE_PLUGIN_ROOT}/prompts/scope-analyst.md` |
| **Code Reviewer** | Code quality, bugs, security issues | `${CLAUDE_PLUGIN_ROOT}/prompts/code-reviewer.md` |
| **Security Analyst** | Vulnerabilities, threat modeling | `${CLAUDE_PLUGIN_ROOT}/prompts/security-analyst.md` |

---

## Stateless Design

**Each delegation is independent.** The expert has no memory of previous calls.

**Implications:**
- Include ALL relevant context in every delegation prompt
- For retries, include what was attempted and what failed
- Don't assume the expert remembers previous interactions

**Why:** Codex MCP returns session IDs in event notifications, but Claude Code only surfaces the final text response. Until this changes, treat each call as fresh.

---

## PROACTIVE Delegation (Check on EVERY message)

Before handling any request, check if an expert would help:

| Signal | Expert |
|--------|--------|
| Architecture/design decision | Architect |
| 2+ failed fix attempts on same issue | Architect (fresh perspective) |
| "Review this plan", "validate approach" | Plan Reviewer |
| Vague/ambiguous requirements | Scope Analyst |
| "Review this code", "find issues" | Code Reviewer |
| Security concerns, "is this secure" | Security Analyst |

**If a signal matches → delegate to the appropriate expert.**

---

## REACTIVE Delegation (Explicit User Request)

When user explicitly requests GPT/Codex:

| User Says | Action |
|-----------|--------|
| "ask GPT", "consult GPT", "ask codex" | Identify task type → route to appropriate expert |
| "ask GPT to review the architecture" | Delegate to Architect |
| "have GPT review this code" | Delegate to Code Reviewer |
| "GPT security review" | Delegate to Security Analyst |

**Always honor explicit requests.**

---

## Delegation Flow (Step-by-Step)

When delegation is triggered:

### Step 1: Identify Expert
Match the task to the appropriate expert based on triggers.

### Step 2: Read Expert Prompt
**CRITICAL**: Read the expert's prompt file to get their system instructions:

```
Read ${CLAUDE_PLUGIN_ROOT}/prompts/[expert].md
```

For example, for Architect: `Read ${CLAUDE_PLUGIN_ROOT}/prompts/architect.md`

### Step 3: Determine Mode
| Task Type | Mode | Sandbox |
|-----------|------|---------|
| Analysis, review, recommendations | Advisory | `read-only` |
| Make changes, fix issues, implement | Implementation | `workspace-write` |

### Step 4: Notify User
Always inform the user before delegating:
```
Delegating to [Expert Name]: [brief task summary]
```

### Step 5: Build Delegation Prompt
Use the 7-section format from `rules/delegation-format.md`.

**IMPORTANT:** Since each call is stateless, include FULL context:
- What the user asked for
- Relevant code/files
- Any previous attempts and their results (for retries)

### Step 6: Call the Expert
```typescript
mcp__codex__codex({
  prompt: "[your 7-section delegation prompt with FULL context]",
  "developer-instructions": "[contents of the expert's prompt file]",
  sandbox: "[read-only or workspace-write based on mode]",
  cwd: "[current working directory]"
})
```

### Step 7: Handle Response
1. **Synthesize** - Never show raw output directly
2. **Extract insights** - Key recommendations, issues, changes
3. **Apply judgment** - Experts can be wrong; evaluate critically
4. **Verify implementation** - For implementation mode, confirm changes work

---

## Retry Flow (Implementation Mode)

When implementation fails verification, retry with a NEW call including error context:

```
Attempt 1 → Verify → [Fail]
     ↓
Attempt 2 (new call with: original task + what was tried + error details) → Verify → [Fail]
     ↓
Attempt 3 (new call with: full history of attempts) → Verify → [Fail]
     ↓
Escalate to user
```

### Retry Prompt Template

```markdown
TASK: [Original task]

PREVIOUS ATTEMPT:
- What was done: [summary of changes made]
- Error encountered: [exact error message]
- Files modified: [list]

CONTEXT:
- [Full original context]

REQUIREMENTS:
- Fix the error from the previous attempt
- [Original requirements]
```

**Key:** Each retry is a fresh call. The expert doesn't know what happened before unless you tell them.

---

## Example: Architecture Question

User: "What are the tradeoffs of Redis vs in-memory caching?"

**Step 1**: Signal matches "Architecture decision" → Architect

**Step 2**: Read `${CLAUDE_PLUGIN_ROOT}/prompts/architect.md`

**Step 3**: Advisory mode (question, not implementation) → `read-only`

**Step 4**: "Delegating to Architect: Analyze caching tradeoffs"

**Step 5-6**:
```typescript
mcp__codex__codex({
  prompt: `TASK: Analyze tradeoffs between Redis and in-memory caching for [context].
EXPECTED OUTCOME: Clear recommendation with rationale.
CONTEXT: [user's situation, full details]
...`,
  "developer-instructions": "[contents of architect.md]",
  sandbox: "read-only"
})
```

**Step 7**: Synthesize response, add your assessment.

---

## Example: Retry After Failed Implementation

First attempt failed with "TypeError: Cannot read property 'x' of undefined"

**Retry call:**
```typescript
mcp__codex__codex({
  prompt: `TASK: Add input validation to the user registration endpoint.

PREVIOUS ATTEMPT:
- Added validation middleware to routes/auth.ts
- Error: TypeError: Cannot read property 'x' of undefined at line 45
- The middleware was added but req.body was undefined

CONTEXT:
- Express 4.x application
- Body parser middleware exists in app.ts
- [relevant code snippets]

REQUIREMENTS:
- Fix the undefined req.body issue
- Ensure validation runs after body parser
- Report all files modified`,
  "developer-instructions": "[contents of code-reviewer.md or architect.md]",
  sandbox: "workspace-write",
  cwd: "/path/to/project"
})
```

---

## Cost Awareness

- **Don't spam** - One well-structured delegation beats multiple vague ones
- **Include full context** - Saves retry costs from missing information
- **Reserve for high-value tasks** - Architecture, security, complex analysis

---

## Anti-Patterns

| Don't Do This | Do This Instead |
|---------------|-----------------|
| Delegate trivial questions | Answer directly |
| Show raw expert output | Synthesize and interpret |
| Delegate without reading prompt file | ALWAYS read and inject expert prompt |
| Skip user notification | ALWAYS notify before delegating |
| Retry without including error context | Include FULL history of what was tried |
| Assume expert remembers previous calls | Include all context in every call |
