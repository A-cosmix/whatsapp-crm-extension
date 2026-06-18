import {
  AnalyzeResumeUseCase,
  AuditLinkedInUseCase,
  AuthUseCase,
  EstimateSalaryUseCase,
  GenerateApplicationAssistantUseCase,
  GenerateCareerRoadmapUseCase,
  GenerateCoverLetterUseCase,
  GenerateInterviewPrepUseCase,
  JobTrackerUseCase,
  MatchJobUseCase,
  OptimizeResumeUseCase,
  SubscriptionUseCase,
} from '@application/use-cases';
import { MockLLMProvider } from '../llm/mock-llm-provider';
import { OpenAILLMProvider } from '../llm/openai-llm-provider';
import { LocalAuthService } from '../auth/local-auth-service';
import { PaymentService } from '../payments/payment-service';
import {
  ChromeCareerRoadmapRepository,
  ChromeCoverLetterRepository,
  ChromeJobMatchRepository,
  ChromeJobRepository,
  ChromeJobTrackerRepository,
  ChromeResumeAnalysisRepository,
  ChromeResumeRepository,
  ChromeSettingsRepository,
  ChromeSubscriptionRepository,
  ChromeUsageRepository,
  ChromeUserRepository,
} from '../storage/repositories';

const resumeRepo = new ChromeResumeRepository();
const analysisRepo = new ChromeResumeAnalysisRepository();
const jobRepo = new ChromeJobRepository();
const matchRepo = new ChromeJobMatchRepository();
const coverLetterRepo = new ChromeCoverLetterRepository();
const trackerRepo = new ChromeJobTrackerRepository();
const roadmapRepo = new ChromeCareerRoadmapRepository();
const userRepo = new ChromeUserRepository();
const subscriptionRepo = new ChromeSubscriptionRepository();
const usageRepo = new ChromeUsageRepository();
const settingsRepo = new ChromeSettingsRepository();
const authService = new LocalAuthService();
const paymentService = new PaymentService();

const mockLlm = new MockLLMProvider();
const openaiLlm = new OpenAILLMProvider(async () => {
  const settings = await settingsRepo.get();
  return settings.apiKey;
});

async function getLlm() {
  const settings = await settingsRepo.get();
  return settings.llmProvider === 'openai' && settings.apiKey ? openaiLlm : mockLlm;
}

async function isPremium(): Promise<boolean> {
  const sub = await subscriptionRepo.get();
  return sub.isActive && sub.plan !== 'free';
}

export const container = {
  repos: {
    resume: resumeRepo,
    analysis: analysisRepo,
    job: jobRepo,
    match: matchRepo,
    coverLetter: coverLetterRepo,
    tracker: trackerRepo,
    roadmap: roadmapRepo,
    user: userRepo,
    subscription: subscriptionRepo,
    usage: usageRepo,
    settings: settingsRepo,
  },
  services: {
    auth: authService,
    payment: paymentService,
  },
  useCases: {
    get analyzeResume() {
      return new AnalyzeResumeUseCase(resumeRepo, analysisRepo, usageRepo, subscriptionRepo, mockLlm);
    },
    get matchJob() {
      return new MatchJobUseCase(jobRepo, matchRepo, resumeRepo, mockLlm, isPremium);
    },
    get optimizeResume() {
      return new OptimizeResumeUseCase(resumeRepo, jobRepo, mockLlm, isPremium);
    },
    get generateCoverLetter() {
      return new GenerateCoverLetterUseCase(resumeRepo, jobRepo, coverLetterRepo, usageRepo, subscriptionRepo, mockLlm);
    },
    get generateApplicationAssistant() {
      return new GenerateApplicationAssistantUseCase(resumeRepo, jobRepo, mockLlm);
    },
    get generateInterviewPrep() {
      return new GenerateInterviewPrepUseCase(jobRepo, mockLlm, isPremium);
    },
    get auditLinkedIn() {
      return new AuditLinkedInUseCase(mockLlm, isPremium);
    },
    get jobTracker() {
      return new JobTrackerUseCase(trackerRepo);
    },
    get estimateSalary() {
      return new EstimateSalaryUseCase(mockLlm, isPremium);
    },
    get generateCareerRoadmap() {
      return new GenerateCareerRoadmapUseCase(roadmapRepo, resumeRepo, mockLlm, isPremium);
    },
    get auth() {
      return new AuthUseCase(authService);
    },
    get subscription() {
      return new SubscriptionUseCase(subscriptionRepo, paymentService);
    },
  },
  async getLlm() {
    return getLlm();
  },
  isPremium,
};

