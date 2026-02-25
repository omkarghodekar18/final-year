"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Home,
} from "lucide-react"
import Link from "next/link"

// ── 10 Mock Interview Questions ───────────────────────────────────────────────
const MOCK_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "What motivated you to apply for this role?",
  "Describe a challenging project you worked on and how you handled it.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Tell me about a time you had to work collaboratively in a team.",
  "What are your greatest technical strengths relevant to this position?",
  "How do you stay updated with the latest trends in your field?",
  "Describe a situation where you had to learn something new very quickly.",
  "Where do you see yourself professionally in the next three to five years?",
  "Do you have any questions for us?",
]

type Phase = "intro" | "ai-speaking" | "user-answering" | "done"

interface Answer {
  question: string
  transcript: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

export default function InterviewSessionPage() {
  const params = useParams()
  const jobId = params?.id as string

  const [phase, setPhase] = useState<Phase>("intro")
  const [questionIndex, setQuestionIndex] = useState(0)
  const [transcript, setTranscript] = useState("")
  const [isMuted, setIsMuted] = useState(false)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [listeningActive, setListeningActive] = useState(false)

  const recognitionRef = useRef<AnySpeechRecognition>(null)

  // ── TTS: AI speaks the question ───────────────────────────────────────────
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "en-US"
    utter.rate = 0.95
    utter.pitch = 1.1
    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find((v) => v.lang === "en-US" && v.name.toLowerCase().includes("female")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0]
    if (preferred) utter.voice = preferred
    utter.onstart = () => setAvatarSpeaking(true)
    utter.onend = () => {
      setAvatarSpeaking(false)
      onEnd?.()
    }
    window.speechSynthesis.speak(utter)
  }, [])

  // ── STT: Listen to user's answer ─────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition = new SR()
    recognition.lang = "en-US"
    recognition.continuous = true
    recognition.interimResults = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let final = ""
      let interim = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t + " "
        else interim += t
      }
      setTranscript((prev) => (final ? prev + final : prev || interim))
    }
    recognition.onend = () => setListeningActive(false)
    recognitionRef.current = recognition
    recognition.start()
    setListeningActive(true)
    setTranscript("")
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListeningActive(false)
  }, [])

  const askQuestion = useCallback(
    (index: number) => {
      setPhase("ai-speaking")
      setTranscript("")
      speak(MOCK_QUESTIONS[index], () => {
        setPhase("user-answering")
        startListening()
      })
    },
    [speak, startListening]
  )

  const startInterview = () => {
    setQuestionIndex(0)
    setAnswers([])
    askQuestion(0)
  }

  const handleNext = () => {
    stopListening()
    const currentAnswer: Answer = {
      question: MOCK_QUESTIONS[questionIndex],
      transcript: transcript.trim() || "(no answer recorded)",
    }
    const updated = [...answers, currentAnswer]
    setAnswers(updated)

    console.log(`\n📝 Q${questionIndex + 1}: ${currentAnswer.question}`)
    console.log(`💬 Answer: ${currentAnswer.transcript}`)

    if (questionIndex + 1 >= MOCK_QUESTIONS.length) {
      console.log("\n\n====== INTERVIEW COMPLETE ======")
      updated.forEach((a, i) => {
        console.log(`\nQ${i + 1}: ${a.question}`)
        console.log(`A:  ${a.transcript}`)
      })
      console.log("================================\n")
      setPhase("done")
    } else {
      const next = questionIndex + 1
      setQuestionIndex(next)
      askQuestion(next)
    }
  }

  const toggleMute = () => {
    setIsMuted((m) => {
      if (!m) stopListening()
      else if (phase === "user-answering") startListening()
      return !m
    })
  }

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      recognitionRef.current?.abort()
    }
  }, [])

  const progress = Math.round((questionIndex / MOCK_QUESTIONS.length) * 100)

  // ── DONE SCREEN ───────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h1 className="text-3xl font-bold">Interview Complete!</h1>
            <p className="text-muted-foreground">
              Great job! Here's a summary of your responses.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-6">
            {answers.map((a, i) => (
              <div key={i} className="space-y-1 border-b pb-4 last:border-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Q{i + 1}
                </p>
                <p className="font-medium">{a.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a.transcript}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={startInterview} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
            <Button asChild className="gap-2">
              <Link href="/dashboard/interviews">
                <Home className="h-4 w-4" />
                Back to Interviews
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-lg text-center space-y-8">
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-30" />
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
              <span className="text-5xl select-none">🤖</span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground">
              I'll ask you <strong>10 questions</strong>. Answer each one verbally —
              your mic will be active during your turn.
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              <Badge variant="secondary">🎙 Speak your answers</Badge>
              <Badge variant="secondary">📝 Transcribed live</Badge>
              <Badge variant="secondary">🤫 Your own pace</Badge>
            </div>
          </div>

          <Button
            size="lg"
            onClick={startInterview}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10"
          >
            Start Interview
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // ── INTERVIEW SCREEN ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background p-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/dashboard/interviews"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            window.speechSynthesis?.cancel()
            recognitionRef.current?.abort()
          }}
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {questionIndex + 1} of {MOCK_QUESTIONS.length}
          </span>
          <Badge variant={phase === "ai-speaking" ? "default" : "secondary"} className="text-xs">
            {phase === "ai-speaking" ? "AI Speaking…" : "Your Turn"}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-10 max-w-2xl mx-auto w-full">
        {/* Avatar */}
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ${
              avatarSpeaking ? "opacity-30 scale-110 animate-pulse" : "opacity-10"
            }`}
          />
          <div
            className={`absolute inset-3 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ${
              avatarSpeaking ? "opacity-40 scale-105" : "opacity-20"
            }`}
          />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
            <span className="text-5xl select-none">🤖</span>
          </div>
          {avatarSpeaking && (
            <div className="absolute -bottom-3 flex gap-1">
              {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-purple-500 animate-pulse"
                  style={{ height: `${h * 5}px`, animationDelay: `${i * 80}ms` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Question card */}
        <div className="w-full rounded-2xl border bg-card p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            {phase === "ai-speaking" ? "Question" : "Your answer is being recorded…"}
          </p>
          <p className="text-xl font-semibold leading-snug">{MOCK_QUESTIONS[questionIndex]}</p>
        </div>

        {/* Live transcript */}
        <div className="w-full min-h-[80px] rounded-xl border border-dashed bg-muted/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Your Answer (live)
          </p>
          {transcript ? (
            <p className="text-sm leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {phase === "user-answering"
                ? isMuted
                  ? "Microphone muted. Unmute to answer."
                  : "Listening… speak now."
                : "Waiting for AI to finish speaking…"}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={toggleMute}
            disabled={phase !== "user-answering"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-5 w-5 text-red-500" />
            ) : (
              <Mic className={`h-5 w-5 ${listeningActive ? "text-green-500" : ""}`} />
            )}
          </Button>

          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
            onClick={handleNext}
            disabled={phase === "ai-speaking"}
          >
            {questionIndex + 1 === MOCK_QUESTIONS.length ? "Finish Interview" : "Next Question"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground -mt-4">
          {listeningActive && !isMuted
            ? "🔴 Recording — click Next when you're done answering"
            : phase === "ai-speaking"
            ? "🔊 AI is speaking…"
            : "—"}
        </p>
      </div>
    </div>
  )
}
