'use client';

import { FormProvider } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMasterLibrary } from '@/hooks/library/useMasters';
import type { IMasterLibraryList } from '@/types/library/masters/masters';
import { use, useState } from 'react';
import LibraryCreationTab from './_components/library-creation-tab';
import { LibraryMapClassTab } from './_components/library-map-class-tab';
import { LibraryMapStaffTab } from './_components/library-map-staff-tab';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function MasterLibraryPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const { data: response, isLoading, error, refetch } = useMasterLibrary(searchParams);
    const [activeTab, setActiveTab] = useState('creation');
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');

    return (
        <div className='min-h-screen p-1'>
            <div className='container space-y-4'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className='mb-4 grid w-full grid-cols-1 md:grid-cols-3'>
                        <TabsTrigger value='creation'>Library Creation</TabsTrigger>
                        <TabsTrigger value='class'>Library Map With Class</TabsTrigger>
                        <TabsTrigger value='staff'>Library Map With Staff</TabsTrigger>
                    </TabsList>

                    <TabsContent value='creation'>
                        <FormProvider<IMasterLibraryList>>
                            <LibraryCreationTab
                                response={response}
                                isLoading={isLoading}
                                error={error}
                                refetch={refetch}
                                selectedLibraryId={selectedLibraryId}
                                setSelectedLibraryId={setSelectedLibraryId}
                                setActiveTab={setActiveTab}
                            />
                        </FormProvider>
                    </TabsContent>

                    <TabsContent value='class'>
                        <LibraryMapClassTab
                            selectedLibraryId={selectedLibraryId}
                            setSelectedLibraryId={setSelectedLibraryId}
                            onNextTab={() => setActiveTab('staff')}
                        />
                    </TabsContent>

                    <TabsContent value='staff'>
                        <LibraryMapStaffTab selectedLibraryId={selectedLibraryId} setSelectedLibraryId={setSelectedLibraryId} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
