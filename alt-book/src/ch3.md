# Chapter 3 — Functional Decomposition & System Structure

FMEA practitioners cite an uncomfortable statistic: **at least half of all field problems occur at interfaces** — the connections between components and subsystems — rather than inside the components themselves.¹ Read that statistic against how most teams actually organize their reliability work: a DFMEA owner for the motor, a DFMEA owner for the electronics, a DFMEA owner for the housing — each conscientiously analyzing their own block, none of them owning the joint between the blocks. If half the field problems live in exactly the place nobody's DFMEA is assigned to cover, then the way you draw the boxes — before a single failure mode is written down — is already determining what your reliability program will and won't catch.

@@widget half | A grid of one hundred dots, each standing for one field problem. Fifty are coloured amber: the problems that occur at interfaces. The other fifty are the problems inside components.

That's what this chapter is about. Chapter 2 ended with a table of subsystem-level requirements, produced by apportioning a system target across boxes that were simply asserted to exist ("power supply," "MCU," "sensor interface," and so on). This chapter goes back and does that step properly: how to decompose a system into the structure that every later DFMEA, duty cycle, and reliability block diagram will hang off of — and, critically, how to make sure the joints between the boxes get analyzed with the same rigor as the boxes themselves.

## 3.1 The Tree Structure Underneath Every FMEA

Every well-formed FMEA has the same underlying shape, and it's worth making that shape explicit before you ever open a worksheet. A system decomposes into elements; each element has one or more functions; each function has one or more potential failure modes; each failure mode has its own potential effects and its own potential causes.² This is a **tree**, not a flat list — and the discipline of building that tree correctly, level by level, is what Chapter 9's DFMEA work will assume is already in place.

@@widget tree | An expandable tree using this chapter's infusion pump. The system at the top branches into five elements. Opening the drive coupling element reveals its function, then its failure mode, slip under vibration, and beneath that its effect and its cause.

The practical implication for this chapter: decomposition isn't a formality you rush through to get to the "real" analysis. The tree's top levels — the system, subassembly, and component boundaries you choose right now — determine every failure mode that can be discovered later. A failure mode can only be found within a box, or explicitly at a joint between boxes. If a function doesn't clearly belong to any box, or belongs ambiguously to two, it will very likely never get analyzed by anyone — which is exactly the mechanism behind the interface statistic that opened this chapter.

## 3.2 Defining the System Before Drawing Its Structure

Before decomposition can be structured sensibly, the system itself needs a proper definition — not just a name, but a stated set of missions, operational modes, environmental profiles, and function times.³ This mirrors and extends what Chapter 2's requirements work already started:

- **Mission functions and operational modes** — what the system (and each major function within it) is actually supposed to do, stated from the highest system level down to the lowest level that will be analyzed. A device that behaves differently in different modes (standby vs. active, charging vs. discharging, priming vs. delivering) needs each mode identified explicitly, because a failure mode in one mode may not exist — or may look completely different — in another.
- **Environmental profiles per mission phase** — Chapter 2 already established that the environmental description must be complete; here, the requirement is to tie specific environmental conditions to specific operational phases, since a product rarely sees the same environment throughout its use.
- **Mission time** — a quantitative statement of how long each function actually needs to operate, distinguished from total calendar time. This is the same distinction Chapter 2's worked example turned on (operating hours vs. calendar hours), now generalized to every function in the system rather than just the top-level box.

This system definition step is what a functional block diagram documents — a diagram of the operational relationships and interdependencies between functional entities, built from engineering data and schematics, distinct from (though related to) the reliability block diagram covered next.⁴

## 3.3 Scoping the Decomposition: Not Every Element Deserves Equal Attention

A real system can easily contain dozens of nominally distinct elements, and analyzing all of them with equal depth wastes effort on the ones that don't matter while diluting attention on the ones that do. A documented industry example makes the filtering step concrete: an automotive transmission analysis started with **28 system elements** and, using pre-calculations, experience from similar transmissions, and an ABC-style criticality classification, reduced the reliability-relevant scope to **12 elements** — the power-transmitting parts (input/output shafts, gears, fitting-key connections, bearings) and the radial seal rings.⁵ The other 16 elements weren't ignored entirely; they were consciously screened out of the *detailed reliability analysis* because engineering judgment and prior experience indicated they weren't going to be life-limiting.

