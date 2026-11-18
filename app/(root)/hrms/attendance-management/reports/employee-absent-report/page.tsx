'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider, useFormContext } from '@/components/ui/form/form-provider';
import AddEmployeeAbsentReportForm from './_components/add-from';
import type { EmployeeAbsentReportRow } from './_components/columns';

export default function EmployeeAbsentReportPage() {
    return (
        <FormProvider<EmployeeAbsentReportRow>>
            <EmployeeAbsentReportPageContent />
        </FormProvider>
    );
}

function FormSections() {
    const { closeAddForm, addFormRef } = useFormContext<EmployeeAbsentReportRow>();

    return (
        <div ref={addFormRef}>
            <CollapsibleSection
                title='Employee Absent Report Filters'
                description='Configure filters to generate the absent report'
                defaultOpen={true}
                variant='outline'
                size='md'
                className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                <AddEmployeeAbsentReportForm onSuccess={closeAddForm} />
            </CollapsibleSection>
        </div>
    );
}

function EmployeeAbsentReportPageContent() {
    // const tableProps = useDataTableProps(response);

    return (
        <div className='min-h-screen bg-background/50'>
            <div className='container max-w-7xl space-y-6 py-2'>
                <FormSections />
            </div>
        </div>
    );
}
