"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Mail, MapPin, Briefcase, Calendar, Award, Loader2,
  Upload, FileText, CheckCircle2, XCircle, ExternalLink, Plus, X,
} from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

interface UserProfile {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  location?: string
  job_title?: string
  bio?: string
  profile_image_url?: string
  created_at?: string
  resume_url?: string
  skills?: string[]
}

interface ResumeUploadCardProps {
  resumeUrl: string
  savedSkills: string[]
  onUploaded: (resumeUrl: string, skills: string[]) => void
}

// ── Resume Upload Card ────────────────────────────────────────────────────────
function ResumeUploadCard({ resumeUrl, savedSkills, onUploaded }: ResumeUploadCardProps) {
  const { getToken } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [skills, setSkills] = useState<string[]>(savedSkills)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file")
      return
    }

    setResumeFile(file)
    setSkills([])
    setUploadError(null)
    setUploading(true)

    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append("resume", file)

      const res = await fetch(`${API_BASE}/api/parse-resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const json = await res.json()

      if (!res.ok || json.status === "error") {
        throw new Error(json.message || json.error || "Upload failed")
      }

      const newSkills = json.skills || []
      setSkills(newSkills)
      onUploaded(json.resume_url, newSkills)
      toast.success("Resume parsed successfully!")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to parse resume"
      setUploadError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }, [getToken])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }, [handleUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Resume
            </CardTitle>
            <CardDescription className="mt-1">Upload your resume to auto-extract skills</CardDescription>
          </div>
          {resumeUrl && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                window.open(resumeUrl, "_blank")
              }}
            >
              <ExternalLink className="h-4 w-4" />
              View Resume
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed
            p-8 transition-all duration-200
            ${dragOver
              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          {uploading ? (
            <>
              <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium">Parsing your resume…</p>
              <p className="text-xs text-muted-foreground">This may take a few seconds</p>
            </>
          ) : resumeFile && !uploadError ? (
            <>
              <CheckCircle2 className="mb-3 h-10 w-10 text-green-500" />
              <p className="text-sm font-medium text-green-600 dark:text-green-400">{resumeFile.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">Click or drag to upload a different resume</p>
            </>
          ) : (
            <>
              <div className="mb-3 rounded-full bg-primary/10 p-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">
                {uploadError
                  ? "Upload failed — try again"
                  : resumeUrl
                    ? "Drop a new resume to replace the current one"
                    : "Drop your resume here or click to browse"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF files only</p>
              {uploadError && (
                <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                  <XCircle className="h-3 w-3" />
                  {uploadError}
                </div>
              )}
            </>
          )}
        </div>


      </CardContent>
    </Card>
  )
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { getToken } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [bio, setBio] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [createdAt, setCreatedAt] = useState("")
  const [resumeUrl, setResumeUrl] = useState("")
  const [profileSkills, setProfileSkills] = useState<string[]>([])

  // Skills state
  const [newSkill, setNewSkill] = useState("")
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [savingSkills, setSavingSkills] = useState(false)

  // Snapshot of last-saved values (for Cancel)
  const [saved, setSaved] = useState<UserProfile>({})

  // ── Load profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to load profile")
        const data: UserProfile = await res.json()
        applyData(data)
        setSaved(data)
      } catch {
        toast.error("Could not load your profile")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyData = (data: UserProfile) => {
    setFirstName(data.first_name ?? "")
    setLastName(data.last_name ?? "")
    setEmail(data.email ?? "")
    setPhone(data.phone ?? "")
    setLocation(data.location ?? "")
    setJobTitle(data.job_title ?? "")
    setBio(data.bio ?? "")
    setProfileImageUrl(data.profile_image_url ?? "")
    setCreatedAt(data.created_at ?? "")
    setResumeUrl(data.resume_url ?? "")
    setProfileSkills(data.skills ?? [])
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          location,
          job_title: jobTitle,
          bio,
        }),
      })
      if (!res.ok) throw new Error("Update failed")
      const updated: UserProfile = await res.json()
      applyData(updated)
      setSaved(updated)
      toast.success("Profile updated successfully")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    applyData(saved)
  }

  // ── Derived values ────────────────────────────────────────────────────────
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "User"
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U"
  const joinedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : ""

  // ── Save skills ───────────────────────────────────────────────────────────
  const handleUpdateSkills = async (updatedSkills: string[]) => {
    setSavingSkills(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/api/skills`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills: updatedSkills }),
      })
      if (!res.ok) throw new Error("Failed to update skills")
      const updated: UserProfile = await res.json()
      setProfileSkills(updated.skills ?? [])
    } catch {
      toast.error("Failed to update skills")
    } finally {
      setSavingSkills(false)
    }
  }

  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      setIsAddingSkill(false)
      return
    }
    const updated = [...profileSkills, newSkill.trim()]
    handleUpdateSkills(updated)
    setNewSkill("")
    setIsAddingSkill(false)
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = profileSkills.filter((s) => s !== skillToRemove)
    handleUpdateSkills(updated)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Overview Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-primary/10">
                  <AvatarImage src={profileImageUrl || undefined} alt={fullName} />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">{initials}</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-xl font-semibold">{fullName}</h3>
                <p className="text-sm text-muted-foreground">{jobTitle || "No title set"}</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  Change Photo
                </Button>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{location || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{jobTitle || "—"}</span>
                </div>
                {joinedDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {joinedDate}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Achievements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">50 Interviews</Badge>
                  <Badge variant="secondary">Top Performer</Badge>
                  <Badge variant="secondary">Quick Learner</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and bio</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSave}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resume Upload */}
        <ResumeUploadCard
          resumeUrl={resumeUrl}
          savedSkills={profileSkills}
          onUploaded={(url, skills) => {
            setResumeUrl(url)
            setProfileSkills(skills)
          }}
        />

        {/* Skills & Interests */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label className="mb-3 flex items-center gap-2">
                  Technical Skills ({profileSkills.length})
                  {savingSkills && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  {profileSkills.length > 0 ? (
                    profileSkills.map((skill) => (
                      <Badge key={skill} className="flex items-center gap-1 group pr-1.5">
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="h-3.5 w-3.5 rounded-full opacity-50 transition-opacity hover:opacity-100 hover:bg-muted/20 flex items-center justify-center focus:outline-none"
                          disabled={savingSkills}
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Remove {skill}</span>
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground mr-2">No skills added yet.</p>
                  )}
                  
                  {isAddingSkill ? (
                    <Input
                      autoFocus
                      className="h-6 w-32 px-2 py-0 text-xs inline-flex"
                      placeholder="New skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddSkill()
                        if (e.key === "Escape") {
                          setIsAddingSkill(false)
                          setNewSkill("")
                        }
                      }}
                      onBlur={handleAddSkill}
                      disabled={savingSkills}
                    />
                  ) : (
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-dashed hover:bg-muted/50 text-muted-foreground flex items-center gap-1 py-0.5"
                      onClick={() => setIsAddingSkill(true)}
                    >
                      <Plus className="h-3 w-3" />
                      Add Skill
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
