'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/view-data-table/view-data-table';
import { type DayStaffSchema, dayStaffSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionSubjectByStaff } from '@/server/timetable/constraints/fixing';
import { getDayStaffEditDetails, saveDayStaffDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../../../fixing/_components/dayperiod/utils';

interface DayStaffUpdateProps {
    academicList: any[];
    dayList: any[];
    staffList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DayStaffUpdate({ academicList, dayList, staffList, selectedRow, onSuccess, onCancel }: DayStaffUpdateProps) {
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

    const form = useForm<DayStaffSchema>({
        resolver: zodResolver(dayStaffSchema),
        mode: 'onTouched',
        defaultValues: {
            ttrdS_Id: undefined,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            hrmE_Id: undefined,
            ttrdS_SUbSelcFlag: false,
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
    const ttrdS_SUbSelcFlag = watch('ttrdS_SUbSelcFlag');

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    useEffect(() => {
        const loadEditData = async () => {
            if (!selectedRow) return;

            try {
                const id = selectedRow?.ttrdS_Id || selectedRow?.TTRDS_Id || selectedRow?.ttfdS_Id || selectedRow?.TTFDS_Id;
                if (!id) return;

                const res = await getDayStaffEditDetails(id);
                // Be more resilient with response structure
                const responseData = res?.data || res;

                const editData =
                    responseData?.restrict_day_staff_edit ||
                    responseData?.restriction_day_staff_edit ||
                    responseData?.restrict_day_staff ||
                    responseData?.restriction_day_staff ||
                    (Array.isArray(responseData?.data?.restrict_day_staff_edit) ? responseData.data.restrict_day_staff_edit : undefined) ||
                    (Array.isArray(responseData) ? responseData : undefined);

                const subDetails =
                    responseData?.restrict_day_staff_classedit ||
                    responseData?.restriction_day_staff_class_edit ||
                    responseData?.restrict_day_staff__classecedit ||
                    responseData?.data?.restrict_day_staff_classedit ||
                    [];

                if (!editData || !Array.isArray(editData) || editData.length === 0) return;

                const main = editData[0];

                reset({
                    ttrdS_Id: main.ttrdS_Id || main.TTRDS_Id || main.ttrdsU_Id,
                    asmaY_Id: main.asmaY_Id || main.ASMAY_Id,
                    ttmD_Id: main.ttmD_Id || main.TTMD_Id,
                    hrmE_Id: main.hrmE_Id || main.HRME_Id,
                    ttrdS_SUbSelcFlag: !!main.ttrdS_SUbSelcFlag || !!main.ttrdS_SubSelcFlag,
                    ttrdscC_Id: subDetails?.[0]?.ttrdscC_Id || subDetails?.[0]?.TTRDSCC_Id || subDetails?.[0]?.ttrdsc_Id,
                    tempararyArrayList: []
                });

                let masterData = { classes: [] as any[], sections: [] as any[], subjects: [] as any[] };
                if (main.hrmE_Id || main.HRME_Id) {
                    masterData = await handleStaffChange(main.hrmE_Id || main.HRME_Id, main.asmaY_Id || main.ASMAY_Id);
                }

                if (subDetails && Array.isArray(subDetails)) {
                    replace(
                        subDetails.map((sub: any) => {
                            const cid = sub.asmcL_Id || sub.ASMCL_Id || sub.asmcl_id;
                            const sid = sub.asmS_Id || sub.ASMS_Id || sub.asms_id;
                            const isid = sub.ismS_Id || sub.ISMS_Id || sub.isms_id || sub.ismS_id;

                            // Lookup names if missing from sub object
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

                            const subName =
                                sub.ismS_SubjectName ||
                                sub.ISMS_SubjectName ||
                                masterData.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectName ||
                                masterData.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.subjectName ||
                                masterData.subjects.find((s) => Number(s.ismS_Id || s.ISMS_Id) === Number(isid))?.ismS_SubjectCode ||
                                '';

                            console.log('Sub object from API:', sub);
                            const nopKey = Object.keys(sub).find(
                                (k) =>
                                    k.toLowerCase().includes('period') ||
                                    k.toLowerCase() === 'nop' ||
                                    k.toLowerCase() === 'ttfdscc_noofperiods'
                            );
                            const nopValue = nopKey ? sub[nopKey] : 0;
                            console.log('Resolved NOP property key:', nopKey, 'value:', nopValue);

                            return {
                                ttrdp_Id: sub.ttrdp_Id || sub.TTRDP_Id,
                                asmcL_Id: cid,
                                asmS_Id: sid,
                                ismS_Id: isid,
                                nop: Number(nopValue ?? sub.ttfdscC_Periods ?? sub.ttfdsc_Periods ?? 0),
                                clsDisplay: clsName,
                                sectDisplay: sectName,
                                subDisplay: subName
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
    }, [selectedRow]);

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

    const handleClassChange = async (classId: number) => {
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

    const handleSectionChange = async (sectionId: number) => {
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

        const clsObj = classList.find((c) => c.asmcL_Id === selectedClass);
        const secObj = sectionList.find((s) => s.asmS_Id === selectedSection);
        const subObj = subSubjectList.find((s) => s.ismS_Id === selectedSubject);

        const exists = fields.some(
            (f: any) => f.asmcL_Id === selectedClass && f.asmS_Id === selectedSection && f.ismS_Id === selectedSubject
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            ismS_Id: selectedSubject,
            nop: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName,
            subDisplay: subObj?.ismS_SubjectName || subObj?.subjectName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'subDisplay', header: 'Subject' },
            { accessorKey: 'nop', header: 'No Of Periods' },
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

    const onSubmit = async (data: DayStaffSchema) => {
        try {
            if (!data.ttrdS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    toast.warning('Please add at least one Class Details');
                    return;
                }
            }

            const res = await saveDayStaffDetail(data);
            if (res?.returnval === true || res?.success === true) {
                toast.success(res.message);
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
                    name='ttrdS_Id'
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
                                    value={field.value?.toString()}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v)); // ✅ REQUIRED
                                        handleAcademicYearChange(Number(v));
                                    }}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicList.map((item: any, idx: number) => (
                                            <SelectItem key={item.asmaY_Id || `acad-${idx}`} value={item.asmaY_Id?.toString()}>
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
                        name='ttmD_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Day <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString()}
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dayList.map((item: any, idx: number) => (
                                            <SelectItem key={item.ttmD_Id || `day-${idx}`} value={item.ttmD_Id?.toString()}>
                                                {item.ttmD_DayName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ttmD_Id && <FormError className='ml-2'>{errors.ttmD_Id.message}</FormError>}
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
                        name='ttrdS_SUbSelcFlag'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-4'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={(val) => field.onChange(!!val)} />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                    <FormLabel> Class-Section Wise</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {ttrdS_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <h4 className='font-semibold'>Add Class Details</h4>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                            <div className='space-y-2'>
                                <FormLabel>Class</FormLabel>
                                <Select
                                    key={selectedClass?.toString()}
                                    onValueChange={(v) => handleClassChange(Number(v))}
                                    value={selectedClass?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isClassLoading ? (
                                            <SelectItem value='loading'>Loading...</SelectItem>
                                        ) : (
                                            classList.map((item: any, idx: number) => {
                                                const id = item.asmcL_Id ?? item.asmcl_id ?? item.ASMCL_Id;
                                                const name = item.asmcL_ClassName ?? item.className ?? '';
                                                return (
                                                    <SelectItem key={id || `cls-${idx}`} value={id?.toString()}>
                                                        {name}
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
                                    key={selectedSection?.toString()}
                                    onValueChange={(v) => handleSectionChange(Number(v))}
                                    value={selectedSection?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any, idx: number) => {
                                            const id = item.asmS_Id ?? item.asms_id ?? item.ASMS_Id;
                                            const name = item.asmC_SectionName ?? item.asmS_SectionName ?? item.sectionName ?? '';
                                            return (
                                                <SelectItem key={id || `sec-${idx}`} value={id?.toString()}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>Subject</FormLabel>
                                <Select
                                    key={selectedSubject?.toString()}
                                    onValueChange={(v) => setSelectedSubject(Number(v))}
                                    value={selectedSubject?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any, idx: number) => {
                                            const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                            const name = item.ismS_SubjectName ?? item.subjectName ?? '';
                                            return (
                                                <SelectItem key={id || `sub-${idx}`} value={id?.toString()}>
                                                    {name}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <FormLabel>Periods</FormLabel>
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
