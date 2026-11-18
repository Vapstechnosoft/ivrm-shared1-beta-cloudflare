'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRegNumbering } from '@/hooks/admission/preadmission/useConfigurations';
import { transactionnumberingSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdateTransactionNumbering } from '@/server/preconfiguration/transaction-numbering';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof transactionnumberingSchema>;

interface AddTransactionNumberingFormProps {
    numberingType: string;
    onSuccess?: () => void;
    className?: string;
}

const getBackendFlag = (type: string): string => {
    switch (type) {
        case 'TC':
            return 'tcno';
        case 'OnlineBooking':
            return 'TripOnlineBooking';
        case 'Trip':
            return 'TripNo';
        case 'Leave':
            return 'LeaveNo';
        default:
            return type;
    }
};

export default function AddTransactionNumberingForm({ numberingType, onSuccess, className = '' }: AddTransactionNumberingFormProps) {
    const { refetchAll } = useRegNumbering(numberingType);
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(transactionnumberingSchema),
        defaultValues: {
            auto_manual_flag: 'Auto',
            duplicates_flag: 'No',
            prefix_type: 'academic',
            suffix_type: 'academic',
            prefix_particulars: '',
            suffix_particulars: '',
            prefix_numeric_width: 2,
            suffix_starting_from: 1,
            prefix_with_zero: 'no',
            restart_frequency: 'never',
            transaction_name: '',
            restart_acad_year: false,
            restart_fin_year: false,
            restart_cal_year: false,
            voucher_name: '',
            voucher_type: '',
            rollNumberingconfig: [{ ivrmarnC_Field: 'AMST_FirstName', ivrmarnC_AscDscOrder: 'ASC', ivrmarnC_Order: 1, ivrmarnC_Id: 0 }]
        }
    });

    const {
        fields: rollConfigFields,
        append,
        remove
    } = useFieldArray({
        control,
        name: 'rollNumberingconfig'
    });

    const prefixType = watch('prefix_type');
    const suffixType = watch('suffix_type');
    const autoManualFlag = watch('auto_manual_flag');

    const onSubmit = async (data: FormFields) => {
        try {
            const autoManualFlagVal = data.auto_manual_flag === 'Manual' ? 'Manual' : 'Auto';
            const duplicatesFlagVal = data.auto_manual_flag === 'Manual' ? (data.duplicates_flag === 'Yes' ? 'Yes' : 'No') : 'No';
            const zeroPrefixFlagVal = data.prefix_with_zero === 'yes' ? 'Yes' : 'No';
            const restartNumFlagVal =
                data.restart_frequency === 'yearly' ? 'Yearly' : data.restart_frequency === 'monthly' ? 'Monthly' : 'Never';
            const prefixAcadYear = data.prefix_type === 'academic';
            const suffixAcadYear = data.suffix_type === 'academic';
            const prefixParticular = data.prefix_type === 'particulars' ? data.prefix_particulars || '' : '';
            const suffixParticular = data.suffix_type === 'particulars' ? data.suffix_particulars || '' : '';

            // Default Master Payload
            let payload: any = {
                imN_Id: 0,
                IMN_Id: 0,
                imN_AutoManualFlag: autoManualFlagVal,
                IMN_AutoManualFlag: autoManualFlagVal,
                imN_DuplicatesFlag: duplicatesFlagVal,
                IMN_DuplicatesFlag: duplicatesFlagVal,
                imN_StartingNo: data.suffix_starting_from?.toString() || '1',
                IMN_StartingNo: data.suffix_starting_from?.toString() || '1',
                imN_WidthNumeric: data.prefix_numeric_width?.toString() || '1',
                IMN_WidthNumeric: data.prefix_numeric_width?.toString() || '1',
                imN_ZeroPrefixFlag: zeroPrefixFlagVal,
                IMN_ZeroPrefixFlag: zeroPrefixFlagVal,
                imN_PrefixParticular: prefixParticular,
                IMN_PrefixParticular: prefixParticular,
                imN_SuffixParticular: suffixParticular,
                IMN_SuffixParticular: suffixParticular,
                imN_RestartNumFlag: restartNumFlagVal,
                IMN_RestartNumFlag: restartNumFlagVal,
                imN_Flag: getBackendFlag(numberingType),
                IMN_Flag: getBackendFlag(numberingType),

                // Defaults for Master
                imN_PrefixAcadYearCode: prefixAcadYear,
                IMN_PrefixAcadYearCode: prefixAcadYear,
                imN_PrefixFinYearCode: false,
                IMN_PrefixFinYearCode: false,
                imN_PrefixCalYearCode: false,
                IMN_PrefixCalYearCode: false,
                imN_SuffixAcadYearCode: suffixAcadYear,
                IMN_SuffixAcadYearCode: suffixAcadYear,
                imN_SuffixFinYearCode: false,
                IMN_SuffixFinYearCode: false,
                imN_SuffixCalYearCode: false,
                IMN_SuffixCalYearCode: false
            };

            if (numberingType === 'Receipt') {
                payload = {
                    ...payload,
                    irN_TransactionName: data.transaction_name,
                    IRN_TransactionName: data.transaction_name,
                    irN_RestartAcadYear: !!data.restart_acad_year,
                    IRN_RestartAcadYear: !!data.restart_acad_year,
                    irN_RestartFinYear: !!data.restart_fin_year,
                    IRN_RestartFinYear: !!data.restart_fin_year,
                    irN_RestartcalendYear: !!data.restart_cal_year,
                    IRN_RestartcalendYear: !!data.restart_cal_year
                };
            } else if (numberingType === 'Voucher') {
                payload = {
                    ...payload,
                    voucherName: data.voucher_name,
                    VoucherName: data.voucher_name,
                    voucherType: data.voucher_type,
                    VoucherType: data.voucher_type,
                    imN_PrefixAcadYearCode: false,
                    IMN_PrefixAcadYearCode: false,
                    imN_PrefixFinYearCode: prefixAcadYear,
                    IMN_PrefixFinYearCode: prefixAcadYear,
                    imN_SuffixAcadYearCode: false,
                    IMN_SuffixAcadYearCode: false,
                    imN_SuffixFinYearCode: suffixAcadYear,
                    IMN_SuffixFinYearCode: suffixAcadYear
                };
            } else if (numberingType === 'RollNumber') {
                const mappedRollConfig = data.rollNumberingconfig?.map((item, index) => ({
                    ivrmarnC_Field: item.ivrmarnC_Field,
                    IVRMARNC_Field: item.ivrmarnC_Field,
                    ivrmarnC_AscDscOrder: item.ivrmarnC_AscDscOrder,
                    IVRMARNC_AscDscOrder: item.ivrmarnC_AscDscOrder,
                    ivrmarnC_Order: item.ivrmarnC_Order || index + 1,
                    IVRMARNC_Order: item.ivrmarnC_Order || index + 1,
                    ivrmarnC_Id: item.ivrmarnC_Id || 0,
                    IVRMARNC_Id: item.ivrmarnC_Id || 0
                }));
                payload = {
                    ...payload,
                    rollNumberingconfig: mappedRollConfig,
                    RollNumberingconfig: mappedRollConfig
                };
            }

            const response = await addOrUpdateTransactionNumbering(payload);
            if (response.success || response) {
                toast.success('Saved Successfully');
                reset();
                await refetchAll();
                onSuccess?.();
            } else {
                toast.error('Failed to save');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save configuration');
        }
    };

    const handleReset = () => reset();

    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* conditional fields for Receipt */}
                    {numberingType === 'Receipt' && (
                        <div className='rounded-md border bg-muted/20 p-4'>
                            <Label htmlFor='transaction_name'>Transaction Name</Label>
                            <Controller
                                name='transaction_name'
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} value={field.value ?? ''} id='transaction_name' placeholder='e.g. Fee Receipt' />
                                )}
                            />
                        </div>
                    )}

                    {/* conditional fields for Voucher */}
                    {numberingType === 'Voucher' && (
                        <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                            <div>
                                <Label htmlFor='voucher_name'>Voucher Name</Label>
                                <Controller
                                    name='voucher_name'
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} value={field.value ?? ''} id='voucher_name' placeholder='e.g. Payment Voucher' />
                                    )}
                                />
                            </div>
                            <div>
                                <Label htmlFor='voucher_type'>Voucher Type</Label>
                                <Controller
                                    name='voucher_type'
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} value={field.value ?? ''} id='voucher_type' placeholder='e.g. PV' />
                                    )}
                                />
                            </div>
                        </div>
                    )}

                    {/* === AUTO / MANUAL SELECTION === */}
                    <div className='flex items-start gap-8 rounded-md border bg-muted/20 p-4'>
                        <Label className='mt-1 font-medium text-primary'>
                            Please Select Radio Button <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='auto_manual_flag'
                            control={control}
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Manual' id={`manual_${numberingType}`} />
                                        <Label htmlFor={`manual_${numberingType}`} className='cursor-pointer'>
                                            Manual
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='Auto' id={`auto_${numberingType}`} />
                                        <Label htmlFor={`auto_${numberingType}`} className='cursor-pointer'>
                                            Auto
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    {/* === MANUAL SETTINGS === */}
                    {autoManualFlag === 'Manual' && (
                        <div className='flex items-start gap-8 rounded-md border bg-muted/20 p-4'>
                            <Label className='mt-1 font-medium text-primary'>
                                Prevent Duplicate: <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                name='duplicates_flag'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Yes' id={`dup_yes_${numberingType}`} />
                                                <Label htmlFor={`dup_yes_${numberingType}`} className='cursor-pointer'>
                                                    Yes
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='No' id={`dup_no_${numberingType}`} />
                                                <Label htmlFor={`dup_no_${numberingType}`} className='cursor-pointer'>
                                                    No
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        {errors.duplicates_flag && <FormError>{errors.duplicates_flag.message}</FormError>}
                                    </div>
                                )}
                            />
                        </div>
                    )}

                    {/* === AUTO SETTINGS === */}
                    {autoManualFlag === 'Auto' && (
                        <>
                            {/* === PREFIX SECTION === */}
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <h3 className='mb-3 font-medium text-primary'>Prefix</h3>

                                    <Controller
                                        name='prefix_type'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                                className='flex items-center gap-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='academic' id={`prefix_academic_${numberingType}`} />
                                                    <Label
                                                        htmlFor={`prefix_academic_${numberingType}`}
                                                        className='cursor-pointer font-normal'>
                                                        {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='particulars' id={`prefix_particulars_${numberingType}`} />
                                                    <Label
                                                        htmlFor={`prefix_particulars_${numberingType}`}
                                                        className='cursor-pointer font-normal'>
                                                        Particulars
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />

                                    <div className='mt-4 '>
                                        <div className='space-y-1'>
                                            <Label htmlFor={`prefix_particulars_input_${numberingType}`}>Particulars</Label>
                                            <Controller
                                                name='prefix_particulars'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        id={`prefix_particulars_input_${numberingType}`}
                                                        placeholder=''
                                                        disabled={prefixType !== 'particulars'}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className='mt-3'>
                                            <Label htmlFor={`prefix_numeric_width_${numberingType}`}>Width of numeric Part:</Label>
                                            <Controller
                                                name='prefix_numeric_width'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        id={`prefix_numeric_width_${numberingType}`}
                                                        type='number'
                                                        placeholder='2'
                                                        min='1'
                                                        max='10'
                                                        className='w-full'
                                                    />
                                                )}
                                            />
                                            {errors.prefix_numeric_width && <FormError>{errors.prefix_numeric_width.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                {/* === SUFFIX SECTION === */}
                                <div className='rounded-md border bg-muted/20 p-4'>
                                    <h3 className='mb-3 font-medium text-primary'>Suffix</h3>

                                    <Controller
                                        name='suffix_type'
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value ?? ''}
                                                className='flex items-center gap-6'>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='academic' id={`suffix_academic_${numberingType}`} />
                                                    <Label
                                                        htmlFor={`suffix_academic_${numberingType}`}
                                                        className='cursor-pointer font-normal'>
                                                        {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                    </Label>
                                                </div>
                                                <div className='flex items-center space-x-2'>
                                                    <RadioGroupItem value='particulars' id={`suffix_particulars_${numberingType}`} />
                                                    <Label
                                                        htmlFor={`suffix_particulars_${numberingType}`}
                                                        className='cursor-pointer font-normal'>
                                                        Particulars
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />

                                    <div className='mt-4 '>
                                        <div className='space-y-1'>
                                            <Label htmlFor={`suffix_particulars_input_${numberingType}`}>Particulars</Label>
                                            <Controller
                                                name='suffix_particulars'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        id={`suffix_particulars_input_${numberingType}`}
                                                        placeholder=''
                                                        disabled={suffixType !== 'particulars'}
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div className='mt-3'>
                                            <Label htmlFor={`suffix_starting_from_${numberingType}`}>SLNO Starting From:</Label>
                                            <Controller
                                                name='suffix_starting_from'
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        value={field.value ?? ''}
                                                        id={`suffix_starting_from_${numberingType}`}
                                                        type='number'
                                                        placeholder='1'
                                                        min='1'
                                                        className='w-full'
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* === PREFIX WITH ZERO === */}
                            <div className='flex items-start gap-8 rounded-md border bg-muted/20 p-4'>
                                <Label className='font-medium text-primary'>Prefix with Zero:</Label>
                                <Controller
                                    name='prefix_with_zero'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='yes' id={`zero_yes_${numberingType}`} />
                                                <Label htmlFor={`zero_yes_${numberingType}`} className='cursor-pointer'>
                                                    Yes
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='no' id={`zero_no_${numberingType}`} />
                                                <Label htmlFor={`zero_no_${numberingType}`} className='cursor-pointer'>
                                                    No
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* === RESTART NUMBERING === */}
                            <div className='rounded-md border bg-muted/20 p-4'>
                                <h3 className='mb-3 font-medium text-primary'>Restart Numbering</h3>
                                <div className='flex flex-col gap-4'>
                                    <div className='flex items-center gap-8'>
                                        <Label className='text-sm'>Frequency:</Label>
                                        <Controller
                                            name='restart_frequency'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='never' id={`freq_never_${numberingType}`} />
                                                        <Label htmlFor={`freq_never_${numberingType}`} className='cursor-pointer'>
                                                            Never
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='yearly' id={`freq_yearly_${numberingType}`} />
                                                        <Label htmlFor={`freq_yearly_${numberingType}`} className='cursor-pointer'>
                                                            Yearly
                                                        </Label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='monthly' id={`freq_monthly_${numberingType}`} />
                                                        <Label htmlFor={`freq_monthly_${numberingType}`} className='cursor-pointer'>
                                                            Monthly
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    {numberingType === 'Receipt' && watch('restart_frequency') === 'yearly' && (
                                        <div className='flex gap-6 pt-2'>
                                            <Controller
                                                name='restart_acad_year'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='restart_acad_year'
                                                            checked={!!field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor='restart_acad_year'>Academic Year</Label>
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name='restart_fin_year'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='restart_fin_year'
                                                            checked={!!field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor='restart_fin_year'>Financial Year</Label>
                                                    </div>
                                                )}
                                            />
                                            <Controller
                                                name='restart_cal_year'
                                                control={control}
                                                render={({ field }) => (
                                                    <div className='flex items-center space-x-2'>
                                                        <Checkbox
                                                            id='restart_cal_year'
                                                            checked={!!field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                        <Label htmlFor='restart_cal_year'>Calendar Year</Label>
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* === ROLL NUMBERING CONFIG === */}
                    {numberingType === 'RollNumber' && (
                        <div className='rounded-md border bg-muted/20 p-4'>
                            <div className='mb-3 flex items-center justify-between'>
                                <h3 className='font-medium text-primary'>Roll Numbering Configuration</h3>
                                <Button
                                    type='button'
                                    size='sm'
                                    variant='outline'
                                    onClick={() =>
                                        append({
                                            ivrmarnC_Field: 'AMST_FirstName',
                                            ivrmarnC_AscDscOrder: 'ASC',
                                            ivrmarnC_Order: rollConfigFields.length + 1,
                                            ivrmarnC_Id: 0
                                        })
                                    }>
                                    <Plus className='mr-1 h-4 w-4' /> Add Rule
                                </Button>
                            </div>

                            <div className='space-y-3'>
                                {rollConfigFields.map((field, index) => (
                                    <div key={field.id} className='flex items-center gap-4 rounded-md border bg-white p-2 shadow-sm'>
                                        <div className='flex-1'>
                                            <Label className='text-muted-foreground text-xs'>Field to sort</Label>
                                            <Controller
                                                name={`rollNumberingconfig.${index}.ivrmarnC_Field`}
                                                control={control}
                                                render={({ field: inputField }) => (
                                                    <select
                                                        {...inputField}
                                                        value={inputField.value ?? ''}
                                                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'>
                                                        <option value='AMST_FirstName'>First Name</option>
                                                        <option value='AMST_AdmNo'>Admission Number</option>
                                                        <option value='AMST_RegistrationNo'>Registration Number</option>
                                                        <option value='AMST_Date'>Date</option>
                                                    </select>
                                                )}
                                            />
                                        </div>
                                        <div className='flex-1'>
                                            <Label className='text-muted-foreground text-xs'>Order</Label>
                                            <Controller
                                                name={`rollNumberingconfig.${index}.ivrmarnC_AscDscOrder`}
                                                control={control}
                                                render={({ field: inputField }) => (
                                                    <select
                                                        {...inputField}
                                                        value={inputField.value ?? ''}
                                                        className='flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'>
                                                        <option value='ASC'>Ascending (ASC)</option>
                                                        <option value='DESC'>Descending (DESC)</option>
                                                    </select>
                                                )}
                                            />
                                        </div>
                                        <div className='flex items-end'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='icon'
                                                className='mb-0.5 text-destructive'
                                                onClick={() => remove(index)}>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* === ACTION BUTTONS === */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        // @ts-ignore – assuming Button has isLoading
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
