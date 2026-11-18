 'use client';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { use, useState } from 'react';
import GeneralSmsForm from './components/general_sms_form';
import ModeSelector from './components/mode_selector';
import type { SendMode } from '@/hooks/admission/sms/reports/useGeneralSms';
import GeneralEmailForm from './components/general_email_form';
import StudentForm from './components/student_form';
import StaffForm from './components/staff_form';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function GeneralSendSmsPage(props: { searchParams: SearchParams }) {
    // kept for parity with the other pages (menu id / filters can be read from here)
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
        const searchParams = use(props.searchParams);


    const [mode, setMode] = useState<SendMode>('general-sms');

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <Tabs defaultValue='general'>
                    <TabsList className='h-auto w-full justify-start rounded-none border-b bg-transparent p-0'>
                        <TabsTrigger
                            value='general'
                            className='rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'>
                            General SMS/EMAIL
                        </TabsTrigger>
                        <TabsTrigger value='ivrs' className='rounded-none'>
                            Interactive Voice Response System
                        </TabsTrigger>
                        <TabsTrigger value='notice-report' className='rounded-none'>
                            Notice Viewed Report
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='general' className='space-y-4 pt-4'>
                        <CollapsibleSection
                            title='Send SMS/Email'
                            defaultOpen={true}
                            variant='default'
                            size='md'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <ModeSelector value={mode} onChange={setMode} />
                        </CollapsibleSection>

                        <CollapsibleSection
                            title={mode === 'general-email' ? 'General Email' : 'General SMS'}
                            defaultOpen={true}
                            variant='default'
                            size='md'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            {mode === 'general-sms' && <GeneralSmsForm />}
                            {mode === 'general-email' && <GeneralEmailForm />}
                            {mode === 'student' && <StudentForm />}
                            {mode === 'staff' && <StaffForm />}
                        </CollapsibleSection>
                    </TabsContent>

                    <TabsContent value='ivrs' className='p-4 text-muted-foreground'>
                        Interactive Voice Response System content goes here.
                    </TabsContent>
                    <TabsContent value='notice-report' className='p-4 text-muted-foreground'>
                        Notice Viewed Report content goes here.
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
