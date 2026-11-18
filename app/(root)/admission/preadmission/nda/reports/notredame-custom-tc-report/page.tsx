'use client';

import { Check, FileText, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

import {
    useGetBbkvCustomReportDetails,
    useGetBbkvCustomReportNameRegNo,
    useGetBbkvCustomReportTcDetails,
    useGetBbkvCustomReportTempPerChange
} from '@/hooks/admission/preadmission/reports/useBbkvCustomReport';

import TcReportPrint from './_components/tc-report-print';

export default function NotredameCustomTcReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    // Initial Data
    const { data: detailsData } = useGetBbkvCustomReportDetails();

    // Mutations
    const searchMutation = useGetBbkvCustomReportNameRegNo();
    const tcDetailsMutation = useGetBbkvCustomReportTcDetails();
    const tempPerChangeMutation = useGetBbkvCustomReportTempPerChange();

    // State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [searchBy, setSearchBy] = useState<'regno' | 'stdname'>('regno');
    const [studentType, setStudentType] = useState<'temp' | 'per'>('per');
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [studentOpen, setStudentOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [studentDropdown, setStudentDropdown] = useState<any[]>([]);

    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch student list when Academic Year, Search By, or Student Type changes
    useEffect(() => {
        if (academicYearId) {
            handleStudentListRefresh();
        }
    }, [academicYearId, searchBy, studentType]);

    const handleStudentListRefresh = () => {
        if (!academicYearId) return;

        searchMutation.mutate(
            {
                ASMAY_Id: academicYearId,
                admnoorname: searchBy,
                tctemporper: studentType
            },
            {
                onSuccess: (response: any) => {
                    const list = response?.data || response?.studentlist || [];
                    setStudentDropdown(Array.isArray(list) ? list : []);
                    setSelectedStudent(null);
                    setSearchQuery('');
                },
                onError: () => {
                    toast.error('Failed to fetch student list');
                }
            }
        );
    };

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Select Academic Year');
            return;
        }
        if (!selectedStudent) {
            toast.error('Select Student');
            return;
        }

        try {
            setIsLoading(true);
            setShowReport(false);
            setReportData(null);

            tcDetailsMutation.mutate(
                {
                    ASMAY_Id: academicYearId,
                    AMST_Id: selectedStudent.amsT_Id,
                    tctemporper: studentType
                },
                {
                    onSuccess: (response: any) => {
                        const data = response?.data || response;
                        if (data.studentTCList && data.studentTCList.length > 0) {
                            setReportData(data);
                            setShowReport(true);
                        } else {
                            toast.error('TC details not found for this student');
                        }
                    },
                    onError: () => {
                        toast.error('Failed to fetch TC details');
                    },
                    onSettled: () => {
                        setIsLoading(false);
                    }
                }
            );
        } catch {
            toast.error('An error occurred');
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setAcademicYearId(null);
        setSearchBy('regno');
        setStudentType('per');
        setSelectedStudent(null);
        setSearchQuery('');
        setStudentDropdown([]);
        setShowReport(false);
        setReportData(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Notredame_TC_${selectedStudent?.studentname || 'Report'}`
    });

    const students = useMemo(() => {
        const list = studentDropdown.map((s: any) => {
            const rawName = s.studentname || `${s.amsT_FirstName || ''} ${s.amsT_LastName || ''}`.trim();
            let displayName = rawName;
            if (rawName.includes(':')) {
                const [name, regNo] = rawName.split(':');
                displayName = `${regNo.trim()}:${name.trim()}`;
            }
            return {
                ...s,
                displayName,
                amsT_Id: s.amsT_Id || s.amst_Id
            };
        });

        if (!searchQuery || selectedStudent) return list;

        return list.filter((s: any) => s.displayName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [studentDropdown, searchQuery, selectedStudent]);

    return (
        <div className='space-y-6 p-4'>
            <CollapsibleSection
                title='TC Custom Report'
                description='Notredame High School - Transfer Certificate Custom Report'
                defaultOpen={true}
                variant='outline'
                className='shadow-md'>
                <div className='space-y-8 bg-white p-6'>
                    <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='flex h-12 items-center rounded-xl border bg-slate-50/50 px-4'>
                                <RadioGroup value={searchBy} onValueChange={(v) => setSearchBy(v as any)} className='flex space-x-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='regno' id='search-adm' className='border-indigo-500 text-indigo-600' />
                                        <Label htmlFor='search-adm' className='cursor-pointer font-medium text-sm'>
                                            Admno
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='stdname' id='search-name' className='border-indigo-500 text-indigo-600' />
                                        <Label htmlFor='search-name' className='cursor-pointer font-medium text-sm'>
                                            Name
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='flex items-center space-x-4'>
                                <Label className='w-32 font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => setAcademicYearId(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl bg-white'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(detailsData as any)?.data?.accyear?.map((year: any, index: number) => (
                                            <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        )) ||
                                            (detailsData as any)?.accyear?.map((year: any, index: number) => (
                                                <SelectItem key={`${year.asmaY_Id}-${index}`} value={year.asmaY_Id.toString()}>
                                                    {year.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='flex h-12 items-center rounded-xl border bg-slate-50/50 px-4'>
                                <RadioGroup value={studentType} onValueChange={(v) => setStudentType(v as any)} className='flex space-x-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='temp' id='type-temp' className='border-indigo-500 text-indigo-600' />
                                        <Label htmlFor='type-temp' className='cursor-pointer font-medium text-sm'>
                                            Temp Student
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='per' id='type-per' className='border-indigo-500 text-indigo-600' />
                                        <Label htmlFor='type-per' className='cursor-pointer font-medium text-sm'>
                                            Permanent Student
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='flex items-center space-x-4'>
                                <Label className='w-32 font-bold text-sm'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={studentOpen} onOpenChange={setStudentOpen}>
                                    <div className='relative w-full'>
                                        <PopoverAnchor asChild>
                                            <input
                                                value={selectedStudent ? selectedStudent.displayName : searchQuery}
                                                onChange={(e) => {
                                                    setSearchQuery(e.target.value);
                                                    setSelectedStudent(null);
                                                    if (!studentOpen) setStudentOpen(true);
                                                }}
                                                onFocus={() => {
                                                    if (!selectedStudent) setStudentOpen(true);
                                                }}
                                                className='flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                                placeholder='Select or search Student in the list'
                                                disabled={!academicYearId}
                                            />
                                        </PopoverAnchor>
                                        {searchMutation.isPending && (
                                            <div className='absolute top-2 right-2'>
                                                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                                            </div>
                                        )}
                                    </div>
                                    <PopoverContent
                                        className='w-[450px] border-indigo-100 p-0 shadow-2xl'
                                        align='start'
                                        onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
                                    >
                                        <div className='max-h-[300px] overflow-y-auto overflow-x-hidden py-1'>
                                            {students.length === 0 && (
                                                <div className='p-4 text-center text-slate-500 text-sm'>No students found.</div>
                                            )}
                                            {students.map((student: any, idx: number) => (
                                                <div
                                                    key={`${student.amsT_Id}-${idx}`}
                                                    onPointerDown={(e) => {
                                                        // use onPointerDown to trigger before blur/focus shifts
                                                        e.preventDefault();
                                                        setSelectedStudent(student);
                                                        setSearchQuery(student.displayName);
                                                        setStudentOpen(false);
                                                    }}
                                                    className={cn(
                                                        'flex cursor-pointer items-center px-3 py-2.5 text-sm transition-colors',
                                                        'hover:bg-indigo-50 active:bg-indigo-100',
                                                        selectedStudent?.amsT_Id === student.amsT_Id
                                                            ? 'bg-indigo-50/50 font-semibold text-indigo-700'
                                                            : 'text-slate-700'
                                                    )}>
                                                    <Check
                                                        className={cn(
                                                            'mr-3 h-4 w-4 shrink-0 transition-opacity',
                                                            selectedStudent?.amsT_Id === student.amsT_Id ? 'opacity-100' : 'opacity-0'
                                                        )}
                                                    />
                                                    <span className='truncate'>{student.displayName}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-10'>
                        <Button
                            onClick={handleReport}
                            disabled={isLoading || !selectedStudent}
                            className='h-10 w-32 rounded-xl bg-[#7b8ae1] font-bold text-white uppercase shadow-md hover:bg-[#6a79d0]'>
                            {isLoading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button
                            onClick={handleReset}
                            className='h-10 w-32 rounded-xl bg-[#f44336] font-bold text-white uppercase shadow-md hover:bg-[#d32f2f]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='h-10 w-32 rounded-xl bg-[#90a4ae] font-bold text-white uppercase shadow-md hover:bg-[#78909c]'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {showReport && reportData && (
                <div className='mt-8 flex justify-center rounded-xl border-4 border-slate-300 border-dashed bg-slate-100 p-10'>
                    <div className='bg-white p-4 shadow-2xl'>
                        <TcReportPrint ref={printRef} data={reportData} />
                    </div>
                </div>
            )}
        </div>
    );
}
