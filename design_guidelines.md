# MeetMate AI Design Guidelines

## Design Approach
**Reference-Based + Dark Theme SaaS**: Modern AI SaaS dashboard inspired by products like Linear, Notion, and Vercel - clean, minimal, with sophisticated dark theme and optional light mode toggle.

---

## Theme & Color Philosophy
- **Default Dark Theme** with light/dark mode toggle in top-right navbar
- Modern SaaS aesthetic with cards, shadows, rounded corners, and clear spacing
- **Accent color**: Blue or purple for primary buttons and highlights
- Soft shadows with hover states and smooth transitions throughout

---

## Typography
- **Large headings** for major sections (hero, main dashboard areas)
- **Smaller card titles** for individual components
- **Clear hierarchy**: Hero title → Section titles → Card headers → Body text
- Professional, readable font stack suitable for a SaaS dashboard

---

## Layout System

### Spacing
Use Tailwind spacing units: primarily `4, 6, 8, 12, 16, 20, 24` for consistent rhythm
- Cards: `p-6` or `p-8`
- Section spacing: `py-12` to `py-20`
- Component gaps: `gap-4` to `gap-8`

### Container Strategy
- Main content: `max-w-6xl mx-auto` for dashboard section
- Full-width navbar with inner max-width container
- Responsive: Two-column desktop, stacked mobile

---

## Core Components

### Navbar (Sticky Top)
- Left: Logo mark (circle with "MM") + "MeetMate AI" text
- Right: Links ("Product", "How it works", "Demo") + "Try Live Demo" button + Theme toggle (🌞/🌙)
- Subtle blur or shadow effect for depth

### Hero Section
**Two-column layout (stacked on mobile)**:
- **Left**: 
  - Large title: "Turn any meeting link into instant tasks, decisions & follow-ups."
  - Subtitle explaining paste Google Meet/Zoom/Teams/YouTube links
  - 3 pill badges: "AI Meeting Intelligence", "Built for Hackathons & Startups", "No manual note-taking"
  - Primary CTA: "Paste a meeting link below" (scrolls to app)
- **Right**: 
  - Mock preview card showing dashboard sample (screenshot-style visualization)

### Main Dashboard (Two-Column Desktop)

**Left Panel - Input Card**:
- Card title: "1. Paste your meeting link"
- Full-width text input with placeholder examples
- Meeting type dropdown: Team Standup, Client Call, Project Review, Classroom Session, Brainstorming
- Language dropdown: English, Hindi, Kannada, Other
- Checkbox/toggle: "This is a short sample meeting (for demo)"
- Primary button: "Analyze Meeting" (with loading state "Analyzing…")
- Secondary ghost button: "Use sample meeting link"
- Small info text about hackathon demo simulation

**Right Panel - Results Dashboard Card**:
Card titled "2. AI Meeting Intelligence Report" containing:

1. **Summary Card**: 3-5 bullet points + pill tags (Duration: 30 min, Participants: 4, Mood: Mostly Positive)

2. **Decisions Card**: Numbered list with "Auto-detected by AI" badge

3. **Action Items Table**: Columns (Task, Owner, Deadline, Priority with colored badges Low/Medium/High) + "Copy as checklist" button

4. **Problems/Blockers**: Bullet list with ⚠️ icon in header

5. **Sentiment Timeline**: Simple chart/graph placeholder with Start/Middle/End labels + color legend (Green=Positive, Red=Negative, Yellow=Neutral) + one-line insight text

6. **Auto Email Draft**: Read-only textarea/styled box with sample email + "Copy email" and "Open in mail app" buttons

### How It Works Section
**3-step horizontal timeline**:
1. "Paste meeting link" - with icon and description
2. "AI analyzes the conversation" - transcription + summarization details  
3. "Get instant report & email" - share with team

Each step in card-like appearance with clear icons

### Footer
- Credit text: "Built in 20 hours for [Hackathon Name] by [Your Name]. Powered by AI."
- Optional links: GitHub, LinkedIn, Privacy

---

## Visual Design Details
- **Rounded corners**: `rounded-xl` for all cards
- **Shadows**: Soft, layered shadows for depth
- **Interactive states**: Hover effects, smooth transitions on all clickable elements
- **Loading states**: Spinner icons + disabled states for buttons during processing
- **Badges/Pills**: Rounded, colored tags for categories and status indicators
- **Priority indicators**: Color-coded badges (Low/Medium/High) in tables

---

## Responsive Behavior
- **Desktop**: Two-column layouts, horizontal tabs/sections
- **Tablet**: Maintain two columns where possible, reduce spacing
- **Mobile**: 
  - Stack all columns vertically
  - Full-width cards
  - Navbar collapses to menu icon
  - Tables scroll horizontally or reformat to cards

---

## Images
No hero image required. Use:
- **Right side of hero**: Mock dashboard preview card (illustrated/screenshot-style showing the interface)
- **Optional icons**: Step icons in "How It Works" section
- **Logo mark**: Simple "MM" circle or minimal icon in navbar

---

## Interactive Elements
- Theme toggle animation (sun/moon transition)
- Button loading states with spinners
- Smooth scroll to dashboard section
- Copy-to-clipboard feedback animations
- Tab/section switching (if using tabs for results)
- Hover states on all cards and buttons
- Form input focus states

---

## Key Design Principles
1. **SaaS Polish**: Professional, production-ready aesthetic suitable for hackathon demo
2. **Visual Hierarchy**: Clear separation between input, processing, and results
3. **Information Density**: Rich dashboard without overwhelming - strategic use of cards and sections
4. **Accessibility**: Clear labels, sufficient contrast, keyboard navigation support
5. **Demo-Ready**: Visual states for loading, empty states, and populated results with dummy data