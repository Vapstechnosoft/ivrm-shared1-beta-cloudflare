'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown, useMasterLeaveDropdown } from '@/hooks/hrms/useMasters';
import {
    useLeaveStatusReport,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { Download, Loader2, Printer, Search } from 'lucide-react';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { columns } from './_components/columns';
import { exportLeaveStatusReport } from './_components/leave-status-export';
import { printLeaveStatusReport } from './_components/leave-status-print';
interface FilterFormValues {
    year: string;
    groupType: string[];
    department: string[];
    designation: string[];
    employees: string[];
    leaves: string[];
}

export default function LeaveStatusReportPage() {
    return (
        <FormProvider>
            <LeaveStatusReportContent />
        </FormProvider>
    );
}

function LeaveStatusReportContent() {
    const [reportData, setReportData] = useState<any>(null);
    const { control, handleSubmit, watch, reset } = useForm<FilterFormValues>({
        defaultValues: {
            year: '',
            groupType: [],
            department: [],
            designation: [],
            employees: [],
            leaves: []
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedYear = watch('year');

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => watchedGroupType.map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const { data: yearsData, isLoading: yearsLoading } = useLeaveYearDropdown();
    const { data: leavesData, isLoading: leavesLoading } = useMasterLeaveDropdown();
    const { data: groupTypesData, isLoading: groupTypesLoading } = useReportGroupTypes();
    const { data: departmentsData, isLoading: departmentsLoading } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData, isLoading: designationsLoading } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const { data: employeesData, isLoading: employeesLoading } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIds,
        deptIds,
        desigIds
    );
    console.log('employeesData', employeesData);
    console.log("leavesData",leavesData);
    // Transforms
    const leavesDataTransformed = useMemo(() => {
    const list = Array.isArray(leavesData?.data)
        ? leavesData.data
        : [];

    return list
        .map((lv: any) => ({
            id: lv.key,
            name: lv.value
        }))
        .filter((lv: any) => lv.id != null);
    }, [leavesData]);

    // Transforms
    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.HRME_Id || emp.hrmE_Id || emp.id || emp.key;
                if (id == null) return null;

                const firstName = (emp.HRME_EmployeeFirstName || emp.hrmE_EmployeeFirstName || '').trim();
                const middleName = (emp.HRME_EmployeeMiddleName || emp.hrmE_EmployeeMiddleName || '').trim();
                const lastName = (emp.HRME_EmployeeLastName || emp.hrmE_EmployeeLastName || '').trim();

                const employeeName =
                    [firstName, middleName, lastName].filter(Boolean).join(' ') || emp.value || emp.employeeName || 'Unknown Employee';

                const employeeCode = emp.HRME_EmployeeCode || emp.hrmE_EmployeeCode || emp.employeeCode || id.toString();

                return {
                    id: Number(id),
                    employeeName: emp.employeeFullName || 'Unknown Employee',
                    employeeCode: emp.hrmE_EmployeeCode || id.toString()
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    console.log('employeesDataTransformed', employeesDataTransformed);

    const { mutateAsync: fetchLeaveStatusReport } = useLeaveStatusReport();
    const [isPending, setIsPending] = useState(false);

    const onSubmit = async (data: FilterFormValues) => {
        if (
            !data.year ||
            data.department.length === 0 ||
            data.designation.length === 0 ||
            data.employees.length === 0 ||
            data.leaves.length === 0
        ) {
            toast.error('Please select Year, Department, Designation, Employees, and Leaves');
            return;
        }
        console.log('data', data);
        const payload = {
            hrmlY_Id: data.year,
            hrme_Ids: data.employees.join(','),
            hrml_Ids: Array.isArray(data.leaves) ? data.leaves.join(',') : data.leaves
        };

        setIsPending(true);

        try {
            const response = await fetchLeaveStatusReport(payload);
            console.log('response', response);
            if (response.success && response.data) {
                console.log('response.data', response.data);
                const list = Array.isArray(response.data)
                    ? response.data
                    : response.data.get_leave_status_report ||
                      response.data.gridData ||
                      response.data.leave_status_list ||
                      response.data.filldata ||
                      response.data.reportData ||
                      [];
                if (list.length === 0) {
                    setReportData([]);
                    toast.info('No data found for selected criteria');
                } else {
                    setReportData(list);
                    toast.success('Report generated successfully');
                }
            } else {
                setReportData([]);
            }
        } catch (error) {
            console.error('Submit Error:', error);
            setReportData([]);
        } finally {
            setIsPending(false);
        }
    };

    const handlePrint = () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to print');
            return;
        }
        printLeaveStatusReport(reportData);
    };

    const handleExport = () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const success = exportLeaveStatusReport(reportData);
        if (success) {
            toast.success('Report exported successfully');
        } else {
            toast.error('Failed to export report');
        }
    };

    const resetHandler = () => {
        reset({
            year: '',
            groupType: [],
            department: [],
            designation: [],
            employees: [],
            leaves: []
        });
        setReportData(null);
    };

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Leave Status Report</h2>
            </div>

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                        {/* Group Type */}
                        <div className='space-y-2'>
                            <Label>
                                Group Type <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='groupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={groupTypesDataTransformed.map((gt: any) => ({
                                            label: gt.name,
                                            value: String(gt.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={groupTypesLoading ? 'Loading Group Types...' : 'Select Group Types'}
                                        className={`${groupTypesLoading ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                )}
                            />
                        </div>

                        {/* Department */}
                        <div className='space-y-2'>
                            <Label>
                                Department <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={departmentsDataTransformed.map((dept: any) => ({
                                            label: dept.name,
                                            value: String(dept.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={departmentsLoading ? 'Loading Departments...' : 'Select Departments'}
                                        className={`${departmentsLoading ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                )}
                            />
                        </div>

                        {/* Designation */}
                        <div className='space-y-2'>
                            <Label>
                                Designation <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={designationsDataTransformed.map((desg: any) => ({
                                            label: desg.name,
                                            value: String(desg.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={designationsLoading ? 'Loading Designations...' : 'Select Designations'}
                                        className={`${designationsLoading ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                )}
                            />
                        </div>

                        {/* Employees */}
                        <div className='space-y-2 '>
                            <Label>
                                Employees <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='employees'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        options={employeesDataTransformed.map((emp: any) => ({
                                            label: `${emp.employeeName} - [${emp.employeeCode}]`,
                                            value: String(emp.id)
                                        }))}
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={employeesLoading ? 'Loading Employees...' : 'Select Employees'}
                                        className={`${employeesLoading ? 'pointer-events-none opacity-50' : ''}`}
                                    />
                                )}
                            />
                        </div>

                        {/* Leaves */}
                        <div className='space-y-2'>
                            <Label>
                                Leaves <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='leaves'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                                        <SelectTrigger
                                            className={!field.value || field.value.length === 0 ? 'font-medium text-muted-foreground' : ''}>
                                            <SelectValue placeholder='Select Leave Types' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {leavesDataTransformed.map((lv: any) => (
                                                <SelectItem key={lv.id} value={String(lv.id)}>
                                                    {lv.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Year */}
                        <div className='space-y-2'>
                            <Label>
                                Year <span className='text-destructive'>*</span>
                            </Label>
                            <Controller
                                name='year'
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} key={field.value ?? 'empty'}>
                                        <SelectTrigger className={!field.value ? 'font-medium text-muted-foreground' : ''}>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearsData?.data?.map((y: any) => (
                                                <SelectItem key={y.hrmlY_Id} value={y.hrmlY_Id.toString()}>
                                                    {y.hrmlY_LeaveYear}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className='flex justify-center gap-4'>
                        <Button type='submit' disabled={isPending} className='w-32'>
                            {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Search className='mr-2 h-4 w-4' />}
                            Generate
                        </Button>
                        <Button
                            type='button'
                            disabled={isPending}
                            className='w-32'
                            variant='outline'
                            onClick={(e) => {
                                e.preventDefault();
                                resetHandler();
                            }}>
                            <X className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {reportData?.length > 0 && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className='border shadow-md'
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handleExport} className='gap-2'>
                                <Download className='h-4 w-4' />
                                Export
                            </Button>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className=' overflow-y-auto print:hidden'>
                        <GenericDataTable
                            data={reportData}
                            columns={columns}
                            totalItems={reportData.length}
                            isPaginationRequired={false}
                            isSearchRequired={false}
                            showSearchColumns={false}
                            isLoading={isPending}
                            
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
