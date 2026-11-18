'use client';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEventsSponsor, useEventsSponsorEdit } from '@/hooks/sports/useEventsSponsor';
import { eventSponsorSchema } from '@/schemas/sports/transactions/events-sponsor';
import type { IEventSponsorMapping } from '@/types/sports/transactions/events-sponsor';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateEventSponsorMappingFormProps {
    selectedRow: IEventSponsorMapping;
    onSuccess: () => void;
}

export default function UpdateEventSponsorMappingForm({ selectedRow, onSuccess }: UpdateEventSponsorMappingFormProps) {
    const { details, saveMutation } = useEventsSponsor();
    const { data: editData, isLoading: isEditLoading } = useEventsSponsorEdit(selectedRow.spccesP_Id);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<IEventSponsorMapping>({
        resolver: zodResolver(eventSponsorSchema.addOrUpdate),
        defaultValues: selectedRow
    });

    // Reset form when edit data is fetched
    useEffect(() => {
        if (editData?.data) {
            const fetched = Array.isArray(editData.data) ? editData.data[0] : editData.data;
            if (fetched) {
                reset({
                    ...selectedRow,
                    ...fetched
                });
            }
        }
    }, [editData, reset, selectedRow]);

    if (details.isLoading || isEditLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    const onSubmit = async (values: IEventSponsorMapping) => {
        try {
            await saveMutation.mutateAsync(values);
            toast.success('Mapping updated successfully');
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to update mapping');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <FormFields details={details.data?.data} control={control} watch={watch} setValue={setValue} errors={errors} />
            <div className='flex justify-center gap-4'>
                <Button type='submit' className='w-32' disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : 'Update'}
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    className='w-32 transition-all duration-200 hover:scale-105'
                    onClick={() => {
                        reset();
                        onSuccess?.();
                    }}
                    disabled={saveMutation.isPending}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function FormFields({ details, control, watch, setValue, errors }: { details: any; control: any; watch: any; setValue: any; errors: any }) {
    const allPrograms = details?.events || [];
    // Deduplicate by Event ID + Program Name.
    const programs = Array.from(new Map(allPrograms.map((item: any) => [`${item.spccE_Id}::${item.spccpM_Name}`, item])).values()) as any[];

    const sponsors = details?.sponsorList || [];

    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='flex flex-col gap-2'>
                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Program Name</Label>
                <Controller
                    name='spccE_Id'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col gap-1'>
                            <Select
                                onValueChange={(val) => {
                                    const [id, name] = val.split('::');
                                    field.onChange(Number.parseInt(id));
                                    setValue('spccpM_Name', name);
                                }}
                                value={
                                    field.value !== undefined && watch('spccpM_Name')
                                        ? `${field.value}::${watch('spccpM_Name')}`
                                        : undefined
                                }>
                                <SelectTrigger
                                    className={
                                        errors.spccE_Id
                                            ? 'border-destructive ring-destructive/20'
                                            : 'transition-colors hover:border-primary/50'
                                    }>
                                    <SelectValue placeholder='Select Program' />
                                </SelectTrigger>
                                <SelectContent>
                                    {programs.map((prog, idx) => (
                                        <SelectItem
                                            key={`${prog.spccE_Id}-${prog.spccpM_Id}-${idx}`}
                                            value={`${prog.spccE_Id}::${prog.spccpM_Name}`}>
                                            {prog.spccpM_Name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.spccE_Id && <span className='font-medium text-destructive text-xs'>{errors.spccE_Id.message}</span>}
                        </div>
                    )}
                />
            </div>

            <div className='flex flex-col gap-2'>
                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Sponsor Name</Label>
                <Controller
                    name='spccmsP_Id'
                    control={control}
                    render={({ field }) => (
                        <div className='flex flex-col gap-1'>
                            <Select onValueChange={(val) => field.onChange(Number.parseInt(val))} value={field.value?.toString()}>
                                <SelectTrigger
                                    className={
                                        errors.spccmsP_Id
                                            ? 'border-destructive ring-destructive/20'
                                            : 'transition-colors hover:border-primary/50'
                                    }>
                                    <SelectValue placeholder='Select Sponsor' />
                                </SelectTrigger>
                                <SelectContent>
                                    {sponsors.map((sponsor: any) => (
                                        <SelectItem key={sponsor.spccmsP_Id} value={sponsor.spccmsP_Id.toString()}>
                                            {sponsor.spccmsP_SponsorName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.spccmsP_Id && <span className='font-medium text-destructive text-xs'>{errors.spccmsP_Id.message}</span>}
                        </div>
                    )}
                />
            </div>
        </div>
    );
}
