'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { z } from 'zod';

import type { ttMonthEndReportSchema } from '@/schemas/timetable/reports';
import { getTTMonthEndReport, getTTMonthEndReportDetails } from '@/server/timetable/reports/ttmonthendreport';

import ReportChart from './_components/report-chart';
import ReportForm from './_components/report-form';
import ReportTable from './_components/report-table';

type FormFields = z.infer<typeof ttMonthEndReportSchema.search>;

interface IAcademicYear {
    asmaY_Id: number;
    asmaY_Year: string;
}

interface IMonth {
    ivrM_Month_Id: number;
    ivrM_Month_Name: string;
}

export default function TTMonthEndReportPage() {
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [months, setMonths] = useState<IMonth[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [logoPath, setLogoPath] = useState<string>('');
    const [showReport, setShowReport] = useState<boolean>(false);
    const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
    const [searchData, setSearchData] = useState<FormFields | null>(null);

    // Load logo path and initial details (academic years and months list)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const admfigsettingsStr = localStorage.getItem('admfigsettings');
                if (admfigsettingsStr) {
                    const admfigsettings = JSON.parse(admfigsettingsStr);
                    if (Array.isArray(admfigsettings) && admfigsettings.length > 0) {
                        setLogoPath(admfigsettings[0].asC_Logo_Path || '');
                    }
                }
            } catch (err) {
                console.error('Error loading logo path from localStorage:', err);
            }
        }

        const fetchDetails = async () => {
            try {
                setLoadingDetails(true);
                const response = await getTTMonthEndReportDetails();
                console.log('response', response);

                const rawData: any = response.data?.data || response.data || response;

                if (rawData) {
                    const acdlist = Array.isArray(rawData) ? rawData : rawData.acdlist || rawData.academicYears || [];

                    let monthlist = Array.isArray(rawData) ? [] : rawData.monthlist || rawData.months || [];
                    if (!monthlist || monthlist.length === 0) {
                        monthlist = [
                            { ivrM_Month_Id: 4, ivrM_Month_Name: 'April' },
                            { ivrM_Month_Id: 5, ivrM_Month_Name: 'May' },
                            { ivrM_Month_Id: 6, ivrM_Month_Name: 'June' },
                            { ivrM_Month_Id: 7, ivrM_Month_Name: 'July' },
                            { ivrM_Month_Id: 8, ivrM_Month_Name: 'August' },
                            { ivrM_Month_Id: 9, ivrM_Month_Name: 'September' },
                            { ivrM_Month_Id: 10, ivrM_Month_Name: 'October' },
                            { ivrM_Month_Id: 11, ivrM_Month_Name: 'November' },
                            { ivrM_Month_Id: 12, ivrM_Month_Name: 'December' },
                            { ivrM_Month_Id: 1, ivrM_Month_Name: 'January' },
                            { ivrM_Month_Id: 2, ivrM_Month_Name: 'February' },
                            { ivrM_Month_Id: 3, ivrM_Month_Name: 'March' }
                        ];
                    }

                    setAcademicYears(acdlist);
                    setMonths(monthlist);
                } else {
                    toast.error('Failed to load page dropdown details');
                }
            } catch (err: any) {
                console.error('Error loading page details:', err);
                toast.error(err?.message || 'Failed to load page dropdown details');
            } finally {
                setLoadingDetails(false);
            }
        };

        fetchDetails();
    }, []);

    const handleClear = () => {
        setShowReport(false);
        setReportData([]);
        setSearchData(null);
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const response = await getTTMonthEndReport({
                month: Number(data.month),
                ASMAY_ID: Number(data.asmaY_Id),
                year: Number(data.asmaY_Id)
            });

            const rawData: any = response.data?.data || response.data || response;
            const reportList = rawData.dayslst3 || rawData.reportdatelist || rawData.reportDateList || [];

            if (!reportList || reportList.length === 0) {
                toast.error('Record Not Found');
                setReportData([]);
                setShowReport(false);
                return;
            }

            setReportData(reportList);
            setSearchData(data);
            setShowReport(true);
            toast.success('Report data generated successfully');
        } catch (err: any) {
            console.error('Error fetching report:', err);
            toast.error(err?.message || 'Failed to generate report');
        }
    };

    const academicYearLabel = useMemo(() => {
        if (!searchData?.asmaY_Id) return '';
        return academicYears.find((y) => Number(y.asmaY_Id) === Number(searchData.asmaY_Id))?.asmaY_Year || '';
    }, [searchData?.asmaY_Id, academicYears]);

    const monthLabel = useMemo(() => {
        if (!searchData?.month) return '';
        return months.find((m) => Number(m.ivrM_Month_Id) === Number(searchData.month))?.ivrM_Month_Name || '';
    }, [searchData?.month, months]);

    const formattedDate = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    }, []);

    return (
        <div className='container mx-auto max-w-7xl space-y-6 p-4'>
            <ReportForm
                academicYears={academicYears}
                months={months}
                loadingDetails={loadingDetails}
                onSubmit={onSubmit}
                onClear={handleClear}
            />

            {showReport && reportData.length > 0 && (
                <div className='space-y-6'>
                    <ReportTable
                        reportData={reportData}
                        enteredName={searchData?.name || ''}
                        formattedDate={formattedDate}
                        academicYearLabel={academicYearLabel}
                        monthLabel={monthLabel}
                        logoPath={logoPath}
                    />
                    <ReportChart reportData={reportData} />
                </div>
            )}
        </div>
    );
}
