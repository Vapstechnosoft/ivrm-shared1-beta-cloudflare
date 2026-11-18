'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClgMasterQuota } from '@/hooks/college/useCollegeMasters';
import MasterQuotaTab from './_components/MasterQuotaTab';
import QuotaCategoryTab from './_components/QuotaCategoryTab';
import QuotaCategoryMappingTab from './_components/QuotaCategoryMappingTab';

export default function ClgMasterQuotaPage() {
    const { data: response, isLoading, error } = useClgMasterQuota();

    return (
        <div className='p-6 space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Master Quota</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='masterQuota' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='masterQuota'>Master Quota</TabsTrigger>
                            <TabsTrigger value='quotaCategory'>Master Quota Category</TabsTrigger>
                            <TabsTrigger value='quotaMapping'>Quota Category Mapping</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value='masterQuota' className='mt-6'>
                            <MasterQuotaTab data={response} isLoading={isLoading} error={error} />
                        </TabsContent>
                        
                        <TabsContent value='quotaCategory' className='mt-6'>
                            <QuotaCategoryTab data={response} isLoading={isLoading} error={error} />
                        </TabsContent>
                        
                        <TabsContent value='quotaMapping' className='mt-6'>
                            <QuotaCategoryMappingTab data={response} isLoading={isLoading} error={error} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
