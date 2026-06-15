import type { ReviewItemView } from '@ui/hooks/use-review-queue';

interface ReviewQueuePanelProps {
  items: ReviewItemView[];
  loading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function ReviewQueuePanel({ items, loading, onApprove, onReject }: ReviewQueuePanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-wa-green border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="crm-card border-dashed text-center">
        <p className="text-sm text-wa-muted">Review queue is empty</p>
        <p className="mt-1 text-xs text-wa-muted">Low-confidence AI replies appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="crm-card border-wa-warning/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="crm-badge bg-wa-warning/20 text-wa-warning">
              {(item.confidence * 100).toFixed(0)}% confidence
            </span>
            <span className="text-xs text-wa-muted">{item.reason}</span>
          </div>

          <div className="space-y-2">
            <div className="rounded-lg bg-dark-bg p-2.5">
              <p className="text-xs text-wa-muted">Prospect</p>
              <p className="mt-0.5 text-sm text-wa-text">{item.prospectMessage}</p>
            </div>
            {item.draftMessage && (
              <div className="rounded-lg border border-wa-green/20 bg-wa-green/5 p-2.5">
                <p className="text-xs text-wa-green">AI Draft</p>
                <p className="mt-0.5 text-sm text-wa-text">{item.draftMessage}</p>
              </div>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            {item.draftMessage && (
              <button type="button" onClick={() => onApprove(item.id)} className="crm-btn-primary flex-1 !py-2">
                Send
              </button>
            )}
            <button type="button" onClick={() => onReject(item.id)} className="crm-btn-danger flex-1 !py-2">
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
