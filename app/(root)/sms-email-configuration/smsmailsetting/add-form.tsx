'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useHeader, useModulePage, useParameter, useSaveSmsMailSetting } from '@/hooks/sms-email-configuration/useSmsMailSetting';
import type { SmsMailSettingDetailsResponse, SmsMailSettingInitialData } from '@/types/sms-email-configuration/sms-mail-setting';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    ISES_Id: z.number().optional(),
    IVRMIM_Id: z.coerce.number().min(1, { message: 'Select Module Name' }),
    IVRMIMP_Id: z.coerce.number().min(1, { message: 'Select Module Page Name' }),
    ISES_Template_Name: z.string().min(1, { message: 'Select Header Name' }),

    // SMS Settings
    ISES_TemplateId: z.string().optional(),
    ISES_SMSMessage: z.string().min(1, { message: 'Enter Message Body' }),
    ISES_SMSActiveFlag: z.boolean(),
    ISES_EnableSMSCCFlg: z.boolean().default(false),
    mobile_list_dto: z
        .array(
            z.object({
                hrmemnO_MobileNo: z
                    .string()
                    .regex(/^[6-9]\d{9}$/, 'Enter Valid Mobile number')
                    .optional()
                    .or(z.literal(''))
            })
        )
        .optional(),

    // Mail Settings
    ISMHTML_Id: z.coerce.number().optional(),
    ISES_MailSubject: z.string().min(1, { message: 'Enter Subject' }),
    ISES_MailHTMLTemplate: z.string().optional(),
    ISES_MailFooter: z.string().min(1, { message: 'Enter Mail Footer' }),
    ISES_MailActiveFlag: z.boolean(),
    filelist: z
        .array(
            z.object({
                cfilepath: z.string().optional(),
                cfilename: z.string().optional(),
                filetype: z.string().optional()
            })
        )
        .optional(),
    ISES_EnableMailCCFlg: z.boolean().default(false),
    email_list_dto: z
        .array(
            z.object({
                hrmeM_EmailId: z.string().email('Enter Valid Email').optional().or(z.literal(''))
            })
        )
        .optional(),
    ISES_EnableMailBCCFlg: z.boolean().default(false),
    email_list_dtocc: z
        .array(
            z.object({
                hrmeM_EmailId: z.string().email('Enter Valid Email').optional().or(z.literal(''))
            })
        )
        .optional(),

    // Other Settings
    ISES_IVRSTextMsg: z.string().optional(),
    ISES_IVRSVoiceFile: z.string().optional(),
    ISES_PNActiveFlg: z.boolean().default(false),
    ISES_AlertBeforeDays: z.string().optional(),
    ISES_PNMessage: z.string().optional(),
    roleids: z
        .array(
            z.object({
                ivrmrT_Id: z.number(),
                ivrmrT_Role: z.string(),
                empck: z.boolean().optional()
            })
        )
        .optional()
});

interface AddFormProps {
    initialData: SmsMailSettingInitialData | undefined;
    editData: SmsMailSettingDetailsResponse | undefined;
    onClear: () => void;
    onCancel: () => void;
}

