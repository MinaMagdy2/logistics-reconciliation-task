# AI-Assisted Logistics Cleanup & Reconciliation

This project is a command-line program built with Node.js that processes, plans, and reconciles logistics orders. It takes messy, duplicated order data and produces a clean dataset, a courier assignment plan, and a reconciliation report comparing the plan against an actual delivery log.

## Features

-   **Data Cleaning:** Normalizes and de-duplicates order data from various formats.
-   **Assignment Planning:** Assigns couriers to orders based on a complex set of constraints (zone coverage, capacity, payment types, product exclusions) and tie-breaking rules.
-   **Reconciliation:** Compares the generated plan against a delivery log to identify discrepancies like late, misassigned, or unexpected orders.

## Prerequisites

-   Node.js (v16 or higher is recommended)
-   npm (Node Package Manager, comes with Node.js)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MinaMagdy2/logistics-reconciliation-task.git
    cd logistics-reconciliation-task
       ```

2.  **Install dependencies:**
    Run the following command in the project's root directory. This will download the required libraries (`dayjs`, `csv-parse`) into a `node_modules` folder.
    ```bash
    npm install
    ```

## File Structure

The project expects the following file structure. The input files must be placed inside a `data` directory.


├── data/
│ ├── orders.json
│ ├── couriers.json
│ ├── zones.csv
│ └── log.csv
├── app.js
├── task1_cleaner.js
├── task2_planner.js
├── task3_reconciler.js
├── package.json
└── .gitignore

## How to Run

After setting up the project and installing the dependencies, run the main application from the project's root directory with this single command:

```bash
node app.js
Output

The program will run all three tasks sequentially and generate the following files in the project's root directory:

   1- clean_orders.json: Contains the normalized and de-duplicated list of orders.

    2-plan.json: Details the courier assignments, unassigned orders, and final capacity usage for each courier.

    3-reconciliation.json: A report that flags all discrepancies found between the plan and the delivery log.
