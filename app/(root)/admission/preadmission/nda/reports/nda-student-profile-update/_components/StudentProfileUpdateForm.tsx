'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/extension/field';
import { MobileNumberInput } from '@/components/ui/extension/input-mobile-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useNdaSaveRequest, useNdaStudentProfileDetails } from '@/hooks/admission/preadmission/useNdaStudentProfileUpdate';
import { type NdaStudentProfileUpdateFields, ndaStudentProfileUpdateSchema } from '@/schemas/admission/nda-student-profile-update';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCcw, Save, User, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { AddressFields } from './AddressFields';
import { ImageUploadSection } from './ImageUploadSection';

export const StudentProfileUpdateForm = () => {
    const [updateFlag, setUpdateFlag] = React.useState(false);
    const { data: initialData, isLoading: detailsLoading } = useNdaStudentProfileDetails(updateFlag);
    const { mutateAsync: saveRequest, isPending: isSaving } = useNdaSaveRequest();

    // Form setup
    const form = useForm<NdaStudentProfileUpdateFields>({
        resolver: zodResolver(ndaStudentProfileUpdateSchema),
        defaultValues: {
            ASTUREQ_Id: 0,
            AMSTG_Id: 0,
            AMST_ID: 0,
            Mobilenumber: '',
            EmailidforCandidate: '',
            Bloodgroup: '',
            Guardianname: '',
            AMSTG_GuardianPhoneNo: '',
            AMSTG_emailid: '',
            AMST_FatherMobleNo: '',
            AMST_FatheremailId: '',
            AMST_MotherMobileNo: '',
            AMST_MotherEmailId: '',
            Resstreet: '',
            ResArea: '',
            Rescity: '',
            Rescountry: '',
            Resstate: '',
            ResPincode: '',
            Perstreett: '',
            PerArea: '',
            Percity: '',
            PerState: '',
            PerPincode: ''
        }
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors }
    } = form;

    // Populate form data from initial data
    useEffect(() => {
        const student = (initialData as any)?.data || (initialData as any)?.updatestudetailslist?.[0];
        if (student) {
            // Populate basic fields
            setValue('ASTUREQ_Id', student.astureQ_Id || 0);
            setValue('AMSTG_Id', student.amstG_Id || 0);
            setValue('AMST_ID', student.amsT_Id || 0);
            setValue(
                'Mobilenumber',
                student.amsT_MobileNo || student.mobilenumber ? String(student.amsT_MobileNo || student.mobilenumber) : ''
            );
            setValue('EmailidforCandidate', student.amsT_emailId || student.emailidforCandidate || '');
            setValue('Bloodgroup', student.amsT_BloodGroup || '');
            setValue('Guardianname', student.amstG_GuardianName || student.Guardianname || '');
            setValue(
                'AMSTG_GuardianPhoneNo',
                student.astureQ_GuardianMobileNo || student.amsT_GuardianPhoneNo
                    ? String(student.astureQ_GuardianMobileNo || student.amsT_GuardianPhoneNo)
                    : ''
            );
            setValue('AMSTG_emailid', student.astureQ_GuardianEmailId || student.amsT_emailid || '');
            setValue('AMST_FatherMobleNo', student.amsT_FatherMobleNo ? String(student.amsT_FatherMobleNo) : '');
            setValue('AMST_FatheremailId', student.amsT_FatheremailId || '');
            setValue('AMST_MotherMobileNo', student.amsT_MotherMobileNo ? String(student.amsT_MotherMobileNo) : '');
            setValue('AMST_MotherEmailId', student.amsT_MotherEmailId || '');

            // Photos - Handle legacy names
            setValue('ASTUREQ_StudentPhoto', student.astureQ_StudentPhoto || student.amsT_Photoname || '');
            setValue('ASTUREQ_FatherPhoto', student.astureQ_FatherPhoto || student.ansT_FatherPhoto || '');
            setValue('ASTUREQ_MotherPhoto', student.astureQ_MotherPhoto || student.ansT_MotherPhoto || '');
            setValue('ASTUREQ_GuardianPhoto', student.astureQ_GuardianPhoto || student.astureQ_GuardianPhoto || '');

            // Address - Residential (Current in student profile)
            setValue('Resstreet', student.amsT_ConStreet || student.stP_CURSTREET || '');
            setValue('ResArea', student.amsT_ConArea || student.stP_CURAREA || '');
            setValue('Rescity', student.amsT_ConCity || student.stP_CURCITY || '');
            setValue('Rescountry', student.amsT_ConCountry || student.stP_CURCOUNTRY || '');
            setValue('Resstate', student.amsT_ConState || student.stP_CURSTATE || '');
            setValue(
                'ResPincode',
                student.amsT_ConPincode || student.stP_CURPIN ? String(student.amsT_ConPincode || student.stP_CURPIN) : ''
            );

            // Address - Permanent
            setValue('Perstreett', student.amsT_PerStreet || student.stP_PERSTREET || '');
            setValue('PerArea', student.amsT_PerArea || student.stP_PERAREA || '');
            setValue('Percity', student.amsT_PerCity || student.stP_PERCITY || '');
            setValue('Percountry', student.amsT_PerCountry || student.stP_PERCOUNTRY || '');
            setValue('PerState', student.amsT_PerState || student.stP_PERSTATE || '');
            setValue(
                'PerPincode',
                student.amsT_PerPincode || student.stP_PERPIN ? String(student.amsT_PerPincode || student.stP_PERPIN) : ''
            );

            // Meta
            setValue('ASTUREQ_Date', student.astureQ_Date || '');
        }
    }, [initialData, setValue]);

    const onSubmit = async (data: NdaStudentProfileUpdateFields) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to send update request?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#60cc91',
            confirmButtonText: 'Yes, Send it!',
            cancelButtonText: 'Cancel',
            customClass: {
                container: 'rounded-3xl',
                popup: 'rounded-3xl'
            }
        });

        if (!confirm.isConfirmed) return;

        try {
            const student = (initialData as any)?.data || {};

            const payload = {
                ASTUREQ_Id: data.ASTUREQ_Id,
                AMSTG_Id: data.AMSTG_Id,
                AMST_ID: data.AMST_ID,
                Mobilenumber: data.Mobilenumber,
                EmailidforCandidate: data.EmailidforCandidate,
                AMST_FatherMobleNo: data.AMST_FatherMobleNo,
                AMST_MotherMobileNo: data.AMST_MotherMobileNo,
                AMST_MotherEmailId: data.AMST_MotherEmailId,
                AMST_FatheremailId: data.AMST_FatheremailId,
                AMSTG_GuardianPhoneNo: data.AMSTG_GuardianPhoneNo,
                AMSTG_emailid: data.AMSTG_emailid,
                ASTUREQ_GuardianMobileNo: data.AMSTG_GuardianPhoneNo,
                ASTUREQ_GuardianEmailId: data.AMSTG_emailid,
                AMSTG_GuardianName: data.Guardianname,
                ASTUREQ_StudentPhoto: data.ASTUREQ_StudentPhoto,
                ASTUREQ_FatherPhoto: data.ASTUREQ_FatherPhoto,
                ASTUREQ_MotherPhoto: data.ASTUREQ_MotherPhoto,
                ASTUREQ_GuardianPhoto: data.ASTUREQ_GuardianPhoto,
                STP_PERSTREET: data.Perstreett,
                STP_PERAREA: data.PerArea,
                STP_PERCITY: data.Percity,
                STP_PERSTATE: data.PerState,
                STP_PERCOUNTRY: data.Percountry,
                STP_PERPIN: data.PerPincode,
                STP_CURSTREET: data.Resstreet,
                STP_CURAREA: data.ResArea,
                STP_CURCITY: data.Rescity,
                STP_CURSTATE: data.Resstate,
                STP_CURCOUNTRY: data.Rescountry,
                STP_CURPIN: data.ResPincode,
                AMST_BloodGroup: data.Bloodgroup
            };

            const res = await saveRequest(payload);
            if (res.success) {
                toast.success('Update request sent successfully!');
            } else {
                toast.error(res.message || 'Failed to send update request.');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An unexpected error occurred.');
        }
    };

    if (detailsLoading) {
        return (
            <div className='flex h-[60vh] flex-col items-center justify-center space-y-4 p-12'>
                <Spinner className='h-16 w-16 animate-spin text-primary' />
                <div className='text-center'>
                    <h3 className='animate-pulse font-bold text-2xl text-primary'>Fetching Profile</h3>
                    <p className='text-muted-foreground'>Please wait while we load your information...</p>
                </div>
            </div>
        );
    }

    const studentInfo = (initialData as any)?.data || {};
    const countries = (initialData as any)?.data?.countryDrpDown || [];
    const states = (initialData as any)?.data?.stateDrpDown || [];

    const fullName = `${studentInfo.amsT_FirstName || ''} ${studentInfo.amsT_MiddleName || ''} ${studentInfo.amsT_LastName || ''}`.trim();

    const getStatusInfo = (status: any) => {
        if (status === true || status === 1) return { label: 'Approved', color: 'text-emerald-600 bg-emerald-50' };
        if (status === false || status === 0) return { label: 'Rejected', color: 'text-rose-600 bg-rose-50' };
        return { label: 'Pending', color: 'text-amber-600 bg-amber-50' };
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='fade-in mx-auto max-w-[1400px] animate-in space-y-6 pb-20 duration-700'>
            {/* Control Bar */}
            <div className='sticky top-4 z-[60] flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/10 bg-white px-6 py-3 shadow-md sm:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center space-x-2 rounded-full border border-primary/10 bg-primary/5 px-4 py-1.5'>
                        <Label
                            htmlFor='view-mode'
                            className='cursor-pointer font-black text-[10px] text-primary/60 uppercase tracking-widest'>
                            Original
                        </Label>
                        <Switch id='view-mode' checked={updateFlag} onCheckedChange={setUpdateFlag} />
                        <Label htmlFor='view-mode' className='cursor-pointer font-black text-[10px] text-primary uppercase tracking-widest'>
                            Request
                        </Label>
                    </div>
                </div>
                <div className='flex items-center gap-4'>
                    <div className='hidden items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100/80 px-4 py-1.5 font-black text-[10px] text-neutral-500 uppercase tracking-widest md:flex'>
                        {updateFlag ? (
                            <RefreshCcw className='h-3 w-3 animate-spin-slow text-primary' />
                        ) : (
                            <User className='h-3 w-3 text-primary' />
                        )}
                        {updateFlag ? 'Previewing Request' : 'Viewing Profile'}
                    </div>
                </div>
            </div>

            {/* Row 1: Student & Guardian Details */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Student Details */}
                <Card className='rounded-none border-t-4 border-t-[#3c8dbc] shadow-md'>
                    <CardHeader className='bg-[#3c8dbc] px-4 py-2'>
                        <CardTitle className='text-center font-bold text-sm text-white uppercase'>
                            STUDENT NAME: {fullName || 'Student Name'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 p-4'>
                        <div className='grid grid-cols-1 gap-3'>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>
                                    Mobile Number:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='Mobilenumber'
                                        control={control}
                                        render={({ field }) => (
                                            <MobileNumberInput
                                                {...field}
                                                maxLength={10}
                                                className='h-8 rounded-none text-xs'
                                                placeholder='Enter MobileNumber'
                                            />
                                        )}
                                    />
                                    {errors.Mobilenumber && (
                                        <p className='mt-0.5 font-bold text-[10px] text-rose-500'>{errors.Mobilenumber.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>
                                    Email ID:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='EmailidforCandidate'
                                        control={control}
                                        render={({ field }) => (
                                            <InputText {...field} className='h-8 rounded-none text-xs' placeholder='Enter Email ID' />
                                        )}
                                    />
                                    {errors.EmailidforCandidate && (
                                        <p className='mt-0.5 font-bold text-[10px] text-rose-500'>{errors.EmailidforCandidate.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>Blood Group:</Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='Bloodgroup'
                                        control={control}
                                        render={({ field }) => (
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <SelectTrigger className='h-8 rounded-none text-xs'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[
                                                        'A+',
                                                        'A-',
                                                        'B+',
                                                        'B-',
                                                        'AB+',
                                                        'AB-',
                                                        'O+',
                                                        'O-',
                                                        'A1+ve',
                                                        'A1-ve',
                                                        'B1+ve',
                                                        'B1-ve',
                                                        'A2+ve',
                                                        'A1B+ve',
                                                        'A2B+ve',
                                                        'A1B2',
                                                        'A1B-ve'
                                                    ].map((bg) => (
                                                        <SelectItem key={bg} value={bg}>
                                                            {bg}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guardian Details */}
                <Card className='rounded-none border-t-4 border-t-[#3c8dbc] shadow-md'>
                    <CardHeader className='bg-[#3c8dbc] px-4 py-2'>
                        <CardTitle className='text-center font-bold text-sm text-white uppercase'>
                            GUARDIAN NAME: {studentInfo.amstG_GuardianName || studentInfo.Guardianname || 'N/A'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 p-4'>
                        <div className='grid grid-cols-1 gap-3'>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>GUARDIAN NAME:</Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='Guardianname'
                                        control={control}
                                        render={({ field }) => (
                                            <InputText {...field} className='h-8 rounded-none text-xs' placeholder='Enter Street' />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>Mobile Number:</Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMSTG_GuardianPhoneNo'
                                        control={control}
                                        render={({ field }) => (
                                            <MobileNumberInput
                                                {...field}
                                                maxLength={10}
                                                className='h-8 rounded-none text-xs'
                                                placeholder='Enter MobileNumber'
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>Email ID:</Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMSTG_emailid'
                                        control={control}
                                        render={({ field }) => (
                                            <InputText {...field} className='h-8 rounded-none text-xs' placeholder='Enter Email ID' />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Photo Section */}
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <Controller
                    name='ASTUREQ_StudentPhoto'
                    control={control}
                    render={({ field }) => (
                        <ImageUploadSection
                            label='Upload Student Photo'
                            value={field.value || ''}
                            onChange={field.onChange}
                            variant='minimal'
                        />
                    )}
                />
                <Controller
                    name='ASTUREQ_MotherPhoto'
                    control={control}
                    render={({ field }) => (
                        <ImageUploadSection
                            label='Upload Mother Photo'
                            value={field.value || ''}
                            onChange={field.onChange}
                            variant='minimal'
                        />
                    )}
                />
                <Controller
                    name='ASTUREQ_FatherPhoto'
                    control={control}
                    render={({ field }) => (
                        <ImageUploadSection
                            label='Upload Father Photo'
                            value={field.value || ''}
                            onChange={field.onChange}
                            variant='minimal'
                        />
                    )}
                />
                <Controller
                    name='ASTUREQ_GuardianPhoto'
                    control={control}
                    render={({ field }) => (
                        <ImageUploadSection label='Upload Photo' value={field.value || ''} onChange={field.onChange} variant='minimal' />
                    )}
                />
            </div>

            {/* Row 3: Father & Mother Details */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Father Details */}
                <Card className='rounded-none border-t-4 border-t-[#3c8dbc] shadow-md'>
                    <CardHeader className='bg-[#3c8dbc] px-4 py-2'>
                        <CardTitle className='text-center font-bold text-sm text-white uppercase'>
                            FATHER NAME: {studentInfo.fatherName || '---'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 p-4'>
                        <div className='grid grid-cols-1 gap-3'>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>
                                    Mobile Number:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMST_FatherMobleNo'
                                        control={control}
                                        render={({ field }) => (
                                            <MobileNumberInput
                                                {...field}
                                                maxLength={10}
                                                className='h-8 rounded-none text-xs'
                                                placeholder='Enter MobileNumber'
                                            />
                                        )}
                                    />
                                    {errors.AMST_FatherMobleNo && (
                                        <p className='mt-0.5 font-bold text-[10px] text-rose-500'>{errors.AMST_FatherMobleNo.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>
                                    Email ID:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMST_FatheremailId'
                                        control={control}
                                        render={({ field }) => (
                                            <InputText {...field} className='h-8 rounded-none text-xs' placeholder='Enter Email ID' />
                                        )}
                                    />
                                    {errors.AMST_FatheremailId && (
                                        <p className='mt-0.5 font-bold text-[10px] text-rose-500'>{errors.AMST_FatheremailId.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mother Details */}
                <Card className='rounded-none border-t-4 border-t-[#3c8dbc] shadow-md'>
                    <CardHeader className='bg-[#3c8dbc] px-4 py-2'>
                        <CardTitle className='text-center font-bold text-sm text-white uppercase'>
                            MOTHER NAME: {studentInfo.mothername || '---'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4 p-4'>
                        <div className='grid grid-cols-1 gap-3'>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>
                                    Mobile Number:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMST_MotherMobileNo'
                                        control={control}
                                        render={({ field }) => (
                                            <MobileNumberInput
                                                {...field}
                                                maxLength={10}
                                                className='h-8 rounded-none text-xs'
                                                placeholder='Enter MobileNumber'
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='grid grid-cols-12 items-center gap-4'>
                                <Label className='col-span-4 font-bold text-neutral-600 text-xs'>Email ID:</Label>
                                <div className='col-span-8'>
                                    <Controller
                                        name='AMST_MotherEmailId'
                                        control={control}
                                        render={({ field }) => (
                                            <InputText {...field} className='h-8 rounded-none text-xs' placeholder='Enter Email ID' />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 4: Addresses */}
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                {/* Residential Address */}
                <div className='space-y-4'>
                    <h4 className='font-bold text-neutral-600 text-xs uppercase'>RESIDENTIAL ADDRESS :</h4>
                    <Card className='rounded-none shadow-sm'>
                        <CardContent className='p-4'>
                            <AddressFields control={control} type='Res' countries={countries} states={states} />
                        </CardContent>
                    </Card>
                </div>

                {/* Permanent Address */}
                <div className='space-y-4'>
                    <h4 className='font-bold text-neutral-600 text-xs uppercase'>PERMANENT ADDRESS :</h4>
                    <Card className='rounded-none shadow-sm'>
                        <CardContent className='p-4'>
                            <AddressFields control={control} type='Per' countries={countries} states={states} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Status Indicators */}
            <div className='flex flex-wrap justify-center gap-4 py-4'>
                <div
                    className={`rounded-full border border-current px-4 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-sm ${getStatusInfo(studentInfo.astureQ_ConformFlg).color} bg-white`}>
                    Student Status: {getStatusInfo(studentInfo.astureQ_ConformFlg).label}
                </div>
                {studentInfo.astureQ_Date && (
                    <div className='rounded-full bg-primary px-4 py-1.5 font-black text-[10px] text-white uppercase tracking-widest shadow-md'>
                        Last Requested: {new Date(studentInfo.astureQ_Date).toLocaleDateString('en-GB')}
                    </div>
                )}
            </div>

            {/* Action Bar */}
            <div className='flex items-center justify-center gap-4 py-6'>
                <Button
                    type='submit'
                    disabled={isSaving}
                    className='h-10 rounded-none bg-[#3c8dbc] px-10 font-bold text-white text-xs shadow-md hover:bg-[#357ca5]'>
                    {isSaving ? <Spinner className='me-2 h-4 w-4' /> : <Save className='me-2 h-4 w-4' />}
                    SAVE REQUEST
                </Button>
                <Button
                    type='button'
                    variant='destructive'
                    className='h-10 rounded-none bg-[#dd4b39] px-10 font-bold text-white text-xs shadow-md hover:bg-[#d73925]'
                    onClick={() => window.location.reload()}>
                    <X className='me-2 h-4 w-4' /> CLOSE
                </Button>
            </div>
        </form>
    );
};
