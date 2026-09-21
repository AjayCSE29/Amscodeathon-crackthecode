import type { CodeSnippet, Question } from "../types/assessment";
import { buildCodeLines } from "../lib/codeHighlight";

const bstSearchCode: CodeSnippet = {
  fileName: "bst_search.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "// Search implementation in balanced vs skewed BST",
  "Node* search(Node* root, int key) {",
  "    if (root == nullptr || root->key == key)",
  "        return root;",
  "    if (key < root->key)",
  "        return search(root->left, key);",
  "    return search(root->right, key);",
  "}",
  ]),
};

const minHeapCode: CodeSnippet = {
  fileName: "min_heap.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "// Percolate down in a binary min-heap",
  "void heapifyDown(int arr[], int n, int i) {",
  "    int smallest = i;",
  "    int left = 2 * i + 1, right = 2 * i + 2;",
  "    if (left < n && arr[left] < arr[smallest])",
  "        smallest = left;",
  "    if (right < n && arr[right] < arr[smallest])",
  "        smallest = right;",
  "    if (smallest != i) {",
  "        swap(arr[i], arr[smallest]);",
  "        heapifyDown(arr, n, smallest);",
  "    }",
  "}",
  ]),
};

const recursionCode: CodeSnippet = {
  fileName: "mystery.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "int mystery(int n) {",
  "    if (n <= 1) return 1;",
  "    return mystery(n - 1) + mystery(n - 2);",
  "}",
  ]),
};

const fibCode: CodeSnippet = {
  fileName: "fibonacci.js",
  language: "JavaScript",
  lines: buildCodeLines([
  "function fib(n) {",
  "  if (n <= 1) return n;",
  "  let a = 0, b = 1;",
  "  for (let i = 2; i <= n; i++) {",
  "    const c = a + b;",
  "    a = b;",
  "    b = c;",
  "  }",
  "  return b;",
  "}",
  ]),
};

