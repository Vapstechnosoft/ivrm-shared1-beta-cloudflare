'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { onSelectGetStateApi } from '@/server/college/CollegeAdmission/Transactions/clgadmission-form';

export function AddressTab({ initialData, onNext, onBack }: { initialData: any; onNext: () => void; onBack: () => void }) {
    const { control, watch, setValue } = useFormContext();
    const [pStates, setPStates] = useState<any[]>([]);
    const [cStates, setCStates] = useState<any[]>([]);

    const sameAsPermanent = watch('chkbox_address');
    const pCountry = watch('IVRMMC_Id');
    const cCountry = watch('AMCST_ConCountryId');

    const pAddress = watch('AMCST_PerStreet');
    const pCity = watch('AMCST_PerCity');
    const pState = watch('AMCST_PerState');
    const pPin = watch('AMCST_PerPincode');

    useEffect(() => {
        if (sameAsPermanent) {
            setValue('AMCST_ConStreet', pAddress);
            setValue('AMCST_ConCountryId', pCountry);
            setValue('AMCST_ConState', pState);
            setValue('AMCST_ConCity', pCity);
            setValue('AMCST_ConPincode', pPin);
            setCStates(pStates);
        }
    }, [sameAsPermanent, pAddress, pCountry, pState, pCity, pPin]);

    return (
        <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='grid gap-8 p-0'>
                <div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
                    {/* Permanent Address */}
                    <div className='space-y-6'>
                        <div className='flex items-center gap-2 border-b pb-2 font-semibold text-primary'>
                            <MapPin className='h-5 w-5' />
                            Permanent Address
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_PerStreet'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Street Address <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='House No, Building, Street' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='IVRMMC_Id'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Country <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Country' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData.allcountry?.map((c: any) => (
                                                    <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                        {c.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name='AMCST_PerCity'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            City <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='City' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_PerState'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            State <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='State' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name='AMCST_PerPincode'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Pincode <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='6 digits' maxLength={6} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Communication Address */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between border-b pb-2'>
                            <div className='flex items-center gap-2 font-semibold text-primary'>
                                <MapPin className='h-5 w-5' />
                                Communication Address
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='same-as-p'
                                    checked={sameAsPermanent}
                                    onCheckedChange={(checked) => setValue('chkbox_address', checked)}
                                />
                                <label htmlFor='same-as-p' className='cursor-pointer font-medium text-xs'>
                                    Same as Permanent
                                </label>
                            </div>
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_ConStreet'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Street Address <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='House No, Building, Street' {...field} disabled={sameAsPermanent} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_ConCountryId'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Country <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={sameAsPermanent}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Country' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {initialData.allcountry?.map((c: any) => (
                                                    <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                        {c.ivrmmC_CountryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name='AMCST_ConCity'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            City <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='City' {...field} disabled={sameAsPermanent} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_ConState'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            State <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='State' {...field} disabled={sameAsPermanent} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name='AMCST_ConPincode'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Pincode <span className='text-destructive'>*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input placeholder='6 digits' maxLength={6} {...field} disabled={sameAsPermanent} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-between pt-6'>
                    <Button type='button' variant='outline' onClick={onBack}>
                        <ChevronLeft className='mr-2 h-4 w-4' />
                        Previous
                    </Button>
                    <Button type='button' onClick={onNext}>
                        Save and Proceed
                        <ChevronRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
