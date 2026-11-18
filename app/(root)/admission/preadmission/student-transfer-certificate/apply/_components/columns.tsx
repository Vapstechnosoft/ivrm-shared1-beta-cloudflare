'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface IStudentSearch {
    id: number;
    admNo: string;
    studentName: string;
    class: string;
    section: string;
    classId: number;
    sectionId: number;
}

export const studentSearchColumns = (onSelect: (student: IStudentSearch) => void): ColumnDef<IStudentSearch>[] => [
    {
        accessorKey: 'admNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('admNo')}</div>
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('studentName')}</div>
    },
    {
        accessorKey: 'class',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('class')}</div>
    },
    {
        accessorKey: 'section',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('section')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='font-bold text-black' />,
        cell: ({ row }) => (
            <Button size='sm' onClick={() => onSelect(row.original)}>
                Select
            </Button>
        )
    }
];

export interface IGeneratedTC {
    amsT_Id: number;
    amsT_FirstName: string;
    astC_TCDate: string;
}

export const generatedTCColumns: ColumnDef<IGeneratedTC>[] = [
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amsT_FirstName')}</div>
    },
    {
        accessorKey: 'astC_TCDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TC Date' className='font-bold text-black' />,
        cell: ({ row }) => <div>{new Date(row.getValue('astC_TCDate')).toLocaleDateString('en-GB')}</div>
    }
];

export interface IDeletedTC {
    amsT_FirstName: string;
    astC_TCDate: string;
    tC_CancelReason: string;
    leftclassname: string;
    amsT_AdmNo: string;
    astC_TCNO: string;
    leftyearname: string;
    leftsectionname: string;
}

export const deletedTCColumns: ColumnDef<IDeletedTC>[] = [
    {
        accessorKey: 'amsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amsT_FirstName')}</div>
    },
    {
        accessorKey: 'amsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amsT_AdmNo')}</div>
    },
    {
        accessorKey: 'leftclassname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('leftclassname')}</div>
    },
    {
        accessorKey: 'leftsectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('leftsectionname')}</div>
    },
    {
        accessorKey: 'astC_TCNO',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TC No' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('astC_TCNO') || '-'}</div>
    },
    {
        accessorKey: 'astC_TCDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TC Date' className='font-bold text-black' />,
        cell: ({ row }) => <div>{new Date(row.getValue('astC_TCDate')).toLocaleDateString('en-GB')}</div>
    },
    {
        accessorKey: 'tC_CancelReason',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reason' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('tC_CancelReason')}</div>
    }
];
