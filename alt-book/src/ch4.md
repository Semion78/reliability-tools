# Chapter 4: Tools for Requirements Definition

## From "What" to "How Important" and "What Could Go Wrong"

Chapter 2 turned a vague customer expectation ("the ECU should last the life of the vehicle") into a testable reliability requirement. Chapter 3 took that single number and apportioned it across a functional architecture, using reliability block diagrams and an interface review to make sure nothing important was hiding between subsystems.

Both chapters assumed something this chapter has to supply: a way to decide which requirements matter most when trade-offs are unavoidable, and a structured way to separate what the design controls from what it merely has to survive. Every real design has more candidate requirements than budget, and every real product operates in an environment the designer does not fully control. Two tools carry most of the weight here: Quality Function Deployment (QFD), which turns the customer's voice into a ranked, traceable set of engineering requirements, and the parameter diagram (P-diagram), which draws the boundary around a design and sorts everything crossing it into what is controlled, what is merely known, and what is a source of unwanted variation. A third, less glamorous set of tools — design reviews and checklists — is what actually catches whether the requirements the first two tools produced were met before the design leaves the drawing board.

All three tools are qualitative or semi-quantitative. They do not replace the quantitative apportionment work of Chapter 3; they feed it. QFD tells you where to spend apportionment effort. The P-diagram tells you what the DFMEA (Chapter 9) and the duty cycle (Part II) need to characterize. Design reviews tell you whether the organization actually did what these tools said it should.

## 4.1 Quality Function Deployment: Weighting Requirements the Way Customers Actually Would

### The problem QFD solves

By the time a design team has a requirements document, a DFMEA, and a test plan, dozens of individual requirements are competing for the same finite engineering hours, tooling budget, and calendar time. Engineers have to decide, for example, whether an extra 2 dB of noise reduction is worth more design effort than an extra 500 hours of durability life, or whether a bearing upgrade that adds cost is justified by a reliability requirement that customers may or may not actually care about as much as the requirements document implies.

Quality Function Deployment, developed by Yoji Akao in Japan and popularized in the West through the "House of Quality" matrix, exists to answer exactly this kind of question with data instead of opinion. It converts customer requirements — expressed the way customers actually talk about a product, not the way engineers do — into a ranked, weighted set of engineering characteristics, and it does so by building an explicit, auditable matrix rather than relying on a design team's unstated assumptions about what matters.

### The structure of the House of Quality

O'Connor and Kleyner's RAMS (Reliability, Availability, Maintainability, Safety) program task list places QFD among the earliest tasks in a development program, immediately after the customer and market requirements have been gathered and before detailed design work begins — reinforcing that QFD is a front-end requirements tool, not a design-verification tool. The House of Quality matrix, as O'Connor illustrates it with a small electric motor example, has a consistent shape regardless of the product:

- **The customer requirements ("Whats")** are listed down the left side, in the customer's own language, each with an **importance rating** — typically a 1–5 or 1–10 scale reflecting how much the customer cares about that requirement relative to the others. For the electric motor example, the customer requirements include: adequate starting torque, low noise (under 40 dB), low cost (under $15), 5,000-hour durability, high reliability, low weight (under 0.3 kg), and short replacement time (under 10 minutes).
- **The engineering characteristics ("Hows")** are listed across the top — these are the design or process features the team can actually control: magnet material, bearing type, brush spring pressure, housing construction, stator winding design, terminal attachment method, and mounting design.
- **The relationship matrix** in the body of the house scores how strongly each engineering characteristic affects each customer requirement, typically on a scale such as 9 (strong relationship), 3 (moderate), 1 (weak), or 0 (none).
- **The roof of the house** captures correlations between engineering characteristics themselves — where improving one characteristic helps or hurts another (for example, increasing housing wall thickness for stiffness and noise control typically increases weight and cost, a direct conflict with two other customer requirements).
- **A benchmarking row or column** compares the design against competitor products on each customer requirement, so the team can see not just "what does the customer want" but "where are we already ahead or behind."

