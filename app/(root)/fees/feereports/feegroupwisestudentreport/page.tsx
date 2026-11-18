'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';

import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { useCategoryDropDown } from '@/hooks/fees/useReports';
import { cn } from '@/lib/utils';
import { feesGroupwiseStudentReportSchema } from '@/schemas/fees/reports';
import { getFeesSectionListByClassId } from '@/server/fees/reports/fee_DefaulterReport';
import { getClassAndFeeGroupDropDown, getReport, getStudentDropDown } from '@/server/fees/reports/fee_group_wise_student_report';
import type {
    IFeeCategoryDropdown,
    IFeeClassDropdownList,
    IFeeGroupWiseStudentReport,
    IFeeSectionDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { exportToExcel, printTable } from './excelandprint';

type FormFields = z.infer<typeof feesGroupwiseStudentReportSchema>;

// Checkbox with full indeterminate support
const Checkbox = ({ checked, indeterminate, onCheckedChange, ...props }: any) => {
    const ref = useRef<HTMLButtonElement>(null);

    return <BaseCheckbox ref={ref} checked={checked} onCheckedChange={onCheckedChange} {...props} />;
};

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export default function FeeGroupwiseStudentReport() {
    type catg = 'all' | 'individual' | 'student_wise' | 'admCat' | 'unmapped' | 'Termwise';
    const userTypeOptions: { label: string; value: catg }[] = [
        { label: 'All', value: 'all' },
        { label: 'Individual', value: 'individual' },
        { label: 'Student Wise', value: 'student_wise' },
        { label: 'Admission Category', value: 'admCat' },
        { label: 'Unmapped', value: 'unmapped' },
        { label: 'Termwise Paid Details', value: 'Termwise' }
    ];

    type stud_sel = 'S' | 'L' | 'D' | 'N';
    const stud_selTypeOptions: { label: string; value: stud_sel }[] = [
        { label: 'Studying', value: 'S' },
        { label: 'TC Students', value: 'L' },
        { label: 'Deactivated', value: 'D' },
        { label: 'New Admission', value: 'N' }
    ];

    const {
        handleSubmit,
        setValue,
        control,
        watch,
        register,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feesGroupwiseStudentReportSchema),
        defaultValues: {
            radio_val: 'all',
            stud_sel: 'S',
            academicYearId: undefined,
            classId: 0,
            sectionId: 0,
            groupIds: [],
            groupIdsNew: [],
            group_wise: true
        }
    });

    const [reportData, setReportData] = useState<IFeeGroupWiseStudentReport[]>([]);

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [student, setStudent] = useState<any[]>([]);
    // const [feeTerms, setfeeTerms] = useState<IInstallmentReportFeeTermDropdownList[]>([]);
    const [feeGroups, setfeeGroups] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [classorgroupLoading, setClassorgroupLoading] = useState(false);
    const [sectionLoading, setSectionLoading] = useState(false);
    const [StudentLoading, setStudentLoading] = useState(false);

    // Hooks
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();
    const { data: categoryData, isLoading: loadingCategory } = useCategoryDropDown();
    // const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();
    // const {
    //     data: feeInstallmentData,
    //     isLoading: feeInstallmentLoading,
    //     error: feeInstallmentError
    // } = useFeeTransInstallmentYearlyfeecollectionreport();
    //   const {
    //     data: termsdropdowndata,
    //     isLoading: termsloading,
    //     error: termserror,
    //   } = useFeeInstallmentreporttermDropdown();

    //   const {
    //     data: categorydropdowndata,
    //     isLoading: categoryloading,
    //     error: categoryerror,
    //     refetchAll: refetchCategory,
    //   } = useFeeInstallmentreportCategoryDropdown();
    // const {
    //     data: busroutedata,
    //     isLoading: busrouteLoading,
    //     error: busrouteError,
    //     refetchAll: refetchBusRoute
    // } = useFeeInstallmentreportBusRouteDropdown();
    // const {
    //     data: sectionListResponse,
    //     isLoading: loadingSections,
    //     error: sectionListError,
    //     refetch: refetchSections
    // } = useFeeSectionListDefaulterreport();

    // Filtered students based on search
    // const filteredStudents = staticStudents.filter(
    //     (student) =>
    //         student.admNo.toLowerCase().includes(searchAdmNo.toLowerCase()) ||
    //         student.name.toLowerCase().includes(searchAdmNo.toLowerCase())
    // );

    // Calculate totals for a student

    // useEffect(() => {
    //     if (termserror) toast.error(termserror?.message || 'Failed to load fee terms');
    //     else if (termsdropdowndata?.data) setfeeTerms(termsdropdowndata.data);
    // }, [termsdropdowndata, termserror]);

    // useEffect(() => {
    //     if (groupserror) toast.error(groupserror?.message || 'Failed to load fee groups');
    //     else if (groupsdata?.data) setfeeGroups(groupsdata.data);
    // }, [groupsdata, groupserror]);

    // Load data effects (unchanged)

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    // useEffect(() => {
    //     if (classListError) {
    //         toast.error(classListError?.message || 'Failed to load classes');
    //         setClasses([]);
    //         return;
    //     }
    //     if (classListResponse?.data && Array.isArray(classListResponse.data)) {
    //         setClasses(classListResponse.data);
    //     }
    // }, [classListResponse, classListError]);

    const classId = watch('classId') ?? 0;
    const academicYearId = watch('academicYearId');
    const sectionId = watch('sectionId');
    const selectedCatg = watch('radio_val');
    const groupIdsNew = watch('groupIdsNew');
    const studentids = watch('studentids');
    const amntchecked = watch('amntchecked');
    const categoryId = watch('fmcC_Id');

    useEffect(() => {
        setReportData([]);
    }, [selectedCatg, academicYearId, classId, sectionId, groupIdsNew, studentids, amntchecked, categoryId]);

    useEffect(() => {
        const fetchData = async () => {
            if (!academicYearId) {
                setClasses([]);
                setfeeGroups([]);
                return;
            }

            setClassorgroupLoading(true);
            try {
                const result = await getClassAndFeeGroupDropDown(Number(academicYearId));
                const classList = (result as any)?.data?.class_List ?? [];
                const feeGroupList = (result as any)?.data?.fee_Group_List ?? [];
                setClasses(classList);
                setfeeGroups(feeGroupList);

                if (classList.length === 0 || feeGroupList.length === 0) {
                    toast.info('No Results found for this academic year');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load sections');
                setClasses([]);
                setfeeGroups([]);
            } finally {
                setClassorgroupLoading(false);
            }
        };

        fetchData();
    }, [academicYearId]);

    useEffect(() => {
        const fetchSections = async () => {
            if (!academicYearId || !classId) {
                setSections([]);
                return;
            }
            setSectionLoading(true);
            try {
                const result = await getFeesSectionListByClassId(Number(academicYearId), classId);
                const data = Array.isArray(result?.data) ? result.data : [];
                setSections(data);
                if (data.length === 0) {
                    toast.info('No sections found for this class');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load sections');
                setSections([]);
            } finally {
                setSectionLoading(false);
            }
        };

        fetchSections();
    }, [classId, setValue]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!academicYearId || !classId || !sectionId) {
                // setClasses([]);
                // setSections([]);
                setStudent([]);
                return;
            }

            setStudentLoading(true);
            try {
                const result = await getStudentDropDown(Number(academicYearId), classId, sectionId);
                const data = Array.isArray(result?.data) ? result.data : [];
                setStudent(data);
                if (data.length === 0) {
                    toast.info('No Students found');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load Students');
                setStudent([]);
            } finally {
                setStudentLoading(false);
            }
        };

        fetchStudents();
    }, [academicYearId, classId, sectionId, setValue]);

    useEffect(() => {
        if (selectedCatg === 'all' || selectedCatg === 'individual' || selectedCatg === 'student_wise' || selectedCatg === 'admCat') {
            setValue('group_wise', true, { shouldDirty: true, shouldValidate: true });
        } else {
            setValue('group_wise', false, {
                shouldDirty: true,
                shouldValidate: true
            });
        }
    }, [selectedCatg, setValue]);

    useEffect(() => {
        if (selectedCatg === 'student_wise' || selectedCatg === 'admCat') {
            setValue('amntchecked', true, {
                shouldDirty: true,
                shouldValidate: true
            });
        } else {
            setValue('amntchecked', false, {
                shouldDirty: true,
                shouldValidate: true
            });
        }
    }, [selectedCatg, setValue]);

    //   const groupIds = watch("groupIds") ?? [];
    const groupIdsnew = watch('groupIdsNew') ?? [];
    //   const isAllGroupsSelected =
    //     feeGroups.length > 0 && groupIds.length === feeGroups.length;
    const isAllGroupsSelectedNew = feeGroups.length > 0 && groupIdsnew.length === feeGroups.length;

    //   const toggleAllGroups = () => {
    //     setValue(
    //       "groupIds",
    //       isAllGroupsSelected ? [] : feeGroups.map((g) => g.fmG_Id),
    //       { shouldDirty: true, shouldValidate: true },
    //     );
    //   };

    const toggleAllGroupsnew = () => {
        setValue('groupIdsNew', isAllGroupsSelectedNew ? [] : feeGroups.map((g) => g.fmG_Id), { shouldDirty: true, shouldValidate: true });
    };

    //   const togglegroups = (id: number) => {
    //     const updated = groupIds.includes(id)
    //       ? groupIds.filter((x) => x !== id)
    //       : [...groupIds, id];
    //     setValue("groupIds", updated, { shouldDirty: true, shouldValidate: true });
    //   };

    const togglegroupsnew = (id: number) => {
        const updated = groupIdsnew.includes(id) ? groupIdsnew.filter((x) => x !== id) : [...groupIdsnew, id];
        setValue('groupIdsNew', updated, {
            shouldDirty: true,
            shouldValidate: true
        });
    };

    //const handleExport = () => {
    // if (!selectedRows.length) {
    //     toast.error('Please select at least one record');
    //     return;
    // }
    // exportToExcel(selectedRows, 'Audit-Report');
    //};

    const handlePrint = () => {
        const selected = reportData.filter((row) => selectedIds.includes(row.id));

        if (!selected || selected.length === 0) {
            toast.error('No data selected to print');
            return;
        }
        const columnHeaders = [
            'SLNO',
            'Adm. NO.',
            'Student Name',
            'Class',
            'Section',
            'Roll No.',
            'Fee Group',
            ...(amntchecked ? ['Amount'] : [])
        ];

        const printableRows = selected.map((row, index) => {
            const baseRow = {
                SLNO: index + 1,
                'Adm. NO.': row.amsT_AdmNo || '',
                'Student Name': row.amsT_FirstName || '',
                Class: row.asmcL_ClassName || '',
                Section: row.asmC_SectionName || '',
                'Roll No.': row.amaY_RollNo || '',
                'Fee Group': row.fmG_GroupName || ''
            };
            if (amntchecked) {
                return {
                    ...baseRow,
                    Amount: row.amount || 0
                };
            }
            return baseRow;
        });
        printTable(columnHeaders, printableRows, 'Fee Group Wise Students Report');
    };
    const handleExportExcel = () => {
        const rowsToExport = reportData.filter((r) => selectedIds.includes(r.id));

        if (!rowsToExport || rowsToExport.length === 0) {
            toast.error('No data selected to export');
            return;
        }

        exportToExcel(rowsToExport, 'Fee Group Wise Students Report', amntchecked);
    };

    const toggleAllstudents = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };
    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const radioSelected = data.radio_val;
            const selectedFeeGroups = groupIdsnew.map((id: number) => ({
                fmG_Id: id
            }));
            let payload = {};

            if (radioSelected === 'all' || radioSelected === 'unmapped') {
                payload = {
                    radio_selected: radioSelected,
                    asmaY_Id: academicYearId || 0,
                    selectfeegroup: selectedFeeGroups,
                    asmcL_Id: 0,
                    asmS_Id: 0,
                    stud_Sel: '',
                    fmcC_Id: 0,
                    stud_Id: 0
                };
            } else if (
                radioSelected === 'individual' ||
                radioSelected === 'student_wise' ||
                radioSelected === 'Termwise' ||
                radioSelected === 'admCat'
            ) {
                payload = {
                    radio_selected: radioSelected,
                    asmaY_Id: academicYearId || 0,
                    selectfeegroup: radioSelected === 'individual' ? selectedFeeGroups : [],
                    asmcL_Id: classId,
                    asmS_Id: sectionId,
                    stud_Sel: radioSelected === 'individual' ? data.stud_sel : '',
                    fmcC_Id: radioSelected === 'admCat' ? categoryId : 0,
                    stud_Id: radioSelected === 'student_wise' || radioSelected === 'Termwise' ? studentids : 0
                };
            }
            const reportArray = await getReport(payload);
            if (radioSelected === 'Termwise') {
                setReportData([]);
                toast.info('No Data Found');
                return;
            }
            const report = reportArray.data ?? [];
            const mapApiToReportRows = (apiData: any[]): IFeeGroupWiseStudentReport[] => {
                return apiData.map((item, index) => ({
                    id: index + 1,
                    amount: item.amount,
                    amsT_SOL: item.amsT_SOL,
                    amsT_Id: item.amsT_Id,
                    amsT_FirstName: item.amsT_FirstName,
                    asmcL_ClassName: item.asmcL_ClassName,
                    asmC_SectionName: item.asmC_SectionName,
                    amsT_RegistrationNo: item.amsT_RegistrationNo,
                    amsT_AdmNo: item.amsT_AdmNo,
                    fmG_GroupName: item.fmG_GroupName,
                    amaY_RollNo: item.amaY_RollNo
                }));
            };
            const list = mapApiToReportRows(report);

            setReportData(list || []);
            if (list.length > 0) {
                toast.success(reportArray.message);
            } else {
                toast.info('No Data Found');
            }

            //    setReportData(report || []);
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setReportData([]);
        } finally {
            //   setReportLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='p-8'>
                            <div className='space-y-8'>
                                {/* User Type Card */}
                                <Card className='border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex flex-wrap items-center justify-center gap-10'>
                                        <Controller
                                            name='radio_val'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex flex-wrap items-center justify-center gap-10'>
                                                    {userTypeOptions.map(({ label, value }) => (
                                                        <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                            <input
                                                                type='radio'
                                                                name={field.name}
                                                                value={value}
                                                                checked={field.value === value}
                                                                onChange={() => field.onChange(value)}
                                                                className='h-5 w-5 accent-primary'
                                                            />
                                                            <span className='font-medium text-base'>{label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='mt-6 pt-6'>
                                        <div className='flex flex-wrap items-center justify-center gap-8'>
                                            {selectedCatg !== 'unmapped' && selectedCatg !== 'Termwise' && (
                                                <Label className='flex cursor-pointer items-center gap-3'>
                                                    <Controller
                                                        name='group_wise'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                disabled={selectedCatg === 'student_wise' || selectedCatg === 'admCat'}
                                                                checked={field.value || false}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    <span className='font-medium text-base'>Group Wise</span>
                                                </Label>
                                            )}

                                            {selectedCatg !== 'unmapped' && selectedCatg !== 'Termwise' && (
                                                <Label className='flex cursor-pointer items-center gap-3'>
                                                    <Controller
                                                        name='amntchecked'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Checkbox
                                                                disabled={selectedCatg === 'student_wise' || selectedCatg === 'admCat'}
                                                                checked={field.value || false}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                        )}
                                                    />
                                                    <span className='font-medium text-base'>Amount</span>
                                                </Label>
                                            )}

                                            <Label className='flex cursor-pointer items-center gap-3'>
                                                <Controller
                                                    name='bulkdownload'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Checkbox checked={field.value || false} onCheckedChange={field.onChange} />
                                                    )}
                                                />
                                                <span className='font-medium text-base'>Bulk Download</span>
                                            </Label>
                                        </div>
                                    </div>
                                </Card>

                                <div className='flex items-center gap-12'>
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading academic years...
                                                                </SelectItem>
                                                            ) : academicYears.length === 0 ? (
                                                                <SelectItem value='nodata' disabled>
                                                                    No Result Found
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears.map((item) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>

                                    {(selectedCatg === 'all' || selectedCatg === 'individual' || selectedCatg === 'unmapped') && (
                                        <div className='flex items-center gap-12'>
                                            <>
                                                <Label className='w-24 pt-2 text-right'>
                                                    Fee Group <span className='text-red-500'>*</span>
                                                </Label>
                                                <input type='hidden' {...register('groupIdsNew')} />
                                                <Card className={cn('w-[360px] border bg-gray-50 p-4', errors.groupIdsNew)}>
                                                    <div className='mb-3'>
                                                        <Input
                                                            type='text'
                                                            placeholder='Search groups...'
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            className='w-full'
                                                        />
                                                    </div>
                                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                        {
                                                            <>
                                                                <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-100'>
                                                                    <Checkbox
                                                                        checked={isAllGroupsSelectedNew}
                                                                        onCheckedChange={toggleAllGroupsnew}
                                                                    />
                                                                    <span>Select All</span>
                                                                </Label>
                                                                {classorgroupLoading ? (
                                                                    <div className='py-6 text-center text-gray-500'>
                                                                        Loading Fee Group...
                                                                    </div>
                                                                ) : feeGroups.length > 0 ? (
                                                                    feeGroups
                                                                        .filter(
                                                                            (grp) =>
                                                                                search === '' ||
                                                                                grp.fee_Group.toLowerCase().includes(search.toLowerCase())
                                                                        )
                                                                        .map((grp) => (
                                                                            <Label
                                                                                key={grp.fmG_Id}
                                                                                htmlFor={`group-${grp.fee_Group}`}
                                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                                <Checkbox
                                                                                    id={`group-${grp.fmG_Id}`}
                                                                                    checked={groupIdsnew.includes(grp.fmG_Id)}
                                                                                    onCheckedChange={() => togglegroupsnew(grp.fmG_Id)}
                                                                                />
                                                                                <span className='text-sm'>{grp.fee_Group}</span>
                                                                            </Label>
                                                                        ))
                                                                ) : (
                                                                    <div className='py-4 text-center text-gray-500'>No Groups</div>
                                                                )}
                                                                {search &&
                                                                    feeGroups.filter((g) =>
                                                                        g.fee_Group.toLowerCase().includes(search.toLowerCase())
                                                                    ).length === 0 && (
                                                                        <div className='py-4 text-center text-gray-500'>
                                                                            No groups found matching "{search}"
                                                                        </div>
                                                                    )}
                                                            </>
                                                        }
                                                    </div>
                                                </Card>
                                                {errors.groupIdsNew && <FormError className='mt-1'>{errors.groupIdsNew.message}</FormError>}
                                            </>
                                        </div>
                                    )}
                                </div>

                                {(selectedCatg === 'individual' ||
                                    selectedCatg === 'student_wise' ||
                                    selectedCatg === 'admCat' ||
                                    selectedCatg === 'Termwise') && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='classId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ? field.value.toString() : ''}
                                                            onValueChange={(v) => {
                                                                field.onChange(Number(v));
                                                                setValue('sectionId', 0);
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--Select Class--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {classorgroupLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading class...
                                                                    </SelectItem>
                                                                ) : classes.length === 0 ? (
                                                                    <SelectItem value='nodata' disabled>
                                                                        No Result Found
                                                                    </SelectItem>
                                                                ) : (
                                                                    classes.map((item) => (
                                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                            {item.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                            </div>
                                        </div>

                                        {/* Section */}
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <Label className='w-36 text-right'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Controller
                                                    name='sectionId'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value ? field.value.toString() : ''}
                                                            onValueChange={(v) => field.onChange(Number(v))}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='--All--' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {sectionLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading section...
                                                                    </SelectItem>
                                                                ) : sections.length === 0 ? (
                                                                    <SelectItem value='nodata' disabled>
                                                                        No Result Found
                                                                    </SelectItem>
                                                                ) : (
                                                                    sections.map((item) => (
                                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                            {item.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                            </div>
                                        </div>
                                        {(selectedCatg === 'student_wise' || selectedCatg === 'Termwise') && (
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label className='w-36 text-right'>
                                                    Student <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='studentids'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ? field.value.toString() : ''}
                                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='--All--' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {StudentLoading ? (
                                                                        <SelectItem value='loading' disabled>
                                                                            Loading Students...
                                                                        </SelectItem>
                                                                    ) : student.length === 0 ? (
                                                                        <SelectItem value='nodata' disabled>
                                                                            No Result Found
                                                                        </SelectItem>
                                                                    ) : (
                                                                        student.map((item) => (
                                                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                                                {item.amsT_FirstName}
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.studentids && <FormError>{errors.studentids.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                        {selectedCatg === 'admCat' && (
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label className='w-36 text-right'>
                                                    Category <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Controller
                                                        name='fmcC_Id'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value ? field.value.toString() : ''}
                                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='--All--' />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {loadingCategory ? (
                                                                        <SelectItem value='loading' disabled>
                                                                            Loading Students...
                                                                        </SelectItem>
                                                                    ) : categoryData?.data?.length === 0 ? (
                                                                        <SelectItem value='nodata' disabled>
                                                                            No Result Found
                                                                        </SelectItem>
                                                                    ) : (
                                                                        categoryData?.data?.map((item: IFeeCategoryDropdown) => (
                                                                            <SelectItem key={item.imcC_Id} value={item.imcC_Id.toString()}>
                                                                                {item.imcC_CategoryName}
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.fmcC_Id && <FormError>{errors.fmcC_Id.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedCatg === 'individual' && (
                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-4'>
                                            <Label className='font-semibold text-gray-700 text-lg'>Student Selection Options</Label>
                                        </div>
                                        <Card className='border bg-gray-50 p-5 shadow-sm'>
                                            <Controller
                                                name='stud_sel'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex flex-wrap items-center justify-center gap-8'>
                                                        {stud_selTypeOptions.map(({ label, value }) => (
                                                            <label key={value} className='flex cursor-pointer items-center gap-3'>
                                                                <input
                                                                    type='radio'
                                                                    name={field.name}
                                                                    value={value}
                                                                    checked={field.value === value}
                                                                    onChange={() => field.onChange(value)}
                                                                    className='h-5 w-5 accent-primary'
                                                                />
                                                                <span className='font-medium text-base'>{label}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            />
                                        </Card>
                                    </div>
                                )}

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8 pb-4'>
                                        <Button size='lg' variant='outline' className='px-12' onClick={() => window.location.reload()}>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>

                                    {reportData.length > 0 && (
                                        <CollapsibleSection defaultOpen={true}>
                                            <div className='rounded-lg border bg-white shadow-xl'>
                                                <div className='flex items-center justify-between border-b bg-gray-50 px-8 py-4'>
                                                    <h2 className='whitespace-nowrap font-bold text-2xl text-primary'>
                                                        Fee Group Wise Students Report
                                                    </h2>
                                                    <div className='flex gap-2'>
                                                        <Button size='sm' className='h-8 px-3 text-xs' onClick={handleExportExcel}>
                                                            Export Excel
                                                        </Button>
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            className='h-8 px-3 text-xs'
                                                            onClick={handlePrint}>
                                                            Export PDF
                                                        </Button>
                                                    </div>
                                                </div>
                                                {(selectedCatg === 'all' ||
                                                    selectedCatg === 'individual' ||
                                                    selectedCatg === 'student_wise' ||
                                                    selectedCatg === 'admCat' ||
                                                    selectedCatg === 'unmapped' ||
                                                    selectedCatg === 'Termwise') && (
                                                    <div className='overflow-x-auto px-8 pb-8'>
                                                        <table className='w-full border-collapse border border-gray-300 text-sm'>
                                                            <thead className='bg-primary text-white'>
                                                                <tr>
                                                                    <th className='p-2 text-center'>
                                                                        <Checkbox
                                                                            checked={
                                                                                selectedIds.length === reportData.length &&
                                                                                reportData.length > 0
                                                                            }
                                                                            indeterminate={
                                                                                selectedIds.length > 0 &&
                                                                                selectedIds.length < reportData.length
                                                                            }
                                                                            onCheckedChange={toggleAllstudents}
                                                                        />
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Adm. NO.</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Student Name
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Class</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Section</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Roll No.</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Fee Group
                                                                    </th>
                                                                    {amntchecked && (
                                                                        <th className='border px-2 py-2 text-center font-semibold'>
                                                                            Amount
                                                                        </th>
                                                                    )}
                                                                    {selectedCatg === 'unmapped' && (
                                                                        <th className='border px-2 py-2 text-center font-semibold'>
                                                                            Amount
                                                                        </th>
                                                                    )}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportData.map((row, index) => (
                                                                    <tr
                                                                        key={row.id}
                                                                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className='p-2 text-center'>
                                                                            <Checkbox
                                                                                checked={selectedIds.includes(row.id)}
                                                                                onCheckedChange={() => toggleRow(row.id)}
                                                                            />
                                                                        </td>
                                                                        {/* Sl No - Centered */}
                                                                        <td className='border px-2 py-2 text-center'>{index + 1}</td>

                                                                        {/* Admission No - Centered or Left aligned */}
                                                                        <td className='border px-2 py-2 text-center'>{row.amsT_AdmNo}</td>

                                                                        {/* Student Name - Left aligned for readability */}
                                                                        <td className='border px-2 py-2 text-left'>
                                                                            {row.amsT_FirstName || '-'}
                                                                        </td>

                                                                        {/* Class - Left or Centered */}
                                                                        <td className='border px-2 py-2 text-left'>
                                                                            {row.asmcL_ClassName?.toLocaleString() || '-'}
                                                                        </td>

                                                                        {/* Section - Centered */}
                                                                        <td className='border px-2 py-2 text-center'>
                                                                            {row.asmC_SectionName?.toLocaleString() || '-'}
                                                                        </td>

                                                                        {/* Roll No - Centered */}
                                                                        <td className='border px-2 py-2 text-center'>
                                                                            {row.amaY_RollNo?.toLocaleString() || '-'}
                                                                        </td>

                                                                        {/* Fee Group - Left aligned */}
                                                                        <td className='border px-2 py-2 text-left'>
                                                                            {row.fmG_GroupName?.toLocaleString() || '-'}
                                                                        </td>

                                                                        {/* Amount - Right aligned since it's numeric/currency */}
                                                                        {amntchecked && (
                                                                            <td className='border px-2 py-2 text-right'>₹{row.amount}</td>
                                                                        )}
                                                                        {selectedCatg === 'unmapped' && (
                                                                            <td className='border px-2 py-2 text-right'>₹{row.amount}</td>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleSection>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
