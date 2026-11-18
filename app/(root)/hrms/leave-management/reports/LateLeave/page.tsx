'use client';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLateLeaveReport, useSubmitLateLeave } from '@/hooks/hrms/leave-management/useLateLeave';
import { useLeaveYearDropdown, useMasterLeaveDropdown, useMonthDropdown } from '@/hooks/hrms/useMasters';
import {
    useMasterGroupTypes,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation
} from '@/hooks/hrms/useReports';
import { tableSearchVariables } from '@/lib/data-table.config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Search, Trash2, X } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { type LateLeaveItem, getLateLeaveColumns } from './_components/columns';

const LateLeaveSchema = z.object({
    monthId: z.string({ required_error: 'Leave Month is required' }).min(1, 'Leave Month is required'),
    leaveYear: z.string({ required_error: 'Leave Year is required' }).min(1, 'Leave Year is required'),
    leaveName: z.string({ required_error: 'Leave Name is required' }).min(1, 'Leave Name is required'),
    typeIds: z.array(z.string()).min(1, 'Please select at least one Type').default([]),
    departmentIds: z.array(z.string()).min(1, 'Please select at least one Department').default([]),
    designationIds: z.array(z.string()).min(1, 'Please select at least one Designation').default([]),
    emplist: z.array(z.any()).min(1, 'Please select at least one Employee').default([])
});

type LateLeaveFormValues = z.infer<typeof LateLeaveSchema>;

