'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    endMainMeeting,
    getEmpDetails,
    onDateChange,
    onScheduleChange,
    onStartMeeting,
    saveRemarks
} from '@/server/admission/hutchings/transactions/pre-live-meeting-schedule';
import { format } from 'date-fns';
import { ArrowLeft, CalendarIcon, FileText, RefreshCw, Save, Search, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function PreMeetingSchedulePage() {
    const [meetingList, setMeetingList] = useState<any[]>([]);
    const [upcomingMeeting, setUpcomingMeeting] = useState<any[]>([]);
    const [startedMeeting, setStartedMeeting] = useState<any[]>([]);
    const [totalMeetingOfDay, setTotalMeetingOfDay] = useState<any[]>([]);

    const [plannedDate, setPlannedDate] = useState<Date>(new Date());
    const [selectedTopic, setSelectedTopic] = useState<string>('0');
    const [vcFlag, setVcFlag] = useState<string>('JITSI');

    const [searchValue, setSearchValue] = useState('');
    const [searchValue2, setSearchValue2] = useState('');

    const [asmayId, setAsmayId] = useState<number>();
    const [amstId, setAmstId] = useState<number>();
    const [hrmeId, setHrmeId] = useState<number>();

    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const [activeMeetingDetails, setActiveMeetingDetails] = useState<any>(null);

    const [remarksModalOpen, setRemarksModalOpen] = useState(false);
    const [currentRemarks, setCurrentRemarks] = useState('');
    const [currentGrade, setCurrentGrade] = useState('');
    const [currentMeetingId, setCurrentMeetingId] = useState<number | null>(null);

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const processMeetings = (meetings: any[]) => {
        const upcoming: any[] = [];
        const started: any[] = [];

        meetings.forEach((obj: any) => {
            // Time processing logic based on original angular code can be added here if necessary
            const meetingDate = obj.lmslmeeT_MeetingDate || obj.lmslmeet_meetingdate;
            if (meetingDate != null && meetingDate !== '') {
                started.push(obj);
            } else {
                upcoming.push(obj);
            }
        });

        setUpcomingMeeting(upcoming);
        setStartedMeeting(started);
    };

    const loadInitialData = async () => {
        try {
            const res = (await getEmpDetails()) as any;
            if (res && res.data) {
                setMeetingList(res.data.meetinglist || []);
                setVcFlag(res.data.vcflag || 'JITSI');
                setTotalMeetingOfDay(res.data.totalmeetingsofday || []);
                processMeetings(res.data.meetinglist || []);
            }
        } catch (error) {
            toast.error('Failed to load meetings.');
        }
    };

    const handleDateChange = async (date: Date | undefined) => {
        if (!date) return;
        setPlannedDate(date);
        try {
            const payload = {
                ASMAY_Id: asmayId,
                AMST_Id: amstId,
                HRME_Id: hrmeId,
                LMSLMEET_PlannedDate: format(date, 'yyyy-MM-dd')
            };
            const res = (await onDateChange(payload)) as any;
            if (res && res.data) {
                setMeetingList(res.data.meetinglist || []);
                setTotalMeetingOfDay(res.data.totalmeetingsofday || []);
                setSelectedTopic('0');
                processMeetings(res.data.meetinglist || []);
            }
        } catch (error) {
            toast.error('Failed to fetch meetings for date.');
        }
    };

    const handleScheduleChange = async (topic: string) => {
        setSelectedTopic(topic);
        try {
            const payload = {
                ASMAY_Id: asmayId,
                AMST_Id: amstId,
                HRME_Id: hrmeId,
                LMSLMEET_PlannedDate: format(plannedDate, 'yyyy-MM-dd'),
                LMSLMEET_MeetingTopic: topic === '0' ? null : topic
            };
            const res = (await onScheduleChange(payload)) as any;
            if (res && res.data) {
                setMeetingList(res.data.meetinglist || []);
                processMeetings(res.data.meetinglist || []);
            }
        } catch (error) {
            toast.error('Failed to fetch schedule.');
        }
    };

    const handleStartMeeting = async (meeting: any, flg: string) => {
        const actionName = flg === '1' ? 're-start' : 'start';

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionName} meeting with ${meeting.studentname}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${actionName} it!`
        });

        if (result.isConfirmed) {
            try {
                const payload = {
                    lmslmeeT_Id: meeting.lmslmeeT_Id || meeting.lmslmeet_id || 0,
                    lmslmeeT_MeetingId: meeting.lmslmeeT_MeetingId || meeting.lmslmeet_meetingid || '',
                    lmslmeeT_MeetingTopic: meeting.lmslmeeT_MeetingTopic || meeting.lmslmeet_meetingtopic || ''
                };
                const res = (await onStartMeeting(payload)) as any;
                if (vcFlag === 'JITSI') {
                    setIsMeetingActive(true);
                    setActiveMeetingDetails(meeting);
                    initializeJitsi(meeting);
                } else if (vcFlag === 'BBB' || vcFlag === 'Teams') {
                    const meetingUrl = (res.data?.moderatorurl || res.data?.lmslmeeT_MeetingURL) as string;
                    window.open(meetingUrl, '_blank');
                }
            } catch (error) {
                toast.error('Failed to start meeting.');
            }
        }
    };

    const handleStopMeeting = async (meetingId: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to end/close meeting?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, end it!'
        });

        if (result.isConfirmed) {
            try {
                const payload = {
                    lmslmeeT_Id: meetingId,
                    hrmL_LeaveType: 'M'
                };
                const res = (await endMainMeeting(payload)) as any;
                if (res && (res.success || res.data?.returnval)) {
                    toast.success('Meeting Completed/Closed!');
                    setIsMeetingActive(false);
                    setActiveMeetingDetails(null);
                    document.getElementById('meet-container')!.innerHTML = '';
                    loadInitialData();
                }
            } catch (error) {
                toast.error('Failed to end meeting.');
            }
        }
    };

    const openRemarksModal = (meeting: any) => {
        setCurrentGrade(meeting.studentgrade || '');
        setCurrentRemarks(meeting.studentremarks || '');
        setCurrentMeetingId(meeting.lmslmeeT_Id || meeting.LMSLMEET_Id || meeting.lmslmeet_id);
        setRemarksModalOpen(true);
    };

    const handleSaveRemarks = async () => {
        if (!currentGrade || !currentRemarks) {
            toast.warning('Please enter grade and remarks');
            return;
        }
        try {
            const payload = {
                remarks: currentRemarks,
                grade: currentGrade,
                lmslmeeT_Id: currentMeetingId || 0
            };
            const res = (await saveRemarks(payload)) as any;
            if (res && (res.success || res.data?.returnval)) {
                toast.success('Remarks updated successfully');
                setRemarksModalOpen(false);
                loadInitialData();
            } else {
                toast.error('Remarks Not Saved');
            }
        } catch (error) {
            toast.error('Failed to save remarks');
        }
    };

    const initializeJitsi = (meeting: any) => {
        const domain = 'meet.jit.si';
        const options = {
            roomName: meeting.lmslmeeT_MeetingId || meeting.lmslmeet_meetingid,
            parentNode: document.querySelector('#meet-container'),
            userInfo: {
                displayName: meeting.intname || 'Staff'
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false
            }
        };
        if ((window as any).JitsiMeetExternalAPI) {
            new (window as any).JitsiMeetExternalAPI(domain, options);
        } else {
            const script = document.createElement('script');
            script.src = 'https://meet.jit.si/external_api.js';
            script.async = true;
            script.onload = () => {
                new (window as any).JitsiMeetExternalAPI(domain, options);
            };
            document.body.appendChild(script);
        }
    };

    const filteredUpcoming = upcomingMeeting.filter((m) => m.studentname?.toLowerCase().includes(searchValue.toLowerCase()));
    const filteredStarted = startedMeeting.filter((m) => m.studentname?.toLowerCase().includes(searchValue2.toLowerCase()));

    return (
        <div className='container mx-auto space-y-6 p-4'>
            {!isMeetingActive ? (
                <Card>
                    <CardHeader className='border-b bg-primary/5'>
                        <div className='flex flex-col items-center justify-between gap-4 md:flex-row'>
                            <div className='flex items-center gap-4'>
                                <span className='font-semibold text-lg'>Scheduled Date:</span>
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant={'outline'} className='w-[200px] justify-start text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {plannedDate ? format(plannedDate, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <Calendar
                                            mode='single'
                                            selected={plannedDate}
                                            onSelect={(date: any) => {
                                                handleDateChange(date);
                                                setIsCalendarOpen(false);
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {totalMeetingOfDay.length > 0 && (
                                <div className='flex items-center gap-4'>
                                    <span className='font-semibold text-lg'>Schedule list:</span>
                                    <Select value={selectedTopic} onValueChange={handleScheduleChange}>
                                        <SelectTrigger className='w-[250px]'>
                                            <SelectValue placeholder='All Schedule' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>All Schedule</SelectItem>
                                            {totalMeetingOfDay.map((opt, i) => (
                                                <SelectItem key={i} value={opt.LMSLMEET_MeetingTopic || opt.lmslmeet_meetingtopic}>
                                                    {opt.LMSLMEET_MeetingTopic || opt.lmslmeet_meetingtopic}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button onClick={() => window.location.reload()} variant='outline' className='bg-blue-50'>
                                <RefreshCw className='mr-2 h-4 w-4' /> Refresh
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className='grid grid-cols-1 gap-6 pt-6 md:grid-cols-2'>
                        {/* Upcoming Meetings Column */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between rounded-md bg-muted/30 p-2'>
                                <h3 className='font-bold text-lg text-primary'>UPCOMING MEETINGS</h3>
                                <span className='rounded-full bg-primary px-2 py-1 font-bold text-primary-foreground text-xs'>
                                    Total: {upcomingMeeting.length}
                                </span>
                            </div>

                            <div className='relative'>
                                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    type='search'
                                    placeholder='Search upcoming...'
                                    className='pl-8'
                                    value={searchValue}
                                    onChange={(e: any) => setSearchValue(e.target.value)}
                                />
                            </div>

                            <div className='max-h-[600px] space-y-4 overflow-y-auto pr-2'>
                                {filteredUpcoming.map((mm, index) => (
                                    <Card key={index} className='border-t-4 border-t-blue-500 shadow-sm'>
                                        <CardContent className='space-y-2 p-4'>
                                            <div className='flex items-start justify-between'>
                                                <div>
                                                    <p className='text-sm'>
                                                        <b>NAME:</b>{' '}
                                                        <span className='font-bold text-base text-blue-700'>{mm.studentname}</span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>MEETING:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.lmslmeeT_MeetingTopic || mm.lmslmeet_meetingtopic}
                                                        </span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>MEETING ID:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.lmslmeeT_Id || mm.lmslmeet_id}
                                                        </span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>REG. NO.:</b>{' '}
                                                        <span className='font-semibold text-blue-700'>
                                                            {mm.PASR_RegistrationNo || mm.pasr_registrationno}
                                                        </span>{' '}
                                                        <b>- CLASS:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.asmcL_ClassName || mm.asmcl_classname}
                                                        </span>
                                                    </p>
                                                </div>
                                                <span className='font-bold text-muted-foreground text-sm'>({index + 1})</span>
                                            </div>

                                            <div className='mt-2 rounded-md bg-muted/30 p-2 text-sm'>
                                                <b>DATE/TIME:</b>{' '}
                                                <span className='font-semibold'>
                                                    {mm.lmslmeeT_PlannedDate || mm.lmslmeet_planneddate
                                                        ? format(new Date(mm.lmslmeeT_PlannedDate || mm.lmslmeet_planneddate), 'dd-MM-yyyy')
                                                        : ''}{' '}
                                                    -- ({mm.lmslmeeT_PlannedStartTime || mm.lmslmeet_plannedstarttime} To{' '}
                                                    {mm.lmslmeeT_PlannedEndTime || mm.lmslmeet_plannedendtime})
                                                </span>
                                            </div>

                                            <div className='flex flex-wrap justify-end gap-2 pt-2'>
                                                <Button size='sm' variant='outline' onClick={() => openRemarksModal(mm)}>
                                                    <FileText className='mr-1 h-4 w-4' /> Remarks
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleStartMeeting(mm, '0')}
                                                    className='bg-green-600 hover:bg-green-700'>
                                                    <Video className='mr-1 h-4 w-4' /> START / JOIN
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredUpcoming.length === 0 && (
                                    <div className='rounded-md border border-dashed p-8 text-center text-muted-foreground'>
                                        No upcoming meetings found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Started Meetings Column */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between rounded-md bg-muted/30 p-2'>
                                <h3 className='font-bold text-lg text-primary'>JOIN/RE-START MEETINGS</h3>
                                <span className='rounded-full bg-primary px-2 py-1 font-bold text-primary-foreground text-xs'>
                                    Total: {startedMeeting.length}
                                </span>
                            </div>

                            <div className='relative'>
                                <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    type='search'
                                    placeholder='Search started...'
                                    className='pl-8'
                                    value={searchValue2}
                                    onChange={(e: any) => setSearchValue2(e.target.value)}
                                />
                            </div>

                            <div className='max-h-[600px] space-y-4 overflow-y-auto pr-2'>
                                {filteredStarted.map((mm, index) => (
                                    <Card key={index} className='border-t-4 border-t-green-500 shadow-sm'>
                                        <CardContent className='space-y-2 p-4'>
                                            <div className='flex items-start justify-between'>
                                                <div>
                                                    <p className='text-sm'>
                                                        <b>NAME:</b>{' '}
                                                        <span className='font-bold text-base text-blue-700'>{mm.studentname}</span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>MEETING:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.lmslmeeT_MeetingTopic || mm.lmslmeet_meetingtopic}
                                                        </span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>MEETING ID:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.lmslmeeT_Id || mm.lmslmeet_id}
                                                        </span>
                                                    </p>
                                                    <p className='text-sm'>
                                                        <b>REG. NO.:</b>{' '}
                                                        <span className='font-semibold text-blue-700'>
                                                            {mm.PASR_RegistrationNo || mm.pasr_registrationno}
                                                        </span>{' '}
                                                        <b>- CLASS:</b>{' '}
                                                        <span className='font-semibold text-indigo-600'>
                                                            {mm.asmcL_ClassName || mm.asmcl_classname}
                                                        </span>
                                                    </p>
                                                </div>
                                                <span className='font-bold text-muted-foreground text-sm'>({index + 1})</span>
                                            </div>

                                            <div className='mt-2 rounded-md bg-muted/30 p-2 text-sm'>
                                                <b>DATE/TIME:</b>{' '}
                                                <span className='font-semibold'>
                                                    {mm.lmslmeeT_PlannedDate || mm.lmslmeet_planneddate
                                                        ? format(new Date(mm.lmslmeeT_PlannedDate || mm.lmslmeet_planneddate), 'dd-MM-yyyy')
                                                        : ''}{' '}
                                                    -- ({mm.lmslmeeT_PlannedStartTime || mm.lmslmeet_plannedstarttime} To{' '}
                                                    {mm.lmslmeeT_PlannedEndTime || mm.lmslmeet_plannedendtime})
                                                </span>
                                                <br />
                                                {(mm.lmslmeeT_MeetingDate || mm.lmslmeet_meetingdate) && (
                                                    <span className='text-green-700'>
                                                        <b>STARTED:</b>{' '}
                                                        {format(new Date(mm.lmslmeeT_MeetingDate || mm.lmslmeet_meetingdate), 'dd-MM-yyyy')}{' '}
                                                        -- ({mm.lmslmeeT_StartedTime || mm.lmslmeet_startedtime})
                                                    </span>
                                                )}
                                            </div>

                                            <div className='mt-2 flex flex-wrap justify-end gap-2 border-t pt-2'>
                                                <Button
                                                    size='sm'
                                                    variant='destructive'
                                                    onClick={() => handleStopMeeting(mm.lmslmeeT_Id || mm.lmslmeet_id)}>
                                                    <X className='mr-1 h-4 w-4' /> END
                                                </Button>
                                                <Button size='sm' variant='outline' onClick={() => openRemarksModal(mm)}>
                                                    <FileText className='mr-1 h-4 w-4' /> Remarks
                                                </Button>
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleStartMeeting(mm, '1')}
                                                    className='bg-green-600 hover:bg-green-700'>
                                                    <Video className='mr-1 h-4 w-4' /> RE-START
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {filteredStarted.length === 0 && (
                                    <div className='rounded-md border border-dashed p-8 text-center text-muted-foreground'>
                                        No started meetings found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className='w-full'>
                    <CardHeader className='flex flex-row items-center justify-between bg-primary/5 pb-4'>
                        <div>
                            <CardTitle className='text-xl'>
                                MEETING TOPIC:{' '}
                                <span className='text-red-500'>
                                    {activeMeetingDetails?.lmslmeeT_MeetingTopic || activeMeetingDetails?.lmslmeet_meetingtopic}
                                </span>
                            </CardTitle>
                        </div>
                        <div className='flex gap-2'>
                            <Button variant='outline' onClick={() => openRemarksModal(activeMeetingDetails)}>
                                <FileText className='mr-2 h-4 w-4' /> Remarks
                            </Button>
                            <Button
                                variant='destructive'
                                onClick={() => handleStopMeeting(activeMeetingDetails?.lmslmeeT_Id || activeMeetingDetails?.lmslmeet_id)}>
                                <X className='mr-2 h-4 w-4' /> End Meeting
                            </Button>
                            <Button
                                variant='secondary'
                                onClick={() => {
                                    setIsMeetingActive(false);
                                    document.getElementById('meet-container')!.innerHTML = '';
                                }}>
                                <ArrowLeft className='mr-2 h-4 w-4' /> Go Back
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className='p-0'>
                        <div id='meet-container' style={{ height: '600px', width: '100%' }}></div>
                    </CardContent>
                </Card>
            )}

            {/* Remarks Modal */}
            <Dialog open={remarksModalOpen} onOpenChange={setRemarksModalOpen}>
                <DialogContent className='sm:max-w-[500px]'>
                    <DialogHeader>
                        <DialogTitle>STUDENT REMARKS</DialogTitle>
                    </DialogHeader>
                    <div className='space-y-4 py-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='grade' className='font-semibold text-base'>
                                Student Grade <span className='text-destructive'>*</span>
                            </Label>
                            <Input
                                id='grade'
                                value={currentGrade}
                                onChange={(e: any) => setCurrentGrade(e.target.value)}
                                placeholder='Enter Student Grade'
                            />
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='remarks' className='font-semibold text-base'>
                                Remarks <span className='text-destructive'>*</span>
                            </Label>
                            <Textarea
                                id='remarks'
                                rows={4}
                                value={currentRemarks}
                                onChange={(e: any) => setCurrentRemarks(e.target.value)}
                                placeholder='Enter Student Remarks.....!!'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setRemarksModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveRemarks} className='bg-primary'>
                            <Save className='mr-2 h-4 w-4' /> Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
