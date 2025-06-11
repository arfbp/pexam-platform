
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  questionText: string;
  choices: { A: string; B: string; C: string; D: string };
  correctChoice: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

interface ExamInterfaceProps {
  categoryId: string;
  questionCount: number;
  onComplete: (results: { questions: Question[]; answers: Record<string, string>; score: number }) => void;
  onBack: () => void;
}

const ExamInterface = ({ categoryId, questionCount, onComplete, onBack }: ExamInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(questionCount === 20 ? 2400 : 6000);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [categoryId, questionCount]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category_id', parseInt(categoryId));

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.log('No questions found for category:', categoryId);
        setLoading(false);
        return;
      }

      // Shuffle questions and take the requested amount
      const shuffledQuestions = shuffleArray(data);
      const selectedQuestions = shuffledQuestions.slice(0, questionCount);

      const formattedQuestions: Question[] = selectedQuestions.map(q => ({
        id: q.id.toString(),
        questionText: q.question_text,
        choices: {
          A: q.choice_a,
          B: q.choice_b,
          C: q.choice_c,
          D: q.choice_d
        },
        correctChoice: q.correct_answer as 'A' | 'B' | 'C' | 'D',
        explanation: q.explanation || ''
      }));

      setQuestions(formattedQuestions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (choice: string) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: choice
    });
  };

  const handleSubmitExam = async () => {
    const score = questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctChoice ? 1 : 0);
    }, 0);

    // Save exam result to database
    try {
      const { error } = await supabase
        .from('exam_results')
        .insert({
          user_id: 1, // This should be the actual logged-in user ID
          score,
          total_questions: questions.length,
          question_count: questionCount,
          answers_data: answers
        });

      if (error) {
        console.error('Error saving exam result:', error);
      }
    } catch (error) {
      console.error('Error saving exam result:', error);
    }

    onComplete({ questions, answers, score });
  };

  useEffect(() => {
    if (loading || questions.length === 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, questions.length]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg">Loading questions...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-lg">No questions available for this category.</div>
            <Button onClick={onBack} className="mt-4">Back to Selection</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4" />
              <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          <Progress value={progress} className="mt-3" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(currentQuestion.choices).map(([key, value]) => (
            <Button
              key={key}
              variant={answers[currentQuestion.id] === key ? "default" : "outline"}
              className="w-full justify-start text-left h-auto p-4"
              onClick={() => handleAnswerSelect(key)}
            >
              <span className="font-semibold mr-3">{key}.</span>
              <span>{value}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {currentQuestionIndex === questions.length - 1 ? (
          <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        ) : (
          <Button
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            className="flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Answer Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Answer Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : "outline"}
                size="sm"
                className={`w-10 h-10 ${answers[questions[index].id] ? 'bg-green-100 border-green-300' : ''}`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamInterface;
