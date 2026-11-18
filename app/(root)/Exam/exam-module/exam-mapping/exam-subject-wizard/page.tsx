'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { MasterViewDetails } from '@/components/ui/set-order/generic-set-order';
import { useExamSubjectWizard } from '@/hooks/exam/exammodule/exam-mapping';
import { UpdateOrderedSubjectDetails, getExamSubjectWizardDetails } from '@/server/exam/exam-module/exam-mapping/exam-subject-wizard';
import type { IExamSubjectOrder, IExamSubjectWizard } from '@/types/exam/exam-module/exam-mapping';
import { Plus, X } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AddExamSubjectWizard from './_components/add-from';
// import ExamSubjectWizardDetailsPage from './_components/exam-subject-wizard-details';
import { ExamSubjectWizardColumns } from './_components/columns';
import ExamSubjectWizardDetailsPage from './_components/exam-subject-wizard-details';
import ToggleSubjectWizardForm from './_components/toggle-form';
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default function ExamSubjectWizardPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetchAll } = useExamSubjectWizard(searchParams);
    return (
        <FormProvider<IExamSubjectWizard>>
            <ExamSubjectWizardPageContent response={response} isLoading={isLoading} error={error} refetchAll={refetchAll} />
        </FormProvider>
    );
}

function ExamSubjectWizardPageContent({
    response,
    isLoading,
    error,
    refetchAll
}: {
    response: any;
    isLoading: boolean;
    error: any;
    refetchAll: any;
}) {
    const { openAddForm } = useFormContext<IExamSubjectWizard>();
    const tableProps = useDataTableProps(response);
    const { isOrderDetailsOpen, selectedRow, closeOrderDetails } = useFormContext<IExamSubjectWizard>();
    const [isOrderSaving, setIsOrderSaving] = useState(false);
    const [isOrderloading, setIsOrderloading] = useState(true);
    const [orderData, setOrderData] = useState<(IExamSubjectOrder & { id: number })[]>([]);

    useEffect(() => {
        (async () => {
            if (isOrderDetailsOpen && selectedRow?.eycE_Id) {
                try {
                    const response = await getExamSubjectWizardDetails(selectedRow.eycE_Id);

                    if (response.success && response.data) {
                        const subjects: IExamSubjectOrder[] = Array.isArray(response.data) ? response.data : [];

                        const mappedData = subjects.map((d: any) => ({
                            ...d,
                            id: Number(d.ismS_Id ?? d.ISMS_Id ?? 0),
                            ismS_Id: Number(d.ismS_Id ?? d.ISMS_Id ?? 0),
                            eyceS_Id: Number(d.eyceS_Id ?? d.EYCES_Id ?? 0),
                            eycE_Id: Number(d.eycE_Id ?? d.EYCE_Id ?? selectedRow.eycE_Id ?? 0),
                            ismS_SubjectName: d.ismS_SubjectName ?? d.ISMS_SubjectName ?? '',
                            ismS_SubjectCode: d.ismS_SubjectCode ?? d.ISMS_SubjectCode ?? '',
                            eyceS_SubjectOrder: Number(d.eyceS_SubjectOrder ?? d.EYCES_SubjectOrder ?? 0)
                        }));
                        setOrderData(mappedData);
                    } else {
                        toast.error(response.message || 'Failed to fetch subjects.');
                    }
                    setIsOrderloading(false);
                } catch (error: any) {
                    toast.error(error.message || 'Something went wrong while fetching subjects.');
                    setIsOrderloading(false);
                }
            }
        })();
    }, [isOrderDetailsOpen, selectedRow]);

    // Save new order
    const handleSubjectOrderDetailsSave = async (updatedData: (IExamSubjectOrder & { id: number })[]) => {
        try {
            setIsOrderSaving(true);

            // Transform data into required format
            const temp_Subject_Order = updatedData.map((item: any, index) => ({
                eyceS_Id: Number(item.eyceS_Id || item.EYCES_Id || 0),
                EYCES_Id: Number(item.eyceS_Id || item.EYCES_Id || 0),
                eycE_Id: Number(item.eycE_Id || item.EYCE_Id || selectedRow?.eycE_Id || 0),
                EYCE_Id: Number(item.eycE_Id || item.EYCE_Id || selectedRow?.eycE_Id || 0),
                ismS_Id: Number(item.ismS_Id || item.ISMS_Id || item.id || 0),
                ISMS_Id: Number(item.ismS_Id || item.ISMS_Id || item.id || 0),
                eyceS_SubjectOrder: index + 1,
                EYCES_SubjectOrder: index + 1
            }));

            const payload = { temp_Subject_Order, Temp_Subject_Order: temp_Subject_Order };
            const response = await UpdateOrderedSubjectDetails(payload);

            if (response?.success) {
                toast.success(response.message || 'Subject order updated successfully');
                refetchAll();
                closeOrderDetails();
            } else {
                toast.error(response?.message || 'Failed to update subject order');
            }
        } catch (error: any) {
            console.error('Error updating order:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsOrderSaving(false);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                    <Button
                        type='button'
                        onClick={openAddForm}
                        className='w-fit shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                        <Plus className='h-4 w-4' />
                        Add Exam Subject Wizard
                    </Button>
                </div>

                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <GenericDataTable<IExamSubjectWizard>
                        {...tableProps}
                        columns={ExamSubjectWizardColumns}
                        isLoading={isLoading}
                        error={error}
                        columnPinning={{ right: ['subject_order', 'actions'] }}
                        //showSearchColumns={true}
                        loadingMessage='Loading exam subject wizard data...'
                        noDataTitle='No Exam Subject Wizard Records Found'
                        noDataDescription='Get started by creating your first exam subject wizard entry'
                        errorTitle='Error Loading Exam Subject Wizard Data'
                    />
                </CollapsibleSection>
                {/* Set Order Modal */}
                {isOrderDetailsOpen && (
                    <MasterViewDetails
                        isOpen={isOrderDetailsOpen}
                        onClose={closeOrderDetails}
                        data={orderData}
                        isLoading={isOrderloading}
                        isSaving={isOrderSaving}
                        columns={[
                            { key: 'id', label: 'SLNO', className: 'text-center w-12' },
                            { key: 'ismS_SubjectName', label: 'Subject Name', className: 'text-left' },
                            { key: 'ismS_SubjectCode', label: 'Subject Code', className: 'text-left' },
                            { key: 'eyceS_SubjectOrder', label: 'Exam-Subject Order', className: 'text-center w-36' }
                        ]}
                        onSave={handleSubjectOrderDetailsSave}
                        tableHeight='500px'
                        title='EXM-SUBJECT ORDER SETTING'
                    />
                )}

                <FormSections refetchAll={refetchAll} />
            </div>
        </div>
    );
}

function FormSections({ refetchAll }: { refetchAll: () => void }) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        isDetailsViewOpen,
        isToggleFormOpen,
        selectedRow,
        closeAddForm,
        closeEditForm,
        closeToggleForm,
        addFormRef,
        editFormRef,
        closeDetailsView
    } = useFormContext<IExamSubjectWizard>();

    const handleAddSuccess = () => {
        closeAddForm();
        refetchAll();
    };

    const handleEditSuccess = () => {
        closeEditForm();
        refetchAll();
    };

    const handleToggleClose = () => {
        closeToggleForm();
        refetchAll();
    };

    return (
        <>
            {/* Add Form */}
            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Exam Subject Wizard'
                        description='Fill in the details below to create a new exam subject mapping'
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
                            <AddExamSubjectWizard onSuccess={handleAddSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Edit Form */}
            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Exam Subject Wizard'
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
                            <AddExamSubjectWizard rowData={selectedRow} onSuccess={handleEditSuccess} />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {/* Toggle Form */}
            {isToggleFormOpen && selectedRow && <ToggleSubjectWizardForm rowData={selectedRow} onClose={handleToggleClose} />}

            {/* Details View */}
            {isDetailsViewOpen && selectedRow && <ExamSubjectWizardDetailsPage rowData={selectedRow} onClose={closeDetailsView} />}
        </>
    );
}
