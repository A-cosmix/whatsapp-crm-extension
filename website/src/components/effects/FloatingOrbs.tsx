import { motion } from 'framer-motion';

const orbs = [
  { size: 400, x: '10%', y: '20%', color: 'rgba(59,130,246,0.12)', delay: 0 },
  { size: 300, x: '80%', y: '60%', color: 'rgba(168,85,247,0.1)', delay: 2 },
  { size: 250, x: '60%', y: '10%', color: 'rgba(34,211,238,0.08)', delay: 4 },
  { size: 350, x: '30%', y: '70%', color: 'rgba(124,58,237,0.08)', delay: 1 },
];

export function FloatingOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
