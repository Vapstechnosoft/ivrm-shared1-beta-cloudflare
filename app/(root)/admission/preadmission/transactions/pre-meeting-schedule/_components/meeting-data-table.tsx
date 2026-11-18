'use client';

import { Badge } from '@/components/ui/badge';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEndMainMeeting, useJoinMeeting, useOnStartMeeting } from '@/hooks/admission/preadmission/transactions/use-pre-meeting-schedule';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { useState } from 'react';
import { getStartedMeetingColumns, getUpcomingMeetingColumns } from './columns';
import RemarksModal from './remarks-modal';
import StudentApplicationPrint from './student-application-print';
import StudentDocumentViewer from './student-document-viewer';

interface MeetingDataTableProps {
    meetingList: IPreMeetingSchedule[];
    vcflag: string;
    isLoading: boolean;
    error: any;
    refetch: () => void;
}

export default function MeetingDataTable({ meetingList, vcflag, isLoading, error, refetch }: MeetingDataTableProps) {
    const [selectedRecord, setSelectedRecord] = useState<IPreMeetingSchedule | null>(null);
    const [isRemarksOpen, setIsRemarksOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const [isPrintOpen, setIsPrintOpen] = useState(false);

    const { mutate: startMeeting } = useOnStartMeeting();
    const { mutate: joinMeeting } = useJoinMeeting();
    const { mutate: endMeeting } = useEndMainMeeting();

    const upcomingMeetings = meetingList.filter((m) => !m.lmslmeeT_MeetingDate);
    const startedMeetings = meetingList.filter((m) => !!m.lmslmeeT_MeetingDate);

    const upcomingTableProps = useDataTableProps({ meetings: upcomingMeetings }, { dataKey: 'meetings' });
    const startedTableProps = useDataTableProps({ meetings: startedMeetings }, { dataKey: 'meetings' });

    const handleStartMeeting = (record: IPreMeetingSchedule, flg = '0') => {
        if (confirm(`Do you want to ${flg === '1' ? 're-start' : 'start'} meeting with \n${record.studentname} ?`)) {
            startMeeting(record, {
                onSuccess: (res: any) => {
                    if (vcflag === 'BBB') {
                        if (res?.moderatorurl)
                            window.open(
                                res.moderatorurl,
                                '_blank',
                                'toolbar=yes,scrollbars=yes,resizable=yes,top=200,left=200,width=800,height=800'
                            );
                    } else if (vcflag === 'JITSI') {
                        // Jitsi usually needs a DOM click or specific logic
                        if (record.lmslmeeT_Id) {
                            const btn = document.getElementById(record.lmslmeeT_Id.toString());
                            if (btn) btn.click();
                        }
                    } else if (vcflag === 'Teams') {
                        if (res?.lmslmeeT_MeetingURL) window.open(res.lmslmeeT_MeetingURL, '_blank');
                    }
                    refetch();
                }
            });
        }
    };

    const handleJoinMeeting = (record: IPreMeetingSchedule) => {
        joinMeeting(record, {
            onSuccess: () => refetch()
        });
    };

    const handleEndMeeting = (lmslmeeT_Id: number) => {
        if (confirm('Do you want to end/close meeting ?')) {
            endMeeting(
                { LMSLMEET_Id: lmslmeeT_Id, HRML_LeaveType: 'M' },
                {
                    onSuccess: () => {
                        refetch();
                    }
                }
            );
        }
    };

    const tableMeta = {
        onStartMeeting: handleStartMeeting,
        onJoinMeeting: handleJoinMeeting,
        onEndMeeting: handleEndMeeting,
        onAddRemarks: (record: IPreMeetingSchedule) => {
            setSelectedRecord(record);
            setIsRemarksOpen(true);
        },
        onViewDocs: (record: IPreMeetingSchedule) => {
            setSelectedRecord(record);
            setIsDocsOpen(true);
        },
        onPrintApplication: (record: IPreMeetingSchedule) => {
            setSelectedRecord(record);
            setIsPrintOpen(true);
        }
    };

    return (
        <div className='space-y-4'>
            <Tabs defaultValue='upcoming' className='w-full'>
                <TabsList className='mb-4'>
                    <TabsTrigger value='upcoming' className='flex items-center gap-2'>
                        Upcoming Meetings
                        <Badge variant='secondary' className='ml-1 bg-slate-200'>
                            {upcomingMeetings.length}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value='started' className='flex items-center gap-2'>
                        Started Meetings
                        <Badge variant='secondary' className='ml-1 bg-slate-200'>
                            {startedMeetings.length}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='upcoming'>
                    <div className='rounded-md border bg-white p-4 shadow-sm'>
                        <GenericDataTable<IPreMeetingSchedule>
                            {...upcomingTableProps}
                            columns={getUpcomingMeetingColumns(tableMeta)}
                            isLoading={isLoading}
                            error={error}
                            noDataTitle='No Upcoming Meetings'
                            noDataDescription="There are no scheduled meetings that haven't started yet."
                        />
                    </div>
                </TabsContent>

                <TabsContent value='started'>
                    <div className='rounded-md border bg-white p-4 shadow-sm'>
                        <GenericDataTable<IPreMeetingSchedule>
                            {...startedTableProps}
                            columns={getStartedMeetingColumns(tableMeta)}
                            isLoading={isLoading}
                            error={error}
                            noDataTitle='No Started Meetings'
                            noDataDescription='There are no active or started meetings at the moment.'
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <RemarksModal
                isOpen={isRemarksOpen}
                onClose={() => {
                    setIsRemarksOpen(false);
                    refetch();
                }}
                record={selectedRecord}
            />

            <StudentDocumentViewer isOpen={isDocsOpen} onClose={() => setIsDocsOpen(false)} record={selectedRecord} />

            <StudentApplicationPrint isOpen={isPrintOpen} onClose={() => setIsPrintOpen(false)} record={selectedRecord} />
        </div>
    );
}
