import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import TelegramGroupForm from '@/components/admin/forms/TelegramGroupForm';
import { getAllGroups, createGroup, updateGroup, deleteGroup } from '@/api/telegramGroupService';
import { toast } from 'sonner';

const TelegramGroups = () => {
    const [groups, setGroups] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: '_id', label: 'ID' },
        { key: 'telegram_chat_id', label: 'Chat ID' },
        { 
            key: 'status', 
            label: 'Status',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    value === 'available' ? 'bg-green-100 text-green-800' : 
                    value === 'in_use' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                }`}>
                    {value}
                </span>
            )
        },
        { 
            key: 'last_used_at', 
            label: 'Last Used',
            render: (value) => value ? new Date(value).toLocaleString() : '-'
        },
        { 
            key: 'created_at', 
            label: 'Created',
            render: (value) => new Date(value).toLocaleString()
        },
    ];

    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        try {
            setLoading(true);
            const data = await getAllGroups();
            setGroups(data);
        } catch (error) {
            toast.error('Failed to load telegram groups');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (formData) => {
        try {
            await createGroup(formData);
            toast.success('Telegram group created successfully');
            loadGroups();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error('Failed to create telegram group');
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateGroup(editingGroup._id, formData);
            toast.success('Telegram group updated successfully');
            loadGroups();
            setIsDialogOpen(false);
            setEditingGroup(null);
        } catch (error) {
            toast.error('Failed to update telegram group');
        }
    };

    const handleDelete = async (group) => {
        if (window.confirm('Are you sure you want to delete this telegram group?')) {
            try {
                await deleteGroup(group._id);
                toast.success('Telegram group deleted successfully');
                loadGroups();
            } catch (error) {
                toast.error('Failed to delete telegram group');
            }
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Telegram Groups</h1>
                    <p className="text-sm text-gray-500">
                        Manage Telegram groups for live sessions
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingGroup(null);
                        setIsDialogOpen(true);
                    }}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Group
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={groups}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title={editingGroup ? 'Edit Telegram Group' : 'Create Telegram Group'}
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingGroup(null);
                }}
            >
                <TelegramGroupForm
                    initialData={editingGroup}
                    onSubmit={editingGroup ? handleUpdate : handleCreate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default TelegramGroups; 