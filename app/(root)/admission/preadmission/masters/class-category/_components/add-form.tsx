'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropdown,
    useMasterCategoryDropdown,
    useMasterClassCategory,
    useMasterSectionDropdown,
    useMasterUnMappedClassDropdown
} from '@/hooks/admission/preadmission/useMasters';
import { masterClassCategorySchema } from '@/schemas/admission/preadmission/masters';
import { addMasterClassCategory } from '@/server/admission/preadmission/masters/class_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CustomMultiSelect } from './custom-multi-select';

type MasterClassCategoryFormValues = z.infer<typeof masterClassCategorySchema.add>;

interface AddMasterClassCategoryFormProps {
    onSuccess: () => void;
}

export default function AddMasterClassCategoryForm({ onSuccess }: AddMasterClassCategoryFormProps) {
    const [clearKey, setClearKey] = useState(0);
    const { refetchAll } = useMasterClassCategory();
    const { data: academicYears } = useAcademicYearDropdown();
    const { data: categories } = useMasterCategoryDropdown();
    const { data: sections } = useMasterSectionDropdown();

    const form = useForm<MasterClassCategoryFormValues>({
        resolver: zodResolver(masterClassCategorySchema.add),
        defaultValues: {
            asmaY_Id: 0,
            amC_Id: 0,
            category_classes: [],
            category_class_sections: []
        }
    });

    const selectedYear = form.watch('asmaY_Id');
    const selectedCategory = form.watch('amC_Id');

    const { data: unmappedClasses, isLoading: loadingClasses } = useMasterUnMappedClassDropdown(selectedYear, selectedCategory);

    const { mutate: addClassCategory, isPending } = useMutation({
        mutationFn: addMasterClassCategory,
        onSuccess: (data: any) => {
            console.log('Add Master Class Category Response:', data);

            if (
                data?.returnval === true ||
                data?.message === 'Saved Successfully' ||
                (data && typeof data === 'object' && !data.returnduplicatestatus && !data.errors)
            ) {
                toast.success('Master Class Category saved successfully');
                refetchAll();
                onSuccess();
            } else if (data?.returnduplicatestatus === 'Duplicate' || data?.returnduplicatestatus === 'Record Already Exists') {
                toast.warning('Record already exists.');
            } else {
                const errorMsg =
                    typeof data?.returnduplicatestatus === 'string' ? data.returnduplicatestatus : 'Failed to add Master Class Category';

                console.error('Detailed server response:', data);
                toast.error(errorMsg);
            }
        },
        onError: (error) => {
            toast.error('An error occurred while adding Master Class Category');
            console.error('Add Master Class Category Error:', error);
        }
    });

    const onSubmit = (values: MasterClassCategoryFormValues) => {
        // Construct payload
        const payload = {
            asmcC_Id: 0,
            mI_Id: 0, // Restored as per user request/JSON
            asmaY_Id: Number(values.asmaY_Id),
            amC_Id: Number(values.amC_Id),
            category_classes: values.category_classes.map((id) => ({
                asmcL_Id: Number(id)
            })),
            category_class_sections: values.category_class_sections.map((id) => ({
                asmS_Id: Number(id)
            })),
            is_Active: true
        };
        console.log('Submitting payload:', payload);
        addClassCategory(payload);
    };

    // Reset classes and sections if year or category changes
    useEffect(() => {
        if (selectedYear === 0 || selectedCategory === 0) {
            form.setValue('category_classes', []);
        }
    }, [selectedYear, selectedCategory, form]);

    const classOptions =
        unmappedClasses?.data
            ?.filter((item) => item.asmcL_Id != null)
            .map((item) => ({
                label: item.asmcL_ClassName ?? '',
                value: String(item.asmcL_Id)
            })) || [];

    const sectionOptions =
        sections?.data
            ?.filter((item) => item.asmS_Id != null)
            .map((item) => ({
                label: item.asmC_SectionName ?? '',
                value: String(item.asmS_Id)
            })) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Academic Year */}
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='ml-1 text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={`year-${clearKey}`}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger disabled={!academicYears}>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicYears?.data
                                            ?.filter((item) => item.asmaY_Id != null)
                                            .map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Category */}
                    <FormField
                        control={form.control}
                        name='amC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Category <span className='ml-1 text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={`category-${clearKey}`}
                                    onValueChange={(value) => field.onChange(Number(value))}
                                    value={field.value ? String(field.value) : undefined}>
                                    <FormControl>
                                        <SelectTrigger disabled={!categories}>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.data
                                            ?.filter((item) => item.amC_Id != null)
                                            .map((item) => (
                                                <SelectItem key={item.amC_Id} value={String(item.amC_Id)}>
                                                    {item.amC_Name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Classes MultiSelect */}
                    <FormField
                        control={form.control}
                        name='category_classes'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Select Classes <span className='ml-1 text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <CustomMultiSelect
                                        options={classOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={loadingClasses ? 'Loading classes...' : 'Select classes'}
                                        variant='default'
                                        maxCount={3}
                                    />
                                </FormControl>
                                {unmappedClasses?.data?.length === 0 && !loadingClasses && (
                                    <div className='mt-1 text-muted-foreground text-xs'>
                                        No classes available for the selected criteria.
                                    </div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Sections MultiSelect */}
                    <FormField
                        control={form.control}
                        name='category_class_sections'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Select Sections <span className='ml-1 text-red-500'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <CustomMultiSelect
                                        options={sectionOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={!sections ? 'Loading sections...' : 'Select sections'}
                                        variant='default'
                                        maxCount={3}
                                    />
                                </FormControl>
                                {sections?.data?.length === 0 && (
                                    <div className='mt-1 text-muted-foreground text-xs'>No sections available.</div>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex justify-center gap-2'>
                    <Button type='submit' size='sm' className='w-full sm:w-auto' disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Saving...
                            </>
                        ) : (
                            'Save'
                        )}
                    </Button>
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className='w-full sm:w-auto'
                        onClick={() => {
                            form.reset();
                            setClearKey((prev) => prev + 1);
                        }}>
                        Clear
                    </Button>
                </div>
            </form>
        </Form>
    );
}
