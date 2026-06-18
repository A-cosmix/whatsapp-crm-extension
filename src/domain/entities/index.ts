export type ResumeGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export type CoverLetterStyle =
  | 'professional'
  | 'startup'
  | 'corporate'
  | 'creative'
  | 'tech';

export type InterviewDifficulty = 'easy' | 'medium' | 'hard';

export type JobTrackerStatus =
  | 'wishlist'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'career_boost';

export type JobBoard = 'linkedin' | 'indeed' | 'naukri' | 'glassdoor' | 'unknown';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  onboardingCompleted: boolean;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  content: string;
  uploadedAt: string;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  atsScore: number;
  grade: ResumeGrade;
  strength: number;
  missingKeywords: string[];
  missingSkills: string[];
  formattingIssues: string[];
  suggestions: string[];
  analyzedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  source: JobBoard;
  url: string;
  scrapedAt: string;
}

export interface JobMatch {
  id: string;
  jobId: string;
  resumeId: string;
  matchScore: number;
  missingSkills: string[];
  keywordGaps: string[];
  interviewChance: number;
  applicationStrength: number;
  matchedAt: string;
}

export interface OptimizedResume {
  id: string;
  resumeId: string;
  jobId: string;
  summary: string;
  skills: string[];
  experience: string;
  projects: string;
  atsFriendlyVersion: string;
  optimizedAt: string;
}

export interface CoverLetter {
  id: string;
  jobId: string;
  resumeId: string;
  style: CoverLetterStyle;
  content: string;
  generatedAt: string;
}

export interface ApplicationAnswer {
  question: string;
  answer: string;
}

export interface ApplicationAssistant {
  id: string;
  jobId: string;
  whyHireYou: string;
  aboutYourself: string;
  expectedSalary: string;
  shortBio: string;
  portfolioIntro: string;
  customAnswers: ApplicationAnswer[];
  generatedAt: string;
}

export interface InterviewQuestion {
  question: string;
  modelAnswer: string;
  difficulty: InterviewDifficulty;
  category: 'technical' | 'hr' | 'behavioral' | 'general';
}

export interface InterviewPrep {
  id: string;
  jobId: string;
  questions: InterviewQuestion[];
  generatedAt: string;
}

export interface LinkedInAudit {
  id: string;
  profileScore: number;
  headlineScore: number;
  experienceQuality: number;
  keywordOptimization: number;
  suggestions: string[];
  auditedAt: string;
}

export interface JobTrackerItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  url?: string;
  status: JobTrackerStatus;
  notes: string;
  appliedAt?: string;
  updatedAt: string;
}

export interface SalaryInsight {
  id: string;
  role: string;
  location: string;
  experienceYears: number;
  skills: string[];
  estimatedSalary: number;
  marketRange: { min: number; max: number };
  currency: string;
  generatedAt: string;
}

export interface CareerMilestone {
  title: string;
  description: string;
  duration: string;
}

export interface CareerRoadmap {
  id: string;
  dreamJob: string;
  plan30Day: CareerMilestone[];
  plan90Day: CareerMilestone[];
  plan6Month: CareerMilestone[];
  skillsToLearn: string[];
  courses: string[];
  projects: string[];
  generatedAt: string;
}

export interface UsageLimits {
  resumeScans: number;
  coverLetters: number;
  resumeScansUsed: number;
  coverLettersUsed: number;
}

export interface Subscription {
  plan: SubscriptionPlan;
  isActive: boolean;
  licenseKey?: string;
  purchasedAt?: string;
  expiresAt?: string;
}

export interface AppSettings {
  apiKey?: string;
  llmProvider: 'openai' | 'mock';
  autoScanJobs: boolean;
  notificationsEnabled: boolean;
  theme: 'dark' | 'light';
}
