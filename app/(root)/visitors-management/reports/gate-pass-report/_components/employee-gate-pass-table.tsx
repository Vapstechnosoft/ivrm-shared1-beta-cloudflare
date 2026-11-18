'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Briefcase, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { EmployeeGatePassRecord } from '../types';

interface EmployeeGatePassTableProps {
    data: EmployeeGatePassRecord[];
}

export default function EmployeeGatePassTable({ data }: EmployeeGatePassTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const term = searchTerm.toLowerCase();
        return data.filter(
            (item) =>
                (item.hrmE_EmployeeCode || '').toLowerCase().includes(term) ||
                (item.hrmE_EmployeeFirstName || '').toLowerCase().includes(term) ||
                (item.hrmD_DepartmentName || '').toLowerCase().includes(term) ||
                (item.hrmdeS_DesignationName || '').toLowerCase().includes(term) ||
                String(item.hrmE_MobileNo || '')
                    .toLowerCase()
                    .includes(term) ||
                (item.gphsT_GatePassNo || '').toLowerCase().includes(term) ||
                (item.gphsT_IDCardNo || '').toLowerCase().includes(term) ||
                (item.gphsT_Remarks || '').toLowerCase().includes(term)
        );
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

    return (
        <Card className='border-border/60 shadow-md'>
            <CardHeader className='border-border/40 border-b bg-muted/20 pb-4'>
                <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                    <CardTitle className='flex items-center gap-2 font-semibold text-foreground text-lg'>
                        <Briefcase className='h-5 w-5 text-primary' />
                        Employee Gate Pass Report Details
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
                            placeholder='Search by emp code, name, dept, pass no...'
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
                                <TableHead className='font-bold'>Emp Code</TableHead>
                                <TableHead className='font-bold'>Name</TableHead>
                                <TableHead className='font-bold'>Department</TableHead>
                                <TableHead className='font-bold'>Designation</TableHead>
                                <TableHead className='font-bold'>Contact No.</TableHead>
                                <TableHead className='font-bold'>Gate Pass No</TableHead>
                                <TableHead className='font-bold'>Card No</TableHead>
                                <TableHead className='font-bold'>Date</TableHead>
                                <TableHead className='font-bold'>Remarks</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                                        No employee gate pass records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((row, idx) => {
                                    const serialNumber = (currentPage - 1) * pageSize + idx + 1;
                                    const formattedDate = row.gphsT_DateTime
                                        ? new Date(row.gphsT_DateTime).toLocaleDateString('en-GB')
                                        : '-';
                                    return (
                                        <TableRow key={`emp-row-${row.gphsT_GatePassNo || idx}-${idx}`}>
                                            <TableCell className='text-center font-medium'>{serialNumber}</TableCell>
                                            <TableCell className='font-semibold text-primary'>{row.hrmE_EmployeeCode || '-'}</TableCell>
                                            <TableCell className='font-medium'>{row.hrmE_EmployeeFirstName || '-'}</TableCell>
                                            <TableCell>{row.hrmD_DepartmentName || '-'}</TableCell>
                                            <TableCell>{row.hrmdeS_DesignationName || '-'}</TableCell>
                                            <TableCell>{row.hrmE_MobileNo || '-'}</TableCell>
                                            <TableCell className='font-medium font-mono'>{row.gphsT_GatePassNo || '-'}</TableCell>
                                            <TableCell>{row.gphsT_IDCardNo || '-'}</TableCell>
                                            <TableCell className='whitespace-nowrap'>{formattedDate}</TableCell>
                                            <TableCell className='max-w-[200px] truncate' title={row.gphsT_Remarks}>
                                                {row.gphsT_Remarks || '-'}
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
