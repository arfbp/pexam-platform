
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  questionText: string;
  choices: { A: string; B: string; C: string; D: string };
  correctChoice: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  categoryId: string;
  categoryName: string;
}

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      questionText: 'What is 2 + 2?',
      choices: { A: '3', B: '4', C: '5', D: '6' },
      correctChoice: 'B',
      explanation: '2 + 2 equals 4',
      categoryId: '1',
      categoryName: 'Mathematics'
    },
    {
      id: '2',
      questionText: 'What is the speed of light?',
      choices: { A: '300,000 km/s', B: '150,000 km/s', C: '299,792,458 m/s', D: '250,000 km/s' },
      correctChoice: 'C',
      explanation: 'The speed of light in vacuum is exactly 299,792,458 meters per second',
      categoryId: '2',
      categoryName: 'Physics'
    }
  ]);

  const categories = [
    { id: '1', name: 'Mathematics' },
    { id: '2', name: 'Physics' },
    { id: '3', name: 'Chemistry' },
    { id: '4', name: 'English' },
  ];

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    choiceA: '',
    choiceB: '',
    choiceC: '',
    choiceD: '',
    correctChoice: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    categoryId: '',
  });
  const [csvContent, setCsvContent] = useState('');
  const { toast } = useToast();

  const handleAddQuestion = () => {
    if (!formData.questionText || !formData.choiceA || !formData.choiceB || 
        !formData.choiceC || !formData.choiceD || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const category = categories.find(c => c.id === formData.categoryId);
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionText: formData.questionText,
      choices: {
        A: formData.choiceA,
        B: formData.choiceB,
        C: formData.choiceC,
        D: formData.choiceD,
      },
      correctChoice: formData.correctChoice,
      explanation: formData.explanation,
      categoryId: formData.categoryId,
      categoryName: category?.name || '',
    };

    setQuestions([...questions, newQuestion]);
    setFormData({
      questionText: '',
      choiceA: '',
      choiceB: '',
      choiceC: '',
      choiceD: '',
      correctChoice: 'A',
      explanation: '',
      categoryId: '',
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Question added successfully",
    });
  };

  const handleCsvUpload = () => {
    if (!csvContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV content",
        variant: "destructive",
      });
      return;
    }

    // Simple CSV parsing demo
    const lines = csvContent.trim().split('\n');
    const newQuestions: Question[] = [];
    
    lines.slice(1).forEach((line, index) => {
      const [questionText, choiceA, choiceB, choiceC, choiceD, correctChoice, explanation, categoryId] = 
        line.split(',').map(item => item.trim());
      
      const category = categories.find(c => c.id === categoryId);
      if (category) {
        newQuestions.push({
          id: `csv-${Date.now()}-${index}`,
          questionText,
          choices: { A: choiceA, B: choiceB, C: choiceC, D: choiceD },
          correctChoice: correctChoice as 'A' | 'B' | 'C' | 'D',
          explanation,
          categoryId,
          categoryName: category.name,
        });
      }
    });

    setQuestions([...questions, ...newQuestions]);
    setCsvContent('');
    
    toast({
      title: "Success",
      description: `${newQuestions.length} questions imported successfully`,
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
    toast({
      title: "Success",
      description: "Question deleted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Question Management</h2>
          <p className="text-gray-600">Add and manage exam questions</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Question</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Question</DialogTitle>
              <DialogDescription>Create a new exam question</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="questionText">Question</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="Enter question text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="choiceA">Choice A</Label>
                  <Input
                    id="choiceA"
                    value={formData.choiceA}
                    onChange={(e) => setFormData({ ...formData, choiceA: e.target.value })}
                    placeholder="Choice A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="choiceB">Choice B</Label>
                  <Input
                    id="choiceB"
                    value={formData.choiceB}
                    onChange={(e) => setFormData({ ...formData, choiceB: e.target.value })}
                    placeholder="Choice B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="choiceC">Choice C</Label>
                  <Input
                    id="choiceC"
                    value={formData.choiceC}
                    onChange={(e) => setFormData({ ...formData, choiceC: e.target.value })}
                    placeholder="Choice C"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="choiceD">Choice D</Label>
                  <Input
                    id="choiceD"
                    value={formData.choiceD}
                    onChange={(e) => setFormData({ ...formData, choiceD: e.target.value })}
                    placeholder="Choice D"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="correctChoice">Correct Answer</Label>
                <Select value={formData.correctChoice} onValueChange={(value) => setFormData({ ...formData, correctChoice: value as 'A' | 'B' | 'C' | 'D' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation (Optional)</Label>
                <Textarea
                  id="explanation"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Enter explanation"
                />
              </div>
              <Button onClick={handleAddQuestion} className="w-full">Add Question</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manage">Manage Questions</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Questions ({questions.length})</CardTitle>
              <CardDescription>All questions in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Correct Answer</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="max-w-xs truncate">{question.questionText}</TableCell>
                      <TableCell>{question.categoryName}</TableCell>
                      <TableCell>{question.correctChoice}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteQuestion(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Bulk Upload Questions</span>
              </CardTitle>
              <CardDescription>
                Upload multiple questions using CSV format. 
                Format: question,choiceA,choiceB,choiceC,choiceD,correctChoice,explanation,categoryId
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvContent">CSV Content</Label>
                <Textarea
                  id="csvContent"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="question,choiceA,choiceB,choiceC,choiceD,correctChoice,explanation,categoryId"
                  rows={10}
                />
              </div>
              <Button onClick={handleCsvUpload} className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload Questions</span>
              </Button>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Sample CSV Format:</h4>
                <code className="text-sm">
                  What is 3+3?,5,6,7,8,B,3+3 equals 6,1<br/>
                  What is gravity?,9.8 m/s²,10 m/s²,8 m/s²,12 m/s²,A,Standard gravity is 9.8 m/s²,2
                </code>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuestionManagement;
