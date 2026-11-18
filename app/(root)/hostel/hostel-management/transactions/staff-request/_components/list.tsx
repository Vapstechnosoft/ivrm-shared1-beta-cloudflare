'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Edit, Minus, Search } from 'lucide-react';
import { useState } from 'react';

export default function StaffRequestList({
    data,
    onEdit,
    onToggle
}: {
    data: any[];
    onEdit: (data: any) => void;
    onToggle: (data: any) => void;
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter(
        (item) =>
            item.empName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.HRMD_DepartmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Card className='border-t-4 border-t-[#4255a7] shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-white px-4 py-2'>
                <CardTitle className='font-bold text-[#4255a7] text-sm uppercase'>HOSTEL STAFF REQUEST DETAILS</CardTitle>
                <Minus className='h-4 w-4 cursor-pointer text-gray-400' />
            </CardHeader>
            <CardContent className='p-4'>
                <div className='mb-4 flex flex-col items-center justify-between gap-4 md:flex-row'>
                    <div className='flex items-center space-x-2'>
                        <span className='font-bold text-gray-700 text-xs'>Total Grid Records :</span>
                        <span className='rounded bg-gray-100 px-2 py-0.5 font-bold text-[#4255a7] text-xs'>{filteredData.length}</span>
                    </div>
                    <div className='relative w-full md:w-80'>
                        <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                        <Input
                            placeholder='search here...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='h-9 rounded-full border-blue-200 pl-10 transition-colors focus:border-[#4255a7]'
                        />
                    </div>
                </div>

                <div className='overflow-x-auto rounded-md border border-gray-100 shadow-sm'>
                    <Table>
                        <TableHeader className='bg-[#4255a7] hover:bg-[#4255a7]'>
                            <TableRow className='h-10 border-none hover:bg-transparent'>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>SL.No.</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Staff Name</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Department</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Designation</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Emp code</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Hostel</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>
                                    Room Category
                                </TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>AC</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Mess Type</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Request Date</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Remarks</TableHead>
                                <TableHead className='whitespace-nowrap font-bold text-[11px] text-white uppercase'>Status</TableHead>
                                <TableHead className='whitespace-nowrap text-center font-bold text-[11px] text-white uppercase'>
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => (
                                    <TableRow key={index} className='border-gray-100 border-b transition-colors hover:bg-blue-50/30'>
                                        <TableCell className='py-2.5 font-medium text-gray-600 text-xs'>{index + 1}</TableCell>
                                        <TableCell className='py-2.5 font-semibold text-blue-900 text-xs'>{item.empName}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>{item.HRMD_DepartmentName}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>{item.HRMDES_DesignationName}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>{item.HRME_EmployeeCode}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>{item.hlmH_Name}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>{item.hlmrcA_RoomCategory}</TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>
                                            {item.HLHSTREQ_ACRoomFlg ? 'Yes' : 'No'}
                                        </TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>
                                            {item.HLHSTREQ_VegMessFlg ? 'Veg' : ''}
                                            {item.HLHSTREQ_VegMessFlg && item.HLHSTREQ_NonVegMessFlg ? ' / ' : ''}
                                            {item.HLHSTREQ_NonVegMessFlg ? 'Non-Veg' : ''}
                                        </TableCell>
                                        <TableCell className='py-2.5 text-gray-600 text-xs'>
                                            {format(new Date(item.HLHSTREQ_RequestDate), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className='max-w-[150px] truncate py-2.5 text-gray-600 text-xs'>
                                            {item.HLHSTREQ_Remarks || '-'}
                                        </TableCell>
                                        <TableCell className='py-2.5 text-xs'>
                                            <span
                                                onClick={() => onToggle(item)}
                                                className={cn(
                                                    'cursor-pointer rounded px-2 py-0.5 font-bold text-[10px] uppercase',
                                                    item.HLHSTREQ_ActiveFlg ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                                )}>
                                                {item.HLHSTREQ_ActiveFlg ? 'Active' : 'Deactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className='py-2.5 text-center'>
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => onEdit(item)}
                                                className='h-7 w-7 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
                                                <Edit className='h-4 w-4' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={13} className='h-32 text-center'>
                                        <div className='flex flex-col items-center justify-center space-y-2'>
                                            <span className='font-medium text-gray-400'>Record Not Found!</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
