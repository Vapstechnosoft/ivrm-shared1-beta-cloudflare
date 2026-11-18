'use client';

import { Heading } from '@/components/layout/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomTransferTab from './_components/transfer-tab';
import HostelVacateTab from './_components/vacate-tab';

export default function RoomTransferPage() {
    return (
        <div className='flex-col'>
            <div className='flex items-center justify-end bg-gray-100/50 px-8 py-2 font-medium text-[10px] text-gray-500'>
                <span>Transaction &gt; HostelRoomTransfer</span>
            </div>
            <div className='min-h-screen flex-1 space-y-4 bg-slate-50/50 p-8 pt-4'>
                <Heading title='Hostel Room Transfer' description='Manage hostel room transfers and vacations.' />

                <Tabs defaultValue='transfer' className='space-y-4'>
                    <TabsList className='bg-primary/5 p-1'>
                        <TabsTrigger
                            value='transfer'
                            className='px-8 font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-white'>
                            ROOM TRANSFER
                        </TabsTrigger>
                        <TabsTrigger
                            value='vacate'
                            className='px-8 font-bold text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-white'>
                            HOSTEL VACATE
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='transfer' className='fade-in slide-in-from-top-4 animate-in space-y-4 duration-500'>
                        <RoomTransferTab />
                    </TabsContent>
                    <TabsContent value='vacate' className='fade-in slide-in-from-top-4 animate-in space-y-4 duration-500'>
                        <HostelVacateTab />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
