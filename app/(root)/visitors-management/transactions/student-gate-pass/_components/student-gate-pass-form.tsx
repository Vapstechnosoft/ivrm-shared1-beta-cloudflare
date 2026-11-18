'use client';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useStudentGatePass } from '@/hooks/visitors-management/transactions/useStudentGatePass';
import type { StudentGatePassData } from '@/types/visitors-management/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
    gphS_Id: z.number().optional(),
    asmaY_Id: z.number().min(1, 'Academic Year is required'),
    asmcL_Id: z.number().min(1, 'Class is required'),
    asmS_Id: z.number().min(1, 'Section is required'),
    amsT_Id: z.number().min(1, 'Student is required'),
    gphS_DateTime: z.date({
        required_error: 'Date is required'
    }),
    gphS_IDCardNo: z.string().optional(),
    gphS_ReceiverName: z.string().min(1, 'Receiver Name is required'),
    gphS_ReceiverPhoneNo: z.string().min(10, 'Valid Phone No is required'),
    gphS_ReceiverIdProof: z.string().min(1, 'ID Proof Type is required'),
    gphS_ReceiverIdProofNo: z.string().min(1, 'ID Proof No is required'),
    gphS_Remarks: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

interface StudentGatePassFormProps {
    onSuccess: () => void;
    academicYears: any[];
}

export default function StudentGatePassForm({ onSuccess, academicYears }: StudentGatePassFormProps) {
    const { selectedRow: formData } = useFormContext<StudentGatePassData>();
    const { saveStudentGatePass, isSaving, getGatePassClasses, getGatePassSections, getGatePassStudents } = useStudentGatePass();

    const isEditMode = !!formData?.gphS_Id;

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);

    const defaultYear = academicYears.find((y) => y.Selected)?.asmaY_Id || academicYears[0]?.asmaY_Id || 0;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gphS_Id: formData?.gphS_Id || 0,
            asmaY_Id: formData?.asmaY_Id || defaultYear,
            asmcL_Id: formData?.asmcL_Id || 0,
            asmS_Id: formData?.asmS_Id || 0,
            amsT_Id: formData?.amsT_Id || 0,
            gphS_DateTime: formData?.gphS_DateTime ? new Date(formData.gphS_DateTime) : new Date(),
            gphS_IDCardNo: formData?.gphS_IDCardNo || '',
            gphS_ReceiverName: formData?.gphS_ReceiverName || '',
            gphS_ReceiverPhoneNo: formData?.gphS_ReceiverPhoneNo || '',
            gphS_ReceiverIdProof: formData?.gphS_ReceiverIdProof || '',
            gphS_ReceiverIdProofNo: formData?.gphS_ReceiverIdProofNo || '',
            gphS_Remarks: formData?.gphS_Remarks || ''
        }
    });

    const watchYear = form.watch('asmaY_Id');
    const watchClass = form.watch('asmcL_Id');
    const watchSection = form.watch('asmS_Id');

    // Fetch Classes
    useEffect(() => {
        const fetchClasses = async () => {
            if (watchYear > 0) {
                setIsLoadingClasses(true);
                try {
                    const res = await getGatePassClasses(watchYear);
                    if (res.success) {
                        setClasses(res.data.classList || []);
                    }
                } finally {
                    setIsLoadingClasses(false);
                }
            } else {
                setClasses([]);
            }
        };
        fetchClasses();
    }, [watchYear]);

    // Fetch Sections
    useEffect(() => {
        const fetchSections = async () => {
            if (watchYear > 0 && watchClass > 0) {
                setIsLoadingSections(true);
                try {
                    const res = await getGatePassSections(watchYear, watchClass);
                    if (res.success) {
                        setSections(res.data.sectionList || []);
                    }
                } finally {
                    setIsLoadingSections(false);
                }
            } else {
                setSections([]);
            }
        };
        fetchSections();
    }, [watchYear, watchClass]);

    // Fetch Students
    useEffect(() => {
        const fetchStudents = async () => {
            if (watchYear > 0 && watchClass > 0 && watchSection > 0) {
                setIsLoadingStudents(true);
                try {
                    const res = await getGatePassStudents(watchYear, watchClass, watchSection);
                    if (res.success) {
                        setStudents(res.data.studentlist || []);
                    }
                } finally {
                    setIsLoadingStudents(false);
                }
            } else {
                setStudents([]);
            }
        };
        fetchStudents();
    }, [watchYear, watchClass, watchSection]);

    const onSubmit = async (data: FormValues) => {
        const submitData = {
            ...data,
            gphS_DateTime: data.gphS_DateTime.toISOString()
        };

        await saveStudentGatePass(submitData);
        onSuccess();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                <h3 className='border-b pb-2 font-semibold text-primary text-sm uppercase'>Student Details</h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4'>
                    <FormField
                        control={form.control}
                        name='asmaY_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Academic Year <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        form.setValue('asmcL_Id', 0);
                                        form.setValue('asmS_Id', 0);
                                        form.setValue('amsT_Id', 0);
                                    }}
                                    value={field.value ? field.value.toString() : ''}
                                    disabled={isEditMode}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Year' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {academicYears.map((year) => (
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
                        control={form.control}
                        name='asmcL_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Class <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        form.setValue('asmS_Id', 0);
                                        form.setValue('amsT_Id', 0);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                    disabled={isEditMode || isLoadingClasses || classes.length === 0}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingClasses ? 'Loading...' : 'Select Class'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='asmS_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Section <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(Number(val));
                                        form.setValue('amsT_Id', 0);
                                    }}
                                    value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                    disabled={isEditMode || isLoadingSections || sections.length === 0}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingSections ? 'Loading...' : 'Select Section'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sections.map((s) => (
                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                {s.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='amsT_Id'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Student <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                    disabled={isEditMode || isLoadingStudents || students.length === 0}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={isLoadingStudents ? 'Loading...' : 'Select Student'} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {students.map((st) => (
                                            <SelectItem key={st.amsT_Id} value={st.amsT_Id.toString()}>
                                                {st.studentname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h3 className='border-b pt-4 pb-2 font-semibold text-primary text-sm uppercase'>Gate Pass Details</h3>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <FormField
                        control={form.control}
                        name='gphS_DateTime'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Date <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <DatePicker date={field.value} setDate={field.onChange} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_IDCardNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Card No</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Card No' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_ReceiverName'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Receiver Name <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Receiver Name' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_ReceiverPhoneNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Receiver Phone No <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter Mobile Number' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_ReceiverIdProof'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    ID Proof Type <span className='text-destructive'>*</span>
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select ID Proof' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value='Aadhar Card'>Aadhar Card</SelectItem>
                                        <SelectItem value='Voter Id'>Voter Id</SelectItem>
                                        <SelectItem value='DL'>Driving License</SelectItem>
                                        <SelectItem value='Passport'>Passport</SelectItem>
                                        <SelectItem value='Others'>Others</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_ReceiverIdProofNo'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    ID Proof No <span className='text-destructive'>*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder='Enter ID Proof No' />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='gphS_Remarks'
                        render={({ field }) => (
                            <FormItem className='md:col-span-2 lg:col-span-3'>
                                <FormLabel>Remarks</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder='Enter remarks (optional)...' rows={2} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='mt-6 flex justify-end gap-4 border-t pt-4'>
                    <Button type='button' variant='outline' onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={isSaving}>
                        {isSaving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
}
