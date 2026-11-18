'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/view-data-table/view-data-table';
import { type PeriodStaffSchema, periodStaffSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionSubjectByStaff } from '@/server/timetable/constraints/fixing';
import { getPeriodStaffEditDetails, savePeriodStaffDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../../../fixing/_components/dayperiod/utils';
interface PeriodStaffUpdateProps {
    academicList: any[];
    periodList: any[];
    staffList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PeriodStaffUpdate({
    academicList,
    periodList,
    staffList,
    selectedRow,
    onSuccess,
    onCancel
}: PeriodStaffUpdateProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

    const form = useForm<PeriodStaffSchema>({
        resolver: zodResolver(periodStaffSchema),
        mode: 'onTouched',
        defaultValues: {
            ttrpS_Id: undefined,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            hrmE_Id: undefined,
            ttrpS_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const {
        setValue,
        watch,
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        reset
    } = form;
    const asmaY_Id = watch('asmaY_Id');
    const ttrpS_SUbSelcFlag = watch('ttrpS_SUbSelcFlag');

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
                const id =
                    selectedRow?.ttrpS_Id ||
                    selectedRow?.ttfpS_Id ||
                    selectedRow?.TTFPS_Id ||
                    selectedRow?.ttfpsU_Id ||
                    selectedRow?.ttrpsU_Id;
                if (!id) return;

                const res = await getPeriodStaffEditDetails(id);
                const responseData = res?.data || res;

                // 1. Find main record
                const editData =
                    responseData?.restrict_period_staff_edit ||
                    responseData?.restriction_period_staff_edit ||
                    responseData?.fixing_period_staff_edit ||
                    responseData?.fixing_period_staff ||
                    findArrayWithField(responseData, 'asmaY_Id') ||
                    (Array.isArray(responseData) ? responseData : undefined);

                const main = editData && Array.isArray(editData) ? editData[0] : null;
                if (!main) return;

                // 2. Find sub-details (the array containing class/section/subject assignments)
                let subDetails: any[] =
                    responseData?.restrict_period_staff_classedit ||
                    responseData?.restriction_period_staff_class_edit ||
                    responseData?.fixing_period_staff_class_edit ||
                    responseData?.fix_period_staff__classecedit ||
                    responseData?.fixing_period_subject_class_edit ||
                    responseData?.fixing_period_subject__classecedit ||
                    findArrayWithField(responseData, 'asmcL_Id', editData) ||
                    findArrayWithField(responseData, 'asmcl_id', editData) ||
                    responseData?.grid_data ||
                    responseData?.datalist ||
                    [];

                // Fallback: If no sub-array found but the main record has a grid property
                if (subDetails.length === 0 && main && Array.isArray(main.grid_data)) {
                    subDetails = main.grid_data;
                }

                const staffId = getVal(main, 'hrmE_Id') || selectedRow?.hrmE_Id;
                const yearId = getVal(main, 'asmaY_Id') || selectedRow?.asmaY_Id;
                const periodId = getVal(main, 'ttmP_Id') || selectedRow?.ttmP_Id;

                const firstSub = subDetails && subDetails.length > 0 ? subDetails[0] : null;
                const pCid = firstSub ? firstSub.asmcL_Id || firstSub.ASMCL_Id || firstSub.asmcl_id : undefined;
                const pSid = firstSub ? firstSub.asmS_Id || firstSub.ASMS_Id || firstSub.asms_id : undefined;
                const pIsid = firstSub ? firstSub.ismS_Id || firstSub.ISMS_Id || firstSub.isms_id : undefined;

                const nopKeys = [
                    'ttfpsucC_Periods',
                    'ttfpsucC_Days',
                    'ttfdscC_Periods',
                    'ttfdsc_Periods',
                    'ttfdsc_NoOfPeriods',
                    'ttfdscC_NoOfPeriods',
                    'TTFDSC_NoOfPeriods',
                    'TTFPSUCC_Periods',
                    'TTFPSUCC_Days',
                    'TTRPSUCC_Periods',
                    'ttrpsucC_Periods',
                    'ttfpscC_Periods',
                    'TTFPSCC_Periods',
                    'ttfpsucC_NoOfPeriods',
                    'NOP',
                    'nop'
                ];
                const getNopValue = (obj: any) => {
                    if (!obj) return 0;
                    for (const k of nopKeys) {
                        if (obj[k] !== undefined && obj[k] !== null) return obj[k];
                    }
                    return 0;
                };

                const pNop = firstSub ? getNopValue(firstSub) : undefined;

                reset({
                    ttrpS_Id: getVal(main, 'ttrpS_Id') || selectedRow?.ttrpS_Id || id,
                    asmaY_Id: yearId,
                    ttmP_Id: periodId,
                    hrmE_Id: staffId,
                    ttrpS_SUbSelcFlag: !!(
                        subDetails.length > 0 ||
                        (getVal(main, 'ttrpS_SUbSelcFlag') ?? getVal(main, 'ttrpsU_SUbSelcFlag') ?? selectedRow?.ttrpS_SUbSelcFlag)
                    ),
                    tempararyArrayList: []
                });

                // Load master lists then populate selections and grid
                if (staffId && yearId) {
                    const master = await handleStaffChange(staffId, yearId);

                    if (subDetails && Array.isArray(subDetails)) {
                        replace(
                            subDetails.map((sub: any) => {
                                const cid = sub.asmcL_Id || sub.ASMCL_Id || sub.asmcl_id;
                                const sid = sub.asmS_Id || sub.ASMS_Id || sub.asms_id;
                                const isid = sub.ismS_Id || sub.ISMS_Id || sub.isms_id || sub.ismS_id;

                                const clsName =
                                    sub.asmcL_ClassName ||
                                    sub.ASMCL_ClassName ||
                                    master.classes.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.asmcL_ClassName ||
                                    master.classes.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.className ||
                                    '';

                                const sectName =
                                    sub.asmC_SectionName ||
                                    sub.ASMC_SectionName ||
                                    sub.asmS_SectionName ||
                                    master.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmC_SectionName ||
                                    master.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmS_SectionName ||
                                    master.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.sectionName ||
                                    '';

                                const subName =
                                    sub.ismS_SubjectName ||
                                    sub.ISMS_SubjectName ||
                                    master.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectName ||
                                    master.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.subjectName ||
                                    master.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectCode ||
                                    '';

                                return {
                                    ttfpscC_Id: sub.ttfpsucC_Id || sub.TTFPSUCC_Id || sub.ttfpscC_Id || sub.TTFPSCC_Id || 0,
                                    asmcL_Id: cid,
                                    asmS_Id: sid,
                                    ismS_Id: isid,
                                    nop: Number(getNopValue(sub)),
                                    clsDisplay: clsName,
                                    sectDisplay: sectName,
                                    subDisplay: subName
                                };
                            })
                        );
                    }

                    // Populate the 'Add Class Details' selectors with the first sub-detail
                    if (pCid) {
                        const classId = Number(pCid);
                        setSelectedClass(classId);
                        const filteredSects = master.sections.filter((s) => Number(s.asmcL_Id || s.ASMCL_Id || s.asmcl_id) === classId);
                        setSectionList(filterData(filteredSects.length > 0 ? filteredSects : master.sections, 'asmC_SectionName'));
                    }
                    if (pSid) {
                        const sectionId = Number(pSid);
                        setSelectedSection(sectionId);
                        const filteredSubs = master.subjects.filter((s) => Number(s.asmS_Id || s.ASMS_Id || s.asms_id) === sectionId);
                        setSubSubjectList(filterData(filteredSubs.length > 0 ? filteredSubs : master.subjects, 'ismS_SubjectName'));
                    }
                    if (pIsid) {
                        setSelectedSubject(Number(pIsid));
                    }
                    if (pNop !== undefined) setNop(pNop.toString());
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load edit details');
            }
        };

        loadEditData();
    }, [selectedRow, reset, replace]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId, { shouldValidate: true });
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);

        const currentStaffId = form.getValues('hrmE_Id');
        if (yearId && currentStaffId) {
            handleStaffChange(currentStaffId, yearId);
        }
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setSubSubjectList([]);

        const filtered = masterSections.filter(
            (s) =>
                (s.asmcL_Id !== undefined && Number(s.asmcL_Id) === classId) ||
                (s.asmcl_id !== undefined && Number(s.asmcl_id) === classId) ||
                (s.ASMCL_Id !== undefined && Number(s.ASMCL_Id) === classId)
        );

        setSectionList(filterData(filtered.length > 0 ? filtered : masterSections, 'asmC_SectionName'));
    };

    const handleSectionChange = (sectionId: number) => {
        setSelectedSection(sectionId);
        setSelectedSubject(undefined);

        const filtered = masterSubjects.filter((sub) => {
            const sid = sub.asmS_Id ?? sub.ASMS_Id ?? sub.asms_id;
            const cid = sub.asmcL_Id ?? sub.ASMCL_Id ?? sub.asmcl_id;
            const matchesSec = Number(sid) === sectionId;
            const matchesCls = selectedClass ? Number(cid) === selectedClass : true;
            return matchesSec && matchesCls;
        });

        if (filtered.length > 0) {
            setSubSubjectList(filterData(filtered, 'ismS_SubjectName'));
        } else {
            const filteredBySecOnly = masterSubjects.filter((sub) => {
                const sid = sub.asmS_Id ?? sub.ASMS_Id ?? sub.asms_id;
                return Number(sid) === sectionId;
            });
            if (filteredBySecOnly.length > 0) {
                setSubSubjectList(filterData(filteredBySecOnly, 'ismS_SubjectName'));
            } else {
                setSubSubjectList(filterData(masterSubjects, 'ismS_SubjectName'));
            }
        }
    };

    const handleStaffChange = async (staffId: number, yearId?: number) => {
        setValue('hrmE_Id', staffId, { shouldValidate: true });
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setClassList([]);
        setSectionList([]);
        setSubSubjectList([]);

        const effectiveYearId = yearId ?? form.getValues('asmaY_Id');

        if (effectiveYearId && staffId) {
            try {
                const res = await getFixingClassSectionSubjectByStaff(effectiveYearId, staffId);
                if (res && (res.success || res.success === undefined)) {
                    const classes =
                        extractList(res, 'classlist').length > 0
                            ? extractList(res, 'classlist')
                            : extractList(res, 'clssbystaff').length > 0
                              ? extractList(res, 'clssbystaff')
                              : extractList(res, 'clsbystaff');

                    const sections =
                        extractList(res, 'sectionlist').length > 0
                            ? extractList(res, 'sectionlist')
                            : extractList(res, 'secsbystaff').length > 0
                              ? extractList(res, 'secsbystaff')
                              : extractList(res, 'sectionlistbystaff');

                    const subjects =
                        extractList(res, 'subjectlist').length > 0
                            ? extractList(res, 'subjectlist')
                            : extractList(res, 'subsbystaff').length > 0
                              ? extractList(res, 'subsbystaff')
                              : extractList(res, 'subjectlistbystaff');

                    setMasterClasses(classes);
                    setMasterSections(sections);
                    setMasterSubjects(subjects);

                    if (classes && classes.length > 0 && subjects && subjects.length > 0) {
                        setClassList(filterData(classes, 'asmcL_ClassName'));
                        setSectionList([]);
                        setSubSubjectList([]);
                    } else {
                        setClassList([]);
                        setSectionList([]);
                        setSubSubjectList([]);
                        toast.warning('no subjects are mapped to selected staff');
                    }
                    return { classes, sections, subjects };
                } else {
                    setClassList([]);
                    setSectionList([]);
                    setSubSubjectList([]);
                    toast.warning('no subjects are mapped to selected staff');
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load details for selected staff');
            }
        }
        return { classes: [], sections: [], subjects: [] };
    };

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass || c.asmcl_id === selectedClass || c.ASMCL_Id === selectedClass);
        const secObj = sectionList.find(
            (s) => s.asmS_Id === selectedSection || s.asms_id === selectedSection || s.ASMS_Id === selectedSection
        );
        const subObj = subSubjectList.find(
            (s) => s.ismS_Id === selectedSubject || s.isms_id === selectedSubject || s.ISMS_Id === selectedSubject
        );

        const existingIndex = fields.findIndex(
            (f: any) =>
                Number(f.asmcL_Id) === Number(selectedClass) &&
                Number(f.asmS_Id) === Number(selectedSection) &&
                Number(f.ismS_Id) === Number(selectedSubject)
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
                ismS_Id: selectedSubject,
                nop: Number(nop),
                clsDisplay: clsObj?.asmcL_ClassName || clsObj?.className || clsObj?.ASMCL_ClassName,
                sectDisplay: secObj?.asmC_SectionName || secObj?.sectionName || secObj?.asmS_SectionName || secObj?.ASMC_SectionName,
                subDisplay: subObj?.ismS_SubjectName || subObj?.subjectName || subObj?.ISMS_SubjectName
            });
        }
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
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

    const onSubmit = async (data: PeriodStaffSchema) => {
        try {
            if (!data.ttrpS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    toast.warning('Please add at least one Class Details');
                    return;
                }
            }

            const res = await savePeriodStaffDetail(data);
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
                    name='ttrpS_Id'
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
                                {errors.asmaY_Id && <FormError className='ml-2'>{errors.asmaY_Id.message}</FormError>}
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
                                {errors.ttmP_Id && <FormError className='ml-2'>{errors.ttmP_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Staff <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    value={field.value?.toString()}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleStaffChange(Number(v));
                                    }}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {staffList
                                            .filter((item: any) => item.hrmE_Id)
                                            .map((item: any, idx: number) => (
                                                <SelectItem key={item.hrmE_Id || `staff-${idx}`} value={item.hrmE_Id?.toString()}>
                                                    {item.staffName?.trim()}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.hrmE_Id && <FormError className='ml-2'>{errors.hrmE_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex items-center space-x-2'>
                    <FormField
                        control={form.control}
                        name='ttrpS_SUbSelcFlag'
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

                {ttrpS_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <h4 className='font-semibold'>Add Class Details</h4>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
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
                                <FormLabel>Section</FormLabel>
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
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    key={selectedSubject?.toString() || 'empty'}
                                    value={selectedSubject?.toString()}
                                    onValueChange={(v) => setSelectedSubject(Number(v))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any) => {
                                            const id = item.ismS_Id ?? item.isms_id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ismS_SubjectName || item.subjectName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>No Of Days</FormLabel>
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
