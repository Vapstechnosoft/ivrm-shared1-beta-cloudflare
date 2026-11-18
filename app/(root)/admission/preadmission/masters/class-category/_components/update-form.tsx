'use client';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useAcademicYearDropdown,
    useMasterCategoryDropdown,
    useMasterClassCategory,
    useMasterClassCategorySection,
    useMasterClassDropdown,
    useMasterSectionDropdown
} from '@/hooks/admission/preadmission/useMasters';
import { masterClassCategorySchema } from '@/schemas/admission/preadmission/masters';
import { addMasterClassCategory } from '@/server/admission/preadmission/masters/class_category';
import type { IMasterClassCategoryList, IMasterClassCategorySectionList } from '@/types/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CustomMultiSelect } from './custom-multi-select';

type MasterClassCategoryFormValues = z.infer<typeof masterClassCategorySchema.add>;

interface UpdateMasterClassCategoryFormProps {
    rowData: IMasterClassCategoryList;
    onSuccess: () => void;
}

export default function UpdateMasterClassCategoryForm({ rowData, onSuccess }: UpdateMasterClassCategoryFormProps) {
    const [clearKey, setClearKey] = useState(0);
    const { refetchAll } = useMasterClassCategory();
    const { data: sections } = useMasterSectionDropdown();
    const { data: academicYears } = useAcademicYearDropdown();
    const { data: categories } = useMasterCategoryDropdown();
    const { data: classes } = useMasterClassDropdown();

    // Track the last loaded record to force reset on re-edit
    const lastLoadedId = useRef<number | null>(null);

    // Fetch existing sections for this class category
    const { data: existingData, isLoading: isLoadingSections } = useMasterClassCategorySection(rowData.asmcC_Id);

    const form = useForm<MasterClassCategoryFormValues>({
        resolver: zodResolver(masterClassCategorySchema.add),
        defaultValues: {
            asmcC_Id: rowData.asmcC_Id,
            asmaY_Id: 0,
            amC_Id: 0,
            category_classes: [],
            category_class_sections: []
        }
    });

    // Optimistic Population: Show data immediately while existingData loads
    useEffect(() => {
        if (rowData) {
            console.log('=== Optimistic Population ===');
            console.log('rowData:', rowData);

            // optimized matching
            let yearId = 0;
            let catId = 0;
            let classId = 0;

            if (academicYears?.data) {
                const year = academicYears.data.find((y) => y.asmaY_Year === rowData.asmaY_Year);
                if (year) {
                    yearId = year.asmaY_Id;
                    console.log('Found year:', year);
                }
            }

            if (categories?.data) {
                console.log('Looking for category:', rowData.amC_Name);
                console.log(
                    'Available categories:',
                    categories.data.map((c) => c.amC_Name)
                );
                const cat = categories.data.find((c) => c.amC_Name === rowData.amC_Name);
                if (cat) {
                    catId = cat.amC_Id;
                    console.log('Found category:', cat);
                } else {
                    console.warn('Category not found:', rowData.amC_Name);
                }
            }

            if (classes?.data) {
                const cls = classes.data.find((c) => c.asmcL_ClassName === rowData.asmcL_ClassName);
                if (cls) {
                    classId = cls.asmcL_Id;
                    console.log('Found class:', cls);
                }
            }

            if (yearId > 0) {
                console.log('Setting yearId:', yearId);
                form.setValue('asmaY_Id', yearId);
            }
            if (catId > 0) {
                console.log('Setting catId:', catId);
                form.setValue('amC_Id', catId);
            }
            if (classId > 0) {
                console.log('Setting classId:', classId);
                form.setValue('category_classes', [String(classId)]);
            }
        }
    }, [rowData.asmaY_Year, rowData.amC_Name, rowData.asmcL_ClassName, academicYears, categories, classes, form]);

    // Authoritative Population: Use existingData (which has IDs) when it loads.
    // This serves as correction/validation and populates Sections.
    useEffect(() => {
        if (existingData) {
            console.log('=== Existing Data Loaded ===', existingData);
            console.log('Current lastLoadedId:', lastLoadedId.current);
            console.log('Current rowData.asmcC_Id:', rowData.asmcC_Id);

            const details = Array.isArray(existingData)
                ? (existingData[0] as IMasterClassCategorySectionList)
                : (existingData as IMasterClassCategorySectionList);

            const extractSectionIds = (data: any): string[] => {
                if (!data) return [];
                const ids = new Set<string>();

                const traverse = (item: any) => {
                    if (!item) return;
                    if (typeof item !== 'object') return;

                    if (item.asmS_Id && Number(item.asmS_Id) > 0) ids.add(String(item.asmS_Id));

                    if (Array.isArray(item)) {
                        item.forEach(traverse);
                    } else {
                        if (item.sections && Array.isArray(item.sections)) {
                            item.sections.forEach(traverse);
                        }
                        Object.values(item).forEach((val) => {
                            if (Array.isArray(val)) val.forEach(traverse);
                            else if (typeof val === 'object') traverse(val);
                        });
                    }
                };
                traverse(data);
                return Array.from(ids);
            };

            const sectionIds = extractSectionIds(existingData);
            console.log('Extracted Section IDs:', sectionIds);

            if (details) {
                console.log('Details object:', details);

                const newValues = {
                    asmcC_Id: rowData.asmcC_Id,
                    mI_Id: 0,
                    asmaY_Id: details.asmaY_Id || 0,
                    amC_Id: details.amC_Id || 0,
                    category_classes: details.asmcL_Id ? [String(details.asmcL_Id)] : [],
                    category_class_sections: sectionIds.length > 0 ? sectionIds : []
                };

                console.log('New values to set:', newValues);

                // Reset if we have valid data (category OR class must be present)
                const hasValidData = (newValues.amC_Id > 0 || newValues.category_classes.length > 0) && newValues.asmaY_Id > 0;

                if (hasValidData) {
                    console.log('Valid data found, resetting form');
                    form.reset(newValues);
                    lastLoadedId.current = rowData.asmcC_Id;
                    console.log('Form reset complete');
                } else {
                    console.warn('Invalid data - missing required fields');
                    console.warn('amC_Id:', newValues.amC_Id, 'asmaY_Id:', newValues.asmaY_Id, 'classes:', newValues.category_classes);

                    // Set fields individually if reset is skipped
                    if (newValues.amC_Id > 0) {
                        console.log('Setting category separately:', newValues.amC_Id);
                        form.setValue('amC_Id', newValues.amC_Id);
                    }
                    if (newValues.asmaY_Id > 0) {
                        console.log('Setting year separately:', newValues.asmaY_Id);
                        form.setValue('asmaY_Id', newValues.asmaY_Id);
                    }
                    if (newValues.category_classes.length > 0) {
                        console.log('Setting classes separately:', newValues.category_classes);
                        form.setValue('category_classes', newValues.category_classes);
                    }
                    if (sectionIds.length > 0) {
                        console.log('Setting sections separately:', sectionIds);
                        form.setValue('category_class_sections', sectionIds);
                    }
                }
            } else {
                console.warn('No details found in existingData');
            }
        }
    }, [existingData, form, rowData.asmcC_Id]);

    const { mutate: updateClassCategory, isPending } = useMutation({
        mutationFn: addMasterClassCategory,
        onSuccess: (data: any) => {
            console.log('Update response:', data);
            if (
                data?.returnval === true ||
                data?.message === 'Saved Successfully' ||
                data?.message === 'Updated Successfully' ||
                (data && typeof data === 'object' && !data.returnduplicatestatus && !data.errors)
            ) {
                toast.success('Master Class Category updated successfully');
                refetchAll();
                onSuccess();
            } else if (data?.returnduplicatestatus === 'Duplicate' || data?.returnduplicatestatus === 'Record Already Exists') {
                toast.warning('Record already exists.');
            } else {
                const errorMsg =
                    typeof data?.returnduplicatestatus === 'string' ? data.returnduplicatestatus : 'Failed to update Master Class Category';
                toast.error(errorMsg);
            }
        },
        onError: (error) => {
            toast.error('An error occurred while updating Master Class Category');
            console.error(error);
        }
    });

    const onSubmit = (values: MasterClassCategoryFormValues) => {
        const payload = {
            asmcC_Id: rowData.asmcC_Id,
            mI_Id: 0,
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
        console.log('Submitting update payload:', payload);
        updateClassCategory(payload);
    };

    const sectionOptions =
        sections?.data
            ?.filter((item) => item.asmS_Id && Number(item.asmS_Id) > 0)
            ?.map((item) => ({
                label: item.asmC_SectionName,
                value: String(item.asmS_Id)
            })) || [];

    const classOptions =
        classes?.data
            ?.filter((item) => item.asmcL_Id && Number(item.asmcL_Id) > 0)
            ?.map((item) => ({
                label: item.asmcL_ClassName,
                value: String(item.asmcL_Id)
            })) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Academic Year - READ ONLY */}
                    <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <div className='rounded-md border bg-gray-50 p-2 text-sm'>
                            {academicYears?.data?.find((y) => y.asmaY_Id === form.getValues('asmaY_Id'))?.asmaY_Year || rowData.asmaY_Year}
                        </div>
                    </FormItem>

                    {/* Category - EDITABLE */}
                    <FormField
                        control={form.control}
                        name='amC_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
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
                                            ?.filter((item) => item.amC_Id && Number(item.amC_Id) > 0)
                                            ?.map((item) => (
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
                    {/* Class - MultiSelect */}
                    <FormField
                        control={form.control}
                        name='category_classes'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Class</FormLabel>
                                <FormControl>
                                    <CustomMultiSelect
                                        key={`class-${rowData.asmcC_Id}`}
                                        options={classOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={!classes ? 'Loading classes...' : 'Select classes'}
                                        variant='default'
                                        maxCount={5}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Sections - MultiSelect */}
                    <FormField
                        control={form.control}
                        name='category_class_sections'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select Sections</FormLabel>
                                <FormControl>
                                    <CustomMultiSelect
                                        key={`sections-${rowData.asmcC_Id}`}
                                        options={sectionOptions}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={
                                            isLoadingSections ? 'Loading details...' : !sections ? 'Loading sections...' : 'Select sections'
                                        }
                                        variant='default'
                                        maxCount={5}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Update Button */}
                <div className='flex items-center justify-center gap-2 pt-4'>
                    <Button type='submit' size='sm' className='min-w-[100px]' disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Updating...
                            </>
                        ) : (
                            'Update'
                        )}
                    </Button>
                    <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        className='min-w-[100px]'
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
