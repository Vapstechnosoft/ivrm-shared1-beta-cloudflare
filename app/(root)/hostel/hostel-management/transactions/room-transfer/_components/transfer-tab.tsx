'use client';

import { getRoomTransferLoadData } from '@/server/hostel/hostel-management/transactions/room-transfer';
import { useEffect, useState } from 'react';
import RoomTransferList from './list';
import RoomTransferForm from './transfer-form';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus } from 'lucide-react';

export default function RoomTransferTab() {
    const [listData, setListData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getRoomTransferLoadData('stud'); // Default to stud
        if (data?.gridlistdata) {
            setListData(data.gridlistdata);
        }
    }

    return (
        <div className='space-y-6'>
            <RoomTransferForm onSaveSuccess={loadData} />

            <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
                <CardHeader className='flex flex-row items-center justify-between bg-[#4255a7] px-4 py-1'>
                    <CardTitle className='font-bold text-[11px] text-white uppercase tracking-wider'>ROOM TRANSFER HISTORY</CardTitle>
                    <Minus className='h-3 w-3 cursor-pointer text-white opacity-70' />
                </CardHeader>
                <CardContent className='p-6'>
                    <RoomTransferList data={listData} />
                </CardContent>
            </Card>
        </div>
    );
}
