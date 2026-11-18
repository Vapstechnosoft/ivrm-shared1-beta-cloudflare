'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudentHouseMapping } from '@/hooks/sports/useStudentHouseMapping';
import { studentHouseMappingSchema } from '@/schemas/sports/masters/student-house-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddFormProps {
    onSuccess: () => void;
}

export default function AddForm({ onSuccess }: AddFormProps) {
    const { loadData, getClasses, getSections, getStudents, saveData } = useStudentHouseMapping();

    const yearList = loadData.data?.yearlist || [];
    const houses = loadData.data?.houseList || [];

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [selectAll, setSelectAll] = useState(false);

    const form = useForm<z.infer<typeof studentHouseMappingSchema.addOrUpdate>>({
        resolver: zodResolver(studentHouseMappingSchema.addOrUpdate),
        defaultValues: {
            spccsH_Id: 0,
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0,
            spccmH_Id: 0,
            spccsH_Remarks: '',
            studList1: [],
            spccsH_Date: new Date()
        }
    });

    const asmaY_Id = form.watch('asmaY_Id');
    const asmcL_Id = form.watch('asmcL_Id');
    const asmS_Id = form.watch('asmS_Id');

    // ── Year → fetch classes ─────────────────────────────────────────────────
    useEffect(() => {
        if (!asmaY_Id) return;
        form.setValue('asmcL_Id', 0);
        form.setValue('asmS_Id', 0);
        form.setValue('spccmH_Id', 0);
        form.setValue('studList1', []);
        setSectionList([]);
        setStudentList([]);
        setSelectAll(false);

        getClasses.mutate(Number(asmaY_Id), {
            onSuccess: (data) => setClassList(data || [])
        });
    }, [asmaY_Id]);

    // ── Class → fetch sections ───────────────────────────────────────────────
    useEffect(() => {
        if (!asmcL_Id || !asmaY_Id) return;
        form.setValue('asmS_Id', 0);
        form.setValue('spccmH_Id', 0);
        form.setValue('studList1', []);
        setStudentList([]);
        setSelectAll(false);

        getSections.mutate(
            { asmaY_Id: Number(asmaY_Id), asmcL_Id: Number(asmcL_Id) },
            {
                onSuccess: (data) => setSectionList(data || [])
            }
        );
    }, [asmcL_Id]);

    // ── Section → fetch students ─────────────────────────────────────────────
    useEffect(() => {
        if (!asmS_Id || !asmcL_Id || !asmaY_Id) return;
        form.setValue('spccmH_Id', 0);
        form.setValue('studList1', []);
        setSelectAll(false);

        getStudents.mutate(
            { asmaY_Id: Number(asmaY_Id), asmcL_Id: Number(asmcL_Id), asmS_Id: Number(asmS_Id) },
            { onSuccess: (data) => setStudentList(data || []) }
        );
    }, [asmS_Id]);

    const filteredStudents = studentList.filter((s) => {
        const q = searchStudent.toLowerCase();
        return s.studentname?.toLowerCase().includes(q) || s.amsT_AdmNo?.toLowerCase().includes(q) || !q;
    });

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        form.setValue('studList1', checked ? filteredStudents.map((s) => ({ amsT_Id: s.amsT_Id })) : [], { shouldValidate: true });
    };

    const handleStudentToggle = (studentId: number, checked: boolean) => {
        const current = form.getValues('studList1') || [];
        form.setValue('studList1', checked ? [...current, { amsT_Id: studentId }] : current.filter((item) => item.amsT_Id !== studentId), {
            shouldValidate: true
        });
    };

    const onSubmit = (values: z.infer<typeof studentHouseMappingSchema.addOrUpdate>) => {
        saveData.mutate(values, {
            onSuccess: (result: any) => {
                const msg = (result?.message || result?.Message || '') as string;
                const isOk =
                    result?.success ||
                    result?.returnval == true ||
                    result?.returnVal == true ||
                    result?.returnVal === 'saved' ||
                    result?.returnVal === 'updated' ||
                    msg.toLowerCase() === 'saved' ||
                    msg.toLowerCase() === 'updated' ||
                    msg.toLowerCase().includes('success');

                if (isOk) {
                    toast.success(msg || 'Record saved successfully');
                    form.reset();
                    onSuccess();
                } else if (result?.returnVal === 'duplicate' || msg.toLowerCase() === 'duplicate') {
                    toast.error('Record already exists');
                } else {
                    toast.error(msg || 'Failed to save record');
                }
            },
            onError: () => toast.error('Something went wrong')
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='--Select Year--' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {yearList.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                    {item.asmaY_Year}
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
                                        Class Name <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        disabled={!asmaY_Id || getClasses.isPending}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                {getClasses.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <SelectValue placeholder='Select Class' />
                                                )}
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {classList.map((item: any) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
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
                                        Section <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        disabled={!asmcL_Id || getSections.isPending}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                {getSections.isPending ? (
                                                    <Loader2 className='h-4 w-4 animate-spin' />
                                                ) : (
                                                    <SelectValue placeholder='Select Section' />
                                                )}
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sectionList.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                    {item.asmC_SectionName}
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
                            name='spccmH_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        House <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        disabled={!asmS_Id}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select House' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {houses.map((item: any) => (
                                                <SelectItem key={item.spccmH_Id} value={item.spccmH_Id.toString()}>
                                                    {item.spccmH_HouseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className='space-y-4'>
                        <div className='rounded-md border p-4'>
                            <FormLabel className='mb-2 block font-semibold'>
                                Student Selection <span className='text-red-500'>*</span>
                            </FormLabel>
                            <Input
                                placeholder='Search students...'
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                className='mb-2'
                            />
                            {getStudents.isPending ? (
                                <div className='flex items-center justify-center gap-2 py-4 text-muted-foreground'>
                                    <Loader2 className='h-4 w-4 animate-spin' /> Loading...
                                </div>
                            ) : (
                                <>
                                    {studentList.length > 0 && (
                                        <div className='mb-2 flex items-center space-x-2 rounded-sm bg-muted/50 p-2'>
                                            <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                            <span className='font-medium text-sm'>Select All</span>
                                        </div>
                                    )}
                                    <ScrollArea className='h-[180px] w-full rounded-md border p-2'>
                                        {filteredStudents.length === 0 ? (
                                            <p className='py-4 text-center text-muted-foreground text-sm'>
                                                {asmS_Id ? 'No students found' : 'Select details to load students'}
                                            </p>
                                        ) : (
                                            filteredStudents.map((student) => {
                                                const isSelected = (form.watch('studList1') || []).some(
                                                    (item) => item.amsT_Id === student.amsT_Id
                                                );
                                                return (
                                                    <div
                                                        key={student.amsT_Id}
                                                        className='flex items-center space-x-2 rounded-sm px-1 py-1.5 hover:bg-muted/30'>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={(checked) => handleStudentToggle(student.amsT_Id, !!checked)}
                                                        />
                                                        <span className='text-sm'>
                                                            {student.studentname} - {student.amsT_AdmNo}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </ScrollArea>
                                </>
                            )}
                            {form.formState.errors.studList1 && (
                                <p className='mt-2 font-medium text-destructive text-sm'>{form.formState.errors.studList1.message}</p>
                            )}
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='spccsH_Date'
                                render={({ field }) => (
                                    <FormItem className='flex flex-col'>
                                        <FormLabel>
                                            Date <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <DatePicker date={field.value} setDate={field.onChange} placeholder='Select Date' />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='spccsH_Remarks'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Remarks</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder='Remarks' className='min-h-[40px] resize-none' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-center gap-3 border-t pt-4'>
                    <Button type='submit' disabled={saveData.isPending} className='min-w-[100px]'>
                        {saveData.isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
                            </>
                        ) : (
                            'Save Mapping'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
