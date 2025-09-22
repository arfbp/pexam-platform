
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  questionText: string;
  choices: { A: string; B: string; C: string; D: string; E?: string; F?: string };
  correctChoice: string; // Can be multiple letters like "ABC" or "BD"
  explanation: string;
  originalChoices?: { A: string; B: string; C: string; D: string; E?: string; F?: string };
  originalCorrectChoice?: string;
  choiceMapping?: Record<string, string>; // Maps randomized letters to original letters
}

interface ExamInterfaceProps {
  categoryId: string;
  questionCount: number;
  onComplete: (results: { questions: Question[]; answers: Record<string, string[]>; score: number }) => void;
  onBack: (progress: { currentQuestionIndex: number; timeLeft: number; answers: Record<string, string[]>; questions: Question[] }) => void;
  userId?: number;
  savedProgress?: {
    currentQuestionIndex: number;
    timeLeft?: number;
    answers: Record<string, string[]>;
    questions: Question[];
  };
}

const ExamInterface = ({ categoryId, questionCount, onComplete, onBack, userId = 1, savedProgress }: ExamInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(savedProgress?.currentQuestionIndex || 0);
  const [answers, setAnswers] = useState<Record<string, string[]>>(savedProgress?.answers || {});
  const [timeLeft, setTimeLeft] = useState(savedProgress?.timeLeft || (questionCount === 20 ? 2400 : 6000));
  const [questions, setQuestions] = useState<Question[]>(savedProgress?.questions || []);
  const [loading, setLoading] = useState(!savedProgress || savedProgress.questions.length === 0);

  useEffect(() => {
    // Only fetch questions if we don't have saved progress with questions
    if (!savedProgress || savedProgress.questions.length === 0) {
      fetchQuestions();
    }
  }, [categoryId, questionCount, savedProgress]);

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

      const formattedQuestions: Question[] = selectedQuestions.map(q => {
        const dbRecord = q as any; // Type assertion to access choice_e and choice_f
        const originalChoices: { A: string; B: string; C: string; D: string; E?: string; F?: string } = {
          A: q.choice_a,
          B: q.choice_b,
          C: q.choice_c,
          D: q.choice_d
        };
        
        // Add E and F choices if they exist and are not empty
        if (dbRecord.choice_e && dbRecord.choice_e.trim()) {
          originalChoices.E = dbRecord.choice_e;
        }
        if (dbRecord.choice_f && dbRecord.choice_f.trim()) {
          originalChoices.F = dbRecord.choice_f;
        }

        // Create array of available choice letters and their values
        const availableChoices = Object.entries(originalChoices).filter(([, value]) => value);
        const choiceLetters = availableChoices.map(([letter]) => letter);
        const choiceValues = availableChoices.map(([, value]) => value);
        
        // Randomize the choice values but keep the same letters (A, B, C, D, etc.)
        const shuffledValues = shuffleArray(choiceValues);
        
        // Create new choices object with randomized values
        const randomizedChoices: { A: string; B: string; C: string; D: string; E?: string; F?: string } = {
          A: '',
          B: '',
          C: '',
          D: ''
        };
        const choiceMapping: Record<string, string> = {}; // Maps new position to original position
        
        choiceLetters.forEach((letter, index) => {
          (randomizedChoices as any)[letter] = shuffledValues[index];
          // Find which original choice this value came from
          const originalIndex = choiceValues.indexOf(shuffledValues[index]);
          const originalLetter = choiceLetters[originalIndex];
          choiceMapping[letter] = originalLetter;
        });

        // Map the correct answer to the new positions
        const originalCorrectChoice = q.correct_answer;
        let newCorrectChoice = '';
        for (const correctLetter of originalCorrectChoice) {
          // Find which new letter position has the original correct choice value
          const newLetter = Object.entries(choiceMapping).find(([, orig]) => orig === correctLetter)?.[0];
          if (newLetter) {
            newCorrectChoice += newLetter;
          }
        }
        // Sort the correct choice letters for consistency
        newCorrectChoice = newCorrectChoice.split('').sort().join('');

        return {
          id: q.id.toString(),
          questionText: q.question_text,
          choices: randomizedChoices,
          correctChoice: newCorrectChoice,
          explanation: q.explanation || '',
          originalChoices,
          originalCorrectChoice,
          choiceMapping
        };
      });

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
    const questionId = questions[currentQuestionIndex].id;
    const currentAnswers = answers[questionId] || [];
    
    if (currentAnswers.includes(choice)) {
      // Remove choice if already selected
      setAnswers({
        ...answers,
        [questionId]: currentAnswers.filter(c => c !== choice)
      });
    } else {
      // Add choice if not selected
      setAnswers({
        ...answers,
        [questionId]: [...currentAnswers, choice].sort()
      });
    }
  };

  const handleSubmitExam = async () => {
    // Map answers back to original choice letters for scoring and saving
    const originalAnswers: Record<string, string[]> = {};
    
    const score = questions.reduce((total, question) => {
      const userRandomizedAnswer = answers[question.id] || [];
      
      // Map the randomized answers back to original letters
      const userOriginalAnswer = userRandomizedAnswer
        .map(randomizedLetter => question.choiceMapping?.[randomizedLetter] || randomizedLetter)
        .sort();
      
      originalAnswers[question.id] = userOriginalAnswer;
      
      // Score against the original correct answer
      const originalCorrectAnswer = question.originalCorrectChoice || question.correctChoice;
      const userAnswerString = userOriginalAnswer.join('');
      
      return total + (userAnswerString === originalCorrectAnswer ? 1 : 0);
    }, 0);

    // Save exam result to database with original answer mapping
    try {
      const { error } = await supabase
        .from('exam_results')
        .insert({
          user_id: userId,
          score,
          total_questions: questions.length,
          question_count: questionCount,
          answers_data: originalAnswers
        });

      if (error) {
        console.error('Error saving exam result:', error);
      }
    } catch (error) {
      console.error('Error saving exam result:', error);
    }

    // For the results display, we need to convert questions back to original format
    const originalQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      choices: q.originalChoices || q.choices,
      correctChoice: q.originalCorrectChoice || q.correctChoice,
      explanation: q.explanation
    }));

    onComplete({ questions: originalQuestions, answers: originalAnswers, score });
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
            <Button onClick={() => onBack({ currentQuestionIndex: 0, timeLeft: 0, answers: {}, questions: [] })} className="mt-4">Back to Selection</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBackClick = () => {
    onBack({ currentQuestionIndex, timeLeft, answers, questions });
  };

  const handleEmptyBack = () => {
    onBack({ currentQuestionIndex: 0, timeLeft: 0, answers: {}, questions: [] });
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
              <Button 
                variant="ghost" 
                onClick={handleBackClick}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="text-sm text-muted-foreground">
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
          <div className="text-sm text-muted-foreground mb-4">
            Select all that apply. Multiple answers may be correct.
          </div>
          {Object.entries(currentQuestion.choices).map(([key, value]) => {
            const isSelected = (answers[currentQuestion.id] || []).includes(key);
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                className="w-full justify-start text-left h-auto p-4 min-h-[60px]"
                onClick={() => handleAnswerSelect(key)}
              >
                <div className="flex items-start w-full">
                  <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center flex-shrink-0 mt-1 ${
                    isSelected ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                  }`}>
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex items-start min-w-0 flex-1">
                    <span className="font-semibold mr-3 flex-shrink-0">{key}.</span>
                    <span className="break-words whitespace-normal leading-relaxed">{value}</span>
                  </div>
                </div>
              </Button>
            );
          })}
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
                className={`w-10 h-10 ${(answers[questions[index].id] || []).length > 0 ? 'bg-green-100 border-green-300' : ''}`}
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
