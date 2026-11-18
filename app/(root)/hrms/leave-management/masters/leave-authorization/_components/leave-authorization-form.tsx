'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveAuthorization } from './columns';
const institutions = [
    'Vaps Knowledge Services Pvt Ltd',
    'VAPS Institute',
    'VAPS Academy',
    'VAPS School',
    'VAPS College',
    'VAPS University'
];
interface LeaveAuthorizationFormProps {
    editingLeaveAuthorization: LeaveAuthorization | null;
    onSubmit: (data: LeaveAuthorization) => void;
    onCancel: () => void;
}
export function LeaveAuthorizationForm({ editingLeaveAuthorization, onSubmit, onCancel }: LeaveAuthorizationFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<LeaveAuthorization>({
        defaultValues: editingLeaveAuthorization || {
            institution: 'Vaps Knowledge Services Pvt Ltd',
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
    const handleFormSubmit: SubmitHandler<LeaveAuthorization> = (data) => {
        onSubmit(data);
    };
    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
            {/* Institution Field */}
            <div className='mb-4'>
                <label htmlFor='institution-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                    Institution <span className='text-red-500'>*</span>
                </label>
                <Select value={watch('institution')} onValueChange={(value) => setValue('institution', value)}>
                    <SelectTrigger id='institution-select' className={errors.institution ? 'border-red-500' : ''}>
                        <SelectValue placeholder='Select Institution' />
                    </SelectTrigger>
                    <SelectContent>
                        {institutions.map((institution) => (
                            <SelectItem key={institution} value={institution}>
                                {institution}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.institution && <FormError>{errors.institution.message}</FormError>}
            </div>
            {/* Form Fields Grid */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Left Column */}
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='grade-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Select Grade <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('hrmG_GradeName')} onValueChange={(value) => setValue('hrmG_GradeName', value)}>
                            <SelectTrigger id='grade-select' className={errors.hrmG_GradeName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Manager'>Manager</SelectItem>
                                <SelectItem value='Executive'>Executive</SelectItem>
                                <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                                <SelectItem value='Director'>Director</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmG_GradeName && <FormError>{errors.hrmG_GradeName.message}</FormError>}
                    </div>
                    <div>
                        <label htmlFor='group-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Group Type <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={watch('hrmgT_EmployeeGroupType')}
                            onValueChange={(value) => setValue('hrmgT_EmployeeGroupType', value)}>
                            <SelectTrigger id='group-type-select' className={errors.hrmgT_EmployeeGroupType ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='VKS'>VKS</SelectItem>
                                <SelectItem value='Admin'>Admin</SelectItem>
                                <SelectItem value='HR'>HR</SelectItem>
                                <SelectItem value='Finance'>Finance</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmgT_EmployeeGroupType && <FormError>{errors.hrmgT_EmployeeGroupType.message}</FormError>}
                    </div>
                    <div>
                        <label htmlFor='department-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Department Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('hrmD_DepartmentName')} onValueChange={(value) => setValue('hrmD_DepartmentName', value)}>
                            <SelectTrigger id='department-select' className={errors.hrmD_DepartmentName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Sales and Marketing'>Sales and Marketing</SelectItem>
                                <SelectItem value='Human Resources'>Human Resources</SelectItem>
                                <SelectItem value='Finance'>Finance</SelectItem>
                                <SelectItem value='Operations'>Operations</SelectItem>
                                <SelectItem value='IT'>IT</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmD_DepartmentName && <FormError>{errors.hrmD_DepartmentName.message}</FormError>}
                    </div>
                    <div>
                        <label htmlFor='designation-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Designation Type <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={watch('hrmdeS_DesignationName')}
                            onValueChange={(value) => setValue('hrmdeS_DesignationName', value)}>
                            <SelectTrigger id='designation-select' className={errors.hrmdeS_DesignationName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Assistant Business Development Manager'>
                                    Assistant Business Development Manager
                                </SelectItem>
                                <SelectItem value='Business Development Manager'>Business Development Manager</SelectItem>
                                <SelectItem value='Senior Business Development Manager'>Senior Business Development Manager</SelectItem>
                                <SelectItem value='Team Lead'>Team Lead</SelectItem>
                                <SelectItem value='Senior Manager'>Senior Manager</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmdeS_DesignationName && <FormError>{errors.hrmdeS_DesignationName.message}</FormError>}
                    </div>
                </div>
                {/* Right Column */}
                <div className='space-y-4'>
                    <div>
                        <label htmlFor='leave-type-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Leave Type <span className='text-red-500'>*</span>
                        </label>
                        <Select value={watch('hrmL_LeaveName')} onValueChange={(value) => setValue('hrmL_LeaveName', value)}>
                            <SelectTrigger id='leave-type-select' className={errors.hrmL_LeaveName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Comp Off'>Comp Off</SelectItem>
                                <SelectItem value='Optional Leave'>Optional Leave</SelectItem>
                                <SelectItem value='Casual Leave'>Casual Leave</SelectItem>
                                <SelectItem value='Sick Leave'>Sick Leave</SelectItem>
                                <SelectItem value='Emergency Leave'>Emergency Leave</SelectItem>
                                <SelectItem value='Privilege Leave'>Privilege Leave</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmL_LeaveName && <FormError>{errors.hrmL_LeaveName.message}</FormError>}
                    </div>
                    <div>
                        <label htmlFor='order-approval-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Order Of Approval <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={watch('hrlaoN_SanctionLevelNo')}
                            onValueChange={(value) => setValue('hrlaoN_SanctionLevelNo', value)}>
                            <SelectTrigger id='order-approval-select' className={errors.hrlaoN_SanctionLevelNo ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='1'>1</SelectItem>
                                <SelectItem value='2'>2</SelectItem>
                                <SelectItem value='3'>3</SelectItem>
                                <SelectItem value='4'>4</SelectItem>
                                <SelectItem value='5'>5</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrlaoN_SanctionLevelNo && <FormError>{errors.hrlaoN_SanctionLevelNo.message}</FormError>}
                    </div>
                    <div>
                        <label htmlFor='approval-person-select' className='mb-2 block font-medium text-gray-700 text-sm'>
                            Approval Person <span className='text-red-500'>*</span>
                        </label>
                        <Select
                            value={watch('hrmE_EmployeeFirstName')}
                            onValueChange={(value) => setValue('hrmE_EmployeeFirstName', value)}>
                            <SelectTrigger id='approval-person-select' className={errors.hrmE_EmployeeFirstName ? 'border-red-500' : ''}>
                                <SelectValue placeholder='--Select--' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Benoy Yogesh Shetty'>Benoy Yogesh Shetty</SelectItem>
                                <SelectItem value='R Siddesh Kumar'>R Siddesh Kumar</SelectItem>
                                <SelectItem value='John Doe'>John Doe</SelectItem>
                                <SelectItem value='Jane Smith'>Jane Smith</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.hrmE_EmployeeFirstName && <FormError>{errors.hrmE_EmployeeFirstName.message}</FormError>}
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id='finalFlag'
                            checked={watch('finalFlag')}
                            onCheckedChange={(checked) => setValue('finalFlag', checked as boolean)}
                        />
                        <label htmlFor='finalFlag' className='font-medium text-gray-700 text-sm'>
                            Final Flag
                        </label>
                    </div>
                </div>
            </div>
            {/* Action Buttons */}
            <div className='flex gap-4 pt-4'>
                <Button type='submit' variant='default'>
                    + ADD TO CART
                </Button>
                <Button type='button' variant='outline' onClick={onCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
