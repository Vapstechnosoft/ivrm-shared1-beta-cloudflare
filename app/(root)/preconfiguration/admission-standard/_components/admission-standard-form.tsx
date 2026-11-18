'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAdmissionStandard, useSaveAdmissionStandard } from '@/hooks/preconfiguration/useAdmissionStandard';
import type { IAdmissionStandardPayload } from '@/types/preconfiguration/admission-standard';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCw, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const admissionStandardSchema = z.object({
    asC_Id: z.number().optional(),
    ASC_Adm_AddFieldsFlag: z.boolean().default(false),
    ASC_TC_AddFieldsFlag: z.boolean().default(false),
    ASC_MaxAgeApl_Flag: z.boolean().default(false),
    ASC_MinAgeApl_Flag: z.boolean().default(false),
    ASC_TC_Payment: z.boolean().default(false),
    ASC_TC_Library: z.boolean().default(false),
    ASC_ECS_Flag: z.boolean().default(false),
    ASC_ParentsMonthlyIncome_Flag: z.boolean().default(false),
    ASC_ParentsAnnualIncome_Flag: z.boolean().default(false),
    ASC_Att_DefaultEntry_Type: z.enum(['P', 'A'], {
        required_error: 'Select Attendance Entry Type',
        invalid_type_error: 'Select Attendance Entry Type'
    }),
    ASC_Default_Gender: z.enum(['M', 'F', 'Ot'], {
        required_error: 'Select Gender',
        invalid_type_error: 'Select Gender'
    }),
    ASC_School_Address: z.boolean().default(false),
    ASC_Category_Address: z.boolean().default(false),
    ASC_DefaultPhotoUpload: z.enum(['1', '2', '0']).default('0'),
    ASC_DefaultSMS_Flag: z.enum(['F', 'M', 'S', 'B'], {
        required_error: 'Select Default sms/email receiver',
        invalid_type_error: 'Select Default sms/email receiver'
    }),
    ASC_Att_Scheduler_Flag: z.enum(['Periodwise', 'EOD'], {
        required_error: 'Select Attendance Scheduler Absent SMS',
        invalid_type_error: 'Select Attendance Scheduler Absent SMS'
    }),
    ASC_Att_Default_OrderFlag: z
        .string({
            required_error: 'Select Default Order',
            invalid_type_error: 'Select Default Order'
        })
        .min(1, 'Select Default Order'),
    ASC_Logo_Path: z.string().nullable().default(null)
});

type FormValues = z.infer<typeof admissionStandardSchema>;

const defaultFormValues = {
    ASC_Adm_AddFieldsFlag: false,
    ASC_TC_AddFieldsFlag: false,
    ASC_MaxAgeApl_Flag: false,
    ASC_MinAgeApl_Flag: false,
    ASC_TC_Payment: false,
    ASC_TC_Library: false,
    ASC_ECS_Flag: false,
    ASC_ParentsMonthlyIncome_Flag: false,
    ASC_ParentsAnnualIncome_Flag: false,
    ASC_Att_DefaultEntry_Type: undefined as any,
    ASC_Default_Gender: undefined as any,
    ASC_School_Address: false,
    ASC_Category_Address: false,
    ASC_DefaultPhotoUpload: '0',
    ASC_DefaultSMS_Flag: undefined as any,
    ASC_Att_Scheduler_Flag: undefined as any,
    ASC_Att_Default_OrderFlag: '',
    ASC_Logo_Path: null
} as FormValues;

