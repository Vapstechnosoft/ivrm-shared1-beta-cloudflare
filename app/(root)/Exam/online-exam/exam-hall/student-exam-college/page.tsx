'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { GraduationCap, Clock, CheckCircle2, ChevronRight, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function StudentExamCollegePage() {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [started, setStarted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    const question = {
        no: 1,
        text: 'In relational databases, which normal form (NF) eliminates transitive dependency of non-prime attributes on super keys?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        marks: 2
    };

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-5xl mx-auto'>
            <div className='flex items-center justify-between border-b pb-4'>
                <div>
                    <h1 className='text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2'>
                        <GraduationCap className='h-8 w-8 text-indigo-600' /> College Online Examination Portal
                    </h1>
                    <p className='text-xs text-slate-500'>Course: B.Tech (CSE) | Semester VI | USN: 1MS22CS104</p>
                </div>
                {started && (
                    <div className='flex items-center gap-2 bg-indigo-50 dark:bg-slate-800 text-indigo-700 px-4 py-2 rounded-lg font-mono font-bold'>
                        <Clock className='h-4 w-4' /> 44:59
                    </div>
                )}
            </div>

            {!started ? (
                <Card className='border-slate-200 shadow-md'>
                    <CardHeader>
                        <CardTitle className='text-lg font-bold'>Select Scheduled College Exam</CardTitle>
                        <CardDescription>Choose your subject to launch the online assessment paper.</CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='space-y-1.5'>
                            <label className='text-xs font-semibold uppercase text-slate-600'>Subject Assessment</label>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger><SelectValue placeholder='Select Course Subject' /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='1'>Database Management Systems - Code: CS602</SelectItem>
                                    <SelectItem value='2'>Compiler Design - Code: CS603</SelectItem>
                                    <SelectItem value='3'>Artificial Intelligence - Code: CS604</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-end'>
                        <Button
                            onClick={() => {
                                if (!selectedSubject) {
                                    toast.error('Please select an examination subject');
                                    return;
                                }
                                setStarted(true);
                                toast.success('College Exam started');
                            }}
                            className='bg-indigo-600 hover:bg-indigo-700 text-white gap-2'
                        >
                            Begin Test <ChevronRight className='h-4 w-4' />
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <Card className='border-indigo-200 shadow-md'>
                    <CardHeader className='border-b bg-slate-50/50 flex flex-row items-center justify-between pb-3'>
                        <Badge className='bg-indigo-600 text-white'>Question {question.no} of 25</Badge>
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
                                            ? 'bg-indigo-50 border-indigo-600 font-semibold text-indigo-950'
                                            : 'border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    <span className='font-bold mr-2'>{String.fromCharCode(65 + idx)}.</span>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className='border-t flex justify-between p-4 bg-slate-50/40'>
                        <Button variant='outline' onClick={() => setStarted(false)}>Exit Exam</Button>
                        <Button
                            onClick={() => {
                                toast.success('Response saved and submitted!');
                                setStarted(false);
                            }}
                            className='bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5'
                        >
                            <Send className='h-4 w-4' /> Submit College Exam
                        </Button>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
