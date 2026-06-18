import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components';
import {
  DashboardPage,
  ResumeAnalyzerPage,
  JobMatcherPage,
  ResumeOptimizerPage,
  CoverLetterPage,
  ApplicationAssistantPage,
  InterviewPrepPage,
  LinkedInAuditorPage,
  JobTrackerPage,
  SalaryInsightsPage,
  CareerRoadmapPage,
  PricingPage,
  SettingsPage,
} from './pages';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export function AppShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex min-h-screen bg-hiremate-bg">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzerPage />} />
              <Route path="/job-matcher" element={<JobMatcherPage />} />
              <Route path="/resume-optimizer" element={<ResumeOptimizerPage />} />
              <Route path="/cover-letter" element={<CoverLetterPage />} />
              <Route path="/application-assistant" element={<ApplicationAssistantPage />} />
              <Route path="/interview-prep" element={<InterviewPrepPage />} />
              <Route path="/linkedin-auditor" element={<LinkedInAuditorPage />} />
              <Route path="/job-tracker" element={<JobTrackerPage />} />
              <Route path="/salary-insights" element={<SalaryInsightsPage />} />
              <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
