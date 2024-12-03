import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import PracticeExerciseForm from '@/components/admin/forms/PracticeExerciseForm';
import { getCategories, getPracticeTopics, getFilteredExercises, createExercise } from '@/api/practiceService';
import { toast } from 'sonner';

const Practice = () => {
    const [exercises, setExercises] = useState([]);
    const [categories, setCategories] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'type_name', label: 'Type' },
        { key: 'topic', label: 'Topic' },
        {
            key: 'content',
            label: 'Content',
            render: (value) => {
                if (!value) return '-';
                const content = typeof value === 'string' ? JSON.parse(value) : value;
                return content.questions ? `${content.questions.length} questions` : '-';
            }
        },
        { key: 'category_name', label: 'Category' },
    ];

    useEffect(() => {
        loadCategoriesAndTopics();
    }, []);

    useEffect(() => {
        if (selectedCategory && selectedTopic) {
            loadExercises();
        }
    }, [selectedCategory, selectedTopic]);

    const loadCategoriesAndTopics = async () => {
        try {
            const [categoriesData, topicsData] = await Promise.all([
                getCategories(),
                getPracticeTopics()
            ]);
            setCategories(categoriesData);
            setTopics(topicsData);
            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0]);
            }
            if (topicsData.length > 0) {
                setSelectedTopic(topicsData[0]);
            }
        } catch (error) {
            toast.error('Failed to load categories and topics');
        }
    };

    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await getFilteredExercises(selectedCategory.id, selectedTopic.id);
            setExercises(data);
        } catch (error) {
            toast.error('Failed to load exercises');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await createExercise({
                ...formData,
                category_id: selectedCategory.id,
                topic_id: selectedTopic.id
            });
            toast.success('Practice exercise created successfully');
            loadExercises();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create practice exercise');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateExercise(editingExercise.id, formData);
            toast.success('Practice exercise updated successfully');
            loadExercises();
            setIsDialogOpen(false);
            setEditingExercise(null);
        } catch (error) {
            toast.error('Failed to update practice exercise');
        }
    };

    const handleDelete = async (exercise) => {
        if (window.confirm('Are you sure you want to delete this practice exercise?')) {
            try {
                await deleteExercise(exercise.id);
                toast.success('Practice exercise deleted successfully');
                loadExercises();
            } catch (error) {
                toast.error('Failed to delete practice exercise');
            }
        }
    };

    const handleEdit = (exercise) => {
        setEditingExercise(exercise);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Practice Exercises</h1>
                    <div className="flex items-center gap-2">
                        <select
                            className="text-sm border rounded-md px-2 py-1"
                            value={selectedCategory?.id || ''}
                            onChange={(e) => {
                                const category = categories.find(c => c.id === Number(e.target.value));
                                setSelectedCategory(category);
                            }}
                        >
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="text-sm border rounded-md px-2 py-1"
                            value={selectedTopic?.id || ''}
                            onChange={(e) => {
                                const topic = topics.find(t => t.id === Number(e.target.value));
                                setSelectedTopic(topic);
                            }}
                        >
                            {topics.map((topic) => (
                                <option key={topic.id} value={topic.id}>
                                    {topic.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setEditingExercise(null);
                        setIsDialogOpen(true);
                    }}
                    disabled={!selectedCategory || !selectedTopic}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Practice Exercise
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={exercises}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title={editingExercise ? 'Edit Practice Exercise' : 'Create Practice Exercise'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingExercise(null);
                }}
            >
                <PracticeExerciseForm
                    initialData={editingExercise}
                    onSubmit={editingExercise ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                    categories={categories}
                    selectedCategory={selectedCategory}
                />
            </FormDialog>
        </div>
    );
};

export default Practice; 