The team then multiplies each importance rating by each relationship score and sums down each engineering-characteristic column, producing a total score for each characteristic. In O'Connor's worked electric-motor example, this arithmetic identifies bearing selection, housing construction, and mounting design as the highest-scoring engineering characteristics — the ones that most strongly influence the requirements the customer rated most important — with totals in the 44–65 range compared with roughly half that for lower-priority characteristics such as terminal attachment method. That ranking is the actionable output of QFD: it tells the design team where to spend engineering effort, where to spend test budget, and which characteristics deserve the most rigorous DFMEA and DVP&R coverage later in the program, rather than treating every design decision as equally important by default.

@@widget hoq | A House of Quality matrix for the small electric motor. Seven customer requirements run down the left, each with an importance rating from one to five. Seven engineering characteristics run across the top. Each cell holds a relationship score of zero, one, three or nine. The arithmetic for one column works like this: take each customer requirement's importance, multiply it by the score in that column, and add the seven products together. For bearing type, with the balanced customer, low noise at importance four times a score of nine gives 36; durability at four times nine gives another 36; reliability at five times nine gives 45; and cost at three times three gives 9; the total is 126, the highest in the table. A bar chart below ranks all seven characteristics, with bearing type, housing construction and mounting design on top, as in the chapter. Changing the importance ratings to a noise-sensitive, cost-driven or service-driven customer reorders the ranking. The scores in this figure are illustrative; they are not the numbers printed in the source.

### Why QFD matters for accelerated testing specifically

It is tempting to treat QFD as a marketing or industrial-design tool with no bearing on reliability test planning. The apportionment work in Chapter 3 shows why that is wrong: apportioning a single system-level reliability target across subsystems requires a defensible basis for giving one subsystem a tighter allocation than another. QFD's importance-weighted requirement list is one of the most defensible bases available, because it ties the allocation decision back to data about what the customer actually values, rather than to whichever engineer argues most persuasively in the apportionment meeting. A subsystem whose engineering characteristics score highest in the House of Quality is a natural candidate for a tighter reliability allocation and a more aggressive accelerated test plan, because a failure there does more damage to the requirements the customer cares about most.

QFD also cascades. A single top-level House of Quality does not stop at the system level — the highest-scoring engineering characteristics at the system level become the customer requirements ("Whats") of a second-level House of Quality at the subsystem or component level. This is the same "system → subassembly → component" decomposition from Chapter 3's tree structure, but driven by customer importance rather than by functional architecture alone.

## 4.2 The P-Diagram: Separating What You Control From What You Merely Survive

### Why a boundary tool is needed

QFD answers "which requirements matter most." It does not answer a different, equally important question: for a given design element, what actually determines whether it will meet those requirements in the field? The parameter diagram — P-diagram — is the tool that answers that question, and it is the single most important bridge between requirements definition and the DFMEA and duty-cycle work that follows in Parts II and III of this book.

A P-diagram forces a design team to draw a boundary around a system, subsystem, or component and then classify everything that crosses that boundary into exactly four categories:

- **Signal / Intent (Input):** what the design element is supposed to receive or respond to — the intended input.
- **Control Factors:** the parameters the design team can specify and control — material selection, geometry, tolerances, surface treatment, process parameters. These are the "knobs" a design engineer actually turns.
- **Noise Factors:** everything that affects the output but that the design team cannot fully control — environmental variation, customer usage variation, manufacturing variation, wear/degradation over time, and interactions between adjacent systems. Taguchi's framework, as O'Connor presents it, treats these noise factors as unavoidable sources of variation that a robust design must be insensitive to, rather than variation the team can simply specify away.
- **Output / Response:** what the design element actually produces, split into the **Ideal Function** (what it is supposed to do) and the **Error States** (the ways it can fail to do that).

