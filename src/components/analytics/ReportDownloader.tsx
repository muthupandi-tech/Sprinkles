"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

interface ReportDownloaderProps {
  progress: any;
  recommendations: any[];
}

export default function ReportDownloader({ progress, recommendations }: ReportDownloaderProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("report-content");
      if (!element) return;

      // Briefly show the element to capture it
      element.style.display = "block";

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Sprinkles_Performance_Report.pdf");

      // Hide it again
      element.style.display = "none";
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Export PDF Report</span>
      </button>

      {/* Hidden Report Template to be captured by html2canvas */}
      <div
        id="report-content"
        className="absolute top-[-9999px] left-[-9999px] w-[800px] bg-white p-12 text-gray-900"
        style={{ display: "none" }}
      >
        <div className="mb-8 border-b pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Sprinkles Performance Report</h1>
          </div>
          <p className="mt-2 text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-xl font-bold text-gray-800">Skill Overview</h2>
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-6">
            <div>
              <p className="text-sm text-gray-500">Overall Score</p>
              <p className="text-3xl font-bold text-blue-600">
                {progress.overallScore.toFixed(0)}/100
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Practice Time</p>
              <p className="text-3xl font-bold text-gray-900">{progress.totalPracticeTime} mins</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Speaking Score</p>
              <p className="text-xl font-bold text-gray-900">{progress.speakingScore.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vocabulary Score</p>
              <p className="text-xl font-bold text-gray-900">
                {progress.vocabularyScore.toFixed(0)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-800">AI Recommendations</h2>
          <ul className="list-disc space-y-3 pl-5 text-gray-700">
            {recommendations.length > 0 ? (
              recommendations.map((rec, i) => (
                <li key={i} className="leading-relaxed">
                  {rec.content}
                </li>
              ))
            ) : (
              <li>Keep practicing to generate personalized insights!</li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
