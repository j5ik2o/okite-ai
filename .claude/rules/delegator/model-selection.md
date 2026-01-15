# Model Selection Guidelines

GPT experts serve as specialized consultants for complex problems. Each expert has a distinct specialty but can operate in advisory or implementation mode.

## Expert Directory

| Expert | Specialty | Best For |
|--------|-----------|----------|
| **Architect** | System design | Architecture, tradeoffs, complex debugging |
| **Plan Reviewer** | Plan validation | Reviewing plans before execution |
| **Scope Analyst** | Requirements analysis | Catching ambiguities, pre-planning |
| **Code Reviewer** | Code quality | Code review, finding bugs |
| **Security Analyst** | Security | Vulnerabilities, threat modeling, hardening |

## Operating Modes

Every expert can operate in two modes:

| Mode | Sandbox | Approval | Use When |
|------|---------|----------|----------|
| **Advisory** | `read-only` | `on-request` | Analysis, recommendations, reviews |
| **Implementation** | `workspace-write` | `on-failure` | Making changes, fixing issues |

**Key principle**: The mode is determined by the task, not the expert. An Architect can implement architectural changes. A Security Analyst can fix vulnerabilities.

## Expert Details

### Architect

**Specialty**: System design, technical strategy, complex decision-making

**When to use**:
- System design decisions
- Database schema design
- API architecture
- Multi-service interactions
- After 2+ failed fix attempts
- Tradeoff analysis

**Philosophy**: Pragmatic minimalism—simplest solution that works.

**Output format**:
- Advisory: Bottom line, action plan, effort estimate
- Implementation: Summary, files modified, verification

### Plan Reviewer

**Specialty**: Plan validation, catching gaps and ambiguities

**When to use**:
- Before starting significant work
- After creating a work plan
- Before delegating to other agents

**Philosophy**: Ruthlessly critical—finds every gap before work begins.

**Output format**: APPROVE/REJECT with justification and criteria assessment

### Scope Analyst

**Specialty**: Pre-planning analysis, requirements clarification

**When to use**:
- Before planning unfamiliar work
- When requirements feel vague
- When multiple interpretations exist
- Before irreversible decisions

**Philosophy**: Surface problems before they derail work.

**Output format**: Intent classification, findings, questions, risks, recommendation

### Code Reviewer

**Specialty**: Code quality, bugs, maintainability

**When to use**:
- Before merging significant changes
- After implementing features (self-review)
- For security-sensitive changes

**Philosophy**: Review like you'll maintain it at 2 AM during an incident.

**Output format**:
- Advisory: Issues list with APPROVE/REQUEST CHANGES/REJECT
- Implementation: Issues fixed, files modified, verification

### Security Analyst

**Specialty**: Vulnerabilities, threat modeling, security hardening

**When to use**:
- Authentication/authorization changes
- Handling sensitive data
- New API endpoints
- Third-party integrations
- Periodic security audits

**Philosophy**: Attacker's mindset—find vulnerabilities before they do.

**Output format**:
- Advisory: Threat summary, vulnerabilities, risk rating
- Implementation: Vulnerabilities fixed, files modified, verification

## Codex Parameters Reference

| Parameter | Values | Notes |
|-----------|--------|-------|
| `sandbox` | `read-only`, `workspace-write` | Set based on task, not expert |
| `approval-policy` | `on-request`, `on-failure` | Advisory uses on-request, implementation uses on-failure |
| `cwd` | path | Working directory for the task |
| `developer-instructions` | string | Expert prompt injection |

## When NOT to Delegate

- Simple questions you can answer
- First attempt at any fix
- Trivial decisions
- Research tasks (use other tools)
- When user just wants quick info
