'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { IClgPreadmissionStatusFilter } from '@/types/college/transactions';

const searchSchema = z.object({
    status_type: z.enum(['Appsts', 'admsts']),
    asmaY_Id: z.coerce.number().min(1, 'Academic Year is required'),
    amcO_Id: z.coerce.number().min(1, 'Course is required'),
    pamsT_Id: z.coerce.number().min(1, 'Status is required'),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
    initialData: any;
    onSearch: (data: IClgPreadmissionStatusFilter) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export default function PreadmissionStatusSearchForm({ initialData, onSearch, onCancel, isLoading }: SearchFormProps) {
    const [courses, setCourses] = useState<any[]>(initialData?.courseList || []);
    const [statuses, setStatuses] = useState<any[]>(initialData?.statusList || []);

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            status_type: 'Appsts',
            asmaY_Id: 0,
            amcO_Id: 0,
            pamsT_Id: 0,
        },
    });

    const statusType = form.watch('status_type');

    const handleYearChange = (yearId: string) => {
        form.setValue('asmaY_Id', Number(yearId));
        form.setValue('amcO_Id', 0);
        form.setValue('pamsT_Id', 0);
        const filtered = initialData?.courseList?.filter((c: any) => String(c.asmaY_Id) === yearId) || [];
        setCourses(filtered);
        setStatuses([]);
    };

    const handleCourseChange = (courseId: string) => {
        form.setValue('amcO_Id', Number(courseId));
        form.setValue('pamsT_Id', 0);
        const filtered = initialData?.statusList?.filter((s: any) =>
            statusType === 'Appsts' ? s.pamsT_ApplStatusFlag === 1 : s.pamsT_AdmStatusFlag === 1
        ) || [];
        setStatuses(filtered);
    };

    const onSubmit = (values: SearchFormValues) => {
        onSearch(values as IClgPreadmissionStatusFilter);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4">
                    {/* Status Type Radio */}
                    <FormField
                        control={form.control}
                        name="status_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status Type <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            form.setValue('pamsT_Id', 0);
                                            const filtered = initialData?.statusList?.filter((s: any) =>
                                                val === 'Appsts' ? s.pamsT_ApplStatusFlag === 1 : s.pamsT_AdmStatusFlag === 1
                                            ) || [];
                                            setStatuses(filtered);
                                        }}
                                        className="flex gap-6"
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="Appsts" id="appsts" />
                                            <Label htmlFor="appsts">Application Status</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem value="admsts" id="admsts" />
                                            <Label htmlFor="admsts">Admission Status</Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Academic Year */}
                        <FormField
                            control={form.control}
                            name="asmaY_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Academic Year <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={handleYearChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Year" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(initialData?.academicYearList || []).map((y: any) => (
                                                <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                    {y.asmaY_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Course */}
                        <FormField
                            control={form.control}
                            name="amcO_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Course <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={handleCourseChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Course" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {courses.map((c: any) => (
                                                <SelectItem key={c.amcO_Id} value={String(c.amcO_Id)}>
                                                    {c.amcO_CourseName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Status */}
                        <FormField
                            control={form.control}
                            name="pamsT_Id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status <span className="text-red-500">*</span></FormLabel>
                                    <Select
                                        value={field.value ? String(field.value) : ''}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {statuses.map((s: any) => (
                                                <SelectItem key={s.pamsT_Id} value={String(s.pamsT_Id)}>
                                                    {s.pamsT_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading} className="gap-2">
                            <Search className="h-4 w-4" />
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                        <Button type="button" variant="outline" onClick={onCancel} className="gap-2">
                            <X className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