Porter's treatment of this structure — presented as an IPCO diagram (Inputs, Noise Factors/Assumptions, Controls, Output) — applies the same four-box logic to test methods and to the DFMEA process itself, not only to hardware designs. That generality is worth noting here because it previews exactly how the P-diagram is used later in the book: Part III (Chapters 8–9) uses the same control/noise split to structure DFMEA cause analysis, and Part IV uses the noise-factor list as the starting inventory of stresses that accelerated tests must reproduce.

### Why the control/noise split changes what gets tested

The reason a P-diagram belongs in the requirements chapter, rather than waiting for the DFMEA chapter, is that the classification decision — is this a control factor or a noise factor? — determines what kind of verification activity is appropriate long before a DFMEA session ever convenes.

A control factor is something the design specifies. Verification of a control factor is fundamentally a design-review and drawing-check activity (Section 4.3): did the design actually implement the specified material, tolerance, or geometry? A noise factor is something the design cannot specify away and must instead be made robust against, or, when robustness is insufficient, must be explicitly tested against. Verification of a noise factor requires a test that reproduces or bounds that noise — which is precisely the accelerated test planning this book exists to teach. Taguchi's robustness framing, illustrated in O'Connor's signal-to-noise examples, makes the same point quantitatively: a design's quality is measured not by its output at one nominal condition but by how little its output varies as noise factors vary around that nominal condition. A gap in the noise-factor list at the P-diagram stage is therefore not a paperwork gap — it is a gap in the test plan that will not be discovered until a field failure forces the team to ask "why didn't we test for that?"

This is the mechanism behind the chapter's real-world example below: a P-diagram exercise conducted properly, with the right people in the room, finds noise factors that a test plan built from control factors alone would never surface.

## 4.3 Design Reviews and Checklists: Verifying the Requirement Was Actually Met

### Where qualitative methods fit

Bertsche's overview of reliability methods (Fig. 11.6) places design reviews and checklists among the qualitative methods available to a reliability program, distinct from the quantitative methods (block diagrams, life-stress models, statistical test planning) that occupy most of this book. Qualitative methods are not a lesser substitute for quantitative rigor — they are what confirms, at defined checkpoints, that the quantitative work is actually being carried into the design rather than living only in a requirements document that nobody rechecks.

### What makes a design review effective rather than ceremonial

O'Connor describes an effective design review as a team-based technical exercise, not a status meeting. The review team should include people who did not write the design — reliability engineers, manufacturing and quality representatives, and, where relevant, service and field personnel — precisely because the people closest to a design are the least likely to see its blind spots. A design review that consists only of the design team presenting to itself tends to confirm what the team already believes rather than surface what it has missed.

O'Connor also warns explicitly against the checklist becoming "a stolid march through a list of questions" that substitutes for genuine engineering judgment. A checklist is a memory aid for an engineer who is already thinking critically about the design, not a replacement for that thinking. Three practical rules keep a checklist in the first category:

1. **Use checklists as working tools in the design office, not as items to be formally addressed only in review meetings.** A checklist that only appears at the review meeting arrives too late to influence the design it is meant to check.
2. **Keep checklists relevant and current.** A checklist copied unchanged from a previous, different program accumulates irrelevant items and loses credibility, and stops being updated when it stops matching the product actually being designed.
3. **Avoid vague, generic questions in favor of specific ones.** O'Connor's own example contrasts "Has maintenance been considered?" — a question any designer can answer "yes" to without having considered anything specific — with "What access is provided for lubrication?", which forces a concrete answer that can be checked against the actual drawing.

A typical hardware program runs design reviews at a small number of defined milestones rather than continuously: an initial design review before detailed design is released, a review at the completion of development testing, and a final review of production-standard drawings before tooling commitment. Each of these checkpoints is a natural place to re-verify that the P-diagram's control factors were actually implemented as specified and that the noise factors identified earlier still match the design's intended use.

