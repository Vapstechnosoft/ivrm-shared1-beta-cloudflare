// Refactored by automation script on 2025-10-28T15:40:35.887Z
// TODO: Complete refactoring by:
// 1. Import columns from _components/columns.tsx
// 2. Import form from _components/location-form.tsx
// 3. Extract column definitions and form to the respective files
// 4. Update handlers to use the new structure
'use client';
import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetInstitutionByLogin, useGetMasterLocationGrid, useSaveOrUpdateLocation } from '@/hooks/hrms/recruitment/masters/useMasters';
import { recruitmentMasterLocationSchema } from '@/schemas/hrms/recruitment/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { type MasterLocation, getMasterLocationColumns } from './_components/columns';
import ToggleMasterLocationModal from './_components/toggle-modal';

type MasterLocationForm = z.infer<typeof recruitmentMasterLocationSchema>;

export default function MasterLocationPage() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isToggleOpen, setIsToggleOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<MasterLocation | null>(null);
    const [resetkey, setResetkey] = useState(0);
    const formRef = useRef<HTMLDivElement>(null);

    const { data: institutionData, isLoading: institutionLoading } = useGetInstitutionByLogin();
    const { mutateAsync: saveMutation, isPending: isSubmittingMutation } = useSaveOrUpdateLocation();
    console.log('institutionData', institutionData);

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<MasterLocationForm>({
        resolver: zodResolver(recruitmentMasterLocationSchema),
        mode: 'onChange',
        defaultValues: {
            hrmlO_Id: 0,
            hrmlO_ActiveFlg: true,
            hrmlO_Institution: '',
            hrmlO_LocationName: '',
            hrmlO_LocationDesc: ''
        }
    });

    const selectedInstitutionId = watch('hrmlO_Institution');
    console.log('selectedInstitutionId', selectedInstitutionId);

    const {
        data: masterLocationGridData,
        isLoading: masterLocationDataLoading,
        refetchAll: refetchMasterLocationGrid
    } = useGetMasterLocationGrid(selectedInstitutionId ? Number(selectedInstitutionId) : 0);

    console.log('masterLocationGridData', masterLocationGridData);

    const gridData = masterLocationGridData?.data ?? [];

    // Clears only name/desc fields — keeps institution so the grid query stays active
    const handleClear = () => {
        setEditingId(null);
        const currentInstitution = watch('hrmlO_Institution');
        reset({
            hrmlO_Id: 0,
            hrmlO_ActiveFlg: true,
            hrmlO_Institution: currentInstitution, // preserve so grid stays visible
            hrmlO_LocationName: '',
            hrmlO_LocationDesc: '',
            mi_Id: currentInstitution ? Number(currentInstitution) : 0
        });
        setResetkey((prev) => prev + 1);
    };

    const handleFullClear = () => {
        setEditingId(null);
        reset({ hrmlO_Id: 0, hrmlO_ActiveFlg: true, hrmlO_Institution: '', hrmlO_LocationName: '', hrmlO_LocationDesc: '', mi_Id: 0 });
        setResetkey((prev) => prev + 1);
    };

    const onSubmit: SubmitHandler<MasterLocationForm> = async (data: MasterLocationForm) => {
        try {
            const payload = {
                hrmlO_Id: editingId || 0,
                mi_Id: Number(data.hrmlO_Institution),
                hrmlO_LocationName: data.hrmlO_LocationName,
                hrmlO_LocationDesc: data.hrmlO_LocationDesc,
                hrmlO_ActiveFlg: data.hrmlO_ActiveFlg ?? true
            };
            const result = await saveMutation(payload);
            if (result.success) {
                toast.success(editingId ? 'Location updated successfully' : 'Location created successfully');
                // Refetch FIRST (institution still set), THEN clear name/desc
                await refetchMasterLocationGrid();
                handleFullClear();
            } else {
                toast.error(result.message || 'Operation failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };
    const handleEdit = (location: MasterLocation) => {
        console.log('edit location', location);
        setEditingId(location.hrmlO_Id);
        // mi_Id is the institution id from the API; fall back to currently selected institution
        const institutionId = location.mi_Id?.toString() ?? location.hrmlO_Institution ?? selectedInstitutionId;
        reset({
            hrmlO_Id: location.hrmlO_Id,
            hrmlO_Institution: institutionId,
            hrmlO_LocationName: location.hrmlO_LocationName,
            hrmlO_LocationDesc: location.hrmlO_LocationDesc,
            hrmlO_ActiveFlg: location.hrmlO_ActiveFlg
        });

        // Scroll to form after state update
        setTimeout(() => {
            formRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            });
        }, 100);
    };
    const handleToggle = (location: MasterLocation) => {
        setSelectedLocation(location);
        setIsToggleOpen(true);
    };
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div ref={formRef} className='slide-in-from-top-4 animate-in duration-300'>
                    <CollapsibleSection
                        title={editingId ? 'Update Master Location' : 'Add New Master Location'}
                        description='Fill in the details below to create a new location'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='shadow-lg'
                        headerClassName=''>
                        <div className='relative'>
                            <form onSubmit={handleSubmit(onSubmit)} className='max-w-full space-y-6'>
                                {/* Primary Information Section */}
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                                        <div className='flex flex-col gap-1.5'>
                                            <span className='font-medium text-sm'>
                                                Institution <span className='text-red-500'>*</span>
                                            </span>
                                            <Controller
                                                key={resetkey}
                                                name='hrmlO_Institution'
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
                                            {errors.hrmlO_Institution && <FormError>{errors.hrmlO_Institution.message}</FormError>}
                                        </div>
                                        <InputText
                                            key={resetkey}
                                            label='Location Name'
                                            required
                                            id='hrmlO_LocationName'
                                            {...register('hrmlO_LocationName', { required: 'Location Name is required' })}
                                            error={errors.hrmlO_LocationName?.message}
                                            className='mt-0 transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Location'
                                        />
                                    </div>
                                    <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
                                        <InputText
                                            key={resetkey}
                                            label='Location Desc.'
                                            required
                                            id='hrmlO_LocationDesc'
                                            {...register('hrmlO_LocationDesc', { required: 'Location Description is required' })}
                                            error={errors.hrmlO_LocationDesc?.message}
                                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                                            placeholder='Enter Location Description'
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
                                                {editingId ? 'Update Master Location' : 'Save Master Location'}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CollapsibleSection>
                </div>
                {/* Header */}

                {/* Data Table Section - Collapsible but default open */}
                <CollapsibleSection
                    title='Master Location Details'
                    description='Manage location details for different institutions'
                    defaultOpen={true}
                    size='lg'
                    className='shadow-lg'>
                    {masterLocationDataLoading || gridData?.length > 0 || selectedInstitutionId ? (
                        <GenericDataTable
                            data={gridData || []}
                            columns={getMasterLocationColumns({ onEdit: handleEdit, onToggle: handleToggle })}
                            isLoading={masterLocationDataLoading}
                            totalItems={gridData?.length || 0}
                            showViewOptions={false}
                        />
                    ) : (
                        <div className='flex items-center justify-center py-10'>
                            <p className='text-md text-muted-foreground'>Please Select Institution to View Data</p>
                        </div>
                    )}
                </CollapsibleSection>
                {selectedLocation && (
                    <ToggleMasterLocationModal
                        isOpen={isToggleOpen}
                        rowData={selectedLocation}
                        onClose={() => setIsToggleOpen(false)}
                        onSuccess={() => refetchMasterLocationGrid()}
                    />
                )}
            </div>
        </div>
    );
}
