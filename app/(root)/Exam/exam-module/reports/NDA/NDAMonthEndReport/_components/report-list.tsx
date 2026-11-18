'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import React, { useRef } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface NDAMonthEndReportListProps {
    data: any[];
    selectedYear: string;
    selectedMonth: string;
    selectedExam: string;
    iename: string;
}

export default function NDAMonthEndReportListView({
    data,
    selectedYear,
    selectedMonth,
    selectedExam,
    iename
}: NDAMonthEndReportListProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });

    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div id='printSectionId' ref={printRef} className='space-y-6'>
            <Card className='w-full shadow-lg'>
                <CardHeader className='pb-4 text-center border-b'>
                    <div className='flex justify-center mb-2'>
                        <img
                            src='/assets/nda_logo.jpg'
                            alt='Institution Logo'
                            className='max-h-28 md:max-h-32 w-auto object-contain mx-auto'
                        />
                    </div>
                    <h3 className='text-center font-bold text-xl uppercase tracking-wide text-slate-800'>
                        EXAM MODULE
                    </h3>
                    <h4 className='text-center font-bold text-lg text-[#0066cc] uppercase tracking-wide mt-1'>
                        {selectedExam} {selectedMonth} MONTH END REPORT
                    </h4>
                </CardHeader>

                <CardContent className='space-y-6 pt-6'>
                    {/* Metadata Header Grid matching SS2 */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm py-2 px-2 border-b pb-4'>
                        <div className='flex items-center'>
                            <span className='w-32 font-bold text-slate-900'>Designation</span>
                            <span className='mr-3 font-bold'>:</span>
                            <span className='font-bold text-slate-900'>Implementation Engineer</span>
                        </div>
                        <div className='flex items-center'>
                            <span className='w-32 font-bold text-slate-900'>Date</span>
                            <span className='mr-3 font-bold'>:</span>
                            <span className='font-bold text-slate-900'>{formattedDate}</span>
                        </div>
                        <div className='flex items-center'>
                            <span className='w-32 font-bold text-slate-900'>Name</span>
                            <span className='mr-3 font-bold'>:</span>
                            <span className='font-bold text-slate-900'>{iename || ''}</span>
                        </div>
                        <div className='flex items-center'>
                            <span className='w-32 font-bold text-slate-900'>Academic Year</span>
                            <span className='mr-3 font-bold'>:</span>
                            <span className='font-bold text-slate-900'>{selectedYear || '-'}</span>
                        </div>
                    </div>

                    {/* Report Table */}
                    <div className='overflow-hidden rounded-md border'>
                        <Table id='reportTable'>
                            <TableHeader className='bg-[#0066cc]'>
                                <TableRow className='hover:bg-[#0066cc]'>
                                    <TableHead className='w-[80px] text-center font-bold text-white'>Sl No.</TableHead>
                                    <TableHead className='font-bold text-white'>Class Name</TableHead>
                                    <TableHead className='text-center font-bold text-white'>Pass</TableHead>
                                    <TableHead className='text-center font-bold text-white'>Scored Below Minimum Marks</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((item: any, index: number) => {
                                    const className = item.ASMCL_ClassName || item.asmcL_ClassName || item.Class || item.class || item.className || item.class_Name || item.ASMCL_Class || '-';
                                    const passCount = item.Pass ?? item.pass ?? item.PASS ?? item.ESTMP_PassCount ?? item.passCount ?? item.pass_count ?? item.Passed ?? 0;
                                    const failCount = item.Fail ?? item.fail ?? item.FAIL ?? item.ESTMP_FailCount ?? item.failCount ?? item.fail_count ?? item.Failed ?? item.scoredBelowMin ?? 0;

                                    return (
                                        <TableRow key={index} className='hover:bg-muted/50'>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            <TableCell className='font-semibold text-slate-800'>{className}</TableCell>
                                            <TableCell className='text-center font-semibold text-slate-900'>{passCount}</TableCell>
                                            <TableCell className='text-center font-semibold text-slate-900'>{failCount}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Graphical Analysis */}
                    <div className='border-t pt-6' id='reportChart'>
                        <h3 className='mb-6 text-center font-bold text-md tracking-wide uppercase text-slate-700'>
                            GRAPHICAL ANALYSIS OF EXAM MONTH END REPORT
                        </h3>
                        <div className='h-[350px] w-full'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                    data={data.map((item: any) => ({
                                        class: item.ASMCL_ClassName || item.asmcL_ClassName || item.Class || item.class || item.className || item.class_Name || '',
                                        pass: item.Pass ?? item.pass ?? item.PASS ?? item.ESTMP_PassCount ?? item.passCount ?? item.pass_count ?? item.Passed ?? 0,
                                        fail: item.Fail ?? item.fail ?? item.FAIL ?? item.ESTMP_FailCount ?? item.failCount ?? item.fail_count ?? item.Failed ?? 0
                                    }))}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray='3 3' vertical={false} />
                                    <XAxis dataKey='class' />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Legend />
                                    <Bar dataKey='pass' name='PASS' fill='#16a34a' radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar dataKey='fail' name='FAIL' fill='#dc2626' radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className='mt-8 grid grid-cols-2 gap-8 pt-12' id='reportFooter'>
                        <div className='space-y-8'>
                            <div className='w-2/3 border-black/50 border-b' />
                            <div className='font-medium text-sm'>Implementation Engineer</div>
                        </div>
                        <div className='space-y-8'>
                            <div className='ml-auto w-2/3 border-black/50 border-b' />
                            <div className='text-right font-medium text-sm'>Nodal Officer</div>
                        </div>
                        <div className='space-y-8'>
                            <div className='w-2/3 border-black/50 border-b' />
                            <div className='font-medium text-sm'>End User</div>
                        </div>
                        <div className='space-y-8'>
                            <div className='ml-auto w-2/3 border-black/50 border-b' />
                            <div className='text-right font-medium text-sm'>Seal</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
