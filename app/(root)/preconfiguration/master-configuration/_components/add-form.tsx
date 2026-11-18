'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useSaveMasterConfiguration } from '@/hooks/preconfiguration/useMasterConfiguration';
import type { IMasterConfigurationResponse } from '@/types/preconfiguration/master-configuration';
import { zodResolver } from '@hookform/resolvers/zod';
import { RefreshCcw, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
    ispaC_Id: z.number().default(0),
    mO_Id: z.number().default(0),
    mI_Id: z.number().default(0),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    amC_Id: z.number().optional(),
    amcoC_Id: z.number().optional(),

    // Enquiry & Prospectus Settings
    ispaC_EnquiryApplFlag: z.number().default(0),
    ispaC_EnqSMSFlag: z.number().default(0),
    ispaC_EnqMailFlag: z.number().default(0),
    ispaC_ProsptFeeApp: z.number().default(0),
    ispaC_ProspectusFlag: z.number().default(0),

    // Application Form Settings
    ispaC_ApplCutOffDateFlag: z.number().default(0),
    ispaC_DOBMaxAgeFlag: z.number().default(0),
    ispaC_DOBMinAgeFlag: z.number().default(0),
    ispaC_HostelFlag: z.number().default(0),
    ispaC_TransaportFlag: z.number().default(0),
    ispaC_SibblingConcessionFlag: z.number().default(0),
    ispaC_ParentConcessionFlag: z.number().default(0),
    ispaC_ECSFlag: z.number().default(0),
    ispaC_GymFlag: z.number().default(0),
    ispaC_FatherAliveFlag: z.number().default(0),
    ispaC_MotherAliveFlag: z.number().default(0),
    ispaC_MaritalStatusFlag: z.number().default(0),

    // Registration Settings
    ispaC_RegFeeFlag: z.number().default(0),
    ispaC_RegSMSFlag: z.number().default(0),
    ispaC_RegMailFlag: z.number().default(0),
    ispaC_ApplFeeFlag: z.number().default(0),
    ispaC_ApplSMSFlag: z.number().default(0),
    ispaC_ApplMailFlag: z.number().default(0),
    ispaC_Healthapp: z.number().default(0),
    ispaC_NoofApplications: z.number().default(1),
    ispaC_ApplNoIncrementBy: z.number().default(0),

    // Scheduling
    ispaC_OralTestSchApplFlag: z.number().default(0),
    ispaC_OralTestBy: z.number().default(0),
    ispaC_OralMarksFlag: z.number().default(0),
    ispaC_OralByMax_Marks: z.number().default(0),
    ispaC_WrittenTestSchApplFlag: z.number().default(0),
    ispaC_CommonScheduleFlag: z.number().default(0),

    // Preadmission Settings
    ispaC_Transfer_Settings_after_payment_Flag: z.number().default(0),
    ispaC_AdmissionTransfer: z.number().default(0),
    ispaC_FeePaymentFlag: z.number().default(0),
    ispaC_Transfer_Settings_Flag: z.number().default(0),
    ispaC_OfflineFee_Flag: z.number().default(0)
});

