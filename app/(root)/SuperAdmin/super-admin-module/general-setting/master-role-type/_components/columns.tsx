'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { deleteMasterRoleType } from '@/server/super-admin/super-admin-module/general-setting/master-role-type';
import type { IMasterRoleType } from '@/types/super-admin/super-admin-module/general-setting/master-role-type';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePageContext } from './page-context';

const ActionCell = ({ row }: { row: any }) => {
    const { openEditForm } = useFormContext<IMasterRoleType>();
    const { refreshData } = usePageContext();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsDeleting(true);
        try {
            const result = await deleteMasterRoleType(row.original.id);
            if (result.success) {
                toast.success(result.message);
                setOpen(false);
                refreshData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Failed to delete master role type:', error);
            toast.error(error instanceof Error ? error.message : 'An error occurred while deleting the role type.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className='flex items-center justify-center gap-2'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='text-primary hover:text-primary/80'
                    title='Edit'
                    onClick={() => openEditForm(row.original)}>
                    <Pencil className='h-4 w-4' />
                </Button>
                <span className='text-gray-300'>|</span>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-destructive hover:bg-destructive/10'
                    title='Delete'
                    aria-label='Delete role type'
                    onClick={() => setOpen(true)}>
                    <Trash2 className='h-4 w-4' />
                </Button>
            </div>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete role type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. If this role type is assigned to users, the server may prevent deletion.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className='bg-destructive hover:bg-destructive/90'>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export const masterRoleTypeColumns: ColumnDef<IMasterRoleType>[] = [
    {
        accessorKey: 'slno',
        header: 'SL.NO',
        cell: ({ row, table }) => {
            const { pagination } = table.getState();
            return pagination.pageIndex * pagination.pageSize + row.index + 1;
        },
        enableSorting: false
    },
    {
        accessorKey: 'roleType', // "Role Name" in UI, corresponds to `ivrmrT_Role`/`roleType`
        header: 'Role Name',
        enableSorting: true,
        cell: ({ row }) => <div className='text-left'>{row.original.roleType}</div>
    },
    {
        accessorKey: 'name', // "Role Type" in UI, corresponds to `name`
        header: 'Role Type',
        enableSorting: true,
        cell: ({ row }) => <div className='text-left'>{row.original.name}</div>
    },
    {
        id: 'actions',
        header: 'Edit | Delete',
        cell: ({ row }) => <ActionCell row={row} />,
        enableSorting: false
    }
];
