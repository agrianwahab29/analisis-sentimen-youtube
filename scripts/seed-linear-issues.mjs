#!/usr/bin/env node
/**
 * Buat project + issue di Linear dari backlog lokal.
 *
 * Setup:
 *   1. Linear → Settings → API → buat Personal API Key
 *   2. Simpan di .env.local (hanya baris LINEAR_* akan dibaca oleh skrip ini), atau:
 *      PowerShell: $env:LINEAR_API_KEY="lin_api_..."
 *      Opsional: LINEAR_TEAM_ID=uuid  (tanpa ini → tim pertama di workspace)
 *
 * Jalankan:
 *   npm run linear:seed:dry   (daftar issue lokal; tanpa API key)
 *   npm run linear:seed       (butuh LINEAR_API_KEY — buat project + 22 issue)
 *
 * Jangan commit API key.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ISSUES, PROJECT_NAMES } from "./linear-backlog-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envLocal = resolve(root, ".env.local");
if (existsSync(envLocal)) {
  const text = readFileSync(envLocal, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^LINEAR_(API_KEY|TEAM_ID)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2].trim().replace(/^["']|["']$/g, "");
    const envKey = `LINEAR_${m[1]}`;
    if (!process.env[envKey]) process.env[envKey] = val;
  }
}

const LINEAR_API = "https://api.linear.app/graphql";
const dryRun = process.argv.includes("--dry-run");

function printLocalBacklogOnly() {
  console.log(`Backlog lokal: ${ISSUES.length} issue\n`);
  for (const row of ISSUES) {
    const p = PROJECT_NAMES[row.projectKey];
    console.log(`[${p}] ${row.title}`);
  }
  console.log(
    "\nSet LINEAR_API_KEY lalu jalankan tanpa --dry-run untuk membuat di Linear."
  );
}

async function gql(apiKey, query, variables = {}) {
  const res = await fetch(LINEAR_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    const msg = json.errors.map((e) => e.message).join("; ");
    throw new Error(msg);
  }
  return json.data;
}

async function listTeams(apiKey) {
  const q = `query { teams { nodes { id name key } } }`;
  const data = await gql(apiKey, q);
  return data.teams.nodes;
}

async function listTeamProjects(apiKey, teamId) {
  const q = `
    query ($teamId: String!) {
      team(id: $teamId) {
        projects { nodes { id name } }
      }
    }
  `;
  const data = await gql(apiKey, q, { teamId });
  return data.team?.projects?.nodes ?? [];
}

async function createProject(apiKey, teamId, name) {
  const q = `
    mutation ($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        success
        project { id name }
      }
    }
  `;
  const data = await gql(apiKey, q, {
    input: { name, teamIds: [teamId] },
  });
  if (!data.projectCreate?.success)
    throw new Error(`Gagal buat project: ${name}`);
  return data.projectCreate.project.id;
}

async function createIssue(apiKey, teamId, projectId, title, description) {
  const q = `
    mutation ($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue { identifier title url }
      }
    }
  `;
  const input = {
    teamId,
    title,
    description,
    projectId,
  };
  const data = await gql(apiKey, q, { input });
  if (!data.issueCreate?.success)
    throw new Error(`Gagal buat issue: ${title}`);
  return data.issueCreate.issue;
}

function uniqProjectTitles() {
  return [...new Set(Object.values(PROJECT_NAMES))];
}

async function ensureProjects(apiKey, teamId) {
  const existing = await listTeamProjects(apiKey, teamId);
  const byName = new Map(existing.map((p) => [p.name, p.id]));
  const map = {};
  for (const title of uniqProjectTitles()) {
    if (byName.has(title)) {
      map[title] = byName.get(title);
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] would create project: ${title}`);
      map[title] = `(dry-run-${title})`;
      continue;
    }
    const id = await createProject(apiKey, teamId, title);
    byName.set(title, id);
    map[title] = id;
    console.log(`Created project: ${title} → ${id}`);
  }
  return map;
}

async function main() {
  const apiKey = process.env.LINEAR_API_KEY?.trim();
  if (!apiKey) {
    if (dryRun) {
      printLocalBacklogOnly();
      process.exit(0);
    }
    console.error(
      "Set LINEAR_API_KEY (Linear → Settings → API) atau tambahkan ke .env.local"
    );
    process.exit(1);
  }

  let teamId = process.env.LINEAR_TEAM_ID?.trim();
  if (!teamId) {
    const teams = await listTeams(apiKey);
    if (!teams.length) {
      console.error("Tidak ada tim di workspace Linear.");
      process.exit(1);
    }
    teamId = teams[0].id;
    console.log(
      `LINEAR_TEAM_ID tidak di-set → memakai tim pertama: "${teams[0].name}" (${teamId})`
    );
    console.log(
      "Untuk tim lain, set LINEAR_TEAM_ID atau jalankan dengan env tersebut."
    );
  }

  const projectIdByTitle = await ensureProjects(apiKey, teamId);

  for (const row of ISSUES) {
    const projTitle = PROJECT_NAMES[row.projectKey];
    const projectId = projectIdByTitle[projTitle];
    if (dryRun) {
      console.log(`[dry-run] issue: [${projTitle}] ${row.title}`);
      continue;
    }
    const issue = await createIssue(
      apiKey,
      teamId,
      projectId,
      row.title,
      row.description
    );
    console.log(`Created ${issue.identifier}: ${issue.title}\n  ${issue.url}`);
  }

  console.log(
    dryRun
      ? `\nDry-run selesai (${ISSUES.length} issue). Jalankan tanpa --dry-run untuk membuat.`
      : `\nSelesai: ${ISSUES.length} issue dibuat.`
  );
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
