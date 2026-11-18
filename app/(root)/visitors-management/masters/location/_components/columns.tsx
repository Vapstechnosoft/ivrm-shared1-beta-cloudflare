'use client';

import { Button } from '@/components/ui/button';
import type { MasterLocationData } from '@/types/visitors-management/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit } from 'lucide-react';

export const columns: ColumnDef<MasterLocationData>[] = [
    {
        accessorKey: 'vmmL_Location',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Location Name
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        }
    },
    {
        accessorKey: 'vmmL_LocationDescription',
        header: 'Description'
    },
    {
        accessorKey: 'vmmL_LocationFacilities',
        header: 'Facilities'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className='flex gap-2'>
                    <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-500'>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='sm' className={data.vmmL_ActiveFlg ? 'text-red-500' : 'text-green-500'}>
                        {data.vmmL_ActiveFlg ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            );
        }
    }
];
