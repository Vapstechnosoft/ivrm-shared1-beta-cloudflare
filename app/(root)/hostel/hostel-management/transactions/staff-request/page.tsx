'use client';

import { getStaffRequestLoadData, toggleStaffRequestStatus } from '@/server/hostel/hostel-management/transactions/staff-request-actions';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StaffRequestForm from './_components/add-form';
import StaffRequestList from './_components/list';

export default function StaffRequestPage() {
    const [listData, setListData] = useState<any[]>([]);
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStaffRequestLoadData();
        if (data?.all_requestdata) {
            setListData(data.all_requestdata as any[]);
        }
    }

    const handleEdit = (data: any) => {
        setEditData(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggle = async (data: any) => {
        const res = await toggleStaffRequestStatus(data);
        if (res?.ret) {
            toast.success('Status updated!');
            loadData();
        }
    };

    return (
        <div className='min-h-screen flex-col bg-slate-50/50'>
            <div className='flex items-center justify-end border-b bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Transaction &gt; StaffRequest</span>
            </div>
            <div className='flex-1 space-y-6 p-8'>
                <StaffRequestForm
                    onSaveSuccess={() => {
                        loadData();
                        setEditData(null);
                    }}
                    editData={editData}
                />
                <StaffRequestList data={listData} onEdit={handleEdit} onToggle={handleToggle} />
            </div>
        </div>
    );
}
