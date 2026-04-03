-- Store full analysis UI payload for reopening history detail in the dashboard.

ALTER TABLE analysis_history
  ADD COLUMN IF NOT EXISTS result_snapshot JSONB;

COMMENT ON COLUMN analysis_history.result_snapshot IS
  'Snapshot of analysis result (videoInfo, sentimentStats, percentages, comments sample, wordCloud, aiInsight, creditsUsed) for /dashboard/history/[id].';
