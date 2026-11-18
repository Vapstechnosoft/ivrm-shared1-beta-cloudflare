'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useGetInstitutionByLogin,
    useGetMasterPositionTypeGrid,
    useSaveOrUpdatePositionType
} from '@/hooks/hrms/recruitment/masters/useMasters';
import { recruitmentMasterPositionTypeSchema } from '@/schemas/hrms/recruitment/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type MasterPositionType, getMasterPositionTypeColumns } from './_components/columns';
import ToggleMasterPositionTypeModal from './_components/toggle-modal';

type MasterPositionTypeForm = z.infer<typeof recruitmentMasterPositionTypeSchema>;

export default function MasterPositionTypePage() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [resetkey, setResetkey] = useState(0);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedPositionType, setSelectedPositionType] = useState<MasterPositionType | null>(null);
    const formRef = useRef<HTMLDivElement>(null);

    const { data: institutionData, isLoading: institutionLoading } = useGetInstitutionByLogin();
    const { mutateAsync: saveMutation, isPending: isSubmittingMutation } = useSaveOrUpdatePositionType();

    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<MasterPositionTypeForm>({
        resolver: zodResolver(recruitmentMasterPositionTypeSchema),
        mode: 'onChange',
        defaultValues: {
            hrmpT_Institution: '',
            hrmpT_Name: '',
            hrmpT_Desc: '',
            hrmpT_ActiveFlg: true,
            mI_Id: 0,
            hrmpT_Id: 0
        }
    });

    const selectedInstitutionId = watch('hrmpT_Institution');

    const {
        data: positionTypeGridData,
        isLoading: isLoadingMasterPositionType,
        refetchAll: refetchMasterPositionType
    } = useGetMasterPositionTypeGrid(selectedInstitutionId ? Number(selectedInstitutionId) : 0);

    const gridData = positionTypeGridData?.data ?? [];

    // Clears only name/desc — keeps institution so the grid query stays active
    const handleClear = () => {
        setEditingId(null);
        const currentInstitution = watch('hrmpT_Institution');
        reset({
            hrmpT_Id: 0,
            hrmpT_ActiveFlg: true,
            hrmpT_Institution: currentInstitution, // preserve so grid stays visible
            hrmpT_Name: '',
            hrmpT_Desc: '',
            mI_Id: currentInstitution ? Number(currentInstitution) : 0
        });
        setResetkey((prev) => prev + 1);
    };

    const handleFullClear = () => {
        setEditingId(null);
        reset({ hrmpT_Id: 0, hrmpT_ActiveFlg: true, hrmpT_Institution: '', hrmpT_Name: '', hrmpT_Desc: '', mI_Id: 0 });
        setResetkey((prev) => prev + 1);
    };

    const onSubmit: SubmitHandler<MasterPositionTypeForm> = async (data) => {
        try {
            const payload = {
                hrmpT_Id: editingId || 0,
                mi_id: Number(data.hrmpT_Institution),
                hrmpT_Name: data.hrmpT_Name,
                hrmpT_Desc: data.hrmpT_Desc
            };
            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Position type updated successfully' : 'Position type created successfully');
                // Refetch FIRST (institution still set), THEN clear fields
                await refetchMasterPositionType();
                handleFullClear();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    const handleEdit = (positionType: MasterPositionType) => {
        setEditingId(positionType.hrmpT_Id);
        const institutionId = positionType.mI_Id?.toString() ?? selectedInstitutionId;
        reset({
            hrmpT_Id: positionType.hrmpT_Id,
            hrmpT_Institution: institutionId,
            hrmpT_Name: positionType.hrmpT_Name,
            hrmpT_Desc: positionType.hrmpT_Desc,
            hrmpT_ActiveFlg: positionType.hrmpT_ActiveFlg,
            mI_Id: positionType.mI_Id
        });
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 100);
    };

    const handleToggle = (positionType: MasterPositionType) => {
        setSelectedPositionType(positionType);
        setIsToggleOpen(true);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title={editingId ? 'Update Master Position Type' : 'Add New Master Position Type'}
                        description='Fill in the details below to manage a position type'
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
                                                name='hrmpT_Institution'
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
                                            {errors.hrmpT_Institution && <FormError>{errors.hrmpT_Institution.message}</FormError>}
                                        </div>
                                        <InputText
                                            key={`name-${resetkey}`}
                                            label='Position Type'
                                            required
                                            id='hrmpT_Name'
                                            {...register('hrmpT_Name')}
                                            error={errors.hrmpT_Name?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Position Type'
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <InputText
                                            key={`desc-${resetkey}`}
                                            label='Description'
                                            required
                                            id='hrmpT_Desc'
                                            {...register('hrmpT_Desc')}
                                            error={errors.hrmpT_Desc?.message}
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
                                                {editingId ? 'Update Master Position Type' : 'Save Master Position Type'}
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
                    title='Master Position Types List'
                    description='Manage position types for the selected institution'
                    defaultOpen={true}
                    size='lg'
                    className='shadow-lg'>
                    {isLoadingMasterPositionType || gridData.length > 0 || selectedInstitutionId ? (
                        <GenericDataTable
                            data={gridData || []}
                            columns={getMasterPositionTypeColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                            isLoading={isLoadingMasterPositionType}
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
                {selectedPositionType && (
                    <ToggleMasterPositionTypeModal
                        isOpen={isToggleOpen}
                        rowData={selectedPositionType}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={() => refetchMasterPositionType()}
                    />
                )}
            </div>
        </div>
    );
}
