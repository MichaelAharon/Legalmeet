'use client';

import { useState } from 'react';
import { useAnalyzeNDA } from '@/hooks/useNDAAnalysis';
import { Shield, AlertTriangle, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';

const riskColors: Record<string, { bg: string; text: string; icon: any }> = {
  low: { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  medium: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', icon: AlertTriangle },
  high: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-600 dark:text-red-400', icon: AlertCircle },
  critical: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-400', icon: AlertCircle },
};

interface ClauseRiskAnalyzerProps {
  ndaContent: string;
  meetingId?: string;
  templateId?: string;
}

export function ClauseRiskAnalyzer({ ndaContent, meetingId, templateId }: ClauseRiskAnalyzerProps) {
  const analyzeNDA = useAnalyzeNDA();
  const [analysis, setAnalysis] = useState<any>(null);

  async function handleAnalyze() {
    const result = await analyzeNDA.mutateAsync({ ndaContent, meetingId, templateId });
    setAnalysis(result);
  }

  if (!analysis) {
    return (
      <div className="text-center py-6">
        <Shield className="h-10 w-10 mx-auto text-slate-400 mb-3" />
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Analyze this NDA for potential risks and missing clauses</p>
        <button
          onClick={handleAnalyze}
          disabled={analyzeNDA.isPending || !ndaContent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          {analyzeNDA.isPending ? 'Analyzing...' : 'Analyze NDA'}
        </button>
      </div>
    );
  }

  const overallStyle = riskColors[analysis.overallRisk] || riskColors.low;

  return (
    <div className="space-y-4">
      {/* Overall Risk */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${overallStyle.bg}`}>
        <overallStyle.icon className={`h-5 w-5 ${overallStyle.text}`} />
        <div>
          <p className={`font-medium text-sm ${overallStyle.text}`}>Overall Risk: {analysis.overallRisk.toUpperCase()}</p>
          <p className="text-xs text-slate-500 mt-0.5">{analysis.summary}</p>
        </div>
      </div>

      {/* Risks */}
      {analysis.risks?.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Risk Analysis</h4>
          <div className="space-y-2">
            {analysis.risks.map((risk: any, i: number) => {
              const style = riskColors[risk.riskLevel] || riskColors.low;
              return (
                <div key={i} className={`p-3 rounded-lg border ${style.bg} border-slate-200 dark:border-slate-700`}>
                  <div className="flex items-start gap-2">
                    <style.icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.text}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${style.text}`}>{risk.clauseText}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500">{risk.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{risk.explanation}</p>
                      {risk.suggestion && (
                        <p className="text-xs text-indigo-500 mt-1 flex items-start gap-1">
                          <Info className="h-3 w-3 mt-0.5 shrink-0" />
                          {risk.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Clauses */}
      {analysis.missingClauses?.length > 0 && (
        <div>
          <h4 className="font-medium text-sm text-slate-700 dark:text-slate-300 mb-2">Potentially Missing Clauses</h4>
          <ul className="space-y-1">
            {analysis.missingClauses.map((clause: string, i: number) => (
              <li key={i} className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />{clause}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleAnalyze} disabled={analyzeNDA.isPending} className="text-xs text-indigo-500 hover:underline">
        Re-analyze
      </button>
    </div>
  );
}
