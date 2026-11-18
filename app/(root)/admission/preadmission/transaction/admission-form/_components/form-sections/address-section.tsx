'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface AddressSectionProps {
    country: any[];
    allState: any[];
    conDistrict: any[];
    perDistrict: any[];
    sameAsResidential: boolean;
    setSameAsResidential: (val: boolean) => void;
    conZipLength?: number;
    perZipLength?: number;
}

export function AddressSection({
    country,
    allState,
    conDistrict,
    perDistrict,
    sameAsResidential,
    setSameAsResidential,
    conZipLength,
    perZipLength
}: AddressSectionProps) {
    const {
        register,
        control,
        watch,
        setValue,
        getValues,
        trigger,
        clearErrors,
        formState: { errors }
    } = useFormContext();

    const conCountryId = watch('amsT_ConCountry');
    const conStateId = watch('amsT_ConState');
    const perCountryId = watch('amsT_PerCountry');
    const perStateId = watch('amsT_PerState');

    const conStates = useMemo(() => {
        if (!conCountryId) return [];
        return allState.filter((s: any) => Number(s.ivrmmC_Id) === Number(conCountryId));
    }, [allState, conCountryId]);

    const perStates = useMemo(() => {
        if (!perCountryId) return [];
        return allState.filter((s: any) => Number(s.ivrmmC_Id) === Number(perCountryId));
    }, [allState, perCountryId]);

    // Sync logic
    const handleSameAsResidential = (checked: boolean) => {
        setSameAsResidential(checked);
        if (checked) {
            const residentialValues = {
                street: getValues('amsT_ConStreet') || '',
                area: getValues('amsT_ConArea') || '',
                country: Number(getValues('amsT_ConCountry') || 0),
                state: getValues('amsT_ConState'),
                district: getValues('amsT_ConDistrict'),
                city: getValues('amsT_ConCity') || '',
                pincode: getValues('amsT_ConPincode') || ''
            };

            setValue('amsT_PerStreet', residentialValues.street, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerArea', residentialValues.area, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerCountry', residentialValues.country, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerState', residentialValues.state, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerDistrict', residentialValues.district, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerCity', residentialValues.city, { shouldValidate: true, shouldDirty: true });
            setValue('amsT_PerPincode', residentialValues.pincode, { shouldValidate: true, shouldDirty: true });

            trigger([
                'amsT_PerStreet',
                'amsT_PerArea',
                'amsT_PerCountry',
                'amsT_PerState',
                'amsT_PerDistrict',
                'amsT_PerCity',
                'amsT_PerPincode'
            ]);
        }
    };

    return (
        <div className='space-y-8'>
            {/* Residential Address */}
            <div className='space-y-4'>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h3 className='flex items-center gap-2 font-semibold text-lg'>Residential Address</h3>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <Label>
                            Street <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_ConStreet')} placeholder='House No, Street Name' />
                        {errors.amsT_ConStreet && <FormError>{errors.amsT_ConStreet.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Area <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_ConArea')} placeholder='Area/Locality' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Country <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_ConCountry'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('amsT_ConState', 0);
                                        setValue('amsT_ConDistrict', 0);
                                    }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Country' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {country.map((item: any) => (
                                            <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                {item.ivrmmC_CountryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            State <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_ConState'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('amsT_ConDistrict', 0);
                                    }}
                                    disabled={!conCountryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select State' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conStates.map((item: any) => (
                                            <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                {item.ivrmmS_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            District <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_ConDistrict'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    disabled={!conStateId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select District' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conDistrict?.map((item: any) => (
                                            <SelectItem key={item.ivrmmD_Id} value={item.ivrmmD_Id.toString()}>
                                                {item.ivrmmD_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            City <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_ConCity')} placeholder='City Name' />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Pincode <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_ConPincode')} placeholder='Pincode' maxLength={conZipLength || 6} />
                        {errors.amsT_ConPincode && <FormError>{errors.amsT_ConPincode.message as string}</FormError>}
                    </div>
                </div>
            </div>

            <div className='flex items-center space-x-2 rounded-lg bg-muted/30 px-4 py-2'>
                <Checkbox
                    id='sameAsResidential'
                    checked={sameAsResidential}
                    onCheckedChange={(checked) => handleSameAsResidential(!!checked)}
                />
                <Label htmlFor='sameAsResidential' className='font-semibold text-primary'>
                    Permanent Address same as Residential Address?
                </Label>
            </div>

            {/* Permanent Address */}
            <div
                className={cn(
                    'space-y-4 transition-all duration-300',
                    sameAsResidential ? 'pointer-events-none opacity-50 grayscale-[0.5]' : 'opacity-100'
                )}>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h3 className='font-semibold text-lg'>Permanent Address</h3>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <Label>
                            Street <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_PerStreet')} placeholder='House No, Street Name' readOnly={sameAsResidential} />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Area <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_PerArea')} placeholder='Area/Locality' readOnly={sameAsResidential} />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Country <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_PerCountry'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('amsT_PerState', 0);
                                        setValue('amsT_PerDistrict', 0);
                                    }}
                                    disabled={sameAsResidential}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Country' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {country.map((item: any) => (
                                            <SelectItem key={item.ivrmmC_Id} value={item.ivrmmC_Id.toString()}>
                                                {item.ivrmmC_CountryName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            State <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_PerState'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        setValue('amsT_PerDistrict', 0);
                                    }}
                                    disabled={sameAsResidential || !perCountryId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select State' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perStates.map((item: any) => (
                                            <SelectItem key={item.ivrmmS_Id} value={item.ivrmmS_Id.toString()}>
                                                {item.ivrmmS_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            District <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_PerDistrict'
                            control={control}
                            render={({ field }) => (
                                <Select
                                    value={field.value?.toString() || ''}
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    disabled={sameAsResidential || !perStateId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select District' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {perDistrict?.map((item: any) => (
                                            <SelectItem key={item.ivrmmD_Id} value={item.ivrmmD_Id.toString()}>
                                                {item.ivrmmD_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            City <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_PerCity')} placeholder='City Name' readOnly={sameAsResidential} />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Pincode <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText
                            {...register('amsT_PerPincode')}
                            placeholder='Pincode'
                            maxLength={perZipLength || 6}
                            readOnly={sameAsResidential}
                        />
                        {errors.amsT_PerPincode && <FormError>{errors.amsT_PerPincode.message as string}</FormError>}
                    </div>
                </div>
            </div>
        </div>
    );
}
