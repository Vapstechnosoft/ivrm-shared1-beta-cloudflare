'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useGetMasterPriorityGrid, useSaveOrUpdatePriority } from '@/hooks/hrms/recruitment/masters/useMasters';
import { recruitmentMasterPrioritySchema } from '@/schemas/hrms/recruitment/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type MasterPriority, getMasterPriorityColumns } from './_components/columns';
import ToggleMasterPriorityModal from './_components/toggle-modal';

type MasterPriorityForm = z.infer<typeof recruitmentMasterPrioritySchema>;

export default function MasterPriorityPage() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedPriority, setSelectedPriority] = useState<MasterPriority | null>(null);
    const [resetkey, setResetkey] = useState(0);
    const formRef = useRef<HTMLDivElement>(null);

    const { mutateAsync: saveMutation, isPending: isSubmittingMutation } = useSaveOrUpdatePriority();

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<MasterPriorityForm>({
        resolver: zodResolver(recruitmentMasterPrioritySchema),
        mode: 'onChange',
        defaultValues: {
            hrmpR_Id: 0,
            hrmP_ActiveFlag: true,
            hrmP_Name: '',
            hrmP_Order: ''
        }
    });

    const { data: priorityGridData, isLoading: isLoadingMasterPriority, refetchAll: refetchMasterPriority } = useGetMasterPriorityGrid();

    const gridData = priorityGridData?.data ?? [];

    const handleClear = () => {
        setEditingId(null);
        reset({
            hrmpR_Id: 0,
            hrmP_ActiveFlag: true,
            hrmP_Name: '',
            hrmP_Order: ''
        });
        setResetkey((prev) => prev + 1);
    };

    const handleFullClear = () => {
        setEditingId(null);
        reset({ hrmpR_Id: 0, hrmP_ActiveFlag: true, hrmP_Name: '', hrmP_Order: '' });
        setResetkey((prev) => prev + 1);
    };

    const onSubmit: SubmitHandler<MasterPriorityForm> = async (data) => {
        console.log('form data', data);
        try {
            const payload = {
                hrmpR_Id: editingId || 0,
                hrmP_Name: data.hrmP_Name,
                hrmP_Order: Number(data.hrmP_Order),
                hrmP_ActiveFlag: data.hrmP_ActiveFlag ?? true
            };
            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Priority updated successfully' : 'Priority created successfully');
                await refetchMasterPriority();
                handleFullClear();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (priority: MasterPriority) => {
        setEditingId(priority.hrmpR_Id);

        reset({
            hrmpR_Id: priority.hrmpR_Id,
            hrmP_Name: priority.hrmP_Name,
            hrmP_Order: priority.hrmP_Order.toString(),
            hrmP_ActiveFlag: priority.hrmP_ActiveFlag
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    const handleToggle = (priority: MasterPriority) => {
        setSelectedPriority(priority);
        setIsToggleOpen(true);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title={editingId ? 'Update Master Priority' : 'Add New Master Priority'}
                        description='Fill in the details below to manage priority levels'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg'
                        headerClassName=''>
                        <div className='relative'>
                            <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <InputText
                                            key={`name-${resetkey}`}
                                            label='Priority Name'
                                            required
                                            id='hrmP_Name'
                                            {...register('hrmP_Name')}
                                            error={errors.hrmP_Name?.message}
                                            className='mt-0 transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Priority Name'
                                        />
                                        <InputText
                                            key={`order-${resetkey}`}
                                            label='Priority Order'
                                            required
                                            id='hrmP_Order'
                                            {...register('hrmP_Order')}
                                            error={errors.hrmP_Order?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Priority Order'
                                        />
                                    </div>
                                </div>
                                {/* Action Buttons */}
                                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={handleFullClear}
                                        disabled={isSubmittingMutation}
                                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                        Cancel
                                    </Button>
                                    <Button
                                        type='submit'
                                        disabled={isSubmittingMutation}
                                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                        {isSubmittingMutation ? (
                                            <div className='flex items-center'>
                                                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                                Saving...
                                            </div>
                                        ) : (
                                            <div className='flex items-center'>
                                                <Save className='mr-2 h-4 w-4' />
                                                {editingId ? 'Update Master Priority' : 'Save Master Priority'}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CollapsibleSection>
                </div>

                {/* Data Table Section */}
                <CollapsibleSection
                    title='Master Priority Details'
                    description='Manage priority levels and orders'
                    defaultOpen={true}
                    size='lg'
                    className='shadow-lg'>
                    {isLoadingMasterPriority || gridData.length > 0 ? (
                        <GenericDataTable
                            data={gridData || []}
                            columns={getMasterPriorityColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                            isLoading={isLoadingMasterPriority}
                            totalItems={gridData?.length || 0}
                            showViewOptions={false}
                        />
                    ) : (
                        <div className='flex items-center justify-center py-10'>
                            <p className='text-md text-muted-foreground'>Please Select Institution to View Data</p>
                        </div>
                    )}
                </CollapsibleSection>

                {/* Toggle Modal */}
                {selectedPriority && (
                    <ToggleMasterPriorityModal
                        isOpen={isToggleOpen}
                        rowData={selectedPriority}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={() => refetchMasterPriority()}
                    />
                )}
            </div>
        </div>
    );
}
