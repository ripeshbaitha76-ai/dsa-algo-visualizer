// Algo Lab - sorting, searching and graph traversal visualizer

const algos = {
  selection: { label: 'Selection Sort', type: 'sort',
    text: 'Finds the smallest value in the unsorted part and swaps it to the front. Repeats until everything is in place.',
    time: 'O(n^2)', space: 'O(1)' },
  quick: { label: 'Quick Sort', type: 'sort',
    text: 'Picks a pivot (purple), moves smaller values to its left and bigger ones to its right, then sorts both sides the same way.',
    time: 'O(n log n) average, O(n^2) worst', space: 'O(log n)' },
  merge: { label: 'Merge Sort', type: 'sort',
    text: 'Splits the array into halves, sorts each half and then merges the two sorted halves back together.',
    time: 'O(n log n)', space: 'O(n)' },
  linear: { label: 'Linear Search', type: 'search',
    text: 'Checks every element one by one from the left until the target is found.',
    time: 'O(n)', space: 'O(1)' },
  binary: { label: 'Binary Search', type: 'search',
    text: 'Needs sorted data. Looks at the middle value and discards the half that cannot contain the target.',
    time: 'O(log n)', space: 'O(1)' },
  bfs: { label: 'BFS', type: 'graph',
    text: 'Starts at A and visits all neighbours first, then their neighbours (uses a queue). Goes level by level.',
    time: 'O(V + E)', space: 'O(V)' },
  dfs: { label: 'DFS', type: 'graph',
    text: 'Starts at A and keeps going deeper along one path before backtracking (uses a stack).',
    time: 'O(V + E)', space: 'O(V)' }
};

const groups = [
  ['Sorting', ['selection', 'quick', 'merge']],
  ['Searching', ['linear', 'binary']],
  ['Graph', ['bfs', 'dfs']]
];

// small graph used for BFS / DFS
const nodes = { A: [70, 60], B: [210, 30], C: [210, 130], D: [350, 30], E: [350, 130],
                F: [490, 60], G: [210, 230], H: [420, 230] };
const edges = [['A','B'], ['A','C'], ['B','D'], ['C','E'], ['D','F'],
               ['E','F'], ['C','G'], ['G','H'], ['E','H']];
const adj = {};
Object.keys(nodes).forEach(k => adj[k] = []);
edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
Object.keys(adj).forEach(k => adj[k].sort());

const stage = document.getElementById('stage');
const msgBox = document.getElementById('msg');
const targetBox = document.getElementById('target');

let current = 'selection';
let data = [];
let steps = 0;
let runId = 0;     // stop button changes this so old runs quit
let busy = false;

function say(t) {
  msgBox.textContent = t + (steps ? '   (steps: ' + steps + ')' : '');
}

async function tick() {
  const id = runId;
  const ms = Number(document.getElementById('speed').value);
  await new Promise(r => setTimeout(r, ms));
  if (id !== runId) throw 'stop';
}

// ---------- bars ----------

function makeData() {
  data = [];
  for (let i = 0; i < 20; i++) data.push(Math.floor(Math.random() * 95) + 5);
  if (current === 'binary') data.sort((a, b) => a - b);
}

function drawBars() {
  stage.className = 'bars';
  stage.innerHTML = '';
  data.forEach(v => {
    const b = document.createElement('div');
    b.className = 'bar';
    b.style.height = v + '%';
    b.textContent = v;
    stage.appendChild(b);
  });
}

const paint = (i, cls) => { stage.children[i].className = 'bar ' + cls; };

function setVal(i) {
  stage.children[i].style.height = data[i] + '%';
  stage.children[i].textContent = data[i];
}

function swap(a, b) {
  [data[a], data[b]] = [data[b], data[a]];
  setVal(a);
  setVal(b);
}

// ---------- sorting ----------

async function selectionSort() {
  const n = data.length;
  for (let i = 0; i < n - 1; i++) {
    let m = i;
    paint(i, 'pick');
    for (let j = i + 1; j < n; j++) {
      paint(j, 'look');
      steps++;
      say('Looking for the smallest value from index ' + i);
      await tick();
      if (data[j] < data[m]) {
        if (m !== i) paint(m, '');
        m = j;
        paint(m, 'pick');
      } else {
        paint(j, '');
      }
    }
    if (m !== i) swap(i, m);
    paint(m, '');
    paint(i, 'done');
  }
  paint(n - 1, 'done');
}

async function quickSort(lo, hi) {
  if (lo > hi) return;
  if (lo === hi) { paint(lo, 'done'); return; }
  const pivot = data[hi];
  paint(hi, 'pivot');
  let s = lo;
  for (let j = lo; j < hi; j++) {
    paint(j, 'look');
    steps++;
    say('Pivot is ' + pivot);
    await tick();
    if (data[j] < pivot) {
      if (s !== j) swap(s, j);
      s++;
    }
    paint(j, '');
  }
  if (s !== hi) swap(s, hi);
  paint(hi, '');
  paint(s, 'done');
  await tick();
  await quickSort(lo, s - 1);
  await quickSort(s + 1, hi);
}

async function mergeSort(l, r) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  await mergeSort(l, m);
  await mergeSort(m + 1, r);

  const left = data.slice(l, m + 1);
  const right = data.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length || j < right.length) {
    if (j >= right.length || (i < left.length && left[i] <= right[j])) {
      data[k] = left[i++];
    } else {
      data[k] = right[j++];
    }
    setVal(k);
    paint(k, 'look');
    steps++;
    say('Merging indexes ' + l + ' to ' + r);
    await tick();
    paint(k, '');
    k++;
  }
  for (let x = l; x <= r; x++) paint(x, 'half');
}

// ---------- searching ----------

