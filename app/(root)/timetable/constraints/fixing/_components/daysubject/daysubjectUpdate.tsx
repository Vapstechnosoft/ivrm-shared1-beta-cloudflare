'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingDaySubjectSchema, fixingDaySubjectSchema } from '@/schemas/timetable/constraints/fixing';
import {
    getFixingClassSectionStaffsBySubject,
    getFixingDaySubjectDetails,
    saveFixingDaySubject
} from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface DaySubjectUpdateProps {
    academicList: any[];
    dayList: any[];
    subjectList: any[];
    selectedRow: any;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function DaySubjectUpdate({ academicList, dayList, subjectList, selectedRow, onSuccess, onCancel }: DaySubjectUpdateProps) {
    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [subStaffList, setSubStaffList] = useState<any[]>([]);
    const [isClassLoading, setIsClassLoading] = useState(false);

    const [masterClasses, setMasterClasses] = useState<any[]>([]);
    const [masterSections, setMasterSections] = useState<any[]>([]);
    const [masterStaffs, setMasterStaffs] = useState<any[]>([]);

    const [selectedClass, setSelectedClass] = useState<number | undefined>();
    const [selectedSection, setSelectedSection] = useState<number | undefined>();
    const [selectedStaff, setSelectedStaff] = useState<number | undefined>();
    const [nop, setNop] = useState<string>('');

    const form = useForm<FixingDaySubjectSchema>({
        resolver: zodResolver(fixingDaySubjectSchema),
        defaultValues: {
            ttfdsU_Id: 0,
            asmaY_Id: undefined,
            ttmD_Id: undefined,
            ismS_Id: undefined,
            ttfdsU_SUbSelcFlag: false,
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
    const ttfdsU_SUbSelcFlag = watch('ttfdsU_SUbSelcFlag');

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    useEffect(() => {
        const loadEditData = async () => {
            if (!selectedRow) return;

            try {
                const id = selectedRow?.ttfdsU_Id;
                if (!id) return;

                const res = await getFixingDaySubjectDetails(id);

                const responseData = res?.data || res;

                const editData =
                    responseData?.fixing_day_subject ||
                    responseData?.fix_day_subject_edit ||
                    responseData?.data?.fix_day_subject_edit ||
                    (Array.isArray(responseData) ? responseData : undefined) ||
                    responseData?.data;

                const subDetails =
                    responseData?.fixing_day_subject_class_edit ||
                    responseData?.fix_day_subject__classecedit ||
                    responseData?.data?.fix_day_subject__classecedit ||
                    [];

                if (!editData || !Array.isArray(editData) || editData.length === 0) return;

                const main = editData[0];

                reset({
                    ttfdsU_Id: main.ttfdsU_Id || main.TTFDSU_Id || main.ttfdsU_Id,
                    asmaY_Id: main.asmaY_Id || main.ASMAY_Id,
                    ttmD_Id: main.ttmD_Id || main.TTMD_Id,
                    ismS_Id: main.ismS_Id || main.ISMS_Id,
                    ttfdsU_SUbSelcFlag: !!main.ttfdsU_SUbSelcFlag || !!main.ttfdsU_SubSelcFlag,
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
            } catch (error) {
                console.error('Error processing edit data:', error);
                toast.error('Failed to load edit details');
            }
        };
        loadEditData();
    }, [selectedRow, reset, replace]);

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
        setSelectedClass(undefined);
        setSelectedSection(undefined);
        setSelectedStaff(undefined);
        setClassList([]);
        setSectionList([]);
        setSubStaffList([]);
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

        const activeYearId = asmayIdOverride || asmaY_Id;

        if (activeYearId && subjectId) {
            try {
                const res = await getFixingClassSectionStaffsBySubject(activeYearId, subjectId);
                const classes = res?.data?.clssbysub || res?.clssbysub || [];
                const sections = res?.data?.secsbysub || res?.secsbysub || [];
                const staff = res?.data?.staffbysub || res?.staffbysub || [];

                setClassList(classes);
                setSectionList(sections);
                setSubStaffList(staff);

                return { classes, sections, staff };
            } catch (error) {
                console.error('Error fetching subject detail bindings:', error);
                toast.error('Failed to load subject configurations.');
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

        const exists = fields.some(
            (f: any) => f.asmcL_Id === Number(selectedClass) && f.asmS_Id === Number(selectedSection) && f.hrmE_Id === Number(selectedStaff)
        );
        if (exists) {
            toast.warning('Already Exists');
            return;
        }

        append({
            asmcL_Id: selectedClass,
            asmS_Id: selectedSection,
            hrmE_Id: selectedStaff,
            nop: Number(nop) || 0,
            clsDisplay: clsObj?.asmcL_ClassName || clsObj?.asmcL_Classname,
            sectDisplay: secObj?.asmC_SectionName || secObj?.asmC_Sectionname || secObj?.asmS_SectionName,
            staffDisplay: staffObj?.staffName
        });
    };

    const subColumns: ColumnDef<any>[] = useMemo(
        () => [
            { accessorKey: 'clsDisplay', header: 'Class' },
            { accessorKey: 'sectDisplay', header: 'Section' },
            { accessorKey: 'staffDisplay', header: 'Staff' },
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

    const onSubmit = async (data: FixingDaySubjectSchema) => {
        try {
            if (!data.ttfdsU_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else {
                if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                    toast.warning('Please add at least one Class-Section details');
                    return;
                }
            }
            const res = await saveFixingDaySubject(data);
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
                    name='ttfdsU_Id'
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
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleAcademicYearChange(Number(v));
                                    }}
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
                                        {dayList.map((item: any) => {
                                            const id = item.ttmD_Id ?? item.ttmd_id ?? item.TTMD_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ttmD_DayName || item.ttmD_Dayname || item.ttmd_dayname}
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
                                    key={field.value?.toString()}
                                    onValueChange={(v) => {
                                        field.onChange(Number(v));
                                        handleSubjectChange(Number(v));
                                    }}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {subjectList
                                            .filter((item: any) => item.ismS_Id || item.isms_id || item.ISMS_Id)
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
                        name='ttfdsU_SUbSelcFlag'
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

                {ttfdsU_SUbSelcFlag && (
                    <div className='space-y-4 rounded-md border bg-gray-50 p-4'>
                        <h4 className='font-semibold'>Add Class Details</h4>
                        <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-5'>
                            <div className='space-y-2'>
                                <FormLabel>
                                    Class <span className='text-red-500'>*</span>
                                </FormLabel>
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
                                            classList.map((item: any) => {
                                                const id = item.asmcL_Id ?? item.asmcl_id ?? item.ASMCL_Id;
                                                return (
                                                    <SelectItem key={id} value={id?.toString()}>
                                                        {item.asmcL_ClassName}
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
                                    key={selectedSection?.toString()}
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
                                                    {item.asmC_SectionName || item.asmS_SectionName || item.sectionName}
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
                                    key={selectedStaff?.toString()}
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
                                    Periods <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Input
                                    type='number'
                                    value={nop}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNop(val === '' ? '' : String(Number(val)));
                                    }}
                                />
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
