'use client';

import { FileText, Loader2, Printer, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import { AdmissionProcedurePrint } from './_components/admission-procedure-print';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useAdmissionProcedureClass,
    useAdmissionProcedureInitialDetails,
    useAdmissionProcedureReport,
    useViewAdmissionDetails
} from '@/hooks/admission/preadmission/useAdmissionProcedureReport';

import AdmissionFormModal from './_components/admission-form-modal';
import AdmissionProcedureModal from './_components/admission-procedure-modal';
import { type IAdmissionProcedureReport, getAdmissionProcedureColumns } from './_components/columns';

export default function AdmissionProcedureReportPage() {
    // Refs & Print Hook
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Admission_Procedure_Report'
    });

    // Hooks
    const { data: initialData, isLoading: isInitialLoading } = useAdmissionProcedureInitialDetails();
    const classMutation = useAdmissionProcedureClass();
    const reportMutation = useAdmissionProcedureReport();
    const viewDetailsMutation = useViewAdmissionDetails();

    // State
    const [academicYearId, setAcademicYearId] = useState<string | null>(null);
    const [categoryId, setCategoryId] = useState<string>('0');
    const [reportType, setReportType] = useState('1'); // 1: All
    const [students, setStudents] = useState<IAdmissionProcedureReport[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Modal State
    const [selectedStudentData, setSelectedStudentData] = useState<any>(null);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Initial load handling for default year
    useEffect(() => {
        if (initialData?.data?.academicListdefault?.[0]) {
            setAcademicYearId(initialData.data.academicListdefault[0].asmaY_Id.toString());
        }
    }, [initialData]);

    // Handlers
    const handleYearChange = (val: string) => {
        setAcademicYearId(val);
        setStudents([]);
    };

    const handleCategoryChange = (val: string) => {
        setCategoryId(val);
        setStudents([]);
    };

    const handleGetReport = async () => {
        if (!academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }

        try {
            setIsGenerating(true);
            const res = await reportMutation.mutateAsync({
                type: Number(reportType),
                ASMAY_Id: Number(academicYearId),
                ASMCL_Id: 0,
                ASMC_Id: 0,
                AMC_Id: Number(categoryId)
            });

            const studentList = Array.isArray(res?.data) ? res.data : (res?.data as any)?.admissionprocedure || [];

            if (studentList && studentList.length > 0) {
                setStudents(studentList);
            } else {
                setStudents([]);
                toast.error('No records found');
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

    const handleViewDetails = async (student: IAdmissionProcedureReport, type: 'procedure' | 'form') => {
        try {
            const res = await viewDetailsMutation.mutateAsync({
                AMST_Id: student.AMST_Id,
                ASMCL_Id: student.ASMCL_Id,
                ASMAY_Id: Number(academicYearId)
            });

            if (res?.data) {
                setSelectedStudentData(res.data);
                if (type === 'procedure') {
                    setIsProcedureModalOpen(true);
                } else {
                    setIsFormModalOpen(true);
                }
            } else {
                toast.error('No details available for this student');
            }
        } catch (error) {
            toast.error('Failed to load student details');
        }
    };

    const columns = getAdmissionProcedureColumns(
        (row) => handleViewDetails(row, 'procedure'),
        (row) => handleViewDetails(row, 'form')
    );

    return (
        <div className='min-h-screen space-y-6 bg-gray-50 p-4'>
            <CollapsibleSection
                title='ADMISSION PROCEDURE REPORT'
                description='Generate and view detailed admission procedure and form reports'
                defaultOpen={true}
                variant='outline'
                className='shadow-md'>
                <div className='space-y-8 rounded-lg bg-white p-6'>
                    <div className='flex justify-center border-b pb-6'>
                        <RadioGroup value={reportType} onValueChange={setReportType} className='flex gap-12'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='1' id='type-all' />
                                <Label htmlFor='type-all' className='cursor-pointer font-bold'>
                                    ALL
                                </Label>
                            </div>
                            {/* <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
                                <RadioGroupItem value="2" id="type-ind" disabled />
                                <Label htmlFor="type-ind" className="font-bold cursor-pointer">INDIVIDUAL</Label>
                            </div> */}
                        </RadioGroup>
                    </div>

                    <div className='mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2'>
                        <div className='space-y-2'>
                            <Label className='font-bold text-sm'>
                                Academic Year:<span className='text-red-500'>*</span>
                            </Label>
                            <Select value={academicYearId || ''} onValueChange={handleYearChange}>
                                <SelectTrigger className='w-full'>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialData?.data?.academicList?.map((item: any) => (
                                        <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                            {item.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* {initialData?.data?.category_list && initialData?.data?.category_list.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-bold">Category:</Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All</SelectItem>
                                        {initialData?.data?.category_list?.map((item: any) => (
                                            <SelectItem key={item.amC_Id} value={item.amC_Id.toString()}>
                                                {item.amC_Name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )} */}
                    </div>

                    <div className='flex justify-center gap-4 pt-4'>
                        <Button
                            onClick={handleGetReport}
                            disabled={isGenerating || !academicYearId}
                            className='min-w-[140px] bg-indigo-600 font-bold text-white shadow-lg hover:bg-indigo-700'>
                            {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button onClick={handleCancel} variant='destructive' className='min-w-[140px] font-bold'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {students.length > 0 && (
                <div className='space-y-4 rounded-lg bg-white p-6 shadow-md'>
                    <div className='flex items-center justify-between border-b pb-2'>
                        <h3 className='font-bold text-indigo-700 text-lg uppercase'>Admission Procedure Report</h3>
                        <Button
                            onClick={() => handlePrint()}
                            variant='outline'
                            className='border-indigo-200 bg-indigo-50 font-bold text-indigo-700 shadow-sm hover:bg-indigo-100'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print Report
                        </Button>
                    </div>
                    <GenericDataTable data={students} columns={columns} isLoading={isGenerating} />
                </div>
            )}

            {/* Modals */}
            <AdmissionProcedureModal
                isOpen={isProcedureModalOpen}
                onClose={() => setIsProcedureModalOpen(false)}
                data={selectedStudentData}
                logo={initialData?.data?.photopathname || ''}
            />

            <AdmissionFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                data={selectedStudentData}
                logo={initialData?.data?.photopathname || ''}
            />

            {/* Printable Area */}
            <div className='admission-print-area'>
                <AdmissionProcedurePrint
                    ref={printRef}
                    data={students}
                    logo={initialData?.data?.photopathname || ''}
                    academicYear={
                        initialData?.data?.academicList?.find((item: any) => item.asmaY_Id.toString() === academicYearId)?.asmaY_Year || ''
                    }
                />
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .admission-print-area {
                    display: none;
                }
                @media print {
                    body {
                        visibility: hidden !important;
                    }
                    .admission-print-area,
                    .admission-print-area * {
                        visibility: visible !important;
                    }
                    .admission-print-area {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        z-index: 99999 !important;
                        background: white !important;
                    }
                }
            `
                }}
            />
        </div>
    );
}
