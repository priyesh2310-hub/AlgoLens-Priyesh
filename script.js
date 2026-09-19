/**
 * Professional DSA Analyzer - Control Logic
 * Pure ES6+, No Frameworks, Module-like structure
 */

/** DOM Elements Setup */
const DOM = {
    arrayInput: document.getElementById('array-input'),
    searchInput: document.getElementById('search-input'),
    btnRandom: document.getElementById('btn-random'),
    btnStop: document.getElementById('btn-stop'),
    speedRange: document.getElementById('speed-range'),

    arrayContainer: document.getElementById('array-container'),
    logsList: document.getElementById('logs-list'),
    resultBanner: document.getElementById('result-banner'),
    resultText: document.getElementById('result-text'),
    actionHint: document.getElementById('action-hint'),

    algoName: document.getElementById('current-algo-name'),
    algoDesc: document.getElementById('current-algo-desc'),
    complexityTime: document.getElementById('complexity-time'),

    algoBtns: document.querySelectorAll('.algo-btn'),
    statusIndicator: document.getElementById('system-status')
};

/** Algorithm Info Catalog */
const ALGO_METADATA = {
    bubble: {
        name: 'Bubble Sort',
        desc: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. A classic introductory sorting algorithm.',
        time: 'O(n²)'
    },
    selection: {
        name: 'Selection Sort',
        desc: 'Divides the list into a sorted and unsorted region. Repeatedly selects the smallest element from the unsorted region to add to the sorted region.',
        time: 'O(n²)'
    },
    insertion: {
        name: 'Insertion Sort',
        desc: 'Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into the sorted portion.',
        time: 'O(n²)'
    },
    merge: {
        name: 'Merge Sort',
        desc: 'A divide and conquer algorithm that divides the array into halves, sorts them, and then merges the sorted halves.',
        time: 'O(n log n)'
    },
    quick: {
        name: 'Quick Sort',
        desc: 'A divide and conquer algorithm that picks a pivot and partitions the array into two sub-arrays according to whether they are less than or greater than the pivot.',
        time: 'O(n log n)'
    },
    linear: {
        name: 'Linear Search',
        desc: 'Sequentially checks each element of the list until a match is found or the whole list has been searched.',
        time: 'O(n)'
    },
    binary: {
        name: 'Binary Search',
        desc: 'Quickly searches a sorted array by repeatedly dividing the search interval in half. *Note: Data must be sorted first!*',
        time: 'O(log n)'
    }
};

/** Application State */
let state = {
    elements: [],      // Array of objects { value, wrapper, node }
    isRunning: false,
    shouldForceStop: false
};

/** 
 * Utility & Render Engine 
 */
