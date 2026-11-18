'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useInstitutionsByLoginBased,
    useLeaveAuthorization,
    useLeaveAuthorizationDropdowns,
    useLeaveAuthorizationForEdit,
    useUpdateLeaveAuthorization
} from '@/hooks/hrms/leave-management/useMasters';
import { LEAVE_AUTHORIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { Loader2, Save, X } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveAuthorization } from './columns';
interface UpdateLeaveAuthorizationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
    selectedRow: LeaveAuthorization;
}
export default function UpdateLeaveAuthorizationForm({
    onSuccess,
    onCancel,
    className = '',
    selectedRow: row
}: UpdateLeaveAuthorizationFormProps) {
    const { refetchAll } = useLeaveAuthorization();
    const { mutate: updateLeaveAuthorization, isPending } = useUpdateLeaveAuthorization();
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useLeaveAuthorizationDropdowns();
    const { data: institutionsData, isLoading: isLoadingInstitutions } = useInstitutionsByLoginBased();
    console.log('edit row', row);
    // Extract institution options from API
    const institutionOptions = useMemo(() => {
        if (!institutionsData?.data || !Array.isArray(institutionsData.data)) {
            return [];
        }
        return institutionsData.data
            .map((item: any) => ({
                value: String(item.mI_Id || item.MI_Id || item.miId || ''),
                label: String(item.mI_Name || item.MI_Name || item.institutionName || item.miName || item.institution || '')
            }))
            .filter((item: { value: string; label: string }) => item.value && item.label);
    }, [institutionsData]);
    // Fetch leave authorization data for editing from API
    const { data: editData, isLoading: isLoadingEditData, error: editError } = useLeaveAuthorizationForEdit(row?.id || null);
    // Extract dropdown options from API
    const gradeOptions = useMemo(() => {
        if (!dropdownData?.data?.grades || !Array.isArray(dropdownData.data.grades)) {
            return [];
        }
        return dropdownData.data.grades;
    }, [dropdownData]);
    const groupTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.groupTypes || !Array.isArray(dropdownData.data.groupTypes)) {
            return [];
        }
        return dropdownData.data.groupTypes;
    }, [dropdownData]);
    const departmentOptions = useMemo(() => {
        if (!dropdownData?.data?.departments || !Array.isArray(dropdownData.data.departments)) {
            return [];
        }
        return dropdownData.data.departments;
    }, [dropdownData]);
    const designationOptions = useMemo(() => {
        if (!dropdownData?.data?.designations || !Array.isArray(dropdownData.data.designations)) {
            return [];
        }
        return dropdownData.data.designations;
    }, [dropdownData]);
    const leaveTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.leaveTypes || !Array.isArray(dropdownData.data.leaveTypes)) {
            return [];
        }
        return dropdownData.data.leaveTypes;
    }, [dropdownData]);
    const approvalPersonOptions = useMemo(() => {
        if (!dropdownData?.data?.approvalPersons || !Array.isArray(dropdownData.data.approvalPersons)) {
            return [];
        }
        return dropdownData.data.approvalPersons;
    }, [dropdownData]);
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue: _setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveAuthorization>({
        mode: 'onChange',
        defaultValues: {
            institution: '',
            hrmG_GradeName: '',
            hrmgT_EmployeeGroupType: '',
            hrmD_DepartmentName: '',
            hrmdeS_DesignationName: '',
            hrmL_LeaveName: '',
            hrlaoN_SanctionLevelNo: '',
            hrmE_EmployeeFirstName: '',
            finalFlag: false
        }
    });
    // Load data from API when edit data is fetched
    useEffect(() => {
        // Only bind if we have the API data
        if (!editData?.data) return;

        const dataToUse = editData.data;
        console.log('🔄 [UpdateForm] API Data received:', dataToUse);

        const instId =
            (dataToUse as any).mI_Id ||
            (dataToUse as any).MI_Id ||
            (dataToUse as any).miId ||
            (dataToUse as any).mi_id ||
            (dataToUse as any).MI_id;
        const fallbackInst = institutionOptions.find((opt) => opt.label === 'Vidya Vikasa Vidya Samsthe (R)')?.value || '';

        // Map values to strings for form state
        const formValues = {
            id: dataToUse.id,
            _HRLA_Id: (dataToUse as any)._HRLA_Id,
            institution: String(instId || fallbackInst),
            // Normalize all ID fields to strings
            hrmG_GradeName: String((dataToUse as any).hrmG_Id || (dataToUse as any).gradeId || (dataToUse as any).HRMG_Id || ''),
            hrmgT_EmployeeGroupType: String(
                (dataToUse as any).hrmgT_Id || (dataToUse as any).groupTypeId || (dataToUse as any).HRMGT_Id || ''
            ),
            hrmD_DepartmentName: String((dataToUse as any).hrmD_Id || (dataToUse as any).departmentId || (dataToUse as any).HRMD_Id || ''),
            hrmdeS_DesignationName: String(
                (dataToUse as any).hrmdeS_Id || (dataToUse as any).designationId || (dataToUse as any).HRMDES_Id || ''
            ),
            hrmL_LeaveName: String((dataToUse as any).hrmL_Id || (dataToUse as any).leaveTypeId || (dataToUse as any).HRML_Id || ''),
            hrlaoN_SanctionLevelNo: String(
                dataToUse.hrlaoN_SanctionLevelNo || (dataToUse as any).orderOfApproval || (dataToUse as any).HRLAON_SanctionLevelNo || ''
            ),
            hrmE_EmployeeFirstName: String(
                (dataToUse as any).approvalPersonId || (dataToUse as any).hrmE_Id || (dataToUse as any).HRME_Id || ''
            ),
            finalFlag: dataToUse.hrlaoN_FinalFlg
        };
        reset(formValues);
    }, [editData, reset, institutionOptions]);
    const onSubmit: SubmitHandler<LeaveAuthorization> = async (data) => {
        console.log('update', data);
        updateLeaveAuthorization(
            {
                ...data,
                id: data.id || row.id,
                _HRLA_Id: data._HRLA_Id || row._HRLA_Id
            },
            {
                onSuccess: () => {
                    reset();
                    refetchAll();
                    onSuccess?.();
                }
            }
        );
    };
    const handleReset = () => {
        reset();
    };
    // Show loading state while fetching edit data
    if (isLoadingEditData) {
        return (
            <div className={`${className} flex items-center justify-center p-8`}>
                <div className='flex flex-col items-center gap-2'>
                    <Loader2 className='h-8 w-8 animate-spin text-primary' />
                    <p className='animate-pulse font-medium text-muted-foreground'>Fetching data...</p>
                </div>
            </div>
        );
    }
    // Show error state if edit data failed to load
    if (editError) {
        return (
            <div className={`${className} flex items-center justify-center p-8`}>
                <div className='text-center'>
                    <div className='mb-2 text-red-600 text-sm'>{editError.message || 'Failed to load leave authorization data'}</div>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} className='mt-4'>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='fade-in slide-in-from-top-4 animate-in space-y-6 duration-500'>
                {/* Institution Field */}
                <div className='mb-4'>
                    <Controller
                        name='institution'
                        control={control}
                        rules={{ required: 'Institution is required' }}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='update-institution-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Institution <span className='text-red-500'>*</span>
                                </label>
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(value) => {
                                        field.onChange(value || '');
                                    }}
                                    value={field.value?.toString() || undefined}>
                                    <SelectTrigger id='update-institution-select' className={errors.institution ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='--Select Institution--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutionOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.institution && <FormError>{errors.institution.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* DEBUG: Remove after fixing mapping */}
                {/* <div className='rounded bg-gray-100 p-2 text-xs'>
                    <strong>Debug Data:</strong>
                    <pre>{JSON.stringify(editData?.data, null, 2)}</pre>
                </div>  */}
                {/* Form Fields Grid */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='hrmG_GradeName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmG_GradeName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Select Grade <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger id='update-grade-select' className={errors.hrmG_GradeName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeOptions.length > 0 ? (
                                                gradeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmG_GradeName && <FormError>{errors.hrmG_GradeName.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmgT_EmployeeGroupType'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmgT_EmployeeGroupType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Group Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='update-group-type-select'
                                            className={errors.hrmgT_EmployeeGroupType ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groupTypeOptions.length > 0 ? (
                                                groupTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmgT_EmployeeGroupType && <FormError>{errors.hrmgT_EmployeeGroupType.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmD_DepartmentName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmD_DepartmentName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Department Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='update-department-select'
                                            className={errors.hrmD_DepartmentName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departmentOptions.length > 0 ? (
                                                departmentOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmD_DepartmentName && <FormError>{errors.hrmD_DepartmentName.message}</FormError>}
                                </div>
                            )}
                        />
                        <Controller
                            name='hrmdeS_DesignationName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmdeS_DesignationName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Designation Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='update-designation-select'
                                            className={errors.hrmdeS_DesignationName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designationOptions.length > 0 ? (
                                                designationOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmdeS_DesignationName && <FormError>{errors.hrmdeS_DesignationName.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                    {/* Right Column */}
                    <div className='space-y-4'>
                        <Controller
                            name='hrmL_LeaveName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmL_LeaveName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='update-leave-type-select'
                                            className={errors.hrmL_LeaveName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {leaveTypeOptions.length > 0 ? (
                                                leaveTypeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmL_LeaveName && <FormError>{errors.hrmL_LeaveName.message}</FormError>}
                                </div>
                            )}
                        />
                        <div className='mb-4'>
                            <InputText
                                label='Order'
                                id='update-hrlaoN_SanctionLevelNo'
                                required
                                type='number'
                                {...register('hrlaoN_SanctionLevelNo', LEAVE_AUTHORIZATION_VALIDATION.hrlaoN_SanctionLevelNo)}
                                error={errors.hrlaoN_SanctionLevelNo?.message}
                                className='transition-all duration-200 focus:ring-2 focus:ring-primary/20'
                            />
                        </div>
                        <Controller
                            name='hrmE_EmployeeFirstName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmE_EmployeeFirstName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='update-approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Approval Person <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}>
                                        <SelectTrigger
                                            id='update-approval-person-select'
                                            className={errors.hrmE_EmployeeFirstName ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {approvalPersonOptions.length > 0 ? (
                                                approvalPersonOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.hrmE_EmployeeFirstName && <FormError>{errors.hrmE_EmployeeFirstName.message}</FormError>}
                                </div>
                            )}
                        />
                        {/* Checkbox */}
                        <div className='pt-2'>
                            <Controller
                                name='finalFlag'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='update-finalFlag'
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
                                        />
                                        <label htmlFor='update-finalFlag' className='cursor-pointer font-medium text-gray-700 text-sm'>
                                            Final Flag
                                        </label>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>
                {/* Action Buttons */}
                <div className='flex justify-end gap-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        Reset
                    </Button>
                    <Button type='submit' disabled={isPending || isSubmitting}>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Updating...' : 'Update'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
