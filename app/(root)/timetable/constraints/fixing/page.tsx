import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DayPeriodTab from './_components/dayperiod/dayperiodTab';
import DayStaffTab from './_components/daystaff/daystaffTab';
import DaySubjectTab from './_components/daysubject/daysubjectTab';
import PeriodStaffTab from './_components/periodstaff/periodstaffTab';
import PeriodSubjectTab from './_components/periodsubject/periodsubjectTab';

export const dynamic = 'force-dynamic';

import { getdetailsAllFixing } from '@/server/timetable/constraints/fixing';
import { use } from 'react';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function FixingConstraintsPage(props: { searchParams: SearchParams }) {
    const searchParams = use(props.searchParams);
    const loadData = use(getdetailsAllFixing());

    return (
        <div className='container mx-auto space-y-6 p-4'>
            <Tabs defaultValue='day_period' className='space-y-4'>
                <TabsList className='grid h-auto w-full grid-cols-5 rounded-lg bg-muted p-1'>
                    <TabsTrigger value='day_period'>Day Period</TabsTrigger>
                    <TabsTrigger value='day_staff'>Day Staff</TabsTrigger>
                    <TabsTrigger value='day_subject'>Day Subject</TabsTrigger>
                    <TabsTrigger value='period_staff'>Period Staff</TabsTrigger>
                    <TabsTrigger value='period_subject'>Period Subject</TabsTrigger>
                </TabsList>

                <TabsContent value='day_period'>
                    <DayPeriodTab initialData={loadData} searchParams={searchParams} />
                </TabsContent>

                <TabsContent value='day_staff'>
                    <DayStaffTab initialData={loadData} searchParams={searchParams} />
                </TabsContent>

                <TabsContent value='day_subject'>
                    <DaySubjectTab initialData={loadData} searchParams={searchParams} />
                </TabsContent>

                <TabsContent value='period_staff'>
                    <PeriodStaffTab initialData={loadData} searchParams={searchParams} />
                </TabsContent>

                <TabsContent value='period_subject'>
                    <PeriodSubjectTab initialData={loadData} searchParams={searchParams} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