@@widget scope | Twenty-eight dots, one per transmission element. Twelve are highlighted as reliability-relevant; sixteen are screened out of the detailed analysis.

This matters for two reasons. First, it's the honest answer to "how detailed should my decomposition be" — detailed enough to capture every element that plausibly limits system life, and no more, because unlimited detail is not actually free; it's a tax on every downstream DFMEA and duty-cycle exercise. Second, the same source example shows the natural next step once scoping is done: starting from a function block diagram (or a power-flow schematic) of the surviving elements, the reliability block diagram can be built directly, because the function diagram already shows how each element is stressed and how its failure propagates to the rest of the system.⁶

## 3.4 Building the Reliability Block Diagram

A reliability block diagram (RBD) is not the same thing as a functional or physical layout diagram, and conflating the two is a common source of confusion. The RBD's job is narrower and more specific: it shows the *logical* dependency between elements with respect to a **stated failure definition** — which elements have to survive, in what combination, for the system to still perform the function being analyzed.⁷

Two structures cover most real systems:

@@say Series structure: the failure of any one element fails the system. The system reliability is the product of the element reliabilities. In words: multiply the reliability of the first element by the reliability of the second, and so on through the last. Because every factor is less than one, each added element pulls the system reliability down. This is the default for most mechanical and electronic systems, because building in redundancy is expensive, especially for high-volume repeated parts. So most real systems are, reliability-wise, mostly series, even when they don't look that way physically.
- **Series structure** — the failure of any one element fails the system. System reliability is the product of the element reliabilities: R_S(t) = R₁(t) × R₂(t) × ... × Rₙ(t). This is the default for most mechanical and electronic systems, because building in redundancy is expensive, especially for high-volume repeated parts — so most real systems are, reliability-wise, mostly series, even when they don't look that way physically.⁸
@@say Parallel, or redundant, structure: the system survives until all elements in the group have failed. The system reliability is one minus the product of the element unreliabilities. In words: for each element take one minus its reliability, which is its probability of failure; multiply those failure probabilities together to get the chance that every element has failed; then subtract that from one.
- **Parallel (redundant) structure** — the system survives until *all* elements in the group have failed. System reliability is R_S(t) = 1 − [1−R₁(t)] × [1−R₂(t)] × ... × [1−Rₙ(t)].

@@widget rbd | A calculator and chart comparing the two structures. The horizontal axis is the number of blocks, from one to twelve; the vertical axis is system reliability. The series curve starts at the single-block reliability and falls with every added block. The parallel curve starts at the same point and rises toward one. With five blocks each at 0.99, the series system drops to about 0.951, roughly five times the unreliability of one block, while a parallel group of the same five would be essentially perfect.

