'use client';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import type { TTGenerationGridData } from '@/types/timetable/Transaction/timetablegeneration';
// import { GenerationMasters } from '@/types/timetable/Transaction/time-table-generation';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft } from 'lucide-react';
import { useCallback } from 'react';

interface TimeTableGenerationGridProps {
    data: any[];
}

export const TTGeneration: ColumnDef<TTGenerationGridData>[] = [
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];
function ActionButtonsCell({ rowData }: { rowData: TTGenerationGridData }) {
    // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
    let formContext;

    try {
        formContext = useFormContext<TTGenerationGridData>();
    } catch {
        // Component rendered outside FormProvider
        return null;
    }

    const { openEditForm, openToggleForm } = formContext;

    const handleEdit = useCallback(
        (data: TTGenerationGridData) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: TTGenerationGridData) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttmD_ActiveFlag'
        />
    );
}

export default function TimeTableGenerationGrid({ data }: TimeTableGenerationGridProps) {
    return (
        <div className='mx-auto max-w-7xl space-y-4'>
            <div className='overflow-hidden rounded-xl border border-purple-100 bg-white shadow-md'>
                <div className='bg-purple-700 px-6 py-3'>
                    <h3 className='font-bold text-sm text-white uppercase tracking-wide'>Time Table Details</h3>
                </div>

                <div className='overflow-x-auto p-4'>
                    <table className='w-full text-left text-sm'>
                        <thead className='bg-purple-50 text-gray-700 text-xs uppercase'>
                            <tr>
                                <th className='border-b px-4 py-3'>Sl No</th>
                                <th className='border-b px-4 py-3'>
                                    <div className='flex flex-col gap-2'>
                                        <span>Institution Name</span>
                                        <Input placeholder='Search...' className='h-8 bg-white text-xs' />
                                    </div>
                                </th>
                                <th className='border-b px-4 py-3'>
                                    <div className='flex flex-col gap-2'>
                                        <span>Academic Year</span>
                                        <Input placeholder='Search...' className='h-8 bg-white text-xs' />
                                    </div>
                                </th>
                                <th className='border-b px-4 py-3'>
                                    <div className='flex flex-col gap-2'>
                                        <span>Category Name</span>
                                        <Input placeholder='Search...' className='h-8 bg-white text-xs' />
                                    </div>
                                </th>
                                <th className='border-b px-4 py-3 text-center'>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data && data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index} className='border-b bg-white hover:bg-gray-50'>
                                        <td className='px-4 py-3 font-medium'>{index + 1}</td>
                                        <td className='px-4 py-3'>{item.institutionName || 'N/A'}</td>
                                        <td className='px-4 py-3'>{item.academicYear || 'N/A'}</td>
                                        <td className='px-4 py-3'>{item.categoryName || 'N/A'}</td>
                                        <td className='px-4 py-3 text-center'>
                                            <ActionButtonsCell rowData={item} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className='px-4 py-8 text-center text-gray-500 italic'>
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className='flex items-center justify-between border-purple-100 border-t bg-purple-50 px-6 py-3'>
                    <Button variant='outline' size='icon' className='h-8 w-8 border-purple-200 text-purple-700 hover:bg-purple-100'>
                        <ChevronLeft className='h-4 w-4' />
                    </Button>

                    <div className='flex items-center gap-2 rounded border border-purple-200 bg-white px-3 py-1.5 font-semibold text-purple-900 text-xs shadow-sm'>
                        <span>Total Records:</span>
                        <span className='font-bold text-orange-600'>{data?.length || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
