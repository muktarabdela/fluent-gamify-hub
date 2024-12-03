import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import UserForm from '@/components/admin/forms/UserForm';
import { getAllUsers, updateUserPreferences, deleteUser } from '@/api/userService';
import { toast } from 'sonner';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'user_id', label: 'ID' },
        { key: 'username', label: 'Username' },
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'country', label: 'Country' },
        { 
            key: 'onboarding_completed', 
            label: 'Onboarding',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {value ? 'Completed' : 'Pending'}
                </span>
            )
        },
        { 
            key: 'like_coins', 
            label: 'Like Coins',
            render: (value) => (
                <span className="font-medium">{value || 0}</span>
            )
        },
        { 
            key: 'created_at', 
            label: 'Joined',
            render: (value) => new Date(value).toLocaleDateString()
        },
    ];

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (formData) => {
        try {
            await updateUserPreferences(editingUser.user_id, {
                preferences: {
                    country: formData.country,
                    interests: formData.interests,
                    onboarding_completed: formData.onboarding_completed,
                    like_coins_increment: formData.like_coins_increment
                }
            });
            toast.success('User updated successfully');
            loadUsers();
            setIsDialogOpen(false);
            setEditingUser(null);
        } catch (error) {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (user) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteUser(user.user_id);
                toast.success('User deleted successfully');
                loadUsers();
            } catch (error) {
                toast.error('Failed to delete user');
            }
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Users</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={users}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title="Edit User"
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingUser(null);
                }}
            >
                <UserForm
                    initialData={editingUser}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default Users; 