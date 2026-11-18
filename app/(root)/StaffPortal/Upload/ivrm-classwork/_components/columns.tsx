'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import type { IClassWorkDetails } from '@/types/upload/reports/classwork-upload-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Pencil } from 'lucide-react';

interface ClassWorkColumnProps {
    onEdit: (row: IClassWorkDetails) => void;
    onToggle: (row: IClassWorkDetails) => void;
    onView: (row: IClassWorkDetails) => void;
}

export const classWorkColumns = ({ onEdit, onToggle, onView }: ClassWorkColumnProps): ColumnDef<IClassWorkDetails>[] => [
    {
        accessorKey: 'icW_Id',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SLNO' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'isms_SubjectName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-bold text-[11px] text-slate-600 uppercase'>{row.getValue('isms_SubjectName')}</div>
    },
    {
        accessorKey: 'icW_Topic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-medium text-[11px] text-slate-600'>{row.getValue('icW_Topic')}</div>
    },
    {
        accessorKey: 'icW_SubTopic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Sub Topic' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-medium text-[11px] text-slate-500 italic'>{row.getValue('icW_SubTopic')}</div>
    },
    {
        accessorKey: 'icW_Content',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Content' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => (
            <div className='max-w-[200px] truncate text-[11px] text-slate-600' title={row.getValue('icW_Content')}>
                {row.getValue('icW_Content')}
            </div>
        )
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Class' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='text-center font-black text-[11px] text-slate-700'>{row.getValue('asmcL_ClassName')}</div>
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Section' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='text-center font-black text-[11px] text-slate-700'>{row.getValue('asmC_SectionName')}</div>
    },
    {
        id: 'updateDateTime',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title='Update Date / Time'
                className='justify-center font-black text-black text-xs uppercase'
            />
        ),
        cell: ({ row }) => {
            const data = row.original as any;
            return (
                <div className='text-center font-medium text-[10px] text-slate-400 tracking-tighter'>
                    {data.createdDate ? `${data.createdDate} ${data.createdTime || ''}` : '---'}
                </div>
            );
        }
    },
    {
        accessorKey: 'icW_FromDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Start Date' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const date = row.getValue('icW_FromDate');
            return (
                <div className='text-center font-bold text-[11px] text-blue-600'>
                    {date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}
                </div>
            );
        }
    },
    {
        accessorKey: 'icW_ToDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='End Date' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const date = row.getValue('icW_ToDate');
            return (
                <div className='text-center font-bold text-[11px] text-blue-600'>
                    {date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}
                </div>
            );
        }
    },
    {
        id: 'attachment',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Attachment' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const rowData = row.original;
            const hasAttachment = (rowData as any).filesCount > 0 || rowData.icW_Attachment || (rowData as any).attachementlist?.length > 0;
            return (
                <div className='flex justify-center'>
                    {hasAttachment ? (
                        <button
                            type='button'
                            onClick={() => onView(rowData)}
                            className='rounded-md bg-blue-50 p-1.5 text-blue-600 shadow-sm ring-1 ring-blue-100 transition transition-all duration-300 hover:bg-blue-600 hover:text-white hover:ring-blue-600'
                            title='View Attachments'>
                            <Eye className='h-3.5 w-3.5 shadow-sm' />
                        </button>
                    ) : (
                        <span className='font-bold text-[10px] text-slate-300 tracking-widest'>---</span>
                    )}
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Status' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const rowData = row.original;
            return (
                <div className='flex items-center justify-center gap-3'>
                    <button
                        type='button'
                        onClick={() => onEdit(rowData)}
                        className='group rounded-md bg-slate-50 p-1.5 text-blue-600 shadow-sm ring-1 ring-slate-100 transition transition-all duration-300 hover:bg-blue-600 hover:text-white hover:ring-blue-600'
                        title='Edit'>
                        <Pencil className='h-3.5 w-3.5 transition-transform group-hover:scale-110' />
                    </button>
                    <ActionButtons
                        rowData={rowData}
                        buttons={{ edit: false, toggle: true, delete: false }}
                        onToggle={() => onToggle(rowData)}
                        toggleConditionKey='icW_ActiveFlag'
                    />
                </div>
            );
        }
    }
];
