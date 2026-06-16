interface ModeCardProps {
  emoji: string;
  name: string;
  description: string;
  isPremium?: boolean;
  selected?: boolean;
  onClick: () => void;
}

export function ModeCard({ emoji, name, description, isPremium, selected, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`card text-left w-full ${
        selected
          ? 'bg-brand-50 border-2 border-brand-500 shadow-md'
          : 'bg-white border border-gray-100 hover:border-brand-200 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{name}</span>
            {isPremium && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">PRO</span>}
          </div>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
      </div>
    </button>
  );
}
