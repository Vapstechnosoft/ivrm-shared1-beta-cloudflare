'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, Printer, FileSpreadsheet, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function PAOnlineExamReportPage() {
    const candidates = [
        { id: 1, name: 'Siddharth Roy', appNo: 'APP2026-8941', score: 38, total: 40, percentage: 95, status: 'Qualified' },
        { id: 2, name: 'Kavya Sen', appNo: 'APP2026-8942', score: 34, total: 40, percentage: 85, status: 'Qualified' },
        { id: 3, name: 'Tanmay Bhat', appNo: 'APP2026-8943', score: 18, total: 40, percentage: 45, status: 'Not Qualified' }
    ];

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto print:p-0'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2'>
                        <FileBarChart className='h-7 w-7 text-emerald-600' /> Pre-Admission Entrance Exam Results
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Rank list, qualification status and score breakdown of applicants who took online entrance assessments.
                    </p>
                </div>
                <div className='flex gap-2'>
                    <Button variant='outline' onClick={() => toast.success('Exported to Excel')} className='gap-1.5'>
                        <FileSpreadsheet className='h-4 w-4 text-emerald-600' /> Export Excel
                    </Button>
                    <Button onClick={() => window.print()} className='gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white'>
                        <Printer className='h-4 w-4' /> Print Result Sheet
                    </Button>
                </div>
            </div>

            <Card className='border-slate-200 shadow-sm'>
                <CardHeader className='pb-3'>
                    <CardTitle className='text-base font-bold'>Applicant Qualification Ranking</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>
                    <div className='divide-y divide-slate-100 dark:divide-slate-800'>
                        <div className='grid grid-cols-12 gap-4 p-3.5 bg-slate-50 dark:bg-slate-900 font-semibold text-xs text-slate-600 uppercase'>
                            <span className='col-span-1'>Rank</span>
                            <span className='col-span-4'>Candidate Name</span>
                            <span className='col-span-3'>Application No</span>
                            <span className='col-span-2 text-center'>Score</span>
                            <span className='col-span-2 text-center'>Result</span>
                        </div>
                        {candidates.map((c, idx) => (
                            <div key={c.id} className='grid grid-cols-12 gap-4 p-3.5 text-sm items-center hover:bg-slate-50 transition-colors'>
                                <span className='col-span-1 font-bold text-slate-500'>#{idx + 1}</span>
                                <span className='col-span-4 font-semibold text-slate-900 dark:text-white'>{c.name}</span>
                                <span className='col-span-3 text-slate-600 text-xs font-mono'>{c.appNo}</span>
                                <span className='col-span-2 text-center font-bold text-emerald-700'>
                                    {c.score} / {c.total} ({c.percentage}%)
                                </span>
                                <span className='col-span-2 text-center'>
                                    <Badge variant={c.status === 'Qualified' ? 'default' : 'destructive'} className='text-xs'>
                                        {c.status}
                                    </Badge>
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
