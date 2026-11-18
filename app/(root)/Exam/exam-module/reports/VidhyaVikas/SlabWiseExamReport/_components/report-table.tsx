'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportTableProps {
    data: any[];
    reportType: 'Marks' | 'Percentage';
    fromRange: number;
    toRange: number;
}

export default function ReportTable({ data, reportType, fromRange, toRange }: ReportTableProps) {
    if (!data || data.length === 0) return null;

    return (
        <div className='mt-8 rounded-lg border bg-card shadow-sm' id='slab-report-container'>
            <div className='p-6'>
                <div className='mb-6 text-center'>
                    <h3 className='font-bold text-xl uppercase'>Slab Wise Exam Marks Report</h3>
                    <p className='mt-2 text-muted-foreground'>
                        {reportType} Slab Report between {fromRange}
                        {reportType === 'Percentage' ? '%' : ''} - {toRange}
                        {reportType === 'Percentage' ? '%' : ''}
                    </p>
                </div>

                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50'>
                                <TableHead className='w-16 text-center font-bold'>Sl.No</TableHead>
                                <TableHead className='font-bold'>Student Name</TableHead>
                                <TableHead className='font-bold'>Reg. No</TableHead>
                                {reportType === 'Marks' ? (
                                    <>
                                        <TableHead className='font-bold'>Subject Name</TableHead>
                                        <TableHead className='text-center font-bold'>Obtained Marks</TableHead>
                                    </>
                                ) : (
                                    <TableHead className='text-center font-bold'>Obtained Percentage</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((row, index) => (
                                <TableRow key={index} className='hover:bg-muted/30'>
                                    <TableCell className='text-center'>{index + 1}</TableCell>
                                    <TableCell className='font-medium'>
                                        {reportType === 'Marks'
                                            ? `${row.AMST_FirstName || ''} ${row.AMST_MiddleName || ''} ${row.AMST_LastName || ''}`.trim()
                                            : row.studentname ||
                                              `${row.AMST_FirstName || ''} ${row.AMST_MiddleName || ''} ${row.AMST_LastName || ''}`.trim()}
                                    </TableCell>
                                    <TableCell>{row.AMST_RegistrationNo}</TableCell>
                                    {reportType === 'Marks' ? (
                                        <>
                                            <TableCell>{row.ISMS_SubjectName}</TableCell>
                                            <TableCell className='text-center'>{row.ESTMPS_ObtainedMarks}</TableCell>
                                        </>
                                    ) : (
                                        <TableCell className='text-center font-semibold text-primary'>{row.ESTMP_Percentage}%</TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
