'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useCollegeFeePrevilegeList,
    useCollegeFeePrivilegeAcademicYears,
    useCollegeFeePrivilegeFeeGroups,
    useCollegeFeePrivilegeFeeHeads,
    useCollegeFeePrivilegeRoles,
    useCollegeFeePrivilegeUsersByRole
} from '@/hooks/fees/college/useMasters';
import { cn } from '@/lib/utils';
import { collegeFeePrevilegeSchema } from '@/schemas/fees/college/masters/masterclgfeeprevilege';
import { saveCollegeFeePrivilege } from '@/server/fees/college/masters/masterclgfeeprevilege';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, RotateCcw, Save, Search, Square } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

interface AddCollegeFeePrivilegeFormProps {
    onSuccess?: () => void;
    pageData?: any;
    className?: string;
}

type FormFields = z.infer<typeof collegeFeePrevilegeSchema.addOrUpdate>;

function extractArrayData<T = any>(data: any, preferredKeys: string[] = []): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.$values)) return data.$values;
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.data?.$values)) return data.data.$values;

    const source = data.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;

    for (const key of preferredKeys) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
        if (Array.isArray(source[key]?.$values) && source[key].$values.length > 0) {
            return source[key].$values;
        }
    }

    for (const key of Object.keys(source)) {
        if (Array.isArray(source[key]) && source[key].length > 0) {
            return source[key];
        }
    }

    return [];
}

function deduplicateById<T = any>(items: T[], getId: (item: T) => string): T[] {
    const seen = new Set<string>();
    return items.filter((item, index) => {
        const id = getId(item) || `idx-${index}`;
        if (seen.has(id)) {
            return false;
        }
        seen.add(id);
        return true;
    });
}

function getAcademicYearItem(ay: any) {
    const id = ay.asmaY_Id ?? ay.ASMAY_Id ?? ay.yearId ?? ay.id ?? ay.Id;
    const name = ay.asmaY_Year ?? ay.ASMAY_Year ?? ay.yearName ?? ay.asmaY_AcademicYearCode ?? ay.name ?? `Year ${id || ''}`;
    return { id: id ? id.toString() : '', name: String(name || '') };
}

function getGroupItem(g: any) {
    const id = g.fmG_Id ?? g.fmG_ID ?? g.FMG_ID ?? g.fmg_id ?? g.groupId ?? g.id ?? g.Id;
    const name = g.fmG_GroupName ?? g.fmg_groupname ?? g.groupName ?? g.name ?? `Group ${id || ''}`;
    return { id: id ? id.toString() : '', name: String(name || '') };
}

function getHeadItem(h: any) {
    const id = h.fmH_Id ?? h.fmH_ID ?? h.FMH_Id ?? h.FMH_ID ?? h.fmh_id ?? h.headId ?? h.id ?? h.Id;
    const name = h.fmH_FeeName ?? h.feeHeadName ?? h.headName ?? h.feeName ?? h.name ?? `Head ${id || ''}`;
    return { id: id ? id.toString() : '', name: String(name || '') };
}

function getRoleItem(r: any) {
    const id = r.ivrmrT_Id ?? r.ivrmR_Id ?? r.IVRMRT_Id ?? r.IVRMR_Id ?? r.roleId ?? r.role_Id ?? r.id ?? r.Id;
    const name = r.ivrmrT_Role ?? r.ivrmR_Role ?? r.IVRMRT_Role ?? r.IVRMR_Role ?? r.roleName ?? r.role_name ?? r.name ?? r.Name;
    return { id: id ? id.toString() : '', name: String(name || `Role ${id || ''}`) };
}

function getUserItem(u: any) {
    const id = u.userId ?? u.user_Id ?? u.UserId ?? u.User_Id ?? u.id ?? u.Id;
    const name =
        u.normalizedUserName ??
        u.userName ??
        u.UserName ??
        u.normalized_UserName ??
        u.ivrmstAU_UserName ??
        u.name ??
        `User ${id || ''}`;
    return { id: id ? id.toString() : '', name: String(name || '') };
}

