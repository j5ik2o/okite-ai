---
description: Create comprehensive technical design for a specification
allowed-tools: Read, Task
argument-hint: <feature-name> [-y]
---

# Technical Design Generator

## Parse Arguments

- Feature name: `$1`
- Auto-approve flag: `$2` (optional, "-y")

## Validate

Check that requirements have been completed:

- Verify `.kiro/specs/$1/` exists
- Verify `.kiro/specs/$1/requirements.md` exists

If validation fails, inform user to complete requirements phase first.

## Invoke Subagent

Delegate design generation to spec-design-agent:

Use the Task tool to invoke the Subagent with file path patterns:

```
Task(
  subagent_type="spec-design-agent",
  description="Generate technical design and update research log",
  prompt="""
Feature: $1
Spec directory: .kiro/specs/$1/
Auto-approve: {true if $2 == "-y", else false}

File patterns to read:
- .kiro/specs/$1/*.{json,md}
- .kiro/steering/*.md
- .kiro/settings/rules/design-*.md
- .kiro/settings/templates/specs/design.md
- .kiro/settings/templates/specs/research.md

Discovery: auto-detect based on requirements
Mode: {generate or merge based on design.md existence}
Language: respect spec.json language for design.md/research.md outputs
"""
)
```

## Display Result

Show Subagent summary to user, then provide next step guidance:

### Next Phase: Task Generation

**If Design Approved**:

- Review generated design at `.kiro/specs/$1/design.md`
- **Optional**: Run `/kiro:validate-design $1` for interactive quality review
- Then `/kiro:spec-tasks $1 -y` to generate implementation tasks

**If Modifications Needed**:

- Provide feedback and re-run `/kiro:spec-design $1`
- Existing design used as reference (merge mode)

**Note**: Design approval is mandatory before proceeding to task generation.
