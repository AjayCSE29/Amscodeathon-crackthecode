import type { DebugProgramLanguage } from "../types/assessment";

export interface RunRequest {
  language: DebugProgramLanguage;
  code: string;
  stdin: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

interface ErrorBody {
  error?: string;
}

export async function runCode(request: RunRequest): Promise<RunResult> {
  let response: Response;
  try {
    response = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error(
      "Execution service is unreachable. Is the backend running?",
    );
  }

  if (!response.ok) {
    let message = `Execution failed (HTTP ${response.status}).`;
    try {
      const data = (await response.json()) as ErrorBody;
      if (data.error) message = data.error;
    } catch {
      // ignore malformed error body
    }
    throw new Error(message);
  }

  return (await response.json()) as RunResult;
}