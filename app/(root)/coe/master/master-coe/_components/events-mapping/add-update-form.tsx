'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPageDetailsMap, saveEventsMapData } from '@/server/coe/masters/master-coe';
import { uploadDocument } from '@/server/document_upload';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Eye, Image as ImageIcon, Plus, RotateCcw, Save, Trash2, Video } from 'lucide-react';
import type React from 'react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { type EventsMapFormValues, eventsMapSchema } from './schema';

const formatDateOnly = (date: Date | string | undefined | null): string | null => {
    if (!date) return null;
    if (typeof date === 'string') {
        const trimmed = date.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }
        const d = new Date(trimmed);
        if (!Number.isNaN(d.getTime())) {
            return format(d, 'yyyy-MM-dd');
        }
        return null;
    }
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
        return format(date, 'yyyy-MM-dd');
    }
    return null;
};

const parseDateSafe = (dateStr: string | Date | undefined | null): Date | undefined => {
    if (!dateStr) return undefined;
    if (dateStr instanceof Date) return dateStr;
    if (typeof dateStr === 'string') {
        const trimmed = dateStr.trim();
        const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);
            return new Date(year, month, day);
        }
        const d = new Date(trimmed);
        return Number.isNaN(d.getTime()) ? undefined : d;
    }
    return undefined;
};

const formatTimeOnly = (timeStr: string | undefined | null): string => {
    if (!timeStr) return '';
    const trimmed = timeStr.trim();
    // If it's an ISO datetime string or contains 'T'
    if (trimmed.includes('T')) {
        const timePart = trimmed.split('T')[1]?.replace(/Z$/, '').split('.')[0];
        if (timePart) return timePart;
    }
    // If it starts with date like "YYYY-MM-DD HH:mm..."
    if (/^\d{4}-\d{2}-\d{2}\s+/.test(trimmed)) {
        return trimmed.replace(/^\d{4}-\d{2}-\d{2}\s+/, '');
    }
    return trimmed;
};

interface EventsMappingFormProps {
    onSuccess?: () => void;
    initialData: any;
    editData?: any;
}

