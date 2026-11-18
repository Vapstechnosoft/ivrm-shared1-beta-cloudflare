'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDCPSBonafideBranchChange,
    useDCPSBonafideCourseChange,
    useDCPSBonafideLoadData,
    useDCPSBonafideSearchFilter,
    useDCPSBonafideSemesterChange,
    useDCPSBonafideYearChange
} from '@/hooks/college/useDCPSBonafideCertificate';
import { cn } from '@/lib/utils';
import { type DCPSBonafideCertificateFormData, dcpsBonafideCertificateSchema } from '@/schemas/college/dcps-bonafide-certificate.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, Printer, RotateCcw, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormProps {
    onSubmit: (data: DCPSBonafideCertificateFormData) => void;
    onReset: () => void;
    onPrint?: () => void;
    isReportLoaded?: boolean;
    isGenerating?: boolean;
}

export function FilterForm({ onSubmit, onReset, onPrint, isReportLoaded, isGenerating }: FilterFormProps) {
    const { data: loadData, isLoading: isLoadLoading } = useDCPSBonafideLoadData();
    const yearChange = useDCPSBonafideYearChange();
    const courseChange = useDCPSBonafideCourseChange();
    const branchChange = useDCPSBonafideBranchChange();
    const semesterChange = useDCPSBonafideSemesterChange();
    const searchFilterMutation = useDCPSBonafideSearchFilter();

    const [yearList, setYearList] = useState<any[]>([]);
    const [courseList, setCourseList] = useState<any[]>([]);
    const [branchList, setBranchList] = useState<any[]>([]);
    const [semesterList, setSemesterList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const form = useForm<DCPSBonafideCertificateFormData>({
        resolver: zodResolver(dcpsBonafideCertificateSchema),
        defaultValues: {
            allorindi: 'A',
            optradio: 'S',
            Character: '1',
            asmaY_Id: 0,
            amcO_Id: null,
            amB_Id: null,
            amsE_Id: null,
            acmS_Id: null,
            amcsT_Id: 0,
            date: new Date(),
            exmname: '',
            purpose: ''
        }
    });

    const { handleSubmit, watch, setValue } = form;

    const watchAllOrIndi = watch('allorindi');
    const watchStatus = watch('optradio');
    const watchAsmayId = watch('asmaY_Id');
    const watchCourseId = watch('amcO_Id');
    const watchBranchId = watch('amB_Id');
    const watchSemId = watch('amsE_Id');
    const watchAmstId = watch('amcsT_Id');

    // On Load Initial Data
    useEffect(() => {
        if (loadData) {
            const raw = (loadData as any)?.data?.data || (loadData as any)?.data || loadData;
            const years = raw?.getyear || (loadData as any)?.getyear || [];
            const sections = raw?.allsectionlist || (loadData as any)?.allsectionlist || [];

            if (Array.isArray(years) && years.length > 0) {
                setYearList(years);
            }
            if (Array.isArray(sections) && sections.length > 0) {
                setSectionList(sections);
            }
        }
    }, [loadData]);

    // Handle Year Change
    useEffect(() => {
        if (watchAsmayId > 0) {
            setCourseList([]);
            setBranchList([]);
            setSemesterList([]);
            setValue('amcO_Id', null);
            setValue('amB_Id', null);
            setValue('amsE_Id', null);
            setValue('acmS_Id', null);
            setValue('amcsT_Id', 0);
            setStudentList([]);

            yearChange.mutate(
                { ASMAY_Id: watchAsmayId },
                {
                    onSuccess: (res: any) => {
                        const raw = res?.data?.data || res?.data || res;
                        const courses = raw?.getcourse || (res as any)?.getcourse || [];
                        setCourseList(Array.isArray(courses) ? courses : []);
                    }
                }
            );
        }
    }, [watchAsmayId]);

    // Handle Course Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchCourseId > 0) {
            setBranchList([]);
            setSemesterList([]);
            setValue('amB_Id', null);
            setValue('amsE_Id', null);
            setValue('acmS_Id', null);
            setValue('amcsT_Id', 0);
            setStudentList([]);

            courseChange.mutate(
                { ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId },
                {
                    onSuccess: (res: any) => {
                        const raw = res?.data?.data || res?.data || res;
                        const branches = raw?.getbranch || (res as any)?.getbranch || [];
                        setBranchList(Array.isArray(branches) ? branches : []);
                    }
                }
            );
        }
    }, [watchCourseId]);

    // Handle Branch Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchBranchId && watchBranchId > 0) {
            setSemesterList([]);
            setValue('amsE_Id', null);
            setValue('acmS_Id', null);
            setValue('amcsT_Id', 0);
            setStudentList([]);

            branchChange.mutate(
                { ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId, AMB_Id: watchBranchId },
                {
                    onSuccess: (res: any) => {
                        const raw = res?.data?.data || res?.data || res;
                        const semesters = raw?.getsemester || (res as any)?.getsemester || [];
                        setSemesterList(Array.isArray(semesters) ? semesters : []);
                    }
                }
            );
        }
    }, [watchBranchId]);

    // Handle Semester Change
    useEffect(() => {
        if (watchAsmayId > 0 && watchCourseId && watchBranchId && watchSemId && watchSemId > 0) {
            setSectionList([]);
            setValue('acmS_Id', null);
            setValue('amcsT_Id', 0);
            setStudentList([]);

            semesterChange.mutate(
                { ASMAY_Id: watchAsmayId, AMCO_Id: watchCourseId, AMB_Id: watchBranchId, AMSE_Id: watchSemId },
                {
                    onSuccess: (res: any) => {
                        const raw = res?.data?.data || res?.data || res;
                        const sections = raw?.getsection || (res as any)?.getsection || [];
                        setSectionList(Array.isArray(sections) ? sections : []);
                    }
                }
            );
        }
    }, [watchSemId]);

    // Reset when selection mode or status changes
    const handleAllOrIndiChange = (val: 'A' | 'I') => {
        setValue('allorindi', val);
        setValue('amcO_Id', null);
        setValue('amB_Id', null);
        setValue('amsE_Id', null);
        setValue('acmS_Id', null);
        setValue('amcsT_Id', 0);
        setValue('exmname', '');
        setStudentList([]);
    };

    const handleStatusChange = (val: 'S' | 'D' | 'L') => {
        setValue('optradio', val);
        setValue('amcsT_Id', 0);
        setStudentList([]);
    };

    // Debounced student search
    const executeStudentSearch = (value: string) => {
        if (!watchAsmayId || watchAsmayId <= 0) {
            toast.error('Please select Academic Year first');
            return;
        }

        searchFilterMutation.mutate(
            {
                filterinitialdata: '1',
                searchfilter: value,
                ASMAY_Id: watchAsmayId,
                AMCST_SOL: watchStatus,
                AMCO_Id: watchAllOrIndi === 'A' ? 0 : watchCourseId || 0,
                AMB_Id: watchAllOrIndi === 'A' ? 0 : watchBranchId || 0,
                AMSE_Id: watchAllOrIndi === 'A' ? 0 : watchSemId || 0,
                ACMS_Id: watchAllOrIndi === 'A' ? 0 : form.getValues('acmS_Id') || 0,
                allorindid: watchAllOrIndi
            },
            {
                onSuccess: (res: any) => {
                    const raw = res?.data?.data || res?.data || res;
                    const list = raw?.getstudentlist || (res as any)?.getstudentlist || [];
                    setStudentList(Array.isArray(list) ? list : []);
                    if (!Array.isArray(list) || list.length === 0) {
                        toast.info('No students found for your search');
                    }
                },
                onError: () => {
                    toast.error('Error searching students. Please try again.');
                }
            }
        );
    };

    useEffect(() => {
        if (searchQuery.length < 3) return;
        const timer = setTimeout(() => executeStudentSearch(searchQuery), 450);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleFormError = (fieldErrors: any) => {
        const firstError = Object.values(fieldErrors)[0] as any;
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const handleReset = () => {
        onReset();
        window.location.reload();
    };

    const selectedStudent = studentList.find((s) => Number(s.amcst_id ?? s.amcsT_Id ?? s.AMCST_Id) === watchAmstId);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit, handleFormError)} className='fade-in animate-in space-y-6 duration-300'>
                {/* Radio Filters Row */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                    {/* Selection Mode */}
                    <FormField
                        control={form.control}
                        name='allorindi'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md'>
                                <FormLabel className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                                    Selection Mode
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(val) => handleAllOrIndiChange(val as 'A' | 'I')}
                                        value={field.value}
                                        className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='A' id='mode-all' />
                                            <Label htmlFor='mode-all' className='cursor-pointer font-medium text-sm'>
                                                All
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='I' id='mode-indi' />
                                            <Label htmlFor='mode-indi' className='cursor-pointer font-medium text-sm'>
                                                Individual
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Student Status */}
                    <FormField
                        control={form.control}
                        name='optradio'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md'>
                                <FormLabel className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                                    Student Status
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(val) => handleStatusChange(val as 'S' | 'D' | 'L')}
                                        value={field.value}
                                        className='flex gap-4'>
                                        <div className='flex items-center space-x-1.5'>
                                            <RadioGroupItem value='S' id='status-studying' />
                                            <Label htmlFor='status-studying' className='cursor-pointer font-medium text-sm'>
                                                Studying
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-1.5'>
                                            <RadioGroupItem value='D' id='status-deactive' />
                                            <Label htmlFor='status-deactive' className='cursor-pointer font-medium text-sm'>
                                                Deactive
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-1.5'>
                                            <RadioGroupItem value='L' id='status-left' />
                                            <Label htmlFor='status-left' className='cursor-pointer font-medium text-sm'>
                                                Left
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {/* Certificate Type */}
                    <FormField
                        control={form.control}
                        name='Character'
                        render={({ field }) => (
                            <FormItem className='space-y-3 rounded-xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md'>
                                <FormLabel className='font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                                    Certificate Type
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup value={field.value} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='1' id='cert-bonafide' checked />
                                            <Label htmlFor='cert-bonafide' className='cursor-pointer font-bold text-primary text-sm'>
                                                Bonafied
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Form Fields Grid */}
                <div className='grid grid-cols-1 gap-5 rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/50 to-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-3'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value && field.value > 0 ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-lg border-slate-200'>
                                            {isLoadLoading ? (
                                                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                            ) : (
                                                <SelectValue placeholder='--Select Year--' />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {yearList.map((y: any) => {
                                            const id = (y.asmaY_Id ?? y.ASMAY_Id)?.toString();
                                            const year = y.asmaY_Year ?? y.ASMAY_Year;
                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {year}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Course */}
                    <FormField
                        control={form.control}
                        name='amcO_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Course {watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || yearChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value && field.value > 0 ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-lg border-slate-200'>
                                            {yearChange.isPending ? (
                                                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                            ) : (
                                                <SelectValue placeholder='--Select Course--' />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {courseList.map((c: any) => {
                                            const id = (c.amcO_Id ?? c.AMCO_Id)?.toString();
                                            const name = c.amcO_CourseName ?? c.AMCO_CourseName;
                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Branch */}
                    <FormField
                        control={form.control}
                        name='amB_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Branch {watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || courseChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value && field.value > 0 ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-lg border-slate-200'>
                                            {courseChange.isPending ? (
                                                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                            ) : (
                                                <SelectValue placeholder='--Select Branch--' />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {branchList.map((b: any) => {
                                            const id = (b.amB_Id ?? b.AMB_Id)?.toString();
                                            const name = b.amB_BranchName ?? b.AMB_BranchName;
                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Semester */}
                    <FormField
                        control={form.control}
                        name='amsE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Semester {watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || branchChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value && field.value > 0 ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-lg border-slate-200'>
                                            {branchChange.isPending ? (
                                                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                            ) : (
                                                <SelectValue placeholder='--Select Semester--' />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {semesterList.map((s: any) => {
                                            const id = (s.amsE_Id ?? s.AMSE_Id)?.toString();
                                            const name = s.amsE_SEMName ?? s.AMSE_SEMName;
                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name='acmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Section {watchAllOrIndi === 'I' && <span className='text-red-500'>*</span>}
                                </FormLabel>
                                <Select
                                    disabled={watchAllOrIndi === 'A' || semesterChange.isPending}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value && field.value > 0 ? field.value.toString() : ''}>
                                    <FormControl>
                                        <SelectTrigger className='h-10 rounded-lg border-slate-200'>
                                            {semesterChange.isPending ? (
                                                <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' />
                                            ) : (
                                                <SelectValue placeholder='--Select Section--' />
                                            )}
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sectionList.map((sec: any) => {
                                            const id = (sec.acmS_Id ?? sec.ACMS_Id)?.toString();
                                            const name = sec.acmS_SectionName ?? sec.ACMS_SectionName;
                                            return (
                                                <SelectItem key={id} value={id}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date */}
                    <FormField
                        control={form.control}
                        name='date'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Date <span className='text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker
                                        date={field.value}
                                        setDate={(d) => field.onChange(d || new Date())}
                                        className='h-10 rounded-lg border-slate-200'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Student Select with Search */}
                    <FormField
                        control={form.control}
                        name='amcsT_Id'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>
                                    Student <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                // biome-ignore lint/a11y/useSemanticElements: standard shadcn combobox pattern
                                                role='combobox'
                                                className={cn(
                                                    'h-10 w-full justify-between rounded-lg border-slate-200 font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value && selectedStudent
                                                    ? `${selectedStudent.studentname} ${
                                                          selectedStudent.CourseName || selectedStudent.coursename
                                                              ? `(${selectedStudent.CourseName || selectedStudent.coursename})`
                                                              : ''
                                                      }`
                                                    : 'Search Student (type 3+ characters)...'}
                                                <div className='ml-2 flex items-center gap-1.5'>
                                                    {field.value ? (
                                                        <X
                                                            className='h-4 w-4 opacity-50 hover:opacity-100'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                field.onChange(0);
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Search className='h-4 w-4 shrink-0 opacity-50' />
                                                </div>
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[360px] rounded-xl p-0 sm:w-[460px]' align='start'>
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder='Type at least 3 characters to search student...'
                                                className='h-10'
                                                onValueChange={(val) => setSearchQuery(val)}
                                            />
                                            <CommandList className='max-h-[260px] overflow-y-auto'>
                                                <CommandEmpty className='py-4 text-center text-slate-500 text-sm'>
                                                    {searchFilterMutation.isPending ? (
                                                        <div className='flex items-center justify-center gap-2 py-2'>
                                                            <Loader2 className='h-4 w-4 animate-spin text-primary' />
                                                            <span>Searching students...</span>
                                                        </div>
                                                    ) : searchQuery.length < 3 ? (
                                                        'Type at least 3 characters to search'
                                                    ) : (
                                                        'No students found'
                                                    )}
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {studentList.map((s: any, idx: number) => {
                                                        const sId = s.amcst_id ?? s.amcsT_Id ?? s.AMCST_Id;
                                                        const courseName = s.CourseName ?? s.coursename ?? s.amcO_CourseName;
                                                        const fatherName = s.fathername ? ` | S/D of: ${s.fathername}` : '';
                                                        return (
                                                            <CommandItem
                                                                key={sId ?? idx}
                                                                value={`${s.studentname}-${sId}-${idx}`}
                                                                onSelect={() => {
                                                                    if (sId) {
                                                                        field.onChange(Number(sId));
                                                                    }
                                                                    setStudentOpen(false);
                                                                }}
                                                                className='cursor-pointer p-2.5'>
                                                                <div className='flex flex-col'>
                                                                    <span className='font-semibold text-slate-900'>{s.studentname}</span>
                                                                    <span className='text-muted-foreground text-xs'>
                                                                        {courseName ? `Course: ${courseName}` : ''}
                                                                        {s.AMCST_Sex ? ` | ${s.AMCST_Sex}` : ''}
                                                                        {fatherName}
                                                                    </span>
                                                                </div>
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Hall Ticket No */}
                    <FormField
                        control={form.control}
                        name='exmname'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>Hall Ticket No:</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Enter Hall Ticket No'
                                        className='h-10 rounded-lg border-slate-200'
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Purpose (for the certificate blank) */}
                    <FormField
                        control={form.control}
                        name='purpose'
                        render={({ field }) => (
                            <FormItem className='sm:col-span-2 lg:col-span-3'>
                                <FormLabel className='font-semibold text-slate-700 text-sm'>Purpose (Optional):</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='e.g. Higher Studies / Scholarship / Passport / Visa'
                                        className='h-10 rounded-lg border-slate-200'
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Form Action Buttons */}
                <div className='flex flex-wrap items-center justify-center gap-3 pt-2'>
                    <Button type='submit' disabled={isGenerating} className='min-w-[130px] rounded-xl shadow-md transition hover:scale-105'>
                        {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                        Report
                    </Button>
                    <Button
                        type='button'
                        variant='destructive'
                        onClick={handleReset}
                        className='min-w-[120px] rounded-xl shadow-md transition hover:scale-105'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                    <Button
                        type='button'
                        variant='secondary'
                        disabled={!isReportLoaded}
                        onClick={onPrint}
                        className='min-w-[120px] rounded-xl shadow-md transition hover:scale-105'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                </div>
            </form>
        </Form>
    );
}
