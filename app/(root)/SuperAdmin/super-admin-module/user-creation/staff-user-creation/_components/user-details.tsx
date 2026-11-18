'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CategoryDTO, ModuleDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { Loader2, UserCog } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

interface UserDetailsProps {
    categories: CategoryDTO[];
    onCategoryChange: (categories: CategoryDTO[]) => void;
    modules: ModuleDTO[];
    onModuleChange: (modules: ModuleDTO[]) => void;
    onSelectAllCategories: () => void;
    onSelectAllModules: () => void;
    onAdminUsernameBlur?: (username: string) => void | Promise<void>;
    isUserNameDisabled?: boolean;
    onChangeUsernameToggle?: () => void;
    isStaffDataLoading?: boolean;
    isAdmin?: boolean;
}

export default function UserDetails({
    categories,
    onCategoryChange,
    modules,
    onModuleChange,
    onSelectAllCategories,
    onSelectAllModules,
    onAdminUsernameBlur,
    isUserNameDisabled = false,
    onChangeUsernameToggle,
    isStaffDataLoading = false,
    isAdmin = false
}: UserDetailsProps) {
    const { register, watch } = useFormContext();
    const userNameRegistration = register('userName');
    const filterData = watch('filterData');

    const handleCategoryCheck = (catId: number, checked: boolean) => {
        const updatedCategories = categories.map((cat) => (cat.amC_Id === catId ? { ...cat, catid: checked } : cat));
        onCategoryChange(updatedCategories);
    };

    const handleModuleCheck = (modId: number, checked: boolean) => {
        const updatedModules = modules.map((mod) => (mod.ivrmM_Id === modId ? { ...mod, model: checked } : mod));
        onModuleChange(updatedModules);
    };

    return (
        <div className='grid grid-cols-1 gap-8 rounded-lg border border-gray-100 bg-white p-6 shadow-sm md:grid-cols-2'>
            {/* User Credentials */}
            <div className={`space-y-6 ${!isAdmin && filterData === 'Multiple' ? 'pointer-events-none opacity-40 grayscale' : ''}`}>
                <div className='space-y-2'>
                    <Label className='font-semibold text-sm'>User Name: <span className='text-red-500'>*</span></Label>
                    <div className='flex items-center gap-2'>
                        <Input
                            {...userNameRegistration}
                            onBlur={async (event) => {
                                const username = event.currentTarget.value;
                                await userNameRegistration.onBlur(event);
                                if (isAdmin) {
                                    await onAdminUsernameBlur?.(username);
                                }
                            }}
                            className='bg-gray-50  placeholder:text-gray-500 placeholder:normal-case'
                            placeholder={!isAdmin && filterData === 'Multiple' ? 'N/A FOR MULTIPLE' : 'ENTER USERNAME'}
                            readOnly={isUserNameDisabled}
                            disabled={!isAdmin && filterData === 'Multiple'}
                        />
                        {(
                            <Button
                                type='button'
                                variant='secondary'
                                onClick={onChangeUsernameToggle}
                                // disabled={filterData === 'Multiple' || !isUserNameDisabled}
                                size='sm'
                                className='font-bold text-[10px] uppercase'>
                                <UserCog className='mr-2 h-3.5 w-3.5' />
                                Change Username
                            </Button>
                        )}
                    </div>
                </div>
                {
                    !isAdmin && (
                        <div className='rounded-md border-orange-400 border-l-4 bg-orange-50 p-4'>
                            <p className='font-medium text-orange-800 text-sm'>
                                {!isAdmin && filterData === 'Multiple' ? (
                                    'Password settings will be managed individually for each selected staff.'
                                ) : (
                                    <>
                                        Initial password is <strong>Password@123</strong>
                                    </>
                                )}
                            </p>
                        </div>
                    )
                }
            </div>

            {/* Selection Lists (Modules) */}
            <div className='space-y-2'>
                <Label className='flex items-center justify-between font-semibold text-sm'>
                    Select Module:
                    <span onClick={onSelectAllModules} className='cursor-pointer text-[10px] text-primary hover:underline'>
                        Select All/Unselect All
                    </span>
                </Label>
                <div className='rounded-md border bg-gray-50 p-2'>
                    <ScrollArea className='h-40'>
                        {modules.length === 0 && (
                            <p className='p-4 text-center text-gray-500 text-xs'>
                                {isAdmin ? 'No modules found for selected institution.' : 'Please Select Staff to view modules.'}
                            </p>
                        )}
                        <div className='grid grid-cols-1 gap-1 sm:grid-cols-2'>
                            {modules.map((mod) => (
                                <div
                                    key={mod.ivrmM_Id}
                                    className='flex items-center space-x-2 rounded p-1.5 transition-colors hover:bg-white'>
                                    <Checkbox
                                        id={`mod-${mod.ivrmM_Id}`}
                                        checked={mod.model}
                                        onCheckedChange={(checked) => handleModuleCheck(mod.ivrmM_Id, !!checked)}
                                    />
                                    <label htmlFor={`mod-${mod.ivrmM_Id}`} className='cursor-pointer select-none text-xs'>
                                        {mod.ivrmM_ModuleName}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
