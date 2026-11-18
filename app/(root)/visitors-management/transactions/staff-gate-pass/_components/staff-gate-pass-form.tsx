'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStaffGatePass } from '@/hooks/visitors-management/transactions/useStaffGatePass';
import type { StaffGatePassData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    gphsT_Id: z.number().optional(),
    hrmE_Id: z.number().min(1, 'Staff Name is required'),
    hrmD_Id: z.number().min(1, 'Department is required'),
    hrmdeS_Id: z.number().min(1, 'Designation is required'),
    gphsT_DateTime: z.date({
        required_error: 'Date is required'
    }),
    gphsT_OutTime: z.string().min(1, 'Out Time is required'),
    gphsT_Remarks: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface StaffGatePassFormProps {
    onSuccess: () => void;
    empList: any[];
    departments: any[];
    designations: any[];
}

export default function StaffGatePassForm({ onSuccess, empList, departments, designations }: StaffGatePassFormProps) {
    const { selectedRow: formData } = useFormContext<StaffGatePassData>();
    const { saveStaffGatePass, isSaving } = useStaffGatePass();

    const isEditMode = !!formData?.gphsT_Id;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gphsT_Id: formData?.gphsT_Id || 0,
            hrmE_Id: formData?.hrmE_Id || 0,
            hrmD_Id: formData?.hrmD_Id || 0,
            hrmdeS_Id: formData?.hrmdeS_Id || 0,
            gphsT_DateTime: formData?.gphsT_DateTime ? new Date(formData.gphsT_DateTime) : new Date(),
            gphsT_OutTime: formData?.gphsT_OutTime || format(new Date(), 'HH:mm'),
            gphsT_Remarks: formData?.gphsT_Remarks || ''
        }
    });

    const [staffSearch, _setStaffSearch] = useState('');

    const _filteredStaffList = useMemo(() => {
        if (!staffSearch.trim()) return empList;
        const q = staffSearch.toLowerCase();
        return empList.filter((e) => (e.empname || e.hrmE_EmployeeFirstName || '').toLowerCase().includes(q));
    }, [empList, staffSearch]);

    const watchStaff = form.watch('hrmE_Id');

    // Auto-fill department and designation when staff is selected
    useEffect(() => {
        if (watchStaff > 0 && !isEditMode) {
            const selectedStaff = empList.find((e) => e.hrmE_Id === watchStaff);
            if (selectedStaff) {
                form.setValue('hrmD_Id', selectedStaff.hrmD_Id);
                form.setValue('hrmdeS_Id', selectedStaff.hrmdeS_Id);
            }
        }
    }, [watchStaff, empList, form, isEditMode]);

    const onSubmit = async (data: FormValues) => {
        const submitData = {
            ...data,
            gphsT_DateTime: data.gphsT_DateTime.toISOString()
        };

        await saveStaffGatePass(submitData);
        onSuccess();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Staff Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}
                                    disabled={isEditMode}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select or search employee in the list...' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className='max-h-64'>
                                        {empList.length === 0 ? (
                                            <div className='p-2 text-center text-muted-foreground text-xs'>No employees found</div>
                                        ) : (
                                            empList.map((emp) => (
                                                <SelectItem key={emp.hrmE_Id} value={emp.hrmE_Id.toString()}>
                                                    {emp.empname}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hrmD_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Department Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value.toString()} disabled>
                                    <FormControl>
                                        <SelectTrigger className='bg-muted'>
                                            <SelectValue placeholder='Select Department' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.hrmD_Id} value={dept.hrmD_Id.toString()}>
                                                {dept.hrmD_DepartmentName}
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
                        name='hrmdeS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Designation Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value.toString()} disabled>
                                    <FormControl>
                                        <SelectTrigger className='bg-muted'>
                                            <SelectValue placeholder='Select Designation' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {designations.map((desig) => (
                                            <SelectItem key={desig.hrmdeS_Id} value={desig.hrmdeS_Id.toString()}>
                                                {desig.hrmdeS_DesignationName}
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
                        name='gphsT_DateTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Date <span className='text-destructive'>*</span>
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
                        name='gphsT_OutTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Out Time <span className='text-destructive'>*</span>
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
                        name='gphsT_Remarks'
                        render={({ field }) => (
                            <FormItem className='md:col-span-2 lg:col-span-3'>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter remarks (optional)...' rows={2} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='mt-6 flex justify-end gap-4 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSaving}>
                        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
}