export default function LateLeavePage() {
    const [editData, setEditData] = useState<LateLeaveItem | null>(null);
    const [editCreditLeaves, setEditCreditLeaves] = useState<string>('');

    // ... Mock data ...
    const [reportData, setReportData] = useState<LateLeaveItem[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<LateLeaveItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [resetkey, setResetKey] = useState(0);

    const [page, setPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize, setPageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const [{ data: lateLeaveResponse, isLoading: isPending, refetch: refetchReport }] = useLateLeaveReport(page, pageSize);
    const { mutateAsync: submitLateLeave, isPending: isPendingSubmit } = useSubmitLateLeave();

    console.log('lateLeaveResponse', lateLeaveResponse);

    // Dropdowns
    const { data: monthData, isLoading: isLoadingMonths } = useMonthDropdown();
    const { data: leaveYearData, isLoading: isLoadingYears } = useLeaveYearDropdown();
    const { data: leaveNameData, isLoading: isLoadingLeaves } = useMasterLeaveDropdown();

    console.log('leaveNameData', leaveNameData);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitted }
    } = useForm<LateLeaveFormValues>({
        resolver: zodResolver(LateLeaveSchema),
        defaultValues: {
            monthId: '',
            leaveYear: '',
            leaveName: '',
            typeIds: [],
            departmentIds: [],
            designationIds: []
        }
    });

    const watchGroupType = watch('typeIds') || [];
    const watchDepartment = watch('departmentIds') || [];
    const watchDesignation = watch('designationIds') || [];

    useEffect(() => {
        const selectedEmps = employees.filter((e) => e.selected);
        setValue('emplist', selectedEmps, { shouldValidate: isSubmitted });
    }, [employees, isSubmitted, setValue]);

    const { data: masterGroupTypes } = useMasterGroupTypes();
    const typesToFetch = watchGroupType.join(',');
    const groupTypeIdsStr = watchGroupType?.join(',') || '0';
    const deptIdsStr = watchDepartment?.join(',') || '0';
    const { data: masterDepartments } = useReportDepartments(typesToFetch);

    const { data: masterDesignations } = useReportDesignations(groupTypeIdsStr, deptIdsStr);

    const { data: employeesData } = useReportEmployeesByGroupTypeDeptAndDesignation(
        watchGroupType.map(Number),
        watchDepartment.map(Number),
        watchDesignation.map(Number)
    );

    useEffect(() => {
        if (employeesData?.data?.employeeNames?.length) {
            setEmployees(
                employeesData.data.employeeNames.map((emp: any) => ({
                    ...emp,
                    selected: false,
                    HRELS_CreditedLeaves: emp.HRELS_CreditedLeaves || '',
                    LeaveDeductionReason: emp.LeaveDeductionReason || ''
                }))
            );
        } else {
            setEmployees([]);
        }
    }, [employeesData]);

    console.log('employeesData', employeesData);

    const groupTypeOptions =
        masterGroupTypes?.data
            ?.map((item: any) => ({
                label: item?.value || item?.hrmgT_EmployeeGroupType || 'Unknown',
                value: (item?.key ?? item?.hrmgT_Id)?.toString() ?? ''
            }))
            .filter((opt: any) => opt.value !== '') || [];

    const departmentsOptions =
        masterDepartments?.data
            ?.map((item: any) => ({
                label: item?.hrmD_DepartmentName || item?.value || 'Unknown',
                value: (item?.hrmD_Id ?? item?.key)?.toString() ?? ''
            }))
            .filter((opt: any) => opt.value !== '') || [];

    const designationsOptions =
        masterDesignations?.data
            ?.map((item: any) => ({
                label: item?.value || item?.hrmdeS_DesignationName || 'Unknown',
                value: (item?.key ?? item?.hrmdeS_Id)?.toString() ?? ''
            }))
            .filter((opt: any) => opt.value !== '') || [];

    const onSubmit = async (data: LateLeaveFormValues) => {
        // Find all selected employees from the local editable state
        console.log('form data', data);
        const selectedEmps = employees.filter((e) => e.selected);

        if (selectedEmps.length === 0) {
            toast.warning('Please select at least one employee.');
            return;
        }

        // Format them perfectly to match the exact properties your API requests
        const formattedEmployees = selectedEmps.map((emp) => ({
            HRME_Id: emp.hrmE_Id || emp.HRME_Id,
            HRELS_CreditedLeaves: Number(emp.HRELS_CreditedLeaves),
            LeaveDeductionReason: emp.LeaveDeductionReason || ''
        }));

        // Attach them to the form payload directly before submission (per your Zod schema logic)
        const payload = {
            HRME_SubstituteFlag: 'LeaveDeduct',
            HRELAP_Id: 0,
            HRML_Id: Number(data.leaveName),
            HRMLY_Id: Number(data.leaveYear),
            monthid: Number(data.monthId),

            // And pass the array of employees
            emplist: formattedEmployees
        };

        console.log('Final payload being saved:', payload);

        try {
            const response = await submitLateLeave(payload);
            if (response?.success && response?.data) {
                toast.success(response?.message);
                setEmployees([]);
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || 'Failed to deduct leave');
            }
        } catch (error: any) {
            toast.error('Error saving deductions: ' + error.message);
        }
    };

    const handleEdit = (item: LateLeaveItem) => {
        console.log('Editing item:', item);
        setEditData(item);
        setEditCreditLeaves(item.hrelaP_TotalDays?.toString() || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (item: LateLeaveItem) => {
        setItemToDelete(item);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        const payload = {
            HRME_SubstituteFlag: 'LeaveDelete',
            HRELAP_Id: itemToDelete.hrelaP_Id, // Send actual ID, not 0
            HRML_Id: itemToDelete.hrmL_Id,
            HRMLY_Id: itemToDelete.hrmlY_Id,
            monthid: itemToDelete.month,

            emplist: [
                {
                    HRME_Id: itemToDelete.hrmE_Id,
                    HRELS_CreditedLeaves: Number(itemToDelete.hrelaP_TotalDays || 0),
                    LeaveDeductionReason: itemToDelete.leaveReason || 'Late Leave Delete'
                }
            ]
        };

        try {
            const response = await submitLateLeave(payload);
            if (response?.success) {
                toast.success('Leave deleted successfully');
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || 'Failed to delete leave');
            }
        } catch (error: any) {
            toast.error('Error deleting leave: ' + error.message);
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleUpdateLateLeave = async () => {
        if (!editData) return;
        if (!editCreditLeaves || isNaN(Number(editCreditLeaves))) {
            toast.warning('Please enter a valid deduction number.');
            return;
        }

        const payload = {
            HRME_SubstituteFlag: 'LeaveDeduct',
            HRELAP_Id: editData.hrelaP_Id, // Send actual ID, not 0
            HRML_Id: editData.hrmL_Id,
            HRMLY_Id: editData.hrmlY_Id,
            monthid: editData.month,

            emplist: [
                {
                    HRME_Id: editData.hrmE_Id,
                    HRELS_CreditedLeaves: Number(editCreditLeaves),
                    LeaveDeductionReason: editData.leaveReason || 'Late Leave Update'
                }
            ]
        };

        try {
            const response = await submitLateLeave(payload);
            if (response?.success) {
                toast.success('Leave deduction updated successfully');
                setEditData(null);
                refetchReport(); // Refresh grid
            } else {
                toast.error(response?.message || 'Failed to update leave');
            }
        } catch (error: any) {
            toast.error('Error updating deduction: ' + error.message);
        }

        setEmployees([]);
        reset({
            monthId: '',
            leaveYear: '',
            leaveName: '',
            typeIds: [],
            departmentIds: [],
            designationIds: []
        });
        setResetKey((prev) => prev + 1);
    };

    const handleReset = () => {
        setEmployees([]);
        reset({
            monthId: '',
            leaveYear: '',
            leaveName: '',
            typeIds: [],
            departmentIds: [],
            designationIds: []
        });
        setResetKey((prev) => prev + 1);
    };

    // Automatically load data when API returns
    useEffect(() => {
        if (lateLeaveResponse?.success && lateLeaveResponse?.data) {
            const items = Array.isArray(lateLeaveResponse.data)
                ? lateLeaveResponse.data
                : lateLeaveResponse.data.data
                  ? lateLeaveResponse.data.data
                  : [];
            setReportData(items);
        }
    }, [lateLeaveResponse]);

    return (
        <div className='container min-h-screen space-y-4 p-2 pt-4 md:p-4'>
            {editData && (
                <CollapsibleSection title='LEAVE UPDATE' defaultOpen={true} className='mt-6'>
                    <div className='relative z-0 mt-4 overflow-x-auto rounded-md bg-white p-4 shadow ring-1 ring-black ring-opacity-5'>
                        <table className='w-full rounded-md border text-center text-sm'>
                            <thead className='bg-violet-600 text-white'>
                                <tr>
                                    <th className='border p-3'>Sno</th>
                                    <th className='border p-3'>LEAVE MONTH</th>
                                    <th className='border p-3'>LEAVE YEAR</th>
                                    <th className='border p-3 text-left'>EMPLOYEE NAME</th>
                                    <th className='border p-3'>LEAVE NAME</th>
                                    <th className='border p-3'>LEAVE BALANCE</th>
                                    <th className='border p-3'>LEAVE DEDUCTED</th>
                                    <th className='w-48 border p-3'>UPDATE LATE LEAVE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='border-b'>
                                    <td className='border p-3'>1</td>
                                    <td className='border p-3'>{editData.monthname}</td>
                                    <td className='border p-3'>{editData.year}</td>
                                    <td className='border p-3 text-left font-medium'>{editData.employeeName}</td>
                                    <td className='border p-3'>{editData.leaveName}</td>
                                    <td className='border p-3'>{editData.hrelS_CBLeaves}</td>
                                    <td className='border p-3'>{editData.hrelaP_TotalDays}</td>
                                    <td className='border p-3'>
                                        <input
                                            type='number'
                                            value={editCreditLeaves}
                                            onChange={(e) => setEditCreditLeaves(e.target.value)}
                                            step='1'
                                            className='w-full rounded border border-fuchsia-600 p-1.5 focus:outline-none focus:ring-1 focus:ring-fuchsia-600'
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div className='mt-2 flex justify-center gap-4 rounded-md bg-white py-4'>
                            <Button
                                type='button'
                                onClick={handleUpdateLateLeave}
                                className='min-w-[140px] bg-violet-600 transition-all hover:bg-violet-700 hover:shadow-xl'
                                disabled={isPendingSubmit}>
                                {isPendingSubmit ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                                {isPendingSubmit ? 'Updating...' : 'Update'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='min-w-[140px] border-slate-300 transition-colors hover:bg-slate-100'
                                onClick={() => {
                                    setEditData(null);
                                    handleReset();
                                }}>
                                <X className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>
            )}

            {!editData && (
                <CollapsibleSection title='LATE LEAVE' description='Manage and view late leave transfer details.' defaultOpen={true}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='flex flex-col gap-6 rounded-xl border border-slate-200 p-6'>
                            {/* FIRST ROW: Group Type, Department, Designation */}
                            <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-3'>
                                {/* Type */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Type
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='typeIds'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={groupTypeOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Select Group Types'
                                            />
                                        )}
                                    />
                                    {errors.typeIds && <FormError>{errors.typeIds.message}</FormError>}
                                </div>

                                {/* Department */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Department
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='departmentIds'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={departmentsOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Select Departments'
                                            />
                                        )}
                                    />
                                    {errors.departmentIds && <FormError>{errors.departmentIds.message}</FormError>}
                                </div>

                                {/* Designation */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Designation
                                        <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='designationIds'
                                        control={control}
                                        render={({ field }) => (
                                            <MultiSelect
                                                options={designationsOptions}
                                                defaultValue={field.value}
                                                onValueChange={field.onChange}
                                                placeholder='Select Designations'
                                            />
                                        )}
                                    />
                                    {errors.designationIds && <FormError>{errors.designationIds.message}</FormError>}
                                </div>
                            </div>

                            {/* SECOND ROW: Month, Year, Leave Name */}
                            <div className='grid w-full grid-cols-1 gap-6 border-slate-100 border-t pt-4 md:grid-cols-3'>
                                {/* Leave Month */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Leave Month <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='monthId'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ''}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingMonths}>
                                                <SelectTrigger>
                                                    {isLoadingMonths
                                                        ? 'Loading...'
                                                        : field.value
                                                          ? monthData?.data?.find((y: any) => (y?.key ?? y?.id)?.toString() === field.value)
                                                                ?.value
                                                          : 'Select Month'}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {monthData?.data?.map((m: any) => {
                                                        const mId = (m?.key ?? m?.id)?.toString();
                                                        if (!mId) return null;
                                                        return (
                                                            <SelectItem key={mId} value={mId}>
                                                                {m.value}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.monthId && <FormError>{errors.monthId.message}</FormError>}
                                </div>

                                {/* Leave Year */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Leave Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='leaveYear'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ''}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingYears}>
                                                <SelectTrigger>
                                                    {isLoadingYears
                                                        ? 'Loading...'
                                                        : field.value
                                                          ? leaveYearData?.data?.find((y: any) => y?.hrmlY_Id?.toString() === field.value)
                                                                ?.hrmlY_LeaveYear
                                                          : 'Select Leave Year'}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveYearData?.data?.map((y: any) => {
                                                        const yId = y?.hrmlY_Id?.toString();
                                                        if (!yId) return null;
                                                        return (
                                                            <SelectItem key={yId} value={yId}>
                                                                {y.hrmlY_LeaveYear}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.leaveYear && <FormError>{errors.leaveYear.message}</FormError>}
                                </div>

                                {/* Leave Name */}
                                <div className='space-y-2'>
                                    <Label className='block font-semibold text-slate-700'>
                                        Leave Name <span className='text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        key={resetkey}
                                        name='leaveName'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                value={field.value ?? ''}
                                                onValueChange={(value) => field.onChange(value)}
                                                disabled={isLoadingLeaves}>
                                                <SelectTrigger>
                                                    {isLoadingLeaves
                                                        ? 'Loading...'
                                                        : field.value
                                                          ? (() => {
                                                                const selected = leaveNameData?.data?.find(
                                                                    (l: any) => (l?.key ?? l?.hrmL_Id)?.toString() === field.value
                                                                );
                                                                return selected
                                                                    ? (selected?.value ?? selected?.hrmL_LeaveName)
                                                                    : 'Select Leave Name';
                                                            })()
                                                          : 'Select Leave Name'}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {leaveNameData?.data?.map((l: any) => {
                                                        const lId = (l?.key ?? l?.hrmL_Id)?.toString();
                                                        if (!lId) return null;
                                                        return (
                                                            <SelectItem key={lId} value={lId}>
                                                                {l?.value ?? l?.hrmL_LeaveName}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.leaveName && <FormError>{errors.leaveName.message}</FormError>}
                                </div>
                            </div>
                        </div>

                        {employees.length > 0 && (
                            <div className='mt-8 space-y-4'>
                                <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                                    <h4 className='font-semibold text-slate-700'>Select Employees for Deduction</h4>
                                    <div className='relative w-full sm:w-72'>
                                        <Search className='absolute top-[10px] left-3 h-4 w-4 text-slate-500' />
                                        <Input
                                            placeholder='Search employee...'
                                            className='bg-white pl-9'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {employees.every((emp: any) => !emp.selected) && errors.emplist && (
                                    <FormError>{errors.emplist.message}</FormError>
                                )}

                                <div className='rounded-md border border-slate-200 [&>div]:max-h-[400px] [&>div]:overflow-y-auto'>
                                    <Table>
                                        <TableHeader className='sticky top-0 z-10 border-b bg-slate-50 shadow-sm'>
                                            <TableRow>
                                                <TableHead className='w-12 text-center'>
                                                    <input
                                                        type='checkbox'
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setEmployees(
                                                                employees.map((emp) => {
                                                                    if (
                                                                        !searchQuery ||
                                                                        emp.employeeFullName
                                                                            ?.toLowerCase()
                                                                            .includes(searchQuery.toLowerCase())
                                                                    ) {
                                                                        return { ...emp, selected: checked };
                                                                    }
                                                                    return emp;
                                                                })
                                                            );
                                                        }}
                                                        checked={
                                                            employees.length > 0 &&
                                                            employees.some(
                                                                (emp) =>
                                                                    !searchQuery ||
                                                                    emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())
                                                            ) &&
                                                            employees
                                                                .filter(
                                                                    (emp) =>
                                                                        !searchQuery ||
                                                                        emp.employeeFullName
                                                                            ?.toLowerCase()
                                                                            .includes(searchQuery.toLowerCase())
                                                                )
                                                                .every((e) => e.selected)
                                                        }
                                                        className='rounded border-gray-300'
                                                    />
                                                </TableHead>
                                                <TableHead className='whitespace-nowrap font-semibold text-slate-700'>
                                                    Employee Name
                                                </TableHead>
                                                <TableHead className='whitespace-nowrap font-semibold text-slate-700'>
                                                    Leave Deduction Count
                                                </TableHead>
                                                <TableHead className='hidden whitespace-nowrap font-semibold text-slate-700 md:table-cell'>
                                                    Leave Deduction Reason
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {employees.map((emp: any, index: number) => {
                                                if (
                                                    searchQuery &&
                                                    !emp.employeeFullName?.toLowerCase().includes(searchQuery.toLowerCase())
                                                ) {
                                                    return null;
                                                }
                                                return (
                                                    <TableRow key={index} className='hover:bg-slate-50'>
                                                        <TableCell className='text-center'>
                                                            <input
                                                                type='checkbox'
                                                                checked={emp.selected || false}
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].selected = e.target.checked;
                                                                    setEmployees(fresh);
                                                                }}
                                                                className='rounded border-gray-300'
                                                            />
                                                        </TableCell>
                                                        <TableCell className='w-6'>{emp.employeeFullName}</TableCell>
                                                        <TableCell className='w-[150px]'>
                                                            <input
                                                                type='number'
                                                                min=''
                                                                step='1'
                                                                className='w-full rounded border p-1.5 focus:ring-1 focus:ring-blue-500'
                                                                value={emp.HRELS_CreditedLeaves || ''}
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].HRELS_CreditedLeaves = e.target.value;
                                                                    setEmployees(fresh);
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell className='hidden w-[300px] md:table-cell'>
                                                            <input
                                                                type='text'
                                                                className='w-full rounded border p-1.5 focus:ring-1 focus:ring-blue-500'
                                                                value={emp.LeaveDeductionReason || ''}
                                                                placeholder='Reason...'
                                                                onChange={(e) => {
                                                                    const fresh = [...employees];
                                                                    fresh[index].LeaveDeductionReason = e.target.value;
                                                                    setEmployees(fresh);
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}

                        <div className='flex justify-center gap-4 py-2'>
                            <Button
                                type='submit'
                                className='min-w-[140px] bg-violet-600 shadow-lg transition-all hover:bg-violet-700'
                                disabled={isPendingSubmit}>
                                {isPendingSubmit ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Save className='mr-2 h-4 w-4' />}
                                {isPendingSubmit ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='min-w-[140px] transition-colors hover:bg-slate-100'
                                onClick={() => {
                                    handleReset();
                                }}>
                                <X className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
            )}

            {/* {editData && (
                <div className="flex gap-4 justify-center py-4 bg-white shadow-sm rounded-md border border-slate-200 mt-2">
                    <Button type="button" onClick={handleUpdateLateLeave} className="min-w-[140px] shadow-lg hover:shadow-xl transition-all bg-[#4a5fe0] hover:bg-blue-700" disabled={isPendingSubmit} >
                        {isPendingSubmit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isPendingSubmit ? "Updating..." : "Update"}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="min-w-[140px] hover:bg-slate-100 transition-colors border-slate-300"
                        onClick={() => { 
                            setEditData(null); 
                            handleReset(); 
                        }}
                    >
                        <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                </div>
            )} */}

            {
                reportData.length > 0 && (
                    <CollapsibleSection title='Leave Transfer Report' defaultOpen={true} className='mt-6 shadow-sm'>
                        <div className='relative z-0 mt-4 rounded-md bg-white p-4 shadow ring-1 ring-black ring-opacity-5'>
                            <DataTable
                                columns={getLateLeaveColumns(handleEdit, handleDelete, page, pageSize)}
                                data={reportData}
                                totalItems={lateLeaveResponse?.total || reportData.length}
                                showViewOptions={false}
                                isPaginationRequired={true}
                                isLoading={isPending}
                            />
                        </div>
                    </CollapsibleSection>
                )
                // ) :
                //     <div className="flex items-center flex-col justify-center h-64">
                //         <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                //         <span className="ml-2 text-slate-500">Loading applied leave report...</span>
                //     </div>
            }
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && itemToDelete && (
                <div className='fade-in fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300'>
                    <div className='slide-in-from-bottom-4 mx-4 w-full max-w-lg animate-in rounded-xl border border-slate-200 bg-white p-6 shadow-2xl duration-300'>
                        <div className='flex flex-col items-center space-y-4 text-center'>
                            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
                                <Trash2 className='h-6 w-6 text-red-600' />
                            </div>
                            <h2 className='font-bold text-slate-900 text-xl'>Confirm Deletion</h2>
                            <p className='text-slate-500'>
                                Are you sure you want to delete the deduction for{' '}
                                <span className='font-semibold text-slate-800'>{itemToDelete.employeeName}</span>?
                                <br />
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className='mt-8 flex gap-3'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setItemToDelete(null);
                                }}
                                className='h-11 flex-1 rounded-lg border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'>
                                Cancel
                            </Button>
                            <Button
                                type='button'
                                onClick={handleConfirmDelete}
                                className='h-11 flex-1 rounded-lg bg-red-600 text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-[0.98]'>
                                {isPendingSubmit ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
