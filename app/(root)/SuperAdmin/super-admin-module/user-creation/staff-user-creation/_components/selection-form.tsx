'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InstitutionDTO, RoleTypeDTO, StaffDTO, TrustDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface SelectionFormProps {
    roleTypes: RoleTypeDTO[];
    trusts: TrustDTO[];
    institutions: InstitutionDTO[];
    staffList: StaffDTO[];
    isOnloadLoading?: boolean;
    isStaffListLoading?: boolean;
    isStaffDataLoading?: boolean;
    isInstitutionsLoading?: boolean;
    onStaffCheckboxChange?: (id: number, checked: boolean) => void;
    onSelectAllStaff?: () => void;
    onViewUsernames?: () => void;
    showViewUsernames?: boolean;
    onInstitutionCheckboxChange?: (id: number, checked: boolean) => void;
    onSelectAllInstitutions?: () => void;
}

export default function SelectionForm({
    roleTypes,
    trusts,
    institutions,
    staffList,
    isOnloadLoading = false,
    isStaffListLoading = false,
    isStaffDataLoading = false,
    isInstitutionsLoading = false,
    onStaffCheckboxChange,
    onSelectAllStaff,
    onViewUsernames,
    showViewUsernames,
    onInstitutionCheckboxChange,
    onSelectAllInstitutions
}: SelectionFormProps) {
    const {
        control,
        watch,
        formState: { errors }
    } = useFormContext();
    const [staffSearch, setStaffSearch] = useState('');

    const watchRoleType = watch('roleType');
    const watchInstitution = watch('institution');
    const watchFilterData = watch('filterData');

    const isRoleSelected = !!watchRoleType && watchRoleType !== '';
    const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
    const roleName = selectedRole?.ivrmrT_Role || '';
    const isAdmin = roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER ADMIN';
    const filterData = watchFilterData || 'Single';

    const hasInstitutionSelected = isAdmin
        ? institutions.some((i) => i.Selected)
        : !!watchInstitution;

    const filteredStaff = staffList.filter(
        (s) =>
            s.stafname.toLowerCase().includes(staffSearch.toLowerCase()) ||
            s.hrmE_EmployeeCode?.toLowerCase().includes(staffSearch.toLowerCase())
    );

    const allSelected = staffList.length > 0 && staffList.every((s) => s.Selected);

    return (
        <div className='grid grid-cols-1 gap-6 rounded-lg border border-gray-200 bg-gray-50 p-6 md:grid-cols-2'>
            {/* Role Type (Always Visible) */}
            <div className='col-span-1 space-y-2'>
                <Label className='font-semibold text-sm'>
                    Select Role Type: <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    control={control}
                    name='roleType'
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isOnloadLoading}>
                            <SelectTrigger className='bg-white'>
                                <SelectValue placeholder={isOnloadLoading ? 'Loading...' : '-- SELECT ROLE --'} />
                            </SelectTrigger>
                            <SelectContent>
                                {roleTypes.map((role) => (
                                    <SelectItem key={role.ivrmrT_Id} value={String(role.ivrmrT_Id)}>
                                        {role.ivrmrT_Role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.roleType && <p className='font-medium text-red-500 text-xs'>{errors.roleType.message as string}</p>}
            </div>

            {/* Render rest of selection controls ONLY when Role Type is selected */}
            {isRoleSelected && (
                <>
                    {/* Trust Selection (If trusts exist or required for role) */}
                    {trusts.length > 0 && isAdmin && (
                        <div className='space-y-2'>
                            <Label className='font-semibold text-sm'>
                                Trust Name: <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='trust'
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isOnloadLoading || isInstitutionsLoading}>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue placeholder={isOnloadLoading ? 'Loading...' : '-- SELECT TRUST --'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {trusts.map((trust) => (
                                                <SelectItem key={trust.mO_Id} value={String(trust.mO_Id)}>
                                                    {trust.mO_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    )}

                    {/* Institution Selection */}
                    <div className={`space-y-2 ${isAdmin ? 'md:col-span-2' : ''}`}>
                        <Label className='font-semibold text-sm'>
                            {isAdmin ? 'Institutions Name:' : 'Institution Name:'}{' '}
                            <span className='text-red-500'>*</span>
                        </Label>

                        {isAdmin ? (
                            <div className='rounded-md border bg-white'>
                                <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                                    <Label className='font-bold text-primary text-xs'>INSTITUTIONS LIST</Label>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='all-inst'
                                            checked={institutions.length > 0 && institutions.every((i) => i.Selected)}
                                            onCheckedChange={onSelectAllInstitutions}
                                        />
                                        <Label htmlFor='all-inst' className='cursor-pointer font-bold text-xs'>
                                            ALL
                                        </Label>
                                    </div>
                                </div>
                                <ScrollArea className='h-32'>
                                    {isOnloadLoading || isInstitutionsLoading ? (
                                        <p className='p-4 text-center text-gray-500 text-xs'>Loading institutions...</p>
                                    ) : institutions.length === 0 ? (
                                        <p className='p-4 text-center text-gray-500 text-xs'>No institutions found for selected trust.</p>
                                    ) : (
                                        <div className='grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3'>
                                            {institutions.map((inst) => (
                                                <div
                                                    key={inst.mI_Id}
                                                    className='flex items-center space-x-2 rounded border border-gray-100 p-2 transition-colors hover:bg-gray-100'>
                                                    <Checkbox
                                                        id={`inst-${inst.mI_Id}`}
                                                        checked={inst.Selected}
                                                        onCheckedChange={(checked) => onInstitutionCheckboxChange?.(inst.mI_Id, !!checked)}
                                                    />
                                                    <Label
                                                        htmlFor={`inst-${inst.mI_Id}`}
                                                        className='cursor-pointer select-none text-xs leading-none'>
                                                        {inst.mI_Name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        ) : (
                            <Controller
                                control={control}
                                name='institution'
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        disabled={isOnloadLoading || isInstitutionsLoading || institutions.length === 0}>
                                        <SelectTrigger className='bg-white'>
                                            <SelectValue
                                                placeholder={
                                                    isOnloadLoading || isInstitutionsLoading
                                                        ? 'Loading...'
                                                        : institutions.length === 0
                                                        ? 'No institutions available'
                                                        : '-- SELECT INSTITUTION --'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {institutions.map((inst) => (
                                                <SelectItem key={inst.mI_Id} value={String(inst.mI_Id)}>
                                                    {inst.mI_Name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        )}
                        {errors.institution && <p className='font-medium text-red-500 text-xs'>{errors.institution.message as string}</p>}
                    </div>

                    {/* Staff & Radio controls (Rendered when institution is selected) */}
                    {hasInstitutionSelected && (
                        <>

                            {/* Selection Mode (Single/Multiple) - Only for Staff */}
                            {!isAdmin && (
                                <div className=''>
                                    <div>
                                        {/* VIEW ROLE USERS!! */}
                                        {hasInstitutionSelected && (
                                            <div className='pt-1 '>
                                                <Button
                                                    type='button'
                                                    variant='link'
                                                    onClick={onViewUsernames}
                                                    className='h-auto px-0 font-bold text-red-500 uppercase underline decoration-2 underline-offset-4 hover:text-red-700 flex justify-start'>
                                                    VIEW ROLE USERS!!
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <Controller
                                        control={control}
                                        name='filterData'
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-6 pt-2'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Single' id='r1' />
                                                    <Label htmlFor='r1' className='cursor-pointer'>
                                                        Individual Staff
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Multiple' id='r2' />
                                                    <Label htmlFor='r2' className='cursor-pointer'>
                                                        Multiple Staff
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            )}

                            {/* View Admin Usernames for Admin */}
                            {isAdmin && hasInstitutionSelected && (
                                <div className='pt-1 md:col-span-2'>
                                    <Button
                                        type='button'
                                        variant='link'
                                        onClick={onViewUsernames}
                                        className='h-auto px-0 font-bold text-red-500 uppercase underline decoration-2 underline-offset-4 hover:text-red-700 flex justify-start'>
                                        VIEW ADMIN USERNAMES!!
                                    </Button>
                                </div>
                            )}

                            {/* Add/Remove Pages (Only for Multiple Staff) */}
                            {!isAdmin && filterData === 'Multiple' && (
                                <div className='space-y-4 rounded border border-blue-100 bg-blue-50/50 p-4 md:col-span-2'>
                                    <Label className='font-semibold text-blue-800 text-sm'>Permission Action:</Label>
                                    <Controller
                                        control={control}
                                        name='adddelte'
                                        render={({ field }) => (
                                            <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-10 pt-1'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Add' id='a1' className='border-blue-400 text-blue-600' />
                                                    <Label htmlFor='a1' className='cursor-pointer font-medium'>
                                                        Add Pages / Permissions
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='Del' id='a2' className='border-red-400 text-red-500' />
                                                    <Label htmlFor='a2' className='cursor-pointer font-medium'>
                                                        Remove Pages / Permissions
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Staff Selection (Only for Staff roles) */}
                            {!isAdmin && (
                                <div className='space-y-2 md:col-span-2'>
                                    <Label className='font-semibold text-sm'>
                                        {filterData === 'Single' ? 'Select Staff Name:' : "Staff's Name:"}{' '}
                                        <span className='text-red-500'>*</span>
                                    </Label>

                                    {filterData === 'Single' ? (
                                        <Controller
                                            control={control}
                                            name='staffId'
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isStaffListLoading || isStaffDataLoading || staffList?.length === 0}>
                                                    <SelectTrigger className='max-w-md bg-white'>
                                                        <SelectValue
                                                            placeholder={
                                                                isStaffListLoading
                                                                    ? 'Loading list...'
                                                                    : isStaffDataLoading
                                                                        ? 'Loading data...'
                                                                        : '-- SELECT STAFF --'
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {staffList.map((staff) => (
                                                            <SelectItem key={staff.hrmE_Id} value={String(staff.hrmE_Id)}>
                                                                {staff.stafname}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    ) : (
                                        <div className='rounded-md border bg-white'>
                                            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                                                <div className='relative max-w-sm flex-1'>
                                                    <Input
                                                        placeholder='Search Employee here...'
                                                        className='h-8 pl-8 text-xs'
                                                        value={staffSearch}
                                                        onChange={(e) => setStaffSearch(e.target.value)}
                                                    />
                                                    <div className='absolute top-2.5 left-2.5'>
                                                        <svg
                                                            xmlns='http://www.w3.org/2000/svg'
                                                            width='14'
                                                            height='14'
                                                            viewBox='0 0 24 24'
                                                            fill='none'
                                                            stroke='currentColor'
                                                            strokeWidth='2'
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            className='text-gray-400'>
                                                            <circle cx='11' cy='11' r='8'></circle>
                                                            <line x1='21' y1='21' x2='16.65' y2='16.65'></line>
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox id='all-staff' checked={allSelected} onCheckedChange={onSelectAllStaff} />
                                                    <Label htmlFor='all-staff' className='cursor-pointer font-bold text-xs'>
                                                        ALL
                                                    </Label>
                                                </div>
                                            </div>
                                            <ScrollArea className='h-48'>
                                                {isStaffListLoading ? (
                                                    <p className='p-4 text-center text-gray-500 text-xs'>Loading staff...</p>
                                                ) : (
                                                    <div className='grid grid-cols-1 gap-2 p-2 sm:grid-cols-2 lg:grid-cols-3'>
                                                        {filteredStaff.map((staff) => (
                                                            <div
                                                                key={staff.hrmE_Id}
                                                                className='flex items-center space-x-2 rounded border border-gray-100 p-2 transition-colors hover:bg-gray-100'>
                                                                <Checkbox
                                                                    id={`staff-${staff.hrmE_Id}`}
                                                                    checked={staff.Selected}
                                                                    onCheckedChange={(checked) =>
                                                                        onStaffCheckboxChange?.(staff.hrmE_Id, !!checked)
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`staff-${staff.hrmE_Id}`}
                                                                    className='cursor-pointer select-none text-xs leading-none'>
                                                                    {staff.stafname}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}