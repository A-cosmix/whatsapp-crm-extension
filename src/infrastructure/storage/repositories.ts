import type {
  ICareerRoadmapRepository,
  ICoverLetterRepository,
  IJobMatchRepository,
  IJobRepository,
  IJobTrackerRepository,
  IResumeAnalysisRepository,
  IResumeRepository,
  ISettingsRepository,
  ISubscriptionRepository,
  IUsageRepository,
  IUserRepository,
} from '@domain/repositories/interfaces';
import type {
  AppSettings,
  CareerRoadmap,
  CoverLetter,
  JobDescription,
  JobMatch,
  JobTrackerItem,
  JobTrackerStatus,
  Resume,
  ResumeAnalysis,
  Subscription,
  UsageLimits,
  User,
} from '@domain/entities';
import { FREE_LIMITS } from '@domain/value-objects';
import { getItem, setItem } from './chrome-storage';

export class ChromeResumeRepository implements IResumeRepository {
  private key = 'resumes';

  async save(resume: Resume): Promise<void> {
    const all = (await getItem<Resume[]>(this.key)) ?? [];
    const idx = all.findIndex((r) => r.id === resume.id);
    if (idx >= 0) all[idx] = resume;
    else all.push(resume);
    await setItem(this.key, all);
  }

  async getById(id: string): Promise<Resume | null> {
    const all = (await getItem<Resume[]>(this.key)) ?? [];
    return all.find((r) => r.id === id) ?? null;
  }

  async getLatest(userId: string): Promise<Resume | null> {
    const all = (await getItem<Resume[]>(this.key)) ?? [];
    const userResumes = all.filter((r) => r.userId === userId);
    return userResumes.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0] ?? null;
  }

  async getAll(userId: string): Promise<Resume[]> {
    const all = (await getItem<Resume[]>(this.key)) ?? [];
    return all.filter((r) => r.userId === userId);
  }

  async delete(id: string): Promise<void> {
    const all = (await getItem<Resume[]>(this.key)) ?? [];
    await setItem(this.key, all.filter((r) => r.id !== id));
  }
}

export class ChromeResumeAnalysisRepository implements IResumeAnalysisRepository {
  private key = 'analyses';

  async save(analysis: ResumeAnalysis): Promise<void> {
    const all = (await getItem<ResumeAnalysis[]>(this.key)) ?? [];
    const idx = all.findIndex((a) => a.id === analysis.id);
    if (idx >= 0) all[idx] = analysis;
    else all.push(analysis);
    await setItem(this.key, all);
  }

  async getByResumeId(resumeId: string): Promise<ResumeAnalysis | null> {
    const all = (await getItem<ResumeAnalysis[]>(this.key)) ?? [];
    return all.find((a) => a.resumeId === resumeId) ?? null;
  }

  async getLatest(userId: string): Promise<ResumeAnalysis | null> {
    const resumes = new ChromeResumeRepository();
    const userResumes = await resumes.getAll(userId);
    const resumeIds = new Set(userResumes.map((r) => r.id));
    const all = (await getItem<ResumeAnalysis[]>(this.key)) ?? [];
    return all
      .filter((a) => resumeIds.has(a.resumeId))
      .sort((a, b) => b.analyzedAt.localeCompare(a.analyzedAt))[0] ?? null;
  }
}

export class ChromeJobRepository implements IJobRepository {
  private key = 'jobs';

  async save(job: JobDescription): Promise<void> {
    const all = (await getItem<JobDescription[]>(this.key)) ?? [];
    all.push(job);
    await setItem(this.key, all.slice(-50));
  }

  async getById(id: string): Promise<JobDescription | null> {
    const all = (await getItem<JobDescription[]>(this.key)) ?? [];
    return all.find((j) => j.id === id) ?? null;
  }

  async getRecent(limit: number): Promise<JobDescription[]> {
    const all = (await getItem<JobDescription[]>(this.key)) ?? [];
    return all.slice(-limit).reverse();
  }
}

export class ChromeJobMatchRepository implements IJobMatchRepository {
  private key = 'matches';

  async save(match: JobMatch): Promise<void> {
    const all = (await getItem<JobMatch[]>(this.key)) ?? [];
    all.push(match);
    await setItem(this.key, all);
  }

  async getByJobAndResume(jobId: string, resumeId: string): Promise<JobMatch | null> {
    const all = (await getItem<JobMatch[]>(this.key)) ?? [];
    return all.find((m) => m.jobId === jobId && m.resumeId === resumeId) ?? null;
  }
}

