'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { deactivateLabConstraints } from '@/server/timetable/constraints/labconstraints';
import { Plus, X } from 'lucide-react';
import { useCallback } from 'react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import LabConstraintsDelete from './lab-constraints-delete';
import LabConstraintsForm from './lab-constraints-form';
import LabConstraintsList from './lab-constraints-list';
import LabConstraintsToggleForm from './lab-constraints-toggle-form';
import LanConstraintsUpdate from './lan-contraints-update';

interface LabConstraintsProps {
    initialData: any;
}

export default function LabConstraints({ initialData }: LabConstraintsProps) {
    const handleSuccess = useCallback(async () => {
        window.location.reload();
    }, []);

    const handleToggle = async (row: any) => {
        return await deactivateLabConstraints(row.ttlaB_Id);
    };

    return (
        <FormProvider>
            <LabConstraintsContent initialData={initialData} onSuccess={handleSuccess} onToggle={handleToggle} />
        </FormProvider>
    );
}

function LabConstraintsContent({
    initialData,
    onSuccess,
    onToggle
}: {
    initialData: any;
    onSuccess: () => void;
    onToggle: (data: any) => Promise<any>;
}) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDeleteFormOpen,
        selectedRow,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDeleteForm
    } = useFormContext();

    const formSectionRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to form when it opens
    useEffect(() => {
        if (isAddFormOpen || isEditFormOpen) {
            formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isAddFormOpen, isEditFormOpen]);

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit bg-orange-500 shadow-md transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:shadow-lg'>
                        <Plus className='mr-2 h-4 w-4' />
                        Add Lab Constraints
                    </Button>
                </div>

                {/* Grid stays visible */}
                <LabConstraintsList data={initialData?.labconstraintslist || []} />

                {/* Form Sections at the bottom */}
                <div ref={formSectionRef} className='pt-4'>
                    <FormSections initialData={initialData} onSuccess={onSuccess} onToggle={onToggle} />
                </div>
            </div>
        </div>
    );
}

function FormSections({ initialData, onSuccess, onToggle }: any) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isToggleFormOpen,
        isDeleteFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        closeDeleteForm
    } = useFormContext();

    return (
        <>
            {isAddFormOpen && (
                <CollapsibleSection
                    title='Add New Lab Constraint'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={closeAddForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        <LabConstraintsForm initialData={initialData} onSuccess={onSuccess} onCancel={closeAddForm} />
                    </div>
                </CollapsibleSection>
            )}

            {isEditFormOpen && selectedRow && (
                <CollapsibleSection
                    title='Edit Lab Constraint'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in border-primary/20 shadow-lg duration-300'>
                    <div className='relative'>
                        <Button
                            type='button'
                            onClick={closeEditForm}
                            variant='ghost'
                            size='sm'
                            className='-top-[3.5rem] absolute right-12 w-fit border p-2 shadow-md hover:bg-destructive/10'>
                            <X className='h-4 w-4 text-destructive' /> Close
                        </Button>
                        <LanConstraintsUpdate
                            initialData={initialData}
                            selectedRow={selectedRow}
                            onSuccess={onSuccess}
                            onCancel={closeEditForm}
                        />
                    </div>
                </CollapsibleSection>
            )}

            {isToggleFormOpen && (
                <LabConstraintsToggleForm
                    isOpen={isToggleFormOpen}
                    onClose={closeToggleForm}
                    onConfirm={async () => {
                        const res = await onToggle(selectedRow);
                        if (res?.success || res?.returnval) {
                            toast.success(res.message || 'Status updated successfully');
                            onSuccess();
                        } else {
                            toast.error(res.message || 'Failed to update status');
                        }
                    }}
                    data={selectedRow}
                    message={selectedRow?.ttlaB_ActiveFlag ? 'Deactivate' : 'Activate'}
                />
            )}

            {isDeleteFormOpen && (
                <LabConstraintsDelete isOpen={isDeleteFormOpen} onClose={closeDeleteForm} onSuccess={onSuccess} data={selectedRow} />
            )}
        </>
    );
}
