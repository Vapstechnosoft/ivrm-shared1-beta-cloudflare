'use client';

import { Button } from '@/components/ui/button';
import type { DataTableRef } from '@/components/ui/data-table/data-table';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useActivePreadmissionDetails,
    usePreadmissionClassDropdown1,
    useadmissionSectionDropdown
} from '@/hooks/admission/preadmission/useTransactions';
import { useSession } from 'next-auth/react';

import type { IStudentYearlyAttendenceReportList } from '@/types/admission/preadmission/reports';
import { FileText, Printer, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useStudentYearlyAttendance } from '@/hooks/admission/preadmission/useReports';
import { GetStudentYearlyAttendance } from '@/server/admission/preadmission/reports/student_yearly_attendance';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';
import { createStudentsYearlyAttendenceReportColumns } from './_components/columns';
import { StudentYearlyReportPrint } from './_components/student-yearly-report-print';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface MonthInfo {
    monthnamee: string;
    yearidname: string;
    monthidname: number;
    MONTH_NAME: string;
    total: number;
}

interface StudentAttendanceRecord {
    TOTAL_PRESENT: number;
    RowNo: number;
    name: string;
    AMST_AdmNo: string;
    AMST_RegistrationNo: string;
    AMAY_RollNo: number;
    yearidname: number;
    monthidname: number;
}

interface AttendanceResponse {
    mI_Id: number;
    asmaY_Id: number;
    asmcL_Id: number;
    asmS_Id: number;
    allOrIndiFlag: string;
    amC_Id: number;
    monthList: MonthInfo[];
    studentAttendanceList: StudentAttendanceRecord[];
}

