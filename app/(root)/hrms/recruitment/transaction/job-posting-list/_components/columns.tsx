'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye } from 'lucide-react';

export interface JobPostingListItem {
    hrmrfr_Id: number;
    hrmrfr_MRFNO: string;
    hrmP_Position: string;
    hrmD_DepartmentName: string;
    hrmrfr_JobLocation: string;
    hrmrfr_NoofPosition: number;
    hrmrfr_Skills: string;
    hrmrfr_ActiveFlg?: boolean;
}

export const jobPostingListColumns: ColumnDef<any>[] = [
    {
        id: 'serialNumber',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row }) => <div className='font-medium'>{row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'hrmrfR_MRFNO',
        header: ({ column }) => <DataTableColumnHeader column={column} title='MRF No.' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmrfR_MRFNO') || '-'}</div>
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('hrmD_DepartmentName') || '-'}</div>
    },
    {
        accessorKey: 'hrmP_Position',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Position' />,
        cell: ({ row }) => <div>{row.getValue('hrmP_Position') || '-'}</div>
    },
    {
        accessorKey: 'hrmrfR_JobLocation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location' />,
        cell: ({ row }) => <div>{row.getValue('hrmrfR_JobLocation') || '-'}</div>
    },
    {
        accessorKey: 'hrmrfR_NoofPosition',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Positions' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hrmrfR_NoofPosition') ?? 0}</div>
    },
    {
        accessorKey: 'hrmrfR_Skill',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Skills' />,
        cell: ({ row }) => <div className='max-w-[200px] truncate'>{row.getValue('hrmrfR_Skill') || '-'}</div>
    },
    {
        accessorKey: 'hrmrfR_Status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const active = row.getValue('hrmrfR_Status');
            return (
                <span
                    className={`inline-flex items-center rounded-full px-2 py-1 font-semibold text-xs ${
                        active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {active ? 'Active' : 'Inactive'}
                </span>
            );
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const hrmrfr_Id = row.original.hrmrfr_Id;
            const hrmrfR_Status = row.original.hrmrfR_Status;

            return (
                <div className='flex '>
                    <Button
                        variant='ghost'
                        size='sm'
                        className={hrmrfR_Status ? 'text-blue-600 hover:text-blue-800' : 'text-red-600 hover:text-red-800'}
                        // onClick={() => handleToggleStatus(hrmrfr_Id, hrmrfR_Status)}
                    >
                        {hrmrfR_Status ? <Eye className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                    <Button variant='ghost' size='sm' className='text-red-600 hover:text-red-800'>
                        <Edit className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        size: 50
    }
];
