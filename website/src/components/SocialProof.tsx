import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Reveal } from './effects/Reveal';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Creator & YouTuber',
    avatar: 'SC',
    text: 'Momentum X completely changed how I work. The AI summaries alone save me 2 hours every day. It feels like having a genius assistant in my browser.',
    rating: 5,
  },
  {
    name: 'Marcus Rivera',
    role: 'Senior Engineer @ Stripe',
    avatar: 'MR',
    text: 'As a developer, I\'m skeptical of productivity tools. But Momentum X is different — it\'s fast, minimal, and the AI actually understands context. Game changer.',
    rating: 5,
  },
  {
    name: 'Dr. Emily Watson',
    role: 'Productivity Researcher',
    avatar: 'EW',
    text: 'The focus mode and analytics gave me insights I never had before. This is what the future of knowledge work looks like.',
    rating: 5,
  },
  {
    name: 'Alex Kim',
    role: 'Startup Founder',
    avatar: 'AK',
    text: 'We switched our entire team to Momentum X. Cross-device sync and smart notifications alone justified the upgrade. Our output increased 40%.',
    rating: 5,
  },
  {
    name: 'Jordan Lee',
    role: 'Design Lead @ Figma',
    avatar: 'JL',
    text: 'The UI is absolutely stunning. It\'s rare to find a tool that\'s both beautiful and functional. Momentum X nails both.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Content Strategist',
    avatar: 'PS',
    text: 'AI-generated notes from my research sessions are scary good. I went from 20 open tabs to a clean, organized workflow.',
    rating: 5,
  },
];

const companies = [
  'Vercel', 'Linear', 'Notion', 'Figma', 'Stripe', 'Arc', 'Raycast', 'Framer',
];

export function SocialProof() {
  return (
    <section className="section-padding relative">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <p className="text-xs text-frost/30 uppercase tracking-widest mb-8">
              Trusted by teams at
            </p>
            <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
              {companies.map((company) => (
                <span key={company} className="text-sm sm:text-base font-semibold text-frost/60 tracking-tight">
                  {company}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              <span className="text-white">Loved by</span>{' '}
              <span className="gradient-text">1 Million+ Users</span>
            </h2>
            <p className="text-frost/50 max-w-xl mx-auto">
              From solo creators to enterprise teams — hear why people can&apos;t work without Momentum X.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <motion.div
                className="glass rounded-2xl p-6 card-hover h-full flex flex-col"
                whileHover={{ y: -4 }}
              >
                <Quote size={20} className="text-electric/30 mb-4" />
                <p className="text-sm text-frost/60 leading-relaxed flex-1 mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-electric/30 to-neon/30 flex items-center justify-center text-xs font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.name}</p>
                    <p className="text-[10px] text-frost/30">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
