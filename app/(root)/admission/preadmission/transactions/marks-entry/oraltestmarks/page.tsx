'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useOralTestMarksGrid,
    useOralTestMarksInitialData,
    useOralTestMarksStudents,
    useSaveOralTestMarks
} from '@/hooks/admission/preadmission/transactions/use-oral-test-marks';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Save, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const searchSchema = z.object({
    paotS_Id: z.string().min(1, 'Please Select Schedule Name'),
    oralBy: z.string().min(1, 'Please Select Oral Test By'),
    selectedStudents: z.array(z.string()).min(1, 'Please Select Students')
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function OralTestMarksPage() {
    const [gridData, setGridData] = useState<any[]>([]);
    const [marksHeaders, setMarksHeaders] = useState<any[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // Fetch initial data
    const { data: initialData, isLoading: initialLoading } = useOralTestMarksInitialData();

    const form = useForm<SearchFormValues>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            paotS_Id: '',
            oralBy: '',
            selectedStudents: []
        }
    });

    const watchScheduleId = form.watch('paotS_Id');
    const watchSelectedStudents = form.watch('selectedStudents');

    const { data: studentsData, isLoading: studentsLoading } = useOralTestMarksStudents(watchScheduleId ? Number(watchScheduleId) : null);

    const { mutate: fetchGrid, isPending: isFetchingGrid } = useOralTestMarksGrid();
    const { mutate: saveMarks, isPending: isSaving } = useSaveOralTestMarks();

    useEffect(() => {
        const actualStudentDetails = studentsData?.data?.studentDetails || studentsData?.studentDetails;
        if (actualStudentDetails) {
            const formatted = actualStudentDetails.map((student: any) => {
                const nameParts = [student.pasR_FirstName, student.pasR_MiddleName, student.pasR_LastName].filter(Boolean);
                return {
                    ...student,
                    fullName: nameParts.join(' ')
                };
            });
            setAllStudents(formatted);

            // Auto-select all by default when new students are loaded
            const allIds = formatted.map((s: any) => String(s.pasR_Id));
            form.setValue('selectedStudents', allIds);
            setSelectAll(true);
        } else {
            setAllStudents([]);
        }
    }, [studentsData, form]);

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        if (checked) {
            form.setValue(
                'selectedStudents',
                allStudents.map((s) => String(s.pasR_Id))
            );
        } else {
            form.setValue('selectedStudents', []);
        }
    };

    const handleStudentToggle = (id: string, checked: boolean) => {
        const current = form.getValues('selectedStudents');
        if (checked) {
            form.setValue('selectedStudents', [...current, id]);
        } else {
            form.setValue(
                'selectedStudents',
                current.filter((s) => s !== id)
            );
            setSelectAll(false);
        }
    };

    const onSubmitSearch = (values: SearchFormValues) => {
        const selectedStudentDetails = allStudents
            .filter((s) => values.selectedStudents.includes(String(s.pasR_Id)))
            .map((s) => ({
                ...s,
                checked: true
            }));

        fetchGrid(
            {
                paotM_Id: 0,
                oralTestByPerson: values.oralBy,
                selectedStudentDetails: selectedStudentDetails.map((s) => ({ pasR_Id: s.pasR_Id }))
            },
            {
                onSuccess: (data: any) => {
                    const actualData = data?.data || data;
                    const marksData = Array.isArray(actualData)
                        ? actualData
                        : actualData?.allInOne || actualData?.wirettenTestStudentMarks || actualData?.oralTestStudentMarks || [];

                    // Extract headers
                    const uniqueHeaders = new Map();
                    marksData
                        .filter((item: any) => item.flagsubject === 'Common')
                        .forEach((item: any) => {
                            if (!uniqueHeaders.has(item.oralTestByPerson)) {
                                uniqueHeaders.set(item.oralTestByPerson, {
                                    header: `${item.oralTestByPerson} (${item.oral_MaxMarks})`,
                                    key: item.oralTestByPerson,
                                    maxMarks: item.oral_MaxMarks
                                });
                            }
                        });
                    const headers = Array.from(uniqueHeaders.values());

                    // Format rows
                    const rows = selectedStudentDetails.map((student) => {
                        const studentMarks = marksData.filter((m: any) => m.pasR_Id === student.pasR_Id);
                        return {
                            ...student,
                            marks: studentMarks
                        };
                    });

                    setMarksHeaders(headers);
                    setGridData(rows);
                }
            }
        );
    };

    const onSaveMarks = () => {
        const paotsId = Number(form.getValues('paotS_Id'));
        const oralBy = form.getValues('oralBy');
        const selectedStudentMarksData = gridData.flatMap((student) => student.marks);

        // Validation for marks exceeding max marks
        const hasInvalidMarks = selectedStudentMarksData.some(
            (mark) => mark.obtMarks !== undefined && mark.obtMarks !== null && Number(mark.obtMarks) > mark.oral_MaxMarks
        );

        if (hasInvalidMarks) {
            toast.error('Some entered marks exceed the maximum allowed marks!');
            return;
        }

        const hasEmptyMarks = selectedStudentMarksData.some(
            (mark) => mark.obtMarks === undefined || mark.obtMarks === null || mark.obtMarks === ''
        );

        if (hasEmptyMarks) {
            toast.error('Please enter all marks before saving.');
            return;
        }

        saveMarks(
            {
                paotM_Id: 0,
                paotS_Id: paotsId,
                oralTestScheduleAppFlag:
                    initialData?.data?.allname3?.[0]?.ispaC_OralTestApplFlag === 1 ||
                    initialData?.allname3?.[0]?.ispaC_OralTestApplFlag === 1 ||
                    initialData?.ispaC_OralTestApplFlag === 1
                        ? 'true'
                        : 'false',
                selectedStudentMarksData: selectedStudentMarksData.map((m) => ({
                    pasR_Id: m.pasR_Id,
                    obtMarks: Number(m.obtMarks)
                }))
            },
            {
                onSuccess: (res: any) => {
                    if (res?.success === false || res?.returnval === false || res?.returnvalue === 'false') {
                        toast.error(res?.message || 'Failed to save data');
                    } else {
                        toast.success(res?.message || 'Data saved successfully');
                        setGridData([]);
                        form.reset();
                        window.location.reload();
                    }
                },
                onError: () => {
                    toast.error('An error occurred while saving data');
                }
            }
        );
    };

    const handleMarkChange = (studentId: number, testPerson: string, value: string) => {
        setGridData((prev) =>
            prev.map((student) => {
                if (student.pasR_Id === studentId) {
                    return {
                        ...student,
                        marks: student.marks.map((m: any) => {
                            if (m.oralTestByPerson === testPerson) {
                                return { ...m, obtMarks: value };
                            }
                            return m;
                        })
                    };
                }
                return student;
            })
        );
    };

    if (initialData?.chq_config === false) {
        return (
            <div className='container space-y-4 py-6'>
                <Alert variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription>PLEASE CHECK CONFIGURATION!</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className='container space-y-4 py-6'>
            <div className='no-print flex items-center justify-between'>
                <div className='space-y-1'>
                    <h1 className='font-bold text-3xl text-blue-800 tracking-tight'>Oral Test\Interaction Schedule Marks</h1>
                    <p className='text-muted-foreground'>
                        Update the student&apos;s oral test marks based on schedule and oral test conducted.
                    </p>
                </div>
            </div>

            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSearch)}>
                    <CollapsibleSection title='Search Schedule' defaultOpen={true}>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-4'>
                                <FormField
                                    control={form.control}
                                    name='paotS_Id'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Schedule Name <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='col-span-2'>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={initialLoading}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Schedule Name' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(
                                                            initialData?.data?.oralTestMarksBindDataDTO?.oralTestSchedule ||
                                                            initialData?.oralTestMarksBindDataDTO?.oralTestSchedule ||
                                                            initialData?.oralTestSchedule ||
                                                            []
                                                        ).map((sc: any) => (
                                                            <SelectItem key={sc.paotS_Id} value={String(sc.paotS_Id)}>
                                                                {sc.paotS_ScheduleName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name='oralBy'
                                    render={({ field }) => (
                                        <FormItem className='grid grid-cols-3 items-center gap-4'>
                                            <FormLabel className='text-right'>
                                                Oral Test By <span className='text-red-500'>*</span>
                                            </FormLabel>
                                            <div className='col-span-2'>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Oral Test By' />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {[1, 2, 3, 4, 5].map((num) => (
                                                            <SelectItem key={num} value={String(num)}>
                                                                {num}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className='space-y-4'>
                                {allStudents.length > 0 && (
                                    <FormField
                                        control={form.control}
                                        name='selectedStudents'
                                        render={() => (
                                            <FormItem>
                                                <div className='mb-2 flex items-center space-x-2 rounded border bg-slate-50 p-2'>
                                                    <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} id='select-all' />
                                                    <label htmlFor='select-all' className='font-medium text-sm leading-none'>
                                                        Select All Students
                                                    </label>
                                                </div>
                                                <div className='max-h-48 space-y-2 overflow-y-auto rounded border bg-white p-2'>
                                                    {allStudents.map((student) => (
                                                        <div key={student.pasR_Id} className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                checked={watchSelectedStudents.includes(String(student.pasR_Id))}
                                                                onCheckedChange={(checked) =>
                                                                    handleStudentToggle(String(student.pasR_Id), checked as boolean)
                                                                }
                                                                id={`student-${student.pasR_Id}`}
                                                            />
                                                            <label
                                                                htmlFor={`student-${student.pasR_Id}`}
                                                                className='font-medium text-sm leading-none'>
                                                                {student.fullName}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {studentsLoading && <p className='animate-pulse text-muted-foreground text-sm'>Loading students...</p>}
                            </div>
                        </div>

                        <div className='mt-6 flex justify-center gap-4'>
                            <Button type='submit' className='w-32' disabled={isFetchingGrid}>
                                <Search className='mr-2 h-4 w-4' />
                                Search
                            </Button>
                            <Button
                                type='button'
                                variant='destructive'
                                className='w-32'
                                onClick={() => {
                                    form.reset();
                                    setGridData([]);
                                }}>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </CollapsibleSection>
                </form>
            </FormProvider>

            {gridData.length > 0 && (
                <CollapsibleSection title='Student List' defaultOpen={true}>
                    <div className='mb-4'>
                        <span className='rounded-full border bg-slate-100 px-3 py-1 font-bold text-sm'>
                            Total Grid Records: {gridData.length}
                        </span>
                    </div>
                    <div className='overflow-x-auto rounded-lg border'>
                        <table className='w-full text-left text-sm'>
                            <thead className='bg-slate-50 text-slate-700 uppercase'>
                                <tr>
                                    <th className='border-r border-b px-6 py-3 text-center'>SL.NO</th>
                                    <th className='border-r border-b px-6 py-3'>Student Name</th>
                                    {marksHeaders.map((header, idx) => (
                                        <th key={idx} className='border-r border-b px-6 py-3 text-center last:border-r-0'>
                                            {header.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {gridData.map((student, index) => (
                                    <tr key={student.pasR_Id} className='border-b bg-white hover:bg-slate-50'>
                                        <td className='border-r px-6 py-4 text-center font-medium'>{index + 1}</td>
                                        <td className='border-r px-6 py-4'>{student.fullName}</td>
                                        {marksHeaders.map((header) => {
                                            const mark = student.marks.find((m: any) => m.oralTestByPerson === header.key);
                                            const isError = mark?.obtMarks && Number(mark.obtMarks) > header.maxMarks;
                                            return (
                                                <td key={header.key} className='border-r px-6 py-4 last:border-r-0'>
                                                    <input
                                                        type='number'
                                                        value={mark?.obtMarks || ''}
                                                        onChange={(e) => handleMarkChange(student.pasR_Id, header.key, e.target.value)}
                                                        max={header.maxMarks}
                                                        min={0}
                                                        className={`w-full rounded border p-2 focus:outline-none focus:ring-2 ${
                                                            isError
                                                                ? 'border-red-500 focus:ring-red-500'
                                                                : 'border-slate-300 focus:ring-blue-500'
                                                        }`}
                                                        placeholder={`Max ${header.maxMarks}`}
                                                        required
                                                    />
                                                    {isError && (
                                                        <span className='mt-1 block text-red-500 text-xs'>Must be ≤ {header.maxMarks}</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className='mt-6 flex justify-center'>
                        <Button onClick={onSaveMarks} disabled={isSaving} className='w-32 bg-green-600 hover:bg-green-700'>
                            <Save className='mr-2 h-4 w-4' />
                            Save
                        </Button>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
