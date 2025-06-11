
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalQuestions: number;
  totalExams: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCategories: 0,
    totalQuestions: 0,
    totalExams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch total categories
      const { count: categoriesCount } = await supabase
        .from('exam_categories')
        .select('*', { count: 'exact', head: true });

      // Fetch total questions
      const { count: questionsCount } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      // Fetch total exam results
      const { count: examsCount } = await supabase
        .from('exam_results')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalCategories: categoriesCount || 0,
        totalQuestions: questionsCount || 0,
        totalExams: examsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Users',
      value: loading ? '...' : stats.totalUsers.toString(),
      description: 'Registered users',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Categories',
      value: loading ? '...' : stats.totalCategories.toString(),
      description: 'Exam categories',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Questions',
      value: loading ? '...' : stats.totalQuestions.toString(),
      description: 'Total question bank',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Exams Taken',
      value: loading ? '...' : stats.totalExams.toString(),
      description: 'Total completed',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600">Overview of platform activity and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Current platform status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Database Status</span>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Authentication</span>
                <span className="text-green-600 font-semibold">Active</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Question Bank</span>
                <span className="text-blue-600 font-semibold">{stats.totalQuestions} questions</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Active Categories</span>
                <span className="text-purple-600 font-semibold">{stats.totalCategories} categories</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                • Add new questions to expand the question bank
              </div>
              <div className="text-sm text-gray-600">
                • Create new exam categories for different subjects
              </div>
              <div className="text-sm text-gray-600">
                • Monitor exam results and user performance
              </div>
              <div className="text-sm text-gray-600">
                • Manage user accounts and permissions
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
