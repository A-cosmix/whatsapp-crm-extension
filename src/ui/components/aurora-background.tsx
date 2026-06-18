interface AuroraBackgroundProps {
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export function AuroraBackground({ className = '', intensity = 'medium' }: AuroraBackgroundProps) {
  const opacity = intensity === 'low' ? 'opacity-40' : intensity === 'high' ? 'opacity-100' : 'opacity-70';

  return (
    <div className={`aurora-bg pointer-events-none fixed inset-0 -z-10 ${className}`}>
      <div className={`aurora-orb w-[500px] h-[500px] -top-32 -left-32 bg-hiremate-primary/30 ${opacity}`} style={{ animationDelay: '0s' }} />
      <div className={`aurora-orb w-[400px] h-[400px] top-1/3 -right-32 bg-hiremate-accent/20 ${opacity}`} style={{ animationDelay: '-4s' }} />
      <div className={`aurora-orb w-[350px] h-[350px] -bottom-20 left-1/3 bg-hiremate-cyan/15 ${opacity}`} style={{ animationDelay: '-8s' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-hiremate-bg/50 to-hiremate-bg" />
    </div>
  );
}
