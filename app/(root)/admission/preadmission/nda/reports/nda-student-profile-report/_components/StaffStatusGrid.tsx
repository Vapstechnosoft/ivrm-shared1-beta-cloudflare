'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserCheck } from 'lucide-react';
import { useState } from 'react';

interface StaffStatusGridProps {
    data: any[];
}

export function StaffStatusGrid({ data }: StaffStatusGridProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((item) =>
        Object.values(item).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusIcon = (status: any) => {
        const s = String(status).toLowerCase();
        if (status === 1 || s === '1' || status === true || s === 'true') return '✅';
        if (status === 0 || s === '0' || status === false || s === 'false') return '❌';
        return '⏳';
    };

    const getStatusText = (status: any) => {
        const s = String(status).toLowerCase();
        if (status === 1 || s === '1' || status === true || s === 'true') return 'Approved';
        if (status === 0 || s === '0' || status === false || s === 'false') return 'Rejected';
        return 'Pending';
    };

    return (
        <Card className='overflow-hidden rounded-[2.5rem] border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl'>
            <CardHeader className='flex flex-col items-start justify-between gap-6 border-slate-100 border-b bg-slate-50/50 p-8 md:flex-row md:items-center'>
                <div className='flex items-center gap-6'>
                    <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-inner'>
                        <UserCheck className='h-8 w-8' />
                    </div>
                    <div>
                        <CardTitle className='font-black text-2xl text-slate-800 tracking-tight'>EMPLOYEE STATUS REPORT</CardTitle>
                        <div className='mt-1 flex items-center gap-2'>
                            <Badge variant='secondary' className='bg-indigo-50 px-3 py-1 font-bold text-indigo-700'>
                                {data.length} TOTAL RECORDS
                            </Badge>
                            {searchTerm && (
                                <Badge variant='outline' className='px-3 py-1 font-bold text-slate-500'>
                                    {filteredData.length} FOUND
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className='group relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-4 h-5 w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500' />
                    <Input
                        placeholder='Search employee profile...'
                        className='h-14 rounded-full border-slate-200 bg-white pl-12 font-medium transition-all focus:ring-2 focus:ring-indigo-500'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader className='bg-slate-50'>
                            <TableRow className='h-16 border-slate-100 border-b'>
                                <TableHead className='w-20 text-center font-black text-slate-700 uppercase tracking-tighter'>
                                    SL.NO
                                </TableHead>
                                <TableHead className='font-black text-slate-700 uppercase tracking-tighter'>Employee Name</TableHead>
                                <TableHead className='font-black text-slate-700 uppercase tracking-tighter'>Department</TableHead>
                                <TableHead className='font-black text-slate-700 uppercase tracking-tighter'>Designation</TableHead>
                                <TableHead className='text-center font-black text-slate-700 uppercase tracking-tighter'>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((row, index) => (
                                <TableRow key={index} className='border-slate-50 border-b transition-colors hover:bg-indigo-50/30'>
                                    <TableCell className='text-center font-bold text-slate-500'>{index + 1}</TableCell>
                                    <TableCell className='font-black text-lg text-slate-800 tracking-tight'>
                                        {row.EmployeeName || row.name}
                                    </TableCell>
                                    <TableCell className='font-bold text-slate-600 uppercase'>{row.HRMD_DepartmentName}</TableCell>
                                    <TableCell className='font-bold text-slate-600 uppercase'>{row.HRMDES_DesignationName}</TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex flex-col items-center gap-1'>
                                            <span className='text-2xl' title={getStatusText(row.HRMEREQREQ_ConformFlg)}>
                                                {getStatusIcon(row.HRMEREQREQ_ConformFlg)}
                                            </span>
                                            <span className='font-black text-[10px] text-slate-400 uppercase tracking-widest'>
                                                {getStatusText(row.HRMEREQREQ_ConformFlg)}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {filteredData.length === 0 && (
                    <div className='p-20 text-center'>
                        <p className='font-bold text-slate-400 uppercase tracking-widest'>No matching records found</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
