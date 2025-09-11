
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: number;
  question_text: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_answer: string;
  explanation: string;
  category_id: number;
  categoryName?: string;
}

interface Category {
  id: number;
  name: string;
}

const QuestionManagement = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    questionText: '',
    choiceA: '',
    choiceB: '',
    choiceC: '',
    choiceD: '',
    correctChoice: 'A',
    explanation: '',
    categoryId: '',
  });
  const [csvContent, setCsvContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select(`
          *,
          exam_categories!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      const questionsWithCategory = questionsData.map(q => ({
        ...q,
        categoryName: q.exam_categories?.name || 'Unknown'
      }));

      setQuestions(questionsWithCategory);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!formData.questionText || !formData.choiceA || !formData.choiceB || 
        !formData.choiceC || !formData.choiceD || !formData.categoryId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          question_text: formData.questionText,
          choice_a: formData.choiceA,
          choice_b: formData.choiceB,
          choice_c: formData.choiceC,
          choice_d: formData.choiceD,
          correct_answer: formData.correctChoice,
          explanation: formData.explanation,
          category_id: parseInt(formData.categoryId)
        });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

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
      fetchQuestions();
      
      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter CSV content",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvContent.trim().split('\n');
      const questionsToInsert = [];
      
      for (let i = 1; i < lines.length; i++) { // Skip header
        const [questionText, choiceA, choiceB, choiceC, choiceD, correctChoice, explanation, categoryId] = 
          lines[i].split(',').map(item => item.trim());
        
        if (questionText && choiceA && choiceB && choiceC && choiceD && correctChoice && categoryId) {
          questionsToInsert.push({
            question_text: questionText,
            choice_a: choiceA,
            choice_b: choiceB,
            choice_c: choiceC,
            choice_d: choiceD,
            correct_answer: correctChoice,
            explanation: explanation || '',
            category_id: parseInt(categoryId)
          });
        }
      }

      if (questionsToInsert.length === 0) {
        toast({
          title: "Error",
          description: "No valid questions found in CSV",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setCsvContent('');
      fetchQuestions();
      
      toast({
        title: "Success",
        description: `${questionsToInsert.length} questions imported successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import questions",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      fetchQuestions();
      toast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete question",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-6">Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Question Management</h2>
          <p className="text-muted-foreground">Add and manage exam questions</p>
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
                      <SelectItem key={category.id} value={category.id.toString()}>
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
                <Select value={formData.correctChoice} onValueChange={(value) => setFormData({ ...formData, correctChoice: value })}>
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
                      <TableCell className="max-w-xs truncate">{question.question_text}</TableCell>
                      <TableCell>{question.categoryName}</TableCell>
                      <TableCell>{question.correct_answer}</TableCell>
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
              <div className="bg-muted p-4 rounded-lg">
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
