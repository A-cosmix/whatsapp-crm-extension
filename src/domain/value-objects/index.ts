import type { ResumeGrade } from '../entities';

export function scoreToGrade(score: number): ResumeGrade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function calculateMatchScore(
  resumeKeywords: string[],
  jobKeywords: string[],
): number {
  if (jobKeywords.length === 0) return 0;
  const resumeSet = new Set(resumeKeywords.map((k) => k.toLowerCase()));
  const matched = jobKeywords.filter((k) => resumeSet.has(k.toLowerCase()));
  return Math.round((matched.length / jobKeywords.length) * 100);
}

export function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will',
    'your', 'our', 'are', 'was', 'been', 'being', 'about', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
    'same', 'than', 'too', 'very', 'can', 'just', 'should', 'now', 'also', 'able',
    'experience', 'years', 'work', 'team', 'role', 'position', 'company',
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !commonWords.has(w));

  const techPatterns = text.match(
    /\b(?:React|TypeScript|JavaScript|Python|Java|Node\.?js|AWS|Docker|Kubernetes|SQL|MongoDB|GraphQL|REST|API|CI\/CD|Agile|Scrum|Git|Linux|Azure|GCP|Flutter|Swift|Kotlin|Go|Rust|C\+\+|C#|PHP|Ruby|Vue|Angular|Next\.?js|Tailwind|Figma|Jira|Salesforce|SAP|Excel|PowerBI|Tableau|Machine Learning|AI|ML|Data Science|DevOps|Full[- ]?Stack|Frontend|Backend|Mobile|Cloud|Microservices|Terraform|Ansible|Jenkins|PostgreSQL|Redis|Kafka|Spark|Hadoop|TensorFlow|PyTorch|LLM|NLP|Computer Vision|Blockchain|Web3|Cybersecurity|Networking|SDLC|UML|BPMN|ERP|CRM|SEO|SEM|Google Analytics|HubSpot|Marketo|Salesforce|Zendesk|ServiceNow|Workday|SAP|Oracle|NetSuite|QuickBooks|Xero|Stripe|PayPal|Shopify|WordPress|Drupal|Magento|WooCommerce|Squarespace|Wix|Webflow|Framer|Sketch|Adobe|Photoshop|Illustrator|InDesign|Premiere|After Effects|Blender|Maya|Unity|Unreal|Godot|Cocos|Phaser|Pixi|Three\.js|WebGL|OpenGL|Vulkan|DirectX|Metal|CUDA|OpenCL|MPI|OpenMP|pthread|asyncio|coroutine|generator|iterator|decorator|metaclass|descriptor|contextmanager|dataclass|namedtuple|enum|abc|typing|generic|protocol|overload|literal|final|override|staticmethod|classmethod|property|super|init|new|del|repr|str|bytes|hash|eq|ne|lt|le|gt|ge|bool|int|float|complex|list|dict|set|tuple|frozenset|range|slice|memoryview|bytearray|buffer|array|struct|codecs|io|os|sys|re|math|random|statistics|decimal|fractions|cmath|datetime|calendar|time|locale|gettext|stringprep|unicodedata|code|compile|dis|pickle|copy|pprint|reprlib|enum|numbers|collections|heapq|bisect|weakref|types|copyreg|gc|inspect|site|importlib|pkgutil|modulefinder|runpy|ast|symtable|symbol|token|tokenize|keyword|tabnanny|pyclbr|py_compile|compileall|dis|pickletools|platform|errno|ctypes|msvcrt|winreg|winsound|posix|pwd|grp|termios|tty|pty|fcntl|pipes|resource|nis|syslog|logging|warnings|contextlib|abc|atexit|traceback|future|__future__|gc|inspect|site|code|codeop|zipapp|venv|ensurepip|zipimport|pkgutil|modulefinder|runpy|importlib|pydoc|doctest|unittest|test|lib2to3|typing_extensions)\b/gi,
  );

  const techSkills = techPatterns ? [...new Set(techPatterns.map((t) => t.trim()))] : [];
  const uniqueWords = [...new Set(words)];
  return [...new Set([...techSkills, ...uniqueWords.slice(0, 30)])];
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export const FREE_LIMITS = {
  resumeScans: 3,
  coverLetters: 3,
} as const;

export const PLAN_FEATURES: Record<string, string[]> = {
  free: ['3 Resume Scans', '3 Cover Letters', 'Basic ATS Score'],
  starter: ['10 Resume Scans/month', '10 Cover Letters/month', 'ATS Score', 'Job Tracker'],
  pro: ['Unlimited Analysis', 'Unlimited Cover Letters', 'Resume Optimization', 'Job Match Scoring', 'Interview Prep AI'],
  career_boost: ['Everything in Pro', 'Career Roadmaps', 'LinkedIn Auditor', 'Salary Insights', 'Priority Processing'],
};

export const PLAN_PRICES: Record<string, number> = {
  starter: 499,
  pro: 1999,
  career_boost: 2999,
};
