import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { DateField } from '@/components/ui/dateField';
import { FormError, Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type CollegeVacateReportSchema, collegeVacateReportSchema } from '@/schemas/hostel/reports/college-vacate-report.schema';
import { getCollegeStudentListForReport, getCollegeVacateReport } from '@/server/hostel/hostel-management/reports/college-vacate-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    initialData: {
        yerlist: any[];
        hostelist: any[];
        studentlist: any[];
        stafflist: any[];
        guestlist: any[];
    };
    onReportGenerated: (data: any[], type: string) => void;
}

export default function CollegeVacateReportForm({ initialData, onReportGenerated }: ReportFormProps) {
    const [dropdowns, setDropdowns] = useState(initialData);

    const methods = useForm<CollegeVacateReportSchema>({
        resolver: zodResolver(collegeVacateReportSchema),
        mode: 'onSubmit',
        defaultValues: {
            type: 'student',
            type2: 'all',
            ASMAY_Id: initialData.yerlist?.find((y: any) => y.asmaY_Id > 0)?.asmaY_Id || null,
            Fromdate: new Date(),
            ToDate: new Date(),
            SelectedHostellist: [],
            SelectedStudentlist: [],
            Selectedstafflist: [],
            Selectedguestlist: []
        }
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = methods;

    const selectedType = useWatch({ control, name: 'type' });
    const selectedFilter = useWatch({ control, name: 'type2' });
    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });

    // Handle Year Change for Student List
    useEffect(() => {
        if (selectedType === 'student' && selectedYear) {
            (async () => {
                const res = await getCollegeStudentListForReport(Number(selectedYear));
                if (res?.studentlist) {
                    setDropdowns((prev) => ({ ...prev, studentlist: res.studentlist }));
                }
            })();
        }
    }, [selectedType, selectedYear]);

    // Handle Type change
    useEffect(() => {
        setValue('type2', 'all');
        setValue('SelectedHostellist', []);
        setValue('SelectedStudentlist', []);
        setValue('Selectedstafflist', []);
        setValue('Selectedguestlist', []);
    }, [selectedType, setValue]);

    const onSubmit = async (data: CollegeVacateReportSchema) => {
        try {
            const res = await getCollegeVacateReport(data);
            if (res?.griddata && res.griddata.length > 0) {
                onReportGenerated(res.griddata, data.type);
            } else {
                toast.error('No records found');
                onReportGenerated([], data.type);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report');
        }
    };

    return (
        <Card className='border-none bg-transparent shadow-sm'>
            <CardContent className='p-0'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        {/* Occupant Type Radio Container */}
                        <div className='flex justify-center py-2'>
                            <div className='flex w-full max-w-4xl items-center justify-center rounded-md border bg-white px-12 py-2 shadow-sm'>
                                <Controller
                                    control={control}
                                    name='type'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-12'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='student' id='t1' />
                                                <Label htmlFor='t1' className='cursor-pointer font-medium'>
                                                    Student
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='staff' id='t2' />
                                                <Label htmlFor='t2' className='cursor-pointer font-medium'>
                                                    Staff
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='guest' id='t3' />
                                                <Label htmlFor='t3' className='cursor-pointer font-medium'>
                                                    Guest
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Academic Year */}
                        {selectedType === 'student' && (
                            <div className='flex items-center justify-center space-x-4'>
                                <Label className='w-40 text-right font-medium'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='w-[500px]'>
                                    <Controller
                                        control={control}
                                        name='ASMAY_Id'
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? String(field.value) : undefined}
                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dropdowns.yerlist?.map((y: any) => (
                                                        <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
                                                            {y.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.ASMAY_Id && <FormError>{errors.ASMAY_Id.message}</FormError>}
                                </div>
                            </div>
                        )}

                        {/* Date Range */}
                        <div className='mx-auto flex max-w-5xl items-center justify-center gap-x-8'>
                            <div className='flex items-center space-x-4'>
                                <Label className='w-32 text-right font-medium'>
                                    Start Date:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='w-64'>
                                    <Controller
                                        control={control}
                                        name='Fromdate'
                                        render={({ field, fieldState }) => (
                                            <DateField field={field} fieldState={fieldState} placeholder='Select date...' />
                                        )}
                                    />
                                </div>
                            </div>
                            <div className='flex items-center space-x-4'>
                                <Label className='w-32 text-right font-medium'>
                                    End Date:<span className='text-red-500'>*</span>
                                </Label>
                                <div className='w-64'>
                                    <Controller
                                        control={control}
                                        name='ToDate'
                                        render={({ field, fieldState }) => (
                                            <DateField field={field} fieldState={fieldState} placeholder='select date....' />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Type Radio Container */}
                        <div className='flex justify-center py-2'>
                            <div className='flex w-full max-w-4xl items-center justify-center rounded-md border bg-white px-12 py-2 shadow-sm'>
                                <Controller
                                    control={control}
                                    name='type2'
                                    render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className='flex gap-12'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='all' id='f1' />
                                                <Label htmlFor='f1' className='cursor-pointer font-medium'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Hostel' id='f2' />
                                                <Label htmlFor='f2' className='cursor-pointer font-medium'>
                                                    Hostel
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='individual' id='f3' />
                                                <Label htmlFor='f3' className='cursor-pointer font-medium'>
                                                    Individual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Multi-Select Box (Hostel/Individual) */}
                        <div className='flex justify-center'>
                            <div className='w-[500px]'>
                                {selectedFilter === 'Hostel' && (
                                    <Controller
                                        control={control}
                                        name='SelectedHostellist'
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                label='Hostel Name:'
                                                isRequired
                                                isSearchRequired
                                                options={
                                                    dropdowns.hostelist?.map((h) => ({ label: h.hlmH_Name, value: String(h.hlmH_Id) })) ||
                                                    []
                                                }
                                                value={field.value?.map((v) => String(v.HLMH_Id)) || []}
                                                onChange={(vals) => field.onChange(vals.map((v) => ({ HLMH_Id: Number(v) })))}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}

                                {selectedFilter === 'individual' && (
                                    <Controller
                                        control={control}
                                        name={
                                            selectedType === 'student'
                                                ? 'SelectedStudentlist'
                                                : selectedType === 'staff'
                                                  ? 'Selectedstafflist'
                                                  : 'Selectedguestlist'
                                        }
                                        render={({ field, fieldState }) => (
                                            <CustomMultiSelectBox
                                                label={
                                                    selectedType === 'student'
                                                        ? 'Student Name:'
                                                        : selectedType === 'staff'
                                                          ? 'Staff Name:'
                                                          : 'Guest Name:'
                                                }
                                                isRequired
                                                isSearchRequired
                                                options={
                                                    selectedType === 'student'
                                                        ? dropdowns.studentlist?.map((s) => ({
                                                              label: s.studentname,
                                                              value: String(s.amcsT_Id)
                                                          })) || []
                                                        : selectedType === 'staff'
                                                          ? dropdowns.stafflist?.map((s) => ({
                                                                label: s.hrmE_EmployeeFirstName,
                                                                value: String(s.hrmE_Id)
                                                            })) || []
                                                          : dropdowns.guestlist?.map((g) => ({
                                                                label: g.hlhgstalT_GuestName,
                                                                value: String(g.hlhgstalT_Id)
                                                            })) || []
                                                }
                                                value={
                                                    selectedType === 'student'
                                                        ? field.value?.map((v: any) => String(v.AMCST_Id)) || []
                                                        : selectedType === 'staff'
                                                          ? field.value?.map((v: any) => String(v.HRME_Id)) || []
                                                          : field.value?.map((v: any) => String(v.HLHGSTALT_Id)) || []
                                                }
                                                onChange={(vals) => {
                                                    const mapped = vals.map((v) => {
                                                        if (selectedType === 'student') return { AMCST_Id: Number(v) };
                                                        if (selectedType === 'staff') return { HRME_Id: Number(v) };
                                                        return { HLHGSTALT_Id: Number(v) };
                                                    });
                                                    field.onChange(mapped);
                                                }}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center justify-center gap-4 pt-4'>
                            <Button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-32 rounded-md bg-[#4255a7] font-bold text-white text-xs uppercase shadow-md hover:bg-[#354486]'>
                                {isSubmitting ? (
                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <FileText className='mr-1 mr-2 h-3 w-3' />
                                )}
                                REPORT
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => reset()}
                                className='w-32 rounded-md border-none bg-[#ff5c33] font-bold text-white text-xs uppercase shadow-md hover:bg-[#e64d26]'>
                                <XCircle className='mr-2 h-3 w-3' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CardContent>
        </Card>
    );
}
