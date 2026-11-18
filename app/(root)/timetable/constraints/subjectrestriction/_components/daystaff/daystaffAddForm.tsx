'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dayStaffSchema } from '@/schemas/timetable/constraints/subjectrestriction';
import { getFixingClassSectionSubjectByStaff } from '@/server/timetable/constraints/fixing';
import { saveDayStaffDetail } from '@/server/timetable/constraints/subjectrestriction';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save, X } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type DayStaffSchema = z.infer<typeof dayStaffSchema>;

interface DayStaffAddFormProps {
    academicList: any[];
    dayList: any[];
    staffList: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DayStaffAddForm({ academicList, dayList, staffList, onSuccess, onCancel }: DayStaffAddFormProps) {
    const form = useForm<DayStaffSchema>({
        resolver: zodResolver(dayStaffSchema),
        mode: 'onTouched',
        defaultValues: {
            ttrdS_Id: undefined,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            hrmE_Id: undefined,
            ttrdS_SUbSelcFlag: false,
            ttrdscC_Id: undefined,
            tempararyArrayList: []
        }
    });

    const {
        reset,
        setValue,
        watch,
        handleSubmit,
        control,
        formState: { errors, isSubmitting }
    } = form;

    const ttrdS_SUbSelcFlag = watch('ttrdS_SUbSelcFlag');
    const asmaY_Id = watch('asmaY_Id');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subSubjectList, setSubSubjectList] = useState<any[]>([]);

    // Master lists for the selected staff member
    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterSubjects, setMasterSubjects] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedSubject, setSelectedSubject] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

    const extractList = (data: any, preferredKey?: string) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        let target = data?.data !== undefined ? data.data : data;
        if (target && !Array.isArray(target) && typeof target === 'object' && target.data !== undefined) {
            target = target.data;
        }
        if (Array.isArray(target)) return target;
        if (!target || typeof target !== 'object') return [];

        if (preferredKey) {
            const foundKey = Object.keys(target).find((k) => k.toLowerCase() === preferredKey.toLowerCase());
            const result = foundKey ? target[foundKey] : undefined;
            if (Array.isArray(result)) return result;
            return [];
        }
        return [];
    };

    const filterData = (list: any[], key: string) => {
        return (list || []).filter((item: any) => {
            if (!item) return false;
            const actualKey = Object.keys(item).find((k) => k.toLowerCase() === key.toLowerCase());
            const val = actualKey ? item[actualKey] : undefined;
            return val !== undefined && val !== null;
        });
    };

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
                        extractList(res, 'classlist').length > 0 ? extractList(res, 'classlist') : extractList(res, 'clssbystaff');
                    const sections =
                        extractList(res, 'sectionlist').length > 0 ? extractList(res, 'sectionlist') : extractList(res, 'secsbystaff');
                    const subjects =
                        extractList(res, 'subjectlist').length > 0 ? extractList(res, 'subjectlist') : extractList(res, 'subsbystaff');

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
    };

    const handleClassChange = (classId: number) => {
        setSelectedClass(classId);
        setSelectedSection(undefined);
        setSelectedSubject(undefined);
        setSubSubjectList([]);

        const filtered = masterSections.filter((s) => Number(s.asmcL_Id || s.ASMCL_Id || s.asmcl_id) === classId);
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

    const addToGrid = () => {
        if (!selectedClass || !selectedSection || !selectedSubject || !nop) {
            toast.warning('Please select all fields');
            return;
        }

        const clsObj = classList.find((c) => Number(c.asmcL_Id || c.ASMCL_Id) === selectedClass);
        const secObj = sectionList.find((s) => Number(s.asmS_Id || s.ASMS_Id) === selectedSection);
        const subObj = subSubjectList.find((s) => Number(s.ismS_Id || s.ISMS_Id) === selectedSubject);

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
            clsDisplay: clsObj?.asmcL_ClassName || clsObj?.className,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmS_SectionName || secObj?.sectionName,
            subDisplay: subObj?.ismS_SubjectName || subObj?.subjectName
        });
    };

    const onSubmit = async (values: DayStaffSchema) => {
        try {
            const payload = {
                ...values,
                ttrdS_SUbSelcFlag: values.ttrdS_SUbSelcFlag ? 1 : 0
            };
            const res = await saveDayStaffDetail(payload);
            if (res.success || res.returnval === true) {
                toast.success(res.message);
                onSuccess();
                reset();
            } else {
                toast.error(res.message);
            }
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const tempColumns: ColumnDef<any>[] = [
        { accessorKey: 'clsDisplay', header: 'Class' },
        { accessorKey: 'sectDisplay', header: 'Section' },
        { accessorKey: 'subDisplay', header: 'Subject' },
        { accessorKey: 'nop', header: 'NOP' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button variant='ghost' size='sm' type='button' onClick={() => remove(row.index)}>
                    <X className='h-4 w-4 text-red-500' />
                </Button>
            )
        }
    ];

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 bg-white p-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                    <FormField
                        control={control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleAcademicYearChange(Number(v));
                                    }}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicList.map((item: any) => (
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
                                            <SelectItem key={item.ttmD_Id} value={item.ttmD_Id?.toString()}>
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
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Staff Name <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select onValueChange={(val) => handleStaffChange(Number(val))} value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {staffList.map((item: any) => (
                                            <SelectItem key={item.hrmE_Id} value={item.hrmE_Id?.toString()}>
                                                {item.staffName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.hrmE_Id && <FormError className='ml-2'>{errors.hrmE_Id.message}</FormError>}
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={control}
                    name='ttrdS_SUbSelcFlag'
                    render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 p-2'>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className='space-y-1 leading-none'>
                                <FormLabel>Class-Section Wise Restriction</FormLabel>
                            </div>
                        </FormItem>
                    )}
                />

                {ttrdS_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                            <div className='space-y-2'>
                                <FormLabel>Class</FormLabel>
                                <Select onValueChange={(v) => handleClassChange(Number(v))} value={selectedClass?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
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
                                <FormLabel>Section</FormLabel>
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
                                <FormLabel>Subject</FormLabel>
                                <Select onValueChange={(v) => setSelectedSubject(Number(v))} value={selectedSubject?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any) => (
                                            <SelectItem key={item.ismS_Id} value={item.ismS_Id.toString()}>
                                                {item.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>No of Periods</FormLabel>
                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} placeholder='No of Periods' />
                            </div>
                            <Button type='button' onClick={addToGrid}>
                                Add
                            </Button>
                        </div>

                        {fields.length > 0 && (
                            <GenericDataTable<any> data={fields} columns={tempColumns} isPaginationRequired={false} isLoading={false} />
                        )}
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
