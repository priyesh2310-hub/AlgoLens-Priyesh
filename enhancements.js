/* AlgoLab enhancements: counters, step mode, learning panel, race, array patterns */
(() => {
    const $ = id => document.getElementById(id);
    const counters = {
        comparisons: $('counter-comparisons'),
        swaps: $('counter-swaps'),
        steps: $('counter-steps'),
        size: $('counter-size')
    };

    let stepMode = false;
    let stepResolver = null;
    const originalSleep = Engine.sleep.bind(Engine);
    const originalLog = Engine.log.bind(Engine);

    const resetCounters = () => {
        counters.comparisons.textContent = '0';
        counters.swaps.textContent = '0';
        counters.steps.textContent = Engine.parseArrayInput().length;
        counters.size.textContent = Engine.parseArrayInput().length;
        $('pseudocode-box').classList.add('hidden');
        $('pseudocode-toggle').textContent = 'View Pseudocode';
    };

    const increment = (el) => el.textContent = String(Number(el.textContent) + 1);


    const speedValue = $('speed-value');
    if (speedValue && DOM.speedRange) {
        const updateSpeedLabel = () => speedValue.textContent = `${DOM.speedRange.value}ms`;
        DOM.speedRange.addEventListener('input', updateSpeedLabel);
        updateSpeedLabel();
    }

    // Existing algorithm logs become the source for real execution counters.
    Engine.log = function(msg, type = '') {
        if (/Comparing|Testing if|Checking pointer|Checking middle/i.test(msg)) increment(counters.comparisons);
        if (/Swapping|swap/i.test(msg) && !/No swaps/i.test(msg)) increment(counters.swaps);
        originalLog(msg, type);
    };

    // Turn the existing animation wait into a genuine step controller.
    Engine.sleep = async function() {
        increment(counters.steps);
        if (!stepMode) return originalSleep();
        await new Promise(resolve => { stepResolver = resolve; });
    };

    $('mode-auto').addEventListener('click', () => {
        stepMode = false;
        $('mode-auto').classList.add('active');
        $('mode-step').classList.remove('active');
        $('next-step').disabled = true;
        if (stepResolver) { stepResolver(); stepResolver = null; }
    });

    $('mode-step').addEventListener('click', () => {
        stepMode = true;
        $('mode-step').classList.add('active');
        $('mode-auto').classList.remove('active');
        $('next-step').disabled = false;
    });

    $('next-step').addEventListener('click', () => {
        if (stepResolver) { stepResolver(); stepResolver = null; }
    });

    // Reset counters before the original click handler gets into its first await.
    DOM.algoBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            resetCounters();
            const type = btn.dataset.algo;
            updateLearning(type);
        });
    });

    $('btn-random').addEventListener('click', () => setTimeout(resetCounters, 0));
    DOM.arrayInput.addEventListener('input', () => setTimeout(() => {
        counters.size.textContent = Engine.parseArrayInput().length;
    }, 0));

    const learning = {
        bubble: { best:'O(n)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:'Yes', note:'Repeatedly compares adjacent values and moves the largest remaining value toward the end.', code:'for i = 0 to n-1\n    for j = 0 to n-i-1\n        if arr[j] > arr[j+1]\n            swap(arr[j], arr[j+1])' },
        selection: { best:'O(n²)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:'No', note:'Finds the smallest value in the unsorted region and places it at the next sorted position.', code:'for i = 0 to n-1\n    min = i\n    for j = i+1 to n-1\n        if arr[j] < arr[min]\n            min = j\n    swap(arr[i], arr[min])' },
        insertion: { best:'O(n)', avg:'O(n²)', worst:'O(n²)', space:'O(1)', stable:'Yes', note:'Builds a sorted prefix by inserting each new element into its correct position.', code:'for i = 1 to n-1\n    key = arr[i]\n    j = i - 1\n    while j >= 0 and arr[j] > key\n        arr[j+1] = arr[j]\n        j--\n    arr[j+1] = key' },
        merge: { best:'O(n log n)', avg:'O(n log n)', worst:'O(n log n)', space:'O(n)', stable:'Yes', note:'Splits the array into halves, recursively sorts them, then merges the sorted halves.', code:'mergeSort(left, right)\n    split at mid\n    sort left half\n    sort right half\n    merge both halves' },
        quick: { best:'O(n log n)', avg:'O(n log n)', worst:'O(n²)', space:'O(log n)', stable:'No', note:'Chooses a pivot, partitions smaller values to the left and larger values to the right, then recurses.', code:'quickSort(low, high)\n    pivot = choose pivot\n    partition around pivot\n    quickSort(left)\n    quickSort(right)' },
        linear: { best:'O(1)', avg:'O(n)', worst:'O(n)', space:'O(1)', stable:'—', note:'Checks elements sequentially until the target is found or the array ends.', code:'for i = 0 to n-1\n    if arr[i] == target\n        return i\nreturn -1' },
        binary: { best:'O(1)', avg:'O(log n)', worst:'O(log n)', space:'O(1)', stable:'—', note:'Repeatedly checks the middle of a sorted range and discards the half that cannot contain the target.', code:'left = 0, right = n-1\nwhile left <= right\n    mid = (left + right) / 2\n    compare arr[mid] with target\n    discard one half' }
    };

    function updateLearning(type) {
        const d = learning[type];
        if (!d) return;
        $('learn-title').textContent = d.name || (ALGO_METADATA[type] && ALGO_METADATA[type].name) || type;
        $('complexity-best').textContent = d.best;
        $('complexity-average').textContent = d.avg;
        $('complexity-worst').textContent = d.worst;
        $('complexity-space').textContent = d.space;
        $('complexity-stable').textContent = d.stable;
        $('learn-note').textContent = d.note;
        $('pseudocode-box').textContent = d.code;
    }

    $('pseudocode-toggle').addEventListener('click', () => {
        const box = $('pseudocode-box');
        box.classList.toggle('hidden');
        $('pseudocode-toggle').textContent = box.classList.contains('hidden') ? 'View Pseudocode' : 'Hide Pseudocode';
    });

    // Independent non-animated implementations used by Race mode.
    function raceSort(name, input) {
        const a = [...input]; let comparisons = 0, swaps = 0;
        const swap = (i,j) => { [a[i],a[j]]=[a[j],a[i]]; swaps++; };
        if (name === 'Bubble Sort') {
            for(let i=0;i<a.length-1;i++){ let changed=false; for(let j=0;j<a.length-i-1;j++){ comparisons++; if(a[j]>a[j+1]){swap(j,j+1);changed=true;} } if(!changed)break; }
        } else if (name === 'Selection Sort') {
            for(let i=0;i<a.length-1;i++){ let m=i; for(let j=i+1;j<a.length;j++){ comparisons++; if(a[j]<a[m])m=j; } if(m!==i)swap(i,m); }
        } else if (name === 'Insertion Sort') {
            for(let i=1;i<a.length;i++){ let j=i; while(j>0){ comparisons++; if(a[j-1]>a[j]){swap(j-1,j);j--;} else break; } }
        } else if (name === 'Merge Sort') {
            function mergeSort(l,r){ if(l>=r)return; const m=Math.floor((l+r)/2); mergeSort(l,m); mergeSort(m+1,r); const temp=[]; let i=l,j=m+1; while(i<=m&&j<=r){comparisons++; if(a[i]<=a[j])temp.push(a[i++]);else temp.push(a[j++]);} while(i<=m)temp.push(a[i++]);while(j<=r)temp.push(a[j++]);for(let k=0;k<temp.length;k++)a[l+k]=temp[k]; }
            mergeSort(0,a.length-1);
        } else if (name === 'Quick Sort') {
            function qs(l,r){ if(l>=r)return; const p=a[r];let i=l;for(let j=l;j<r;j++){comparisons++;if(a[j]<p){swap(i,j);i++;}}swap(i,r);qs(l,i-1);qs(i+1,r); }
            qs(0,a.length-1);
        }
        return {name, comparisons, swaps};
    }

    $('start-race').addEventListener('click', () => {
        const input = Engine.parseArrayInput();
        if (input.length < 2) return;
        const names = ['Bubble Sort','Selection Sort','Insertion Sort','Merge Sort','Quick Sort'];
        const results = names.map(n => raceSort(n,input));
        results.sort((a,b) => (a.comparisons+a.swaps)-(b.comparisons+b.swaps));
        const winner = results[0];
        $('race-results').innerHTML = results.map((r,i) => `
            <div class="race-row ${i===0?'winner':''}">
                <div class="race-name">${i===0?'🏆 ':''}${r.name}</div>
                <div class="race-stat">${r.comparisons} comparisons</div>
                <div class="race-stat">${r.swaps} swaps</div>
                <div class="race-total">${r.comparisons+r.swaps} ops</div>
            </div>`).join('') + `<div class="race-winner">Winner: <strong>${winner.name}</strong> with ${winner.comparisons + winner.swaps} tracked operations.</div>`;
    });

    $('generate-pattern').addEventListener('click', () => {
        const n = Math.max(3, Math.min(60, Number($('generator-size').value) || 12));
        const pattern = $('generator-pattern').value;
        let a = Array.from({length:n}, (_,i)=>i+1);
        if(pattern === 'random') a = a.map(() => Math.floor(Math.random()*95)+5);
        if(pattern === 'reverse') a.reverse();
        if(pattern === 'nearly') { for(let i=0;i<Math.max(1,Math.floor(n/5));i++){const x=Math.floor(Math.random()*(n-1));[a[x],a[x+1]]=[a[x+1],a[x]];} }
        DOM.arrayInput.value = a.join(', ');
        Engine.drawArray(a); Engine.hideResult(); Engine.clearLogs(); resetCounters();
        Engine.log(`Generated ${pattern.replace('-', ' ')} array with ${n} elements.`, 'system');
    });

    resetCounters();
})();
