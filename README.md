
# Algorithms of Thought (AOT) for Roam Research

Algorithms of Thought (AOT) is a Roam Research extension that provides **structured thinking scaffolds** — lightweight, repeatable prompts that help you reason more clearly about decisions, problems, trade-offs, and next actions.

AOTs are **not automation** and **not AI**. They are intentional cognitive tools: small, named thinking patterns that you can invoke exactly when you need them. Their value is obtained through structured thought, not by having the thinking done for you.

You can trigger AOTs via:
- **Command Palette**
- **Roam hotkeys**
- **SmartBlocks flows**

---

## Recent Updates (Architecture & Safety)

This extension has been **substantially rewritten** to improve robustness, predictability, and safety — especially under heavy SmartBlocks and Command Palette usage.

### What changed

- **Unified execution engine**  
  All AOTs now run through a single, consistent execution pathway.

- **Safer cancellation & cleanup**
  Cancelling an AOT no longer leaves partial structure behind or overwrites content.

- **Focus-aware behavior**
  The engine respects block focus state and avoids destructive edits.

- **Isolation between runs**
  Each invocation is isolated; state cannot leak between AOTs.

- **Extensible registry**
  New AOTs can be added safely without destabilising existing ones.

The goal: **AOTs should feel boringly reliable**.

---

## What Are Algorithms of Thought?

An Algorithm of Thought is a **named thinking pattern** with:
- A clear purpose
- A fixed structure
- Minimal ceremony

They are designed to:
- Reduce cognitive load
- Externalise reasoning
- Prevent common thinking traps
- Encourage deliberate, structured reflection

Think of them as **mental macros**.

---

## Algorithms of Thought — Grouped by Theme
Below is the full set of available AOTs, grouped by what kind of thinking they support. Each includes a short description and its SmartBlocks command.

### 🧭 Direction, Goals & Priorities
- **Aims, Goals, Objectives**
  - Clarifies high-level intent vs concrete objectives.
  - `<%AOTAGO%>`
- **First Important Priorities**
  - Forces ranking when everything feels important.
  - `<%AOTFIP%>`
- **Next Action**
  - Converts vague intent into a concrete, doable step.
  - `<%AOTNEXTACTION%>`

### ⚖️ Decision-Making & Trade-offs
- **Basic Decision**
  - A simple, minimal decision scaffold.
  - `<%AOTBASICDECISION%>`
- **Simple Choice**
  - Lightweight comparison when complexity is low.
  - `<%AOTCHOICE%>`
- **Alternatives, Possibilities, Choices**
  - Expands option space before narrowing.
  - `<%AOTAPC%>`
- **Regret Minimisation**
  - Evaluates choices based on long-term regret.
  - `<%AOTREGRET%>`
- **Design / Decision, Outcome, Channels, Action (DODCA)**
  - Forces alignment between decisions and execution.
  - `<%AOTDODCA%>`

### 🔍 Critical Thinking & Challenge
- **Assumptions X-Ray**
  - Makes hidden assumptions explicit.
  - `<%AOTAX%>`
- **Examine Both Sides**
  - Counteracts one-sided reasoning.
  - `<%AOTEBS%>`
- **Difference Engine**
  - Identifies what actually differs between options or positions.
  - `<%AOTDIFFERENCE%>`

### 🧠 Analysis, Diagnosis & Understanding
- **Five Whys**
  - Root-cause analysis through iterative questioning.
  - `<%AOTFIVEWHYS%>`
- **Recognise, Analyse, Divide**
  - Breaks complex problems into manageable components.
  - `<%AOTRAD%>`
- **Consequence and Sequel**
  - Short- and long-term impact analysis.
  -  `<%AOTCS%>`
- **Consider All Factors**
  - Broadens attention beyond the obvious.
  - `<%AOTCAF%>`

### 🤝 Disagreement & Perspective
- **Agreement, Disagreement and Irrelevance**
  - Separates signal from noise in arguments.
  - `<%AOTADI%>`
- **Right to Disagree (Cortex Futura)**
  - Structured disagreement without escalation.
  - `<%AOTRTD%>`
- **Right to Disagree (Deeper Version)**
  - A more thorough adversarial-thinking scaffold.
  - `<%AOTRTDDEEP%>`

### 🧩 Creativity & Reframing
- **Six Thinking Hats**
  - Parallel thinking through explicit modes.
  - `<%AOTSIXHATS%>`
- **Plus, Minus, Interesting** 
  - Fast reframing without overanalysis.
  - `<%AOTPMI%>`
- **SWOT Analysis**
  - Classic situational assessment.
  - `<%AOTSWOT%>`

### 🛠 Action & Resolution
- **Want, Impediment, Remedy**
  - Surfaces blockers and actionable remedies.
  - `<%AOTWANT%>`
