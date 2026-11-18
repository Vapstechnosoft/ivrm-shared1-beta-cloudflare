'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import {
    useAcademicYearDropDownMasterDayClasswise,
    useSubjectDropDownMasterDayClasswise,
    useSubjectRestrictionPeriodSubjectGridData
} from '@/hooks/timetable/constraints/subjectrestriction';
import { getSubjectRestrictionDetailsRestrictions } from '@/server/timetable/constraints/subjectrestriction';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PeriodSubjectAddForm from './periodsubjectAddForm';
import { periodSubjectColumns } from './periodsubjectColumns';
import PeriodSubjectToggle from './periodsubjectToggle';
import PeriodSubjectUpdate from './periodsubjectUpdate';

interface PeriodSubjectTabProps {
    initialData?: any;
    searchParams?: any;
}

export default function PeriodSubjectTab({ initialData, searchParams }: PeriodSubjectTabProps) {
    return (
        <FormProvider>
            <PeriodSubjectTabContent initialData={initialData} searchParams={searchParams} />
        </FormProvider>
    );
}

function PeriodSubjectTabContent({ initialData, searchParams }: PeriodSubjectTabProps) {
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

    const { data: academicYearData } = useAcademicYearDropDownMasterDayClasswise();
    const { data: subjectsData } = useSubjectDropDownMasterDayClasswise();

    const academicList = (academicYearData as any)?.data || (Array.isArray(academicYearData) ? academicYearData : []);
    const subjectList = (subjectsData as any)?.data || (Array.isArray(subjectsData) ? subjectsData : []);
    const [periodList, setPeriodList] = useState<any[]>([]);

    const {
        data: gridResponse,
        isLoading: isGridLoading,
        error,
        refetchAll
    } = useSubjectRestrictionPeriodSubjectGridData(searchParams);

    const tableProps = useDataTableProps(gridResponse);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const settings = await getSubjectRestrictionDetailsRestrictions();
                const sData = settings?.data || settings;
                if (sData) setPeriodList(sData.periodlist || []);
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
                    <Plus className='mr-2 h-4 w-4' /> Add Period Subject Restriction
                </Button>
            </div>

            <CollapsibleSection defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <GenericDataTable
                    {...tableProps}
                    columns={periodSubjectColumns}
                    isLoading={isGridLoading}
                    error={error}
                    columnPinning={{ right: ['actions'] }}
                    loadingMessage='Loading period subject constraint data...'
                    noDataTitle='No Period Subject Constraints Found'
                    noDataDescription='Add a new period subject constraint to get started'
                    errorTitle='Error Loading Data'
                />
            </CollapsibleSection>

            {isToggleFormOpen && selectedRow && <PeriodSubjectToggle rowData={selectedRow} onClose={closeToggleForm} />}

            {isAddFormOpen && (
                <div ref={addFormRef}>
                    <CollapsibleSection
                        title='Add New Period Subject Constraint'
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
                            <PeriodSubjectAddForm
                                academicList={academicList}
                                periodList={periodList}
                                subjectList={subjectList}
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
                        title='Edit Period Subject Constraint'
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
                            <PeriodSubjectUpdate
                                academicList={academicList}
                                periodList={periodList}
                                subjectList={subjectList}
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
