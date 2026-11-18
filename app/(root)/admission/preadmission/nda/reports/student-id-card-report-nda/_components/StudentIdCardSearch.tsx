'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { useIdCardClasses, useIdCardSections, useIdCardStudents } from '@/hooks/admission/preadmission/useStudentIdCardReportNda';
import { type NdaIdCardFilterFields, ndaIdCardFilterSchema } from '@/schemas/admission/preadmission/reports/nda-student-id-card-report';
import { Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StudentIdCardSearchProps {
    academicList: any[];
    initialClassList: any[];
    onSubmit: (data: any, selectedStudents: any[]) => void;
    onReset: () => void;
    onPrint: () => void;
    showPrint: boolean;
    isLoading: boolean;
}

export function StudentIdCardSearch({
    academicList,
    initialClassList,
    onSubmit,
    onReset,
    onPrint,
    showPrint,
    isLoading
}: StudentIdCardSearchProps) {
    const [classList, setClassList] = useState<any[]>(initialClassList || []);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    const classMutation = useIdCardClasses();
    const sectionMutation = useIdCardSections();
    const studentMutation = useIdCardStudents();

    const form = useForm<NdaIdCardFilterFields>({
        resolver: zodResolver(ndaIdCardFilterSchema),
        defaultValues: {
            academic_year: '',
            classname: '',
            sectionname: '',
            house: ''
        }
    });

    const { watch, setValue } = form;
    const selectedYear = watch('academic_year');
    const selectedClass = watch('classname');
    const selectedSection = watch('sectionname');

    // Load Classes when Year changes
    useEffect(() => {
        async function fetchClasses() {
            if (selectedYear) {
                try {
                    const res = (await classMutation.mutateAsync({ ASMAY_Id: Number(selectedYear) })) as any;
                    const records = res?.getClassList || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setClassList(records);
                    setValue('classname', '');
                    setValue('sectionname', '');
                    setSectionList([]);
                    setStudentList([]);
                } catch (error) {
                    toast.error('Failed to load classes');
                }
            }
        }
        fetchClasses();
    }, [selectedYear, setValue]);

    // Load Sections when Class changes
    useEffect(() => {
        async function fetchSections() {
            if (selectedYear && selectedClass) {
                try {
                    const res = (await sectionMutation.mutateAsync({
                        ASMAY_Id: Number(selectedYear),
                        ASMCL_Id: Number(selectedClass)
                    })) as any;
                    const records = res?.getSectionList || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setSectionList(records);
                    setValue('sectionname', '');
                    setStudentList([]);
                } catch (error) {
                    toast.error('Failed to load sections');
                }
            }
        }
        fetchSections();
    }, [selectedYear, selectedClass, setValue]);

    // Load Students when Section changes
    useEffect(() => {
        async function fetchStudents() {
            if (selectedYear && selectedClass && selectedSection) {
                try {
                    const res = (await studentMutation.mutateAsync({
                        ASMAY_Id: Number(selectedYear),
                        ASMCL_Id: Number(selectedClass),
                        ASMS_Id: Number(selectedSection)
                    })) as any;
                    const records =
                        res?.getStudentList ||
                        res?.studentList ||
                        res?.studentlist ||
                        (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
                    setStudentList(records.map((s: any) => ({ ...s, selected: true })));
                } catch (error) {
                    toast.error('Failed to load students');
                }
            }
        }
        fetchStudents();
    }, [selectedYear, selectedClass, selectedSection]);

    const toggleAllStudents = (checked: boolean) => {
        setStudentList(studentList.map((s) => ({ ...s, selected: checked })));
    };

    const toggleStudent = (id: number, checked: boolean) => {
        setStudentList(studentList.map((s) => (s.amsT_Id === id ? { ...s, selected: checked } : s)));
    };

    const filteredStudents = studentList.filter((s) => s.studentName.toLowerCase().includes(studentSearch.toLowerCase()));

    const handleFormSubmit = (data: NdaIdCardFilterFields) => {
        const selected = studentList.filter((s) => s.selected);
        if (selected.length === 0) {
            toast.error('Please select at least one student');
            return;
        }
        onSubmit(data, selected);
    };

    const handleFormReset = () => {
        form.reset();
        setClassList(initialClassList || []);
        setSectionList([]);
        setStudentList([]);
        onReset();
    };

    return (
        <div className='rounded-md border border-slate-200 bg-white shadow-sm'>
            <div className='flex items-center justify-between border-slate-200 border-b p-4'>
                <h2 className='font-semibold text-indigo-700 text-lg uppercase'>STUDENT ID CARD DETAILS</h2>
                <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Toggle</span>
                    <div className='h-0.5 w-3 bg-slate-500' />
                </Button>
            </div>
            <div className='p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                            {/* Filters Column */}
                            <div className='space-y-4 pt-2'>
                                <FormField
                                    control={form.control}
                                    name='academic_year'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[140px_1fr] items-center gap-4 space-y-0'>
                                            <FormLabel className='text-right font-medium text-slate-700 text-sm'>
                                                Academic Year :<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-9 rounded border-blue-400/50 bg-white text-slate-700 shadow-none focus:ring-1 focus:ring-blue-500'>
                                                        <SelectValue placeholder='--Select Academic Year--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {academicList?.map((year, index) => (
                                                        <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='classname'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[140px_1fr] items-center gap-4 space-y-0'>
                                            <FormLabel className='text-right font-medium text-slate-700 text-sm'>
                                                Class :<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={classList.length === 0}>
                                                <FormControl>
                                                    <SelectTrigger className='h-9 rounded border-blue-400/50 bg-white text-slate-700 shadow-none focus:ring-1 focus:ring-blue-500'>
                                                        <SelectValue
                                                            placeholder={classMutation.isPending ? 'Loading...' : '--Select Class--'}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classList.map((cls, index) => (
                                                        <SelectItem key={`${cls.asmcL_Id}-${index}`} value={cls.asmcL_Id.toString()}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='sectionname'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[140px_1fr] items-center gap-4 space-y-0'>
                                            <FormLabel className='text-right font-medium text-slate-700 text-sm'>
                                                Section :<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={sectionList.length === 0}>
                                                <FormControl>
                                                    <SelectTrigger className='h-9 rounded border-blue-400/50 bg-white text-slate-700 shadow-none focus:ring-1 focus:ring-blue-500'>
                                                        <SelectValue
                                                            placeholder={sectionMutation.isPending ? 'Loading...' : '--Select Section--'}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {sectionList.map((sec, index) => (
                                                        <SelectItem key={`${sec.asmS_Id}-${index}`} value={sec.asmS_Id.toString()}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='house'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-[140px_1fr] items-center gap-4 space-y-0'>
                                            <FormLabel className='text-right font-medium text-slate-700 text-sm'>
                                                HOUSE :<span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className='h-9 rounded border-blue-400/50 bg-white text-slate-700 shadow-none focus:ring-1 focus:ring-blue-500'>
                                                        <SelectValue placeholder='--Select HOUSE--' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='WHITE'>WHITE</SelectItem>
                                                    <SelectItem value='YELLOW'>JULIE (YELLOW)</SelectItem>
                                                    <SelectItem value='BLUE'>PROVIDENCE (BLUE)</SelectItem>
                                                    <SelectItem value='RED'>ELTING (RED)</SelectItem>
                                                    <SelectItem value='GREEN'>LISETTE (GREEN)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage className='col-start-2' />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Student Picker Column */}
                            <div className='flex flex-col gap-2'>
                                <div className='mb-1 flex items-center gap-2'>
                                    <input
                                        type='checkbox'
                                        id='all-students'
                                        checked={studentList.length > 0 && studentList.every((s) => s.selected)}
                                        onChange={(e) => toggleAllStudents(e.target.checked)}
                                        className='h-4 w-4 cursor-pointer rounded-sm border-slate-400'
                                    />
                                    <label htmlFor='all-students' className='cursor-pointer font-medium text-slate-700 text-sm'>
                                        Student : <span className='text-red-500'>*</span>
                                    </label>
                                </div>

                                <div className='flex h-[180px] flex-col rounded border border-blue-400/50 bg-white'>
                                    <div className='border-blue-100 border-b p-2'>
                                        <Input
                                            placeholder='search here...'
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className='h-8 rounded-sm border-slate-300 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-blue-500'
                                        />
                                    </div>
                                    <div className='flex-1 overflow-y-auto p-2'>
                                        {filteredStudents.length > 0 ? (
                                            <div className='space-y-1'>
                                                {filteredStudents.map((student, index) => (
                                                    <div
                                                        key={`${student.amsT_Id}-${index}`}
                                                        className='flex items-start gap-2 rounded px-1 py-1 hover:bg-slate-50'>
                                                        <input
                                                            type='checkbox'
                                                            id={`student-${student.amsT_Id}`}
                                                            checked={student.selected}
                                                            onChange={(e) => toggleStudent(student.amsT_Id, e.target.checked)}
                                                            className='mt-0.5 h-4 w-4 cursor-pointer rounded-sm border-slate-400'
                                                        />
                                                        <label
                                                            htmlFor={`student-${student.amsT_Id}`}
                                                            className='flex-1 cursor-pointer text-slate-700 text-sm leading-tight'>
                                                            {student.studentName}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='flex h-full flex-col items-center justify-center text-slate-400'>
                                                <p className='text-xs'>No students found</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center gap-4 border-slate-200 border-t pt-6 pb-2'>
                            <Button
                                type='submit'
                                disabled={isLoading || studentMutation.isPending}
                                className='rounded-sm bg-[#3f51b5] px-8 font-medium text-white shadow-sm transition-colors hover:bg-[#303f9f]'>
                                {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                                REPORT
                            </Button>

                            <Button
                                type='button'
                                onClick={handleFormReset}
                                className='rounded-sm bg-[#ff5722] px-8 font-medium text-white shadow-sm transition-colors hover:bg-[#e64a19]'>
                                <RotateCcw className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>

                            {showPrint && (
                                <Button
                                    type='button'
                                    onClick={onPrint}
                                    className='rounded-sm bg-[#ff9800] px-8 font-medium text-white shadow-sm transition-colors hover:bg-[#f57c00]'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    PRINT
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
