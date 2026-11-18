'use client';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { IPDAExpenditureImportRow } from '@/types/pda/report/pda-expenditure-import';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useState } from 'react';

interface PDAExpenditureImportGridProps {
    data: IPDAExpenditureImportRow[];
}

export default function PDAExpenditureImportGrid({ data }: PDAExpenditureImportGridProps) {
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<keyof IPDAExpenditureImportRow | 'slno'>('slno');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: keyof IPDAExpenditureImportRow | 'slno') => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const filteredData = data.filter((item) => Object.values(item).some((val) => String(val).toLowerCase().includes(search.toLowerCase())));

    const sortedData = [...filteredData].sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortKey === 'slno') {
            // We don't really have a slno in data, so we'll use index later
            return 0;
        } else {
            valA = a[sortKey];
            valB = b[sortKey];
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const headers: { key: keyof IPDAExpenditureImportRow; label: string }[] = [
        { key: 'RollNumber', label: 'Roll Number' },
        { key: 'StudentName', label: 'Student Name' },
        { key: 'Date', label: 'Date' },
        { key: 'Particulars', label: 'Particulars' },
        { key: 'VoucherNo', label: 'Voucher No' },
        { key: 'Amount', label: 'Amount' }
    ];

    return (
        <div className='space-y-4'>
            <div className='flex justify-end p-4'>
                <div className='relative w-72'>
                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-gray-400' />
                    <Input
                        placeholder='Search records...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className='h-10 rounded-xl border-gray-200 bg-white pl-10 shadow-sm focus-visible:ring-primary'
                    />
                </div>
            </div>

            <div className='overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm'>
                <Table>
                    <TableHeader className='bg-gray-50/80 backdrop-blur-sm'>
                        <TableRow className='border-gray-100 border-b hover:bg-transparent'>
                            <TableHead className='w-16 text-center font-bold text-[11px] text-gray-700 uppercase tracking-wider'>
                                SL.NO
                            </TableHead>
                            {headers.map((header) => (
                                <TableHead
                                    key={header.key}
                                    onClick={() => handleSort(header.key)}
                                    className='group cursor-pointer font-bold text-[11px] text-gray-700 uppercase tracking-wider transition-colors hover:text-primary'>
                                    <div className='flex items-center gap-1'>
                                        {header.label}
                                        <div className='flex flex-col'>
                                            <ChevronUp
                                                className={`-mb-1 h-3 w-3 ${sortKey === header.key && sortOrder === 'asc' ? 'text-primary' : 'text-gray-300'}`}
                                            />
                                            <ChevronDown
                                                className={`h-3 w-3 ${sortKey === header.key && sortOrder === 'desc' ? 'text-primary' : 'text-gray-300'}`}
                                            />
                                        </div>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.length > 0 ? (
                            sortedData.map((row, index) => (
                                <TableRow key={index} className='group transition-colors hover:bg-primary/5'>
                                    <TableCell className='text-center font-medium text-gray-500 text-sm'>{index + 1}</TableCell>
                                    <TableCell className='font-medium text-gray-600 text-sm'>{row.RollNumber}</TableCell>
                                    <TableCell className='font-semibold text-gray-900 text-sm'>{row.StudentName}</TableCell>
                                    <TableCell className='text-gray-600 text-sm'>{row.Date}</TableCell>
                                    <TableCell className='max-w-[200px] truncate text-gray-600 text-sm' title={row.Particulars}>
                                        {row.Particulars}
                                    </TableCell>
                                    <TableCell className='text-gray-600 text-sm'>{row.VoucherNo}</TableCell>
                                    <TableCell className='font-bold text-gray-900 text-sm'>
                                        {Number(row.Amount).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className='h-32 text-center text-gray-400 italic'>
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