@@widget review | A card that flips between a vague checklist question, has maintenance been considered, and a specific one, what access is provided for lubrication. Below it are the three checklist rules and a strip of the three design-review milestones: initial design review, review after development testing, and final review of production-standard drawings.

### Design Review Based on Failure Modes (DRBFM)

For evolutionary designs — a new part derived from a proven one, rather than a clean-sheet design — a related technique, Design Review Based on Failure Modes (DRBFM), focuses the review specifically on what changed relative to the proven baseline and what new failure modes that specific change could introduce. DRBFM is a natural complement to the P-diagram approach: a change to a control factor (a new material, a tightened tolerance) or a change in the noise environment (a new duty cycle, a new mounting location) is exactly the kind of change DRBFM asks a team to interrogate before assuming the proven baseline's reliability history still applies.

## Real-World Example: Industrial Machinery — Gearbox Boundary Diagram and P-Diagram

### Background

Consider an industrial gearbox subassembly — a single-reduction-stage gearbox transmitting power from an electric motor to a driven load (a conveyor, a pump, or similar rotating equipment) in a factory environment. The gearbox sits inside the equipment's overall functional architecture the same way the infusion pump's subsystems sat inside its architecture in Chapter 3: as one node in a reliability block diagram, with its own allocated reliability target from the system-level apportionment.

The design team's first instinct, consistent with many industrial-equipment programs, was to treat the gearbox validation plan as a single fixed-torque endurance test: run the gearbox at its rated nominal torque and speed for a specified number of hours, and pass/fail against tooth wear and bearing condition at teardown. This is a control-factor verification test — it checks whether the gearbox, as designed and built, survives its own rated nominal operating point. It says nothing about how the gearbox behaves when the *inputs* to that operating point vary, which is exactly the gap a properly built P-diagram exposes.

### Step 1 — Boundary diagram

Before building the P-diagram, the team drew a boundary diagram around the gearbox, listing every physical and functional interface crossing that boundary — the same interface-first discipline introduced in Chapter 3's infusion-pump example, now applied at the component level:

@@say The table lists five interfaces crossing the gearbox boundary. The input shaft and coupling connects to the motor output shaft, transferring torque and rotational speed. The output shaft and coupling connects to the driven load, also transferring torque and speed. The mounting feet and bolts connect to the machine frame: a structural load path that also transmits vibration. The breather or vent connects to the ambient atmosphere: it equalises pressure, and is a path for moisture and contaminants to get in. The lubricant fill and drain ports connect to maintenance access, and govern lubricant condition and level.
| Interface | Connects to | Nature of interface |
|---|---|---|
| Input shaft / coupling | Motor output shaft | Torque and rotational speed transfer |
| Output shaft / coupling | Driven load (conveyor, pump, etc.) | Torque and rotational speed transfer |
| Mounting feet / bolts | Machine frame | Structural load path, vibration transmission |
| Breather / vent | Ambient atmosphere | Pressure equalization, moisture/contaminant ingress path |
| Lubricant fill and drain ports | Maintenance access | Lubricant condition and level |

@@widget boundary | The boundary diagram drawn as a picture: the gearbox in the centre inside a dashed boundary, with five lines running out to the five things it connects to: the motor shaft on the left, the driven load on the right, the machine frame below, and the atmosphere and maintenance access above. Tapping any of the five shows what crosses the boundary there.

Drawing this diagram explicitly, with the same team that would later run the DFMEA rather than a single design engineer working alone, immediately raised a question that the fixed-torque endurance test had not addressed: what happens at the input and output couplings when the driven load does not present a smooth, constant torque?

### Step 2 — P-diagram

The team then built the full P-diagram for the gearbox:

**Signal / Intent:** Input rotational speed and torque at the motor coupling, at a specified gear ratio, producing a corresponding output rotational speed and torque at the load coupling.

**Control Factors** (what the design specifies):

- Gear material and heat treatment (case hardness, core hardness)
- Tooth profile and module (gear geometry)
- Bearing type and preload
- Lubricant type and fill level
- Housing wall thickness and stiffness
- Seal design and material
- Manufacturing tolerances on gear and shaft dimensions

