'use client';

import { Badge } from '@/components/ui/badge';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import React from 'react';

interface ParticipantTableProps {
    data: any[];
    type: string;
    selectedRows: any[];
    onRowSelectionChange: (rows: any[]) => void;
    isLoading: boolean;
}

export default function ParticipantTable({ data, type, selectedRows, onRowSelectionChange, isLoading }: ParticipantTableProps) {
    const columns = React.useMemo(
        () => [
            {
                id: 'select',
                header: ({ table }: { table: any }) => (
                    <input
                        type='checkbox'
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                        className='h-4 w-4 cursor-pointer rounded border-slate-300 text-primary accent-primary'
                        aria-label='Select all'
                    />
                ),
                cell: ({ row }: { row: any }) => (
                    <input
                        type='checkbox'
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                        className='h-4 w-4 cursor-pointer rounded border-slate-300 text-primary accent-primary'
                        aria-label='Select row'
                    />
                ),
                enableSorting: false,
                enableHiding: false
            },
            {
                header: type === 'Staff' ? 'Employee Name' : 'Student Name',
                accessorKey: type === 'Staff' ? 'employeeName' : 'studentName',
                cell: ({ row }: { row: any }) => (
                    <div className='font-bold text-slate-700'>
                        {type === 'Staff' ? row.original.employeeName : row.original.studentName}
                    </div>
                )
            },
            {
                header: type === 'Staff' ? 'Department' : 'Class',
                accessorKey: type === 'Staff' ? 'hrmD_DepartmentName' : 'asmcL_ClassName',
                cell: ({ row }: { row: any }) => (
                    <Badge variant='outline' className='border-slate-200 font-bold text-[9px] text-slate-500 uppercase tracking-widest'>
                        {type === 'Staff' ? row.original.hrmD_DepartmentName : row.original.asmcL_ClassName}
                    </Badge>
                )
            },
            {
                header: 'Mobile Number',
                accessorKey: type === 'Staff' ? 'hrmE_MobileNo' : 'amsT_MobileNo'
            },
            ...(type !== 'Staff'
                ? [
                      {
                          header: 'Section Name',
                          accessorKey: 'asmC_SectionName',
                          cell: ({ row }: { row: any }) => (
                              <Badge variant='secondary' className='border-none bg-slate-100 font-bold text-slate-600'>
                                  {row.original.asmC_SectionName || '-'}
                              </Badge>
                          )
                      }
                  ]
                : []),
            {
                header: 'Email Id',
                accessorKey: type === 'Staff' ? 'hrmE_EmailId' : 'amsT_emailId'
            },
            {
                header: 'DOB',
                accessorKey: type === 'Staff' ? 'hrmE_DOB' : 'amst_dob',
                cell: ({ row }: { row: any }) => {
                    const date = type === 'Staff' ? row.original.hrmE_DOB : row.original.amst_dob;
                    return date ? (
                        <div className='font-bold text-slate-600'>
                            {new Date(date)
                                .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                .replace(/\//g, '-')}
                        </div>
                    ) : (
                        '-'
                    );
                }
            }
        ],
        [type]
    );

    return (
        <GenericDataTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            onRowSelectionChange={onRowSelectionChange}
            maxSelectableRows={0} // No limit
        />
    );
}