export default function AdmissionStandardForm() {
    const { data: response, isLoading, refetchAll } = useAdmissionStandard();
    const saveMutation = useSaveAdmissionStandard();
    const [resetKey, setResetKey] = useState(0);
    const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [viewModalUrl, setViewModalUrl] = useState('');

    const form = useForm<FormValues>({
        resolver: zodResolver(admissionStandardSchema),
        defaultValues: defaultFormValues
    });

    const handleReset = () => {
        if (response && response.length > 0) {
            const config = response[0];
            form.reset({
                asC_Id: config.asC_Id,
                ASC_Adm_AddFieldsFlag: config.asC_Adm_AddFieldsFlag === 1,
                ASC_TC_AddFieldsFlag: config.asC_TC_AddFieldsFlag === 1,
                ASC_MaxAgeApl_Flag: config.asC_MaxAgeApl_Flag === 1,
                ASC_MinAgeApl_Flag: config.asC_MinAgeApl_Flag === 1,
                ASC_TC_Payment: config.admC_TCAllowBalanceFlg === 1,
                ASC_TC_Library: config.asC_LibraryAllowBalanceFlg === 1,
                ASC_ECS_Flag: config.asC_ECS_Flag === 1,
                ASC_ParentsMonthlyIncome_Flag:
                    (config.asC_ParentsMonthlyIncome_Flag as unknown as string) === 'Y' || config.asC_ParentsMonthlyIncome_Flag === 1,
                ASC_ParentsAnnualIncome_Flag:
                    (config.asC_ParentsAnnualIncome_Flag as unknown as string) === 'Y' || config.asC_ParentsAnnualIncome_Flag === 1,
                ASC_Att_DefaultEntry_Type: config.asC_Att_DefaultEntry_Type as 'P' | 'A' | undefined,
                ASC_Default_Gender: config.asC_Default_Gender as 'M' | 'F' | 'Ot' | undefined,
                ASC_School_Address: config.asC_School_Address === 1,
                ASC_Category_Address: config.asC_Category_Address === 1,
                ASC_DefaultPhotoUpload: (config.asC_DefaultPhotoUpload as '0' | '1' | '2') || '0',
                ASC_DefaultSMS_Flag: config.asC_DefaultSMS_Flag as 'F' | 'M' | 'S' | 'B' | undefined,
                ASC_Att_Scheduler_Flag: config.asC_Att_Scheduler_Flag as 'Periodwise' | 'EOD' | undefined,
                ASC_Att_Default_OrderFlag: config.asC_Att_Default_OrderFlag ? String(config.asC_Att_Default_OrderFlag) : '',
                ASC_Logo_Path: config.asC_Logo_Path || null
            });
            setResetKey(prev => prev + 1);
        }
    };

    const handleClear = () => {
        const currentId = form.getValues('asC_Id');
        form.reset({ ...defaultFormValues, asC_Id: currentId });
        setResetKey(prev => prev + 1);
    };

    useEffect(() => {
        handleReset();
    }, [response, form]);

    const onSubmit = (values: FormValues) => {
        const payload: IAdmissionStandardPayload = {
            asc_Id: values.asC_Id || 0,
            asc_Adm_AddFieldsFlag: values.ASC_Adm_AddFieldsFlag ? 1 : 0,
            asc_TC_AddFieldsFlag: values.ASC_TC_AddFieldsFlag ? 1 : 0,
            asc_MaxAgeApl_Flag: values.ASC_MaxAgeApl_Flag ? 1 : 0,
            asc_MinAgeApl_Flag: values.ASC_MinAgeApl_Flag ? 1 : 0,
            asc_TC_Payment: values.ASC_TC_Payment ? 1 : 0,
            asc_TC_Library: values.ASC_TC_Library ? 1 : 0,
            asc_ECS_Flag: values.ASC_ECS_Flag ? 1 : 0,
            asc_ParentsMonthlyIncome_Flag: values.ASC_ParentsMonthlyIncome_Flag ? 'Y' : 'N',
            asc_ParentsAnnualIncome_Flag: values.ASC_ParentsAnnualIncome_Flag ? 'Y' : 'N',
            asc_Att_DefaultEntry_Type: values.ASC_Att_DefaultEntry_Type,
            asc_Default_Gender: values.ASC_Default_Gender,
            asc_School_Address: values.ASC_School_Address ? 1 : 0,
            asc_Category_Address: values.ASC_Category_Address ? 1 : 0,
            asc_DefaultPhotoUpload: values.ASC_DefaultPhotoUpload,
            asc_DefaultSMS_Flag: values.ASC_DefaultSMS_Flag,
            asc_Att_Scheduler_Flag: values.ASC_Att_Scheduler_Flag,
            asc_Att_Default_OrderFlag: Number(values.ASC_Att_Default_OrderFlag),
            asc_Logo_Path: values.ASC_Logo_Path || '/Uploads/Logo/',
            asc_Stu_Photo_Path: '/Uploads/Students/',
            asc_Staff_Photo_Path: '/Uploads/Staff/',
            asc_Doc_Path: '/Uploads/Documents/',
            asc_AdmNo_RegNo_RollNo_DefaultFlag: 'ADM',
            asc_DefaultDisplay_Flag: 'Y',
            asc_Default_Clm__Adm_Flag: 1,
            asc_Default_Clm__Rol_Flag: 1,
            asc_Default_Clm__Reg_Flag: 1
        };

        saveMutation.mutate(payload, {
            onSuccess: () => {
                refetchAll();
            }
        });
    };

    const onError = () => {
        toast.error('Please fill all required fields correctly.');
    };

    if (isLoading) return <div>Loading configuration...</div>;

    return (
        <Card className='shadow-lg'>
            <CardHeader className='border-b'>
                <CardTitle>Admission Standard</CardTitle>
            </CardHeader>
            <CardContent className='p-6'>
                <Form {...form}>
                    <form key={resetKey} onSubmit={form.handleSubmit(onSubmit, onError)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Left Column */}
                            <div className='space-y-6'>
                                <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_Adm_AddFieldsFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Admission Additional Fields</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ASC_TC_AddFieldsFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>TC Additional Fields</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_MaxAgeApl_Flag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Max Age Applicable</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ASC_MinAgeApl_Flag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Min Age Applicable</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='grid grid-cols-1 gap-4 rounded-md border bg-muted/20 p-4 sm:grid-cols-3'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_TC_Payment'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Payment Required For Permanent TC</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ASC_TC_Library'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>LibraryFlag</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ASC_ECS_Flag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>ECS Flag</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_ParentsMonthlyIncome_Flag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Parent&apos;s monthly income</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ASC_ParentsAnnualIncome_Flag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Parent&apos;s annual income</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_Att_DefaultEntry_Type'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>
                                                    Attendance Entry Type <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        className='flex flex-wrap gap-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='P' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Present</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='A' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Absent</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_Logo_Path'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>Logo</FormLabel>
                                                <FormControl>
                                                    <div className='flex items-center space-x-2'>
                                                        <Input
                                                            type='file'
                                                            accept='image/*'
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    try {
                                                                        const formData = new FormData();
                                                                        formData.append('file', file);
                                                                        formData.append('FileName', file.name);
                                                                        formData.append('ContentType', file.type);
                                                                        formData.append('subContainerName', 'Logo');
                                                                        
                                                                        const response = await uploadDocument(formData);
                                                                        if (response.success && response.data) {
                                                                            field.onChange(response.data);
                                                                            setLogoPreviewUrl(response.data);
                                                                            toast.success('Logo uploaded successfully');
                                                                        } else {
                                                                            toast.error(response.message || 'Upload failed');
                                                                            field.onChange(file.name); // fallback
                                                                            setLogoPreviewUrl(URL.createObjectURL(file));
                                                                        }
                                                                    } catch (error) {
                                                                        toast.error('Failed to upload Logo');
                                                                        field.onChange(file.name); // fallback
                                                                        setLogoPreviewUrl(URL.createObjectURL(file));
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        {(logoPreviewUrl || field.value) && (
                                                            <Button
                                                                type='button'
                                                                variant='outline'
                                                                size='sm'
                                                                className='font-semibold text-blue-600'
                                                                onClick={() => {
                                                                    let url = logoPreviewUrl || field.value;
                                                                    if (url && !url.startsWith('http') && !url.startsWith('blob:') && !url.startsWith('/')) {
                                                                        // If it's just a filename and doesn't have a path, it might be broken,
                                                                        // but we can try to append a default path or just use it.
                                                                    }
                                                                    if (url) {
                                                                        setViewModalUrl(url);
                                                                        setIsViewModalOpen(true);
                                                                    }
                                                                }}
                                                            >
                                                                View
                                                            </Button>
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className='space-y-6'>
                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_Default_Gender'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>
                                                    Gender <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        className='flex flex-wrap gap-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='M' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Male</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='F' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Female</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='Ot' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Other</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormLabel className='mb-3 block'>Admission Form Format</FormLabel>
                                    <div className='flex gap-4'>
                                        <FormField
                                            control={form.control}
                                            name='ASC_School_Address'
                                            render={({ field }) => (
                                                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>School /College Address</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name='ASC_Category_Address'
                                            render={({ field }) => (
                                                <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md'>
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Category Address</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_DefaultPhotoUpload'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>Photo Upload</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        className='flex flex-wrap gap-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='1' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Manual Photo Upload</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='2' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Web Camera</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_DefaultSMS_Flag'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>
                                                    Default sms/email receiver <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        className='flex flex-wrap gap-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='F' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Father</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='M' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Mother</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='S' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Student</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='B' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Both M/F</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <FormField
                                        control={form.control}
                                        name='ASC_Att_Scheduler_Flag'
                                        render={({ field }) => (
                                            <FormItem className='space-y-3'>
                                                <FormLabel>
                                                    Attendance Scheduler Absent SMS <span className='text-red-500'>*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value ?? ''}
                                                        className='flex flex-wrap gap-4'>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='Periodwise' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>Period Wise</FormLabel>
                                                        </FormItem>
                                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                                            <FormControl>
                                                                <RadioGroupItem value='EOD' />
                                                            </FormControl>
                                                            <FormLabel className='font-normal'>End Of The Day</FormLabel>
                                                        </FormItem>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='w-full rounded-md border bg-muted/20 p-4 md:w-1/2'>
                            <FormField
                                control={form.control}
                                name='ASC_Att_Default_OrderFlag'
                                render={({ field }) => (
                                    <FormItem className='space-y-3'>
                                        <FormLabel>
                                            Attendance Default Order <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                                className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='1' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By Gender Ascending</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='2' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By Gender Descending</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='3' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By ROLL NO</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='4' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By Name Ascending</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='5' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By Name Descending</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='6' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By REGNO</FormLabel>
                                                </FormItem>
                                                <FormItem className='flex items-center space-x-2 space-y-0'>
                                                    <FormControl>
                                                        <RadioGroupItem value='7' />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>Order By ADMNO</FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Form Actions */}
                        <div className='mt-6 flex justify-center gap-4'>
                            <Button type='submit' className='w-32 bg-primary' disabled={saveMutation.isPending}>
                                <Save className='mr-2 h-4 w-4' />
                                {saveMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-32'
                                onClick={() => window.location.reload()}
                                disabled={saveMutation.isPending}>
                                <X className='mr-2 h-4 w-4' />
                                Clear
                            </Button>
                            <Button
                                type='button'
                                variant='secondary'
                                className='w-32'
                                onClick={() => window.location.reload()}
                                disabled={saveMutation.isPending}>
                                <RefreshCw className='mr-2 h-4 w-4' />
                                Reset
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>

            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className='max-w-3xl'>
                    <DialogHeader>
                        <DialogTitle>View Logo</DialogTitle>
                    </DialogHeader>
                    <div className='flex justify-center p-4'>
                        {viewModalUrl && <img src={viewModalUrl} alt='Logo' className='max-h-[70vh] max-w-full object-contain' />}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
