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

const bstInsertCode: CodeSnippet = {
  fileName: "bst_insert.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "// Insert a key into a Binary Search Tree",
  "Node* insert(Node* root, int key) {",
  "    if (root == nullptr)",
  "        return new Node(key);",
  "    if (key < root->key)",
  "        root->left = insert(root->left, key);",
  "    else if (key > root->key)",
  "        root->right = insert(root->right, key);",
  "    return root;",
  "}",
  ]),
};

const binarySearchCode: CodeSnippet = {
  fileName: "binary_search.cpp",
  language: "C++17",
  lines: buildCodeLines([
  "int binarySearch(int arr[], int n, int key) {",
  "    int lo = 0, hi = n - 1;",
  "    while (lo <= hi) {",
  "        int mid = lo + (hi - lo) / 2;",
  "        if (arr[mid] == key) return mid;",
  "        if (arr[mid] < key) lo = mid + 1;",
  "        else hi = mid - 1;",
  "    }",
  "    return -1;",
  "}",
  ]),
};

const reduceCode: CodeSnippet = {
  fileName: "sum.js",
  language: "JavaScript",
  lines: buildCodeLines([
  "const nums = [1, 2, 3, 4];",
  "const total = nums.reduce((acc, value) => acc + value, 0);",
  "console.log(total);",
  ]),
};

const invoiceSqlCode: CodeSnippet = {
  fileName: "invoice.sql",
  language: "SQL",
  lines: buildCodeLines([
  "SELECT c.name, SUM(o.total) AS spent",
  "FROM customers c",
  "JOIN orders o ON o.customer_id = c.id",
  "WHERE c.region = 'East'",
  "GROUP BY c.name;",
  ]),
};

