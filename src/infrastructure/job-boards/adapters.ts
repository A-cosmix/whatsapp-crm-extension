import type { IJobBoardAdapter } from '@domain/repositories/interfaces';
import type { JobBoard, JobDescription } from '@domain/entities';

function getTextContent(selector: string): string {
  const el = document.querySelector(selector);
  return el?.textContent?.trim() ?? '';
}

function getMetaContent(property: string): string {
  const el = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
  return el?.getAttribute('content') ?? '';
}

abstract class BaseJobBoardAdapter implements IJobBoardAdapter {
  abstract readonly board: JobBoard;

  abstract canHandle(url: string): boolean;

  async extractJobDescription(): Promise<Omit<JobDescription, 'id' | 'scrapedAt'> | null> {
    try {
      return this.extract();
    } catch {
      return null;
    }
  }

  protected abstract extract(): Omit<JobDescription, 'id' | 'scrapedAt'> | null;
}

export class LinkedInAdapter extends BaseJobBoardAdapter {
  readonly board: JobBoard = 'linkedin';

  canHandle(url: string): boolean {
    return url.includes('linkedin.com/jobs');
  }

  protected extract(): Omit<JobDescription, 'id' | 'scrapedAt'> | null {
    const title = getTextContent('.job-details-jobs-unified-top-card__job-title, h1.t-24, .jobs-unified-top-card__job-title');
    const company = getTextContent('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name a');
    const location = getTextContent('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet');
    const description = getTextContent('.jobs-description__content, .jobs-box__html-content, #job-details');

    if (!title && !description) return null;

    return {
      title: title || 'Unknown Position',
      company: company || 'Unknown Company',
      location: location || 'Not specified',
      description: description || document.body.innerText.slice(0, 5000),
      source: 'linkedin',
      url: window.location.href,
    };
  }
}

export class IndeedAdapter extends BaseJobBoardAdapter {
  readonly board: JobBoard = 'indeed';

  canHandle(url: string): boolean {
    return url.includes('indeed.com');
  }

  protected extract(): Omit<JobDescription, 'id' | 'scrapedAt'> | null {
    const title = getTextContent('h1.jobsearch-JobInfoHeader-title, [data-testid="jobsearch-JobInfoHeader-title"]');
    const company = getTextContent('[data-company-name="true"], .jobsearch-InlineCompanyRating a');
    const location = getTextContent('[data-testid="job-location"], .jobsearch-JobInfoHeader-subtitle div:last-child');
    const description = getTextContent('#jobDescriptionText, .jobsearch-jobDescriptionText');

    if (!title && !description) return null;

    return {
      title: title || 'Unknown Position',
      company: company || 'Unknown Company',
      location: location || 'Not specified',
      description: description || document.body.innerText.slice(0, 5000),
      source: 'indeed',
      url: window.location.href,
    };
  }
}

export class NaukriAdapter extends BaseJobBoardAdapter {
  readonly board: JobBoard = 'naukri';

  canHandle(url: string): boolean {
    return url.includes('naukri.com');
  }

  protected extract(): Omit<JobDescription, 'id' | 'scrapedAt'> | null {
    const title = getTextContent('.jd-header-title, h1.title');
    const company = getTextContent('.jd-header-comp-name, .comp-name');
    const location = getTextContent('.loc, .location');
    const description = getTextContent('.dang-inner-html, .job-desc');

    if (!title && !description) return null;

    return {
      title: title || 'Unknown Position',
      company: company || 'Unknown Company',
      location: location || 'Not specified',
      description: description || document.body.innerText.slice(0, 5000),
      source: 'naukri',
      url: window.location.href,
    };
  }
}

export class GlassdoorAdapter extends BaseJobBoardAdapter {
  readonly board: JobBoard = 'glassdoor';

  canHandle(url: string): boolean {
    return url.includes('glassdoor.');
  }

  protected extract(): Omit<JobDescription, 'id' | 'scrapedAt'> | null {
    const title = getTextContent('[data-test="job-title"], .JobDetails_jobDetailsHeader__Hd9M3 h1');
    const company = getTextContent('[data-test="employer-name"], .JobDetails_jobDetailsHeader__Hd9M3 a');
    const location = getTextContent('[data-test="location"], .JobDetails_location__mSg5h');
    const description = getTextContent('.JobDetails_jobDescription__uW_fK, [data-test="job-description"]');

    if (!title && !description) return null;

    return {
      title: title || 'Unknown Position',
      company: company || 'Unknown Company',
      location: location || 'Not specified',
      description: description || document.body.innerText.slice(0, 5000),
      source: 'glassdoor',
      url: window.location.href,
    };
  }
}

export const JOB_BOARD_ADAPTERS: IJobBoardAdapter[] = [
  new LinkedInAdapter(),
  new IndeedAdapter(),
  new NaukriAdapter(),
  new GlassdoorAdapter(),
];

export function getAdapterForUrl(url: string): IJobBoardAdapter | null {
  return JOB_BOARD_ADAPTERS.find((a) => a.canHandle(url)) ?? null;
}
