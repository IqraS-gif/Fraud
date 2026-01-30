"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'hi'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Nav & Layout
        system_online: "System Online",
        search_placeholder: "Search transactions, accounts...",
        admin_user: "Admin User",
        security_analyst: "Security Analyst",
        fraud_guard: "FraudGuard",
        dashboard: "Dashboard",
        transactions: "Transactions",
        upi_payment: "UPI Payment",
        heatmap: "Heatmap",
        salami_attack: "Salami Attack",
        community: "Community",
        settings: "Settings",

        // Landing Page
        next_gen_protection: "Next-Gen Financial Protection",
        india_first_ai: "India’s First AI That Stops",
        fraud_before_happens: "Financial Fraud Before It Happens",
        hero_subtext: "Real-time fraud detection for banks and UPI, powered by behavioral intelligence and ",
        explainable_ai: "explainable AI",
        enter_command_center: "Enter Command Center",
        critical_threat_level: "Critical Threat Level",
        digital_trust_crisis: "The Digital Trust Crisis",
        traditional_security_no_more: "Traditional banking security is no longer enough. The numbers are rising, and the methods are evolving faster than rule-based systems can keep up.",
        crore_lost: "Crore Lost",
        money_lost_text: "Money lost to digital fraud in India annually. A staggering figure that grows every year.",
        rise_in_scams: "Rise in Scams",
        scams_increase_text: "Year-over-year increase in sophisticated UPI and social engineering scams.",
        recovery_rate: "Recovery Rate",
        recovery_rate_text: "Only a fraction of stolen funds are ever recovered by traditional means.",
        rule_based_failing: "Rule-based systems are failing.",

        // Dashboard
        command_center: "Command Center",
        dashboard_subtitle: "Real-time fraud monitoring and financial overview.",
        generate_report: "Generate Report",
        total_transactions: "Total Transactions",
        fraud_prevented: "Fraud Prevented",
        active_alerts: "Active Alerts",
        system_load: "System Load",
        trend_up: "+12% from last month",
        saved_month: "Saved this month",
        requires_attention: "Requires attention",
        optimal_performance: "Optimal performance",

        // Dashboard Components
        system_health: "System Health",
        api_latency: "API Latency",
        fraud_model: "Fraud Model",
        database: "Database",
        operational: "Operational",
        active_status: "Active",
        healthy_status: "Healthy",
        model_confidence_title: "Model Confidence",
        last_24h: "Last 24h",
        live_transaction_stream: "Live Transaction Stream",
        risk_label: "Risk",
        risk_trend_analysis: "Risk Trend Analysis",
        transaction_volume: "Transaction Volume",

        // Chart Labels
        jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May", jun: "Jun",
        jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec",
        mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",

        // Transaction Page
        bank_transactions: "Bank Transactions",
        transactions_subtitle: "Real-time scoring and historical analysis.",
        recent_transactions: "Recent Transactions",
        transaction_simulator: "Transaction Simulator",
        simulator_description: "Test the Hybrid AI model with manual entries or JSON scenarios.",
        manual_entry: "Manual Entry",
        json_scenarios: "JSON Scenarios",
        amount_label: "Amount (₹)",
        type_label: "Type",
        recipient_label: "Recipient",
        analyzing: "Analyzing...",
        analyze_risk: "Analyze Risk",
        upload_json_test: "Upload JSON Test Case",
        select_scenario: "Select a behavioral scenario file",
        note: "Note",
        hybrid_note: "Note: The hybrid system will evaluate both general patterns (LightGBM) and per-user behavioral anomalies (Autoencoder).",
        uploaded_test_case: "Uploaded Test Case",
        invalid_json_alert: "Invalid JSON format or backend error",

        // Transaction Table
        live_analysis_history: "Live Analysis History",
        syncing: "(syncing...)",
        refresh: "Refresh",
        date_time: "Date/Time",
        user_id: "User ID",
        merchant_cat: "Merchant/Cat",
        location: "Location",
        status: "Status",
        risk: "Risk",
        amount: "Amount",
        details: "Details",
        no_transactions: "No transactions found. Start the simulator to see live entries.",
        view_ai: "View AI",

        // Modals
        analysis_results: "Analysis Results",
        hybrid_evaluation: "Hybrid Fraud Detection System Evaluation",
        general_probe: "General Probe (LGBM)",
        behavioral_lens: "Behavioral Lens (AE)",
        ai_reasoning_insights: "AI Reasoning & Insights",
        decision_blocked: "Decision: Transaction Blocked",
        decision_approved: "Decision: Transaction Approved",
        acknowledge_analysis: "Acknowledge Analysis",
        critical_risk_insights: "Critical Risk Insights",
        moderate_risk_analysis: "Moderate Risk Analysis",
        low_risk_analysis: "Low Risk Analysis",
        deep_analysis_id: "Deep Analysis for ID:",
        weighted_probability: "Weighted Risk Probability",
        ai_reasoning_engine: "AI Reasoning Engine",
        final_recommendation: "Final Recommendation",
        default_ai_reasoning: "This transaction aligned perfectly with user baseline behavior and showed no markers of automated fraud patterns.",
        block_recommendation: "BLOCK TRANSACTION and isolate account for manual review.",
        allow_recommendation: "ALLOW TRANSACTION and monitor for subsequent velocity spikes.",

        // Salami Attack Page
        salami_simulator: "Salami Attack Simulator",
        salami_subtitle: "Neural Smurfing Detection - High Frequency Pattern Analysis",
        upload_json: "Upload JSON",
        reset: "Reset",
        launch_attack: "Launch Salami Attack",
        simulating: "Simulating Attack...",
        source_device: "Source Device",
        attack_progress: "Attack Progress",
        blocked_patterns: "Blocked Patterns",
        suspicious: "Suspicious",
        live_logs: "Live Neural Engine Logs",
        waiting_signals: "Waiting for inbound signals...",

        // Smurfing Analysis
        neural_smurfing: "Neural Smurfing Detection",
        velocity_pattern: "Velocity Pattern Detected",
        freq_rate: "Freq Rate",
        risk_level: "Risk Level",
        pattern_analytics: "Pattern Analytics",
        avg_tx_size: "Avg. Transaction Size",
        velocity_score: "Velocity Score",
        attack_confirmed: "Salami Attack Confirmed",
        pattern_monitoring: "Pattern Monitoring Active",
        threshold_hit: "Detected {count} micro-payments to a single receiver. Threshold hit at 7 items.",
        monitoring_behavior: "Monitoring recurring transfers. System is currently observing user behavior signatures.",

        // Risk Levels
        risk_critical: "CRITICAL",
        risk_elevated: "ELEVATED",
        risk_normal: "NORMAL",
        risk_low: "LOW",

        // Heatmap Page
        threat_intel_map: "Threat Intelligence Map",
        real_time_geo_risk: "Real-time geographic risk monitoring and anomaly detection.",
        national_alert_level: "National Alert Level",
        active_cluster: "Active Cluster",
        scanning_sectors: "SCANNING SECTORS...",
        top_risky_zones: "Top Risky Zones (DB Centric)",
        ai_strategic_insight: "AI Strategic Insight",
        pattern_recolognition_active: "Pattern recognition active.",
        recommend_friction: "Recommend immediate friction adjustment.",
        no_active_threats: "No active threats detected.",
        syncing_db: "syncing database...",
        known_signatures: "known signatures"
    },
    hi: {
        // Nav & Layout
        system_online: "सिस्टम ऑनलाइन है",
        search_placeholder: "लेनदेन, खातों की खोज करें...",
        admin_user: "व्यवस्थापक उपयोगकर्ता",
        security_analyst: "सुरक्षा विश्लेषक",
        fraud_guard: "धोखाधड़ी रक्षक",
        dashboard: "डैशबोर्ड",
        transactions: "लेनदेन",
        upi_payment: "UPI भुगतान",
        heatmap: "हीटमैप",
        salami_attack: "सलामी अटैक",
        community: "समुदाय",
        settings: "सेटिंग्स",

        // Landing Page
        next_gen_protection: "अगली पीढ़ी की वित्तीय सुरक्षा",
        india_first_ai: "भारत का पहला AI जो रोकता है",
        fraud_before_happens: "विविध वित्तीय धोखाधड़ी होने से पहले",
        hero_subtext: "बैंकों और UPI के लिए रीयल-टाइम धोखाधड़ी पहचान, व्यवहारिक बुद्धिमत्ता और द्वारा संचालित ",
        explainable_ai: "व्याख्यात्मक AI",
        enter_command_center: "कमांड सेंटर में प्रवेश करें",
        critical_threat_level: "गंभीर खतरा स्तर",
        digital_trust_crisis: "डिजिटल ट्रस्ट संकट",
        traditional_security_no_more: "पारंपरिक बैंकिंग सुरक्षा अब पर्याप्त नहीं है। संख्या बढ़ रही है, और तरीके नियम-आधारित प्रणालियों की तुलना में तेजी से विकसित हो रहे हैं।",
        crore_lost: "करोड़ का नुकसान",
        money_lost_text: "भारत में सालाना डिजिटल धोखाधड़ी में खोया गया पैसा। एक चौंकाने वाला आंकड़ा जो हर साल बढ़ता है।",
        rise_in_scams: "घोटालों में वृद्धि",
        scams_increase_text: "परिष्कृत UPI और सोशल इंजीनियरिंग घोटालों में साल-दर-साल वृद्धि।",
        recovery_rate: "रिकवरी दर",
        recovery_rate_text: "चोरी किए गए धन का केवल एक अंश ही कभी पारंपरिक साधनों द्वारा वापस मिल पाता है।",
        rule_based_failing: "नियम-आधारित प्रणालियाँ विफल हो रही हैं।",

        // Dashboard
        command_center: "कमांड सेंटर",
        dashboard_subtitle: "रीयल-टाइम धोखाधड़ी निगरानी और वित्तीय अवलोकन।",
        generate_report: "रिपोर्ट तैयार करें",
        total_transactions: "कुल लेनदेन",
        fraud_prevented: "रोकी गई धोखाधड़ी",
        active_alerts: "सक्रिय अलर्ट",
        system_load: "सिस्टम लोड",
        trend_up: "पिछले महीने से +12%",
        saved_month: "इस महीने बचाया गया",
        requires_attention: "ध्यान देने की आवश्यकता है",
        optimal_performance: "सर्वोत्तम प्रदर्शन",

        // Dashboard Components
        system_health: "सिस्टम स्वास्थ्य",
        api_latency: "API विलंबता",
        fraud_model: "धोखाधड़ी मॉडल",
        database: "डेटाबेस",
        operational: "परिचालन",
        active_status: "सक्रिय",
        healthy_status: "स्वस्थ",
        model_confidence_title: "मॉडल विश्वास",
        last_24h: "पिछले 24 घंटे",
        live_transaction_stream: "लाइव लेनदेन स्ट्रीम",
        risk_label: "जोखिम",
        risk_trend_analysis: "जोखिम प्रवृत्ति विश्लेषण",
        transaction_volume: "लेनदेन की मात्रा",

        // Chart Labels
        jan: "जनवरी", feb: "फरवरी", mar: "मार्च", apr: "अप्रैल", may: "मई", jun: "जून",
        jul: "जुलाई", aug: "अगस्त", sep: "सितंबर", oct: "अक्टूबर", nov: "नवंबर", dec: "दिसंबर",
        mon: "सोम", tue: "मंगल", wed: "बुध", thu: "गुरु", fri: "शुक्र", sat: "शनि", sun: "रवि",

        // Transaction Page
        bank_transactions: "बैंक लेनदेन",
        transactions_subtitle: "रीयल-टाइम स्कोरिंग और ऐतिहासिक विश्लेषण।",
        recent_transactions: "हाल के लेनदेन",
        transaction_simulator: "लेनदेन सिम्युलेटर",
        simulator_description: "मैन्युअल प्रविष्टियों या JSON परिदृश्यों के साथ हाइब्रिड AI मॉडल का परीक्षण करें।",
        manual_entry: "मैन्युअल प्रविष्टि",
        json_scenarios: "JSON परिदृश्य",
        amount_label: "राशि (₹)",
        type_label: "प्रकार",
        recipient_label: "प्राप्तकर्ता",
        analyzing: "विश्लेषण किया जा रहा है...",
        analyze_risk: "जोखिम का विश्लेषण करें",
        upload_json_test: "JSON टेस्ट केस अपलोड करें",
        select_scenario: "व्यवहारिक परिदृश्य फ़ाइल चुनें",
        note: "नोट",
        hybrid_note: "नोट: हाइब्रिड सिस्टम सामान्य पैटर्न (LightGBM) और प्रति-उपयोगकर्ता व्यवहार विसंगतियों (Autoencoder) दोनों का मूल्यांकन करेगा।",
        uploaded_test_case: "अपलोड किया गया टेस्ट केस",
        invalid_json_alert: "अमान्य JSON प्रारूप या बैकएंड त्रुटि",

        // Transaction Table
        live_analysis_history: "लाइव विश्लेषण इतिहास",
        syncing: "(सिंक हो रहा है...)",
        refresh: "रीफ्रेश करें",
        date_time: "दिनांक/समय",
        user_id: "उपयोगकर्ता आईडी",
        merchant_cat: "मर्चेंट/कैटेगरी",
        location: "स्थान",
        status: "स्थिति",
        risk: "जोखिम",
        amount: "राशि",
        details: "विवरण",
        no_transactions: "कोई लेनदेन नहीं मिला। लाइव प्रविष्टियां देखने के लिए सिम्युलेटर शुरू करें।",
        view_ai: "AI देखें",

        // Modals
        analysis_results: "विश्लेषण परिणाम",
        hybrid_evaluation: "हाइब्रिड धोखाधड़ी पहचान प्रणाली मूल्यांकन",
        general_probe: "सामान्य जांच (LGBM)",
        behavioral_lens: "व्यवहारिक लेंस (AE)",
        ai_reasoning_insights: "AI तर्क और अंतर्दृष्टि",
        decision_blocked: "निर्णय: लेनदेन अवरुद्ध",
        decision_approved: "निर्णय: लेनदेन स्वीकृत",
        acknowledge_analysis: "विश्लेषण स्वीकार करें",
        critical_risk_insights: "महत्वपूर्ण जोखिम अंतर्दृष्टि",
        moderate_risk_analysis: "मध्यम जोखिम विश्लेषण",
        low_risk_analysis: "निम्न जोखिम विश्लेषण",
        deep_analysis_id: "ID के लिए गहन विश्लेषण:",
        weighted_probability: "भारित जोखिम संभावना",
        ai_reasoning_engine: "AI तर्क इंजन",
        final_recommendation: "अंतिम सिफारिश",
        default_ai_reasoning: "यह लेनदेन उपयोगकर्ता के आधारभूत व्यवहार के साथ पूरी तरह से मेल खाता है और इसमें स्वचालित धोखाधड़ी पैटर्न का कोई लक्षण नहीं दिखा।",
        block_recommendation: "लेनदेन को ब्लॉक करें और मैन्युअल समीक्षा के लिए खाते को अलग करें।",
        allow_recommendation: "लेनदेन की अनुमति दें और बाद के वेग स्पाइक्स की निगरानी करें।",

        // Salami Attack Page
        salami_simulator: "सलामी अटैक सिम्युलेटर",
        salami_subtitle: "न्यूरल स्मर्फिंग डिटेक्शन - हाई फ्रीक्वेंसी पैटर्न विश्लेषण",
        upload_json: "JSON अपलोड करें",
        reset: "रीसेट करें",
        launch_attack: "सलामी अटैक शुरू करें",
        simulating: "सिमुलेशन चल रहा है...",
        source_device: "स्रोत डिवाइस",
        attack_progress: "हमले की प्रगति",
        blocked_patterns: "ब्लॉक किए गए पैटर्न",
        suspicious: "संदिग्ध",
        live_logs: "लाइव न्यूरल इंजन लॉग्स",
        waiting_signals: "सिग्नल्स की प्रतीक्षा की जा रही है...",

        // Smurfing Analysis
        neural_smurfing: "न्यूरल स्मर्फिंग डिटेक्शन",
        velocity_pattern: "वेग पैटर्न का पता चला",
        freq_rate: "आवृत्ति दर",
        risk_level: "जोखिम स्तर",
        pattern_analytics: "पैटर्न विश्लेषण",
        avg_tx_size: "औसत लेनदेन आकार",
        velocity_score: "वेग स्कोर",
        attack_confirmed: "सलामी अटैक की पुष्टि हुई",
        pattern_monitoring: "पैटर्न निगरानी सक्रिय है",
        threshold_hit: "एक ही प्राप्तकर्ता को {count} माइक्रो-भुगतान मिले। 7 मदों पर सीमा समाप्त हुई।",
        monitoring_behavior: "आवर्ती स्थानान्तरण की निगरानी। सिस्टम वर्तमान में उपयोगकर्ता व्यवहार हस्ताक्षरों का अवलोकन कर रहा है।",

        // Risk Levels
        risk_critical: "गंभीर",
        risk_elevated: "बढ़ा हुआ",
        risk_normal: "सामान्य",
        risk_low: "कम",

        // Heatmap Page
        threat_intel_map: "खतरा खुफिया मानचित्र",
        real_time_geo_risk: "रीयल-टाइम भौगोलिक जोखिम निगरानी और विसंगति पहचान।",
        national_alert_level: "राष्ट्रीय अलर्ट स्तर",
        active_cluster: "सक्रिय क्लस्टर",
        scanning_sectors: "क्षेत्र स्कैन किए जा रहे हैं...",
        top_risky_zones: "शीर्ष जोखिम वाले क्षेत्र (DB केंद्रित)",
        ai_strategic_insight: "AI रणनीतिक अंतर्दृष्टि",
        pattern_recolognition_active: "पैटर्न पहचान सक्रिय।",
        recommend_friction: "तत्काल घर्षण समायोजन की अनुशंसा करें।",
        no_active_threats: "कोई सक्रिय खतरा नहीं मिला।",
        syncing_db: "डेटाबेस सिंक हो रहा है...",
        known_signatures: "ज्ञात हस्ताक्षर"
    }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('language') as Language
        if (saved && (saved === 'en' || saved === 'hi')) {
            setLanguage(saved)
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('language', language)
        }
    }, [language, mounted])

    const t = (key: string) => {
        return translations[language][key] || key
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
