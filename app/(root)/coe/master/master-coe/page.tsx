'use client';

import { FormProvider } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMasterCoe } from '@/hooks/coe/useMasterCoe';
import type { IEventsMapping, IMasterEvent } from '@/types/alumni/master-coe';
import { Calendar, Layers } from 'lucide-react';
import { parseAsInteger, useQueryState } from 'nuqs';
import { use, useEffect, useState } from 'react';
import EventsMappingContent from './_components/events-mapping/events-mapping-content';
import MasterEventsContent from './_components/master-events/master-events-content';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface MasterCOEPageProps {
    searchParams?: SearchParams;
}

export default function MasterCOEPage(props: MasterCOEPageProps) {
    const searchParams = props.searchParams ? use(props.searchParams) : {};
    const [activeTab, setActiveTab] = useState<string>('events');
    const [, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(1));
    const { data: response, isLoading, error, refetchAll } = useMasterCoe(searchParams as any);

    // Remove tab query param from URL if present so the URL remains clean without tab=map
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('tab')) {
                const initialTab = url.searchParams.get('tab');
                if (initialTab) {
                    setActiveTab(initialTab);
                }
                url.searchParams.delete('tab');
                window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
            }
        }
    }, []);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (url.searchParams.has('tab')) {
                url.searchParams.delete('tab');
                window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
            }
        }
    };

    return (
        <div className='container space-y-6 p-6'>
            <div className='flex items-center justify-between border-b pb-4'>
                <div>
                    <h1 className='font-bold text-3xl tracking-tight'>Master COE</h1>
                    <p className='text-muted-foreground'>Manage events and their mappings to academic years.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
                <TabsList className='grid w-full grid-cols-2 lg:w-[400px]'>
                    <TabsTrigger value='events' className='flex items-center gap-2'>
                        <Calendar className='h-4 w-4' /> Events
                    </TabsTrigger>
                    <TabsTrigger value='map' className='flex items-center gap-2'>
                        <Layers className='h-4 w-4' /> Events Map
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='events' className='mt-6 space-y-4'>
                    <FormProvider<IMasterEvent>>
                        <MasterEventsContent
                            initialData={response}
                            refreshData={refetchAll}
                            isLoading={isLoading}
                            error={error}
                            searchParams={searchParams}
                        />
                    </FormProvider>
                </TabsContent>

                <TabsContent value='map' className='mt-6 space-y-4'>
                    <FormProvider<IEventsMapping>>
                        <EventsMappingContent
                            initialData={response}
                            refreshData={refetchAll}
                            isLoading={isLoading}
                            error={error}
                            searchParams={searchParams}
                        />
                    </FormProvider>
                </TabsContent>
            </Tabs>
        </div>
    );
}
