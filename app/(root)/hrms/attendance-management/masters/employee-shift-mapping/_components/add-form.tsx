'use client';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useEmployeeShiftMapping,
    useEmployeeShiftMappingHolidayTypes,
    useEmployeeShiftMappingShiftDetails,
    useEmployeeShiftMappingShiftNamesList,
    useShiftSettingMaster
} from '@/hooks/hrms/attendance-management/useMasters';
import {
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { hrmsMasterSchemas } from '@/schemas/hrms/masters';
import { addOrUpdateEmployeeShiftMapping } from '@/server/hrms/attendance-management/masters/employee-shift-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useId, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { ShiftTimingFields } from '../../_components/shift-timing-fields';

type FormFields = z.infer<typeof hrmsMasterSchemas.employeeShiftMapping.add>;

interface AddEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
}

export default function AddEmployeeShiftMappingForm({ onSuccess, className = '' }: AddEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();
    // Data Hooks from Reports
    const { data: groupTypesData } = useReportGroupTypes();

    // Fetch shift master data from API to get fomS_Id
    const { data: shiftMasterData } = useShiftSettingMaster();
    const shiftMasterList = useMemo(() => {
        // Handle both array response and object with report_list
        if (!shiftMasterData?.data) return [];
        if (Array.isArray(shiftMasterData.data)) {
            return shiftMasterData.data;
        }
        // Type assertion for object with report_list property
        const dataWithReportList = shiftMasterData.data as { report_list?: any[] };
        return dataWithReportList?.report_list || [];
    }, [shiftMasterData]);

    // Fetch holiday types
    const { data: holidayTypesData } = useEmployeeShiftMappingHolidayTypes();

    // Fetch shift names list
    const { data: shiftNamesListData } = useEmployeeShiftMappingShiftNamesList();

    // Generate unique IDs for form fields
    const typeId = useId();
    const departmentId = useId();
    const designationId = useId();
    const dayTypeId = useId();
    const shiftNameId = useId();
    const applicableDateId = useId();
    const employeesId = useId();

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.employeeShiftMapping.add),
        defaultValues: {
            foest_GroupType: '',
            foest_Department: '',
            foest_Designation: '',
            foest_Employee: '',
            foest_HolidayType: '',
            foest_ShiftName: '',
            foest_ApplicableDate: '',
            foest_TotalWork: '',
            foest_HalfDayWork: '04:00',
            foest_MorningLogin: '09:30',
            foest_MorningLogout: '13:00',
            foest_AfternoonLogin: '13:30',
            foest_AfternoonLogout: '17:00',
            foest_DelayShift: '',
            foest_EarlyShift: '',
            foest_LunchHour: '00:30'
        },
        mode: 'onChange'
    });

    const watchedGroupType = watch('foest_GroupType');
    const watchedDepartment = watch('foest_Department');
    const watchedDesignation = watch('foest_Designation');

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(
        () => (watchedGroupType ? watchedGroupType.split(', ').map(Number).filter(Boolean) : []),
        [watchedGroupType]
    );
    const deptIds = useMemo(
        () => (watchedDepartment ? watchedDepartment.split(', ').map(Number).filter(Boolean) : []),
        [watchedDepartment]
    );
    const desigIds = useMemo(
        () => (watchedDesignation ? watchedDesignation.split(', ').map(Number).filter(Boolean) : []),
        [watchedDesignation]
    );

    // Fetch departments when group type is selected
    const { data: departmentsData } = useReportDepartments(groupTypeIds.toString());

    // Fetch designations when departments are selected
    const { data: designationsData } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());

    // Fetch employees when group types, departments, or designations are selected
    const { data: employeesData } = useReportEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds);

    const selectedShiftName = watch('foest_ShiftName');

    // Prepare shift name options from API
    const shiftOptions = useMemo(() => {
        if (!shiftNamesListData?.data || !Array.isArray(shiftNamesListData.data)) return [];
        const uniqueShifts = new Map();
        shiftNamesListData.data.forEach((item: any) => {
            if (item.fomS_Id && !uniqueShifts.has(item.fomS_Id)) {
                uniqueShifts.set(item.fomS_Id, {
                    label: item.fomS_ShiftName || '',
                    value: String(item.fomS_Id),
                    id: item.fomS_Id
                });
            }
        });
        return Array.from(uniqueShifts.values()).filter((option: any) => option.value && option.value !== '0' && option.label);
    }, [shiftNamesListData]);

    // Get the selected shift's ID
    const selectedShiftId = useMemo(() => {
        if (selectedShiftName) {
            const selectedShift = shiftOptions.find((shift: { value: string; id?: number }) => shift.value === selectedShiftName);
            return selectedShift?.id || 0;
        }
        return 0;
    }, [selectedShiftName, shiftOptions]);

    // Fetch shift details when a shift is selected
    const { data: shiftDetailsData, isLoading: isLoadingShiftDetails } = useEmployeeShiftMappingShiftDetails(
        selectedShiftId > 0 ? selectedShiftId : undefined
    );

    // When shift is selected, populate timing fields from API response
    useEffect(() => {
        if (selectedShiftId > 0 && shiftDetailsData?.data) {
            // Handle both array and object responses
            const shiftDetails = Array.isArray(shiftDetailsData.data) ? shiftDetailsData.data[0] : shiftDetailsData.data;

            if (shiftDetails) {
                const shiftStartTime =
                    shiftDetails.FOMST_IHalfLoginTime ||
                    shiftDetails.IHalfLoginTime ||
                    shiftDetails.shiftStartTime ||
                    shiftDetails.startTime ||
                    '';
                const shiftEndTime =
                    shiftDetails.FOMST_IIHalfLogoutTime ||
                    shiftDetails.IIHalfLogoutTime ||
                    shiftDetails.shiftEndTime ||
                    shiftDetails.endTime ||
                    '';
                const lunchStartTime =
                    shiftDetails.FOMST_IHalfLogoutTime || shiftDetails.IHalfLogoutTime || shiftDetails.lunchStartTime || '';
                const lunchEndTime = shiftDetails.FOMST_IIHalfLoginTime || shiftDetails.IIHalfLoginTime || shiftDetails.lunchEndTime || '';
                const totalWorkingHours = shiftDetails.FOMST_FDWHrMin || shiftDetails.FDWHrMin || shiftDetails.totalWorkingHours || '';
                const halfDayWorkingHours = shiftDetails.FOMST_HDWHrMin || shiftDetails.HDWHrMin || shiftDetails.halfDayWorkingHours || '';
                const delayPerShift =
                    shiftDetails.FOMST_DelayPerShiftHrMin || shiftDetails.DelayPerShiftHrMin || shiftDetails.delayPerShift || '';
                const earlyPerShift =
                    shiftDetails.FOMST_EarlyPerShiftHrMin || shiftDetails.EarlyPerShiftHrMin || shiftDetails.earlyPerShift || '';
                const lunchHours =
                    shiftDetails.FOMST_LunchHoursDuration || shiftDetails.LunchHoursDuration || shiftDetails.lunchHours || '';
                const cleanTime = (time: string) => (time ? String(time).trim() : '');
                if (shiftStartTime) setValue('foest_MorningLogin', cleanTime(shiftStartTime));
                if (shiftEndTime) setValue('foest_AfternoonLogout', cleanTime(shiftEndTime));
                if (lunchStartTime) setValue('foest_MorningLogout', cleanTime(lunchStartTime));
                if (lunchEndTime) setValue('foest_AfternoonLogin', cleanTime(lunchEndTime));
                if (totalWorkingHours) setValue('foest_TotalWork', cleanTime(totalWorkingHours));
                if (halfDayWorkingHours) setValue('foest_HalfDayWork', cleanTime(halfDayWorkingHours));
                if (delayPerShift) setValue('foest_DelayShift', cleanTime(delayPerShift));
                if (earlyPerShift) setValue('foest_EarlyShift', cleanTime(earlyPerShift));
                if (lunchHours) setValue('foest_LunchHour', cleanTime(lunchHours));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedShiftId, shiftDetailsData, isLoadingShiftDetails]);

    // Helper function to remove duplicates by value
    const removeDuplicateOptions = (options: Array<{ label: string; value: string }>) => {
        const seen = new Set<string>();
        return options.filter((option) => {
            if (seen.has(option.value)) {
                return false;
            }
            seen.add(option.value);
            return true;
        });
    };

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
        const list = departmentsData?.data || departmentsData || [];
        if (!Array.isArray(list)) return [];
        return list
            .map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            }))
            .filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        const list = designationsData?.data || designationsData || [];
        if (!Array.isArray(list)) return [];
        return list
            .map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            }))
            .filter((d: any) => d.id != null);
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

    // Prepare holiday type options for Day Type dropdown
    const dayTypeOptions = React.useMemo(() => {
        if (!holidayTypesData?.data || !Array.isArray(holidayTypesData.data)) return [];
        return holidayTypesData.data
            .map((item: any) => ({
                label: item.Value || item.value || '',
                value: String(item.Key || item.key || ''),
                id: item.Key || item.key || 0
            }))
            .filter((option: { value: string; label: any }) => option.value && option.value !== '' && option.value !== '0' && option.label); // Filter out empty or invalid values
    }, [holidayTypesData]);
    const shiftNames = useMemo(() => {
        return shiftOptions.map((shift: { label: string; value: string; id?: number }) => ({
            label: shift.label,
            value: shift.value,
            id: shift.id
        }));
    }, [shiftOptions]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            // Get shift master ID from selected shift name (which is now the key/ID)
            const fomS_Id = data.foest_ShiftName ? Number.parseInt(data.foest_ShiftName, 10) : 0;

            // Convert employee strings to IDs from dropdown data
            const employeeIds = (data.foest_Employee?.split(', ') || [])
                .map((empString) => {
                    const parsed = Number.parseInt(empString, 10);
                    if (!Number.isNaN(parsed) && parsed > 0) {
                        return parsed;
                    }
                    // Find in options
                    const found = employeesDataTransformed.find((emp: any) => {
                        const empId = String(emp.id || '');
                        const empLabel = String(emp.employeeName || '').toLowerCase();
                        const searchValue = empString.toLowerCase().trim();
                        return empId === empString || empLabel === searchValue;
                    });
                    return found?.id || 0;
                })
                .filter((id) => id > 0);

            // Get day type IDs from selected values (Day Type field - can be multiple)
            const dayTypeIds = (data.foest_HolidayType ? data.foest_HolidayType.split(', ') : [])
                .map((idStr) => {
                    const id = Number.parseInt(idStr.trim(), 10);
                    return id > 0 ? id : null;
                })
                .filter((id): id is number => id !== null);

            // Get group type IDs from selected values (Type field - can be multiple)
            const groupTypeIds = (data.foest_GroupType ? data.foest_GroupType.split(', ') : [])
                .map((idStr) => {
                    const id = Number.parseInt(idStr.trim(), 10);
                    return id > 0 ? id : null;
                })
                .filter((id): id is number => id !== null);

            // Get department IDs from selected values (Department field - can be multiple)
            const departmentIds = (data.foest_Department ? data.foest_Department.split(', ') : [])
                .map((idStr) => {
                    const id = Number.parseInt(idStr.trim(), 10);
                    return id > 0 ? id : null;
                })
                .filter((id): id is number => id !== null);

            // Get designation IDs from selected values (Designation field - can be multiple)
            const designationIds = (data.foest_Designation ? data.foest_Designation.split(', ') : [])
                .map((idStr) => {
                    const id = Number.parseInt(idStr.trim(), 10);
                    return id > 0 ? id : null;
                })
                .filter((id): id is number => id !== null);

            // Get shift name label for display
            const selectedShift = shiftNames.find((shift: { value: string; label: string }) => shift.value === data.foest_ShiftName);
            const shiftNameLabel = selectedShift?.label || '';

            // Payload structure matching API requirements
            // POST /api/EmployeeShiftMapping/add_or_update_employee_shift
            const payload = {
                foesT_Id: 0,
                hrmE_Id: 0, // 0 for bulk mapping
                fohwdT_Id: 0, // 0 for bulk mapping
                fomS_Id: fomS_Id,
                foesT_FDWHrMin: data.foest_TotalWork || '00:00',
                foesT_HDWHrMin: data.foest_HalfDayWork || '00:00',
                foesT_IHalfLoginTime: data.foest_MorningLogin || '00:00',
                foesT_IHalfLogoutTime: data.foest_MorningLogout || '00:00',
                foesT_IIHalfLoginTime: data.foest_AfternoonLogin || '00:00',
                foesT_IIHalfLogoutTime: data.foest_AfternoonLogout || '00:00',
                foesT_DelayPerShiftHrMin: data.foest_DelayShift || '00:00',
                foesT_EarlyPerShiftHrMin: data.foest_EarlyShift || '00:00',
                foesT_LunchHoursDuration: data.foest_LunchHour || '00:00',
                foesT_BlockAttendance: 'true',
                foesT_FixTimings: 'true',
                FOEST_BlockAttendance: 'true', // Dual casing for robustness
                FOEST_FixTimings: 'true', // Dual casing for robustness
                foesT_Date: data.foest_ApplicableDate ? new Date(data.foest_ApplicableDate).toISOString() : new Date().toISOString(),
                hrmE_Ids: employeeIds,
                fohwdT_Ids: dayTypeIds
            };

            const response = await addOrUpdateEmployeeShiftMapping(payload);

            if (response?.success) {
                toast.success(response?.message || 'Employee shift mapping saved successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to save employee shift mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save employee shift mapping');
        }
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* Type, Department, Designation Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='space-y-2'>
                            <Label htmlFor={typeId}>
                                Group Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_GroupType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={typeId}
                                        options={groupTypesDataTransformed.map((gt: any) => ({
                                            label: gt.name,
                                            value: String(gt.id)
                                        }))}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Group Types'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_GroupType && <FormError>{errors.foest_GroupType.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor={departmentId}>
                                Department <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_Department'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={departmentId}
                                        options={departmentsDataTransformed.map((dept: any) => ({
                                            label: dept.name,
                                            value: String(dept.id)
                                        }))}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Departments'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_Department && <FormError>{errors.foest_Department.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor={designationId}>
                                Designation <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_Designation'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={designationId}
                                        options={designationsDataTransformed.map((desg: any) => ({
                                            label: desg.name,
                                            value: String(desg.id)
                                        }))}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Designations'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_Designation && <FormError>{errors.foest_Designation.message}</FormError>}
                        </div>
                    </div>

                    {/* Day Type, Shift Name, Applicable Date Row */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='mt-2 space-y-2'>
                            <Label htmlFor={dayTypeId}>
                                Day Type <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_HolidayType'
                                control={control}
                                render={({ field }) => (
                                    <MultiSelect
                                        id={dayTypeId}
                                        options={dayTypeOptions}
                                        onValueChange={(values) => {
                                            field.onChange(values.join(', '));
                                        }}
                                        defaultValue={field.value ? field.value.split(', ') : []}
                                        placeholder='Select Day Type'
                                        variant='inverted'
                                    />
                                )}
                            />
                            {errors.foest_HolidayType && <FormError>{errors.foest_HolidayType.message}</FormError>}
                        </div>
                        <div className='mt-2 space-y-2'>
                            <Label htmlFor={shiftNameId}>
                                Shift Name <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='foest_ShiftName'
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange} disabled={shiftNames.length === 0}>
                                        <SelectTrigger id={shiftNameId} className={errors.foest_ShiftName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={shiftNames.length === 0 ? 'Loading...' : '--Select Shift Name--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {shiftNames
                                                .filter(
                                                    (shift: { label: string; value: string; id?: number }) =>
                                                        shift.value && shift.value !== ''
                                                )
                                                .map((shift: { label: string; value: string; id?: number }) => (
                                                    <SelectItem key={`shift-${shift.id || shift.value}`} value={shift.value}>
                                                        {shift.label}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.foest_ShiftName && <FormError>{errors.foest_ShiftName.message}</FormError>}
                        </div>
                        <div className='space-y-2'>
                            <Controller
                                name='foest_ApplicableDate'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <DateField
                                        field={field}
                                        fieldState={fieldState}
                                        label='Applicable Date'
                                        fromDate={new Date()}
                                        required
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Employee Selection */}
                    <div className='space-y-2 md:w-1/3'>
                        <Label htmlFor={employeesId}>
                            Employee <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='foest_Employee'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    id={employeesId}
                                    options={employeesDataTransformed.map((emp: any) => ({
                                        label: `${emp.employeeName} - [${emp.employeeCode}]`,
                                        value: String(emp.id)
                                    }))}
                                    onValueChange={(values) => {
                                        field.onChange(values.join(', '));
                                    }}
                                    defaultValue={field.value ? field.value.split(', ') : []}
                                    placeholder='Select Employees'
                                    variant='inverted'
                                />
                            )}
                        />
                        {errors.foest_Employee && <FormError>{errors.foest_Employee.message}</FormError>}
                    </div>

                    {/* Timing Fields - Rendered dynamically when shift is selected */}
                    {selectedShiftName && (
                        <ShiftTimingFields
                            control={control}
                            errors={errors}
                            watch={watch}
                            setValue={setValue}
                            fieldNames={{
                                shiftStartTime: 'foest_MorningLogin',
                                shiftEndTime: 'foest_AfternoonLogout',
                                totalWorkingHours: 'foest_TotalWork',
                                lunchStartTime: 'foest_MorningLogout',
                                lunchEndTime: 'foest_AfternoonLogin',
                                lunchHours: 'foest_LunchHour',
                                earlyPerShift: 'foest_EarlyShift',
                                delayPerShift: 'foest_DelayShift',
                                halfDayWorkingHours: 'foest_HalfDayWork'
                            }}
                        />
                    )}

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        <RefreshCw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save Employee Shift Mapping
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