- **TOSCA**
  - Frames problems in terms of triggers, outcomes, and actions.
  - `<%AOTTOSCA%>`
- **Pain Button (Ray Dalio)**
  - Identifies emotional triggers as learning opportunities.
  - `<%AOTPAIN%>`

### 📚 Source Analysis & Appraisal
- **REALLY?**
  - A fast, structured checklist for evaluating claims, studies, statistics, or persuasive arguments. Designed to trigger epistemic discomfort early, before weak or misleading results are accepted.
  - `<%AOTREALLY%>`
- **REAPPRAISED Checklist**
  - A structured checklist for critically appraising sources, arguments, or bodies of evidence (e.g. articles, claims, proposals). Particularly useful for academic reading, policy documents, and persuasive writing.
  - `<%AOTREAPPRAISED%>`

---

## Which Algorithm of Thought Should I Use?

If you’re not sure where to start, use this guide. Pick the kind of thinking you need — not the tool you remember.

### "I'm not clear what the problem actually is"

Use these to understand or diagnose before acting:

- **Recognise, Analyse, Divide** – break complexity apart
- **Five Whys** – find root causes
- **Consider All Factors** – widen the frame
- **Difference Engine** – clarify what truly differs
- **Consequence and Sequel** – explore downstream effects

### "I need to make a decision"

Use these when you are choosing between options:

- **Simple Choice** – low-stakes, few options
- **Basic Decision** – everyday decisions
- **Alternatives, Possibilities, Choices** – expand option space
- **Regret Minimisation** – long-term, identity-shaping decisions
- **DODCA** – decisions that must lead to execution

### "Everything feels important — I need focus"

Use these to prioritise and orient:

- **Aims, Goals, Objectives** – clarify intent vs execution
- **First Important Priorities** – force ranking
- **Next Action** – move from thinking to doing

### "I'm worried my thinking is biased or shallow"

Use these to stress-test reasoning:

- **Assumptions X-Ray** – surface hidden assumptions
- **Examine Both Sides** – counter confirmation bias
- **Agreement, Disagreement and Irrelevance** – separate signal from noise

### "There's disagreement or competing viewpoints"

Use these for constructive adversarial thinking:

- **Right to Disagree (Cortex Futura)** – principled disagreement
- **Right to Disagree (Deeper Version)** – rigorous adversarial analysis
- **Agreement, Disagreement and Irrelevance** – map alignment and divergence

### "I want to think more creatively or reframe the situation"

Use these to change perspective:

- **Six Thinking Hats** – parallel modes of thinking
- **Plus, Minus, Interesting** – quick reframing
- **SWOT Analysis** – situational overview

### "I need to move from insight to action"

Use these when the problem is understood but progress is stuck:

- **Want, Impediment, Remedy** – identify blockers and fixes
- **TOSCA** – clarify triggers, outcomes, and actions
- **Pain Button (Ray Dalio)** – learn from emotional friction
- **Consequence and Sequel** – sanity-check actions over time

### "I'm reading or evaluating a source or claim"

Use this when the task is *appraisal, not decision*:

- **REALLY?** – fast claim appraisal
- **REAPPRAISED Checklist** – systematic source and evidence evaluation

### “If you’re stuck executing → Ultraworking”

Install the Ultraworking extension to enhance execution (Roam Depot).

### “If you’re stuck creatively → Oblique Strategies”

Install the Oblique Strategies extension via Roam Depot to conquer creative block.


A Useful Rule of Thumb:
- If you’re *confused* → diagnose
- If you’re *choosing* → decide
- If you’re *stuck* → prioritise or act
- If you’re *arguing* → adversarial thinking
- If you’re *reading* → appraise

Algorithms of Thought work best when you **name the thinking problem first**.

---

## Coming Soon
- After Action Review
- Circle of Control
- Claim, Evidence, Confidence
- Claim–Evidence–Warrant
- Constraint–Bottleneck–Relief
- Constraints First
- Evidence Hierarchy Check
- Issue Log
- Other People’s Views
- PDSA
- Pre-Mortem
- Stakeholder Mapping
- Steelman Analysis

You can request additional AOTs via the Roam Research Slack channel.

---

## Background & Influences

This extension builds on a long lineage of structured thinking work, particularly early SmartBlocks experimentation.

Notable sources and inspiration:
- https://www.cortexfutura.com/c/algorithm-of-thought/
- https://www.cortexfutura.com/adversarial-reading/
- https://www.virtualsalt.com/problem-solving-techniques/
- https://www.zsolt.blog/search/label/Algorithms%20of%20Thought
- https://www.zsolt.blog/2020/12/tosca-pattern-for-framing-problems.html
- https://www.debono.com/de-bono-thinking-lessons-1

A public archive of early SmartBlocks AOT experiments is available at:
https://github.com/dvargas92495/SmartBlocks/issues
