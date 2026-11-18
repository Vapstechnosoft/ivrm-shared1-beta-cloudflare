'use client';

import { getDetailsOnType, getVacateLoadData } from '@/server/hostel/hostel-management/transactions/vacate-room';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import VacateRoomList from '../../vacate-room/_components/list';
import VacateForm from '../../vacate-room/_components/vacate-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus } from 'lucide-react';

export default function HostelVacateTab() {
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
        <div className='space-y-6'>
            <VacateForm initialData={data} onTypeChange={handleTypeChange} onSuccess={handleSuccess} />

            <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between bg-[#4255a7] px-4 py-1'>
                    <CardTitle className='font-bold text-[11px] text-white uppercase tracking-wider'>HOSTEL VACATE DETAILS</CardTitle>
                    <Minus className='h-3 w-3 cursor-pointer text-white opacity-70' />
                </CardHeader>
                <CardContent className='p-6'>
                    <VacateRoomList data={data.gridlistdata || []} type={type} />
                </CardContent>
            </Card>
        </div>
    );
}
