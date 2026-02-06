"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"

interface VoiceRecorderProps {
    onTranscript: (text: string) => void
    isListening?: boolean
    setIsListening?: (listening: boolean) => void
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
    const [isListening, setIsListening] = useState(false)
    const [recognition, setRecognition] = useState<any>(null)

    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = false // Stop after one sentence/pause
                recognition.interimResults = false
                recognition.lang = 'en-US'

                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript
                    console.log("🎤 Heard:", transcript)
                    onTranscript(transcript)
                    setIsListening(false)
                }

                recognition.onerror = (event: any) => {
                    console.error("Mic Error:", event.error)
                    setIsListening(false)
                }

                recognition.onend = () => {
                    setIsListening(false)
                }

                setRecognition(recognition)
            }
        }
    }, [onTranscript])

    const toggleListening = () => {
        if (!recognition) {
            alert("Voice recognition not supported in this browser.")
            return
        }

        if (isListening) {
            recognition.stop()
            setIsListening(false)
        } else {
            recognition.start()
            setIsListening(true)
        }
    }

    return (
        <Button
            variant={isListening ? "destructive" : "secondary"}
            size="icon"
            onClick={(e) => {
                e.preventDefault() // Prevent form submit
                toggleListening()
            }}
            className={`rounded-full transition-all ${isListening ? "animate-pulse" : ""}`}
            title="Tap to Speak"
        >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
    )
}