const lruCode: CodeSnippet = {
  fileName: "lru_cache.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "void referencePage(int page) {",
  "    if (cache.find(page)) {",
  "        erase(page); // update recency",
  "        pushFront(page);",
  "        return;",
  "    }",
  "    if (cache.size() == capacity)",
  "        popBack(); // evict LRU",
  "    pushFront(page);",
  "}",
  ]),
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "Q-001",
    index: 1,
    category: "Data Structures",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "What is the average-case and balanced-worst-case time complexity of searching for an element in a balanced Binary Search Tree (BST), and what specific condition triggers the worst-case time complexity in an unbalanced BST implementation?",
    code: bstSearchCode,
    options: [
      {
        id: "A",
        text: "`O(log n)` for both balanced and worst-case unbalanced BST when traversal reaches terminal leaf states.",
      },
      {
        id: "B",
        text: "`O(log n)` average and balanced worst-case; `O(n)` when the tree is strictly degenerated into a skewed linked-list structure.",
      },
      {
        id: "C",
        text: "`O(1)` average using hash buckets; `O(log n)` worst case when bucket collisions cascade.",
      },
      {
        id: "D",
        text: "`O(n log n)` due to call-stack overhead on every recursive branch traversal regardless of tree height.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-002",
    index: 2,
    category: "Data Structures",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Consider inserting a node at the \u201Cbeginning\u201D of a singly linked list that also maintains a known head pointer. What is the time complexity of this operation, and why is it not constant for a dynamic array?",
    options: [
      {
        id: "A",
        text: "`O(1)` for the linked list; a dynamic array requires shifting all elements to `O(n)`.",
      },
      {
        id: "B",
        text: "`O(n)` for the linked list because the list must be traversed to update the tail link.",
      },
      {
        id: "C",
        text: "`O(log n)` for both structures because node addresses must be rehashed.",
      },
      {
        id: "D",
        text: "`O(1)` for the linked list only if the tail pointer is also maintained.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-003",
    index: 3,
    category: "Data Structures",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which data structure is the natural fit for evaluating a postfix expression `23*5+` and why?",
    options: [
      {
        id: "A",
        text: "A queue, because operands are dequeued in the exact order they were written.",
      },
      {
        id: "B",
        text: "A stack, because the most recently pushed operand is matched with each operator in LIFO order.",
      },
      {
        id: "C",
        text: "A binary heap, because operators always compare against the global minimum.",
      },
      {
        id: "D",
        text: "A linked list, because each node stores one character of the expression.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-004",
    index: 4,
    category: "Data Structures",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "A hash table uses separate chaining with a load factor that grows unbounded. Which statement about lookup behavior is correct?",
    options: [
      {
        id: "A",
        text: "Lookup degrades toward `O(n)` in the chain length even when the hash function is uniform.",
      },
      {
        id: "B",
        text: "Lookup remains `O(1)` regardless of load factor because chaining never permits collisions.",
      },
      {
        id: "C",
        text: "Lookup is `O(log n)` because every chain is internally maintained as a balanced tree.",
      },
      {
        id: "D",
        text: "Lookup fails once the first collision occurs and the table must be rebuilt.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-005",
    index: 5,
    category: "Data Structures",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "In the min-heap shown, is the underlying array always a valid representation of a binary heap? Which invariant must hold at every index `i`?",
    code: minHeapCode,
    options: [
      {
        id: "A",
        text: "`arr[i] <= arr[2i+1]` and `arr[i] <= arr[2i+2]` for all valid children.",
      },
      {
        id: "B",
        text: "`arr[i] >= arr[2i+1]` and `arr[i] >= arr[2i+2]` for all valid children.",
      },
      {
        id: "C",
        text: "`arr[i]` is always strictly less than every element to its right.",
      },
      {
        id: "D",
        text: "`arr[0]` is the median of the entire collection at all times.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-006",
    index: 6,
    category: "Algorithms",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Merge sort always divides the input into two halves and merges them. What are its best, average, and worst-case time complexities?",
    options: [
      {
        id: "A",
        text: "`O(n log n)` for all three cases because the divide-and-merge structure is independent of input order.",
      },
      {
        id: "B",
        text: "`O(n)` best, `O(n log n)` average, `O(n^2)` worst.",
      },
      {
        id: "C",
        text: "`O(log n)` for all three cases due to halving.",
      },
      {
        id: "D",
        text: "`O(n^2)` for all three cases because merging always compares every element with every other.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-007",
    index: 7,
    category: "Algorithms",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Dijkstra\u2019s algorithm computes shortest paths on a graph. Which of the following is required for a correct result?",
    options: [
      {
        id: "A",
        text: "All edge weights must be non-negative for the greedy relaxation to be correct.",
      },
      {
        id: "B",
        text: "The graph must be a tree with at most one path between any two vertices.",
      },
      {
        id: "C",
        text: "The graph must be a DAG so that topological order can be used.",
      },
      {
        id: "D",
        text: "An adjacency matrix must be used; adjacency lists break the algorithm.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-008",
    index: 8,
    category: "Algorithms",
    difficulty: "Hard",
    marks: 4,
    negativeMarks: 1,
    question:
      "You must search for a target in a rotated sorted array `[5,6,7,1,2,3,4]`. Binary search on this array — which observation makes it correct in `O(log n)`?",
    options: [
      {
        id: "A",
        text: "At least one half of the array is always sorted, so the decision to drop a half is well-defined.",
      },
      {
        id: "B",
        text: "The pivot is always at `n/2`, so a single comparison finds the element.",
      },
      {
        id: "C",
        text: "The array must first be fully sorted with a quick sort to apply binary search.",
      },
      {
        id: "D",
        text: "Binary search fails in `O(log n)`; a linear scan is always required.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-009",
    index: 9,
    category: "Algorithms",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "The function below computes the nth Fibonacci number. What is the asymptotic running time of this recursive formulation?",
    code: recursionCode,
    options: [
      {
        id: "A",
        text: "`O(2^n)` — each call branches into two sub-calls, recomputing overlapping subproblems.",
      },
      {
        id: "B",
        text: "`O(n)` — the function always runs a single loop.",
      },
      {
        id: "C",
        text: "`O(log n)` — the recursion halves the input each step.",
      },
      {
        id: "D",
        text: "`O(n^2)` — each addition takes quadratic time.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-010",
    index: 10,
    category: "Algorithms",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Quick sort with a fixed pivot (e.g., always the last element) is called on an already-sorted array. What is the resulting time complexity and why?",
    options: [
      {
        id: "A",
        text: "`O(n^2)` — the pivot is the extreme element and every partition is maximally unbalanced.",
      },
      {
        id: "B",
        text: "`O(n log n)` — sorted input is the best case for quick sort by definition.",
      },
      {
        id: "C",
        text: "`O(log n)` — the recursion depth is always logarithmic.",
      },
      {
        id: "D",
        text: "`O(n)` — one pass over the array completes the sort.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-011",
    index: 11,
    category: "Programming",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "What does `int a[5] = {1,2,3};` produce with respect to the remaining elements `a[3]` and `a[4]`?",
    options: [
      {
        id: "A",
        text: "They are zero-initialized to `0`.",
      },
      {
        id: "B",
        text: "They contain indeterminate garbage values.",
      },
      {
        id: "C",
        text: "The program fails to compile because the initializer is incomplete.",
      },
      {
        id: "D",
        text: "`a[3]` equals `3` and `a[4]` is uninitialized memory.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-012",
    index: 12,
    category: "Programming",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which statement about `virtual` functions in C++ is correct?",
    options: [
      {
        id: "A",
        text: "They enable runtime polymorphism — the override is resolved from the dynamic type of the object.",
      },
      {
        id: "B",
        text: "They are resolved entirely at compile time like templates.",
      },
      {
        id: "C",
        text: "Only the base class version can ever be called, even on derived objects.",
      },
      {
        id: "D",
        text: "They can only be declared in abstract interfaces, never in concrete classes.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-013",
    index: 13,
    category: "Programming",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Evaluate the statement `long x = (1u << 31);` on a typical 32-bit `unsigned int`. What is the outcome?",
    options: [
      {
        id: "A",
        text: "`x` becomes `2147483648` (`2^31`) without overflow because the shift is performed in unsigned arithmetic.",
      },
      {
        id: "B",
        text: "The shift overflows the 32-bit `unsigned int` and triggers undefined behavior.",
      },
      {
        id: "C",
        text: "`x` becomes negative because the sign bit is set.",
      },
      {
        id: "D",
        text: "The expression fails to compile.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-014",
    index: 14,
    category: "Programming",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "In Python, which collection type is unordered, unindexed, and stores only unique elements?",
    options: [
      {
        id: "A",
        text: "`set`",
      },
      {
        id: "B",
        text: "`list`",
      },
      {
        id: "C",
        text: "`tuple`",
      },
      {
        id: "D",
        text: "`dict` as a whole (its insertion order is preserved, but keys may repeat).",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-015",
    index: 15,
    category: "Programming",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "The iterative Fibonacci function below runs in linear time with constant extra space. What is its space complexity?",
    code: fibCode,
    options: [
      {
        id: "A",
        text: "`O(1)` — only a fixed number of scalar variables are used.",
      },
      {
        id: "B",
        text: "`O(n)` — the array stores all intermediate Fibonacci numbers.",
      },
      {
        id: "C",
        text: "`O(log n)` — the call stack grows logarithmically.",
      },
      {
        id: "D",
        text: "`O(n^2)` — every recomputation stores a full table.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-016",
    index: 16,
    category: "Computer Networks",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which reliable, connection-oriented transport protocol guarantees ordered delivery and is used by HTTP/HTTPS?",
    options: [
      {
        id: "A",
        text: "TCP",
      },
      {
        id: "B",
        text: "UDP",
      },
      {
        id: "C",
        text: "ICMP",
      },
      {
        id: "D",
        text: "ARP",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-017",
    index: 17,
    category: "Computer Networks",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "At which layer of the OSI model does a router primarily operate?",
    options: [
      {
        id: "A",
        text: "Network layer (Layer 3) — forwarding packets based on IP addresses.",
      },
      {
        id: "B",
        text: "Data link layer (Layer 2) — forwarding frames based on MAC addresses.",
      },
      {
        id: "C",
        text: "Transport layer (Layer 4) — multiplexing ports.",
      },
      {
        id: "D",
        text: "Session layer (Layer 5) — maintaining application dialogs.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-018",
    index: 18,
    category: "Computer Networks",
    difficulty: "Hard",
    marks: 4,
    negativeMarks: 1,
    question:
      "Given an IP `192.168.10.55/26`, what is the subnet mask and the broadcast address of the subnet?",
    options: [
      {
        id: "A",
        text: "Mask `255.255.255.192`; broadcast `192.168.10.63`.",
      },
      {
        id: "B",
        text: "Mask `255.255.255.128`; broadcast `192.168.10.55`.",
      },
      {
        id: "C",
        text: "Mask `255.255.255.224`; broadcast `192.168.10.127`.",
      },
      {
        id: "D",
        text: "Mask `255.255.255.0`; broadcast `192.168.10.255`.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-019",
    index: 19,
    category: "Computer Networks",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "A browser receives HTTP status `304 Not Modified` for a cached resource. What does this mean?",
    options: [
      {
        id: "A",
        text: "The cached copy is still valid; the server sent no body and the client reuses its cache.",
      },
      {
        id: "B",
        text: "The resource changed and a new full body is delivered.",
      },
      {
        id: "C",
        text: "The client is forbidden from caching this resource permanently.",
      },
      {
        id: "D",
        text: "The server redirects the request to a new canonical URL.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-020",
    index: 20,
    category: "Computer Networks",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which record type in DNS maps a hostname to an IPv4 address?",
    options: [
      {
        id: "A",
        text: "`A` record",
      },
      {
        id: "B",
        text: "`AAAA` record",
      },
      {
        id: "C",
        text: "`MX` record",
      },
      {
        id: "D",
        text: "`CNAME` alias only (it cannot map directly).",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-021",
    index: 21,
    category: "Database Systems",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "The ACID property guarantees that either all operations of a transaction are committed or none are. Which letter names this guarantee?",
    options: [
      {
        id: "A",
        text: "Atomicity — all-or-nothing execution.",
      },
      {
        id: "B",
        text: "Consistency — only constraints must hold, partial writes are allowed.",
      },
      {
        id: "C",
        text: "Isolation — each transaction waits forever.",
      },
      {
        id: "D",
        text: "Durability — data may be lost on crash.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-022",
    index: 22,
    category: "Database Systems",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Why is a B+ tree preferred over a binary search tree for database index pages stored on disk?",
    options: [
      {
        id: "A",
        text: "High fan-out keeps the tree shallow, reducing disk seeks from root to leaf.",
      },
      {
        id: "B",
        text: "It stores all data only at the root, guaranteeing one seek.",
      },
      {
        id: "C",
        text: "It cannot store duplicate keys, so each lookup is deterministic.",
      },
      {
        id: "D",
        text: "It is always smaller in memory than the table itself.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-023",
    index: 23,
    category: "Database Systems",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which SQL `JOIN` returns only the rows that match in both tables (no unmatched rows)?",
    options: [
      {
        id: "A",
        text: "`INNER JOIN`",
      },
      {
        id: "B",
        text: "`LEFT JOIN`",
      },
      {
        id: "C",
        text: "`RIGHT JOIN`",
      },
      {
        id: "D",
        text: "`FULL OUTER JOIN`",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-024",
    index: 24,
    category: "Database Systems",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "A table is in 3NF. Which statement is necessarily true?",
    options: [
      {
        id: "A",
        text: "No non-prime attribute is transitively dependent on the primary key.",
      },
      {
        id: "B",
        text: "Every determinant is a superkey (which is strictly Boyce-Codd, not 3NF).",
      },
      {
        id: "C",
        text: "There are no foreign keys in the table.",
      },
      {
        id: "D",
        text: "The table has a composite key in every relation.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-025",
    index: 25,
    category: "Database Systems",
    difficulty: "Hard",
    marks: 4,
    negativeMarks: 1,
    question:
      "You create an index on a column where 99% of the rows share the same value. What is the most likely effect on point lookups?",
    options: [
      {
        id: "A",
        text: "The optimizer may ignore the index and scan the table because the column has very low selectivity.",
      },
      {
        id: "B",
        text: "The index always makes lookups faster regardless of data distribution.",
      },
      {
        id: "C",
        text: "Every insert now runs in `O(1)` by appending to the index.",
      },
      {
        id: "D",
        text: "The index is dropped automatically by the engine.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-026",
    index: 26,
    category: "Operating Systems",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Which of the four Coffman conditions must hold simultaneously for a deadlock to occur?",
    options: [
      {
        id: "A",
        text: "Mutual exclusion, hold-and-wait, no preemption, and circular wait.",
      },
      {
        id: "B",
        text: "Preemption, serializability, paging, and swapping.",
      },
      {
        id: "C",
        text: "Atomicity, isolation, caching, and file locking.",
      },
      {
        id: "D",
        text: "Scheduling, aging, starvation, and priority inversion.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-027",
    index: 27,
    category: "Operating Systems",
    difficulty: "Easy",
    marks: 4,
    negativeMarks: 1,
    question:
      "A context switch refers to which operation?",
    options: [
      {
        id: "A",
        text: "Saving the CPU state of the current process and loading the saved state of the next process.",
      },
      {
        id: "B",
        text: "Loading a new page table entry during a TLB miss.",
      },
      {
        id: "C",
        text: "Swapping address spaces into the swap partition.",
      },
      {
        id: "D",
        text: "Compiling a new binary when a process changes.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-028",
    index: 28,
    category: "Operating Systems",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "The LRU cache replacement strategy below assumes earlier use implies future use. Which subtle issue makes hardware LRU approximated rather than exact?",
    code: lruCode,
    options: [
      {
        id: "A",
        text: "Exact per-line access timestamps are expensive to maintain, so real designs use approximations like clock bits.",
      },
      {
        id: "B",
        text: "LRU is exact in hardware but only in multicore configurations.",
      },
      {
        id: "C",
        text: "Cache lines never get reused, so recency information is meaningless.",
      },
      {
        id: "D",
        text: "The LRU stack cannot be stored in main memory.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-029",
    index: 29,
    category: "Operating Systems",
    difficulty: "Medium",
    marks: 4,
    negativeMarks: 1,
    question:
      "Two threads increment a shared counter without synchronization. `counter += 1` compiles to load, add, store. What can happen?",
    options: [
      {
        id: "A",
        text: "Interleaving can lose an update — the final value may be less than the number of increments.",
      },
      {
        id: "B",
        text: "The final value is always exact because `+=` is atomic on all CPUs.",
      },
      {
        id: "C",
        text: "The program deadlocks because both threads hold the counter.",
      },
      {
        id: "D",
        text: "The kernel schedules the threads serially to avoid interference.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-030",
    index: 30,
    category: "Operating Systems",
    difficulty: "Hard",
    marks: 4,
    negativeMarks: 1,
    question:
      "Belady\u2019s anomaly states that for some reference strings, FIFO page replacement can behave how?",
    options: [
      {
        id: "A",
        text: "Increasing the number of frames can increase the number of page faults.",
      },
      {
        id: "B",
        text: "More frames always monotonically decrease page faults.",
      },
      {
        id: "C",
        text: "Page faults become zero when any second-level cache is enabled.",
      },
      {
        id: "D",
        text: "FIFO degenerates into an optimal replacement strategy.",
      },
    ],
    correctOptionId: "A",
  },
];

export const TOTAL_QUESTIONS = MOCK_QUESTIONS.length;

export const ASSESSMENT_DURATION_MS = 45 * 60 * 1000;

export const DEPARTMENT_OPTIONS = [
  { value: "cs", label: "Computer Science & Engineering" },
  { value: "it", label: "Information Technology & Software Systems" },
  { value: "ai_ds", label: "Artificial Intelligence & Data Science" },
  { value: "ece", label: "Electronics & Communication Engineering" },
] as const;