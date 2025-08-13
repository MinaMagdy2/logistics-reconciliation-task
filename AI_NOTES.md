# AI Usage Notes

In developing this logistics application, I utilized a GPT-based AI assistant primarily as a collaborative partner for debugging, logic validation, and generating boilerplate code. The strategy was iterative and focused on using the AI to accelerate development rather than offload critical thinking.

### Prompt 1: Initial Code Scaffolding and File I/O

I began by asking the assistant to outline a basic structure for a Node.js application that reads and writes multiple files (`.json` and `.csv`).

-   **Prompt Example:** "Create a Node.js script structure that reads `orders.json` and `zones.csv`, processes them, and writes to `clean_orders.json`. Show how to use `fs` for reading/writing and `csv-parse` for the CSV file."
-   **Outcome:** The AI provided a solid starting point with correct file handling logic. This saved time on boilerplate setup and allowed me to focus on the core normalization logic immediately.

### Prompt 2: Iterative Debugging and Logic Refinement (Most Effective Use)

The most critical use of the AI was in a feedback loop to debug the planning and reconciliation logic. This process was key to reaching the correct, deterministic output.

-   **Process:** I would run my code, get an output JSON, and present it to the AI, asking "My code produced this result, but the example test case expects a different result. Can you trace the logic to find the discrepancy?"

-   **Example Interaction:** I presented my `plan.json`, which correctly assigned `ORD-002` to `Bosta` due to `Weevo`'s capacity being filled by `ORD-001`. I noted that the sample output in the project description was different.

-   **What the AI Got Wrong (and I corrected):** Initially, the AI assistant incorrectly agreed with the project's sample output. It took several rounds of me providing my step-by-step logical trace (i.e., `ORD-001` is processed first, which uses up `Weevo`'s capacity, making it ineligible for `ORD-002`) for the AI to re-evaluate its own analysis.

-   **Outcome & Why this was effective:** The AI eventually corrected its mistake and confirmed that **my code's logic was correct** and the sample output was misleading. This process turned the AI into a validation tool. By forcing it to justify its reasoning against mine, I was able to gain high confidence in my own logic and prove its correctness, which is a more advanced use than simply asking for code. This iterative debugging cycle was the most valuable part of the AI collaboration, helping to solidify complex, stateful logic under tight constraints.