**The single most important, and most frequently missed, point about RBDs**: the same physical hardware can produce completely different block diagrams depending on which failure mode is being analyzed. A documented worked example makes this vivid: a free-wheel clutch system (two clutches in a shaft assembly) has exactly one physical layout, but two entirely different reliability structures depending on the failure mode considered. For the failure mode **"interruption"** (clutch stops transmitting torque), the system fails if *either* clutch fails — a series structure. For the failure mode **"clamping"** (clutch locks up when it shouldn't), the system only fails if *both* clutches clamp simultaneously, because either one clamping alone still allows the other to carry the torque — a parallel structure. The complete reliability diagram for the system is the series combination of both partial structures.⁹

@@widget clutch | A block diagram of the two clutches that redraws itself when the failure mode is switched. For interruption, the two clutch blocks sit one after the other in a single line: a series structure. For clamping, the two blocks are stacked on parallel branches. Two sliders set the chance of each failure mode per clutch. With five percent each, the chance of system interruption is about ten percent, but the chance of system clamping is only a quarter of one percent.

The lesson generalizes well beyond this specific mechanism: **don't ask "what's the RBD for this product" — ask "what's the RBD for this failure mode."** A component that looks like a single point of failure for one failure definition can be part of a redundant pair for another. Skipping this distinction is how teams end up with an RBD that quietly overstates or understates system reliability without anyone noticing why the number looks wrong.

For systems too interconnected to reduce cleanly to series and parallel blocks, block diagram decomposition (breaking a complex network into series/parallel sub-blocks and reducing outward) and cut-set/tie-set methods (identifying the minimum combinations of element failures, or working combinations of survivals, that determine system failure) extend the same logic to arbitrary topologies — the mechanics of both are worked in Appendix A.¹⁰

## 3.5 Interfaces: Where Half Your Field Problems Are Hiding

Return to the statistic this chapter opened with. The formal name for the fix is straightforward to state and consistently hard to actually do: **FMEA scope must explicitly include integration and interface failure modes, in both the block diagram and the analysis — not just the failure modes of individual parts and subsystems.**¹¹ The reason this is worth a dedicated section rather than a footnote is that interface failure modes don't announce themselves the way component failure modes do. Nobody is assigned to own "the joint between two things," so unless someone deliberately draws it as its own block, it simply doesn't exist in anyone's analysis.

A documented audit finding shows exactly what this failure looks like in practice: a bicycle-brake DFMEA analyzed the brake lever, the brake pad, and the brake caliper — each as its own item, with its own functions and failure modes — but the *interaction* between them (how the lever's motion transmits to the pad, how the pad engages the caliper) was never described in the Functions column, and no failure mode addressing that interaction was ever analyzed.¹² The individual components could each pass their own FMEA cleanly while the actual point of failure — the interface between them — was never looked at by anyone.

@@widget brake | Three boxes in a row: brake lever, brake pad, brake caliper. Each box is marked as analysed. The two connections between them are drawn as dashed red lines labelled: interaction never analysed.

The practical guidance that follows directly from this: interfaces can be analyzed either as part of an adjoining item's own analysis or as their own separate line items, but either way, **the block diagram itself should explicitly show which interfaces are inside the scope of the analysis.**¹³ If an interface isn't drawn as a block or a labeled connection, assume it isn't being analyzed — regardless of anyone's intention.

## Real-World Example: Structuring an Infusion Pump — and Finding the Interface Nobody Owned

@@say The scenario. A team is developing a new ambulatory infusion pump. Following Chapter 2's process, the program has already converted its top-level requirement into a system-level target: a B ten life of at least 5,000 operating hours, meaning a reliability at 5,000 hours of at least 0.90 under the exponential assumption. That converts to a system failure-rate budget of about 2.11 times ten to the minus 5 failures per operating hour. The team's job now is to build the functional decomposition and reliability block diagram that this budget will be apportioned across.
**The scenario.** A team is developing a new ambulatory infusion pump. Following Chapter 2's process, the program has already converted its top-level requirement into a system-level target: **B10 ≥ 5,000 operating-hours** (R(5,000 hrs) ≥ 0.90, exponential assumption), which converts to a system failure-rate budget of λ_system ≈ 2.11 × 10⁻⁵ failures per operating-hour. The team's job now is to build the functional decomposition and reliability block diagram that this budget will be apportioned across.

**Step 1 — Define the system and its major functions.** Following §3.2, the team identifies four operational modes relevant to reliability: priming, infusing (the primary mission mode, with the longest mission time), paused/held, and standby. The primary mission — accurate, uninterrupted fluid delivery during the infusing mode — is what the reliability structure below is built to protect.

**Step 2 — Decompose into subsystems.** The team defines four subsystem blocks: **Fluidics** (tubing set, valves, occlusion sensor), **Motor/Drive** (motor, gear train, rotary encoder), **Electronics** (control board, power supply, safety-monitoring circuit), and **User Interface** (display, keypad). Following §3.3's scoping logic, sub-elements within each block that prior field experience shows are not life-limiting (e.g., the enclosure fasteners) are noted but excluded from the detailed reliability structure.

**Step 3 — Build the initial RBD and apportion the budget.** Because the failure of any one of these four subsystems fails the infusion function, the team's first-pass RBD is a straightforward series structure (§3.4), and the budget is apportioned by engineering judgment on relative complexity and field risk:

@@say The first apportionment table. Fluidics receives 30 percent of the budget: 6.33 times ten to the minus 6 failures per operating hour, a B ten of about 16,650 hours. Motor and drive receives 25 percent: 5.28 times ten to the minus 6, about 19,960 hours. Electronics receives 30 percent, the same as fluidics. The user interface receives 15 percent: 3.16 times ten to the minus 6, about 33,340 hours. Together they make the system total of 2.11 times ten to the minus 5, about 5,000 hours.
| Subsystem | Share | Allocated λ (fail/op-hr) | Equivalent B10 (operating hours) |
|---|---|---|---|
| Fluidics | 30% | 6.33 × 10⁻⁶ | ≈ 16,650 |
| Motor/Drive | 25% | 5.28 × 10⁻⁶ | ≈ 19,960 |
| Electronics | 30% | 6.33 × 10⁻⁶ | ≈ 16,650 |
| User Interface | 15% | 3.16 × 10⁻⁶ | ≈ 33,340 |
| **System total** | **100%** | **2.11 × 10⁻⁵** | *(≈ 5,000 hrs)* |

This table is handed to four subsystem owners, each of whom now has a testable target to design and validate against — the same handoff pattern Chapter 2 ended on.

**Step 4 — The interface review.** Per §3.5, the team runs a dedicated review asking not "does each block's DFMEA look complete" but "does the block diagram show every interface in scope." The review surfaces a gap: the mechanical coupling that transmits the motor's rotation to the fluidics set's peristaltic rotor — the drive coupling — is not owned by either subsystem's analysis. The Motor/Drive team's scope stops at "motor, gear train, encoder"; the Fluidics team's scope starts at "tubing set, valves, occlusion sensor." The coupling itself, and its specific failure mode — **partial disengagement or slip under vibration, causing under-infusion without triggering the occlusion sensor** (which detects blockage, not slippage) — was never analyzed by anyone, exactly matching the bicycle-brake pattern from §3.5. This is also a high-severity finding: silent under-infusion is a therapy-critical failure mode, not a nuisance failure.

**Step 5 — Correct the RBD and re-apportion.** The team adds an explicit **Drive-to-Fluidics Interface** block to the RBD, in series between Motor/Drive and Fluidics, with its own stated function ("transmit rotational motion to the peristaltic rotor without slip or misalignment") and its own budget allocation — which has to come from somewhere, since the system-level target hasn't changed:

@@say The revised apportionment table. Fluidics drops to 27.6 percent: 5.83 times ten to the minus 6 failures per operating hour, so its required B ten rises to about 18,070 hours. Motor and drive drops to 23 percent: 4.85 times ten to the minus 6, about 21,720 hours. Electronics drops to 27.6 percent, the same as fluidics. The user interface drops to 13.8 percent: 2.91 times ten to the minus 6, about 36,200 hours. The new drive-to-fluidics interface block receives 8 percent: 1.69 times ten to the minus 6, a B ten of about 62,340 hours. The system total is unchanged at 2.11 times ten to the minus 5, about 5,000 hours. Every original block now has a tougher target than before, because the interface's share had to come out of theirs.
| Subsystem | Revised share | Allocated λ (fail/op-hr) | Equivalent B10 (operating hours) |
|---|---|---|---|
| Fluidics | 27.6% | 5.83 × 10⁻⁶ | ≈ 18,070 |
| Motor/Drive | 23.0% | 4.85 × 10⁻⁶ | ≈ 21,720 |
| Electronics | 27.6% | 5.83 × 10⁻⁶ | ≈ 18,070 |
| User Interface | 13.8% | 2.91 × 10⁻⁶ | ≈ 36,200 |
| **Drive-to-Fluidics Interface** | **8.0%** | **1.69 × 10⁻⁶** | **≈ 62,340** |
| **System total** | **100%** | **2.11 × 10⁻⁵** | *(≈ 5,000 hrs, unchanged)* |

@@widget pump | The pump's reliability block diagram drawn as a chain of blocks in series, with the budget bars beneath it. In the first state there are four blocks: user interface, electronics, motor and drive, and fluidics. In the second state a fifth block, the drive coupling, appears highlighted between motor and drive and fluidics, and takes eight percent of the budget. The bars of the other four blocks all shorten slightly, and their required lives lengthen. You can drag the interface share to see how much each extra percent costs the other blocks.

**The outcome.** The interface now has an owner, a stated function, an explicit failure mode, and a numeric reliability budget of its own — which directly seeds the DFMEA line item Chapter 9 will build out in full, and gives Part IV a specific, named failure mechanism (coupling wear/slip under vibration) to define a stress and an accelerated test around, rather than discovering the same failure mode for the first time from a field return years later. Notice, too, what the corrected table makes visible that the first table hid: the original four subsystems were never really getting the full budget the first table implied — 8% of the system's entire reliability budget was always going to be consumed by a connection nobody had drawn yet.

## Common Pitfalls

- **Treating the RBD as a picture of the hardware** rather than a picture of the failure logic for a specific failure definition — the free-wheel clutch example in §3.4 shows how badly this can mislead if the same diagram is reused across different failure modes.
- **Decomposing to a level of detail nobody will act on**, instead of scoping deliberately (§3.3) to the elements that plausibly limit system life.
- **Leaving interfaces undrawn.** If a connection, coupling, or handoff between two blocks isn't explicitly represented in the block diagram, assume — regardless of anyone's stated intention — that no one is analyzing it.
- **Assigning subsystem ownership by physical hardware rather than by function**, which is exactly how an interface like a drive coupling ends up belonging to neither adjoining team.
- **Reusing a prior product's decomposition or RBD wholesale** without re-checking whether this product's failure modes, mission profile, or operational modes actually match the old structure.

## Where We're Headed

The infusion pump example leaned on engineering judgment to set the initial 30/25/30/15 apportionment — a reasonable starting point, but not yet a rigorous one. Chapter 4 covers the tools that replace judgment calls like that with a structured process: Quality Function Deployment for tracing design features back to customer-weighted requirements, and the P-diagram for formally separating what the design controls from what it merely has to survive — the direct input to the DFMEA work in Part III.

### Sources for this chapter

1. good and bad DFMEA.pdf (Carl Carlson, HBM Prenscia Tutorial), "Mistake #4: Not Including Interfaces in the FMEA" (≥50% of field problems occur at interfaces).
2. Bertsche, *Reliability in Automotive and Mechanical Engineering*, §4.1, Fig. 4.10 (FMEA "tree structure").
3. RMS Handbook of Reliability Predictions, §24.4.2 (System Definition: mission functions/operational modes, environmental profiles, mission time).
4. RMS Handbook of Reliability Predictions, §24.4.2 (Block Diagrams — functional block diagram vs. reliability block diagram distinction).
5. Bertsche, §3.1.3 (transmission example: ABC classification reducing 28 system elements to 12 reliability-relevant elements).
6. Bertsche, §3.1.4, Fig. 3.8, Eq. 3.1 (reliability block schematic derived from function block diagram; serial-structure system equation).
7. O'Connor & Kleyner, *Practical Reliability Engineering*, 5th ed., §6.9 (Block Diagram Analysis — RBD not necessarily the same as the functional/physical layout).
8. Bertsche, §2.3, Eq. 2.107, Fig. 2.46 (series-system reliability as the product of element reliabilities; most mechanical products are effectively series structures).
9. Bertsche, §2.3, Figs. 2.44–2.45 (free-wheel clutch worked example: failure-mode-dependent series vs. parallel structure from identical physical hardware).
10. O'Connor & Kleyner, §6.9, §6.9.1, Examples 6.3–6.4 (block diagram decomposition; cut sets and tie sets for complex topologies).
11. good and bad DFMEA.pdf, "FMEA Quality Objectives," Objective #4 ("Interfaces — FMEA scope includes integration and interface failure modes in block diagram and analysis").
12. good and bad DFMEA.pdf, "Auditing Quality Objective #4" (bicycle brake lever/pad/caliper interaction not described in the Functions column; interface failure mode not analyzed).
13. good and bad DFMEA.pdf, "A Note on Quality Objective #4" (interfaces analyzed as part of item analysis or separately; FMEA Block Diagram should clearly show in-scope interfaces).
