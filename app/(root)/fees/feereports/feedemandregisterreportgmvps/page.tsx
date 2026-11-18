'use client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeDefaulterReport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDropDownDataForReports
} from '@/hooks/fees/useReports';
import { feeDemandRegisterReportGMVPSSchema } from '@/schemas/fees/reports';
import { getFeeReceiptReportStudentDropdown } from '@/server/fees/reports/fee_receipt_report';
import { getFeeDemandRegisterGMVPS } from '@/server/fees/reports/fee_refund_report_gmvps';
import type { IFeeCustomGroupDropdownList, IFeeGroupDropdownList, IFeeTermDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeDemandRegisterReportGMVPSSchema>;

export default function FeeDemandRegisterReportGMVPS() {
    const {
        control,
        handleSubmit,
        reset,
        register,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeDemandRegisterReportGMVPSSchema),
        defaultValues: {
            report: 'All',
            reportdate: 'As On Date',
            asmaY_Id: 0,
            asmcL_Id: 0,
            asms_Id: 0,
            asmt_Id: 0
        }
    });

    const [submitClicked, setSubmitClicked] = useState(false);

    const report = useWatch({ control, name: 'report' });
    const reportdate = useWatch({ control, name: 'reportdate' });
    const detailed = useWatch({ control, name: 'detailed' });
    const grandTotal = useWatch({ control, name: 'grandTotal' });
    const active = useWatch({ control, name: 'active' });
    const left = useWatch({ control, name: 'left' });
    const deactive = useWatch({ control, name: 'deactive' });
    const total = useWatch({ control, name: 'total' });
    const userSelection = useWatch({ control, name: 'userSelection' });
    const newAdmissionStudent = useWatch({
        control,
        name: 'newAdmissionStudent'
    });
    const asmayId = watch('asmaY_Id');
    const amscL_Id = watch('asmcL_Id');
    const asms_Id = watch('asms_Id');
    const asmt_Id = watch('asmt_Id');
    const [refreshAY, setRefreshAY] = useState(0);
    const [tableSumRow, setTableSumRow] = useState<any>(null);

    const [reporttype, setReportType] = useState('');

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [groupManualLoading, setGroupManualLoading] = useState(false);
    const [classes, setClasses] = useState<any[]>([]);
    const [section, setSection] = useState<any[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);
    const [studentid, setstudentids] = useState<any>([]);
    const [studentLoading, setstudentsloading] = useState(false);
    const [selectedAsmayId, setSelectedAsmayId] = useState<number | null>(null);
    const [filters, setFilters] = useState({
        customGroupIds: [] as number[],
        feeGroupIds: [] as number[],
        termIds: [] as number[],
        dueDate: new Date(),
        fromDate: new Date(),
        toDate: new Date()
    });

    const { data: academicData, error: academicError, isLoading: loadingAcademic, refetch: refetchAcademicYears } = useFeeDefaulterReport();
    const { data: classData, error: classError, isLoading: loadingClasses1 } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, error: sectionListError, isLoading: loadingSection } = useFeeSectionListDefaulterreport();

    useEffect(() => {
        if (academicError) toast.error('Failed to load academic years');
        if (!loadingAcademic && academicData?.data?.length && selectedAsmayId === null) {
            const years = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id,
                asmaY_Year: i.asmaY_Year
            }));
            setAcademicYears(years);
            const firstYearId = years[0].asmaY_Id;
            setValue('asmaY_Id', firstYearId, {
                shouldValidate: true,
                shouldDirty: false
            });
            if (years.length > 0) {
                const firstYearId = years[0].asmaY_Id;
                setValue('asmaY_Id', firstYearId, { shouldValidate: true });
                // onYearChange(firstYearId);
            }
        }
    }, [academicData, academicError, refreshAY]);

    useEffect(() => {
        if (classError) toast.error('Failed to load Class dropdown');
        if (classData?.data) {
            setClasses(
                classData.data.map((i: any) => ({
                    asmcL_Id: i.asmcL_Id,
                    asmcL_ClassName: i.asmcL_ClassName
                }))
            );
        }
    }, [classData, classError]);

    useEffect(() => {
        if (sectionListError) toast.error('Failed to load Section dropdown');
        if (sectionListResponse?.data) {
            setSection(
                sectionListResponse.data.map((i: any) => ({
                    asmS_Id: i.asmS_Id,
                    asmC_SectionName: i.asmC_SectionName
                }))
            );
        }
    }, [sectionListResponse, sectionListError]);

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();
    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDropDownDataForReports();

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    useEffect(() => {
        if (customGroups.length > 0 && filters.customGroupIds.length === 0) {
            setFilters((prev) => ({
                ...prev,
                customGroupIds: customGroups.map((g) => g.fmgG_Id)
            }));
        }
    }, [customGroups]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feeGroups.length > 0 && filters.feeGroupIds.length === 0) {
            setFilters((prev) => ({
                ...prev,
                feeGroupIds: feeGroups.map((g) => g.fmG_Id)
            }));
        }
    }, [feeGroups]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (feeTerms.length > 0 && filters.termIds.length === 0) {
            setFilters((prev) => ({
                ...prev,
                termIds: feeTerms.map((g) => g.fmT_Id)
            }));
        }
    }, [feeTerms]);

    const selectAllCustomGroups = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            customGroupIds: checked ? customGroups.map((g) => g.fmgG_Id) : []
        }));
    };

    const selectAllFeeGroups = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            feeGroupIds: checked ? feeGroups.map((g) => g.fmG_Id) : []
        }));
    };

    const selectAllTerms = (checked: boolean) => {
        setFilters((prev) => ({
            ...prev,
            termIds: checked ? feeTerms.map((t) => t.fmT_Id) : []
        }));
    };

    const toggleCustomGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            customGroupIds: prev.customGroupIds.includes(id) ? prev.customGroupIds.filter((x) => x !== id) : [...prev.customGroupIds, id]
        }));

    const toggleFeeGroup = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            feeGroupIds: prev.feeGroupIds.includes(id) ? prev.feeGroupIds.filter((x) => x !== id) : [...prev.feeGroupIds, id]
        }));

    const toggleTerm = (id: number) =>
        setFilters((prev) => ({
            ...prev,
            termIds: prev.termIds.includes(id) ? prev.termIds.filter((x) => x !== id) : [...prev.termIds, id]
        }));

    const [loading, setLoading] = useState(false);
    const [tableColumns, setTableColumns] = useState<string[]>([]);
    const [tableRows, setTableRows] = useState<any[]>([]);
    const [showTable, setShowTable] = useState(false);

    const handlePrint = () => {
        //  printTable(tableColumns, tableRows, tableSumRow);
    };

    const handleExportExcel = () => {
        //  exportToExcel(
        //      [...tableRows, tableSumRow], // include TOTAL row
        //      'Daily_Fee_Collection_Report'
        //  );
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (active === false && deactive === false && left === false) {
            toast.error('Please Select Any One CheckBox Active or Deactive or Left ..');
            return;
        }
        try {
            setLoading(true);
            setTableRows([]);
            let payload = {};
            const selectedCGList = filters.customGroupIds.map((id) => ({ ...payload, fmgG_Id: id.toString() }));
            const selectedGroupList = filters.feeGroupIds.map((id) => ({ ...payload, fmG_Id: id.toString() }));
            payload = {
                type: report === 'Individual' ? 'Indi' : 'All',
                selectedCGList: selectedCGList,
                selectedGroup: selectedGroupList,
                selectedStudType: [
                    {
                        value: active === true ? 'S' : '0'
                    },
                    {
                        value: deactive === true ? 'D' : '0'
                    },
                    {
                        value: left === true ? 'L' : '0'
                    }
                ],
                date: filters.dueDate,
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                newstud: '1',
                asmaY_Id: data.asmaY_Id,
                asmcL_Id: data.asmcL_Id,
                asmS_Id: data.asms_Id,
                amsT_Id: data.asmt_Id
            };
            console.log('payload', payload);
            const response = await getFeeDemandRegisterGMVPS(payload);

            const rawData: any = response?.data;

            if (!Array.isArray(rawData?.list) || rawData.list.length === 0) {
                toast.error('No data found');
                setShowTable(false);
                setTableRows([]);
                return;
            }

            const currentReportType = rawData?.listName || '';
            setReportType(currentReportType);

            setShowTable(true);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch report');
            setTableColumns([]);
            setTableRows([]);
            setShowTable(true);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        reset();
        setSubmitClicked(false);
        setTableColumns([]);
        setTableRows([]);
        setShowTable(false);
        refetchAcademicYears();
        setRefreshAY((n) => n + 1);
    };

    useEffect(() => {
        const fetchStudents = async () => {
            if (!asmayId || !amscL_Id || !asms_Id) {
                setstudentids([]);

                return;
            }
            setstudentsloading(true);
            try {
                const result = await getFeeReceiptReportStudentDropdown(Number(asmayId), amscL_Id, asms_Id);
                const data = Array.isArray(result?.data) ? result.data : [];
                setstudentids(data);

                if (data.length === 0) {
                    toast.info('No Students found ');
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to load Students');
                setstudentids([]);
            } finally {
                setstudentsloading(false);
            }
        };

        fetchStudents();
    }, [asmayId, amscL_Id, setValue, asms_Id, setstudentids]);

    return (
        <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
                    <div className='space-y-6'>
                        <div className='space-y-3 rounded-lg border p-4'>
                            <div className='flex flex-wrap gap-6'>
                                <div>
                                    Select Radio Button:<span className='text-red-500'>*</span>
                                </div>
                                {['All', 'Individual'].map((val) => (
                                    <label key={val} className='flex items-center gap-2'>
                                        <input type='radio' value={val} {...register('report')} />
                                        <span className='capitalize'>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <Label className='w-40 font-medium'>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='asmaY_Id'
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value?.toString()}
                                        onValueChange={(v) => {
                                            const num = Number(v);
                                            field.onChange(num);
                                            // setSelectedAcademicYearId(num);
                                            // onYearChange(num);
                                        }}>
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder={loadingAcademic ? 'Loading...' : 'Select Academic Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingAcademic ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : academicError ? (
                                                <SelectItem value='error' disabled>
                                                    Failed to load years
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
                            {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                        </div>
                        {report === 'Individual' && (
                            <div className='flex items-center gap-4'>
                                <Label className='w-40 font-medium'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asms_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(v) => {
                                                const num = Number(v);
                                                field.onChange(num);
                                                // onYearChange(num);
                                            }}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingClasses1 ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {loadingSection ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : sectionListError ? (
                                                    <SelectItem value='error' disabled>
                                                        Failed to load Section
                                                    </SelectItem>
                                                ) : (
                                                    section.map((item) => (
                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                            {item.asmC_SectionName}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asms_Id && <FormError>{errors.asms_Id.message}</FormError>}
                            </div>
                        )}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            <div className='space-y-3'>
                                <Label className='font-semibold text-lg'>
                                    Custom Group <span className='text-red-500'>*</span>
                                </Label>
                                <Card className='border bg-gray-50 p-4'>
                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                        <Label
                                            htmlFor='customGroupSelectAll'
                                            className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                            <Checkbox
                                                id='customGroupSelectAll'
                                                checked={customGroups.length > 0 && filters.customGroupIds.length === customGroups.length}
                                                onCheckedChange={(checked: any) => selectAllCustomGroups(!!checked)}
                                            />
                                            <span>Select All</span>
                                        </Label>

                                        {loadingCustomGroup ? (
                                            <div className='py-4 text-center text-gray-500'>Loading...</div>
                                        ) : customGroups.length > 0 ? (
                                            customGroups.map((group) => (
                                                <Label
                                                    key={group.fmgG_Id}
                                                    htmlFor={`customGroup-${group.fmgG_Id}`}
                                                    className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                    <Checkbox
                                                        id={`customGroup-${group.fmgG_Id}`}
                                                        checked={filters.customGroupIds.includes(group.fmgG_Id)}
                                                        onCheckedChange={() => toggleCustomGroup(group.fmgG_Id)}
                                                    />
                                                    <span className='font-medium text-sm'>{group.fmgG_GroupName}</span>
                                                </Label>
                                            ))
                                        ) : (
                                            <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                            <div className='space-y-3'>
                                <Label className='font-semibold text-lg'>
                                    Fee Group <span className='text-red-500'>*</span>
                                </Label>
                                <Card className='border bg-gray-50 p-4'>
                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                        <Label
                                            htmlFor='feeGroupSelectAll'
                                            className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                            <Checkbox
                                                id='feeGroupSelectAll'
                                                checked={feeGroups.length > 0 && filters.feeGroupIds.length === feeGroups.length}
                                                onCheckedChange={(checked: any) => selectAllFeeGroups(!!checked)}
                                            />
                                            <span>Select All</span>
                                        </Label>

                                        {loadingfeegroup ? (
                                            <div className='py-4 text-center text-gray-500'>Loading...</div>
                                        ) : feeGroups.length > 0 ? (
                                            feeGroups.map((group) => (
                                                <Label
                                                    key={group.fmG_Id}
                                                    htmlFor={`feeGroup-${group.fmG_Id}`}
                                                    className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                    <Checkbox
                                                        id={`feeGroup-${group.fmG_Id}`}
                                                        checked={filters.feeGroupIds.includes(group.fmG_Id)}
                                                        onCheckedChange={() => toggleFeeGroup(group.fmG_Id)}
                                                    />
                                                    <span className='text-sm'>{group.fmG_GroupName}</span>
                                                </Label>
                                            ))
                                        ) : (
                                            <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                        )}
                                    </div>
                                </Card>
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold text-lg'>
                                    Term Name <span className='text-red-500'>*</span>
                                </Label>
                                <Card className='border bg-gray-50 p-4'>
                                    <div className='max-h-64 space-y-3 overflow-y-auto'>
                                        <Label
                                            htmlFor='termSelectAll'
                                            className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                            <Checkbox
                                                id='termSelectAll'
                                                checked={feeTerms.length > 0 && filters.termIds.length === feeTerms.length}
                                                onCheckedChange={(checked: any) => selectAllTerms(!!checked)}
                                            />
                                            <span>Select All</span>
                                        </Label>

                                        {loadingfeeterm ? (
                                            <div className='py-4 text-center text-gray-500'>Loading...</div>
                                        ) : feeTerms.length > 0 ? (
                                            feeTerms.map((term) => (
                                                <Label
                                                    key={term.fmT_Id}
                                                    htmlFor={`term-${term.fmT_Id}`}
                                                    className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                    <Checkbox
                                                        id={`term-${term.fmT_Id}`}
                                                        checked={filters.termIds.includes(term.fmT_Id)}
                                                        onCheckedChange={() => toggleTerm(term.fmT_Id)}
                                                    />
                                                    <span className='text-sm'>{term.fmT_Name}</span>
                                                </Label>
                                            ))
                                        ) : (
                                            <div className='py-4 text-center text-gray-500'>No terms</div>
                                        )}
                                    </div>
                                </Card>
                                {/* {errors.termIds && <FormError>{errors.termIds.message}</FormError>} */}
                            </div>
                        </div>
                    </div>
                    <div className='space-y-6'>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                Select Check Box:
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='active' checked={active} onCheckedChange={(v) => setValue('active', !!v)} />
                                    <Label htmlFor='active'>Active</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='deactive' checked={deactive} onCheckedChange={(v) => setValue('deactive', !!v)} />
                                    <Label htmlFor='deactive'>In-Active</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='left' checked={left} onCheckedChange={(v) => setValue('left', !!v)} />
                                    <Label htmlFor='left'>Left</Label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='flex items-center gap-4'>
                                <Label className='w-40 font-medium'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='asmcL_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value?.toString()}
                                            onValueChange={(v) => {
                                                const num = Number(v);
                                                field.onChange(num);
                                                // onYearChange(num);
                                            }}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder={loadingClasses1 ? 'Loading...' : 'Select class Name'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {/* <SelectItem value='all'>All</SelectItem> */}
                                                {loadingClasses1 ? (
                                                    <SelectItem value='loading' disabled>
                                                        Loading...
                                                    </SelectItem>
                                                ) : classError ? (
                                                    <SelectItem value='error' disabled>
                                                        Failed to load Class
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
                                {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                            </div>
                            {report === 'Individual' && (
                                <div className='mt-5 flex items-center gap-4'>
                                    <Label className='w-40 font-medium'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmt_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value?.toString()}
                                                onValueChange={(v) => {
                                                    const num = Number(v);
                                                    field.onChange(num);
                                                    // onYearChange(num);
                                                }}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder={studentLoading ? 'Loading...' : 'Select Student Name'} />
                                                </SelectTrigger>

                                                <SelectContent>
                                                    {studentLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        studentid.map((item: any) => (
                                                            <SelectItem key={item.amst_Id} value={item.amst_Id.toString()}>
                                                                {item.studentName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmt_Id && <FormError>{errors.asmt_Id.message}</FormError>}
                                </div>
                            )}
                        </div>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='detailed' checked={detailed} onCheckedChange={(v) => setValue('detailed', !!v)} />
                                    <Label htmlFor='detailed'>Detailed</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='grandTotal' checked={grandTotal} onCheckedChange={(v) => setValue('grandTotal', !!v)} />
                                    <Label htmlFor='grandTotal'>Grand Total</Label>
                                </div>
                            </div>
                        </div>
                        <div className='rounded-lg border p-4'>
                            <div className='flex gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox id='total' checked={total} onCheckedChange={(v) => setValue('total', !!v)} />
                                    <Label htmlFor='total'>Total</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='userSelection'
                                        checked={userSelection}
                                        onCheckedChange={(v) => setValue('userSelection', !!v)}
                                    />
                                    <Label htmlFor='userSelection'>User Selection</Label>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='newAdmissionStudent'
                                        checked={newAdmissionStudent}
                                        onCheckedChange={(v) => setValue('newAdmissionStudent', !!v)}
                                    />
                                    <Label htmlFor='newAdmissionStudent'>New Admission Student</Label>
                                </div>
                            </div>
                        </div>
                        <div className='space-y-3 rounded-lg border p-4'>
                            <div className='flex flex-wrap gap-6'>
                                {['As On Date', 'Between Date'].map((val) => (
                                    <label key={val} className='flex items-center gap-2'>
                                        <input type='radio' value={val} {...register('reportdate')} />
                                        <span className='capitalize'>{val}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        {reportdate === 'As On Date' && (
                            <div>
                                <Label className='min-w-32 font-medium'>
                                    Date <span className='text-red-500'>*</span>
                                </Label>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {format(filters.dueDate, 'dd-MM-yyyy')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={filters.dueDate}
                                            onSelect={(date) => date && setFilters((prev) => ({ ...prev, dueDate: date }))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        )}
                        {reportdate === 'Between Date' && (
                            <div className='flex flex-wrap gap-6'>
                                <div className='flex items-center gap-2'>
                                    <Label className='min-w-32 font-medium'>
                                        From Date <span className='text-red-500'>*</span>
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {format(filters.fromDate, 'dd-MM-yyyy')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={filters.fromDate}
                                                onSelect={(date) => date && setFilters((prev) => ({ ...prev, fromDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Label className='min-w-32 font-medium'>
                                        To Date <span className='text-red-500'>*</span>
                                    </Label>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant='outline' className='w-[240px] justify-start text-left font-normal'>
                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                {format(filters.toDate, 'dd-MM-yyyy')}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={filters.toDate}
                                                onSelect={(date) => date && setFilters((prev) => ({ ...prev, toDate: date }))}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='button' variant='outline' onClick={handleReset}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSubmitting} className='min-w-32'>
                        {isSubmitting ? 'Generating...' : 'Report'}
                    </Button>
                </div>
            </form>
            <div className='my-6 border-gray-300 border-t' />

            {!loading && tableRows.length > 0 && (
                <CollapsibleSection defaultOpen={true}>
                    <div className='mt-10'>
                        {/* 🔹 REPORT HEADER */}
                        <div className='mb-6 text-center'>
                            <h2 className='font-bold text-2xl text-primary'>Daily Fee Collection Report</h2>
                            {/* <div className="mt-1 text-sm text-gray-600">
                 From {formatDate(fromDate)} To {formatDate(toDate)}
             </div> */}
                        </div>
                        <div className='my-6 border-gray-300 border-t' />

                        <div className='flex items-center justify-between border-b bg-muted/40 px-8 py-4'>
                            <div className='flex gap-3'>
                                <Button variant='outline' onClick={handlePrint}>
                                    🖨 Print
                                </Button>

                                <Button variant='outline' onClick={handleExportExcel}>
                                    📊 Export Excel
                                </Button>
                            </div>
                        </div>

                        {/* 🔹 TABLE */}
                        <div className='overflow-auto rounded-md border'>
                            <table className='w-full border-collapse text-sm'>
                                <thead className='bg-primary text-white'>
                                    <tr>
                                        {tableColumns.map((col) => (
                                            <th key={col} className='border px-3 py-2 text-left'>
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableRows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {tableColumns.map((col) => (
                                                <td key={col} className='border px-3 py-2 text-right'>
                                                    {row[col]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {/* 🔹 SUM ROW */}
                                    {tableSumRow && (
                                        <tr className='bg-gray-100 font-semibold'>
                                            {tableColumns.map((col) => (
                                                <td key={col} className='border px-3 py-2 text-right'>
                                                    {col === 'SLNO' ? '' : col === 'Date' ? 'Total' : `Sum: ${tableSumRow[col] ?? 0}`}
                                                </td>
                                            ))}
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
