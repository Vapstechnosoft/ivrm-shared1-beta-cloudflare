'use client';

import { FormProvider } from '@/components/ui/form/form-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { IMasterTransactionNumberingList } from '@/types/admission/preadmission/configaration';
import TransactionNumberingContent from './_components/transaction-numbering-content';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const NUMBERING_TYPES = [
    'Enquiry',
    'Registration',
    'Prospectus',
    'PreRegistration',
    'Admission',
    'AdmissionReg',
    'Receipt',
    'Voucher',
    'Transaction',
    'Application',
    'TC',
    'OnlineBooking',
    'Trip',
    'TripBill',
    'Loan',
    'Leave',
    'RollNumber'
];

export default function TransactionNumberingPage() {
    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <Tabs defaultValue={NUMBERING_TYPES[0]} className='w-full'>
                    <ScrollArea className='w-full whitespace-nowrap rounded-lg border bg-muted/30 p-1'>
                        <div className='flex w-max space-x-2'>
                            <TabsList className='flex h-auto w-full gap-2 bg-transparent p-0'>
                                {NUMBERING_TYPES.map((type) => (
                                    <TabsTrigger
                                        key={type}
                                        value={type}
                                        className='rounded-md px-6 py-2.5 transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm'>
                                        {type}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <ScrollBar orientation='horizontal' className='hidden sm:flex' />
                    </ScrollArea>

                    <div className='mt-4'>
                        {NUMBERING_TYPES.map((type) => (
                            <TabsContent key={type} value={type} className='m-0'>
                                <FormProvider<IMasterTransactionNumberingList>>
                                    <TransactionNumberingContent numberingType={type} />
                                </FormProvider>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
