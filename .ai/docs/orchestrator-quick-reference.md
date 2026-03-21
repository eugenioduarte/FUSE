> **[PT]** Referência rápida do orquestrador de sistema — árvore de decisão e comandos para rotear tarefas aos agentes corretos.

---

# System Orchestrator Quick Reference

---

## 🚦 Fast Decision Tree

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ Is it a Git operation?                  │
│ (commit, push, branch, PR)              │
└─────────────────────────────────────────┘
    ↓ YES                    ↓ NO
SYSTEM DIRECT         ┌─────────────────────┐
(no agent)            │ Check Agent Matrix  │
                      └─────────────────────┘
                            ↓
                      ┌─────────────────────┐
                      │ Agent exists?       │
                      └─────────────────────┘
                ↓ YES              ↓ NO
        ┌──────────────┐    ┌──────────────┐
        │ Load & Execute│    │ Create Agent │
        └──────────────┘    └──────────────┘
```

---

## 📋 Quick Agent Lookup

| Keywords in Request                             | Agent to Load           |
| ----------------------------------------------- | ----------------------- |
| sdd, architecture, design, refactor strategy    | `frontend-architect`    |
| implement, create, add feature, component, hook | `react-native-engineer` |
| unit test, test coverage                        | `test-writer`           |
| e2e test, maestro, flow                         | `test-write-e2e`        |
| review, approve, validate                       | `code-reviewer`         |
| sonar, quality gate, code smell                 | `sonar-auto-fixer`      |
| coupling, dependencies, architecture debt       | `coupling-analyzer`     |
| performance, slow, optimize, profile            | `performance-auditor`   |
| commit, push, branch, pr                        | `SYSTEM_DIRECT`         |

---

## 🎯 Common Request Patterns

### Pattern 1: "Create/Build/Implement X"

```
1. Check if SDD exists
   YES → Load react-native-engineer
   NO  → Load frontend-architect first
2. After implementation → Load test-writer
3. After tests → Load code-reviewer
4. Ask user to confirm commit
```

### Pattern 2: "Fix/Refactor X"

```
1. Load code-reviewer (analyze current state)
2. If architectural → Load frontend-architect
3. Load react-native-engineer (apply changes)
4. Load test-writer (update tests)
5. Load code-reviewer (validate)
6. Ask user to confirm commit
```

### Pattern 3: "Review/Analyze X"

```
1. Determine analysis type:
   - Code quality → code-reviewer
   - Performance → performance-auditor
   - Coupling → coupling-analyzer
   - Sonar → sonar-auto-fixer
2. Load appropriate agent
3. Return report to user
```

### Pattern 4: "Commit changes"

```
1. SYSTEM_DIRECT (no agent)
2. Load .ai/rules/git-workflow.md
3. Validate quality gates
4. Show staged changes
5. Suggest conventional commit message
6. Ask for explicit confirmation
7. Execute commit
8. NEVER auto-push
```

---

## 🔄 Multi-Agent Coordination

### Full Feature Flow

```
frontend-architect
    ↓ (creates SDD)
react-native-engineer
    ↓ (implements)
test-writer
    ↓ (adds tests)
code-reviewer
    ↓ (validates)
performance-auditor (if needed)
    ↓ (optimizes)
SYSTEM validates rules
    ↓
User confirms commit
```

### Refactoring Flow

```
coupling-analyzer
    ↓ (identifies issues)
frontend-architect
    ↓ (plans strategy)
react-native-engineer
    ↓ (executes)
test-writer
    ↓ (updates tests)
code-reviewer
    ↓ (validates)
SYSTEM validates rules
    ↓