const semaphoreCode: CodeSnippet = {
  fileName: "producer_consumer.c",
  language: "C",
  lines: buildCodeLines([
  "// Producer with a counting semaphore",
  "while (true) {",
  "    item = produce();",
  "    wait(empty);   // request a slot",
  "    wait(mutex);   // enter critical section",
  "    buffer[in] = item;",
  "    signal(mutex);",
  "    signal(full);",
  "}",
  ]),
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "Q-001",
    index: 1,
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
  {
    id: "Q-031",
    index: 31,
    question:
      "After inserting the key `18` into the BST below using the standard insertion routine, where does the new node appear and what is the resulting worst-case search cost for `18`?",
    code: bstInsertCode,
    options: [
      {
        id: "A",
        text: "As the left child of `20`, reachable in `O(log n)` time on a balanced tree.",
      },
      {
        id: "B",
        text: "As the right child of the root, immediately reachable in `O(1)` time.",
      },
      {
        id: "C",
        text: "As a leaf that overwrites the existing node that previously stored `18`.",
      },
      {
        id: "D",
        text: "Insertion is rejected because keys below the root are never added.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-032",
    index: 32,
    question:
      "Which tree traversal of a Binary Search Tree visits its nodes in ascending sorted order?",
    options: [
      {
        id: "A",
        text: "Pre-order traversal, which processes the root before its children.",
      },
      {
        id: "B",
        text: "In-order traversal, which visits the left subtree, then the node, then the right subtree.",
      },
      {
        id: "C",
        text: "Post-order traversal, which processes children before the root.",
      },
      {
        id: "D",
        text: "Level-order traversal, which visits by increasing depth.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-033",
    index: 33,
    question:
      "A stack is the most natural data structure for which of the following operations?",
    options: [
      {
        id: "A",
        text: "Maintaining the order of a round-robin scheduler.",
      },
      {
        id: "B",
        text: "Matching opening and closing delimiters such as `( ) [ ]` in a source file.",
      },
      {
        id: "C",
        text: "Storing items in strict first-in first-out retrieval order.",
      },
      {
        id: "D",
        text: "Allowing random access to the middle of a collection.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-034",
    index: 34,
    question:
      "Compared to a singly linked list, what is the primary advantage of using a dynamic array for random access by index?",
    options: [
      {
        id: "A",
        text: "Dynamic arrays support `O(1)` indexing, while linked lists require `O(n)` traversal to reach the k-th element.",
      },
      {
        id: "B",
        text: "Dynamic arrays never need to reallocate when growing.",
      },
      {
        id: "C",
        text: "Dynamic arrays store each element in a separate heap allocation.",
      },
      {
        id: "D", 
        text: "Dynamic arrays guarantee constant-time insertion at any position.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-035",
    index: 35,
    question:
      "Which collection type supports efficient insertion and deletion at both its front and its back, making it ideal for a task where items enter and leave from either end?",
    options: [
      {
        id: "A",
        text: "A priority queue, which orders every element by value.",
      },
      {
        id: "B",
        text: "A stack, which only exposes one end.",
      },
      {
        id: "C",
        text: "A doubly-ended queue (deque).",
      },
      {
        id: "D",
        text: "A singly linked list traversed from the tail.",
      },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-036",
    index: 36,
    question:
      "Given the binarySearch routine shown, which precondition must `arr` satisfy for the function to behave correctly?",
    code: binarySearchCode,
    options: [
      {
        id: "A",
        text: "`arr` must contain only positive integers.",
      },
      {
        id: "B",
        text: "`arr` must be sorted in non-decreasing order.",
      },
      {
        id: "C",
        text: "`arr` must have a size that is a power of two.",
      },
      {
        id: "D",
        text: "`arr` must contain no duplicate values.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-037",
    index: 37,
    question:
      "Which statement accurately describes merge sort?",
    options: [
      {
        id: "A",
        text: "It is an in-place unstable sort with `O(n^2)` worst-case time.",
      },
      {
        id: "B",
        text: "It divides the array, sorts each half recursively, and merges, giving `O(n log n)` worst-case time.",
      },
      {
        id: "C",
        text: "It selects a pivot and partitions, guaranteeing `O(n log n)` only in the average case.",
      },
      {
        id: "D",
        text: "It has `O(n)` time when data arrives already mostly sorted.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-038",
    index: 38,
    question:
      "A problem is best solved with dynamic programming when it exhibits which two properties?",
    options: [
      {
        id: "A",
        text: "Optimal substructure and overlapping subproblems.",
      },
      {
        id: "B",
        text: "Greedy choice and acyclic dependency order.",
      },
      {
        id: "C",
        text: "Randomized pivoting and divide-and-conquer splitting.",
      },
      {
        id: "D",
        text: "Memoization of parameters that never repeat.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-039",
    index: 39,
    question:
      "Why does Dijkstra's shortest-path algorithm produce incorrect results when the graph contains negative edge weights?",
    options: [
      {
        id: "A",
        text: "Because it relies on weights summing to exactly one at every step.",
      },
      {
        id: "B",
        text: "Because once a vertex is finalized it is never relaxed again, but a negative edge could later offer a cheaper path.",
      },
      {
        id: "C",
        text: "Because it requires an adjacency list, which cannot store negative integers.",
      },
      {
        id: "D",
        text: "Because it always returns the longest path when negative weights are present.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-040",
    index: 40,
    question:
      "What is the time complexity of random-access retrieval of the element at a known index in a dynamic array?",
    options: [
      {
        id: "A",
        text: "`O(1)` constant time through pointer arithmetic on the base address.",
      },
      {
        id: "B",
        text: "`O(n)` because every element before the index must be visited.",
      },
      {
        id: "C",
        text: "`O(log n)` because the index must be located via binary search.",
      },
      {
        id: "D",
        text: "`O(n log n)` for the copy that must precede the lookup.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-041",
    index: 41,
    question:
      "In JavaScript, `typeof null` evaluates to which of the following at runtime?",
    options: [
      {
        id: "A",
        text: "`\"null\"`",
      },
      {
        id: "B",
        text: "`\"object\"`",
      },
      {
        id: "C",
        text: "`undefined`",
      },
      {
        id: "D",
        text: "`0`",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-042",
    index: 42,
    question:
      "What is the result of evaluating `\"2\" + 3` in JavaScript, and why?",
    options: [
      {
        id: "A",
        text: "`5`, because the numeric operands are added mathematically.",
      },
      {
        id: "B",
        text: "`\"23\"`, because the presence of a string operand makes `+` perform concatenation.",
      },
      {
        id: "C",
        text: "`NaN`, because mixing types throws a TypeError.",
      },
      {
        id: "D",
        text: "`\"2 3\"`, because a space is inserted between operands.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-043",
    index: 43,
    question:
      "Which of the following best describes the difference between Python lists and tuples?",
    options: [
      {
        id: "A",
        text: "Lists are immutable and tuples are mutable.",
      },
      {
        id: "B",
        text: "Tuples are immutable, so they can be used as dictionary keys; lists are mutable and cannot.",
      },
      {
        id: "C",
        text: "Lists are always faster than tuples for every operation.",
      },
      {
        id: "D",
        text: "Tuples allocate memory per element while lists store values in a single block.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-044",
    index: 44,
    question:
      "What does the JavaScript program shown print to the console?",
    code: reduceCode,
    options: [
      {
        id: "A",
        text: "`10`",
      },
      {
        id: "B",
        text: "`24`",
      },
      {
        id: "C",
        text: "`4`",
      },
      {
        id: "D",
        text: "`[1, 2, 3, 4]`",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-045",
    index: 45,
    question:
      "When `console.log(x); var x = 5;` runs in JavaScript, what value is logged and why?",
    options: [
      {
        id: "A",
        text: "`undefined`, because the `var x` declaration is hoisted to the top of the scope while the assignment stays in place.",
      },
      {
        id: "B",
        text: "`5`, because the declaration and initialization are hoisted together.",
      },
      {
        id: "C",
        text: "A ReferenceError, because `x` is used before it is declared.",
      },
      {
        id: "D",
        text: "`null`, because hoisted variables are initialized to null.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-046",
    index: 46,
    question:
      "Which layer of the OSI model does the Hypertext Transfer Protocol (HTTP) primarily operate at?",
    options: [
      {
        id: "A",
        text: "Transport layer, since it guarantees delivery of packets.",
      },
      {
        id: "B",
        text: "Application layer, as the highest-level protocol that services end-user applications.",
      },
      {
        id: "C",
        text: "Network layer, because it provides IP addressing.",
      },
      {
        id: "D",
        text: "Data-link layer, as it frames each request into MAC addresses.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-047",
    index: 47,
    question:
      "Which property most clearly distinguishes TCP from UDP?",
    options: [
      {
        id: "A",
        text: "TCP is connection-oriented and provides ordered, reliable delivery; UDP is connectionless and best-effort.",
      },
      {
        id: "B",
        text: "UDP is connection-oriented while TCP is connectionless.",
      },
      {
        id: "C",
        text: "TCP is used only for video streaming while UDP is used only for web pages.",
      },
      {
        id: "D",
        text: "UDP guarantees in-order delivery while TCP drops out-of-order segments.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-048",
    index: 48,
    question:
      "What is the primary purpose of network address translation (NAT) at a home router?",
    options: [
      {
        id: "A",
        text: "To encrypt traffic between the router and the ISP.",
      },
      {
        id: "B",
        text: "To map many private IP addresses to one or a few public IP addresses so multiple devices share scarce public addresses.",
      },
      {
        id: "C",
        text: "To replace the DNS resolver on every connected device.",
      },
      {
        id: "D",
        text: "To split the collision domain into separate broadcast domains.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-049",
    index: 49,
    question:
      "Which protocol resolves a human-readable domain name into an IP address, and over which typical transport port does it operate?",
    options: [
      {
        id: "A",
        text: "DHCP over port 68.",
      },
      {
        id: "B",
        text: "DNS, conventionally over UDP port 53.",
      },
      {
        id: "C", 
        text: "ARP over the network interface for local resolution.",
      },
      {
        id: "D",
        text: "ICMP over any ephemeral port.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-050",
    index: 50,
    question:
      "Which networking device forwards frames based on MAC addresses at Layer 2 of the OSI model?",
    options: [
      {
        id: "A",
        text: "A router, which routes based on IP addresses.",
      },
      {
        id: "B",
        text: "A network switch, which learns MAC address-to-port mappings.",
      },
      {
        id: "C",
        text: "A hub, which intelligently filters each incoming frame.",
      },
      {
        id: "D",
        text: "A modem, which provides the physical medium signal regeneration.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-051",
    index: 51,
    question:
      "How does a `PRIMARY KEY` constraint differ from a `UNIQUE` constraint in a relational table?",
    options: [
      {
        id: "A",
        text: "A primary key must be unique, is not null, and only one exists per table; a unique column also allows NULL unless further constrained.",
      },
      {
        id: "B",
        text: "A unique constraint must be on a single column while a primary key can span many.",
      },
      {
        id: "C",
        text: "A primary key allows duplicate values as long as they are indexed.",
      },
      {
        id: "D",
        text: "A unique constraint creates a clustered index while a primary key does not.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-052",
    index: 52,
    question:
      "A table is in Third Normal Form (3NF). Which of the following must also be true about its non-key attributes?",
    options: [
      {
        id: "A",
        text: "They may still contain transitive dependencies on other non-key attributes.",
      },
      {
        id: "B",
        text: "They must be fully dependent on the primary key and free of transitive dependencies via another non-key column.",
      },
      {
        id: "C",
        text: "They must be repeated across multiple rows to reduce join costs.",
      },
      {
        id: "D",
        text: "They must each be a foreign key into a separate table.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-053",
    index: 53,
    question:
      "Which join type returns only rows that have matching values in both tables being combined?",
    options: [
      {
        id: "A",
        text: "`LEFT JOIN`, which keeps all rows from the left table.",
      },
      {
        id: "B",
        text: "`INNER JOIN`, which keeps only rows with matches in both tables.",
      },
      {
        id: "C",
        text: "`RIGHT JOIN`, which keeps all rows from the right table.",
      },
      {
        id: "D",
        text: "`FULL OUTER JOIN`, which keeps all rows from both tables.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-054",
    index: 54,
    question:
      "What does the SQL query shown compute for customers in the East region?",
    code: invoiceSqlCode,
    options: [
      {
        id: "A",
        text: "The names of all customers who have never placed an order.",
      },
      {
        id: "B",
        text: "The per-customer total `spent` only for customers with at least one order, grouped by name.",
      },
      {
        id: "C",
        text: "The average order total across all regions.",
      },
      {
        id: "D",
        text: "The number of orders placed by each customer.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-055",
    index: 55,
    question:
      "Which ACID property ensures that a transaction is either fully committed or fully rolled back, so no partial state is visible?",
    options: [
      {
        id: "A",
        text: "Atomicity, which treats the transaction as a single indivisible unit.",
      },
      {
        id: "B",
        text: "Consistency, which only enforces referential integrity.",
      },
      {
        id: "C",
        text: "Isolation, which governs concurrent transaction scheduling.",
      },
      {
        id: "D",
        text: "Durability, which applies only after a crash.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-056",
    index: 56,
    question:
      "Which of the following is NOT one of the four necessary conditions for deadlock?",
    options: [
      {
        id: "A",
        text: "Mutual exclusion over held resources.",
      },
      {
        id: "B",
        text: "Hold and wait for additional resources.",
      },
      {
        id: "C",
        text: "Preemptive scheduling of CPU-bound processes.",
      },
      {
        id: "D",
        text: "Circular wait among a set of processes.",
      },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-057",
    index: 57,
    question:
      "Under the LRU page-replacement policy, which page is evicted when a page fault occurs?",
    options: [
      {
        id: "A",
        text: "The page that has been in memory the longest by insertion time.",
      },
      {
        id: "B",
        text: "The page whose most recent use is the farthest in the past.",
      },
      {
        id: "C",
        text: "The page with the highest reference count.",
      },
      {
        id: "D",
        text: "The page that was just brought into memory.",
      },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-058",
    index: 58,
    question:
      "A race condition occurs when the outcome of a shared-resource computation depends on what?",
    options: [
      {
        id: "A",
        text: "The relative timing and interleaving of multiple threads or processes accessing shared data.",
      },
      {
        id: "B",
        text: "The total amount of physical memory installed in the machine.",
      },
      {
        id: "C",
        text: "The clock speed of the CPU core that executes the final instruction.",
      },
      {
        id: "D",
        text: "The order in which the filesystem repaired sectors at boot.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-059",
    index: 59,
    question:
      "Which statement best contrasts threads and processes in a modern operating system?",
    options: [
      {
        id: "A",
        text: "Threads share the address space of their owning process and are cheaper to create than whole processes.",
      },
      {
        id: "B",
        text: "Processes always share memory with one another by default while threads never do.",
      },
      {
        id: "C",
        text: "Threads each own a separate page table and cannot communicate.",
      },
      {
        id: "D",
        text: "A process cannot contain more than one thread.",
      },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-060",
    index: 60,
    question:
      "In the producer-consumer code shown, what is the role of the `empty` and `full` semaphores?",
    code: semaphoreCode,
    options: [
      {
        id: "A",
        text: "They count available buffer slots (`empty`) and waiting consumers (`full`).",
      },
      {
        id: "B",
        text: "`empty` counts free slots and `full` counts filled slots, so producers wait on `empty` and signal `full` in a loop.",
      },
      {
        id: "C",
        text: "They both serialize access to the display device.",
      },
      {
        id: "D",
        text: "They hold the memory addresses of the buffer endpoints.",
      },
    ],
    correctOptionId: "B",
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