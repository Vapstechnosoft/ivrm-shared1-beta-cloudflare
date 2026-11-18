'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Search, Edit, CheckCircle2, XCircle, Power, PowerOff, ListFilter } from 'lucide-react';
import { toast } from 'sonner';
import { toggleActivePassFailCondition } from '@/server/exam/exam-module/reports/Hutching/exam-pass-fail-condition';

interface GridListProps {
    data: any[];
    onEdit: (record: any) => void;
    onRefresh: () => void;
}

export function GridList({ data, onEdit, onRefresh }: GridListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecordToToggle, setSelectedRecordToToggle] = useState<any | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    const filteredData = (data || []).filter((item) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
            (item.asmaY_Year || '').toLowerCase().includes(term) ||
            (item.emE_ExamName || '').toLowerCase().includes(term) ||
            (item.epfrC_ExamFlag || '').toLowerCase().includes(term) ||
            (item.emcA_CategoryName || '').toLowerCase().includes(term) ||
            (item.ecM_ConditionName || '').toLowerCase().includes(term) ||
            (item.epfrC_PassFailFlag || '').toLowerCase().includes(term) ||
            String(item.epfrC_From || '').includes(term) ||
            String(item.epfrC_To || '').includes(term)
        );
    });

    const handleConfirmToggle = async () => {
        if (!selectedRecordToToggle) return;
        try {
            setIsToggling(true);
            const res = await toggleActivePassFailCondition(selectedRecordToToggle);
            const resData = res?.data ?? res;

            if (resData?.already_cnt === true) {
                toast.error('You cannot deactivate this record, it has dependency');
            } else if (resData?.returnval === true || res?.success) {
                const actionText = selectedRecordToToggle.epfrC_ActiveFlag === true ? 'deactivated' : 'activated';
                toast.success(`Record ${actionText} successfully`);
                onRefresh();
            } else {
                toast.error('Failed to change record status');
            }
        } catch (err: any) {
            toast.error(err?.message || 'An error occurred');
        } finally {
            setIsToggling(false);
            setSelectedRecordToToggle(null);
        }
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <ListFilter className="h-5 w-5 text-primary" />
                        Grid View
                    </CardTitle>
                    <CardDescription>
                        List of configured Exam Pass/Fail and Rank conditions ({filteredData.length} records)
                    </CardDescription>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search conditions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40">
                                <TableHead className="w-12 text-center font-bold">SL NO</TableHead>
                                <TableHead className="font-bold">Academic Year</TableHead>
                                <TableHead className="font-bold">Exam Type</TableHead>
                                <TableHead className="font-bold">Exam Flag</TableHead>
                                <TableHead className="font-bold">Exam Category</TableHead>
                                <TableHead className="font-bold">Exam Condition</TableHead>
                                <TableHead className="text-center font-bold">From</TableHead>
                                <TableHead className="text-center font-bold">To</TableHead>
                                <TableHead className="text-center font-bold">Rank</TableHead>
                                <TableHead className="text-center font-bold">Pass / Fail</TableHead>
                                <TableHead className="text-center font-bold">Overall %</TableHead>
                                <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((row, idx) => (
                                    <TableRow key={row.epfrC_Id || idx} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                        <TableCell>{row.asmaY_Year || '-'}</TableCell>
                                        <TableCell>{row.emE_ExamName || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium">
                                                {row.epfrC_ExamFlag === 'PE' ? 'Promotional' : 'Individual'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{row.emcA_CategoryName || '-'}</TableCell>
                                        <TableCell>{row.ecM_ConditionName || '-'}</TableCell>
                                        <TableCell className="text-center">{row.epfrC_From ?? 0}</TableCell>
                                        <TableCell className="text-center">{row.epfrC_To ?? 0}</TableCell>
                                        <TableCell className="text-center">
                                            {row.epfrC_RankFlag === true || row.epfrC_RankFlag === '1' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-rose-500 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                variant={row.epfrC_PassFailFlag === 'Pass' ? 'default' : 'destructive'}
                                                className={
                                                    row.epfrC_PassFailFlag === 'Pass'
                                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                                        : ''
                                                }
                                            >
                                                {row.epfrC_PassFailFlag || 'Pass'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-semibold">
                                            {row.epfrC_OverallPercentage !== undefined ? `${row.epfrC_OverallPercentage}%` : '-'}
                                        </TableCell>
                                        <TableCell className="text-right pr-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Edit Button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(row)}
                                                    title="Edit Record"
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                {/* Activate / Deactivate Toggle */}
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setSelectedRecordToToggle(row)}
                                                            title={row.epfrC_ActiveFlag === true ? 'Deactivate Record' : 'Activate Record'}
                                                            className={`h-8 w-8 ${
                                                                row.epfrC_ActiveFlag === true
                                                                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                                                    : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50'
                                                            }`}
                                                        >
                                                            {row.epfrC_ActiveFlag === true ? (
                                                                <Power className="h-4 w-4 text-emerald-600" />
                                                            ) : (
                                                                <PowerOff className="h-4 w-4 text-rose-500" />
                                                            )}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Do you want to{' '}
                                                                <strong className="text-foreground font-semibold">
                                                                    {selectedRecordToToggle?.epfrC_ActiveFlag === true ? 'deactivate' : 'activate'}
                                                                </strong>{' '}
                                                                this record?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={handleConfirmToggle}
                                                                disabled={isToggling}
                                                            >
                                                                Yes, {selectedRecordToToggle?.epfrC_ActiveFlag === true ? 'deactivate' : 'activate'} it
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
