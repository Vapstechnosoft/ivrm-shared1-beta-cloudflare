'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Sliders, Save, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PAOnlineExamConfigPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [examName, setExamName] = useState('');
    const [duration, setDuration] = useState(45);
    const [totalQuestions, setTotalQuestions] = useState(30);

    const configs = [
        { id: 1, name: 'Grade 11 Entrance Exam 2026', class: 'Grade 11', duration: 45, totalQ: 30, marks: 60, status: 'Active' },
        { id: 2, name: 'Grade 9 Entrance Assessment', class: 'Grade 9', duration: 30, totalQ: 20, marks: 40, status: 'Active' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success('Pre-Admission exam configuration saved!');
        setIsAddOpen(false);
    };

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2'>
                        <Sliders className='h-7 w-7 text-emerald-600' /> Pre-Admission Entrance Exam Config
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Setup time duration, question limits, and rules for admission entrance evaluation.
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(prev => !prev)} className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'>
                    <Plus className='h-4 w-4' /> {isAddOpen ? 'Close' : 'New Exam Config'}
                </Button>
            </div>

            {isAddOpen && (
                <Card className='border-emerald-200 shadow-md'>
                    <CardHeader className='pb-3 border-b bg-slate-50/50'>
                        <CardTitle className='text-base font-bold'>Entrance Test Parameters</CardTitle>
                    </CardHeader>
                    <CardContent className='pt-5'>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <div className='space-y-1.5 sm:col-span-2'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Test Title *</Label>
                                    <Input
                                        placeholder='e.g., Grade 11 Science Entrance Test'
                                        value={examName}
                                        onChange={e => setExamName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Duration (Mins)</Label>
                                    <Input
                                        type='number'
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className='flex justify-end gap-3 pt-3'>
                                <Button type='button' variant='outline' onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type='submit' className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'>
                                    <Save className='h-4 w-4' /> Save Config
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {configs.map(cfg => (
                    <Card key={cfg.id} className='border-slate-200 shadow-sm'>
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-base font-bold'>{cfg.name}</CardTitle>
                            <CardDescription>Target: {cfg.class}</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-2 text-sm text-slate-600'>
                            <div className='flex justify-between border-b pb-2'>
                                <span>Duration: {cfg.duration} Minutes</span>
                                <span className='font-semibold text-emerald-700'>{cfg.totalQ} Questions ({cfg.marks} M)</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
