# Chapter 1 — Why Accelerated Reliability Testing Matters

In the ten years from 1998 to 2006, the number of safety-related recall campaigns recorded by Germany's Federal Motor Vehicle Bureau (Kraftfahrt-Bundesamt) roughly tripled — from 55 to 167 — and the associated cost rose by a factor of eight.¹ Nothing about vehicles got fundamentally more dangerous in that decade. What changed was complexity: more electronics, more sensors, more software, more integration, delivered on shorter timelines and tighter budgets — the same pressures that now define product development in nearly every hardware industry, not just automotive.

@@widget recall | Two bars compare the number of safety recall campaigns: 55 in 1998 against 167 in 2006. The count tripled, and the associated cost rose eight-fold.

That single statistic captures the argument for this entire book. Reliability problems are not random bad luck. They are the predictable output of a development process that either builds reliability in deliberately, from the requirements stage forward, or discovers it by accident, in the field, at the worst possible time and the highest possible cost.

This chapter sets up why that is true, gives you the vocabulary and mental models the rest of the book builds on, and shows how the six topics you already know you need — requirements, duty cycle, DFMEA and risk, stress definition, test design, and field-failure closure — are not six separate subjects. They are one pipeline, and the pipeline only works in order.

## 1.1 What "Reliability" Actually Means

Engineers use the word "reliable" loosely in conversation, but the working definition this book uses is the formal one: **reliability is the probability that a product does not fail under stated functional and environmental conditions during a defined period of time** (VDI Guideline 4001).² Every word in that sentence is load-bearing, and every one of them maps to a part of this book:

@@widget defmap | The definition is shown as one sentence with four highlighted phrases. Tapping a phrase shows which part of the book it belongs to. The list that follows explains each one.

- **"Stated functional and environmental conditions"** — this is Part I. If you haven't defined what the product must do and where it will live, you cannot define what "failure" even means.
- **"Defined period of time"** — this is Part II. Time, for a mechanical or electrical product, is almost never wall-clock hours; it's a duty cycle expressed in the units that actually damage the product (cycles, miles, switch reversals, thermal excursions).
- **"Does not fail"** — this is Part III. Before you can test for failure, you have to have systematically enumerated what failure looks like, how it happens, and how bad each mode is — which is exactly what a DFMEA and a risk matrix are for.
- **"Probability"** — this is Parts IV and V. Probability of failure is driven by the stresses the product actually experiences relative to its capability, which is why stress definition and test design are inseparable.
- The whole definition is a moving target — new failure modes, new usage patterns, new production variation appear after launch — which is why Part VI (field failure analysis, DFMEA updates, production feedback) closes the loop back to the beginning.

Reliability, in other words, is not a single test you run at the end of a program. It's a property that gets designed in or designed out, chapter by chapter, starting at the requirements stage — which is why this book is organized as a pipeline rather than a list of independent techniques.

## 1.2 Why Customers — and Therefore Your Business — Care More Than You Might Assume

It is tempting to treat reliability as a cost center that competes with schedule and features. Customer research says otherwise. In a 2007 German automotive purchase-decision survey (DAT-Report), buyers rated reliability among the single most important criteria in the decision to buy a car — tied for first place with fuel consumption, and rated as more important than price, design, standard equipment, or resale value.³ Only price ever edges it out, and only sometimes.

This is not an automotive-specific finding — it generalizes to any product where a failure costs the customer more than the purchase price alone (downtime, inconvenience, repair hassle, or — in safety-critical products — worse). The scale of the exposure is real money, not just goodwill: warranty and guarantee costs alone can run **8–12% of a manufacturer's annual turnover**.⁴ A well-run accelerated reliability test program is not overhead on top of the product program; it is the mechanism that protects a number that size.

@@widget warranty | A slider sets a manufacturer's annual turnover, and three figures show what eight percent and twelve percent of it come to. For a turnover of five hundred million dollars, warranty cost runs between forty and sixty million dollars a year.

## 1.3 The Rule of Ten: Why *When* You Find a Problem Matters as Much as *Whether* You Find It

The single most important economic fact in reliability engineering is what's commonly called the **Rule of Ten**: the cost of correcting a given defect rises by roughly an order of magnitude with every phase it survives into, moving from design (where you still have the *chance to act*) through production and into the field (where you now *need to react*).⁵

