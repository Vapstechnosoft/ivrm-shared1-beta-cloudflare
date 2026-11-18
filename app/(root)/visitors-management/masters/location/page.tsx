'use client';

import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { useMasterLocation } from '@/hooks/visitors-management/masters/useMasterLocation';
import { useState } from 'react';
import { columns } from './_components/columns';
import LocationForm from './_components/location-form';

export default function MasterLocationPage() {
    const { data: loadedData, isLoading, refetch } = useMasterLocation();
    const [isFormOpen, setIsFormOpen] = useState(true);

    const data = loadedData?.getdata || [];

    return (
        <div className='space-y-6 p-4'>
            <CollapsibleSection title='Master Location' isOpen={isFormOpen} onToggle={() => setIsFormOpen(!isFormOpen)}>
                <LocationForm
                    onSuccess={() => {
                        refetch();
                    }}
                />
            </CollapsibleSection>

            <CollapsibleSection title='Master Location List' isOpen={true} onToggle={() => {}}>
                <GenericDataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    //defaultSort={{ id: 'vmmL_Location', desc: false }}
                />
            </CollapsibleSection>
        </div>
    );
}