export function AddForm({ initialData, editData, onClear, onCancel }: AddFormProps) {
    const [selectedModuleId, setSelectedModuleId] = useState<number>(0);
    const [selectedPageId, setSelectedPageId] = useState<number>(0);
    const [selectedHeaderId, setSelectedHeaderId] = useState<number>(0);

    const { data: modulePageData } = useModulePage(selectedModuleId);
    const { data: headerDataResponse } = useHeader(selectedModuleId, selectedPageId);
    const { data: parameterData } = useParameter(selectedHeaderId);

    const saveMutation = useSaveSmsMailSetting();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ISES_Id: 0,
            IVRMIM_Id: 0,
            IVRMIMP_Id: 0,
            ISES_Template_Name: '',
            ISES_SMSMessage: '',
            ISES_SMSActiveFlag: true,
            ISES_EnableSMSCCFlg: false,
            mobile_list_dto: [{ hrmemnO_MobileNo: '' }],
            ISMHTML_Id: 0,
            ISES_MailSubject: '',
            ISES_MailFooter: '',
            ISES_MailActiveFlag: true,
            filelist: [{ cfilepath: '', cfilename: '', filetype: '' }],
            ISES_EnableMailCCFlg: false,
            email_list_dto: [{ hrmeM_EmailId: '' }],
            ISES_EnableMailBCCFlg: false,
            email_list_dtocc: [{ hrmeM_EmailId: '' }],
            ISES_IVRSTextMsg: '',
            ISES_IVRSVoiceFile: '',
            ISES_PNActiveFlg: false,
            ISES_AlertBeforeDays: '',
            ISES_PNMessage: '',
            roleids: []
        }
    });

    const {
        fields: mobileFields,
        append: appendMobile,
        remove: removeMobile
    } = useFieldArray({
        control: form.control,
        name: 'mobile_list_dto'
    });

    const {
        fields: emailCCFields,
        append: appendEmailCC,
        remove: removeEmailCC
    } = useFieldArray({
        control: form.control,
        name: 'email_list_dto'
    });

    const {
        fields: emailBCCFields,
        append: appendEmailBCC,
        remove: removeEmailBCC
    } = useFieldArray({
        control: form.control,
        name: 'email_list_dtocc'
    });

    const {
        fields: fileFields,
        append: appendFile,
        remove: removeFile
    } = useFieldArray({
        control: form.control,
        name: 'filelist'
    });

    useEffect(() => {
        if (initialData?.rolelist) {
            form.setValue(
                'roleids',
                initialData.rolelist.map((r) => ({ ...r, empck: false }))
            );
        }
    }, [initialData, form]);

    useEffect(() => {
        if (editData && editData.emailSmsSettingList.length > 0) {
            const setting = editData.emailSmsSettingList[0];
            form.setValue('ISES_Id', setting.iseS_Id);
            form.setValue('IVRMIM_Id', setting.ivrmiM_Id);
            setSelectedModuleId(setting.ivrmiM_Id);

            setTimeout(() => {
                form.setValue('IVRMIMP_Id', setting.ivrmimP_Id);
                setSelectedPageId(setting.ivrmimP_Id);
            }, 500);

            setTimeout(() => {
                form.setValue('ISES_Template_Name', setting.iseS_Template_Name || '');
            }, 1000);

            form.setValue('ISES_TemplateId', setting.iseS_TemplateId || '');
            form.setValue('ISES_SMSMessage', setting.iseS_SMSMessage || '');
            form.setValue('ISES_SMSActiveFlag', setting.iseS_SMSActiveFlag);
            form.setValue('ISES_EnableSMSCCFlg', setting.iseS_EnableSMSCCFlg);

            if (setting.iseS_SMSCCMobileNo) {
                const mobiles = setting.iseS_SMSCCMobileNo.split(',').filter(Boolean);
                if (mobiles.length > 0) {
                    form.setValue(
                        'mobile_list_dto',
                        mobiles.map((m: string) => ({ hrmemnO_MobileNo: m }))
                    );
                }
            } else {
                form.setValue('mobile_list_dto', [{ hrmemnO_MobileNo: '' }]);
            }

            form.setValue('ISMHTML_Id', editData.ismhtmL_Id || 0);
            form.setValue('ISES_MailSubject', setting.iseS_MailSubject || '');
            form.setValue(
                'ISES_MailHTMLTemplate',
                setting.iseS_MailHTMLTemplate || setting.iseS_Mail_Message || setting.iseS_MailBody || ''
            );
            form.setValue('ISES_MailFooter', setting.iseS_MailFooter || '');
            form.setValue('ISES_MailActiveFlag', setting.iseS_MailActiveFlag);

            if (editData.editfiles && editData.editfiles.length > 0) {
                form.setValue('filelist', editData.editfiles);
            }

            form.setValue('ISES_EnableMailCCFlg', setting.iseS_EnableMailCCFlg);
            if (setting.iseS_MailCCId) {
                const emails = setting.iseS_MailCCId.split(',').filter(Boolean);
                if (emails.length > 0) {
                    form.setValue(
                        'email_list_dto',
                        emails.map((e: string) => ({ hrmeM_EmailId: e }))
                    );
                }
            } else {
                form.setValue('email_list_dto', [{ hrmeM_EmailId: '' }]);
            }

            form.setValue('ISES_EnableMailBCCFlg', setting.iseS_EnableMailBCCFlg);
            if (setting.iseS_MailBCCId) {
                const bcc = setting.iseS_MailBCCId.split(',').filter(Boolean);
                if (bcc.length > 0) {
                    form.setValue(
                        'email_list_dtocc',
                        bcc.map((e: string) => ({ hrmeM_EmailId: e }))
                    );
                }
            } else {
                form.setValue('email_list_dtocc', [{ hrmeM_EmailId: '' }]);
            }

            form.setValue('ISES_IVRSTextMsg', setting.iseS_IVRSTextMsg || '');
            form.setValue('ISES_IVRSVoiceFile', setting.iseS_IVRSVoiceFile || '');
            form.setValue('ISES_PNActiveFlg', setting.iseS_PNActiveFlg || false);
            form.setValue('ISES_AlertBeforeDays', setting.iseS_AlertBeforeDays || '');
            form.setValue('ISES_PNMessage', setting.iseS_PNMessage || '');

            if (editData.rolelist) {
                const allRoles = initialData?.rolelist || [];
                const mappedRoles = allRoles.map((r) => ({
                    ...r,
                    empck: editData.rolelist.some((er) => er.ivrmrT_Id === r.ivrmrT_Id)
                }));
                form.setValue('roleids', mappedRoles);
            }
        }
    }, [editData, initialData, form]);

    const institutionModuleList = (initialData?.institutionModuleList as any[]) || [];

    const institutionPageLists = React.useMemo(() => {
        if (
            editData &&
            selectedModuleId === editData.emailSmsSettingList?.[0]?.ivrmiM_Id &&
            editData.institutionPageList &&
            editData.institutionPageList.length > 0
        ) {
            return editData.institutionPageList;
        }
        const fromModule = ((modulePageData as any)?.data as any[]) || ((modulePageData as any)?.institutionPageList as any[]);
        return fromModule && fromModule.length > 0 ? fromModule : initialData?.institutionPageList || [];
    }, [editData, selectedModuleId, modulePageData, initialData]);

    const pageWiseHeaderList = React.useMemo(() => {
        let list: any[] = [];
        if (
            editData &&
            selectedPageId === editData.emailSmsSettingList?.[0]?.ivrmimP_Id &&
            editData.pageWiseHeaderList &&
            editData.pageWiseHeaderList.length > 0
        ) {
            list = editData.pageWiseHeaderList;
        } else {
            const fromHeader = ((headerDataResponse as any)?.data as any[]) || ((headerDataResponse as any)?.pageWiseHeaderList as any[]);
            list = fromHeader && fromHeader.length > 0 ? fromHeader : [];
        }

        // Add the current template if it's missing from the list but we have it from editData
        if (editData && editData.templname) {
            const exists = list.some((h: any) => h.ivrmhE_Name === editData.templname || h.ivrmhE_Id === editData.ivrmhE_Id);
            if (!exists) {
                list = [
                    ...list,
                    {
                        ivrmhE_Id: editData.ivrmhE_Id ? editData.ivrmhE_Id : editData.templname,
                        ivrmhE_Name: editData.templname
                    }
                ];
            }
        }

        return list;
    }, [editData, selectedPageId, headerDataResponse]);

    const parameters = React.useMemo(() => {
        // If the template matches the edit data, we can use the parameterList from editData
        if (editData && editData.parameterList && editData.parameterList.length > 0) {
            // It's a bit tricky to match selectedHeaderId with editData because we don't always have it perfectly synced, but we'll try
            return editData.parameterList;
        }
        const fromParam = ((parameterData as any)?.data as any[]) || ((parameterData as any)?.parameterList as any[]);
        return fromParam && fromParam.length > 0 ? fromParam : [];
    }, [editData, parameterData]);

    const emailTemplates = (initialData?.emailtemplatelist as any[]) || [];

    useEffect(() => {
        if (pageWiseHeaderList && pageWiseHeaderList.length > 0) {
            const templateVal = form.getValues('ISES_Template_Name');
            if (templateVal && !isNaN(Number(templateVal))) {
                setSelectedHeaderId(Number(templateVal));
            } else if (templateVal) {
                // Fallback if somehow it's still storing name from legacy edit data
                const matched = pageWiseHeaderList.find(
                    (h: any) => h.ivrmhE_Name === templateVal || h.ivrmhE_Id.toString() === templateVal
                );
                if (matched) {
                    if (!isNaN(Number(matched.ivrmhE_Id))) {
                        setSelectedHeaderId(Number(matched.ivrmhE_Id));
                    }
                    form.setValue('ISES_Template_Name', matched.ivrmhE_Id.toString());
                }
            }
        }
    }, [pageWiseHeaderList, form.watch('ISES_Template_Name')]);

    const handleParameterInsert = (fieldId: string, paramName: string) => {
        const currentVal = form.getValues(fieldId as any) || '';
        form.setValue(fieldId as any, currentVal + paramName);
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const payload = {
            ises_Id: values.ISES_Id,
            ivrmiM_Id: values.IVRMIM_Id,
            ivrmimP_Id: values.IVRMIMP_Id,
            ismhtmL_Id: values.ISMHTML_Id === 0 ? undefined : values.ISMHTML_Id,
            iseS_Template_Name: values.ISES_Template_Name,
            iseS_SMSMessage: values.ISES_SMSMessage,
            iseS_SMSActiveFlag: values.ISES_SMSActiveFlag,
            iseS_MailSubject: values.ISES_MailSubject,
            iseS_MailHTMLTemplate: values.ISES_MailHTMLTemplate,
            iseS_MailFooter: values.ISES_MailFooter,
            iseS_MailActiveFlag: values.ISES_MailActiveFlag,
            iseS_EnableSMSCCFlg: values.ISES_EnableSMSCCFlg,
            iseS_EnableMailCCFlg: values.ISES_EnableMailCCFlg,
            iseS_EnableMailBCCFlg: values.ISES_EnableMailBCCFlg,
            iseS_TemplateId: values.ISES_TemplateId,
            iseS_IVRSTextMsg: values.ISES_IVRSTextMsg,
            iseS_IVRSVoiceFile: values.ISES_IVRSVoiceFile,
            iseS_PNMessage: values.ISES_PNMessage,
            iseS_PNActiveFlg: values.ISES_PNActiveFlg,
            iseS_AlertBeforeDays: Number(values.ISES_AlertBeforeDays) || 0,
            ivrmstauL_Id: 1, // Defaulting to 1 based on example
            mobile_list_dto: values.mobile_list_dto?.filter((m) => m.hrmemnO_MobileNo),
            email_list_dto: values.email_list_dto?.filter((e) => e.hrmeM_EmailId),
            email_list_dtocc: values.email_list_dtocc?.filter((e) => e.hrmeM_EmailId),
            roleids: values.roleids?.filter((r) => r.empck),
            filelist: values.filelist?.filter((f) => f.cfilename)
        };

        saveMutation.mutate(payload as any, {
            onSuccess: () => {
                handleClear();
            }
        });
    };

    const handleClear = () => {
        form.reset();
        setSelectedModuleId(0);
        setSelectedPageId(0);
        setSelectedHeaderId(0);
        onClear();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                {/* Common Setting */}
                <Card>
                    <CardHeader>
                        <CardTitle>Common Setting</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 md:px-12'>
                            <FormField
                                control={form.control}
                                name='IVRMIM_Id'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-3 items-center gap-4'>
                                        <FormLabel className='text-right'>
                                            Module: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(Number(val));
                                                setSelectedModuleId(Number(val));
                                                form.setValue('IVRMIMP_Id', 0);
                                                setSelectedPageId(0);
                                            }}
                                            value={field.value ? field.value.toString() : ''}>
                                            <FormControl className='col-span-2'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {institutionModuleList.map((m, index) => (
                                                    <SelectItem key={`${m.ivrmiM_Id}-${index}`} value={m.ivrmiM_Id.toString()}>
                                                        {m.ivrmM_ModuleName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='col-span-2 col-start-2' />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='IVRMIMP_Id'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-3 items-center gap-4'>
                                        <FormLabel className='text-right'>
                                            Module Page: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(Number(val));
                                                setSelectedPageId(Number(val));
                                            }}
                                            value={field.value ? field.value.toString() : ''}
                                            disabled={!selectedModuleId && !field.value}>
                                            <FormControl className='col-span-2'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {institutionPageLists.map((p, index) => (
                                                    <SelectItem key={`${p.ivrmimP_Id}-${index}`} value={p.ivrmimP_Id.toString()}>
                                                        {p.ivrmmP_PageName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='col-span-2 col-start-2' />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='ISES_Template_Name'
                                render={({ field }) => (
                                    <FormItem className='grid grid-cols-3 items-center gap-4'>
                                        <FormLabel className='text-right'>
                                            Header: <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setSelectedHeaderId(Number(val));
                                            }}
                                            value={field.value ? field.value.toString() : ''}
                                            disabled={!selectedPageId && !field.value}>
                                            <FormControl className='col-span-2'>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {pageWiseHeaderList.map((h: any, index: number) => (
                                                    <SelectItem key={`${h.ivrmhE_Id}-${index}`} value={h.ivrmhE_Id.toString()}>
                                                        {h.ivrmhE_Name || h.ivrmhE_Id.toString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className='col-span-2 col-start-2' />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {(selectedHeaderId > 0 || !!form.watch('ISES_Template_Name')) && (
                    <>
                        {/* Sms Setting */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sms Setting</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='space-y-4'>
                                        <FormField
                                            control={form.control}
                                            name='ISES_TemplateId'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>Template-Id:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <div className='grid grid-cols-3 items-start gap-4'>
                                            <FormLabel className='mt-2 text-right'>
                                                Parameter: <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='col-span-2'>
                                                <select
                                                    multiple
                                                    className='h-32 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    onChange={(e) => {
                                                        const options = e.target.options;
                                                        for (let i = 0; i < options.length; i++) {
                                                            if (options[i].selected) {
                                                                handleParameterInsert('ISES_SMSMessage', options[i].value);
                                                                options[i].selected = false;
                                                            }
                                                        }
                                                    }}>
                                                    {parameters.map((p: any, index: number) => (
                                                        <option key={`${p.ismP_ID}-${index}`} value={p.ismP_NAME}>
                                                            {p.ismP_NAME}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name='ISES_SMSMessage'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>
                                                        Message: <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={3} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_SMSActiveFlag'
                                            render={({ field }) => (
                                                <FormItem className='flex items-center justify-center space-x-3 space-y-0 border-t pt-4'>
                                                    <RadioGroup
                                                        onValueChange={(val) => field.onChange(val === 'true')}
                                                        value={field.value ? 'true' : 'false'}
                                                        className='flex space-x-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='true' />
                                                            </FormControl>
                                                            <FormLabel className='cursor-pointer font-normal'>
                                                                Enable SMS Template
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='false' />
                                                            </FormControl>
                                                            <FormLabel className='cursor-pointer font-normal'>
                                                                Disable SMS Template
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='space-y-4 border-l pl-6'>
                                        <FormField
                                            control={form.control}
                                            name='ISES_EnableSMSCCFlg'
                                            render={({ field }) => (
                                                <FormItem className='mb-4 flex flex-row items-start space-x-3 space-y-0'>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className='space-y-1 leading-none'>
                                                        <FormLabel className='cursor-pointer font-bold'>ENABLE SMS CC</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {mobileFields.map((field, index) => (
                                            <FormField
                                                key={field.id}
                                                control={form.control}
                                                name={`mobile_list_dto.${index}.hrmemnO_MobileNo`}
                                                render={({ field: inputField }) => (
                                                    <FormItem className='grid grid-cols-[auto_1fr_auto] items-center gap-2'>
                                                        <FormLabel className='w-32'>SMS CC Mobile No.:</FormLabel>
                                                        <FormControl>
                                                            <Input {...inputField} maxLength={10} value={inputField.value || ''} />
                                                        </FormControl>
                                                        <div className='flex w-16 gap-1'>
                                                            {index === mobileFields.length - 1 && mobileFields.length < 5 && (
                                                                <Button
                                                                    type='button'
                                                                    size='icon'
                                                                    variant='ghost'
                                                                    onClick={() => appendMobile({ hrmemnO_MobileNo: '' })}>
                                                                    <Plus className='h-4 w-4' />
                                                                </Button>
                                                            )}
                                                            {mobileFields.length > 1 && (
                                                                <Button
                                                                    type='button'
                                                                    size='icon'
                                                                    variant='ghost'
                                                                    onClick={() => removeMobile(index)}>
                                                                    <Trash2 className='h-4 w-4 text-destructive' />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <FormMessage className='col-start-2' />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mail Setting */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mail Setting</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='space-y-4'>
                                        <FormField
                                            control={form.control}
                                            name='ISMHTML_Id'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>Email Template:</FormLabel>
                                                    <Select
                                                        onValueChange={(val) => field.onChange(Number(val))}
                                                        value={field.value ? field.value.toString() : ''}>
                                                        <FormControl className='col-span-2'>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder='--Select--' />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {emailTemplates.map((t, index) => (
                                                                <SelectItem
                                                                    key={`${t.ismhtmL_Id}-${index}`}
                                                                    value={t.ismhtmL_Id.toString()}>
                                                                    {t.ismhtmL_HTMLName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_MailSubject'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>
                                                        Subject: <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_MailHTMLTemplate'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>Mail Body / Message:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={4} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_MailFooter'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>
                                                        Mail Footer: <span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_MailActiveFlag'
                                            render={({ field }) => (
                                                <FormItem className='flex items-center justify-center space-x-3 space-y-0 border-t pt-4'>
                                                    <RadioGroup
                                                        onValueChange={(val) => field.onChange(val === 'true')}
                                                        value={field.value ? 'true' : 'false'}
                                                        className='flex space-x-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='true' />
                                                            </FormControl>
                                                            <FormLabel className='cursor-pointer font-normal'>
                                                                Enable Email Template
                                                            </FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='false' />
                                                            </FormControl>
                                                            <FormLabel className='cursor-pointer font-normal'>
                                                                Disable Email Template
                                                            </FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormItem>
                                            )}
                                        />

                                        <div className='pt-4'>
                                            <div className='table-responsive'>
                                                <table className='table w-full border-collapse border border-gray-300 text-center text-sm'>
                                                    <thead className='bg-gray-100'>
                                                        <tr>
                                                            <th className='border p-2'>SL.NO.</th>
                                                            <th className='border p-2'>UPLOAD</th>
                                                            <th className='border p-2'>VIEW</th>
                                                            <th className='border p-2'>ACTION</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {fileFields.map((field, index) => (
                                                            <tr key={field.id} className={index % 2 !== 0 ? 'bg-gray-50' : ''}>
                                                                <td className='border p-2'>{index + 1}</td>
                                                                <td className='border p-2'>
                                                                    <div className='flex items-center justify-center'>
                                                                        <label className='cursor-pointer rounded bg-[#2757a6] px-3 py-1 text-white text-xs hover:bg-[#1f4585]'>
                                                                            Upload File
                                                                            <input
                                                                                type='file'
                                                                                className='hidden'
                                                                                accept='image/*, application/pdf,application/msword,video/mp4,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel'
                                                                                onChange={(e) => {
                                                                                    const file = e.target.files?.[0];
                                                                                    if (file) {
                                                                                        // Handle simulated upload
                                                                                        const newFilelist = [
                                                                                            ...(form.getValues('filelist') || [])
                                                                                        ];
                                                                                        if (newFilelist[index]) {
                                                                                            newFilelist[index].cfilename = file.name;
                                                                                            newFilelist[index].cfilepath =
                                                                                                URL.createObjectURL(file);
                                                                                            form.setValue('filelist', newFilelist);
                                                                                        }
                                                                                    }
                                                                                }}
                                                                            />
                                                                        </label>
                                                                    </div>
                                                                    {form.watch(`filelist.${index}.cfilename`) && (
                                                                        <div className='mx-auto mt-1 max-w-[150px] truncate text-green-600 text-xs'>
                                                                            {form.watch(`filelist.${index}.cfilename`)}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                                <td className='border p-2'>
                                                                    {form.watch(`filelist.${index}.cfilepath`) && (
                                                                        <a
                                                                            href={form.watch(`filelist.${index}.cfilepath`)}
                                                                            target='_blank'
                                                                            rel='noopener noreferrer'
                                                                            className='font-bold text-red-500 hover:underline'>
                                                                            View
                                                                        </a>
                                                                    )}
                                                                </td>
                                                                <td className='border p-2'>
                                                                    <div className='flex justify-center gap-2'>
                                                                        {index === fileFields.length - 1 && fileFields.length < 10 && (
                                                                            <button
                                                                                type='button'
                                                                                onClick={() => appendFile({ cfilepath: '', cfilename: '' })}
                                                                                className='text-black hover:text-gray-700'>
                                                                                <Plus className='h-4 w-4' />
                                                                            </button>
                                                                        )}
                                                                        {(fileFields.length > 1 ||
                                                                            (fileFields.length === 1 &&
                                                                                form.watch(`filelist.0.cfilename`))) && (
                                                                                <button
                                                                                    type='button'
                                                                                    onClick={() => {
                                                                                        if (fileFields.length > 1) {
                                                                                            removeFile(index);
                                                                                        } else {
                                                                                            form.setValue('filelist', [
                                                                                                { cfilepath: '', cfilename: '', filetype: '' }
                                                                                            ]);
                                                                                        }
                                                                                    }}
                                                                                    className='text-black hover:text-gray-700'>
                                                                                    <Trash2 className='h-4 w-4 text-black' />
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-6 border-l pl-6'>
                                        <div>
                                            <FormField
                                                control={form.control}
                                                name='ISES_EnableMailCCFlg'
                                                render={({ field }) => (
                                                    <FormItem className='mb-4 flex flex-row items-start space-x-3 space-y-0'>
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className='space-y-1 leading-none'>
                                                            <FormLabel className='cursor-pointer font-bold'>ENABLE EMAIL CC</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            {emailCCFields.map((field, index) => (
                                                <FormField
                                                    key={field.id}
                                                    control={form.control}
                                                    name={`email_list_dto.${index}.hrmeM_EmailId`}
                                                    render={({ field: inputField }) => (
                                                        <FormItem className='mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2'>
                                                            <FormLabel className='w-24'>CC EMAIL ID:</FormLabel>
                                                            <FormControl>
                                                                <Input {...inputField} type='email' value={inputField.value || ''} />
                                                            </FormControl>
                                                            <div className='flex w-16 gap-1'>
                                                                {index === emailCCFields.length - 1 && emailCCFields.length < 5 && (
                                                                    <Button
                                                                        type='button'
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        onClick={() => appendEmailCC({ hrmeM_EmailId: '' })}>
                                                                        <Plus className='h-4 w-4' />
                                                                    </Button>
                                                                )}
                                                                {emailCCFields.length > 1 && (
                                                                    <Button
                                                                        type='button'
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        onClick={() => removeEmailCC(index)}>
                                                                        <Trash2 className='h-4 w-4 text-destructive' />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <FormMessage className='col-start-2' />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>

                                        <div className='border-t pt-4'>
                                            <FormField
                                                control={form.control}
                                                name='ISES_EnableMailBCCFlg'
                                                render={({ field }) => (
                                                    <FormItem className='mb-4 flex flex-row items-start space-x-3 space-y-0'>
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className='space-y-1 leading-none'>
                                                            <FormLabel className='cursor-pointer font-bold'>ENABLE EMAIL BCC</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />

                                            {emailBCCFields.map((field, index) => (
                                                <FormField
                                                    key={field.id}
                                                    control={form.control}
                                                    name={`email_list_dtocc.${index}.hrmeM_EmailId`}
                                                    render={({ field: inputField }) => (
                                                        <FormItem className='mb-2 grid grid-cols-[auto_1fr_auto] items-center gap-2'>
                                                            <FormLabel className='w-24'>BCC EMAIL ID:</FormLabel>
                                                            <FormControl>
                                                                <Input {...inputField} type='email' value={inputField.value || ''} />
                                                            </FormControl>
                                                            <div className='flex w-16 gap-1'>
                                                                {index === emailBCCFields.length - 1 && emailBCCFields.length < 5 && (
                                                                    <Button
                                                                        type='button'
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        onClick={() => appendEmailBCC({ hrmeM_EmailId: '' })}>
                                                                        <Plus className='h-4 w-4' />
                                                                    </Button>
                                                                )}
                                                                {emailBCCFields.length > 1 && (
                                                                    <Button
                                                                        type='button'
                                                                        size='icon'
                                                                        variant='ghost'
                                                                        onClick={() => removeEmailBCC(index)}>
                                                                        <Trash2 className='h-4 w-4 text-destructive' />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <FormMessage className='col-start-2' />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Other Parameters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Other Parameters</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                    <div className='space-y-4'>
                                        <div className='grid grid-cols-3 items-start gap-4'>
                                            <FormLabel className='mt-2 text-right'>Parameter:</FormLabel>
                                            <div className='col-span-2'>
                                                <select
                                                    multiple
                                                    className='h-32 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    onChange={(e) => {
                                                        const options = e.target.options;
                                                        for (let i = 0; i < options.length; i++) {
                                                            if (options[i].selected) {
                                                                handleParameterInsert('ISES_IVRSTextMsg', options[i].value);
                                                                options[i].selected = false;
                                                            }
                                                        }
                                                    }}>
                                                    {parameters.map((p: any, index: number) => (
                                                        <option key={`${p.ismP_ID}-${index}`} value={p.ismP_NAME}>
                                                            {p.ismP_NAME}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name='ISES_IVRSTextMsg'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>IVRS Text Message:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={3} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem className='grid grid-cols-3 items-center gap-4'>
                                            <FormLabel className='text-right'>Upload Voice Msg:</FormLabel>
                                            <div className='col-span-2'>
                                                <Button type='button' variant='outline' className='w-full'>
                                                    <Upload className='mr-2 h-4 w-4' />
                                                    Choose Audio File
                                                </Button>
                                            </div>
                                        </FormItem>
                                    </div>

                                    <div className='space-y-4 border-l pl-6'>
                                        <FormField
                                            control={form.control}
                                            name='ISES_PNActiveFlg'
                                            render={({ field }) => (
                                                <FormItem className='mb-4 flex flex-row items-start space-x-3 space-y-0'>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className='space-y-1 leading-none'>
                                                        <FormLabel className='cursor-pointer font-bold'>ENABLE PUSH NOTIFICATION</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name='ISES_AlertBeforeDays'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>Alert Reminder Days:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Input {...field} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <div className='grid grid-cols-3 items-start gap-4'>
                                            <FormLabel className='mt-2 text-right'>Parameter:</FormLabel>
                                            <div className='col-span-2'>
                                                <select
                                                    multiple
                                                    className='h-24 w-full rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                                    onChange={(e) => {
                                                        const options = e.target.options;
                                                        for (let i = 0; i < options.length; i++) {
                                                            if (options[i].selected) {
                                                                handleParameterInsert('ISES_PNMessage', options[i].value);
                                                                options[i].selected = false;
                                                            }
                                                        }
                                                    }}>
                                                    {parameters.map((p: any, index: number) => (
                                                        <option key={`${p.ismP_ID}-${index}`} value={p.ismP_NAME}>
                                                            {p.ismP_NAME}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name='ISES_PNMessage'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-3 items-center gap-4'>
                                                    <FormLabel className='text-right'>Notification Message:</FormLabel>
                                                    <FormControl className='col-span-2'>
                                                        <Textarea {...field} rows={3} value={field.value || ''} />
                                                    </FormControl>
                                                    <FormMessage className='col-span-2 col-start-2' />
                                                </FormItem>
                                            )}
                                        />

                                        <FormItem className='grid grid-cols-3 items-start gap-4'>
                                            <FormLabel className='mt-2 text-right'>Role:</FormLabel>
                                            <div className='col-span-2'>
                                                <div className='rounded-md border'>
                                                    <div className='border-b p-2'>
                                                        <Input
                                                            placeholder='search Role here...'
                                                            className='h-8'
                                                            onChange={(e) => {
                                                                // Filter roles manually if needed, but for simplicity relying on scroll area for now
                                                            }}
                                                        />
                                                    </div>
                                                    <ScrollArea className='h-32 p-3'>
                                                        {form.watch('roleids')?.map((role, index) => (
                                                            <FormField
                                                                key={`${role.ivrmrT_Id}-${index}`}
                                                                control={form.control}
                                                                name={`roleids.${index}.empck`}
                                                                render={({ field }) => (
                                                                    <FormItem className='mb-2 flex flex-row items-start space-x-3 space-y-0'>
                                                                        <FormControl>
                                                                            <Checkbox
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                            />
                                                                        </FormControl>
                                                                        <FormLabel className='cursor-pointer font-bold text-sm leading-none'>
                                                                            {role.ivrmrT_Role}
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        ))}
                                                    </ScrollArea>
                                                </div>
                                            </div>
                                        </FormItem>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className='mt-6 flex justify-center gap-4'>
                            <Button type='submit' disabled={saveMutation.isPending}>
                                <i className='fa fa-floppy-o mr-2' aria-hidden='true'></i>
                                Save
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => {
                                    handleClear();
                                    onCancel();
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </>
                )}
            </form>
        </Form>
    );
}
