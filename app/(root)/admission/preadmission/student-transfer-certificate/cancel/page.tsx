'use client';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    useChangeAcademicYearForCancel,
    useSaveTCCancelDetails,
    useStudentNameChangeForCancel,
    useTCCancelInitialData
} from '@/hooks/admission/preadmission/useStudentTc';
import { cn } from '@/lib/utils';
import { ensureArray } from '@/lib/utils';
import { Check, ChevronsUpDown, Printer, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { type TCCancelDetail, tcCancelDetailsColumns } from './_components/columns';
import { StudentDetails } from './_components/student-details';
import { TCCancelPrint } from './_components/tc-cancel-print';

export default function StudentTCCancelPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [openStudentCombo, setOpenStudentCombo] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [tableData, setTableData] = useState<TCCancelDetail[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // API Hooks
    const { data: initialData } = useTCCancelInitialData();
    const changeYearMutation = useChangeAcademicYearForCancel();
    const studentChangeMutation = useStudentNameChangeForCancel();
    const saveMutation = useSaveTCCancelDetails();

    // Derived Data
    const academicYears = ensureArray(initialData?.data?.academicList);

    // Initial Load Effect
    useEffect(() => {
        if (initialData?.data) {
            const currentYearId = (ensureArray(initialData.data.currentYear) as any[])?.[0]?.asmaY_Id?.toString();

            if (currentYearId && !selectedYear) {
                setSelectedYear(currentYearId);

                // Populate data if available in initial response
                if (initialData.data.getstudenttcdetails) {
                    setStudentList(ensureArray(initialData.data.getstudenttcdetails));
                }

                if (initialData.data.getdeletedtcdetails) {
                    processDeletedTCs(ensureArray(initialData.data.getdeletedtcdetails));
                }
            }
        }
    }, [initialData]);

    const processDeletedTCs = (details: any[]) => {
        const mapped = ensureArray(details).map((item: any, index: number) => ({
            slNo: index + 1,
            studentDetails: `${item.amsT_FirstName} ${item.amsT_AdmNo ? ':' + item.amsT_AdmNo : ''}`,
            tcNo: item.astC_TCNO,
            tcDate: item.astC_TCDate ? new Date(item.astC_TCDate).toLocaleDateString('en-GB') : '-',
            reason: item.tC_CancelReason,
            deletedDate: item.updatedDate ? new Date(item.updatedDate).toLocaleString('en-GB') : '-'
        }));
        setTableData(mapped);
    };

    const handleYearChange = (yearId: string) => {
        setSelectedYear(yearId);
        setSelectedStudentId(null);
        setStudentDetails(null);
        setRemarks('');
        setStudentList([]);
        setTableData([]);

        if (!yearId) return;

        changeYearMutation.mutate(Number(yearId), {
            onSuccess: (response: any) => {
                const data = response?.data || response;

                // student list
                if (data?.getstudenttcdetails) {
                    setStudentList(ensureArray(data.getstudenttcdetails));
                }

                // deleted tc list
                if (data?.getdeletedtcdetails) {
                    processDeletedTCs(ensureArray(data.getdeletedtcdetails));
                }
            },
            onError: (error) => {
                console.error('Error fetching year data:', error);
                toast.error('Failed to fetch data for selected year.');
            }
        });
    };

    const handleStudentChange = (studentId: number) => {
        setSelectedStudentId(studentId);
        setStudentDetails(null);
        setRemarks('');

        if (!studentId || !selectedYear) return;

        studentChangeMutation.mutate(
            { asmayId: Number(selectedYear), amstId: studentId },
            {
                onSuccess: (response) => {
                    const data = response?.data || response;
                    const tcDetails = ensureArray(data?.gettcdetailsbystudentid) as any[];
                    if (tcDetails.length > 0) {
                        const detail = tcDetails[0];
                        setStudentDetails({
                            studentName: detail.amsT_FirstName,
                            admNo: detail.amsT_Id, // amsT_AdmNo is sometimes missing, using Id or mapping specifically?
                            regNo: detail.amsT_RegistrationNo,
                            joinedYear: detail.joinedyearname,
                            joinedClass: detail.joinedclassname,
                            leftYear: detail.leftyearname,
                            leftClass: detail.leftclassname,
                            leftSection: detail.leftsectionname,
                            tcNo: detail.astC_TCNO,
                            tcDate: detail.astC_TCDate ? new Date(detail.astC_TCDate).toLocaleDateString('en-GB') : '-',
                            studentPhoto: detail.studentphotopath
                        });
                    } else {
                        toast.warning('Student Details Not Found');
                    }
                },
                onError: (error) => {
                    console.error('Error fetching student details:', error);
                    toast.error('Failed to fetch student details.');
                }
            }
        );
    };

    const handleSave = () => {
        if (!selectedYear || !selectedStudentId) {
            toast.error('Please select academic year and student.');
            return;
        }

        if (!remarks.trim()) {
            toast.error('Please enter remarks.');
            return;
        }

        // Confirm first? In React usually strictly controlled via modal, but standard alert confirm is mostly dead in modern UI.
        // We'll proceed or use a custom modal if requested. For now, proceeding direct or we could use toast promise.

        const payload = {
            AMST_Id: selectedStudentId,
            ASMAY_Id: Number(selectedYear),
            TC_CancelReason: remarks
        };

        saveMutation.mutate(payload, {
            onSuccess: (response) => {
                // The API returns the response body directly, which contains success, message, and data.
                // However, since the body has a 'data' property, the previous check (response?.data || response)
                // was grabbing the inner data array instead of the root object.
                // We prioritize the root object if it has the success flag.
                const actualResponse =
                    response?.success !== undefined || response?.returnval !== undefined ? response : response?.data || response;

                if (actualResponse?.success === true || actualResponse?.returnval === true) {
                    toast.success(actualResponse?.message || 'TC Deleted Successfully');
                    handleClear();
                    handleYearChange(selectedYear);
                } else {
                    toast.error(actualResponse?.message || 'Failed To Delete TC');
                }
            },
            onError: (error) => {
                console.error('Save error:', error);
                toast.error('An error occurred while deleting TC.');
            }
        });
    };

    const handleClear = () => {
        setSelectedStudentId(null);
        setStudentDetails(null);
        setRemarks('');
        // We keep the year selected as typical UX
        if (selectedYear) {
            handleYearChange(selectedYear);
        }
    };

    const printRef = useRef(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Student TC Cancel Details'
    });

    if (!isMounted) return null;

    // Helper for command list
    const selectedStudent = studentList.find((s) => s.amsT_Id === selectedStudentId);

    return (
        <div className='min-h-screen space-y-4 p-1'>
            <CollapsibleSection title='STUDENT TC CANCEL' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                <div className='grid grid-cols-1 items-start gap-6'>
                    {/* Top Row: Year and Student */}
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
                            <Label htmlFor='academic-year-select' className='w-[140px] whitespace-nowrap text-right font-medium text-base'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <div>
                                <Select value={selectedYear} onValueChange={handleYearChange}>
                                    <SelectTrigger id='academic-year-select'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Student Name */}
                        <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
                            <Label htmlFor='student-search' className='w-[140px] whitespace-nowrap text-right font-medium text-base'>
                                Student Name :<span className='text-red-500'>*</span>
                            </Label>
                            <div className='relative w-full'>
                                <Popover open={openStudentCombo} onOpenChange={setOpenStudentCombo}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            // biome-ignore lint/a11y/useSemanticElements: <explanation>
                                            role='combobox'
                                            aria-expanded={openStudentCombo}
                                            className='w-full justify-between'
                                            disabled={!selectedYear}>
                                            {selectedStudentId
                                                ? selectedStudent?.amsT_FirstName?.replace(/:$/, '') || 'Select Student'
                                                : 'Select Or Search Student'}
                                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                                        <Command>
                                            <CommandInput placeholder='Search student...' />
                                            <CommandList>
                                                <CommandEmpty>No student found.</CommandEmpty>
                                                <CommandGroup>
                                                    {studentList.map((student: any) => {
                                                        const displayName = student.amsT_FirstName?.replace(/:$/, '').trim();
                                                        const displayAdmNo = student.amsT_AdmNo ? ` : ${student.amsT_AdmNo}` : '';

                                                        return (
                                                            <CommandItem
                                                                key={student.amsT_Id}
                                                                value={`${student.amsT_FirstName} ${student.amsT_AdmNo || ''}`}
                                                                onSelect={() => {
                                                                    handleStudentChange(student.amsT_Id);
                                                                    setOpenStudentCombo(false);
                                                                }}>
                                                                <Check
                                                                    className={cn(
                                                                        'mr-2 h-4 w-4',
                                                                        selectedStudentId === student.amsT_Id ? 'opacity-100' : 'opacity-0'
                                                                    )}
                                                                />
                                                                {displayName}
                                                                {displayAdmNo}
                                                            </CommandItem>
                                                        );
                                                    })}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Student Details Section (Conditional) */}
                    {studentDetails && (
                        <div className='mt-4 border-t pt-4'>
                            <h3 className='mb-4 font-semibold text-blue-700 text-lg'>Student Details</h3>

                            <div className='grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]'>
                                {/* Left Column: Photo */}
                                <div className='flex flex-col items-center gap-4'>
                                    <div className='h-[150px] w-[150px] border border-blue-300 bg-white p-1 shadow-sm'>
                                        {studentDetails.studentPhoto ? (
                                            // biome-ignore lint/a11y/useAltText: <explanation>
                                            <img
                                                src={studentDetails.studentPhoto}
                                                className='h-full w-full object-cover'
                                                alt='Student Photo'
                                            />
                                        ) : (
                                            <div className='flex h-full w-full items-center justify-center bg-gray-100 text-center text-gray-500 text-xs uppercase'>
                                                Photo Not Available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Details & Remarks */}
                                <div className='space-y-6'>
                                    <StudentDetails details={studentDetails} />

                                    <div className='grid grid-cols-[140px_1fr] gap-2'>
                                        <Label className='pt-2 text-right font-medium'>
                                            Remarks :<span className='text-red-500'>*</span>
                                        </Label>
                                        <div className='w-full space-y-1'>
                                            <Textarea
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder='Enter remarks here'
                                                rows={3}
                                            />
                                            {!remarks && saveMutation.isPending && (
                                                <p className='text-red-500 text-xs'>Remarks are required.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='mt-6 flex justify-center gap-4'>
                                <Button onClick={handleSave} className='bg-blue-600 hover:bg-blue-700' disabled={saveMutation.isPending}>
                                    <Save className='mr-2 h-4 w-4' />
                                    {saveMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                                <Button onClick={handleClear} variant='destructive' disabled={saveMutation.isPending}>
                                    <X className='mr-2 h-4 w-4' />
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Cancelled List Table */}
            {tableData.length > 0 && (
                <CollapsibleSection title='STUDENT TC CANCEL DETAILS' defaultOpen={true} variant='default' size='lg' className='shadow-lg'>
                    <GenericDataTable<TCCancelDetail>
                        data={tableData}
                        totalItems={tableData.length}
                        columns={tcCancelDetailsColumns}
                        isLoading={changeYearMutation.isPending}
                        showViewOptions={false}
                        noDataTitle='No details found'
                        isSearchRequired={true}
                    />

                    <div className='mt-4 flex justify-center'>
                        <Button onClick={() => handlePrint()} className='bg-blue-700 text-white hover:bg-blue-800'>
                            <Printer className='mr-2 h-4 w-4' /> PRINT
                        </Button>
                    </div>

                    {/* Hidden Print Component */}
                    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                        <TCCancelPrint ref={printRef} data={tableData} />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
