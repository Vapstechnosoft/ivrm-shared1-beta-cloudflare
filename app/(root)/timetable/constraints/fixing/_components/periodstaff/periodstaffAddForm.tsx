'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type FixingPeriodStaffSchema, fixingPeriodStaffSchema } from '@/schemas/timetable/constraints/fixing';
import { getFixingClassSectionSubjectByStaff, saveFixingPeriodStaff } from '@/server/timetable/constraints/fixing';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { extractList, filterData } from '../dayperiod/utils';

interface PeriodStaffAddFormProps {
    academicList: any[];
    periodList: any[];
    staffList: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

export default function PeriodStaffAddForm({ academicList, periodList, staffList, onSuccess, onCancel }: PeriodStaffAddFormProps) {
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
    const [gridErrors, setGridErrors] = useState<any>({});

    const form = useForm<FixingPeriodStaffSchema>({
        resolver: zodResolver(fixingPeriodStaffSchema),
        defaultValues: {
            ttfpS_Id: 0,
            asmaY_Id: undefined,
            ttmP_Id: undefined,
            hrmE_Id: undefined,
            ttfpS_SUbSelcFlag: false,
            ttfpscC_Id: 0,
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
    const ttfpS_SUbSelcFlag = watch('ttfpS_SUbSelcFlag');

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'tempararyArrayList'
    });

    const handleAcademicYearChange = (yearId: number) => {
        setValue('asmaY_Id', yearId);
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
        setValue('hrmE_Id', staffId);
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
                        toast.warning('no subjects are mapped for selected staff in period staff');
                    }
                } else {
                    setClassList([]);
                    setSectionList([]);
                    setSubSubjectList([]);
                    toast.warning('no subjects are mapped for selected staff in period staff');
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load details for selected staff');
            }
        }
    };

    const addToGrid = () => {
        const errs: any = {};
        if (!selectedClass || selectedClass <= 0) errs.class = 'Class is required';
        if (!selectedSection || selectedSection <= 0) errs.section = 'Section is required';
        if (!selectedSubject || selectedSubject <= 0) errs.subject = 'Subject is required';
        if (!nop || Number(nop) <= 0) errs.nop = 'Days is required';

        if (Object.keys(errs).length > 0) {
            setGridErrors(errs);
            toast.warning('Please select all required fields');
            return;
        }
        setGridErrors({});

        if (!selectedClass || !selectedSection || !selectedSubject || !nop) return;

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
            nop: Number(nop) || 0,
            clsDisplay: clsObj?.asmcL_ClassName,
            sectDisplay: secObj?.asmC_SectionName,
            subDisplay: subObj?.ismS_SubjectName
        });
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

    const onSubmit = async (data: FixingPeriodStaffSchema) => {
        try {
            if (!data.ttfpS_SUbSelcFlag) {
                data.tempararyArrayList = [];
            } else if (!data.tempararyArrayList || data.tempararyArrayList.length === 0) {
                const errs: any = {};
                if (!selectedClass || selectedClass <= 0) errs.class = 'Class is required';
                if (!selectedSection || selectedSection <= 0) errs.section = 'Section is required';
                if (!selectedSubject || selectedSubject <= 0) errs.subject = 'Subject is required';
                if (!nop || Number(nop) <= 0) errs.nop = 'Days is required';
                setGridErrors(errs);

                toast.warning('Please add at least one Class-Section details');
                return;
            }
            const res = await saveFixingPeriodStaff(data);
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
                    name='ttfpS_Id'
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
                        name='hrmE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Staff <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={field.value?.toString() || 'empty'}
                                    onValueChange={(v) => handleStaffChange(Number(v))}
                                    value={field.value?.toString()}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {staffList?.map((item: any) => {
                                            const id = item.hrmE_Id ?? item.hrme_id ?? item.HRME_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.staffName || item.hrmE_EmployeeFirstName || item.employeeName}
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
                        name='ttfpS_SUbSelcFlag'
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

                {ttfpS_SUbSelcFlag && (
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
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                );
                                            })
                                        )}
                                    </SelectContent>
                                </Select>
                                {gridErrors.class && <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.class}</p>}
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
                                {gridErrors.section && (
                                    <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.section}</p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    Subject <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Select
                                    key={selectedSubject?.toString() || 'empty'}
                                    onValueChange={(v) => setSelectedSubject(Number(v))}
                                    value={selectedSubject?.toString()}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subSubjectList.map((item: any) => {
                                            const id = item.ismS_Id ?? item.isms_id ?? item.ISMS_Id;
                                            return (
                                                <SelectItem key={id} value={id?.toString()}>
                                                    {item.ismS_SubjectName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                {gridErrors.subject && (
                                    <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.subject}</p>
                                )}
                            </div>
                            <div className='space-y-2'>
                                <FormLabel>
                                    No Of Days <span className='text-red-500'>*</span>
                                </FormLabel>
                                <Input type='number' value={nop} onChange={(e) => setNop(e.target.value)} />
                                {gridErrors.nop && <p className='mt-1 font-medium text-[0.8rem] text-destructive'>{gridErrors.nop}</p>}
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
