
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Award, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ExamResult {
  id: string;
  score: number;
  total_questions: number;
  question_count: number;
  created_at: string;
  percentage: number;
}

interface ResultsHistoryProps {
  userId?: number;
}

const ResultsHistory = ({ userId = 1 }: ResultsHistoryProps) => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching exam results:', error);
        return;
      }

      const formattedResults = (data || []).map(result => ({
        id: result.id.toString(),
        score: result.score,
        total_questions: result.total_questions,
        question_count: result.question_count,
        created_at: new Date(result.created_at).toLocaleDateString(),
        percentage: Math.round((result.score / result.total_questions) * 100)
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching exam results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
          <p className="text-gray-600">Loading your exam results...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
          <p className="text-gray-600">No exam results found. Take an exam to see your results here.</p>
        </div>
      </div>
    );
  }

  const chartData = results.slice(0, 10).map((result, index) => ({
    name: `Exam ${results.length - index}`,
    score: result.percentage,
    exam: index + 1
  }));

  const averageScore = Math.round(results.reduce((sum, result) => sum + result.percentage, 0) / results.length);
  const totalExams = results.length;
  const passedExams = results.filter(result => result.percentage >= 70).length;

  const getPercentageBadge = (percentage: number) => {
    if (percentage >= 80) return <Badge className="bg-green-600">Excellent</Badge>;
    if (percentage >= 70) return <Badge variant="secondary">Good</Badge>;
    return <Badge variant="destructive">Needs Improvement</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Results</h2>
        <p className="text-gray-600">Track your exam performance and progress</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{averageScore}%</div>
            <p className="text-xs text-gray-500">Across all exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Taken</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalExams}</div>
            <p className="text-xs text-gray-500">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0}%
            </div>
            <p className="text-xs text-gray-500">{passedExams} of {totalExams} passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your scores across recent exams</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Exam History</CardTitle>
          <CardDescription>Detailed view of all your exam attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.score}/{result.total_questions}</TableCell>
                  <TableCell className="font-semibold">{result.percentage}%</TableCell>
                  <TableCell>{result.question_count} questions</TableCell>
                  <TableCell>{result.created_at}</TableCell>
                  <TableCell>{getPercentageBadge(result.percentage)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsHistory;
