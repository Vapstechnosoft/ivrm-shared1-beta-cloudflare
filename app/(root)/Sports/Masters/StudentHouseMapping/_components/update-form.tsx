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
import type { StudentHouseMappingDTO } from '@/types/sports/masters/student-house-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface UpdateFormProps {
    selectedRow: StudentHouseMappingDTO;
    onSuccess: () => void;
}

export default function UpdateForm({ selectedRow, onSuccess }: UpdateFormProps) {
    const { loadData, editData, saveData } = useStudentHouseMapping();

    const yearList = loadData.data?.yearlist || [];
    const houses = loadData.data?.houseList || [];

    const [studentList, setStudentList] = useState<any[]>([]);
    const [searchStudent, setSearchStudent] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const form = useForm<z.infer<typeof studentHouseMappingSchema.addOrUpdate>>({
        resolver: zodResolver(studentHouseMappingSchema.addOrUpdate),
        defaultValues: {
            spccsH_Id: selectedRow.spccsH_Id,
            asmaY_Id: selectedRow.asmaY_Id,
            asmcL_Id: selectedRow.asmcL_Id,
            asmS_Id: selectedRow.asmS_Id,
            spccmH_Id: selectedRow.spccmH_Id,
            spccsH_Remarks: selectedRow.spccsH_Remarks || '',
            studList1: [{ amsT_Id: selectedRow.amsT_Id! }],
            spccsH_Date: selectedRow.spccsH_Date ? new Date(selectedRow.spccsH_Date) : new Date()
        }
    });

    useEffect(() => {
        if (selectedRow) {
            setIsLoading(true);
            editData.mutate(
                {
                    spccsH_Id: selectedRow.spccsH_Id!,
                    asmaY_Id: selectedRow.asmaY_Id
                },
                {
                    onSuccess: (data: any) => {
                        if (data.editrecord && data.editrecord.length > 0) {
                            const record = data.editrecord[0];
                            form.reset({
                                spccsH_Id: record.spccsH_Id,
                                asmaY_Id: record.asmaY_Id,
                                asmcL_Id: record.asmcL_Id,
                                asmS_Id: record.asmS_Id,
                                spccmH_Id: record.spccmH_Id,
                                spccsH_Remarks: record.spccsH_Remarks || '',
                                studList1: [{ amsT_Id: record.amsT_Id }],
                                spccsH_Date: record.spccsH_Date ? new Date(record.spccsH_Date) : new Date()
                            });
                        }
                        setStudentList(data.studentList || []);
                        setIsLoading(false);
                    },
                    onError: () => {
                        toast.error('Failed to load record details');
                        setIsLoading(false);
                    }
                }
            );
        }
    }, [selectedRow]);

    const filteredStudents = studentList.filter((s: any) => {
        const q = searchStudent.toLowerCase();
        return s.studentname?.toLowerCase().includes(q) || s.amsT_AdmNo?.toLowerCase().includes(q) || !q;
    });

    const handleStudentToggle = (studentId: number, checked: boolean) => {
        const current = form.getValues('studList1') || [];
        form.setValue(
            'studList1',
            checked ? [...current, { amsT_Id: studentId }] : current.filter((item: any) => item.amsT_Id !== studentId),
            { shouldValidate: true }
        );
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
                    toast.success(msg || 'Record updated successfully');
                    form.reset();
                    onSuccess();
                } else {
                    toast.error(msg || 'Failed to update record');
                }
            },
            onError: () => toast.error('Something went wrong')
        });
    };

    if (isLoading) {
        return (
            <div className='flex items-center justify-center gap-2 py-10 text-muted-foreground'>
                <Loader2 className='h-5 w-5 animate-spin' /> Loading record details...
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    <div className='space-y-4'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Academic Year</FormLabel>
                                    <Select
                                        disabled
                                        onValueChange={(val: string) => field.onChange(Number(val))}
                                        value={field.value ? field.value.toString() : ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Year' />
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
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Input disabled value={selectedRow.asmcL_ClassName || ''} />
                            </FormItem>
                            <FormItem>
                                <FormLabel>Section</FormLabel>
                                <Input disabled value={selectedRow.asmC_SectionName || ''} />
                            </FormItem>
                        </div>

                        <FormField
                            control={form.control}
                            name='spccmH_Id'
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>
                                        House <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        onValueChange={(val: string) => field.onChange(Number(val))}
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
                                onChange={(e: any) => setSearchStudent(e.target.value)}
                                className='mb-2'
                            />
                            <ScrollArea className='h-[180px] w-full rounded-md border p-2'>
                                {filteredStudents.map((student: any) => {
                                    const isSelected = (form.watch('studList1') || []).some(
                                        (item: any) => item.amsT_Id === student.amsT_Id
                                    );
                                    return (
                                        <div
                                            key={student.amsT_Id}
                                            className='flex items-center space-x-2 rounded-sm px-1 py-1.5 hover:bg-muted/30'>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked: any) => handleStudentToggle(student.amsT_Id, !!checked)}
                                            />
                                            <span className='text-sm'>
                                                {student.studentname} - {student.amsT_AdmNo}
                                            </span>
                                        </div>
                                    );
                                })}
                            </ScrollArea>
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <FormField
                                control={form.control}
                                name='spccsH_Date'
                                render={({ field }: { field: any }) => (
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
                                render={({ field }: { field: any }) => (
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
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Updating...
                            </>
                        ) : (
                            'Update Mapping'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
