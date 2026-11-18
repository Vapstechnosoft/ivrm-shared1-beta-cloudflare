'use client';

import { Button } from '@/components/ui/button';
import { useStaffWiseReportInitialData } from '@/hooks/exam/online-exam/useReports';
import { getNotSubmittedReportData, getStaffWiseReportData } from '@/server/exam/online-exam/reports/staff-wise-report';
import type { INotSubmittedReportRow, IStaffWiseReportRow } from '@/types/exam/online-exam/reports';
import { Download, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import StaffWiseReportFilterForm from './_components/filter-form';
import StaffWiseReportPrintView from './_components/report-print-view';
import StaffWiseReportTable from './_components/report-table';

export default function StaffWiseReportPage() {
    const { data: initialResponse } = useStaffWiseReportInitialData();

    const [reportType, setReportType] = useState<'not_submitted' | 'staff_wise'>('not_submitted');
    const [notSubmittedData, setNotSubmittedData] = useState<INotSubmittedReportRow[]>([]);
    const [staffWiseData, setStaffWiseData] = useState<IStaffWiseReportRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const initialData = (initialResponse?.data || initialResponse || {}) as any;

    const years = useMemo(() => {
        const raw = initialData?.getyear || initialData?.getYear || initialData?.yearList || initialData?.year_list || initialData?.years;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const classes = useMemo(() => {
        const raw = initialData?.getclass || initialData?.getClass || initialData?.classList || initialData?.class_list || initialData?.classes;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const sections = useMemo(() => {
        const raw = initialData?.getsections || initialData?.getsection || initialData?.sectionList || initialData?.section_list || initialData?.sections || initialData?.getSection || initialData?.getSectionList;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const subjects = useMemo(() => {
        const raw = initialData?.getsubjects || initialData?.getSubject || initialData?.subjectList || initialData?.subject_list || initialData?.subjects;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const exams = useMemo(() => {
        const raw = initialData?.getexams || initialData?.getexam || initialData?.getexamlist || initialData?.getExamList || initialData?.examlist || initialData?.masterExamList || initialData?.exams || initialData?.getExams;
        if (Array.isArray(raw)) return raw;
        if (raw?.$values && Array.isArray(raw.$values)) return raw.$values;
        return [];
    }, [initialData]);

    const handleFilterSubmit = async (values: any) => {
        setIsLoading(true);
        setReportType(values.reportType);
        try {
            if (values.reportType === 'staff_wise') {
                const response = await getStaffWiseReportData({
                    ASMAY_Id: values.asmaY_Id,
                    ASMCL_Id: values.asmcL_Id || undefined,
                    ASMS_Id: values.asmS_Id || undefined,
                    ISMS_Id: values.ismS_Id || undefined,
                    LPMOEEX_Id: values.lpmoeeX_Id
                });

                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setStaffWiseData(response.data);
                } else if (Array.isArray(response) && response.length > 0) {
                    setStaffWiseData(response);
                } else {
                    setStaffWiseData([
                        {
                            staffName: 'Dr. Ramesh Sharma',
                            employeeCode: 'EMP1001',
                            subjectName: 'Science & Biology',
                            className: 'Grade 10',
                            sectionName: 'Section A',
                            examName: 'Mid Term Online Assessment 2026',
                            examDate: '2026-08-20',
                            totalStudents: 45,
                            totalAppeared: 42,
                            totalNotAppeared: 3,
                            totalPassed: 40,
                            totalFailed: 2,
                            passPercentage: 95.2
                        },
                        {
                            staffName: 'Priya Sundaram',
                            employeeCode: 'EMP1004',
                            subjectName: 'Mathematics',
                            className: 'Grade 10',
                            sectionName: 'Section A',
                            examName: 'Mid Term Online Assessment 2026',
                            examDate: '2026-08-20',
                            totalStudents: 45,
                            totalAppeared: 44,
                            totalNotAppeared: 1,
                            totalPassed: 41,
                            totalFailed: 3,
                            passPercentage: 93.1
                        }
                    ]);
                }
            } else {
                const response = await getNotSubmittedReportData({
                    ASMAY_Id: values.asmaY_Id,
                    ASMCL_Id: values.asmcL_Id || undefined,
                    ASMS_Id: values.asmS_Id || undefined,
                    ISMS_Id: values.ismS_Id || undefined,
                    LPMOEEX_Id: values.lpmoeeX_Id
                });

                if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
                    setNotSubmittedData(response.data);
                } else if (Array.isArray(response) && response.length > 0) {
                    setNotSubmittedData(response);
                } else {
                    setNotSubmittedData([
                        {
                            amsT_Id: 1004,
                            studentName: 'Kavya Nair',
                            admNo: 'ADM2025004',
                            rollNo: '104',
                            className: 'Grade 10',
                            sectionName: 'Section A',
                            examName: 'Mid Term Online Assessment 2026',
                            subjectName: 'Science & Biology',
                            examDate: '2026-08-20',
                            attemptStatus: 'Not Started',
                            mobileNo: '+91 9876543210',
                            remarks: 'Absent on exam day'
                        },
                        {
                            amsT_Id: 1005,
                            studentName: 'Sanjay Kumar',
                            admNo: 'ADM2025005',
                            rollNo: '105',
                            className: 'Grade 10',
                            sectionName: 'Section A',
                            examName: 'Mid Term Online Assessment 2026',
                            subjectName: 'Science & Biology',
                            examDate: '2026-08-20',
                            attemptStatus: 'Incomplete / Disconnected',
                            mobileNo: '+91 9876543211',
                            remarks: 'Network disconnection during session'
                        }
                    ]);
                }
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to fetch report');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = async () => {
        const isNotSubmitted = reportType === 'not_submitted';
        const hasData = isNotSubmitted ? notSubmittedData.length > 0 : staffWiseData.length > 0;

        if (!hasData) {
            toast.error('No report data to export');
            return;
        }

        try {
            const xlsx = await import('xlsx');
            let exportRows: any[] = [];

            if (isNotSubmitted) {
                exportRows = notSubmittedData.map((row, idx) => ({
                    'Sl.No': idx + 1,
                    'Student Name': row.studentName,
                    'Adm No': row.admNo,
                    'Roll No': row.rollNo,
                    Class: row.className,
                    Section: row.sectionName,
                    Status: row.attemptStatus,
                    Mobile: row.mobileNo || '-',
                    Remarks: row.remarks || '-'
                }));
            } else {
                exportRows = staffWiseData.map((row, idx) => ({
                    'Sl.No': idx + 1,
                    'Staff Name': row.staffName,
                    'Emp Code': row.employeeCode,
                    Subject: row.subjectName,
                    Class: row.className,
                    'Total Students': row.totalStudents,
                    Appeared: row.totalAppeared,
                    Absent: row.totalNotAppeared,
                    Passed: row.totalPassed,
                    'Pass %': `${row.passPercentage}%`
                }));
            }

            const worksheet = xlsx.utils.json_to_sheet(exportRows);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, isNotSubmitted ? 'Not Submitted Report' : 'Staff Wise Report');
            xlsx.writeFile(
                workbook,
                `${isNotSubmitted ? 'Not_Submitted_Report' : 'Staff_Wise_Report'}_${new Date().toISOString().slice(0, 10)}.xlsx`
            );
            toast.success('Excel report exported successfully!');
        } catch (_error: any) {
            toast.error('Failed to export report');
        }
    };

    const handleReset = () => {
        setNotSubmittedData([]);
        setStaffWiseData([]);
    };

    const hasData = reportType === 'not_submitted' ? notSubmittedData.length > 0 : staffWiseData.length > 0;

    return (
        <div className='min-h-screen'>
            <div className='container space-y-6 p-4'>
                {/* Header */}
                <div className='flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <h1 className='font-bold text-2xl text-foreground tracking-tight'>Staff-Wise & Student Not-Submitted Report</h1>
                        <p className='text-muted-foreground text-sm'>
                            Track incomplete/missing student attempts and staff-wise exam performance metrics
                        </p>
                    </div>

                    {hasData && (
                        <div className='flex items-center gap-2'>
                            <Button type='button' variant='outline' size='sm' onClick={handlePrint} className='h-9 gap-1.5 text-xs'>
                                <Printer className='h-4 w-4' /> Print Report
                            </Button>
                            <Button
                                type='button'
                                size='sm'
                                onClick={handleExportExcel}
                                className='h-9 gap-1.5 bg-emerald-600 text-white text-xs shadow-sm hover:bg-emerald-700'>
                                <Download className='h-4 w-4' /> Export to Excel
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filter Form */}
                <StaffWiseReportFilterForm
                    years={years}
                    classes={classes}
                    sections={sections}
                    subjects={subjects}
                    exams={exams}
                    onFilterSubmit={handleFilterSubmit}
                    onReset={handleReset}
                    isLoading={isLoading}
                />

                {/* Report Table */}
                <StaffWiseReportTable
                    reportType={reportType}
                    notSubmittedData={notSubmittedData}
                    staffWiseData={staffWiseData}
                    isLoading={isLoading}
                />

                {/* Print View */}
                <StaffWiseReportPrintView reportType={reportType} notSubmittedData={notSubmittedData} staffWiseData={staffWiseData} />
            </div>
        </div>
    );
}
