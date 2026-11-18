'use client';
// Force re-scan of imports

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { AddressTab } from './tabs/address-tab';
import { OthersTab } from './tabs/others-tab';
import { ParentsTab } from './tabs/parents-tab';
import { StudentDetailsTab } from './tabs/student-details-tab';

const formSchema = z.object({
    // Student Details
    AMCST_FirstName: z.string().min(1, 'First Name is required'),
    AMCST_LastName: z.string().optional(),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    AMCO_Id: z.string().min(1, 'Course is required'),
    AMB_Id: z.string().min(1, 'Branch is required'),
    AMSE_Id: z.string().min(1, 'Semester is required'),
    ACMB_Id: z.string().min(1, 'Batch is required'),
    AMCST_Date: z.date({ required_error: 'Admission Date is required' }),
    AMCST_DOB: z.date({ required_error: 'Date of Birth is required' }),
    AMCST_Sex: z.string().min(1, 'Gender is required'),
    IVRMMR_Id: z.string().min(1, 'Religion is required'),
    IMCC_Id: z.string().min(1, 'Caste Category is required'),
    IMC_Id: z.string().min(1, 'Caste is required'),
    AMCST_Nationality: z.string().min(1, 'Nationality is required'),
    AMCOC_Id: z.string().min(1, 'Student Category is required'),
    ACQ_Id: z.string().min(1, 'Quota is required'),
    ACQC_Id: z.string().min(1, 'Quota Category is required'),
    ACSS_Id: z.string().min(1, 'Subject Scheme is required'),
    ACST_Id: z.string().min(1, 'Scheme Type is required'),
    ACMS_Id: z.string().min(1, 'Section is required'),

    // Address
    AMCST_PerStreet: z.string().min(1, 'Permanent Address is required'),
    IVRMMC_Id: z.string().min(1, 'Country is required'),
    AMCST_PerState: z.string().min(1, 'State is required'),
    AMCST_PerCity: z.string().min(1, 'City is required'),
    AMCST_PerPincode: z.string().length(6, 'Pincode must be 6 digits'),

    AMCST_ConStreet: z.string().min(1, 'Communication Address is required'),
    AMCST_ConCountryId: z.string().min(1, 'Country is required'),
    AMCST_ConState: z.string().min(1, 'State is required'),
    AMCST_ConCity: z.string().min(1, 'City is required'),
    AMCST_ConPincode: z.string().length(6, 'Pincode must be 6 digits'),

    // Parents
    AMCST_FatherName: z.string().min(1, 'Father Name is required'),
    AMCST_FatherNationality: z.string().min(1, 'Nationality is required'),
    AMCST_MotherName: z.string().min(1, 'Mother Name is required'),
    AMCST_MotherNationality: z.string().min(1, 'Nationality is required')
});

export function AdmissionFormWrapper({ initialData }: { initialData: any }) {
    const [activeTab, setActiveTab] = useState('student-details');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            AMCST_FirstName: '',
            AMCST_Sex: '',
            mobilesstd: [{ acstsmS_CountryCode: '91', amcsT_MobileNo: '' }],
            emailsstd: [{ amcsT_emailId: '' }],
            mobiles: [{ acstpmN_CountryCode: '91', amcsT_FatherMobleNo: '' }],
            emails: [{ amcsT_FatheremailId: '' }],
            mobiles1: [{ acstpmN_CountryCode: '91', amcsT_MotherMobleNo: '' }],
            emails1: [{ amcsT_MotheremailId: '' }],
            prevSchoolDetails: [{}]
        } as any
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Final Submit:', values);
        toast.success('Form submitted successfully');
    };

    const nextTab = (tab: string) => setActiveTab(tab);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                    <TabsList className='mb-8 grid w-full grid-cols-4 lg:grid-cols-4'>
                        <TabsTrigger value='student-details'>Student Details</TabsTrigger>
                        <TabsTrigger value='address'>Address</TabsTrigger>
                        <TabsTrigger value='parents'>Parents</TabsTrigger>
                        <TabsTrigger value='others'>Others</TabsTrigger>
                    </TabsList>

                    <TabsContent value='student-details'>
                        <StudentDetailsTab initialData={initialData} onNext={() => nextTab('address')} />
                    </TabsContent>

                    <TabsContent value='address'>
                        <AddressTab initialData={initialData} onNext={() => nextTab('parents')} onBack={() => nextTab('student-details')} />
                    </TabsContent>

                    <TabsContent value='parents'>
                        <ParentsTab initialData={initialData} onNext={() => nextTab('others')} onBack={() => nextTab('address')} />
                    </TabsContent>

                    <TabsContent value='others'>
                        <OthersTab initialData={initialData} onBack={() => nextTab('parents')} />
                    </TabsContent>
                </Tabs>

                <div className='sticky bottom-0 z-10 flex justify-end gap-4 border-t bg-background/80 py-4 backdrop-blur'>
                    <Button type='button' variant='outline' onClick={() => form.reset()}>
                        Clear All
                    </Button>
                    <Button type='submit'>
                        <Save className='mr-2 h-4 w-4' />
                        Final Submit
                    </Button>
                </div>
            </form>
        </Form>
    );
}
