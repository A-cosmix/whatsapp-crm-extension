import type { ILLMProvider } from '@domain/repositories/interfaces';
import type {
  ApplicationAssistant,
  CareerRoadmap,
  CoverLetterStyle,
  InterviewDifficulty,
  InterviewPrep,
  JobMatch,
  LinkedInAudit,
  OptimizedResume,
  ResumeAnalysis,
  SalaryInsight,
} from '@domain/entities';
import { calculateMatchScore, extractKeywords, scoreToGrade } from '@domain/value-objects';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLMProvider implements ILLMProvider {
  async analyzeResume(content: string): Promise<Omit<ResumeAnalysis, 'id' | 'resumeId' | 'analyzedAt'>> {
    await delay(1500);
    const keywords = extractKeywords(content);
    const atsScore = Math.min(95, 45 + keywords.length * 2 + Math.floor(content.length / 200));
    const commonMissing = ['Agile', 'CI/CD', 'Leadership', 'Cross-functional', 'Stakeholder Management'];
    const missingKeywords = commonMissing.filter((k) => !content.toLowerCase().includes(k.toLowerCase())).slice(0, 4);
    const techSkills = ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'GraphQL', 'Python', 'SQL'];
    const missingSkills = techSkills.filter((s) => !content.toLowerCase().includes(s.toLowerCase())).slice(0, 3);

    return {
      atsScore,
      grade: scoreToGrade(atsScore),
      strength: Math.min(100, atsScore + 5),
      missingKeywords,
      missingSkills,
      formattingIssues: atsScore < 70
        ? ['Consider using standard section headings', 'Avoid tables and graphics for ATS compatibility']
        : ['Resume formatting looks good'],
      suggestions: [
        'Add quantifiable achievements with metrics (%, $, time saved)',
        'Include role-specific keywords from target job descriptions',
        'Keep resume to 1-2 pages with clear section hierarchy',
        'Use action verbs: Led, Built, Optimized, Delivered',
        ...missingKeywords.map((k) => `Add "${k}" if relevant to your experience`),
      ],
    };
  }

  async matchJob(resumeContent: string, jobDescription: string): Promise<Omit<JobMatch, 'id' | 'jobId' | 'resumeId' | 'matchedAt'>> {
    await delay(1200);
    const resumeKw = extractKeywords(resumeContent);
    const jobKw = extractKeywords(jobDescription);
    const matchScore = calculateMatchScore(resumeKw, jobKw);
    const missingSkills = jobKw.filter((k) => !resumeKw.some((r) => r.toLowerCase() === k.toLowerCase())).slice(0, 6);

    return {
      matchScore,
      missingSkills,
      keywordGaps: missingSkills,
      interviewChance: Math.min(90, Math.round(matchScore * 0.85)),
      applicationStrength: Math.min(95, matchScore + 5),
    };
  }

  async optimizeResume(resumeContent: string, jobDescription: string): Promise<Omit<OptimizedResume, 'id' | 'resumeId' | 'jobId' | 'optimizedAt'>> {
    await delay(2000);
    const jobKw = extractKeywords(jobDescription).slice(0, 8);
    return {
      summary: `Results-driven professional with expertise in ${jobKw.slice(0, 3).join(', ')}. Proven track record of delivering high-impact solutions aligned with business objectives. Passionate about ${jobKw[3] ?? 'innovation'} and continuous improvement.`,
      skills: jobKw,
      experience: `• Led cross-functional initiatives resulting in measurable business impact\n• Architected and delivered solutions using ${jobKw.slice(0, 2).join(' and ')}\n• Collaborated with stakeholders to define requirements and deliver on time\n• Mentored team members and established best practices`,
      projects: `• Built end-to-end application leveraging ${jobKw[0] ?? 'modern technologies'} with focus on scalability\n• Implemented automated workflows reducing manual effort by 40%\n• Open-source contributor with active GitHub portfolio`,
      atsFriendlyVersion: `${resumeContent}\n\n--- OPTIMIZED FOR ATS ---\nKeywords: ${jobKw.join(', ')}`,
    };
  }

  async generateCoverLetter(resumeContent: string, jobDescription: string, style: CoverLetterStyle): Promise<string> {
    await delay(1800);
    const jobKw = extractKeywords(jobDescription).slice(0, 4);
    const toneMap: Record<CoverLetterStyle, string> = {
      professional: 'I am writing to express my strong interest',
      startup: "I'm excited about the opportunity to join your fast-moving team",
      corporate: 'I am pleased to submit my application for consideration',
      creative: 'Your mission resonates deeply with my creative journey',
      tech: 'As a technologist passionate about building scalable solutions',
    };
    return `Dear Hiring Manager,

${toneMap[style]} in this role. With a proven background in ${jobKw.join(', ')}, I am confident in my ability to contribute meaningfully to your team.

Throughout my career, I have consistently delivered results by combining technical expertise with strong communication skills. My experience aligns closely with your requirements, particularly in ${jobKw[0]} and ${jobKw[1] ?? 'collaborative problem-solving'}.

I am particularly drawn to this opportunity because of your company's commitment to innovation and excellence. I would welcome the chance to discuss how my skills and enthusiasm can benefit your organization.

Thank you for considering my application. I look forward to the opportunity to speak with you.

Best regards,
[Your Name]`;
  }

  async generateApplicationAnswers(resumeContent: string, jobDescription: string): Promise<Omit<ApplicationAssistant, 'id' | 'jobId' | 'generatedAt'>> {
    await delay(1500);
    const skills = extractKeywords(resumeContent).slice(0, 5);
    return {
      whyHireYou: `I bring a unique combination of ${skills.slice(0, 3).join(', ')} expertise and a proven track record of delivering results. I thrive in collaborative environments and consistently exceed expectations through attention to detail and proactive problem-solving.`,
      aboutYourself: `I'm a passionate professional with experience in ${skills.join(', ')}. I enjoy tackling complex challenges and turning them into elegant solutions. Outside of work, I stay current with industry trends and contribute to the tech community.`,
      expectedSalary: 'Based on my research and experience level, I am looking for a competitive package in the range of ₹8-12 LPA, though I am open to discussion based on the full compensation package and growth opportunities.',
      shortBio: `${skills[0]} enthusiast | Problem solver | Team player | Always learning`,
      portfolioIntro: `My portfolio showcases projects demonstrating proficiency in ${skills.slice(0, 3).join(', ')}. Each project reflects my commitment to clean code, user-centric design, and measurable impact.`,
      customAnswers: [
        { question: 'Why do you want to work here?', answer: `I'm impressed by your company's innovation in ${extractKeywords(jobDescription)[0] ?? 'the industry'} and believe my skills align perfectly with your team's goals.` },
        { question: 'What are your strengths?', answer: `My key strengths include ${skills.slice(0, 3).join(', ')}, adaptability, and strong communication skills.` },
      ],
    };
  }

  async generateInterviewPrep(jobDescription: string, difficulty: InterviewDifficulty): Promise<Omit<InterviewPrep, 'id' | 'jobId' | 'generatedAt'>> {
    await delay(2000);
    const skills = extractKeywords(jobDescription).slice(0, 4);
    const count = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 12;

    const templates = [
      { q: 'Tell me about yourself', cat: 'general' as const, a: 'Structure your answer: present role → key achievements → why this role interests you.' },
      { q: `Explain your experience with ${skills[0] ?? 'relevant technologies'}`, cat: 'technical' as const, a: 'Describe specific projects, challenges faced, and outcomes achieved.' },
      { q: 'Describe a challenging project and how you handled it', cat: 'behavioral' as const, a: 'Use STAR method: Situation, Task, Action, Result with quantifiable outcomes.' },
      { q: 'Where do you see yourself in 5 years?', cat: 'hr' as const, a: 'Align your goals with the company growth trajectory while showing ambition.' },
      { q: `How would you implement ${skills[1] ?? 'a scalable solution'}?`, cat: 'technical' as const, a: 'Discuss architecture, trade-offs, scalability considerations, and monitoring.' },
      { q: 'Why should we hire you?', cat: 'hr' as const, a: 'Highlight unique value proposition combining skills, experience, and cultural fit.' },
      { q: 'Tell me about a time you disagreed with a teammate', cat: 'behavioral' as const, a: 'Show emotional intelligence, conflict resolution, and focus on outcomes.' },
      { q: `What do you know about ${skills[2] ?? 'our industry'}?`, cat: 'general' as const, a: 'Demonstrate research about the company, industry trends, and competitive landscape.' },
    ];

    return {
      questions: templates.slice(0, count).map((t) => ({
        question: t.q,
        modelAnswer: t.a,
        difficulty,
        category: t.cat,
      })),
    };
  }

  async auditLinkedInProfile(profileContent: string): Promise<Omit<LinkedInAudit, 'id' | 'auditedAt'>> {
    await delay(1500);
    const keywords = extractKeywords(profileContent);
    const profileScore = Math.min(95, 40 + keywords.length * 3);
    return {
      profileScore,
      headlineScore: Math.min(90, profileScore - 5),
      experienceQuality: Math.min(88, profileScore - 8),
      keywordOptimization: Math.min(85, keywords.length * 4),
      suggestions: [
        'Craft a keyword-rich headline with your target role and top 3 skills',
        'Add a compelling About section with measurable achievements',
        'Request recommendations from colleagues and managers',
        'Post industry-relevant content weekly to boost visibility',
        'Enable "Open to Work" with specific role preferences',
        'Add featured section with portfolio links and certifications',
      ],
    };
  }

  async estimateSalary(role: string, location: string, experienceYears: number, skills: string[]): Promise<Omit<SalaryInsight, 'id' | 'generatedAt'>> {
    await delay(1000);
    const baseSalary = 400000 + experienceYears * 150000 + skills.length * 50000;
    const locationMultiplier = location.toLowerCase().includes('bangalore') || location.toLowerCase().includes('mumbai') ? 1.2 : 1.0;
    const estimated = Math.round(baseSalary * locationMultiplier);
    return {
      role,
      location,
      experienceYears,
      skills,
      estimatedSalary: estimated,
      marketRange: { min: Math.round(estimated * 0.8), max: Math.round(estimated * 1.3) },
      currency: 'INR',
    };
  }

  async generateCareerRoadmap(dreamJob: string, currentSkills: string[]): Promise<Omit<CareerRoadmap, 'id' | 'generatedAt'>> {
    await delay(2000);
    return {
      dreamJob,
      plan30Day: [
        { title: 'Skill Assessment', description: `Evaluate current skills against ${dreamJob} requirements`, duration: 'Week 1' },
        { title: 'Foundation Building', description: 'Complete core fundamentals course and set up dev environment', duration: 'Week 2-3' },
        { title: 'First Project', description: 'Build a portfolio project demonstrating key skills', duration: 'Week 4' },
      ],
      plan90Day: [
        { title: 'Advanced Skills', description: 'Master intermediate concepts and best practices', duration: 'Month 1-2' },
        { title: 'Portfolio Expansion', description: 'Complete 2-3 substantial projects with documentation', duration: 'Month 2' },
        { title: 'Networking', description: 'Connect with 50+ professionals in your target field', duration: 'Month 3' },
      ],
      plan6Month: [
        { title: 'Specialization', description: `Deep dive into ${dreamJob} specialization area`, duration: 'Month 4-5' },
        { title: 'Interview Prep', description: 'Practice technical and behavioral interviews weekly', duration: 'Month 5' },
        { title: 'Job Applications', description: 'Apply to 5-10 targeted positions per week', duration: 'Month 6' },
      ],
      skillsToLearn: ['Core fundamentals', 'Industry tools', 'System design', 'Communication', 'Portfolio building'],
      courses: [
        'FreeCodeCamp Full Curriculum',
        'Coursera Professional Certificate',
        'Udemy Best-Seller in your field',
      ],
      projects: [
        `Build a ${dreamJob} portfolio project`,
        'Contribute to open-source',
        'Create a technical blog with 5+ articles',
      ],
    };
  }
}
