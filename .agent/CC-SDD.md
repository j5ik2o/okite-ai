# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Memory

Project memory keeps persistent guidance (steering, specs notes, component docs) so Codex honors your standards each run. Treat it as the long-lived source of truth for patterns, conventions, and decisions.

- Use `.kiro/steering/` for project-wide policies: architecture principles, naming schemes, security constraints, tech stack decisions, api standards, etc.
- Use local `AGENTS.md` files for feature or library context (e.g. `src/lib/payments/AGENTS.md`): describe domain assumptions, API contracts, or testing conventions specific to that folder. Codex auto-loads these when working in the matching path.
- Specs notes stay with each spec (under `.kiro/specs/`) to guide specification-level workflows.

## Project Context

### Paths

- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications

- Check `.kiro/specs/` for active specifications
- Use `/kiro-spec-status [feature-name]` to check progress

## Development Guidelines

- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow

- Phase 0 (optional): `/kiro-steering`, `/kiro-steering-custom`
- Phase 1 (Specification):
  - `/kiro-spec-init "description"`
  - `/kiro-spec-requirements {feature}`
  - `/kiro-validate-gap {feature}` (optional: for existing codebase)
  - `/kiro-spec-design {feature} [-y]`
  - `/kiro-validate-design {feature}` (optional: design review)
  - `/kiro-spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/prompts:kiro-spec-impl {feature} [tasks]`
  - `/kiro-validate-impl {feature}` (optional: after implementation)
- Progress check: `/prompts:kiro-spec-status {feature}` (use anytime)

## Development Rules

- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro-spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration

- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro-steering-custom`)
