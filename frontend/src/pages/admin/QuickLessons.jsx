import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import QuickLessonForm from '@/components/admin/forms/QuickLessonForm';
import { getAllLessons } from '@/api/lessonService';
import { getQuickLessonByLessonId, createQuickLesson, updateQuickLesson, deleteQuickLesson } from '@/api/quickLessonService';
import { toast } from 'sonner';

const QuickLessons = () => {
    const [quickLessons, setQuickLessons] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingQuickLesson, setEditingQuickLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'quick__id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'introduction', label: 'Introduction' },
        {
            key: 'grammar_focus',
            label: 'Grammar Focus',
            render: (value) => {
                if (!value) return '-';
                const grammarArray = typeof value === 'string' ? JSON.parse(value) : value;
                return Array.isArray(grammarArray) ? grammarArray.join(', ') : '-';
            }
        },
        {
            key: 'vocabulary_words',
            label: 'Vocabulary Words',
            render: (value) => {
                if (!value) return 0;
                const vocabArray = typeof value === 'string' ? JSON.parse(value) : value;
                return Array.isArray(vocabArray) ? vocabArray.length : 0;
            }
        },
    ];

    useEffect(() => {
        loadLessons();
    }, []);

    useEffect(() => {
        if (selectedLesson) {
            loadQuickLesson();
        }
    }, [selectedLesson]);

    const loadLessons = async () => {
        try {
            const data = await getAllLessons();
            console.log(lessons)
            setLessons(data);
            if (data.length > 0) {
                setSelectedLesson(data[0]);
            }
        } catch (error) {
            toast.error('Failed to load lessons');
        }
    };

    const loadQuickLesson = async () => {
        try {
            setLoading(true);
            const data = await getQuickLessonByLessonId(selectedLesson._id);
            console.log(data)
            setQuickLessons(data ? [data] : []);
        } catch (error) {
            toast.error('Failed to load quick lesson');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await createQuickLesson({
                ...formData,
                _id: selectedLesson._id
            });
            toast.success('Quick lesson created successfully');
            loadQuickLesson();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create quick lesson');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateQuickLesson(editingQuickLesson._id, formData);
            toast.success('Quick lesson updated successfully');
            loadQuickLesson();
            setIsDialogOpen(false);
            setEditingQuickLesson(null);
        } catch (error) {
            toast.error('Failed to update quick lesson');
        }
    };

    const handleDelete = async (quickLesson) => {
        if (window.confirm('Are you sure you want to delete this quick lesson?')) {
            try {
                await deleteQuickLesson(quickLesson._id);
                toast.success('Quick lesson deleted successfully');
                loadQuickLesson();
            } catch (error) {
                toast.error('Failed to delete quick lesson');
            }
        }
    };

    const handleEdit = (quickLesson) => {
        setEditingQuickLesson(quickLesson);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Quick Lessons</h1>
                    <div className="flex items-center gap-2">
                        <select
                            className="text-sm border rounded-md px-2 py-1"
                            value={selectedLesson?._id || ''}
                            onChange={(e) => {
                                const lesson = lessons.find(l => l._id === String(e.target.value));
                                setSelectedLesson(lesson);
                            }}
                        >
                            {lessons.map((lesson) => (
                                <option key={lesson._id} value={lesson._id}>
                                    {lesson.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setEditingQuickLesson(null);
                        setIsDialogOpen(true);
                    }}
                    disabled={!selectedLesson || quickLessons.length > 0}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Quick Lesson
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={quickLessons[0]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title={editingQuickLesson ? 'Edit Quick Lesson' : 'Create Quick Lesson'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingQuickLesson(null);
                }}
            >
                <QuickLessonForm
                    initialData={editingQuickLesson}
                    onSubmit={editingQuickLesson ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default QuickLessons; 