const Engine = {
    // Parser
    parseArrayInput() {
        const raw = DOM.arrayInput.value;
        return raw.split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(Number)
            .filter(num => !isNaN(num));
    },

    // View renderer
    drawArray(arr) {
        DOM.arrayContainer.innerHTML = '';
        state.elements = [];

        const maxVal = Math.max(...arr, 1);
        const MAX_HEIGHT = 300;
        const MIN_HEIGHT = 40;

        arr.forEach(val => {
            // Wrapper holds value on top, bar below
            const wrapper = document.createElement('div');
            wrapper.className = 'array-bar-wrapper';

            const valueSpan = document.createElement('span');
            valueSpan.className = 'array-bar-value';
            valueSpan.innerText = val;

            const node = document.createElement('div');
            node.className = 'array-bar-node';

            // Dynamic Height calculation
            const h = MIN_HEIGHT + (val / maxVal) * (MAX_HEIGHT - MIN_HEIGHT);
            node.style.height = `${h}px`;

            wrapper.appendChild(valueSpan);
            wrapper.appendChild(node);
            DOM.arrayContainer.appendChild(wrapper);

            state.elements.push({ value: val, wrapper, node });
        });
    },

    // Logger
    log(msg, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;

        // Add timestamp
        const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });
        entry.innerHTML = `<span style="color:#64748B">[${time}]</span> ${msg}`;

        DOM.logsList.appendChild(entry);
        DOM.logsList.scrollTop = DOM.logsList.scrollHeight; // auto scroll
    },

    clearLogs() {
        DOM.logsList.innerHTML = `<div class="log-entry system">System initialized. Awaiting sequence...</div>`;
    },

    // Results
    showResult(msg, success = true) {
        DOM.resultBanner.className = `result-banner ${success ? 'success' : 'error'}`;
        DOM.resultText.innerText = msg;
    },
    hideResult() {
        DOM.resultBanner.className = 'result-banner hidden';
    },

    showHint(msg) {
        DOM.actionHint.innerText = msg;
        DOM.actionHint.classList.remove('hidden');
    },
    hideHint() {
        DOM.actionHint.classList.add('hidden');
    },

    // Timing Control
    getSpeed() {
        // Range slider is 10 to 1000. Reverse map it so lower value on slider = faster logic? 
        // Actually, html slider: 10 (fast) to 1000 (slow) is intuitive if we label left as Fast.
        return parseInt(DOM.speedRange.value);
    },

    async sleep() {
        return new Promise(resolve => setTimeout(resolve, this.getSpeed()));
    },

    // UI State Locking
    lockUI() {
        state.isRunning = true;
        state.shouldForceStop = false;
        DOM.statusIndicator.classList.add('active');

        DOM.algoBtns.forEach(btn => btn.disabled = true);
        DOM.arrayInput.disabled = true;
        DOM.searchInput.disabled = true;
        DOM.btnRandom.disabled = true;
        DOM.btnStop.disabled = false;
    },

    unlockUI() {
        state.isRunning = false;
        DOM.statusIndicator.classList.remove('active');

        DOM.algoBtns.forEach(btn => btn.disabled = false);
        DOM.arrayInput.disabled = false;
        DOM.searchInput.disabled = false;
        DOM.btnRandom.disabled = false;
        DOM.btnStop.disabled = true;
    },

    updateHeaders(type) {
        const meta = ALGO_METADATA[type];
        DOM.algoName.innerText = meta.name;
        DOM.algoDesc.innerHTML = meta.desc;
        DOM.complexityTime.innerText = meta.time;
    }
};

/**
 * Algorithms Implementations
 */
