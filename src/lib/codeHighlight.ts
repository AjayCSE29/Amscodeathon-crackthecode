import type { CodeLine, CodeToken, CodeTokenType } from "../types/assessment";

const KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "return",
  "break",
  "continue",
  "switch",
  "case",
  "default",
  "int",
  "long",
  "short",
  "float",
  "double",
  "char",
  "bool",
  "byte",
  "void",
  "auto",
  "const",
  "static",
  "unsigned",
  "signed",
  "struct",
  "class",
  "enum",
  "namespace",
  "using",
  "template",
  "typename",
  "public",
  "private",
  "protected",
  "virtual",
  "override",
  "new",
  "delete",
  "nullptr",
  "true",
  "false",
  "try",
  "catch",
  "throw",
  "this",
  "std",
  "extends",
  "implements",
  "final",
  "finally",
  "abstract",
  "assert",
  "instanceof",
  "interface",
  "native",
  "package",
  "strictfp",
  "super",
  "synchronized",
  "throws",
  "transient",
  "volatile",
  "def",
  "elif",
  "lambda",
  "import",
  "from",
  "as",
  "not",
  "and",
  "or",
  "in",
  "is",
  "pass",
  "del",
  "global",
  "nonlocal",
  "raise",
  "with",
  "yield",
  "async",
  "await",
  "except",
  "None",
]);

const TYPES = new Set([
  "Node",
  "TreeNode",
  "List",
  "ListNode",
  "vector",
  "queue",
  "stack",
  "deque",
  "map",
  "unordered_map",
  "set",
  "unordered_set",
  "string",
  "String",
  "pair",
  "size_t",
  "int64",
  "int32",
  "uint32",
  "Integer",
  "Long",
  "Double",
  "Float",
  "Byte",
  "Boolean",
  "Character",
  "Math",
  "Arrays",
  "Scanner",
  "BufferedReader",
  "InputStreamReader",
  "OutputStream",
  "PrintWriter",
  "IOException",
  "Exception",
  "RuntimeException",
  "ArrayList",
  "LinkedList",
  "HashMap",
  "HashSet",
  "TreeMap",
  "PriorityQueue",
  "Objects",
  "StringBuilder",
  "StringBuffer",
  "Collections",
  "Comparator",
]);

interface Part {
  type: CodeTokenType;
  text: string;
}

const TOKEN_SPECS: Array<{ type: CodeTokenType; re: RegExp }> = [
  { type: "comment", re: /^\/\/.*|^\/\*[\s\S]*?\*\// },
  { type: "string", re: /^".*?"|^'.*?'/ },
  { type: "number", re: /^\d+(\.\d+)?/ },
  { type: "type", re: /^[A-Z_a-z][A-Za-z0-9_]*/ },
];

function matchPart(line: string, offset: number): Part | null {
  const rest = line.slice(offset);
  for (const spec of TOKEN_SPECS) {
    const m = rest.match(spec.re);
    if (m) {
      let type = spec.type;
      let text = m[0];
      if (spec.type === "type") {
        if (KEYWORDS.has(text)) type = "keyword";
        else if (TYPES.has(text)) type = "type";
        else if (/^[A-Z][A-Za-z0-9_]*$/.test(text)) type = "type";
        else if (rest[m[0].length] === "(") type = "function";
        else type = "plain";
      }
      return { type, text };
    }
  }
  // plain run until the next character that could start a token
  let i = 0;
  while (
    i < rest.length &&
    !/["'0-9A-Za-z_]/.test(rest[i]) &&
    !(rest[i] === "/" && rest[i + 1] === "/")
  ) {
    i += 1;
  }
  if (i === 0) i = 1;
  return { type: "plain", text: rest.slice(0, i) };
}

export function tokenizeLine(source: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let offset = 0;
  while (offset < source.length) {
    const part = matchPart(source, offset);
    if (!part) break;
    const next = part.text.length > 0 ? part.text.length : 1;
    tokens.push({ type: part.type, text: source.slice(offset, offset + next) });
    offset += next;
  }
  return tokens;
}

export function buildCodeLines(contents: string[]): CodeLine[] {
  return contents.map((text, i) => ({
    lineNumber: i + 1,
    text,
    tokens: tokenizeLine(text),
  }));
}

export function plainCode(contents: string[]): string {
  return contents.join("\n");
}

export const TOKEN_CLASS: Record<CodeTokenType, string> = {
  plain: "text-inverse-on-surface",
  comment: "text-tertiary-fixed-dim",
  keyword: "text-secondary-fixed",
  type: "text-inverse-primary",
  function: "text-tertiary-fixed",
  number: "text-inverse-primary",
  string: "text-primary-fixed",
};