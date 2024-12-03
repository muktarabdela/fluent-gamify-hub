import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import LessonForm from '@/components/admin/forms/LessonForm';
import { getLessonsByUnitWithStatus, createLesson, updateLesson, deleteLesson, getAllLessons } from '@/api/lessonService';
import { getAllUnits } from '@/api/unitService';
import { toast } from 'sonner';

const Lessons = () => {
    const [lessons, setLessons] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'lesson_id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'order_number', label: 'Order' },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${value === 'active' ? 'bg-green-100 text-green-800' :
                        value === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                    }`}>
                    {value || 'locked'}
                </span>
            )
        },
    ];

    useEffect(() => {
        loadUnits();
    }, []);

    useEffect(() => {
        if (selectedUnit) {
            loadLessons();
        }
    }, [selectedUnit]);

    const loadUnits = async () => {
        try {
            const data = await getAllUnits();
            setUnits(data);
            if (data.length > 0) {
                setSelectedUnit(data[0]);
            }
        } catch (error) {
            toast.error('Failed to load units');
        }
    };

    const loadLessons = async () => {
        try {
            setLoading(true);
            const data = await getAllLessons(selectedUnit.unit_id);
            setLessons(data);
        } catch (error) {
            toast.error('Failed to load lessons');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await createLesson({
                ...formData,
                unit_id: selectedUnit.unit_id
            });
            toast.success('Lesson created successfully');
            loadLessons();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create lesson');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateLesson(editingLesson.lesson_id, formData);
            toast.success('Lesson updated successfully');
            loadLessons();
            setIsDialogOpen(false);
            setEditingLesson(null);
        } catch (error) {
            toast.error('Failed to update lesson');
        }
    };

    const handleDelete = async (lesson) => {
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            try {
                await deleteLesson(lesson.lesson_id);
                toast.success('Lesson deleted successfully');
                loadLessons();
            } catch (error) {
                toast.error('Failed to delete lesson');
            }
        }
    };

    const handleEdit = (lesson) => {
        setEditingLesson(lesson);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Lessons</h1>
                    <div className="flex items-center gap-2">
                        <select
                            className="text-sm border rounded-md px-2 py-1"
                            value={selectedUnit?.unit_id || ''}
                            onChange={(e) => {
                                const unit = units.find(u => u.unit_id === Number(e.target.value));
                                setSelectedUnit(unit);
                            }}
                        >
                            {units.map((unit) => (
                                <option key={unit.unit_id} value={unit.unit_id}>
                                    {unit.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button
                    onClick={() => {
                        setEditingLesson(null);
                        setIsDialogOpen(true);
                    }}
                    disabled={!selectedUnit}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={lessons}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title={editingLesson ? 'Edit Lesson' : 'Create Lesson'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingLesson(null);
                }}
            >
                <LessonForm
                    initialData={editingLesson}
                    onSubmit={editingLesson ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default Lessons; 