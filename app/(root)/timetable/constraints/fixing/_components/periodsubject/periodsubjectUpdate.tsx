'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingPeriodSubjectSchema, fixingPeriodSubjectSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassSectionStaffsBySubject,
    getFixingPeriodSubjectDetails,
    saveFixingPeriodSubject
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface PeriodSubjectUpdateProps {
    academicList: any[];
    periodList: any[];
    subjectList: any[];
    selectedRow: any;
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

export default function PeriodSubjectUpdate({
    academicList,
    periodList,
    subjectList,
    selectedRow,
    onSuccess,
    onCancel
}: PeriodSubjectUpdateProps) {
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
    const [nop, setNop] = useState<string>('');

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

    const { fields, append, remove, replace, update } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    // --- Helper for Case-Insensitive Field Lookup ---
    const getVal = (obj: any, fieldName: string) => {
        if (!obj) return undefined;
        const key = Object.keys(obj).find((k) => k.toLowerCase() === fieldName.toLowerCase());
        return key ? obj[key] : undefined;
    };

    // --- Helper to find an array in payload that contains items with a specific field ---
    const findArrayWithField = (payload: any, fieldName: string, excludeArray?: any[]) => {
        if (!payload) return [];
        for (const key of Object.keys(payload)) {
            const val = payload[key];
            if (Array.isArray(val) && val.length > 0 && val !== excludeArray) {
                const hasField = Object.keys(val[0]).some((k) => k.toLowerCase() === fieldName.toLowerCase());
                if (hasField) return val;
            }
        }
        return [];
    };

    useEffect(() => {
        const loadEditData = async () => {
            if (!selectedRow) return;

            try {
                const id = selectedRow?.ttfpsU_Id || selectedRow?.ttrpsU_Id || selectedRow?.TTFPSU_Id;
                if (!id) return;

                const res = await getFixingPeriodSubjectDetails(id);
                const responseData = res?.data || res;

                // 1. Greedily find main record
                const editData =
                    findArrayWithField(responseData, 'asmaY_Id') ||
                    responseData?.fixing_period_subject_edit ||
                    responseData?.fixing_period_subject ||
                    (Array.isArray(responseData) ? responseData : undefined);

                const main = editData && Array.isArray(editData) ? editData[0] : null;
                if (!main) return;

                // 2. Greedily find sub-details (contains asmcL_Id or asms_Id and is NOT the main array)
                const subDetails: any[] =
                    findArrayWithField(responseData, 'asmcL_Id', editData) ||
                    findArrayWithField(responseData, 'asmcl_id', editData) ||
                    responseData?.fixing_period_subject_class_edit ||
                    responseData?.fixing_period_subject__classecedit ||
                    [];

                // Resolve IDs for form reset
                const subjectId = getVal(main, 'ismS_Id') || selectedRow?.ismS_Id;
                const yearId = getVal(main, 'asmaY_Id') || selectedRow?.asmaY_Id;
                const periodId = getVal(main, 'ttmP_Id') || selectedRow?.ttmP_Id;

                // Optional: pre-fill inputs with the first sub-detail if present
                const firstSub = subDetails && subDetails.length > 0 ? subDetails[0] : null;
                const pCid = firstSub ? firstSub.asmcL_Id || firstSub.ASMCL_Id || firstSub.asmcl_id : undefined;
                const pSid = firstSub ? firstSub.asmS_Id || firstSub.ASMS_Id || firstSub.asms_id : undefined;
                const pHrmid = firstSub ? firstSub.hrmE_Id || firstSub.HRME_Id || firstSub.hrme_id : undefined;
                const pNop = firstSub
                    ? (firstSub.ttfpsucC_Days ??
                      firstSub.nop ??
                      firstSub.TTFPSUCC_Days ??
                      firstSub.ttfpsucC_Periods ??
                      firstSub.TTFPSUCC_Periods ??
                      firstSub.TTRPSUCC_Periods ??
                      firstSub.ttrpsucC_Periods ??
                      0)
                    : '';

                reset({
                    ttrpsU_Id: getVal(main, 'ttrpsU_Id') ?? getVal(main, 'ttfpsU_Id') ?? selectedRow?.ttrpsU_Id ?? 0,
                    ttfpsU_Id: getVal(main, 'ttfpsU_Id') ?? getVal(main, 'ttrpsU_Id') ?? selectedRow?.ttfpsU_Id ?? 0,
                    asmaY_Id: yearId,
                    ttmP_Id: periodId,
                    ismS_Id: subjectId,
                    ttfpsU_SUbSelcFlag: !!(
                        getVal(main, 'ttfpsU_SUbSelcFlag') ??
                        getVal(main, 'ttrpsU_SUbSelcFlag') ??
                        selectedRow?.ttfpsU_SUbSelcFlag
                    ),
                    tempararyArrayList: []
                });

                // Load master lists using resolved IDs
                let masterData = { classes: [] as any[], sections: [] as any[], staff: [] as any[] };
                if (subjectId && yearId) {
                    masterData = await handleSubjectChange(subjectId, yearId);
                }

                if (pCid) setSelectedClass(Number(pCid));
                if (pSid) setSelectedSection(Number(pSid));
                if (pHrmid) setSelectedStaff(Number(pHrmid));
                if (pNop) setNop(pNop.toString());

                if (subDetails && Array.isArray(subDetails)) {
                    replace(
                        subDetails.map((sub: any) => {
                            const cid = sub.asmcL_Id || sub.ASMCL_Id || sub.asmcl_id;
                            const sid = sub.asmS_Id || sub.ASMS_Id || sub.asms_id;
                            const hrmid = sub.hrmE_Id || sub.HRME_Id || sub.hrme_id;

                            const clsName =
                                sub.asmcL_ClassName ||
                                sub.ASMCL_ClassName ||
                                masterData.classes.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.asmcL_ClassName ||
                                masterData.classes.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.className ||
                                '';

                            const sectName =
                                sub.asmC_SectionName ||
                                sub.ASMC_SectionName ||
                                sub.asmS_SectionName ||
                                masterData.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmC_SectionName ||
                                masterData.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmS_SectionName ||
                                masterData.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.sectionName ||
                                '';

                            const staffName =
                                sub.staffName ||
                                sub.staffname ||
                                sub.hrmE_EmployeeFirstName ||
                                sub.HRME_EmployeeFirstName ||
                                masterData.staff.find((s) => Number(s.hrmE_Id || s.HRME_Id) === Number(hrmid))?.staffName ||
                                masterData.staff.find((s) => Number(s.hrmE_Id || s.HRME_Id) === Number(hrmid))?.hrmE_EmployeeFirstName ||
                                '';

                            return {
                                ttfpsucC_Id: sub.ttfpsucC_Id || sub.TTFPSUCC_Id || sub.ttrpsucC_Id || sub.TTRPSUCC_Id,
                                asmcL_Id: cid,
                                asmS_Id: sid,
                                hrmE_Id: hrmid,
                                nop: Number(
                                    sub.ttfpsucC_Days ??
                                        sub.nop ??
                                        sub.TTFPSUCC_Days ??
                                        sub.ttfpsucC_Periods ??
                                        sub.TTFPSUCC_Periods ??
                                        sub.TTRPSUCC_Periods ??
                                        sub.ttrpsucC_Periods ??
                                        0
                                ),
                                clsDisplay: clsName,
                                sectDisplay: sectName,
                                staffDisplay: staffName
                            };
                        })
                    );
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load edit data');
            }
        };

        loadEditData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRow]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
        setMasterClasses([]);
        setMasterSections([]);
        setMasterStaff([]);

        const currentSubjectId = form.getValues('ismS_Id');
        if (yearId && currentSubjectId) {
            handleSubjectChange(currentSubjectId, yearId);
        }
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
    };

    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
    };

    const handleSubjectChange = async (subjectId: number, asmayIdOverride?: number) => {
        setValue('ismS_Id', subjectId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);

        const effectiveYearId = asmayIdOverride ?? form.getValues('asmaY_Id');

        if (effectiveYearId && subjectId) {
            try {
                const res = await getFixingClassSectionStaffsBySubject(effectiveYearId, subjectId);
                const payload = res?.data ?? res;

                if (res) {
                    const classes =
                        extractList(res, 'clssbysub').length > 0
                            ? extractList(res, 'clssbysub')
                            : extractList(res, 'clsbysubject').length > 0
                              ? extractList(res, 'clsbysubject')
                              : extractList(res, 'classlist').length > 0
                                ? extractList(res, 'classlist')
                                : findArrayWithField(payload, 'asmcL_Id');

                    const sections =
                        extractList(res, 'secsbysub').length > 0
                            ? extractList(res, 'secsbysub')
                            : extractList(res, 'secsbysubject').length > 0
                              ? extractList(res, 'secsbysubject')
                              : extractList(res, 'sectionlist').length > 0
                                ? extractList(res, 'sectionlist')
                                : findArrayWithField(payload, 'asmS_Id');

                    const staff =
                        extractList(res, 'staffbysub').length > 0
                            ? extractList(res, 'staffbysub')
                            : extractList(res, 'staffbysubject').length > 0
                              ? extractList(res, 'staffbysubject')
                              : extractList(res, 'stafflist').length > 0
                                ? extractList(res, 'stafflist')
                                : findArrayWithField(payload, 'hrmE_Id');

                    setMasterClasses(classes || []);
                    setMasterSections(sections || []);
                    setMasterStaff(staff || []);

                    setClassList(uniqueById(classes || [], 'asmcL_Id'));
                    setSectionList(uniqueById(sections || [], 'asmS_Id'));
                    setSubStaffList(uniqueById(staff || [], 'hrmE_Id'));

                    return {
                        classes: classes || [],
                        sections: sections || [],
                        staff: staff || []
                    };
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load subject details');
            }
        }
        return { classes: [], sections: [], staff: [] };
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nop) {
            toast.warning('Please select all fields');
            return;
        }

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
                nop: Number(nop)
            });
            toast.success('Updated existing entry');
        } else {
            append({
                asmcL_Id: selectedClass,
                asmS_Id: selectedSection,
                hrmE_Id: selectedStaff,
                nop: Number(nop),
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
                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await saveFixingPeriodSubject(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res?.message);
                reset();
                onSuccess();
            } else {
                toast.error(res?.message);
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
                    render={({ field }) => <Input type='hidden' {...field} value={field.value} />}
                />
                <FormField
                    control={form.control}
                    name='ttfpsU_Id'
                    render={({ field }) => <Input type='hidden' {...field} value={field.value} />}
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
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    No Of Days <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
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
                        <Save className='mr-2 h-4 w-4' /> Update
                    </Button>
                    <Button type='button' variant='outline' onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
