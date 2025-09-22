import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  choice_e?: string;
  choice_f?: string;
  correct_answer: string;
  explanation?: string;
}

interface ExamHistoryDetailProps {
  examResult: {
    id: string;
    score: number;
    total_questions: number;
    percentage: number;
    created_at: string;
    answers_data: any;
  };
  questions: Question[];
  onBack: () => void;
}

const ExamHistoryDetail = ({ examResult, questions, onBack }: ExamHistoryDetailProps) => {
  const { score, total_questions, percentage, created_at, answers_data } = examResult;
  const passed = percentage >= 70;

  const getScoreColor = () => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreBadgeVariant = () => {
    if (percentage >= 80) return 'default';
    if (percentage >= 70) return 'secondary';
    return 'destructive';
  };

  const getChoicesObject = (question: Question) => {
    const choices: Record<string, string> = {
      A: question.choice_a,
      B: question.choice_b,
      C: question.choice_c,
      D: question.choice_d,
    };
    if (question.choice_e) choices.E = question.choice_e;
    if (question.choice_f) choices.F = question.choice_f;
    return choices;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Results</span>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Exam Review</h2>
          <p className="text-muted-foreground">Taken on {created_at}</p>
        </div>
      </div>

      {/* Score Summary */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Exam Results</CardTitle>
          <CardDescription>Review of your performance</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor()}`}>
              {percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              {score} out of {total_questions} correct
            </div>
            <Badge variant={getScoreBadgeVariant()} className="text-sm px-3 py-1">
              {passed ? 'Passed' : 'Failed'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review your answers and see where you can improve</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.map((question, index) => {
            const userAnswer = answers_data?.[question.id] || [];
            const userAnswerString = Array.isArray(userAnswer) ? userAnswer.join('') : userAnswer;
            const correctAnswer = question.correct_answer;
            const isCorrect = userAnswerString === correctAnswer;
            const choices = getChoicesObject(question);
            
            return (
              <div key={question.id} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      Question {index + 1}: {question.question_text}
                    </h4>
                    
                    <div className="mt-3 space-y-2">
                      {Object.entries(choices).map(([key, value]) => {
                        const isCorrectChoice = correctAnswer.includes(key);
                        const wasSelected = Array.isArray(userAnswer) 
                          ? userAnswer.includes(key) 
                          : userAnswerString.includes(key);
                        const isWrongSelection = wasSelected && !isCorrectChoice;
                        
                        return (
                          <div
                            key={key}
                            className={`p-3 rounded-md text-sm transition-colors ${
                              isCorrectChoice
                                ? 'bg-success/10 text-success border border-success/20'
                                : isWrongSelection
                                ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                : 'bg-muted/50 text-foreground border border-border'
                            }`}
                          >
                            <span className="font-semibold">{key}.</span> {value}
                            {isCorrectChoice && (
                              <Badge variant="secondary" className="ml-2 text-xs bg-success/20 text-success">
                                Correct Answer
                              </Badge>
                            )}
                            {wasSelected && !isCorrectChoice && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Your Answer
                              </Badge>
                            )}
                            {wasSelected && isCorrectChoice && (
                              <Badge className="ml-2 text-xs bg-success text-white">
                                ✓ Your Correct Answer
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {question.explanation && (
                      <div className="mt-3 p-3 bg-info/10 text-info border border-info/20 rounded-md">
                        <p className="text-sm">
                          <strong className="text-foreground">Explanation:</strong> {question.explanation}
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

export default ExamHistoryDetail;