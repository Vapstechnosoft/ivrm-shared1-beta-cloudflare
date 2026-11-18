'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { AdaptiveBody, AdaptiveDialog, AdaptiveFooter } from '@/components/ui/extension/adaptive-dialog';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useMasterLibraryEditData,
    useMasterLibraryMapping,
    useMasterLibrarySaveStaffMapping
} from '@/hooks/library/useMasterLibraryMapping';
import { toggleDeactivateStaffData } from '@/server/library/masters/master_library';
import { Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export function LibraryMapStaffTab({
    selectedLibraryId,
    setSelectedLibraryId
}: {
    selectedLibraryId?: string;
    setSelectedLibraryId?: (id: string) => void;
}) {
    const { libraries, roles, staff, staffMappings, isLoading: isLibLoading, refetchAll } = useMasterLibraryMapping();
    const { fetchEditStaff } = useMasterLibraryEditData();
    const saveMapping = useMasterLibrarySaveStaffMapping();
    const [selectedLibrary, setSelectedLibrary] = useState<string>(selectedLibraryId || '');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [selectedUserMappingId, setSelectedUserMappingId] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (selectedLibraryId) {
            setSelectedLibrary(selectedLibraryId);
        }
    }, [selectedLibraryId]);

    const handleLibraryChange = (val: string) => {
        setSelectedLibrary(val);
        setSelectedLibraryId?.(val);
    };

    // Toggle Modal State
    console.log('DEBUG: render lists - roles =', roles, 'staff =', staff);
    const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
    const [toggleData, setToggleData] = useState<any>(null);
    const [isToggling, setIsToggling] = useState(false);

    const handleSave = async () => {
        if (!selectedLibrary || !selectedRole || !selectedUser) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        const payload = {
            LUL_Id: Number(selectedUserMappingId),
            LMAL_Id: Number(selectedLibrary),
            IVRMUL_Id: Number(selectedUser)
        };

        try {
            const response: any = await saveMapping.mutateAsync(payload);
            if (response.returnval || response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Staff mapping saved successfully!');
                handleCancel();
                refetchAll();
            } else {
                toast.error(response.message || 'Failed to save mapping');
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedLibrary('');
        setSelectedRole('');
        setSelectedUser('');
        setSelectedUserMappingId(0);
    };

    const openToggleDialog = (libData: any) => {
        setToggleData(libData);
        setIsToggleModalOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!toggleData) return;
        setIsToggling(true);
        try {
            const response: any = await toggleDeactivateStaffData({ luL_Id: Number(toggleData.luL_Id) });
            if (response.returnval || response.success || response.message?.toLowerCase().includes('success')) {
                toast.success(response.message || 'Status updated successfully');
                refetchAll();
                setIsToggleModalOpen(false);
            } else {
                toast.error(response.message || 'Failed to update status');
            }
        } catch (error) {
            toast.error('An error occurred while toggling status');
        } finally {
            setIsToggling(false);
        }
    };

    const tableProps = useDataTableProps({
        data: (staffMappings || []).map((item: any, index: number) => ({
            ...item,
            slNo: index + 1,
            libraryName: item.lmaL_LibraryName || item.libraryName || '---',
            userName: item.hrmE_EmployeeFirstName || item.userName || '---'
        }))
    });

    return (
        <div className='space-y-4'>
            <div className='mx-auto max-w-3xl'>
                <CollapsibleSection title='MASTER LIBRARY' defaultOpen variant='outline' size='md' className='shadow-lg duration-300'>
                    <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right font-medium text-sm'>
                                    Library Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedLibrary} value={selectedLibrary} onValueChange={handleLibraryChange}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Library--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(libraries || []).map((lib: any) => (
                                                <SelectItem
                                                    key={lib.lmaL_Id || `lib-${Math.random()}`}
                                                    value={lib.lmaL_Id?.toString() || ''}>
                                                    {lib.lmaL_LibraryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right font-medium text-sm'>
                                    User Name:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedUser} value={selectedUser} onValueChange={setSelectedUser}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select User--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(staff || []).map((s: any) => {
                                                const userId = s.ivrmuL_Id || s.hRmE_Id || s.hrmE_Id || s.userId || s.id;
                                                const userName =
                                                    s.empName ||
                                                    s.normalizedUserName ||
                                                    s.ivrmuL_UserName ||
                                                    `${s.hrmE_EmployeeFirstName || ''} ${s.hrmE_EmployeeLastName || ''}`.trim() ||
                                                    s.userName ||
                                                    s.hrmE_EmployeeFirstName;
                                                return (
                                                    <SelectItem key={userId || `staff-${Math.random()}`} value={userId?.toString() || ''}>
                                                        {userName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex items-center gap-4'>
                                <label className='min-w-[100px] text-right font-medium text-sm'>
                                    Role Type:<span className='text-red-500'>*</span>
                                </label>
                                <div className='flex-1'>
                                    <Select key={selectedRole} value={selectedRole} onValueChange={setSelectedRole}>
                                        <SelectTrigger className='h-9'>
                                            <SelectValue placeholder='--Select Role--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(roles || []).map((r: any) => {
                                                const roleId = r.ivrmrT_Id || r.roleTypeId || r.ivrm_Role_Id || r.roleId;
                                                const roleName =
                                                    r.ivrmrT_RoleFlag || r.ivrmrT_Role || r.roleName || r.ivrm_Role_Name || r.roleTypeName;
                                                return (
                                                    <SelectItem key={roleId || `role-${Math.random()}`} value={roleId?.toString() || ''}>
                                                        {roleName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4 flex justify-center gap-3 border-t pt-4'>
                        <Button onClick={handleSave} disabled={isSaving} className='h-8 bg-[#4251b1] px-6 text-xs hover:bg-[#35418e]'>
                            <Save className='mr-2 h-3.5 w-3.5' />
                            {isSaving ? 'SAVING...' : 'SAVE'}
                        </Button>
                        <Button onClick={handleCancel} variant='destructive' className='h-8 px-6 text-xs'>
                            <X className='mr-2 h-3.5 w-3.5' />
                            CANCEL
                        </Button>
                    </div>
                </CollapsibleSection>
            </div>

            <CollapsibleSection title='STAFF DETAILS' defaultOpen variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    isLoading={isLibLoading}
                    columns={[
                        { accessorKey: 'slNo', header: 'Sl.No.', size: 80 },
                        { accessorKey: 'libraryName', header: 'Library Name' },
                        { accessorKey: 'userName', header: 'User Name' },
                        {
                            id: 'actions',
                            header: 'Action',
                            size: 150,
                            cell: ({ row }) => (
                                <ActionButtons
                                    rowData={row.original}
                                    buttons={{ edit: true, toggle: true }}
                                    onEdit={async (data) => {
                                        console.log('DEBUG: onEdit triggered with row data:', data);
                                        setSelectedLibrary(data.lmaL_Id.toString());
                                        try {
                                            const mappingId = data.luL_Id || data.lmL_Id || data.lmaL_Id;
                                            console.log('DEBUG: calling fetchEditStaff with id1:', data.lmaL_Id, 'id2:', mappingId);
                                            const response: any = await fetchEditStaff({ id1: data.lmaL_Id, id2: mappingId });
                                            console.log('DEBUG: fetchEditStaff raw response:', response);
                                            const editDataList = response?.data || response;
                                            const editData = Array.isArray(editDataList) ? editDataList[0] : editDataList;
                                            console.log('DEBUG: resolved editData:', editData);

                                            const resolvedRole =
                                                editData?.roleTypeId?.toString() ||
                                                editData?.ivrmrT_Id?.toString() ||
                                                data.ivrmrT_Id?.toString() ||
                                                data.roleTypeId?.toString() ||
                                                '';
                                            const resolvedUser =
                                                editData?.ivrmuL_Id?.toString() ||
                                                editData?.hRmE_Id?.toString() ||
                                                editData?.hrmE_Id?.toString() ||
                                                editData?.userId?.toString() ||
                                                data.ivrmuL_Id?.toString() ||
                                                data.hRmE_Id?.toString() ||
                                                data.hrmE_Id?.toString() ||
                                                '';
                                            console.log('DEBUG: resolvedRole =', resolvedRole, 'resolvedUser =', resolvedUser);

                                            setSelectedRole(resolvedRole);
                                            setSelectedUser(resolvedUser);
                                            setSelectedUserMappingId(editData?.luL_Id || data.luL_Id || 0);
                                            toast.success('Mapping details loaded');
                                        } catch (error) {
                                            console.error('DEBUG: error in onEdit fetch:', error);
                                            toast.error('Failed to fetch details');
                                        }
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    onToggle={() => openToggleDialog(row.original)}
                                    toggleConditionKey='luL_ActiveFlg'
                                />
                            )
                        }
                    ]}
                    columnPinning={{ right: ['actions'] }}
                    noDataTitle='No Records Found'
                />
            </CollapsibleSection>

            {/* Confirmation Dialog for Toggle */}
            <AdaptiveDialog title='Toggle Mapping Status' isOpen={isToggleModalOpen} onClose={() => setIsToggleModalOpen(false)}>
                <AdaptiveBody className='flex flex-col gap-5'>
                    <p className='text-slate-600 text-sm'>
                        Are you sure you want to {toggleData?.luL_ActiveFlg ? 'deactivate' : 'activate'} record{' '}
                        <strong>{toggleData?.libraryName}</strong>?
                    </p>
                </AdaptiveBody>
                <AdaptiveFooter>
                    <Button
                        variant='secondary'
                        onClick={() => setIsToggleModalOpen(false)}
                        type='button'
                        className='h-9 px-6 text-xs'
                        disabled={isToggling}>
                        CANCEL
                    </Button>
                    <Button
                        onClick={confirmToggleStatus}
                        variant={toggleData?.luL_ActiveFlg ? 'destructive' : 'default'}
                        className='h-9 px-6 text-xs'
                        isLoading={isToggling}
                        disabled={isToggling}>
                        {toggleData?.luL_ActiveFlg ? 'DEACTIVATE' : 'ACTIVATE'}
                    </Button>
                </AdaptiveFooter>
            </AdaptiveDialog>
        </div>
    );
}