const Algorithms = {
    async updateElement(idx, newValue) {
        state.elements[idx].node.classList.add('swap');

        Engine.showHint(`Updating index ${idx} to ${newValue}`);

        await Engine.sleep();
        state.elements[idx].value = newValue;
        state.elements[idx].wrapper.querySelector('.array-bar-value').innerText = newValue;

        const maxVal = Math.max(...state.elements.map(e => e.value), 1);
        const MAX_HEIGHT = 300;
        const MIN_HEIGHT = 40;
        const h = MIN_HEIGHT + (newValue / maxVal) * (MAX_HEIGHT - MIN_HEIGHT);
        state.elements[idx].node.style.height = `${h}px`;

        state.elements[idx].node.classList.remove('swap');
        Engine.hideHint();
    },

    async swapElements(i, j) {
        state.elements[i].node.classList.add('swap');
        state.elements[j].node.classList.add('swap');

        let valI = state.elements[i].value;
        let valJ = state.elements[j].value;

        Engine.showHint(`Swapping ${valI} and ${valJ}`);

        await Engine.sleep();

        // Data swap logic (only swapping values, keeping DOM node links intact)
        state.elements[i].value = valJ;
        state.elements[j].value = valI;

        // Visual update
        const maxVal = Math.max(...state.elements.map(e => e.value), 1);
        const MAX_HEIGHT = 300;
        const MIN_HEIGHT = 40;

        state.elements[i].wrapper.querySelector('.array-bar-value').innerText = state.elements[i].value;
        state.elements[i].node.style.height = `${MIN_HEIGHT + (state.elements[i].value / maxVal) * (MAX_HEIGHT - MIN_HEIGHT)}px`;

        state.elements[j].wrapper.querySelector('.array-bar-value').innerText = state.elements[j].value;
        state.elements[j].node.style.height = `${MIN_HEIGHT + (state.elements[j].value / maxVal) * (MAX_HEIGHT - MIN_HEIGHT)}px`;

        state.elements[i].node.classList.remove('swap');
        state.elements[j].node.classList.remove('swap');
        Engine.hideHint();
    },

    async bubbleSort() {
        let n = state.elements.length;
        let swapped;
        Engine.log(`Initializing Bubble Sort (n=${n})`, 'system');

        for (let i = 0; i < n - 1; i++) {
            swapped = false;
            for (let j = 0; j < n - i - 1; j++) {
                if (state.shouldForceStop) return;

                state.elements[j].node.classList.add('compare');
                state.elements[j + 1].node.classList.add('compare');
                Engine.log(`Comparing [${j}]:${state.elements[j].value} with [${j + 1}]:${state.elements[j + 1].value}`);

                Engine.showHint(`Comparing ${state.elements[j].value} with ${state.elements[j + 1].value}`);
                await Engine.sleep();

                if (state.elements[j].value > state.elements[j + 1].value) {
                    Engine.log(`Swapping values ${state.elements[j].value} ↔ ${state.elements[j + 1].value}`, 'active');
                    await this.swapElements(j, j + 1);
                    swapped = true;
                }

                state.elements[j].node.classList.remove('compare');
                state.elements[j + 1].node.classList.remove('compare');
                Engine.hideHint();
            }
            state.elements[n - i - 1].node.classList.add('sorted');

            if (!swapped) {
                Engine.log(`No swaps occurred. Array is fully sorted early.`, 'success');
                break;
            }
        }
        state.elements.forEach(c => c.node.classList.add('sorted'));
        Engine.showResult("Array successfully sorted via Bubble Sort.", true);
    },

    async selectionSort() {
        let n = state.elements.length;
        Engine.log(`Initializing Selection Sort (n=${n})`, 'system');

        for (let i = 0; i < n; i++) {
            let min_idx = i;
            state.elements[min_idx].node.classList.add('compare');
            Engine.log(`Pass ${i + 1}: Local minimum is initially at index ${i}`);

            for (let j = i + 1; j < n; j++) {
                if (state.shouldForceStop) return;

                state.elements[j].node.classList.add('compare');
                Engine.showHint(`Testing if ${state.elements[j].value} is smaller than ${state.elements[min_idx].value}`);
                await Engine.sleep();

                if (state.elements[j].value < state.elements[min_idx].value) {
                    if (min_idx !== i) state.elements[min_idx].node.classList.remove('compare', 'swap');
                    min_idx = j;
                    state.elements[min_idx].node.classList.remove('compare');
                    state.elements[min_idx].node.classList.add('swap'); // highlight current min
                } else {
                    state.elements[j].node.classList.remove('compare');
                }
            }
            Engine.hideHint();

            if (min_idx !== i) {
                state.elements[min_idx].node.classList.remove('swap');
                state.elements[i].node.classList.remove('compare');
                Engine.log(`Found smaller minimum: ${state.elements[min_idx].value}. Swapping to sorted partition.`, 'active');
                await this.swapElements(i, min_idx);
            } else {
                state.elements[i].node.classList.remove('compare', 'swap');
            }
            state.elements[i].node.classList.add('sorted');
        }
        Engine.showResult("Array successfully sorted via Selection Sort.", true);
    },

    async insertionSort() {
        let n = state.elements.length;
        Engine.log(`Initializing Insertion Sort (n=${n})`, 'system');

        state.elements[0].node.classList.add('sorted');

        for (let i = 1; i < n; i++) {
            if (state.shouldForceStop) return;

            let currentIdx = i;
            state.elements[currentIdx].node.classList.add('compare');
            Engine.log(`Inserting element at index ${i} with value ${state.elements[i].value}`);

            Engine.showHint(`Inserting ${state.elements[i].value} into the sorted partition`);
            await Engine.sleep();

            while (currentIdx > 0 && state.elements[currentIdx - 1].value > state.elements[currentIdx].value) {
                if (state.shouldForceStop) return;

                Engine.log(`Swapping ${state.elements[currentIdx - 1].value} and ${state.elements[currentIdx].value}`, 'active');
                await this.swapElements(currentIdx, currentIdx - 1);

                state.elements[currentIdx].node.classList.add('sorted');
                currentIdx--;
                state.elements[currentIdx].node.classList.add('compare');
            }
            state.elements[currentIdx].node.classList.remove('compare');
            Engine.hideHint();

            for (let k = 0; k <= i; k++) state.elements[k].node.classList.add('sorted');
        }
        Engine.showResult("Array successfully sorted via Insertion Sort.", true);
    },

    async mergeSortHelper(l, r) {
        if (l >= r) return;
        let m = Math.floor((l + r) / 2);
        await this.mergeSortHelper(l, m);
        if (state.shouldForceStop) return;
        await this.mergeSortHelper(m + 1, r);
        if (state.shouldForceStop) return;
        await this.merge(l, m, r);
    },

    async merge(l, m, r) {
        Engine.log(`Merging partitions [${l}..${m}] and [${m + 1}..${r}]`);
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) {
            L[i] = state.elements[l + i].value;
            state.elements[l + i].node.classList.add('compare');
        }
        for (let j = 0; j < n2; j++) {
            R[j] = state.elements[m + 1 + j].value;
            state.elements[m + 1 + j].node.classList.add('compare');
        }

        Engine.showHint(`Merging groups into final sorted positions`);
        await Engine.sleep();
        Engine.hideHint();

        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            if (state.shouldForceStop) return;
            if (L[i] <= R[j]) {
                await this.updateElement(k, L[i]);
                i++;
            } else {
                await this.updateElement(k, R[j]);
                j++;
            }
            k++;
        }
        while (i < n1) {
            if (state.shouldForceStop) return;
            await this.updateElement(k, L[i]);
            i++; k++;
        }
        while (j < n2) {
            if (state.shouldForceStop) return;
            await this.updateElement(k, R[j]);
            j++; k++;
        }
        for (let x = l; x <= r; x++) {
            state.elements[x].node.classList.remove('compare');
            state.elements[x].node.classList.add('sorted');
        }
    },

    async mergeSort() {
        let n = state.elements.length;
        Engine.log(`Initializing Merge Sort (n=${n})`, 'system');
        await this.mergeSortHelper(0, n - 1);
        if (!state.shouldForceStop) {
            state.elements.forEach(e => e.node.classList.add('sorted'));
            Engine.showResult("Array successfully sorted via Merge Sort.", true);
        }
    },

    async partition(low, high) {
        let pivotValue = state.elements[high].value;
        state.elements[high].node.classList.add('swap'); // pivot
        Engine.log(`Partitioning with pivot ${pivotValue} at index ${high}`);
        Engine.showHint(`Partitioning around Pivot: ${pivotValue}`);

        let i = low - 1;
        for (let j = low; j <= high - 1; j++) {
            if (state.shouldForceStop) return;
            state.elements[j].node.classList.add('compare');
            await Engine.sleep();

            if (state.elements[j].value < pivotValue) {
                i++;
                if (i !== j) {
                    Engine.log(`Swapping index ${i} and ${j}`, 'active');
                    await this.swapElements(i, j);
                }
            } else {
                state.elements[j].node.classList.remove('compare');
            }
        }

        Engine.hideHint();
        if (i + 1 !== high) {
            Engine.log(`Placing pivot ${pivotValue} at correct position index ${i + 1}`, 'active');
            await this.swapElements(i + 1, high);
        }

        for (let k = low; k <= high; k++) {
            state.elements[k].node.classList.remove('compare', 'swap');
        }
        state.elements[i + 1].node.classList.add('sorted');
        return i + 1;
    },

    async quickSortHelper(low, high) {
        if (low < high) {
            let pi = await this.partition(low, high);
            if (state.shouldForceStop) return;
            await this.quickSortHelper(low, pi - 1);
            if (state.shouldForceStop) return;
            await this.quickSortHelper(pi + 1, high);
        } else if (low === high) {
            state.elements[low].node.classList.add('sorted');
        }
    },

    async quickSort() {
        let n = state.elements.length;
        Engine.log(`Initializing Quick Sort (n=${n})`, 'system');
        await this.quickSortHelper(0, n - 1);
        if (!state.shouldForceStop) {
            state.elements.forEach(e => e.node.classList.add('sorted'));
            Engine.showResult("Array successfully sorted via Quick Sort.", true);
        }
    },

    async linearSearch(target) {
        let n = state.elements.length;
        Engine.log(`Initializing Linear Search for target: ${target}`, 'system');

        for (let i = 0; i < n; i++) {
            if (state.shouldForceStop) return;

            state.elements[i].node.classList.add('compare');
            Engine.log(`Checking pointer [${i}] → Value: ${state.elements[i].value}`);
            await Engine.sleep();

            if (state.elements[i].value === target) {
                state.elements[i].node.classList.remove('compare');
                state.elements[i].node.classList.add('found');
                Engine.log(`Target ${target} located at index ${i}!`, 'success');
                Engine.showResult(`Target found at index ${i}`, true);

                // dim others
                state.elements.forEach((el, idx) => {
                    if (idx !== i) el.node.classList.add('not-found');
                });
                return;
            }
            state.elements[i].node.classList.remove('compare');
            state.elements[i].node.classList.add('not-found');
        }

        Engine.log(`Search exhausted. Target ${target} not in system.`, 'error');
        Engine.showResult(`Target ${target} not found.`, false);
    },

    async binarySearch(target) {
        const midPointer = document.getElementById('mid-pointer');
        let n = state.elements.length;
        Engine.log(`Initializing Binary Search for target: ${target}`, 'system');

        // Check if sorted, visually sort if not
        let isSorted = true;
        for (let i = 0; i < n - 1; i++) {
            if (state.elements[i].value > state.elements[i + 1].value) {
                isSorted = false;
                break;
            }
        }

        if (!isSorted) {
            Engine.log(`WARNING: Binary Search requires a sorted array. Sorting data automatically...`, 'error');
            Engine.showHint("Searching algorithm requires a sorted array. Auto-sorting first...");
            await Engine.sleep();
            Engine.hideHint();

            // Soft-sort the underlying array using built-in JS to update visual nodes
            let rawVals = state.elements.map(e => e.value);
            rawVals.sort((a, b) => a - b);

            for (let i = 0; i < n; i++) {
                if (state.elements[i].value !== rawVals[i]) {
                    await this.updateElement(i, rawVals[i]);
                }
            }
            Engine.log(`Array successfully auto-sorted. Continuing search protocol...`, 'system');
        }

        let left = 0;
        let right = n - 1;
        midPointer.classList.remove('hidden');
        midPointer.classList.add('active');

        while (left <= right) {
            if (state.shouldForceStop) {
                midPointer.classList.add('hidden');
                midPointer.classList.remove('active');
                return;
            }

            // Dim elements out of bounds
            state.elements.forEach((el, idx) => {
                if (idx < left || idx > right) {
                    el.node.classList.add('not-found');
                    el.node.classList.remove('compare');
                } else {
                    el.node.classList.remove('not-found');
                }
            });

            let mid = Math.floor((left + right) / 2);
            state.elements[mid].node.classList.add('compare');

            // Move pointer over current mid element
            let midNodeReact = state.elements[mid].wrapper.getBoundingClientRect();
            let containerRect = document.getElementById('array-container').getBoundingClientRect();
            let relativeLeft = (midNodeReact.left - containerRect.left) + (midNodeReact.width / 2);
            midPointer.style.left = `${relativeLeft}px`;

            Engine.log(`L:${left} R:${right} -> Pivot at mid[${mid}] value: ${state.elements[mid].value}`);
            Engine.showHint(`Checking middle index ${mid} against target ${target}`);
            await Engine.sleep();

            if (state.elements[mid].value === target) {
                state.elements[mid].node.classList.remove('compare');
                state.elements[mid].node.classList.add('found');
                Engine.log(`Target ${target} located at index ${mid}!`, 'success');
                Engine.showResult(`Target found at index ${mid}`, true);

                // Dim remaining
                state.elements.forEach((el, idx) => {
                    if (idx !== mid) el.node.classList.add('not-found');
                });
                Engine.hideHint();
                midPointer.classList.add('hidden');
                midPointer.classList.remove('active');
                return;
            }

            if (state.elements[mid].value < target) {
                Engine.log(`${state.elements[mid].value} < ${target}. Discarding left half.`, 'active');
                Engine.showHint(`${state.elements[mid].value} is smaller than ${target}. Searching right half.`);
                await Engine.sleep();
                left = mid + 1;
            } else {
                Engine.log(`${state.elements[mid].value} > ${target}. Discarding right half.`, 'active');
                Engine.showHint(`${state.elements[mid].value} is larger than ${target}. Searching left half.`);
                await Engine.sleep();
                right = mid - 1;
            }
            state.elements[mid].node.classList.remove('compare');
            Engine.hideHint();
        }

        midPointer.classList.add('hidden');
        midPointer.classList.remove('active');
        Engine.log(`Pivots exhausted. Target ${target} not in system.`, 'error');
        Engine.showResult(`Target ${target} not found.`, false);
    }
};

