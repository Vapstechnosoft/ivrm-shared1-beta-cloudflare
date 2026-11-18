import { Button } from '@/components/ui/button';
import type { AppointmentApprovalDTO } from '@/types/visitors-management/appointment-approval-types';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUp, Eye, MessageSquare, Upload } from 'lucide-react';

interface AppointmentApprovalColumnsProps {
    onEdit: (data: AppointmentApprovalDTO) => void;
    onUploadMOM: (data: AppointmentApprovalDTO) => void;
    onUpdateFeedback: (data: AppointmentApprovalDTO) => void;
    onViewDocuments: (data: AppointmentApprovalDTO) => void;
}

export const getColumns = ({
    onEdit,
    onUploadMOM,
    onUpdateFeedback,
    onViewDocuments
}: AppointmentApprovalColumnsProps): ColumnDef<AppointmentApprovalDTO>[] => [
    {
        accessorKey: 'SL.No',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <div className='flex justify-center gap-2'>
                <Button variant='ghost' size='icon' onClick={() => onEdit(row.original)} title='Approve/Reject'>
                    <ArrowUp className='h-4 w-4 text-red-500' />
                </Button>
            </div>
        )
    },
    {
        id: 'upload_mom',
        header: 'Upload MOM',
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='icon' onClick={() => onUploadMOM(row.original)} title='Upload MOM'>
                    <Upload className='h-4 w-4 text-red-500' />
                </Button>
            </div>
        )
    },
    {
        id: 'update_feedback',
        header: 'Update Feedback',
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='icon' onClick={() => onUpdateFeedback(row.original)} title='Update Feedback'>
                    <MessageSquare className='h-4 w-4 text-gray-500' />
                </Button>
            </div>
        )
    },
    {
        accessorKey: 'VMAP_VisitorName',
        header: 'Visitor Name'
    },
    {
        accessorKey: 'VMAP_VisitorContactNo',
        header: 'Visitor Address',
        cell: ({ row }) => (
            <div>
                <div>{row.original.VMAP_FromAddress}</div>
                <div>Email: {row.original.VMAP_VisitorEmailid}</div>
                <div>Ph.: {row.original.VMAP_VisitorContactNo}</div>
            </div>
        )
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: 'To Meet'
    },
    {
        accessorKey: 'VMAP_MeetingDateTime',
        header: 'Appointment Date',
        cell: ({ row }) => {
            const date = new Date(row.original.VMAP_MeetingDateTime);
            return date.toLocaleDateString('en-GB');
        }
    },
    {
        accessorKey: 'VMAP_MeetingTiming',
        header: 'Request Time',
        cell: ({ row }) => `${row.original.VMAP_MeetingTiming} TO ${row.original.VMAP_MeetingToTime}`
    },
    {
        id: 'logged_date_time',
        header: 'Logged Date/Time',
        cell: ({ row }) => (
            <div>
                <div>{row.original.LoginDate ? new Date(row.original.LoginDate).toLocaleDateString('en-GB') : ''}</div>
                <div>{row.original.LoginTime1}</div>
            </div>
        )
    },
    {
        accessorKey: 'VMAP_MeetingPurpose',
        header: 'Purpose'
    },
    {
        accessorKey: 'VMAP_FromPlace',
        header: 'Place'
    },
    {
        accessorKey: 'VMAP_Status',
        header: 'Status'
    },
    {
        accessorKey: 'createdby',
        header: 'Requested By',
        cell: ({ row }) => <span className='text-red-500'>{row.original.createdby}</span>
    },
    {
        id: 'documents',
        header: 'Documents',
        cell: ({ row }) =>
            row.original.FCNT && row.original.FCNT > 0 ? (
                <div className='flex justify-center'>
                    <Button variant='ghost' size='icon' onClick={() => onViewDocuments(row.original)}>
                        <Eye className='h-4 w-4 text-blue-500' />
                    </Button>
                </div>
            ) : null
    }
];
