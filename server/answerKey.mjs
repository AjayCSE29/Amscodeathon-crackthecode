const KEY = "CCCBBCBCCCCBBCABCCCABBCBACBBCCCBBBBBBBBBAAAACACBABBAAAACCBBB";

export const ROUND1_QUESTION_COUNT = 60;

if (KEY.length !== ROUND1_QUESTION_COUNT) {
  throw new Error(`ANSWER_KEY must be ${ROUND1_QUESTION_COUNT} characters, got ${KEY.length}`);
}

export function keyFor(qNo) {
  if (!Number.isInteger(qNo)) return null;
  if (qNo < 1 || qNo > ROUND1_QUESTION_COUNT) return null;
  return KEY[qNo - 1];
}

export function answerKey() {
  return KEY;
}
