'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { IReportResponse } from '@/types/staff-portal/student-attendance-report';
import { Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

interface ReportGridProps {
    data: IReportResponse;
    isDateWise: boolean;
}

const ReportGrid: React.FC<ReportGridProps> = ({ data, isDateWise }) => {
    const [search, setSearch] = useState('');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    const rows = data.studentAttendanceList;
    const columnsTest = data.monthList || [];

    const filteredRows = rows.filter(
        (row) =>
            row.name.toLowerCase().includes(search.toLowerCase()) ||
            row.AMST_AdmNo.toLowerCase().includes(search.toLowerCase()) ||
            row.AMAY_RollNo.toLowerCase().includes(search.toLowerCase())
    );

    const toggleSelectAll = () => {
        if (selectedRows.length === filteredRows.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(filteredRows.map((_, idx) => idx));
        }
    };

    const toggleRow = (index: number) => {
        if (selectedRows.includes(index)) {
            setSelectedRows(selectedRows.filter((i) => i !== index));
        } else {
            setSelectedRows([...selectedRows, index]);
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-start justify-between gap-4 rounded-lg bg-muted/30 p-4 md:flex-row md:items-center'>
                <div className='flex flex-wrap gap-4 text-sm'>
                    <div className='flex items-center gap-2'>
                        <span className='font-semibold'>Total Records:</span>
                        <Badge variant='outline'>{rows.length}</Badge>
                    </div>
                    {search && (
                        <div className='flex items-center gap-2'>
                            <span className='font-semibold'>Filtered:</span>
                            <Badge variant='secondary'>{filteredRows.length}</Badge>
                        </div>
                    )}
                </div>
                <div className='relative w-full md:w-72'>
                    <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                    <Input placeholder='Search students...' className='pl-8' value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className='overflow-x-auto rounded-md border'>
                <Table>
                    <TableHeader className='bg-muted/50'>
                        <TableRow>
                            <TableHead className='w-12 text-center'>
                                <Checkbox
                                    checked={selectedRows.length > 0 && selectedRows.length === filteredRows.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className='w-16 text-center'>SL. NO.</TableHead>
                            <TableHead className='min-w-[200px]'>Student Name</TableHead>
                            <TableHead>Adm. No.</TableHead>
                            <TableHead className='text-center'>Roll No.</TableHead>

                            {isDateWise ? (
                                <>
                                    {columnsTest.map((col, idx) => (
                                        <TableHead key={idx} className='min-w-[40px] px-1 text-center'>
                                            {col.day}
                                        </TableHead>
                                    ))}
                                    <TableHead className='bg-muted/80 text-center font-bold'>Held</TableHead>
                                    <TableHead className='bg-muted/80 text-center font-bold'>Attd</TableHead>
                                    <TableHead className='bg-muted/80 text-center font-bold'>%</TableHead>
                                </>
                            ) : (
                                <>
                                    <TableHead className='text-center'>Class Held</TableHead>
                                    <TableHead className='text-center'>Attendance</TableHead>
                                    <TableHead className='text-center'>Percentage (%)</TableHead>
                                    <TableHead>Remarks</TableHead>
                                </>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRows.map((row, index) => (
                            <TableRow key={index} className={cn(selectedRows.includes(index) && 'bg-primary/5')}>
                                <TableCell className='text-center'>
                                    <Checkbox checked={selectedRows.includes(index)} onCheckedChange={() => toggleRow(index)} />
                                </TableCell>
                                <TableCell className='text-center'>{index + 1}</TableCell>
                                <TableCell className='font-medium text-primary'>{row.name}</TableCell>
                                <TableCell>{row.AMST_AdmNo}</TableCell>
                                <TableCell className='text-center'>{row.AMAY_RollNo}</TableCell>

                                {isDateWise ? (
                                    <>
                                        {columnsTest.map((col, idx) => {
                                            const val = row[col.day];
                                            let colorClass = '';
                                            if (val === 'A') colorClass = 'text-destructive font-bold';
                                            if (val === 'P') colorClass = 'text-green-600 font-bold';
                                            if (val === 'HO') colorClass = 'text-amber-500 font-bold';

                                            return (
                                                <TableCell key={idx} className={cn('px-1 text-center text-xs', colorClass)}>
                                                    {val}
                                                </TableCell>
                                            );
                                        })}
                                        <TableCell className='bg-muted/20 text-center font-bold'>{data.countclass}</TableCell>
                                        <TableCell className='bg-muted/20 text-center font-bold'>{row.total}</TableCell>
                                        <TableCell className='bg-muted/20 text-center font-bold'>{row.percentage?.toFixed(2)}%</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell className='text-center'>{row.ASA_ClassHeld?.toFixed(2)}</TableCell>
                                        <TableCell className='text-center'>{row.ASA_Class_Attended?.toFixed(2)}</TableCell>
                                        <TableCell className='text-center font-bold'>{row.Percentage?.toFixed(2)}%</TableCell>
                                        <TableCell className='text-xs'>{row.Remarks}</TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {isDateWise && (
                <div className='flex items-center space-x-4 rounded-lg bg-muted/20 p-4 text-xs'>
                    <span className='font-bold'>Legend:</span>
                    <span className='font-bold text-green-600'>P: Present</span>
                    <span className='font-bold text-destructive'>A: Absent</span>
                    <span className='font-bold text-amber-500'>HO: Holiday</span>
                    <span className='text-muted-foreground'>NE: Not Entered</span>
                </div>
            )}
        </div>
    );
};

export default ReportGrid;
