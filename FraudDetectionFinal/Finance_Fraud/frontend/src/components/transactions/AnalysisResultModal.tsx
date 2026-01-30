
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { jsPDF } from "jspdf";

interface AnalysisResult {
  fraud_probability: number;
  anomaly_score: number;
  is_blocked: boolean;
  risk_level: 'Low' | 'High' | 'Critical';
  reasoning: string;
  trends_analysis?: string;
}

interface AnalysisResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult | null;
  scenarioDescription?: string;
  userId?: string; // New Prop
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Critical': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
    default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  }
};

export const AnalysisResultModal = ({ isOpen, onClose, result, scenarioDescription, userId }: AnalysisResultModalProps) => {
  const { t } = useLanguage();
  const [isBlocking, setIsBlocking] = React.useState(false);
  const [blockSuccess, setBlockSuccess] = React.useState(false);

  // Dynamic Theme Logic
  const getTheme = () => {
    if (!result) return {
      color: 'emerald',
      title: t('analysis_complete'),
      icon: <ShieldCheck className="h-7 w-7 text-emerald-500" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-900/10',
      bar: 'bg-emerald-500'
    };

    if (result.is_blocked) {
      return {
        color: 'rose',
        title: t('analysis_critical'),
        icon: <ShieldAlert className="h-7 w-7 text-rose-500" />,
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/20',
        glow: 'shadow-rose-900/20',
        bar: 'bg-rose-500'
      };
    }

    if (result.risk_level === 'High' || result.risk_level === 'Critical') {
      return {
        color: 'orange',
        title: "Decision: Flagged for Review",
        icon: <AlertTriangle className="h-7 w-7 text-orange-500" />,
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        glow: 'shadow-orange-900/10',
        bar: 'bg-orange-500'
      };
    }

    return {
      color: 'emerald',
      title: t('decision_approved'),
      icon: <ShieldCheck className="h-7 w-7 text-emerald-500" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-900/5',
      bar: 'bg-emerald-500'
    };
  };

  const theme = getTheme();

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsBlocking(false);
      setBlockSuccess(false);
    }
  }, [isOpen]);

  const generateFraudReport = () => {
    if (!result) return;

    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    const incidentId = `FG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Helper to clean emojis (prevent & p artifacts)
    const cleanText = (text: string) => text.replace(/[^\x00-\x7F]/g, ''); // Simple ASCII/Printable keep for PDF safety

    // 1. HEADER BRANDING
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("FRAUDGUARD", 20, 25);
    doc.setTextColor(251, 113, 133); // rose-400
    doc.text("AI", 82, 25);

    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("ADVANCED CYBER-THREAT INVESTIGATION UNIT", 20, 33);
    doc.text(`REPORT ID: ${incidentId} | ISSUED: ${timestamp}`, 20, 38);

    // 2. EXECUTIVE SUMMARY BOX
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(20, 55, 170, 40, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("EXECUTIVE SUMMARY", 25, 63);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Target Entity   : ${userId || 'Unknown'}`, 25, 72);
    doc.text(`Event Context   : ${scenarioDescription || 'Standard Transaction'}`, 25, 78);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(225, 29, 72); // rose-600
    doc.text(`RISK ADVISORY  : ${result.risk_level.toUpperCase()} - SECURITY CLEARANCE DENIED`, 25, 87);

    // 3. TECHNICAL EVIDENCE GAUGE
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("TECHNICAL EVIDENCE LOG", 20, 110);
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.line(20, 112, 50, 112);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`- AI Fraud Probability Index:`, 25, 122);
    doc.setFont("helvetica", "bold");
    doc.text(`${(result.fraud_probability * 100).toFixed(2)}%`, 80, 122);

    doc.setFont("helvetica", "normal");
    doc.text(`- Behavioral Anomaly Score   :`, 25, 129);
    doc.setFont("helvetica", "bold");
    doc.text(`${result.anomaly_score.toFixed(4)}`, 80, 129);

    // 4. AI REASONING & INVESTIGATION INSIGHTS
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(20, 140, 170, 55, 'F'); // Reduced height

    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("AI REASONING & ANALYST INSIGHTS", 25, 148);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const reasoningText = cleanText(result.reasoning);
    const splitReasoning = doc.splitTextToSize(reasoningText, 160);
    doc.text(splitReasoning, 25, 156);

    // 5. HISTORICAL PATTERN MATCHING (Trends)
    if (result.trends_analysis) {
      doc.setFillColor(236, 254, 255); // cyan-50
      doc.setDrawColor(207, 250, 254);
      doc.rect(20, 200, 170, 40, 'FD');

      doc.setTextColor(8, 145, 178); // cyan-600
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("HISTORICAL PATTERN MATCHING & TRENDS", 25, 208);

      doc.setTextColor(22, 78, 99); // cyan-900
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const trendsText = cleanText(result.trends_analysis);
      const splitTrends = doc.splitTextToSize(trendsText, 160);
      doc.text(splitTrends, 25, 216);
    }

    // 6. SECURITY RESOLUTION
    const resY = 245;
    doc.setDrawColor(15, 23, 42);
    doc.setFillColor(255, 255, 255);
    doc.rect(20, resY, 170, 30);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("FINAL SYSTEM RESOLUTION", 25, resY + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text("Status: BLACKLISTED | Access: REVOKED | Monitoring: ACTIVE", 25, resY + 14);

    doc.setTextColor(225, 29, 72); // rose-600
    doc.setFont("helvetica", "bold");
    doc.text("Action: Entity ID synchronized with Global Distributed Blacklist.", 25, resY + 22);

    // Footer
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("This document is an automated security output and serves as legal evidence of fraud analysis conducted by FraudGuard AI Ecosystem.", 105, 285, { align: 'center' });
    doc.text("© 2026 FraudGuard Cyber-Security Unit. Confidential - Internal Use Only.", 105, 290, { align: 'center' });

    doc.save(`FraudGuard_Incident_${incidentId}.pdf`);
  };

  const handleBlockEntity = async () => {
    if (!userId) return;
    setIsBlocking(true);
    try {
      const response = await fetch("http://localhost:8000/block-entity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: userId,
          entity_type: "Sender",
          reason: "Manual Block from Simulator: " + (result?.risk_level || "Flagged"),
          source: "Manual"
        })
      });
      if (response.ok) {
        setBlockSuccess(true);
        generateFraudReport(); // Auto-download on success
      }
    } catch (e) {
      console.error("Block failed", e);
    } finally {
      setIsBlocking(false);
    }
  };

  if (!result) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-xl bg-slate-950 border-slate-800 text-slate-100 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl ${theme.glow}`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 ${theme.bar}`} />

        <DialogHeader className="pt-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${theme.bg}`}>
                {theme.icon}
              </div>
              <div>
                <DialogTitle className={`text-2xl font-bold tracking-tight ${theme.color === 'rose' ? 'text-rose-500' : theme.color === 'orange' ? 'text-orange-500' : 'text-emerald-500'}`}>
                  {theme.title}
                </DialogTitle>
                <DialogDescription className="text-slate-500 font-medium">
                  {scenarioDescription || t('hybrid_evaluation')}
                </DialogDescription>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest shadow-lg ${getRiskColor(result.risk_level)}`}>
              {result.risk_level} {t('risk')}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 my-4 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 uppercase font-black mb-1.5 tracking-wider">{t('general_probe')}</p>
              <p className={`text-2xl font-mono font-bold ${result.fraud_probability > 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {(result.fraud_probability * 100).toFixed(2)}%
              </p>
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500/20 transition-all duration-700" style={{ width: `${result.fraud_probability * 100}%` }} />
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 relative overflow-hidden group">
              <p className="text-[10px] text-slate-500 uppercase font-black mb-1.5 tracking-wider">{t('behavioral_lens')}</p>
              <p className={`text-2xl font-mono font-bold ${result.anomaly_score > 0.3 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {result.anomaly_score > 1000 ? result.anomaly_score.toExponential(2) : result.anomaly_score.toFixed(4)}
              </p>
              <div className="absolute bottom-0 left-0 h-1 bg-purple-500/20 transition-all duration-700" style={{ width: `${Math.min((Math.log10(result.anomaly_score || 1) + 1) * 20, 100)}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-400 uppercase font-black flex items-center gap-2 tracking-widest">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {t('ai_reasoning_insights')}
            </p>
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
              {result.reasoning}
            </div>

            {/* Trends Analysis Section UI */}
            {result.trends_analysis && (
              <>
                <p className="text-xs text-slate-400 uppercase font-black flex items-center gap-2 tracking-widest mt-4">
                  <TrendingUp className="h-4 w-4 text-cyan-500" />
                  Historical Pattern & Trends
                </p>
                <div className="bg-cyan-950/20 p-5 rounded-xl border border-cyan-900/50 text-sm text-cyan-100/90 leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                  {result.trends_analysis}
                </div>
              </>
            )}
          </div>

          <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all duration-500 ${theme.bg} ${theme.border} ${theme.color === 'rose' ? 'text-rose-300' : theme.color === 'orange' ? 'text-orange-300' : 'text-emerald-300'}`}>
            <div className={`p-2 rounded-full ${theme.bg}`}>
              {theme.icon}
            </div>
            <p className="font-black text-sm tracking-widest uppercase">
              {theme.title}
            </p>
          </div>
        </div>

        <DialogFooter className="pb-4 pt-2 flex-col gap-2">
          {/* Manual Block Button for High Risk */}
          {(result.is_blocked || result.risk_level === 'High' || result.risk_level === 'Critical') && (
            <Button
              onClick={handleBlockEntity}
              disabled={isBlocking || blockSuccess}
              className={`w-full h-12 border font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-2
                  ${blockSuccess
                  ? 'bg-emerald-900 border-emerald-700 text-emerald-100 hover:bg-emerald-900'
                  : 'bg-rose-900/50 hover:bg-rose-900 border-rose-700 text-rose-100'}`}
            >
              {blockSuccess ? (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Entity Blocked Successfully
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  {isBlocking ? "Blocking..." : "Confirm Fraud & Block Entity"}
                </>
              )}
            </Button>
          )}

          <Button
            onClick={onClose}
            className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold tracking-widest uppercase text-xs"
          >
            {t('acknowledge_analysis')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
