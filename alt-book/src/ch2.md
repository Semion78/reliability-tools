# Chapter 2 — From Customer Needs to Testable Requirements

In June 1996, the first Ariane 5 rocket self-destructed 37 seconds after launch. The root cause traced back to a specification detail: the guidance computer and the inertial measurement unit used different numeric bit formats, a known inconsistency that had never caused a failure on the earlier Ariane 4 — because Ariane 4 never flew fast enough to trigger it. Ariane 5's greater thrust produced a velocity value the inertial unit's format couldn't hold, the resulting overflow was treated as flight data, and the guidance system commanded a course correction for a problem that didn't exist. Three years later, NASA's Mars Climate Orbiter was lost for an equally mundane reason: one subsystem's software produced thrust data in pound-force units while the interfacing system expected newtons.¹

Neither failure was caused by a component that broke. Both were caused by a requirement — an interface specification — that was ambiguous, incomplete, or inconsistent in exactly the way that let two correct pieces of engineering fail to work together. This is the uncomfortable truth Chapter 1's Rule of Ten was pointing at: the cheapest possible place to prevent a catastrophic failure is in the wording of a requirement, and the most expensive possible place to discover that the wording was wrong is after launch. This chapter is about doing that work at the cheap end.

## 2.1 The Problem With "As Reliable As Possible"

Reliability requirements fail in two opposite ways, and both are common enough to have become clichés inside engineering organizations.

The first is the **vague requirement**: "as reliable as possible," "high reliability is to be a feature of the design," "the target reliability is to be 99%." None of these statements can be verified, disagreed with, or designed against. A statement that cannot fail an audit cannot pass one either — it simply floats above the process, unfalsifiable, while the actual design decisions get made on other grounds (cost, schedule, familiarity) because there is no testable target to check them against.²

The second is the **unrealistic requirement**: an achievable-sounding number attached to a system too complex to plausibly hit it, or a requirement copied from a previous, unrelated product's spec without re-derivation. "Will not fail under the specified operating conditions" is a legitimate requirement for a simple mechanical part; the same sentence attached to a complex electronic system with thousands of failure opportunities is not a credible design parameter, and everyone downstream — quietly, without saying so — treats it as decorative rather than binding.³

Both failure modes have the same practical effect: the requirement stops functioning as a requirement. The rest of this chapter is about writing the kind of requirement that survives contact with a skeptical design review, a skeptical test engineer, and — eventually — a skeptical customer holding a failed part.

## 2.2 What a Reliability Specification Must Actually Contain

A reliability specification that will hold up has four components, and all four have to be present or the specification has a hole that will surface later, usually during a dispute about whether something counts as a failure.⁴

@@widget speccards | Four cards name the four components of a reliability specification: failure definition, environments, the reliability requirement, and the verification method. Tapping a card shows what it must contain and which later part of the book depends on it.

**1. A definition of failure, tied to function.** This sounds trivial and isn't. Consider a leaking seal: is it a failure? The honest answer is "it depends" — on the leak rate, on whether it can be corrected by a routine adjustment, on whether it affects function under normal conditions versus some other condition the product will also see. A diode installed to clip voltage transients can fail without affecting any functional test you'd normally run, and only matters the one time a transient actually occurs. The specification's job is to remove this ambiguity in advance, in writing, rather than let it get argued out later — usually during a warranty dispute, which is the single worst time to be defining terms for the first time.⁵

**2. A full description of the environments the product will face** — not just "in service," but storage, transport, handling, maintenance, and foreseeable misuse. Automotive and defense programs often use a named standard for this (GMW3172 for automotive validation, UK Defence Standard 00-40 for reliability specifications generally) precisely because writing a complete environmental description from a blank page is easy to get wrong by omission.⁶ If the designer isn't told about a condition, the designer isn't designing against it — no matter how "obvious" that condition seems to someone who's used the product for years.

**3. A stated reliability requirement, in a verifiable form**, which is the subject of §2.3 below.

