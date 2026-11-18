'use client';

import { Heading } from '@/components/layout/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDetailsOnType, getVacateLoadData } from '@/server/hostel/hostel-management/transactions/vacate-room';
import { Minus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import VacateRoomList from './_components/list';
import VacateForm from './_components/vacate-form';

export default function VacateRoomPage() {
    const [type, setType] = useState<'student' | 'staff' | 'guest'>('student');
    const [data, setData] = useState<any>({
        studentdata: [],
        staffdata: [],
        guestdata: [],
        gridlistdata: []
    });

    const loadInitialData = async () => {
        try {
            const res = await getVacateLoadData('student');
            if (res) {
                setData(res);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load initial data');
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const handleTypeChange = async (newType: any) => {
        setType(newType);
        try {
            const res = await getDetailsOnType(newType);
            if (res) {
                setData((prev: any) => ({
                    ...prev,
                    gridlistdata: res.gridlistdata || []
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSuccess = async (currType: string) => {
        handleTypeChange(currType);
    };

    return (
        <div className='flex-col'>
            <div className='flex items-center justify-end bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Transaction &gt; HostelVacate</span>
            </div>
            <div className='min-h-screen flex-1 space-y-4 bg-slate-50/50 p-8 pt-4'>
                <Heading title='Hostel Vacate' description='Manage hostel room vacations.' />

                <div className='fade-in slide-in-from-top-4 animate-in duration-500'>
                    <VacateForm initialData={data} onTypeChange={handleTypeChange} onSuccess={handleSuccess} />
                </div>

                <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                    <CardHeader className='flex flex-row items-center justify-between bg-[#4255a7] px-4 py-1'>
                        <CardTitle className='font-bold text-[11px] text-white uppercase tracking-wider'>VACATE DETAILS LIST</CardTitle>
                        <Minus className='h-3 w-3 cursor-pointer text-white opacity-70' />
                    </CardHeader>
                    <CardContent className='p-6'>
                        <VacateRoomList data={data.gridlistdata || []} type={type} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
