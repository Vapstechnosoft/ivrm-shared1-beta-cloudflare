'use client';

import { PolygonBanner } from '@/components/ui/extension/polygon-banner';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import EmployeeGatePassTable from './_components/employee-gate-pass-table';
import GatePassReportFilter from './_components/gate-pass-report-filter';
import PrintableGatePassReport from './_components/printable-gate-pass-report';
import StudentGatePassTable from './_components/student-gate-pass-table';
import { getGatePassReportData, getGatePassReportInitialData } from './actions';
import type { EmployeeGatePassRecord, MonthItem, StudentGatePassRecord } from './types';

export default function GatePassReportPage() {
    const [monthList, setMonthList] = useState<MonthItem[]>([]);
    const [radioType, setRadioType] = useState<'std' | 'emp'>('std');
    const [filterMode, setFilterMode] = useState<'1' | '0'>('1'); // '1' = Between Days, '0' = Month Wise
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const [studentData, setStudentData] = useState<StudentGatePassRecord[]>([]);
    const [employeeData, setEmployeeData] = useState<EmployeeGatePassRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    // Initial Data loading (months list)
    useEffect(() => {
        async function fetchInitial() {
            try {
                const res = await getGatePassReportInitialData();
                if (res.success && res.data.month_list) {
                    setMonthList(res.data.month_list);
                }
            } catch (err) {
                console.error('Failed to load initial months:', err);
            }
        }
        fetchInitial();
    }, []);

    // Generate Report
    const handleGenerateReport = async () => {
        if (filterMode === '0' && !selectedMonth) {
            toast.error('Please select a Month');
            return;
        }

        if (filterMode === '1') {
            if (!fromDate || !toDate) {
                toast.error('Please select both From Date and To Date');
                return;
            }
            if (new Date(fromDate) > new Date(toDate)) {
                toast.error('From Date cannot be after To Date');
                return;
            }
        }

        setIsLoading(true);
        try {
            const res = await getGatePassReportData({
                radiotype: radioType,
                all1: filterMode,
                fromdate: fromDate,
                todate: toDate,
                month_id: selectedMonth
            });

            setHasSearched(true);

            if (res.success && res.data?.viewlist && res.data.viewlist.length > 0) {
                if (radioType === 'std') {
                    setStudentData(res.data.viewlist as StudentGatePassRecord[]);
                    setEmployeeData([]);
                } else {
                    setEmployeeData(res.data.viewlist as EmployeeGatePassRecord[]);
                    setStudentData([]);
                }
                toast.success(`Fetched ${res.data.viewlist.length} records`);
            } else {
                setStudentData([]);
                setEmployeeData([]);
                toast.info('No Records Found for the selected criteria');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to generate report');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset Form & Grid
    const handleCancel = () => {
        setRadioType('std');
        setFilterMode('1');
        setSelectedMonth('');
        setFromDate('');
        setToDate('');
        setStudentData([]);
        setEmployeeData([]);
        setHasSearched(false);
        toast.info('Form filters reset');
    };

    // Print
    const handlePrint = () => {
        const total = radioType === 'std' ? studentData.length : employeeData.length;
        if (total === 0) {
            toast.error('No data available to print');
            return;
        }
        window.print();
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (radioType === 'std') {
            if (studentData.length === 0) {
                toast.error('No student data to export');
                return;
            }
            const excelRows = studentData.map((item, index) => ({
                'SL. No.': index + 1,
                'Adm. No': item.amsT_AdmNo || '',
                'Student Name': item.amsT_FirstName || '',
                Class: item.asmcL_ClassName || '',
                Section: item.asmC_SectionName || '',
                Mobile: item.amsT_MobileNo || '',
                'Gate Pass No': item.gphS_GatePassNo || '',
                'Card No': item.gphS_IDCardNo || '',
                Date: item.gphS_DateTime ? new Date(item.gphS_DateTime).toLocaleDateString('en-GB') : '',
                Remarks: item.gphS_Remarks || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Gate Pass');
            XLSX.writeFile(workbook, `Student_Gate_Pass_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Student Gate Pass report exported to Excel');
        } else {
            if (employeeData.length === 0) {
                toast.error('No employee data to export');
                return;
            }
            const excelRows = employeeData.map((item, index) => ({
                'SL. No.': index + 1,
                'Emp Code': item.hrmE_EmployeeCode || '',
                Name: item.hrmE_EmployeeFirstName || '',
                Department: item.hrmD_DepartmentName || '',
                Designation: item.hrmdeS_DesignationName || '',
                'Contact No.': item.hrmE_MobileNo || '',
                'Gate Pass No': item.gphsT_GatePassNo || '',
                'Card No': item.gphsT_IDCardNo || '',
                Date: item.gphsT_DateTime ? new Date(item.gphsT_DateTime).toLocaleDateString('en-GB') : '',
                Remarks: item.gphsT_Remarks || ''
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Gate Pass');
            XLSX.writeFile(workbook, `Employee_Gate_Pass_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            toast.success('Employee Gate Pass report exported to Excel');
        }
    };

    const hasData = radioType === 'std' ? studentData.length > 0 : employeeData.length > 0;

    const dateSubtitle =
        filterMode === '0' && selectedMonth
            ? `Month: ${monthList.find((m) => m.monthid.toString() === selectedMonth)?.monthname || selectedMonth}`
            : fromDate && toDate
              ? `Period: ${fromDate} to ${toDate}`
              : undefined;

    return (
        <div className='min-h-screen space-y-6 pb-12'>
            {/* Top Polygon Banner matching Screenshot 1 */}
            <PolygonBanner
                title='Gate Pass Report'
                description='Generate and export Student and Employee Gate Pass reports with customizable date criteria'
                breadcrumb={
                    <div className='flex flex-wrap items-center gap-1.5 text-white/80 text-xs sm:text-sm'>
                        <Link href='/visitors-management' className='font-medium transition-colors hover:text-white'>
                            Visitor Management
                        </Link>
                        <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        <span className='transition-colors hover:text-white'>Reports</span>
                        <ChevronRight className='h-3.5 w-3.5 sm:h-4 sm:w-4' />
                        <span className='font-bold text-white'>Gate Pass Report</span>
                    </div>
                }
            />

            {/* Page Content Container matching Screenshot 1 */}
            <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 px-4 duration-300 sm:px-6 lg:px-8'>
                {/* Filter Form Card */}
                <div className='print:hidden'>
                    <GatePassReportFilter
                        monthList={monthList}
                        radioType={radioType}
                        setRadioType={(type) => {
                            setRadioType(type);
                            setStudentData([]);
                            setEmployeeData([]);
                            setHasSearched(false);
                        }}
                        filterMode={filterMode}
                        setFilterMode={setFilterMode}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        fromDate={fromDate}
                        setFromDate={setFromDate}
                        toDate={toDate}
                        setToDate={setToDate}
                        onGenerateReport={handleGenerateReport}
                        onCancel={handleCancel}
                        onPrint={handlePrint}
                        onExportExcel={handleExportExcel}
                        isLoading={isLoading}
                        hasData={hasData}
                    />
                </div>

                {/* Grid Display Section */}
                <div className='print:hidden'>
                    {hasSearched &&
                        (radioType === 'std' ? <StudentGatePassTable data={studentData} /> : <EmployeeGatePassTable data={employeeData} />)}
                </div>

                {/* Printable Section */}
                <PrintableGatePassReport
                    radioType={radioType}
                    studentData={studentData}
                    employeeData={employeeData}
                    dateSubtitle={dateSubtitle}
                />
            </div>
        </div>
    );
}
