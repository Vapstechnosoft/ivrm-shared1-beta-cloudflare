'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IMasterCourse } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const getColumns = (): ColumnDef<IMasterCourse>[] => [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'amcO_CourseName',
        header: () => <div className='text-center font-bold text-black'>Course Name</div>,
        cell: ({ row }) => <div className='text-left font-medium'>{row.original.amcO_CourseName}</div>,
    },
    {
        accessorKey: 'amcO_CourseCode',
        header: () => <div className='text-center font-bold text-black'>Course Code</div>,
        cell: ({ row }) => <div className='text-left'>{row.original.amcO_CourseCode}</div>,
    },
    {
        accessorKey: 'amcO_CourseInfo',
        header: () => <div className='text-center font-bold text-black'>Course Information</div>,
        cell: ({ row }) => <div className='text-left'>{row.original.amcO_CourseInfo}</div>,
    },
    {
        accessorKey: 'amcO_NoOfYears',
        header: () => <div className='text-center font-bold text-black'>No. Of Year</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcO_NoOfYears}</div>,
    },
    {
        accessorKey: 'amcO_NoOfSemesters',
        header: () => <div className='text-center font-bold text-black'>No. Of Semester</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcO_NoOfSemesters}</div>,
    },
    {
        accessorKey: 'amcO_MinAttPer',
        header: () => <div className='text-center font-bold text-black'>Min Attendance</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcO_MinAttPer}</div>,
    },
    {
        accessorKey: 'amcO_Order',
        header: () => <div className='text-center font-bold text-black'>Course Order</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcO_Order}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterCourse }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterCourse>();

    const handleEdit = useCallback(
        (data: IMasterCourse) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterCourse) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='amcO_ActiveFlag'
        />
    );
}