async function linearSearch(t) {
  for (let i = 0; i < data.length; i++) {
    paint(i, 'look');
    steps++;
    say('Checking index ' + i);
    await tick();
    if (data[i] === t) {
      paint(i, 'done');
      say('Found ' + t + ' at index ' + i);
      return;
    }
    paint(i, 'out');
  }
  say(t + ' is not in the array');
}

async function binarySearch(t) {
  let lo = 0, hi = data.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    for (let i = 0; i < data.length; i++) paint(i, (i < lo || i > hi) ? 'out' : '');
    paint(mid, 'pivot');
    steps++;
    say('low=' + lo + ' high=' + hi + ' mid=' + mid + ' (value ' + data[mid] + ')');
    await tick();
    if (data[mid] === t) {
      paint(mid, 'done');
      say('Found ' + t + ' at index ' + mid);
      return;
    }
    if (data[mid] < t) lo = mid + 1; else hi = mid - 1;
  }
  for (let i = 0; i < data.length; i++) paint(i, 'out');
  say(t + ' is not in the array');
}

// ---------- graph ----------

function drawGraph() {
  stage.className = 'graph';
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 560 270');

  edges.forEach(([a, b]) => {
    const ln = document.createElementNS(ns, 'line');
    ln.setAttribute('x1', nodes[a][0]); ln.setAttribute('y1', nodes[a][1]);
    ln.setAttribute('x2', nodes[b][0]); ln.setAttribute('y2', nodes[b][1]);
    svg.appendChild(ln);
  });
  Object.keys(nodes).forEach(k => {
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('id', 'node-' + k);
    c.setAttribute('cx', nodes[k][0]); c.setAttribute('cy', nodes[k][1]); c.setAttribute('r', 20);
    const t = document.createElementNS(ns, 'text');
    t.setAttribute('x', nodes[k][0]); t.setAttribute('y', nodes[k][1]);
    t.textContent = k;
    svg.appendChild(c);
    svg.appendChild(t);
  });
  stage.innerHTML = '';
  stage.appendChild(svg);
}

const paintNode = (k, cls) => document.getElementById('node-' + k).setAttribute('class', cls);

async function bfs() {
  const seen = new Set(['A']);
  const queue = ['A'];
  const order = [];
  while (queue.length) {
    const u = queue.shift();
    paintNode(u, 'look');
    order.push(u);
    steps++;
    say('Visited: ' + order.join(' > '));
    await tick();
    paintNode(u, 'done');
    for (const v of adj[u]) {
      if (!seen.has(v)) { seen.add(v); queue.push(v); paintNode(v, 'queued'); }
    }
  }
}

async function dfs() {
  const seen = new Set();
  const stack = ['A'];
  const order = [];
  while (stack.length) {
    const u = stack.pop();
    if (seen.has(u)) continue;
    seen.add(u);
    paintNode(u, 'look');
    order.push(u);
    steps++;
    say('Visited: ' + order.join(' > '));
    await tick();
    paintNode(u, 'done');
    // reversed so that the smaller letter is popped first
    for (const v of [...adj[u]].reverse()) {
      if (!seen.has(v)) { stack.push(v); paintNode(v, 'queued'); }
    }
  }
}

// ---------- ui ----------

function buildMenu() {
  const menu = document.getElementById('menu');
  groups.forEach(([title, keys]) => {
    const h = document.createElement('div');
    h.className = 'group';
    h.textContent = title;
    menu.appendChild(h);
    keys.forEach(k => {
      const b = document.createElement('button');
      b.textContent = algos[k].label;
      b.dataset.key = k;
      b.addEventListener('click', () => choose(k));
      menu.appendChild(b);
    });
  });
}

function choose(key) {
  runId++;
  busy = false;
  steps = 0;
  current = key;
  const a = algos[key];

  document.querySelectorAll('#menu button').forEach(b => {
    b.classList.toggle('active', b.dataset.key === key);
  });
  document.getElementById('n-name').textContent = a.label;
  document.getElementById('n-text').textContent = a.text;
  document.getElementById('n-time').textContent = a.time;
  document.getElementById('n-space').textContent = a.space;
  targetBox.style.display = a.type === 'search' ? '' : 'none';
  document.getElementById('gen').style.display = a.type === 'graph' ? 'none' : '';

  if (a.type === 'graph') {
    drawGraph();
    say('Press Run to start from node A.');
  } else {
    makeData();
    drawBars();
    say(a.type === 'search' ? 'Type a number you can see in a bar, then press Run.' : 'Press Run to start.');
  }
}

async function run() {
  if (busy) return;
  const a = algos[current];
  let t = 0;
  if (a.type === 'search') {
    t = Number(targetBox.value);
    if (!t) { say('Type a number to search for first.'); return; }
  }
  busy = true;
  steps = 0;
  const mine = runId;
  try {
    if (a.type === 'graph') {
      drawGraph();
      await (current === 'bfs' ? bfs() : dfs());
    } else {
      drawBars();
      if (current === 'selection') await selectionSort();
      else if (current === 'quick') await quickSort(0, data.length - 1);
      else if (current === 'merge') await mergeSort(0, data.length - 1);
      else if (current === 'linear') await linearSearch(t);
      else await binarySearch(t);
      if (a.type === 'sort') {
        for (let i = 0; i < data.length; i++) paint(i, 'done');
        say('Sorted. Click "New data" to try again.');
      }
    }
  } catch (e) {
    if (e !== 'stop') throw e;
  }
  if (mine === runId) busy = false;
}

document.getElementById('go').addEventListener('click', run);
document.getElementById('halt').addEventListener('click', () => {
  runId++;
  busy = false;
  say('Stopped.');
});
document.getElementById('gen').addEventListener('click', () => choose(current));

buildMenu();
choose('selection');
