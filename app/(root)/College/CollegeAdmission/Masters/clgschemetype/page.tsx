'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClgSchemeTypes, useClgSchemeNames, useClgCombinations } from '@/hooks/college/useCollegeMasters';
import SchemeTypeTab from './_components/SchemeTypeTab';
import SchemeNameTab from './_components/SchemeNameTab';
import CombinationTab from './_components/CombinationTab';

export default function ClgSchemeTypePage() {
    // We fetch all three datasets since they are somewhat independent tabs according to legacy code
    const { data: typesData, isLoading: typesLoading, error: typesError } = useClgSchemeTypes();
    const { data: namesData, isLoading: namesLoading, error: namesError } = useClgSchemeNames();
    const { data: combinationsData, isLoading: combinationsLoading, error: combinationsError } = useClgCombinations();

    return (
        <div className='p-6 space-y-6'>
            <Card>
                <CardHeader className='flex flex-row items-center justify-between'>
                    <CardTitle>Master Subject Scheme Type</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue='schemeType' className='w-full'>
                        <TabsList className='grid w-full grid-cols-3'>
                            <TabsTrigger value='schemeType'>Master Subject Scheme Type</TabsTrigger>
                            <TabsTrigger value='schemeName'>Master Subject Scheme Name</TabsTrigger>
                            <TabsTrigger value='combination'>Master Combination</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value='schemeType' className='mt-6'>
                            <SchemeTypeTab data={typesData} isLoading={typesLoading} error={typesError} />
                        </TabsContent>
                        
                        <TabsContent value='schemeName' className='mt-6'>
                            <SchemeNameTab data={namesData} isLoading={namesLoading} error={namesError} />
                        </TabsContent>
                        
                        <TabsContent value='combination' className='mt-6'>
                            <CombinationTab data={combinationsData} isLoading={combinationsLoading} error={combinationsError} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
