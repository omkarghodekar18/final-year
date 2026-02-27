"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Home,
  Loader2,
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

// Fallback questions if AI generation fails
const FALLBACK_QUESTIONS = [
  "Tell me about yourself and your professional background.",
  "What motivated you to apply for this role?",
  "Describe a challenging project you worked on and how you handled it.",
  "How do you prioritize tasks when you have multiple deadlines?",
  "Tell me about a time you had to work collaboratively in a team.",
]

type Phase = "intro" | "ai-speaking" | "user-answering" | "done"

interface Answer {
  question: string
  transcript: string
}

export default function InterviewSessionPage() {
  const params = useParams()
  const { getToken } = useAuth()

  const [questions, setQuestions]               = useState<string[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)
  const [phase, setPhase]                       = useState<Phase>("intro")
  const [questionIndex, setQuestionIndex]       = useState(0)
  const [transcript, setTranscript]             = useState("")
  const [isMuted, setIsMuted]                   = useState(false)
  const [answers, setAnswers]                   = useState<Answer[]>([])
  const [avatarSpeaking, setAvatarSpeaking]     = useState(false)
  const [avatarAmplitude, setAvatarAmplitude]   = useState(0)
  const [isRecording, setIsRecording]           = useState(false)
  const [isTranscribing, setIsTranscribing]     = useState(false)
  const [recordingError, setRecordingError]     = useState<string | null>(null)

  const audioCtxRef    = useRef<AudioContext | null>(null)
  const analyserRef    = useRef<AnalyserNode | null>(null)
  const animFrameRef   = useRef<number>(0)
  const sourceRef      = useRef<AudioBufferSourceNode | null>(null)
  // MediaRecorder refs
  const mediaRecRef    = useRef<MediaRecorder | null>(null)
  const chunksRef      = useRef<Blob[]>([])
  const streamRef      = useRef<MediaStream | null>(null)
  // Mirrors `transcript` so handleNext can read the live typed value synchronously
  const transcriptRef  = useRef<string>("")

  // ─── Fetch AI questions on mount ───────────────────────────────────────────
  useEffect(() => {
    let mounted = true
    async function initQuestions() {
      try {
        const token = await getToken()
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ job_id: params.id })
        })
        if (!res.ok) {
          if (res.status === 429 || res.status === 503) {
            if (mounted) setQuestions(FALLBACK_QUESTIONS)
            return
          }
          throw new Error(`Failed to fetch questions: ${res.status}`)
        }
        const data = await res.json()
        if (mounted) {
          setQuestions(data.questions?.length ? data.questions : FALLBACK_QUESTIONS)
        }
      } catch {
        if (mounted) setQuestions(FALLBACK_QUESTIONS)
      } finally {
        if (mounted) setLoadingQuestions(false)
      }
    }
    if (params.id) initQuestions()
    return () => { mounted = false }
  }, [params.id, getToken])

  // ─── TTS via edge-tts backend ──────────────────────────────────────────────
  const speak = useCallback(async (text: string, onEnd?: () => void) => {
    sourceRef.current?.stop()
    cancelAnimationFrame(animFrameRef.current)
    setAvatarAmplitude(0)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tts/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error(`TTS backend returned ${res.status}`)

      const audioData = await res.arrayBuffer()

      if (!audioCtxRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      const audioBuffer = await ctx.decodeAudioData(audioData)

      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser

      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(ctx.destination)
      sourceRef.current = source

      const dataArr = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(dataArr)
        const avg = dataArr.reduce((s, v) => s + v, 0) / dataArr.length
        setAvatarAmplitude(avg / 255)
        animFrameRef.current = requestAnimationFrame(tick)
      }

      setAvatarSpeaking(true)
      animFrameRef.current = requestAnimationFrame(tick)
      source.start()
      source.onended = () => {
        cancelAnimationFrame(animFrameRef.current)
        setAvatarSpeaking(false)
        setAvatarAmplitude(0)
        onEnd?.()
      }
    } catch {
      setAvatarSpeaking(false)
      setAvatarAmplitude(0)
      onEnd?.()
    }
  }, [])

  // ─── MediaRecorder: start capturing mic audio ──────────────────────────────
  const startRecording = useCallback(async () => {
    setRecordingError(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Prefer WebM (Chrome) → OGG (Firefox) → default
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : ""

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      // Collect chunks every second so we don't lose data on abrupt stops
      recorder.start(1000)
      setIsRecording(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("Permission") || msg.includes("denied") || msg.includes("NotAllowed")) {
        setRecordingError("Microphone access denied. Please allow mic permission, or type your answer below.")
      } else {
        setRecordingError("Could not access microphone. Please type your answer below.")
      }
    }
  }, [])

  // ─── Stop recording and send to Faster-Whisper backend ────────────────────
  const stopAndTranscribe = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const recorder = mediaRecRef.current

      // Stop all mic tracks
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setIsRecording(false)

      if (!recorder || recorder.state === "inactive") {
        // Nothing to transcribe — return whatever was typed manually
        resolve(transcriptRef.current)
        return
      }

      recorder.onstop = async () => {
        mediaRecRef.current = null
        const chunks = chunksRef.current
        chunksRef.current = []

        if (chunks.length === 0) {
          resolve(transcriptRef.current)
          return
        }

        setIsTranscribing(true)
        try {
          const blob = new Blob(chunks, { type: chunks[0].type || "audio/webm" })
          const form = new FormData()
          form.append("audio", blob, "recording.webm")

          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/stt/transcribe`,
            { method: "POST", body: form }
          )

          if (!res.ok) throw new Error(`STT backend returned ${res.status}`)

          const data = await res.json()
          const sttText = (data.transcript || "").trim()

          // Merge STT result with any manually typed text
          const typed = transcriptRef.current.trim()
          const merged = sttText
            ? typed
              ? `${sttText} ${typed}`
              : sttText
            : typed

          transcriptRef.current = merged
          setTranscript(merged)
          resolve(merged)
        } catch {
          // STT failed — fall back to whatever was typed
          resolve(transcriptRef.current)
        } finally {
          setIsTranscribing(false)
        }
      }

      recorder.stop()
    })
  }, [])

  // ─── Interview flow helpers ────────────────────────────────────────────────
  const askQuestion = useCallback(
    (index: number) => {
      setPhase("ai-speaking")
      setTranscript("")
      transcriptRef.current = ""
      setRecordingError(null)
      speak(questions[index], () => {
        setPhase("user-answering")
        startRecording()
      })
    },
    [speak, startRecording, questions]
  )

  const startInterview = () => {
    setQuestionIndex(0)
    setAnswers([])
    askQuestion(0)
  }

  const handleNext = async () => {
    // Stop mic and wait for transcript from backend
    const finalTranscript = await stopAndTranscribe()

    const current: Answer = {
      question: questions[questionIndex],
      transcript: finalTranscript.trim() || "(no answer recorded)",
    }
    const updated = [...answers, current]
    setAnswers(updated)

    if (questionIndex + 1 >= questions.length) {
      setPhase("done")
    } else {
      const next = questionIndex + 1
      setQuestionIndex(next)
      askQuestion(next)
    }
  }

  const toggleMute = () => {
    setIsMuted((m) => {
      if (!m) {
        // Muting — pause the recorder (keeps stream open but stops collecting)
        if (mediaRecRef.current?.state === "recording") {
          mediaRecRef.current.pause()
        }
      } else {
        // Unmuting — resume if we were recording
        if (mediaRecRef.current?.state === "paused") {
          mediaRecRef.current.resume()
        } else if (phase === "user-answering") {
          startRecording()
        }
      }
      return !m
    })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      mediaRecRef.current?.stop()
    }
  }, [])

  const progress = Math.round((questionIndex / Math.max(1, questions.length)) * 100)

  // ─── Done phase ────────────────────────────────────────────────────────────
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

  // ─── Intro phase ───────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="w-full max-w-lg text-center space-y-8">
          <div className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700 shadow-2xl">
            <AIAvatar3D isSpeaking={false} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground">
              {loadingQuestions ? (
                "Analyzing candidate profile and generating dynamic questions..."
              ) : (
                `I'll ask you ${questions.length} tailored questions based on your resume and the job description. Speak your answers aloud — they'll be transcribed and recorded in real time.`
              )}
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
            disabled={loadingQuestions}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 disabled:opacity-80"
          >
            {loadingQuestions ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating Questions…
              </>
            ) : (
              <>
                Start Interview <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Interview phase ───────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <Link
          href="/dashboard/interviews"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            window.speechSynthesis?.cancel()
            streamRef.current?.getTracks().forEach((t) => t.stop())
            mediaRecRef.current?.stop()
          }}
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Question {questionIndex + 1} / {questions.length}
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

      {/* Main layout */}
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
            {questions[questionIndex]}
          </p>
        </div>

        {/* Live transcript / answer box */}
        <div className="w-full rounded-xl border border-dashed bg-muted/30 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Your Answer (live)
          </p>

          {/* Error banner */}
          {recordingError && (
            <p className="text-xs text-red-500 font-medium">{recordingError}</p>
          )}

          {/* Transcribing indicator */}
          {isTranscribing && (
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Transcribing your answer…
            </div>
          )}

          {/* Live spoken text */}
          {transcript && !isTranscribing ? (
            <p className="text-sm leading-relaxed">{transcript}</p>
          ) : !isTranscribing && !recordingError ? (
            <p className="text-sm text-muted-foreground italic">
              {phase === "user-answering"
                ? isMuted
                  ? "Microphone muted — unmute to answer."
                  : "🔴 Recording… speak now."
                : "Waiting for AI to finish…"}
            </p>
          ) : null}

          {/* Typed-answer fallback */}
          {(recordingError || phase === "user-answering") && (
            <textarea
              rows={3}
              placeholder="Type your answer here (optional fallback)…"
              value={transcript}
              onChange={(e) => {
                transcriptRef.current = e.target.value
                setTranscript(e.target.value)
              }}
              className="w-full resize-none rounded-lg border bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              : <Mic className={`h-5 w-5 ${isRecording ? "text-green-500" : ""}`} />}
          </Button>

          <Button
            size="lg"
            className="flex-1 gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            onClick={handleNext}
            disabled={phase === "ai-speaking" || isTranscribing}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Transcribing…
              </>
            ) : questionIndex + 1 === questions.length ? (
              <>Finish Interview <ChevronRight className="h-4 w-4" /></>
            ) : (
              <>Next Question <ChevronRight className="h-4 w-4" /></>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center -mt-2">
          {isTranscribing
            ? "⏳ Processing your answer…"
            : isRecording && !isMuted
            ? "🔴 Recording — click Next when done"
            : phase === "ai-speaking"
            ? "🔊 AI is speaking, please wait"
            : "—"}
        </p>
      </div>
    </div>
  )
}
