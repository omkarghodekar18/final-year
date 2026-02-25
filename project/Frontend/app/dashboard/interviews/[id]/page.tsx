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
import dynamic from "next/dynamic"

// Dynamically import the 3D avatar (Canvas cannot SSR)
const AIAvatar3D = dynamic(
  () => import("@/components/interview/AIAvatar3D").then((m) => m.AIAvatar3D),
  { ssr: false, loading: () => <AvatarPlaceholder /> }
)

function AvatarPlaceholder() {
  return (
    <div className="h-72 w-72 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 opacity-60">
      <span className="text-5xl">🤖</span>
    </div>
  )
}

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

// Known male voice name fragments to skip when a female is available
const MALE_VOICE_PATTERNS = /\b(Guy|David|Mark|James|Christopher|Richard|George|Ryan|Eric|Tom)\b/i

// ── Find the best female, natural-sounding voice available ────────────────────
function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  // Microsoft Neural / Natural Windows voices – female priority list
  const femaleOnline: Array<(v: SpeechSynthesisVoice) => boolean> = [
    (v) => /Aria Online/i.test(v.name),           // best – very human female
    (v) => /Jenny Online/i.test(v.name),
    (v) => /Natasha Online/i.test(v.name),
    (v) => /Eva Online/i.test(v.name),
    (v) => /Emma Online/i.test(v.name),
    (v) => /Natural/i.test(v.name) && v.lang.startsWith("en") && !MALE_VOICE_PATTERNS.test(v.name),
    (v) => /Microsoft/i.test(v.name) && v.lang.startsWith("en") && !MALE_VOICE_PATTERNS.test(v.name),
    (v) => /Zira/i.test(v.name),                  // local Windows female fallback
    (v) => /Google/i.test(v.name) && v.lang === "en-US" && !MALE_VOICE_PATTERNS.test(v.name),
    (v) => v.lang === "en-US" && !v.localService && !MALE_VOICE_PATTERNS.test(v.name),
    (v) => v.lang === "en-US",
    () => true,
  ]
  for (const test of femaleOnline) {
    const match = voices.find(test)
    if (match) return match
  }
  return voices[0]
}

