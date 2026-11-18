'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    deleteMultiplePDATransactions,
    deletePDATransaction,
    getHeadDetails,
    searchTransactions
} from '@/server/pda/transaction/pdatransactionsrs';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Eye, Pencil, Printer, Search, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface PDATransactionListProps {
    transactions: any[];
    academicYearId: number;
    onEdit: (id: number, amstId: number) => void;
    onRefresh: () => void;
    roleName?: string;
}

export default function PDATransactionList({
    transactions: initialTransactions,
    academicYearId,
    onEdit,
    onRefresh,
    roleName
}: PDATransactionListProps) {
    const [searchType, setSearchType] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchDate, setSearchDate] = useState<Date | undefined>(undefined);
    const [searchAmount, setSearchAmount] = useState('');

    const [transactions, setTransactions] = useState(initialTransactions);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [viewingHeads, setViewingHeads] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchType) return toast.error('Select search field');
        setLoading(true);
        try {
            const data: any = {
                searchType,
                ASMAY_Id: academicYearId
            };
            if (searchType === '4') data.searchdate = searchDate ? format(searchDate, 'yyyy-MM-dd') : '';
            else if (searchType === '5') data.searchnumber = Number(searchAmount);
            else data.searchtext = searchText;

            const response = await searchTransactions(data);
            if (response.success && response.data?.searcharray?.$values) {
                setTransactions(response.data.searcharray.$values);
                if (response.data.searcharray.$values.length === 0) toast.info('No records found');
            }
        } catch (error) {
            toast.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            const response = await deletePDATransaction({ PDAE_ID: id });
            if (response.success) {
                toast.success('Record deleted');
                onRefresh();
            }
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} records?`)) return;
        try {
            const response = await deleteMultiplePDATransactions({ PDAE_Ids: selectedIds });
            if (response.success) {
                toast.success('Records deleted');
                setSelectedIds([]);
                onRefresh();
            }
        } catch (error) {
            toast.error('Bulk delete failed');
        }
    };

    const handleViewHeads = async (id: number) => {
        try {
            const response = await getHeadDetails({ PDAE_ID: id });
            if (response.success && response.data?.pdaheadlist?.$values) {
                setViewingHeads(response.data.pdaheadlist.$values);
            }
        } catch (error) {
            toast.error('Failed to load details');
        }
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            transactions.map((t) => ({
                'Student Name': `${t.amsT_FirstName} ${t.amsT_LastName}`,
                Class: t.classname,
                Section: t.sectionname,
                'Adm No': t.amsT_AdmNo,
                'Transaction No': t.transactionno,
                'Voucher No': t.voucherno,
                Date: format(new Date(t.pdaE_Date), 'dd-MM-yyyy'),
                Mode: t.pdaR_ModeOfPayment,
                Amount: t.pdaE_TotAmount
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, 'PDA_Transactions.xlsx');
    };

    const totalAmount = transactions.reduce((sum, t) => sum + (t.pdaE_TotAmount || 0), 0);

    return (
        <div className='fade-in slide-in-from-bottom-4 animate-in space-y-6 duration-700'>
            <Card className='border-none bg-gray-50/30 shadow-sm'>
                <CardContent className='p-6'>
                    <div className='grid grid-cols-1 items-end gap-6 md:grid-cols-4'>
                        <div className='space-y-2'>
                            <Label className='font-bold text-gray-700 text-sm'>Search Field</Label>
                            <Select value={searchType} onValueChange={setSearchType}>
                                <SelectTrigger className='h-11 rounded-xl bg-white'>
                                    <SelectValue placeholder='Select Field' />
                                </SelectTrigger>
                                <SelectContent className='rounded-xl'>
                                    <SelectItem value='0'>Student Name</SelectItem>
                                    <SelectItem value='1'>Class Name</SelectItem>
                                    <SelectItem value='6'>Section Name</SelectItem>
                                    <SelectItem value='2'>Adm No.</SelectItem>
                                    <SelectItem value='3'>Transaction No.</SelectItem>
                                    <SelectItem value='4'>Transaction Date</SelectItem>
                                    <SelectItem value='7'>Transaction Mode</SelectItem>
                                    <SelectItem value='8'>Voucher No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label className='font-bold text-gray-700 text-sm'>Search Value</Label>
                            {searchType === '4' ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className='h-11 w-full justify-start rounded-xl border-gray-200 bg-white text-left font-normal'>
                                            <CalendarIcon className='mr-2 h-4 w-4 text-primary' />
                                            {searchDate ? format(searchDate, 'dd-MM-yyyy') : <span>Pick date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto rounded-xl p-0' align='start'>
                                        <Calendar mode='single' selected={searchDate} onSelect={setSearchDate} />
                                    </PopoverContent>
                                </Popover>
                            ) : searchType === '5' ? (
                                <Input
                                    type='number'
                                    placeholder='Enter amount'
                                    value={searchAmount}
                                    onChange={(e) => setSearchAmount(e.target.value)}
                                    className='h-11 rounded-xl border-gray-200 bg-white'
                                />
                            ) : (
                                <Input
                                    placeholder='Enter search text...'
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className='h-11 rounded-xl border-gray-200 bg-white'
                                />
                            )}
                        </div>

                        <div className='flex gap-3'>
                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className='h-11 rounded-xl bg-primary px-8 shadow-md transition-all hover:scale-105 hover:bg-primary/90 active:scale-95'>
                                <Search className='mr-2 h-4 w-4' />
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                            <Button
                                variant='outline'
                                onClick={() => {
                                    setSearchType('');
                                    setSearchText('');
                                    setTransactions(initialTransactions);
                                }}
                                className='h-11 rounded-xl border-gray-200 bg-white px-4 hover:bg-gray-50'>
                                <XCircle className='h-4 w-4 text-gray-400' />
                            </Button>
                        </div>

                        <div className='flex justify-end gap-3'>
                            <Button
                                variant='outline'
                                onClick={() => window.print()}
                                className='h-11 rounded-xl border-indigo-200 px-6 text-indigo-700 shadow-sm transition-all hover:scale-105 hover:bg-indigo-50 active:scale-95'>
                                <Printer className='mr-2 h-4 w-4' /> Print
                            </Button>
                            <Button
                                variant='outline'
                                onClick={exportToExcel}
                                className='h-11 rounded-xl border-emerald-200 px-6 text-emerald-700 shadow-sm transition-all hover:scale-105 hover:bg-emerald-50 active:scale-95'>
                                <Download className='mr-2 h-4 w-4' /> Excel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className='relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl'>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader className='bg-gray-50/50'>
                            <TableRow>
                                <TableHead className='w-12 text-center'>
                                    <Checkbox
                                        checked={selectedIds.length === transactions.length && transactions.length > 0}
                                        onCheckedChange={(v) => setSelectedIds(!!v ? transactions.map((t) => t.pdaE_ID) : [])}
                                    />
                                </TableHead>
                                <TableHead className='w-12 text-center font-bold'>#</TableHead>
                                <TableHead className='font-bold'>Student Name</TableHead>
                                <TableHead className='font-bold'>Class / Section</TableHead>
                                <TableHead className='font-bold'>Adm No</TableHead>
                                <TableHead className='font-bold'>Trans No</TableHead>
                                <TableHead className='font-bold'>Voucher No</TableHead>
                                <TableHead className='text-right font-bold'>Amount</TableHead>
                                <TableHead className='text-center font-bold'>Date</TableHead>
                                <TableHead className='text-center font-bold'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t, idx) => (
                                <TableRow key={t.pdaE_ID} className='group transition-colors hover:bg-gray-50/50'>
                                    <TableCell className='text-center'>
                                        <Checkbox
                                            checked={selectedIds.includes(t.pdaE_ID)}
                                            onCheckedChange={(v) =>
                                                setSelectedIds((p) => (!!v ? [...p, t.pdaE_ID] : p.filter((id) => id !== t.pdaE_ID)))
                                            }
                                        />
                                    </TableCell>
                                    <TableCell className='text-center font-medium text-gray-400'>{idx + 1}</TableCell>
                                    <TableCell>
                                        <div className='flex flex-col'>
                                            <span className='font-bold text-gray-800'>
                                                {t.amsT_FirstName} {t.amsT_LastName}
                                            </span>
                                            <span className='text-[10px] text-gray-400 uppercase tracking-tighter'>
                                                {t.pdaR_ModeOfPayment}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className='font-medium text-gray-500 text-xs'>
                                        {t.classname} <span className='mx-1 text-gray-300'>|</span> {t.sectionname}
                                    </TableCell>
                                    <TableCell className='font-mono text-indigo-600 text-xs'>{t.amsT_AdmNo}</TableCell>
                                    <TableCell className='font-medium text-[11px] text-gray-600'>{t.transactionno}</TableCell>
                                    <TableCell className='text-gray-500 text-xs'>{t.voucherno}</TableCell>
                                    <TableCell className='text-right font-bold text-primary'>
                                        ₹{t.pdaE_TotAmount?.toLocaleString()}
                                    </TableCell>
                                    <TableCell className='text-center font-medium text-[11px] text-gray-500'>
                                        {format(new Date(t.pdaE_Date), 'dd-MM-yyyy')}
                                    </TableCell>
                                    <TableCell className='text-center'>
                                        <div className='flex justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleViewHeads(t.pdaE_ID)}
                                                title='View Details'
                                                className='h-9 w-9 rounded-xl text-blue-500 transition-all hover:bg-blue-50 hover:text-blue-600'>
                                                <Eye className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => onEdit(t.pdaE_ID, t.amst_Id)}
                                                title='Edit'
                                                className='h-9 w-9 rounded-xl text-amber-500 transition-all hover:bg-amber-50 hover:text-amber-600'>
                                                <Pencil className='h-4 w-4' />
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon'
                                                onClick={() => handleDelete(t.pdaE_ID)}
                                                title='Delete'
                                                className='h-9 w-9 rounded-xl text-red-500 transition-all hover:bg-red-50 hover:text-red-600'>
                                                <Trash2 className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={10} className='h-40 text-center text-gray-400 italic'>
                                        No transactions found matching your criteria
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {transactions.length > 0 && (
                    <div className='flex items-center justify-between border-gray-100 border-t bg-gray-50/80 p-6'>
                        <div className='font-medium text-gray-500 text-sm'>Showing {transactions.length} transactions</div>
                        <div className='flex items-center gap-3'>
                            <span className='text-gray-400 text-sm'>Total Amount:</span>
                            <span className='font-black text-2xl text-primary'>₹{totalAmount.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className='-translate-x-1/2 slide-in-from-bottom-10 fixed bottom-10 left-1/2 z-50 animate-in duration-500'>
                    <Button
                        variant='destructive'
                        onClick={handleBulkDelete}
                        className='flex h-14 items-center gap-3 rounded-2xl border-4 border-white px-12 shadow-2xl shadow-red-200 transition-all hover:scale-105 active:scale-95'>
                        <Trash2 className='h-5 w-5' />
                        <span className='font-bold'>Delete {selectedIds.length} Selected Records</span>
                    </Button>
                </div>
            )}

            {/* View Modal */}
            <Dialog open={!!viewingHeads} onOpenChange={() => setViewingHeads(null)}>
                <DialogContent className='max-w-2xl overflow-hidden rounded-[2rem] border-none p-10 shadow-2xl'>
                    <div className='pointer-events-none absolute top-0 right-0 p-10 opacity-5'>
                        <Eye size={160} />
                    </div>
                    <DialogHeader className='relative z-10 mb-6'>
                        <DialogTitle className='flex items-center gap-3 font-black text-2xl text-gray-800'>
                            <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600'>
                                <Eye size={20} />
                            </div>
                            Head Breakdown
                        </DialogTitle>
                    </DialogHeader>
                    <div className='relative z-10 overflow-hidden rounded-3xl border border-gray-100 bg-gray-50/50'>
                        <Table>
                            <TableHeader className='bg-white/80'>
                                <TableRow>
                                    <TableHead className='w-16 text-center font-bold'>#</TableHead>
                                    <TableHead className='font-bold'>Head Name</TableHead>
                                    <TableHead className='pr-8 text-right font-bold'>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {viewingHeads?.map((h, i) => (
                                    <TableRow key={i} className='transition-colors hover:bg-white/50'>
                                        <TableCell className='text-center font-medium text-gray-400'>{i + 1}</TableCell>
                                        <TableCell className='font-bold text-gray-700'>{h.PDAMH_HeadName}</TableCell>
                                        <TableCell className='pr-8 text-right font-black text-primary'>
                                            ₹{h.pdaeH_Amount?.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='relative z-10 mt-8 flex justify-end'>
                        <Button
                            onClick={() => setViewingHeads(null)}
                            className='h-11 rounded-xl bg-gray-900 px-10 transition-all hover:bg-black'>
                            Close Details
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