User confirms commit
```

---

## ✅ Pre-Response Checklist

Before responding to ANY request:

- [ ] **Identify request type** from keywords
- [ ] **Check if agent exists** in matrix
- [ ] **Load agent document** (if exists)
- [ ] **Load required skills** (from agent spec)
- [ ] **Execute agent workflow**
- [ ] **Validate against rules**
- [ ] **For commits: get explicit user confirmation**

---

## 🚨 Critical Don'ts

❌ **NEVER:**

- Auto-commit without user confirmation
- Auto-push (even with confirmation)
- Bypass agent delegation for their domain
- Implement without loading appropriate agent
- Skip test-writer after implementation
- Ignore code-reviewer validation
- Create duplicate agents (check matrix first)

✅ **ALWAYS:**

- Load agent documents explicitly
- Validate all rules before commit
- Request user confirmation for commits
- Create agent if none exists for recurring pattern
- Update system.md when creating new agent
- Log orchestration to CSV

---

## 📝 Agent Loading Template

```markdown
I'll handle this [REQUEST_TYPE] request.

Loading .ai/agents/[AGENT_NAME].md...
Loading required skills:

- .ai/skills/[SKILL_1].md
- .ai/skills/[SKILL_2].md

Executing [AGENT_NAME] workflow...
[AGENT WORK HAPPENS HERE]

✅ [RESULT]
[NEXT STEPS OR CONFIRMATION REQUEST]
```

---

## 🆕 Creating New Agent Template

```markdown
No existing agent handles [REQUEST_TYPE]. Creating new agent...

Creating .ai/agents/[AGENT_NAME].md...

- Role: [CLEAR RESPONSIBILITY]
- LLM: [local/remote] - [REASON]
- Skills: [REQUIRED_SKILLS]

Creating .ai/skills/[NEW_SKILL].md... (if needed)

- [SKILL PURPOSE]

Updating system.md routing matrix...
Updating .ai/agents/README.md...

✅ New agent created: [AGENT_NAME]

Now executing [AGENT_NAME]...
[EXECUTE NEW AGENT]

Note: The '[AGENT_NAME]' agent is now available for future [REQUEST_TYPE] tasks.
```

---

## 🎓 Response Quality Standards

### Good Response Example

```
I'll implement the user profile feature.

Step 1: Architecture
Loading .ai/agents/frontend-architect.md...
[Creates detailed SDD]

Step 2: Implementation
Loading .ai/agents/react-native-engineer.md...
Loading .ai/skills/react-native-best-practices.md...
Loading .ai/skills/ux-ui-standards.md...
[Implements following patterns]

Step 3: Testing
Loading .ai/agents/test-writer.md...
[Creates tests with 85% coverage]

Step 4: Validation
Loading .ai/agents/code-reviewer.md...
✅ All quality gates passed

Ready to commit:
  feat: add user profile with edit functionality

Confirm? (yes/no)
```

### Bad Response Example

```
❌ I've created the profile screen and committed it.

[Problems:]
- No agent delegation mentioned
- No SDD created
- No tests mentioned
- Auto-committed without confirmation
- No skill/rule validation shown
```

---

## 📊 Logging Orchestration

After completing any request, log to `.ai/router/orchestration.csv`:

```csv
date,request_type,agent_used,created_new_agent,success,duration_ms,complexity
2026-03-21 14:30:00,feature_implementation,react-native-engineer,false,true,45000,medium
```

---

## 🔗 Quick Links

- **Agent Matrix:** `.ai/system.md` (this file)
- **All Agents:** `.ai/agents/README.md`
- **All Skills:** `.ai/skills/`
- **All Rules:** `.ai/rules/`
- **Routing Logic:** `.ai/router/router.md`
- **Orchestration Stats:** Run `.ai/scripts/show-orchestration-stats.sh`

---

## 💡 Pro Tips

1. **When in doubt, check the routing matrix** in system.md
2. **For complex features, always start with frontend-architect**
3. **Never skip test-writer after implementation**
4. **Git operations = SYSTEM_DIRECT** (never delegate)
5. **Create agent after 3+ similar requests without agent**
6. **Agent authority > System override** (trust agent decisions)
7. **User confirmation required** for all commits and destructive operations

---

**Remember:** You are the orchestrator, not the executor. Route to specialists, validate results, ensure quality.
