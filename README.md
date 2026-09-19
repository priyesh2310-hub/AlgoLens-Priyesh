# AlgoLens — Interactive AlgoLens

An enhanced version of the original AlgoLens project.

## What was added

1. **Operation counters**
   - Comparisons
   - Swaps
   - Array size
   - Step count

2. **Step-by-step execution**
   - Automatic mode
   - Step-by-Step mode
   - Next Step control

3. **Algorithm learning panel**
   - Best / Average / Worst complexity
   - Space complexity
   - Stability
   - Learning notes
   - Pseudocode

4. **Algorithm Race**
   - Runs Bubble, Selection, Insertion, Merge and Quick Sort on the same input
   - Compares tracked operations
   - Highlights the lowest-operation result

5. **Array pattern generator**
   - Random
   - Sorted
   - Reverse sorted
   - Nearly sorted
   - Adjustable generated size

## Algorithms

### Sorting
- Bubble Sort
- Selection Sort
- Insertion Sort
- Merge Sort
- Quick Sort

### Searching
- Linear Search
- Binary Search

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- No framework
- No backend

## Run locally

Open `index.html` in a browser.

For the cleanest local development experience, use a simple local server such as VS Code Live Server.

## Project structure

```text
AlgoLens/
├── index.html
├── script.js
├── style.css
└── README.md
```

The original project architecture was retained: HTML controls the UI structure, CSS handles visualization states, and JavaScript manages state, rendering, algorithm execution and animation.
