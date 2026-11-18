'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { exportToExcel } from '@/lib/export-to-file';
import type { IAdmissionStatusItem, IApplicationStatusItem } from '@/types/exam/exam-module/reports/count-status-report';
import { ArrowUpDown, FileSpreadsheet, Printer, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#6366f1'];

interface ReportListProps {
    admissionData: IAdmissionStatusItem[];
    applicationData: IApplicationStatusItem[];
    academicYearName: string;
    showGraphs: boolean;
}

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
};

export function ReportList({
    admissionData,
    applicationData,
    academicYearName,
    showGraphs
}: ReportListProps) {
    const [appSearch, setAppSearch] = useState('');
    const [admSearch, setAdmSearch] = useState('');

    const [appSort, setAppSort] = useState<SortConfig>({ key: 'index', direction: 'asc' });
    const [admSort, setAdmSort] = useState<SortConfig>({ key: 'index', direction: 'asc' });

    const handleAppSort = (key: string) => {
        setAppSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleAdmSort = (key: string) => {
        setAdmSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredAppStatus = useMemo(() => {
        let result = applicationData.map((item, index) => ({
            ...item,
            originalIndex: index + 1
        }));

        if (appSearch.trim()) {
            const q = appSearch.toLowerCase();
            result = result.filter(
                (item) =>
                    (item.statusName || '').toLowerCase().includes(q) ||
                    String(item.data).toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let valA: any = a.originalIndex;
            let valB: any = b.originalIndex;

            if (appSort.key === 'statusName') {
                valA = a.statusName || '';
                valB = b.statusName || '';
            } else if (appSort.key === 'data') {
                valA = Number(a.data || 0);
                valB = Number(b.data || 0);
            }

            if (valA < valB) return appSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return appSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [applicationData, appSearch, appSort]);

    const filteredAdmStatus = useMemo(() => {
        let result = admissionData.map((item, index) => ({
            ...item,
            originalIndex: index + 1
        }));

        if (admSearch.trim()) {
            const q = admSearch.toLowerCase();
            result = result.filter(
                (item) =>
                    (item.PAMST_Status || '').toLowerCase().includes(q) ||
                    String(item.Data_count).toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let valA: any = a.originalIndex;
            let valB: any = b.originalIndex;

            if (admSort.key === 'PAMST_Status') {
                valA = a.PAMST_Status || '';
                valB = b.PAMST_Status || '';
            } else if (admSort.key === 'Data_count') {
                valA = Number(a.Data_count || 0);
                valB = Number(b.Data_count || 0);
            }

            if (valA < valB) return admSort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return admSort.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [admissionData, admSearch, admSort]);

    const applicationChartData = useMemo(() => {
        return applicationData.map((item) => ({
            name: item.statusName || `Status ${item.PASRAPS_ID}`,
            count: Number(item.data || 0)
        }));
    }, [applicationData]);

    const admissionChartData = useMemo(() => {
        return admissionData.map((item) => ({
            name: item.PAMST_Status || 'Unknown',
            count: Number(item.Data_count || 0)
        }));
    }, [admissionData]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const columns = JSON.stringify([
            { label: 'SL.NO', value: 'slNo' },
            { label: 'Section / Type', value: 'type' },
            { label: 'Status Name', value: 'status' },
            { label: 'Count', value: 'count' }
        ]);

        const content = JSON.stringify([
            ...applicationData.map((item, idx) => ({
                slNo: idx + 1,
                type: 'Application Status',
                status: item.statusName || `Status ${item.PASRAPS_ID}`,
                count: item.data
            })),
            ...admissionData.map((item, idx) => ({
                slNo: idx + 1,
                type: 'Admission Status',
                status: item.PAMST_Status,
                count: item.Data_count
            }))
        ]);

        exportToExcel('Status_Count_Report', columns, content, true);
    };

    return (
        <div className='space-y-8'>
            {/* Action Bar */}
            <div className='flex flex-wrap items-center justify-between gap-4 print:hidden'>
                <div>
                    <h2 className='text-xl font-bold text-foreground'>Status Count Summary</h2>
                    <p className='text-sm text-muted-foreground'>
                        Academic Year: <span className='font-semibold text-foreground'>{academicYearName}</span>
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <Button variant='outline' size='sm' onClick={handleExportExcel} className='shadow-sm'>
                        <FileSpreadsheet className='mr-2 h-4 w-4 text-emerald-600' />
                        Export Excel
                    </Button>
                    <Button variant='outline' size='sm' onClick={handlePrint} className='shadow-sm'>
                        <Printer className='mr-2 h-4 w-4 text-blue-600' />
                        Print
                    </Button>
                </div>
            </div>

            {/* Printable Header */}
            <div className='hidden print:block text-center border-b pb-4 mb-4'>
                <h1 className='text-2xl font-bold'>STATUS COUNT REPORT</h1>
                <p className='text-sm text-muted-foreground'>Academic Year: {academicYearName}</p>
            </div>

            {/* 1. APPLICATION STATUS DETAILS TABLE */}
            {applicationData.length > 0 && (
                <Card className='shadow-md border border-border/60 transition-all'>
                    <CardHeader className='border-b bg-muted/20 pb-4 flex flex-row items-center justify-between gap-4'>
                        <CardTitle className='text-base font-semibold text-foreground'>
                            Application Status Details
                        </CardTitle>
                        <div className='relative w-64 print:hidden'>
                            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search application status...'
                                value={appSearch}
                                onChange={(e) => setAppSearch(e.target.value)}
                                className='pl-8 h-9 text-sm'
                            />
                        </div>
                    </CardHeader>
                    <CardContent className='pt-4'>
                        <div className='rounded-md border overflow-x-auto'>
                            <table className='min-w-full divide-y divide-border text-sm text-left'>
                                <thead className='bg-muted/40 font-medium text-foreground uppercase text-xs'>
                                    <tr>
                                        <th
                                            onClick={() => handleAppSort('index')}
                                            className='px-4 py-3 cursor-pointer hover:bg-muted/60 transition text-center w-20'>
                                            <div className='flex items-center justify-center gap-1'>
                                                SL.NO
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleAppSort('statusName')}
                                            className='px-6 py-3 cursor-pointer hover:bg-muted/60 transition text-center'>
                                            <div className='flex items-center justify-center gap-1'>
                                                Application Status
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleAppSort('data')}
                                            className='px-6 py-3 cursor-pointer hover:bg-muted/60 transition text-center w-32'>
                                            <div className='flex items-center justify-center gap-1'>
                                                Count
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-border bg-card'>
                                    {filteredAppStatus.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className='text-center py-6 text-muted-foreground'>
                                                No Application Status records match the filter
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAppStatus.map((item, idx) => (
                                            <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                                                <td className='px-4 py-3 text-center text-muted-foreground font-medium'>
                                                    {idx + 1}
                                                </td>
                                                <td className='px-6 py-3 text-center font-medium text-foreground'>
                                                    {item.statusName}
                                                </td>
                                                <td className='px-6 py-3 text-center font-semibold text-blue-600'>
                                                    {item.data}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {filteredAppStatus.length > 0 && (
                                    <tfoot className='bg-muted/30 font-semibold text-foreground border-t'>
                                        <tr>
                                            <td colSpan={2} className='px-6 py-3 text-right'>
                                                Total Application Count:
                                            </td>
                                            <td className='px-6 py-3 text-center text-blue-600'>
                                                {filteredAppStatus.reduce((acc, curr) => acc + Number(curr.data || 0), 0)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 2. ADMISSION STATUS DETAILS TABLE */}
            {admissionData.length > 0 && (
                <Card className='shadow-md border border-border/60 transition-all'>
                    <CardHeader className='border-b bg-muted/20 pb-4 flex flex-row items-center justify-between gap-4'>
                        <CardTitle className='text-base font-semibold text-foreground'>
                            Status Details (Admission Status)
                        </CardTitle>
                        <div className='relative w-64 print:hidden'>
                            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                            <Input
                                placeholder='Search admission status...'
                                value={admSearch}
                                onChange={(e) => setAdmSearch(e.target.value)}
                                className='pl-8 h-9 text-sm'
                            />
                        </div>
                    </CardHeader>
                    <CardContent className='pt-4'>
                        <div className='rounded-md border overflow-x-auto'>
                            <table className='min-w-full divide-y divide-border text-sm text-left'>
                                <thead className='bg-muted/40 font-medium text-foreground uppercase text-xs'>
                                    <tr>
                                        <th
                                            onClick={() => handleAdmSort('index')}
                                            className='px-4 py-3 cursor-pointer hover:bg-muted/60 transition text-center w-20'>
                                            <div className='flex items-center justify-center gap-1'>
                                                SL.NO
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleAdmSort('PAMST_Status')}
                                            className='px-6 py-3 cursor-pointer hover:bg-muted/60 transition text-center'>
                                            <div className='flex items-center justify-center gap-1'>
                                                Admission Status
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                        <th
                                            onClick={() => handleAdmSort('Data_count')}
                                            className='px-6 py-3 cursor-pointer hover:bg-muted/60 transition text-center w-32'>
                                            <div className='flex items-center justify-center gap-1'>
                                                Count
                                                <ArrowUpDown className='h-3 w-3' />
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-border bg-card'>
                                    {filteredAdmStatus.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className='text-center py-6 text-muted-foreground'>
                                                No Admission Status records match the filter
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAdmStatus.map((item, idx) => (
                                            <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                                                <td className='px-4 py-3 text-center text-muted-foreground font-medium'>
                                                    {idx + 1}
                                                </td>
                                                <td className='px-6 py-3 text-center font-medium text-foreground'>
                                                    {item.PAMST_Status}
                                                </td>
                                                <td className='px-6 py-3 text-center font-semibold text-emerald-600'>
                                                    {item.Data_count}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                {filteredAdmStatus.length > 0 && (
                                    <tfoot className='bg-muted/30 font-semibold text-foreground border-t'>
                                        <tr>
                                            <td colSpan={2} className='px-6 py-3 text-right'>
                                                Total Admission Count:
                                            </td>
                                            <td className='px-6 py-3 text-center text-emerald-600'>
                                                {filteredAdmStatus.reduce(
                                                    (acc, curr) => acc + Number(curr.Data_count || 0),
                                                    0
                                                )}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 3. CHARTS / GRAPHS REPRESENTATION */}
            {showGraphs && (
                <div className='space-y-8 pt-4 print:hidden'>
                    {/* Application Status Charts */}
                    {applicationChartData.length > 0 && (
                        <Card className='shadow-md border border-border/60'>
                            <CardHeader className='border-b bg-muted/20 pb-4'>
                                <CardTitle className='text-base font-semibold text-foreground'>
                                    Application Status Visual Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='pt-6'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                    {/* Column Chart */}
                                    <div className='h-[340px] flex flex-col items-center'>
                                        <h4 className='text-sm font-semibold text-muted-foreground mb-4 text-center'>
                                            Chart Representation Of Application Status Count
                                        </h4>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <BarChart data={applicationChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                                                <XAxis
                                                    dataKey='name'
                                                    tick={{ fontSize: 12 }}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor='end'
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey='count' fill='#3b82f6' name='Application Count' radius={[4, 4, 0, 0]}>
                                                    {applicationChartData.map((_, index) => (
                                                        <Cell
                                                            key={`app-bar-${index}`}
                                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Doughnut / Pie Chart */}
                                    <div className='h-[340px] flex flex-col items-center'>
                                        <h4 className='text-sm font-semibold text-muted-foreground mb-4 text-center'>
                                            Application Status Distribution
                                        </h4>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <PieChart>
                                                <Pie
                                                    data={applicationChartData}
                                                    dataKey='count'
                                                    nameKey='name'
                                                    cx='50%'
                                                    cy='50%'
                                                    innerRadius={65}
                                                    outerRadius={105}
                                                    paddingAngle={4}
                                                    label={({ name, percent }) =>
                                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                                    }>
                                                    {applicationChartData.map((_, index) => (
                                                        <Cell
                                                            key={`app-pie-${index}`}
                                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Admission Status Charts */}
                    {admissionChartData.length > 0 && (
                        <Card className='shadow-md border border-border/60'>
                            <CardHeader className='border-b bg-muted/20 pb-4'>
                                <CardTitle className='text-base font-semibold text-foreground'>
                                    Admission Status Visual Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='pt-6'>
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                                    {/* Column Chart */}
                                    <div className='h-[340px] flex flex-col items-center'>
                                        <h4 className='text-sm font-semibold text-muted-foreground mb-4 text-center'>
                                            Chart Representation Of Admission Status Count
                                        </h4>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <BarChart data={admissionChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
                                                <XAxis
                                                    dataKey='name'
                                                    tick={{ fontSize: 12 }}
                                                    interval={0}
                                                    angle={-15}
                                                    textAnchor='end'
                                                />
                                                <YAxis allowDecimals={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                <Legend />
                                                <Bar dataKey='count' fill='#10b981' name='Admission Count' radius={[4, 4, 0, 0]}>
                                                    {admissionChartData.map((_, index) => (
                                                        <Cell
                                                            key={`adm-bar-${index}`}
                                                            fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Doughnut / Pie Chart */}
                                    <div className='h-[340px] flex flex-col items-center'>
                                        <h4 className='text-sm font-semibold text-muted-foreground mb-4 text-center'>
                                            Admission Status Distribution
                                        </h4>
                                        <ResponsiveContainer width='100%' height='100%'>
                                            <PieChart>
                                                <Pie
                                                    data={admissionChartData}
                                                    dataKey='count'
                                                    nameKey='name'
                                                    cx='50%'
                                                    cy='50%'
                                                    innerRadius={65}
                                                    outerRadius={105}
                                                    paddingAngle={4}
                                                    label={({ name, percent }) =>
                                                        `${name}: ${(percent * 100).toFixed(0)}%`
                                                    }>
                                                    {admissionChartData.map((_, index) => (
                                                        <Cell
                                                            key={`adm-pie-${index}`}
                                                            fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--card))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: '8px'
                                                    }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
