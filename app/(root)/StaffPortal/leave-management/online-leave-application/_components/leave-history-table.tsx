'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useOnlineLeave } from '@/hooks/staff-portal/useOnlineLeave';
import type { ILeaveHistory } from '@/types/staff-portal/online-leave';
import { format } from 'date-fns';
import { FileText, Search, Trash2 } from 'lucide-react';
import React from 'react';

interface Props {
    historyData: any | null | undefined;
}

const LeaveHistoryTable = ({ historyData }: Props) => {
    const { cancelMutation } = useOnlineLeave();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredHistory = React.useMemo(() => {
        const list = Array.isArray(historyData) ? historyData : (historyData as any)?.employeeLeaveDetails || [];
        return list.filter(
            (item: ILeaveHistory) =>
                item.hrmL_LeaveName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.hrelaP_LeaveReason?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [historyData, searchTerm]);

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'applied':
                return 'default';
            case 'approved':
                return 'success';
            case 'rejected':
                return 'destructive';
            case 'cancelled':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                <CardTitle className='font-semibold text-lg'>Employee Leave Details</CardTitle>
                <div className='relative w-64'>
                    <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                    <Input
                        placeholder='Search records...'
                        className='pl-8'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader className='bg-muted/50'>
                            <TableRow>
                                <TableHead className='w-[50px] text-center'>SNo</TableHead>
                                <TableHead>Leave Name</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead className='text-center'>From Date</TableHead>
                                <TableHead className='text-center'>To Date</TableHead>
                                <TableHead className='text-center'>Days</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead>Remarks</TableHead>
                                <TableHead className='text-center'>Doc</TableHead>
                                <TableHead className='text-right'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map((row: ILeaveHistory, index: number) => (
                                    <TableRow key={row.hrelaP_Id}>
                                        <TableCell className='text-center'>{index + 1}</TableCell>
                                        <TableCell className='font-medium'>{row.hrmL_LeaveName}</TableCell>
                                        <TableCell className='max-w-[200px] truncate' title={row.hrelaP_LeaveReason}>
                                            {row.hrelaP_LeaveReason}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {row.hrelaP_FromDate ? format(new Date(row.hrelaP_FromDate), 'dd-MM-yyyy') : '--'}
                                        </TableCell>
                                        <TableCell className='text-center'>
                                            {row.hrelaP_ToDate ? format(new Date(row.hrelaP_ToDate), 'dd-MM-yyyy') : '--'}
                                        </TableCell>
                                        <TableCell className='text-center font-semibold'>{row.hreltD_TotDays}</TableCell>
                                        <TableCell className='text-center'>
                                            <Badge variant={getStatusVariant(row.hrelaP_ApplicationStatus) as any}>
                                                {row.hrelaP_ApplicationStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='max-w-[150px] truncate'>{row.hrelapA_Remarks || '--'}</TableCell>
                                        <TableCell className='text-center'>
                                            {row.hrelaP_SupportingDocument && (
                                                <Button size='icon' variant='ghost' className='h-8 w-8 text-primary' asChild>
                                                    <a href={row.hrelaP_SupportingDocument} target='_blank' rel='noreferrer'>
                                                        <FileText className='h-4 w-4' />
                                                    </a>
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-right'>
                                            {row.hrelaP_ApplicationStatus.toLowerCase() === 'applied' && (
                                                <Button
                                                    size='icon'
                                                    variant='ghost'
                                                    className='h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive'
                                                    onClick={() => cancelMutation.mutate(row.hrelaP_Id)}
                                                    disabled={cancelMutation.isPending}>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            )}
                                            {row.hrelaP_ApplicationStatus.toLowerCase() !== 'applied' && '--'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={10} className='h-24 text-center text-muted-foreground'>
                                        No leave applications found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default LeaveHistoryTable;
