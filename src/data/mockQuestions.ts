import type { CodeSnippet, Question } from "../types/assessment";
import { buildCodeLines } from "../lib/codeHighlight";

const swapSnippet: CodeSnippet = {
  fileName: "swap.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 5",
    "y = 2",
    "x = x + y",
    "y = x - y",
    "x = x - y",
    "print(x, y)",
  ]),
};

const doublingSnippet: CodeSnippet = {
  fileName: "for_loop.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 1",
    "for i = 1 to 4:",
    "    x = x * 2",
    "print(x)",
  ]),
};

const branchesSnippet: CodeSnippet = {
  fileName: "condition.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "a = 10",
    "b = 20",
    "c = 15",
    "if a > b:",
    "    print(a)",
    "elif b > c:",
    "    print(b)",
    "else:",
    "    print(c)",
  ]),
};

const nestedCountSnippet: CodeSnippet = {
  fileName: "nested_loops.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "count = 0",
    "for i = 1 to 3:",
    "    for j = 1 to 2:",
    "        count = count + 1",
  ]),
};

const whileSnippet: CodeSnippet = {
  fileName: "while_loop.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 15",
    "while x > 5:",
    "    x = x - 3",
    "print(x)",
  ]),
};

const averageSnippet: CodeSnippet = {
  fileName: "sum_array.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "arr = [2, 4, 6, 8]",
    "sum = 0",
    "for i = 0 to 3:",
    "    sum = sum + arr[i]",
    "print(sum / 4)",
  ]),
};

const changeFunctionSnippet: CodeSnippet = {
  fileName: "function.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 2",
    "function change(x):",
    "    x = x + 5",
    "    return x",
    "x = change(x)",
    "x = change(x)",
    "print(x)",
  ]),
};

const countAboveSnippet: CodeSnippet = {
  fileName: "count_array.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "arr = [1, 2, 3, 4, 5]",
    "count = 0",
    "for i = 0 to 4:",
    "    if arr[i] > 2:",
    "        count = count + 1",
    "print(count)",
  ]),
};

const breakSnippet: CodeSnippet = {
  fileName: "break_loop.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 0",
    "for i = 1 to 5:",
    "    if i == 3:",
    "        break",
    "    x = x + i",
    "print(x)",
  ]),
};

const swapArraySnippet: CodeSnippet = {
  fileName: "swap_array.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "arr = [5, 10, 15, 20]",
    "temp = arr[0]",
    "arr[0] = arr[3]",
    "arr[3] = temp",
    "print(arr[0], arr[3])",
  ]),
};

const charCountSnippet: CodeSnippet = {
  fileName: "count_chars.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "str = \"HELLO\"",
    "count = 0",
    "for each character in str:",
    "    if character == 'L':",
    "        count = count + 1",
    "print(count)",
  ]),
};

const halvingSnippet: CodeSnippet = {
  fileName: "halving.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "x = 20",
    "for i = 1 to 4:",
    "    if x % 2 == 0:",
    "        x = x / 2",
    "    else:",
    "        x = x + 1",
    "print(x)",
  ]),
};

const primeSnippet: CodeSnippet = {
  fileName: "prime.txt",
  language: "Pseudocode",
  lines: buildCodeLines([
    "n = 17",
    "count = 0",
    "for i = 1 to n:",
    "    if n % i == 0:",
    "        count = count + 1",
    "if count == 2:",
    "    print(\"Prime\")",
    "else:",
    "    print(\"Not Prime\")",
  ]),
};

const recursionSnippet: CodeSnippet = {
  fileName: "recursion.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "int fun(int n) {",
    "    if (n <= 1)",
    "        return 1;",
    "    return n * fun(n - 2);",
    "}",
    "cout << fun(6);",
  ]),
};

const nestedRecursionSnippet: CodeSnippet = {
  fileName: "nested_recursion.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "int fun(int n) {",
    "    if (n <= 1)",
    "        return n;",
    "    return fun(n - 1) + fun(n - 2);",
    "}",
    "cout << fun(6);",
  ]),
};

const arraySnippet: CodeSnippet = {
  fileName: "array_manipulation.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "int arr[] = {2, 4, 6, 8, 10};",
    "for(int i = 0; i < 5; i++) {",
    "    arr[i] = arr[i] + i;",
    "}",
    "for(int i = 4; i >= 0; i -= 2) {",
    "    cout << arr[i] << \" \";",
    "}",
  ]),
};

