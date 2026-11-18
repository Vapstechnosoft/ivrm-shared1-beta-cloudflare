'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Layers, Plus, Trash2, Save, FileSearch, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MasterOEExamPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [examName, setExamName] = useState('');
    const [duration, setDuration] = useState(60);

    // Levels / Sections for advanced exam setup
    const [levels, setLevels] = useState([
        { id: 1, levelName: 'Section A - Easy Recall', questionCount: 10, marksPerQuestion: 1, totalMarks: 10 },
        { id: 2, levelName: 'Section B - Application & Problem Solving', questionCount: 10, marksPerQuestion: 2, totalMarks: 20 },
        { id: 3, levelName: 'Section C - HOTS / Long Answer', questionCount: 4, marksPerQuestion: 5, totalMarks: 20 }
    ]);

    const handleAddLevel = () => {
        setLevels(prev => [
            ...prev,
            {
                id: prev.length + 1,
                levelName: `Section ${String.fromCharCode(65 + prev.length)} - Advanced`,
                questionCount: 5,
                marksPerQuestion: 2,
                totalMarks: 10
            }
        ]);
    };

    const handleRemoveLevel = (id: number) => {
        setLevels(prev => prev.filter(l => l.id !== id));
    };

    const handleUpdateLevel = (id: number, field: string, value: any) => {
        setLevels(prev =>
            prev.map(l => {
                if (l.id === id) {
                    const updated = { ...l, [field]: value };
                    if (field === 'questionCount' || field === 'marksPerQuestion') {
                        updated.totalMarks = Number(updated.questionCount) * Number(updated.marksPerQuestion);
                    }
                    return updated;
                }
                return l;
            })
        );
    };

    const totalExamQuestions = levels.reduce((acc, curr) => acc + Number(curr.questionCount || 0), 0);
    const totalExamMarks = levels.reduce((acc, curr) => acc + Number(curr.totalMarks || 0), 0);

    const handleSaveExam = () => {
        if (!examName.trim()) {
            toast.error('Please enter the Master Exam Name');
            return;
        }
        toast.success('Master Online Exam with Sections and Levels created successfully!');
        setIsAddOpen(false);
    };

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2'>
                        <Layers className='h-7 w-7 text-purple-600' /> Multi-Section Master OE Exam
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Construct comprehensive exams with sectional question distributions, difficulty tiers and custom mark allocations.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(prev => !prev)}
                    className='gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                >
                    <Plus className='h-4 w-4' />
                    {isAddOpen ? 'Close Builder' : 'Create Sectional Exam'}
                </Button>
            </div>

            {isAddOpen && (
                <Card className='border-purple-200 shadow-md'>
                    <CardHeader className='pb-3 border-b bg-purple-50/30'>
                        <CardTitle className='text-lg font-semibold'>Sectional Exam Architecture</CardTitle>
                        <CardDescription>Define exam details and configure individual test sections.</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-5 space-y-6'>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <div className='space-y-1.5 sm:col-span-2'>
                                <Label className='text-xs font-semibold uppercase text-slate-600'>Exam Title *</Label>
                                <Input
                                    placeholder='e.g., Annual Board Mock Examination - Mathematics'
                                    value={examName}
                                    onChange={e => setExamName(e.target.value)}
                                />
                            </div>
                            <div className='space-y-1.5'>
                                <Label className='text-xs font-semibold uppercase text-slate-600'>Total Duration (Mins)</Label>
                                <Input
                                    type='number'
                                    value={duration}
                                    onChange={e => setDuration(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Section / Level Cards */}
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <Label className='text-sm font-bold text-slate-800'>Exam Sections & Level Breakdowns</Label>
                                <Button type='button' variant='outline' size='sm' onClick={handleAddLevel} className='gap-1 h-8'>
                                    <Plus className='h-3.5 w-3.5' /> Add Section
                                </Button>
                            </div>

                            <div className='space-y-2.5'>
                                {levels.map((lvl, index) => (
                                    <div key={lvl.id} className='p-4 rounded-lg border bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center shadow-sm'>
                                        <div className='sm:col-span-4 space-y-1'>
                                            <Label className='text-xs text-slate-500'>Section Name</Label>
                                            <Input
                                                value={lvl.levelName}
                                                onChange={e => handleUpdateLevel(lvl.id, 'levelName', e.target.value)}
                                                className='h-9 font-medium'
                                            />
                                        </div>
                                        <div className='sm:col-span-2 space-y-1'>
                                            <Label className='text-xs text-slate-500'>Questions</Label>
                                            <Input
                                                type='number'
                                                value={lvl.questionCount}
                                                onChange={e => handleUpdateLevel(lvl.id, 'questionCount', e.target.value)}
                                                className='h-9'
                                            />
                                        </div>
                                        <div className='sm:col-span-2 space-y-1'>
                                            <Label className='text-xs text-slate-500'>Marks / Q</Label>
                                            <Input
                                                type='number'
                                                value={lvl.marksPerQuestion}
                                                onChange={e => handleUpdateLevel(lvl.id, 'marksPerQuestion', e.target.value)}
                                                className='h-9'
                                            />
                                        </div>
                                        <div className='sm:col-span-3 text-center'>
                                            <Label className='text-xs text-slate-500'>Section Total</Label>
                                            <div className='text-base font-bold text-emerald-700 dark:text-emerald-400'>
                                                {lvl.totalMarks} Marks
                                            </div>
                                        </div>
                                        <div className='sm:col-span-1 flex justify-end'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleRemoveLevel(lvl.id)}
                                                className='text-slate-400 hover:text-red-600'
                                            >
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className='p-4 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-wrap items-center justify-between gap-4 font-semibold text-slate-800 dark:text-slate-200'>
                            <div className='flex gap-6'>
                                <span>Total Sections: <span className='text-purple-600'>{levels.length}</span></span>
                                <span>Total Questions: <span className='text-blue-600'>{totalExamQuestions}</span></span>
                                <span>Aggregate Marks: <span className='text-emerald-600'>{totalExamMarks} Marks</span></span>
                            </div>
                            <div className='flex gap-2'>
                                <Button variant='outline' onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button onClick={handleSaveExam} className='bg-purple-600 hover:bg-purple-700 text-white gap-2'>
                                    <Save className='h-4 w-4' /> Save Master Exam
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* List of existing master exams */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card className='border-slate-200 shadow-sm'>
                    <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between'>
                            <div>
                                <CardTitle className='text-base font-bold text-slate-900'>CBSE Class 10 Term 1 Mock Exam</CardTitle>
                                <CardDescription>Class: 10th | Subject: Mathematics | Duration: 90 Mins</CardDescription>
                            </div>
                            <Badge className='bg-emerald-600 text-white'>Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className='space-y-3 text-sm'>
                        <div className='flex justify-between border-b pb-2 text-slate-600'>
                            <span>Sections: 3 (MCQ, Short, Long)</span>
                            <span className='font-semibold text-emerald-700'>Total: 80 Marks</span>
                        </div>
                        <div className='flex justify-end gap-2 pt-1'>
                            <Button variant='outline' size='sm' className='gap-1'>
                                <FileSearch className='h-3.5 w-3.5' /> Preview Paper
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
