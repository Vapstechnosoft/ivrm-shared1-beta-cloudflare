'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useInstitutionsByLoginBased,
    useLeaveAuthorization,
    useLeaveAuthorizationDropdowns
} from '@/hooks/hrms/leave-management/useMasters';
import { LEAVE_AUTHORIZATION_VALIDATION } from '@/lib/validation/hrms-master-validation';
import { saveLeaveAuthorization as saveLeaveAuthorizationAPI } from '@/server/hrms/leave-management/masters/leave-authorization';
import { Check, Loader2, Plus, RotateCcw, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';

/* ─────────────────── Types ─────────────────── */
interface CartItem {
    order: string; // '1' | '2' | '3' | '4'
    approvalPerson: string; // numeric ID as string (value from approvalPersonOptions)
    approvalPersonLabel: string; // display name
    finalFlag: boolean;
}

interface AddFormFields {
    // Header (shared) – locked after first Add-To-Cart
    institution: string;
    hrmG_GradeName: string;
    hrmgT_EmployeeGroupType: string;
    hrmD_DepartmentName: string;
    hrmdeS_DesignationName: string;
    hrmL_LeaveName: string;
    // Per-row (reset after each Add-To-Cart)
    hrlaoN_SanctionLevelNo: string;
    hrmE_EmployeeFirstName: string;
    finalFlag: boolean;
}

interface AddLeaveAuthorizationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

const ORDER_OPTIONS = ['1', '2', '3', '4'];

/* ─────────────────── Component ─────────────────── */
export default function AddLeaveAuthorizationForm({ onSuccess, onCancel, className = '' }: AddLeaveAuthorizationFormProps) {
    const { refetchAll } = useLeaveAuthorization();
    const { data: dropdownData, isLoading: isLoadingDropdowns } = useLeaveAuthorizationDropdowns();
    const { data: institutionsData, isLoading: isLoadingInstitutions } = useInstitutionsByLoginBased();

    const [isPending, setIsPending] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [headerLocked, setHeaderLocked] = useState(false);

    const mastersLoading = isLoadingDropdowns || isLoadingInstitutions;

    /* ── Derived ── */
    const usedOrders = useMemo(() => cart.map((c) => c.order), [cart]);
    const hasFinalFlag = useMemo(() => cart.some((c) => c.finalFlag), [cart]);
    const nextAvailableOrder = useMemo(() => {
        const nextNum = cart.length + 1;
        return nextNum <= 4 ? String(nextNum) : null;
    }, [cart]);

    /* ── Dropdown options ── */
    const institutionOptions = useMemo(() => {
        if (!institutionsData?.data || !Array.isArray(institutionsData.data)) return [];
        return institutionsData.data
            .map((item: any) => ({
                value: String(item.mI_Id || item.MI_Id || item.miId || ''),
                label: String(item.mI_Name || item.MI_Name || item.institution || '')
            }))
            .filter((item: { value: string; label: string }) => item.value && item.label);
    }, [institutionsData]);

    const gradeOptions = useMemo(() => {
        if (!dropdownData?.data?.grades || !Array.isArray(dropdownData.data.grades)) return [];
        return dropdownData.data.grades;
    }, [dropdownData]);

    const groupTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.groupTypes || !Array.isArray(dropdownData.data.groupTypes)) return [];
        return dropdownData.data.groupTypes;
    }, [dropdownData]);

    const departmentOptions = useMemo(() => {
        if (!dropdownData?.data?.departments || !Array.isArray(dropdownData.data.departments)) return [];
        return dropdownData.data.departments;
    }, [dropdownData]);

    const designationOptions = useMemo(() => {
        if (!dropdownData?.data?.designations || !Array.isArray(dropdownData.data.designations)) return [];
        return dropdownData.data.designations;
    }, [dropdownData]);

    const leaveTypeOptions = useMemo(() => {
        if (!dropdownData?.data?.leaveTypes || !Array.isArray(dropdownData.data.leaveTypes)) return [];
        return dropdownData.data.leaveTypes;
    }, [dropdownData]);

    const approvalPersonOptions = useMemo(() => {
        if (!dropdownData?.data?.approvalPersons || !Array.isArray(dropdownData.data.approvalPersons)) return [];
        return dropdownData.data.approvalPersons;
    }, [dropdownData]);

    /* ── Available order options for dropdown – only the next sequential number ── */
    const availableOrderOptions = useMemo(() => {
        return ORDER_OPTIONS.filter((o) => {
            if (usedOrders.includes(o)) return false;
            const num = Number(o);
            const expectedNext = usedOrders.length + 1;
            return num === expectedNext;
        });
    }, [usedOrders]);

    /* ── Form ── */
    const {
        handleSubmit,
        control,
        watch,
        reset,
        setValue,
        getValues,
        formState: { errors, isSubmitting }
    } = useForm<AddFormFields>({
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

    const _watchedFinalFlag = watch('finalFlag');

    /* ─── Add To Cart ─── */
    const handleAddToCart = () => {
        const values = getValues();

        if (!values.hrlaoN_SanctionLevelNo) {
            toast.error('Please select an Order before adding to cart.');
            return;
        }
        if (!values.hrmE_EmployeeFirstName) {
            toast.error('Please select an Approval Person before adding to cart.');
            return;
        }

        // Prevent duplicate approval person
        const isDuplicate = cart.some((item) => item.approvalPerson === values.hrmE_EmployeeFirstName);
        if (isDuplicate) {
            const label =
                approvalPersonOptions.find((o) => o.value === values.hrmE_EmployeeFirstName)?.label || values.hrmE_EmployeeFirstName;
            toast.error(`"${label}" is already added to the cart. Please select a different person.`);
            return;
        }

        // Validate header fields on first add
        if (cart.length === 0) {
            if (
                !values.institution ||
                !values.hrmG_GradeName ||
                !values.hrmgT_EmployeeGroupType ||
                !values.hrmD_DepartmentName ||
                !values.hrmdeS_DesignationName ||
                !values.hrmL_LeaveName
            ) {
                toast.error('Please fill all required header fields before adding to cart.');
                return;
            }
        }

        const approvalPersonLabel =
            approvalPersonOptions.find((o) => o.value === values.hrmE_EmployeeFirstName)?.label || values.hrmE_EmployeeFirstName;

        const newItem: CartItem = {
            order: values.hrlaoN_SanctionLevelNo,
            approvalPerson: values.hrmE_EmployeeFirstName,
            approvalPersonLabel,
            finalFlag: !!values.finalFlag
        };

        setCart((prev) => {
            const updated = [...prev, newItem];
            return updated.sort((a, b) => Number(a.order) - Number(b.order));
        });

        // Lock header fields after first add
        if (cart.length === 0) {
            setHeaderLocked(true);
        }

        // Reset only the per-row fields
        setValue('hrlaoN_SanctionLevelNo', '');
        setValue('hrmE_EmployeeFirstName', '');
        setValue('finalFlag', false);
    };

    /* ─── Remove cart item ─── */
    const handleRemoveCartItem = (index: number) => {
        setCart((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            if (updated.length === 0) setHeaderLocked(false);
            return updated;
        });
    };

    /* ─── Final Save – ONE single API call with all cart items ─── */
    const onSubmit: SubmitHandler<AddFormFields> = async (data) => {
        if (cart.length === 0) return;

        const dd = dropdownData?.data;
        if (!dd) {
            toast.error('Dropdown data not loaded yet. Please wait...');
            return;
        }

        // Resolve numeric IDs from the selected dropdown values
        const gradeId = Number(dd.grades?.find((g: any) => g.value == data.hrmG_GradeName)?.value || 0);
        const groupTypeId = Number(dd.groupTypes?.find((g: any) => g.value == data.hrmgT_EmployeeGroupType)?.value || 0);
        const deptId = Number(dd.departments?.find((d: any) => d.value == data.hrmD_DepartmentName)?.value || 0);
        const desigId = Number(dd.designations?.find((d: any) => d.value == data.hrmdeS_DesignationName)?.value || 0);
        const leaveId = Number(dd.leaveTypes?.find((l: any) => l.value == data.hrmL_LeaveName)?.value || 0);

        // Build ONE payload with all cart items as approvalUser[]
        const payload = {
            hrla_Id: 0,
            hrmG_Id: gradeId,
            hrmgT_Id: groupTypeId,
            hrmD_Id: deptId,
            hrmdeS_Id: desigId,
            hrmL_Id: leaveId,
            userId: 0,
            approvalUser: cart.map((item) => ({
                approval_HRME_Id: Number(item.approvalPerson),
                approvalLevelNo: Number(item.order),
                approvalFinalFlag: item.finalFlag
            }))
        };

        console.log('🛒 Final Payload:', JSON.stringify(payload, null, 2));

        setIsPending(true);
        try {
            const response = await saveLeaveAuthorizationAPI(payload as any);
            if (response.success) {
                toast.success(response.message || 'Leave authorization saved successfully');
                reset();
                setCart([]);
                setHeaderLocked(false);
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(response.message || 'Failed to save leave authorization');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to save leave authorization');
        } finally {
            setIsPending(false);
        }
    };

    /* ─── Reset all ─── */
    const handleReset = () => {
        reset();
        setCart([]);
        setHeaderLocked(false);
    };

    /* ──────────────────────────── Render ──────────────────────────── */
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                {/* ── Institution ── */}
                <div className='mb-4'>
                    <Controller
                        name='institution'
                        control={control}
                        rules={{ required: 'Institution is required' }}
                        render={({ field }) => (
                            <div>
                                <label htmlFor='institution-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                    Institution <span className='text-red-500'>*</span>
                                </label>
                                <Select
                                    key={field.value || 'empty'}
                                    onValueChange={(value) => field.onChange(value || '')}
                                    value={field.value?.toString() || undefined}
                                    disabled={headerLocked}>
                                    <SelectTrigger
                                        id='institution-select'
                                        className={`${errors.institution ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
                                        <SelectValue placeholder={isLoadingInstitutions ? 'Loading...' : '--Select Institution--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {institutionOptions.length > 0 ? (
                                            institutionOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                {isLoadingInstitutions ? 'Loading institutions...' : 'No institutions available'}
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.institution && <FormError>{errors.institution.message}</FormError>}
                            </div>
                        )}
                    />
                </div>

                {/* ── 2-column Grid ── */}
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                    {/* Left Column – Header fields (locked after first cart add) */}
                    <div className='space-y-4'>
                        {/* Grade */}
                        <Controller
                            name='hrmG_GradeName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmG_GradeName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Select Grade <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={headerLocked}>
                                        <SelectTrigger
                                            id='grade-select'
                                            className={`${errors.hrmG_GradeName ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
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

                        {/* Group Type */}
                        <Controller
                            name='hrmgT_EmployeeGroupType'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmgT_EmployeeGroupType}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Group Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={headerLocked}>
                                        <SelectTrigger
                                            id='group-type-select'
                                            className={`${errors.hrmgT_EmployeeGroupType ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
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

                        {/* Department */}
                        <Controller
                            name='hrmD_DepartmentName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmD_DepartmentName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Department Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={headerLocked}>
                                        <SelectTrigger
                                            id='department-select'
                                            className={`${errors.hrmD_DepartmentName ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
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

                        {/* Designation */}
                        <Controller
                            name='hrmdeS_DesignationName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmdeS_DesignationName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Designation Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={headerLocked}>
                                        <SelectTrigger
                                            id='designation-select'
                                            className={`${errors.hrmdeS_DesignationName ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
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

                    {/* Right Column – Per-row fields + cart controls */}
                    <div className='space-y-4'>
                        {/* Leave Type */}
                        <Controller
                            name='hrmL_LeaveName'
                            control={control}
                            rules={LEAVE_AUTHORIZATION_VALIDATION.hrmL_LeaveName}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Leave Type <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={headerLocked}>
                                        <SelectTrigger
                                            id='leave-type-select'
                                            className={`${errors.hrmL_LeaveName ? 'border-red-500' : ''} ${headerLocked ? 'cursor-not-allowed opacity-70' : ''}`}>
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

                        {/* Order of Approval – Dropdown [1,2,3,4] ascending */}
                        <Controller
                            name='hrlaoN_SanctionLevelNo'
                            control={control}
                            rules={{}}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='order-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Order of Approval <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => field.onChange(value || '')}
                                        value={field.value?.toString() || undefined}
                                        disabled={nextAvailableOrder === null || hasFinalFlag}>
                                        <SelectTrigger id='order-select'>
                                            <SelectValue placeholder='--Select--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableOrderOptions.length > 0 ? (
                                                availableOrderOptions.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>
                                                        {opt}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {hasFinalFlag
                                                        ? 'Final flag set – no more orders'
                                                        : nextAvailableOrder === null
                                                          ? 'All 4 orders used'
                                                          : `Select order ${nextAvailableOrder}`}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {nextAvailableOrder && !hasFinalFlag && (
                                        <p className='mt-1 text-muted-foreground text-xs'>
                                            Next available order: <strong>{nextAvailableOrder}</strong>
                                        </p>
                                    )}
                                </div>
                            )}
                        />

                        {/* Approval Person */}
                        <Controller
                            name='hrmE_EmployeeFirstName'
                            control={control}
                            rules={{}}
                            render={({ field }) => (
                                <div>
                                    <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                                        Approval Person <span className='text-red-500'>*</span>
                                    </label>
                                    <Select
                                        key={field.value || 'empty'}
                                        onValueChange={(value) => {
                                            // Block re-selection of already-used persons
                                            const alreadyUsed = cart.some((item) => item.approvalPerson === value);
                                            if (alreadyUsed) {
                                                const label = approvalPersonOptions.find((o) => o.value === value)?.label || value;
                                                toast.error(`"${label}" is already in the cart. Please select a different person.`);
                                                return;
                                            }
                                            field.onChange(value || '');
                                        }}
                                        value={field.value?.toString() || undefined}
                                        disabled={hasFinalFlag}>
                                        <SelectTrigger id='approval-person-select'>
                                            <SelectValue placeholder={isLoadingDropdowns ? 'Loading...' : '--Select--'} />
                                        </SelectTrigger>
                                        <SelectContent side='top'>
                                            {approvalPersonOptions.length > 0 ? (
                                                approvalPersonOptions.map((option) => {
                                                    const isUsed = cart.some((item) => item.approvalPerson === option.value);
                                                    return (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                            disabled={isUsed}
                                                            className={isUsed ? 'cursor-not-allowed line-through opacity-40' : ''}>
                                                            {option.label}
                                                            {isUsed ? ' (already added)' : ''}
                                                        </SelectItem>
                                                    );
                                                })
                                            ) : (
                                                <div className='px-2 py-1.5 text-muted-foreground text-sm'>
                                                    {isLoadingDropdowns ? 'Loading options...' : 'No options available'}
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />

                        {/* Final Flag */}
                        <div className='pt-2'>
                            <Controller
                                name='finalFlag'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='finalFlag'
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(!!checked)}
                                            disabled={hasFinalFlag}
                                        />
                                        <label htmlFor='finalFlag' className='cursor-pointer font-medium text-gray-700 text-sm'>
                                            Final Flag
                                        </label>
                                    </div>
                                )}
                            />
                            {hasFinalFlag && <p className='mt-1 text-green-600 text-xs'>✓ Final flag already set in cart</p>}
                        </div>
                    </div>
                    {/* Add To Cart Button */}
                    <div className='pt-1'>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleAddToCart}
                            disabled={hasFinalFlag || nextAvailableOrder === null || mastersLoading}
                            className='w-fit border-primary border-dashed text-primary hover:bg-primary/5'>
                            <Plus className='mr-2 h-4 w-4' />
                            Add To Cart
                        </Button>
                    </div>
                </div>

                {/* ── Cart Table ── */}
                {cart.length > 0 && (
                    <div className='mt-4 overflow-hidden rounded-lg border border-gray-200'>
                        <div className='border-gray-200 border-b bg-gray-50 px-4 py-2'>
                            <h4 className='font-semibold text-gray-700 text-sm'>
                                Cart Details ({cart.length} item{cart.length !== 1 ? 's' : ''})
                            </h4>
                        </div>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='bg-gray-100 text-gray-600 text-xs uppercase'>
                                    <th className='px-3 py-2 text-center'>Sl.No</th>
                                    <th className='px-3 py-2 text-left'>Approval Person</th>
                                    <th className='px-3 py-2 text-center'>Order</th>
                                    <th className='px-3 py-2 text-center'>Final Flag</th>
                                    <th className='px-3 py-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => (
                                    <tr key={index} className='border-gray-100 border-t transition-colors hover:bg-gray-50'>
                                        <td className='px-3 py-2 text-center font-medium text-gray-500'>{index + 1}</td>
                                        <td className='px-3 py-2 text-gray-800'>{item.approvalPersonLabel}</td>
                                        <td className='px-3 py-2 text-center font-semibold text-primary'>{item.order}</td>
                                        <td className='px-3 py-2 text-center'>
                                            {item.finalFlag ? (
                                                <span className='mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-green-200 bg-green-100'>
                                                    <Check className='h-3.5 w-3.5 text-green-700' strokeWidth={3} />
                                                </span>
                                            ) : (
                                                <span className='mx-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-red-100'>
                                                    <X className='h-3.5 w-3.5 text-red-700' strokeWidth={3} />
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-3 py-2 text-center'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleRemoveCartItem(index)}
                                                className='h-7 w-7 text-destructive hover:bg-destructive/10'
                                                title='Remove'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!hasFinalFlag && (
                            <div className='border-amber-100 border-t bg-amber-50 px-4 py-2'>
                                <p className='text-amber-700 text-xs'>
                                    ⚠ Check <strong>Final Flag</strong> on the last approval person and click <strong>Add To Cart</strong>{' '}
                                    to enable Save.
                                </p>
                            </div>
                        )}
                        {hasFinalFlag && (
                            <div className='border-green-100 border-t bg-green-50 px-4 py-2'>
                                <p className='text-green-700 text-xs'>
                                    ✓ Final flag is set. You can now <strong>Save</strong> all {cart.length} cart item
                                    {cart.length !== 1 ? 's' : ''}.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Action Buttons ── */}
                <div className='flex justify-end gap-2 pt-2'>
                    {onCancel && (
                        <Button type='button' variant='outline' onClick={onCancel} disabled={isPending || isSubmitting}>
                            <X className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    )}
                    <Button type='button' variant='outline' onClick={handleReset} disabled={mastersLoading || isPending}>
                        <RotateCcw className='mr-1.5 h-4 w-4' />
                        Reset
                    </Button>
                    {mastersLoading && <Loader2 className='h-4 w-4 animate-spin text-purple-500' />}
                    <Button
                        type='submit'
                        disabled={!hasFinalFlag || cart.length === 0 || isPending || isSubmitting}
                        title={
                            !hasFinalFlag || cart.length === 0
                                ? 'Add items to cart and check Final Flag to enable Save'
                                : 'Save all cart items'
                        }>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
