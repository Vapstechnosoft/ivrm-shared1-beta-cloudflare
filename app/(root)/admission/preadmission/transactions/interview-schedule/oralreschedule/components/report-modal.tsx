'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useReScheduleReportDetails } from '@/hooks/admission/preadmission/transactions/use-oral-test-reschedule';
import { exportToExcel } from '@/lib/export-to-file';
import type { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileDown, Loader2, Printer, XCircle } from 'lucide-react';

interface ReportModalProps {
    rowData: IOralTestSchedule | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReportModal({ rowData, isOpen, onClose }: ReportModalProps) {
    const schid = rowData ? String(rowData.paotS_Id) : '';
    const { data: response, isLoading } = useReScheduleReportDetails(schid);

    const data = response?.data || response?.allreports || [];

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const hours = Number.parseInt(parts[0]);
        const minutes = Number.parseInt(parts[1]);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    };

    const columns: ColumnDef<any>[] = [
        {
            id: 'slno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row }) => row.index + 1,
            size: 60
        },
        {
            accessorKey: 'regno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Reg. No' />
        },
        {
            accessorKey: 'name',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />
        },
        {
            accessorKey: 'gender',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />
        },
        {
            accessorKey: 'scheduledate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Date' />,
            cell: ({ row }) => {
                const date = row.original.scheduledate || row.original.ScheduleDate;
                return date ? format(new Date(date), 'dd-MM-yyyy') : 'N/A';
            }
        },
        {
            id: 'time',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Time' />,
            cell: ({ row }) => {
                const from = row.original.scheduletime || row.original.ScheduleTime || '';
                const to = row.original.scheduletimeto || row.original.ScheduleTimeTo || '';
                return `${formatTime(from)} - ${formatTime(to)}`;
            }
        }
    ];

    const handleExport = () => {
        if (!rowData) return;
        const exportColumns = [
            { label: 'Reg. No', value: 'regno' },
            { label: 'Student Name', value: 'name' },
            { label: 'Gender', value: 'gender' },
            { label: 'Schedule Date', value: 'scheduledate' },
            { label: 'Start Time', value: 'scheduletime' },
            { label: 'End Time', value: 'scheduletimeto' }
        ];

        exportToExcel(`Reschedule_Report_${rowData.paotS_ScheduleName}`, JSON.stringify(exportColumns), JSON.stringify(data));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] w-[1100px] max-w-[95vw] flex-col overflow-hidden border-none p-0 shadow-2xl'>
                <div className='printable-content flex flex-1 flex-col overflow-auto'>
                    {/* Custom Header Section */}
                    <div className='relative z-10 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm'>
                        <div className='flex-1'>
                            <h2 className='font-bold text-[#004a99] text-[13px] uppercase tracking-wider'>
                                RE-SCHEDULED STUDENTS: {data.length}
                            </h2>
                        </div>

                        <div className='flex-[2] space-y-0.5 text-center'>
                            <h2 className='font-black text-[#004a99] text-sm uppercase tracking-widest'>{rowData?.paotS_ScheduleName}</h2>
                            {rowData && (
                                <p className='font-bold text-[#004a99] text-[11px] opacity-90'>
                                    {format(new Date(rowData.paotS_ScheduleDate), 'dd-MM-yyyy')} - {formatTime(rowData.paotS_ScheduleTime)}{' '}
                                    TO {formatTime(rowData.paotS_ScheduleTimeTo)}
                                </p>
                            )}
                        </div>

                        <div className='no-print flex flex-1 items-center justify-end gap-4'>
                            <button
                                onClick={handleExport}
                                className='transition-transform duration-200 hover:scale-110'
                                title='Export Excel'>
                                <FileDown className='h-6 w-6 text-[#2e7d32]' strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={() => window.print()}
                                className='transition-transform duration-200 hover:scale-110'
                                title='Print List'>
                                <Printer className='h-6 w-6 text-[#455a64]' strokeWidth={2.5} />
                            </button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={onClose}
                                className='h-8 rounded-sm border-[#cfd8dc] px-4 font-bold text-[#455a64] text-xs hover:bg-slate-50'>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className='flex-1 overflow-auto bg-slate-50/30'>
                        {isLoading ? (
                            <div className='flex h-full flex-col items-center justify-center py-20'>
                                <Loader2 className='mb-4 h-10 w-10 animate-spin text-[#0066cc] opacity-50' />
                                <p className='animate-pulse font-bold text-[#0066cc] text-xs'>GENERATING REPORT...</p>
                            </div>
                        ) : (
                            <div className='p-4'>
                                <div className='overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50/60 [&_tbody_tr_td:last-child]:border-r-0 [&_tbody_tr_td]:border-slate-100 [&_tbody_tr_td]:border-r [&_tbody_tr_td]:py-1.5 [&_tbody_tr_td]:text-[11px] [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th]:border-blue-500 [&_thead_tr_th]:border-r [&_thead_tr_th]:bg-blue-600 [&_thead_tr_th]:py-2.5 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-[11px] [&_thead_tr_th]:text-white [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-white'>
                                    <GenericDataTable
                                        data={data}
                                        columns={columns}
                                        isLoading={false}
                                        isSearchRequired={false}
                                        noDataTitle='No Students Found'
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className='no-print relative z-10 flex items-center justify-end border-t bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'>
                    <Button
                        onClick={onClose}
                        className='h-9 rounded-sm bg-[#2e7d32] px-6 font-black text-[11px] text-white uppercase tracking-widest shadow-md transition-all hover:bg-[#1b5e20] active:scale-95'>
                        <XCircle className='mr-2.5 h-4 w-4' /> Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
