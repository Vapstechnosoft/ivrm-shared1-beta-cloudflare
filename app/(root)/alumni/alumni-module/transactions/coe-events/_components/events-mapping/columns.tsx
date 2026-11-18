'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { getPageDetailsMap } from '@/server/alumni/master-coe';
import type { IEventsMapping } from '@/types/alumni/master-coe';
import type { ColumnDef } from '@tanstack/react-table';
import { Briefcase, Eye, FileImage, FileVideo, GraduationCap, Users } from 'lucide-react';
import { useCallback } from 'react';
import { ListViewDialog } from '../list-view-dialog';

export const EventsMappingColumns: ColumnDef<IEventsMapping>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SL. NO' className='justify-center text-center font-bold text-black uppercase' />
        ),
        cell: (info) => <div className='text-center'>{info.row.index + 1}</div>,
        size: 80
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title='Academic Year'
                className='justify-center text-center font-bold text-black uppercase'
            />
        ),
        cell: (info) => <div className='text-center'>{info.getValue() as string}</div>
    },
    {
        accessorKey: 'coemE_EventName',
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title='Event Name'
                className='justify-center text-center font-bold text-black uppercase'
            />
        ),
        cell: (info) => <div className='text-center uppercase'>{info.getValue() as string}</div>
    },
    {
        accessorKey: 'images',
        header: () => <div className='text-center font-bold text-black uppercase'>Images</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Images List'
                    type='image'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return data.edit_images_list || data.images_list || data.images_listCoe || [];
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-green-600'>
                            <FileImage className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        accessorKey: 'videos',
        header: () => <div className='text-center font-bold text-black uppercase'>Videos</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Videos List'
                    type='video'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return (data.edit_videos_list || data.videos_list || []).map((v: any) => ({
                            COEEV_Videos: v.coeeV_Videos || v.COEEV_Videos || v.COEEV_VideoURL
                        }));
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                            <FileVideo className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        accessorKey: 'classes',
        header: () => <div className='text-center font-bold text-black uppercase'>Classes</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Classes List'
                    type='class'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return data.edit_stu_class_list || data.stu_class_list || [];
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                            <Eye className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        accessorKey: 'employees',
        header: () => <div className='text-center font-bold text-black uppercase'>Employees</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Employees List'
                    type='employee'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return data.edit_emp_type_list || data.emp_type_list || [];
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-orange-600'>
                            <Briefcase className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        accessorKey: 'others',
        header: () => <div className='text-center font-bold text-black uppercase'>Others</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Others List'
                    type='other'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return data.edit_oth_mobilenos_list || data.others_list || []; // Adjust if different field name
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-red-600'>
                            <Users className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        accessorKey: 'alumni',
        header: () => <div className='text-center font-bold text-black uppercase'>Alumni</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ListViewDialog
                    title='Alumni List'
                    type='alumni'
                    fetchData={async () => {
                        const res = await getPageDetailsMap(row.original.coeE_Id || (row.original as any).COEE_Id);
                        const data = (res as any).data || res;
                        return data.alumniClslist || data.alumni_list || [];
                    }}
                    trigger={
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-600'>
                            <GraduationCap className='h-4 w-4' />
                        </Button>
                    }
                />
            </div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Actions' className='justify-center text-center font-bold text-black uppercase' />
        ),
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IEventsMapping }) {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext<IEventsMapping>();

    const handleEdit = useCallback(
        (data: IEventsMapping) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IEventsMapping) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleView = useCallback(
        (data: IEventsMapping) => {
            openDetailsView(data);
        },
        [openDetailsView]
    );

    return (
        <div className='flex items-center justify-center gap-2'>
            <Button variant='ghost' size='icon' onClick={() => handleView(rowData)} title='View Details' className='text-blue-600'>
                <Eye className='h-4 w-4' />
            </Button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='coeE_ActiveFlag'
            />
        </div>
    );
}
