'use client';

import { Button } from '@/components/ui/button';
import { FormError } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useMasterGetAllSubjectGroupDetails,
    useMasterSubjectGroup,
    useMasterSubjectGroupDetails
} from '@/hooks/exam/exammodule/usemasters';
import { masterSubjectGroupSchema } from '@/schemas/exam/exam-module/masters';
import { addOrUpdateMasterSubjectGroup } from '@/server/exam/exam-module/masters/subject-group';
import type { IMasterSubjectGroup, IMasterSubjectGroupDetails } from '@/types/exam/exam-module/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { SimpleSubjectTable } from './data-table';
import { DataStateHandler } from './generic-data-table';

type FormFields = z.infer<typeof masterSubjectGroupSchema.addOrUpdate>;

interface MasterSubjectGroupUpdateFormProps {
    initialData: IMasterSubjectGroup;
    onSuccess?: () => void;
    className?: string;
}

export default function MasterSubjectGroupUpdateForm({ initialData, onSuccess, className = '' }: MasterSubjectGroupUpdateFormProps) {
    const [selectedSubjects, setSelectedSubjects] = useState<IMasterSubjectGroupDetails[]>([]);
    const [allSubjects, setAllSubjects] = useState<IMasterSubjectGroupDetails[]>([]);
    const { refetchAll } = useMasterSubjectGroup();
    const [isLoading, setIsLoading] = useState(true);

    // Fetch group-specific subjects
    const {
        data: groupSubjectsResponse,
        isLoading: loadingGroupSubjects,
        refetchAll: refetchDetails
    } = useMasterSubjectGroupDetails(initialData.emG_Id);

    // Fetch all available subjects
    const { data: allSubjectsResponse, isLoading: loadingAllSubjects } = useMasterGetAllSubjectGroupDetails();

    // Initialize form
    const {
        register,
        handleSubmit,
        control,
        watch,
        reset,
        trigger,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterSubjectGroupSchema.addOrUpdate),
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: {
            emG_Id: initialData?.emG_Id || 0,
            emG_GroupName: initialData?.emG_GroupName || '',
            emG_TotSubjects: initialData?.emG_TotSubjects || 1,
            emG_MaxAplSubjects: initialData?.emG_MaxAplSubjects || 1,
            emG_MinAplSubjects: initialData?.emG_MinAplSubjects || 1,
            emG_BestOff: initialData?.emG_BestOff ?? 0,
            subject_list: []
        }
    });

    // Reset form values whenever initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                emG_Id: initialData.emG_Id || 0,
                emG_GroupName: initialData.emG_GroupName || '',
                emG_TotSubjects: initialData.emG_TotSubjects || 1,
                emG_MaxAplSubjects: initialData.emG_MaxAplSubjects || 1,
                emG_MinAplSubjects: initialData.emG_MinAplSubjects || 1,
                emG_BestOff: initialData.emG_BestOff ?? 0,
                subject_list: []
            });
            setIsLoading(true);
            setAllSubjects([]);
            setSelectedSubjects([]);
        }
    }, [initialData, reset]);

    // Normalize API data once loaded
    useEffect(() => {
        if (loadingAllSubjects || loadingGroupSubjects) return;

        const normalizedAllSubjects = normalizeSubjects(allSubjectsResponse?.data);
        const normalizedGroupSubjects = normalizeSubjects(groupSubjectsResponse?.data);

        const timer = setTimeout(() => {
            setAllSubjects(normalizedAllSubjects);
            setSelectedSubjects(normalizedGroupSubjects);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [allSubjectsResponse, groupSubjectsResponse, loadingAllSubjects, loadingGroupSubjects]);

    // Watch dependent fields for live cross-validation
    const total = watch('emG_TotSubjects');
    const max = watch('emG_MaxAplSubjects');
    const min = watch('emG_MinAplSubjects');
    const best = watch('emG_BestOff');

    // Live re-validation of dependent numeric rules
    useEffect(() => {
        trigger(['emG_TotSubjects', 'emG_MaxAplSubjects', 'emG_MinAplSubjects', 'emG_BestOff']);
    }, [total, max, min, best, trigger]);

    const isSubjectsEnabled = min > 0 && max > 0 && min <= max && max <= total;

    // Submit form
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        if (!isSubjectsEnabled) {
            toast.error('Enter valid Total, Min and Max subjects before saving');
            return;
        }

        if (selectedSubjects.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        if (selectedSubjects.length < data.emG_TotSubjects) {
            toast.error(`Please select exactly ${data.emG_TotSubjects} subjects (currently selected: ${selectedSubjects.length})`);
            return;
        }

        const payload = {
            emG_Id: initialData?.emG_Id ?? 0,
            emG_GroupName: data.emG_GroupName,
            emG_TotSubjects: data.emG_TotSubjects,
            emG_MaxAplSubjects: data.emG_MaxAplSubjects,
            emG_MinAplSubjects: data.emG_MinAplSubjects,
            emG_BestOff: data.emG_BestOff,
            subject_list: selectedSubjects.map((s) => ({ ismS_Id: s.ismS_Id }))
        };

        try {
            const res = await addOrUpdateMasterSubjectGroup(payload);
            if (res.success) {
                toast.success(res.message || 'Saved successfully.');
                reset();
                refetchAll();
                refetchDetails();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to save.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong.');
        }
    };

    return isLoading ? (
        <div className='flex h-64 items-center justify-center'>
            <div className='text-center'>
                <RefreshCw className='mx-auto h-8 w-8 animate-spin text-primary' />
                <p className='mt-2 text-gray-600 text-sm'>Loading data...</p>
            </div>
        </div>
    ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
            {/* Group Info */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <InputText
                        label='Group Name'
                        required
                        placeholder='Enter Group Name'
                        {...register('emG_GroupName')}
                        error={errors.emG_GroupName?.message}
                    />
                </div>

                <div>
                    <Controller
                        name='emG_TotSubjects'
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label='Total Subjects'
                                required
                                placeholder='Enter Total Subjects'
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger('emG_TotSubjects');
                                }}
                            />
                        )}
                    />
                    {errors.emG_TotSubjects && <FormError>{errors.emG_TotSubjects.message}</FormError>}
                </div>

                <div>
                    <Controller
                        name='emG_MaxAplSubjects'
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label='Max Applicable Subjects'
                                required
                                placeholder='Enter Max Applicable Subjects'
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger('emG_MaxAplSubjects');
                                }}
                            />
                        )}
                    />
                    {errors.emG_MaxAplSubjects && <FormError>{errors.emG_MaxAplSubjects.message}</FormError>}
                </div>

                <div>
                    <Controller
                        name='emG_MinAplSubjects'
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label='Min Applicable Subjects'
                                required
                                placeholder='Enter Min Applicable Subjects'
                                minValue={1}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger('emG_MinAplSubjects');
                                }}
                            />
                        )}
                    />
                    {errors.emG_MinAplSubjects && <FormError>{errors.emG_MinAplSubjects.message}</FormError>}
                </div>

                <div>
                    <Controller
                        name='emG_BestOff'
                        control={control}
                        render={({ field }) => (
                            <InputNumber
                                label='Best Off Subjects'
                                required
                                placeholder='Enter Best Off Subjects'
                                minValue={0}
                                value={field.value}
                                onChange={(v) => {
                                    field.onChange(v);
                                    trigger('emG_BestOff');
                                }}
                            />
                        )}
                    />
                    {errors.emG_BestOff && <FormError>{errors.emG_BestOff.message}</FormError>}
                </div>
            </div>

            {/* Subjects Table */}
            <CollapsibleSection title='Select Subjects' defaultOpen>
                <DataStateHandler
                    isLoading={false}
                    error={null}
                    success={!!allSubjects}
                    dataLength={allSubjects?.length ?? 0}
                    errorMessage='Failed to load subjects'
                    loadingMessage='Loading subjects...'
                    noDataTitle='No Subjects Found'
                    noDataDescription='Please add or fetch subjects to display here.'>
                    <SimpleSubjectTable
                        allSubjects={allSubjects}
                        preselectedSubjects={selectedSubjects}
                        maxSelectableRows={total}
                        disabled={!isSubjectsEnabled}
                        onSelectionChange={setSelectedSubjects}
                    />
                </DataStateHandler>

                {/* Selection Summary */}
                {selectedSubjects.length > 0 && (
                    <div className='mt-4 rounded border bg-gray-50 p-3'>
                        <div className='flex flex-wrap items-center justify-between gap-2'>
                            <div className='font-medium text-sm'>
                                Selected: <span className='text-blue-600'>{selectedSubjects.length}</span> of {total} required subjects
                            </div>
                            <div className='flex items-center gap-3'>
                                <div className='text-gray-500 text-xs'>
                                    {selectedSubjects.length === total ? (
                                        <span className='text-green-600'>✓ Selection requirement met</span>
                                    ) : selectedSubjects.length < total ? (
                                        <span className='text-amber-600'>Select {total - selectedSubjects.length} more subject(s)</span>
                                    ) : (
                                        <span className='text-red-600'>Remove {selectedSubjects.length - total} subject(s)</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CollapsibleSection>

            {/* Actions */}
            <div className='flex w-fit items-center justify-center gap-3'>
                <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                        reset({
                            emG_Id: initialData?.emG_Id || 0,
                            emG_GroupName: initialData?.emG_GroupName || '',
                            emG_TotSubjects: initialData?.emG_TotSubjects || 1,
                            emG_MaxAplSubjects: initialData?.emG_MaxAplSubjects || 1,
                            emG_MinAplSubjects: initialData?.emG_MinAplSubjects || 1,
                            emG_BestOff: initialData?.emG_BestOff ?? 0,
                            subject_list: []
                        });

                        // Reset selected subjects to the original ones loaded
                        const normalizedGroupSubjects = normalizeSubjects(groupSubjectsResponse?.data);
                        setSelectedSubjects(normalizedGroupSubjects);
                    }}>
                    Reset
                </Button>

                <Button type='submit' disabled={isSubmitting} isLoading={isSubmitting} loadingText='Updating...'>
                    Update
                </Button>
            </div>
        </form>
    );
}

function normalizeSubjects(data: any): IMasterSubjectGroupDetails[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if ('$values' in data && Array.isArray(data.$values)) return data.$values;
    return [];
}
