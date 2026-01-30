"use client"

import { VoiceAssistant } from "@/components/voice/VoiceAssistant"

export default function VoicePage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Voice Assistant</h1>
        <p className="text-slate-400">Speak with our AI to get help with fraud issues.</p>
      </div>
      <VoiceAssistant />
    </div>
  )
}
