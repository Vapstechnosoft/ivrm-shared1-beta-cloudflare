'use client';
// Force re-scan of imports

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { StudentDetailsTab } from './tabs/student-details-tab';
import { AddressTab } from './tabs/address-tab';
import { ParentsTab } from './tabs/parents-tab';
import { OthersTab } from './tabs/others-tab';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { DocumentUploadTab } from './tabs/document-upload-tab';

const formSchema = z.object({
    // Student Details (Left Column)
    AMCST_AdmNo: z.string().min(1, 'Admission No is required'),
    AMCST_RegistrationNo: z.string().optional(),
    AMCST_FirstName: z.string().min(1, 'First Name is required'),
    AMCST_MiddleName: z.string().optional(),
    AMCST_LastName: z.string().optional(),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    AMCO_Id: z.string().min(1, 'Course is required'),
    AMB_Id: z.string().min(1, 'Branch is required'),
    AMSE_Id: z.string().min(1, 'Semester is required'),
    ACMB_Id: z.string().min(1, 'Batch is required'),
    AMCST_Date: z.date({ required_error: 'Admission Date is required' }),
    AMCST_DOB: z.date({ required_error: 'Date of Birth is required' }),
    AMCST_DOBinwords: z.string().optional(),
    IMCC_Id: z.string().min(1, 'Caste Category is required'),
    IMC_Id: z.string().min(1, 'Caste is required'),
    AMCST_SubCaste: z.string().optional(),
    AMCST_BankAccountNo: z.string().optional(),
    AMCST_BirthPlace: z.string().optional(),
    AMCST_BirthCertNo: z.string().optional(),
    AMCST_CasteCertNo: z.string().optional(),
    AMCST_BiometricId: z.string().optional(),
    AMCST_RFCardNo: z.string().optional(),
    AMCST_District: z.string().optional(),
    ACMS_Id: z.string().optional(),

    // Student Details (Right Column)
    AMCST_Age: z.string().min(1, 'Age is required'),
    AMCST_Sex: z.string().min(1, 'Gender is required'),
    AMCST_MotherTongue: z.string().optional(),
    IVRMMR_Id: z.string().min(1, 'Religion is required'),
    AMCST_Nationality: z.string().min(1, 'Nationality is required'),
    AMCST_AadharNo: z.string().optional(),
    AMCST_BloodGroup: z.string().optional(),
    AMCOC_Id: z.string().min(1, 'Student Category is required'),
    ACQ_Id: z.string().min(1, 'Quota is required'),
    ACQC_Id: z.string().min(1, 'Quota Category is required'),
    ACSS_Id: z.string().min(1, 'Subject Scheme is required'),
    ACST_Id: z.string().min(1, 'Scheme Type is required'),
    
    // BPL/EMIS
    has_bpl_card: z.boolean().default(false),
    AMCST_BPLCardNo: z.string().optional(),
    
    AMCST_IFSCCode: z.string().optional(),
    AMCST_TPIN: z.string().optional(),
    AMCST_Village: z.string().optional(),
    AMCST_Taluk: z.string().optional(),
    AMCST_UrbanRural: z.string().optional(),
    is_divyangjan: z.boolean().default(false),

    // Student Dynamic Arrays
    mobilesstd: z.array(z.object({
        acstsmS_CountryCode: z.string(),
        amcsT_MobileNo: z.string().min(10, 'Mobile is required')
    })).optional(),
    emailsstd: z.array(z.object({
        amcsT_emailId: z.string().email('Invalid email')
    })).optional(),

    // Student Photo
    AMCST_StudentPhoto: z.any().optional(),

    // Address - Permanent
    AMCST_PerStreet: z.string().min(1, 'Permanent Address is required'),
    AMCST_PerArea: z.string().optional(),
    IVRMMC_Id: z.string().min(1, 'Country is required'),
    AMCST_PerState: z.string().min(1, 'State is required'),
    AMCST_PerCity: z.string().min(1, 'City is required'),
    AMCST_PerPincode: z.string().length(6, 'Pincode must be 6 digits'),

    // Address - Communication
    same_as_permanent: z.boolean().default(false),
    AMCST_ConStreet: z.string().min(1, 'Communication Address is required'),
    AMCST_ConArea: z.string().optional(),
    AMCST_ConCountryId: z.string().min(1, 'Country is required'),
    AMCST_ConState: z.string().min(1, 'State is required'),
    AMCST_ConCity: z.string().min(1, 'City is required'),
    AMCST_ConPincode: z.string().length(6, 'Pincode must be 6 digits'),

    // Parents - Father
    AMCST_FatherAliveFlag: z.boolean().default(true),
    AMCST_FatherName: z.string().min(1, 'Father Name is required'),
    AMCST_FatherSurname: z.string().optional(),
    AMCST_FatherAadharNo: z.string().optional(),
    AMCST_FatherEducation: z.string().optional(),
    AMCST_FatherOfficeAdd: z.string().optional(),
    AMCST_FatherOccupation: z.string().optional(),
    AMCST_FatherDesignation: z.string().optional(),
    AMCST_FatherBankAccNo: z.string().optional(),
    AMCST_FatherIFSCCode: z.string().optional(),
    AMCST_FatherCasteCertNo: z.string().optional(),
    AMCST_FatherNationality: z.string().min(1, 'Nationality is required'),
    AMCST_FatherReligion: z.string().optional(),
    AMCST_FatherCaste: z.string().optional(),
    AMCST_FatherSubCaste: z.string().optional(),
    AMCST_FatherMIncome: z.string().optional(),
    AMCST_FatherIncome: z.string().optional(),
    AMCST_FatherPAN: z.string().optional(), // kept for compatibility
    mobiles: z.array(z.object({
        acstpmN_CountryCode: z.string(),
        amcsT_FatherMobleNo: z.string().min(10, 'Mobile is required')
    })).optional(),
    emails: z.array(z.object({
        amcsT_FatheremailId: z.string().email('Invalid email').optional().or(z.literal(''))
    })).optional(),

    // Parents - Mother
    AMCST_MotherAliveFlag: z.boolean().default(true),
    AMCST_MotherName: z.string().min(1, 'Mother Name is required'),
    AMCST_MotherSurname: z.string().optional(),
    AMCST_MotherAadharNo: z.string().optional(),
    AMCST_MotherEducation: z.string().optional(),
    AMCST_MotherOfficeAdd: z.string().optional(),
    AMCST_MotherOccupation: z.string().optional(),
    AMCST_MotherDesignation: z.string().optional(),
    AMCST_MotherBankAccNo: z.string().optional(),
    AMCST_MotherIFSCCode: z.string().optional(),
    AMCST_MotherCasteCertNo: z.string().optional(),
    AMCST_MotherNationality: z.string().min(1, 'Nationality is required'),
    AMCST_MotherReligion: z.string().optional(),
    AMCST_MotherCaste: z.string().optional(),
    AMCST_MotherSubCaste: z.string().optional(),
    AMCST_MotherMIncome: z.string().optional(),
    AMCST_MotherIncome: z.string().optional(),
    AMCST_MotherPAN: z.string().optional(), // kept for compatibility
    mobiles1: z.array(z.object({
        acstpmN_CountryCode: z.string(),
        amcsT_MotherMobleNo: z.string().min(10, 'Mobile is required')
    })).optional(),
    emails1: z.array(z.object({
        amcsT_MotheremailId: z.string().email('Invalid email').optional().or(z.literal(''))
    })).optional(),

    // Others - Guardian
    AMCST_GuardianName: z.string().optional(),
    AMCST_GuardianAddress: z.string().optional(),
    AMCST_GuardianPhoneNo: z.string().optional(),
    AMCST_GuardianEmailId: z.string().optional(),
    AMCST_GuardianCountryCode: z.string().default('91'),

    // Previous School Details
    prevSchoolDetails: z.array(z.object({
        amcsP_CollegeName: z.string().optional(),
        amcsP_RegNo: z.string().optional(),
        amcsP_CollegeType: z.string().optional(),
        amcsP_CourseName: z.string().optional(),
        amcsP_BranchName: z.string().optional(),
        amcsP_PassingYear: z.string().optional(),
        amcsP_TotalMarks: z.string().optional(),
        amcsP_ObtainedMarks: z.string().optional(),
        amcsP_Percentage: z.string().optional(),
        amcsP_Grade: z.string().optional(),
        amcsP_PreviousTCNo: z.string().optional(),
        amcsP_PreviousTCDate: z.any().optional(),
        amcsP_Board: z.string().optional(),
        amcsP_CountryId: z.string().optional(),
        amcsP_StateId: z.string().optional(),
        amcsP_Address: z.string().optional(),
        amcsP_LeftReason: z.string().optional(),
        amcsP_Medium: z.string().optional(),
        amcsP_ExamPassed: z.string().optional(),
        amcsP_MonthYearPassing: z.string().optional(),
        amcsP_LanguageTaken: z.string().optional()
    })).optional(),

    // Competitive Exams
    competitiveExams: z.array(z.object({
        exam: z.string().optional(),
        rollNo: z.string().optional(),
        meritNo: z.string().optional(),
        registrationId: z.string().optional(),
        totalMaxMarks: z.string().optional(),
        obtainedMarks: z.string().optional(),
        allIndiaRank: z.string().optional(),
        categoryRank: z.string().optional(),
        percentile: z.string().optional()
    })).optional(),

    // Competitive Subjects
    competitiveSubjects: z.array(z.object({
        examName: z.string().optional(),
        subjectName: z.string().optional(),
        maxMarks: z.string().optional(),
        marksObtained: z.string().optional()
    })).optional(),

    // Siblings
    siblingsDetails: z.array(z.object({
        name: z.string().optional(),
        course: z.string().optional(),
        relation: z.string().optional()
    })).optional(),

    // Passport Details
    AMCST_PassportNo: z.string().optional(),
    AMCST_PassportIssuedAt: z.string().optional(),
    AMCST_PassportIssueDate: z.any().optional(),
    AMCST_PassportIssuedCountry: z.string().optional(),
    AMCST_PassportIssuedPlace: z.string().optional(),
    AMCST_PassportExpiryDate: z.any().optional(),

    // Visa Details
    AMCST_VisaIssuedBy: z.string().optional(),
    AMCST_VisaValidFrom: z.any().optional(),
    AMCST_VisaValidTo: z.any().optional(),

    // References
    referenceDetails: z.array(z.string()).optional(),
    sourceDetails: z.array(z.string()).optional(),

    // Required Details (Document Upload Tab)
    is_hostel_req: z.boolean().default(false),
    is_transport_req: z.boolean().default(false),
    is_gym_req: z.boolean().default(false),
});