Figure 1.5 in Bertsche's *Reliability in Automotive and Mechanical Engineering* plots this literally — cost per failure on a log scale from roughly 0.10 to 100 — with a single labeled transition: **Design = failure prevention / chance to act**, **Field = failure detection / need to react**. Every chapter of this book sits somewhere on that curve, and the entire strategic argument for accelerated testing is: **do the expensive discovery work on the left side of that curve, in a lab, on purpose, instead of on the right side of that curve, at a customer's site, by accident.**

@@widget ruleoften | The chart plots the cost of correcting one defect against the phase in which it is found: design, development and validation, production, and field. The vertical axis is logarithmic, so the rule of ten appears as a straight rising line. With a cost of one hundred dollars in design and a factor of ten per phase, the same defect costs one thousand dollars in development, ten thousand in production, and one hundred thousand in the field: a thousand times more. The left half of the chart is shaded as failure prevention, the chance to act. The right half is shaded as failure detection, the need to react. Two sliders change the starting cost and the escalation factor.

O'Connor and Kleyner's reliability cost model makes the field-side cost concrete. For a product with a modest annual call rate, the five-year cost curve compounds across four buckets simultaneously — parts and repair labor (net of any profit recovered after warranty), the service organization itself, spares logistics, and reputational cost — and none of those four buckets exists at all if the failure mode never reaches the customer.⁶ That last bucket, reputation, is also the hardest to reverse: warranty and repair costs are line items; a reputation for unreliability shows up later as lost market share that never appears on the balance sheet as "caused by Part XR-14."

## 1.4 The Bathtub Curve: Why One Test Strategy Is Never Enough

If the Rule of Ten explains *when* to look for problems, the **bathtub curve** explains *what kind* of problem you're looking for at each stage of a product's life — and this is the single most useful mental model in the entire book, because Parts III through VI are essentially organized around its three regions.⁷

@@widget bathtub | The chart shows failure rate against product age. Three dashed curves are added together to give the solid bathtub curve. The first dashed curve, early failures, starts high and falls quickly. The second, random failures, is a flat line. The third, wear-out, is near zero for most of the life and then climbs steeply. Their sum is high at the start, flat through the middle, and rising at the end: the shape of a bathtub. Sliders change the level of each population, and hovering over the curve names the region that dominates at that age, its typical causes, and the kind of test that finds it.

@@say The table summarises the three regions. Region one, early failures or infant mortality: the failure rate is decreasing. Typical causes are assembly errors, production defects, material lot problems and latent design flaws. It is found by environmental stress screening, burn-in, and production process control. Region two, random failures during useful life: the failure rate is roughly constant. Typical causes are operational misuse, maintenance errors, contamination, and externally induced events. It is found by field monitoring, FRACAS, and durability and performance testing under realistic conditions. Region three, wear-out failures: the failure rate is increasing. Typical causes are fatigue, material aging, corrosion and wear. It is found by accelerated life testing, durability testing, and life-stress modeling.
| Region | Failure rate behavior | Typical causes | What finds it |
|---|---|---|---|
| **1 — Early failures (infant mortality)** | Decreasing | Assembly errors, production defects, material lot problems, latent design flaws | Environmental Stress Screening (ESS/HASS), burn-in, production process control |
| **2 — Random failures (useful life)** | Roughly constant | Operational misuse, maintenance errors, contamination, externally induced events | Field monitoring, FRACAS, durability/performance testing under realistic conditions |
| **3 — Wear-out failures** | Increasing | Fatigue, material aging, corrosion, wear | Accelerated Life Testing (ALT), durability testing, life-stress modeling |

This is why "just run a reliability test" is not a complete strategy. A test built to find Region 1 problems (short, aggressive, margin-seeking — this is what Part V's HALT chapter is built around) will not tell you anything about Region 3 wear-out behavior, and a long wear-out-focused accelerated life test (Part V's quantitative ALT chapter) is a slow, expensive way to catch a workmanship defect that a two-day HALT or a production ESS screen would have found immediately. Matching the right test type to the right region of the bathtub curve — using the failure modes surfaced by your DFMEA (Part III) to tell you which region a given failure cause actually lives in — is a recurring decision point from Chapter 9 onward.

It's also worth being honest about a nuance the rest of the book will come back to: for repairable, multi-component systems the "bathtub" is really an overlay of many components' individual hazard-rate curves, each starting its clock at a different point (initial build, last repair, last part replacement). The clean three-region picture is a simplification that holds well at the component/failure-mechanism level — which is the level this book operates at — and gets fuzzier at the whole-system level.⁸

