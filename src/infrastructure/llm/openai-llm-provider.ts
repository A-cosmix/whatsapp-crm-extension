import type { ILLMProvider } from '@domain/repositories/interfaces';
import { MockLLMProvider } from './mock-llm-provider';

export class OpenAILLMProvider implements ILLMProvider {
  private mock = new MockLLMProvider();

  constructor(private readonly getApiKey: () => Promise<string | undefined>) {}

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = await this.getApiKey();
    if (!apiKey) return '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message?.content ?? '';
  }

  async analyzeResume(content: string) {
    try {
      const result = await this.callOpenAI(
        'You are an expert ATS resume analyzer. Return JSON with: atsScore (0-100), grade (A+/A/B/C/D/F), strength (0-100), missingKeywords (array), missingSkills (array), formattingIssues (array), suggestions (array).',
        content.slice(0, 8000),
      );
      if (result) {
        const parsed = JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
        return parsed;
      }
    } catch { /* fallback */ }
    return this.mock.analyzeResume(content);
  }

  async matchJob(resumeContent: string, jobDescription: string) {
    try {
      const result = await this.callOpenAI(
        'You are a job matching expert. Return JSON with: matchScore (0-100), missingSkills (array), keywordGaps (array), interviewChance (0-100), applicationStrength (0-100).',
        `Resume:\n${resumeContent.slice(0, 4000)}\n\nJob:\n${jobDescription.slice(0, 4000)}`,
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.matchJob(resumeContent, jobDescription);
  }

  async optimizeResume(resumeContent: string, jobDescription: string) {
    try {
      const result = await this.callOpenAI(
        'Optimize resume sections for the job. Return JSON with: summary, skills (array), experience, projects, atsFriendlyVersion.',
        `Resume:\n${resumeContent.slice(0, 4000)}\n\nJob:\n${jobDescription.slice(0, 4000)}`,
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.optimizeResume(resumeContent, jobDescription);
  }

  async generateCoverLetter(resumeContent: string, jobDescription: string, style: import('@domain/entities').CoverLetterStyle) {
    try {
      const result = await this.callOpenAI(
        `Write a ${style} cover letter. Return only the letter text.`,
        `Resume:\n${resumeContent.slice(0, 3000)}\n\nJob:\n${jobDescription.slice(0, 3000)}`,
      );
      if (result) return result;
    } catch { /* fallback */ }
    return this.mock.generateCoverLetter(resumeContent, jobDescription, style);
  }

  async generateApplicationAnswers(resumeContent: string, jobDescription: string) {
    try {
      const result = await this.callOpenAI(
        'Generate application answers. Return JSON with: whyHireYou, aboutYourself, expectedSalary, shortBio, portfolioIntro, customAnswers (array of {question, answer}).',
        `Resume:\n${resumeContent.slice(0, 3000)}\n\nJob:\n${jobDescription.slice(0, 3000)}`,
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.generateApplicationAnswers(resumeContent, jobDescription);
  }

  async generateInterviewPrep(jobDescription: string, difficulty: import('@domain/entities').InterviewDifficulty) {
    try {
      const result = await this.callOpenAI(
        `Generate ${difficulty} interview prep. Return JSON with questions array: {question, modelAnswer, difficulty, category}.`,
        jobDescription.slice(0, 4000),
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.generateInterviewPrep(jobDescription, difficulty);
  }

  async auditLinkedInProfile(profileContent: string) {
    try {
      const result = await this.callOpenAI(
        'Audit LinkedIn profile. Return JSON with: profileScore, headlineScore, experienceQuality, keywordOptimization (all 0-100), suggestions (array).',
        profileContent.slice(0, 4000),
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.auditLinkedInProfile(profileContent);
  }

  async estimateSalary(role: string, location: string, experienceYears: number, skills: string[]) {
    try {
      const result = await this.callOpenAI(
        'Estimate salary in INR. Return JSON with: role, location, experienceYears, skills, estimatedSalary, marketRange {min, max}, currency.',
        `Role: ${role}, Location: ${location}, Experience: ${experienceYears} years, Skills: ${skills.join(', ')}`,
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.estimateSalary(role, location, experienceYears, skills);
  }

  async generateCareerRoadmap(dreamJob: string, currentSkills: string[]) {
    try {
      const result = await this.callOpenAI(
        'Generate career roadmap. Return JSON with: dreamJob, plan30Day, plan90Day, plan6Month (arrays of {title, description, duration}), skillsToLearn, courses, projects.',
        `Dream Job: ${dreamJob}, Current Skills: ${currentSkills.join(', ')}`,
      );
      if (result) return JSON.parse(result.replace(/```json\n?|\n?```/g, ''));
    } catch { /* fallback */ }
    return this.mock.generateCareerRoadmap(dreamJob, currentSkills);
  }
}
