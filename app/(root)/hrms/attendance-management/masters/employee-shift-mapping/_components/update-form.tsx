'use client';

import { Button } from '@/components/ui/button';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useEmployeeShiftMapping,
    useEmployeeShiftMappingDetailsById,
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
import type { IMasterEmployeeShiftMappingList } from '@/types/hrms/attendance-management/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { ShiftTimingFields } from '../../_components/shift-timing-fields';

type FormFields = z.infer<typeof hrmsMasterSchemas.employeeShiftMapping.update>;

interface UpdateEmployeeShiftMappingFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterEmployeeShiftMappingList;
}

export default function UpdateEmployeeShiftMappingForm({
    onSuccess,
    className = '',
    selectedRow: row
}: UpdateEmployeeShiftMappingFormProps) {
    const { refetchAll } = useEmployeeShiftMapping();
    const isInitialLoad = useRef(true);
    const initialShiftId = useRef<string | null>(null);
    const shiftMapped = useRef(false);
    const dayTypeMapped = useRef(false);
    const employeeMapped = useRef(false);

    console.log('row DATA', row);

    // Data Hooks from Reports
    const { data: groupTypesData } = useReportGroupTypes();
    const { data: employeeDetailsData } = useEmployeeShiftMappingDetailsById(row?.foesT_Id || 0);

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
    console.log('shiftNamesListData', shiftNamesListData);
    // Generate unique IDs for form fields
    const typeId = useId();
    const departmentId = useId();
    const designationId = useId();
    const dayTypeId = useId();
    const shiftNameId = useId();
    const applicableDateId = useId();
    const employeesId = useId();

    // Initialize form with default values immediately from row data
    const {
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(hrmsMasterSchemas.employeeShiftMapping.update),
        mode: 'onChange',
        defaultValues: {
            foest_Id: row?.foesT_Id || 0,
            foest_ShiftName: row?.fomS_ShiftName || '',
            foest_Employee: row?.hrmE_EmployeeFirstName || '',
            foest_ApplicableDate: row?.foesT_Date || '',
            foest_TotalWork: row?.foesT_FDWHrMin || '',
            foest_HalfDayWork: row?.foesT_HDWHrMin || '',
            foest_MorningLogin: row?.foesT_IHalfLoginTime || '',
            foest_MorningLogout: row?.foesT_IHalfLogoutTime || '',
            foest_AfternoonLogin: row?.foesT_IIHalfLoginTime || '',
            foest_AfternoonLogout: row?.foesT_IIHalfLogoutTime || '',
            foest_DelayShift: row?.foesT_DelayPerShiftHrMin || '',
            foest_EarlyShift: row?.foesT_EarlyPerShiftHrMin || '',
            foest_LunchHour: row?.foesT_LunchHoursDuration || '',
            foest_GroupType: row?.hrmgT_Id ? String(row.hrmgT_Id) : '',
            foest_Department: row?.hrmD_Id ? String(row.hrmD_Id) : '',
            foest_Designation: row?.hrmdeS_Id ? String(row.hrmdeS_Id) : '',
            foest_HolidayType: row?.fohwdT_Id ? String(row.fohwdT_Id) : ''
        }
    });

    // Update form when row changes (optimized - only reset if values actually changed)
    useEffect(() => {
        if (row) {
            // Reset mapping flags when row changes
            shiftMapped.current = false;
            dayTypeMapped.current = false;
            employeeMapped.current = false;
            isInitialLoad.current = true;
            initialShiftId.current = null;

            reset(
                {
                    foest_Id: row.foesT_Id || 0,
                    foest_ShiftName: row.fomS_ShiftName || '',
                    foest_Employee: row.hrmE_EmployeeFirstName || '',
                    foest_ApplicableDate: row.foesT_Date || '',
                    foest_TotalWork: row.foesT_FDWHrMin || '',
                    foest_HalfDayWork: row.foesT_HDWHrMin || '',
                    foest_MorningLogin: row.foesT_IHalfLoginTime || '',
                    foest_MorningLogout: row.foesT_IHalfLogoutTime || '',
                    foest_AfternoonLogin: row.foesT_IIHalfLoginTime || '',
                    foest_AfternoonLogout: row.foesT_IIHalfLogoutTime || '',
                    foest_DelayShift: row.foesT_DelayPerShiftHrMin || '',
                    foest_EarlyShift: row.foesT_EarlyPerShiftHrMin || '',
                    foest_LunchHour: row.foesT_LunchHoursDuration || '',
                    foest_HolidayType: row.fohwdT_Id ? String(row.fohwdT_Id) : '',
                    foest_Department: row.hrmD_Id ? String(row.hrmD_Id) : '',
                    foest_Designation: row.hrmdeS_Id ? String(row.hrmdeS_Id) : '',
                    foest_GroupType: row.hrmgT_Id ? String(row.hrmgT_Id) : ''
                },
                { keepDefaultValues: false }
            );
        }
    }, [row?.foesT_Id, reset]); // Only depend on row ID to avoid unnecessary resets

    const isNewEntry = watch('foest_Id') === 0;

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
        const options: any[] = [];

        // Seed with current row data for instant display even during loading
        if (row?.fomS_ShiftName) {
            options.push({
                label: row.fomS_ShiftName,
                value: row.fomS_ShiftName,
                id: 0
            });
        }

        if (shiftNamesListData?.data && Array.isArray(shiftNamesListData.data)) {
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

            // Merge API results, avoiding duplicates with the seed
            Array.from(uniqueShifts.values()).forEach((opt: any) => {
                if (!options.some((o) => o.label === opt.label || o.value === opt.value)) {
                    options.push(opt);
                }
            });
        }

        return options.filter((option: any) => option.value && option.value !== '0' && option.label);
    }, [shiftNamesListData, row?.fomS_ShiftName]);

    // Get the selected shift's ID
    const selectedShiftId = useMemo(() => {
        if (selectedShiftName) {
            const selectedShift = shiftOptions.find((shift: { value: string; id?: number }) => shift.value === selectedShiftName);
            // If we found a shift and it has a valid ID, return it.
            // If it's the seed option with id 0, return 0 to prevent accidental fetch with invalid ID.
            return selectedShift?.id && selectedShift.id > 0 ? selectedShift.id : 0;
        }
        return 0;
    }, [selectedShiftName, shiftOptions]);

    // Fetch shift details when a shift is selected
    const { data: shiftDetailsData, isLoading: isLoadingShiftDetails } = useEmployeeShiftMappingShiftDetails(
        selectedShiftId > 0 ? selectedShiftId : undefined
    );

    // When shift is selected, populate timing fields from API response
    useEffect(() => {
        // Don't overwrite timing fields on initial load - only when user changes the shift
        if (isInitialLoad.current && initialShiftId.current && String(selectedShiftId) === initialShiftId.current) {
            return;
        }

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

    const groupTypesOptions = useMemo(() => {
        const list = groupTypesData?.data || groupTypesData || [];
        const options = Array.isArray(list)
            ? list.map((gt: any) => ({
                  value: String(gt.key || gt.hrmgT_Id || gt.id),
                  label: gt.value || gt.hrmgT_EmployeeGroupType || gt.name
              }))
            : [];

        // Seed with current row data for instant display
        if (row?.hrmgT_Id && row?.hrmgT_EmployeeGroupType) {
            const val = String(row.hrmgT_Id);
            if (!options.some((o) => o.value === val)) {
                options.unshift({ value: val, label: row.hrmgT_EmployeeGroupType });
            }
        }
        return options;
    }, [groupTypesData, row?.hrmgT_Id, row?.hrmgT_EmployeeGroupType]);

    const departmentsOptions = useMemo(() => {
        const list = departmentsData?.data || departmentsData || [];
        const options = Array.isArray(list)
            ? list.map((d: any) => ({
                  value: String(d.hrmD_Id || d.hrmd_id || d.key || d.id),
                  label: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
              }))
            : [];

        // Seed with current row data
        if (row?.hrmD_Id && row?.hrmD_DepartmentName) {
            const val = String(row.hrmD_Id);
            if (!options.some((o) => o.value === val)) {
                options.unshift({ value: val, label: row.hrmD_DepartmentName });
            }
        }
        return options;
    }, [departmentsData, row?.hrmD_Id, row?.hrmD_DepartmentName]);

    const designationsOptions = useMemo(() => {
        const list = designationsData?.data || designationsData || [];
        const options = Array.isArray(list)
            ? list.map((d: any) => ({
                  value: String(d.hrmdeS_Id || d.hrmdes_id || d.key || d.id),
                  label: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
              }))
            : [];

        // Seed with current row data
        if (row?.hrmdeS_Id && row?.hrmdeS_DesignationName) {
            const val = String(row.hrmdeS_Id);
            if (!options.some((o) => o.value === val)) {
                options.unshift({ value: val, label: row.hrmdeS_DesignationName });
            }
        }
        return options;
    }, [designationsData, row?.hrmdeS_Id, row?.hrmdeS_DesignationName]);

    const employeesDataTransformed = useMemo(() => {
        const options: any[] = [];

        // Seed with current row data for instant display even during loading
        if (row?.hrmE_EmployeeFirstName) {
            const labels = row.hrmE_EmployeeFirstName.split(/,\s*/).filter(Boolean);
            labels.forEach((label) => {
                options.push({
                    id: label as any,
                    employeeName: label,
                    employeeCode: 'Current'
                });
            });
        }

        const list = employeesData?.data?.employeeNames || employeesData;
        if (list && Array.isArray(list)) {
            list.forEach((emp: any) => {
                const id = emp.hrmE_Id || emp.id;
                if (!id) return;

                const name = emp.employeeFullName || 'Unknown Employee';
                if (!options.some((o) => o.employeeName === name)) {
                    options.push({
                        id: Number(id),
                        employeeName: name,
                        employeeCode: id.toString()
                    });
                }
            });
        }

        return options;
    }, [employeesData, row?.hrmE_EmployeeFirstName]);

    // Prepare holiday type options for Day Type dropdown
    const dayTypeOptionsMerged = React.useMemo(() => {
        const raw = holidayTypesData?.data || [];
        const options = Array.isArray(raw)
            ? raw
                  .map((item: any) => ({
                      label: item.Value || item.value || '',
                      value: String(item.Key || item.key || '')
                  }))
                  .filter((o) => o.value && o.value !== '0')
            : [];

        // Seed with current row data
        if (row?.fohwdT_Id && row?.fohtwD_HolidayWDType) {
            const val = String(row.fohwdT_Id);
            if (!options.some((o) => o.value === val)) {
                options.unshift({ value: val, label: row.fohtwD_HolidayWDType });
            }
        }
        return options;
    }, [holidayTypesData, row?.fohwdT_Id, row?.fohtwD_HolidayWDType]);
    // Consolidated Mapping: Map shift and employee names to IDs
    useEffect(() => {
        if (!row) return;

        // 1. Map Shift Name to ID if not yet mapped
        if (!shiftMapped.current && shiftOptions.length > 0) {
            const shiftOption = shiftOptions.find(
                (s: any) =>
                    s.label === row.fomS_ShiftName || String(s.label).toLowerCase() === String(row.fomS_ShiftName || '').toLowerCase()
            );
            if (shiftOption && shiftOption.id > 0) {
                const shiftId = shiftOption.value;
                if (isInitialLoad.current) {
                    initialShiftId.current = shiftId;
                }
                setValue('foest_ShiftName', shiftId, { shouldDirty: false });
                shiftMapped.current = true;
            }
        }

        // 2. Map Employee names to IDs if not yet mapped
        if (!employeeMapped.current && employeesDataTransformed.length > 0) {
            const employeeLabels = row.hrmE_EmployeeFirstName ? row.hrmE_EmployeeFirstName.split(',').map((e: string) => e.trim()) : [];
            const employeeIds = employeesDataTransformed
                .filter((emp: any) =>
                    employeeLabels.some(
                        (label: string) =>
                            emp.employeeName.toLowerCase().includes(label.toLowerCase()) ||
                            label.toLowerCase().includes(emp.employeeName.toLowerCase())
                    )
                )
                .map((emp: any) => String(emp.id))
                .join(', ');

            if (employeeIds) {
                setValue('foest_Employee', employeeIds, { shouldDirty: false });
                employeeMapped.current = true;
            }
        }

        // 3. Map other fields directly (Group, Dept, Desig, Day Type)
        // These are mostly for ensuring the dropdowns show the correct labels even if disabled
        if (row.hrmgT_Id) setValue('foest_GroupType', String(row.hrmgT_Id), { shouldDirty: false });
        if (row.hrmD_Id) setValue('foest_Department', String(row.hrmD_Id), { shouldDirty: false });
        if (row.hrmdeS_Id) setValue('foest_Designation', String(row.hrmdeS_Id), { shouldDirty: false });
        if (row.fohwdT_Id) {
            setValue('foest_HolidayType', String(row.fohwdT_Id), { shouldDirty: false });
            dayTypeMapped.current = true;
        }
    }, [row, shiftOptions, employeesDataTransformed, setValue]);

    // Cleanup initial load flag
    useEffect(() => {
        if (isInitialLoad.current && shiftMapped.current && dayTypeMapped.current) {
            const timer = setTimeout(() => {
                isInitialLoad.current = false;
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [shiftMapped.current, dayTypeMapped.current]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            console.log('Final Payload:', data);
            // Get shift master ID from selected value (which is the stringified fomS_Id)
            // Find the shift object to verify it exists and get label if needed
            const foundShift = shiftNamesListData?.data?.find(
                (s: any) => String(s.fomS_Id) === String(data.foest_ShiftName) || s.fomS_ShiftName === data.foest_ShiftName
            );
            console.log('foundShift', foundShift);
            const shiftIdToUse = foundShift?.fomS_Id || 0;
            console.log('shiftIdToUse', shiftIdToUse);
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

            // Determine the final employee ID to use (prefer API response, then form data)
            const finalEmployeeId = employeeDetailsData?.data?.hrmE_Id || employeeIds[0] || 0;

            // Validate required fields
            if (!finalEmployeeId) {
                toast.error('Employee ID is required. Please ensure an employee is selected.');
                return;
            }
            if (dayTypeIds.length === 0) {
                toast.error('Day Type is required. Please select at least one day type.');
                return;
            }

            // Sample payload structure following project architecture
            // Note: mI_Id is handled by JWT, not included in request body
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
            const selectedShift = shiftOptions.find((shift: { value: string; label: string }) => shift.value === data.foest_ShiftName);
            const shiftNameLabel = selectedShift?.label || '';

            // Payload structure matching API requirements
            // POST /api/EmployeeShiftMapping/add_or_update_employee_shift
            const payload = {
                foesT_Id: Number(data.foest_Id) || 0,
                hrmE_Id: finalEmployeeId,
                fohwdT_Id: dayTypeIds[0] || 0, // Use first day type ID for single update
                fomS_Id: shiftIdToUse,
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
                hrmE_Ids: [finalEmployeeId],
                fohwdT_Ids: dayTypeIds
            };

            const response = await addOrUpdateEmployeeShiftMapping(payload);

            if (response?.success) {
                toast.success(response?.message || 'Employee shift mapping updated successfully');
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update employee shift mapping');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update employee shift mapping');
        }
    };

    const handleReset = () => {
        reset({
            foest_Id: 0,
            foest_ShiftName: '',
            foest_Employee: '',
            foest_HolidayType: '',
            foest_ApplicableDate: '',
            foest_TotalWork: '',
            foest_HalfDayWork: '',
            foest_MorningLogin: '',
            foest_MorningLogout: '',
            foest_AfternoonLogin: '',
            foest_AfternoonLogout: '',
            foest_DelayShift: '',
            foest_EarlyShift: '',
            foest_LunchHour: '',
            foest_GroupType: '',
            foest_Department: '',
            foest_Designation: ''
        });
        // Reset mapping flags
        shiftMapped.current = false;
        dayTypeMapped.current = false;
        employeeMapped.current = false;
    };

    return (
        <div className={`${className}`} key={`form-${row?.foesT_Id || 'new'}`}>
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
                                    <CustomMultiSelectBox
                                        options={groupTypesOptions}
                                        value={field.value ? field.value.split(', ').filter(Boolean) : []}
                                        onChange={(values) => field.onChange(values.join(', '))}
                                        height='150px'
                                        disabled={!isNewEntry}
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
                                    <CustomMultiSelectBox
                                        options={departmentsOptions}
                                        value={field.value ? field.value.split(', ').filter(Boolean) : []}
                                        onChange={(values) => field.onChange(values.join(', '))}
                                        height='150px'
                                        disabled={!isNewEntry}
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
                                    <CustomMultiSelectBox
                                        options={designationsOptions}
                                        value={field.value ? field.value.split(', ').filter(Boolean) : []}
                                        onChange={(values) => field.onChange(values.join(', '))}
                                        height='150px'
                                        disabled={!isNewEntry}
                                    />
                                )}
                            />
                            {errors.foest_Designation && <FormError>{errors.foest_Designation.message}</FormError>}
                        </div>
                    </div>

                    {/* Day Type, Shift Name, Applicable Date Row */}
                    <div className='flex flex-col space-y-2'>
                        <Label htmlFor={dayTypeId}>
                            Day Type <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='foest_HolidayType'
                            control={control}
                            render={({ field }) => (
                                <CustomMultiSelectBox
                                    options={dayTypeOptionsMerged}
                                    value={field.value ? field.value.split(', ').filter(Boolean) : []}
                                    onChange={(values) => field.onChange(values.join(', '))}
                                    height='150px'
                                    disabled={!isNewEntry}
                                />
                            )}
                        />
                        {errors.foest_HolidayType && <FormError>{errors.foest_HolidayType.message}</FormError>}
                    </div>
                    <div className='flex flex-col space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor={shiftNameId}>
                                Shift Name <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                                key={`shift-${row?.foesT_Id || 'new'}`}
                                value={watch('foest_ShiftName') || ''}
                                onValueChange={(value) => setValue('foest_ShiftName', value)}
                                disabled={false}>
                                <SelectTrigger id={shiftNameId} className={errors.foest_ShiftName ? 'border-red-500' : ''}>
                                    <SelectValue
                                        placeholder={shiftOptions.length === 0 ? 'No shifts available' : '--Select Shift Name--'}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {shiftOptions
                                        .filter((shift: { label: string; value: string; id?: number }) => shift.value && shift.value !== '')
                                        .map((shift: { label: string; value: string; id?: number }) => (
                                            <SelectItem key={`shift-${shift.id || shift.value}`} value={shift.value}>
                                                {shift.label}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {errors.foest_ShiftName && <FormError>{errors.foest_ShiftName.message}</FormError>}
                        </div>
                        <Controller
                            name='foest_ApplicableDate'
                            control={control}
                            render={({ field, fieldState }) => (
                                <DateField field={field} fieldState={fieldState} label='Applicable Date' fromDate={new Date()} />
                            )}
                        />
                    </div>
                </div>

                {/* Employee Selection */}
                <div className='flex flex-col space-y-2'>
                    <Label htmlFor={employeesId}>
                        Employees <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='foest_Employee'
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                options={employeesDataTransformed.map((emp) => ({
                                    label: emp.employeeName,
                                    value: String(emp.id)
                                }))}
                                onValueChange={(values) => field.onChange(values.join(', '))}
                                defaultValue={field.value ? field.value.split(', ').filter(Boolean) : []}
                                placeholder='Select Employees'
                                maxCount={3}
                                disabled={!isNewEntry}
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
                        disabled={false}
                    />
                )}

                {/* Root Error */}
                {errors.root && <FormError>{errors.root.message}</FormError>}
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
                        disabled={false}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            {isNewEntry ? 'Save Employee Shift Mapping' : 'Update Employee Shift Mapping'}
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