export default function InterviewSessionPage() {
  const params = useParams()

  const [phase, setPhase]                   = useState<Phase>("intro")
  const [questionIndex, setQuestionIndex]   = useState(0)
  const [transcript, setTranscript]         = useState("")
  const [isMuted, setIsMuted]               = useState(false)
  const [answers, setAnswers]               = useState<Answer[]>([])
  const [avatarSpeaking, setAvatarSpeaking] = useState(false)
  const [avatarAmplitude, setAvatarAmplitude] = useState(0)   // 0-1 real audio level
  const [listeningActive, setListeningActive] = useState(false)

  const recognitionRef  = useRef<AnySpeechRecognition>(null)
  const audioCtxRef     = useRef<AudioContext | null>(null)
  const analyserRef     = useRef<AnalyserNode | null>(null)
  const animFrameRef    = useRef<number>(0)
  const sourceRef       = useRef<AudioBufferSourceNode | null>(null)

  // ── TTS via edge-tts backend ── with SpeechSynthesis fallback ─────────────
  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    // Stop any currently playing audio
    sourceRef.current?.stop()
    cancelAnimationFrame(animFrameRef.current)
    setAvatarAmplitude(0)

    try {
      // 1. Fetch MP3 from edge-tts backend
      const res = await fetch("http://localhost:5000/api/tts/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS backend returned ${res.status}`)

      const audioData = await res.arrayBuffer()

      // 2. Decode into Web Audio API
      if (!audioCtxRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current

      const audioBuffer = await ctx.decodeAudioData(audioData)

      // 3. Wire: source → analyser → destination
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(ctx.destination)
      sourceRef.current = source

      // 4. Start mouth animation and play — both triggered together
      const dataArr = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(dataArr)
        const avg = dataArr.reduce((s, v) => s + v, 0) / dataArr.length
        setAvatarAmplitude(avg / 255)          // normalise 0-1
        animFrameRef.current = requestAnimationFrame(tick)
      }

      // 5. Play — only now does the mouth start moving
      setAvatarSpeaking(true)
      animFrameRef.current = requestAnimationFrame(tick)
      source.start()
      source.onended = () => {
        cancelAnimationFrame(animFrameRef.current)
        setAvatarSpeaking(false)
        setAvatarAmplitude(0)
        onEnd?.()
      }
    } catch (err) {
      // Fallback to browser SpeechSynthesis if backend unavailable
      console.warn("edge-tts backend unavailable, falling back to SpeechSynthesis:", err)
      cancelAnimationFrame(animFrameRef.current)
      const utter        = new SpeechSynthesisUtterance(text)
      utter.lang         = "en-US"
      utter.rate         = 0.88
      utter.pitch        = 1.1
      const voices       = window.speechSynthesis.getVoices()
      const voice        = pickBestVoice(voices)
      if (voice) utter.voice = voice
      utter.onstart = () => setAvatarSpeaking(true)
      utter.onend   = () => { setAvatarSpeaking(false); setAvatarAmplitude(0); onEnd?.() }
      utter.onerror = () => { setAvatarSpeaking(false); setAvatarAmplitude(0); onEnd?.() }
      window.speechSynthesis.speak(utter)
    }
  }, [])


  // ── STT ───────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const recognition          = new SR()
    recognition.lang           = "en-US"
    recognition.continuous     = true
    recognition.interimResults = true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let final = ""; let interim = ""
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
    const current: Answer = {
      question: MOCK_QUESTIONS[questionIndex],
      transcript: transcript.trim() || "(no answer recorded)",
    }
    const updated = [...answers, current]
    setAnswers(updated)

    console.log(`\n📝 Q${questionIndex + 1}: ${current.question}`)
    console.log(`💬 Answer: ${current.transcript}`)

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

  // ── DONE ─────────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" />
            <h1 className="text-3xl font-bold">Interview Complete!</h1>
            <p className="text-muted-foreground">Great job! Here's a summary of your responses.</p>
          </div>

          <div className="space-y-4 rounded-xl border bg-card p-6 max-h-[60vh] overflow-y-auto">
            {answers.map((a, i) => (
              <div key={i} className="space-y-1 border-b pb-4 last:border-0 last:pb-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Q{i + 1}</p>
                <p className="font-medium">{a.question}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.transcript}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={startInterview} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Retry
            </Button>
            <Button asChild className="gap-2">
              <Link href="/dashboard/interviews">
                <Home className="h-4 w-4" /> Back to Interviews
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-lg text-center space-y-8">
          {/* 3D Avatar in dark card */}
          <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-2xl">
            <AIAvatar3D isSpeaking={false} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground">
              I'll ask you <strong>10 questions</strong>. Speak your answers aloud —
              they'll be transcribed and recorded in real time.
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              <Badge variant="secondary">🎙 Voice answers</Badge>
              <Badge variant="secondary">📝 Live transcript</Badge>
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

  // ── INTERVIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <Link
          href="/dashboard/interviews"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => { window.speechSynthesis?.cancel(); recognitionRef.current?.abort() }}
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {questionIndex + 1} / {MOCK_QUESTIONS.length}
          </span>
          <Badge
            variant={phase === "ai-speaking" ? "default" : "secondary"}
            className="text-xs"
          >
            {phase === "ai-speaking" ? "🔊 AI Speaking…" : "🎙 Your Turn"}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main layout – single vertical column */}
      <div className="flex flex-1 flex-col items-center gap-5 p-4 max-w-2xl mx-auto w-full">

        {/* Avatar */}
        <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-2xl">
          <AIAvatar3D isSpeaking={avatarSpeaking} amplitude={avatarAmplitude} />
        </div>

        {/* Speaking wave indicator */}
        {avatarSpeaking && (
          <div className="flex items-end gap-1 h-5">
            {[2, 4, 6, 8, 6, 4, 2].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-indigo-500 animate-pulse"
                style={{ height: `${h * 3}px`, animationDelay: `${i * 70}ms` }}
              />
            ))}
            <span className="text-xs text-indigo-400 ml-2 self-center">Speaking…</span>
          </div>
        )}

        {/* Question card */}
        <div className="w-full rounded-2xl border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            {phase === "ai-speaking" ? "Question" : "Speak your answer…"}
          </p>
          <p className="text-lg font-semibold leading-snug">
            {MOCK_QUESTIONS[questionIndex]}
          </p>
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
                  ? "Microphone muted — unmute to answer."
                  : "Listening… speak now."
                : "Waiting for AI to finish…"}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex w-full items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
            onClick={toggleMute}
            disabled={phase !== "user-answering"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted
              ? <MicOff className="h-5 w-5 text-red-500" />
              : <Mic className={`h-5 w-5 ${listeningActive ? "text-green-500" : ""}`} />}
          </Button>

          <Button
            size="lg"
            className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={handleNext}
            disabled={phase === "ai-speaking"}
          >
            {questionIndex + 1 === MOCK_QUESTIONS.length ? "Finish Interview" : "Next Question"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center -mt-2">
          {listeningActive && !isMuted
            ? "🔴 Recording — click Next when done"
            : phase === "ai-speaking"
            ? "🔊 AI is speaking, please wait"
            : "—"}
        </p>
      </div>
    </div>
  )
}