export class ChromeCoverLetterRepository implements ICoverLetterRepository {
  private key = 'cover_letters';

  async save(letter: CoverLetter): Promise<void> {
    const all = (await getItem<CoverLetter[]>(this.key)) ?? [];
    all.push(letter);
    await setItem(this.key, all);
  }

  async getAll(): Promise<CoverLetter[]> {
    return (await getItem<CoverLetter[]>(this.key)) ?? [];
  }
}

export class ChromeJobTrackerRepository implements IJobTrackerRepository {
  private key = 'tracker';

  async save(item: JobTrackerItem): Promise<void> {
    const all = (await getItem<JobTrackerItem[]>(this.key)) ?? [];
    const idx = all.findIndex((i) => i.id === item.id);
    if (idx >= 0) all[idx] = item;
    else all.push(item);
    await setItem(this.key, all);
  }

  async getAll(): Promise<JobTrackerItem[]> {
    return (await getItem<JobTrackerItem[]>(this.key)) ?? [];
  }

  async getByStatus(status: JobTrackerStatus): Promise<JobTrackerItem[]> {
    const all = await this.getAll();
    return all.filter((i) => i.status === status);
  }

  async updateStatus(id: string, status: JobTrackerStatus): Promise<void> {
    const all = await this.getAll();
    const item = all.find((i) => i.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
      if (status === 'applied' && !item.appliedAt) {
        item.appliedAt = new Date().toISOString();
      }
      await setItem(this.key, all);
    }
  }

  async delete(id: string): Promise<void> {
    const all = await this.getAll();
    await setItem(this.key, all.filter((i) => i.id !== id));
  }
}

export class ChromeCareerRoadmapRepository implements ICareerRoadmapRepository {
  private key = 'roadmaps';

  async save(roadmap: CareerRoadmap): Promise<void> {
    const all = (await getItem<CareerRoadmap[]>(this.key)) ?? [];
    all.push(roadmap);
    await setItem(this.key, all);
  }

  async getLatest(): Promise<CareerRoadmap | null> {
    const all = (await getItem<CareerRoadmap[]>(this.key)) ?? [];
    return all.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0] ?? null;
  }
}

export class ChromeUserRepository implements IUserRepository {
  private key = 'user';

  async getCurrentUser(): Promise<User | null> {
    return getItem<User>(this.key);
  }

  async save(user: User): Promise<void> {
    await setItem(this.key, user);
  }

  async clear(): Promise<void> {
    await setItem(this.key, null);
  }
}

export class ChromeSubscriptionRepository implements ISubscriptionRepository {
  private key = 'subscription';

  async get(): Promise<Subscription> {
    return (await getItem<Subscription>(this.key)) ?? {
      plan: 'free',
      isActive: true,
    };
  }

  async save(subscription: Subscription): Promise<void> {
    await setItem(this.key, subscription);
  }
}

export class ChromeUsageRepository implements IUsageRepository {
  private key = 'usage';

  async get(): Promise<UsageLimits> {
    return (await getItem<UsageLimits>(this.key)) ?? {
      resumeScans: FREE_LIMITS.resumeScans,
      coverLetters: FREE_LIMITS.coverLetters,
      resumeScansUsed: 0,
      coverLettersUsed: 0,
    };
  }

  async incrementResumeScans(): Promise<void> {
    const usage = await this.get();
    usage.resumeScansUsed += 1;
    await setItem(this.key, usage);
  }

  async incrementCoverLetters(): Promise<void> {
    const usage = await this.get();
    usage.coverLettersUsed += 1;
    await setItem(this.key, usage);
  }

  async reset(): Promise<void> {
    await setItem(this.key, {
      resumeScans: FREE_LIMITS.resumeScans,
      coverLetters: FREE_LIMITS.coverLetters,
      resumeScansUsed: 0,
      coverLettersUsed: 0,
    });
  }
}

export class ChromeSettingsRepository implements ISettingsRepository {
  private key = 'settings';

  async get(): Promise<AppSettings> {
    return (await getItem<AppSettings>(this.key)) ?? {
      llmProvider: 'mock',
      autoScanJobs: true,
      notificationsEnabled: true,
      theme: 'dark',
    };
  }

  async save(settings: Partial<AppSettings>): Promise<void> {
    const current = await this.get();
    await setItem(this.key, { ...current, ...settings });
  }
}
