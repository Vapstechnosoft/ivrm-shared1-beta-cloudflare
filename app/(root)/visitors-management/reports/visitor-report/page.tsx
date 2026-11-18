'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import PrintableVisitorReport from './_components/printable-visitor-report';
import VisitorReportFilter from './_components/visitor-report-filter';
import VisitorReportTable from './_components/visitor-report-table';
import { getVisitorReportData, getVisitorReportInitialData } from './actions';
import type { MonthItem, VisitorReportRecord } from './types';

export default function VisitorReportPage() {
    const [monthList, setMonthList] = useState<MonthItem[]>([]);
    const [searchBy, setSearchBy] = useState<string>('all');
    const [searchValue, setSearchValue] = useState<string>('');
    const [meetingDate, setMeetingDate] = useState<string>('');
    const [filterMode, setFilterMode] = useState<'1' | '0'>('1'); // '1' = Between Days, '0' = Month Wise
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const [reportData, setReportData] = useState<VisitorReportRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasSearched, setHasSearched] = useState<boolean>(false);

    // Initial Data loading (months list)
    useEffect(() => {
        async function fetchInitial() {
            try {
                const res = await getVisitorReportInitialData();
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
        if (!searchBy) {
            toast.error('Please select a Search By option');
            return;
        }

        if (searchBy === 'VMMV_MeetingDateTime' && !meetingDate) {
            toast.error('Please select Meeting Date');
            return;
        }

        if (searchBy !== 'all' && searchBy !== 'VMMV_MeetingDateTime' && !searchValue.trim()) {
            toast.error('Please enter the search value');
            return;
        }

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
            let finalTxtBox = '';
            if (searchBy === 'all') {
                finalTxtBox = 'All';
            } else if (searchBy === 'VMMV_MeetingDateTime') {
                const d = new Date(meetingDate);
                finalTxtBox = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
            } else {
                finalTxtBox = searchValue.trim();
            }

            const res = await getVisitorReportData({
                searchby: searchBy,
                txtbox: finalTxtBox,
                all1: filterMode,
                fromdate: fromDate,
                todate: toDate,
                month_id: selectedMonth
            });

            setHasSearched(true);

            if (res.success && res.data?.viewlist && res.data.viewlist.length > 0) {
                setReportData(res.data.viewlist);
                toast.success(`Fetched ${res.data.viewlist.length} visitor record(s)`);
            } else {
                setReportData([]);
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
        setSearchBy('all');
        setSearchValue('');
        setMeetingDate('');
        setFilterMode('1');
        setSelectedMonth('');
        setFromDate('');
        setToDate('');
        setReportData([]);
        setHasSearched(false);
        toast.info('Form filters reset');
    };

    // Print
    const handlePrint = () => {
        if (reportData.length === 0) {
            toast.error('No data available to print');
            return;
        }
        window.print();
    };

    // Export to Excel
    const handleExportExcel = () => {
        if (reportData.length === 0) {
            toast.error('No visitor records to export');
            return;
        }

        const excelRows = reportData.map((item, index) => {
            const visitorName = item.amvM_Name || item.VMMV_VisitorName || '';
            const contactNo = item.amvM_Contact_No || item.VMMV_VisitorContactNo || '';
            const emailId = item.amvM_Emailid || item.VMMV_VisitorEmailid || '';
            const rawDate = item.date_Visit || item.Date_Visit || item.VMMV_MeetingDateTime;
            const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('en-GB') : '';
            const inTime = item.time_Visit || item.Time_Visit || item.VMMV_EntryDateTime || '';
            const outTime = item.amvM_Out_Time || item.VMMV_ExitDateTime || '';
            const location = item.VMMV_MeetingLocation || item.amvM_Address || '';
            const status = item.amvM_Status || item.VMMV_CkeckedInOutStatus || '';
            const purpose = item.amvM_Purpose || item.VMMV_MeetingPurpose || '';

            return {
                'SL. No.': index + 1,
                'Visitor Name': visitorName,
                'Contact No': contactNo,
                'Email Id': emailId,
                Date: formattedDate,
                'In Time': inTime,
                'Out Time': outTime,
                'Meeting Location': location,
                Status: status,
                Purpose: purpose
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(excelRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Visitors Report');
        XLSX.writeFile(workbook, `Visitors_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success('Visitors report exported to Excel');
    };

    const dateSubtitle =
        filterMode === '0' && selectedMonth
            ? `Month: ${monthList.find((m) => m.monthid.toString() === selectedMonth)?.monthname || selectedMonth}`
            : fromDate && toDate
              ? `Period: ${fromDate} to ${toDate}`
              : undefined;

    const searchSubtitle =
        searchBy === 'all'
            ? 'Criteria: All Visitors'
            : searchBy === 'VMMV_MeetingDateTime'
              ? `Criteria: Meeting Date - ${meetingDate}`
              : searchValue
                ? `Criteria: ${searchBy} - ${searchValue}`
                : undefined;

    return (
        <div className='min-h-screen space-y-6 pt-4 pb-12'>
            {/* Page Content Container */}
            <div className='fade-in container mx-auto max-w-7xl animate-in space-y-6 px-4 duration-300 sm:px-6 lg:px-8'>
                {/* Filter Form Card */}
                <div className='print:hidden'>
                    <VisitorReportFilter
                        monthList={monthList}
                        searchBy={searchBy}
                        setSearchBy={setSearchBy}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        meetingDate={meetingDate}
                        setMeetingDate={setMeetingDate}
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
                        hasData={reportData.length > 0}
                    />
                </div>

                {/* Grid Display Section */}
                <div className='print:hidden'>{hasSearched && <VisitorReportTable data={reportData} />}</div>

                {/* Printable Section */}
                <PrintableVisitorReport data={reportData} dateSubtitle={dateSubtitle} searchSubtitle={searchSubtitle} />
            </div>
        </div>
    );
}