export default function AddStudentAdmissionForm({
    initialData,
    onSuccess,
    onClose
}: {
    initialData?: any;
    onSuccess?: () => void;
    onClose?: () => void;
}) {
    const [activeTab, setActiveTab] = useState('student-details');

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            AMCST_AdmNo: '',
            AMCST_RegistrationNo: '',
            AMCST_FirstName: '',
            AMCST_MiddleName: '',
            AMCST_LastName: '',
            ASMAY_Id: '',
            AMCO_Id: '',
            AMB_Id: '',
            AMSE_Id: '',
            ACMB_Id: '',
            AMCST_DOBinwords: '',
            IMCC_Id: '',
            IMC_Id: '',
            AMCST_SubCaste: '',
            AMCST_BankAccountNo: '',
            AMCST_BirthPlace: '',
            AMCST_BirthCertNo: '',
            AMCST_CasteCertNo: '',
            AMCST_BiometricId: '',
            AMCST_RFCardNo: '',
            AMCST_District: '',
            ACMS_Id: '',
            AMCST_Age: '',
            AMCST_Sex: '',
            AMCST_MotherTongue: '',
            IVRMMR_Id: '',
            AMCST_Nationality: '',
            AMCST_AadharNo: '',
            AMCST_BloodGroup: '',
            AMCOC_Id: '',
            ACQ_Id: '',
            ACQC_Id: '',
            ACSS_Id: '',
            ACST_Id: '',
            has_bpl_card: false,
            AMCST_BPLCardNo: '',
            AMCST_IFSCCode: '',
            AMCST_TPIN: '',
            AMCST_Village: '',
            AMCST_Taluk: '',
            AMCST_UrbanRural: '',
            is_divyangjan: false,

            // Parents - Father
            AMCST_FatherAliveFlag: true,
            AMCST_FatherName: '',
            AMCST_FatherSurname: '',
            AMCST_FatherAadharNo: '',
            AMCST_FatherEducation: '',
            AMCST_FatherOfficeAdd: '',
            AMCST_FatherOccupation: '',
            AMCST_FatherDesignation: '',
            AMCST_FatherBankAccNo: '',
            AMCST_FatherIFSCCode: '',
            AMCST_FatherCasteCertNo: '',
            AMCST_FatherNationality: '',
            AMCST_FatherReligion: '',
            AMCST_FatherCaste: '',
            AMCST_FatherSubCaste: '',
            AMCST_FatherMIncome: '',
            AMCST_FatherIncome: '',
            AMCST_FatherPAN: '',

            // Parents - Mother
            AMCST_MotherAliveFlag: true,
            AMCST_MotherName: '',
            AMCST_MotherSurname: '',
            AMCST_MotherAadharNo: '',
            AMCST_MotherEducation: '',
            AMCST_MotherOfficeAdd: '',
            AMCST_MotherOccupation: '',
            AMCST_MotherDesignation: '',
            AMCST_MotherBankAccNo: '',
            AMCST_MotherIFSCCode: '',
            AMCST_MotherCasteCertNo: '',
            AMCST_MotherNationality: '',
            AMCST_MotherReligion: '',
            AMCST_MotherCaste: '',
            AMCST_MotherSubCaste: '',
            AMCST_MotherMIncome: '',
            AMCST_MotherIncome: '',
            AMCST_MotherPAN: '',

            // Others - Guardian
            AMCST_GuardianName: '',
            AMCST_GuardianAddress: '',
            AMCST_GuardianPhoneNo: '',
            AMCST_GuardianEmailId: '',
            AMCST_GuardianCountryCode: '91',

            // Others - Passport Details
            AMCST_PassportNo: '',
            AMCST_PassportIssuedAt: '',
            AMCST_PassportIssuedCountry: '',
            AMCST_PassportIssuedPlace: '',

            // Others - Visa Details
            AMCST_VisaIssuedBy: '',

            // References
            referenceDetails: [],
            sourceDetails: [],

            // Required Details
            is_hostel_req: false,
            is_transport_req: false,
            is_gym_req: false,

            mobilesstd: [{ acstsmS_CountryCode: '91', amcsT_MobileNo: '' }],
            emailsstd: [{ amcsT_emailId: '' }],
            mobiles: [{ acstpmN_CountryCode: '91', amcsT_FatherMobleNo: '' }],
            emails: [{ amcsT_FatheremailId: '' }],
            mobiles1: [{ acstpmN_CountryCode: '91', amcsT_MotherMobleNo: '' }],
            emails1: [{ amcsT_MotheremailId: '' }],
            prevSchoolDetails: [{}],
            competitiveExams: [{}],
            competitiveSubjects: [{}],
            siblingsDetails: [{}],
        } as any,
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('Final Submit:', values);
        toast.success('Form submitted successfully');
        onSuccess?.();
    };

    const nextTab = (tab: string) => setActiveTab(tab);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5 mb-8">
                        <TabsTrigger value="student-details">Student Details</TabsTrigger>
                        <TabsTrigger value="address">Address</TabsTrigger>
                        <TabsTrigger value="parents">Parents</TabsTrigger>
                        <TabsTrigger value="others">Others</TabsTrigger>
                        <TabsTrigger value="document-upload">Document Upload</TabsTrigger>
                    </TabsList>

                    <TabsContent value="student-details">
                        <StudentDetailsTab initialData={initialData} onNext={() => nextTab('address')} />
                    </TabsContent>

                    <TabsContent value="address">
                        <AddressTab initialData={initialData} onNext={() => nextTab('parents')} onBack={() => nextTab('student-details')} />
                    </TabsContent>

                    <TabsContent value="parents">
                        <ParentsTab initialData={initialData} onNext={() => nextTab('others')} onBack={() => nextTab('address')} />
                    </TabsContent>

                    <TabsContent value="others">
                        <OthersTab initialData={initialData} onNext={() => nextTab('document-upload')} onBack={() => nextTab('parents')} />
                    </TabsContent>

                    <TabsContent value="document-upload">
                        <DocumentUploadTab initialData={initialData} onBack={() => nextTab('others')} />
                    </TabsContent>
                </Tabs>

            </form>
        </Form>
    );
}
