'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
    useRemarksReportDetails,
    useScheduleReportDetails,
    useSendReminder
} from '@/hooks/admission/preadmission/transactions/use-oral-test-schedule';
import { exportToExcel } from '@/lib/export-to-file';
import type { IOralTestSchedule } from '@/types/admission/preadmission/transactions/oral-test-schedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileDown, Loader2, Printer, Send, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StudentListModalProps {
    rowData: IOralTestSchedule;
    isOpen: boolean;
    onClose: () => void;
    isRemarks?: boolean;
}

export default function StudentListModal({ rowData, isOpen, onClose, isRemarks = false }: StudentListModalProps) {
    const { mutate: getScheduleReport, isPending: isLoadingSchedule } = useScheduleReportDetails();
    const { mutate: getRemarksReport, isPending: isLoadingRemarks } = useRemarksReportDetails();

    const [data, setData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const isLoading = isRemarks ? isLoadingRemarks : isLoadingSchedule;

    useEffect(() => {
        if (isOpen && rowData) {
            const reportAction = isRemarks ? getRemarksReport : getScheduleReport;
            reportAction(rowData.paotS_Id, {
                onSuccess: (resp: any) => {
                    let rawData = [];
                    if (Array.isArray(resp)) {
                        rawData = resp;
                    } else if (resp?.data) {
                        rawData = Array.isArray(resp.data) ? resp.data : resp.data?.$values || [];
                    } else if (resp?.scheduleGetreportdetails) {
                        rawData = resp.scheduleGetreportdetails;
                    } else if (resp?.remarksGetreportdetails) {
                        rawData = resp.remarksGetreportdetails;
                    }

                    const normalized = rawData.map((item: any) => ({
                        ...item,
                        studentname: item.name || item.studentname || item.studentName || item.pasR_FirstName || 'N/A',
                        RegistrationNo: item.regno || item.RegistrationNo || item.registrationNo || item.pasR_RegistrationNo || 'N/A',
                        asmcL_ClassName: item.class || item.asmcL_ClassName || item.className || 'N/A',
                        PAOTS_Remarks: item.remarks || item.PAOTS_Remarks || 'N/A',
                        Gender: item.gender || item.pasR_Sex || 'N/A',
                        ScheduleDate: item.scheduleDate || rowData.paotS_ScheduleDate,
                        From: item.fromTime || rowData.paotS_ScheduleTime,
                        To: item.toTime || rowData.paotS_ScheduleTimeTo,
                        MeetingTime: item.meetingTime || ''
                    }));
                    setData(normalized);
                }
            });
        }
    }, [isOpen, rowData, isRemarks]);

    const formatTime = (time: string) => {
        if (!time) return 'N/A';
        const parts = time.split(':');
        if (parts.length < 2) return time;
        const hours = Number.parseInt(parts[0]);
        const minutes = Number.parseInt(parts[1]);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')}${ampm}`;
    };

    const columns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className='px-1'>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                        className='border-white data-[state=checked]:bg-white data-[state=checked]:text-[#0066cc]'
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='px-1'>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label='Select row'
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40
        },
        {
            id: 'slno',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row }) => row.index + 1,
            size: 60
        },
        {
            accessorKey: 'studentname',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />
        },
        {
            accessorKey: 'RegistrationNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='RegNo' />
        },
        {
            accessorKey: 'asmcL_ClassName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />
        },
        {
            accessorKey: 'Gender',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gender' />
        },
        {
            accessorKey: 'ScheduleDate',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Schedule Date' />,
            cell: ({ row }) => (row.original.ScheduleDate ? format(new Date(row.original.ScheduleDate), 'dd-MM-yyyy') : 'N/A')
        },
        {
            accessorKey: 'From',
            header: ({ column }) => <DataTableColumnHeader column={column} title='From' />,
            cell: ({ row }) => formatTime(row.original.From)
        },
        {
            accessorKey: 'To',
            header: ({ column }) => <DataTableColumnHeader column={column} title='To' />,
            cell: ({ row }) => formatTime(row.original.To)
        },
        {
            accessorKey: 'MeetingTime',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Meeting Time' />
        }
    ];

    if (isRemarks) {
        // Find class column and insert remarks after it
        const classIdx = columns.findIndex((c) => (c as any).accessorKey === 'asmcL_ClassName');
        columns.splice(classIdx + 1, 0, {
            accessorKey: 'PAOTS_Remarks',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />
        });
    }

    const handleExport = () => {
        const exportColumns = [
            { label: 'Name', value: 'studentname' },
            { label: 'RegNo', value: 'RegistrationNo' },
            { label: 'Class', value: 'asmcL_ClassName' },
            { label: 'Gender', value: 'Gender' },
            { label: 'Schedule Date', value: 'ScheduleDate' },
            { label: 'From', value: 'From' },
            { label: 'To', value: 'To' }
        ];

        exportToExcel(
            isRemarks ? `Remarks_${rowData.paotS_ScheduleName}` : `Students_${rowData.paotS_ScheduleName}`,
            JSON.stringify(exportColumns),
            JSON.stringify(data)
        );
    };

    const { mutate: sendReminderMutation, isPending: isSendingReminder } = useSendReminder();

    const handleReminder = () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const payload = {
            selectedStudentData: selectedRows.map((row) => ({
                pasR_Id: row.pasR_Id || row.pasrId || row.pasR_ID,
                mI_Id: row.mI_Id || (rowData as any).mI_Id || 1, // Fallback to 1 if not found
                pasR_emailId: row.pasR_emailId || row.studentemail || 'N/A',
                pasR_MobileNo: row.pasR_MobileNo || row.studentmobile || 0,
                vcmeeting: !!row.vcmeeting // Map to boolean
            }))
        };

        sendReminderMutation(payload);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='flex max-h-[90vh] w-[1200px] max-w-[95vw] flex-col overflow-hidden border-none p-0 shadow-2xl'>
                <div className='printable-content flex flex-1 flex-col overflow-auto'>
                    {/* Custom Header Section */}
                    <div className='relative z-10 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm'>
                        <div className='flex-1'>
                            <h2 className='font-bold text-[#004a99] text-[13px] uppercase tracking-wider'>STUDENTS LIST: {data.length}</h2>
                        </div>

                        <div className='flex-[2] space-y-0.5 text-center'>
                            <h2 className='font-black text-[#004a99] text-sm uppercase tracking-widest'>{rowData.paotS_ScheduleName}</h2>
                            <p className='font-bold text-[#004a99] text-[11px] opacity-90'>
                                {format(new Date(rowData.paotS_ScheduleDate), 'dd-MM-yyyy')} - {formatTime(rowData.paotS_ScheduleTime)} TO{' '}
                                {formatTime(rowData.paotS_ScheduleTimeTo)}
                            </p>
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
                                <div className='overflow-hidden rounded-sm border border-slate-200 bg-white shadow-md transition-colors [&_tbody_tr:nth-child(even)]:bg-slate-50/60 [&_tbody_tr_td:last-child]:border-r-0 [&_tbody_tr_td]:border-slate-100 [&_tbody_tr_td]:border-r [&_tbody_tr_td]:py-1.5 [&_tbody_tr_td]:text-[11px] [&_thead_tr_th:last-child]:border-r-0 [&_thead_tr_th]:border-slate-200 [&_thead_tr_th]:border-r [&_thead_tr_th]:py-2.5 [&_thead_tr_th]:font-bold [&_thead_tr_th]:text-[11px] [&_thead_tr_th]:text-black [&_thead_tr_th_button]:hover:bg-transparent [&_thead_tr_th_button]:hover:text-black'>
                                    <GenericDataTable
                                        data={data}
                                        columns={columns}
                                        isLoading={false}
                                        isSearchRequired={false}
                                        noDataTitle='No Data Found'
                                        onRowSelectionChange={setSelectedRows}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Section */}
                <div className='no-print relative z-10 flex items-center justify-between border-t bg-white px-6 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'>
                    <Button
                        onClick={handleReminder}
                        disabled={isSendingReminder}
                        className='h-9 rounded-sm bg-[#4a148c] px-6 font-black text-[11px] text-white uppercase tracking-widest shadow-md transition-all hover:bg-[#311b92] active:scale-95'>
                        {isSendingReminder ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Send className='mr-2.5 h-4 w-4' />}
                        Reminder
                    </Button>

                    <div className='flex gap-3'>
                        <Button className='h-9 rounded-sm bg-[#d84315] px-6 font-black text-[11px] text-white uppercase tracking-widest shadow-md transition-all hover:bg-[#bf360c] active:scale-95'>
                            <Trash2 className='mr-2.5 h-4 w-4' /> Delete
                        </Button>
                        <Button
                            onClick={onClose}
                            className='h-9 rounded-sm bg-[#2e7d32] px-6 font-black text-[11px] text-white uppercase tracking-widest shadow-md transition-all hover:bg-[#1b5e20] active:scale-95'>
                            <XCircle className='mr-2.5 h-4 w-4' /> Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
