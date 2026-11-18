'use client';

import { Heading } from '@/components/layout/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getStudentConfirmLoadData } from '@/server/hostel/hostel-management/transactions/student-request-actions';
import { Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import StudentRequestConfirmList from './_components/list';
import StudentConfirmForm from './_components/process-form';

export default function StudentRequestConfirmPage() {
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [approvedList, setApprovedList] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [processData, setProcessData] = useState<any>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getStudentConfirmLoadData();
        if (data) {
            setPendingList(data.student_RequestList || []);
            setApprovedList(data.student_RequestApp || []);
            setRooms(data.room_list || []);
            setProcessData(null);
        }
    }

    return (
        <div className='flex-col'>
            <div className='flex items-center justify-end bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Transaction &gt; CLGStudentRequestConfirm</span>
            </div>
            <div className='min-h-screen flex-1 space-y-4 bg-slate-50/50 p-8 pt-4'>
                <Heading title='Student Request Confirm' description='Confirm Student Requests' />
                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <StudentConfirmForm processData={processData || {}} rooms={rooms} onSaveSuccess={loadData} />
                </div>

                <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                    <CardHeader className='flex flex-row items-center justify-between bg-[#4255a7] px-4 py-1'>
                        <CardTitle className='font-bold text-[11px] text-white uppercase tracking-wider'>STUDENT REQUEST LIST</CardTitle>
                        <Minus className='h-3 w-3 cursor-pointer text-white opacity-70' />
                    </CardHeader>
                    <CardContent className='p-6'>
                        <div className='space-y-8'>
                            <StudentRequestConfirmList
                                data={pendingList}
                                onProcess={(data) => {
                                    setProcessData(data);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />

                            {approvedList.length > 0 && (
                                <>
                                    <Separator />
                                    <StudentRequestConfirmList
                                        data={approvedList}
                                        onProcess={() => {
                                            /* No processing required on this tab */
                                        }}
                                    />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