export default function MasterConfigurationForm({
    response,
    onSuccess,
    initialData
}: {
    response: IMasterConfigurationResponse | undefined;
    onSuccess: () => void;
    initialData?: any;
}) {
    const saveMutation = useSaveMasterConfiguration();

    const flag =
        response?.mI_SchoolCollegeFlag ||
        response?.schoolCollegeFlag ||
        (response as any)?.SchoolCollegeFlag ||
        (response as any)?.MI_SchoolCollegeFlag ||
        'S';
    const isCollege = flag === 'U' || flag === 'C';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            ispaC_Id: 0,
            mO_Id: 0,
            mI_Id: 0,
            asmaY_Id: response?.academicList?.[0]?.asmaY_Id || 0,
            ispaC_NoofApplications: 1,
            ispaC_ApplNoIncrementBy: 0,
            ispaC_EnquiryApplFlag: 0,
            ispaC_EnqSMSFlag: 0,
            ispaC_EnqMailFlag: 0,
            ispaC_ProsptFeeApp: 0,
            ispaC_ProspectusFlag: 0,
            ispaC_ApplCutOffDateFlag: 0,
            ispaC_DOBMaxAgeFlag: 0,
            ispaC_DOBMinAgeFlag: 0,
            ispaC_HostelFlag: 0,
            ispaC_TransaportFlag: 0,
            ispaC_SibblingConcessionFlag: 0,
            ispaC_ParentConcessionFlag: 0,
            ispaC_ECSFlag: 0,
            ispaC_GymFlag: 0,
            ispaC_FatherAliveFlag: 0,
            ispaC_MotherAliveFlag: 0,
            ispaC_MaritalStatusFlag: 0,
            ispaC_RegFeeFlag: 0,
            ispaC_RegSMSFlag: 0,
            ispaC_RegMailFlag: 0,
            ispaC_ApplFeeFlag: 0,
            ispaC_ApplSMSFlag: 0,
            ispaC_ApplMailFlag: 0,
            ispaC_Healthapp: 0,
            ispaC_OralTestSchApplFlag: 0,
            ispaC_OralTestBy: 0,
            ispaC_OralMarksFlag: 0,
            ispaC_OralByMax_Marks: 0,
            ispaC_WrittenTestSchApplFlag: 0,
            ispaC_CommonScheduleFlag: 0,
            ispaC_Transfer_Settings_after_payment_Flag: 0,
            ispaC_AdmissionTransfer: 0,
            ispaC_FeePaymentFlag: 0,
            ispaC_Transfer_Settings_Flag: 0,
            ispaC_OfflineFee_Flag: 0
        }
    });

    // Reset when initialData changes (for editing)
    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Handle conditionally applied flags
        if (!values.ispaC_EnquiryApplFlag) {
            values.ispaC_EnqSMSFlag = 0;
            values.ispaC_EnqMailFlag = 0;
        }
        if (!values.ispaC_RegFeeFlag) {
            values.ispaC_RegSMSFlag = 0;
            values.ispaC_RegMailFlag = 0;
        }
        if (!values.ispaC_OralTestSchApplFlag) {
            values.ispaC_OralMarksFlag = 0;
        }

        const payload = {
            ISPAC_Id: values.ispaC_Id,
            ASMAY_Id: values.asmaY_Id,
            AMC_Id: response?.mI_SchoolCollegeFlag === 'S' ? values.amC_Id : undefined,
            AMCOC_Id: response?.mI_SchoolCollegeFlag === 'U' || response?.mI_SchoolCollegeFlag === 'C' ? values.amcoC_Id : undefined,

            ISPAC_EnquiryApplFlag: values.ispaC_EnquiryApplFlag,
            ISPAC_EnqSMSFlag: values.ispaC_EnqSMSFlag,
            ISPAC_EnqMailFlag: values.ispaC_EnqMailFlag,
            ISPAC_ProsptFeeApp: values.ispaC_ProsptFeeApp,
            ISPAC_ProspectusFlag: values.ispaC_ProspectusFlag,

            ISPAC_ApplCutOffDateFlag: values.ispaC_ApplCutOffDateFlag,
            ISPAC_DOBMaxAgeFlag: values.ispaC_DOBMaxAgeFlag,
            ISPAC_DOBMinAgeFlag: values.ispaC_DOBMinAgeFlag,
            ISPAC_HostelFlag: values.ispaC_HostelFlag,
            ISPAC_TransaportFlag: values.ispaC_TransaportFlag,
            ISPAC_SibblingConcessionFlag: values.ispaC_SibblingConcessionFlag,
            ISPAC_ParentConcessionFlag: values.ispaC_ParentConcessionFlag,
            ISPAC_ECSFlag: values.ispaC_ECSFlag,
            ISPAC_GymFlag: values.ispaC_GymFlag,
            ISPAC_FatherAliveFlag: values.ispaC_FatherAliveFlag,
            ISPAC_MotherAliveFlag: values.ispaC_MotherAliveFlag,
            ISPAC_MaritalStatusFlag: values.ispaC_MaritalStatusFlag,

            ISPAC_RegFeeFlag: values.ispaC_RegFeeFlag,
            ISPAC_RegSMSFlag: values.ispaC_RegSMSFlag,
            ISPAC_RegMailFlag: values.ispaC_RegMailFlag,
            ISPAC_ApplFeeFlag: values.ispaC_ApplFeeFlag,
            ISPAC_ApplSMSFlag: values.ispaC_ApplSMSFlag,
            ISPAC_ApplMailFlag: values.ispaC_ApplMailFlag,
            ISPAC_Healthapp: values.ispaC_Healthapp,
            ISPAC_NoofApplications: values.ispaC_NoofApplications || 1,
            ISPAC_ApplNoIncrementBy: values.ispaC_ApplNoIncrementBy || 0,
            ISPAC_ApplNoIncrementFlg: values.ispaC_ApplNoIncrementBy > 0,

            ISPAC_OralTestSchApplFlag: values.ispaC_OralTestSchApplFlag,
            ISPAC_OralTestBy: values.ispaC_OralTestBy,
            ISPAC_OralMarksFlag: values.ispaC_OralMarksFlag,
            ISPAC_OralByMax_Marks: values.ispaC_OralByMax_Marks,
            ISPAC_WrittenTestSchApplFlag: values.ispaC_WrittenTestSchApplFlag,
            ISPAC_CommonScheduleFlag: values.ispaC_CommonScheduleFlag,

            ISPAC_Transfer_Settings_after_payment_Flag: values.ispaC_Transfer_Settings_after_payment_Flag,
            ISPAC_AdmissionTransfer: values.ispaC_AdmissionTransfer,
            ISPAC_FeePaymentFlag: values.ispaC_FeePaymentFlag,
            ISPAC_Transfer_Settings_Flag: values.ispaC_Transfer_Settings_Flag,
            ISPAC_OfflineFee_Flag: values.ispaC_OfflineFee_Flag,

            ISPAC_OralTestApplFlag: 1,
            ISPAC_WrittenTestApplFlag: 1
        };

        saveMutation.mutate(payload, {
            onSuccess: () => {
                if (!initialData) form.reset();
                onSuccess();
            }
        });
    };

    const isEnquiryApplicable = form.watch('ispaC_EnquiryApplFlag') === 1;
    const isRegFeeApplicable = form.watch('ispaC_RegFeeFlag') === 1;
    const isOralTestApplicable = form.watch('ispaC_OralTestSchApplFlag') === 1;
    const isOralMarksApplicable = form.watch('ispaC_OralMarksFlag') === 1;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* General Settings */}
                    <div className='space-y-4'>
                        <CollapsibleSection title='General Settings' defaultOpen variant='outline'>
                            <FormField
                                control={form.control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {response?.academicList?.map((year) => (
                                                    <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                        {year.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isCollege && (
                                <FormField
                                    control={form.control}
                                    name='amC_Id'
                                    render={({ field }) => (
                                        <FormItem className='mt-4'>
                                            <FormLabel>Category</FormLabel>
                                            <div className='flex max-h-36 flex-col space-y-2 overflow-y-auto rounded-md border bg-muted/10 p-2'>
                                                {response?.studentlicategorylist && response.studentlicategorylist.length > 0 ? (
                                                    response.studentlicategorylist.map((cat: any) => {
                                                        const catId = Number(cat.amC_Id ?? cat.amc_Id ?? cat.AMC_Id);
                                                        const catName = cat.amC_Name ?? cat.amc_Name ?? cat.AMC_Name;
                                                        const isChecked = field.value === catId;
                                                        return (
                                                            <div
                                                                key={catId}
                                                                className='flex cursor-pointer items-center space-x-2 rounded px-2 py-1.5 hover:bg-muted/40'
                                                                onClick={() => field.onChange(isChecked ? undefined : catId)}>
                                                                <Checkbox
                                                                    id={`cat-${catId}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) =>
                                                                        field.onChange(checked ? catId : undefined)
                                                                    }
                                                                />
                                                                <label
                                                                    htmlFor={`cat-${catId}`}
                                                                    className='cursor-pointer select-none font-medium text-sm leading-none'>
                                                                    {catName}
                                                                </label>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className='p-2 text-muted-foreground text-xs italic'>
                                                        No categories found. Add categories in Master Category to see them here.
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {isCollege && (
                                <FormField
                                    control={form.control}
                                    name='amcoC_Id'
                                    render={({ field }) => (
                                        <FormItem className='mt-4'>
                                            <FormLabel>Category</FormLabel>
                                            <div className='flex max-h-36 flex-col space-y-2 overflow-y-auto rounded-md border bg-muted/10 p-2'>
                                                {response?.studentlicategorylist && response.studentlicategorylist.length > 0 ? (
                                                    response.studentlicategorylist.map((cat: any) => {
                                                        const catId = Number(cat.amcoC_Id ?? cat.amcoc_Id ?? cat.AMCOC_Id);
                                                        const catName = cat.amcoC_Name ?? cat.amcoc_Name ?? cat.AMCOC_Name;
                                                        const isChecked = field.value === catId;
                                                        return (
                                                            <div
                                                                key={catId}
                                                                className='flex cursor-pointer items-center space-x-2 rounded px-2 py-1.5 hover:bg-muted/40'
                                                                onClick={() => field.onChange(isChecked ? undefined : catId)}>
                                                                <Checkbox
                                                                    id={`col-cat-${catId}`}
                                                                    checked={isChecked}
                                                                    onCheckedChange={(checked) =>
                                                                        field.onChange(checked ? catId : undefined)
                                                                    }
                                                                />
                                                                <label
                                                                    htmlFor={`col-cat-${catId}`}
                                                                    className='cursor-pointer select-none font-medium text-sm leading-none'>
                                                                    {catName}
                                                                </label>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className='p-2 text-muted-foreground text-xs italic'>
                                                        No categories found. Add categories in Master Category to see them here.
                                                    </div>
                                                )}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </CollapsibleSection>

                        {/* Enquiry & Prospectus Settings */}
                        <CollapsibleSection title='Enquiry & Prospectus Settings' defaultOpen variant='outline'>
                            <FormField
                                control={form.control}
                                name='ispaC_EnquiryApplFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Enquiry Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {isEnquiryApplicable && (
                                <div className='ml-6 space-y-2 border-l-2 pl-4'>
                                    <FormField
                                        control={form.control}
                                        name='ispaC_EnqSMSFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value === 1}
                                                        onCheckedChange={(c) => field.onChange(c ? 1 : 0)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Enquiry SMS</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name='ispaC_EnqMailFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-center space-x-3 space-y-0'>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value === 1}
                                                        onCheckedChange={(c) => field.onChange(c ? 1 : 0)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Enquiry Email</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name='ispaC_ProsptFeeApp'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Prospectus Fees Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_ProspectusFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Prospectus Download</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </CollapsibleSection>

                        {/* General Registration Settings */}
                        <CollapsibleSection title='General Registration Settings' defaultOpen variant='outline'>
                            <FormField
                                control={form.control}
                                name='ispaC_RegFeeFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Prospectus Fee</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {/* Even if prospectus fee is unchecked, these show up in the AngularJS view but they don't seem conditionally hidden except by a bug in angular (ng-hide="Reg") which usually hides them, let's just show them */}
                            <FormField
                                control={form.control}
                                name='ispaC_RegSMSFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2 pl-6'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Registration SMS</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_RegMailFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2 pl-6'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Registration Email</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='ispaC_ApplFeeFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Application Fee Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_ApplSMSFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2 pl-6'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Application SMS</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_ApplMailFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2 pl-6'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Application Email</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_Healthapp'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Health Certificate Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='ispaC_NoofApplications'
                                render={({ field }) => (
                                    <FormItem className='mt-2 flex flex-row items-center space-x-4'>
                                        <FormLabel className='flex-1'>
                                            Maximum application can be filled by a user per class for this year:
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                className='w-20'
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='ispaC_ApplNoIncrementBy'
                                render={({ field }) => (
                                    <FormItem className='mt-2 flex flex-row items-center space-x-4'>
                                        <FormLabel className='flex-1'>Increment Application No. By:</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                className='w-20'
                                                min={0}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CollapsibleSection>
                    </div>

                    {/* Student Application Form Settings */}
                    <div className='space-y-4'>
                        <CollapsibleSection title='Student Application Form Settings' defaultOpen variant='outline'>
                            <div className='grid grid-cols-2 gap-2'>
                                <div>
                                    {[
                                        { name: 'ispaC_ApplCutOffDateFlag', label: 'Online Application Cut Off Date' },
                                        { name: 'ispaC_DOBMaxAgeFlag', label: 'Admission maximum age' },
                                        { name: 'ispaC_DOBMinAgeFlag', label: 'Admission minimum age' },
                                        { name: 'ispaC_HostelFlag', label: 'Hostel Applicable' },
                                        { name: 'ispaC_TransaportFlag', label: 'Transport Applicable' },
                                        { name: 'ispaC_SibblingConcessionFlag', label: 'Sibling concession' }
                                    ].map((item) => (
                                        <FormField
                                            key={item.name}
                                            control={form.control}
                                            name={item.name as any}
                                            render={({ field }) => (
                                                <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value === 1}
                                                            onCheckedChange={(c) => field.onChange(c ? 1 : 0)}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>{item.label}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                                <div>
                                    {[
                                        { name: 'ispaC_ParentConcessionFlag', label: 'Parent concession' },
                                        { name: 'ispaC_ECSFlag', label: 'ECS option Applicable' },
                                        { name: 'ispaC_GymFlag', label: 'Gym Applicable' },
                                        { name: 'ispaC_FatherAliveFlag', label: 'Father Alive' },
                                        { name: 'ispaC_MotherAliveFlag', label: 'Mother Alive' },
                                        { name: 'ispaC_MaritalStatusFlag', label: 'Marital Status' }
                                    ].map((item) => (
                                        <FormField
                                            key={item.name}
                                            control={form.control}
                                            name={item.name as any}
                                            render={({ field }) => (
                                                <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value === 1}
                                                            onCheckedChange={(c) => field.onChange(c ? 1 : 0)}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className='font-normal'>{item.label}</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* General Scheduling */}
                        <CollapsibleSection title='General Scheduling' defaultOpen variant='outline'>
                            <FormField
                                control={form.control}
                                name='ispaC_OralTestSchApplFlag'
                                render={({ field }) => (
                                    <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                        <FormControl>
                                            <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                        </FormControl>
                                        <FormLabel className='font-normal'>Oraltest Applicable</FormLabel>
                                    </FormItem>
                                )}
                            />

                            {isOralTestApplicable && (
                                <div className='ml-4 space-y-2 border-l-2 pl-6'>
                                    <FormField
                                        control={form.control}
                                        name='ispaC_OralTestBy'
                                        render={({ field }) => (
                                            <FormItem className='mt-2 flex flex-row items-center space-x-4'>
                                                <FormLabel className='flex-1 font-normal'>Oral test By (Numbers):</FormLabel>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString() || '0'}>
                                                    <FormControl>
                                                        <SelectTrigger className='w-24'>
                                                            <SelectValue placeholder='Select' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value='0'>Select</SelectItem>
                                                        <SelectItem value='1'>1</SelectItem>
                                                        <SelectItem value='2'>2</SelectItem>
                                                        <SelectItem value='3'>3</SelectItem>
                                                        <SelectItem value='4'>4</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name='ispaC_OralMarksFlag'
                                        render={({ field }) => (
                                            <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value === 1}
                                                        onCheckedChange={(c) => field.onChange(c ? 1 : 0)}
                                                    />
                                                </FormControl>
                                                <FormLabel className='font-normal'>Oraltest Marksentry</FormLabel>
                                            </FormItem>
                                        )}
                                    />

                                    {isOralMarksApplicable && (
                                        <FormField
                                            control={form.control}
                                            name='ispaC_OralByMax_Marks'
                                            render={({ field }) => (
                                                <FormItem className='mt-2 flex flex-row items-center space-x-4 pl-6'>
                                                    <FormLabel className='flex-1 font-normal'>Oral Max Marks:</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type='number'
                                                            className='w-24'
                                                            min={0}
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>
                            )}

                            <div className='mt-4 flex space-x-6'>
                                <FormField
                                    control={form.control}
                                    name='ispaC_WrittenTestSchApplFlag'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                            <FormControl>
                                                <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                            </FormControl>
                                            <FormLabel className='font-normal'>Writtentest Applicable</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='ispaC_CommonScheduleFlag'
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                            <FormControl>
                                                <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                            </FormControl>
                                            <FormLabel className='font-normal'>CommonSchedule Flag</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CollapsibleSection>

                        {/* Preadmission Settings */}
                        <CollapsibleSection title='Preadmission Settings' defaultOpen variant='outline'>
                            {[
                                {
                                    name: 'ispaC_Transfer_Settings_after_payment_Flag',
                                    label: 'Transfer To Admission directly while making full Payment'
                                },
                                {
                                    name: 'ispaC_AdmissionTransfer',
                                    label: 'Transfer To Admission Without Partial/Full payment Confirmation'
                                },
                                { name: 'ispaC_FeePaymentFlag', label: 'Option for fee Payment Without Admission Confirmation' },
                                { name: 'ispaC_Transfer_Settings_Flag', label: 'Admission Confirmation' },
                                { name: 'ispaC_OfflineFee_Flag', label: 'Offline Fee Applicable' }
                            ].map((item) => (
                                <FormField
                                    key={item.name}
                                    control={form.control}
                                    name={item.name as any}
                                    render={({ field }) => (
                                        <FormItem className='flex flex-row items-center space-x-3 space-y-0 p-2'>
                                            <FormControl>
                                                <Checkbox checked={field.value === 1} onCheckedChange={(c) => field.onChange(c ? 1 : 0)} />
                                            </FormControl>
                                            <FormLabel className='font-normal'>{item.label}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </CollapsibleSection>
                    </div>
                </div>

                <div className='mt-6 flex justify-center space-x-4'>
                    <Button type='submit' disabled={saveMutation.isPending} className='min-w-32'>
                        {saveMutation.isPending ? (
                            <>
                                <Spinner className='mr-2 h-4 w-4' /> Saving...
                            </>
                        ) : (
                            <>
                                <Save className='mr-2 h-4 w-4' /> Save
                            </>
                        )}
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            if (initialData) form.reset(initialData);
                            else form.reset();
                        }}
                        disabled={saveMutation.isPending}
                        className='min-w-32'>
                        <RefreshCcw className='mr-2 h-4 w-4' /> Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
