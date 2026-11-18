import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IStudent } from '@/types/alumni/user-password-creation';
import type { ColumnDef } from '@tanstack/react-table';

import { tableSearchVariables } from '@/lib/data-table.config';
import { parseAsInteger, useQueryState } from 'nuqs';

const SnoCell = ({ index }: { index: number }) => {
    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withOptions({ shallow: false }).withDefault(10));
    return <div className='text-center'>{(currentPage - 1) * pageSize + index + 1}</div>;
};

export const userPasswordCreationColumns: ColumnDef<IStudent>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <div className='flex justify-center'>
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label='Select all'
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
            </div>
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' className='justify-center font-bold text-black' />,
        cell: ({ row }) => <SnoCell index={row.index} />
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='NAME' className='font-bold text-black' />,
        cell: ({ row }) => <span className='font-medium uppercase'>{row.original.studentname}</span>
    },
    {
        accessorKey: 'amst_admno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='ADMISSION NUMBER' className='font-bold text-black' />,
        cell: ({ row }) => <span>{row.original.amst_admno || '-'}</span>
    },
    {
        accessorKey: 'asmcl_classname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CLASS' className='font-bold text-black' />,
        cell: ({ row }) => <span>{row.original.asmcl_classname || '-'}</span>
    },
    {
        accessorKey: 'asmc_sectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SECTION' className='font-bold text-black' />,
        cell: ({ row }) => <span>{row.original.asmc_sectionname || '-'}</span>
    }
];