export default function EventsMappingForm({ onSuccess, initialData, editData }: EventsMappingFormProps) {
    const form = useForm<EventsMapFormValues>({
        resolver: zodResolver(eventsMapSchema),
        defaultValues: {
            COEE_Id: 0,
            ASMAY_Id: '',
            COEME_Id: '',
            COEE_EStartDate: undefined,
            COEE_EEndDate: undefined,
            COEE_EStartTime: '',
            COEE_EEndTime: '',
            COEE_ReminderDays: '',
            COEE_ReminderDate: undefined,
            COEE_MailActiveFlag: false,
            COEE_SMSActiveFlag: false,
            COEE_RepeatFlag: false,
            COEE_ReminderSchedule: '',
            ASMAY_Id_o_s: '',
            COEE_StudentFlag: false,
            COEE_EmployeeFlag: false,
            COEE_OtherFlag: false,
            COEE_AlumniFlag: false,
            COEE_ManagementFlag: false,
            stu_class_list: [],
            emp_type_list: [],
            others_list: [],
            images_listCoe: [],
            videos_list: [],
            urldocumentlist: []
        }
    });

    const {
        fields: imageFields,
        append: appendImage,
        remove: removeImage,
        replace: replaceImage
    } = useFieldArray({
        control: form.control,
        name: 'images_listCoe'
    });

    const {
        fields: videoFields,
        append: appendVideo,
        remove: removeVideo
    } = useFieldArray({
        control: form.control,
        name: 'videos_list'
    });

    const {
        fields: otherFields,
        append: appendOther,
        remove: removeOther
    } = useFieldArray({
        control: form.control,
        name: 'others_list'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control: form.control,
        name: 'urldocumentlist'
    });

    useEffect(() => {
        if (editData) {
            const fetchDetails = async () => {
                try {
                    const coeeId = editData.coeE_Id || (editData as any).COEE_Id;
                    const res = await getPageDetailsMap(coeeId);

                    // Handle structured response
                    const responseData = (res as any).data || res;
                    const mapEventList = responseData.edit_map_event || responseData.event_mapping_list || [];

                    if (mapEventList && mapEventList.length > 0) {
                        const mainData = mapEventList[0];

                        // Extract related lists from the structured response
                        const classList = responseData.edit_stu_class_list || responseData.stu_class_list || [];
                        const empList = responseData.edit_emp_type_list || responseData.emp_type_list || [];
                        const imageList = responseData.edit_images_list || responseData.images_list || [];
                        const videoList = responseData.edit_videos_list || responseData.videos_list || [];
                        const otherList = responseData.others_list || [];
                        const urlList = responseData.urldocumentlist || [];

                        form.reset({
                            COEE_Id: mainData.coeE_Id || mainData.COEE_Id,
                            ASMAY_Id: (mainData.asmaY_Id || mainData.ASMAY_Id || '').toString(),
                            COEME_Id: (mainData.coemE_Id || mainData.COEME_Id || '').toString(),
                            COEE_EStartDate: parseDateSafe(mainData.coeE_EStartDate || mainData.COEE_EStartDate),
                            COEE_EEndDate: parseDateSafe(mainData.coeE_EEndDate || mainData.COEE_EEndDate),
                            COEE_EStartTime: formatTimeOnly(mainData.coeE_EStartTime || mainData.COEE_EStartTime || ''),
                            COEE_EEndTime: formatTimeOnly(mainData.coeE_EEndTime || mainData.COEE_EEndTime || ''),
                            COEE_ReminderDays: (mainData.coeE_ReminderDays || mainData.COEE_ReminderDays || '').toString(),
                            COEE_ReminderDate: parseDateSafe(mainData.coeE_ReminderDate || mainData.COEE_ReminderDate),
                            COEE_MailActiveFlag: mainData.coeE_MailActiveFlag ?? mainData.COEE_MailActiveFlag ?? false,
                            COEE_SMSActiveFlag: mainData.coeE_SMSActiveFlag ?? mainData.COEE_SMSActiveFlag ?? false,
                            COEE_RepeatFlag: mainData.coeE_RepeatFlag ?? mainData.COEE_RepeatFlag ?? false,
                            COEE_ReminderSchedule: mainData.coeE_ReminderSchedule || mainData.COEE_ReminderSchedule || '',
                            ASMAY_Id_o_s: (mainData.asmaY_Id_o_s || mainData.ASMAY_Id_o_s || '').toString(),
                            COEE_StudentFlag: mainData.coeE_StudentFlag ?? mainData.COEE_StudentFlag ?? false,
                            COEE_EmployeeFlag: mainData.coeE_EmployeeFlag ?? mainData.COEE_EmployeeFlag ?? false,
                            COEE_OtherFlag: mainData.coeE_OtherFlag ?? mainData.COEE_OtherFlag ?? false,
                            COEE_AlumniFlag: mainData.coeE_AlumniFlag ?? mainData.COEE_AlumniFlag ?? false,
                            COEE_ManagementFlag: mainData.coeE_ManagementFlag ?? mainData.COEE_ManagementFlag ?? false,
                            stu_class_list: classList.map((c: any) => ({ ASMCL_Id: c.asmcL_Id || c.ASMCL_Id })),
                            emp_type_list: empList.map((d: any) => ({ HRMD_Id: d.hrmD_Id || d.HRMD_Id })),
                            others_list: otherList.map((o: any) => ({
                                COEEO_Name: o.coeeO_Name || o.COEEO_Name,
                                COEEO_MobileNo: (o.coeeO_MobileNo || o.COEEO_MobileNo || '').toString(),
                                COEEO_Emailid: o.coeeO_Emailid || o.COEEO_Emailid
                            })),
                            images_listCoe: imageList.map((img: any) => ({
                                COEEI_Id: img.coeeI_Id,
                                COEEI_Images: img.coeeI_Images || img.intbfl_FilePath
                            })),
                            videos_list: videoList.map((v: any) => ({
                                COEEV_Id: v.coeeV_Id,
                                COEEV_VideoURL: v.coeeV_Videos || v.COEEV_VideoURL
                            })),
                            urldocumentlist: urlList.map((u: any) => ({
                                IHW_FilePath: u.ihW_FilePath || u.IHW_FilePath
                            }))
                        });
                    }
                } catch (error) {
                    Swal.fire({ title: 'Error!', text: 'Failed to fetch mapping details', icon: 'error' });
                }
            };
            fetchDetails();
        }
    }, [editData, form]);

    const onSubmit = async (values: EventsMapFormValues) => {
        try {
            const payload = {
                ...values,
                COEME_Id: Number(values.COEME_Id),
                ASMAY_Id: Number(values.ASMAY_Id),
                COEE_EStartDate: formatDateOnly(values.COEE_EStartDate),
                COEE_EEndDate: formatDateOnly(values.COEE_EEndDate),
                COEE_EStartTime: formatTimeOnly(values.COEE_EStartTime),
                COEE_EEndTime: formatTimeOnly(values.COEE_EEndTime),
                COEE_ReminderDate: formatDateOnly(values.COEE_ReminderDate),
                ASMAY_Id_o_s: values.ASMAY_Id_o_s ? Number(values.ASMAY_Id_o_s) : 0,
                COEE_ReminderDays: values.COEE_ReminderDays ? Number(values.COEE_ReminderDays) : 0,
                videos_list: values.videos_list.map((v) => v.COEEV_VideoURL)
            };

            const res = await saveEventsMapData(payload);
            if (res.success || res.returnval === true) {
                Swal.fire({
                    title: 'Success!',
                    text: res.message || (editData ? 'Event mapping updated' : 'Event mapping saved'),
                    icon: 'success'
                });
                form.reset();
                onSuccess?.();
            } else if (res.message === 'Record Already Exist' || res.message === 'Duplicate') {
                Swal.fire({ title: 'Warning!', text: res.message, icon: 'warning' });
            } else {
                Swal.fire({ title: 'Failed!', text: res.message || 'Failed to save mapping', icon: 'error' });
            }
        } catch (error: any) {
            if (typeof error === 'string' && (error === 'Record Already Exist' || error === 'Duplicate')) {
                Swal.fire({ title: 'Warning!', text: error, icon: 'warning' });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: typeof error === 'string' ? error : error?.message || 'An error occurred while saving',
                    icon: 'error'
                });
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('File', file);
        formData.append('folder', 'COE_Events');

        try {
            const res = await uploadDocument(formData);
            let url = '';

            // Handle various response formats from uploadDocument
            if (typeof res === 'string') {
                url = res;
            } else if (Array.isArray(res) && res.length > 0) {
                url = res[0].path || res[0];
            } else if (res && typeof res === 'object') {
                const data = (res as any).data || res;
                if (Array.isArray(data) && data.length > 0) {
                    url = data[0].path || data[0];
                } else {
                    url = (data as any).url || (data as any).path || (typeof data === 'string' ? data : '');
                }
            }

            if (url) {
                replaceImage([{ COEEI_Images: url }]);
                Swal.fire({ title: 'Success!', text: 'File uploaded successfully', icon: 'success' });
            } else {
                Swal.fire({ title: 'Failed!', text: 'Upload failed: Invalid response format', icon: 'error' });
                console.error('Upload response format unknown:', res);
            }
        } catch (error) {
            Swal.fire({ title: 'Error!', text: 'Upload failed', icon: 'error' });
        }
    };

    const data = initialData?.data || initialData;
    const years = data?.yearlist || data?.year_list || [];
    const masterEvents = data?.master_eventlist || data?.master_event_list || [];

    // Find the selected master event to display its details
    const selectedEventId = form.watch('COEME_Id');
    const selectedEvent = masterEvents.find((e: any) => (e.coemE_Id || e.COEME_Id).toString() === selectedEventId);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <CollapsibleSection title='Event Information' defaultOpen={true}>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Academic Year <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {years.map((y: any) => (
                                                <SelectItem key={y.asmaY_Id || y.ASMAY_Id} value={(y.asmaY_Id || y.ASMAY_Id).toString()}>
                                                    {y.asmaY_Year || y.ASMAY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEME_Id'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Event Name <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Event' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(Array.isArray(masterEvents) ? masterEvents : []).map((e: any) => (
                                                <SelectItem key={e.coemE_Id || e.COEME_Id} value={(e.coemE_Id || e.COEME_Id).toString()}>
                                                    {e.coemE_EventName || e.COEME_EventName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Email Subject</FormLabel>
                            <FormControl>
                                <Input disabled value={selectedEvent?.coemE_MailSubject || selectedEvent?.COEME_MailSubject || ''} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Email Header</FormLabel>
                            <FormControl>
                                <Input disabled value={selectedEvent?.coemE_MailHeader || selectedEvent?.COEME_MailHeader || ''} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Email Footer</FormLabel>
                            <FormControl>
                                <Input disabled value={selectedEvent?.coemE_MailFooter || selectedEvent?.COEME_MailFooter || ''} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Email Message</FormLabel>
                            <FormControl>
                                <Input disabled value={selectedEvent?.coemE_Mail_Message || selectedEvent?.COEME_Mail_Message || ''} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>SMS Message</FormLabel>
                            <FormControl>
                                <Input disabled value={selectedEvent?.coemE_SMSMessage || selectedEvent?.COEME_SMSMessage || ''} />
                            </FormControl>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Email Template</FormLabel>
                            <FormControl>
                                <Input
                                    disabled
                                    value={selectedEvent?.coemE_MailHTMLTemplate || selectedEvent?.COEME_MailHTMLTemplate || ''}
                                />
                            </FormControl>
                        </FormItem>
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='Schedule Details' defaultOpen={true}>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='COEE_EStartDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Start Date <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_EEndDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        End Date <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_EStartTime'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Start Time <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='09:00 AM' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_EEndTime'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        End Time <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='05:00 PM' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_ReminderDays'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reminder Days</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., 2' maxLength={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_ReminderDate'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Reminder Date</FormLabel>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_MailActiveFlag'
                            render={({ field }) => (
                                <FormItem className='flex items-center space-x-4 space-y-0'>
                                    <FormLabel className='w-32'>Email:</FormLabel>
                                    <div className='flex items-center space-x-4 rounded-md border px-4 py-2'>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === true}
                                                onChange={() => field.onChange(true)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>Yes</span>
                                        </label>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === false}
                                                onChange={() => field.onChange(false)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>No</span>
                                        </label>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='COEE_SMSActiveFlag'
                            render={({ field }) => (
                                <FormItem className='flex items-center space-x-4 space-y-0'>
                                    <FormLabel className='w-32'>SMS:</FormLabel>
                                    <div className='flex items-center space-x-4 rounded-md border px-4 py-2'>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === true}
                                                onChange={() => field.onChange(true)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>Yes</span>
                                        </label>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === false}
                                                onChange={() => field.onChange(false)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>No</span>
                                        </label>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='Repeat & Notification' defaultOpen={true}>
                    <div className='grid grid-cols-1 gap-6 pt-2 md:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='COEE_RepeatFlag'
                            render={({ field }) => (
                                <FormItem className='flex items-center space-x-4 space-y-0'>
                                    <FormLabel className='w-32'>Repeat Schedule:</FormLabel>
                                    <div className='flex items-center space-x-4 rounded-md border px-4 py-2'>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === true}
                                                onChange={() => field.onChange(true)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>Yes</span>
                                        </label>
                                        <label className='flex items-center space-x-2'>
                                            <input
                                                type='radio'
                                                checked={field.value === false}
                                                onChange={() => field.onChange(false)}
                                                className='h-4 w-4 text-primary'
                                            />
                                            <span className='text-sm'>No</span>
                                        </label>
                                    </div>
                                </FormItem>
                            )}
                        />
                        {form.watch('COEE_RepeatFlag') && (
                            <FormField
                                control={form.control}
                                name='COEE_ReminderSchedule'
                                render={({ field }) => (
                                    <FormItem>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Option' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='Daily'>Daily</SelectItem>
                                                <SelectItem value='Remainder Date'>Remainder Date</SelectItem>
                                                <SelectItem value='Upto Start Date'>Upto Start Date</SelectItem>
                                                <SelectItem value='Upto End Date'>Upto End Date</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='Participants Mapping' defaultOpen={true}>
                    <div className='flex items-center space-x-4 pt-4'>
                        <FormLabel className='w-32'>To Whom:</FormLabel>
                        <div className='flex flex-wrap gap-8'>
                            <FormField
                                control={form.control}
                                name='COEE_StudentFlag'
                                render={({ field }) => (
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Student</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='COEE_AlumniFlag'
                                render={({ field }) => (
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Alumni Student</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='COEE_EmployeeFlag'
                                render={({ field }) => (
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Staff</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='COEE_OtherFlag'
                                render={({ field }) => (
                                    <FormItem className='flex items-center space-x-2 space-y-0'>
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Others</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className='mt-6 grid grid-cols-1 gap-6'>
                        {form.watch('COEE_StudentFlag') && (
                            <div className='flex items-start space-x-4'>
                                <FormLabel className='w-32 pt-2'>
                                    Class: <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='h-48 flex-1 overflow-y-auto rounded-md border bg-background p-4'>
                                    <FormField
                                        control={form.control}
                                        name='stu_class_list'
                                        render={({ field }) => {
                                            const classOptions = data?.classlist || [];
                                            const selectedIds = field.value?.map((v: any) => Number(v.ASMCL_Id || v.asmcL_Id)) || [];
                                            const isAllSelected = selectedIds.length === classOptions.length && classOptions.length > 0;

                                            const handleSelectAll = (checked: boolean) => {
                                                if (checked) {
                                                    field.onChange(
                                                        classOptions.map((c: any) => ({ ASMCL_Id: Number(c.asmcL_Id || c.ASMCL_Id) }))
                                                    );
                                                } else {
                                                    field.onChange([]);
                                                }
                                            };

                                            const handleSelect = (checked: boolean, id: number) => {
                                                if (checked) {
                                                    field.onChange([...(field.value || []), { ASMCL_Id: id }]);
                                                } else {
                                                    field.onChange(
                                                        (field.value || []).filter((v: any) => Number(v.ASMCL_Id || v.asmcL_Id) !== id)
                                                    );
                                                }
                                            };

                                            return (
                                                <div className='space-y-3'>
                                                    <div className='flex items-center space-x-2 border-b pb-2'>
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            onCheckedChange={handleSelectAll}
                                                            id='select-all-classes'
                                                        />
                                                        <label
                                                            htmlFor='select-all-classes'
                                                            className='cursor-pointer font-medium text-sm leading-none'>
                                                            All
                                                        </label>
                                                    </div>
                                                    {classOptions.map((c: any) => {
                                                        const id = Number(c.asmcL_Id || c.ASMCL_Id);
                                                        return (
                                                            <div key={id} className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    checked={selectedIds.includes(id)}
                                                                    onCheckedChange={(checked) => handleSelect(!!checked, id)}
                                                                    id={`class-${id}`}
                                                                />
                                                                <label
                                                                    htmlFor={`class-${id}`}
                                                                    className='cursor-pointer text-sm leading-none'>
                                                                    {c.asmcL_ClassName || c.ASMCL_ClassName}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch('COEE_EmployeeFlag') && (
                            <div className='flex items-start space-x-4 pt-2'>
                                <FormLabel className='w-32 pt-2'>
                                    Staff: <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='h-48 flex-1 overflow-y-auto rounded-md border bg-background p-4'>
                                    <FormField
                                        control={form.control}
                                        name='emp_type_list'
                                        render={({ field }) => {
                                            const deptOptions = data?.stafftypelist || [];
                                            const selectedIds = field.value?.map((v: any) => Number(v.HRMD_Id || v.hrmD_Id)) || [];
                                            const isAllSelected = selectedIds.length === deptOptions.length && deptOptions.length > 0;

                                            const handleSelectAll = (checked: boolean) => {
                                                if (checked) {
                                                    field.onChange(
                                                        deptOptions.map((d: any) => ({ HRMD_Id: Number(d.hrmD_Id || d.HRMD_Id) }))
                                                    );
                                                } else {
                                                    field.onChange([]);
                                                }
                                            };

                                            const handleSelect = (checked: boolean, id: number) => {
                                                if (checked) {
                                                    field.onChange([...(field.value || []), { HRMD_Id: id }]);
                                                } else {
                                                    field.onChange(
                                                        (field.value || []).filter((v: any) => Number(v.HRMD_Id || v.hrmD_Id) !== id)
                                                    );
                                                }
                                            };

                                            return (
                                                <div className='space-y-3'>
                                                    <div className='flex items-center space-x-2 border-b pb-2'>
                                                        <Checkbox
                                                            checked={isAllSelected}
                                                            onCheckedChange={handleSelectAll}
                                                            id='select-all-depts'
                                                        />
                                                        <label
                                                            htmlFor='select-all-depts'
                                                            className='cursor-pointer font-medium text-sm leading-none'>
                                                            All
                                                        </label>
                                                    </div>
                                                    {deptOptions.map((d: any) => {
                                                        const id = Number(d.hrmD_Id || d.HRMD_Id);
                                                        return (
                                                            <div key={id} className='flex items-center space-x-2'>
                                                                <Checkbox
                                                                    checked={selectedIds.includes(id)}
                                                                    onCheckedChange={(checked) => handleSelect(!!checked, id)}
                                                                    id={`dept-${id}`}
                                                                />
                                                                <label
                                                                    htmlFor={`dept-${id}`}
                                                                    className='cursor-pointer text-sm leading-none'>
                                                                    {d.hrmD_DepartmentName || d.HRMD_DepartmentName}
                                                                </label>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch('COEE_AlumniFlag') && (
                            <div className='flex items-center space-x-4 pt-2'>
                                <FormLabel className='w-64'>
                                    Academic Year Of Old Students: <span className='text-destructive'>*</span>
                                </FormLabel>
                                <div className='flex-1 md:max-w-md'>
                                    <FormField
                                        control={form.control}
                                        name='ASMAY_Id_o_s'
                                        render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='--Select--' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {years.map((y: any) => (
                                                            <SelectItem
                                                                key={y.asmaY_Id || y.ASMAY_Id}
                                                                value={(y.asmaY_Id || y.ASMAY_Id).toString()}>
                                                                {y.asmaY_Year || y.ASMAY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {form.watch('COEE_OtherFlag') && (
                            <div className='space-y-4 rounded-md border bg-muted/20 p-4'>
                                <FormLabel className='block font-semibold'>Add Others</FormLabel>
                                <div className='grid grid-cols-1 items-end gap-4 md:grid-cols-[1fr_1fr_1fr_auto]'>
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <Input id='temp_other_name' placeholder='Name' />
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Mobile No</FormLabel>
                                        <Input id='temp_other_mobile' placeholder='Mobile No' maxLength={10} />
                                    </FormItem>
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <Input id='temp_other_email' placeholder='Email ID' type='email' />
                                    </FormItem>
                                    <Button
                                        type='button'
                                        onClick={() => {
                                            const nameInput = document.getElementById('temp_other_name') as HTMLInputElement;
                                            const mobileInput = document.getElementById('temp_other_mobile') as HTMLInputElement;
                                            const emailInput = document.getElementById('temp_other_email') as HTMLInputElement;

                                            if (nameInput.value && mobileInput.value && emailInput.value) {
                                                appendOther({
                                                    COEEO_Name: nameInput.value,
                                                    COEEO_MobileNo: mobileInput.value,
                                                    COEEO_Emailid: emailInput.value
                                                });
                                                nameInput.value = '';
                                                mobileInput.value = '';
                                                emailInput.value = '';
                                            } else {
                                                Swal.fire({ title: 'Error!', text: 'Please fill all fields before adding', icon: 'error' });
                                            }
                                        }}>
                                        <Plus className='mr-2 h-4 w-4' /> Add
                                    </Button>
                                </div>

                                {otherFields.length > 0 && (
                                    <div className='mt-4 space-y-2'>
                                        {otherFields.map((field, idx) => (
                                            <div
                                                key={field.id}
                                                className='flex items-center justify-between rounded border bg-background p-2 text-sm'>
                                                <div className='grid flex-1 grid-cols-3 gap-4 px-2'>
                                                    <span className='font-medium'>{form.watch(`others_list.${idx}.COEEO_Name`)}</span>
                                                    <span className='text-muted-foreground'>
                                                        {form.watch(`others_list.${idx}.COEEO_MobileNo`)}
                                                    </span>
                                                    <span className='text-muted-foreground'>
                                                        {form.watch(`others_list.${idx}.COEEO_Emailid`)}
                                                    </span>
                                                </div>
                                                <Button type='button' variant='ghost' size='icon' onClick={() => removeOther(idx)}>
                                                    <Trash2 className='h-4 w-4 text-destructive' />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                <CollapsibleSection title='Media Assets' defaultOpen={true}>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <FormLabel>Photos/Images</FormLabel>
                            <div className='flex items-center gap-4'>
                                <Input type='file' onChange={handleFileUpload} accept='image/*' />
                            </div>
                            <div className='mt-4 flex flex-wrap gap-2'>
                                {imageFields.map((field, idx) => (
                                    <div key={field.id} className='flex items-center gap-2 rounded border bg-muted/30 p-2'>
                                        <ImageIcon className='h-4 w-4 text-primary' />
                                        <span className='max-w-[150px] truncate text-xs'>
                                            {form.watch(`images_listCoe.${idx}.COEEI_Images`)}
                                        </span>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='h-6 w-6'
                                            onClick={() => {
                                                const url = form.watch(`images_listCoe.${idx}.COEEI_Images`);
                                                if (url) window.open(url, '_blank');
                                            }}>
                                            <Eye className='h-3 w-3 text-blue-500' />
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            className='h-6 w-6'
                                            onClick={() => removeImage(idx)}>
                                            <Trash2 className='h-3 w-3 text-destructive' />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <FormLabel>Video URLs</FormLabel>
                                <Button type='button' size='sm' variant='outline' onClick={() => appendVideo({ COEEV_VideoURL: '' })}>
                                    <Plus className='mr-2 h-4 w-4' /> Add Video
                                </Button>
                            </div>
                            {videoFields.map((field, idx) => (
                                <div key={field.id} className='flex gap-2'>
                                    <FormField
                                        control={form.control}
                                        name={`videos_list.${idx}.COEEV_VideoURL`}
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormControl>
                                                    <div className='relative'>
                                                        <Video className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                                                        <Input placeholder='YouTube/Vimeo URL' className='pl-9' {...field} />
                                                    </div>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => {
                                            const url = form.watch(`videos_list.${idx}.COEEV_VideoURL`);
                                            if (url) window.open(url, '_blank');
                                        }}>
                                        <Eye className='h-4 w-4 text-blue-500' />
                                    </Button>
                                    <Button type='button' variant='ghost' size='icon' onClick={() => removeVideo(idx)}>
                                        <Trash2 className='h-4 w-4 text-destructive' />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='mt-8 space-y-4 border-t pt-6'>
                        <div className='flex items-center justify-between'>
                            <FormLabel className='font-semibold text-base'>Other Document URLs</FormLabel>
                            <Button type='button' size='sm' variant='outline' onClick={() => appendUrl({ IHW_FilePath: '' })}>
                                <Plus className='mr-2 h-4 w-4' /> Add URL
                            </Button>
                        </div>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            {urlFields.map((field, idx) => (
                                <div key={field.id} className='flex gap-2'>
                                    <FormField
                                        control={form.control}
                                        name={`urldocumentlist.${idx}.IHW_FilePath`}
                                        render={({ field }) => (
                                            <FormItem className='flex-1'>
                                                <FormControl>
                                                    <Input placeholder='Document URL' {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='icon'
                                        onClick={() => {
                                            const url = form.watch(`urldocumentlist.${idx}.IHW_FilePath`);
                                            if (url) window.open(url, '_blank');
                                        }}>
                                        <Eye className='h-4 w-4 text-blue-500' />
                                    </Button>
                                    <Button type='button' variant='ghost' size='icon' onClick={() => removeUrl(idx)}>
                                        <Trash2 className='h-4 w-4 text-destructive' />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </CollapsibleSection>

                <div className='flex justify-end gap-3 pt-6'>
                    <Button type='button' variant='outline' onClick={() => form.reset()}>
                        <RotateCcw className='mr-2 h-4 w-4' /> Clear
                    </Button>
                    <Button type='submit' disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? (
                            <>
                                <RotateCcw className='mr-2 h-4 w-4 animate-spin' /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' /> {editData ? 'Update Mapping' : 'Save Mapping'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
