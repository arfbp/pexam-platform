
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState(questionCount === 20 ? 2400 : 6000); // 40 or 100 minutes
  const [questions] = useState<Question[]>([
    {
      id: '1',
      questionText: 'What is the square root of 144?',
      choices: { A: '10', B: '11', C: '12', D: '13' },
      correctChoice: 'C',
      explanation: 'The square root of 144 is 12 because 12 × 12 = 144'
    },
    {
      id: '2',
      questionText: 'What is 15% of 200?',
      choices: { A: '25', B: '30', C: '35', D: '40' },
      correctChoice: 'B',
      explanation: '15% of 200 = 0.15 × 200 = 30'
    },
    // Add more sample questions as needed
  ].slice(0, questionCount));

  useEffect(() => {
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
  }, []);

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

  const handleSubmitExam = () => {
    const score = questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctChoice ? 1 : 0);
    }, 0);

    onComplete({ questions, answers, score });
  };

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
