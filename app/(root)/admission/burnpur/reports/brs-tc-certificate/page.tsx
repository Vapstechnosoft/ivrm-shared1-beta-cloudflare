'use client';

import { FileText, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useBRSTCCertificateInitialDetails,
    useBRSTCCertificateSearch,
    useBRSTCCertificateTcDetails,
    useBRSTCCertificateTempPerChange
} from '@/hooks/admission/preadmission/useBRSTCCertificate';

import TCReportView from './_components/tc-report-view';

export default function BRSTCCertificatePage() {
    const componentRef = useRef<HTMLDivElement>(null);

    // Hooks
    const { data: initialData } = useBRSTCCertificateInitialDetails();
    const searchMutation = useBRSTCCertificateSearch();
    const tempPerMutation = useBRSTCCertificateTempPerChange();
    const reportMutation = useBRSTCCertificateTcDetails();

    // State
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);
    const [searchBy, setSearchBy] = useState<'regno' | 'stdname'>('regno');
    const [studentType, setStudentType] = useState<'temp' | 'per'>('per');
    const [studentId, setStudentId] = useState<string | null>(null);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = useReactToPrint({
        contentRef: componentRef
    });

    // Refresh student list when filters change
    useEffect(() => {
        if (academicYearId) {
            handleSearch();
        }
    }, [academicYearId, searchBy, studentType]);

    const handleSearch = async () => {
        try {
            const res = await searchMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                admnoorname: searchBy,
                tctemporper: studentType
            });

            const students = res?.data?.studentlist || (Array.isArray(res?.data) ? res.data : []);

            if (students.length > 0) {
                setStudentList(students);
                setStudentId(null);
                setReportData(null);
            } else {
                setStudentList([]);
                toast.error('No students found for this selection');
            }
        } catch (error) {
            toast.error('Failed to fetch student list');
        }
    };

    const handleGetReport = async () => {
        if (!studentId) {
            toast.error('Please select a student');
            return;
        }

        try {
            setIsGenerating(true);
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: Number(academicYearId),
                AMST_Id: Number(studentId),
                tctemporper: studentType
            });

            const report = res?.data?.studentTCList ? res.data : res?.data || res;

            if (report?.studentTCList && report.studentTCList.length > 0) {
                setReportData(report);
            } else {
                setReportData(null);
                toast.error('No TC details found for this student');
            }
        } catch (error) {
            toast.error('Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCancel = () => {
        window.location.reload();
    };

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
            <CollapsibleSection
                title='TRANSFER CERTIFICATE REPORTS'
                description='Generate and print transfer certificates for students'
                defaultOpen={true}
                variant='outline'
                className='shadow-md'>
                <div className='space-y-8 rounded-lg bg-white p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col items-center gap-4 rounded-lg bg-indigo-50 p-4'>
                                <Label className='font-bold text-indigo-700 uppercase tracking-wider'>Search By</Label>
                                <RadioGroup value={searchBy} onValueChange={(val: any) => setSearchBy(val)} className='flex gap-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='regno' id='by-reg' />
                                        <Label htmlFor='by-reg' className='cursor-pointer'>
                                            Adm No
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='stdname' id='by-name' />
                                        <Label htmlFor='by-name' className='cursor-pointer'>
                                            Name
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='space-y-2'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId || ''} onValueChange={setAcademicYearId}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialData?.data?.accyear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-6'>
                            <div className='flex flex-col items-center gap-4 rounded-lg bg-indigo-50 p-4'>
                                <Label className='font-bold text-indigo-700 uppercase tracking-wider'>Student Status</Label>
                                <RadioGroup value={studentType} onValueChange={(val: any) => setStudentType(val)} className='flex gap-8'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='temp' id='type-temp' />
                                        <Label htmlFor='type-temp' className='cursor-pointer'>
                                            Temp Student
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='per' id='type-per' />
                                        <Label htmlFor='type-per' className='cursor-pointer'>
                                            Permanent Student
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className='space-y-2'>
                                <Label className='font-bold text-sm'>
                                    Student Name:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={studentId || ''}
                                    onValueChange={setStudentId}
                                    disabled={studentList.length === 0 || searchMutation.isPending}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue
                                            placeholder={
                                                searchMutation.isPending
                                                    ? 'Searching students...'
                                                    : studentList.length > 0
                                                      ? 'Select Student'
                                                      : 'No students available'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[300px]'>
                                        {studentList.map((item: any) => (
                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                <div className='flex w-full justify-between gap-4'>
                                                    <span>{item.studentname}</span>
                                                    {item.astC_TCDate && (
                                                        <span className='text-gray-400 text-xs'>
                                                            {new Date(item.astC_TCDate).toLocaleDateString('en-GB')}
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-6'>
                        <Button
                            onClick={handleGetReport}
                            disabled={isGenerating || !studentId}
                            className='min-w-[140px] bg-indigo-600 font-bold hover:bg-indigo-700'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        {/* <Button
                            variant="secondary"
                            className="min-w-[140px] font-bold"
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            QRCode
                        </Button> */}
                        <Button onClick={handleCancel} variant='destructive' className='min-w-[140px] font-bold'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        {reportData && (
                            <Button
                                onClick={handlePrint}
                                variant='outline'
                                className='min-w-[140px] border-indigo-600 font-bold text-indigo-600'>
                                <Printer className='mr-2 h-4 w-4' />
                                PRINT
                            </Button>
                        )}
                    </div>
                </div>
            </CollapsibleSection>

            {reportData && (
                <div className='fade-in slide-in-from-bottom-4 animate-in duration-500'>
                    <TCReportView ref={componentRef} data={reportData} logo={reportData?.studentTCList?.[0]?.logo || ''} />
                </div>
            )}
        </div>
    );
}
