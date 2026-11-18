'use client';

import { Button } from '@/components/ui/button';
import { useEventsStudentSRKVS } from '@/hooks/sports/useEventsStudentSRKVS';
import { Edit, Eye, Trash2 } from 'lucide-react';

export default function EventsStudentSRKVSList() {
    const { gridData } = useEventsStudentSRKVS();

    if (gridData.isLoading) return <div>Loading list...</div>;

    return (
        <div className='space-y-4 rounded-md border p-4'>
            <h2 className='font-bold text-xl'>Events Student Mapping List</h2>
            <div className='overflow-x-auto'>
                <table className='w-full text-left text-sm'>
                    <thead className='bg-muted text-xs uppercase'>
                        <tr>
                            <th className='px-4 py-2'>SL.NO.</th>
                            <th className='px-4 py-2'>Year</th>
                            <th className='px-4 py-2'>Competition Category</th>
                            <th className='px-4 py-2'>Competition Level</th>
                            <th className='px-4 py-2'>Competition Name</th>
                            <th className='px-4 py-2'>Main Event</th>
                            <th className='px-4 py-2'>Sub Event</th>
                            <th className='px-4 py-2'>Sub Sub Event</th>
                            <th className='px-4 py-2'>Start Date</th>
                            <th className='px-4 py-2'>End Date</th>
                            <th className='px-4 py-2'>Venue Name</th>
                            <th className='px-4 py-2'>UOM</th>
                            <th className='px-4 py-2'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gridData.data?.data?.map((item, index) => (
                            <tr key={item.spccesT_Id} className='border-b hover:bg-muted/50'>
                                <td className='px-4 py-2'>{index + 1}</td>
                                <td className='px-4 py-2'>{item.asmaY_Year}</td>
                                <td className='px-4 py-2'>{item.categoryName}</td>
                                <td className='px-4 py-2'>{item.compitionLevel}</td>
                                <td className='px-4 py-2'>{item.eventName}</td>
                                <td className='px-4 py-2'>{item.categoryName}</td>
                                <td className='px-4 py-2'>{item.sportsName}</td>
                                <td className='px-4 py-2'>{item.spccmsccG_SportsCCGroupName}</td>
                                <td className='px-4 py-2'>{item.startDate}</td>
                                <td className='px-4 py-2'>{item.endDate}</td>
                                <td className='px-4 py-2'>{item.spccmeV_EventVenue}</td>
                                <td className='px-4 py-2'>{item.uomName}</td>
                                <td className='flex space-x-2 px-4 py-2'>
                                    <Button variant='ghost' size='icon' title='View'>
                                        <Eye className='h-4 w-4' />
                                    </Button>
                                    <Button variant='ghost' size='icon' title='Edit'>
                                        <Edit className='h-4 w-4 text-blue-500' />
                                    </Button>
                                    <Button variant='ghost' size='icon' title='Delete'>
                                        <Trash2 className='h-4 w-4 text-red-500' />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {(!gridData.data?.data || gridData.data.data.length === 0) && (
                            <tr>
                                <td colSpan={13} className='py-4 text-center'>
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
