'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ICredentialStudent } from '@/types/alumni/student-password-creation';
import type { ColumnDef } from '@tanstack/react-table';

export const getStudentPasswordCreationColumns = (
    onResetPassword: (student: ICredentialStudent) => void
): ColumnDef<ICredentialStudent>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='NAME' className='font-bold text-black' />
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ADMISSION NUMBER' className='font-bold text-black' />
    },
    {
        accessorKey: 'username',
        header: ({ column }) => <DataTableColumnHeader column={column} title='USER NAME' className='font-bold text-black' />
    },
    {
        accessorKey: 'password',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PASSWORD' className='font-bold text-black' />
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CLASS' className='font-bold text-black' />
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SECTION' className='font-bold text-black' />
    },
    {
        accessorKey: 'amsT_MobileNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='MOBILE NO' className='font-bold text-black' />
    },
    {
        accessorKey: 'amsT_emailId',
        header: ({ column }) => <DataTableColumnHeader column={column} title='EMAIL ID' className='font-bold text-black' />
    }
    // ,
    // {
    //     id: 'actions',
    //     header: 'RESET',
    //     cell: ({ row }) => {
    //         const student = row.original;
    //         return (
    //             <Button
    //                 variant="outline"
    //                 size="icon"
    //                 className="h-8 w-8 rounded-full"
    //                 onClick={() => onResetPassword(student)}
    //                 disabled={!row.getIsSelected()}
    //             >
    //                 <RefreshCw className="h-4 w-4" />
    //             </Button>
    //         );
    //     },
    // },
];
