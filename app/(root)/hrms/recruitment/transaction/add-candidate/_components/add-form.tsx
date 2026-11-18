'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useGetCandidateDetails, useSaveOrUpdateCandidate } from '@/hooks/hrms/recruitment/transactions/useTransactions';
import { validatePANNumber } from '@/schemas/hrms/employee-register-schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Upload, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Candidate, DocumentDetail, ExperienceDetail, FamilyDetail, LanguageDetail, QualificationDetail } from './columns';

const candidateSchema = z.object({
    firstName: z.string().min(1, 'First Name is required'),
    middleName: z.string().optional(),
    lastName: z.string().min(1, 'Last Name is required'),
    skill: z.string().min(1, 'Skill is required'),
    mobileNo: z
        .string()
        .min(10, 'Mobile No must be 10 digits')
        .max(10, 'Mobile No must be 10 digits')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    emailId: z
        .string()
        .min(1, 'Email Id is required')
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address (e.g. name@example.com)'),
    qualification: z.string().min(1, 'Qualification is required'),
    jobPortalName: z.string().optional(),
    currentCompany: z.string().min(1, 'Current Company is required'),
    totalExp: z
        .string()
        .min(1, 'Total Experience is required')
        .regex(/^[0-9.]+$/, 'Only numbers and decimals are allowed'),
    lastCTC: z
        .string()
        .min(1, 'Last CTC is required')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    expectedCTC: z
        .string()
        .min(1, 'Expected CTC is required')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    applicationDate: z.string().min(1, 'Application Date is required'),
    interviewDate: z.string().min(1, 'Interview Date is required'),
    dateOfBirth: z.string().min(1, 'Date of Birth is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    religion: z.string().min(1, 'Religion is required'),
    caste: z.string().min(1, 'Caste is required'),
    gender: z.string().min(1, 'Gender is required'),
    maritalStatus: z.string().min(1, 'Marital Status is required'),
    bloodGroup: z.string().min(1, 'Blood Group is required'),
    jobTitle: z.string().min(1, 'Job Title is required'),
    positionType: z.string().min(1, 'Position Type is required'),
    aadharNo: z
        .string()
        .min(12, 'Aadhar No must be 12 digits')
        .max(12, 'Aadhar No must be 12 digits')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    panCardNo: z
        .string()
        .min(1, 'PAN Card No. Required')
        .max(10, 'PAN Card No. must not exceed 10 characters')
        .refine((val) => validatePANNumber(val), 'PAN Card No. must be in valid format (e.g., ABCDE1234F)'),
    refCode: z.string().optional(),
    source: z.string().optional(),
    remark: z.string().optional(),
    resumeCV: z.string().optional(),
    photo: z.string().optional(),
    localAddressLine1: z.string().min(1, 'Local Address Line 1 is required'),
    localAddressLine2: z.string().optional(),
    localPlace: z.string().min(1, 'Local Place is required'),
    localPincode: z
        .string()
        .min(6, 'Pincode must be 6 digits')
        .max(6, 'Pincode must be 6 digits')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    permanentAddressLine1: z.string().min(1, 'Permanent Address Line 1 is required'),
    permanentAddressLine2: z.string().optional(),
    permanentPlace: z.string().min(1, 'Permanent Place is required'),
    permanentPincode: z
        .string()
        .min(6, 'Pincode must be 6 digits')
        .max(6, 'Pincode must be 6 digits')
        .regex(/^[0-9]+$/, 'Only numbers are allowed'),
    sameAsLocalAddress: z.boolean().optional()
});
type FormFields = z.infer<typeof candidateSchema>;
import { usePositionTypeDropdown } from '@/hooks/hrms/recruitment/masterDropDown/useMasterDropDown';
import { useGetMasterJobGrid } from '@/hooks/hrms/recruitment/masters/useMasters';
import {
    useBloodGroupDropdown,
    useCasteCategoryDropdown,
    useCountryDropdown,
    useGenderDropdown,
    useMaritalStatusDropdown,
    useReligionDropdown
} from '@/hooks/hrms/useEmployeeRegister';
import { useMasterCourse } from '@/hooks/hrms/useMasters';
import { RefreshCw } from 'lucide-react';

interface AddCandidateFormProps {
    rowData?: Candidate | null;
    onSuccess?: () => void;
    onCancel?: () => void;
    className?: string;
}

export default function AddCandidateForm({ rowData, onSuccess, onCancel, className = '' }: AddCandidateFormProps) {
    const [currentTab, setCurrentTab] = useState('candidate');
    const [qualifications, setQualifications] = useState<QualificationDetail[]>([]);
    const [experiences, setExperiences] = useState<ExperienceDetail[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyDetail[]>([]);
    const [languages, setLanguages] = useState<LanguageDetail[]>([]);
    const [documents, setDocuments] = useState<DocumentDetail[]>([]);
    const [hasExperience, setHasExperience] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(candidateSchema),
        mode: 'onChange',
        defaultValues: {
            sameAsLocalAddress: false
        }
    });

    const { mutate: saveCandidate, isPending: isMutationPending } = useSaveOrUpdateCandidate();
    const { data: detailsResponse, isLoading: isLoadingDetails } = useGetCandidateDetails(rowData?.hrcD_Id || 0);
    const candidateDetails = detailsResponse?.data;

    useEffect(() => {
        setHasResetForm(false);
    }, [rowData?.hrcD_Id]);

    // --- Dropdown Hooks ---
    const { data: nationalities, isLoading: isLoadingNationalities } = useCountryDropdown();
    const { data: religions, isLoading: isLoadingReligions } = useReligionDropdown();
    const selectedReligion = watch('religion');
    console.log('selectedReligion', selectedReligion);
    const { data: castes, isLoading: isLoadingCastes } = useCasteCategoryDropdown(selectedReligion);

    console.log('castes', castes);
    const { data: genders, isLoading: isLoadingGenders } = useGenderDropdown();
    const { data: maritalStatuses, isLoading: isLoadingMaritalStatuses } = useMaritalStatusDropdown();
    const { data: bloodGroups, isLoading: isLoadingBloodGroups } = useBloodGroupDropdown();

    const { data: jobGrid, isLoading: isLoadingJobs } = useGetMasterJobGrid();
    const { data: positionTypes, isLoading: isLoadingPositionTypes } = usePositionTypeDropdown();
    const { data: courses, isLoading: isLoadingCourses } = useMasterCourse();

    const [hasResetForm, setHasResetForm] = useState(false);

    const religionValueInDetails =
        candidateDetails?.hrcD_Religion ??
        candidateDetails?.hrcD_ReligionId ??
        candidateDetails?.HRCD_Religion ??
        candidateDetails?.hrcd_religion;

    const isInitialDataLoading = rowData
        ? isLoadingDetails ||
          !hasResetForm ||
          isLoadingNationalities ||
          isLoadingReligions ||
          (!!religionValueInDetails && (isLoadingCastes || !selectedReligion)) ||
          isLoadingGenders ||
          isLoadingMaritalStatuses ||
          isLoadingBloodGroups ||
          isLoadingJobs ||
          isLoadingPositionTypes ||
          isLoadingCourses
        : false;

    // Format data for Select components - using key/value pattern from API with robust data extraction
    const extractData = (res: any) => {
        if (!res) return [];
        const data = res.data || res;
        if (Array.isArray(data)) return data;
        if (data?.$values && Array.isArray(data.$values)) return data.$values;
        return [];
    };

    const nationalityOptions = extractData(nationalities).map((n: any, index: number) => ({
        label: n.value || n.ivrmmC_CountryName,
        value: (n.key || n.ivrmmC_Id).toString()
    }));

    const religionOptions = extractData(religions).map((r: any, index: number) => ({
        label: r.value || r.ivrmmR_Name,
        value: (r.key || r.ivrmmR_Id).toString()
    }));

    const casteOptions = extractData(castes).map((c: any, index: number) => ({
        label: c.value || c.imcC_CategoryName,
        value: (c.key || c.imcC_Id).toString()
    }));

    console.log('casteID', casteOptions);

    const genderOptions = extractData(genders).map((g: any, index: number) => ({
        label: g.value || g.ivrmmG_GenderName,
        value: (g.key || g.ivrmmG_Id).toString()
    }));

    const maritalStatusOptions = extractData(maritalStatuses).map((m: any, index: number) => ({
        label: m.value || m.ivrmmS_MaritalStatus,
        value: (m.key || m.ivrmmS_Id).toString()
    }));

    const bloodGroupOptions = extractData(bloodGroups).map((b: any, index: number) => ({
        label: b.value || b.ivrmmB_BloodGroupName,
        value: (b.value || b.ivrmmB_BloodGroupName).toString()
    }));

    const jobOptions = extractData(jobGrid).map((j: any, index: number) => ({
        label: j.value || j.hrmJ_JobTiTle,
        value: (j.key || j.hrmJ_Id).toString()
    }));

    console.log('positionTypes', positionTypes);

    const positionTypeOptions = extractData(positionTypes).map((pt: any, index: number) => ({
        label: pt.value || pt.hrmpT_Name,
        value: (pt.key || pt.hrmpT_Id).toString()
    }));

    const qualificationOptions = extractData(courses).map((c: any, index: number) => ({
        label: c.value || c.hrmC_QulaificationName,
        value: (c.key || c.hrmC_Id).toString()
    }));

    const sameAsLocalAddress = watch('sameAsLocalAddress');
    const localAddressLine1 = watch('localAddressLine1');
    const localAddressLine2 = watch('localAddressLine2');
    const localPlace = watch('localPlace');
    const localPincode = watch('localPincode');

    useEffect(() => {
        if (sameAsLocalAddress) {
            setValue('permanentAddressLine1', localAddressLine1 || '');
            setValue('permanentAddressLine2', localAddressLine2 || '');
            setValue('permanentPlace', localPlace || '');
            setValue('permanentPincode', localPincode || '');
        }
    }, [sameAsLocalAddress, localAddressLine1, localAddressLine2, localPlace, localPincode, setValue]);

    const tabs = [{ id: 'candidate', name: 'Candidate', icon: User }];

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [resumeName, setResumeName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof FormFields) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (optional but recommended)
            const maxSize = fieldName === 'photo' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                // For base64, we often need to strip the prefix for some APIs,
                // but usually the full data URL is fine.
                // Let's keep the full data URL for now as it's common in this project.
                setValue(fieldName, base64 as any);
                if (fieldName === 'photo') setPhotoPreview(base64);
                if (fieldName === 'resumeCV') setResumeName(file.name);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        console.log('candidateDetails', candidateDetails);
        if (candidateDetails) {
            reset({
                firstName: candidateDetails.hrcD_FirstName || '',
                middleName: candidateDetails.hrcD_MiddleName || '',
                lastName: candidateDetails.hrcD_LastName || '',
                skill: candidateDetails.hrcD_Skills || '',
                mobileNo: candidateDetails.hrcD_MobileNo?.toString() || '',
                emailId: candidateDetails.hrcD_EmailId || '',
                qualification: candidateDetails.hrmC_Id?.toString() || '',
                jobPortalName: candidateDetails.hrcD_JobPortalName || '',
                currentCompany: candidateDetails.hrcD_CurrentCompany || '',
                totalExp: candidateDetails.hrcD_ExpFrom?.toString() || '',
                lastCTC: candidateDetails.hrcD_LastCTC?.toString() || '',
                expectedCTC: candidateDetails.hrcD_ExpectedCTC?.toString() || '',
                applicationDate: candidateDetails.hrcD_AppDate ? candidateDetails.hrcD_AppDate.split('T')[0] : '',
                interviewDate: candidateDetails.hrcD_InterviewDate ? candidateDetails.hrcD_InterviewDate.split('T')[0] : '',
                dateOfBirth: candidateDetails.hrcD_DOB ? candidateDetails.hrcD_DOB.split('T')[0] : '',
                nationality:
                    (
                        candidateDetails.hrcD_NationalityId ??
                        candidateDetails.HRCD_NationalityId ??
                        candidateDetails.hrcd_nationalityid
                    )?.toString() || '',
                religion:
                    (
                        candidateDetails.hrcD_Religion ??
                        candidateDetails.hrcD_ReligionId ??
                        candidateDetails.HRCD_Religion ??
                        candidateDetails.hrcd_religion
                    )?.toString() || '',
                caste: (candidateDetails.hrcD_CasteId ?? candidateDetails.HRCD_CasteId ?? candidateDetails.hrcd_casteid)?.toString() || '',
                gender: (candidateDetails.ivrmmG_Id ?? candidateDetails.IVRMMG_Id ?? candidateDetails.ivrmmg_id)?.toString() || '',
                maritalStatus:
                    (
                        candidateDetails.hrcD_MaritalStatus ??
                        candidateDetails.hrcD_MaritalStatusId ??
                        candidateDetails.HRCD_MaritalStatus ??
                        candidateDetails.hrcd_maritalstatus
                    )?.toString() || '',
                bloodGroup: candidateDetails.hrcD_BloodGroup || '',
                jobTitle: candidateDetails.hrmJ_Id?.toString() || '',
                positionType: candidateDetails.hrmpT_Id?.toString() || '',
                aadharNo: candidateDetails.hrcD_AadharNo?.toString() || '',
                panCardNo: candidateDetails.hrcD_PAN || '',
                refCode: candidateDetails.hrcD_RefCode || '',
                source: candidateDetails.hrcD_ResumeSource || '',
                remark: candidateDetails.hrcD_Remarks || '',
                localAddressLine1: candidateDetails.hrcD_AddressLocal || '',
                localAddressLine2: candidateDetails.hrcD_AddressLocal2 || '',
                localPlace: candidateDetails.hrcD_AddLocalPlace || '',
                localPincode: candidateDetails.hrcD_AddLocalPIN?.toString() || '',
                permanentAddressLine1: candidateDetails.hrcD_AddressPermanent || '',
                permanentAddressLine2: candidateDetails.hrcD_AddressPermanent2 || '',
                permanentPlace: candidateDetails.hrcD_AddPermanentPlace || '',
                permanentPincode: candidateDetails.hrcD_AddPermanentPIN?.toString() || '',
                sameAsLocalAddress:
                    candidateDetails.hrcD_AddressLocal === candidateDetails.hrcD_AddressPermanent && !!candidateDetails.hrcD_AddressLocal
            });
            if (candidateDetails.hrcD_Photo) setPhotoPreview(candidateDetails.hrcD_Photo);
            setHasResetForm(true);
        } else if (!rowData) {
            reset({
                sameAsLocalAddress: false
            });
            setPhotoPreview(null);
            setResumeName(null);
            setHasResetForm(true); // Treat as "reset" even for new forms once we've initialized
        }
    }, [candidateDetails, rowData, nationalities, religions, castes, genders, maritalStatuses, bloodGroups, reset]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        console.log('Form Data', data);
        try {
            const payload = {
                HRCD_Id: rowData?.hrcD_Id || 0,
                HRMPT_Id: Number.parseInt(data.positionType),
                HRMC_Id: Number.parseInt(data.qualification),
                HRCD_MRFNO: (candidateDetails as any)?.hrcD_MRFNO || 0,

                HRCD_FirstName: data.firstName,
                HRCD_MiddleName: data.middleName || '',
                HRCD_LastName: data.lastName,

                HRMJ_Id: Number.parseInt(data.jobTitle),
                HRCD_Skills: data.skill,

                HRCD_DOB: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString() : null,

                IVRMMG_Id: Number.parseInt(data.gender),

                HRCD_MobileNo: data.mobileNo ? Number(data.mobileNo) : 0,
                HRCD_EmailId: data.emailId,

                HRCD_ExpFrom: data.totalExp ? Number(data.totalExp) : 0,
                HRCD_ExpTo: (candidateDetails as any)?.hrcD_ExpTo || 0,

                HRCD_CurrentCompany: data.currentCompany,

                HRCD_ResumeSource: data.source || '',
                HRCD_JobPortalName: data.jobPortalName || '',
                HRCD_RefCode: data.refCode || '',

                HRCD_LastCTC: data.lastCTC ? Number(data.lastCTC) : 0,
                HRCD_ExpectedCTC: data.expectedCTC ? Number(data.expectedCTC) : 0,

                HRCD_AppDate: data.applicationDate ? new Date(data.applicationDate).toISOString() : null,

                HRCD_InterviewDate: data.interviewDate ? new Date(data.interviewDate).toISOString() : null,

                HRCD_NoticePeriod: (candidateDetails as any)?.hrcD_NoticePeriod || 0,
                HRCD_Remarks: data.remark || '',

                HRCD_Resume: data.resumeCV || '',
                HRCD_RecruitmentStatus: 'InProgress',
                HRCD_ActiveFlg: true,

                HRCD_Photo: data.photo || '',

                // ⚠️ safer to send as string (avoids bigint issues)
                HRCD_AadharNo: data.aadharNo,

                HRCD_PAN: data.panCardNo || '',

                HRCD_AddressLocal: data.localAddressLine1,
                HRCD_AddressLocal2: data.localAddressLine2 || '',
                HRCD_AddLocalPlace: data.localPlace,
                HRCD_AddLocalPIN: data.localPincode ? Number(data.localPincode) : 0,

                HRCD_AddressPermanent: data.permanentAddressLine1,
                HRCD_AddressPermanent2: data.permanentAddressLine2 || '',
                HRCD_AddPermanentPlace: data.permanentPlace,
                HRCD_AddPermanentPIN: data.permanentPincode ? Number(data.permanentPincode) : 0,

                HRCD_NatureOfWork: (candidateDetails as any)?.hrcD_NatureOfWork || '',
                HRCD_ScopeOfService: (candidateDetails as any)?.hrcD_ScopeOfService || '',
                HRCD_NationalityId: Number(data.nationality),
                HRCD_CasteId: Number(data.caste),
                HRCD_Religion: Number(data.religion),
                HRCD_MaritalStatus: Number(data.maritalStatus),
                HRCD_BloodGroup: data.bloodGroup
            };
            console.log('payload', payload);

            saveCandidate(payload, {
                onSuccess: (res) => {
                    if (res.success) {
                        reset();
                        onSuccess?.();
                    }
                }
            });
        } catch (error: any) {
            toast.error(error.message || 'Failed to prepare candidate data');
        }
    };

    const handleClear = () => {
        reset();
        setQualifications([]);
        setExperiences([]);
        setFamilyMembers([]);
        setLanguages([]);
        setDocuments([]);
        setHasExperience(false);
        setPhotoPreview(null);
        setResumeName(null);
        toast.info('Form cleared');
    };

    const addQualification = () => {
        setQualifications([
            ...qualifications,
            {
                id: qualifications.length + 1,
                qualification: '',
                board: '',
                year: '',
                percentage: ''
            }
        ]);
    };
    const removeQualification = (index: number) => setQualifications(qualifications.filter((_, i) => i !== index));

    const addExperience = () => {
        setExperiences([
            ...experiences,
            {
                id: experiences.length + 1,
                company: '',
                designation: '',
                from: '',
                to: '',
                experience: ''
            }
        ]);
    };
    const removeExperience = (index: number) => setExperiences(experiences.filter((_, i) => i !== index));

    const addFamilyMember = () => {
        setFamilyMembers([
            ...familyMembers,
            {
                id: familyMembers.length + 1,
                name: '',
                relation: '',
                occupation: '',
                contactNo: ''
            }
        ]);
    };
    const removeFamilyMember = (index: number) => setFamilyMembers(familyMembers.filter((_, i) => i !== index));

    const addLanguage = () => {
        setLanguages([
            ...languages,
            {
                id: languages.length + 1,
                language: '',
                read: false,
                write: false,
                speak: false
            }
        ]);
    };
    const removeLanguage = (index: number) => setLanguages(languages.filter((_, i) => i !== index));

    const addDocument = () => {
        setDocuments([
            ...documents,
            {
                id: documents.length + 1,
                documentType: '',
                fileName: '',
                filePath: ''
            }
        ]);
    };
    const removeDocument = (index: number) => setDocuments(documents.filter((_, i) => i !== index));

    return (
        <div className={`relative ${className}`}>
            {isInitialDataLoading ? (
                <div className='fade-in flex min-h-[400px] w-full animate-in flex-col items-center justify-center rounded-xl border-2 border-violet-100 border-dashed bg-slate-50/50 backdrop-blur-sm duration-500'>
                    <div className='flex flex-col items-center rounded-2xl border border-violet-50 bg-white p-10 shadow-xl'>
                        <div className='relative mb-6'>
                            <div className='absolute inset-0 animate-ping rounded-full bg-violet-100 opacity-20'></div>
                            <RefreshCw className='relative z-10 h-12 w-12 animate-spin text-violet-600' />
                        </div>
                        <h3 className='font-bold text-violet-900 text-xl'>Preparing Form</h3>
                        <p className='mt-2 max-w-[250px] text-center text-muted-foreground text-sm'>
                            Fetching master data and binding candidate details. Please wait...
                        </p>
                        <div className='mt-6 flex gap-2'>
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]'></div>
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]'></div>
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400'></div>
                        </div>
                    </div>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='fade-in slide-in-from-bottom-2 flex animate-in flex-col gap-6 duration-500'>
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className='w-full'>
                        <TabsContent value='candidate' className='space-y-6'>
                            <Card className=' shadow-sm'>
                                <CardHeader className='overflow-hidden bg-violet-500 '>
                                    <CardTitle className='flex items-center font-semibold text-white'>Candidate Details</CardTitle>
                                </CardHeader>
                                <CardContent className='pt-6'>
                                    <div className='grid grid-cols-1 gap-x-8 gap-y-5 lg:grid-cols-2'>
                                        <InputText
                                            label='First Name'
                                            required
                                            placeholder='Enter First Name'
                                            {...register('firstName')}
                                            error={errors.firstName?.message}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Nationality <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='nationality'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={
                                                                nationalityOptions.some((o: any) => o.value === field.value)
                                                                    ? field.value
                                                                    : undefined
                                                            }
                                                            disabled={isLoadingNationalities}>
                                                            <SelectTrigger className={errors.nationality ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={
                                                                        isLoadingNationalities ? 'Loading...' : 'Select Nationality'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {nationalityOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingNationalities && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.nationality && <FormError>{errors.nationality.message}</FormError>}
                                        </div>

                                        <InputText label='Middle Name' placeholder='Enter Middle Name' {...register('middleName')} />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Religion <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='religion'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                setValue('caste', ''); // Reset caste when religion changes
                                                            }}
                                                            value={
                                                                religionOptions.some(
                                                                    (o: any) => o.value?.toString() === field.value?.toString()
                                                                )
                                                                    ? field.value
                                                                    : undefined
                                                            }
                                                            disabled={isLoadingReligions}>
                                                            <SelectTrigger className={errors.religion ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingReligions ? 'Loading...' : 'Select Religion'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {religionOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingReligions && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.religion && <FormError>{errors.religion.message}</FormError>}
                                        </div>

                                        <InputText
                                            label='Last Name'
                                            required
                                            placeholder='Enter Last Name'
                                            {...register('lastName')}
                                            error={errors.lastName?.message}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Caste <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='caste'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={
                                                                casteOptions.some(
                                                                    (o: any) => o.value?.toString() === field.value?.toString()
                                                                )
                                                                    ? field.value
                                                                    : undefined
                                                            }
                                                            disabled={isLoadingCastes || !selectedReligion}>
                                                            <SelectTrigger className={errors.caste ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={
                                                                        !selectedReligion
                                                                            ? 'Select religion first'
                                                                            : isLoadingCastes
                                                                              ? 'Loading...'
                                                                              : 'Select Caste'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {casteOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value.toString()}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingCastes && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.caste && <FormError>{errors.caste.message}</FormError>}
                                        </div>

                                        <InputText
                                            label='Skill'
                                            required
                                            placeholder='Enter Skills (e.g. React, Node.js)'
                                            {...register('skill')}
                                            error={errors.skill?.message}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Gender <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='gender'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={
                                                                genderOptions.some((o: any) => o.value === field.value)
                                                                    ? field.value
                                                                    : undefined
                                                            }
                                                            disabled={isLoadingGenders}>
                                                            <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingGenders ? 'Loading...' : 'Select Gender'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {genderOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingGenders && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.gender && <FormError>{errors.gender.message}</FormError>}
                                        </div>

                                        <InputText
                                            label='Mobile No'
                                            required
                                            placeholder='Enter 10-digit Mobile Number'
                                            {...register('mobileNo')}
                                            error={errors.mobileNo?.message}
                                            maxLength={10}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Marital Status <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='maritalStatus'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={
                                                                maritalStatusOptions.some((o: any) => o.value === field.value)
                                                                    ? field.value
                                                                    : undefined
                                                            }
                                                            disabled={isLoadingMaritalStatuses}>
                                                            <SelectTrigger className={errors.maritalStatus ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingMaritalStatuses ? 'Loading...' : 'Select Status'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {maritalStatusOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingMaritalStatuses && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.maritalStatus && <FormError>{errors.maritalStatus.message}</FormError>}
                                        </div>

                                        <InputText
                                            label='Email Id'
                                            required
                                            type='email'
                                            placeholder='Enter Email Address'
                                            {...register('emailId')}
                                            error={errors.emailId?.message}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Blood Group <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='bloodGroup'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            disabled={isLoadingBloodGroups}>
                                                            <SelectTrigger className={errors.bloodGroup ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingBloodGroups ? 'Loading...' : 'Select Blood Group'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {bloodGroupOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingBloodGroups && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.bloodGroup && <FormError>{errors.bloodGroup.message}</FormError>}
                                        </div>

                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Qualification <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='qualification'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            disabled={isLoadingCourses}>
                                                            <SelectTrigger className={errors.qualification ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingCourses ? 'Loading...' : 'Select Qualification'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {qualificationOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingCourses && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.qualification && <FormError>{errors.qualification.message}</FormError>}
                                        </div>
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Job Title <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='jobTitle'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingJobs}>
                                                            <SelectTrigger className={errors.jobTitle ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={isLoadingJobs ? 'Loading...' : 'Select Job Title'}
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jobOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingJobs && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.jobTitle && <FormError>{errors.jobTitle.message}</FormError>}
                                        </div>

                                        {/* Row 8 */}
                                        <InputText
                                            label='Job Portal Name'
                                            placeholder='Enter Job Portal (e.g. LinkedIn)'
                                            {...register('jobPortalName')}
                                        />
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Position Type <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='positionType'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='relative'>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            disabled={isLoadingPositionTypes}>
                                                            <SelectTrigger className={errors.positionType ? 'border-red-500' : ''}>
                                                                <SelectValue
                                                                    placeholder={
                                                                        isLoadingPositionTypes ? 'Loading...' : 'Select Position Type'
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {positionTypeOptions.map((opt: any) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>
                                                                        {opt.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {isLoadingPositionTypes && (
                                                            <RefreshCw className='absolute top-2.5 right-8 h-4 w-4 animate-spin text-muted-foreground' />
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            {errors.positionType && <FormError>{errors.positionType.message}</FormError>}
                                        </div>

                                        {/* Row 9 */}
                                        <InputText
                                            label='Current Company'
                                            required
                                            placeholder='Enter Current Company Name'
                                            {...register('currentCompany')}
                                            error={errors.currentCompany?.message}
                                        />
                                        <InputText
                                            label='Aadhar No'
                                            required
                                            placeholder='Enter 12-digit Aadhar Number'
                                            {...register('aadharNo')}
                                            error={errors.aadharNo?.message}
                                            maxLength={12}
                                        />

                                        {/* Row 10 */}
                                        <InputText
                                            label='Total Exp.'
                                            required
                                            type='number'
                                            placeholder='Enter Total Experience'
                                            {...register('totalExp')}
                                            error={errors.totalExp?.message}
                                        />
                                        <InputText
                                            label='PAN Card No'
                                            placeholder='Enter PAN Card Number'
                                            {...register('panCardNo')}
                                            error={errors.panCardNo?.message}
                                            maxLength={10}
                                        />

                                        {/* Row 11 */}
                                        <InputText
                                            label='Last CTC'
                                            required
                                            type='number'
                                            placeholder='Enter Last CTC'
                                            {...register('lastCTC')}
                                            error={errors.lastCTC?.message}
                                        />
                                        <InputText label='Ref. Code' placeholder='Enter Reference Code' {...register('refCode')} />

                                        {/* Row 12 */}
                                        <InputText
                                            label='Expected CTC'
                                            required
                                            type='number'
                                            placeholder='Enter Expected CTC'
                                            {...register('expectedCTC')}
                                            error={errors.expectedCTC?.message}
                                        />
                                        <InputText label='Source' placeholder='Enter Source (e.g. Referral)' {...register('source')} />

                                        {/* Row 13 */}
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Application Date <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='applicationDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        date={field.value ? new Date(field.value) : undefined}
                                                        setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                        disabled={{ after: new Date() }}
                                                        placeholder='Select Application Date'
                                                    />
                                                )}
                                            />
                                            {errors.applicationDate && <FormError>{errors.applicationDate.message}</FormError>}
                                        </div>
                                        <InputText label='Remark' placeholder='Enter any remarks' {...register('remark')} />

                                        {/* Row 14 */}
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Interview Date <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='interviewDate'
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        date={field.value ? new Date(field.value) : undefined}
                                                        setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                        placeholder='Select Interview Date'
                                                    />
                                                )}
                                            />
                                            {errors.interviewDate && <FormError>{errors.interviewDate.message}</FormError>}
                                        </div>
                                        <div className='hidden lg:block'></div>

                                        {/* Row 15 */}
                                        <div className='flex flex-col gap-1.5'>
                                            <Label>
                                                Date of Birth <span className='font-bold text-red-500'>*</span>
                                            </Label>
                                            <Controller
                                                name='dateOfBirth'
                                                control={control}
                                                render={({ field }) => (
                                                    <DatePicker
                                                        date={field.value ? new Date(field.value) : undefined}
                                                        setDate={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                                        disabled={{ after: new Date() }}
                                                        placeholder='Select Date of Birth'
                                                    />
                                                )}
                                            />
                                            {errors.dateOfBirth && <FormError>{errors.dateOfBirth.message}</FormError>}
                                        </div>
                                        <div className='hidden lg:block'></div>
                                        <div className='hidden lg:block'></div>
                                    </div>

                                    {/* Resume and Photo Side by Side */}
                                    <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <label className='mb-3 block font-medium text-sm'>Upload Photo</label>
                                            <div className='flex items-center gap-6'>
                                                <div className='flex h-24 w-20 items-center justify-center overflow-hidden border-2 border-gray-300 border-dashed bg-white shadow-inner'>
                                                    {photoPreview ? (
                                                        <img src={photoPreview} alt='Preview' className='h-full w-full object-cover' />
                                                    ) : (
                                                        <User className='h-10 w-10 text-gray-400' />
                                                    )}
                                                </div>
                                                <div className='space-y-2'>
                                                    <label className='inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 text-xs shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50'>
                                                        <Upload className='mr-2 h-4 w-4 text-gray-400' />
                                                        {photoPreview ? 'Change Photo' : 'Choose Photo'}
                                                        <input
                                                            type='file'
                                                            className='hidden'
                                                            accept='image/*'
                                                            onChange={(e) => handleFileChange(e, 'photo')}
                                                        />
                                                    </label>
                                                    <p className='text-[10px] text-gray-500'>Allowed formats: JPG, PNG. Max size: 2MB.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <label className='mb-3 block font-medium text-sm'>Resume/CV</label>
                                            <div className='flex h-[100px] flex-col justify-center space-y-3'>
                                                <div className='flex items-center gap-3'>
                                                    <label className='inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 font-semibold text-gray-900 text-xs shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50'>
                                                        <Upload className='mr-2 h-4 w-4 text-gray-400' />
                                                        {resumeName ? 'Change File' : 'Choose File'}
                                                        <input
                                                            type='file'
                                                            className='hidden'
                                                            accept='.pdf,.doc,.docx'
                                                            onChange={(e) => handleFileChange(e, 'resumeCV')}
                                                        />
                                                    </label>
                                                    <span className='text-muted-foreground text-xs italic'>
                                                        {resumeName || 'No file chosen'}
                                                    </span>
                                                </div>
                                                <p className='text-[10px] text-gray-500'>Allowed formats: PDF, DOC, DOCX. Max size: 5MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Section */}
                                    <div className='mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <h4 className='mb-4 font-semibold text-gray-700 text-sm underline'>LOCAL ADDRESS</h4>
                                            <div className='space-y-3'>
                                                <InputText
                                                    label='Address Line 1'
                                                    required
                                                    placeholder='Enter address line 1'
                                                    {...register('localAddressLine1')}
                                                    error={errors.localAddressLine1?.message}
                                                />
                                                <InputText
                                                    label='Address Line 2'
                                                    placeholder='Enter address line 2'
                                                    {...register('localAddressLine2')}
                                                />
                                                <InputText
                                                    label='Place'
                                                    required
                                                    placeholder='Enter place'
                                                    {...register('localPlace')}
                                                    error={errors.localPlace?.message}
                                                />
                                                <InputText
                                                    label='Pincode'
                                                    required
                                                    placeholder='Enter 6-digit pincode'
                                                    {...register('localPincode')}
                                                    error={errors.localPincode?.message}
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                        <div className='rounded-lg border border-gray-200 bg-gray-50 p-4'>
                                            <div className='mb-4 flex items-center justify-between'>
                                                <h4 className='font-semibold text-gray-700 text-sm underline'>PERMANENT ADDRESS</h4>
                                                <div className='flex items-center gap-2'>
                                                    <Checkbox
                                                        checked={sameAsLocalAddress}
                                                        onCheckedChange={(checked) => setValue('sameAsLocalAddress', !!checked)}
                                                    />
                                                    <span className='text-gray-600 text-xs'>Same as Local Address?</span>
                                                </div>
                                            </div>
                                            <div className='space-y-3'>
                                                <InputText
                                                    label='Address Line 1'
                                                    required
                                                    placeholder='Enter address line 1'
                                                    {...register('permanentAddressLine1')}
                                                    error={errors.permanentAddressLine1?.message}
                                                    disabled={sameAsLocalAddress}
                                                />
                                                <InputText
                                                    label='Address Line 2'
                                                    placeholder='Enter address line 2'
                                                    {...register('permanentAddressLine2')}
                                                    disabled={sameAsLocalAddress}
                                                />
                                                <InputText
                                                    label='Place'
                                                    required
                                                    placeholder='Enter place'
                                                    {...register('permanentPlace')}
                                                    error={errors.permanentPlace?.message}
                                                    disabled={sameAsLocalAddress}
                                                />
                                                <InputText
                                                    label='Pincode'
                                                    required
                                                    placeholder='Enter 6-digit pincode'
                                                    {...register('permanentPincode')}
                                                    error={errors.permanentPincode?.message}
                                                    disabled={sameAsLocalAddress}
                                                    maxLength={6}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Other tabs are commented out */}
                        {/* <TabsContent value='qualification' ...> ... </TabsContent> */}
                    </Tabs>
                    {/* Form Actions */}
                    <div className='flex flex-row items-center justify-center gap-3 border-gray-200 border-t bg-gray-50 p-4'>
                        <Button
                            type='submit'
                            disabled={isSubmitting || Object.keys(errors).length > 0}
                            className='rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'>
                            Save & Proceed
                        </Button>
                        <Button type='button' variant='destructive' onClick={handleClear} disabled={isSubmitting} className='rounded-md'>
                            <X className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
