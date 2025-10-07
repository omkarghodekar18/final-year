import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, MapPin, Briefcase, Calendar, Award } from "lucide-react"

export default function ProfilePage() {
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
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="James Anderson" />
                  <AvatarFallback className="bg-primary/10 text-2xl text-primary">JA</AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-xl font-semibold">James Anderson</h3>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
                <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                  Change Photo
                </Button>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>james.anderson@email.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>5 years experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined March 2024</span>
                </div>
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
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue="James" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue="Anderson" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="james.anderson@email.com" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue="San Francisco, CA" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" defaultValue="Software Engineer" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    defaultValue="Passionate software engineer with 5 years of experience in full-stack development. Currently preparing for senior engineering roles at top tech companies."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline">Cancel</Button>
                  <Button>Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Skills & Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
            <CardDescription>Areas you're focusing on for interview preparation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Technical Skills</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge>JavaScript</Badge>
                  <Badge>React</Badge>
                  <Badge>Node.js</Badge>
                  <Badge>Python</Badge>
                  <Badge>System Design</Badge>
                  <Badge>Algorithms</Badge>
                  <Badge>Data Structures</Badge>
                  <Badge>TypeScript</Badge>
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Interview Types</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Behavioral</Badge>
                  <Badge variant="secondary">Technical</Badge>
                  <Badge variant="secondary">System Design</Badge>
                  <Badge variant="secondary">Leadership</Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit Skills
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