const pointerSnippet: CodeSnippet = {
  fileName: "pointers.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "int a = 10;",
    "int b = 20;",
    "int *p = &a;",
    "int *q = &b;",
    "*p = *p + *q;",
    "*q = *p - *q;",
    "*p = *p - *q;",
    "cout << a << \" \" << b;",
  ]),
};

const referenceSnippet: CodeSnippet = {
  fileName: "references.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "void modify(int &a, int &b) {",
    "    a = a + b;",
    "    b = a - b;",
    "    a = a - b;",
    "}",
    "int x = 15;",
    "int y = 25;",
    "modify(x, y);",
    "cout << x << \" \" << y;",
  ]),
};

const loopSnippet: CodeSnippet = {
  fileName: "loop_analysis.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "for(int i = 1; i <= n; i *= 2) {",
    "    for(int j = 1; j <= i; j++) {",
    "        cout << \"*\";",
    "    }",
    "}",
  ]),
};

const complexLoopSnippet: CodeSnippet = {
  fileName: "complex_loop.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "for(int i = n; i > 0; i /= 2) {",
    "    for(int j = 0; j < i; j++) {",
    "        cout << \"*\";",
    "    }",
    "}",
  ]),
};

const tripleLoopSnippet: CodeSnippet = {
  fileName: "nested_complexity.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "for(int i = 1; i <= n; i *= 2) {",
    "    for(int j = 0; j < n; j++) {",
    "        for(int k = 1; k <= n; k *= 2) {",
    "            cout << \"*\";",
    "        }",
    "    }",
    "}",
  ]),
};

const stackRecursionSnippet: CodeSnippet = {
  fileName: "stack_recursion.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "void fun(int n) {",
    "    if(n == 0)",
    "        return;",
    "    cout << n << \" \";",
    "    fun(n - 1);",
    "    cout << n << \" \";",
    "}",
    "fun(3);",
  ]),
};

const halfRecursionSnippet: CodeSnippet = {
  fileName: "half_recursion.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "int fun(int n) {",
    "    if(n <= 1)",
    "        return 1;",
    "    return fun(n / 2) + fun(n / 2);",
    "}",
  ]),
};

