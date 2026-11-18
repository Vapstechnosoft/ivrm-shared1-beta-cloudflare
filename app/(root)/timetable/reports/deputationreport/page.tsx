'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import DeputationReportForm from './_components/deputation-report-form';

export default function DeputationReportPage() {
    return (
        <div className='container space-y-4 p-1'>
            <CollapsibleSection title='Deputation Report' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <DeputationReportForm />
            </CollapsibleSection>
        </div>
    );
}
