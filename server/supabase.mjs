const baseUrl = (process.env.SUPABASE_URL ?? "").replace(/\/+$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isConfigured() {
  return baseUrl.length > 0 && serviceRoleKey.length > 0;
}

function headers(extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function request(path, { method = "GET", body, prefer, accept, signal, missingAsNull } = {}) {
  const extra = {};
  if (prefer) extra.Prefer = prefer;
  if (accept) extra.Accept = accept;
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method,
    headers: headers(extra),
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });
  if (missingAsNull && response.status === 406) return null;
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`supabase ${method} ${path} -> ${response.status} ${detail.slice(0, 400)}`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  if (text.length === 0) return null;
  return JSON.parse(text);
}

export async function findUserByTeamName(teamName) {
  const params = new URLSearchParams({
    team_name: `eq.${teamName}`,
    select: "user_id,team_name,hashed_password",
    limit: "1",
  });
  return request(`users?${params}`, {
    accept: "application/vnd.pgrst.object+json",
    missingAsNull: true,
  });
}

export async function findUserById(userId) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: "user_id,team_name",
    limit: "1",
  });
  return request(`users?${params}`, {
    accept: "application/vnd.pgrst.object+json",
    missingAsNull: true,
  });
}

export async function replaceRound1Answers(userId, rows) {
  await request(`round1_answers?user_id=eq.${encodeURIComponent(userId)}`, { method: "DELETE" });
  if (rows.length === 0) return;
  await request("round1_answers", {
    method: "POST",
    body: rows,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function upsertRound1Result(row) {
  await request("round1_results", {
    method: "POST",
    body: [row],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function upsertRound2Submissions(rows) {
  if (rows.length === 0) return;
  await request("round2_submissions", {
    method: "POST",
    body: rows,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function upsertRound2Result(row) {
  await request("round2_results", {
    method: "POST",
    body: [row],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function upsertRound3Submissions(rows) {
  if (rows.length === 0) return;
  await request("round3_submissions", {
    method: "POST",
    body: rows,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function upsertRound3Result(row) {
  await request("round3_results", {
    method: "POST",
    body: [row],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function listTeams() {
  const params = new URLSearchParams({
    select: "user_id,team_name,is_active",
    order: "team_name",
  });
  return request(`users?${params}`);
}

export async function createUser(row) {
  await request("users", {
    method: "POST",
    body: [row],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function updateUser(userId, fields) {
  const path = `users?user_id=eq.${encodeURIComponent(userId)}`;
  await request(path, { method: "PATCH", body: fields, prefer: "return=minimal" });
}

export async function deleteUser(userId) {
  const path = `users?user_id=eq.${encodeURIComponent(userId)}`;
  await request(path, { method: "DELETE", prefer: "return=minimal" });
}

export async function resetAllResults() {
  const tables = [
    "round1_answers",
    "round1_crosschecks",
    "round1_results",
    "round2_submissions",
    "round2_results",
    "round3_submissions",
    "round3_results",
  ];
  const cleared = {};
  for (const table of tables) {
    const rows = await request(`${table}?user_id=not.is.null`, {
      method: "DELETE",
      prefer: "return=representation",
    });
    cleared[table] = Array.isArray(rows) ? rows.length : 0;
  }
  return cleared;
}

export async function listRound1Summary() {
  const params = new URLSearchParams({
    select: "user_id,team_name,q_attended,q_correct,score,finish_seconds,finished_at",
    order: "score.desc",
  });
  return request(`round1_summary?${params}`);
}

export async function listRound1Answers() {
  const params = new URLSearchParams({ select: "user_id,q_no,option", order: "user_id,q_no" });
  return request(`round1_answers?${params}`);
}

export async function listRound1Crosschecks() {
  const params = new URLSearchParams({ select: "user_id,gemini_score,gemini_correct,status", order: "user_id" });
  return request(`round1_crosschecks?${params}`);
}

export async function upsertRound1Crosscheck(row) {
  await request("round1_crosschecks", {
    method: "POST",
    body: [row],
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function getRound1Result(userId) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: "user_id",
    limit: "1",
  });
  return request(`round1_results?${params}`, {
    accept: "application/vnd.pgrst.object+json",
    missingAsNull: true,
  });
}

export async function countRound1Results() {
  const rows = await request("round1_results?select=user_id");
  return Array.isArray(rows) ? rows.length : 0;
}

export async function countRound2Results() {
  const rows = await request("round2_results?select=user_id");
  return Array.isArray(rows) ? rows.length : 0;
}

export async function listRound1ResultsRecent() {
  const params = new URLSearchParams({
    select: "user_id,finish_seconds,finished_at",
    order: "finished_at.desc.nullslast",
    limit: "5",
  });
  return request(`round1_results?${params}`);
}

export async function listRound2ResultsRecent() {
  const params = new URLSearchParams({
    select: "user_id,finish_seconds,finished_at",
    order: "finished_at.desc.nullslast",
    limit: "5",
  });
  return request(`round2_results?${params}`);
}

export async function listRound3Standings() {
  const params = new URLSearchParams({ select: "*", order: "total_score.desc" });
  return request(`round3_standings?${params}`);
}

export async function listRound3Submissions(userId = null) {
  const params = new URLSearchParams({ select: "*", order: "user_id,q_no" });
  if (userId) params.set("user_id", `eq.${userId}`);
  return request(`round3_submissions?${params}`);
}

export async function getRound3Submission(userId, qNo) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    q_no: `eq.${qNo}`,
    select: "*",
    limit: "1",
  });
  return request(`round3_submissions?${params}`, {
    accept: "application/vnd.pgrst.object+json",
    missingAsNull: true,
  });
}

export async function listPendingRound3Submissions() {
  const params = new URLSearchParams({
    select: "user_id,q_no,language,program,output,stderr,exit_code,is_hint,is_right",
    is_right: "is.null",
    order: "user_id,q_no",
  });
  return request(`round3_submissions?${params}`);
}

export async function setRound3IsRight(userId, qNo, isRight) {
  const path = `round3_submissions?user_id=eq.${encodeURIComponent(userId)}&q_no=eq.${Number(qNo)}`;
  await request(path, { method: "PATCH", body: { is_right: isRight }, prefer: "return=minimal" });
}

export async function countRound3Results() {
  const rows = await request("round3_results?select=user_id");
  return Array.isArray(rows) ? rows.length : 0;
}

export async function listRound3ResultsRecent() {
  const params = new URLSearchParams({
    select: "user_id,finish_seconds,finished_at",
    order: "finished_at.desc.nullslast",
    limit: "5",
  });
  return request(`round3_results?${params}`);
}

export async function listRound2Standings() {
  const params = new URLSearchParams({ select: "*", order: "total_score.desc" });
  return request(`round2_standings?${params}`);
}

export async function listRound2Submissions(userId = null) {
  const params = new URLSearchParams({ select: "*", order: "user_id,q_no" });
  if (userId) params.set("user_id", `eq.${userId}`);
  return request(`round2_submissions?${params}`);
}

export async function getRound2Submission(userId, qNo) {
  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    q_no: `eq.${qNo}`,
    select: "*",
    limit: "1",
  });
  return request(`round2_submissions?${params}`, {
    accept: "application/vnd.pgrst.object+json",
    missingAsNull: true,
  });
}

export async function listPendingRound2Submissions() {
  const params = new URLSearchParams({
    select: "user_id,q_no,language,program,output,stderr,exit_code,is_hint,is_right",
    is_right: "is.null",
    order: "user_id,q_no",
  });
  return request(`round2_submissions?${params}`);
}

export async function setRound2IsRight(userId, qNo, isRight) {
  const path = `round2_submissions?user_id=eq.${encodeURIComponent(userId)}&q_no=eq.${Number(qNo)}`;
  await request(path, { method: "PATCH", body: { is_right: isRight }, prefer: "return=minimal" });
}


