'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDeleteOralReSchedule, useOralReScheduleDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { HelpCircle, Plus } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, parseAsInteger, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import OralReScheduleForm from './components/re-add-form';
import ReportModal from './components/report-modal';

export default function OralReSchedulePage() {
    const { data: details, isLoading, refetch } = useOralReScheduleDetails(0) as any;
    const { mutate: deleteSchedule } = useDeleteOralReSchedule();
    const [isAddMode, setIsAddMode] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
    const [reportSchedule, setReportSchedule] = useState<any>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);

    const [sortBy] = useQueryState('sort_column', parseAsString.withOptions({ shallow: false }).withDefault(''));
    const [order] = useQueryState(
        'sort_direction',
        parseAsStringLiteral(['asc', 'desc'] as const)
            .withOptions({ shallow: false })
            .withDefault('asc')
    );
    const [searchQuery] = useQueryState('search_query', parseAsString.withOptions({ shallow: false }).withDefault(''));
    
    const [currentPage] = useQueryState('page', parseAsInteger.withOptions({ shallow: false }).withDefault(1));
    const [pageSize] = useQueryState('page_size', parseAsInteger.withOptions({ shallow: false }).withDefault(10));

    const filteredAndSortedData = useMemo(() => {
        const scheduleData = details?.oralTestSchedule || details?.data?.oralTestSchedule || [];
        let list = [...scheduleData];

        // Client-side search filtering
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            list = list.filter((item: any) => {
                const scheduleName = String(item.paotS_ScheduleName || '').toLowerCase();
                const dateVal = item.paotS_ScheduleDate;
                const dateStr = dateVal ? format(new Date(dateVal), 'dd-MM-yyyy') : '';
                const fromTime = String(item.paotS_ScheduleTime || '').toLowerCase();
                const toTime = String(item.paotS_ScheduleTimeTo || '').toLowerCase();
                return scheduleName.includes(query) || dateStr.includes(query) || fromTime.includes(query) || toTime.includes(query);
            });
        }

        // Client-side sorting
        if (!sortBy) return list;

        return list.sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];

            if (aVal === undefined || aVal === null) return 1;
            if (bVal === undefined || bVal === null) return -1;

            if (sortBy === 'paotS_ScheduleDate') {
                const aTime = new Date(aVal).getTime();
                const bTime = new Date(bVal).getTime();
                if (isNaN(aTime)) return 1;
                if (isNaN(bTime)) return -1;
                return order === 'asc' ? aTime - bTime : bTime - aTime;
            }

            // String comparison
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return order === 'asc' ? -1 : 1;
            if (aStr > bStr) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }, [details?.oralTestSchedule, details?.data?.oralTestSchedule, searchQuery, sortBy, order]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedData, currentPage, pageSize]);

    const methods = useForm();

    const columns: ColumnDef<any>[] = [
        {
            id: 'slno',
            header: () => <div className='text-center'>SL.NO</div>,
            cell: ({ row }) => <div className='text-center'>{(currentPage - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'paotS_ScheduleName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Name' className='justify-center' />,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleName}</div>
        },
        {
            accessorKey: 'paotS_ScheduleDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='justify-center' />,
            cell: ({ row }) => <div className='text-center'>{format(new Date(row.original.paotS_ScheduleDate), 'dd-MM-yyyy')}</div>
        },
        {
            accessorKey: 'paotS_ScheduleTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From' className='justify-center' />,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleTime}</div>
        },
        {
            accessorKey: 'paotS_ScheduleTimeTo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To' className='justify-center' />,
            cell: ({ row }) => <div className='text-center'>{row.original.paotS_ScheduleTimeTo}</div>
        }
        // {
        //     id: 'actions',
        //     header: () => <div className="text-center">Action</div>,
        //     cell: ({ row }) => (
        //         <div className="flex gap-2 justify-center">
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-blue-600 h-8 w-8"
        //                 onClick={() => {
        //                     setSelectedSchedule(row.original);
        //                     setIsAddMode(true);
        //                 }}
        //             >
        //                 <Edit className="h-4 w-4" />
        //             </Button>
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-blue-600 h-8 w-8"
        //                 onClick={() => {
        //                     setReportSchedule(row.original);
        //                     setIsReportOpen(true);
        //                 }}
        //                 title="View Report"
        //             >
        //                 <FileText className="h-4 w-4" />
        //             </Button>
        //             <Button
        //                 variant="ghost"
        //                 size="icon"
        //                 className="text-destructive h-8 w-8"
        //                 onClick={() => {
        //                     if (confirm('Are you sure you want to delete this schedule?')) {
        //                         deleteSchedule(row.original.paotS_Id);
        //                     }
        //                 }}
        //             >
        //                 <Trash className="h-4 w-4" />
        //             </Button>
        //         </div>
        //     )
        // }
    ];

    if (isAddMode) {
        return (
            <div className='space-y-6 p-6'>
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between'>
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <Button variant='outline' onClick={() => setIsAddMode(false)}>
                            Back to List
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <OralReScheduleForm
                            onSuccess={() => {
                                setIsAddMode(false);
                                refetch();
                            }}
                            initialData={selectedSchedule}
                        />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='space-y-6 p-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <div className='flex items-center gap-2'>
                        <CardTitle>Oral Test Re-Schedule</CardTitle>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <HelpCircle className='h-4 w-4 text-orange-500' />
                                </TooltipTrigger>
                                <TooltipContent>
                                    This functionality helps the admin to update the student’s oral test marks on basis of schedule name &
                                    oral test conducted by the staff/teacher
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedSchedule(null);
                            setIsAddMode(true);
                        }}>
                        <Plus className='mr-2 h-4 w-4' /> Add Re-Schedule
                    </Button>
                </CardHeader>
                <CardContent className='p-0'>
                    <div className='[&_th]:font-bold [&_th]:text-[13px] [&_th]:text-black'>
                        <GenericDataTable
                            data={paginatedData}
                            columns={columns}
                            isLoading={isLoading}
                            isSearchRequired={true}
                            totalItems={filteredAndSortedData.length}
                        />
                    </div>
                </CardContent>
            </Card>
            <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} rowData={reportSchedule} />
        </div>
    );
}
