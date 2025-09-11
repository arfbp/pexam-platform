
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, BookOpen, Users, FileText, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavigationProps {
  user: { id: string; username: string; role: string };
  currentView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
}

const Navigation = ({ user, currentView, onViewChange, onLogout }: NavigationProps) => {
  const isAdmin = user.role === 'admin';

  const navItems = [
    ...(isAdmin ? [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'categories', label: 'Categories', icon: BookOpen },
      { id: 'questions', label: 'Questions', icon: FileText },
    ] : []),
    { id: 'exams', label: 'Take Exam', icon: BookOpen },
    { id: 'results', label: 'My Results', icon: BarChart3 },
  ];

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-foreground">Exam Platform</h1>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    onClick={() => onViewChange(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.username}</span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                {user.role}
              </span>
            </div>
            <ThemeToggle />
            <Button variant="ghost" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