## 1.5 Reliability Is a Life-Cycle Program, Not a Test Event

Bertsche's reliability-methods roadmap lays out a product's reliability activities across six life-cycle stages: **planning → conception → design → production → field usage → recycling**, with a different toolkit — qualitative and quantitative — appropriate at each stage.⁹ Planning starts with fuzzy data and accumulated know-how; conception is where target-setting and specifications happen; design is where FMEA, FTA, and Weibull/exponential life modeling do the heavy lifting; production shifts to statistical process control and quality audits; field usage is where data collection and early-warning systems take over; and end-of-life feeds recycling-potential and remaining-lifetime analysis.

@@widget lifecycle | A strip of six life-cycle stages: planning, conception, design, production, field usage and recycling. Tapping a stage shows the reliability toolkit used there.

This book's six parts are a direct implementation of the design-and-verification slice of that roadmap, sequenced deliberately:

1. **Part I — Requirements & Functional Definition.** You cannot define a failure, a duty cycle, or a test until you've defined what the product must do and where it must survive.
2. **Part II — Duty Cycle Development.** Every acceleration factor, every DFMEA occurrence rating, and every test spec you'll ever write is only as good as the usage assumption underneath it.
3. **Part III — DFMEA & Risk Matrices.** Before you can decide what to stress and how hard, you need a disciplined, ranked list of what can actually go wrong — and *why* severity and occurrence get decided before detection (Chapter 11 makes this a central argument, not a footnote).
4. **Part IV — Defining Stresses.** This is where duty cycle (Part II) and risk (Part III) get translated into an actual stress level, a life-stress model, and a test acceleration factor, grounded in real material properties rather than assumption.
5. **Part V — Test Program Design.** Matching test type (functional, durability, ALT, environmental, shipping/storage, screening) to the failure mode and bathtub region it's meant to catch.
6. **Part VI — Closing the Loop.** Field data, done right, doesn't just fix the current product — it rewrites the DFMEA, corrects the duty-cycle assumptions, and prevents the same recall statistic that opened this chapter from happening to your product.

@@widget pipeline | Six cards, one for each part of the book, in pipeline order. Tapping a card skips that part and shows what goes wrong downstream as a result.

Skipping a step, or doing them out of order — the single most common failure pattern this book will call out repeatedly — is how organizations end up running expensive, statistically rigorous accelerated life tests against a duty cycle nobody validated, on a failure mode the DFMEA never flagged as high-risk, verified against a requirement that was too vague to test in the first place. The test itself can be executed flawlessly and still tell you nothing useful, because the input to it was wrong three steps earlier.

## Real-World Example: The Cost of Waiting — A Resistor Tolerance Problem

To make the Rule of Ten concrete rather than abstract, consider a documented industry scenario involving a single, unremarkable design detail: a resistor's tolerance value in a circuit, discovered to be a problem at different possible points in a program.¹⁰

**The scenario.** A design uses a resistor whose tolerance is tighter than the design actually needs, or — in the failure case — not tight enough, allowing an overcurrent condition under a combination of manufacturing variation and end-use conditions. The engineering fix is trivial: a different resistance value or a tighter tolerance spec. The question the case walks through is not "can this be fixed" — it obviously can — but "how does the cost of fixing it change depending on when it's caught."

**The analysis, stage by stage:**

@@widget resistor | A seven-step slider moves the point of discovery from feasibility through to field service. At each step a row of labels lights up to show everything that now has to be redone: first only a paper change, then extra validation tests, then revalidation and a tooling reset, then schedule loss, a line stop, and finally service cost, lost customers and liability.

