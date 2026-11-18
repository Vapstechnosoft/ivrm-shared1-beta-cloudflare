'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IPDAOverAllReportRow } from '@/types/pda/report/pda-overall-report';
import { FileDown, Layers, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface PDAOverAllReportGridProps {
    data: IPDAOverAllReportRow[];
    onPrint: (selectedRecords: IPDAOverAllReportRow[]) => void;
}

export default function PDAOverAllReportGrid({ data, onPrint }: PDAOverAllReportGridProps) {
    const [searchValue, setSearchValue] = useState('');
    const [selectedRecords, setSelectedRecords] = useState<IPDAOverAllReportRow[]>([]);

    const filteredData = useMemo(() => {
        return data.filter(
            (row) =>
                row.StudentName.toLowerCase().includes(searchValue.toLowerCase()) ||
                row.AMST_AdmNo.toLowerCase().includes(searchValue.toLowerCase()) ||
                row.ASMCL_ClassName.toLowerCase().includes(searchValue.toLowerCase()) ||
                row.ASMC_SectionName.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [data, searchValue]);

    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, row) => ({
                opening: acc.opening + (row.Opening_Balance || 0),
                wallet: acc.wallet + (row.Wallet_Amount || 0),
                spent: acc.spent + (row.Spent_Amount || 0),
                balance: acc.balance + (row.Balance_Amount || 0)
            }),
            { opening: 0, wallet: 0, spent: 0, balance: 0 }
        );
    }, [filteredData]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedRecords(filteredData);
        } else {
            setSelectedRecords([]);
        }
    };

    const handleSelectRow = (row: IPDAOverAllReportRow, checked: boolean) => {
        if (checked) {
            setSelectedRecords((prev) => [...prev, row]);
        } else {
            setSelectedRecords((prev) => prev.filter((r) => r !== row));
        }
    };

    const isAllSelected = filteredData.length > 0 && selectedRecords.length === filteredData.length;

    const exportToExcel = () => {
        if (filteredData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const exportData = filteredData.map((row, index) => ({
            'SL.NO': index + 1,
            'Student Name': row.StudentName,
            'Admission No': row.AMST_AdmNo,
            Class: row.ASMCL_ClassName,
            Section: row.ASMC_SectionName,
            'Opening Balance': row.Opening_Balance,
            'Wallet Amount': row.Wallet_Amount,
            'Spent Amount': row.Spent_Amount,
            'Balance Amount': row.Balance_Amount
        }));

        // Add Total row
        exportData.push({
            'SL.NO': null as any,
            'Student Name': 'Total',
            'Admission No': '',
            Class: '',
            Section: '',
            'Opening Balance': totals.opening,
            'Wallet Amount': totals.wallet,
            'Spent Amount': totals.spent,
            'Balance Amount': totals.balance
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'PDA OverAll Report');
        XLSX.writeFile(wb, 'PDA_OverAll_Report.xlsx');
        toast.success('Excel file exported successfully');
    };

    const handlePrintClick = () => {
        if (selectedRecords.length === 0) {
            toast.error('Please select records to be printed');
            return;
        }
        onPrint(selectedRecords);
    };

    return (
        <div className='slide-in-from-bottom-4 animate-in space-y-6 duration-500'>
            <div className='flex flex-col items-center justify-between gap-4 px-4 md:flex-row'>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-primary'>
                        <Layers className='h-4 w-4' />
                        <span className='font-semibold text-sm'>Total Records: {filteredData.length}</span>
                    </div>
                </div>

                <div className='group relative w-full md:w-80'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400 transition-colors group-hover:text-primary' />
                    <Input
                        placeholder='Search student, admission no...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className='h-10 rounded-xl border-gray-200 pl-10 transition-all focus:ring-primary/20'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white/50 shadow-xl backdrop-blur-sm'>
                <Table>
                    <TableHeader>
                        <TableRow className='border-b bg-gray-50/80 hover:bg-gray-50/80'>
                            <TableHead className='w-12 text-center'>
                                <Checkbox
                                    checked={isAllSelected}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                    className='border-primary text-primary'
                                />
                            </TableHead>
                            <TableHead className='w-16 font-bold text-gray-800'>SL.NO</TableHead>
                            <TableHead className='font-bold text-gray-800'>Student Name</TableHead>
                            <TableHead className='font-bold text-gray-800'>Admission No</TableHead>
                            <TableHead className='font-bold text-gray-800'>Class : Section</TableHead>
                            <TableHead className='text-right font-bold text-gray-800'>Opening Balance</TableHead>
                            <TableHead className='text-right font-bold text-gray-800'>Wallet Amount</TableHead>
                            <TableHead className='text-right font-bold text-gray-800'>Spent Amount</TableHead>
                            <TableHead className='text-right font-bold text-gray-800'>Balance Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row, index) => (
                                <TableRow key={index} className='group transition-colors hover:bg-primary/5'>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedRecords.includes(row)}
                                            onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                                            className='border-primary text-primary'
                                        />
                                    </TableCell>
                                    <TableCell className='font-medium text-gray-600'>{index + 1}</TableCell>
                                    <TableCell className='font-semibold text-gray-800'>{row.StudentName}</TableCell>
                                    <TableCell className='text-gray-600'>{row.AMST_AdmNo}</TableCell>
                                    <TableCell className='text-gray-600'>
                                        <span className='font-medium text-primary/80'>{row.ASMCL_ClassName}</span>
                                        <span className='mx-2 text-gray-300'>|</span>
                                        <span className='text-gray-500'>{row.ASMC_SectionName}</span>
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                        {row.Opening_Balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                        {row.Wallet_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className='text-right font-medium'>
                                        {row.Spent_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className='text-right font-bold text-primary'>
                                        {row.Balance_Amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} className='h-32 text-center text-gray-400'>
                                    No records found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    {filteredData.length > 0 && (
                        <TableFooter className='border-t-2 bg-gray-50/80'>
                            <TableRow className='hover:bg-gray-50/80'>
                                <TableCell colSpan={5} className='py-4 text-right font-bold text-gray-800'>
                                    Total:
                                </TableCell>
                                <TableCell className='text-right font-bold text-gray-900'>
                                    {totals.opening.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className='text-right font-bold text-gray-900'>
                                    {totals.wallet.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className='text-right font-bold text-gray-900'>
                                    {totals.spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className='text-right font-bold text-primary-dark underline decoration-double'>
                                    {totals.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </div>

            <div className='flex justify-center gap-4 pt-4'>
                <Button
                    onClick={handlePrintClick}
                    className='h-12 rounded-xl bg-indigo-600 px-8 shadow-indigo-100 shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 active:scale-95'>
                    <Printer className='mr-2 h-5 w-5' />
                    Print Selected
                </Button>
                <Button
                    variant='outline'
                    onClick={exportToExcel}
                    className='h-12 rounded-xl border-green-200 px-8 text-green-700 shadow-green-50 shadow-lg transition-all hover:scale-105 hover:bg-green-50 active:scale-95'>
                    <FileDown className='mr-2 h-5 w-5' />
                    Export to Excel
                </Button>
            </div>
        </div>
    );
}
