'use client';

import { tableSearchVariables } from '@/lib/data-table.config';
import { format } from 'date-fns';
import { FileSpreadsheet, Loader2, Printer, RotateCcw } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';

import {
    useMobileAppDownloadLoadData,
    useMobileAppDownloadReportDetails
} from '@/hooks/admission/preadmission/reports/useMobileAppDownloadReport';

export default function MobileAppDownloadReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loadData, isLoading: isLoadDataLoading } = useMobileAppDownloadLoadData();
    const reportMutation = useMobileAppDownloadReportDetails();

    // Form State
    const [optionflag, setOptionflag] = useState<'Download' | 'NotDownload'>('Download');
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);

    // Dates
    const [fromDate, setFromDate] = useState<Date | null>(new Date());
    const [toDate, setToDate] = useState<Date | null>(new Date());
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    // Checkboxes
    const [isActive, setIsActive] = useState<boolean>(true);
    const [isDeActive, setIsDeActive] = useState<boolean>(false);
    const [isLeft, setIsLeft] = useState<boolean>(false);

    // Results State
    const [reportData, setReportData] = useState<any[]>([]);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [notDownloadCount, setNotDownloadCount] = useState<number>(0);
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [schoolCollegeFlag, setSchoolCollegeFlag] = useState<string>('S');

    // DataTable query state
    const [page] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));
    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));
    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const filteredReportData = useMemo(() => {
        if (!searchQuery) return reportData;
        const lowerQuery = searchQuery.toLowerCase();
        return reportData.filter((item) => {
            return (
                item.StudentName?.toLowerCase().includes(lowerQuery) ||
                item.studentname?.toLowerCase().includes(lowerQuery) ||
                item.AMST_AdmNo?.toLowerCase().includes(lowerQuery) ||
                item.ASMCL_ClassName?.toLowerCase().includes(lowerQuery) ||
                item.ASMC_SectionName?.toLowerCase().includes(lowerQuery) ||
                item.AMCO_CourseName?.toLowerCase().includes(lowerQuery) ||
                item.AMSE_SEMName?.toLowerCase().includes(lowerQuery) ||
                String(item.AMST_MobileNo || '')
                    .toLowerCase()
                    .includes(lowerQuery) ||
                item.AMST_emailId?.toLowerCase().includes(lowerQuery) ||
                item.AMST_SOL?.toLowerCase().includes(lowerQuery)
            );
        });
    }, [reportData, searchQuery]);

    const paginatedReportData = useMemo(() => {
        return filteredReportData.slice((page - 1) * pageSize, page * pageSize);
    }, [filteredReportData, page, pageSize]);

    useEffect(() => {
        if (loadData?.data) {
            const fillyearList = loadData.data.fillyear || [];
            const activeYear = fillyearList.find((y: any) => y.asmaY_Pre_ActiveFlag === 1 || y.is_Active === true) || fillyearList[0];
            const initialYear = activeYear?.asmaY_Id;

            if (initialYear && !academicYearId) {
                setAcademicYearId(initialYear);
            }
            if (loadData.data.institute && loadData.data.institute.length > 0) {
                setSchoolCollegeFlag(loadData.data.institute[0].mI_SchoolCollegeFlag || 'S');
            }
        }
    }, [loadData, academicYearId]);

    const handleReport = async () => {
        if (!academicYearId) {
            toast.error('Please Select Academic Year');
            return;
        }
        if (!fromDate) {
            toast.error('Please Select From Date');
            return;
        }
        if (!toDate) {
            toast.error('Please Select To Date');
            return;
        }
        if (fromDate > toDate) {
            toast.error('From Date cannot be greater than To Date');
            return;
        }

        try {
            setHasSearched(false);
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                fromdate: format(fromDate, 'yyyy-MM-dd'),
                todate: format(toDate, 'yyyy-MM-dd'),
                Active: isActive ? 1 : 0,
                DeActive: isDeActive ? 1 : 0,
                Left: isLeft ? 1 : 0,
                optionflag: optionflag
            });

            if (res?.data) {
                // The new API returns data in studentList1 or studentList
                const list = (res.data.studentList1?.length > 0 ? res.data.studentList1 : res.data.studentList) || [];
                setReportData(list);

                if (optionflag === 'Download') {
                    // We don't have explicit counts from the new API, so we use list.length
                    setTotalRecords(list.length);
                    setNotDownloadCount(0);
                } else {
                    setTotalRecords(list.length);
                    setNotDownloadCount(0);
                }

                if (list.length === 0) {
                    toast.info('No Data Found!!!');
                } else {
                    setHasSearched(true);
                }
            } else {
                toast.error('Failed to load report data');
            }
        } catch (error) {
            toast.error('Something went wrong while fetching data');
        }
    };

    const handleReset = () => {
        setOptionflag('Download');
        const fillyearList = loadData?.data?.fillyear || [];
        const activeYear = fillyearList.find((y: any) => y.asmaY_Pre_ActiveFlag === 1 || y.is_Active === true) || fillyearList[0];
        setAcademicYearId(activeYear?.asmaY_Id || null);
        setFromDate(new Date());
        setToDate(new Date());
        setIsActive(true);
        setIsDeActive(false);
        setIsLeft(false);
        setReportData([]);
        setHasSearched(false);
        setTotalRecords(0);
        setNotDownloadCount(0);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Mobile_App_${optionflag}_Report`
    });

    // DataTable Columns
    const columns = [
        {
            header: () => <div className='text-center font-bold text-black'>SL.NO</div>,
            accessorKey: 'slno',
            cell: (info: any) => <div className='text-center'>{(page - 1) * pageSize + info.row.index + 1}</div>,
            enableSorting: false
        },
        {
            header: () => <div className='text-center font-bold text-black'>Student Name</div>,
            accessorKey: 'StudentName',
            cell: (info: any) => <div className='text-center'>{info.getValue() || info.row.original.studentname}</div>
        },
        {
            header: () => <div className='text-center font-bold text-black'>AdmNo</div>,
            accessorKey: 'AMST_AdmNo',
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        ...(schoolCollegeFlag === 'S'
            ? [
                  {
                      header: () => <div className='text-center font-bold text-black'>Class Name</div>,
                      accessorKey: 'ASMCL_ClassName',
                      cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
                  },
                  {
                      header: () => <div className='text-center font-bold text-black'>Section Name</div>,
                      accessorKey: 'ASMC_SectionName',
                      cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
                  }
              ]
            : [
                  {
                      header: () => <div className='text-center font-bold text-black'>Course</div>,
                      accessorKey: 'AMCO_CourseName',
                      cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
                  },
                  {
                      header: () => <div className='text-center font-bold text-black'>Semester</div>,
                      accessorKey: 'AMSE_SEMName',
                      cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
                  }
              ]),
        {
            header: () => <div className='text-center font-bold text-black'>Mobile No</div>,
            accessorKey: 'AMST_MobileNo',
            cell: (info: any) => <div className='text-center'>{info.getValue() || 0}</div>
        },
        {
            header: () => <div className='text-center font-bold text-black'>Email Id</div>,
            accessorKey: 'AMST_emailId',
            cell: (info: any) => <div className='text-center'>{info.getValue()}</div>
        },
        {
            header: () => <div className='text-center font-bold text-black'>Status</div>,
            accessorKey: 'AMST_SOL',
            cell: (info: any) => {
                const val = info.getValue();
                let statusLabel = val;
                if (val === 'S') statusLabel = 'Active';
                else if (val === 'D') statusLabel = 'Deactivate';
                else if (val === 'L') statusLabel = 'Left';
                return <div className='text-center'>{statusLabel}</div>;
            }
        }
    ];

    const totalDownloadCount = reportData.length;
    const totalDownloadPercent = totalRecords > 0 ? ((totalDownloadCount / totalRecords) * 100).toFixed(2) : 0;
    const notDownloadPercent = totalRecords > 0 ? ((notDownloadCount / totalRecords) * 100).toFixed(2) : 0;

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Mobile App Download Report'
                description='Filter and generate the mobile app download report'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-6 bg-white p-6'>
                    {/* Top Radio Group */}
                    <div className='flex justify-center'>
                        <div className='flex w-full items-center justify-center space-x-6 rounded-lg border bg-gray-50/50 p-4 md:w-1/2'>
                            <RadioGroup
                                value={optionflag}
                                onValueChange={(v) => {
                                    setOptionflag(v as any);
                                    setReportData([]);
                                    setHasSearched(false);
                                }}
                                className='flex space-x-8'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='Download' id='opt-download' />
                                    <Label htmlFor='opt-download' className='cursor-pointer font-medium'>
                                        Download
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='NotDownload' id='opt-notdownload' />
                                    <Label htmlFor='opt-notdownload' className='cursor-pointer font-medium'>
                                        Not Download
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Side */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    value={academicYearId?.toString() || ''}
                                    onValueChange={(v) => setAcademicYearId(Number(v))}
                                    disabled={isLoadDataLoading}>
                                    <SelectTrigger className='h-9 bg-white'>
                                        <SelectValue placeholder={isLoadDataLoading ? 'Loading...' : '--Select Year--'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(loadData?.data?.fillyear || []).map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>Statuses:</Label>
                                <div className='flex items-center space-x-6 pl-2'>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='chk-active' checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                                        <Label htmlFor='chk-active' className='cursor-pointer font-normal text-sm'>
                                            Active
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='chk-deactive' checked={isDeActive} onCheckedChange={(v) => setIsDeActive(!!v)} />
                                        <Label htmlFor='chk-deactive' className='cursor-pointer font-normal text-sm'>
                                            De-Active
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Checkbox id='chk-left' checked={isLeft} onCheckedChange={(v) => setIsLeft(!!v)} />
                                        <Label htmlFor='chk-left' className='cursor-pointer font-normal text-sm'>
                                            Left
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className='space-y-4'>
                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    From Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start bg-white text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {fromDate ? format(fromDate, 'dd/MM/yyyy') : 'Select Start Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={fromDate || undefined}
                                            onDayClick={(date) => {
                                                setFromDate(date);
                                                setFromDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className='grid grid-cols-[100px_1fr] items-center gap-4'>
                                <Label className='text-right font-bold text-sm'>
                                    To Date:<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant='outline' className='h-9 w-full justify-start bg-white text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {toDate ? format(toDate, 'dd/MM/yyyy') : 'Select End Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align='start' className='p-0'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={toDate || undefined}
                                            disabled={(date) => date < (fromDate || new Date(0))}
                                            onDayClick={(date) => {
                                                setToDate(date);
                                                setToDateOpen(false);
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <hr className='my-6' />

                    {/* Action Buttons */}
                    <div className='flex flex-wrap justify-center gap-4'>
                        <Button
                            size='sm'
                            onClick={handleReport}
                            disabled={reportMutation.isPending}
                            className='min-w-[120px] bg-indigo-600 text-white shadow-md hover:bg-indigo-700'>
                            {reportMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <FileSpreadsheet className='mr-2 h-4 w-4' />
                            )}
                            Report
                        </Button>
                        <Button size='sm' variant='destructive' onClick={handleReset} className='min-w-[120px] shadow-md'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Results Grid */}
            {hasSearched && reportData.length > 0 && (
                <CollapsibleSection
                    title={optionflag === 'Download' ? 'Mobile App Download Report Data' : 'Mobile App Not Download Report Data'}
                    defaultOpen={true}
                    variant='outline'
                    className='shadow-lg'>
                    <div className='space-y-4 bg-white p-6'>
                        {/* Statistics Summary */}
                        <div className='mb-4 flex flex-wrap items-center justify-between gap-6 rounded-lg border bg-gray-50 p-4'>
                            <div className='flex flex-wrap gap-6'>
                                <div className='flex flex-col'>
                                    <span className='font-bold text-green-700 text-sm'>Total Records</span>
                                    <span className='mt-1 inline-block rounded border bg-white px-3 py-1 font-bold text-xl'>
                                        {totalRecords}
                                    </span>
                                </div>

                                {optionflag === 'Download' && (
                                    <>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-blue-700 text-sm'>
                                                Total Download ({totalDownloadPercent}%)
                                            </span>
                                            <span className='mt-1 inline-block rounded border bg-white px-3 py-1 font-bold text-xl'>
                                                {totalDownloadCount}
                                            </span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-red-600 text-sm'>Not Download ({notDownloadPercent}%)</span>
                                            <span className='mt-1 inline-block rounded border bg-white px-3 py-1 font-bold text-xl'>
                                                {notDownloadCount}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                            <Button
                                size='sm'
                                onClick={handlePrint}
                                variant='outline'
                                className='border-indigo-200 text-indigo-600 hover:bg-indigo-50'>
                                <Printer className='mr-2 h-4 w-4' />
                                Print
                            </Button>
                        </div>

                        <GenericDataTable
                            data={paginatedReportData}
                            totalItems={filteredReportData.length}
                            columns={columns}
                            isLoading={reportMutation.isPending}
                            isSearchRequired={true}
                            isPaginationRequired={true}
                            showExportOptions={true}
                        />

                        {/* Hidden Print Section */}
                        <div className='hidden'>
                            <div ref={printRef} className='p-8 font-sans'>
                                <div className='mb-6 text-center'>
                                    <h2 className='mb-2 font-bold text-xl underline'>
                                        {optionflag === 'Download' ? 'Mobile App Download Report' : 'Mobile App Not Download Report'}
                                    </h2>
                                </div>

                                <table className='w-full border-collapse border border-gray-400 text-sm'>
                                    <thead>
                                        <tr className='bg-gray-100'>
                                            <th className='border border-gray-400 p-2 text-left'>SL.NO</th>
                                            <th className='border border-gray-400 p-2 text-left'>Student Name</th>
                                            <th className='border border-gray-400 p-2 text-left'>AdmNo</th>
                                            {schoolCollegeFlag === 'S' ? (
                                                <>
                                                    <th className='border border-gray-400 p-2 text-left'>Class Name</th>
                                                    <th className='border border-gray-400 p-2 text-left'>Section Name</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className='border border-gray-400 p-2 text-left'>Course</th>
                                                    <th className='border border-gray-400 p-2 text-left'>Semester</th>
                                                </>
                                            )}
                                            <th className='border border-gray-400 p-2 text-left'>Mobile No</th>
                                            <th className='border border-gray-400 p-2 text-left'>Email Id</th>
                                            <th className='border border-gray-400 p-2 text-left'>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.map((user, index) => (
                                            <tr key={index}>
                                                <td className='border border-gray-400 p-2'>{index + 1}</td>
                                                <td className='border border-gray-400 p-2'>{user.StudentName || user.studentname}</td>
                                                <td className='border border-gray-400 p-2'>{user.AMST_AdmNo}</td>
                                                {schoolCollegeFlag === 'S' ? (
                                                    <>
                                                        <td className='border border-gray-400 p-2'>{user.ASMCL_ClassName}</td>
                                                        <td className='border border-gray-400 p-2'>{user.ASMC_SectionName}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className='border border-gray-400 p-2'>{user.AMCO_CourseName}</td>
                                                        <td className='border border-gray-400 p-2'>{user.AMSE_SEMName}</td>
                                                    </>
                                                )}
                                                <td className='border border-gray-400 p-2'>{user.AMST_MobileNo}</td>
                                                <td className='border border-gray-400 p-2'>{user.AMST_emailId}</td>
                                                <td className='border border-gray-400 p-2'>
                                                    {user.AMST_SOL === 'S'
                                                        ? 'Active'
                                                        : user.AMST_SOL === 'D'
                                                          ? 'Deactivate'
                                                          : user.AMST_SOL === 'L'
                                                            ? 'Left'
                                                            : user.AMST_SOL}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
