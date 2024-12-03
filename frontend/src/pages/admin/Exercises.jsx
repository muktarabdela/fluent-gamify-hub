import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import ExerciseForm from '@/components/admin/forms/ExerciseForm';
import { getAllLessons } from '@/api/lessonService';
import { getExercisesByLesson, createExercise, updateExercise, deleteExercise } from '@/api/exerciseService';
import { toast } from 'sonner';

const Exercises = () => {
    const [exercises, setExercises] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingExercise, setEditingExercise] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'exercise_id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'question', label: 'Question' },
        { key: 'order_number', label: 'Order' },
        { 
            key: 'options', 
            label: 'Options',
            render: (value) => {
                if (!value) return '-';
                const optionsArray = typeof value === 'string' ? JSON.parse(value) : value;
                return Array.isArray(optionsArray) ? optionsArray.join(', ') : '-';
            }
        },
    ];

    useEffect(() => {
        loadLessons();
    }, []);

    useEffect(() => {
        if (selectedLesson) {
            loadExercises();
        }
    }, [selectedLesson]);

    const loadLessons = async () => {
        try {
            const data = await getAllLessons();
            setLessons(data);
            if (data.length > 0) {
                setSelectedLesson(data[0]);
            }
        } catch (error) {
            toast.error('Failed to load lessons');
        }
    };

    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await getExercisesByLesson(selectedLesson.lesson_id);
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
                lesson_id: selectedLesson.lesson_id
            });
            toast.success('Exercise created successfully');
            loadExercises();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create exercise');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateExercise(editingExercise.exercise_id, formData);
            toast.success('Exercise updated successfully');
            loadExercises();
            setIsDialogOpen(false);
            setEditingExercise(null);
        } catch (error) {
            toast.error('Failed to update exercise');
        }
    };

    const handleDelete = async (exercise) => {
        if (window.confirm('Are you sure you want to delete this exercise?')) {
            try {
                await deleteExercise(exercise.exercise_id);
                toast.success('Exercise deleted successfully');
                loadExercises();
            } catch (error) {
                toast.error('Failed to delete exercise');
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
                    <h1 className="text-2xl font-bold">Exercises</h1>
                    <div className="flex items-center gap-2">
                        <select
                            className="text-sm border rounded-md px-2 py-1"
                            value={selectedLesson?.lesson_id || ''}
                            onChange={(e) => {
                                const lesson = lessons.find(l => l.lesson_id === Number(e.target.value));
                                setSelectedLesson(lesson);
                            }}
                        >
                            {lessons.map((lesson) => (
                                <option key={lesson.lesson_id} value={lesson.lesson_id}>
                                    {lesson.title}
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
                    disabled={!selectedLesson}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
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
                title={editingExercise ? 'Edit Exercise' : 'Create Exercise'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingExercise(null);
                }}
            >
                <ExerciseForm
                    initialData={editingExercise}
                    onSubmit={editingExercise ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default Exercises; 