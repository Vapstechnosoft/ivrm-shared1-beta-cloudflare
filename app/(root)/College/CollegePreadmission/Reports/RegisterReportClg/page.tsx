'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/extension/field';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDocumentViewClgInitialData, useRegisterReportClg } from '@/hooks/college/useCollegeReports';
import { exportToExcel } from '@/lib/export-to-file';
import { IRegisterReportClg, IMasterCompanyClg } from '@/types/college/reports';
import { Download, Printer, RotateCcw, Search } from 'lucide-react';
import Image from 'next/image';
import { useQueryState } from 'nuqs';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { registerReportClgColumns } from './_components/columns';

export default function RegisterReportClgPage() {
    const { data: initialData, isLoading: initialLoading } = useDocumentViewClgInitialData();
    const { mutateAsync: getReport, isPending: searchLoading } = useRegisterReportClg();

    const [filterType, setFilterType] = useState<'yearwise' | 'btwdates'>('yearwise');
    const [academicYearId, setAcademicYearId] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');

    const [reportData, setReportData] = useState<IRegisterReportClg[]>([]);
    const [masterCompany, setMasterCompany] = useState<IMasterCompanyClg | null>(null);
    const [showResults, setShowResults] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const yearList = initialData?.data?.fillyear || initialData?.data?.yearList || initialData?.data?.academicYearList || [];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (filterType === 'yearwise' && !academicYearId) {
            toast.error('Please select Academic Year');
            return;
        }

        if (filterType === 'btwdates') {
            if (!fromDate || !toDate) {
                toast.error('Please select both From Date and To Date');
                return;
            }
            if (new Date(fromDate) > new Date(toDate)) {
                toast.error('To Date should be greater than From Date');
                return;
            }
        }

        try {
            const payload = {
                yearwiseorbtwdates: filterType,
                ASMAY_Id: filterType === 'yearwise' ? Number(academicYearId) : 0,
                From_Date: filterType === 'btwdates' ? fromDate : '',
                To_Date: filterType === 'btwdates' ? toDate : ''
            };

            const res = await getReport(payload);
            const list = res?.data?.searchstudentDetails || res?.data?.list || [];
            const company = res?.data?.masterCompany?.[0] || null;
            setReportData(list);
            setMasterCompany(company);
            setShowResults(true);
            toast.success('Report Generated Successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const handleCancel = () => {
        setFilterType('yearwise');
        setAcademicYearId('');
        setFromDate('');
        setToDate('');
        setReportData([]);
        setMasterCompany(null);
        setShowResults(false);
    };

    const handlePrint = () => {
        const content = printRef.current?.innerHTML;
        if (!content) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                    <head>
                        <title>Registration Report</title>
                        <style>
                            @page { size: auto; margin: 0mm; }
                            body { font-family: Arial, sans-serif; color: black; background: white; padding: 15mm; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 14px; }
                            th { background-color: #f3f4f6 !important; font-weight: bold; }
                            .text-center { text-align: center; }
                            .uppercase { text-transform: uppercase; }
                            .print-header { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; margin-bottom: 24px; }
                            .print-header img { width: 100%; max-height: 180px; object-fit: contain; }
                            .print-header h2 { margin: 0; font-size: 22px; font-weight: bold; }
                        </style>
                    </head>
                    <body>
                        ${content}
                    </body>
                </html>
            `);
            doc.close();

            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                }
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 250);
        }
    };

    const handleExportExcel = () => {
        const excelColumns = JSON.stringify([
            { label: 'SL.NO.', value: 'index' },
            { label: 'Name', value: 'Name' },
            { label: 'User Name', value: 'UserName' },
            { label: 'EMAIL-ID', value: 'Email_Id' },
            { label: 'Mobile Number', value: 'Mob_No' },
            { label: 'DATE', value: 'formattedDate' }
        ]);

        const excelContent = JSON.stringify(
            reportData.map((item: any, index) => {
                const dateVal = item.created_date || item.created_Date || item.Created_Date;
                return {
                    index: index + 1,
                    Name: item.name || item.Name || '',
                    UserName: item.user_name || item.user_Name || '',
                    Email_Id: item.email_id || item.email_Id || item.Email_Id || '',
                    Mob_No: item.mob_no || item.mob_No || item.Mob_No || '',
                    formattedDate: dateVal ? new Date(dateVal).toLocaleDateString('en-GB').replace(/\//g, '-') : ''
                };
            })
        );

        exportToExcel('Registration_Report', excelColumns, excelContent);
    };

    const [searchQuery] = useQueryState('search_query', { defaultValue: '' });

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return reportData;
        const lowerQuery = searchQuery.toLowerCase();
        return reportData.filter((item: any) => {
            const name = (item.name || item.Name || '').toLowerCase();
            const userName = (item.user_name || item.user_Name || '').toLowerCase();
            const email = (item.email_id || item.email_Id || item.Email_Id || '').toLowerCase();
            const mob = (item.mob_no || item.mob_No || item.Mob_No || '').toLowerCase();
            
            return name.includes(lowerQuery) || userName.includes(lowerQuery) || email.includes(lowerQuery) || mob.includes(lowerQuery);
        });
    }, [reportData, searchQuery]);

    const tableProps = useDataTableProps({
        data: filteredData,
        totalItems: filteredData.length
    });

    return (
        <div className='container space-y-6 p-1'>
            {/* Filters Section */}
            <CollapsibleSection
                title='Registration Report'
                description='Generate registration reports based on academic year or date range'
                defaultOpen={true}
                variant='default'
                size='lg'
                className='shadow-lg'>
                <form onSubmit={handleSearch} className='space-y-6'>
                    <div className='flex justify-center'>
                        <RadioGroup
                            value={filterType}
                            onValueChange={(val: 'yearwise' | 'btwdates') => {
                                setFilterType(val);
                                setAcademicYearId('');
                                setFromDate('');
                                setToDate('');
                                setReportData([]);
                                setMasterCompany(null);
                                setShowResults(false);
                            }}
                            className='flex gap-6'>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='yearwise' id='rep-yearwise' />
                                <Label htmlFor='rep-yearwise' className='cursor-pointer'>Year Wise</Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='btwdates' id='rep-btwdates' />
                                <Label htmlFor='rep-btwdates' className='cursor-pointer'>Between Dates</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className='flex justify-center'>
                        {filterType === 'yearwise' ? (
                            <div className='w-full max-w-md space-y-2'>
                                <Label htmlFor='academicYearId'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                                    <SelectTrigger id='academicYearId'>
                                        <SelectValue placeholder={initialLoading ? 'Loading Years...' : 'Select Academic Year'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {yearList.map((year: any) => (
                                            <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                {year.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className='w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <InputText
                                    label='From Date'
                                    required
                                    type='date'
                                    id='fromDate'
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                                <InputText
                                    label='To Date'
                                    required
                                    type='date'
                                    id='toDate'
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className='flex justify-center gap-4 border-t pt-4'>
                        <Button type='submit' disabled={searchLoading} className='min-w-[120px]' isLoading={searchLoading} loadingText='Searching...'>
                            <Search className='mr-2 h-4 w-4' /> Search
                        </Button>
                        <Button type='button' variant='outline' onClick={handleCancel} className='min-w-[120px]'>
                            <RotateCcw className='mr-2 h-4 w-4' /> Cancel
                        </Button>
                    </div>
                </form>
            </CollapsibleSection>

            {/* Results Section */}
            {showResults && (
                <CollapsibleSection
                    title='Registration Report Details'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-md animate-in slide-in-from-top-4 duration-300'>

                    {/* Company Logo & Name Header */}
                    {masterCompany && (
                        <div className='flex flex-col items-center gap-3 mb-4 p-4 rounded-lg border bg-muted/30'>
                            {masterCompany.logo && (
                                <Image
                                    src={masterCompany.logo}
                                    alt={masterCompany.companyname || 'Institution Logo'}
                                    width={500}
                                    height={180}
                                    className='w-full max-h-[180px] object-contain'
                                    unoptimized
                                />
                            )}
                            <h3 className='text-lg font-bold'>Registration Report</h3>
                        </div>
                    )}

                    <div className='flex justify-end gap-2 mb-2'>
                        <Button type='button' variant='outline' onClick={handleExportExcel} disabled={reportData.length === 0}>
                            <Download className='mr-2 h-4 w-4' /> Export to Excel
                        </Button>
                        <Button type='button' variant='outline' onClick={handlePrint} disabled={reportData.length === 0}>
                            <Printer className='mr-2 h-4 w-4' /> Print
                        </Button>
                    </div>

                    <GenericDataTable<IRegisterReportClg>
                        {...tableProps}
                        columns={registerReportClgColumns}
                        isLoading={searchLoading}
                        error={null}
                        showViewOptions={false}
                        columnPinning={{ right: [] }}
                        loadingMessage='Generating report...'
                        noDataTitle='No Records Found'
                        noDataDescription='No registration details available for the selected filters.'
                    />
                </CollapsibleSection>
            )}

            {/* Hidden Print Area */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                <div ref={printRef} style={{ width: '210mm', padding: '32px', color: 'black', backgroundColor: 'white' }}>
                    {/* Print Header with Logo */}
                    <div className='print-header' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                        {masterCompany?.logo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={masterCompany.logo}
                                alt={masterCompany.companyname || 'Logo'}
                                style={{ width: '100%', maxHeight: '180px', objectFit: 'contain' }}
                            />
                        )}
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
                            Registration Report
                        </h2>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>SL.NO.</th>
                                <th>Name</th>
                                <th>User Name</th>
                                <th>EMAIL-ID</th>
                                <th>Mobile Number</th>
                                <th>DATE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((item: any, index) => (
                                <tr key={index}>
                                    <td className='text-center'>{index + 1}</td>
                                    <td className='uppercase'>{item.name || item.Name || '-'}</td>
                                    <td>{item.user_name || item.user_Name || '-'}</td>
                                    <td>{item.email_id || item.email_Id || item.Email_Id || '-'}</td>
                                    <td>{item.mob_no || item.mob_No || item.Mob_No || '-'}</td>
                                    <td>
                                        {item.created_date || item.created_Date || item.Created_Date
                                            ? new Date(item.created_date || item.created_Date || item.Created_Date).toLocaleDateString('en-GB').replace(/\//g, '-')
                                            : '-'}
                                    </td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: '#6b7280' }}>
                                        No details found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

