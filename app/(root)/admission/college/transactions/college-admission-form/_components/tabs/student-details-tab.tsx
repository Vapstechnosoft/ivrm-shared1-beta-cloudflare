'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { onCourseChange, onBranchChange, getCasteByCategory } from '@/server/college/CollegeAdmission/Transactions/clgadmission-form';

export function StudentDetailsTab({ initialData, onNext }: { initialData: any; onNext: () => void }) {
    const { control, watch, setValue } = useFormContext();
    const [courses, setCourses] = useState(initialData.courses || []);
    const [branches, setBranches] = useState(initialData.branches || []);
    const [semesters, setSemesters] = useState(initialData.semesters || []);
    const [castes, setCastes] = useState(initialData.allCaste || []);

    const selectedCourse = watch('AMCO_Id');
    const selectedBranch = watch('AMB_Id');
    const selectedCasteCategory = watch('IMCC_Id');
    const selectedYear = watch('ASMAY_Id');

    useEffect(() => {
        if (selectedCourse) {
            handleCourseChange(selectedCourse);
        }
    }, [selectedCourse]);

    useEffect(() => {
        if (selectedBranch) {
            handleBranchChange(selectedBranch);
        }
    }, [selectedBranch]);

    useEffect(() => {
        if (selectedCasteCategory) {
            handleCasteCategoryChange(selectedCasteCategory);
        }
    }, [selectedCasteCategory]);

    const handleCourseChange = async (courseId: string) => {
        if (!selectedYear) return;
        const res = await onCourseChange(Number(selectedYear), Number(courseId));
        if (res.success && res.data) {
            setBranches(res.data.branches || []);
            setValue('AMB_Id', '');
            setValue('AMSE_Id', '');
        }
    };

    const handleBranchChange = async (branchId: string) => {
        if (!selectedYear) return;
        const res = await onBranchChange(Number(selectedYear), Number(branchId), 0);
        if (res.success && res.data) {
            setSemesters(res.data.semesters || []);
            setValue('AMSE_Id', '');
        }
    };

    const handleCasteCategoryChange = async (categoryId: string) => {
        const res = await getCasteByCategory(Number(categoryId));
        if (res.success && res.data) {
            setCastes(res.data || []);
            setValue('IMC_Id', '');
        }
    };

    return (
        <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='grid gap-6 p-0'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {/* Basic Fields */}
                    <FormField
                        control={control}
                        name='AMCST_FirstName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Student Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder='First Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name='AMCST_LastName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Last Name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name='ASMAY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {initialData.allAcademicYear?.map((year: any) => (
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

                    <FormField
                        control={control}
                        name='AMCO_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Course <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Course' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {courses.map((course: any) => (
                                            <SelectItem key={course.amcO_Id} value={course.amcO_Id.toString()}>
                                                {course.courseName}
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
                        name='AMB_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Branch <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourse}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Branch' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {branches.map((branch: any) => (
                                            <SelectItem key={branch.amB_Id} value={branch.amB_Id.toString()}>
                                                {branch.branchName}
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
                        name='AMSE_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Semester <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBranch}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Semester' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {semesters.map((sem: any) => (
                                            <SelectItem key={sem.amsE_Id} value={sem.amsE_Id.toString()}>
                                                {sem.semesterName}
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
                        name='AMCST_Date'
                        render={({ field }) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel className='mb-2'>
                                    Admission Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-full pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}>
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name='AMCST_Sex'
                        render={({ field }) => (
                            <FormItem className='space-y-3'>
                                <FormLabel>
                                    Gender <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex flex-row space-x-4'>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Male' />
                                            </FormControl>
                                            <FormLabel className='font-normal'>Male</FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Female' />
                                            </FormControl>
                                            <FormLabel className='font-normal'>Female</FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-2 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem value='Other' />
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

                <div className='flex justify-end pt-6'>
                    <Button type='button' onClick={onNext}>
                        Save and Proceed
                        <ChevronRight className='ml-2 h-4 w-4' />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