**Noise Factors** (what the design must survive but cannot fully control):

- Torque spikes and shock loading from the driven equipment (a conveyor jam, a pump running dry and then re-priming, a load side impact)
- Ambient temperature range at the installation site
- Contamination ingress (dust, moisture) through the breather or seals over the equipment's service life
- Lubricant degradation and contamination over time between maintenance intervals
- Manufacturing variation in tooth profile from unit to unit
- Installation misalignment between the gearbox and the motor or driven equipment

**Output — Ideal Function:** Accurate torque and speed transfer at the specified ratio, with low noise and vibration and stable operating temperature.

**Output — Error States:** Tooth pitting or tooth breakage, bearing spalling, seal leakage, backlash growth (loss of positioning accuracy), and overheating.

@@widget pdiag | The P-diagram drawn in its usual layout. The gearbox sits in the middle. The signal enters from the left. The seven control factors sit above it and the six noise factors below it. On the right are the outputs: the ideal function, and the five error states. Every factor is coloured by whether the test plan covers it. Under the original plan, one fixed-torque endurance test, all seven control factors are green and all six noise factors are red: none of them is bounded by a test. Switching to the revised plan turns three noise factors green, torque spikes, contamination ingress and lubricant degradation, because two test segments were added. Three noise factors remain uncovered by those two segments and carry forward into the duty-cycle work of Part II.

### Step 3 — What the noise-factor identification changed

Once the noise factors were listed explicitly and reviewed by the same cross-functional group that would later run the DFMEA, two gaps in the original test plan became obvious that had not been visible when the plan was built around control factors alone:

1. **Torque spikes and shock loading from the driven equipment** were not represented anywhere in a constant-nominal-torque endurance test. The team added a cyclic and shock-overload test segment — superimposing repeated torque transients above the nominal rating onto the endurance run — to verify that the gear teeth and bearings, sized against the *noise factor's* worst case rather than only the *signal's* nominal value, would survive the actual field loading rather than only the idealized loading the original plan assumed.

2. **Contamination ingress and lubricant degradation** were not represented at all. The original endurance test ran with fresh lubricant in a clean laboratory environment — the opposite of the noise factor it needed to bound. The team added a combined dust/moisture ingress and degraded-lubricant test, deliberately contaminating and aging the lubricant charge partway through the endurance run, to verify the seal design and gear surface finish remained robust against the contamination levels expected over a realistic maintenance interval.

Neither gap would have been caught by a design review of the control factors alone, because both control factors — gear material, tooth profile, bearing preload — were fully and correctly specified on the drawing. The gearbox was not under-designed against its own nominal signal. It was under-tested against noise factors nobody had written down. This is the same lesson Chapter 3 drew from the infusion pump's missed drive-to-fluidics interface, applied one level down: the failure to find a problem earlier was a failure of scope in the definition tool, not a failure of engineering competence in the design itself.

The correlation-matrix logic from the QFD House of Quality also appeared here in miniature: increasing housing wall thickness to improve stiffness (helping resist the newly identified shock-loading noise factor) directly conflicts with the equipment's weight and cost requirements, the same kind of roof-of-the-house trade-off O'Connor's electric-motor QFD example makes explicit. The P-diagram exercise did not resolve that trade-off, but it made sure the trade-off was visible and deliberate rather than accidental.

## Common Pitfalls

**QFD done once at kickoff and never revisited.** A House of Quality built during concept selection reflects the customer requirements and competitive landscape as they existed at that moment. Requirements change as a program matures — a customer adds a requirement, a competitor releases a product that resets the benchmarking row, or a cost target tightens — and the engineering-characteristic rankings that were correct at kickoff can become stale well before the design freezes. Teams that treat QFD as a one-time kickoff deliverable rather than a living document lose the ability to explain, later in the program, why a given subsystem received the reliability allocation and test rigor it did — and lose the early warning that a requirement's importance has shifted enough to justify revisiting that allocation.

