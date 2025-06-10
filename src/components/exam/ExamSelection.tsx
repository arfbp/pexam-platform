
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, Users } from 'lucide-react';

interface ExamSelectionProps {
  onStartExam: (categoryId: string, questionCount: number) => void;
}

const ExamSelection = ({ onStartExam }: ExamSelectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLength, setSelectedLength] = useState('20');

  const categories = [
    { id: '1', name: 'Mathematics', questionCount: 245, description: 'Algebra, Geometry, Calculus' },
    { id: '2', name: 'Physics', questionCount: 198, description: 'Mechanics, Thermodynamics, Optics' },
    { id: '3', name: 'Chemistry', questionCount: 156, description: 'Organic, Inorganic, Physical' },
    { id: '4', name: 'English', questionCount: 312, description: 'Grammar, Literature, Comprehension' },
    { id: '5', name: 'Biology', questionCount: 189, description: 'Genetics, Ecology, Human Biology' },
    { id: '6', name: 'Computer Science', questionCount: 147, description: 'Algorithms, Data Structures, Programming' },
  ];

  const handleStartExam = () => {
    if (selectedCategory) {
      onStartExam(selectedCategory, parseInt(selectedLength));
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Take an Exam</h2>
        <p className="text-gray-600">Choose a category and test your knowledge</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedCategory === category.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                {selectedCategory === category.id && (
                  <Badge className="bg-blue-600">Selected</Badge>
                )}
              </div>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-gray-600">
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
              <label className="text-sm font-medium">Number of Questions</label>
              <Select value={selectedLength} onValueChange={setSelectedLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20 Questions (Quick Test)</SelectItem>
                  <SelectItem value="50">50 Questions (Full Test)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Estimated time: {selectedLength === '20' ? '30-40' : '75-90'} minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>Category: {categories.find(c => c.id === selectedCategory)?.name}</span>
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