/**
 * Event Binding & Orchestration
 */

// Initialize
function init() {
    const arr = Engine.parseArrayInput();
    if (arr.length) Engine.drawArray(arr);
}

// Start Algorithm
async function executeAlgorithm(type) {
    if (state.isRunning) return;

    const arr = Engine.parseArrayInput();
    if (arr.length === 0) {
        alert("Please enter a valid comma-separated list of numbers.");
        return;
    }

    // Reset UI state
    Engine.hideResult();
    Engine.clearLogs();
    Engine.updateHeaders(type);
    Engine.drawArray(arr); // Redraw to clear previous run classes
    Engine.lockUI();

    await Engine.sleep(); // short pause before action starts

    try {
        if (type === 'bubble') await Algorithms.bubbleSort();
        else if (type === 'selection') await Algorithms.selectionSort();
        else if (type === 'insertion') await Algorithms.insertionSort();
        else if (type === 'merge') await Algorithms.mergeSort();
        else if (type === 'quick') await Algorithms.quickSort();
        else {
            const tgtStr = DOM.searchInput.value;
            const tgt = parseInt(tgtStr, 10);

            if (isNaN(tgt)) {
                Engine.showResult("Invalid Target", false);
                Engine.log("Execution aborted: Target is not a number.", "error");
            } else {
                if (type === 'linear') await Algorithms.linearSearch(tgt);
                if (type === 'binary') {
                    // Check sorting logic prior to execution
                    const isSorted = arr.slice().sort((a, b) => a - b).join() === arr.join();
                    if (!isSorted) {
                        Engine.log("WARNING: Binary Search requires a sorted array. Results may be unpredictable.", "error");
                    }
                    await Algorithms.binarySearch(tgt);
                }
            }
        }
    } catch (err) {
        console.error(err);
    }

    // Check if stopped manually
    if (state.shouldForceStop) {
        Engine.log("Process explicitly terminated by user.", "system");
        Engine.showResult("Execution Stopped", false);
    }

    Engine.unlockUI();
}

// Bindings
DOM.algoBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const algoType = e.currentTarget.getAttribute('data-algo');
        executeAlgorithm(algoType);
    });
});

DOM.btnStop.addEventListener('click', () => {
    if (state.isRunning) {
        state.shouldForceStop = true;
    }
});

DOM.btnRandom.addEventListener('click', () => {
    const size = Math.floor(Math.random() * 8) + 8; // 8 to 15 items
    let randArr = [];
    for (let i = 0; i < size; i++) {
        randArr.push(Math.floor(Math.random() * 95) + 5);
    }
    DOM.arrayInput.value = randArr.join(', ');
    Engine.drawArray(randArr);
    Engine.hideResult();
    Engine.log("System data source randomized.", "system");
});

// Update preview visually when array input is typed manually
DOM.arrayInput.addEventListener('input', () => {
    if (!state.isRunning) {
        const arr = Engine.parseArrayInput();
        if (arr.length > 0) Engine.drawArray(arr);
    }
});

// Setup on load
document.addEventListener('DOMContentLoaded', init);
