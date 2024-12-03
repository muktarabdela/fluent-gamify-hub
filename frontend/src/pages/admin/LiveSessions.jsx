import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import DataTable from '@/components/admin/DataTable';
import FormDialog from '@/components/admin/FormDialog';
import LiveSessionForm from '@/components/admin/forms/LiveSessionForm';
import { getAllLiveSessions, updateSession, deleteSession } from '@/api/liveSessionService';
import { toast } from 'sonner';

const LiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'session_id', label: 'ID' },
        { key: 'session_type', label: 'Type' },
        {
            key: 'lesson_title',
            label: 'Lesson',
            render: (value) => value || 'Free Talk'
        },
        { key: 'topic', label: 'Topic' },
        { key: 'level', label: 'Level' },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${value === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        value === 'Ongoing' ? 'bg-green-100 text-green-800' :
                            value === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                    }`}>
                    {value}
                </span>
            )
        },
        {
            key: 'start_time',
            label: 'Start Time',
            render: (value) => new Date(value).toLocaleString()
        },
        { key: 'duration', label: 'Duration' },
        {
            key: 'current_participants',
            label: 'Participants',
            render: (value, row) => `${value}/${row.max_participants}`
        },
        {
            key: 'host_first_name',
            label: 'Host',
            render: (value, row) => value || row.host_username || 'Unknown'
        },
    ];

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await getAllLiveSessions();
            setSessions(data);
        } catch (error) {
            toast.error('Failed to load live sessions');
        } finally {
            setLoading(false);
        }
    };
    console.log(sessions)
    const handleUpdate = async (formData) => {
        try {
            await updateSession(editingSession.session_id, formData);
            toast.success('Live session updated successfully');
            loadSessions();
            setIsDialogOpen(false);
            setEditingSession(null);
        } catch (error) {
            toast.error('Failed to update live session');
        }
    };

    const handleDelete = async (session) => {
        if (window.confirm('Are you sure you want to delete this live session?')) {
            try {
                await deleteSession(session.session_id);
                toast.success('Live session deleted successfully');
                loadSessions();
            } catch (error) {
                toast.error('Failed to delete live session');
            }
        }
    };

    const handleEdit = (session) => {
        setEditingSession(session);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">Live Sessions</h1>
                    <p className="text-sm text-gray-500">
                        Manage live sessions and their Telegram groups
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={sessions}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            <FormDialog
                title="Edit Live Session"
                isOpen={isDialogOpen}
                onClose={() => {
                    setIsDialogOpen(false);
                    setEditingSession(null);
                }}
            >
                <LiveSessionForm
                    initialData={editingSession}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsDialogOpen(false)}
                />
            </FormDialog>
        </div>
    );
};

export default LiveSessions; 