const doublingInnerSnippet: CodeSnippet = {
  fileName: "nested_timing.cpp",
  language: "C++17",
  lines: buildCodeLines([
    "for(int i = 1; i <= n; i *= 2) {",
    "    for(int j = 0; j < n; j++) {",
    "        cout << \"*\";",
    "    }",
    "}",
  ]),
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: "Q-001",
    index: 1,
    question: "What is the decimal equivalent of the binary number `101101`₂?",
    options: [
      { id: "A", text: "41" },
      { id: "B", text: "43" },
      { id: "C", text: "45" },
      { id: "D", text: "47" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-002",
    index: 2,
    question:
      "A processor executes 2 billion instructions per second. Approximately how many instructions can it execute in 5 seconds?",
    options: [
      { id: "A", text: "2 billion" },
      { id: "B", text: "5 billion" },
      { id: "C", text: "10 billion" },
      { id: "D", text: "20 billion" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-003",
    index: 3,
    question: "Which device is primarily used to connect different networks?",
    options: [
      { id: "A", text: "Hub" },
      { id: "B", text: "Switch" },
      { id: "C", text: "Router" },
      { id: "D", text: "Repeater" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-004",
    index: 4,
    question: "Which of the following is a valid IPv4 address?",
    options: [
      { id: "A", text: "`192.168.1.256`" },
      { id: "B", text: "`192.168.1.10`" },
      { id: "C", text: "`300.10.2.1`" },
      { id: "D", text: "`192.168.500.2`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-005",
    index: 5,
    question: "Which key uniquely identifies a record in a database table?",
    options: [
      { id: "A", text: "Foreign Key" },
      { id: "B", text: "Primary Key" },
      { id: "C", text: "Candidate Value" },
      { id: "D", text: "Composite Value" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-006",
    index: 6,
    question:
      "If an algorithm takes 10 seconds to process 1,000 elements and its running time is approximately proportional to the number of elements, how long would it take for 3,000 elements?",
    options: [
      { id: "A", text: "15 seconds" },
      { id: "B", text: "20 seconds" },
      { id: "C", text: "30 seconds" },
      { id: "D", text: "40 seconds" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-007",
    index: 7,
    question: "What is the result of `1 OR 0`?",
    options: [
      { id: "A", text: "`0`" },
      { id: "B", text: "`1`" },
      { id: "C", text: "`10`" },
      { id: "D", text: "`Undefined`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-008",
    index: 8,
    question: "Which memory is generally faster?",
    options: [
      { id: "A", text: "HDD" },
      { id: "B", text: "RAM" },
      { id: "C", text: "Cache" },
      { id: "D", text: "Secondary storage" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-009",
    index: 9,
    question:
      "A process contains 4 threads. If each thread performs an independent task, how many tasks can potentially execute concurrently?",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "4" },
      { id: "D", text: "8" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-010",
    index: 10,
    question:
      "A computer's storage capacity increases from 500 GB to 750 GB. What is the percentage increase?",
    options: [
      { id: "A", text: "25%" },
      { id: "B", text: "40%" },
      { id: "C", text: "50%" },
      { id: "D", text: "75%" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-011",
    index: 11,
    question:
      "A network connection transfers 100 MB of data in 5 seconds. What is the average transfer rate?",
    options: [
      { id: "A", text: "10 MB/s" },
      { id: "B", text: "15 MB/s" },
      { id: "C", text: "20 MB/s" },
      { id: "D", text: "25 MB/s" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-012",
    index: 12,
    question: "A binary tree node can have a maximum of how many children?",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "4" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-013",
    index: 13,
    question:
      "A computer system has a 90% chance of working correctly. What is the probability that it fails?",
    options: [
      { id: "A", text: "5%" },
      { id: "B", text: "10%" },
      { id: "C", text: "20%" },
      { id: "D", text: "90%" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-014",
    index: 14,
    question:
      "Which protocol is commonly used to securely access a remote computer through a command-line interface?",
    options: [
      { id: "A", text: "FTP" },
      { id: "B", text: "HTTP" },
      { id: "C", text: "SSH" },
      { id: "D", text: "SMTP" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-015",
    index: 15,
    question:
      "Which of the following is used to convert data into an unreadable form that can later be restored using the appropriate key?",
    options: [
      { id: "A", text: "Encryption" },
      { id: "B", text: "Compression" },
      { id: "C", text: "Compilation" },
      { id: "D", text: "Fragmentation" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-016",
    index: 16,
    question: "What is the output?",
    code: swapSnippet,
    options: [
      { id: "A", text: "`5 2`" },
      { id: "B", text: "`2 5`" },
      { id: "C", text: "`7 5`" },
      { id: "D", text: "`5 7`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-017",
    index: 17,
    question: "What is the output?",
    code: doublingSnippet,
    options: [
      { id: "A", text: "4" },
      { id: "B", text: "8" },
      { id: "C", text: "16" },
      { id: "D", text: "32" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-018",
    index: 18,
    question: "What is the output?",
    code: branchesSnippet,
    options: [
      { id: "A", text: "10" },
      { id: "B", text: "15" },
      { id: "C", text: "20" },
      { id: "D", text: "45" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-019",
    index: 19,
    question: "What is the value of count?",
    code: nestedCountSnippet,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "9" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-020",
    index: 20,
    question: "What is the output?",
    code: whileSnippet,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "9" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-021",
    index: 21,
    question: "What is the output?",
    code: averageSnippet,
    options: [
      { id: "A", text: "4" },
      { id: "B", text: "5" },
      { id: "C", text: "6" },
      { id: "D", text: "20" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-022",
    index: 22,
    question:
      "A program checks whether a number is divisible by both 3 and 5. Which condition is correct?",
    options: [
      { id: "A", text: "`n % 3 == 0 OR n % 5 == 0`" },
      { id: "B", text: "`n % 3 == 0 AND n % 5 == 0`" },
      { id: "C", text: "`n / 3 == 0 AND n / 5 == 0`" },
      { id: "D", text: "`n % 15 == 1`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-023",
    index: 23,
    question: "What is the final value of `x`?",
    code: changeFunctionSnippet,
    options: [
      { id: "A", text: "7" },
      { id: "B", text: "10" },
      { id: "C", text: "12" },
      { id: "D", text: "14" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-024",
    index: 24,
    question: "What is the output?",
    code: countAboveSnippet,
    options: [
      { id: "A", text: "2" },
      { id: "B", text: "3" },
      { id: "C", text: "4" },
      { id: "D", text: "5" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-025",
    index: 25,
    question: "What is the output?",
    code: breakSnippet,
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "6" },
      { id: "C", text: "8" },
      { id: "D", text: "15" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-026",
    index: 26,
    question:
      "Which value of `n` makes the following condition true: `if n % 2 == 0 AND n > 10`?",
    options: [
      { id: "A", text: "7" },
      { id: "B", text: "9" },
      { id: "C", text: "12" },
      { id: "D", text: "15" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-027",
    index: 27,
    question: "What is the output?",
    code: swapArraySnippet,
    options: [
      { id: "A", text: "`5 20`" },
      { id: "B", text: "`20 5`" },
      { id: "C", text: "`10 15`" },
      { id: "D", text: "`15 10`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-028",
    index: 28,
    question: "What is the output?",
    code: charCountSnippet,
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "5" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-029",
    index: 29,
    question: "What is the output?",
    code: halvingSnippet,
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "5" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-030",
    index: 30,
    question: "What does this code determine?",
    code: primeSnippet,
    options: [
      { id: "A", text: "Whether n is even" },
      { id: "B", text: "Whether n is positive" },
      { id: "C", text: "Whether n is prime" },
      { id: "D", text: "Whether n is a perfect square" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-031",
    index: 31,
    question: "What is the output?",
    code: recursionSnippet,
    options: [
      { id: "A", text: "24" },
      { id: "B", text: "36" },
      { id: "C", text: "48" },
      { id: "D", text: "720" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-032",
    index: 32,
    question: "What is the output?",
    code: nestedRecursionSnippet,
    options: [
      { id: "A", text: "5" },
      { id: "B", text: "8" },
      { id: "C", text: "13" },
      { id: "D", text: "21" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-033",
    index: 33,
    question: "What is the output?",
    code: arraySnippet,
    options: [
      { id: "A", text: "`10 6 2`" },
      { id: "B", text: "`14 8 2`" },
      { id: "C", text: "`14 8 4`" },
      { id: "D", text: "`10 7 2`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-034",
    index: 34,
    question: "What is the output?",
    code: pointerSnippet,
    options: [
      { id: "A", text: "`10 20`" },
      { id: "B", text: "`20 10`" },
      { id: "C", text: "`30 20`" },
      { id: "D", text: "`20 30`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-035",
    index: 35,
    question: "What is the output?",
    code: referenceSnippet,
    options: [
      { id: "A", text: "`15 25`" },
      { id: "B", text: "`25 15`" },
      { id: "C", text: "`40 25`" },
      { id: "D", text: "`25 40`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-036",
    index: 36,
    question: "What is the time complexity of the following code?",
    code: loopSnippet,
    options: [
      { id: "A", text: "`O(log n)`" },
      { id: "B", text: "`O(n)`" },
      { id: "C", text: "`O(n log n)`" },
      { id: "D", text: "`O(n²)`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-037",
    index: 37,
    question: "What is the time complexity?",
    code: complexLoopSnippet,
    options: [
      { id: "A", text: "`O(log n)`" },
      { id: "B", text: "`O(n)`" },
      { id: "C", text: "`O(n log n)`" },
      { id: "D", text: "`O(n²)`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-038",
    index: 38,
    question:
      "A stack initially contains `10, 20, 30`, where `30` is at the top. The following operations are performed: `POP()`, `PUSH(40)`, `POP()`, `PUSH(50)`, `PUSH(60)`, `POP()`. What is the final stack from bottom to top?",
    options: [
      { id: "A", text: "`10 20 40`" },
      { id: "B", text: "`10 20 50`" },
      { id: "C", text: "`10 20 50 60`" },
      { id: "D", text: "`10 20 40 50`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-039",
    index: 39,
    question:
      "A queue initially contains `10 20 30 40`, where `10` is at the front. Operations: `DEQUEUE()`, `ENQUEUE(50)`, `DEQUEUE()`, `ENQUEUE(60)`. What is the final queue?",
    options: [
      { id: "A", text: "`20 30 40 50 60`" },
      { id: "B", text: "`30 40 50 60`" },
      { id: "C", text: "`20 30 40 60`" },
      { id: "D", text: "`30 40 60 50`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-040",
    index: 40,
    question:
      "Consider the sorted array `[3, 7, 11, 15, 19, 23, 27, 31, 35]`. Using standard binary search, how many element comparisons are required to find `27`?",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "4" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-041",
    index: 41,
    question:
      "An array is `[5, 2, 8, 1, 3]`. After one complete pass of Bubble Sort in ascending order, what will the array be?",
    options: [
      { id: "A", text: "`[2, 5, 1, 3, 8]`" },
      { id: "B", text: "`[2, 5, 1, 3, 8]`" },
      { id: "C", text: "`[2, 1, 3, 5, 8]`" },
      { id: "D", text: "`[1, 2, 3, 5, 8]`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-042",
    index: 42,
    question:
      "A hash table has size 10 and uses `hash(key) = key % 10`. Using linear probing, insert `23, 43, 13, 27`. At which positions will these values be stored?",
    options: [
      { id: "A", text: "`23→3, 43→4, 13→5, 27→7`" },
      { id: "B", text: "`23→3, 43→4, 13→5, 27→7`" },
      { id: "C", text: "`23→3, 43→3, 13→3, 27→7`" },
      { id: "D", text: "`23→3, 43→4, 13→3, 27→7`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-043",
    index: 43,
    question:
      "A singly linked list contains `10 → 20 → 30 → 40 → NULL`. The following operations are performed: insert `25` after the node containing `20`, delete the node containing `40`, insert `5` at the beginning. What is the resulting list?",
    options: [
      { id: "A", text: "`5 → 10 → 20 → 25 → 30 → NULL`" },
      { id: "B", text: "`10 → 20 → 25 → 30 → 40 → NULL`" },
      { id: "C", text: "`5 → 10 → 20 → 30 → 25 → NULL`" },
      { id: "D", text: "`5 → 10 → 20 → 25 → 30 → 40 → NULL`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-044",
    index: 44,
    question:
      "Consider the graph with neighbors `A → B, C`, `B → D, E`, and `C → F`. Starting from `A`, what is a possible Breadth-First Search (BFS) traversal?",
    options: [
      { id: "A", text: "`A B C D E F`" },
      { id: "B", text: "`A B D E C F`" },
      { id: "C", text: "`A C F B E D`" },
      { id: "D", text: "`A D B E C F`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-045",
    index: 45,
    question: "Consider the following code. What is the time complexity?",
    code: tripleLoopSnippet,
    options: [
      { id: "A", text: "`O(n²)`" },
      { id: "B", text: "`O(n log n)`" },
      { id: "C", text: "`O(n log² n)`" },
      { id: "D", text: "`O(n² log n)`" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-046",
    index: 46,
    question:
      "Given the array `[10, 5, 8, 3, 6]`, what will the array be after performing one pass of Selection Sort in ascending order?",
    options: [
      { id: "A", text: "`[3, 5, 8, 10, 6]`" },
      { id: "B", text: "`[3, 5, 8, 10, 6]`" },
      { id: "C", text: "`[5, 10, 8, 3, 6]`" },
      { id: "D", text: "`[3, 10, 8, 5, 6]`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-047",
    index: 47,
    question: "What is the output?",
    code: stackRecursionSnippet,
    options: [
      { id: "A", text: "`3 2 1`" },
      { id: "B", text: "`1 2 3 3 2 1`" },
      { id: "C", text: "`3 2 1 1 2 3`" },
      { id: "D", text: "`3 2 1 2 3`" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-048",
    index: 48,
    question:
      "A queue initially contains `10 → 20 → 30 → 40`. Perform the following operations: `DEQUEUE()`, `ENQUEUE(50)`, `DEQUEUE()`, `ENQUEUE(60)`. What is the final queue?",
    options: [
      { id: "A", text: "`20 → 30 → 40 → 50 → 60`" },
      { id: "B", text: "`30 → 40 → 50 → 60`" },
      { id: "C", text: "`20 → 30 → 40 → 60`" },
      { id: "D", text: "`30 → 40 → 60 → 50`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-049",
    index: 49,
    question:
      "A singly linked list is `10 → 20 → 30 → 40 → NULL`. If the following operations are performed: (1) insert `25` after `20`, (2) delete `30`, (3) insert `5` at the beginning. What is the resulting list?",
    options: [
      { id: "A", text: "`5 → 10 → 20 → 25 → 40 → NULL`" },
      { id: "B", text: "`10 → 20 → 25 → 40 → NULL`" },
      { id: "C", text: "`5 → 10 → 20 → 30 → 40 → NULL`" },
      { id: "D", text: "`5 → 10 → 20 → 25 → 30 → 40 → NULL`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-050",
    index: 50,
    question:
      "Consider the sorted array `[2, 5, 8, 12, 16, 21, 25, 30, 35]`. Using binary search, how many comparisons are required to find `25`?",
    options: [
      { id: "A", text: "1" },
      { id: "B", text: "2" },
      { id: "C", text: "3" },
      { id: "D", text: "4" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-051",
    index: 51,
    question:
      "Consider the following binary tree: the root `10` has left child `5` and right child `15`; `5` has left child `2` and right child `7`; `15` has a right child `20`. What is the inorder traversal?",
    options: [
      { id: "A", text: "`10 5 2 7 15 20`" },
      { id: "B", text: "`2 5 7 10 15 20`" },
      { id: "C", text: "`2 7 5 20 15 10`" },
      { id: "D", text: "`10 5 7 2 15 20`" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-052",
    index: 52,
    question:
      "Which sequence represents a valid preorder traversal of a Binary Search Tree?",
    options: [
      { id: "A", text: "`10, 5, 2, 7, 15, 12, 20`" },
      { id: "B", text: "`10, 15, 5, 2, 7, 12, 20`" },
      { id: "C", text: "`10, 5, 15, 20, 2, 7, 12`" },
      { id: "D", text: "`10, 2, 15, 7, 5, 12, 20`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-053",
    index: 53,
    question:
      "Consider the graph with neighbors `A → B, C`, `B → D, E`, and `C → F`. Starting from `A`, what is the Breadth-First Search (BFS) traversal?",
    options: [
      { id: "A", text: "`A B C D E F`" },
      { id: "B", text: "`A B D E C F`" },
      { id: "C", text: "`A C F B D E`" },
      { id: "D", text: "`A D B E C F`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-054",
    index: 54,
    question:
      "Using the same graph, where `A → B, C`, `B → D, E`, and `C → F`, and starting from `A` visiting the left neighbour before the right neighbour, what is a possible Depth-First Search (DFS) traversal?",
    options: [
      { id: "A", text: "`A B D E C F`" },
      { id: "B", text: "`A B C D E F`" },
      { id: "C", text: "`A C F B D E`" },
      { id: "D", text: "`A D B E C F`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-055",
    index: 55,
    question:
      "A hash table has size 10 and uses `hash(key) = key % 10`. Using linear probing, insert `23, 33, 43, 12`. At which positions will the elements be stored?",
    options: [
      { id: "A", text: "`23→3, 33→4, 43→5, 12→2`" },
      { id: "B", text: "`23→3, 33→3, 43→3, 12→2`" },
      { id: "C", text: "`23→3, 33→4, 43→5, 12→3`" },
      { id: "D", text: "`23→2, 33→3, 43→4, 12→2`" },
    ],
    correctOptionId: "A",
  },
  {
    id: "Q-056",
    index: 56,
    question: "What is the time complexity of the following code?",
    code: doublingInnerSnippet,
    options: [
      { id: "A", text: "`O(log n)`" },
      { id: "B", text: "`O(n)`" },
      { id: "C", text: "`O(n log n)`" },
      { id: "D", text: "`O(n²)`" },
    ],
    correctOptionId: "C",
  },
  {
    id: "Q-057",
    index: 57,
    question:
      "Given the sorted array `[1, 2, 4, 7, 9, 11]`, using the two-pointer technique, which pair has a sum of `13`?",
    options: [
      { id: "A", text: "1 and 11" },
      { id: "B", text: "2 and 11" },
      { id: "C", text: "4 and 9" },
      { id: "D", text: "7 and 9" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-058",
    index: 58,
    question:
      "What data structure is commonly used to check whether parentheses in an expression are balanced?",
    options: [
      { id: "A", text: "Queue" },
      { id: "B", text: "Stack" },
      { id: "C", text: "Heap" },
      { id: "D", text: "Graph" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-059",
    index: 59,
    question:
      "What is the value of `dp[5]` if the Fibonacci sequence is calculated using `dp[0] = 0`, `dp[1] = 1`, `dp[n] = dp[n-1] + dp[n-2]`?",
    options: [
      { id: "A", text: "3" },
      { id: "B", text: "5" },
      { id: "C", text: "8" },
      { id: "D", text: "13" },
    ],
    correctOptionId: "B",
  },
  {
    id: "Q-060",
    index: 60,
    question: "Consider the following function. What is the time complexity of this function?",
    code: halfRecursionSnippet,
    options: [
      { id: "A", text: "`O(log n)`" },
      { id: "B", text: "`O(n)`" },
      { id: "C", text: "`O(n log n)`" },
      { id: "D", text: "`O(2^n)`" },
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