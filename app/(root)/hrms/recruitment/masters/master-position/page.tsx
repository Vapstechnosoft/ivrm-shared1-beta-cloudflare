'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetInstitutionByLogin, useGetMasterPositionGrid, useSaveOrUpdatePosition } from '@/hooks/hrms/recruitment/masters/useMasters';
import { recruitmentMasterPositionSchema } from '@/schemas/hrms/recruitment/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type MasterPosition, getMasterPositionColumns } from './_components/columns';
import ToggleMasterPositionModal from './_components/toggle-modal';

type MasterPositionForm = z.infer<typeof recruitmentMasterPositionSchema>;

export default function MasterPositionPage() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<MasterPosition | null>(null);
    const [resetkey, setResetkey] = useState(0);
    const formRef = useRef<HTMLDivElement>(null);

    const { data: institutionData, isLoading: institutionLoading } = useGetInstitutionByLogin();
    const { mutateAsync: saveMutation, isPending: isSubmittingMutation } = useSaveOrUpdatePosition();

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<MasterPositionForm>({
        resolver: zodResolver(recruitmentMasterPositionSchema),
        mode: 'onChange',
        defaultValues: {
            hrmP_Id: 0,
            hrmP_ActiveFlg: true,
            hrmP_Institution: '',
            hrmP_Position: '',
            hrmP_Skills: '',
            hrmP_Desc: ''
        }
    });

    const selectedInstitutionId = watch('hrmP_Institution');

    const {
        data: positionGridData,
        isLoading: isLoadingMasterPosition,
        refetchAll: refetchMasterPosition
    } = useGetMasterPositionGrid(selectedInstitutionId ? Number(selectedInstitutionId) : 0);

    const gridData = positionGridData?.data ?? [];

    // Clears only name/skills/desc — keeps institution so the grid query stays active
    const handleClear = () => {
        setEditingId(null);
        const currentInstitution = watch('hrmP_Institution');
        reset({
            hrmP_Id: 0,
            hrmP_ActiveFlg: true,
            hrmP_Institution: currentInstitution, // preserve so grid stays visible
            hrmP_Position: '',
            hrmP_Skills: '',
            hrmP_Desc: '',
            mi_Id: currentInstitution ? Number(currentInstitution) : 0
        });
        setResetkey((prev) => prev + 1);
    };

    const handleFullClear = () => {
        setEditingId(null);
        reset({ hrmP_Id: 0, hrmP_ActiveFlg: true, hrmP_Institution: '', hrmP_Position: '', hrmP_Skills: '', hrmP_Desc: '', mi_Id: 0 });
        setResetkey((prev) => prev + 1);
    };

    const onSubmit: SubmitHandler<MasterPositionForm> = async (data) => {
        try {
            const payload = {
                hrmP_Id: editingId || 0,
                mi_Id: Number(data.hrmP_Institution),
                hrmP_Position: data.hrmP_Position,
                hrmP_Skills: data.hrmP_Skills,
                hrmP_Desc: data.hrmP_Desc,
                hrmP_ActiveFlg: data.hrmP_ActiveFlg ?? true
            };
            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Position updated successfully' : 'Position created successfully');
                await refetchMasterPosition();
                handleFullClear();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (position: MasterPosition) => {
        setEditingId(position.hrmP_Id);
        const institutionId = position.mI_Id?.toString() ?? selectedInstitutionId;
        reset({
            hrmP_Id: position.hrmP_Id,
            hrmP_Institution: institutionId,
            hrmP_Position: position.hrmP_Position,
            hrmP_Skills: position.hrmP_Skills,
            hrmP_Desc: position.hrmP_Desc,
            hrmP_ActiveFlg: position.hrmP_ActiveFlg,
            mi_Id: position.mI_Id
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    const handleToggle = (position: MasterPosition) => {
        setSelectedPosition(position);
        setIsToggleOpen(true);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title={editingId ? 'Update Master Position' : 'Add New Master Position'}
                        description='Fill in the details below to manage a position'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg'
                        headerClassName=''>
                        <div className='relative'>
                            <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <div className='flex flex-col gap-1.5'>
                                            <span className='font-medium text-sm'>
                                                Institution <span className='text-red-500'>*</span>
                                            </span>
                                            <Controller
                                                key={resetkey}
                                                name='hrmP_Institution'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value || ''}
                                                        onValueChange={field.onChange}
                                                        disabled={institutionLoading}>
                                                        <SelectTrigger>
                                                            <SelectValue
                                                                placeholder={
                                                                    institutionLoading ? 'Loading Institution...' : 'Select Institution'
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {institutionData?.data?.map((inst: any) => (
                                                                <SelectItem key={inst.mI_Id} value={inst.mI_Id.toString()}>
                                                                    {inst.mI_Name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.hrmP_Institution && <FormError>{errors.hrmP_Institution.message}</FormError>}
                                        </div>
                                        <InputText
                                            key={`pos-${resetkey}`}
                                            label='Position Name'
                                            required
                                            id='hrmP_Position'
                                            {...register('hrmP_Position')}
                                            error={errors.hrmP_Position?.message}
                                            className='mt-0 transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Position'
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
                                        <InputText
                                            key={`skill-${resetkey}`}
                                            label='Skill'
                                            required
                                            id='hrmP_Skills'
                                            {...register('hrmP_Skills')}
                                            error={errors.hrmP_Skills?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Skills'
                                        />
                                        <InputText
                                            key={`desc-${resetkey}`}
                                            label='Description'
                                            required
                                            id='hrmP_Desc'
                                            {...register('hrmP_Desc')}
                                            error={errors.hrmP_Desc?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Description'
                                        />
                                    </div>
                                    {errors.root && <FormError>{errors.root.message}</FormError>}
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
                                                {editingId ? 'Update Master Position' : 'Save Master Position'}
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
                    title='Master Position Details'
                    description='Manage position details with skills and descriptions'
                    defaultOpen={true}
                    size='lg'
                    className='shadow-lg'>
                    {isLoadingMasterPosition || gridData.length > 0 || selectedInstitutionId ? (
                        <GenericDataTable
                            data={gridData || []}
                            columns={getMasterPositionColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                            isLoading={isLoadingMasterPosition}
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
                {selectedPosition && (
                    <ToggleMasterPositionModal
                        isOpen={isToggleOpen}
                        rowData={selectedPosition}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={() => refetchMasterPosition()}
                    />
                )}
            </div>
        </div>
    );
}
