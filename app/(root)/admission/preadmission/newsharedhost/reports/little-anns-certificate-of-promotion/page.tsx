'use client';

import { History, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
    useDobCertificateDetailsMutation,
    useDobCertificateLoadData,
    useDobCertificateStudentList
} from '@/hooks/admission/preadmission/useReports';

import LittleAnnsPromotionCertificate from './_components/little-anns-promotion-certificate';

export default function LittleAnnsPromotionCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    // Initial Data
    const { data: loadData } = useDobCertificateLoadData(1);

    // Filter State
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);
    const [studentId, setStudentId] = useState<number | null>(null);
    const [purpose, setPurpose] = useState('');
    const [completedCourse, setCompletedCourse] = useState('');
    const [promotedTo, setPromotedTo] = useState('');
    const [promotionDate, setPromotionDate] = useState('');

    // Student List Data
    const { data: studentListData, isLoading: isStudentListLoading } = useDobCertificateStudentList(
        {
            ASMAY_Id: academicYearId ?? 0,
            ASMCL_Id: classId ?? 0,
            ASMC_Id: sectionId ?? 0
        },
        !!academicYearId && !!classId && !!sectionId
    );

    const studList = (studentListData as any)?.data?.fillstudlist || [];

    // Report Generation
    const [showCertificate, setShowCertificate] = useState(false);
    const [studentDetails, setStudentDetails] = useState<any>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const detailMutation = useDobCertificateDetailsMutation();

    const handleGenerate = async () => {
        if (!academicYearId || !classId || !sectionId || !studentId) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            setIsGenerating(true);
            setShowCertificate(false);

            const payload = {
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId,
                ASMC_Id: sectionId,
                AMST_Id: studentId,
                AMC_Id: 0
            };

            const response = await detailMutation.mutateAsync(payload);
            const studentList = (response as any)?.data;

            if (Array.isArray(studentList) && studentList.length > 0) {
                setStudentDetails(studentList[0]);
                setShowCertificate(true);
            } else {
                toast.error('Record not found');
            }
        } catch (error) {
            toast.error('Failed to generate report');
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleClear = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentId(null);
        setPurpose('');
        setCompletedCourse('');
        setPromotedTo('');
        setPromotionDate('');
        setShowCertificate(false);
        setStudentDetails(null);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Promotion_Certificate'
    });

    const isGenerateDisabled = !academicYearId || !classId || !sectionId || !studentId || isGenerating;

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title="LITTLE ANN'S CERTIFICATE OF PROMOTION"
                description='Generate promotion certificates for students'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString()}
                                    onValueChange={(v) => {
                                        setAcademicYearId(Number(v));
                                        setStudentId(null);
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allAcademicYear?.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={classId?.toString()}
                                    onValueChange={(v) => {
                                        setClassId(Number(v));
                                        setStudentId(null);
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allClass?.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => {
                                        setSectionId(Number(v));
                                        setStudentId(null);
                                    }}>
                                    <SelectTrigger className='h-9'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData as any)?.data?.allSection?.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Student:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={studentId?.toString()}
                                    onValueChange={(v) => setStudentId(Number(v))}
                                    disabled={!sectionId || isStudentListLoading}>
                                    <SelectTrigger className='h-9'>
                                        {isStudentListLoading ? (
                                            <div className='flex items-center gap-2'>
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                Loading students...
                                            </div>
                                        ) : (
                                            <SelectValue placeholder='Select Student' />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {studList.map((item: any) => (
                                            <SelectItem key={item.amsT_Id} value={item.amsT_Id.toString()}>
                                                {item.stuname}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
                                <Label className='mt-2 font-bold text-sm'>School of:</Label>
                                <Textarea
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                    placeholder='Enter school name or department'
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Promotion specific fields */}
                    <div className='grid grid-cols-1 gap-8 border-t pt-4 md:grid-cols-2'>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Completed Course:</Label>
                                <Input
                                    value={completedCourse}
                                    onChange={(e) => setCompletedCourse(e.target.value)}
                                    placeholder='e.g. Nursery, UKG'
                                />
                            </div>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Promoted To:</Label>
                                <Input value={promotedTo} onChange={(e) => setPromotedTo(e.target.value)} placeholder='e.g. LKG, Grade 1' />
                            </div>
                        </div>
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>Promotion Date:</Label>
                                <Input
                                    value={promotionDate}
                                    onChange={(e) => setPromotionDate(e.target.value)}
                                    placeholder='e.g. 10th May 2025'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 border-t pt-6 font-sans'>
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerateDisabled}
                            className='min-w-[120px] bg-[#3f51b5] text-white hover:bg-[#303f9f]'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <History className='mr-2 h-4 w-4' />}
                            GENERATE
                        </Button>
                        <Button onClick={handleClear} variant='destructive' className='min-w-[120px] font-bold uppercase'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Clear
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showCertificate}
                            variant='outline'
                            className='min-w-[120px] border-2 border-primary font-bold text-primary uppercase hover:bg-primary/10'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Preview Section */}
            {showCertificate && studentDetails && (
                <div className='flex justify-center overflow-x-auto rounded-xl border-2 border-muted-foreground/20 border-dashed bg-muted/30 p-8'>
                    <div className='origin-top bg-white shadow-2xl'>
                        <LittleAnnsPromotionCertificate
                            ref={printRef}
                            student={studentDetails}
                            purpose={purpose}
                            completedCourse={completedCourse}
                            promotedTo={promotedTo}
                            promotionDate={promotionDate}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
