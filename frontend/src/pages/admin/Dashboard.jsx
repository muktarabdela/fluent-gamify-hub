import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminDashboard = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboard; 