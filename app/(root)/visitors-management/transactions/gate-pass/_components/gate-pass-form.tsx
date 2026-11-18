'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useGatePass } from '@/hooks/visitors-management/transactions/useGatePass';
import { cn } from '@/lib/utils';
import { type GatePassSchema, gatePassSchema } from '@/schemas/visitors-management/transactions';
import type { GatePassTransactionData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Check, ChevronsUpDown, GraduationCap, Search, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

interface GatePassFormProps {
    onSuccess: () => void;
    initialData?: GatePassTransactionData | null;
    onCancel?: () => void;
}

export default function GatePassForm({ onSuccess, initialData, onCancel }: GatePassFormProps) {
    const { saveGatePass, data: loadedData, isSaving } = useGatePass();
    const students = loadedData?.studentlist || [];
    const employees = loadedData?.emplist || [];

    const [studentSearch, setStudentSearch] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [studentOpen, setStudentOpen] = useState(false);
    const [employeeOpen, setEmployeeOpen] = useState(false);

    const form = useForm<GatePassSchema>({
        resolver: zodResolver(gatePassSchema),
        defaultValues: {
            gatePassType: 'student',
            studentId: undefined,
            employeeId: undefined,
            remarks: ''
        }
    });

    const gatePassType = form.watch('gatePassType');

    useEffect(() => {
        if (initialData) {
            form.reset({
                gatePassType: initialData.type,
                studentId: initialData.studentId,
                employeeId: initialData.employeeId,
                remarks: initialData.remarks
            });
        } else {
            form.reset({
                gatePassType: 'student',
                studentId: undefined,
                employeeId: undefined,
                remarks: ''
            });
        }
    }, [initialData, form]);

    useEffect(() => {
        if (!initialData) {
            if (gatePassType === 'student') {
                form.setValue('employeeId', undefined);
            } else {
                form.setValue('studentId', undefined);
            }
        }
    }, [gatePassType, form, initialData]);

    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return students;
        const q = studentSearch.toLowerCase();
        return students.filter(
            (s) =>
                (s.amsT_FirstName || '').toLowerCase().includes(q) ||
                (s.amsT_AdmNo || '').toLowerCase().includes(q) ||
                (s.asmcL_ClassName || '').toLowerCase().includes(q) ||
                (s.asmC_SectionName || '').toLowerCase().includes(q)
        );
    }, [students, studentSearch]);

    const filteredEmployees = useMemo(() => {
        if (!employeeSearch.trim()) return employees;
        const q = employeeSearch.toLowerCase();
        return employees.filter(
            (e) =>
                (e.hrmE_EmployeeFirstName || '').toLowerCase().includes(q) ||
                (e.hrmD_DepartmentName || '').toLowerCase().includes(q) ||
                (e.hrmdeS_DesignationName || '').toLowerCase().includes(q)
        );
    }, [employees, employeeSearch]);

    const onSubmit = async (data: GatePassSchema) => {
        try {
            await saveGatePass(data);
            form.reset({
                gatePassType: data.gatePassType,
                studentId: undefined,
                employeeId: undefined,
                remarks: ''
            });
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    const selectedStudent = students.find((s) => s.amsT_Id === form.watch('studentId'));
    const selectedEmployee = employees.find((e) => e.hrmE_Id === form.watch('employeeId'));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* 1. Gate Pass Type Selection */}
                <div className='max-w-lg rounded-lg border bg-muted/10 p-3'>
                    <Label className='mb-2 block font-semibold text-muted-foreground text-xs uppercase tracking-wider'>
                        Gate Pass Type <span className='text-destructive'>*</span>
                    </Label>
                    <FormField
                        control={form.control}
                        name='gatePassType'
                        render={({ field }) => (
                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex items-center gap-6 pt-1'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='student' id='gp-std' />
                                    <Label htmlFor='gp-std' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                        <GraduationCap className='h-4 w-4 text-primary' />
                                        Student Gate Pass
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='employee' id='gp-emp' />
                                    <Label htmlFor='gp-emp' className='flex cursor-pointer items-center gap-1.5 font-medium text-xs'>
                                        <Briefcase className='h-4 w-4 text-primary' />
                                        Employee Gate Pass
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                </div>

                {/* 2. Selection Inputs Grid */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {gatePassType === 'student' && (
                        <FormField
                            control={form.control}
                            name='studentId'
                            render={({ field }) => (
                                <FormItem className='flex flex-col space-y-1.5'>
                                    <FormLabel className='font-semibold text-xs'>
                                        Student <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    aria-expanded={studentOpen}
                                                    className={cn(
                                                        'h-9 w-full justify-between rounded-md font-normal text-xs',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {selectedStudent ? (
                                                        <span className='truncate text-left'>
                                                            {selectedStudent.amsT_FirstName}{' '}
                                                            {selectedStudent.amsT_AdmNo ? `(${selectedStudent.amsT_AdmNo})` : ''} -{' '}
                                                            {selectedStudent.asmcL_ClassName || ''} {selectedStudent.asmC_SectionName || ''}
                                                        </span>
                                                    ) : (
                                                        'Select Student'
                                                    )}
                                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[380px] p-2' align='start'>
                                            <div className='flex items-center border-b px-1 pb-2'>
                                                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                                                <Input
                                                    placeholder='Search student name, adm no, class...'
                                                    value={studentSearch}
                                                    onChange={(e) => setStudentSearch(e.target.value)}
                                                    className='h-8 border-0 px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0'
                                                    autoFocus
                                                />
                                            </div>
                                            <div className='max-h-60 overflow-y-auto pt-2'>
                                                {filteredStudents.length === 0 ? (
                                                    <div className='py-6 text-center text-muted-foreground text-xs'>No students found</div>
                                                ) : (
                                                    filteredStudents.map((stu) => {
                                                        const isSelected = field.value === stu.amsT_Id;
                                                        return (
                                                            <div
                                                                key={stu.amsT_Id}
                                                                onClick={() => {
                                                                    field.onChange(stu.amsT_Id);
                                                                    setStudentOpen(false);
                                                                }}
                                                                className={cn(
                                                                    'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground',
                                                                    isSelected && 'bg-accent/80 font-medium'
                                                                )}>
                                                                <div className='flex flex-col'>
                                                                    <span className='font-medium text-foreground'>
                                                                        {stu.amsT_FirstName}{' '}
                                                                        {stu.amsT_AdmNo && (
                                                                            <span className='font-normal text-muted-foreground'>
                                                                                ({stu.amsT_AdmNo})
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <span className='text-[11px] text-muted-foreground'>
                                                                        {stu.asmcL_ClassName || 'Class'} -{' '}
                                                                        {stu.asmC_SectionName || 'Section'}
                                                                    </span>
                                                                </div>
                                                                {isSelected && <Check className='h-4 w-4 shrink-0 text-primary' />}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className='text-xs' />
                                </FormItem>
                            )}
                        />
                    )}

                    {gatePassType === 'employee' && (
                        <FormField
                            control={form.control}
                            name='employeeId'
                            render={({ field }) => (
                                <FormItem className='flex flex-col space-y-1.5'>
                                    <FormLabel className='font-semibold text-xs'>
                                        Employee <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    aria-expanded={employeeOpen}
                                                    className={cn(
                                                        'h-9 w-full justify-between rounded-md font-normal text-xs',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    {selectedEmployee ? (
                                                        <span className='truncate text-left'>
                                                            {selectedEmployee.hrmE_EmployeeFirstName}
                                                            {selectedEmployee.hrmD_DepartmentName
                                                                ? ` (${selectedEmployee.hrmD_DepartmentName})`
                                                                : ''}
                                                        </span>
                                                    ) : (
                                                        'Select Employee'
                                                    )}
                                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-[380px] p-2' align='start'>
                                            <div className='flex items-center border-b px-1 pb-2'>
                                                <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
                                                <Input
                                                    placeholder='Search employee name, department...'
                                                    value={employeeSearch}
                                                    onChange={(e) => setEmployeeSearch(e.target.value)}
                                                    className='h-8 border-0 px-1 text-xs focus-visible:ring-0 focus-visible:ring-offset-0'
                                                    autoFocus
                                                />
                                            </div>
                                            <div className='max-h-60 overflow-y-auto pt-2'>
                                                {filteredEmployees.length === 0 ? (
                                                    <div className='py-6 text-center text-muted-foreground text-xs'>No employees found</div>
                                                ) : (
                                                    filteredEmployees.map((emp) => {
                                                        const isSelected = field.value === emp.hrmE_Id;
                                                        return (
                                                            <div
                                                                key={emp.hrmE_Id}
                                                                onClick={() => {
                                                                    field.onChange(emp.hrmE_Id);
                                                                    setEmployeeOpen(false);
                                                                }}
                                                                className={cn(
                                                                    'flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground',
                                                                    isSelected && 'bg-accent/80 font-medium'
                                                                )}>
                                                                <div className='flex flex-col'>
                                                                    <span className='font-medium text-foreground'>
                                                                        {emp.hrmE_EmployeeFirstName}
                                                                    </span>
                                                                    <span className='text-[11px] text-muted-foreground'>
                                                                        {emp.hrmdeS_DesignationName || emp.hrmD_DepartmentName || 'Staff'}
                                                                    </span>
                                                                </div>
                                                                {isSelected && <Check className='h-4 w-4 shrink-0 text-primary' />}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage className='text-xs' />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name='remarks'
                        render={({ field }) => (
                            <FormItem className='space-y-1.5 sm:col-span-2'>
                                <FormLabel className='font-semibold text-xs'>
                                    Remarks <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter Remarks' maxLength={250} rows={2} className='text-xs' />
                                </FormControl>
                                <FormMessage className='text-xs' />
                            </FormItem>
                        )}
                    />
                </div>

                {/* 3. Action Buttons */}
                <div className='flex flex-wrap items-center gap-3 border-t pt-4 sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            form.reset();
                            if (onCancel) onCancel();
                        }}
                        disabled={isSaving}
                        className='h-9 rounded-2xl border-gray-300 px-5 text-xs transition-all duration-200 hover:scale-105'>
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSaving}
                        className='h-9 rounded-2xl bg-[#EE7854] px-5 text-white text-xs shadow-sm transition-all duration-200 hover:scale-105 hover:bg-[#d96643]'>
                        <Send className='mr-1.5 h-3.5 w-3.5' />
                        {isSaving ? 'Processing...' : initialData ? 'Update Gate Pass' : 'Generate Gate Pass'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
