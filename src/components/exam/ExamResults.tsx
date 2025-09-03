
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  questionText: string;
  choices: { A: string; B: string; C: string; D: string };
  correctChoice: string; // Can be multiple letters like "ABC" or "BD"
  explanation: string;
}

interface ExamResultsProps {
  questions: Question[];
  answers: Record<string, string[]>;
  score: number;
  onRetakeExam: () => void;
  onBackToSelection: () => void;
}

const ExamResults = ({ questions, answers, score, onRetakeExam, onBackToSelection }: ExamResultsProps) => {
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 70;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = () => {
    if (percentage >= 80) return 'default';
    if (percentage >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Summary */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              <Trophy className={`h-8 w-8 ${passed ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
          <CardTitle className="text-3xl">Exam Complete!</CardTitle>
          <CardDescription>Here are your results</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-6xl font-bold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-xl text-gray-600">
              {score} out of {questions.length} correct
            </div>
            <Badge variant={getScoreBadgeVariant()} className="text-lg px-4 py-2">
              {passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
          
          <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={onRetakeExam} className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Retake Exam</span>
            </Button>
            <Button variant="outline" onClick={onBackToSelection}>
              Take Different Exam
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Review your answers and explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = (answers[question.id] || []).join('');
            const correctAnswer = question.correctChoice;
            const isCorrect = userAnswer === correctAnswer;
            
            return (
              <div key={question.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Question {index + 1}: {question.questionText}
                    </h4>
                    
                    <div className="mt-3 space-y-2">
                      {Object.entries(question.choices).map(([key, value]) => {
                        const isCorrect = correctAnswer.includes(key);
                        const wasSelected = (answers[question.id] || []).includes(key);
                        const isWrongSelection = wasSelected && !isCorrect;
                        
                        return (
                          <div
                            key={key}
                            className={`p-2 rounded text-sm ${
                              isCorrect
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : isWrongSelection
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span className="font-semibold">{key}.</span> {value}
                            {isCorrect && (
                              <Badge variant="secondary" className="ml-2 text-xs">Correct</Badge>
                            )}
                            {wasSelected && !isCorrect && (
                              <Badge variant="destructive" className="ml-2 text-xs">Your Answer</Badge>
                            )}
                            {wasSelected && isCorrect && (
                              <Badge className="ml-2 text-xs bg-green-600">✓ Selected</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamResults;
