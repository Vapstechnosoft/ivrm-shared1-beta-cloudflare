'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FileImage, FileText, LogIn, PlayCircle, Printer, StopCircle } from 'lucide-react';

export const getUpcomingMeetingColumns = (actions: any): ColumnDef<IPreMeetingSchedule>[] => [
    {
        accessorKey: 'studentname',
        header: 'Student Name',
        cell: ({ row }) => <span className='font-medium text-blue-600 uppercase'>{row.original.studentname}</span>
    },
    {
        accessorKey: 'lmslmeeT_MeetingTopic',
        header: 'Topic'
    },
    {
        accessorKey: 'lmslmeeT_MeetingDate',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.original.lmslmeeT_MeetingDate;
            if (!date) return '-';
            return format(new Date(date), 'dd/MM/yyyy');
        }
    },
    {
        accessorKey: 'lmslmeeT_PlannedStartTime',
        header: 'Start Time'
    },
    {
        accessorKey: 'lmslmeeT_PlannedEndTime',
        header: 'End Time'
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const started = row.original.started;
            return (
                <Badge variant={started ? 'default' : 'secondary'} className={cn(started ? 'bg-green-500' : 'bg-gray-400')}>
                    {started ? 'Started' : 'Not Started'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const record = row.original;

            return (
                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => actions?.onStartMeeting(record)}
                        title='Start Meeting'
                        className='text-green-600 hover:bg-green-50 hover:text-green-700'>
                        <PlayCircle className='mr-1 h-4 w-4' /> Start
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => actions?.onJoinMeeting(record)}
                        title='Join Meeting'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
                        <LogIn className='mr-1 h-4 w-4' /> Join
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => actions?.onAddRemarks(record)} title='Add Remarks'>
                        <FileText className='mr-1 h-4 w-4' /> Remarks
                    </Button>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => actions?.onPrintApplication(record)}
                        title='Print Details'
                        className='text-slate-600 hover:text-slate-700'>
                        <Printer className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => actions?.onViewDocs(record)}
                        title='View Documents'
                        className='text-orange-600 hover:text-orange-700'>
                        <FileImage className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];

export const getStartedMeetingColumns = (actions: any): ColumnDef<IPreMeetingSchedule>[] => [
    {
        accessorKey: 'studentname',
        header: 'Student Name',
        cell: ({ row }) => <span className='font-medium text-blue-600 uppercase'>{row.original.studentname}</span>
    },
    {
        accessorKey: 'lmslmeeT_MeetingTopic',
        header: 'Topic'
    },
    {
        accessorKey: 'lmslmeeT_MeetingDate',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.original.lmslmeeT_MeetingDate;
            if (!date) return '-';
            return format(new Date(date), 'dd/MM/yyyy');
        }
    },
    {
        accessorKey: 'lmslmeeT_PlannedStartTime',
        header: 'Start Time'
    },
    {
        accessorKey: 'lmslmeeT_PlannedEndTime',
        header: 'End Time'
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const started = row.original.started;
            return (
                <Badge variant={started ? 'default' : 'secondary'} className={cn(started ? 'bg-green-500' : 'bg-gray-400')}>
                    {started ? 'Started' : 'Not Started'}
                </Badge>
            );
        }
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const record = row.original;

            return (
                <div className='flex items-center gap-2'>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => actions?.onStartMeeting(record, '1')}
                        title='Re-Start Meeting'
                        className='text-green-600 hover:bg-green-50 hover:text-green-700'>
                        <PlayCircle className='mr-1 h-4 w-4' /> Re-Start
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => actions?.onJoinMeeting(record)}
                        title='Join Meeting'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'>
                        <LogIn className='mr-1 h-4 w-4' /> Join
                    </Button>
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => actions?.onEndMeeting(record.lmslmeeT_Id)}
                        title='End Meeting'
                        className='text-red-600 hover:bg-red-50 hover:text-red-700'>
                        <StopCircle className='mr-1 h-4 w-4' /> End
                    </Button>
                    <Button variant='outline' size='sm' onClick={() => actions?.onAddRemarks(record)} title='Add Remarks'>
                        <FileText className='mr-1 h-4 w-4' /> Remarks
                    </Button>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => actions?.onPrintApplication(record)}
                        title='Print Details'
                        className='text-slate-600 hover:text-slate-700'>
                        <Printer className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() => actions?.onViewDocs(record)}
                        title='View Documents'
                        className='text-orange-600 hover:text-orange-700'>
                        <FileImage className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
