import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import UnitForm from '@/components/admin/forms/UnitForm';
import { getAllUnits, createUnit, updateUnit, deleteUnit } from '@/api/unitService';
import { toast } from 'sonner';

const Units = () => {
    const [units, setUnits] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'unit_id', label: 'ID' },
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'order_number', label: 'Order' },
        { 
            key: 'is_active', 
            label: 'Status',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            )
        },
    ];

    useEffect(() => {
        loadUnits();
    }, []);

    const loadUnits = async () => {
        try {
            setLoading(true);
            const data = await getAllUnits();
            setUnits(data);
        } catch (error) {
            toast.error('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await createUnit(formData);
            toast.success('Unit created successfully');
            loadUnits();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create unit');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateUnit(editingUnit.unit_id, formData);
            toast.success('Unit updated successfully');
            loadUnits();
            setIsDialogOpen(false);
            setEditingUnit(null);
        } catch (error) {
            toast.error('Failed to update unit');
        }
    };

    const handleDelete = async (unit) => {
        if (window.confirm('Are you sure you want to delete this unit?')) {
            try {
                await deleteUnit(unit.unit_id);
                toast.success('Unit deleted successfully');
                loadUnits();
            } catch (error) {
                toast.error('Failed to delete unit');
            }
        }
    };

    const handleEdit = (unit) => {
        setEditingUnit(unit);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Units</h1>
                <Button
                    onClick={() => {
                        setEditingUnit(null);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Unit
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={units}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title={editingUnit ? 'Edit Unit' : 'Create Unit'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingUnit(null);
                }}
            >
                <UnitForm
                    initialData={editingUnit}
                    onSubmit={editingUnit ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default Units; 