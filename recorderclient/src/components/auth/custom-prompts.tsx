import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase';
import { 
  createCustomPrompt, 
  getCustomPrompts, 
  updateCustomPrompt, 
  deleteCustomPrompt 
} from '@/lib/db';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trash, Edit, Plus, Check, X } from 'lucide-react';

interface CustomPrompt {
  id: string;
  user_id: string;
  title: string;
  prompt_text: string;
  created_at: string;
  updated_at: string;
}

interface CustomPromptsProps {
  user: User | null;
}

export default function CustomPrompts({ user }: CustomPromptsProps) {
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  
  // Format date properly
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };
  
  // Fetch custom prompts
  const fetchPrompts = async () => {
    if (!user) return;
    
    setLoading(true);
    const data = await getCustomPrompts(user.id);
    
    if (data) {
      // Transform data to ensure it matches the CustomPrompt interface
      const promptsWithFullData = data.map(prompt => ({
        id: prompt.id,
        user_id: user.id,
        title: prompt.title,
        prompt_text: prompt.prompt_text,
        created_at: prompt.created_at,
        updated_at: prompt.updated_at
      }));
      setPrompts(promptsWithFullData);
    }
    
    setLoading(false);
  };
  
  useEffect(() => {
    fetchPrompts();
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save prompts",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !promptText.trim()) {
      toast({
        title: "Error",
        description: "Title and prompt text are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (editingPromptId) {
        // Update existing prompt
        const updatedPrompt = await updateCustomPrompt(editingPromptId, title, promptText);
        
        if (updatedPrompt) {
          toast({
            title: "Success",
            description: "Prompt updated successfully",
          });
          
          // Update prompts list
          setPrompts(prompts.map(prompt => 
            prompt.id === editingPromptId ? updatedPrompt : prompt
          ));
        } else {
          toast({
            title: "Error",
            description: "Failed to update prompt",
            variant: "destructive",
          });
        }
      } else {
        // Create new prompt
        const newPrompt = await createCustomPrompt(user.id, title, promptText);
        
        if (newPrompt) {
          toast({
            title: "Success",
            description: "Prompt created successfully",
          });
          
          // Add to prompts list
          setPrompts([newPrompt, ...prompts]);
        } else {
          toast({
            title: "Error",
            description: "Failed to create prompt",
            variant: "destructive",
          });
        }
      }
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Error",
        description: "An error occurred while saving the prompt",
        variant: "destructive",
      });
    }
  };
  
  // Handle edit prompt
  const handleEdit = (prompt: CustomPrompt) => {
    setEditingPromptId(prompt.id);
    setTitle(prompt.title);
    setPromptText(prompt.prompt_text);
    setFormVisible(true);
  };
  
  // Handle delete prompt
  const handleDelete = async (promptId: string) => {
    if (!window.confirm("Are you sure you want to delete this prompt?")) {
      return;
    }
    
    try {
      const success = await deleteCustomPrompt(promptId);
      
      if (success) {
        toast({
          title: "Success",
          description: "Prompt deleted successfully",
        });
        
        // Remove from prompts list
        setPrompts(prompts.filter(prompt => prompt.id !== promptId));
      } else {
        toast({
          title: "Error",
          description: "Failed to delete prompt",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Error",
        description: "An error occurred while deleting the prompt",
        variant: "destructive",
      });
    }
  };
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setPromptText('');
    setEditingPromptId(null);
    setFormVisible(false);
  };
  
  return (
    <Card className="w-full backdrop-blur-sm bg-white/5 border-0 shadow-lg">
      <CardHeader className="space-y-1 p-6">
        <CardTitle className="text-2xl font-bold text-white">Custom Prompts</CardTitle>
        <CardDescription className="text-white/70">
          Create and manage your custom prompts for processing transcripts.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 pt-0 space-y-6">
        {!formVisible ? (
          <div className="space-y-4">
            <Button 
              onClick={() => setFormVisible(true)}
              className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Prompt
            </Button>
            
            {loading ? (
              <div className="py-8 text-center text-white/70">
                Loading your prompts...
              </div>
            ) : prompts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Title</TableHead>
                    <TableHead className="text-white/70">Created</TableHead>
                    <TableHead className="text-right text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={prompt.id} className="border-white/10">
                      <TableCell className="font-medium text-white">{prompt.title}</TableCell>
                      <TableCell className="text-white/70">
                        {formatDate(prompt.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(prompt)}
                          className="mr-2 text-white/70 hover:text-white hover:bg-white/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prompt.id)}
                          className="text-white/70 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-white/70">
                You haven't created any custom prompts yet.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Extract Key Points"
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Prompt</label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Write your prompt here. E.g., Extract the top 5 key points from the following transcript..."
                rows={8}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-white/30"
              />
              <p className="text-sm text-white/60">
                Write your prompt instructions. The transcript will be appended to the end of your prompt automatically.
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" /> 
                {editingPromptId ? 'Update Prompt' : 'Save Prompt'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
} 