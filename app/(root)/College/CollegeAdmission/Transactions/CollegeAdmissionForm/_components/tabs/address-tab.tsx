'use client';

import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function AddressTab({ initialData, onNext, onBack }: { initialData: any, onNext: () => void, onBack: () => void }) {
    const { control, watch, setValue } = useFormContext();
    const [pStates, setPStates] = useState<any[]>([]);
    const [cStates, setCStates] = useState<any[]>([]);

    const sameAsPermanent = watch('same_as_permanent');
    const pCountry = watch('IVRMMC_Id');
    const cCountry = watch('AMCST_ConCountryId');

    const pAddress = watch('AMCST_PerStreet');
    const pArea = watch('AMCST_PerArea');
    const pCity = watch('AMCST_PerCity');
    const pState = watch('AMCST_PerState');
    const pPin = watch('AMCST_PerPincode');

    useEffect(() => {
        if (sameAsPermanent) {
            setValue('AMCST_ConStreet', pAddress);
            setValue('AMCST_ConArea', pArea);
            setValue('AMCST_ConCountryId', pCountry);
            setValue('AMCST_ConState', pState);
            setValue('AMCST_ConCity', pCity);
            setValue('AMCST_ConPincode', pPin);
            setCStates(pStates);
        }
    }, [sameAsPermanent, pAddress, pArea, pCountry, pState, pCity, pPin]);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="grid gap-8 p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Permanent Address */}
                    <div className="space-y-4">
                        <div className="bg-[#244b8a] text-white p-2 font-medium">
                            Permanent Address:
                        </div>

                        <FormField control={control} name="AMCST_PerStreet" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Permanent Address: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_PerArea" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1"></FormLabel>
                            <FormControl className="col-span-2"><Input placeholder="Area" {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="IVRMMC_Id" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Country: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData.allcountry?.map((c: any) => (<SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_PerState" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">State: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_PerCity" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">City: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_PerPincode" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Pincode: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input maxLength={6} {...field} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />
                    </div>

                    {/* Communication Address */}
                    <div className="space-y-4">
                        <div className="bg-[#244b8a] text-white p-2 font-medium">
                            Communication Address:
                        </div>

                        <FormField control={control} name="AMCST_ConStreet" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Contact Address: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={sameAsPermanent} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_ConArea" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1"></FormLabel>
                            <FormControl className="col-span-2"><Input placeholder="Area" {...field} disabled={sameAsPermanent} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_ConCountryId" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Country: <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={sameAsPermanent}><FormControl className="col-span-2"><SelectTrigger><SelectValue placeholder="" /></SelectTrigger></FormControl>
                            <SelectContent>{initialData.allcountry?.map((c: any) => (<SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>{c.ivrmmC_CountryName}</SelectItem>))}</SelectContent></Select><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_ConState" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">State: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={sameAsPermanent} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_ConCity" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">City: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input {...field} disabled={sameAsPermanent} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <FormField control={control} name="AMCST_ConPincode" render={({ field }) => (
                            <FormItem className="grid grid-cols-3 items-center gap-4"><FormLabel className="col-span-1">Pincode: <span className="text-destructive">*</span></FormLabel>
                            <FormControl className="col-span-2"><Input maxLength={6} {...field} disabled={sameAsPermanent} /></FormControl><FormMessage className="col-span-2 col-start-2" /></FormItem>
                        )} />

                        <div className="grid grid-cols-3 items-center gap-4 pt-2">
                            <div className="col-span-2 col-start-2 flex items-center space-x-2">
                                <Checkbox id="same-as-p" checked={sameAsPermanent} onCheckedChange={(checked) => setValue('same_as_permanent', checked)} />
                                <label htmlFor="same-as-p" className="text-sm font-medium leading-none cursor-pointer">
                                    Same As Permanent Address
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-4 pt-8 pb-4">
                    <Button type="button" variant="outline" className="bg-[#244b8a] text-white hover:bg-[#1a3869] hover:text-white" onClick={onBack}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        PREVIOUS
                    </Button>
                    <Button type="button" onClick={onNext} className="bg-[#244b8a] hover:bg-[#1a3869]">
                        SAVE AND PROCEED
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button type="button" variant="destructive" className="bg-[#f04a23] hover:bg-[#d03d1b]" onClick={() => window.location.reload()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        CLEAR ALL
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