export default function AddCollegeFeePrivilegeForm({ onSuccess, pageData, className = '' }: AddCollegeFeePrivilegeFormProps) {
    const { refetchAll } = useCollegeFeePrevilegeList();
    const { data: academicYearsData, isLoading: isAcademicYearsLoading } = useCollegeFeePrivilegeAcademicYears();
    const { data: rolesData, isLoading: isRolesLoading } = useCollegeFeePrivilegeRoles();
    const { data: feeGroupsData, isLoading: isFeeGroupsLoading } = useCollegeFeePrivilegeFeeGroups();
    const { data: feeHeadsData, isLoading: isFeeHeadsLoading } = useCollegeFeePrivilegeFeeHeads();

    const {
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(collegeFeePrevilegeSchema.addOrUpdate),
        defaultValues: {
            academicYear: '',
            group: '',
            heads: [],
            roles: '',
            users: []
        }
    });

    const selectedRole = watch('roles');
    const selectedHeads = watch('heads') || [];
    const selectedUsers = watch('users') || [];

    const { data: userData, isLoading: isUserLoading } = useCollegeFeePrivilegeUsersByRole(
        selectedRole ? Number(selectedRole) : undefined
    );

    const [headSearchTerm, setHeadSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');

    const effectiveData = useMemo(() => {
        return pageData?.data || pageData || {};
    }, [pageData]);

    // 1. Academic Years (/CommonCollegeFee/getacademicyears)
    const academicYears = useMemo(() => {
        const fromApi = extractArrayData(academicYearsData, ['adcyear', 'yearlist', 'academic_year', 'fillyear']);
        const list = fromApi.length > 0 ? fromApi : extractArrayData(effectiveData, ['adcyear', 'yearlist', 'academic_year']);
        return deduplicateById(list, (item) => getAcademicYearItem(item).id);
    }, [academicYearsData, effectiveData]);

    // 2. Roles (/CommonCollegeFee/getroles)
    const roles = useMemo(() => {
        const fromApi = extractArrayData(rolesData, [
            'role',
            'rolelist',
            'roles',
            'fillrole',
            'fillroles',
            'userrtorole',
            'customRoles',
            'userRole',
            'getroles'
        ]);
        const list =
            fromApi.length > 0
                ? fromApi
                : extractArrayData(effectiveData, ['role', 'rolelist', 'roles', 'fillrole', 'fillroles', 'userrtorole']);
        return deduplicateById(list, (item) => getRoleItem(item).id);
    }, [rolesData, effectiveData]);

    // 3. Groups (/CommonCollegeFee/getfeegroups)
    const groups = useMemo(() => {
        const fromApi = extractArrayData(feeGroupsData, ['group', 'grouplist', 'fillgroup', 'groups', 'feegroup']);
        const list = fromApi.length > 0 ? fromApi : extractArrayData(effectiveData, ['group', 'grouplist', 'fillgroup']);
        return deduplicateById(list, (item) => getGroupItem(item).id);
    }, [feeGroupsData, effectiveData]);

    // 4. Heads (/CommonCollegeFee/getfeeheads)
    const heads = useMemo(() => {
        const fromApi = extractArrayData(feeHeadsData, ['head', 'feeheads', 'fillhead', 'heads', 'feehead']);
        const list = fromApi.length > 0 ? fromApi : extractArrayData(effectiveData, ['head', 'feeheads', 'fillhead']);
        return deduplicateById(list, (item) => getHeadItem(item).id);
    }, [feeHeadsData, effectiveData]);

    // 5. Users (/MasterClgFeePrevilegeFacade/getusername?IVRMRT_Id=...)
    const users = useMemo(() => {
        const list = extractArrayData(userData, ['usnam', 'userlist', 'filluser', 'users', 'user_list', 'username']);
        return deduplicateById(list, (item) => getUserItem(item).id);
    }, [userData]);

    // Reset selected users when role changes
    useEffect(() => {
        setValue('users', [], { shouldValidate: false });
        setUserSearchTerm('');
    }, [selectedRole, setValue]);

    // Filter heads based on search
    const filteredHeads = useMemo(() => {
        if (!headSearchTerm.trim()) return heads;
        return heads.filter((h: any) => {
            const { name } = getHeadItem(h);
            return name.toLowerCase().includes(headSearchTerm.trim().toLowerCase());
        });
    }, [heads, headSearchTerm]);

    // Filter users based on search
    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) return users;
        return users.filter((u: any) => {
            const { name } = getUserItem(u);
            return name.toLowerCase().includes(userSearchTerm.trim().toLowerCase());
        });
    }, [users, userSearchTerm]);

    // Head selection handlers
    const isAllHeadsSelected =
        heads.length > 0 &&
        heads.every((h: any) => {
            const { id } = getHeadItem(h);
            return selectedHeads.includes(id);
        });

    const handleSelectAllHeads = () => {
        if (isAllHeadsSelected) {
            setValue('heads', [], { shouldValidate: true });
        } else {
            const allIds = heads.map((h: any) => getHeadItem(h).id).filter(Boolean);
            setValue('heads', allIds, { shouldValidate: true });
        }
    };

    const handleToggleHead = (id: string) => {
        const current = selectedHeads || [];
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        setValue('heads', next, { shouldValidate: true });
    };

    // User selection handlers
    const isAllUsersSelected =
        users.length > 0 &&
        users.every((u: any) => {
            const { id } = getUserItem(u);
            return selectedUsers.includes(id);
        });

    const handleSelectAllUsers = () => {
        if (isAllUsersSelected) {
            setValue('users', [], { shouldValidate: true });
        } else {
            const allIds = users.map((u: any) => getUserItem(u).id).filter(Boolean);
            setValue('users', allIds, { shouldValidate: true });
        }
    };

    const handleToggleUser = (id: string) => {
        const current = selectedUsers || [];
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
        setValue('users', next, { shouldValidate: true });
    };

    const handleReset = () => {
        reset({
            academicYear: '',
            group: '',
            heads: [],
            roles: '',
            users: []
        });
        setHeadSearchTerm('');
        setUserSearchTerm('');
    };

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        try {
            const payload = {
                fgL_Id: 0,
                FGL_Id: 0,
                ASMAY_Id: Number(data.academicYear),
                asmaY_Id: Number(data.academicYear),
                fmG_ID: Number(data.group),
                FMG_ID: Number(data.group),
                IVRMRT_Id: Number(data.roles),
                ivrmrT_Id: Number(data.roles),
                grouphead: data.heads.map((id) => ({ fmH_Id: Number(id), FMH_Id: Number(id) })),
                username: data.users.map((id) => ({ userId: Number(id), UserId: Number(id) }))
            };

            const response = await saveCollegeFeePrivilege(payload);
            const res = response as any;

            if (res?.returnval === true && res?.fgL_Id > 0) {
                toast.success('Record Updated Successfully');
                refetchAll();
                handleReset();
                onSuccess?.();
            } else if (res?.returnval === true || res?.success) {
                toast.success('Record Saved Successfully');
                refetchAll();
                handleReset();
                onSuccess?.();
            } else if (res?.returnval === false && res?.returnduplicatestatus === 'Duplicate') {
                toast.error('Record Already Exist');
            } else {
                toast.error(res?.message || 'Record Not Saved Successfully');
            }
        } catch (error: any) {
            toast.error(error.message ?? 'Failed to save fee privilege');
        }
    };

    return (
        <Card className={cn('border-none shadow-none', className)}>
            <CardContent className='p-0'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                        {/* Left Column: Academic Year, Group, Head */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='academicYear'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Academic Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isAcademicYearsLoading && academicYears.length === 0 ? (
                                                    <SelectItem value='_loading' disabled>
                                                        Loading academic years...
                                                    </SelectItem>
                                                ) : academicYears.length === 0 ? (
                                                    <SelectItem value='_empty' disabled>
                                                        No academic years available
                                                    </SelectItem>
                                                ) : (
                                                    academicYears.map((ay: any, index: number) => {
                                                        const { id, name } = getAcademicYearItem(ay);
                                                        if (!id) return null;
                                                        return (
                                                            <SelectItem key={`ay-${id}-${index}`} value={id}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.academicYear?.message}</FormError>
                            </div>

                            {/* Group */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Group <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='group'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Group--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isFeeGroupsLoading && groups.length === 0 ? (
                                                    <SelectItem value='_loading' disabled>
                                                        Loading groups...
                                                    </SelectItem>
                                                ) : groups.length === 0 ? (
                                                    <SelectItem value='_empty' disabled>
                                                        No groups available
                                                    </SelectItem>
                                                ) : (
                                                    groups.map((g: any, index: number) => {
                                                        const { id, name } = getGroupItem(g);
                                                        if (!id) return null;
                                                        return (
                                                            <SelectItem key={`group-${id}-${index}`} value={id}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.group?.message}</FormError>
                            </div>

                            {/* Fee Heads Multi-Select */}
                            <div className='space-y-1.5'>
                                <div className='flex items-center justify-between'>
                                    <Label className='font-medium text-sm'>
                                        Head <span className='text-destructive'>*</span>
                                    </Label>
                                    <span className='text-muted-foreground text-xs'>
                                        {selectedHeads.length} of {heads.length} selected
                                    </span>
                                </div>

                                <div className='rounded-md border border-input bg-background p-3 shadow-sm'>
                                    {/* Search input & Select All */}
                                    <div className='mb-2 flex items-center justify-between gap-2 border-b pb-2'>
                                        <div className='relative flex-1'>
                                            <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                            <InputText
                                                placeholder='Search Head...'
                                                value={headSearchTerm}
                                                onChange={(e) => setHeadSearchTerm(e.target.value)}
                                                className='h-8 pl-8 text-xs'
                                            />
                                        </div>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={handleSelectAllHeads}
                                            disabled={heads.length === 0}
                                            className='h-8 text-xs'>
                                            {isAllHeadsSelected ? (
                                                <>
                                                    <CheckSquare className='mr-1.5 h-3.5 w-3.5 text-primary' /> Deselect All
                                                </>
                                            ) : (
                                                <>
                                                    <Square className='mr-1.5 h-3.5 w-3.5' /> Select All
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Heads list */}
                                    <div className='max-h-48 space-y-1 overflow-y-auto pr-1'>
                                        {isFeeHeadsLoading && heads.length === 0 ? (
                                            <div className='py-4 text-center text-muted-foreground text-xs'>Loading heads...</div>
                                        ) : filteredHeads.length === 0 ? (
                                            <div className='py-4 text-center text-muted-foreground text-xs'>
                                                {heads.length === 0 ? 'No heads available' : 'No matching heads found'}
                                            </div>
                                        ) : (
                                            filteredHeads.map((head: any, index: number) => {
                                                const { id: idStr, name } = getHeadItem(head);
                                                if (!idStr) return null;
                                                const isChecked = selectedHeads.includes(idStr);
                                                const key = `head-item-${idStr}-${index}`;
                                                return (
                                                    <label
                                                        key={key}
                                                        className={cn(
                                                            'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70',
                                                            isChecked && 'bg-primary/10 font-medium text-primary'
                                                        )}>
                                                        <input
                                                            type='checkbox'
                                                            className='h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary'
                                                            checked={isChecked}
                                                            onChange={() => handleToggleHead(idStr)}
                                                        />
                                                        <span>{name}</span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                                <FormError>{errors.heads?.message}</FormError>
                            </div>
                        </div>

                        {/* Right Column: Roles, User Name */}
                        <div className='space-y-4'>
                            {/* Roles */}
                            <div className='space-y-1.5'>
                                <Label className='font-medium text-sm'>
                                    Roles <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='roles'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className='w-full'>
                                                <SelectValue placeholder='--Select Role--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isRolesLoading && roles.length === 0 ? (
                                                    <SelectItem value='_loading' disabled>
                                                        Loading roles...
                                                    </SelectItem>
                                                ) : roles.length === 0 ? (
                                                    <SelectItem value='_empty' disabled>
                                                        No roles available
                                                    </SelectItem>
                                                ) : (
                                                    roles.map((r: any, index: number) => {
                                                        const { id, name } = getRoleItem(r);
                                                        if (!id) return null;
                                                        return (
                                                            <SelectItem key={`role-${id}-${index}`} value={id}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <FormError>{errors.roles?.message}</FormError>
                            </div>

                            {/* User Name Multi-Select */}
                            {selectedRole && (
                                <div className='fade-in-50 animate-in space-y-1.5 duration-200'>
                                    <div className='flex items-center justify-between'>
                                        <Label className='font-medium text-sm'>
                                            User Name <span className='text-destructive'>*</span>
                                        </Label>
                                        <span className='text-muted-foreground text-xs'>
                                            {selectedUsers.length} of {users.length} selected
                                        </span>
                                    </div>

                                    <div className='rounded-md border border-input bg-background p-3 shadow-sm'>
                                        {/* Search input & Select All */}
                                        <div className='mb-2 flex items-center justify-between gap-2 border-b pb-2'>
                                            <div className='relative flex-1'>
                                                <Search className='-translate-y-1/2 absolute top-1/2 left-2.5 h-3.5 w-3.5 text-muted-foreground' />
                                                <InputText
                                                    placeholder='Search User...'
                                                    value={userSearchTerm}
                                                    onChange={(e) => setUserSearchTerm(e.target.value)}
                                                    className='h-8 pl-8 text-xs'
                                                />
                                            </div>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={handleSelectAllUsers}
                                                disabled={users.length === 0 || isUserLoading}
                                                className='h-8 text-xs'>
                                                {isAllUsersSelected ? (
                                                    <>
                                                        <CheckSquare className='mr-1.5 h-3.5 w-3.5 text-primary' /> Deselect All
                                                    </>
                                                ) : (
                                                    <>
                                                        <Square className='mr-1.5 h-3.5 w-3.5' /> Select All
                                                    </>
                                                )}
                                            </Button>
                                        </div>

                                        {/* Users list */}
                                        <div className='max-h-48 space-y-1 overflow-y-auto pr-1'>
                                            {isUserLoading ? (
                                                <div className='py-4 text-center text-muted-foreground text-xs'>Loading users...</div>
                                            ) : filteredUsers.length === 0 ? (
                                                <div className='py-4 text-center text-muted-foreground text-xs'>
                                                    {users.length === 0 ? 'No users found for this role' : 'No matching users found'}
                                                </div>
                                            ) : (
                                                filteredUsers.map((user: any, index: number) => {
                                                    const { id: idStr, name } = getUserItem(user);
                                                    if (!idStr) return null;
                                                    const isChecked = selectedUsers.includes(idStr);
                                                    const key = `user-item-${idStr}-${index}`;
                                                    return (
                                                        <label
                                                            key={key}
                                                            className={cn(
                                                                'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/70',
                                                                isChecked && 'bg-primary/10 font-medium text-primary'
                                                            )}>
                                                            <input
                                                                type='checkbox'
                                                                className='h-4 w-4 rounded border-gray-300 text-primary accent-primary focus:ring-primary'
                                                                checked={isChecked}
                                                                onChange={() => handleToggleUser(idStr)}
                                                            />
                                                            <span>{name}</span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    <FormError>{errors.users?.message}</FormError>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-center gap-4 border-t pt-4'>
                        <Button type='submit' isLoading={isSubmitting} className='min-w-28'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </Button>
                        <Button type='button' variant='outline' onClick={handleReset} className='min-w-28'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
