
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/admin/Dashboard';
import UserManagement from '@/components/admin/UserManagement';
import CategoryManagement from '@/components/admin/CategoryManagement';
import QuestionManagement from '@/components/admin/QuestionManagement';
import ExamSelection from '@/components/exam/ExamSelection';
import ExamInterface from '@/components/exam/ExamInterface';
import ExamResults from '@/components/exam/ExamResults';
import ResultsHistory from '@/components/ResultsHistory';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  username: string;
  role: string;
}

interface ExamSession {
  categoryId: string;
  questionCount: number;
  questions?: any[];
  answers?: Record<string, string[]>;
  score?: number;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [examState, setExamState] = useState<'selection' | 'taking' | 'results'>('selection');

  const handleLogin = (userData: User) => {
    setUser(userData);
    // All users are admin now, so always show admin dashboard
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    // Check if user is logged in via Google OAuth
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.signOut();
    }
    
    setUser(null);
    setCurrentView('dashboard');
    setExamSession(null);
    setExamState('selection');
  };

  const handleStartExam = (categoryId: string, questionCount: number) => {
    setExamSession({ categoryId, questionCount });
    setExamState('taking');
  };

  const handleExamComplete = (results: { questions: any[]; answers: Record<string, string[]>; score: number }) => {
    setExamSession({
      ...examSession!,
      questions: results.questions,
      answers: results.answers,
      score: results.score
    });
    setExamState('results');
  };

  const handleRetakeExam = () => {
    setExamState('taking');
  };

  const handleBackToSelection = () => {
    setExamSession(null);
    setExamState('selection');
  };

  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (currentView === 'exams') {
      if (examState === 'selection') {
        return <ExamSelection onStartExam={handleStartExam} />;
      } else if (examState === 'taking' && examSession) {
        return (
          <ExamInterface
            categoryId={examSession.categoryId}
            questionCount={examSession.questionCount}
            onComplete={handleExamComplete}
            onBack={handleBackToSelection}
            userId={parseInt(user.id)}
          />
        );
      } else if (examState === 'results' && examSession) {
        return (
          <ExamResults
            questions={examSession.questions || []}
            answers={examSession.answers || {}}
            score={examSession.score || 0}
            onRetakeExam={handleRetakeExam}
            onBackToSelection={handleBackToSelection}
          />
        );
      }
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UserManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'questions':
        return <QuestionManagement />;
      case 'results':
        return <ResultsHistory userId={parseInt(user.id)} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
