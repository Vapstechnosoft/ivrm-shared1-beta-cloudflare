'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Plus, UserPlus, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PAMasterQuestionPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [asmcL_Id, setAsmcL_Id] = useState('1');
    const [ismS_Id, setIsmS_Id] = useState('1');
    const [questionText, setQuestionText] = useState('');
    const [marks, setMarks] = useState(1);

    const [options, setOptions] = useState([
        { optionText: '', isAnswer: true },
        { optionText: '', isAnswer: false },
        { optionText: '', isAnswer: false },
        { optionText: '', isAnswer: false }
    ]);

    const paQuestions = [
        {
            id: 1,
            class: 'Pre-Admission Entrance - Grade 11 Science',
            subject: 'General Science & Aptitude',
            question: 'If log₁₀(x) = 3, what is the value of x?',
            marks: 1,
            options: ['10', '100', '1000', '0.001'],
            answer: '1000'
        },
        {
            id: 2,
            class: 'Pre-Admission Entrance - Grade 11 Science',
            subject: 'General Science & Aptitude',
            question: 'Find the odd one out: Mercury, Venus, Mars, Sirius.',
            marks: 1,
            options: ['Mercury', 'Venus', 'Mars', 'Sirius'],
            answer: 'Sirius'
        }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionText.trim()) {
            toast.error('Please enter entrance test question text');
            return;
        }
        toast.success('Pre-Admission entrance question saved!');
        setIsAddOpen(false);
    };

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2'>
                        <UserPlus className='h-7 w-7 text-emerald-600' /> Pre-Admission Question Bank
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Manage entrance exam question repositories for prospective new admission candidates.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(prev => !prev)}
                    className='gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                >
                    <Plus className='h-4 w-4' />
                    {isAddOpen ? 'Close Form' : 'Add Entrance Question'}
                </Button>
            </div>

            {isAddOpen && (
                <Card className='border-emerald-200 shadow-md'>
                    <CardHeader className='pb-3 border-b bg-emerald-50/30'>
                        <CardTitle className='text-lg font-semibold'>New Entrance Test Question</CardTitle>
                    </CardHeader>
                    <CardContent className='pt-5'>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Target Admission Class</Label>
                                    <Select value={asmcL_Id} onValueChange={setAsmcL_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Class' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Grade 11 - Science Entrance</SelectItem>
                                            <SelectItem value='2'>Grade 11 - Commerce Entrance</SelectItem>
                                            <SelectItem value='3'>Grade 9 - Entrance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Subject Section</Label>
                                    <Select value={ismS_Id} onValueChange={setIsmS_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Subject' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Aptitude & Logical Reasoning</SelectItem>
                                            <SelectItem value='2'>Mathematics</SelectItem>
                                            <SelectItem value='3'>English Proficiency</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Marks</Label>
                                    <Input
                                        type='number'
                                        value={marks}
                                        onChange={e => setMarks(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs font-semibold uppercase text-slate-600'>Question Statement *</Label>
                                <Textarea
                                    rows={3}
                                    placeholder='Type the entrance test question...'
                                    value={questionText}
                                    onChange={e => setQuestionText(e.target.value)}
                                    required
                                />
                            </div>

                            <div className='flex justify-end gap-3 pt-3'>
                                <Button type='button' variant='outline' onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type='submit' className='bg-emerald-600 hover:bg-emerald-700 text-white gap-2'>
                                    <Save className='h-4 w-4' /> Save Question
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className='space-y-4'>
                {paQuestions.map((q, idx) => (
                    <Card key={q.id} className='border-slate-200 shadow-sm'>
                        <CardHeader className='pb-2 flex flex-row items-center justify-between'>
                            <div>
                                <CardTitle className='text-base font-bold'>Q{idx + 1}. {q.question}</CardTitle>
                                <CardDescription>{q.class} | {q.subject}</CardDescription>
                            </div>
                            <Badge variant='outline'>{q.marks} Mark</Badge>
                        </CardHeader>
                        <CardContent className='pt-2'>
                            <div className='grid grid-cols-2 gap-2 text-sm'>
                                {q.options.map((opt, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className={`p-2.5 rounded-md border flex items-center justify-between ${
                                            opt === q.answer ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50'
                                        }`}
                                    >
                                        <span>({String.fromCharCode(65 + optIdx)}) {opt}</span>
                                        {opt === q.answer && <CheckCircle2 className='h-4 w-4 text-emerald-600' />}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
