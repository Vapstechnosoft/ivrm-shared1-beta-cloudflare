'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import { useDeleteMasterActivity } from '@/hooks/admission/preadmission/useMasterActivity';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export const masterActivityColumns: ColumnDef<IMasterActivityList>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. NO' />,
        cell: ({ row }) => <div className='pl-4'>{row.index + 1}</div>,
        size: 80
    },
    {
        accessorKey: 'amA_Activity',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Activity Name' />,
        cell: ({ row }) => <div>{row.getValue('amA_Activity')}</div>
    },
    {
        accessorKey: 'amA_Activity_Desc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
        cell: ({ row }) => <div>{row.getValue('amA_Activity_Desc')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='justify-center' />,
        cell: function ActionCell({ row: { original: row } }) {
            const { openEditForm } = useFormContext<IMasterActivityList>();
            const deleteMutation = useDeleteMasterActivity();

            const handleDelete = async () => {
                const result = await Swal.fire({
                    title: 'Are you sure?',
                    text: 'Do you want to delete this item?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!',
                    cancelButtonText: 'No, cancel'
                });

                if (result.isConfirmed) {
                    toast.loading('Deleting...', { id: 'delete' });
                    try {
                        const res = await deleteMutation.mutateAsync(row.amA_Id);
                        if (res.message === 'Delete') {
                            toast.error('You Can Not Delete This Record It Is Already Mapped With Student', { id: 'delete' });
                        } else {
                            toast.success('Record Deleted Successfully', { id: 'delete' });
                        }
                    } catch (error) {
                        toast.error('Failed to delete record', { id: 'delete' });
                    }
                }
            };

            return (
                <div className='flex justify-center gap-2'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditForm(row)}
                        className='h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary'>
                        <Pencil className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleDelete}
                        className='h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        size: 100
    }
];
