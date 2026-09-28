import type {
  DebugCase,
  DebugProgramLanguage,
  DebugQuestion,
} from "../types/assessment";

export const ROUND3_DURATION_MS = 60 * 60 * 1000;

function cases(samples: { input: string; output: string }[]): Record<DebugProgramLanguage, DebugCase[]> {
  return {
    "C++": samples,
    Python: samples,
    Java: samples,
  };
}

export function composedProgram(
  question: DebugQuestion,
  language: DebugProgramLanguage,
  editorCode: string,
): string {
  const driver = question.driver?.[language];
  if (!driver) return editorCode;
  const lines = [
    ...(driver.before ?? []),
    ...editorCode.split("\n"),
    ...(driver.after ?? []),
  ];
  return lines.join("\n");
}

export const ROUND3_QUESTIONS: DebugQuestion[] = [
  {
    id: "r3-two-sum",
    index: 1,
    title: "Two Sum",
    difficulty: "Easy",
    statement:
      "You are given an array of integers `nums` and an integer `target`. Return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].\n\nExample 2:\nInput: nums = [3,2,4], target = 6\nOutput: [1,2]\n\nExample 3:\nInput: nums = [3,3], target = 6\nOutput: [0,1]\n\nConstraints:\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- -10^9 <= target <= 10^9\n- Only one valid answer exists.",
    starters: {
      "C++": [
        "class Solution {",
        "public:",
        "    vector<int> twoSum(vector<int>& nums, int target) {",
        "        ",
        "    }",
        "};",
      ],
      Python: [
        "class Solution(object):",
        "    def twoSum(self, nums, target):",
        "        \"\"\"",
        "        :type nums: List[int]",
        "        :type target: int",
        "        :rtype: List[int]",
        "        \"\"\"",
      ],
      Java: [
        "class Solution {",
        "    public int[] twoSum(int[] nums, int target) {",
        "        ",
        "    }",
        "}",
      ],
    },
    driver: {
      "C++": {
        before: [
          "#include <iostream>",
          "#include <vector>",
          "#include <string>",
          "#include <sstream>",
          "#include <algorithm>",
          "#include <unordered_map>",
          "#include <unordered_set>",
          "#include <map>",
          "#include <climits>",
          "using namespace std;",
        ],
        after: [
          "",
          "int main() {",
          "    string line;",
          "    getline(cin, line);",
          "    int n = stoi(line);",
          "    vector<int> nums(n);",
          "    getline(cin, line);",
          "    stringstream ss(line);",
          "    for (int i = 0; i < n && (ss >> nums[i]); i++) {}",
          "    int target;",
          "    getline(cin, line);",
          "    target = stoi(line);",
          "    vector<int> ans = Solution().twoSum(nums, target);",
          "    sort(ans.begin(), ans.end());",
          "    cout << \"[\" << ans[0] << \", \" << ans[1] << \"]\" << endl;",
          "    return 0;",
          "}",
        ],
      },
      Python: {
        before: ["import sys"],
        after: [
          "",
          "def main():",
          "    data = sys.stdin.read().split()",
          "    n = int(data[0])",
          "    nums = list(map(int, data[1:1 + n]))",
          "    target = int(data[1 + n])",
          "    ans = Solution().twoSum(nums, target)",
          "    print(\"[%d, %d]\" % (min(ans), max(ans)))",
          "",
          "main()",
        ],
      },
      Java: {
        before: [
          "import java.util.*;",
          "import java.io.*;",
          "",
          "public class Main {",
          "    public static void main(String[] args) throws IOException {",
          "        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));",
          "        int n = Integer.parseInt(br.readLine().trim());",
          "        String[] parts = br.readLine().trim().split(\"\\\\s+\");",
          "        int[] nums = new int[n];",
          "        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(parts[i]);",
          "        int target = Integer.parseInt(br.readLine().trim());",
          "        int[] ans = new Solution().twoSum(nums, target);",
          "        System.out.println(\"[\" + Math.min(ans[0], ans[1]) + \", \" + Math.max(ans[0], ans[1]) + \"]\");",
          "    }",
          "}",
        ],
      },
    },
    sampleCases: cases([
      { input: "4\n2 7 11 15\n9", output: "[0, 1]" },
      { input: "3\n3 2 4\n6", output: "[1, 2]" },
    ]),
    bugHints: {
      "C++":
        "Scan the array once with a hash map: for each element, first check whether `target - nums[i]` is already stored; if so, you have found the pair; otherwise store `nums[i] -> i`. This runs in O(n). Return the two indices in ascending order so the printed output matches the required format.",
      Python:
        "Scan the array once with a dictionary: for each element, first check whether `target - nums[i]` is already stored; if so, you have found the pair; otherwise store `nums[i]: i`. This runs in O(n). Print the two indices in ascending order so the output matches the required format.",
      Java:
        "Scan the array once with a HashMap: for each element, first check whether the map already contains `target - nums[i]`; if so, you have found the pair; otherwise put `nums[i] -> i`. This runs in O(n). Return the two indices in ascending order so the printed output matches the required format.",
    },
  },
  {
    id: "r3-max-profit",
    index: 2,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    statement:
      "You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.\n\nExample 1:\nInput: prices = [7,1,5,3,6,4]\nOutput: 5\nExplanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5. Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.\n\nExample 2:\nInput: prices = [7,6,4,3,1]\nOutput: 0\nExplanation: In this case, no transactions are done and the max profit = 0.\n\nConstraints:\n- 1 <= prices.length <= 10^5\n- 0 <= prices[i] <= 10^4",
    starters: {
      "C++": [
        "class Solution {",
        "public:",
        "    int maxProfit(vector<int>& prices) {",
        "        ",
        "    }",
        "};",
      ],
      Python: [
        "class Solution(object):",
        "    def maxProfit(self, prices):",
        "        \"\"\"",
        "        :type prices: List[int]",
        "        :rtype: int",
        "        \"\"\"",
      ],
      Java: [
        "class Solution {",
        "    public int maxProfit(int[] prices) {",
        "        ",
        "    }",
        "}",
      ],
    },
    driver: {
      "C++": {
        before: [
          "#include <iostream>",
          "#include <vector>",
          "#include <string>",
          "#include <sstream>",
          "#include <algorithm>",
          "#include <unordered_map>",
          "#include <unordered_set>",
          "#include <map>",
          "#include <climits>",
          "using namespace std;",
        ],
        after: [
          "",
          "int main() {",
          "    string line;",
          "    getline(cin, line);",
          "    int n = stoi(line);",
          "    vector<int> prices(n);",
          "    getline(cin, line);",
          "    stringstream ss(line);",
          "    for (int i = 0; i < n && (ss >> prices[i]); i++) {}",
          "    cout << Solution().maxProfit(prices) << endl;",
          "    return 0;",
          "}",
        ],
      },
      Python: {
        before: ["import sys"],
        after: [
          "",
          "def main():",
          "    data = sys.stdin.read().split()",
          "    n = int(data[0])",
          "    prices = list(map(int, data[1:1 + n]))",
          "    print(Solution().maxProfit(prices))",
          "",
          "main()",
        ],
      },
      Java: {
        before: [
          "import java.util.*;",
          "import java.io.*;",
          "",
          "public class Main {",
          "    public static void main(String[] args) throws IOException {",
          "        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));",
          "        int n = Integer.parseInt(br.readLine().trim());",
          "        String[] parts = br.readLine().trim().split(\"\\\\s+\");",
          "        int[] prices = new int[n];",
          "        for (int i = 0; i < n; i++) prices[i] = Integer.parseInt(parts[i]);",
          "        System.out.println(new Solution().maxProfit(prices));",
          "    }",
          "}",
        ],
      },
    },
    sampleCases: cases([
      { input: "6\n7 1 5 3 6 4", output: "5" },
      { input: "5\n7 6 4 3 1", output: "0" },
    ]),
    bugHints: {
      "C++":
        "Keep track of the minimum price seen so far while scanning. On each day the best profit is `prices[i] - minSoFar`; remember the largest such value. If it never turns positive, return 0.",
      Python:
        "Keep track of the minimum price seen so far while scanning. On each day the best profit is `prices[i] - min_so_far`; remember the largest such value. If it never turns positive, return 0.",
      Java:
        "Keep track of the minimum price seen so far while scanning. On each day the best profit is `prices[i] - minSoFar`; remember the largest such value. If it never turns positive, return 0.",
    },
  },
  {
    id: "r3-longest-substring",
    index: 3,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    statement:
      "Given a string `s`, find the length of the longest substring without duplicate characters.\n\nExample 1:\nInput: s = \"abcabcbb\"\nOutput: 3\nExplanation: The answer is \"abc\", with the length of 3. Note that \"bca\" and \"cab\" are also correct answers.\n\nExample 2:\nInput: s = \"bbbbb\"\nOutput: 1\nExplanation: The answer is \"b\", with the length of 1.\n\nExample 3:\nInput: s = \"pwwkew\"\nOutput: 3\nExplanation: The answer is \"wke\", with the length of 3. Notice that the answer must be a substring, \"pwke\" is a subsequence and not a substring.\n\nConstraints:\n- 0 <= s.length <= 10^5\n- s consists of English letters, digits, symbols and spaces.",
    starters: {
      "C++": [
        "class Solution {",
        "public:",
        "    int lengthOfLongestSubstring(string s) {",
        "        ",
        "    }",
        "};",
      ],
      Python: [
        "class Solution(object):",
        "    def lengthOfLongestSubstring(self, s):",
        "        \"\"\"",
        "        :type s: str",
        "        :rtype: int",
        "        \"\"\"",
      ],
      Java: [
        "class Solution {",
        "    public int lengthOfLongestSubstring(String s) {",
        "        ",
        "    }",
        "}",
      ],
    },
    driver: {
      "C++": {
        before: [
          "#include <iostream>",
          "#include <vector>",
          "#include <string>",
          "#include <sstream>",
          "#include <algorithm>",
          "#include <unordered_map>",
          "#include <unordered_set>",
          "#include <map>",
          "#include <climits>",
          "using namespace std;",
        ],
        after: [
          "",
          "int main() {",
          "    string s;",
          "    getline(cin, s);",
          "    cout << Solution().lengthOfLongestSubstring(s) << endl;",
          "    return 0;",
          "}",
        ],
      },
      Python: {
        before: ["import sys"],
        after: [
          "",
          "def main():",
          "    s = sys.stdin.read().rstrip(\"\\n\")",
          "    print(Solution().lengthOfLongestSubstring(s))",
          "",
          "main()",
        ],
      },
      Java: {
        before: [
          "import java.util.*;",
          "import java.io.*;",
          "",
          "public class Main {",
          "    public static void main(String[] args) throws IOException {",
          "        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));",
          "        String s = br.readLine();",
          "        System.out.println(new Solution().lengthOfLongestSubstring(s));",
          "    }",
          "}",
        ],
      },
    },
    sampleCases: cases([
      { input: "abcabcbb", output: "3" },
      { input: "bbbbb", output: "1" },
    ]),
    bugHints: {
      "C++":
        "Use a sliding window with two pointers and a set of the characters currently inside the window. Grow the right pointer every step; if the new character is already in the set, advance the left pointer until the duplicate leaves. Track the largest window size seen.",
      Python:
        "Use a sliding window with two pointers and a set of the characters currently inside the window. Grow the right pointer every step; if the new character is already in the set, advance the left pointer until the duplicate leaves. Track the largest window size seen.",
      Java:
        "Use a sliding window with two pointers and a set of the characters currently inside the window. Grow the right pointer every step; if the new character is already in the set, advance the left pointer until the duplicate leaves. Track the largest window size seen.",
    },
  },
  {
    id: "r3-group-anagrams",
    index: 4,
    title: "Group Anagrams",
    difficulty: "Medium",
    statement:
      "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.\n\nExample 1:\nInput: strs = [\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]\nOutput: [[\"bat\"],[\"nat\",\"tan\"],[\"ate\",\"eat\",\"tea\"]]\nExplanation: There is no string in strs that can be rearranged to form \"bat\". The strings \"nat\" and \"tan\" are anagrams as they can be rearranged to form each other. The strings \"ate\", \"eat\", and \"tea\" are anagrams as they can be rearranged to form each other.\n\nExample 2:\nInput: strs = [\"\"]\nOutput: [[\"\"]]\n\nExample 3:\nInput: strs = [\"a\"]\nOutput: [[\"a\"]]\n\nConstraints:\n- 1 <= strs.length <= 10^4\n- 0 <= strs[i].length <= 100\n- strs[i] consists of lowercase English letters.",
    starters: {
      "C++": [
        "class Solution {",
        "public:",
        "    vector<vector<string>> groupAnagrams(vector<string>& strs) {",
        "        ",
        "    }",
        "};",
      ],
      Python: [
        "class Solution(object):",
        "    def groupAnagrams(self, strs):",
        "        \"\"\"",
        "        :type strs: List[str]",
        "        :rtype: List[List[str]]",
        "        \"\"\"",
      ],
      Java: [
        "class Solution {",
        "    public List<List<String>> groupAnagrams(String[] strs) {",
        "        ",
        "    }",
        "}",
      ],
    },
    driver: {
      "C++": {
        before: [
          "#include <iostream>",
          "#include <vector>",
          "#include <string>",
          "#include <sstream>",
          "#include <algorithm>",
          "#include <unordered_map>",
          "#include <unordered_set>",
          "#include <map>",
          "#include <climits>",
          "using namespace std;",
        ],
        after: [
          "",
          "int main() {",
          "    string line;",
          "    getline(cin, line);",
          "    int n = stoi(line);",
          "    vector<string> strs(n);",
          "    for (int i = 0; i < n; i++) {",
          "        getline(cin, strs[i]);",
          "    }",
          "    vector<vector<string>> groups = Solution().groupAnagrams(strs);",
          "    for (auto& g : groups) sort(g.begin(), g.end());",
          "    sort(groups.begin(), groups.end(), [](const vector<string>& a, const vector<string>& b) {",
          "        if (a.empty()) return false;",
          "        if (b.empty()) return true;",
          "        return a[0] < b[0];",
          "    });",
          "    for (auto& g : groups) {",
          "        cout << \"[\";",
          "        for (size_t i = 0; i < g.size(); i++) {",
          "            if (i > 0) cout << \", \";",
          "            cout << \"\\\"\" << g[i] << \"\\\"\";",
          "        }",
          "        cout << \"]\" << endl;",
          "    }",
          "    return 0;",
          "}",
        ],
      },
      Python: {
        before: ["import sys"],
        after: [
          "",
          "def main():",
          "    data = sys.stdin.read().split(\"\\n\")",
          "    n = int(data[0].strip())",
          "    strs = data[1:1 + n]",
          "    groups = Solution().groupAnagrams(strs)",
          "    for g in groups:",
          "        g.sort()",
          "    groups.sort(key=lambda g: g[0] if g else \"\")",
          "    for g in groups:",
          "        print(\"[\" + \", \".join('\"%s\"' % w for w in g) + \"]\")",
          "",
          "main()",
        ],
      },
      Java: {
        before: [
          "import java.util.*;",
          "import java.io.*;",
          "",
          "public class Main {",
          "    public static void main(String[] args) throws IOException {",
          "        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));",
          "        int n = Integer.parseInt(br.readLine().trim());",
          "        String[] strs = new String[n];",
          "        for (int i = 0; i < n; i++) strs[i] = br.readLine();",
          "        List<List<String>> groups = new Solution().groupAnagrams(strs);",
          "        for (List<String> g : groups) Collections.sort(g);",
          "        groups.sort((a, b) -> (a.isEmpty() ? \"\" : a.get(0)).compareTo(b.isEmpty() ? \"\" : b.get(0)));",
          "        for (List<String> g : groups) {",
          "            StringBuilder sb = new StringBuilder(\"[\");",
          "            for (int i = 0; i < g.size(); i++) {",
          "                if (i > 0) sb.append(\", \");",
          "                sb.append('\"').append(g.get(i)).append('\"');",
          "            }",
          "            sb.append(\"]\");",
          "            System.out.println(sb);",
          "        }",
          "    }",
          "}",
        ],
      },
    },
    sampleCases: cases([
      {
        input: "6\neat\ntea\ntan\nate\nnat\nbat",
        output: "[\"ate\", \"eat\", \"tea\"]\n[\"bat\"]\n[\"nat\", \"tan\"]",
      },
      { input: "1\na", output: "[\"a\"]" },
    ]),
    bugHints: {
      "C++":
        "Key each string by its letters sorted alphabetically, and store groups in a map keyed by that signature (anagrams share the same signature). After grouping, sort the strings inside each group and then sort the group list by its first string so the printed output is deterministic and matches the required format exactly.",
      Python:
        "Key each string by a sorted-letter signature, and store groups in a dictionary keyed by that signature (anagrams share the same signature). After grouping, sort the strings inside each group and then sort the group list by its first string so the printed output is deterministic and matches the required format exactly.",
      Java:
        "Key each string by its letters sorted alphabetically, and store groups in a map keyed by that signature (anagrams share the same signature). After grouping, sort the strings inside each group and then sort the group list by its first string so the printed output is deterministic and matches the required format exactly.",
    },
  },
];

export const TOTAL_ROUND3_QUESTIONS = ROUND3_QUESTIONS.length;