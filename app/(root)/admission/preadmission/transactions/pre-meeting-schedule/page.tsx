'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnDateChange, usePreMeetingDetails } from '@/hooks/admission/preadmission/transactions/use-pre-meeting-schedule';
import type { IPreMeetingSchedule } from '@/types/admission/preadmission/transactions/pre-meeting-schedule';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import MeetingDataTable from './_components/meeting-data-table';

export default function PreLiveMeetingSchedulePage() {
    return (
        <FormProvider<any>>
            <PreMeetingScheduleContent />
        </FormProvider>
    );
}

function PreMeetingScheduleContent() {
    const { data: response, isLoading, error, refetch } = usePreMeetingDetails() as any;
    const { mutate: filterByDate, isPending: isFiltering } = useOnDateChange();

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [meetingList, setMeetingList] = useState<IPreMeetingSchedule[]>([]);

    // Set initial data
    if (response?.meetinglist && meetingList.length === 0 && !selectedDate) {
        setMeetingList(response.meetinglist);
    }

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSelectedDate(val);

        if (val) {
            filterByDate(
                { LMSLMEET_PlannedDate: val },
                {
                    onSuccess: (res: any) => {
                        if (res?.meetinglist) {
                            setMeetingList(res.meetinglist);
                        } else {
                            setMeetingList([]);
                        }
                    }
                }
            );
        } else {
            // Reset to default
            setMeetingList(response?.meetinglist || []);
        }
    };

    const vcflag = response?.vcflag || '';

    return (
        <div className='container space-y-4 py-6'>
            <div className='no-print flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='font-bold text-3xl text-blue-800 tracking-tight'>Pre-Live Meeting Schedule</h1>
                    <p className='text-muted-foreground'>Manage and conduct online pre-admission meetings with students.</p>
                </div>
            </div>

            <CollapsibleSection title='Meeting Filters' defaultOpen={true} className='shadow-md'>
                <div className='grid grid-cols-1 items-end gap-4 bg-white p-4 md:grid-cols-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='plannedDate' className='font-semibold text-sm'>
                            Planned Date
                        </Label>
                        <Input id='plannedDate' type='date' value={selectedDate} onChange={handleDateChange} />
                    </div>
                    {isFiltering && (
                        <div className='flex items-center text-blue-600'>
                            <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                            <span className='text-sm'>Filtering...</span>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            <CollapsibleSection title='Meeting Schedules' defaultOpen={true} className='shadow-md'>
                <div className='bg-white p-4'>
                    <MeetingDataTable
                        meetingList={selectedDate && !isFiltering ? meetingList : response?.meetinglist || meetingList}
                        vcflag={vcflag}
                        isLoading={isLoading || isFiltering}
                        error={error}
                        refetch={() => {
                            if (selectedDate) {
                                filterByDate(
                                    { LMSLMEET_PlannedDate: selectedDate },
                                    {
                                        onSuccess: (res: any) => setMeetingList(res?.meetinglist || [])
                                    }
                                );
                            } else {
                                refetch();
                            }
                        }}
                    />
                </div>
            </CollapsibleSection>
        </div>
    );
}
