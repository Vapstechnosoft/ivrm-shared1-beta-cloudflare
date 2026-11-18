'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MappingForm } from './_components/mapping-form';
import { DetailsTable } from './_components/details-table';
import { useClgyearlycoursemappingData, useSaveClgyearlycoursemappingData } from '@/hooks/college/useClgyearlycoursemapping';
import { toast } from 'sonner';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function ClgYearlyCourseMappingPage() {
    return (
        <FormProvider>
            <ClgYearlyCourseMappingContent />
        </FormProvider>
    );
}

function ClgYearlyCourseMappingContent() {
    const { openAddForm, isAddFormOpen, closeAddForm, addFormRef } = useFormContext();
    const { data: initialResponse, refetchAll } = useClgyearlycoursemappingData();
    const initialData = initialResponse?.data || initialResponse;
    const saveMutation = useSaveClgyearlycoursemappingData();

    const handleSave = (formData: any, semesterList: any[]) => {
        const sem_list: any[] = [];
        semesterList.forEach((semi) => {
            if (semi.xyz) {
                sem_list.push({
                    amsE_Id: Number(semi.amsE_Id),
                    acaycbS_SemStartDate: semi.acaycbS_SemStartDate ? new Date(semi.acaycbS_SemStartDate).toISOString() : null,
                    acaycbS_SemEndDate: semi.acaycbS_SemEndDate ? new Date(semi.acaycbS_SemEndDate).toISOString() : null,
                    acaycbS_SemOrder: semi.ACAYCBS_SemOrder
                });
            }
        });

        const data = {
            asmaY_Id: Number(formData.asmayId),
            amcO_Id: Number(formData.amcoId),
            amB_Id: Number(formData.ambId),
            acayC_From_Date: formData.courseStartDate ? new Date(formData.courseStartDate).toISOString() : null,
            acayC_To_Date: formData.courseEndDate ? new Date(formData.courseEndDate).toISOString() : null,
            acayC_NoOfSEM: Number(formData.acaycNoOfSem),
            acaycB_PreAdm_FDate: formData.branchPreAdmStartDate ? new Date(formData.branchPreAdmStartDate).toISOString() : null,
            acaycB_PreAdm_TDate: formData.branchPreAdmEndDate ? new Date(formData.branchPreAdmEndDate).toISOString() : null,
            acayB_ReferenceDate: formData.branchPreAdmCutoffDate ? new Date(formData.branchPreAdmCutoffDate).toISOString() : null,
            temp_sem_branch_DTO: sem_list
        };

        saveMutation.mutate(data, {
            onSuccess: (res) => {
                const responseData = res?.data || res;
                const isSuccess = res?.success || responseData?.success || responseData?.returnval;
                
                if (isSuccess) {
                    toast.success(responseData?.message || res?.message || 'Record Saved Successfully');
                    closeAddForm();
                    refetchAll();
                } else {
                    toast.error(responseData?.message || res?.message || 'Failed To Save Record');
                }
            },
            onError: () => {
                toast.error('Something Went Wrong Please Contact Administrator');
            }
        });
    };

    const handleClear = () => {
        // Clear is handled within form via react-hook-form reset()
    };

    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-1'>
                        <h1 className="text-2xl font-bold tracking-tight">Yearly Course Branch Semester Mapping</h1>
                        <p className="text-sm text-muted-foreground">Manage yearly course, branch, and semester mappings.</p>
                    </div>
                    {!isAddFormOpen && (
                        <Button
                            type='button'
                            onClick={openAddForm}
                            className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <Plus className='h-4 w-4 mr-2' />
                            Add New Mapping
                        </Button>
                    )}
                </div>

                {isAddFormOpen && (
                    <div ref={addFormRef}>
                        <CollapsibleSection title='Yearly Course Branch Semester Mapping' defaultOpen={true} variant='default' size='lg' className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                            <div className='relative'>
                                <Button
                                    type='button'
                                    onClick={closeAddForm}
                                    variant='ghost'
                                    size='sm'
                                    className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                                    <X className='h-4 w-4 text-destructive mr-1' /> Close
                                </Button>
                                <MappingForm onSave={handleSave} onClear={handleClear} />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {initialData?.getsaveddata && initialData.getsaveddata.length > 0 && (
                    <CollapsibleSection title='Details' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <DetailsTable data={initialData.getsaveddata} />
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
