'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IPunchDetail } from '@/types/staff-portal/biometric-report/employee-punch-attendance.types';
import { format } from 'date-fns';

interface EmployeePunchAttendanceViewProps {
    data: IPunchDetail[];
}

export const EmployeePunchAttendanceView = ({ data }: EmployeePunchAttendanceViewProps) => {
    const formateTime = (time: string) => {
        return time.slice(0, 5);
    };
    return (
        <div className='mt-6 w-full rounded-lg border bg-white p-4 shadow-sm'>
            <div className='mb-4 flex items-center justify-between'>
                <h3 className='font-semibold text-gray-800 text-lg'>Grid View</h3>
            </div>
            <div className='overflow-x-auto'>
                <Table className='border'>
                    <TableHeader>
                        <TableRow>
                            <TableHead className='w-[80px] text-center'>SLNO</TableHead>
                            <TableHead className='text-center'>Date</TableHead>
                            <TableHead className='text-center'>Time In</TableHead>
                            <TableHead className='text-center'>Time Out</TableHead>
                            <TableHead className='text-center'>Late In</TableHead>
                            <TableHead className='text-center'>Early Out</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? (
                            data.map((row, index) => (
                                <TableRow key={index} className='text-center'>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{row.punchdate ? format(new Date(row.punchdate), 'dd-MM-yyyy') : ''}</TableCell>
                                    <TableCell>{row.punchINtime ? formateTime(row.punchINtime) : '-'}</TableCell>
                                    <TableCell>{row.punchOUTtime ? formateTime(row.punchOUTtime) : '-'}</TableCell>
                                    <TableCell>{row.lateby ? formateTime(row.lateby) : '-'}</TableCell>
                                    <TableCell>{row.earlyby ? formateTime(row.earlyby) : '-'}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className='py-4 text-center'>
                                    No records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
