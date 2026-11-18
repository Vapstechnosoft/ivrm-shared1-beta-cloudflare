'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { VisitorReportRecord } from '../types';

interface VisitorReportTableProps {
    data: VisitorReportRecord[];
}

export default function VisitorReportTable({ data }: VisitorReportTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const getVisitorName = (item: VisitorReportRecord) => item.amvM_Name || item.VMMV_VisitorName || '-';

    const getContactNo = (item: VisitorReportRecord) => item.amvM_Contact_No || item.VMMV_VisitorContactNo || '-';

    const getEmailId = (item: VisitorReportRecord) => item.amvM_Emailid || item.VMMV_VisitorEmailid || '-';

    const getDate = (item: VisitorReportRecord) => {
        const rawDate = item.date_Visit || item.Date_Visit || item.VMMV_MeetingDateTime;
        if (!rawDate) return '-';
        try {
            return new Date(rawDate).toLocaleDateString('en-GB');
        } catch {
            return String(rawDate);
        }
    };

    const getInTime = (item: VisitorReportRecord) => item.time_Visit || item.Time_Visit || item.VMMV_EntryDateTime || '-';

    const getOutTime = (item: VisitorReportRecord) => item.amvM_Out_Time || item.VMMV_ExitDateTime || '-';

    const getLocation = (item: VisitorReportRecord) => item.VMMV_MeetingLocation || item.amvM_Address || '-';

    const getStatus = (item: VisitorReportRecord) => item.amvM_Status || item.VMMV_CkeckedInOutStatus || '-';

    const getPurpose = (item: VisitorReportRecord) => item.amvM_Purpose || item.VMMV_MeetingPurpose || '-';

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const term = searchTerm.toLowerCase();
        return data.filter((item) => {
            return (
                getVisitorName(item).toLowerCase().includes(term) ||
                getContactNo(item).toLowerCase().includes(term) ||
                getEmailId(item).toLowerCase().includes(term) ||
                getDate(item).toLowerCase().includes(term) ||
                getInTime(item).toLowerCase().includes(term) ||
                getOutTime(item).toLowerCase().includes(term) ||
                getLocation(item).toLowerCase().includes(term) ||
                getStatus(item).toLowerCase().includes(term) ||
                getPurpose(item).toLowerCase().includes(term)
            );
        });
    }, [data, searchTerm]);

    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderStatusBadge = (status: string) => {
        const lower = status.toLowerCase();
        if (lower.includes('in') && !lower.includes('out')) {
            return (
                <Badge
                    variant='outline'
                    className='border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs dark:bg-emerald-950/30 dark:text-emerald-400'>
                    {status}
                </Badge>
            );
        }
        if (lower.includes('out')) {
            return (
                <Badge
                    variant='outline'
                    className='border-amber-500/30 bg-amber-50 text-amber-700 text-xs dark:bg-amber-950/30 dark:text-amber-400'>
                    {status}
                </Badge>
            );
        }
        if (lower.includes('reject') || lower.includes('cancel')) {
            return (
                <Badge
                    variant='outline'
                    className='border-rose-500/30 bg-rose-50 text-rose-700 text-xs dark:bg-rose-950/30 dark:text-rose-400'>
                    {status}
                </Badge>
            );
        }
        return (
            <Badge variant='secondary' className='text-xs'>
                {status}
            </Badge>
        );
    };

    return (
        <Card className='border-border/60 shadow-md'>
            <CardHeader className='border-border/40 border-b bg-muted/20 pb-4'>
                <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                    <CardTitle className='flex items-center gap-2 font-semibold text-foreground text-lg'>
                        <Users className='h-5 w-5 text-primary' />
                        Visitor Report Details
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                        <Badge variant='outline' className='border-primary/30 bg-primary/10 text-primary'>
                            Total Records: {data.length}
                        </Badge>
                        {searchTerm && <Badge variant='secondary'>Filtered: {filteredData.length}</Badge>}
                    </div>
                </div>
            </CardHeader>

            <CardContent className='space-y-4 pt-4'>
                {/* Search & Page Size Filter */}
                <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                    <div className='relative w-full sm:w-80'>
                        <Search className='absolute top-2.5 left-3 h-4 w-4 text-muted-foreground' />
                        <Input
                            placeholder='Search by name, contact, purpose...'
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className='w-full pl-9'
                        />
                    </div>

                    <div className='flex items-center gap-2'>
                        <span className='text-muted-foreground text-xs'>Rows per page:</span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(val) => {
                                setPageSize(Number(val));
                                setCurrentPage(1);
                            }}>
                            <SelectTrigger className='h-8 w-[70px] text-xs'>
                                <SelectValue placeholder='10' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='10'>10</SelectItem>
                                <SelectItem value='25'>25</SelectItem>
                                <SelectItem value='50'>50</SelectItem>
                                <SelectItem value='100'>100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Data Table */}
                <div className='overflow-x-auto rounded-lg border border-border/60'>
                    <Table>
                        <TableHeader className='bg-muted/40'>
                            <TableRow>
                                <TableHead className='w-12 text-center font-bold'>SL. No.</TableHead>
                                <TableHead className='font-bold'>Visitor Name</TableHead>
                                <TableHead className='font-bold'>Contact No</TableHead>
                                <TableHead className='font-bold'>Email Id</TableHead>
                                <TableHead className='font-bold'>Date</TableHead>
                                <TableHead className='font-bold'>In Time</TableHead>
                                <TableHead className='font-bold'>Out Time</TableHead>
                                <TableHead className='font-bold'>Meeting Location</TableHead>
                                <TableHead className='font-bold'>Status</TableHead>
                                <TableHead className='font-bold'>Purpose</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                                        No visitor records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row, idx) => {
                                    const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                                    const visitorName = getVisitorName(row);
                                    const contactNo = getContactNo(row);
                                    const emailId = getEmailId(row);
                                    const dateStr = getDate(row);
                                    const inTime = getInTime(row);
                                    const outTime = getOutTime(row);
                                    const location = getLocation(row);
                                    const status = getStatus(row);
                                    const purpose = getPurpose(row);

                                    return (
                                        <TableRow key={`visitor-row-${idx}`}>
                                            <TableCell className='text-center font-medium'>{serialNumber}</TableCell>
                                            <TableCell className='font-semibold text-primary'>{visitorName}</TableCell>
                                            <TableCell className='font-mono'>{contactNo}</TableCell>
                                            <TableCell>{emailId}</TableCell>
                                            <TableCell className='whitespace-nowrap'>{dateStr}</TableCell>
                                            <TableCell className='whitespace-nowrap'>{inTime}</TableCell>
                                            <TableCell className='whitespace-nowrap'>{outTime}</TableCell>
                                            <TableCell>{location}</TableCell>
                                            <TableCell>{renderStatusBadge(status)}</TableCell>
                                            <TableCell className='max-w-[200px] truncate' title={purpose}>
                                                {purpose}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                    <div className='flex flex-col items-center justify-between gap-3 pt-2 text-muted-foreground text-xs sm:flex-row'>
                        <div>
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of{' '}
                            {filteredData.length} records
                        </div>
                        <div className='flex items-center gap-1'>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}>
                                <ChevronsLeft className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}>
                                <ChevronLeft className='h-4 w-4' />
                            </Button>
                            <span className='rounded border bg-background px-3 py-1 font-medium text-foreground'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}>
                                <ChevronRight className='h-4 w-4' />
                            </Button>
                            <Button
                                variant='outline'
                                size='icon'
                                className='h-8 w-8'
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}>
                                <ChevronsRight className='h-4 w-4' />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
