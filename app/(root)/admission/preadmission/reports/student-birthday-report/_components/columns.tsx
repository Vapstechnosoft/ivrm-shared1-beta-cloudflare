'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const birthdayColumns: ColumnDef<any>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label='Select all'
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label='Select row'
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false
    // },
    {
        accessorKey: 'sno',
        header: () => <span className='text-center font-bold text-black'>SL.No</span>,
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination;
            return pageIndex * pageSize + row.index + 1;
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: 'studentname',
        header: () => <span className='text-center font-bold text-black'>Student Name</span>
    },
    {
        accessorKey: 'admno',
        header: () => <span className='text-center font-bold text-black'>Adm. No.</span>
    },
    {
        accessorKey: 'classname',
        header: () => <span className='text-center font-bold text-black'>Class</span>
    },
    {
        accessorKey: 'sectionname',
        header: () => <span className='text-center font-bold text-black'>Section</span>
    },
    {
        accessorKey: 'amst_dob',
        header: () => <span className='text-center font-bold text-black'>Date of Birth</span>,
        cell: ({ row }) => {
            const date = row.getValue('amst_dob') as string;
            return date ? format(new Date(date), 'dd-MM-yyyy') : 'N/A';
        }
    },
    {
        accessorKey: 'amst_photo',
        header: () => <span className='text-center font-bold text-black'>Student Photo</span>,
        cell: ({ row }) => {
            const photoUrl = row.getValue('amst_photo') as string;
            return (
                <Avatar className='h-16 w-16 rounded-md'>
                    <AvatarImage src={photoUrl} alt='Student' className='object-cover' />
                    <AvatarFallback className='rounded-md'>No Photo</AvatarFallback>
                </Avatar>
            );
        },
        enableGlobalFilter: false
    },
    {
        accessorKey: 'stdaddress',
        header: () => <span className='text-center font-bold text-black'>Address</span>
    }
];
