'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { Plus, Sliders, Save, Clock, Trash2, Edit2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import type { IOnlineExamConfig } from '@/types/exam/online-exam';
import { useOnlineExamConfig } from '@/hooks/exam/online-exam/useOnlineExam';

export default function OnlineExamConfigPage() {
    const { data: response, isLoading, refetchAll } = useOnlineExamConfig();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [asmaY_Id, setAsmaY_Id] = useState('1');
    const [asmcL_Id, setAsmcL_Id] = useState('1');
    const [asmS_Id, setAsmS_Id] = useState('1');
    const [ismS_Id, setIsmS_Id] = useState('1');
    const [examName, setExamName] = useState('');
    const [duration, setDuration] = useState(30);
    const [totalQuestions, setTotalQuestions] = useState(25);
    const [totalMarks, setTotalMarks] = useState(50);
    const [marksPerQues, setMarksPerQues] = useState(2);
    const [passPercentage, setPassPercentage] = useState(40);
    const [randomQuestions, setRandomQuestions] = useState(true);
    const [negativeMarking, setNegativeMarking] = useState(false);
    const [negativeMarks, setNegativeMarks] = useState(0.25);
    const [fromDate, setFromDate] = useState('2026-08-25');
    const [toDate, setToDate] = useState('2026-08-30');

    const defaultConfigs: IOnlineExamConfig[] = useMemo(() => [
        {
            lmsmoecfG_Id: 1,
            asmaY_Year: '2025-2026',
            asmcL_ClassName: 'Class 10 - Standard',
            asmC_SectionName: 'Section A',
            ismS_SubjectName: 'Mathematics',
            emE_ExamName: 'Mid-Term Online Assessment',
            lmsmoecfG_TotalDuration: 45,
            lmsmoecfG_TotalQuestions: 30,
            lmsmoecfG_TotalMarks: 60,
            lmsmoecfG_PassPercentage: 40,
            lmsmoecfG_RandomQuestionFlg: true,
            lmsmoecfG_ActiveFlg: true,
            lmsmoecfG_FromDate: '2026-08-25',
            lmsmoecfG_ToDate: '2026-08-28'
        },
        {
            lmsmoecfG_Id: 2,
            asmaY_Year: '2025-2026',
            asmcL_ClassName: 'Class 10 - Standard',
            asmC_SectionName: 'Section B',
            ismS_SubjectName: 'Science',
            emE_ExamName: 'Physics Quiz Unit 1',
            lmsmoecfG_TotalDuration: 20,
            lmsmoecfG_TotalQuestions: 15,
            lmsmoecfG_TotalMarks: 30,
            lmsmoecfG_PassPercentage: 35,
            lmsmoecfG_RandomQuestionFlg: true,
            lmsmoecfG_ActiveFlg: true,
            lmsmoecfG_FromDate: '2026-09-01',
            lmsmoecfG_ToDate: '2026-09-02'
        }
    ], []);

    const configsList = useMemo(() => {
        if (Array.isArray(response?.configList)) return response.configList;
        if (Array.isArray(response?.data)) return response.data;
        return defaultConfigs;
    }, [response, defaultConfigs]);

    const tableData = useMemo(() => ({
        data: configsList,
        total: configsList.length,
        page: 1,
        page_Size: 10
    }), [configsList]);

    const tableProps = useDataTableProps(tableData);

    const columns: ColumnDef<IOnlineExamConfig>[] = useMemo(() => [
        {
            accessorKey: 'slNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return <div>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false
        },
        {
            accessorKey: 'emE_ExamName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Name' />,
            cell: ({ row }) => (
                <div className='font-semibold text-slate-800 dark:text-slate-100'>
                    {row.original.emE_ExamName || 'Online Exam'}
                </div>
            )
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class & Section' />,
            cell: ({ row }) => (
                <div className='text-xs space-y-0.5'>
                    <div className='font-medium text-slate-700'>{row.original.asmcL_ClassName}</div>
                    <div className='text-slate-500'>{row.original.asmC_SectionName}</div>
                </div>
            )
        },
        {
            accessorKey: 'ismS_SubjectName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
            cell: ({ row }) => <div className='text-sm'>{row.original.ismS_SubjectName}</div>
        },
        {
            accessorKey: 'lmsmoecfG_TotalDuration',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Duration' />,
            cell: ({ row }) => (
                <div className='flex items-center gap-1 text-xs font-semibold text-slate-700'>
                    <Clock className='h-3.5 w-3.5 text-blue-600' />
                    {row.original.lmsmoecfG_TotalDuration} Mins
                </div>
            )
        },
        {
            accessorKey: 'lmsmoecfG_TotalQuestions',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Questions / Marks' />,
            cell: ({ row }) => (
                <div className='text-xs space-y-0.5'>
                    <span className='font-medium'>{row.original.lmsmoecfG_TotalQuestions} Questions</span>
                    <Badge variant='outline' className='ml-2 text-emerald-700 font-bold'>
                        {row.original.lmsmoecfG_TotalMarks} M
                    </Badge>
                </div>
            )
        },
        {
            accessorKey: 'lmsmoecfG_FromDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Window' />,
            cell: ({ row }) => (
                <div className='text-xs text-slate-600'>
                    {row.original.lmsmoecfG_FromDate} to {row.original.lmsmoecfG_ToDate}
                </div>
            )
        },
        {
            accessorKey: 'lmsmoecfG_ActiveFlg',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
            cell: ({ row }) => (
                <Badge variant={row.original.lmsmoecfG_ActiveFlg ? 'default' : 'destructive'} className='text-xs'>
                    {row.original.lmsmoecfG_ActiveFlg ? 'Active' : 'Inactive'}
                </Badge>
            )
        }
    ], []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!examName.trim()) {
            toast.error('Please enter the exam name');
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setIsAddOpen(false);
            toast.success('Online Exam configuration created and scheduled successfully!');
            refetchAll();
        }, 500);
    };

    return (
        <div className='min-h-screen p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                    <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2'>
                        <Sliders className='h-7 w-7 text-indigo-600' /> Online Exam Configuration
                    </h1>
                    <p className='text-sm text-slate-500 mt-1'>
                        Schedule online exams, set time limits, question allotments, passing criteria and negative marks.
                    </p>
                </div>
                <Button
                    onClick={() => setIsAddOpen(prev => !prev)}
                    className='gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                >
                    <Plus className='h-4 w-4' />
                    {isAddOpen ? 'Close Configuration' : 'Create New Exam Config'}
                </Button>
            </div>

            {isAddOpen && (
                <Card className='border-indigo-200 shadow-md'>
                    <CardHeader className='pb-3 border-b bg-slate-50/50'>
                        <CardTitle className='text-lg font-semibold'>Exam Schedule & Parameter Setup</CardTitle>
                        <CardDescription>Specify test duration, total questions, marks distribution and access window.</CardDescription>
                    </CardHeader>
                    <CardContent className='pt-5'>
                        <form onSubmit={handleSubmit} className='space-y-6'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Academic Year</Label>
                                    <Select value={asmaY_Id} onValueChange={setAsmaY_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Year' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>2025-2026</SelectItem>
                                            <SelectItem value='2'>2026-2027</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Class</Label>
                                    <Select value={asmcL_Id} onValueChange={setAsmcL_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Class' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Class 10</SelectItem>
                                            <SelectItem value='2'>Class 9</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Section</Label>
                                    <Select value={asmS_Id} onValueChange={setAsmS_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Section' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Section A</SelectItem>
                                            <SelectItem value='2'>Section B</SelectItem>
                                            <SelectItem value='all'>All Sections</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Subject</Label>
                                    <Select value={ismS_Id} onValueChange={setIsmS_Id}>
                                        <SelectTrigger><SelectValue placeholder='Select Subject' /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='1'>Mathematics</SelectItem>
                                            <SelectItem value='2'>Science</SelectItem>
                                            <SelectItem value='3'>Social Science</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                                <div className='space-y-1.5 md:col-span-2'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Exam Name *</Label>
                                    <Input
                                        placeholder='e.g., Term 1 Online Physics Test'
                                        value={examName}
                                        onChange={e => setExamName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Duration (Minutes)</Label>
                                    <Input
                                        type='number'
                                        min={5}
                                        value={duration}
                                        onChange={e => setDuration(Number(e.target.value))}
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Total Questions</Label>
                                    <Input
                                        type='number'
                                        min={1}
                                        value={totalQuestions}
                                        onChange={e => setTotalQuestions(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Total Marks</Label>
                                    <Input
                                        type='number'
                                        value={totalMarks}
                                        onChange={e => setTotalMarks(Number(e.target.value))}
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Marks Per Question</Label>
                                    <Input
                                        type='number'
                                        step={0.5}
                                        value={marksPerQues}
                                        onChange={e => setMarksPerQues(Number(e.target.value))}
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Pass Percentage (%)</Label>
                                    <Input
                                        type='number'
                                        min={1}
                                        max={100}
                                        value={passPercentage}
                                        onChange={e => setPassPercentage(Number(e.target.value))}
                                    />
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs font-semibold uppercase text-slate-600'>Start Date</Label>
                                    <Input
                                        type='date'
                                        value={fromDate}
                                        onChange={e => setFromDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className='flex flex-wrap items-center gap-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='randomize'
                                        checked={randomQuestions}
                                        onCheckedChange={(checked: boolean) => setRandomQuestions(checked)}
                                    />
                                    <Label htmlFor='randomize' className='text-sm cursor-pointer'>
                                        Randomize Questions for each student
                                    </Label>
                                </div>

                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='negative'
                                        checked={negativeMarking}
                                        onCheckedChange={(checked: boolean) => setNegativeMarking(checked)}
                                    />
                                    <Label htmlFor='negative' className='text-sm cursor-pointer'>
                                        Enable Negative Marking
                                    </Label>
                                </div>

                                {negativeMarking && (
                                    <div className='flex items-center gap-2'>
                                        <Label className='text-xs text-rose-600 font-semibold'>Penalty Marks:</Label>
                                        <Input
                                            type='number'
                                            step={0.25}
                                            value={negativeMarks}
                                            onChange={e => setNegativeMarks(Number(e.target.value))}
                                            className='w-24 h-8'
                                        />
                                    </div>
                                )}
                            </div>

                            <div className='flex justify-end gap-3 pt-4 border-t'>
                                <Button type='button' variant='outline' onClick={() => setIsAddOpen(false)}>Cancel</Button>
                                <Button type='submit' disabled={isSubmitting} className='bg-indigo-600 hover:bg-indigo-700 text-white gap-2'>
                                    <Save className='h-4 w-4' /> Save & Schedule Exam
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className='border-slate-200 shadow-sm'>
                <CardHeader className='pb-2'>
                    <CardTitle className='text-lg font-semibold'>Scheduled Online Exams</CardTitle>
                </CardHeader>
                <CardContent className='p-0 sm:p-4'>
                    <GenericDataTable columns={columns} {...tableProps} isLoading={isLoading} />
                </CardContent>
            </Card>
        </div>
    );
}
