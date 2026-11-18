'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type LabConstraintsSchema, labConstraintsSchema } from '@/schemas/timetable/constraints/labconstraints';
import { getFixingClassDropdown, getSectionDropdownByClassCategory } from '@/server/timetable/constraints/fixing';
import { getLabDetails, getSubjectDropDown } from '@/server/timetable/constraints/labconstraints';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList } from '../../fixing/_components/dayperiod/utils';

interface LabConstraintsFormProps {
    initialData: any;
    editData?: any[];
    subGridData?: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function LabConstraintsForm({ initialData, editData, subGridData, onSuccess, onCancel }: LabConstraintsFormProps) {
    const {
        academicYearList: academicList,
        categoryList,
        classList: globalClassList = [],
        sectionList: globalSectionList = [],
        subjectList: globalSubjectList = []
    } = initialData || {};

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subjectList, setSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    // Grid selection state
    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();

    const form = useForm<LabConstraintsSchema>({
        resolver: zodResolver(labConstraintsSchema),
        defaultValues: {
            ttlaB_Id: 0,
            asmaY_Id: undefined,
            ttmC_Id: undefined,
            ttlaB_LABLIBName: '',
            tempararyArrayList: []
        }
    });

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { isSubmitting, errors },
        control,
        reset
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const watchedYear = watch('asmaY_Id');
    const watchedCategory = watch('ttmC_Id');

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.warn('Form Validation Errors:', errors);
        }
    }, [errors]);

    useEffect(() => {
        if (editData && editData.length > 0) {
            const row = editData[0];

            // Extract IDs resiliently from either the grid row (editData) or the fetched API details (subGridData)
            const asmayId =
                row.asmaY_Id ||
                row.ASMAY_Id ||
                subGridData?.find?.((x: any) => x.asmaY_Id || x.ASMAY_Id)?.asmaY_Id ||
                subGridData?.find?.((x: any) => x.asmaY_Id || x.ASMAY_Id)?.ASMAY_Id;
            const ttmcId =
                row.ttmC_Id ||
                row.TTMC_Id ||
                subGridData?.find?.((x: any) => x.ttmC_Id || x.TTMC_Id)?.ttmC_Id ||
                subGridData?.find?.((x: any) => x.ttmC_Id || x.TTMC_Id)?.TTMC_Id;

            setValue('ttlaB_Id', row.ttlaB_Id || row.TTLAB_Id || 0);

            if (asmayId) setValue('asmaY_Id', Number(asmayId));
            if (ttmcId) setValue('ttmC_Id', Number(ttmcId));

            setValue('ttlaB_LABLIBName', row.ttlaB_LABLIBName || row.TTLAB_LABLIBName || '');

            if (asmayId && ttmcId) {
                fetchClasses(Number(asmayId), Number(ttmcId));
            }
        }
    }, [editData, subGridData, setValue]);

    useEffect(() => {
        if (subGridData && Array.isArray(subGridData) && subGridData.length > 0) {
            remove();
            subGridData.forEach((item: any) => {
                const cid = item.asmcL_Id || item.ASMCL_Id;
                const sid = item.asmS_Id || item.ASMS_Id;
                const isid = item.ismS_Id || item.ISMS_Id;

                const clsName =
                    item.asmcL_ClassName ||
                    item.className ||
                    globalClassList.find((c: any) => c.asmcL_Id === cid || c.ASMCL_Id === cid)?.asmcL_ClassName ||
                    globalClassList.find((c: any) => c.asmcL_Id === cid || c.ASMCL_Id === cid)?.className ||
                    'Class ' + cid;

                const sectName =
                    item.asmS_SectionName ||
                    item.asmC_SectionName ||
                    item.sectionName ||
                    globalSectionList.find((s: any) => s.asmS_Id === sid || s.ASMS_Id === sid || s.asmC_Id === sid)?.asmC_SectionName ||
                    globalSectionList.find((s: any) => s.asmS_Id === sid || s.ASMS_Id === sid || s.asmC_Id === sid)?.asmS_SectionName ||
                    'Sec ' + sid;

                const subName =
                    item.ismS_SubjectName ||
                    item.subjectName ||
                    globalSubjectList.find((s: any) => s.ismS_Id === isid || s.ISMS_Id === isid)?.ismS_SubjectName ||
                    globalSubjectList.find((s: any) => s.ismS_Id === isid || s.ISMS_Id === isid)?.subjectName ||
                    'Subj ' + isid;

                append({
                    asmcL_Id: cid,
                    asmS_Id: sid,
                    ismS_Id: isid,
                    // @ts-ignore
                    clsName: clsName,
                    sectName: sectName,
                    subName: subName
                });
            });
        }
    }, [subGridData, append, remove, globalClassList, globalSectionList, globalSubjectList]);

    const fetchClasses = async (yearId: number, categoryId: number) => {
        if (!yearId || !categoryId) {
            setClassList([]);
            return;
        }
        setIsClassLoading(true);
        try {
            console.log('Fetching classes for:', { yearId, categoryId });
            const data = await getFixingClassDropdown(yearId, categoryId);
            console.log('Class API raw response:', data);
            const list = extractList(data, 'classbycategory');
            console.log('Extracted Class List:', list);
            setClassList(list || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setIsClassLoading(false);
        }
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubjectList([]);
        if (watchedCategory) {
            fetchClasses(yearId, watchedCategory);
        }
    };

    const handleCategoryChange = async (categoryId: number) => {
        setValue('ttmC_Id', categoryId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubjectList([]);
        if (watchedYear) {
            fetchClasses(watchedYear, categoryId);
        }
    };

    const handleClassChange = async (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setSectionList([]);
        setSubjectList([]);
        if (watchedYear && watchedCategory && classId) {
            try {
                console.log('Fetching sections for:', { watchedYear, classId, watchedCategory });
                const response = await getSectionDropdownByClassCategory(watchedYear, classId, watchedCategory);
                console.log('Section API raw response:', response);
                const sections = extractList(response, 'get_period_section1');
                console.log('Extracted Section List:', sections);
                setSectionList(sections || []);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);
        setSubjectList([]);

        const classId = selectedClass;

        console.log('Section Change Debug:', {
            watchedYear,
            watchedCategory,
            classId,
            sectionId
        });

        if (watchedYear && watchedCategory && classId && sectionId) {
            try {
                // Using general subject dropdown as requested/implemented in other pages
                const res = await getSubjectDropDown();

                console.log('Subject API response:', res);

                const list = extractList(res, 'subjectlist');

                console.log('Resolved Subject List:', list);
                setSubjectList(list || []);
            } catch (error) {
                console.error('Subject fetch error:', error);
            }
        } else {
            console.log('Missing values for subject fetch', { watchedYear, watchedCategory, classId, sectionId });
        }
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject) {
            toast.warning('Please select Class, Section and Subject');
            return;
        }

        const clsObj = classList.find((c) => (c.asmcL_Id || c.asmcl_id || c.ASMCL_Id) === selectedClass);
        const secObj = sectionList.find((s) => (s.asmS_Id || s.asmC_Id || s.asms_id || s.ASMS_Id) === selectedSection);
        const subObj = subjectList.find((s) => (s.ismS_Id || s.isms_id || s.ISMS_Id) === selectedSubject);

        const exists = fields.some((f) => f.asmcL_Id === selectedClass && f.asmS_Id === selectedSection && f.ismS_Id === selectedSubject);
        if (exists) {
            toast.warning('This combination already exists in the list');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            ismS_Id: selectedSubject,
            // @ts-ignore (UI-only helper fields)
            clsName: clsObj?.asmcL_ClassName || clsObj?.className,
            sectName: secObj?.asmS_SectionName || secObj?.asmC_SectionName || secObj?.sectionName,
            subName: subObj?.ismS_SubjectName || subObj?.subjectName
        });

        // Reset sub-selection
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setSectionList([]);
        setSubjectList([]);
    };

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            { header: 'Class', accessorKey: 'clsName' },
            { header: 'Section', accessorKey: 'sectName' },
            { header: 'Subject', accessorKey: 'subName' },
            {
                header: 'Action',
                id: 'action',
                cell: ({ row }) => (
                    <Button type='button' variant='ghost' size='sm' onClick={() => remove(row.index)}>
                        <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                )
            }
        ],
        [remove]
    );

    const onSubmit = async (data: LabConstraintsSchema) => {
        try {
            const res = await getLabDetails(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message);
                reset();
                onSuccess();
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* Global Settings Container */}
                <div className='space-y-4 rounded-lg border bg-white p-6 shadow-sm'>
                    <h3 className='border-b pb-2 font-semibold text-lg'>General Details</h3>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <FormField
                            control={form.control}
                            name='asmaY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        key={field.value?.toString() || 'empty'}
                                        onValueChange={(v) => handleAcademicYearChange(Number(v))}
                                        value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {academicList?.map((item: any) => (
                                                <SelectItem key={item.asmaY_Id} value={item.asmaY_Id?.toString()}>
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
                            name='ttlaB_LABLIBName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Lab Combination Name <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Enter name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='ttmC_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Category Name <span className='text-red-500'>*</span>
                                    </FormLabel>
                                    <Select
                                        key={field.value?.toString() || 'empty'}
                                        onValueChange={(v) => handleCategoryChange(Number(v))}
                                        value={field.value?.toString()}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categoryList?.map((item: any) => (
                                                <SelectItem key={item.ttmC_Id} value={item.ttmC_Id?.toString()}>
                                                    {item.ttmC_CategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Sub-Grid Entry Container */}
                <div className='space-y-4 rounded-lg border bg-gray-50 p-6 shadow-sm'>
                    <h3 className='border-b pb-2 font-semibold text-lg'>Add Class Combinations</h3>
                    <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-4'>
                        <div className='space-y-2'>
                            <FormLabel>Class</FormLabel>
                            <Select
                                key={selectedClass?.toString() || 'empty'}
                                onValueChange={(v) => handleClassChange(Number(v))}
                                value={selectedClass?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classList?.map((item: any) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id?.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <FormLabel>Section</FormLabel>
                            <Select
                                key={selectedSection?.toString() || 'empty'}
                                onValueChange={(v) => handleSectionChange(Number(v))}
                                value={selectedSection?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionList?.map((item: any) => (
                                        <SelectItem key={item.asmS_Id || item.asmC_Id} value={(item.asmS_Id || item.asmC_Id)?.toString()}>
                                            {item.asmS_SectionName || item.asmC_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <FormLabel>Subject</FormLabel>
                            <Select
                                key={selectedSubject?.toString() || 'empty'}
                                onValueChange={(v) => setSelectedSubject(Number(v))}
                                value={selectedSubject?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjectList?.map((item: any, idx: number) => {
                                        const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                        const name = item.ismS_SubjectName ?? item.subjectName ?? '';
                                        if (!id) return null;
                                        return (
                                            <SelectItem key={id} value={id.toString()}>
                                                {name}
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type='button' className='w-full md:w-auto' onClick={addToGrid}>
                            <Plus className='mr-2 h-4 w-4' /> Add Combination
                        </Button>
                    </div>

                    {fields.length > 0 && (
                        <div className='mt-6 overflow-hidden rounded-lg border bg-white'>
                            <DataTable data={fields} columns={columns} totalItems={fields.length} />
                        </div>
                    )}
                </div>

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isSubmitting} className='bg-orange-600 px-8 hover:bg-orange-700'>
                        <Save className='mr-2 h-4 w-4' /> Save Constraints
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel} className='px-8'>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