**4. A verification method** — how the requirement will actually be confirmed: test bench conditions, test duration, sample size, pass/fail criteria. A requirement with no verification method attached is really just an aspiration.

Put together, these four elements form what a usable requirements document actually looks like in practice — not prose, but a structured catalogue: functional and environmental conditions, then failure definition, then the reliability requirement itself (expressed as a failure rate, a B10 life, or similar), then the verification method.⁷ Every chapter of this book from here forward assumes a requirement built this way exists — Part III's DFMEA work depends on failure being already defined; Part IV's stress work depends on the environmental description being complete; Part V's test design depends on the verification method being specified up front rather than improvised later.

## 2.3 Choosing the Right "Currency" for the Requirement

A reliability requirement has to be stated in units that actually match how the product accumulates damage and how its use will actually be measured. Getting this wrong is one of the most common — and most avoidable — mistakes in requirements writing: specifying a time-between-failures for a product whose usage will only ever be measured in distance traveled, or specifying hours for a component whose life is really governed by switch reversals, sequencing operations, or record/playback cycles.⁸ A switch doesn't wear out on a clock; it wears out on operations. Say "hours" instead of "cycles" and you've written a requirement nobody can actually verify against the way the product is used.

The common reliability metrics and when each one fits:⁹

@@say R of t: the probability of survival to time, distance or cycles t. The most general form. A specification might read: R of 5 years is at least 0.98.
- **R(t)** — probability of survival to time/distance/cycles *t*. The most general form; a spec might read "R(5 years) ≥ 0.98."
- **B10 life** (or more generally BX life) — the life at which X% of the population is expected to have failed (B10 = 90% reliability point). Popular because it's intuitive to non-specialists and maps cleanly onto warranty-period thinking.
- **MTBF / MTTF** — mean time between/to failure, valid for constant-failure-rate (exponential) behavior. Frequently *mis*used — MTBF is often read by non-specialists as "how long until it breaks," when it's actually a population-average statistic that says nothing about any individual unit's expected life, especially once wear-out (Chapter 1's bathtub curve, Region 3) starts to dominate.
- **PPM** (parts per million failed by time *t*) — more common in production quality contexts, but usable as a time-dependent reliability metric too.

@@say These forms convert into each other under a stated distribution assumption. A worked conversion. Suppose a product's initial requirement is stated as a B ten life of 5 years, and failures are assumed exponentially distributed, meaning a constant failure rate. Then the reliability at 5 years is 0.90, and that equals e to the power of minus 5 divided by the M T T F. Solving gives an M T T F of about 47.5 years. The failure rate lambda is one divided by 47.5, about 0.021 failures per year. Assuming 24-hour-per-day operation, lambda is about 2.4 times ten to the minus 6 failures per hour. Notice the buried assumption in that last step: 24-hour-per-day operation. That assumption is fine for a server or an always-on appliance. It is wrong, sometimes by two orders of magnitude, for anything that spends most of its calendar life switched off, in a customer's garage, in a drawer, or idling. The main worked example below exists specifically to show what happens when that assumption gets made correctly versus carelessly.
These forms convert into each other under a stated distribution assumption. A worked conversion: if a product's initial requirement is stated as **B10 life = 5 years**, and failures are assumed exponentially distributed (constant failure rate), then R(5 yrs) = 0.90 = exp(−5/MTTF), which solves to MTTF ≈ 47.5 years, giving a failure rate λ = 1/47.5 ≈ 0.021 failures/year — or, assuming 24-hour/day operation, λ ≈ 2.4×10⁻⁶ failures per hour.¹⁰ Notice the buried assumption in that last step: *24-hour/day operation*. That assumption is fine for a server or an always-on appliance. It is wrong — sometimes by two orders of magnitude — for anything that spends most of its calendar life switched off, in a customer's garage, in a drawer, or idling. The main worked example below exists specifically to show what happens when that assumption gets made correctly versus carelessly.

@@widget convert | A converter between the forms of a reliability requirement. You enter a B-life percentage, a life, and how many hours per year the product is powered. It returns the mean time to failure and the failure rate per calendar year and per operating hour, and draws the survival curve: reliability starts at one and decays exponentially, passing through 0.90 at the B ten life. Three worked examples are preloaded. The first reproduces the conversion just described: B ten of 5 years, always on, giving 47.5 years and 2.4 times ten to the minus 6 per hour. The second is this chapter's control unit: B ten of 12 years at 400 powered hours per year. The third is the infusion pump of chapter 3, stated directly as 5,000 operating hours.

## 2.4 Where the Number Actually Comes From: Usage Data, Not Guesswork

Before any of the conversions in §2.3 mean anything, someone has to answer a prior question: what usage level is this requirement even being written against? "The life of the vehicle" is not a number. It becomes one only when it's grounded in how the population of actual customers uses the product — and the right way to do that is with real usage-distribution data, not a single "average" assumption.

A documented industry case makes this concrete. A vehicle manufacturer analyzed dealership repair records across several European markets, converting sales-to-repair distance data into annual driving-distance figures. The result fit a lognormal distribution (μ = 3.867, σ = 0.603): an average annual driving distance of 20,600 km, a median of 17,200 km — and a 95th-percentile driver at 46,000 km per year. The manufacturer then built the engine reliability specification for its Tier 2 supplier around the **95th-percentile figure, not the average**, because a requirement written to the average driver leaves the top 5% of the customer population — not a small number of people, across a large production volume — under-specified from day one.¹¹ This is the same percentile-selection logic Chapter 1's opening statistic depends on, and it's the same logic Part II will return to in far more depth when we build full duty cycles rather than single design-life numbers.

@@widget lognormal | The chart shows how annual driving distance is spread across the driver population. The curve rises steeply to a peak at around twelve thousand kilometres a year, then falls away in a long tail to the right that is still visible beyond sixty thousand. That long tail is the point: the median driver covers 17,200 kilometres, the average is 20,600, but the 95th-percentile driver covers about 46,000, nearly three times the median. A slider moves a vertical marker along the curve; the area to its left is the share of customers the requirement covers. At the 95th percentile and twelve years of ownership the design distance is roughly 560,000 kilometres.

## Real-World Example: Turning "Must Last the Life of the Vehicle" Into a Testable Requirement

**The scenario.** An OEM tells its electronic control unit (ECU) supplier that the unit "must last the life of the vehicle." Nothing about that sentence can be designed against, tested against, or disputed if it turns out to be wrong. The requirements engineer's job is to turn it into something that can be all three.

**Step 1 — Establish the usage basis.** Following the logic (and the real distribution figures) from §2.4, the program adopts the 95th-percentile driver as its design population — the same choice the cited OEM case made, for the same reason: a requirement sized to the average driver silently fails the top of the customer distribution. Combined with a 12-year ownership assumption (a typical automotive design-life target), this gives a total distance-based usage assumption. *(In a real program this step would be refined further using the product's own duty-cycle work in Part II rather than assumed constant year over year — flagged here as a simplification, not a final answer.)*

@@say Step 2. State the requirement in a verifiable form. The program states the requirement as a B ten life of at least 12 years, verified as a reliability at 12 years of at least 0.90, under a stated environmental and functional description as set out in section 2.2. Not, the life of the vehicle.
**Step 2 — State the requirement in a verifiable form.** The program states the requirement as **B10 life ≥ 12 years**, reliability-verified at R(12 yrs) ≥ 0.90, under a stated environmental and functional description (per §2.2) — not "the life of the vehicle."

**Step 3 — Convert to the correct currency.** This is where the 24-hour/day assumption from §2.3's worked conversion has to be checked rather than reused blindly. An ECU is only powered when the vehicle is running, not continuously. Using the same exponential-distribution math as the earlier conversion:

@@formula R(12 yrs) = 0.90 = exp(−12 / MTTF)  →  MTTF = 12 / −ln(0.90) = 12 / 0.1054 ≈ **113.9 years** || First formula. The reliability at 12 years is 0.90, and it equals e to the power of minus 12 divided by the M T T F. Rearranging, the M T T F equals 12 divided by the negative natural logarithm of 0.90. That logarithm is 0.1054, so the M T T F is about 113.9 years. Notice how far that is from 12 years: a B ten life of 12 years needs a mean life nearly ten times longer.

@@formula λ<sub>calendar</sub> = 1 / MTTF ≈ **0.00878 failures / year** || Second formula. The calendar failure rate, lambda, is one divided by the M T T F: about 0.00878 failures per year.

If the product's actual average engine-on time is roughly 400 hours/year (a representative passenger-vehicle usage figure, not the 8,760 hours/year that "24-hour operation" would assume), the requirement converts to an **operating-hour** failure rate — the currency the design team can actually engineer against:

@@formula λ<sub>operating</sub> = 0.00878 failures / year ÷ 400 operating-hours / year ≈ **2.20 × 10⁻⁵ failures per operating hour** || Third formula. The operating-hour failure rate is the calendar rate, 0.00878 failures per year, divided by 400 operating hours per year. The result is about 2.20 times ten to the minus 5 failures per operating hour. In plain terms: about 22 failures for every million hours of running.

Had the team lazily reused the 24-hour/day assumption from §2.3 instead of checking it, the resulting target would have been roughly 22 times more lenient than the real requirement — a hole in the specification that would not surface until field data started arriving, years later, at exactly the cost point the Rule of Ten warns about.

**Step 4 — Apportion the system target across subsystems.** A system-level failure-rate target isn't directly testable at the subsystem level — someone has to decide how much of that 2.20×10⁻⁵/hr budget each subassembly is allowed to consume. For a series reliability structure (the normal case for an ECU: any one subsystem's failure fails the unit), the system failure rate is the **sum** of the subsystem failure rates.¹² Using engineering judgment on relative complexity and criticality — a first-pass apportionment, later refined with the prediction methods previewed in Part IV — the program splits the budget:

@@say The table splits the system budget across five subsystems. Power supply and regulation receives 25 percent of the budget: 5.49 times ten to the minus 6 failures per operating hour, equivalent to a B ten of about 19,200 operating hours. The microcontroller and digital core receives 20 percent: 4.39 times ten to the minus 6, a B ten of about 24,000 hours. The sensor interface also receives 20 percent, with the same figures. The output driver and relay stage receives 25 percent, the same as the power supply. The connector and harness interface receives 10 percent: 2.20 times ten to the minus 6, a B ten of about 47,900 hours. The five shares add up to the system total of 2.20 times ten to the minus 5, which is a system B ten of about 4,790 operating hours, or 12 years at 400 hours per year. Notice the pattern: the smaller a block's share of the failure budget, the longer the life it must demonstrate.
| Subsystem | Share of budget | Allocated λ (failures/operating-hr) | Equivalent B10 (operating hours) |
|---|---|---|---|
| Power supply / regulation | 25% | 5.49 × 10⁻⁶ | ≈ 19,200 |
| MCU / digital core | 20% | 4.39 × 10⁻⁶ | ≈ 24,000 |
| Sensor interface | 20% | 4.39 × 10⁻⁶ | ≈ 24,000 |
| Output driver / relay stage | 25% | 5.49 × 10⁻⁶ | ≈ 19,200 |
| Connector / harness interface | 10% | 2.20 × 10⁻⁶ | ≈ 47,900 |
| **System total** | **100%** | **2.20 × 10⁻⁵** | *(system B10 ≈ 4,790 operating-hrs, ≈ 12 yrs at 400 hrs/yr)* |

@@widget ecuapp | The apportionment table as a set of sliders and bars, one per subsystem. Dragging a share changes that block's allocated failure rate and its equivalent B ten life. Give a block a smaller share and its bar shortens while its required life grows. If the shares add up to more than one hundred percent, the figure warns that the system would miss its target.

Each row is now a testable, subsystem-level requirement that a component or module engineer can actually design and validate against — traceable back through the apportionment math to the system target, and back through that to the OEM's original sentence. This table is also the direct input to Chapter 3's functional decomposition and reliability block diagram work, and every "B10 (operating hours)" figure in the right-hand column becomes a candidate acceleration-test target once Part IV converts it into an actual stress and test duration.

**The outcome.** What started as an unfalsifiable sentence is now five numbers that five different engineers can be held to, that a test lab can design a demonstration test around (Part V), and that a field-data comparison can eventually validate or correct (Part VI) — closing the loop this book keeps returning to.

## Common Pitfalls

- **Vague or unrealistic requirements** that nobody actually designs against, because nobody can — they're either unfalsifiable ("as reliable as possible") or implausible enough to be silently ignored.
- **Wrong currency.** Stating a time-based requirement for a product whose damage accumulates in cycles, distance, or switch operations — or reusing a 24-hour/day operating assumption for a product that's powered a fraction of the time, as the worked example shows can silently understate the real requirement by an order of magnitude or more.
- **Ambiguous or incomplete failure definitions**, discovered for the first time during a warranty dispute rather than settled in advance — the leaking-seal problem from §2.2.
- **Interface and unit inconsistencies** between subsystems or suppliers that individually meet their own specifications perfectly — the Ariane 5 and Mars Climate Orbiter pattern that opened this chapter. A specification review that only checks each requirement in isolation, and never checks that units and formats agree across interfaces, will not catch this class of failure.
- **Omitting misuse, storage, and dormant conditions** from the environmental description, on the assumption that "normal use" covers everything the designer needs to know.
- **Copying a requirement from a previous, unrelated product** instead of re-deriving it from this product's actual usage data and duty cycle.

## Where We're Headed

The apportionment table above assumed a functional structure — five named subsystems in series — without actually justifying where those boundaries come from or what happens at the interfaces between them. Chapter 3 builds that structure properly: the system/subassembly/component decomposition, the reliability block diagram, and why the interfaces between blocks deserve as much attention as the blocks themselves.

### Sources for this chapter

1. O'Connor & Kleyner, *Practical Reliability Engineering*, 5th ed., Ch. 10 (Ariane 5 and NASA Mars Polar/Climate Orbiter specification-error examples).
2. O'Connor & Kleyner, §17.6 (vague requirements: "as reliable as possible," etc.).
3. O'Connor & Kleyner, §17.6 (unrealistic requirements).
4. O'Connor & Kleyner, §17.6 (the reliability specification's required contents).
5. O'Connor & Kleyner, §17.6.1 (Definition of Failure — the leaking-seal and transient-diode examples).
6. O'Connor & Kleyner, §17.6.2 (Environmental Specifications; GMW3172, UK Defence Standard 00-40).
7. Bertsche, *Reliability in Automotive and Mechanical Engineering*, §11.2.1, Fig. 11.4 (Requirement catalogue chapter: Reliability).
8. O'Connor & Kleyner, §17.6.3 (Stating the Reliability Requirement — currency/units matching duty cycle).
9. O'Connor & Kleyner, Ch. 14, §14.2 (Reliability Metrics: R(t), MTBF/MTTF, BX-life, PPM).
10. O'Connor & Kleyner, Ch. 14, Example 14.1 (B10-to-MTTF-to-failure-rate conversion).
11. O'Connor & Kleyner, §7.3.3 (European passenger-car annual driving-distance case: lognormal distribution, percentile-based engine reliability specification for a Tier 2 supplier).
12. Bertsche, §11.2.1 and §2.3 (Boolean/series-system reliability apportionment: system failure quota as the sum of subsystem failure quotas).
