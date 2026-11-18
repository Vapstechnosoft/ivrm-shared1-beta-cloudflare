'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingPeriodSubjectSchema, fixingPeriodSubjectSchema } from '@/schemas/timetable/constraints/fixing';
import { getFixingClassSectionStaffsBySubject, saveFixingPeriodSubject } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PeriodSubjectAddFormProps {
    academicList: any[];
    periodList: any[];
    subjectList: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];

    if (preferredKey) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    const keys = [
        'academiclist',
        'catelist',
        'categorylist',
        'classlist',
        'clsbysubject',
        'clssbysub',
        'sectionlist',
        'sectbysubject',
        'secsbysub',
        'stafflist',
        'staffbysubject',
        'staffbysub',
        'staffbyall',
        'subjectlist',
        'classbycategory',
        'sectionbyclass',
        'subjectbystaff'
    ];
    for (const key of keys) {
        const foundKey = Object.keys(target).find((k) => k.toLowerCase() === key.toLowerCase());
        if (foundKey && Array.isArray(target[foundKey])) return target[foundKey];
    }

    const firstArray = Object.values(target).find((v) => Array.isArray(v));
    return Array.isArray(firstArray) ? firstArray : [];
};

const uniqueById = (list: any[], idKey: string) => {
    const seen = new Set();
    return (list || []).filter((item: any) => {
        if (!item) return false;
        const actualKey = Object.keys(item).find((k) => k.toLowerCase() === idKey.toLowerCase());
        const id = actualKey ? item[actualKey] : undefined;
        if (id === undefined || id === null) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

export default function PeriodSubjectAddForm({ academicList, periodList, subjectList, onSuccess, onCancel }: PeriodSubjectAddFormProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaff, setMasterStaff] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
    const [nod, setNod] = useState<string>('');
    const [gridErrors, setGridErrors] = useState<any>({});

    const form = useForm<FixingPeriodSubjectSchema>({
        resolver: zodResolver(fixingPeriodSubjectSchema),
        defaultValues: {
            ttrpsU_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            ismS_Id: undefined,
            ttfpsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { isSubmitting },
        control,
        reset
    } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttfpsU_SUbSelcFlag = watch('ttfpsU_SUbSelcFlag');

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setValue('ismS_Id', 0);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
        setMasterClasses([]);
        setMasterSections([]);
        setMasterStaff([]);
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
    };

    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
    };

    const handleSubjectChange = async (subjectId: number) => {
        setValue('ismS_Id', subjectId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);

        if (!asmaY_Id || !subjectId) return;

        try {
            const res = await getFixingClassSectionStaffsBySubject(asmaY_Id, subjectId);

            // 🔍 DEBUG: log raw response to identify actual key names
            console.log('[PeriodSubjectAddForm] get_cls_sec_staffsData raw response:', JSON.stringify(res));

            const payload = res?.data ?? res;

            const findArrayByField = (fieldName: string): any[] => {
                for (const key of Object.keys(payload ?? {})) {
                    const val = (payload as any)[key];
                    if (Array.isArray(val) && val.length > 0 && fieldName in val[0]) return val;
                }
                return [];
            };

            const classes =
                extractList(res, 'clssbysub').length > 0
                    ? extractList(res, 'clssbysub')
                    : extractList(res, 'clsbysubject').length > 0
                      ? extractList(res, 'clsbysubject')
                      : extractList(res, 'classlist').length > 0
                        ? extractList(res, 'classlist')
                        : findArrayByField('asmcL_Id');

            const sections =
                extractList(res, 'secsbysub').length > 0
                    ? extractList(res, 'secsbysub')
                    : extractList(res, 'secsbysubject').length > 0
                      ? extractList(res, 'secsbysubject')
                      : extractList(res, 'sectionlist').length > 0
                        ? extractList(res, 'sectionlist')
                        : findArrayByField('asmS_Id');

            const staff =
                extractList(res, 'staffbysub').length > 0
                    ? extractList(res, 'staffbysub')
                    : extractList(res, 'staffbysubject').length > 0
                      ? extractList(res, 'staffbysubject')
                      : extractList(res, 'stafflist').length > 0
                        ? extractList(res, 'stafflist')
                        : findArrayByField('hrmE_Id');

            console.log('[PeriodSubjectAddForm] Resolved → classes:', classes.length, 'sections:', sections.length, 'staff:', staff.length);

            setMasterClasses(classes);
            setMasterSections(sections);
            setMasterStaff(staff);

            setClassList(uniqueById(classes, 'asmcL_Id'));
            setSectionList(uniqueById(sections, 'asmS_Id'));
            setSubStaffList(uniqueById(staff, 'hrmE_Id'));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subject details');
        }
    };

    const addToGrid = () => {
        const errs: any = {};
        if (!selectedClass || selectedClass <= 0) errs.class = 'Class is required';
        if (!selectedSection || selectedSection <= 0) errs.section = 'Section is required';
        if (!selectedStaff || selectedStaff <= 0) errs.staff = 'Staff is required';
        if (!nod || Number(nod) <= 0) errs.nod = 'Days is required';

        if (Object.keys(errs).length > 0) {
            setGridErrors(errs);
            toast.warning('Please select all required fields');
            return;
        }
        setGridErrors({});

        if (!selectedClass || !selectedSection || !selectedStaff || !nod) return;

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const staffObj = subStaffList.find((s) => s.hrmE_Id === selectedStaff);

        const existingIndex = fields.findIndex(
            (f: any) =>
                Number(f.asmcL_Id) === Number(selectedClass) &&
                Number(f.asmS_Id) === Number(selectedSection) &&
                Number(f.hrmE_Id) === Number(selectedStaff)
        );

        if (existingIndex > -1) {
            update(existingIndex, {
                ...fields[existingIndex],
                nop: Number(nod)
            });
            toast.success('Updated existing entry');
        } else {
            append({
                asmcL_Id: selectedClass,
                asmS_Id: selectedSection,
                hrmE_Id: selectedStaff,
                nop: Number(nod),
                clsDisplay: clsObj?.asmcL_ClassName,
                sectDisplay: secObj?.asmC_SectionName,
                staffDisplay: staffObj?.hrmE_EmployeeFirstName || staffObj?.staffName
            });
        }
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
            { accessorKey: 'nop', header: 'No Of Days' },
            {
                id: 'actions',
                header: 'Actions',
                cell: ({ row }) => (
                    <Button type='button' variant='ghost' size='sm' onClick={() => remove(row.index)}>
                        <span className='text-red-500'>Delete</span>
                    </Button>
                )
            }
        ],
        [remove]
    );

    const onSubmit = async (data: FixingPeriodSubjectSchema) => {
        try {
            if (!(data as any).ttfpsU_SUbSelcFlag && !(data as any).ttrpsU_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                const errs: any = {};
                if (!selectedClass || selectedClass <= 0) errs.class = 'Class is required';
                if (!selectedSection || selectedSection <= 0) errs.section = 'Section is required';
                if (!selectedStaff || selectedStaff <= 0) errs.staff = 'Staff is required';
                if (!nod || Number(nod) <= 0) errs.nod = 'Days is required';
                setGridErrors(errs);

                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await saveFixingPeriodSubject(data);
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
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-4 shadow-sm'>
                <FormField
                    control={form.control}
                    name='ttrpsU_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value || 0} />}
                />
                <FormField
                    control={form.control}
                    name='ttfpsU_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value || 0} />}
                />
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
                        name='ttmP_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Period <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {periodList.map((item: any) => {
                                            const id = item.ttmP_Id ?? item.ttmp_id ?? item.TTMP_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ttmP_PeriodName || item.ttmp_periodname || item.periodName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Subject <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleSubjectChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjectList
                                            .filter((item: any) => item.ismS_Id || item.isms_id)
                                            .map((item: any) => {
                                                const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {item.ismS_SubjectName || item.isms_subjectname || item.subjectName}
                                                    </SelectItem>
                                                );
                                            })}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex items-center space-x-2'>
                    <FormField
                        control={form.control}
                        name={'ttfpsU_SUbSelcFlag' as any}
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                    <FormLabel>Fixing Class-Section Wise</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {ttfpsU_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <h4 className='font-semibold'>Add Class Details</h4>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                            <div className='space-y-2'>
                                <FormLabel>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={selectedClass?.toString() || 'empty'}
                                    onValueChange={(v) => handleClassChange(Number(v))}
                                    value={selectedClass?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isClassLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            classList.map((item: any) => {
                                                const id = item.asmcL_Id ?? item.asmcl_id ?? item.ASMCL_Id;
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {item.asmcL_ClassName || item.asmcL_Classname || item.className}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                                {gridErrors?.class && <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.class}</p>}
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    Section <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={selectedSection?.toString() || 'empty'}
                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                    value={selectedSection?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => {
                                            const id = item.asmS_Id ?? item.asms_id ?? item.ASMS_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {gridErrors?.section && (
                                    <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.section}</p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    Staff <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={selectedStaff?.toString() || 'empty'}
                                    onValueChange={(v) => setSelectedStaff(Number(v))}
                                    value={selectedStaff?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subStaffList.map((item: any) => {
                                            const id = item.hrmE_Id ?? item.hrme_id ?? item.HRME_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.staffName?.replace(/\n/g, ' ').trim()}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {gridErrors?.staff && <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.staff}</p>}
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    No Of Days <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Input type='number' value={nod} onChange={(e) => setNod(e.target.value)} placeholder='Number of Days' />
                                {gridErrors?.nod && <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.nod}</p>}
                            </div>
                        </div>
                        <Button type='button' onClick={addToGrid}>
                            Add
                        </Button>
                        {fields.length > 0 && <DataTable data={fields} columns={subColumns} totalItems={fields.length} />}
                    </div>
                )}

                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isSubmitting}>
                        <Save className='mr-2 h-4 w-4' /> Save
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