export default function StudentsYearlyAttendenceReport(props: {
    searchParams: SearchParams;
}) {
    const searchParams = (React as any).use(props.searchParams);
    const router = useRouter();
    const pathname = usePathname();

    const tableRef = useRef<DataTableRef>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const [showReport, setShowReport] = useState(false);

    const handleResetSelection = () => {
        tableRef.current?.resetSelection();
    };

    const handleFilterChange = (filterType: 'class' | 'section' | 'academic_year', value: number) => {
        // Reset report and selections when filter changes
        setShowReport(false);
        setSelectedStudents([]);
        setIsAllRecordsSelected(false);
        handleResetSelection();

        if (filterType === 'class') {
            setClassId(value);
            setSectionId(undefined); // Force section selection
        } else if (filterType === 'section') {
            setSectionId(value);
        } else if (filterType === 'academic_year') {
            setAcademicYearId(value);
        }
    };

    const { data: activePreadmission, isLoading: activePreadmissionDeLoading } = useActivePreadmissionDetails();

    const { data: academicYearOptions, isLoading: academicYearLoading, isError: academicYearError } = useAcademicYearDropdown();

    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown1();

    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [classId, setClassId] = useState<number>(0);
    const [sectionId, setSectionId] = useState<number | undefined>(undefined);

    const [selectedStudents, setSelectedStudents] = useState<IStudentYearlyAttendenceReportList[]>([]);
    const [printData, setPrintData] = useState<any[]>([]);
    const [printMonthList, setPrintMonthList] = useState<any[]>([]);
    const [isAllRecordsSelected, setIsAllRecordsSelected] = useState(false);

    const { data: session } = useSession();
    console.log('Session Data (MI_ID):', session?.mi_id, session);

    const {
        data: admissionSection,
        isLoading: admissionSectionLoading,
        isError: admissionSectionError
    } = useadmissionSectionDropdown(Number(classId));

    console.log('Admission Section Data:', admissionSection);

    const {
        data: response,
        isLoading,
        error,
        refetch: refetchAdmissionStudents
    } = useStudentYearlyAttendance(
        (academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0,
        classId,
        sectionId,
        { ...searchParams, page_size: 100000, page: 1 },
        showReport
    );

    const transformedData = useMemo(() => {
        if (!response?.data || !showReport) {
            return [];
        }

        const attendanceData = response.data as any;
        console.log('API Response:', response);
        console.log('Attendance Data:', attendanceData);

        const realData = attendanceData.data || attendanceData;
        const studentList = realData.studentAttendanceList || realData.StudentAttendanceList;
        const monthListVal = realData.monthList || realData.MonthList;

        if (!studentList || !monthListVal) {
            return [];
        }

        const studentAttendanceList = studentList;
        const monthList = monthListVal;

        const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);

        const studentMap = new Map<string, IStudentYearlyAttendenceReportList>();

        studentAttendanceList.forEach((record: any) => {
            const studentKey = record.AMST_Id;
            if (!studentMap.has(studentKey)) {
                studentMap.set(studentKey, {
                    RowNo: studentMap.size + 1,
                    name: record.name,
                    AMST_AdmNo: record.AMST_AdmNo,
                    AMST_RegistrationNo: record.AMST_RegistrationNo,
                    AMAY_RollNo: record.AMAY_RollNo,
                    monthlyAttendance: {},
                    totalPresent: 0,
                    totalWorkingDays: totalWorkingDays,
                    totalAbsent: totalWorkingDays,
                    percentage: '0.00',
                    AMST_Id: record.AMST_Id ?? 0
                });
            }

            const student = studentMap.get(studentKey)!;
            const monthKey = `${record.yearidname}-${record.monthidname}`;

            student.monthlyAttendance[monthKey] = record.TOTAL_PRESENT;
            student.totalPresent += record.TOTAL_PRESENT;
            student.totalAbsent = student.totalWorkingDays - student.totalPresent;
        });

        return Array.from(studentMap.values()).map((student) => ({
            ...student,
            percentage: student.totalWorkingDays > 0 ? ((student.totalPresent / student.totalWorkingDays) * 100).toFixed(2) : '0.00'
        }));
    }, [response?.data, showReport]);

    const page = Number((searchParams as any)?.page) || 1;
    const pageSize = Number((searchParams as any)?.page_size) || 10;

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return transformedData.slice(start, end);
    }, [transformedData, page, pageSize]);

    const tableProps = useDataTableProps({
        ...response,
        data: paginatedData,
        total: transformedData.length
    });

    const columns = useMemo(() => {
        if (!response?.data) {
            return createStudentsYearlyAttendenceReportColumns([]);
        }

        const attendanceData = response.data as any;
        const realData = attendanceData.data || attendanceData;
        const monthList = realData.monthList || realData.MonthList || [];

        return createStudentsYearlyAttendenceReportColumns(monthList);
    }, [response?.data]);

    const handleSelectStudent = (selectedRows: IStudentYearlyAttendenceReportList[]) => {
        setSelectedStudents(selectedRows);
        // If manually selecting rows, disable "all records selected" mode
        if (isAllRecordsSelected && selectedRows.length !== transformedData.length) {
            setIsAllRecordsSelected(false);
        }
    };

    const handleSelectAllRecords = async () => {
        try {
            toast.loading('Fetching all records...', { id: 'select-all-fetch' });

            // Fetch all data with a large page size
            const allDataResponse = await GetStudentYearlyAttendance(
                (academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0,
                classId,
                sectionId ?? 0,
                { ...searchParams, page_size: 100000 }
            );

            const attendanceData = allDataResponse?.data as any;
            if (!attendanceData) {
                toast.dismiss('select-all-fetch');
                toast.error('Failed to fetch all records');
                return;
            }

            const realData = attendanceData.data || attendanceData;
            // Transform data (same logic as in transformedData)
            const studentList = realData.studentAttendanceList || realData.StudentAttendanceList || [];
            const monthList = realData.monthList || realData.MonthList || [];

            const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);
            const studentMap = new Map<string, IStudentYearlyAttendenceReportList>();

            studentList.forEach((record: any) => {
                const studentKey = record.AMST_Id;
                if (!studentMap.has(studentKey)) {
                    studentMap.set(studentKey, {
                        RowNo: studentMap.size + 1,
                        name: record.name,
                        AMST_AdmNo: record.AMST_AdmNo,
                        AMST_RegistrationNo: record.AMST_RegistrationNo,
                        AMAY_RollNo: record.AMAY_RollNo,
                        monthlyAttendance: {},
                        totalPresent: 0,
                        totalWorkingDays: totalWorkingDays,
                        totalAbsent: totalWorkingDays,
                        percentage: '0.00',
                        AMST_Id: record.AMST_Id ?? 0
                    });
                }

                const student = studentMap.get(studentKey)!;
                const monthKey = `${record.yearidname}-${record.monthidname}`;

                student.monthlyAttendance[monthKey] = record.TOTAL_PRESENT;
                student.totalPresent += record.TOTAL_PRESENT;
                student.totalAbsent = student.totalWorkingDays - student.totalPresent;
            });

            const allRecords = Array.from(studentMap.values()).map((student) => ({
                ...student,
                percentage: student.totalWorkingDays > 0 ? ((student.totalPresent / student.totalWorkingDays) * 100).toFixed(2) : '0.00'
            }));

            setSelectedStudents(allRecords);
            setIsAllRecordsSelected(true);

            toast.dismiss('select-all-fetch');
            toast.success(`Selected all ${allRecords.length} records`);
        } catch (error) {
            console.error('Select all error:', error);
            toast.dismiss('select-all-fetch');
            toast.error('Error fetching all records');
        }
    };

    const handleDeselectAll = () => {
        setSelectedStudents([]);
        setIsAllRecordsSelected(false);
        handleResetSelection();
        toast.info('All selections cleared');
    };

    const handleReset = () => {
        setAcademicYearId(0);
        setClassId(0);
        setSectionId(undefined);
        setSelectedStudents([]);
        setShowReport(false);
        setIsAllRecordsSelected(false);
        handleResetSelection();

        router.replace(pathname);

        toast.success('Filters reset successfully');
    };

    const handleCancel = () => {
        window.location.reload();
    };

    const downloadExcel = async () => {
        try {
            if (!transformedData || transformedData.length === 0) {
                toast.error('No data available to export');
                return;
            }

            const attendanceData = response?.data as any;
            const monthList = attendanceData.monthList || attendanceData.MonthList || [];
            const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);

            const excelData = transformedData.map((student) => {
                const row: any = {
                    'Sl. No.': student.RowNo,
                    'Reg No.': student.AMST_RegistrationNo || 'N.A',
                    'Adm No.': student.AMST_AdmNo || 'N.A',
                    'Student Name': student.name,
                    'Roll No.': student.AMAY_RollNo || 'N.A'
                };

                monthList.forEach((month: any) => {
                    const monthKey = `${month.yearidname}-${month.monthidname}`;
                    const monthName = month.monthnamee.trim();
                    const header = `${monthName} ${month.yearidname}(${month.total})`;
                    row[header] = student.monthlyAttendance[monthKey] ?? 0;
                });

                row[`Total (${totalWorkingDays})`] = Number(student.totalPresent).toFixed(2);
                row['Percentage'] = student.percentage;

                return row;
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

            // Apply some basic styling to headers if possible with xlsx (minimal)
            XLSX.writeFile(workbook, 'StudentYearlyAttendanceReport.xlsx');

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    const handlePrintContent = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Student_Yearly_Attendance_Report'
    });

    const handlePrint = async () => {
        if (!transformedData || transformedData.length === 0) {
            toast.error('No data available to print');
            return;
        }

        try {
            toast.loading('Fetching all records for print...', { id: 'print-fetch' });

            // Fetch all data with text search params intact, but force page: 1
            const allDataResponse = await GetStudentYearlyAttendance(
                (academicYearId || activePreadmission?.data?.asmaY_Id) ?? 0,
                classId,
                sectionId ?? 0,
                { ...searchParams, page_size: 100000, page: 1 }
            );

            const attendanceData = allDataResponse?.data as any;
            if (!attendanceData) {
                toast.dismiss('print-fetch');
                toast.error('Failed to fetch print data');
                return;
            }

            const realData = attendanceData.data || attendanceData;
            // Transform data for print
            const studentList = realData.studentAttendanceList || realData.StudentAttendanceList || [];
            const monthList = realData.monthList || realData.MonthList || [];

            setPrintMonthList(monthList); // Save month list for print headers
            const totalWorkingDays = monthList.reduce((sum: any, month: any) => sum + month.total, 0);

            const studentMap = new Map<string, any>();

            studentList.forEach((record: any) => {
                const studentKey = record.AMST_Id;
                if (!studentMap.has(studentKey)) {
                    studentMap.set(studentKey, {
                        ...record,
                        RowNo: studentMap.size + 1,
                        monthlyAttendance: {},
                        totalPresent: 0,
                        totalWorkingDays: totalWorkingDays,
                        totalAbsent: totalWorkingDays,
                        percentage: '0.00'
                    });
                }

                const student = studentMap.get(studentKey)!;
                const monthKey = `${record.yearidname}-${record.monthidname}`;

                student.monthlyAttendance[monthKey] = record.TOTAL_PRESENT;
                student.totalPresent += record.TOTAL_PRESENT;
                student.totalAbsent = student.totalWorkingDays - student.totalPresent;
            });

            let finalData = Array.from(studentMap.values()).map((student: any) => ({
                ...student,
                percentage: totalWorkingDays > 0 ? ((student.totalPresent / totalWorkingDays) * 100).toFixed(2) : '0.00'
            }));

            // If students were selected in the table, only print those
            if (selectedStudents.length > 0) {
                const selectedIds = new Set(selectedStudents.map((s) => s.RowNo));
                finalData = finalData.filter((student) => selectedIds.has(student.RowNo));
                toast.success(`Ready to print ${finalData.length} selected records`);
            } else {
                toast.success(`Ready to print ${finalData.length} records`);
            }

            setPrintData(finalData);
            toast.dismiss('print-fetch');

            setTimeout(() => {
                handlePrintContent();
            }, 500);
        } catch (error) {
            console.error('Print fetch error:', error);
            toast.dismiss('print-fetch');
            toast.error('Error fetching print data');
        }
    };

    const handleReport = async () => {
        // Validate all dropdowns are selected
        if (!academicYearId || academicYearId === 0) {
            toast.error('Please select Academic Year');
            return;
        }

        if (!classId || classId === 0) {
            toast.error('Please select Class');
            return;
        }

        if (sectionId === undefined) {
            toast.error('Please select Section');
            return;
        }

        setShowReport(true);
        toast.loading('Generating report...', { id: 'report-loading' });
        try {
            const result = await refetchAdmissionStudents();
            const attendanceData = result.data?.data as any;
            const realData = attendanceData?.data || attendanceData;
            const students = realData?.studentAttendanceList || realData?.StudentAttendanceList || [];

            toast.dismiss('report-loading');
            if (students.length > 0) {
                toast.success(`Report generated (${students.length} records)`);
            } else {
                toast.error('No records found');
            }
        } catch (err) {
            toast.dismiss('report-loading');
            toast.error('Failed to generate report');
            console.error('Report generation error:', err);
        }
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Student Yearly Attendance Report'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='no-print slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className='flex flex-row justify-center gap-6'>
                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='academic-year' className='font-medium text-gray-900 text-sm'>
                                    Academic Year <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('academic_year', Number(value))}
                                    value={academicYearId !== 0 ? academicYearId?.toString() : undefined}>
                                    <SelectTrigger id='academic-year' className='w-full'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : academicYearError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            academicYearOptions?.data?.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='class' className='font-medium text-gray-900 text-sm'>
                                    Class <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    onValueChange={(value) => handleFilterChange('class', Number(value))}
                                    value={classId !== 0 ? classId?.toString() : undefined}>
                                    <SelectTrigger id='class' className='w-full'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {preadmissionClassLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : preadmissionClassError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            preadmissionClass?.data?.map((item) => (
                                                <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                    {item.asmcL_ClassName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='w-full max-w-xs space-y-2'>
                                <Label htmlFor='section' className='font-medium text-gray-900 text-sm'>
                                    Section <span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    key={classId}
                                    onValueChange={(value) => handleFilterChange('section', Number(value))}
                                    value={sectionId !== undefined ? sectionId.toString() : undefined}
                                    disabled={classId === 0}>
                                    <SelectTrigger id='section' className='w-full'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={0} value={'0'}>
                                            All
                                        </SelectItem>
                                        {admissionSectionLoading ? (
                                            <SelectItem value='loading' disabled>
                                                Loading...
                                            </SelectItem>
                                        ) : admissionSectionError ? (
                                            <SelectItem value='error' disabled>
                                                Error loading
                                            </SelectItem>
                                        ) : (
                                            admissionSection?.data?.map((item: any) => (
                                                <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                    {item.asmC_SectionName}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                onClick={handleReport}
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                <FileText className='mr-2 h-4 w-4' />
                                Report
                            </Button>

                            <Button
                                variant='outline'
                                className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                onClick={handleCancel}>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                            {showReport && response && (
                                <>
                                    <Button onClick={downloadExcel} className='w-fit'>
                                        Export to Excel
                                    </Button>
                                    <Button
                                        variant='outline'
                                        className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                        onClick={handlePrint}>
                                        <Printer className='mr-2 h-4 w-4' />
                                        Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CollapsibleSection>

                {/* On-Screen Report Table */}
                {showReport && transformedData && transformedData.length > 0 && (
                    <CollapsibleSection
                        title='Student Yearly Attendance Report'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        {/* Select All Banner Removed */}

                        <GenericDataTable<IStudentYearlyAttendenceReportList>
                            {...tableProps}
                            ref={tableRef}
                            columns={columns}
                            isLoading={activePreadmissionDeLoading || isLoading}
                            error={error}
                            showViewOptions={false}
                            loadingMessage='Loading attendance report...'
                            noDataTitle='No Data Found'
                            noDataDescription='No attendance records found. Please select filters to view data.'
                            errorTitle='Error Loading Attendance Report'
                        />
                    </CollapsibleSection>
                )}

                {/* Hidden Print Component */}
                <div style={{ position: 'absolute', opacity: 0, zIndex: -1, overflow: 'visible', width: 0, height: 0 }}>
                    <StudentYearlyReportPrint ref={printRef} data={printData} monthList={printMonthList} />
                </div>
            </div>
        </div>
    );
}
