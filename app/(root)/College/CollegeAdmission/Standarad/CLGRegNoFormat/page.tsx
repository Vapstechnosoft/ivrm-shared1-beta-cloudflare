'use client';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RegNoFormatForm } from './_components/reg-no-format-form';

export default function CLGRegNoFormatPage() {
    return (
        <div className='min-h-screen'>
            <div className='container mx-auto space-y-4 p-1'>
                <CollapsibleSection title='Register Number Format' defaultOpen={true} variant='default' size='lg' className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <RegNoFormatForm />
                </CollapsibleSection>
            </div>
        </div>
    );
}
