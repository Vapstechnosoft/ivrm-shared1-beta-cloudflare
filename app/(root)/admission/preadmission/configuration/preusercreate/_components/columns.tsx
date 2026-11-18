import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export interface PreUser {
    pasP_FirstName?: string;
    Name?: string;
    User_Name?: string;
    Email_Id?: string;
    Mob_No?: number | string;
    Created_Date?: string;
    Activeflag?: string;
}

export const preUserColumns: ColumnDef<PreUser>[] = [
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
        accessorKey: 'Name',
        header: 'Name',
        cell: ({ row }) => <span className='font-medium'>{row.original.Name}</span>
    },
    {
        accessorKey: 'User_Name',
        header: 'User Name',
        cell: ({ row }) => <span>{row.original.User_Name}</span>
    },
    {
        accessorKey: 'Email_Id',
        header: 'Email ID',
        cell: ({ row }) => <span>{row.original.Email_Id}</span>
    },
    {
        accessorKey: 'Mob_No',
        header: 'Mobile Number',
        cell: ({ row }) => <span>{row.original.Mob_No}</span>
    },
    {
        accessorKey: 'Created_Date',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.original.Created_Date ? new Date(row.original.Created_Date) : null;
            return <span>{date && !isNaN(date.getTime()) ? format(date, 'dd-MM-yyyy') : ''}</span>;
        }
    },
    {
        accessorKey: 'Activeflag',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.original.Activeflag === 'Active' || row.original.Activeflag === 'true' || row.original.Activeflag === '1';
            return (
                <Badge variant={isActive ? 'success' : 'destructive'} className='w-20 justify-center'>
                    {row.original.Activeflag}
                </Badge>
            );
        }
    }
];
