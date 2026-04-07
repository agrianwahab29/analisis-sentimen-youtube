"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AnalysisResultView } from "@/components/dashboard/analysis-result-view";
import { PostAnalysisModal } from "@/components/dashboard/post-analysis-modal";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { AnalysisResult, AnalysisComment } from "@/lib/types/analysis-result";

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url");
  const isPremium = searchParams.get("premium") === "true";

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDemoWarning, setShowDemoWarning] = useState(false);
  
  // Post-analysis modal states
  const [showPostAnalysisModal, setShowPostAnalysisModal] = useState(false);
  const [allComments, setAllComments] = useState<AnalysisComment[] | undefined>(undefined);
  const [analysisId, setAnalysisId] = useState<string | undefined>(undefined);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!url) {
      setError("URL video tidak ditemukan");
      setLoading(false);
      return;
    }

    const analyzeVideo = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, isPremium }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Gagal menganalisis video");
        }

        const data = await response.json();
        setResult(data as AnalysisResult);
        
        // Store all comments and analysis ID for export
        if (data.allComments) {
          setAllComments(data.allComments);
        }
        if (data.analysisId) {
          setAnalysisId(data.analysisId);
        }

        if (data.demo) {
          setShowDemoWarning(true);
        }

        // Show post-analysis modal if > 100 comments and not demo mode
        if (data.sentimentStats?.total > 100 && !data.demo) {
          setShowPostAnalysisModal(true);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : null;
        setError(message || "Terjadi kesalahan saat menganalisis video");
      } finally {
        setLoading(false);
      }
    };

    analyzeVideo();
  }, [url, isPremium]);

  // Generate HTML export content
  const generateHTMLExport = (result: AnalysisResult, allCommentsData?: AnalysisComment[]): string => {
    const commentsToExport = allCommentsData || result.comments;
    const exportDate = new Date().toLocaleString("id-ID");
    
    return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analisis VidSense - ${result.videoInfo.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px; border-radius: 16px; margin-bottom: 30px; }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { opacity: 0.9; }
        .video-info { display: flex; gap: 20px; background: white; padding: 20px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .video-thumbnail { width: 240px; height: 135px; object-fit: cover; border-radius: 8px; }
        .video-details { flex: 1; }
        .video-title { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #0f172a; }
        .video-channel { color: #64748b; margin-bottom: 12px; }
        .video-stats { display: flex; gap: 20px; font-size: 14px; color: #64748b; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 24px; border-radius: 12px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-card.positive { border-top: 4px solid #10b981; }
        .stat-card.negative { border-top: 4px solid #ef4444; }
        .stat-card.neutral { border-top: 4px solid #64748b; }
        .stat-label { font-size: 14px; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-value { font-size: 36px; font-weight: 700; margin-bottom: 4px; }
        .stat-value.positive { color: #10b981; }
        .stat-value.negative { color: #ef4444; }
        .stat-value.neutral { color: #64748b; }
        .stat-percentage { font-size: 14px; color: #94a3b8; }
        .section { background: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .section-title { font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        .ai-insight { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .ai-insight h3 { color: #1e40af; margin-bottom: 12px; }
        .ai-insight ul { list-style: none; padding-left: 0; }
        .ai-insight li { padding: 8px 0; padding-left: 24px; position: relative; }
        .ai-insight li:before { content: "→"; position: absolute; left: 0; color: #3b82f6; }
        .comments-table { width: 100%; border-collapse: collapse; }
        .comments-table th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
        .comments-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
        .comments-table tr:hover { background: #f8fafc; }
        .sentiment-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .sentiment-badge.positive { background: #d1fae5; color: #065f46; }
        .sentiment-badge.negative { background: #fee2e2; color: #991b1b; }
        .sentiment-badge.neutral { background: #f1f5f9; color: #475569; }
        .comment-text { font-size: 14px; color: #334155; margin-bottom: 6px; line-height: 1.5; }
        .comment-author { font-size: 12px; color: #94a3b8; }
        .likes-count { font-size: 14px; color: #64748b; font-weight: 500; }
        .export-info { background: #f8fafc; padding: 20px; border-radius: 8px; font-size: 13px; color: #64748b; }
        .export-info strong { color: #334155; }
        .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 13px; }
        .wordcloud { display: flex; flex-wrap: wrap; gap: 12px; padding: 20px; }
        .wordcloud-item { background: #e0e7ff; color: #3730a3; padding: 8px 16px; border-radius: 20px; font-size: 14px; }
        @media print {
            .header { background: #1e40af !important; -webkit-print-color-adjust: exact; }
            .stat-card { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>VidSense AI Analysis Report</h1>
            <p>Export generated on ${exportDate}</p>
        </div>

        <div class="video-info">
            <img src="${result.videoInfo.thumbnail}" alt="${result.videoInfo.title}" class="video-thumbnail">
            <div class="video-details">
                <div class="video-title">${result.videoInfo.title}</div>
                <div class="video-channel">${result.videoInfo.channelTitle}</div>
                <div class="video-stats">
                    <span>${result.videoInfo.totalComments.toLocaleString("id-ID")} komentar</span>
                    <span>${result.videoInfo.viewCount.toLocaleString("id-ID")} views</span>
                    <span>${result.videoInfo.likeCount.toLocaleString("id-ID")} likes</span>
                </div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card positive">
                <div class="stat-label">Positif</div>
                <div class="stat-value positive">${result.sentimentStats.positive.toLocaleString("id-ID")}</div>
                <div class="stat-percentage">${result.percentages.positive}%</div>
            </div>
            <div class="stat-card negative">
                <div class="stat-label">Negatif</div>
                <div class="stat-value negative">${result.sentimentStats.negative.toLocaleString("id-ID")}</div>
                <div class="stat-percentage">${result.percentages.negative}%</div>
            </div>
            <div class="stat-card neutral">
                <div class="stat-label">Netral</div>
                <div class="stat-value neutral">${result.sentimentStats.neutral.toLocaleString("id-ID")}</div>
                <div class="stat-percentage">${result.percentages.neutral}%</div>
            </div>
        </div>

        ${result.aiInsight ? `
        <div class="section">
            <h2 class="section-title">AI Insight</h2>
            <div class="ai-insight">
                <h3>Ringkasan</h3>
                <p>${result.aiInsight.summary}</p>
            </div>
            <div class="ai-insight">
                <h3>Keluhan Utama</h3>
                <ul>
                    ${result.aiInsight.complaints.map(c => `<li>${c}</li>`).join("\n                    ")}
                </ul>
            </div>
            <div class="ai-insight">
                <h3>Saran Perbaikan</h3>
                <ul>
                    ${result.aiInsight.suggestions.map(s => `<li>${s}</li>`).join("\n                    ")}
                </ul>
            </div>
        </div>
        ` : ""}

        <div class="section">
            <h2 class="section-title">Word Cloud</h2>
            <div class="wordcloud">
                ${result.wordCloud.slice(0, 20).map(w => `<span class="wordcloud-item">${w.text} (${w.value})</span>`).join(" ")}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Semua Komentar (${commentsToExport.length.toLocaleString("id-ID")})</h2>
            <table class="comments-table">
                <thead>
                    <tr>
                        <th style="width: 60%">Komentar</th>
                        <th style="width: 20%">Sentimen</th>
                        <th style="width: 20%; text-align: right">Likes</th>
                    </tr>
                </thead>
                <tbody>
                    ${commentsToExport.map(c => `
                    <tr>
                        <td>
                            <div class="comment-text">${c.text}</div>
                            <div class="comment-author">@${c.author}</div>
                        </td>
                        <td>
                            <span class="sentiment-badge ${c.sentiment}">
                                ${c.sentiment === "positive" ? "Positif" : c.sentiment === "negative" ? "Negatif" : "Netral"}
                            </span>
                        </td>
                        <td style="text-align: right">
                            <span class="likes-count">${c.likes.toLocaleString("id-ID")}</span>
                        </td>
                    </tr>
                    `).join("\n                    ")}
                </tbody>
            </table>
        </div>

        <div class="export-info">
            <strong>Export Information:</strong><br>
            Format: HTML Report<br>
            Exported at: ${exportDate}<br>
            Total Comments: ${commentsToExport.length.toLocaleString("id-ID")}<br>
            Sample Comments (UI): ${result.comments.length.toLocaleString("id-ID")}<br>
            Credits Used: ${result.creditsUsed}
        </div>

        <div class="footer">
            <p>Generated by VidSense AI - YouTube Sentiment Analysis</p>
            <p style="margin-top: 8px; font-size: 11px;">This report is for informational purposes only.</p>
        </div>
    </div>
</body>
</html>`;
  };

  const handleExport = (format: "json" | "html") => {
    if (!result) return;
    
    setIsExporting(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const exportDate = new Date().toISOString();
      const commentsToExport = allComments || result.comments;
      
      if (format === "json") {
        const exportData = {
          videoInfo: result.videoInfo,
          sentimentStats: result.sentimentStats,
          percentages: result.percentages,
          creditsUsed: result.creditsUsed,
          aiInsight: result.aiInsight,
          wordCloud: result.wordCloud,
          comments: commentsToExport,
          exportInfo: {
            format: "json",
            exportedAt: exportDate,
            totalComments: commentsToExport.length,
            sampleComments: result.comments.length,
          },
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
        const exportFileDefaultName = `analysis-${result.videoInfo.id}-${new Date().toISOString().split("T")[0]}.json`;
        
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
      } else {
        const htmlContent = generateHTMLExport(result, commentsToExport);
        const dataUri = "data:text/html;charset=utf-8," + encodeURIComponent(htmlContent);
        const exportFileDefaultName = `analysis-${result.videoInfo.id}-${new Date().toISOString().split("T")[0]}.html`;
        
        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
      }
      
      setIsExporting(false);
    }, 500);
  };

  const handleStay = () => {
    setShowPostAnalysisModal(false);
  };

  const handleExit = async () => {
    if (!analysisId) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/history/${analysisId}/delete`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        // Successfully deleted, redirect to dashboard
        router.push("/dashboard/main");
      } else {
        const data = await response.json();
        console.error("Failed to delete analysis:", data.error);
        // Even if delete fails, still close modal and let user continue
        setShowPostAnalysisModal(false);
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
      setShowPostAnalysisModal(false);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Menganalisis Komentar...</h2>
            <p className="text-slate-500">
              Mohon tunggu sebentar, AI sedang membaca dan menganalisis sentimen komentar
            </p>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Analisis Gagal</h2>
            <p className="text-slate-500 mb-6">{error || "Terjadi kesalahan"}</p>
            <Link
              href="/dashboard/main"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Dashboard
            </Link>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <AnalysisResultView
        result={result}
        backHref="/dashboard/main"
        demoWarning={
          showDemoWarning && result.message
            ? { message: result.message, onDismiss: () => setShowDemoWarning(false) }
            : null
        }
        demoBadge={result.demoBadge || null}
        allComments={allComments}
      />

      <PostAnalysisModal
        isOpen={showPostAnalysisModal}
        result={result}
        analysisId={analysisId}
        allComments={allComments}
        onExport={handleExport}
        onStay={handleStay}
        onExit={handleExit}
        isExporting={isExporting}
        isDeleting={isDeleting}
      />
    </>
  );
}

export default function AnalysisResultsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Memuat...</h2>
          </div>
        </DashboardLayout>
      }
    >
      <AnalysisContent />
    </Suspense>
  );
}
