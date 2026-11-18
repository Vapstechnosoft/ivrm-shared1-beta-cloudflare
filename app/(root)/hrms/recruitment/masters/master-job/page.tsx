'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetMasterJobGrid, useGetMasterLocationDropDown, useSaveOrUpdateJob } from '@/hooks/hrms/recruitment/masters/useMasters';
import { recruitmentMasterJobSchema } from '@/schemas/hrms/recruitment/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, RefreshCw, Save, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { getMasterJobColumns } from './_components/columns';
import type { MasterJob } from './_components/columns';
import ToggleMasterJobModal from './_components/toggle-modal';

type MasterJobForm = z.infer<typeof recruitmentMasterJobSchema>;
export default function MasterJobPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<MasterJob | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const { data: masterGridData, isLoading: masterGridLoading, refetchAll: masterGridRefetch } = useGetMasterJobGrid();
    const { data: locationData, isLoading: locationLoading } = useGetMasterLocationDropDown();
    const { mutateAsync: saveMutation, isPending: isSubmitting } = useSaveOrUpdateJob();

    const locations = locationData?.data || [];

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<MasterJobForm>({
        resolver: zodResolver(recruitmentMasterJobSchema),
        mode: 'onChange',
        defaultValues: {
            hrmJ_Id: 0,
            hrmJ_JobCode: '',
            hrmJ_JobTiTle: '',
            hrmlO_Id: undefined,
            hrC_Id: 0
        }
    });

    const handleAddClick = () => {
        setIsFormOpen(true);
        setEditingId(null);
        reset({
            hrmJ_Id: 0,
            hrmJ_JobCode: '',
            hrmJ_JobTiTle: '',
            hrmlO_Id: undefined,
            hrC_Id: 0
        });
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingId(null);
        reset({
            hrmJ_Id: 0,
            hrmJ_JobCode: '',
            hrmJ_JobTiTle: '',
            hrmlO_Id: undefined,
            hrC_Id: 0
        });
    };

    const onSubmit: SubmitHandler<MasterJobForm> = async (data: MasterJobForm) => {
        console.log('data----', data);
        try {
            const payload = {
                ...data,
                hrmJ_Id: editingId || 0,
                hrmJ_Posted: new Date().toISOString().split('T')[0],
                hrC_Id: 0
            };

            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Job updated successfully' : 'Job created successfully');
                handleFormClose();
                masterGridRefetch();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (job: MasterJob) => {
        setEditingId(job.hrmJ_Id);
        reset({
            hrmJ_Id: job.hrmJ_Id,
            hrmJ_JobCode: job.hrmJ_JobCode,
            hrmJ_JobTiTle: job.hrmJ_JobTiTle,
            hrmlO_Id: job.hrmlO_Id,
            hrC_Id: job.hrC_Id
        });
        setIsFormOpen(true);
        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };

    const handleToggle = (job: MasterJob) => {
        setSelectedJob(job);
        setIsToggleOpen(true);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Header */}
                <div className='flex flex-col justify-end gap-4 md:flex-row md:items-center md:justify-end'>
                    <Button
                        type='button'
                        onClick={handleAddClick}
                        size='lg'
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Master Job
                    </Button>
                </div>
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                    headerClassName=''>
                    <GenericDataTable
                        data={masterGridData?.data || []}
                        columns={getMasterJobColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                        isLoading={masterGridLoading}
                        totalItems={masterGridData?.data.length || 0}
                        showViewOptions={false}
                    />
                </CollapsibleSection>
                {selectedJob && (
                    <ToggleMasterJobModal
                        isOpen={isToggleOpen}
                        rowData={selectedJob}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={masterGridRefetch}
                    />
                )}
                {/* Add Form Section - Conditionally Rendered */}
                {isFormOpen && (
                    <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                        <CollapsibleSection
                            title={editingId ? 'Update Master Job' : 'Add New Master Job'}
                            description='Fill in the details below to create a new job position'
                            defaultOpen={true}
                            variant='outline'
                            size='md'
                            className='shadow-lg'
                            headerClassName=''>
                            <div className='relative'>
                                <Button
                                    onClick={handleFormClose}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[4rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive' /> Close
                                </Button>
                                <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                    {/* Primary Information Section */}
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <InputText
                                                label='Job Code'
                                                required
                                                id='hrmJ_JobCode'
                                                {...register('hrmJ_JobCode')}
                                                error={errors.hrmJ_JobCode?.message}
                                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                                placeholder='Enter Job Code'
                                            />
                                            <InputText
                                                label='Job Title'
                                                required
                                                id='hrmJ_JobTiTle'
                                                {...register('hrmJ_JobTiTle')}
                                                error={errors.hrmJ_JobTiTle?.message}
                                                className='transition-colors focus:ring-2 focus:ring-primary/20'
                                                placeholder='Enter Job Title'
                                            />
                                        </div>
                                        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                            <div className='group flex flex-col gap-1.5'>
                                                <Label htmlFor='hrmlO_Id'>
                                                    Job Location <span className='text-destructive'>*</span>
                                                </Label>
                                                <Controller
                                                    name='hrmlO_Id'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            onValueChange={(value) => field.onChange(Number(value))}
                                                            value={field.value ? String(field.value) : ''}>
                                                            <SelectTrigger id='hrmlO_Id' disabled={locationLoading}>
                                                                <SelectValue
                                                                    placeholder={locationLoading ? 'Loading...' : 'Select Location'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {locations?.length === 0 ? (
                                                                    <div className='text-center text-muted-foreground'>
                                                                        No locations found.
                                                                    </div>
                                                                ) : (
                                                                    locations?.map((location: any) => (
                                                                        <SelectItem
                                                                            key={location.hrmlO_Id}
                                                                            value={String(location.hrmlO_Id)}>
                                                                            {location.hrmlO_LocationName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.hrmlO_Id && <FormError>{errors.hrmlO_Id.message}</FormError>}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleFormClose}
                                            disabled={isSubmitting}
                                            className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                            Cancel
                                        </Button>
                                        <Button
                                            type='submit'
                                            disabled={isSubmitting}
                                            className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                            {isSubmitting ? (
                                                <div className='flex items-center'>
                                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                    Saving...
                                                </div>
                                            ) : (
                                                <div className='flex items-center'>
                                                    <Save className='mr-2 h-4 w-4' />
                                                    {editingId ? 'Update Master Job' : 'Save Master Job'}
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </div>
    );
}
