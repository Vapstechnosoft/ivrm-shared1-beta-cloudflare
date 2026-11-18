'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useRegNumbering } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { transactionnumberingSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdateTransactionNumbering, deleteRollnoconfig } from '@/server/preconfiguration/transaction-numbering';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof transactionnumberingSchema>;

interface NumberingConfigUpdateFormProps {
    numberingType: string;
    onSuccess?: () => void;
    className?: string;
    selectedRow: any;
    initialData?: Partial<FormFields>;
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

const mapRowToFormData = (row: any, type: string, initialCfg?: any[]): Partial<FormFields> => {
    if (!row) return {};
    const autoManualRaw =
        row.imN_AutoManualFlag ??
        row.IMN_AutoManualFlag ??
        row.irN_AutoManualFlag ??
        row.IRN_AutoManualFlag ??
        row.ivN_AutoManualFlag ??
        row.IVN_AutoManualFlag;
    const isManual = autoManualRaw === 'M' || autoManualRaw === 'Manual';

    const duplicateRaw =
        row.imN_DuplicatesFlag ??
        row.IMN_DuplicatesFlag ??
        row.irN_DuplicatesFlag ??
        row.IRN_DuplicatesFlag ??
        row.ivN_DuplicatesFlag ??
        row.IVN_DuplicatesFlag;
    const isDuplicate = duplicateRaw === 'Y' || duplicateRaw === 'Yes' || duplicateRaw === true;

    const prefixFinYear =
        row.ivN_PrefixFinYearCode ??
        row.IVN_PrefixFinYearCode ??
        row.imN_PrefixFinYearCode ??
        row.IMN_PrefixFinYearCode ??
        row.irN_PrefixFinYearCode ??
        row.IRN_PrefixFinYearCode;

    const prefixAcadYear =
        type === 'Voucher'
            ? prefixFinYear
            : (row.imN_PrefixAcadYearCode ??
                row.IMN_PrefixAcadYearCode ??
                row.irN_PrefixAcadYearCode ??
                row.IRN_PrefixAcadYearCode ??
                prefixFinYear);

    const prefixParticular =
        row.imN_PrefixParticular ??
        row.IMN_PrefixParticular ??
        row.irN_PrefixParticular ??
        row.IRN_PrefixParticular ??
        row.ivN_PrefixParticular ??
        row.IVN_PrefixParticular ??
        '';

    const suffixFinYear =
        row.ivN_SuffixFinYearCode ??
        row.IVN_SuffixFinYearCode ??
        row.imN_SuffixFinYearCode ??
        row.IMN_SuffixFinYearCode ??
        row.irN_SuffixFinYearCode ??
        row.IRN_SuffixFinYearCode;

    const suffixAcadYear =
        type === 'Voucher'
            ? suffixFinYear
            : (row.imN_SuffixAcadYearCode ??
                row.IMN_SuffixAcadYearCode ??
                row.irN_SuffixAcadYearCode ??
                row.IRN_SuffixAcadYearCode ??
                suffixFinYear);

    const suffixParticular =
        row.imN_SuffixParticular ??
        row.IMN_SuffixParticular ??
        row.irN_SuffixParticular ??
        row.IRN_SuffixParticular ??
        row.ivN_SuffixParticular ??
        row.IVN_SuffixParticular ??
        '';

    const zeroPrefixRaw =
        row.imN_ZeroPrefixFlag ??
        row.IMN_ZeroPrefixFlag ??
        row.irN_ZeroPrefixFlag ??
        row.IRN_ZeroPrefixFlag ??
        row.ivN_ZeroPrefixFlag ??
        row.IVN_ZeroPrefixFlag;
    const zeroPrefix = zeroPrefixRaw === 'Y' || zeroPrefixRaw === 'Yes' || zeroPrefixRaw === true;

    const restartFlag =
        row.imN_RestartNumFlag ??
        row.IMN_RestartNumFlag ??
        row.irN_RestartNumFlag ??
        row.IRN_RestartNumFlag ??
        row.ivN_RestartNumFlag ??
        row.IVN_RestartNumFlag ??
        '';
    const restartFreq =
        restartFlag === 'Y' || restartFlag === 'Yearly' ? 'yearly' : restartFlag === 'M' || restartFlag === 'Monthly' ? 'monthly' : 'never';

    const widthVal =
        row.imN_WidthNumeric ??
        row.IMN_WidthNumeric ??
        row.irN_WidthNumeric ??
        row.IRN_WidthNumeric ??
        row.ivN_WidthNumeric ??
        row.IVN_WidthNumeric ??
        0;

    const startVal =
        row.imN_StartingNo ??
        row.IMN_StartingNo ??
        row.irN_StartingNo ??
        row.IRN_StartingNo ??
        row.ivN_StartingNo ??
        row.IVN_StartingNo ??
        0;

    const rawRollConfig =
        row.rollNumberingconfig && row.rollNumberingconfig.length > 0
            ? row.rollNumberingconfig
            : row.RollNumberingconfig && row.RollNumberingconfig.length > 0
                ? row.RollNumberingconfig
                : initialCfg || [];

    const mappedRollConfig = rawRollConfig.map((item: any, idx: number) => ({
        ivrmarnC_Field: item.ivrmarnC_Field ?? item.IVRMARNC_Field ?? 'AMST_FirstName',
        ivrmarnC_AscDscOrder: item.ivrmarnC_AscDscOrder ?? item.IVRMARNC_AscDscOrder ?? 'ASC',
        ivrmarnC_Order: Number(item.ivrmarnC_Order ?? item.IVRMARNC_Order ?? idx + 1),
        ivrmarnC_Id: Number(item.ivrmarnC_Id ?? item.IVRMARNC_Id ?? 0)
    }));

    return {
        auto_manual_flag: isManual ? 'Manual' : 'Auto',
        duplicates_flag: isDuplicate ? 'Yes' : 'No',
        prefix_type: prefixAcadYear ? 'academic' : prefixParticular ? 'particulars' : 'academic',
        prefix_particulars: prefixParticular,
        prefix_numeric_width: Number(widthVal),
        suffix_type: suffixAcadYear ? 'academic' : suffixParticular ? 'particulars' : 'academic',
        suffix_particulars: suffixParticular,
        suffix_starting_from: Number(startVal),
        prefix_with_zero: zeroPrefix ? 'yes' : 'no',
        restart_frequency: restartFreq,
        transaction_name: row.irN_TransactionName || row.IRN_TransactionName || '',
        restart_acad_year: !!(row.irN_RestartAcadYear ?? row.IRN_RestartAcadYear),
        restart_fin_year: !!(row.irN_RestartFinYear ?? row.IRN_RestartFinYear),
        restart_cal_year: !!(row.irN_RestartcalendYear ?? row.IRN_RestartcalendYear),
        voucher_name: row.ivN_VoucherName || row.IVN_VoucherName || row.voucherName || row.VoucherName || '',
        voucher_type: row.ivN_VoucherID || row.IVN_VoucherID || row.voucherType || row.VoucherType || '',
        rollNumberingconfig: mappedRollConfig
    };
};

export default function UpdateTransactionNumberingForm({
    numberingType,
    onSuccess,
    className = '',
    selectedRow,
    initialData
}: NumberingConfigUpdateFormProps) {
    const { refetchAll } = useRegNumbering(numberingType);
    const [isDeleting, setIsDeleting] = useState(false);

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
            rollNumberingconfig: [],
            ...initialData
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

    useEffect(() => {
        if (selectedRow) {
            reset(mapRowToFormData(selectedRow, numberingType, initialData?.rollNumberingconfig));
        }
    }, [selectedRow, reset, numberingType, initialData]);

    const handleDeleteRollConfig = async (index: number, id: number) => {
        if (id === 0) {
            remove(index);
            return;
        }
        try {
            setIsDeleting(true);
            const res = await deleteRollnoconfig(id);
            if (res?.success || res) {
                toast.success('Roll config deleted successfully');
                remove(index);
                refetchAll();
            } else {
                toast.error('Failed to delete config');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error deleting');
        } finally {
            setIsDeleting(false);
        }
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const recordId =
                selectedRow?.imN_Id ||
                selectedRow?.IMN_Id ||
                selectedRow?.irN_Id ||
                selectedRow?.IRN_Id ||
                selectedRow?.ivN_Id ||
                selectedRow?.IVN_Id ||
                0;
            const autoManualFlagVal = data.auto_manual_flag === 'Manual' ? 'Manual' : 'Auto';
            const duplicatesFlagVal = data.auto_manual_flag === 'Manual' ? (data.duplicates_flag === 'Yes' ? 'Yes' : 'No') : 'No';
            const zeroPrefixFlagVal = data.prefix_with_zero === 'yes' ? 'Yes' : 'No';
            const restartNumFlagVal =
                data.restart_frequency === 'yearly' ? 'Yearly' : data.restart_frequency === 'monthly' ? 'Monthly' : 'Never';
            const prefixAcadYear = data.prefix_type === 'academic';
            const suffixAcadYear = data.suffix_type === 'academic';
            const prefixParticular = data.prefix_type === 'particulars' ? data.prefix_particulars || '' : '';
            const suffixParticular = data.suffix_type === 'particulars' ? data.suffix_particulars || '' : '';
            const backendFlag = getBackendFlag(numberingType);

            // Default Master Payload
            let payload: any = {
                imN_Id: recordId,
                IMN_Id: recordId,
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
                imN_Flag: backendFlag,
                IMN_Flag: backendFlag,

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
                const mappedConfig = data.rollNumberingconfig?.map((item, index) => ({
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
                    rollNumberingconfig: mappedConfig,
                    RollNumberingconfig: mappedConfig
                };
            }

            const response: any = await addOrUpdateTransactionNumbering(payload);
            if (response?.success || response?.status === 200 || (!response?.message && response)) {
                toast.success('Updated Successfully');
                reset();
                await refetchAll();
                onSuccess?.();
            } else {
                toast.error(response?.message || 'Failed to update');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update configuration');
        }
    };

    const handleReset = () => {
        if (selectedRow) {
            reset(mapRowToFormData(selectedRow, numberingType, initialData?.rollNumberingconfig));
        } else {
            reset({
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
                ...initialData
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-8 rounded-lg border bg-white p-6 shadow-sm', className)}>
            {/* conditional fields for Receipt */}
            {numberingType === 'Receipt' && (
                <div className='rounded-md border bg-muted/20 p-4'>
                    <Label htmlFor='transaction_name_update'>Transaction Name</Label>
                    <Controller
                        name='transaction_name'
                        control={control}
                        render={({ field }) => <Input {...field} id='transaction_name_update' placeholder='e.g. Fee Receipt' />}
                    />
                </div>
            )}

            {/* conditional fields for Voucher */}
            {numberingType === 'Voucher' && (
                <div className='grid grid-cols-2 gap-4 rounded-md border bg-muted/20 p-4'>
                    <div>
                        <Label htmlFor='voucher_name_update'>Voucher Name</Label>
                        <Controller
                            name='voucher_name'
                            control={control}
                            render={({ field }) => <Input {...field} id='voucher_name_update' placeholder='e.g. Payment Voucher' />}
                        />
                    </div>
                    <div>
                        <Label htmlFor='voucher_type_update'>Voucher Type</Label>
                        <Controller
                            name='voucher_type'
                            control={control}
                            render={({ field }) => <Input {...field} id='voucher_type_update' placeholder='e.g. PV' />}
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
                                <RadioGroupItem value='Manual' id={`manual_${numberingType}_update`} />
                                <Label htmlFor={`manual_${numberingType}_update`} className='cursor-pointer'>
                                    Manual
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='Auto' id={`auto_${numberingType}_update`} />
                                <Label htmlFor={`auto_${numberingType}_update`} className='cursor-pointer'>
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
                                        <RadioGroupItem value='Yes' id={`dup_yes_${numberingType}_update`} />
                                        <Label htmlFor={`dup_yes_${numberingType}_update`} className='cursor-pointer'>
                                            Yes
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='No' id={`dup_no_${numberingType}_update`} />
                                        <Label htmlFor={`dup_no_${numberingType}_update`} className='cursor-pointer'>
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
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <h3 className='mb-3 font-medium text-primary'>Prefix</h3>

                            <div className='space-y-2'>
                                <Label>Prefix Type *</Label>
                                <Controller
                                    name='prefix_type'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='academic' id={`prefix-academic-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`prefix-academic-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='particulars' id={`prefix-particulars-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`prefix-particulars-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    Particulars
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {prefixType === 'particulars' && (
                                <div className='space-y-2'>
                                    <Label htmlFor={`prefix_particulars_${numberingType}_update`}>Particulars</Label>
                                    <Controller
                                        name='prefix_particulars'
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id={`prefix_particulars_${numberingType}_update`}
                                                placeholder='e.g., INV, REG'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                    {errors.prefix_particulars && <FormError>{errors.prefix_particulars.message}</FormError>}
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor={`prefix_numeric_width_${numberingType}_update`}>Width of Numeric Part</Label>
                                <Controller
                                    name='prefix_numeric_width'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={`prefix_numeric_width_${numberingType}_update`}
                                            type='number'
                                            min='1'
                                            max='10'
                                            placeholder='e.g., 4'
                                            className='w-full'
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    )}
                                />
                                {errors.prefix_numeric_width && <FormError>{errors.prefix_numeric_width.message}</FormError>}
                            </div>
                        </div>

                        {/* === SUFFIX SECTION === */}
                        <div className='space-y-4'>
                            <h3 className='mb-3 font-medium text-primary'>Suffix</h3>

                            <div className='space-y-2'>
                                <Label>Suffix Type *</Label>
                                <Controller
                                    name='suffix_type'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='academic' id={`suffix-academic-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`suffix-academic-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    {numberingType === 'Voucher' ? 'Financial Year Code' : 'Academic Year Code'}
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='particulars' id={`suffix-particulars-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`suffix-particulars-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    Particulars
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {suffixType === 'particulars' && (
                                <div className='space-y-2'>
                                    <Label htmlFor={`suffix_particulars_${numberingType}_update`}>Particulars</Label>
                                    <Controller
                                        name='suffix_particulars'
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                id={`suffix_particulars_${numberingType}_update`}
                                                placeholder='e.g., FY, SEM'
                                                className='w-full'
                                            />
                                        )}
                                    />
                                    {errors.suffix_particulars && <FormError>{errors.suffix_particulars.message}</FormError>}
                                </div>
                            )}

                            <div className='space-y-2'>
                                <Label htmlFor={`suffix_starting_from_${numberingType}_update`}>SLNO Starting From</Label>
                                <Controller
                                    name='suffix_starting_from'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id={`suffix_starting_from_${numberingType}_update`}
                                            type='number'
                                            min='1'
                                            placeholder='e.g., 1'
                                            className='w-full'
                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                        />
                                    )}
                                />
                                {errors.suffix_starting_from && <FormError>{errors.suffix_starting_from.message}</FormError>}
                            </div>
                        </div>
                    </div>
                    {/* === OTHER SETTINGS === */}
                    <div className='space-y-6 border-t pt-6'>
                        <div className='space-y-2'>
                            <Label>Prefix with Zero</Label>
                            <Controller
                                name='prefix_with_zero'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='yes' id={`prefix-zero-yes-${numberingType}-update`} />
                                            <Label
                                                htmlFor={`prefix-zero-yes-${numberingType}-update`}
                                                className='cursor-pointer font-normal'>
                                                Yes
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='no' id={`prefix-zero-no-${numberingType}-update`} />
                                            <Label
                                                htmlFor={`prefix-zero-no-${numberingType}-update`}
                                                className='cursor-pointer font-normal'>
                                                No
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='space-y-2'>
                            <Label>Restart Numbering Frequency</Label>
                            <div className='flex flex-col gap-4'>
                                <Controller
                                    name='restart_frequency'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value ?? ''} className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='never' id={`restart-never-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`restart-never-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    Never
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='yearly' id={`restart-yearly-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`restart-yearly-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    Yearly
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='monthly' id={`restart-monthly-${numberingType}-update`} />
                                                <Label
                                                    htmlFor={`restart-monthly-${numberingType}-update`}
                                                    className='cursor-pointer font-normal'>
                                                    Monthly
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />

                                {numberingType === 'Receipt' && watch('restart_frequency') === 'yearly' && (
                                    <div className='flex gap-6 pt-2'>
                                        <Controller
                                            name='restart_acad_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='restart_acad_year_u'
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor='restart_acad_year_u'>Academic Year</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name='restart_fin_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='restart_fin_year_u'
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor='restart_fin_year_u'>Financial Year</Label>
                                                </div>
                                            )}
                                        />
                                        <Controller
                                            name='restart_cal_year'
                                            control={control}
                                            render={({ field }) => (
                                                <div className='flex items-center space-x-2'>
                                                    <Checkbox
                                                        id='restart_cal_year_u'
                                                        checked={!!field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                    <Label htmlFor='restart_cal_year_u'>Calendar Year</Label>
                                                </div>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* === ROLL NUMBERING CONFIG === */}
            {numberingType === 'RollNumber' && (
                <div className='mt-6 rounded-md border bg-muted/20 p-4'>
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
                                        disabled={isDeleting}
                                        onClick={() =>
                                            handleDeleteRollConfig(
                                                index,
                                                control._formValues.rollNumberingconfig?.[index]?.ivrmarnC_Id || 0
                                            )
                                        }>
                                        <Trash2 className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === ACTION BUTTONS === */}
            <div className='mt-6 flex justify-start gap-3 border-t pt-6'>
                <Button type='button' className='w-fit' variant='outline' onClick={handleReset} disabled={isSubmitting || isDeleting}>
                    <RotateCcw className='mr-2 h-4 w-4' />
                    Reset
                </Button>
                <Button type='submit' className='w-fit' disabled={isSubmitting || isDeleting}>
                    <Save className='mr-2 h-4 w-4' />
                    {isSubmitting ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>
        </form>
    );
}
