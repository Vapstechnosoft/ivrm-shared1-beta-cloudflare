'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MONTH_LIST } from '@/constants/hrms-config';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useDepartmentSalaryReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Printer, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { printDepartmentSalaryReport } from './_components/print-utils';

const departmentSalaryReportSchema = z.object({
    year: z.string().min(1, 'Year is required'),
    month: z.string().min(1, 'Month is required'),
    groupType: z.array(z.string()).min(1, 'Please select at least one Group Type'),
    department: z.array(z.string()).min(1, 'Please select at least one Department'),
    designation: z.array(z.string()).min(1, 'Please select at least one Designation')
});

type FormFields = z.infer<typeof departmentSalaryReportSchema>;

export default function DepartmentSalaryReportPage() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    const [resetKey, setResetKey] = useState(0);

    // Form
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(departmentSalaryReportSchema),
        defaultValues: {
            year: '',
            month: '',
            groupType: [],
            department: [],
            designation: []
        }
    });

    const handleCancel = () => {
        reset();
        setReportData(null);
        setResetKey((prev) => prev + 1);
    };

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');

    // Data Fetching
    const { data: yearsData, isLoading: isLoadingYears } = useLeaveYearDropdown();
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();

    // Cascading Filter Logic
    const activeGroupIds = useMemo(() => {
        if (!watchedGroupType || watchedGroupType.length === 0) return '';
        if (watchedGroupType.includes('All')) {
            return groupTypesData?.data?.map((g: any) => g.HRMGT_Id || g.hrmgT_Id).join(',') || '';
        }
        return watchedGroupType.join(',');
    }, [watchedGroupType, groupTypesData]);

    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(activeGroupIds);

    const activeDeptIds = useMemo(() => {
        if (!watchedDepartment || watchedDepartment.length === 0) return '';
        if (watchedDepartment.includes('All')) {
            return departmentsData?.data?.map((d: any) => d.HRMD_Id || d.hrmD_Id).join(',') || '';
        }
        return watchedDepartment.join(',');
    }, [watchedDepartment, departmentsData]);

    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(activeGroupIds, activeDeptIds);

    // Report Query
    const { mutate: fetchReport, isPending: isLoadingReport, data: reportResult } = useDepartmentSalaryReport();
    const [reportData, setReportData] = useState<any>(null);

    // Watch for success
    useEffect(() => {
        if (reportResult) {
            if (reportResult.data?.departmentSalaryDetails?.length > 0) {
                setReportData(reportResult.data);
            } else {
                setReportData(null);
                toast.info('No Data Found');
            }
        }
    }, [reportResult]);

    // Extract dynamic earning and deduction heads
    const { earningHeads, deductionHeads } = useMemo(() => {
        if (!reportData || !reportData.departmentSalaryDetails) {
            return { earningHeads: [], deductionHeads: [] };
        }
        const earningMap = new Map<number, { id: number; name: string; order: number; index: number }>();
        const deductionMap = new Map<number, { id: number; name: string; order: number; index: number }>();

        reportData.departmentSalaryDetails.forEach((row: any) => {
            row.earningresult?.forEach((e: any, idx: number) => {
                if (!earningMap.has(e.hrmeD_Id)) {
                    earningMap.set(e.hrmeD_Id, { id: e.hrmeD_Id, name: e.hrmeD_Name, order: e.hrmeD_Order || 0, index: idx });
                }
            });
            row.deductionresult?.forEach((d: any, idx: number) => {
                if (!deductionMap.has(d.hrmeD_Id)) {
                    deductionMap.set(d.hrmeD_Id, { id: d.hrmeD_Id, name: d.hrmeD_Name, order: d.hrmeD_Order || 0, index: idx });
                }
            });
        });

        const earningHeads = Array.from(earningMap.values()).sort((a, b) => a.order - b.order || a.index - b.index);
        const deductionHeads = Array.from(deductionMap.values()).sort((a, b) => a.order - b.order || a.index - b.index);

        return { earningHeads, deductionHeads };
    }, [reportData]);

    const onSubmit = (data: FormFields) => {
        // Prepare IDs
        const gIds = data.groupType.includes('All')
            ? groupTypesData?.data?.map((g: any) => g.HRMGT_Id || g.hrmgT_Id).join(',')
            : data.groupType.join(',');
        const dIds = data.department.includes('All')
            ? departmentsData?.data?.map((d: any) => d.HRMD_Id || d.hrmD_Id).join(',')
            : data.department.join(',');
        let desIds = '';
        if (data.designation && data.designation.length > 0) {
            desIds = data.designation.includes('All')
                ? designationsData?.data?.map((d: any) => d.HRMDES_Id || d.hrmdeS_Id).join(',')
                : data.designation.join(',');
        } else {
            // If no designation selected, maybe send all? Or validate?
            // Logic in mass updation sends 0 if empty? Prompt implies explicit select.
            // Let's assume select all if empty? Or required.
            // User prompt: "hrmdes_ids" : "40,73..." so it is required.
            if (designationsData?.data?.length > 0) {
                desIds = designationsData?.data?.map((d: any) => d.HRMDES_Id || d.hrmdeS_Id).join(',');
            } else {
                desIds = '0';
            }
        }

        // Find Year Name not just ID if needed, but API usually takes ID or Name depending on backend.
        // Prompt says: "hreS_Year": "2025". `yearsData` usually has IDs and Names.
        // Let's map ID to Name.
        const yearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === data.year);
        const yearName = yearObj ? yearObj.hrmlY_LeaveYear : data.year;

        // Month "April"
        const monthObj = MONTH_LIST.find((m: { id: number; name: string }) => m.id.toString() === data.month);
        const monthName = monthObj ? monthObj.name : data.month;

        fetchReport({
            hreS_Year: yearName,
            hreS_Month: monthName,
            hrmgt_ids: gIds,
            hrmd_ids: dIds,
            hrmdes_ids: desIds
        });
    };

    // Columns Configuration
    // Custom Table Layout
    // Legacy grid structure logic implemented directly in JSX
    const columns = useMemo(() => [], []);

    const handlePrint = () => {
        const yearObj = yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === watch('year'));
        const monthObj = MONTH_LIST.find((m) => m.id.toString() === watch('month'));

        // Get Dept Names for display
        // ... Logic to get selected dept names ...

        printDepartmentSalaryReport(
            reportData,
            monthObj?.name || '',
            yearObj?.hrmlY_LeaveYear || '',
            '' // Dept names placeholder
        );
    };

    if (!isClient) return null;

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <CollapsibleSection defaultOpen={true} title='Department Salary Report'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-4'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Year & Month */}
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingYears}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingYears ? 'Loading...' : 'Select Year'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id?.toString() || ''}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.year && <FormError>{errors.year.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label>
                                Month <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='month'
                                control={control}
                                key={resetKey}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingYears}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingYears ? 'Loading...' : 'Select Month'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTH_LIST.map((m) => (
                                                <SelectItem key={m.id} value={m.id.toString()}>
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.month && <FormError>{errors.month.message}</FormError>}
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                        {/* Group Type */}
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={
                                            groupTypesData?.data?.map((gt: any) => ({
                                                label: gt.value,
                                                value: gt.key.toString()
                                            })) || []
                                        }
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                                        disabled={isLoadingGroupTypes}
                                    />
                                )}
                            />
                            {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                        </div>
                        {/* Department */}
                        <div className='space-y-2'>
                            <Label>
                                Department <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={[
                                            ...(departmentsData?.data || []).map((d: any) => ({
                                                label: d.HRMD_DepartmentName || d.hrmD_DepartmentName,
                                                value: d.HRMD_Id?.toString() || d.hrmD_Id?.toString() || ''
                                            }))
                                        ]}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                        disabled={!activeGroupIds}
                                    />
                                )}
                            />
                            {errors.department && <FormError>{errors.department.message}</FormError>}
                        </div>
                        {/* Designation */}
                        <div className='space-y-2'>
                            {/* <Label>Designation</Label> */}
                            <Label>
                                Designation <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={[
                                            ...(designationsData?.data || []).map((d: any) => ({
                                                label: d.HRMDES_DesignationName || d.hrmdeS_DesignationName,
                                                value: d.HRMDES_Id?.toString() || d.hrmdeS_Id?.toString() || ''
                                            }))
                                        ]}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                        disabled={!activeDeptIds}
                                    />
                                )}
                            />
                            {errors.designation && <FormError>{errors.designation.message}</FormError>}
                        </div>
                    </div>

                    <div className='flex justify-end gap-2 pt-4'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleCancel}
                            disabled={isLoadingReport}
                            className='w-32 rounded-xl border-orange-500 text-orange-600 transition-all hover:bg-orange-50'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button type='submit' disabled={isLoadingReport} className='w-40 rounded-xl transition-all'>
                            {isLoadingReport ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData && reportData.departmentSalaryDetails && reportData.departmentSalaryDetails.length > 0 && (
                <CollapsibleSection
                    title='Department Salary Report'
                    defaultOpen={true}
                    rightElement={
                        <div className='no-print flex justify-center gap-4 py-4'>
                            <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoadingReport} className='w-fit'>
                                <X className='h-4 w-4' />
                                CANCEL
                            </Button>
                            <Button type='submit' onClick={handlePrint} className='w-fit'>
                                <Printer className='h-4 w-4' /> Print
                            </Button>
                        </div>
                    }>
                    <div className='mt-8 overflow-x-auto'>
                        <div id='print-section' className='rounded border border-gray-200 bg-white p-4 shadow-sm'>
                            {/* Institution Header */}
                            {reportData.institutionDetails && (
                                <div className='mb-6 text-center'>
                                    <h4 className='font-bold text-gray-800 text-xl uppercase tracking-wide'>
                                        {reportData.institutionDetails.mI_Name}
                                    </h4>
                                    <h6 className='text-gray-600 text-sm'>
                                        {[
                                            reportData.institutionDetails.mI_Address1,
                                            reportData.institutionDetails.mI_Address2,
                                            reportData.institutionDetails.mI_Address3
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </h6>
                                    <h6 className='text-gray-600 text-sm'>
                                        {reportData.institutionDetails.ivrmmcT_Name} - {reportData.institutionDetails.mI_Pincode}
                                    </h6>
                                    <h5 className='mt-4 font-semibold text-gray-700 text-md underline decoration-gray-400 underline-offset-4'>
                                        Department Salary Report For the Month of{' '}
                                        {yearsData?.data?.find((y: any) => y.hrmlY_Id.toString() === watch('year'))?.hrmlY_LeaveYear} -{' '}
                                        {MONTH_LIST.find((m) => m.id.toString() === watch('month'))?.name}
                                    </h5>
                                </div>
                            )}

                            <div className='overflow-x-auto'>
                                <table className='w-full border-collapse border border-gray-400 text-xs'>
                                    <thead className='bg-gray-100 text-center font-bold text-gray-700'>
                                        <tr>
                                            <th rowSpan={2} className='min-w-[50px] border border-gray-400 bg-gray-50 p-2'>
                                                Sl.No
                                            </th>
                                            <th
                                                rowSpan={2}
                                                className='min-w-[150px] whitespace-nowrap border border-gray-400 bg-gray-50 p-2'>
                                                Department Name
                                            </th>

                                            {/* Earnings Group Header */}
                                            {earningHeads.length > 0 ? (
                                                <th colSpan={earningHeads.length} className='border border-gray-400 bg-blue-50 p-2'>
                                                    Earnings
                                                </th>
                                            ) : null}

                                            <th rowSpan={2} className='w-[100px] border border-gray-400 bg-blue-100 p-2'>
                                                Gross Earning
                                            </th>

                                            {/* Deductions Group Header */}
                                            {deductionHeads.length > 0 ? (
                                                <th colSpan={deductionHeads.length} className='border border-gray-400 bg-red-50 p-2'>
                                                    Deductions
                                                </th>
                                            ) : null}

                                            <th rowSpan={2} className='w-[100px] border border-gray-400 bg-red-100 p-2'>
                                                Gross Deduction
                                            </th>
                                            <th rowSpan={2} className='w-[100px] border border-gray-400 bg-green-100 p-2'>
                                                Net Salary
                                            </th>
                                        </tr>
                                        <tr>
                                            {/* Dynamic Earning Headers */}
                                            {earningHeads.map((eh) => (
                                                <th
                                                    key={`eh-${eh.id}`}
                                                    className='whitespace-nowrap border border-gray-400 bg-blue-50/50 p-2'>
                                                    {eh.name}
                                                </th>
                                            ))}

                                            {/* Dynamic Deduction Headers */}
                                            {deductionHeads.map((dh) => (
                                                <th
                                                    key={`dh-${dh.id}`}
                                                    className='whitespace-nowrap border border-gray-400 bg-red-50/50 p-2'>
                                                    {dh.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.departmentSalaryDetails.map((row: any, index: number) => {
                                            const netSalary = row.netSalary ?? row.grossEarning - row.grossDeduction;

                                            return (
                                                <tr key={index} className='transition-colors hover:bg-gray-50'>
                                                    <td className='border border-gray-400 p-2 text-center text-gray-600'>{index + 1}</td>
                                                    <td className='border border-gray-400 p-2 font-medium text-gray-800'>
                                                        {row.hrmD_DepartmentName === 'JUNIOR SCHOOL'
                                                            ? 'Teaching Staff'
                                                            : row.hrmD_DepartmentName}
                                                    </td>

                                                    {/* Earnings Data */}
                                                    {earningHeads.map((eh) => {
                                                        const val =
                                                            row.earningresult?.find((e: any) => e.hrmeD_Id === eh.id)?.hresD_Amount || 0;
                                                        return (
                                                            <td
                                                                key={`ed-${index}-${eh.id}`}
                                                                className='border border-gray-400 p-2 text-right'>
                                                                {val ? Math.round(val).toLocaleString() : 0}
                                                            </td>
                                                        );
                                                    })}

                                                    <td className='border border-gray-400 bg-blue-50/20 p-2 text-right font-bold text-gray-800'>
                                                        {Math.round(row.grossEarning).toLocaleString()}
                                                    </td>

                                                    {/* Deductions Data */}
                                                    {deductionHeads.map((dh) => {
                                                        const val =
                                                            row.deductionresult?.find((d: any) => d.hrmeD_Id === dh.id)?.hresD_Amount || 0;
                                                        return (
                                                            <td
                                                                key={`dd-${index}-${dh.id}`}
                                                                className='border border-gray-400 p-2 text-right'>
                                                                {val ? Math.round(val).toLocaleString() : 0}
                                                            </td>
                                                        );
                                                    })}

                                                    <td className='border border-gray-400 bg-red-50/20 p-2 text-right font-bold text-gray-800'>
                                                        {Math.round(row.grossDeduction).toLocaleString()}
                                                    </td>
                                                    <td className='border border-gray-400 bg-green-50/20 p-2 text-right font-bold text-gray-900'>
                                                        {Math.round(netSalary).toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot className='bg-gray-100 font-bold text-gray-800'>
                                        <tr>
                                            <td colSpan={2} className='border border-gray-400 p-2 text-center uppercase tracking-wider'>
                                                Total
                                            </td>

                                            {/* Earning Totals */}
                                            {(() => {
                                                const earningHeadsMap = new Map<number, number>();
                                                reportData.departmentSalaryDetails.forEach((row: any) => {
                                                    earningHeads.forEach((eh) => {
                                                        const val =
                                                            row.earningresult?.find((e: any) => e.hrmeD_Id === eh.id)?.hresD_Amount || 0;
                                                        earningHeadsMap.set(eh.id, (earningHeadsMap.get(eh.id) || 0) + val);
                                                    });
                                                });

                                                return earningHeads.map((eh) => (
                                                    <td key={`et-${eh.id}`} className='border border-gray-400 p-2 text-right'>
                                                        {Math.round(earningHeadsMap.get(eh.id) || 0).toLocaleString()}
                                                    </td>
                                                ));
                                            })()}

                                            <td className='border border-gray-400 p-2 text-right'>
                                                {Math.round(
                                                    reportData.departmentSalaryDetails.reduce(
                                                        (sum: number, row: any) => sum + (row.grossEarning || 0),
                                                        0
                                                    )
                                                ).toLocaleString()}
                                            </td>

                                            {/* Deduction Totals */}
                                            {(() => {
                                                const deductionHeadsMap = new Map<number, number>();
                                                reportData.departmentSalaryDetails.forEach((row: any) => {
                                                    deductionHeads.forEach((dh) => {
                                                        const val =
                                                            row.deductionresult?.find((d: any) => d.hrmeD_Id === dh.id)?.hresD_Amount || 0;
                                                        deductionHeadsMap.set(dh.id, (deductionHeadsMap.get(dh.id) || 0) + val);
                                                    });
                                                });

                                                return deductionHeads.map((dh) => (
                                                    <td key={`dt-${dh.id}`} className='border border-gray-400 p-2 text-right'>
                                                        {Math.round(deductionHeadsMap.get(dh.id) || 0).toLocaleString()}
                                                    </td>
                                                ));
                                            })()}

                                            <td className='border border-gray-400 p-2 text-right'>
                                                {Math.round(
                                                    reportData.departmentSalaryDetails.reduce(
                                                        (sum: number, row: any) => sum + (row.grossDeduction || 0),
                                                        0
                                                    )
                                                ).toLocaleString()}
                                            </td>
                                            <td className='border border-gray-400 p-2 text-right'>
                                                {Math.round(
                                                    reportData.departmentSalaryDetails.reduce(
                                                        (sum: number, row: any) =>
                                                            sum + (row.netSalary ?? row.grossEarning - row.grossDeduction),
                                                        0
                                                    )
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className='mt-12 flex justify-end'>
                                    <div className='pr-10 text-center'>
                                        <p className='inline-block min-w-[200px] border-gray-800 border-t pt-2 font-bold'>
                                            Signature of Authority
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