**P-diagrams drawn without engineering input from the team that will run the DFMEA.** A P-diagram built by a single design engineer, or by a systems engineer working from a specification document without the component-level design and manufacturing engineers in the room, systematically under-populates the noise-factor list — exactly the failure mode narrowly avoided in the gearbox example above by including the DFMEA team early. The people who understand how a part is actually manufactured, installed, and maintained in the field are the people most likely to know which noise factors matter, and they are frequently not the people who default to owning the P-diagram exercise. Because the DFMEA (Chapters 8–9) will inherit this same noise-factor list as its starting point for cause analysis, a thin P-diagram produces a thin DFMEA downstream, compounding the gap rather than catching it.

**Checklists substituting for engineering judgment.** As O'Connor warns, a checklist item marked "complete" is not the same as the underlying question having been genuinely thought through. A checklist with vague, generic items ("has reliability been considered?") gives a false sense of verification coverage precisely because every item can be checked off without engaging with the specific design. The fix is the same one given in Section 4.3: keep checklist items specific enough that answering them requires looking at the actual drawing or the actual noise-factor list, not just recalling that the topic was mentioned in a meeting.

## Where We're Headed

This chapter's P-diagram exercise produced a noise-factor list for the gearbox — torque spikes, ambient temperature range, contamination ingress, lubricant degradation, manufacturing variation, and installation misalignment. Those noise factors are not yet a test plan. They are raw ingredients: qualitative statements that a source of variation exists, without yet a magnitude, a frequency, a duration, or a statistical distribution attached to any of them.

Part II of this book (Chapters 5–7) takes exactly this kind of noise-factor list and turns it into a quantified duty cycle: how often does the torque spike occur and how large is it, what is the actual ambient temperature distribution at the installation sites the product will see, how does contamination accumulate over a real maintenance interval. Chapter 5 begins that process by defining what a duty cycle is and what data sources — field data, standards, physical testing, and engineering judgment — are available to build one from scratch when, as is common, no field data yet exists for a new design.

## Sources

1. O'Connor, P.D.T. & Kleyner, A., *Practical Reliability Engineering*, Appendix 6 — RAMS program task list (QFD placement in early program tasks).
2. O'Connor & Kleyner, *Practical Reliability Engineering*, Fig. 7.4 — House of Quality worked example (electric motor: customer requirements, engineering characteristics, relationship matrix, importance-weighted totals).
3. O'Connor & Kleyner, *Practical Reliability Engineering*, §7.4 — team-based design review process; review team composition; program milestone reviews (initial design, post-development-test, production-standard drawings).
4. O'Connor & Kleyner, *Practical Reliability Engineering* — checklist "golden rules" (working-tool use, relevance/currency, specific vs. vague questions) and warning against checklists as a "stolid march" substituting for engineering judgment.
5. O'Connor & Kleyner, *Practical Reliability Engineering*, Figs. 11.4–11.5 — Taguchi robustness framework: control factors, noise factors, signal-to-noise ratio, centering illustration.
6. Porter, A., *Accelerated Testing and Validation* — IPCO (Inputs, Noise Factors/Assumptions, Controls, Output) diagram structure applied to test methods and to the DFMEA process.
7. Bertsche, B., *Reliability in Automotive and Mechanical Engineering*, Fig. 11.6 — placement of design reviews and checklists among qualitative reliability methods.
8. "Good and Bad DFMEA" reference — Quality Objective #4 (interface failure modes), carried forward from Chapter 3 and reapplied to the gearbox boundary diagram.
9. Design Review Based on Failure Modes (DRBFM) — Toyota-originated method for evolutionary design changes, as referenced in program-level design-review practice.
10. Chapter 3 of this book — functional decomposition, reliability block diagrams, and the infusion-pump interface example, providing the apportionment context that QFD and the P-diagram feed into.
