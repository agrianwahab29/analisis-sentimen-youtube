#!/usr/bin/env node
/**
 * Update status issue di Linear via API.
 *
 * Setup:
 *   1. Pastikan LINEAR_API_KEY sudah di-set di .env.local
 *   2. Jalankan: npm run linear:update -- --help
 *
 * Commands:
 *   npm run linear:update -- --list                    # List semua issue
 *   npm run linear:update -- --status-done AGR-25      # Update AGR-25 ke Done
 *   npm run linear:update -- --status-progress AGR-6  # Update AGR-6 ke In Progress
 *   npm run linear:update -- --comment AGR-25 "Fix sudah di-deploy"  # Tambah komentar
 *   npm run linear:update -- --batch-done AGR-21,AGR-22,AGR-25     # Batch update ke Done
 *
 * Jangan commit API key.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const envLocal = resolve(root, ".env.local");

// Load environment variables
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

// Parse command line arguments
const args = process.argv.slice(2);
const help = args.includes("--help") || args.includes("-h");
const listMode = args.includes("--list") || args.includes("-l");

// Find argument values
const statusDoneIndex = args.indexOf("--status-done");
const statusDone = statusDoneIndex !== -1 ? args[statusDoneIndex + 1] : null;

const statusProgressIndex = args.indexOf("--status-progress");
const statusProgress = statusProgressIndex !== -1 ? args[statusProgressIndex + 1] : null;

const statusBacklogIndex = args.indexOf("--status-backlog");
const statusBacklog = statusBacklogIndex !== -1 ? args[statusBacklogIndex + 1] : null;

const commentIndex = args.indexOf("--comment");
const commentId = commentIndex !== -1 ? args[commentIndex + 1] : null;
const commentText = commentIndex !== -1 ? args[commentIndex + 2] : null;

const batchDoneIndex = args.indexOf("--batch-done");
const batchDone = batchDoneIndex !== -1 ? args[batchDoneIndex + 1] : null;

if (help) {
  console.log(`
Usage: npm run linear:update [options]

Options:
  --list, -l                    List semua issue dengan status
  --status-done <identifier>    Update issue ke status Done (contoh: AGR-25)
  --status-progress <id>        Update issue ke status In Progress
  --status-backlog <id>         Update issue ke status Backlog
  --comment <id> "<text>"         Tambah komentar ke issue
  --batch-done <id1,id2,id3>    Update multiple issue ke Done sekaligus
  --help, -h                    Show this help

Examples:
  npm run linear:update -- --list
  npm run linear:update -- --status-done AGR-25
  npm run linear:update -- --status-progress AGR-6
  npm run linear:update -- --comment AGR-25 "Fix sudah di-deploy ke production"
  npm run linear:update -- --batch-done AGR-21,AGR-22,AGR-25
`);
  process.exit(0);
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

async function getTeamId(apiKey) {
  const teamId = process.env.LINEAR_TEAM_ID?.trim();
  if (teamId) return teamId;

  const q = `query { teams { nodes { id name key } } }`;
  const data = await gql(apiKey, q);
  if (!data.teams.nodes.length) {
    throw new Error("Tidak ada tim di workspace Linear");
  }
  return data.teams.nodes[0].id;
}

async function getWorkflowStates(apiKey, teamId) {
  const q = `
    query($teamId: String!) {
      team(id: $teamId) {
        states {
          nodes {
            id
            name
            color
          }
        }
      }
    }
  `;
  const data = await gql(apiKey, q, { teamId });
  return data.team?.states?.nodes || [];
}

async function listIssues(apiKey, teamId) {
  const q = `
    query {
      issues(
        filter: { team: { id: { eq: "${teamId}" } } }
        first: 100
      ) {
        nodes {
          id
          identifier
          title
          state {
            name
            color
          }
          assignee {
            name
          }
          createdAt
          url
        }
      }
    }
  `;
  const data = await gql(apiKey, q);
  return data.issues?.nodes || [];
}

async function updateIssueStatus(apiKey, issueId, stateId) {
  const q = `
    mutation($id: String!, $stateId: String!) {
      issueUpdate(id: $id, input: { stateId: $stateId }) {
        success
        issue {
          identifier
          title
          state {
            name
          }
        }
      }
    }
  `;
  const data = await gql(apiKey, q, { id: issueId, stateId });
  return data.issueUpdate;
}

async function addComment(apiKey, issueId, text) {
  const q = `
    mutation($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment {
          id
          body
        }
      }
    }
  `;
  const data = await gql(apiKey, q, {
    input: { issueId, body: text },
  });
  return data.commentCreate;
}

async function findIssueByIdentifier(apiKey, teamId, identifier) {
  const issues = await listIssues(apiKey, teamId);
  return issues.find((issue) => issue.identifier === identifier);
}

async function main() {
  const apiKey = process.env.LINEAR_API_KEY?.trim();
  if (!apiKey) {
    console.error("❌ LINEAR_API_KEY tidak di-set di .env.local");
    console.error("   Linear → Settings → Security & Access → Personal API keys");
    process.exit(1);
  }

  const teamId = await getTeamId(apiKey);
  const states = await getWorkflowStates(apiKey, teamId);

  // Find state IDs
  const stateMap = {};
  states.forEach((state) => {
    stateMap[state.name.toLowerCase()] = state.id;
  });

  // List mode
  if (listMode) {
    console.log("\n📋 Daftar Issue di Linear:\n");
    const issues = await listIssues(apiKey, teamId);

    // Group by status
    const grouped = {};
    issues.forEach((issue) => {
      const status = issue.state?.name || "Unknown";
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(issue);
    });

    Object.entries(grouped).forEach(([status, items]) => {
      console.log(`\n${status} (${items.length}):`);
      items.forEach((issue) => {
        const assignee = issue.assignee ? `(@${issue.assignee.name})` : "(unassigned)";
        console.log(`  ${issue.identifier}: ${issue.title} ${assignee}`);
      });
    });

    console.log(`\n✅ Total: ${issues.length} issue\n`);
    return;
  }

  // Single status update
  if (statusDone || statusProgress || statusBacklog) {
    const identifier = statusDone || statusProgress || statusBacklog;
    const targetState = statusDone
      ? "done"
      : statusProgress
      ? "in progress"
      : "backlog";

    console.log(`🔍 Mencari issue ${identifier}...`);
    const issue = await findIssueByIdentifier(apiKey, teamId, identifier);

    if (!issue) {
      console.error(`❌ Issue ${identifier} tidak ditemukan`);
      process.exit(1);
    }

    const stateId = stateMap[targetState];
    if (!stateId) {
      console.error(`❌ Status "${targetState}" tidak ditemukan`);
      console.error(`   Available states: ${Object.keys(stateMap).join(", ")}`);
      process.exit(1);
    }

    console.log(`📝 Updating ${identifier} ke "${targetState}"...`);
    const result = await updateIssueStatus(apiKey, issue.id, stateId);

    if (result.success) {
      console.log(`✅ ${identifier}: ${result.issue.title}`);
      console.log(`   Status: ${result.issue.state.name}\n`);
    } else {
      console.error(`❌ Gagal update ${identifier}`);
      process.exit(1);
    }
    return;
  }

  // Batch update
  if (batchDone) {
    const identifiers = batchDone.split(",").map((id) => id.trim());
    const stateId = stateMap["done"];

    if (!stateId) {
      console.error('❌ Status "done" tidak ditemukan');
      process.exit(1);
    }

    console.log(`📝 Batch update ${identifiers.length} issue ke Done...\n`);

    for (const identifier of identifiers) {
      const issue = await findIssueByIdentifier(apiKey, teamId, identifier);
      if (!issue) {
        console.error(`⚠️  ${identifier}: tidak ditemukan (skip)`);
        continue;
      }

      const result = await updateIssueStatus(apiKey, issue.id, stateId);
      if (result.success) {
        console.log(`✅ ${identifier}: ${result.issue.title}`);
      } else {
        console.error(`❌ ${identifier}: gagal update`);
      }
    }

    console.log("\n🎉 Batch update selesai!\n");
    return;
  }

  // Add comment
  if (commentIndex !== -1) {
    if (!commentId || !commentText) {
      console.error("❌ Format: --comment <identifier> \"<text>\"");
      process.exit(1);
    }

    console.log(`🔍 Mencari issue ${commentId}...`);
    const issue = await findIssueByIdentifier(apiKey, teamId, commentId);

    if (!issue) {
      console.error(`❌ Issue ${commentId} tidak ditemukan`);
      process.exit(1);
    }

    console.log(`💬 Menambah komentar ke ${commentId}...`);
    const result = await addComment(apiKey, issue.id, commentText.replace(/^"|"$/g, ""));

    if (result.success) {
      console.log(`✅ Komentar ditambahkan ke ${commentId}\n`);
    } else {
      console.error(`❌ Gagal menambah komentar`);
      process.exit(1);
    }
    return;
  }

  console.log("ℹ️  Gunakan --help untuk melihat cara penggunaan");
}

main().catch((e) => {
  console.error("❌ Error:", e.message || e);
  process.exit(1);
});
