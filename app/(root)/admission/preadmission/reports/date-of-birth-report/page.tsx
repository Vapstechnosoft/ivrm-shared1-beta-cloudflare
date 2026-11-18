'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useReactToPrint } from 'react-to-print';
import { BirthCertificatePrint } from './_components/birth-certificate-print';

import { FileText, Printer, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
    useDobCertificateDetails,
    useDobCertificateLoadData,
    useDobCertificateStudentList
} from '@/hooks/admission/preadmission/useReports';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default function BirthCertificatePageReport(_props: { searchParams: SearchParams }) {
    const router = useRouter();
    const pathname = usePathname();

    const printRef = useRef<HTMLDivElement>(null);

    const [showReport, setShowReport] = useState(false);
    const [allReportData, setAllReportData] = useState<any>(null);

    const handleFilterChange = (filterType: 'class' | 'section' | 'academic_year' | 'student', value: number) => {
        if (filterType === 'class') {
            setClassId(value);
            setSectionId(0);
            setStudentId(0);
        } else if (filterType === 'section') {
            setSectionId(value);
            setStudentId(0);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        } else if (filterType === 'student') {
            setStudentId(value);
        }
    };

    const { data: dobLoadData, isLoading: dobLoadDataLoading, isError: dobLoadDataError } = useDobCertificateLoadData(true);

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number>(0);
    const [studentId, setStudentId] = useState<number>(0);
    const [purpose, setPurpose] = useState<string>('');

    const dobMasters = (dobLoadData?.data ?? null) as any;
    const academicYearOptions = (dobMasters?.allAcademicYear ?? []) as any[];
    const preadmissionClass = (dobMasters?.allClass ?? []) as any[];
    const admissionSection = (dobMasters?.allSection ?? []) as any[];

    const {
        data: dobStudentListResponse,
        isLoading: dobStudentListLoading,
        isError: dobStudentListError
    } = useDobCertificateStudentList(
        {
            ASMAY_Id: Number(academicYearId),
            ASMCL_Id: Number(classId),
            ASMC_Id: Number(sectionId)
        },
        Boolean(academicYearId > 0 && classId > 0 && sectionId > 0)
    );

    const dobStudentOptions = (((dobStudentListResponse?.data as any) ?? null)?.fillstudlist ?? []) as any[];

    const { data: detailsResponse } = useDobCertificateDetails(
        {
            AMC_Id: 0,
            ASMC_Id: Number(sectionId),
            ASMAY_Id: Number(academicYearId),
            ASMCL_Id: Number(classId),
            AMST_Id: Number(studentId)
        },
        Boolean(showReport && academicYearId > 0 && classId > 0 && sectionId > 0 && studentId !== undefined && studentId !== null)
    );

    const transformedData = useMemo(() => {
        if (!detailsResponse?.data || !showReport) {
            return [];
        }

        const data = detailsResponse.data as any;

        if (Array.isArray(data)) {
            return data;
        }

        if (data?.$values) {
            return data.$values;
        }

        return [];
    }, [detailsResponse?.data, showReport]);

    const handleClear = () => {
        setAcademicYearId(0);
        setClassId(0);
        setStudentId(0);
        setPurpose('');
        setShowReport(false);
        setAllReportData(null);

        router.replace(pathname);

        toast.success('Filters cleared successfully');
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'DateOfBirthReport'
    });

    const handleGenerate = () => {
        if (!academicYearId || academicYearId === 0) {
            toast.error('Please select Academic Year');
            return;
        }

        if (!classId || classId === 0) {
            toast.error('Please select Class');
            return;
        }

        if (!sectionId || sectionId === 0) {
            toast.error('Please select Section');
            return;
        }

        if (studentId === undefined || studentId === null) {
            toast.error('please select student');
            return;
        }

        setShowReport(true);
        toast.success('Generating report...');
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Date of Birth Certificate Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='academic-year' className='font-medium text-gray-900 text-sm'>
                                        Academic Year <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                                        value={academicYearId !== 0 ? academicYearId?.toString() : undefined}>
                                        <SelectTrigger id='academic-year' className='w-full'>
                                            <SelectValue placeholder='--Select Year--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dobLoadDataLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : dobLoadDataError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading
                                                </SelectItem>
                                            ) : (
                                                academicYearOptions?.map((item, index) => (
                                                    <SelectItem key={`${item.asmaY_Id}-${index}`} value={String(item.asmaY_Id)}>
                                                        {item.asmaY_Year}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='class' className='font-medium text-gray-900 text-sm'>
                                        Class <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFilterChange('class', Number(value))}
                                        value={classId !== 0 ? classId?.toString() : undefined}>
                                        <SelectTrigger id='class' className='w-full'>
                                            <SelectValue placeholder='--Select Class--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dobLoadDataLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : dobLoadDataError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading
                                                </SelectItem>
                                            ) : (
                                                preadmissionClass?.map((item, index) => (
                                                    <SelectItem key={`${item.asmcL_Id}-${index}`} value={item.asmcL_Id.toString()}>
                                                        {item.asmcL_ClassName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='section' className='font-medium text-gray-900 text-sm'>
                                        Section <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFilterChange('section', Number(value))}
                                        value={sectionId !== 0 ? sectionId?.toString() : undefined}
                                        disabled={classId === 0}>
                                        <SelectTrigger id='section' className='w-full'>
                                            <SelectValue placeholder='--Select Section--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dobLoadDataLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : dobLoadDataError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading
                                                </SelectItem>
                                            ) : (
                                                admissionSection?.map((item: any, index: number) => (
                                                    <SelectItem key={`${item.asmS_Id}-${index}`} value={item.asmS_Id.toString()}>
                                                        {item.asmC_SectionName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='student' className='font-medium text-gray-900 text-sm'>
                                        Student <span className='text-red-500'>*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) => handleFilterChange('student', Number(value))}
                                        value={studentId !== 0 ? studentId?.toString() : undefined}
                                        disabled={sectionId === 0}>
                                        <SelectTrigger id='student' className='w-full'>
                                            <SelectValue placeholder='--Select Student--' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dobStudentListLoading ? (
                                                <SelectItem value='loading' disabled>
                                                    Loading...
                                                </SelectItem>
                                            ) : dobStudentListError ? (
                                                <SelectItem value='error' disabled>
                                                    Error loading
                                                </SelectItem>
                                            ) : (
                                                <>
                                                    <SelectItem value='0'>All Students</SelectItem>
                                                    {dobStudentOptions?.length === 0 ? (
                                                        <SelectItem value='no-data' disabled>
                                                            No students found
                                                        </SelectItem>
                                                    ) : (
                                                        dobStudentOptions?.map((item: any, index: number) => (
                                                            <SelectItem key={`${item.amsT_Id}-${index}`} value={item.amsT_Id.toString()}>
                                                                {item.studentName || item.stuname}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='purpose' className='font-medium text-gray-900 text-sm'>
                                        Purpose
                                    </Label>
                                    <Input
                                        id='purpose'
                                        type='text'
                                        placeholder='Enter purpose'
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className='w-full'
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                onClick={handleGenerate}
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                <FileText className='mr-2 h-4 w-4' />
                                Generate
                            </Button>

                            <Button
                                variant='outline'
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                onClick={handleClear}>
                                <X className='mr-2 h-4 w-4' />
                                Clear
                            </Button>
                            {/* <Button onClick={downloadExcel} className='w-fit'>
                                Export to Excel
                            </Button> */}

                            {showReport && transformedData && transformedData.length > 0 && (
                                <Button
                                    variant='outline'
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                    onClick={() => handlePrint()}>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {showReport && transformedData && transformedData.length > 0 && (
                    <div className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <CollapsibleSection title='Birth Certificate Preview' defaultOpen={true} variant='outline' size='md'>
                            <div className='rounded-lg border bg-white p-4 shadow-sm'>
                                <BirthCertificatePrint
                                    students={transformedData}
                                    purpose={purpose}
                                    masterCompany={(detailsResponse?.data as any)?.masterCompany}
                                    principalSign={(detailsResponse?.data as any)?.principalSign}
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
                    <BirthCertificatePrint
                        ref={printRef}
                        students={allReportData?.data?.studentList || transformedData}
                        purpose={purpose}
                        masterCompany={(allReportData?.data || (detailsResponse?.data as any))?.masterCompany}
                        principalSign={(allReportData?.data || (detailsResponse?.data as any))?.principalSign}
                    />
                </div>
            </div>
        </div>
    );
}
