
# Algorithms of Thought (AOT) for Roam Research

Algorithms of Thought (AOT) is a Roam Research extension that provides **structured thinking scaffolds** — lightweight, repeatable prompts that help you reason more clearly about decisions, problems, trade-offs, and next actions.

AOTs are **not automation** and **not AI**. They are intentional cognitive tools: small, named thinking patterns that you can invoke exactly when you need them.

You can trigger AOTs via:
- The **Command Palette**
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
- **Assumptions X-Ray** `<%AOTAX%>`
- **Examine Both Sides** `<%AOTEBS%>`
- **REALLY?** `<%AOTREALLY%>`
- **Difference Engine** `<%AOTDIFFERENCE%>`

### 🧠 Analysis, Diagnosis & Understanding
- **Five Whys** `<%AOTFIVEWHYS%>`
- **Recognise, Analyse, Divide** `<%AOTRAD%>`
- **Consequence and Sequel** `<%AOTCS%>`
- **Consider All Factors** `<%AOTCAF%>`

### 🤝 Disagreement & Perspective
- **Agreement, Disagreement and Irrelevance** `<%AOTADI%>`
- **Right to Disagree (Cortex Futura)** `<%AOTRTD%>`
- **Right to Disagree (Deeper Version)** `<%AOTRTDDEEP%>`

### 🧩 Creativity & Reframing
- **Six Thinking Hats** `<%AOTSIXHATS%>`
- **Plus, Minus, Interesting** `<%AOTPMI%>`
- **SWOT Analysis** `<%AOTSWOT%>`

### 🛠 Action & Resolution
- **Want, Impediment, Remedy** `<%AOTWANT%>`
- **TOSCA** `<%AOTTOSCA%>`
- **Pain Button (Ray Dalio)** `<%AOTPAIN%>`

### 📚 Source Analysis & Appraisal
- **REAPPRAISED Checklist** `<%AOTREAPPRAISED%>`

---

## Which Algorithm of Thought Should I Use?

- **Unclear problem** → RAD, Five Whys, CAF  
- **Making a decision** → Basic Decision, APC, Regret Minimisation  
- **Too many priorities** → AGO, FIP, Next Action  
- **Bias or weak reasoning** → Assumptions X-Ray, REALLY?, EBS  
- **Disagreement** → RTD, ADI  
- **Creative reframing** → Six Hats, PMI, SWOT  
- **Moving to action** → WIR, TOSCA  
- **Evaluating a source** → REAPPRAISED

---

## Coming Soon
- Issue Log
- Other People’s Views

---

## Background & Influences

- Cortex Futura
- Edward de Bono
- VirtualSalt
- Zsolt’s Algorithms of Thought
