'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import { usebifurcationAcademicYear } from '@/hooks/timetable/constraints/bifurcationconstraints';
import { useSubjectRestrictionPeriodStaffGridData } from '@/hooks/timetable/constraints/subjectrestriction';
import { getSubjectRestrictionDetailsRestrictions } from '@/server/timetable/constraints/subjectrestriction';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PeriodStaffAddForm from './periodstaffAddForm';
import { periodStaffColumns } from './periodstaffColumns';
import PeriodStaffToggle from './periodstaffToggle';
import PeriodStaffUpdate from './periodstaffUpdate';

interface PeriodStaffTabProps {
    initialData?: any;
    searchParams?: any;
}

export default function PeriodStaffTab({ initialData, searchParams }: PeriodStaffTabProps) {
    return (
        <FormProvider>
            <PeriodStaffTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function PeriodStaffTabContent({ initialData, searchParams }: PeriodStaffTabProps) {
    const {
        isAddFormOpen,
        isEditFormOpen,
        openAddForm,
        closeAddForm,
        closeEditForm,
        closeAllForms,
        isToggleFormOpen,
        closeToggleForm,
        selectedRow,
        addFormRef,
        editFormRef
    } = useFormContext();

    const [periodList, setPeriodList] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);

    const { data: academicData } = usebifurcationAcademicYear();
    const academicList = (academicData as any)?.data || [];

    const {
        data: gridResponse,
        isLoading: isGridLoading,
        error,
        refetchAll
    } = useSubjectRestrictionPeriodStaffGridData(searchParams);

    const tableProps = useDataTableProps(gridResponse);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const settings = await getSubjectRestrictionDetailsRestrictions();
                const sData = settings?.data || settings;
                if (sData) {
                    setPeriodList(sData.periodlist || []);
                    setStaffList(sData.stafflist || []);
                }
            } catch (err) {
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    const onFormSuccess = () => {
        refetchAll();
        closeAllForms();
    };

    return (
        <div className='space-y-4'>
            <div className='flex gap-4 sm:flex-row sm:items-center sm:justify-self-end'>
                <Button type='button' onClick={openAddForm} className='bg-orange-500 shadow-md hover:scale-105 hover:bg-orange-600'>
                    <Plus className='mr-2 h-4 w-4' /> Add Period Staff Constraint
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    columns={periodStaffColumns}
                    isLoading={isGridLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading period staff constraint data...'
                    noDataTitle='No Period Staff Constraints Found'
                    noDataDescription='Add a new period staff constraint to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <PeriodStaffToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Period Staff Constraint'
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
                            <PeriodStaffAddForm
                                academicList={academicList}
                                periodList={periodList}
                                staffList={staffList}
                                onSuccess={onFormSuccess}
                                onCancel={closeAddForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            {isEditFormOpen && selectedRow && (
                <div ref={editFormRef}>
                    <CollapsibleSection
                        title='Edit Period Staff Constraint'
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
                            <PeriodStaffUpdate
                                academicList={academicList}
                                periodList={periodList}
                                staffList={staffList}
                                selectedRow={selectedRow}
                                onSuccess={onFormSuccess}
                                onCancel={closeEditForm}
                            />
                        </div>
                    </CollapsibleSection>
                </div>
            )}
        </div>
    );
}
