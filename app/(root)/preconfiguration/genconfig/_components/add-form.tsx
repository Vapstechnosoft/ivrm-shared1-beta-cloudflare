'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetGeneralConfigurationEdit, useSaveGeneralConfiguration } from '@/hooks/preconfiguration/useGeneralConfig';
import type { IPageList, IUsernameArray } from '@/types/preconfiguration/general-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useConfigStore } from './genconfig-store';
import { type GenConfigFormValues, genConfigSchema } from './schema';

interface GenConfigAddFormProps {
    pagelist: IPageList[];
    usernamearray: IUsernameArray[];
}

export default function GenConfigAddForm({ pagelist, usernamearray }: GenConfigAddFormProps) {
    const { editId, setEditId } = useConfigStore();
    const saveMutation = useSaveGeneralConfiguration();
    const { data: editData } = useGetGeneralConfigurationEdit(editId as number);

    const form = useForm<GenConfigFormValues>({
        resolver: zodResolver(genConfigSchema),
        defaultValues: {
            IVRMGC_MobileValOTPFlag: false,
            IVRMGC_emailValOTPFlag: false,
            IVRMGC_EnableQRCodeFlg: false,
            IVRMGC_EnableWhatsappFlg: false,
            IVRMGC_SMSActiveFlag: false,
            IVRMGC_EmailActiveFlag: false,
            IVRMGC_ComTrasaNoFlag: false,
            IVRMGC_SCActive: false,
            IVRMGC_FPActive: false,
            IVRMGC_OnlineFPActive: false,
            IVRMGC_FaceReaderActive: false,
            IVRMGC_DefaultStudentSelection: false,
            IVRMGC_TransportRequired: false,
            IVRMGC_AdmnoColumnDisplay: false,
            regno: false,
            IVRMGC_CatLogoFlg: false,
            rolno: false,
            IVRMGC_SportsPointsDropdownFlg: false,
            IVRMGC_EnableSUBTSTUIntFlg: false,
            IVRMGC_EnableSTSUBTIntFlg: false,
            IVRMGC_EnableCTSTIntFlg: false,
            IVRMGC_EnableSTCTIntFlg: false,
            IVRMGC_EnableHODSTIntFlg: false,
            IVRMGC_EnableSTHODIntFlg: false,
            IVRMGC_EnablePrincipalSTIntFlg: false,
            IVRMGC_EnableSTPrincipalIntFlg: false,
            IVRMGC_EnableASSTIntFlg: false,
            IVRMGC_EnableSTASIntFlg: false,
            IVRMGC_EnableECSTIntFlg: false,
            IVRMGC_EnableSTECIntFlg: false,
            IVRMGC_GMRDTOALLFlg: false,
            IVRMGC_EnableStaffwiseIntFlg: false,
            IVRMGC_StudentDataChangeAlertFlg: false,
            IVRMGC_AttendanceShortageAlertFlg: false,
            IVRMGC_StudentLoginCred: false,
            IVRMGC_FatherLoginCred: false,
            IVRMGC_MotherLoginCred: false,
            IVRMGC_GuardianLoginCred: false,
            IVRMGC_AutoCreateStudentCredFlg: false,
            pagecontentlist: [],
            usernamearray: [],
            IVRMGC_OTPMobileNo: '',
            IVRMGC_OTPMailId: '',
            IVRMGC_StudentPhotoPath: '',
            IVRMGC_StaffPhotoPath: '',
            IVRMGC_SMSDomain: '',
            IVRMGC_SMSURL: '',
            IVRMGC_SMSUserName: '',
            IVRMGC_SMSPassword: '',
            IVRMGC_SMSSenderId: '',
            IVRMGC_SMSWorkingKey: '',
            IVRMGC_SMSFooter: '',
            IVRMGC_emailUserName: '',
            IVRMGC_emailPassword: '',
            IVRMGC_HostName: '',
            IVRMGC_PortNo: '',
            IVRMGC_MailGenralDesc: '',
            IVRMGC_Webiste: '',
            IVRMGC_AdmNo_RegNo_RollNo_DefaultFlag: '1',
            IVRMGC_CCMail: '',
            IVRMGC_BCCMail: '',
            IVRMGC_SendGrid_Key: '',
            IVRMGC_Pagination: '',
            IVRMGC_PagePagination: '',
            IVRMGC_ReportPagination: '',
            IVRMGC_ReminderDays: '',
            IVRMGC_ClassCapacity: '',
            IVRMGC_SectionCapacity: '',
            IVRMGC_SCLockingPeriod: '',
            IVRMGC_FPLockingPeriod: '',
            IVRMGC_Disclaimer: '',
            IVRMGC_Classwise_Payment: '',
            IVRMGC_APIOrSMTPFlg: '',
            IVRMGC_StudentDataChangeAlertDays: '',
            IVRMGC_PasswordExpiryDuration: '',
            IVRMGC_AttShortageAlertDays: '',
            IVRMGC_UserNameOptionsFlg: ''
        }
    });

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        control,
        reset,
        formState: { errors }
    } = form;

    const {
        fields: pageFields,
        append: appendPage,
        remove: removePage
    } = useFieldArray({
        control,
        name: 'pagecontentlist'
    });

    const {
        fields: userFields,
        append: appendUser,
        remove: removeUser
    } = useFieldArray({
        control,
        name: 'usernamearray'
    });

    useEffect(() => {
        if (editData && editData.mstConfigList && editData.mstConfigList.length > 0) {
            const config = editData.mstConfigList[0];

            const mappedConfig: any = {};
            const configRecord = config as Record<string, any>;
            Object.keys(configRecord).forEach((key) => {
                if (key.startsWith('ivrmgC_')) {
                    const upperKey = key.replace('ivrmgC_', 'IVRMGC_');
                    mappedConfig[upperKey] = configRecord[key];
                } else {
                    mappedConfig[key] = configRecord[key];
                }
            });

            const otpMobileNo = config.ivrmgC_OTPMobileNo;

            reset({
                ...mappedConfig,
                IVRMGC_Pagination: config.ivrmgC_Pagination?.toString() || '',
                IVRMGC_PagePagination: config.ivrmgC_PagePagination?.toString() || '',
                IVRMGC_ReportPagination: config.ivrmgC_ReportPagination?.toString() || '',
                IVRMGC_ReminderDays: config.ivrmgC_ReminderDays?.toString() || '',
                IVRMGC_ClassCapacity: config.ivrmgC_ClassCapacity?.toString() || '',
                IVRMGC_SectionCapacity: config.ivrmgC_SectionCapacity?.toString() || '',
                IVRMGC_Classwise_Payment: config.ivrmgC_Classwise_Payment?.toString() || '',
                IVRMGC_AdmNo_RegNo_RollNo_DefaultFlag: config.ivrmgC_AdmNo_RegNo_RollNo_DefaultFlag?.toString() || '',
                IVRMGC_APIOrSMTPFlg: config.ivrmgC_APIOrSMTPFlg || '',
                IVRMGC_PortNo: config.ivrmgC_PortNo?.toString() || '',
                IVRMGC_OTPMobileNo: otpMobileNo && otpMobileNo !== 0 && otpMobileNo !== '0' ? otpMobileNo.toString() : '',
                IVRMGC_StudentDataChangeAlertDays: config.ivrmgC_StudentDataChangeAlertDays?.toString() || '',
                IVRMGC_PasswordExpiryDuration: config.ivrmgC_PasswordExpiryDuration?.toString() || '',
                IVRMGC_AttShortageAlertDays: config.ivrmgC_AttShortageAlertDays?.toString() || '',
                regno: config.ivrmgC_RegnoColumnDisplay || false,
                rolno: config.ivrmgC_RollnoColumnDisplay || false
            } as any);

            if (editData.usernamearray && editData.usernamearray.length > 0) {
                setValue(
                    'usernamearray',
                    editData.usernamearray.map((u: any) => ({
                        IVRMCUNP_Field: u.ivrmcunP_Field || '',
                        IVRMCUNP_Length: u.ivrmcunP_Length?.toString() || '',
                        IVRMCUNP_FromOrderFlg: u.ivrmcunP_FromOrderFlg || '',
                        IVRMCUNP_Order: u.ivrmcunP_Order?.toString() || ''
                    }))
                );
            } else {
                setValue('usernamearray', [
                    {
                        IVRMCUNP_Field: '',
                        IVRMCUNP_Length: '',
                        IVRMCUNP_FromOrderFlg: '',
                        IVRMCUNP_Order: ''
                    }
                ]);
            }

            if (editData.pagelist) {
                // Not immediately populating page content list based on typical angular structure,
                // but can map it here if required.
            }
        } else if (!editId && userFields.length === 0) {
            setValue('usernamearray', [
                {
                    IVRMCUNP_Field: '',
                    IVRMCUNP_Length: '',
                    IVRMCUNP_FromOrderFlg: '',
                    IVRMCUNP_Order: ''
                }
            ]);
        }
    }, [editData, reset, setValue, editId]);

    const onSubmit = (values: GenConfigFormValues) => {
        const autoCreateCred = !(
            values.IVRMGC_FatherLoginCred ||
            values.IVRMGC_StudentLoginCred ||
            values.IVRMGC_MotherLoginCred ||
            values.IVRMGC_GuardianLoginCred
        );

        const payload = {
            ivrmgC_Id: editId || 0,
            ivrmgC_MobileValOTPFlag: values.IVRMGC_MobileValOTPFlag,
            ivrmgC_emailValOTPFlag: values.IVRMGC_emailValOTPFlag,
            ivrmgC_StudentPhotoPath: values.IVRMGC_StudentPhotoPath || '',
            ivrmgC_StaffPhotoPath: values.IVRMGC_StaffPhotoPath || '',
            ivrmgC_ComTrasaNoFlag: values.IVRMGC_ComTrasaNoFlag,
            ivrmgC_SMSDomain: values.IVRMGC_SMSDomain || '',
            ivrmgC_SMSURL: values.IVRMGC_SMSURL || '',
            ivrmgC_SMSUserName: values.IVRMGC_SMSUserName || '',
            ivrmgC_SMSPassword: values.IVRMGC_SMSPassword || '',
            ivrmgC_SMSSenderId: values.IVRMGC_SMSSenderId || '',
            ivrmgC_SMSWorkingKey: values.IVRMGC_SMSWorkingKey || '',
            ivrmgC_SMSFooter: values.IVRMGC_SMSFooter || '',
            ivrmgC_SMSActiveFlag: values.IVRMGC_SMSActiveFlag,
            ivrmgC_emailUserName: values.IVRMGC_emailUserName || '',
            ivrmgC_emailPassword: values.IVRMGC_emailPassword || '',
            ivrmgC_HostName: values.IVRMGC_HostName || '',
            ivrmgC_PortNo: Number(values.IVRMGC_PortNo) || 0,
            ivrmgC_MailGenralDesc: values.IVRMGC_MailGenralDesc || '',
            ivrmgC_Webiste: values.IVRMGC_Webiste || '',
            ivrmgC_emailid: values.IVRMGC_emailUserName || '',
            ivrmgC_emailFooter: values.IVRMGC_MailGenralDesc || '',
            ivrmgC_CCMail: values.IVRMGC_CCMail || '',
            ivrmgC_BCCMail: values.IVRMGC_BCCMail || '',
            ivrmgC_ToMail: '',
            ivrmgC_EmailActiveFlag: values.IVRMGC_EmailActiveFlag,
            ivrmgC_Pagination: Number(values.IVRMGC_Pagination) || 0,
            ivrmgC_PagePagination: Number(values.IVRMGC_PagePagination) || 0,
            ivrmgC_ReportPagination: Number(values.IVRMGC_ReportPagination) || 0,
            ivrmgC_ReminderDays: Number(values.IVRMGC_ReminderDays) || 0,
            ivrmgC_ClassCapacity: Number(values.IVRMGC_ClassCapacity) || 0,
            ivrmgC_SectionCapacity: Number(values.IVRMGC_SectionCapacity) || 0,
            ivrmgC_SCLockingPeriod: Number(values.IVRMGC_SCLockingPeriod) || 0,
            ivrmgC_FPLockingPeriod: Number(values.IVRMGC_FPLockingPeriod) || 0,
            ivrmgC_SCActive: values.IVRMGC_SCActive,
            ivrmgC_FPActive: values.IVRMGC_FPActive,
            ivrmgC_OnlineFPActive: values.IVRMGC_OnlineFPActive,
            ivrmgC_FaceReaderActive: values.IVRMGC_FaceReaderActive,
            ivrmgC_DefaultStudentSelection: values.IVRMGC_DefaultStudentSelection,
            ivrmgC_AdmnoColumnDisplay: values.IVRMGC_AdmnoColumnDisplay,
            ivrmgC_RegnoColumnDisplay: values.regno,
            ivrmgC_RollnoColumnDisplay: values.rolno,
            ivrmgC_Disclaimer: values.IVRMGC_Disclaimer || '',
            ivrmgC_PrincipalSign: values.IVRMGC_PrincipalSign || '',
            ivrmgC_ManagerSign: values.IVRMGC_ManagerSign || '',
            ivrmgC_AdmNo_RegNo_RollNo_DefaultFlag: values.IVRMGC_AdmNo_RegNo_RollNo_DefaultFlag || 'ADMNO',
            ivrmgC_CatLogoFlg: values.IVRMGC_CatLogoFlg,
            ivrmgC_TransportRequired: values.IVRMGC_TransportRequired ? 1 : 0,
            ivrmgC_OTPMobileNo: Number(values.IVRMGC_OTPMobileNo) || 0,
            ivrmgC_OTPMailId: values.IVRMGC_OTPMailId || '',
            ivrmgC_Classwise_Payment: values.IVRMGC_Classwise_Payment || '0',
            ivrmgC_APIOrSMTPFlg: values.IVRMGC_APIOrSMTPFlg || 'SMTP',
            ivrmgC_SendGrid_Key: values.IVRMGC_SendGrid_Key || '',
            ivrmgC_SportsPointsDropdownFlg: values.IVRMGC_SportsPointsDropdownFlg,
            ivrmgC_EnableWhatsappFlg: values.IVRMGC_EnableWhatsappFlg,
            ivrmgC_EnableQRCodeFlg: values.IVRMGC_EnableQRCodeFlg,
            ivrmgC_StudentDataChangeAlertFlg: values.IVRMGC_StudentDataChangeAlertFlg,
            ivrmgC_StudentDataChangeAlertDays: Number(values.IVRMGC_StudentDataChangeAlertDays) || 0,
            ivrmgC_PasswordExpiryDuration: Number(values.IVRMGC_PasswordExpiryDuration) || 0,
            ivrmgC_AttendanceShortageAlertFlg: values.IVRMGC_AttendanceShortageAlertFlg,
            ivrmgC_AttShortageAlertDays: Number(values.IVRMGC_AttShortageAlertDays) || 0,
            ivrmgC_AttendanceShortagePercent: 75,
            ivrmgC_StudentLoginCred: values.IVRMGC_StudentLoginCred ? 1 : 0,
            ivrmgC_FatherLoginCred: values.IVRMGC_FatherLoginCred ? 1 : 0,
            ivrmgC_MotherLoginCred: values.IVRMGC_MotherLoginCred ? 1 : 0,
            ivrmgC_GuardianLoginCred: values.IVRMGC_GuardianLoginCred ? 1 : 0,
            ivrmgC_AutoCreateStudentCredFlg: autoCreateCred ? 1 : 0,
            ivrmgC_UserNameOptionsFlg: values.IVRMGC_UserNameOptionsFlg || 'Custom',
            ivrmgC_EnableSUBTSTUIntFlg: values.IVRMGC_EnableSUBTSTUIntFlg,
            ivrmgC_EnableSTSUBTIntFlg: values.IVRMGC_EnableSTSUBTIntFlg,
            ivrmgC_EnableCTSTIntFlg: values.IVRMGC_EnableCTSTIntFlg,
            ivrmgC_EnableSTCTIntFlg: values.IVRMGC_EnableSTCTIntFlg,
            ivrmgC_EnableHODSTIntFlg: values.IVRMGC_EnableHODSTIntFlg,
            ivrmgC_EnableSTHODIntFlg: values.IVRMGC_EnableSTHODIntFlg,
            ivrmgC_EnablePrincipalSTIntFlg: values.IVRMGC_EnablePrincipalSTIntFlg,
            ivrmgC_EnableSTPrincipalIntFlg: values.IVRMGC_EnableSTPrincipalIntFlg,
            ivrmgC_EnableASSTIntFlg: values.IVRMGC_EnableASSTIntFlg,
            ivrmgC_EnableSTASIntFlg: values.IVRMGC_EnableSTASIntFlg,
            ivrmgC_EnableECSTIntFlg: values.IVRMGC_EnableECSTIntFlg,
            ivrmgC_EnableSTECIntFlg: values.IVRMGC_EnableSTECIntFlg,
            ivrmgC_GMRDTOALLFlg: values.IVRMGC_GMRDTOALLFlg,
            ivrmgC_EnableStaffwiseIntFlg: values.IVRMGC_EnableStaffwiseIntFlg,
            pageids: values.pagecontentlist.map((p) => ({
                ivrmP_Id: p.IVRMP_Id,
                ivrmimP_DisplayContent: p.IVRMIMP_DisplayContent,
                IVRMMP_PageName: p.IVRMMP_PageName
            })),
            usernameConfig:
                values.IVRMGC_UserNameOptionsFlg === 'Custom'
                    ? values.usernamearray.map((u) => ({
                          ivrmcunP_Id: 0,
                          ivrmcunP_Field: u.IVRMCUNP_Field,
                          ivrmcunP_Length: Number.parseInt(u.IVRMCUNP_Length) || 0,
                          ivrmcunP_FromOrderFlg: u.IVRMCUNP_FromOrderFlg,
                          ivrmcunP_Order: Number.parseInt(u.IVRMCUNP_Order) || 0
                      }))
                    : []
        };
        saveMutation.mutate(payload);
    };

    const handleClear = () => {
        reset();
        setEditId(null);
        window.location.reload();
    };

    const [selectedPageId, setSelectedPageId] = useState<number | null>(null);
    const [pageContent, setPageContent] = useState('');

    const handleAddPage = () => {
        if (selectedPageId && pageContent) {
            const page = pagelist?.find((p) => p.ivrmP_Id === selectedPageId);
            if (page) {
                appendPage({
                    IVRMP_Id: selectedPageId,
                    IVRMIMP_DisplayContent: pageContent,
                    IVRMMP_PageName: page.ivrmmP_PageName
                });
                setPageContent('');
                setSelectedPageId(null);
            }
        }
    };

    const handlePrincipalSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Implement image upload logic handling if needed
        const file = e.target.files?.[0];
        if (file) {
            // Usually requires form data post to an endpoint, then saving string path
            console.log('File selected:', file.name);
        }
    };

    const handleManagerSignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Implement image upload logic handling if needed
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name);
        }
    };

    return (
        <Card className='shadow-sm'>
            <CardHeader className='border-b bg-slate-50/50'>
                <CardTitle>{editId ? 'Edit General Configuration' : 'General Configuration'}</CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                        <div className='grid grid-cols-1 items-start gap-6 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-6'>
                                {/* OTP Settings */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>OTP SETTINGS</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='mobile_otp'
                                                checked={watch('IVRMGC_MobileValOTPFlag')}
                                                onCheckedChange={(c) => setValue('IVRMGC_MobileValOTPFlag', c as boolean)}
                                            />
                                            <Label htmlFor='mobile_otp' className='cursor-pointer font-normal'>
                                                Mobile OTP Applicable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='email_otp'
                                                checked={watch('IVRMGC_emailValOTPFlag')}
                                                onCheckedChange={(c) => setValue('IVRMGC_emailValOTPFlag', c as boolean)}
                                            />
                                            <Label htmlFor='email_otp' className='cursor-pointer font-normal'>
                                                Email OTP Applicable
                                            </Label>
                                        </div>
                                        {watch('IVRMGC_MobileValOTPFlag') && (
                                            <div className='space-y-2'>
                                                <Label>
                                                    Mobile No. For OTP <span className='text-destructive'>*</span>
                                                </Label>
                                                <Input {...register('IVRMGC_OTPMobileNo')} maxLength={10} />
                                                {errors.IVRMGC_OTPMobileNo && (
                                                    <p className='text-destructive text-sm'>{errors.IVRMGC_OTPMobileNo.message}</p>
                                                )}
                                            </div>
                                        )}
                                        {watch('IVRMGC_emailValOTPFlag') && (
                                            <div className='space-y-2'>
                                                <Label>
                                                    Email Id For OTP <span className='text-destructive'>*</span>
                                                </Label>
                                                <Input {...register('IVRMGC_OTPMailId')} type='email' />
                                                {errors.IVRMGC_OTPMailId && (
                                                    <p className='text-destructive text-sm'>{errors.IVRMGC_OTPMailId.message}</p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* QRCode / WhatsApp Settings */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>QRCode/Whatsapp Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='qrcode_en'
                                                checked={watch('IVRMGC_EnableQRCodeFlg')}
                                                onCheckedChange={(c) => setValue('IVRMGC_EnableQRCodeFlg', c as boolean)}
                                            />
                                            <Label htmlFor='qrcode_en' className='cursor-pointer font-normal'>
                                                QRCode Enable
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='whatsapp_en'
                                                checked={watch('IVRMGC_EnableWhatsappFlg')}
                                                onCheckedChange={(c) => setValue('IVRMGC_EnableWhatsappFlg', c as boolean)}
                                            />
                                            <Label htmlFor='whatsapp_en' className='cursor-pointer font-normal'>
                                                Whatsapp Enable
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Photos Path Settings */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>PHOTOS PATH SETTINGS</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>Student Photo Path:</Label>
                                            <div className='col-span-2'>
                                                <Input {...register('IVRMGC_StudentPhotoPath')} />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>Staff Photo Path:</Label>
                                            <div className='col-span-2'>
                                                <Input {...register('IVRMGC_StaffPhotoPath')} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* SMS & Email Settings */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>SMS AND EMAIL SETTINGS</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        {[
                                            { name: 'IVRMGC_SMSDomain', label: 'SMS Domain', required: true },
                                            { name: 'IVRMGC_SMSURL', label: 'SMS Url', required: true },
                                            { name: 'IVRMGC_SMSUserName', label: 'SMS Username', required: true },
                                            { name: 'IVRMGC_SMSPassword', label: 'SMS Password', required: true, type: 'password' },
                                            { name: 'IVRMGC_SMSSenderId', label: 'SMS Sender ID', required: true },
                                            { name: 'IVRMGC_SMSWorkingKey', label: 'SMS Working Key', required: true },
                                            { name: 'IVRMGC_SMSFooter', label: 'SMS Footer', required: false }
                                        ].map((field) => (
                                            <div key={field.name} className='grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    {field.label}
                                                    {field.required && <span className='text-destructive'>*</span>}
                                                </Label>
                                                <div className='col-span-2 space-y-1'>
                                                    <Input {...register(field.name as any)} type={field.type || 'text'} />
                                                    {errors[field.name as keyof GenConfigFormValues] && (
                                                        <p className='text-destructive text-xs'>
                                                            {errors[field.name as keyof GenConfigFormValues]?.message as string}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div className='flex items-center space-x-2 py-2 pl-4'>
                                            <Checkbox
                                                id='sms_active'
                                                checked={watch('IVRMGC_SMSActiveFlag')}
                                                onCheckedChange={(c) => setValue('IVRMGC_SMSActiveFlag', c as boolean)}
                                            />
                                            <Label htmlFor='sms_active' className='cursor-pointer font-normal'>
                                                SMS ActiveFlag
                                            </Label>
                                        </div>

                                        <hr className='my-4' />

                                        {[
                                            { name: 'IVRMGC_emailUserName', label: 'Email Username', required: true },
                                            { name: 'IVRMGC_emailPassword', label: 'Email Password', required: true, type: 'password' },
                                            { name: 'IVRMGC_HostName', label: 'Host Name', required: true },
                                            { name: 'IVRMGC_PortNo', label: 'Port No', required: true },
                                            { name: 'IVRMGC_MailGenralDesc', label: 'Mail General Description', required: false },
                                            { name: 'IVRMGC_Webiste', label: 'Website', required: false }
                                        ].map((field) => (
                                            <div key={field.name} className='grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    {field.label}
                                                    {field.required && <span className='text-destructive'>*</span>}
                                                </Label>
                                                <div className='col-span-2 space-y-1'>
                                                    <Input {...register(field.name as any)} type={field.type || 'text'} />
                                                    {errors[field.name as keyof GenConfigFormValues] && (
                                                        <p className='text-destructive text-xs'>
                                                            {errors[field.name as keyof GenConfigFormValues]?.message as string}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>Principal Signature:</Label>
                                            <div className='col-span-2 flex items-center space-x-2'>
                                                <Input type='file' onChange={handlePrincipalSignUpload} className='cursor-pointer' />
                                                {watch('IVRMGC_PrincipalSign') && (
                                                    <span className='cursor-pointer font-semibold text-blue-600 text-sm'>View</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>Manager Signature:</Label>
                                            <div className='col-span-2 flex items-center space-x-2'>
                                                <Input type='file' onChange={handleManagerSignUpload} className='cursor-pointer' />
                                                {watch('IVRMGC_ManagerSign') && (
                                                    <span className='cursor-pointer font-semibold text-blue-600 text-sm'>View</span>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Default Combo Selection */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>
                                            Default Combo Selection <span className='text-destructive'>*</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <FormField
                                            control={form.control}
                                            name='IVRMGC_AdmNo_RegNo_RollNo_DefaultFlag'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className='grid grid-cols-2 gap-4'>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='1' id='c1' />
                                                                <Label htmlFor='c1' className='cursor-pointer font-medium'>
                                                                    NAME : ADMNO
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='2' id='c2' />
                                                                <Label htmlFor='c2' className='cursor-pointer font-medium'>
                                                                    REGNO : NAME
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='3' id='c3' />
                                                                <Label htmlFor='c3' className='cursor-pointer font-medium'>
                                                                    ADMNO : NAME
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='4' id='c4' />
                                                                <Label htmlFor='c4' className='cursor-pointer font-medium'>
                                                                    NAME : REGNO
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='5' id='c5' />
                                                                <Label htmlFor='c5' className='cursor-pointer font-medium'>
                                                                    NAME : ROLLNO
                                                                </Label>
                                                            </div>
                                                            <div className='flex items-center space-x-2 rounded border bg-slate-50 p-3'>
                                                                <RadioGroupItem value='6' id='c6' />
                                                                <Label htmlFor='c6' className='cursor-pointer font-medium'>
                                                                    ROLLNO : NAME
                                                                </Label>
                                                            </div>
                                                        </RadioGroup>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-6'>
                                {/* General Registration Settings */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>General Registration Settings</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        {[
                                            { name: 'IVRMGC_CCMail', label: 'Cc Mail Id' },
                                            { name: 'IVRMGC_BCCMail', label: 'Bcc Mail Id' },
                                            { name: 'IVRMGC_SendGrid_Key', label: 'SendGrid Id', required: true }
                                        ].map((field) => (
                                            <div key={field.name} className='grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    {field.label}
                                                    {field.required && <span className='text-destructive'>*</span>}
                                                </Label>
                                                <div className='col-span-2 space-y-1'>
                                                    <Input {...register(field.name as any)} />
                                                    {errors[field.name as keyof GenConfigFormValues] && (
                                                        <p className='text-destructive text-xs'>
                                                            {errors[field.name as keyof GenConfigFormValues]?.message as string}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        <div className='flex items-center space-x-2 py-2 pl-4'>
                                            <Checkbox
                                                id='email_active'
                                                checked={watch('IVRMGC_EmailActiveFlag')}
                                                onCheckedChange={(c) => setValue('IVRMGC_EmailActiveFlag', c as boolean)}
                                            />
                                            <Label htmlFor='email_active' className='cursor-pointer font-normal'>
                                                Email Active Flag
                                            </Label>
                                        </div>

                                        {[
                                            { name: 'IVRMGC_Pagination', label: 'Pagination', required: true },
                                            { name: 'IVRMGC_PagePagination', label: 'Page Pagination', required: true },
                                            { name: 'IVRMGC_ReportPagination', label: 'Report Pagination', required: true },
                                            { name: 'IVRMGC_ReminderDays', label: 'Reminder Days For Email', required: true },
                                            { name: 'IVRMGC_ClassCapacity', label: 'Class Capacity', required: false },
                                            { name: 'IVRMGC_SectionCapacity', label: 'Section Capacity', required: true }
                                        ].map((field) => (
                                            <div key={field.name} className='grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    {field.label}
                                                    {field.required && <span className='text-destructive'>*</span>}
                                                </Label>
                                                <div className='col-span-2 space-y-1'>
                                                    <Input {...register(field.name as any)} type='number' min='1' max='15000' />

                                                    {errors[field.name as keyof GenConfigFormValues] && (
                                                        <p className='text-destructive text-xs'>
                                                            {errors[field.name as keyof GenConfigFormValues]?.message as string}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* General Scheduling */}
                                <Card>
                                    <CardHeader className='py-3'>
                                        <CardTitle className='text-base text-primary'>General Scheduling</CardTitle>
                                    </CardHeader>
                                    <CardContent className='space-y-4'>
                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>SC Locking Period:</Label>
                                            <div className='col-span-2'>
                                                <Input {...register('IVRMGC_SCLockingPeriod')} type='number' min='0' max='200' />
                                            </div>
                                        </div>
                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>FP Locking Period:</Label>
                                            <div className='col-span-2'>

                                                

                                                <Input {...register('IVRMGC_FPLockingPeriod')} type='number' min='1' max='200' />
                                                

                                            </div>
                                            
                                        </div>
                                        <div className='grid grid-cols-3 items-center gap-4'>
                                            <Label className='text-right'>Print Footer:</Label>
                                            <div className='col-span-2'>
                                                <Input {...register('IVRMGC_Disclaimer')} maxLength={80} />
                                            </div>
                                        </div>

                                        <div className='mt-4 grid grid-cols-2 gap-4 rounded border bg-slate-50 p-4'>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='com_tran'
                                                    checked={watch('IVRMGC_ComTrasaNoFlag')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_ComTrasaNoFlag', c as boolean)}
                                                />
                                                <Label htmlFor='com_tran' className='cursor-pointer font-normal'>
                                                    Common Transaction Type
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='sc_act'
                                                    checked={watch('IVRMGC_SCActive')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_SCActive', c as boolean)}
                                                />
                                                <Label htmlFor='sc_act' className='cursor-pointer font-normal'>
                                                    SC Active
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='fp_act'
                                                    checked={watch('IVRMGC_FPActive')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_FPActive', c as boolean)}
                                                />
                                                <Label htmlFor='fp_act' className='cursor-pointer font-normal'>
                                                    FP Active
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='ofp_act'
                                                    checked={watch('IVRMGC_OnlineFPActive')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_OnlineFPActive', c as boolean)}
                                                />
                                                <Label htmlFor='ofp_act' className='cursor-pointer font-normal'>
                                                    Online FP Active
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='fra_act'
                                                    checked={watch('IVRMGC_FaceReaderActive')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_FaceReaderActive', c as boolean)}
                                                />
                                                <Label htmlFor='fra_act' className='cursor-pointer font-normal'>
                                                    Face ReaderActive
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='def_stu'
                                                    checked={watch('IVRMGC_DefaultStudentSelection')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_DefaultStudentSelection', c as boolean)}
                                                />
                                                <Label htmlFor='def_stu' className='cursor-pointer font-normal'>
                                                    Default StudentSelection
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id='trns_req'
                                                    checked={watch('IVRMGC_TransportRequired')}
                                                    onCheckedChange={(c) => setValue('IVRMGC_TransportRequired', c as boolean)}
                                                />
                                                <Label htmlFor='trns_req' className='cursor-pointer font-normal'>
                                                    Transport Required
                                                </Label>
                                            </div>
                                        </div>

                                        {/* Default Column Display nested inside General Scheduling per original design flow */}
                                        <div className='mt-6'>
                                            <h4 className='mb-3 font-semibold text-primary text-sm'>
                                                Default Column Display <span className='text-destructive'>*</span>
                                            </h4>
                                            <div className='mb-4 grid grid-cols-2 gap-4 rounded border bg-slate-50 p-4'>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='adm_col'
                                                        checked={watch('IVRMGC_AdmnoColumnDisplay')}
                                                        onCheckedChange={(c) => setValue('IVRMGC_AdmnoColumnDisplay', c as boolean)}
                                                    />
                                                    <Label htmlFor='adm_col' className='cursor-pointer font-normal text-xs'>
                                                        AdmissionNo Coloumn Display
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='reg_col'
                                                        checked={watch('regno')}
                                                        onCheckedChange={(c) => setValue('regno', c as boolean)}
                                                    />
                                                    <Label htmlFor='reg_col' className='cursor-pointer font-normal text-xs'>
                                                        RegNo Coloumn Display
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='cat_col'
                                                        checked={watch('IVRMGC_CatLogoFlg')}
                                                        onCheckedChange={(c) => setValue('IVRMGC_CatLogoFlg', c as boolean)}
                                                    />
                                                    <Label htmlFor='cat_col' className='cursor-pointer font-normal text-xs'>
                                                        Category Coloumn Display
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='roll_col'
                                                        checked={watch('rolno')}
                                                        onCheckedChange={(c) => setValue('rolno', c as boolean)}
                                                    />
                                                    <Label htmlFor='roll_col' className='cursor-pointer font-normal text-xs'>
                                                        RollNo Coloumn Display
                                                    </Label>
                                                </div>
                                            </div>

                                            <div className='mb-4 grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    Classwise Payment:<span className='text-destructive'>*</span>
                                                </Label>
                                                <div className='col-span-2'>
                                                    <FormField
                                                        control={form.control}
                                                        name='IVRMGC_Classwise_Payment'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='1'>YES</SelectItem>
                                                                        <SelectItem value='0'>NO</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className='mb-4 grid grid-cols-3 items-center gap-4'>
                                                <Label className='text-right'>
                                                    EMAIL TYPE:<span className='text-destructive'>*</span>
                                                </Label>
                                                <div className='col-span-2'>
                                                    <FormField
                                                        control={form.control}
                                                        name='IVRMGC_APIOrSMTPFlg'
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder='--Select--' />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value='API'>API</SelectItem>
                                                                        <SelectItem value='SMTP'>SMTP</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className='grid grid-cols-3 items-center gap-4'>
                                                <Label className='pt-2 text-right'>Sports Point :</Label>
                                                <div className='col-span-2 flex items-center space-x-2 rounded border bg-slate-50 p-2'>
                                                    <Checkbox
                                                        id='sp_dp'
                                                        checked={watch('IVRMGC_SportsPointsDropdownFlg')}
                                                        onCheckedChange={(c) => setValue('IVRMGC_SportsPointsDropdownFlg', c as boolean)}
                                                    />
                                                    <Label htmlFor='sp_dp' className='cursor-pointer font-normal'>
                                                        DropDown Flag
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Interaction Configuration */}
                        <Card>
                            <CardHeader className='py-3'>
                                <CardTitle className='text-base text-primary'>Interaction Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-4 rounded border bg-slate-50 p-4 md:grid-cols-2'>
                                    {[
                                        {
                                            id: 'subt_stu',
                                            model: 'IVRMGC_EnableSUBTSTUIntFlg',
                                            label: 'Subject Teacher Interaction with Student'
                                        },
                                        {
                                            id: 'stu_subt',
                                            model: 'IVRMGC_EnableSTSUBTIntFlg',
                                            label: 'Student Interaction with the Subject Teacher',
                                            disabledBy: 'IVRMGC_EnableSUBTSTUIntFlg'
                                        },
                                        { id: 'ct_stu', model: 'IVRMGC_EnableCTSTIntFlg', label: 'Class Teacher Interaction with Student' },
                                        {
                                            id: 'stu_ct',
                                            model: 'IVRMGC_EnableSTCTIntFlg',
                                            label: 'Student Interaction with the Class Teacher',
                                            disabledBy: 'IVRMGC_EnableCTSTIntFlg'
                                        },
                                        { id: 'hod_stu', model: 'IVRMGC_EnableHODSTIntFlg', label: 'HOD Interaction with Student' },
                                        {
                                            id: 'stu_hod',
                                            model: 'IVRMGC_EnableSTHODIntFlg',
                                            label: 'Student Interaction with the HOD',
                                            disabledBy: 'IVRMGC_EnableHODSTIntFlg'
                                        },
                                        {
                                            id: 'prin_stu',
                                            model: 'IVRMGC_EnablePrincipalSTIntFlg',
                                            label: 'Principal Interaction with Student'
                                        },
                                        {
                                            id: 'stu_prin',
                                            model: 'IVRMGC_EnableSTPrincipalIntFlg',
                                            label: 'Student Interaction with the Principal',
                                            disabledBy: 'IVRMGC_EnablePrincipalSTIntFlg'
                                        },
                                        {
                                            id: 'as_stu',
                                            model: 'IVRMGC_EnableASSTIntFlg',
                                            label: 'Academic Supervisor Interaction with Student'
                                        },
                                        {
                                            id: 'stu_as',
                                            model: 'IVRMGC_EnableSTASIntFlg',
                                            label: 'Student Interaction with the Academic Supervisor',
                                            disabledBy: 'IVRMGC_EnableASSTIntFlg'
                                        },
                                        {
                                            id: 'ec_stu',
                                            model: 'IVRMGC_EnableECSTIntFlg',
                                            label: 'Exam Co-ordinator Interaction with Student'
                                        },
                                        {
                                            id: 'stu_ec',
                                            model: 'IVRMGC_EnableSTECIntFlg',
                                            label: 'Student Interaction with the Exam Co-ordinator',
                                            disabledBy: 'IVRMGC_EnableECSTIntFlg'
                                        },
                                        {
                                            id: 'gmrd_all',
                                            model: 'IVRMGC_GMRDTOALLFlg',
                                            label: 'Display the response given to the group message to all in the group.'
                                        },
                                        {
                                            id: 'staff_int',
                                            model: 'IVRMGC_EnableStaffwiseIntFlg',
                                            label: 'Enable Staff to Staff Interaction'
                                        }
                                    ].map((item) => (
                                        <div key={item.id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={item.id}
                                                checked={watch(item.model as keyof GenConfigFormValues) as boolean}
                                                onCheckedChange={(c) => setValue(item.model as any, c as boolean)}
                                                disabled={item.disabledBy ? !watch(item.disabledBy as keyof GenConfigFormValues) : false}
                                            />
                                            <Label
                                                htmlFor={item.id}
                                                className={`cursor-pointer font-normal text-sm ${item.disabledBy && !watch(item.disabledBy as keyof GenConfigFormValues) ? 'text-muted-foreground' : ''}`}>
                                                {item.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Miscellaneous Settings Group */}
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                            {/* Student Update Request */}
                            <Card>
                                <CardHeader className='py-3'>
                                    <CardTitle className='text-base text-primary'>Student Update Request</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='stu_upd'
                                            checked={watch('IVRMGC_StudentDataChangeAlertFlg')}
                                            onCheckedChange={(c) => setValue('IVRMGC_StudentDataChangeAlertFlg', c as boolean)}
                                        />
                                        <Label htmlFor='stu_upd' className='cursor-pointer font-normal'>
                                            Student Request for Change Data.
                                        </Label>
                                    </div>
                                    {watch('IVRMGC_StudentDataChangeAlertFlg') && (
                                        <div className='space-y-2'>
                                            <Label>
                                                Alert Days <span className='text-destructive'>*</span>
                                            </Label>
                                            <Input {...register('IVRMGC_StudentDataChangeAlertDays')} type='number' />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Password Expiry */}
                            <Card>
                                <CardHeader className='py-3'>
                                    <CardTitle className='text-base text-primary'>Password Expiry</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Password Expiry Days:</Label>
                                        <Input {...register('IVRMGC_PasswordExpiryDuration')} type='number' min='1' maxLength={4} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shortage of Attendance */}
                            <Card>
                                <CardHeader className='py-3'>
                                    <CardTitle className='text-base text-primary'>Shortage of Attendance</CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox
                                            id='att_short'
                                            checked={watch('IVRMGC_AttendanceShortageAlertFlg')}
                                            onCheckedChange={(c) => setValue('IVRMGC_AttendanceShortageAlertFlg', c as boolean)}
                                        />
                                        <Label htmlFor='att_short' className='cursor-pointer font-normal'>
                                            Attendance Shortage Alert.
                                        </Label>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Alert Days:</Label>
                                        <Input {...register('IVRMGC_AttShortageAlertDays')} type='number' min='0' maxLength={3} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Pagewise Content */}
                        <Card>
                            <CardHeader className='py-3'>
                                <CardTitle className='text-base text-primary'>Pagewise Content</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex flex-col items-end gap-4 rounded border bg-slate-50 p-4 md:flex-row'>
                                    <div className='w-full flex-1 space-y-2'>
                                        <Label>Page Name</Label>
                                        <Select
                                            value={selectedPageId?.toString() || ''}
                                            onValueChange={(val) => setSelectedPageId(Number(val))}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select a page' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pagelist?.map((page) => (
                                                    <SelectItem key={page.ivrmP_Id} value={page.ivrmP_Id.toString()}>
                                                        {page.ivrmmP_PageName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='w-full flex-1 space-y-2'>
                                        <Label>Content</Label>
                                        <Input
                                            value={pageContent}
                                            onChange={(e) => setPageContent(e.target.value)}
                                            placeholder='Enter display content'
                                        />
                                    </div>
                                    <Button type='button' onClick={handleAddPage} className='min-w-[100px]'>
                                        <Plus className='mr-2 h-4 w-4' /> ADD
                                    </Button>
                                </div>

                                {pageFields.length > 0 && (
                                    <div className='mt-4 overflow-hidden rounded-md border'>
                                        <table className='w-full text-sm'>
                                            <thead className='bg-slate-100'>
                                                <tr>
                                                    <th className='p-3 text-left font-semibold'>SL. NO.</th>
                                                    <th className='p-3 text-left font-semibold'>PAGE NAME</th>
                                                    <th className='p-3 text-left font-semibold'>CONTENT</th>
                                                    <th className='p-3 text-center font-semibold'>ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pageFields.map((field, index) => (
                                                    <tr key={field.id} className='border-t'>
                                                        <td className='p-3'>{index + 1}</td>
                                                        <td className='p-3'>{field.IVRMMP_PageName}</td>
                                                        <td className='p-3'>{field.IVRMIMP_DisplayContent}</td>
                                                        <td className='p-3 text-center'>
                                                            <Button
                                                                type='button'
                                                                variant='ghost'
                                                                size='icon'
                                                                onClick={() => removePage(index)}>
                                                                <Trash2 className='h-4 w-4 text-destructive' />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Username Custom Setting */}
                        <Card>
                            <CardHeader className='py-3'>
                                <CardTitle className='text-base text-primary'>Username Custom Setting</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='space-y-4 rounded border bg-slate-50 p-4'>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='cred_stu'
                                                checked={watch('IVRMGC_StudentLoginCred')}
                                                onCheckedChange={(c) => setValue('IVRMGC_StudentLoginCred', c as boolean)}
                                            />
                                            <Label htmlFor='cred_stu' className='cursor-pointer font-normal'>
                                                Create Student Credential
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='cred_fat'
                                                checked={watch('IVRMGC_FatherLoginCred')}
                                                onCheckedChange={(c) => setValue('IVRMGC_FatherLoginCred', c as boolean)}
                                            />
                                            <Label htmlFor='cred_fat' className='cursor-pointer font-normal'>
                                                Create Father Credential
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='cred_mot'
                                                checked={watch('IVRMGC_MotherLoginCred')}
                                                onCheckedChange={(c) => setValue('IVRMGC_MotherLoginCred', c as boolean)}
                                            />
                                            <Label htmlFor='cred_mot' className='cursor-pointer font-normal'>
                                                Create Mother Credential
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='cred_gua'
                                                checked={watch('IVRMGC_GuardianLoginCred')}
                                                onCheckedChange={(c) => setValue('IVRMGC_GuardianLoginCred', c as boolean)}
                                            />
                                            <Label htmlFor='cred_gua' className='cursor-pointer font-normal'>
                                                Create Guardian Credential
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <Checkbox
                                                id='cred_auto'
                                                checked={watch('IVRMGC_AutoCreateStudentCredFlg')}
                                                onCheckedChange={(c) => setValue('IVRMGC_AutoCreateStudentCredFlg', c as boolean)}
                                            />
                                            <Label htmlFor='cred_auto' className='cursor-pointer font-normal'>
                                                Auto Credential
                                            </Label>
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <div className='flex items-center gap-4'>
                                            <Label className='w-1/3'>
                                                User Name Options: <span className='text-destructive'>*</span>
                                            </Label>
                                            <FormField
                                                control={form.control}
                                                name='IVRMGC_UserNameOptionsFlg'
                                                render={({ field }) => (
                                                    <FormItem className='w-2/3'>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='Select' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value='EmailId'>Email Id</SelectItem>
                                                                <SelectItem value='MobileNo'>Mobile Number</SelectItem>
                                                                <SelectItem value='Custom'>Custom</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {watch('IVRMGC_UserNameOptionsFlg') === 'Custom' && (
                                            <div className='mt-4 overflow-hidden rounded-md border'>
                                                <table className='w-full text-sm'>
                                                    <thead className='bg-slate-100'>
                                                        <tr>
                                                            <th className='p-2 text-left'>SL.NO</th>
                                                            <th className='p-2 text-left'>Field</th>
                                                            <th className='p-2 text-left'>Length</th>
                                                            <th className='p-2 text-left'>Length Position</th>
                                                            <th className='p-2 text-left'>Order</th>
                                                            <th className='p-2 text-center'>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {userFields.map((field, index) => (
                                                            <tr key={field.id} className='border-t'>
                                                                <td className='p-2'>{index + 1}</td>
                                                                <td className='min-w-[150px] p-2'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`usernamearray.${index}.IVRMCUNP_Field`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                                    <SelectTrigger className='h-8 text-xs'>
                                                                                        <SelectValue placeholder='Select' />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value='Name'>Name</SelectItem>
                                                                                        <SelectItem value='AdmnissionNo'>
                                                                                            Admnission No
                                                                                        </SelectItem>
                                                                                        <SelectItem value='EmailId'>Email Id</SelectItem>
                                                                                        <SelectItem value='RegistrationNo'>
                                                                                            Registration No
                                                                                        </SelectItem>
                                                                                        <SelectItem value='MobileNo'>Mobile No</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </td>
                                                                <td className='p-2'>
                                                                    <Input
                                                                        {...register(`usernamearray.${index}.IVRMCUNP_Length`)}
                                                                        className='h-8 text-xs'
                                                                    />
                                                                </td>
                                                                <td className='min-w-[120px] p-2'>
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`usernamearray.${index}.IVRMCUNP_FromOrderFlg`}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <Select onValueChange={field.onChange} value={field.value}>
                                                                                    <SelectTrigger className='h-8 text-xs'>
                                                                                        <SelectValue placeholder='Select' />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value='Start'>Start</SelectItem>
                                                                                        <SelectItem value='End'>End</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </td>
                                                                <td className='p-2'>
                                                                    <Input
                                                                        {...register(`usernamearray.${index}.IVRMCUNP_Order`)}
                                                                        className='h-8 text-xs'
                                                                    />
                                                                </td>
                                                                <td className='flex items-center justify-center space-x-1 p-2 text-center'>
                                                                    {index === userFields.length - 1 && userFields.length < 5 && (
                                                                        <Button
                                                                            type='button'
                                                                            variant='ghost'
                                                                            size='icon'
                                                                            className='h-8 w-8'
                                                                            onClick={() =>
                                                                                appendUser({
                                                                                    IVRMCUNP_Field: '',
                                                                                    IVRMCUNP_Length: '',
                                                                                    IVRMCUNP_FromOrderFlg: '',
                                                                                    IVRMCUNP_Order: ''
                                                                                })
                                                                            }>
                                                                            <Plus className='h-4 w-4' />
                                                                        </Button>
                                                                    )}
                                                                    {userFields.length > 1 && (
                                                                        <Button
                                                                            type='button'
                                                                            variant='ghost'
                                                                            size='icon'
                                                                            className='h-8 w-8 text-destructive'
                                                                            onClick={() => removeUser(index)}>
                                                                            <Trash2 className='h-4 w-4' />
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className='flex justify-center space-x-4 border-t pt-6'>
                            <Button type='submit' size='lg' disabled={saveMutation.isPending} className='min-w-[120px]'>
                                {saveMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type='button' size='lg' variant='destructive' onClick={handleClear} className='min-w-[120px]'>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
