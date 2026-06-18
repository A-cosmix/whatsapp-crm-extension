import type {
  AppSettings,
  CareerRoadmap,
  CoverLetter,
  CoverLetterStyle,
  InterviewDifficulty,
  InterviewPrep,
  JobDescription,
  JobMatch,
  JobTrackerItem,
  JobTrackerStatus,
  LinkedInAudit,
  OptimizedResume,
  Resume,
  ResumeAnalysis,
  SalaryInsight,
  Subscription,
  UsageLimits,
  User,
} from '../entities';

export interface IResumeRepository {
  save(resume: Resume): Promise<void>;
  getById(id: string): Promise<Resume | null>;
  getLatest(userId: string): Promise<Resume | null>;
  getAll(userId: string): Promise<Resume[]>;
  delete(id: string): Promise<void>;
}

export interface IResumeAnalysisRepository {
  save(analysis: ResumeAnalysis): Promise<void>;
  getByResumeId(resumeId: string): Promise<ResumeAnalysis | null>;
  getLatest(userId: string): Promise<ResumeAnalysis | null>;
}

export interface IJobRepository {
  save(job: JobDescription): Promise<void>;
  getById(id: string): Promise<JobDescription | null>;
  getRecent(limit: number): Promise<JobDescription[]>;
}

export interface IJobMatchRepository {
  save(match: JobMatch): Promise<void>;
  getByJobAndResume(jobId: string, resumeId: string): Promise<JobMatch | null>;
}

export interface ICoverLetterRepository {
  save(letter: CoverLetter): Promise<void>;
  getAll(): Promise<CoverLetter[]>;
}

export interface IJobTrackerRepository {
  save(item: JobTrackerItem): Promise<void>;
  getAll(): Promise<JobTrackerItem[]>;
  getByStatus(status: JobTrackerStatus): Promise<JobTrackerItem[]>;
  updateStatus(id: string, status: JobTrackerStatus): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ICareerRoadmapRepository {
  save(roadmap: CareerRoadmap): Promise<void>;
  getLatest(): Promise<CareerRoadmap | null>;
}

export interface IUserRepository {
  getCurrentUser(): Promise<User | null>;
  save(user: User): Promise<void>;
  clear(): Promise<void>;
}

export interface ISubscriptionRepository {
  get(): Promise<Subscription>;
  save(subscription: Subscription): Promise<void>;
}

export interface IUsageRepository {
  get(): Promise<UsageLimits>;
  incrementResumeScans(): Promise<void>;
  incrementCoverLetters(): Promise<void>;
  reset(): Promise<void>;
}

export interface ISettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: Partial<AppSettings>): Promise<void>;
}

export interface ILLMProvider {
  analyzeResume(content: string): Promise<Omit<ResumeAnalysis, 'id' | 'resumeId' | 'analyzedAt'>>;
  matchJob(resumeContent: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'jobId' | 'resumeId' | 'matchedAt'>>;
  optimizeResume(resumeContent: string, jobDescription: string): Promise<Omit<OptimizedResume, 'id' | 'resumeId' | 'jobId' | 'optimizedAt'>>;
  generateCoverLetter(resumeContent: string, jobDescription: string, style: CoverLetterStyle): Promise<string>;
  generateApplicationAnswers(resumeContent: string, jobDescription: string): Promise<Omit<import('../entities').ApplicationAssistant, 'id' | 'jobId' | 'generatedAt'>>;
  generateInterviewPrep(jobDescription: string, difficulty: InterviewDifficulty): Promise<Omit<InterviewPrep, 'id' | 'jobId' | 'generatedAt'>>;
  auditLinkedInProfile(profileContent: string): Promise<Omit<LinkedInAudit, 'id' | 'auditedAt'>>;
  estimateSalary(role: string, location: string, experienceYears: number, skills: string[]): Promise<Omit<SalaryInsight, 'id' | 'generatedAt'>>;
  generateCareerRoadmap(dreamJob: string, currentSkills: string[]): Promise<Omit<CareerRoadmap, 'id' | 'generatedAt'>>;
}

export interface IAuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(email: string, password: string, name: string): Promise<User>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  resetPassword(email: string): Promise<void>;
}

export interface IPaymentService {
  createCheckout(plan: import('../entities').SubscriptionPlan, provider: 'stripe' | 'razorpay'): Promise<{ checkoutUrl: string; sessionId: string }>;
  verifyLicense(licenseKey: string): Promise<Subscription>;
}

export interface IJobBoardAdapter {
  readonly board: import('../entities').JobBoard;
  canHandle(url: string): boolean;
  extractJobDescription(): Promise<Omit<JobDescription, 'id' | 'scrapedAt'> | null>;
}
