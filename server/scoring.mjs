import { ROUND1_QUESTION_COUNT, keyFor } from "./answerKey.mjs";

const OPTION_PATTERN = /^[ABCD]$/;

export function scoreRound1(rawAnswers) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
  const chosen = new Map();

  for (const entry of answers) {
    if (!entry || typeof entry !== "object") continue;
    const qNo = entry.qNo;
    if (!Number.isInteger(qNo)) continue;
    if (qNo < 1 || qNo > ROUND1_QUESTION_COUNT) continue;
    if (keyFor(qNo) === null) continue;

    const option = typeof entry.option === "string" ? entry.option.trim().toUpperCase() : "";
    if (!OPTION_PATTERN.test(option)) continue;

    chosen.set(qNo, option);
  }

  let qCorrect = 0;
  for (const [qNo, option] of chosen) {
    if (option === keyFor(qNo)) qCorrect += 1;
  }

  const qAttended = chosen.size;
  return { qAttended, qCorrect, score: qCorrect };
}

export function clampFinishSeconds(value, maxSeconds) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return maxSeconds;
  const floor = Math.ceil(numeric);
  if (floor < 0) return 0;
  if (floor > maxSeconds) return maxSeconds;
  return floor;
}