@@say The table gives the cost of the same fix by the stage at which it is discovered. At feasibility: no effect at all, a different resistor value is a paper change. At development or design: mildly annoying, only slightly greater impact. At design validation: not much worse, a few additional validation tests confirm the correction. At production ramp: now significant, it requires revalidating the design and resetting production tooling and process. At production validation: the same as ramp, plus schedule loss and a missed production start, and potentially contractual penalties. At full production: a major emergency, production lines stop or every unit gets reworked, and deliveries are missed. In field service: the product is already in customers' hands. Add lost customers, dissatisfaction, service and repair cost, and, if the overcurrent causes actual harm such as a fire, product liability on top of everything else.
| Stage discovered | Cost/impact of the same fix |
|---|---|
| **Feasibility** | No effect on feasibility at all — a different resistor value is a paper change. |
| **Development / design** | Mildly annoying; economic impact only slightly greater than catching it during feasibility. |
| **Design validation** | Not much worse than development — a few additional validation tests confirm the correction. |
| **Production ramp** | Now significant: requires revalidating the design *and* resetting production tooling/process. |
| **Production validation** | Same as ramp, plus schedule loss and a missed production start; potentially contractual penalties if it stops a downstream line that depends on the part. |
| **Full production** | Major emergency: production lines stop or every unit gets reworked, deliveries are missed. |
| **Field / service** | The product is already in customers' hands. Now add lost customers, dissatisfaction, service and repair cost — and if the overcurrent condition causes actual harm (e.g., a fire), product liability cost on top of everything else. |

**The decision this supports.** Notice what does *not* change across every row: the engineering fix. What changes by roughly an order of magnitude at each step is the blast radius of applying that fix — validation redone, tooling reset, production stopped, product recalled. This is the Rule of Ten in a single traceable defect rather than an aggregate industry statistic, and it's why Parts I–IV of this book front-load so much effort into getting the requirement, the duty cycle, and the risk ranking right *before* a single accelerated test is run: every one of those steps exists specifically to catch a "resistor tolerance"-class problem while it's still a feasibility-stage paper change, not a service-stage emergency.

**The outcome.** The organizations that consistently catch these problems on the left side of the curve are not the ones with the most expensive test labs — they're the ones with disciplined requirements definition, a duty cycle built from real usage data, and a DFMEA that gets used as a living document instead of a compliance artifact. That is the actual subject of this book, starting with Chapter 2.

## Common Pitfalls

- **Treating reliability testing as a gate at the end of the program**, rather than a set of decisions that start at the requirements stage. By the time a test is running, the duty cycle and risk ranking that determine whether it's the *right* test are already locked in.
- **Running one test strategy for every failure mode.** A HALT campaign will not find a wear-out mechanism, and a six-month accelerated life test is an expensive way to catch a workmanship defect a two-day production screen would have caught. Match the test to the bathtub-curve region the failure cause actually lives in.
- **Measuring reliability activity by test hours run, not by defects prevented before they were expensive.** The Rule of Ten means a requirements review that kills a bad assumption in an afternoon can be worth more than a month of lab testing that confirms a design flaw everyone could have caught earlier.
- **Forgetting that the loop has to close.** A reliability program that stops at "ship it" and never feeds field and warranty data back into the DFMEA (Part VI) will keep re-discovering the same failure modes, generation after generation — which is exactly the pattern behind the recall statistic this chapter opened with.

## Where We're Headed

Chapter 2 starts where every real program has to start: turning a customer's vague expectation ("it should be reliable," "it should last the life of the product") into a requirement that is specific enough to design against, specific enough to disagree with, and specific enough to eventually test.

### Sources for this chapter

1. Bertsche, *Reliability in Automotive and Mechanical Engineering*, Ch. 1, Fig. 1.2 (Kraftfahrt-Bundesamt recall data, 1998–2006).
2. Bertsche, Ch. 1 (VDI Guideline 4001 reliability definition).
3. Bertsche, Ch. 1, Fig. 1.1 (DAT-Report 2007 car purchase criteria survey).
4. Bertsche, Ch. 1 (warranty/guarantee cost as % of turnover).
5. Bertsche, Ch. 1, Fig. 1.5 ("Rule of Ten," cost vs. product life phase).
6. O'Connor & Kleyner, *Practical Reliability Engineering*, 5th ed., §17.3, Fig. 17.3 (reliability cost progression example).
7. Bertsche, Ch. 2, Fig. 2.20 (bathtub curve, three regions); O'Connor & Kleyner, Ch. 1, §1.6–1.7, Fig. 1.6; *Reliability Physics and Engineering — Time-to-Failure Modeling*, Ch. 7, §4 (bathtub curve, EFR/IFR/wear-out, burn-in).
8. O'Connor & Kleyner, Ch. 1, §1.7 (failure patterns for repairable systems: CFR/DFR/IFR).
9. Bertsche, Ch. 1, Fig. 1.4 (reliability methods across the product life cycle).
10. Porter (docuri), *Accelerated Testing and Validation*, "What Not To Know" (resistor tolerance / cost-of-discovery-timing scenario).
