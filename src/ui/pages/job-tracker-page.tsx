import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, GlassCard, Button, Input, Select } from '../components';
import { sendMessage } from '../lib/utils';
import type { JobTrackerItem, JobTrackerStatus } from '@domain/entities';

const COLUMNS: Array<{ status: JobTrackerStatus; label: string; color: string }> = [
  { status: 'wishlist', label: 'Wishlist', color: 'border-t-hiremate-muted' },
  { status: 'applied', label: 'Applied', color: 'border-t-hiremate-primary' },
  { status: 'interview', label: 'Interview', color: 'border-t-hiremate-warning' },
  { status: 'offer', label: 'Offer', color: 'border-t-hiremate-success' },
  { status: 'rejected', label: 'Rejected', color: 'border-t-hiremate-danger' },
];

export function JobTrackerPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', status: 'wishlist' as JobTrackerStatus });

  const { data: items = [] } = useQuery({
    queryKey: ['tracker'],
    queryFn: () => sendMessage<JobTrackerItem[]>('GET_TRACKER'),
  });

  const addMutation = useMutation({
    mutationFn: (item: typeof newJob) => sendMessage<JobTrackerItem>('ADD_TRACKER_ITEM', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracker'] });
      setShowAdd(false);
      setNewJob({ title: '', company: '', location: '', status: 'wishlist' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobTrackerStatus }) =>
      sendMessage('UPDATE_TRACKER_STATUS', { id, status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracker'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sendMessage('DELETE_TRACKER_ITEM', { id }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tracker'] }),
  });

  return (
    <div>
      <Header title="Job Tracker" subtitle="Kanban board for your job search pipeline" />

      <div className="p-8">
        <div className="flex justify-end mb-6">
          <Button onClick={() => setShowAdd(!showAdd)}>
            <Plus className="w-4 h-4" />
            Add Job
          </Button>
        </div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <GlassCard className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Job Title" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} />
                <Input label="Company" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} />
                <Input label="Location" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} />
              </div>
              <Select
                label="Status"
                value={newJob.status}
                onChange={(e) => setNewJob({ ...newJob, status: e.target.value as JobTrackerStatus })}
                options={COLUMNS.map((c) => ({ value: c.status, label: c.label }))}
              />
              <Button onClick={() => addMutation.mutate(newJob)} disabled={!newJob.title || !newJob.company}>
                Save Job
              </Button>
            </GlassCard>
          </motion.div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colItems = items.filter((i) => i.status === col.status);
            return (
              <div key={col.status} className="min-w-[280px] flex-1">
                <div className={`glass-card border-t-2 ${col.color} !p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">{col.label}</h3>
                    <span className="text-xs text-hiremate-muted bg-white/5 px-2 py-0.5 rounded-full">
                      {colItems.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="bg-white/5 rounded-xl p-3 border border-white/5 hover:border-hiremate-primary/20 transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-hiremate-muted/40 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <p className="text-xs text-hiremate-muted">{item.company}</p>
                            {item.location && <p className="text-xs text-hiremate-muted/60">{item.location}</p>}
                          </div>
                          <button
                            onClick={() => deleteMutation.mutate(item.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-hiremate-danger"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {COLUMNS.filter((c) => c.status !== item.status).map((c) => (
                            <button
                              key={c.status}
                              onClick={() => updateMutation.mutate({ id: item.id, status: c.status })}
                              className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-hiremate-primary/20 text-hiremate-muted hover:text-hiremate-text transition-colors"
                            >
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
