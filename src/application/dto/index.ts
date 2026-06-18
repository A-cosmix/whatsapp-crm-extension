import { z } from 'zod';

export const ResumeUploadSchema = z.object({
  fileName: z.string().min(1),
  content: z.string().min(50, 'Resume content must be at least 50 characters'),
});

export const JobMatchRequestSchema = z.object({
  jobDescription: z.string().min(20),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  url: z.string().url().optional(),
});

export const CoverLetterRequestSchema = z.object({
  jobDescription: z.string().min(20),
  style: z.enum(['professional', 'startup', 'corporate', 'creative', 'tech']),
});

export const InterviewPrepRequestSchema = z.object({
  jobDescription: z.string().min(20),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

export const SalaryInsightRequestSchema = z.object({
  role: z.string().min(1),
  location: z.string().min(1),
  experienceYears: z.number().min(0).max(50),
  skills: z.array(z.string()),
});

export const CareerRoadmapRequestSchema = z.object({
  dreamJob: z.string().min(2),
  currentSkills: z.array(z.string()).optional(),
});

export const JobTrackerItemSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  location: z.string().optional(),
  salary: z.string().optional(),
  url: z.string().optional(),
  status: z.enum(['wishlist', 'applied', 'interview', 'offer', 'rejected']),
  notes: z.string().optional(),
});

export const AuthSignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const AuthSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
});

export const SettingsSchema = z.object({
  apiKey: z.string().optional(),
  llmProvider: z.enum(['openai', 'mock']).optional(),
  autoScanJobs: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional(),
  theme: z.enum(['dark', 'light']).optional(),
});

export type ResumeUploadDto = z.infer<typeof ResumeUploadSchema>;
export type JobMatchRequestDto = z.infer<typeof JobMatchRequestSchema>;
export type CoverLetterRequestDto = z.infer<typeof CoverLetterRequestSchema>;
export type InterviewPrepRequestDto = z.infer<typeof InterviewPrepRequestSchema>;
export type SalaryInsightRequestDto = z.infer<typeof SalaryInsightRequestSchema>;
export type CareerRoadmapRequestDto = z.infer<typeof CareerRoadmapRequestSchema>;
export type JobTrackerItemDto = z.infer<typeof JobTrackerItemSchema>;
export type AuthSignInDto = z.infer<typeof AuthSignInSchema>;
export type AuthSignUpDto = z.infer<typeof AuthSignUpSchema>;
export type SettingsDto = z.infer<typeof SettingsSchema>;

export const LOADING_STEPS = [
  'Scanning resume...',
  'Checking ATS compatibility...',
  'Analyzing skills...',
  'Matching recruiters...',
  'Generating recommendations...',
] as const;

export const SUCCESS_MESSAGE = 'Ready to get hired.';
