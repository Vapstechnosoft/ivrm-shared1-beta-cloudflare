'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEventMapping } from '@/hooks/sports/useEventMapping';
import { type IEventMappingDTO, type ISponsor, eventMappingSchema } from '@/types/sports/transactions/events-mapping';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface AddEventsMappingFormProps {
    onSuccess?: () => void;
}

export default function AddEventsMappingForm({ onSuccess }: AddEventsMappingFormProps) {
    const { loadData, save } = useEventMapping();
    const { academicYear = [], eventsList = [], venuelist = [], sponsorList = [] } = (loadData.data as any)?.data || {};

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<IEventMappingDTO>({
        resolver: zodResolver(eventMappingSchema),
        defaultValues: {
            ASMAY_Id: 0,
            SPCCME_Id: 0,
            SPCCMEV_Id: 0,
            SPCCE_StartDate: new Date(),
            SPCCE_EndDate: new Date(),
            SPCCE_StartTime: '',
            SPCCE_EndTime: '',
            SPCCE_Remarks: '',
            SPCCE_SponsorFlag: false,
            sponsorData: []
        }
    });

    // Watch sponsor flag to toggle visibility
    const sponsorFlag = watch('SPCCE_SponsorFlag');

    const onSubmit = async (values: IEventMappingDTO) => {
        const payload = {
            ...values,
            ASMAY_Id: Number(values.ASMAY_Id),
            SPCCME_Id: Number(values.SPCCME_Id),
            SPCCMEV_Id: Number(values.SPCCMEV_Id),
            SPCCE_SponsorFlag: values.SPCCE_SponsorFlag || false,
            // Format dates as yyyy-MM-dd to prevent timezone shifts
            SPCCE_StartDate: values.SPCCE_StartDate ? format(new Date(values.SPCCE_StartDate), 'yyyy-MM-dd') : null,
            SPCCE_EndDate: values.SPCCE_EndDate ? format(new Date(values.SPCCE_EndDate), 'yyyy-MM-dd') : null,
            // Map sponsor properties to match backend DTO expectations
            sponsordata:
                values.sponsorData?.map((s) => ({
                    SPCCMSP_Id: s.spccmsP_Id,
                    selected: true,
                    spccmsP_ActiveFlag: true
                })) || []
        };

        const result = await save.mutateAsync(payload);
        if (result.success || result.message?.toLowerCase().includes('successfully')) {
            toast.success(result.message || 'Record Saved Successfully');
            onSuccess?.();
        } else {
            toast.error(result.message || 'Failed to save record');
        }
    };

    const handleSponsorChange = (sponsor: ISponsor, isChecked: boolean) => {
        const currentSponsors = watch('sponsorData') || [];
        if (isChecked) {
            setValue('sponsorData', [...currentSponsors, { ...sponsor, selected: true }]);
        } else {
            setValue(
                'sponsorData',
                currentSponsors.filter((s) => s.spccmsP_Id !== sponsor.spccmsP_Id)
            );
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {/* Academic Year */}
                <div className='flex flex-col gap-2'>
                    <Label>Academic Year</Label>
                    <Controller
                        name='ASMAY_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYear.map((y: any) => (
                                        <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                            {y.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.ASMAY_Id && <span className='text-destructive text-xs'>{errors.ASMAY_Id.message}</span>}
                </div>

                {/* Event */}
                <div className='flex flex-col gap-2'>
                    <Label>Event</Label>
                    <Controller
                        name='SPCCME_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Event' />
                                </SelectTrigger>
                                <SelectContent>
                                    {eventsList.map((e: any) => (
                                        <SelectItem key={e.spccmE_Id} value={e.spccmE_Id.toString()}>
                                            {e.spccmE_EventName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.SPCCME_Id && <span className='text-destructive text-xs'>{errors.SPCCME_Id.message}</span>}
                </div>

                {/* Venue */}
                <div className='flex flex-col gap-2'>
                    <Label>Venue</Label>
                    <Controller
                        name='SPCCMEV_Id'
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Venue' />
                                </SelectTrigger>
                                <SelectContent>
                                    {venuelist.map((v: any) => (
                                        <SelectItem key={v.spccmeV_Id} value={v.spccmeV_Id.toString()}>
                                            {v.spccmeV_EventVenue}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.SPCCMEV_Id && <span className='text-destructive text-xs'>{errors.SPCCMEV_Id.message}</span>}
                </div>

                {/* Start Date */}
                <div className='flex flex-col gap-2'>
                    <Label>Start Date</Label>
                    <Controller
                        name='SPCCE_StartDate'
                        control={control}
                        render={({ field }) => <DatePicker date={field.value as Date} setDate={field.onChange} />}
                    />
                    {errors.SPCCE_StartDate && <span className='text-destructive text-xs'>{errors.SPCCE_StartDate.message as string}</span>}
                </div>

                {/* Start Time */}
                <div className='flex flex-col gap-2'>
                    <Label>Start Time</Label>
                    <Input type='time' {...control.register('SPCCE_StartTime')} />
                    {errors.SPCCE_StartTime && <span className='text-destructive text-xs'>{errors.SPCCE_StartTime.message}</span>}
                </div>

                {/* End Date */}
                <div className='flex flex-col gap-2'>
                    <Label>End Date</Label>
                    <Controller
                        name='SPCCE_EndDate'
                        control={control}
                        render={({ field }) => <DatePicker date={field.value as Date} setDate={field.onChange} />}
                    />
                    {errors.SPCCE_EndDate && <span className='text-destructive text-xs'>{errors.SPCCE_EndDate.message as string}</span>}
                </div>

                {/* End Time */}
                <div className='flex flex-col gap-2'>
                    <Label>End Time</Label>
                    <Input type='time' {...control.register('SPCCE_EndTime')} />
                    {errors.SPCCE_EndTime && <span className='text-destructive text-xs'>{errors.SPCCE_EndTime.message}</span>}
                </div>
            </div>

            {/* Remarks */}
            <div className='flex flex-col gap-2'>
                <Label>Remarks</Label>
                <Textarea {...control.register('SPCCE_Remarks')} />
            </div>

            {/* Sponsor Checkbox */}
            <div className='flex items-center space-x-2'>
                <Controller
                    name='SPCCE_SponsorFlag'
                    control={control}
                    render={({ field }) => <Checkbox checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label>Sponsor Required?</Label>
            </div>

            {/* Sponsor List */}
            {sponsorFlag && (
                <div className='rounded-md border p-4'>
                    <Label className='mb-2 block'>Select Sponsors</Label>
                    <ScrollArea className='h-48'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                            {sponsorList.map((sponsor: ISponsor) => (
                                <div key={sponsor.spccmsP_Id} className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={(watch('sponsorData') || []).some((s) => s.spccmsP_Id === sponsor.spccmsP_Id)}
                                        onCheckedChange={(checked) => handleSponsorChange(sponsor, !!checked)}
                                    />
                                    <Label
                                        className='cursor-pointer font-normal'
                                        onClick={() =>
                                            handleSponsorChange(
                                                sponsor,
                                                !(watch('sponsorData') || []).some((s) => s.spccmsP_Id === sponsor.spccmsP_Id)
                                            )
                                        }>
                                        {sponsor.spccmsP_SponsorName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            <div className='flex justify-center gap-4'>
                <Button type='submit' className='w-32' disabled={save.isPending}>
                    {save.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Save'}
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    className='w-32'
                    onClick={() => {
                        reset();
                        onSuccess?.();
                    }}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
