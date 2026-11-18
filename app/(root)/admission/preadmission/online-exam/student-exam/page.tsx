'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Send, CheckCircle2, UserPlus, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export default function PAStudentExamPage() {
    const [started, setStarted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const question = {
        no: 1,
        text: 'A car accelerates uniformly from 0 to 72 km/h in 10 seconds. Find the distance traveled by the car.',
        options: ['100 meters', '200 meters', '50 meters', '720 meters'],
        marks: 2
    };

    if (submitted) {
        return (
            <div className='min-h-screen p-4 sm:p-6 flex items-center justify-center max-w-xl mx-auto'>
                <Card className='w-full border-slate-200 shadow-xl text-center p-6 space-y-4'>
                    <div className='h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto'>
                        <Trophy className='h-8 w-8' />
                    </div>
                    <CardTitle className='text-2xl font-bold'>Entrance Test Submitted!</CardTitle>
                    <p className='text-sm text-slate-600'>
                        Thank you for appearing in the Pre-Admission Entrance Assessment. Our admissions team will review your result and update your application status.
                    </p>
                    <Button onClick={() => { setStarted(false); setSubmitted(false); }} variant='outline'>
                        Return to Portal
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-4xl mx-auto'>
            <div className='flex items-center justify-between border-b pb-4'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                        <UserPlus className='h-7 w-7 text-emerald-600' /> Pre-Admission Online Entrance Test
                    </h1>
                    <p className='text-xs text-slate-500'>Candidate App No: APP2026-8941 | Target: Grade 11 Science</p>
                </div>
                {started && (
                    <div className='flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg font-mono font-bold'>
                        <Clock className='h-4 w-4' /> 29:45
                    </div>
                )}
            </div>

            {!started ? (
                <Card className='border-slate-200 shadow-md p-6 space-y-6'>
                    <div className='space-y-2 text-center'>
                        <CardTitle className='text-xl font-bold'>Entrance Test Instructions</CardTitle>
                        <CardDescription>Duration: 30 Minutes | Total Questions: 20 | Passing Score: 50%</CardDescription>
                    </div>
                    <div className='p-4 bg-slate-50 rounded-lg text-sm text-slate-700 space-y-2'>
                        <p>• Make sure you have a stable internet connection throughout the test.</p>
                        <p>• Once you click Start, the 30-minute timer cannot be paused.</p>
                    </div>
                    <Button onClick={() => setStarted(true)} className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold'>
                        Start Entrance Assessment
                    </Button>
                </Card>
            ) : (
                <Card className='border-slate-200 shadow-md'>
                    <CardHeader className='border-b bg-slate-50/50 flex flex-row items-center justify-between pb-3'>
                        <Badge className='bg-emerald-600 text-white'>Question {question.no} of 20</Badge>
                        <Badge variant='outline'>{question.marks} Marks</Badge>
                    </CardHeader>
                    <CardContent className='p-6 space-y-4'>
                        <p className='text-base font-medium text-slate-900'>{question.text}</p>
                        <div className='space-y-2.5 pt-2'>
                            {question.options.map((opt, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedOption(idx)}
                                    className={`p-3.5 rounded-lg border text-sm cursor-pointer transition-all ${
                                        selectedOption === idx
                                            ? 'bg-emerald-50 border-emerald-600 font-semibold text-emerald-950'
                                            : 'border-slate-200 hover:border-emerald-300'
                                    }`}
                                >
                                    <span className='font-bold mr-2'>{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className='border-t flex justify-end p-4 bg-slate-50/40'>
                        <Button
                            onClick={() => {
                                setSubmitted(true);
                                toast.success('Pre-Admission exam answers submitted successfully!');
                            }}
                            className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'
                        >
                            <Send className='h-4 w-4' /> Submit Entrance Test
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
