---
description: Send recent work to OpenAI Codex CLI for an independent audit/review
allowed-tools: Bash(git:*), Bash(codex:*)
---

# Codex Audit

## Gather Context

Collect the recent changes for review:

- Git diff (staged + unstaged): !`git diff HEAD`
- Recent commits on this branch: !`git log --oneline -10`
- Git status: !`git status --short`

## Your Task

1. Prepare a summary of what was changed by reviewing the diff and recent commits above.

2. Run the following command, replacing `<DIFF_SUMMARY>` with a concise description of the changes, and piping the full diff via stdin:

```
git diff HEAD | codex exec --full-auto -m "gpt-5.4" -c 'model_reasoning_effort="high"' -c 'service_tier="fast"' -s danger-full-access -C "$(pwd)" "You are a code reviewer. The following diff is piped to your stdin. Review it for: bugs, security issues, performance problems, logic errors, and style concerns. Be specific about file names and line numbers. You can read files, run tests, search the web for relevant docs, or do whatever you need for a thorough review. If everything looks good, say so. Do a deep audit and think from first principles. Leave no question unanswered. Here is context about what changed: <DIFF_SUMMARY>"
```

If `git diff HEAD` is empty (no uncommitted changes), fall back to reviewing the last commit instead:

```
git diff HEAD~1 HEAD | codex exec --full-auto -m "gpt-5.4" -c 'model_reasoning_effort="high"' -c 'service_tier="fast"' -s danger-full-access -C "$(pwd)" "You are a code reviewer. The following diff is piped to your stdin. Review it for: bugs, security issues, performance problems, logic errors, and style concerns. Be specific about file names and line numbers. You can read files, run tests, search the web for relevant docs, or do whatever you need for a thorough review. If everything looks good, say so. Here is context about what changed: <DIFF_SUMMARY>"
```

3. **Validate every finding before presenting it.** The auditor (Codex) operates with limited context. It does not know the project's vision, strategic goals, or architectural rationale. It will often invent critical issues that are misunderstandings, or overstate the severity of things that are intentional design choices. For each finding Codex returns, you MUST:
    - Check the actual source code to confirm the issue is real, not a hallucination or misread.
    - Check any local strategic/planning documents (e.g. `agents.md`, `README.md`, `CLAUDE.md`, `current_*.md`, or similar docs in the repo or in a /doc/ folder `DEV_JOURNAL.md` etc) to see if the finding conflicts with the stated project intent.
    - Ask yourself: "Is this a real bug, or is Codex misunderstanding the context?" and "Even if real, is this meaningful or is it trivial/stylistic noise?"
    - If there are findings that are not both real AND meaningful, share them with the user but clearly label them and with your reasons why.

4. Present the validated findings to the user. For each one, briefly note why you believe it's legitimate. If Codex gave the all-clear, or if all findings failed validation, say so.

5. Ask the user if they'd like to address any of the validated feedback.