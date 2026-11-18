'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import {
    useEmployeeProfileReport,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { Loader2, Printer, Search } from 'lucide-react';
import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { EmployeeProfileCard } from './_components/employee-profile-card';
import { printEmployeeProfileReport } from './_components/employee-profile-print';

interface FilterFormValues {
    groupType: string[];
    department: string[];
    designation: string[];
    employees: string[];
}

export default function EmployeeProfileReportPage() {
    return (
        <FormProvider>
            <EmployeeProfileReportContent />
        </FormProvider>
    );
}

function EmployeeProfileReportContent() {
    const [reportData, setReportData] = useState<any[] | null>(null);
    const { control, handleSubmit, watch, reset } = useForm<FilterFormValues>({
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            employees: []
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => watchedGroupType.map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => watchedDepartment.map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => watchedDesignation.map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIds.toString());
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    // const { data: employeesData } = useReportEmployeesByDeptAndDesignation(deptIds.toString(), desigIds.toString());
    const { data: employeesData, isLoading: isLoadingEmployees } = useReportEmployeesByGroupTypeDeptAndDesignation(
        groupTypeIds,
        deptIds,
        desigIds
    );
    console.log('employeesData', employeesData);
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
                const id = emp.hrmE_Id || emp.id;
                if (!id) return null;

                return {
                    id: Number(id),
                    employeeName: emp.employeeFullName || 'Unknown Employee',
                    employeeCode: id.toString()
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    const { mutateAsync: fetchEmployeeProfileReport } = useEmployeeProfileReport();
    const [isPending, setIsPending] = useState(false);

    const onSubmit = async (data: FilterFormValues) => {
        if (data.department.length === 0 || data.designation.length === 0 || data.employees.length === 0) {
            toast.error('Please select Department, Designation, and Employees');
            return;
        }

        const payload = {
            hrmE_IdList: data.employees.map(Number)
        };
        console.log('Payload:', payload);

        setIsPending(true);

        try {
            const response = await fetchEmployeeProfileReport(payload);
            console.log('Fetch Employee Profile Report API Response:', response);

            const responseData = response?.data as any;

            let finalData: any[] = [];

            if (responseData && responseData.employeeReports) {
                // Map the new response structure
                const { institutionName, institutionAddress, institutionPincode, employeeReports } = responseData;

                finalData = employeeReports.map((report: any) => ({
                    ...report,
                    institutionName,
                    institutionAddress,
                    institutionPincode
                }));
            } else if (responseData && Array.isArray(responseData)) {
                finalData = responseData;
            } else if (responseData && responseData.employeeDetails) {
                finalData = Array.isArray(responseData.employeeDetails) ? responseData.employeeDetails : [responseData.employeeDetails];
            } else if (response && response.data) {
                finalData = Array.isArray(response.data) ? response.data : [response.data];
            }

            if (finalData.length === 0) {
                toast.info('No data found for selected criteria');
            } else {
                setReportData(finalData);
                toast.success('Report generated successfully');
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
        printEmployeeProfileReport(reportData);
    };

    const resetHandler = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            employees: []
        });
        setReportData(null);
    };

    return (
        <div className='container min-h-screen space-y-4 p-2'>
            {/* <div className='flex items-center justify-between'>
                <h2 className='font-bold text-2xl tracking-tight'>Employee Profile Report</h2>
            </div> */}

            <CollapsibleSection defaultOpen={true} title='Report Criteria' variant='outline' className='shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
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
                                        placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                                        disabled={isLoadingGroupTypes}
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
                                        placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                        disabled={isLoadingDepartments || watchedGroupType?.length === 0}
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
                                        placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                        disabled={isLoadingDesignations || watchedDepartment?.length === 0}
                                    />
                                )}
                            />
                        </div>

                        {/* Employees */}
                        <div className='space-y-2'>
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
                                        placeholder={isLoadingEmployees ? 'Loading...' : 'Select Employees'}
                                        disabled={isLoadingEmployees || watchedDesignation?.length === 0}
                                    />
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

            {/* ... other imports ... */}

            {reportData && reportData?.length > 0 && (
                <CollapsibleSection
                    title='Report Details'
                    defaultOpen={true}
                    className='border shadow-md'
                    rightElement={
                        <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={handlePrint} className='gap-2'>
                                <Printer className='h-4 w-4' />
                                Print
                            </Button>
                        </div>
                    }>
                    <div className='h-[700px] w-full overflow-y-auto p-4 print:p-0'>
                        {reportData.length > 0 && (
                            <div className='mb-6 border-b pb-4 text-center print:mb-8 print:border-gray-800 print:border-b-2'>
                                <h2 className='font-bold text-primary text-xl uppercase print:text-black'>
                                    {reportData[0].institutionName || 'Institution Name'}
                                </h2>
                                {reportData[0].institutionAddress && <h4 className='mt-1 text-sm'>{reportData[0].institutionAddress}</h4>}
                                {reportData[0].institutionPincode && (
                                    <h4 className='mt-1 text-sm'>PIN: {reportData[0].institutionPincode}</h4>
                                )}
                                <h5 className='mt-2 font-semibold text-md uppercase'>Employee Profile Report</h5>
                            </div>
                        )}
                        {reportData.length > 0 && reportData.map((profile, index) => <EmployeeProfileCard key={index} profile={profile} />)}
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
