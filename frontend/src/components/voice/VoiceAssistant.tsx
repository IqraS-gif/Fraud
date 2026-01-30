"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Bot, User, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
    role: "user" | "assistant"
    content: string
}

// System prompt for Groq
const SYSTEM_PROMPT = `You are a helpful, empathetic Hindi-speaking assistant for scam victims.

GUIDELINES:
1. **STRUCTURE**: Use BULLET POINTS (•) for distinct steps.
2. **ADAPTIVE**: Short answers for simple queries. Detailed steps for complex/distressed users.
3. **FORMAT**: Keep paragraphs short. Break text into chunks.
4. **CRITICAL**: Always mention 1930 and RBI if relevant.
5. **LANGUAGE**: Hindi (Devanagari).`

export const VoiceAssistant = () => {
    // State
    const [isListening, setIsListening] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [currentTranscript, setCurrentTranscript] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)

    // API Keys
    const [groqKey, setGroqKey] = useState(process.env.NEXT_PUBLIC_GROQ_API_KEY || "")
    const [showApiInput, setShowApiInput] = useState(!process.env.NEXT_PUBLIC_GROQ_API_KEY)

    // Voices
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [selectedVoice, setSelectedVoice] = useState<string>("")

    // Refs
    const recognitionRef = useRef<any>(null)
    const synthRef = useRef<SpeechSynthesis | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
    const transcriptRef = useRef<string>("")
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null) // FIX: Prevent GC

    // Streaming & Audio Queue Refs
    // Queue now just stores text
    const audioQueueRef = useRef<string[]>([])
    const isPlayingRef = useRef(false)
    const abortControllerRef = useRef<AbortController | null>(null)

    // Initialize speech synthesis
    useEffect(() => {
        if (typeof window !== "undefined") {
            synthRef.current = window.speechSynthesis

            // Clear any stuck queues on mount
            synthRef.current.cancel()

            const loadVoices = () => {
                const availableVoices = synthRef.current?.getVoices() || []

                if (availableVoices.length === 0) return; // Wait for voices

                const hindiVoices = availableVoices.filter(v => v.lang.includes("hi") || v.lang.includes("IN"))
                setVoices(hindiVoices.length > 0 ? hindiVoices : availableVoices)

                // Prioritize Google Hindi -> Any Hindi -> First Available
                const preferredVoice = availableVoices.find(v =>
                    v.name.includes("Google") && v.lang.includes("hi")
                ) || availableVoices.find(v =>
                    v.lang.includes("hi")
                ) || availableVoices[0]

                if (preferredVoice) {
                    setSelectedVoice(preferredVoice.name)
                }
            }

            loadVoices()
            // Chrome loads voices asynchronously
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices
            }
        }
    }, [])

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, currentTranscript])

    // --- BROWSER AUDIO QUEUE ---
    const addToAudioQueue = (text: string) => {
        const cleanText = text.trim()
        if (!cleanText) return
        audioQueueRef.current.push(cleanText)
        processAudioQueue()
    }

    const processAudioQueue = async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0) return

        isPlayingRef.current = true
        setIsSpeaking(true)

        try {
            const text = audioQueueRef.current[0]
            if (synthRef.current) {
                await new Promise<void>((resolve) => {
                    // Create utterance
                    const utterance = new SpeechSynthesisUtterance(text)

                    // FIX: Store reference to prevent Garbage Collection in Chrome
                    utteranceRef.current = utterance

                    // Configure 
                    utterance.lang = "hi-IN"
                    utterance.rate = 1.0
                    utterance.volume = 1.0

                    // Select Voice
                    const voice = voices.find(v => v.name === selectedVoice)
                    if (voice) {
                        utterance.voice = voice
                    } else {
                        // Fallback: search freshly
                        const available = synthRef.current?.getVoices() || []
                        const fallback = available.find(v => v.lang.includes("hi")) || available[0]
                        if (fallback) utterance.voice = fallback
                    }

                    utterance.onend = () => {
                        utteranceRef.current = null // Release ref
                        audioQueueRef.current.shift()
                        resolve()
                    }

                    utterance.onerror = (e) => {
                        console.error("TTS Error", e)
                        utteranceRef.current = null // Release ref
                        audioQueueRef.current.shift()
                        resolve()
                    }

                    // Speak
                    synthRef.current?.speak(utterance)

                    // Resume if paused (Chrome quirk)
                    if (synthRef.current?.paused) {
                        synthRef.current.resume();
                    }
                })
            } else {
                audioQueueRef.current.shift()
            }
        } catch (e) {
            console.error("Queue Error", e)
        } finally {
            isPlayingRef.current = false
            if (audioQueueRef.current.length > 0) {
                processAudioQueue()
            } else {
                setIsSpeaking(false)
            }
        }
    }

    // --- SPEECH RECOGNITION ---
    const startListening = useCallback(() => {
        if (typeof window === "undefined") return
        stopState() // Stop everything before listening

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert("Browser not supported")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = "hi-IN"
        recognition.continuous = true
        recognition.interimResults = true

        recognition.onstart = () => {
            setIsListening(true)
            transcriptRef.current = ""
            setCurrentTranscript("")
        }

        recognition.onresult = (event: any) => {
            // Disabled Interrupt
            // if (isSpeaking) stopState() 

            let finalTranscript = ""
            let interimTranscript = ""

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript
                } else {
                    interimTranscript += event.results[i][0].transcript
                }
            }

            if (finalTranscript) {
                transcriptRef.current += " " + finalTranscript
                setCurrentTranscript(transcriptRef.current)

                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = setTimeout(() => {
                    stopListening()
                }, 2000)
            } else if (interimTranscript) {
                setCurrentTranscript(transcriptRef.current + " " + interimTranscript)
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
                silenceTimerRef.current = setTimeout(() => {
                    stopListening()
                }, 3000)
            }
        }

        recognition.onend = () => {
            setIsListening(false)
            if (transcriptRef.current.trim()) {
                handleUserMessage(transcriptRef.current.trim())
            }
        }

        recognitionRef.current = recognition
        recognition.start()
    }, [groqKey])

    const stopListening = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
        if (recognitionRef.current) recognitionRef.current.stop()
    }

    const stopState = () => {
        if (synthRef.current) synthRef.current.cancel()
        audioQueueRef.current = []
        isPlayingRef.current = false
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setIsSpeaking(false)
        setIsProcessing(false)
    }

    // --- STREAMING GROQ API ---
    const handleUserMessage = async (text: string) => {
        if (!text.trim()) return

        const userMsg: Message = { role: "user", content: text }
        setMessages(prev => [...prev, userMsg])
        setCurrentTranscript("")
        transcriptRef.current = ""
        setIsProcessing(true)
        setMessages(prev => [...prev, { role: "assistant", content: "" }])

        try {
            abortControllerRef.current = new AbortController()

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqKey}`
                },
                body: JSON.stringify({
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: text }
                    ],
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.6,
                    max_tokens: 1024,
                    stream: true
                }),
                signal: abortControllerRef.current.signal
            })

            if (!response.body) throw new Error("No response body")

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let assistantContent = ""
            let buffer = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split("\n")

                for (const line of lines) {
                    if (line.startsWith("data: ") && line !== "data: [DONE]") {
                        try {
                            const json = JSON.parse(line.replace("data: ", ""))
                            const content = json.choices[0]?.delta?.content || ""

                            if (content) {
                                assistantContent += content
                                buffer += content

                                setMessages(prev => {
                                    const last = prev[prev.length - 1]
                                    if (last.role === "assistant") {
                                        return [...prev.slice(0, -1), { ...last, content: assistantContent }]
                                    }
                                    return prev
                                })

                                // Sentence Detection
                                if (buffer.match(/[।?!]\s/) || buffer.includes("\n") || (buffer.length > 50 && buffer.match(/[,|]\s/))) {
                                    const match = buffer.match(/([।?!]|\n)/)
                                    if (match) {
                                        const index = match.index! + match[0].length
                                        const sentence = buffer.slice(0, index).trim()
                                        if (sentence) addToAudioQueue(sentence)
                                        buffer = buffer.slice(index)
                                    }
                                }
                            }
                        } catch (e) { }
                    }
                }
            }
            if (buffer.trim()) addToAudioQueue(buffer.trim())

        } catch (error: any) {
            if (error.name !== 'AbortError') console.error("Groq Error:", error)
        } finally {
            setIsProcessing(false)
            abortControllerRef.current = null
        }
    }

    const startConversation = () => {
        setShowApiInput(false)
        const greeting = "नमस्ते! मैं आपकी मदद के लिए यहाँ हूँ। कृपया विस्तार से बताएं क्या हुआ।"
        setMessages([{ role: "assistant", content: greeting }])
        addToAudioQueue(greeting)
    }

    if (showApiInput) {
        return (
            <div className="min-h-[500px] flex flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700">
                <Bot className="h-16 w-16 text-cyan-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Groq Voice Assistant</h2>
                <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="Enter Groq API Key (gsk_...)"
                    className="w-full max-w-md px-4 py-2 border rounded mb-4 bg-slate-800 text-white"
                />
                <Button onClick={startConversation} disabled={!groqKey} className="bg-cyan-600 hover:bg-cyan-700">Start Assistant</Button>
            </div>
        )
    }

    return (
        <div className="min-h-[600px] flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-700 backdrop-blur flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                        <Bot className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Groq AI Assistant</h3>
                        <p className="text-xs text-blue-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Browser Voice (Consistent)
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {voices.length > 0 && (
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="bg-slate-800 text-xs text-slate-300 border border-slate-600 rounded px-2"
                        >
                            {voices.map(v => <option key={v.name} value={v.name}>{v.name.slice(0, 15)}...</option>)}
                        </select>
                    )}
                    {(isSpeaking || isProcessing) && (
                        <Button size="sm" variant="destructive" onClick={stopState} className="h-8 w-8 p-0 rounded-full">
                            <StopCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Area & Input (Same as before) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-blue-600" : "bg-cyan-600"
                            }`}>
                            {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user"
                            ? "bg-blue-600/20 text-blue-100 rounded-tr-sm border border-blue-500/30"
                            : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700"
                            }`}>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}

                {currentTranscript && (
                    <div className="flex gap-3 flex-row-reverse animate-in fade-in slide-in-from-bottom-2">
                        <div className="h-8 w-8 rounded-full bg-blue-600/50 flex items-center justify-center shrink-0 animate-pulse">
                            <Mic className="h-4 w-4 text-white" />
                        </div>
                        <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-blue-600/10 border border-blue-500/50 text-blue-200 rounded-tr-sm">
                            <p className="typing-indicator text-lg font-medium">{currentTranscript}</p>
                        </div>
                    </div>
                )}

                {isProcessing && !isSpeaking && (
                    <div className="flex gap-2 items-center text-slate-400 text-sm ml-12">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75" />
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100" />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800">
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={isListening ? stopListening : startListening}
                        className={`h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isListening
                            ? "bg-red-500 scale-110 shadow-red-500/50 animate-pulse"
                            : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 shadow-cyan-500/30"
                            }`}
                    >
                        {isListening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
                    </button>
                    {isSpeaking && (
                        <div className="absolute right-8">
                            <div className="flex gap-1 items-end h-8">
                                <span className="w-1 bg-cyan-500 animate-[music_1s_ease-in-out_infinite] h-4" />
                                <span className="w-1 bg-cyan-500 animate-[music_1.2s_ease-in-out_infinite] h-8" />
                                <span className="w-1 bg-cyan-500 animate-[music_0.8s_ease-in-out_infinite] h-5" />
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-center text-slate-500 text-sm mt-3 font-medium">
                    {isListening ? "Listening... (2s pause to send)" : "Tap to Speak"}
                </p>
            </div>
        </div>
    )
}
