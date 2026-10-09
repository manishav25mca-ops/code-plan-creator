import type { ProjectDetails } from "@/lib/plan-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const EXAMPLES: Array<Partial<ProjectDetails> & { title: string }> = [
  {
    title: "Student Attendance Management System",
    description:
      "Allows faculty members to mark student attendance, students to view their attendance percentage, and administrators to manage student and faculty records.",
    projectType: "Web Application",
    duration: "8 weeks",
    teamSize: "3",
    experience: "Intermediate",
  },
  {
    title: "Campus Lost & Found Mobile App",
    description: "Students post lost or found items with photos and location, and get notified when a match appears.",
    projectType: "Mobile Application",
    duration: "6 weeks",
    teamSize: "2",
    experience: "Beginner",
  },
  {
    title: "Fake News Detection using NLP",
    description: "Classify news headlines and articles as real or fake, with a simple web demo to test inputs.",
    projectType: "AI/ML Project",
    duration: "10 weeks",
    teamSize: "2",
    experience: "Advanced",
  },
];

const TYPES = ["Web Application", "Mobile Application", "AI/ML Project", "Other"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

interface Props {
  value: ProjectDetails;
  onChange: (v: ProjectDetails) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function ProjectForm({ value, onChange, onSubmit, loading, error }: Props) {
  const set = (k: keyof ProjectDetails) => (v: string) => onChange({ ...value, [k]: v });
  const ideaTooShort = value.title.trim().length < 3;

  return (
    <form
      className="rounded-xl border bg-card p-5 shadow-sm sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ideaTooShort && !loading) onSubmit();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-semibold">
          Project title or idea <span className="text-accent">*</span>
        </Label>
        <Input
          id="title"
          required
          maxLength={200}
          placeholder="e.g. Student Attendance Management System"
          value={value.title}
          onChange={(e) => set("title")(e.target.value)}
          className="h-12 text-base"
        />
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="desc">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea
          id="desc"
          rows={3}
          maxLength={3000}
          placeholder="Who uses it and what should it do?"
          value={value.description}
          onChange={(e) => set("description")(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <Label>Project type</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <Chip key={t} active={value.projectType === t} onClick={() => set("projectType")(value.projectType === t ? "" : t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-3">
          <Label htmlFor="stack">Preferred technology stack</Label>
          <Input id="stack" maxLength={300} placeholder="e.g. React, Node.js, MySQL — or leave blank" value={value.techStack} onChange={(e) => set("techStack")(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="team">Team size</Label>
          <Input id="team" type="number" min={1} max={50} placeholder="e.g. 3" value={value.teamSize} onChange={(e) => set("teamSize")(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dur">Duration</Label>
          <Input id="dur" maxLength={100} placeholder="e.g. 8 weeks" value={value.duration} onChange={(e) => set("duration")(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Experience</Label>
          <div className="flex gap-1.5">
            {LEVELS.map((l) => (
              <Chip key={l} active={value.experience === l} onClick={() => set("experience")(value.experience === l ? "" : l)}>
                {l}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={ideaTooShort || loading} className="mt-6 h-12 w-full text-base">
        {loading ? "Generating your plan…" : "Generate Project Plan"}
      </Button>
    </form>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}
