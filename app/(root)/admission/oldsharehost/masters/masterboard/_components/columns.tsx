'use client';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import { getMasterBoardDetails } from '@/server/admission/oldsharedhost/masters/master-board';
import type { IMasterBoard } from '@/types/admission/oldsharedhost/masters/master-board';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export const columns: ColumnDef<IMasterBoard>[] = [
    {
        accessorKey: 'ivrmmB_Name',
        header: () => <div className='text-center font-bold text-black'>Board Name</div>,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmB_Name')}</div>
    },
    {
        accessorKey: 'ivrmmB_Description',
        header: () => <div className='text-center font-bold text-black'>Board Description</div>,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ivrmmB_Description')}</div>
    },
    {
        id: 'actions',
        header: () => <div className='text-center font-bold text-black'>Actions</div>,
        cell: ({ row }) => {
            const masterBoard = row.original;
            const { openEditForm, openDeleteForm } = useFormContext<IMasterBoard>();

            return (
                <div className='flex justify-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => {
                            const id = masterBoard.ivrmmB_Id || (masterBoard as any).IVRMMB_Id || (masterBoard as any).ivrmmB_id || 0;
                            getMasterBoardDetails(id)
                                .then((res) => {
                                    let freshData = masterBoard;
                                    if (res && res.success && res.data) {
                                        if (Array.isArray(res.data) && res.data.length > 0) {
                                            freshData = res.data[0];
                                        } else if (res.data.editboard && res.data.editboard.length > 0) {
                                            freshData = res.data.editboard[0];
                                        } else if (res.data.boardList && res.data.boardList.length > 0) {
                                            freshData = res.data.boardList[0];
                                        }
                                    }
                                    openEditForm(freshData);
                                })
                                .catch(() => {
                                    openEditForm(masterBoard);
                                });
                        }}
                        className='h-8 w-8 text-blue-500 hover:bg-blue-50'
                        title='Edit'>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => openDeleteForm(masterBoard)}
                        className='h-8 w-8 text-red-500 hover:bg-red-50'
                        title='Delete'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
