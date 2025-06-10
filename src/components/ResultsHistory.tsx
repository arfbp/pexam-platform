
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Award, Eye } from 'lucide-react';

interface ExamResult {
  id: string;
  categoryName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  duration: string;
}

const ResultsHistory = () => {
  const [results] = useState<ExamResult[]>([
    {
      id: '1',
      categoryName: 'Mathematics',
      score: 18,
      totalQuestions: 20,
      percentage: 90,
      date: '2024-06-10',
      duration: '25 min'
    },
    {
      id: '2',
      categoryName: 'Physics',
      score: 35,
      totalQuestions: 50,
      percentage: 70,
      date: '2024-06-08',
      duration: '68 min'
    },
    {
      id: '3',
      categoryName: 'Chemistry',
      score: 16,
      totalQuestions: 20,
      percentage: 80,
      date: '2024-06-05',
      duration: '32 min'
    },
    {
      id: '4',
      categoryName: 'English',
      score: 42,
      totalQuestions: 50,
      percentage: 84,
      date: '2024-06-03',
      duration: '55 min'
    },
  ]);

  const chartData = results.map((result, index) => ({
    name: result.categoryName,
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
              {Math.round((passedExams / totalExams) * 100)}%
            </div>
            <p className="text-xs text-gray-500">{passedExams} of {totalExams} passed</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Your scores across different exam categories</CardDescription>
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
                <TableHead>Category</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">{result.categoryName}</TableCell>
                  <TableCell>{result.score}/{result.totalQuestions}</TableCell>
                  <TableCell className="font-semibold">{result.percentage}%</TableCell>
                  <TableCell>{result.duration}</TableCell>
                  <TableCell>{result.date}</TableCell>
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
