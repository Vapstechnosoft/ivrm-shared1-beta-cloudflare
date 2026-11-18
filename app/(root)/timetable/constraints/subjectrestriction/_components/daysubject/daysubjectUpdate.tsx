'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type DaySubjectSchema, daySubjectSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionStaffsBySubject } from '@/server/timetable/constraints/fixing';
import { getDaySubjectEditDetails, saveDaySubjectDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Save, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { extractList, filterData } from '../../../fixing/_components/dayperiod/utils';

interface DaySubjectUpdateProps {
    academicList: any[];
    dayList: any[];
    subjectList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DaySubjectUpdate({ academicList, dayList, subjectList, selectedRow, onSuccess, onCancel }: DaySubjectUpdateProps) {
    const form = useForm<DaySubjectSchema>({
        resolver: zodResolver(daySubjectSchema),
        mode: 'onTouched',
        defaultValues: {
            ttrdsU_Id: undefined,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            ismS_Id: undefined,
            ttrdsU_SUbSelcFlag: false,
            tempararyArrayList: []
        }
    });

    const {
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = form;
    const watchedYear = watch('asmaY_Id');
    const watchedSubSelectFlag = watch('ttrdsU_SUbSelcFlag');
    const { fields, append, remove, replace } = useFieldArray({ control, name: 'tempararyArrayList' });

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [masterStaffs, setMasterStaffs] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number>();
    const [selectedSection, setSelectedSection] = useState<number>();
    const [selectedStaff, setSelectedStaff] = useState<number>();
    const [nop, setNop] = useState<string>('');

    useEffect(() => {
        const loadEditData = async () => {
            const id = selectedRow?.ttrdsU_Id || selectedRow?.TTRDSU_Id || selectedRow?.ttfdsU_Id || selectedRow?.TTFDSU_Id;
            if (!id) return;
            try {
                const res: any = await getDaySubjectEditDetails(id);
                const responseData = res?.data || res;
                const data =
                    responseData?.restrict_day_subject_edit?.[0] ||
                    responseData?.restriction_day_subject_edit?.[0] ||
                    responseData?.restrict_day_subject?.[0] ||
                    responseData?.restriction_day_subject?.[0] ||
                    responseData?.daysubjectlist?.[0] ||
                    (Array.isArray(responseData) ? responseData[0] : selectedRow);

                const editData =
                    responseData?.restrict_day_subject_edit ||
                    responseData?.restriction_day_subject_edit ||
                    responseData?.data?.restriction_day_subject_edit ||
                    (Array.isArray(responseData) ? responseData : undefined) ||
                    responseData?.data;

                const subDetails =
                    responseData?.restrict_day_subject_classedit ||
                    responseData?.restriction_day_subject_class_edit ||
                    responseData?.restrict_day_subject__classecedit ||
                    responseData?.data?.restrict_day_subject_classedit ||
                    [];

                if (!editData || !Array.isArray(editData) || editData.length === 0) return;
                const main = editData[0];
                reset({
                    ttrdsU_Id: main.ttrdsU_Id || main.TTRDSU_Id || main.ttfdsU_Id,
                    asmaY_Id: main.asmaY_Id || main.ASMAY_Id,
                    ttmD_Id: main.ttmD_Id || main.TTMD_Id,
                    ismS_Id: main.ismS_Id || main.ISMS_Id,
                    ttrdsU_SUbSelcFlag: !!main.ttrdsU_SUbSelcFlag || !!main.ttrdsU_SubSelcFlag,
                    tempararyArrayList: []
                });

                let masterData = { classes: [] as any[], sections: [] as any[], staff: [] as any[] };
                if (main.ismS_Id || main.ISMS_Id) {
                    masterData = await handleSubjectChange(main.ismS_Id || main.ISMS_Id, main.asmaY_Id || main.ASMAY_Id);
                }

                if (subDetails && Array.isArray(subDetails)) {
                    replace(
                        subDetails.map((sub: any) => {
                            const cid = sub.asmcL_Id || sub.ASMCL_Id;
                            const sid = sub.asmS_Id || sub.ASMS_Id;
                            const hid = sub.hrmE_Id || sub.HRME_Id;

                            // Lookup names if missing from sub object
                            const clsName =
                                sub.asmcL_ClassName ||
                                sub.ASMCL_ClassName ||
                                masterData.classes.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === Number(cid))?.asmcL_ClassName ||
                                '';

                            const sectName =
                                sub.asmC_SectionName ||
                                sub.ASMC_SectionName ||
                                sub.asmS_SectionName ||
                                masterData.sections.find((s) => Number(s.asmS_Id || s.ASMS_Id) === Number(sid))?.asmC_SectionName ||
                                '';

                            const staffName =
                                sub.staffName ||
                                sub.hrmE_EmployeeFirstName ||
                                masterData.staff.find((s) => Number(s.hrmE_Id || s.HRME_Id) === Number(hid))?.staffName ||
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
                                ttfdscC_Id: sub.ttfdscC_Id || sub.TTFDSCC_Id,
                                asmcL_Id: cid,
                                asmS_Id: sid,
                                hrmE_Id: hid,
                                nop: Number(nopValue ?? sub.ttfdscC_Periods ?? sub.ttfdsc_Periods ?? 0),
                                clsDisplay: clsName,
                                sectDisplay: sectName,
                                staffDisplay: staffName
                            };
                        })
                    );
                }
            } catch (e) {
                console.error(e);
            }
        };
        loadEditData();
    }, [selectedRow, reset]);

    const loadAssignments = async (subjectId: number, yearId: number) => {
        const res = await getFixingClassSectionStaffsBySubject(yearId, subjectId);
        if (res) {
            const dataObj = res.data || res;
            const classes =
                extractList(dataObj, 'clssbysub').length > 0 ? extractList(dataObj, 'clssbysub') : extractList(dataObj, 'clsbysubject');
            const sections =
                extractList(dataObj, 'secsbysub').length > 0 ? extractList(dataObj, 'secsbysub') : extractList(dataObj, 'secsbysubject');
            const staffs =
                extractList(dataObj, 'staffbysub').length > 0
                    ? extractList(dataObj, 'staffbysub')
                    : extractList(dataObj, 'staffsbysubject');
            setMasterStaffs(staffs);
            setClassList(filterData(classes, 'asmcL_ClassName'));
            setSectionList(filterData(sections, 'asmC_SectionName'));
            setStaffList(filterData(staffs, 'staffName'));
            return { classes, sections, staff: staffs };
        }
        return { classes: [], sections: [], staff: [] };
    };

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId, { shouldValidate: true });
        const currentSubjectId = form.getValues('ismS_Id');
        if (yearId && currentSubjectId) loadAssignments(currentSubjectId, yearId);
    };

    const handleSubjectChange = async (subjectId: number, yearId?: number) => {
        setValue('ismS_Id', subjectId, { shouldValidate: true });
        const effectiveYearId = yearId ?? watchedYear;
        if (effectiveYearId && subjectId) {
            return await loadAssignments(subjectId, effectiveYearId);
        }
        return { classes: [], sections: [], staff: [] };
    };

    const handleSectionChange = async (sectionId: number) => {
        setSelectedSection(sectionId);
        const filtered = masterStaffs.filter((s) => Number(s.asmS_Id || s.ASMS_Id) === sectionId);
        setStaffList(filterData(filtered.length > 0 ? filtered : masterStaffs, 'staffName'));
    };

    const handleAdd = () => {
        if (!selectedClass || !selectedSection || !selectedStaff || !nop) return;
        const clsObj = classList.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === selectedClass);
        const secObj = sectionList.find((s) => Number(s.asmS_Id || s.ASMS_Id) === selectedSection);
        const staffObj = staffList.find((st) => Number(st.hrmE_Id || st.HRME_Id) === selectedStaff);
        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            hrmE_Id: selectedStaff,
            nop: Number(nop),
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName,
            staffDisplay: staffObj?.staffName
        });
        setNop('');
    };

    const onSubmit = async (values: DaySubjectSchema) => {
        try {
            const payload = {
                ...values,
                ttrdsU_SUbSelcFlag: values.ttrdsU_SUbSelcFlag === true,
                tempararyArrayList: values.ttrdsU_SUbSelcFlag
                    ? values.tempararyArrayList?.map((item) => ({
                          nop: item.nop,
                          hrmE_Id: item.hrmE_Id,
                          asmS_Id: item.asmS_Id,
                          asmcL_Id: item.asmcL_Id
                      }))
                    : []
            };
            const res = await saveDaySubjectDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success(res.message);
                onSuccess();
            } else toast.error(res.message);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' },
        { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'staffDisplay', header: 'Staff' },
        { accessorKey: 'nop', header: 'Periods' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button variant='ghost' size='sm' type='button' onClick={() => remove(row.index)}>
                    <Trash className='h-4 w-4 text-red-500' />
                </Button>
            )
        }
    ];

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 bg-white p-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => handleAcademicYearChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
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
                        control={control}
                        name='ttmD_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Day <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {dayList.map((item: any) => (
                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id.toString()}>
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
                        control={control}
                        name='ismS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Subject <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => handleSubjectChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjectList.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.ismS_Id && <FormError className='ml-2'>{errors.ismS_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>
                <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                    <FormField
                        control={control}
                        name='ttrdsU_SUbSelcFlag'
                        render={({ field }) => (
                            <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className='space-y-1 leading-none'>
                                    <FormLabel className='font-semibold'>Restriction Class-Section Wise</FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    {watchedSubSelectFlag && (
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-6'>
                            <div className='space-y-2'>
                                <Label>Class</Label>
                                <Select onValueChange={(v) => setSelectedClass(Number(v))} value={selectedClass?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={classList.length > 0 ? 'Select' : 'No Data'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>Section</Label>
                                <Select onValueChange={(v) => handleSectionChange(Number(v))} value={selectedSection?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>Staff</Label>
                                <Select onValueChange={(v) => setSelectedStaff(Number(v))} value={selectedStaff?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id.toString()}>
                                                {item.staffName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label>Periods</Label>
                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
                            </div>
                            <Button type='button' onClick={handleAdd} variant='secondary'>
                                <Plus className='mr-2 h-4 w-4' /> Add
                            </Button>
                        </div>
                    )}
                    {watchedSubSelectFlag && fields.length > 0 && (
                        <div className='mt-4'>
                            <GenericDataTable data={fields} columns={tempColumns} isPaginationRequired={false} isLoading={false} />
                        </div>
                    )}
                </div>
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
