'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export function ParentsTab({ initialData, onNext, onBack }: { initialData: any; onNext: () => void; onBack: () => void }) {
    const { control, watch, setValue } = useFormContext();

    return (
        <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='grid gap-12 p-0'>
                <div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
                    {/* Father's Details */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between border-b pb-2'>
                            <div className='flex items-center gap-2 font-semibold text-primary'>
                                <User className='h-5 w-5' />
                                Father's Details
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='father-alive'
                                    checked={watch('AMCST_FatherAliveFlag')}
                                    onCheckedChange={(checked) => setValue('AMCST_FatherAliveFlag', checked)}
                                />
                                <label htmlFor='father-alive' className='cursor-pointer font-medium text-xs'>
                                    Alive
                                </label>
                            </div>
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_FatherName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Father's Name <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Full Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_FatherAadharNo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aadhaar No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder='12 digits' maxLength={12} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name='AMCST_FatherEducation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qualification</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Degree' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_FatherOccupation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Occupation' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name='AMCST_FatherMonIncome'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Income</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Amount' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_FatherNationality'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nationality <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Nationality' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData.allcountry?.map((c: any) => (
                                                <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                    {c.ivrmmC_Nationality}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Mother's Details */}
                    <div className='space-y-6'>
                        <div className='flex items-center justify-between border-b pb-2'>
                            <div className='flex items-center gap-2 font-semibold text-primary'>
                                <User className='h-5 w-5' />
                                Mother's Details
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='mother-alive'
                                    checked={watch('AMCST_MotherAliveFlag')}
                                    onCheckedChange={(checked) => setValue('AMCST_MotherAliveFlag', checked)}
                                />
                                <label htmlFor='mother-alive' className='cursor-pointer font-medium text-xs'>
                                    Alive
                                </label>
                            </div>
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_MotherName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Mother's Name <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder='Full Name' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_MotherAadharNo'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aadhaar No.</FormLabel>
                                        <FormControl>
                                            <Input placeholder='12 digits' maxLength={12} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name='AMCST_MotherEducation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Qualification</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Degree' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <FormField
                                control={control}
                                name='AMCST_MotherOccupation'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Occupation</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Occupation' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name='AMCST_MotherMonIncome'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Income</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Amount' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={control}
                            name='AMCST_MotherNationality'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nationality <span className='text-destructive'>*</span>
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Nationality' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {initialData.allcountry?.map((c: any) => (
                                                <SelectItem key={c.ivrmmC_Id} value={c.ivrmmC_Id.toString()}>
                                                    {c.ivrmmC_Nationality}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