export type MessageType =
  | 'ANALYZE_RESUME'
  | 'MATCH_JOB'
  | 'OPTIMIZE_RESUME'
  | 'GENERATE_COVER_LETTER'
  | 'GENERATE_APPLICATION_ASSISTANT'
  | 'GENERATE_INTERVIEW_PREP'
  | 'AUDIT_LINKEDIN'
  | 'GET_TRACKER'
  | 'ADD_TRACKER_ITEM'
  | 'UPDATE_TRACKER_STATUS'
  | 'DELETE_TRACKER_ITEM'
  | 'ESTIMATE_SALARY'
  | 'GENERATE_ROADMAP'
  | 'GET_SUBSCRIPTION'
  | 'GET_USAGE'
  | 'GET_USER'
  | 'SIGN_IN'
  | 'SIGN_UP'
  | 'SIGN_OUT'
  | 'GET_SETTINGS'
  | 'SAVE_SETTINGS'
  | 'CREATE_CHECKOUT'
  | 'VERIFY_LICENSE'
  | 'JOB_DETECTED';

export interface ExtensionMessage {
  type: MessageType;
  payload?: unknown;
}

export async function handleMessage(message: ExtensionMessage): Promise<unknown> {
  const user = await userRepo.getCurrentUser();
  const userId = user?.id ?? 'anonymous';

  switch (message.type) {
    case 'ANALYZE_RESUME':
      return container.useCases.analyzeResume.execute(userId, message.payload as { fileName: string; content: string });
    case 'MATCH_JOB':
      return container.useCases.matchJob.execute(userId, message.payload);
    case 'OPTIMIZE_RESUME':
      return container.useCases.optimizeResume.execute(userId, (message.payload as { jobId: string }).jobId);
    case 'GENERATE_COVER_LETTER':
      return container.useCases.generateCoverLetter.execute(userId, (message.payload as { jobId: string }).jobId, message.payload);
    case 'GENERATE_APPLICATION_ASSISTANT':
      return container.useCases.generateApplicationAssistant.execute(userId, (message.payload as { jobId: string }).jobId);
    case 'GENERATE_INTERVIEW_PREP':
      return container.useCases.generateInterviewPrep.execute((message.payload as { jobId: string }).jobId, message.payload);
    case 'AUDIT_LINKEDIN':
      return container.useCases.auditLinkedIn.execute((message.payload as { profileContent: string }).profileContent);
    case 'GET_TRACKER':
      return container.useCases.jobTracker.getAll();
    case 'ADD_TRACKER_ITEM':
      return container.useCases.jobTracker.add(message.payload);
    case 'UPDATE_TRACKER_STATUS':
      return container.useCases.jobTracker.updateStatus(
        (message.payload as { id: string }).id,
        (message.payload as { status: import('@domain/entities').JobTrackerStatus }).status,
      );
    case 'DELETE_TRACKER_ITEM':
      await container.useCases.jobTracker.delete((message.payload as { id: string }).id);
      return { success: true };
    case 'ESTIMATE_SALARY':
      return container.useCases.estimateSalary.execute(message.payload);
    case 'GENERATE_ROADMAP':
      return container.useCases.generateCareerRoadmap.execute(userId, message.payload);
    case 'GET_SUBSCRIPTION':
      return container.useCases.subscription.getSubscription();
    case 'GET_USAGE':
      return usageRepo.get();
    case 'GET_USER':
      return user;
    case 'SIGN_IN':
      return container.useCases.auth.signIn(message.payload);
    case 'SIGN_UP':
      return container.useCases.auth.signUp(message.payload);
    case 'SIGN_OUT':
      await container.useCases.auth.signOut();
      return { success: true };
    case 'GET_SETTINGS':
      return settingsRepo.get();
    case 'SAVE_SETTINGS':
      await settingsRepo.save(message.payload as Partial<import('@domain/entities').AppSettings>);
      return { success: true };
    case 'CREATE_CHECKOUT':
      return container.useCases.subscription.createCheckout(
        (message.payload as { plan: import('@domain/entities').SubscriptionPlan }).plan,
        (message.payload as { provider: 'stripe' | 'razorpay' }).provider,
      );
    case 'VERIFY_LICENSE':
      return container.useCases.subscription.verifyLicense((message.payload as { licenseKey: string }).licenseKey);
    case 'JOB_DETECTED':
      return message.payload;
    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}
