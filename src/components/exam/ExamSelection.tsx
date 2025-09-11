
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: number;
  name: string;
  description: string;
  questionCount: number;
}

interface ExamSelectionProps {
  onStartExam: (categoryId: string, questionCount: number) => void;
}

const ExamSelection = ({ onStartExam }: ExamSelectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLength, setSelectedLength] = useState('20');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Get categories with question counts
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('exam_categories')
        .select('id, name, description');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      // Get question counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from('questions')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            questionCount: count || 0
          };
        })
      );

      // Filter out categories with no questions
      const availableCategories = categoriesWithCounts.filter(cat => cat.questionCount > 0);
      setCategories(availableCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (selectedCategory) {
      const selectedCat = categories.find(c => c.id.toString() === selectedCategory);
      const maxQuestions = selectedCat?.questionCount || 0;
      const requestedQuestions = parseInt(selectedLength);
      
      // Don't allow more questions than available
      const finalQuestionCount = Math.min(requestedQuestions, maxQuestions);
      onStartExam(selectedCategory, finalQuestionCount);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-lg text-muted-foreground">No categories with questions available.</div>
        <p className="text-sm text-muted-foreground mt-2">Please add some questions to categories first.</p>
      </div>
    );
  }

  const selectedCategoryData = categories.find(c => c.id.toString() === selectedCategory);
  const maxQuestions = selectedCategoryData?.questionCount || 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Take an Exam</h2>
        <p className="text-muted-foreground">Choose a category and test your knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCategory === category.id.toString() ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedCategory(category.id.toString())}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                {selectedCategory === category.id.toString() && (
                  <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                )}
              </div>
              <CardDescription>{category.description || 'No description available'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{category.questionCount} questions</span>
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Exam Settings</CardTitle>
            <CardDescription>Configure your exam preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Questions (Max: {maxQuestions})</label>
              <Select value={selectedLength} onValueChange={setSelectedLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maxQuestions >= 20 && <SelectItem value="20">20 Questions (Quick Test)</SelectItem>}
                  {maxQuestions >= 50 && <SelectItem value="50">50 Questions (Full Test)</SelectItem>}
                  {maxQuestions < 20 && <SelectItem value={maxQuestions.toString()}>{maxQuestions} Questions (All Available)</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Estimated time: {selectedLength === '20' ? '30-40' : '75-90'} minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>Category: {selectedCategoryData?.name}</span>
              </div>
            </div>

            <Button onClick={handleStartExam} className="w-full" size="lg">
              Start Exam
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExamSelection;
