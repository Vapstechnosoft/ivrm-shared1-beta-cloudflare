'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IStatusStudent } from '@/types/admission/preadmission/status';
import type { ColumnDef } from '@tanstack/react-table';

export const getStatusColumns = (
    statusList: { pamsT_Id: number; pamsT_Status: string }[],
    onStatusChange: (id: number, statusId: number) => void,
    onRemarkChange: (id: number, remark: string) => void,
    rptStatus: boolean,
    page: number = 1,
    pageSize: number = 10
): ColumnDef<IStatusStudent>[] => [
    {
        id: 'slno',
        header: 'SL.NO',
        cell: ({ row }) => <div className='text-center font-medium'>{(page - 1) * pageSize + row.index + 1}</div>
    },
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
        accessorKey: 'name',
        header: 'Student Name',
        cell: ({ row }) => <div className='font-semibold text-primary/90'>{row.getValue('name')}</div>
    },
    {
        accessorKey: 'pasR_RegistrationNo',
        header: 'Reg.No'
    },
    {
        accessorKey: 'statusName',
        header: 'Current Status',
        cell: ({ row }) => (
            <div className='inline-flex items-center rounded-md border bg-secondary/50 px-2 py-0.5 font-medium text-xs'>
                {row.getValue('statusName')}
            </div>
        )
    },
    {
        id: 'updateStatus',
        header: 'Update Status',
        cell: ({ row }) => {
            const student = row.original;
            return (
                <Select
                    value={student.pamsT_Id && student.pamsT_Id !== 786 ? String(student.pamsT_Id) : ''}
                    onValueChange={(val) => onStatusChange(student.pasR_Id, Number(val))}>
                    <SelectTrigger className='h-8 w-[160px] bg-background/50 transition-colors hover:bg-background'>
                        <SelectValue placeholder='Select Status' />
                    </SelectTrigger>
                    <SelectContent>
                        {statusList.map((status) => (
                            <SelectItem key={status.pamsT_Id} value={String(status.pamsT_Id)}>
                                {status.pamsT_Status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }
    },
    {
        id: 'newRemark',
        header: 'Remark',
        cell: ({ row }) => {
            const student = row.original;
            return (
                <Input
                    value={student.remarks || ''}
                    onChange={(e) => onRemarkChange(student.pasR_Id, e.target.value)}
                    placeholder='Enter remark'
                    className='h-8 min-w-[150px] bg-background/50'
                />
            );
        }
    },
    {
        accessorKey: 'remark',
        header: 'Previous Remark',
        cell: ({ row }) => <div className='text-muted-foreground text-xs'>{row.getValue('remark') || '-'}</div>
    },
    {
        accessorKey: 'className',
        header: 'Admitted Class'
    },
    {
        accessorKey: 'repeat_Class_Id',
        header: 'Repeat Class'
    },
    {
        accessorKey: 'pasR_Sex',
        header: 'Sex'
    }
];
