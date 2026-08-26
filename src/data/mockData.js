export const jobs = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "Northstar Labs",
    location: "Remote",
    salary: "$95k - $125k",
    state: "Open",
    department: "Engineering",
    applicants: 38,
    stage: "Screening",
    description:
      "Build polished React interfaces for a hiring analytics platform used by distributed recruiting teams.",
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Atlas Health",
    location: "New York, NY",
    salary: "$105k - $140k",
    state: "Open",
    department: "Design",
    applicants: 24,
    stage: "Interview",
    description:
      "Own end-to-end product design for scheduling, candidate communication, and recruiter workflows.",
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "HelioCloud",
    location: "Austin, TX",
    salary: "$110k - $150k",
    state: "Open",
    department: "Engineering",
    applicants: 31,
    stage: "Offer",
    description:
      "Design APIs, background jobs, and integrations that keep the applicant pipeline moving reliably.",
  },
  {
    id: 4,
    title: "Recruiting Coordinator",
    company: "BrightPath",
    location: "Chicago, IL",
    salary: "$58k - $72k",
    state: "Paused",
    department: "People",
    applicants: 17,
    stage: "Sourcing",
    description:
      "Coordinate interview loops, candidate touchpoints, and weekly hiring manager updates.",
  },
  {
    id: 5,
    title: "Data Analyst",
    company: "MarketPulse",
    location: "Remote",
    salary: "$82k - $104k",
    state: "Open",
    department: "Analytics",
    applicants: 29,
    stage: "Review",
    description:
      "Create reporting dashboards that show source quality, conversion rates, and hiring velocity.",
  },
  {
    id: 6,
    title: "Customer Success Manager",
    company: "Cobalt CRM",
    location: "San Francisco, CA",
    salary: "$90k - $118k",
    state: "Closed",
    department: "Customer",
    applicants: 45,
    stage: "Hired",
    description:
      "Lead onboarding and retention programs for mid-market customers adopting a new CRM suite.",
  },
];

export const candidates = [
  { id: 1, name: "Maya Chen", role: "Frontend Engineer", stage: "Technical Interview", score: 92, source: "LinkedIn", nextStep: "Pairing exercise" },
  { id: 2, name: "Jordan Smith", role: "Product Designer", stage: "Portfolio Review", score: 88, source: "Referral", nextStep: "Hiring manager call" },
  { id: 3, name: "Sofia Ramirez", role: "Data Analyst", stage: "Screening", score: 84, source: "Indeed", nextStep: "SQL assessment" },
  { id: 4, name: "Noah Patel", role: "Backend Developer", stage: "Offer", score: 95, source: "Talent pool", nextStep: "Comp approval" },
  { id: 5, name: "Avery Brooks", role: "Recruiting Coordinator", stage: "Sourcing", score: 79, source: "Career site", nextStep: "Initial outreach" },
];

export const interviews = [
  {
    id: 1,
    candidate: "Maya Chen",
    role: "Frontend Engineer",
    date: "Today",
    time: "10:30 AM",
    interviewer: "Lena Torres",
    type: "Technical",
    duration: "45 min",
    meetingId: 1,
  },
  {
    id: 2,
    candidate: "Jordan Smith",
    role: "Product Designer",
    date: "Tomorrow",
    time: "2:00 PM",
    interviewer: "Priya Shah",
    type: "Portfolio",
    duration: "30 min",
    meetingId: 2,
  },
  {
    id: 3,
    candidate: "Noah Patel",
    role: "Backend Developer",
    date: "Fri",
    time: "11:15 AM",
    interviewer: "Marcus Lee",
    type: "Final",
    duration: "60 min",
    meetingId: 3,
  },
];

export const pipelineStages = [
  { name: "Sourcing", count: 18, color: "bg-sky-400" },
  { name: "Review", count: 24, color: "bg-indigo-400" },
  { name: "Screening", count: 14, color: "bg-amber-400" },
  { name: "Interview", count: 9, color: "bg-emerald-400" },
  { name: "Offer", count: 3, color: "bg-rose-400" },
];
