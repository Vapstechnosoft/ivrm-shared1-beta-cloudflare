'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudentLateIn } from '@/hooks/visitors-management/transactions/useStudentLateIn';
import type { StudentLateInData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    alieoS_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    alieoS_AttendanceDate: z.date({
        required_error: 'Attendance Date is required'
    }),
    alieoS_PunchDate: z.date({
        required_error: 'Punch Date is required'
    }),
    alieoS_PunchTime: z.string().min(1, 'Punch Time is required'),
    alieoS_Reason: z.string().min(1, 'Reason is required')
});

type FormValues = z.infer<typeof formSchema>;

interface StudentLateInFormProps {
    onSuccess: () => void;
    academicYears: any[];
}

export default function StudentLateInForm({ onSuccess, academicYears }: StudentLateInFormProps) {
    const { selectedRow: formData } = useFormContext<StudentLateInData>();
    const { saveStudentLateIn, isSaving, getClasses, getSections, getStudents } = useStudentLateIn();

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const isEditMode = !!formData?.alieoS_Id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            alieoS_Id: formData?.alieoS_Id || 0,
            asmaY_Id: formData?.asmaY_Id || academicYears.find((y) => y.selected)?.asmaY_Id || 0,
            asmcL_Id: formData?.asmcL_Id || 0,
            asmS_Id: formData?.asmS_Id || 0,
            alieoS_AttendanceDate: formData?.alieoS_AttendanceDate ? new Date(formData.alieoS_AttendanceDate) : new Date(),
            alieoS_PunchDate: formData?.alieoS_PunchDate ? new Date(formData.alieoS_PunchDate) : new Date(),
            alieoS_PunchTime: formData?.alieoS_PunchTime || format(new Date(), 'HH:mm'),
            alieoS_Reason: formData?.alieoS_Reason || ''
        }
    });

    const watchAcademicYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');

    // Fetch Classes
    useEffect(() => {
        if (watchAcademicYear > 0) {
            setIsLoadingClasses(true);
            getClasses(watchAcademicYear)
                .then((res) => {
                    if (res.success) {
                        setClasses(res.data.classList || []);
                        if (!isEditMode) form.setValue('asmcL_Id', 0);
                    }
                })
                .finally(() => setIsLoadingClasses(false));
        } else {
            setClasses([]);
        }
    }, [watchAcademicYear, getClasses, isEditMode, form]);

    // Fetch Sections
    useEffect(() => {
        if (watchAcademicYear > 0 && watchClass > 0) {
            setIsLoadingSections(true);
            getSections(watchAcademicYear, watchClass)
                .then((res) => {
                    if (res.success) {
                        setSections(res.data.sectionList || []);
                        if (!isEditMode) form.setValue('asmS_Id', 0);
                    }
                })
                .finally(() => setIsLoadingSections(false));
        } else {
            setSections([]);
        }
    }, [watchAcademicYear, watchClass, getSections, isEditMode, form]);

    // Fetch Students
    useEffect(() => {
        if (watchAcademicYear > 0 && watchClass > 0 && watchSection > 0) {
            setIsLoadingStudents(true);
            getStudents(watchAcademicYear, watchClass, watchSection)
                .then((res) => {
                    if (res.success) {
                        setStudents(res.data.studentlist || []);
                        if (isEditMode && formData?.amsT_Id) {
                            setSelectedStudents([formData.amsT_Id]);
                        } else {
                            setSelectedStudents([]);
                        }
                    }
                })
                .finally(() => setIsLoadingStudents(false));
        } else {
            setStudents([]);
        }
    }, [watchAcademicYear, watchClass, watchSection, getStudents, isEditMode, formData]);

    const toggleStudent = (studentId: number) => {
        setSelectedStudents((prev) => (prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]));
    };

    const toggleAllStudents = () => {
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map((s) => s.amsT_Id));
        }
    };

    const onSubmit = async (data: FormValues) => {
        if (selectedStudents.length === 0) {
            form.setError('root', { message: 'Please select at least one student' });
            return;
        }

        const studetdatalist = students.filter((s) => selectedStudents.includes(s.amsT_Id)).map((s) => ({ ...s, stud: true }));

        const submitData = {
            ...data,
            alieoS_AttendanceDate: data.alieoS_AttendanceDate.toISOString(),
            alieoS_PunchDate: data.alieoS_PunchDate.toISOString(),
            studetdatalist
        };

        await saveStudentLateIn(submitData);
        onSuccess();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='max-h-[60vh] space-y-6 overflow-y-auto px-1 pb-2'>
                {form.formState.errors.root && (
                    <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3 font-medium text-destructive text-sm'>
                        {form.formState.errors.root.message}
                    </div>
                )}

                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value.toString()}
                                    disabled={isEditMode}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicYears.map((year) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Class <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value.toString()}
                                    disabled={isEditMode || isLoadingClasses}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingClasses ? 'Loading...' : 'Select Class'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Section <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value.toString()}
                                    disabled={isEditMode || isLoadingSections}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingSections ? 'Loading...' : 'Select Section'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sections.map((sec) => (
                                            <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                {sec.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='alieoS_AttendanceDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Attendance Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='alieoS_PunchDate'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Punch Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='alieoS_PunchTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Punch Time <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type='time' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='alieoS_Reason'
                        render={({ field }) => (
                            <FormItem className='md:col-span-2 lg:col-span-3'>
                                <FormLabel>
                                    Remarks / Reason <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter reason for being late...' rows={2} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Student Selection List */}
                {students.length > 0 && (
                    <div className='mt-6 overflow-hidden rounded-md border shadow-sm'>
                        <div className='flex items-center justify-between border-b bg-muted p-3'>
                            <h4 className='font-semibold text-sm'>
                                Select Students ({selectedStudents.length}/{students.length})
                            </h4>
                            {!isEditMode && (
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='select-all'
                                        checked={selectedStudents.length === students.length && students.length > 0}
                                        onCheckedChange={toggleAllStudents}
                                    />
                                    <label htmlFor='select-all' className='cursor-pointer select-none font-medium text-sm'>
                                        Select All
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className='max-h-48 overflow-y-auto bg-background p-2'>
                            {isLoadingStudents ? (
                                <div className='flex justify-center p-4'>
                                    <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                                </div>
                            ) : (
                                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                                    {students.map((student) => (
                                        <div
                                            key={student.amsT_Id}
                                            className={`flex items-center space-x-2 rounded-md border p-2 transition-colors ${selectedStudents.includes(student.amsT_Id) ? 'border-primary/30 bg-primary/5' : 'hover:bg-muted/50'} ${isEditMode ? 'pointer-events-none opacity-70' : 'cursor-pointer'}`}
                                            onClick={() => !isEditMode && toggleStudent(student.amsT_Id)}>
                                            <Checkbox
                                                checked={selectedStudents.includes(student.amsT_Id)}
                                                onCheckedChange={() => !isEditMode && toggleStudent(student.amsT_Id)}
                                                disabled={isEditMode}
                                            />
                                            <div className='grid flex-1 leading-none'>
                                                <span className='truncate font-medium text-sm' title={student.studentName}>
                                                    {student.studentName}
                                                </span>
                                                <span className='text-muted-foreground text-xs'>{student.amst_AdmNo}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className='mt-6 flex justify-end gap-4 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSaving}>
                        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save & Send SMS/Mail
                    </Button>
                </div>
            </form>
        </Form>
    );
}
