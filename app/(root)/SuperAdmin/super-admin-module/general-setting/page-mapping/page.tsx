'use client';
import AvailableGrid from './_components/available-grid';
import { PageMappingProvider } from './_components/mapping-context';
import ModuleSelection from './_components/module-selection';
import SavedGrid from './_components/saved-grid';
import SuperAdminGrid from './_components/super-admin-grid';

import { usePageMapping } from './_components/mapping-context';

function PageMappingContentInner() {
    const { selectedModuleId } = usePageMapping();

    return (
        <div className='container mx-auto max-w-7xl p-4'>
            <h1 className='mb-4 font-bold text-2xl text-blue-900'>Master Page Mapping</h1>

            <ModuleSelection />

            <div className='mt-6 flex flex-col gap-6'>
                <AvailableGrid />
                <SuperAdminGrid />
                <SavedGrid />
            </div>
        </div>
    );
}

export default function PageMappingPage() {
    return (
        <PageMappingProvider>
            <PageMappingContentInner />
        </PageMappingProvider>
    );
}
