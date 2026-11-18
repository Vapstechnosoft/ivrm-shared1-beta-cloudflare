'use client';

import { useState, useMemo } from 'react';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import type { IHutchingsBankChallanItem } from '@/types/fees/reports/hutchings_bank_challan';
import { exportToExcel, printTable } from './print-and-export-excel';

interface StudentChallanListTableProps {
    challanList: IHutchingsBankChallanItem[];
    onViewChallan: (challan: IHutchingsBankChallanItem) => void;
    onDeleteChallan: (challanNo: string) => void;
}

export function StudentChallanListTable({
    challanList,
    onViewChallan,
    onDeleteChallan
}: StudentChallanListTableProps) {
    const [searchField, setSearchField] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    // Filter Logic
    const filteredList = useMemo(() => {
        if (!searchQuery.trim()) return challanList;

        const query = searchQuery.toLowerCase().trim();
        return challanList.filter((item) => {
            if (searchField === 'studentName') return item.studentName.toLowerCase().includes(query);
            if (searchField === 'className') return item.className.toLowerCase().includes(query);
            if (searchField === 'sectionName') return item.sectionName.toLowerCase().includes(query);
            if (searchField === 'admNo') return item.admNo.toLowerCase().includes(query);
            if (searchField === 'challanNo') return item.challanNo.toLowerCase().includes(query);

            return (
                item.studentName.toLowerCase().includes(query) ||
                item.className.toLowerCase().includes(query) ||
                item.sectionName.toLowerCase().includes(query) ||
                item.admNo.toLowerCase().includes(query) ||
                item.challanNo.toLowerCase().includes(query) ||
                String(item.amount).includes(query)
            );
        });
    }, [challanList, searchField, searchQuery]);

    // Paginated Rows
    const paginatedList = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredList.slice(startIndex, startIndex + pageSize);
    }, [filteredList, currentPage]);

    const totalPages = Math.ceil(filteredList.length / pageSize) || 1;

    const handleExportExcel = () => {
        exportToExcel(filteredList, 'Hutchings_Student_Challan_List');
    };

    const handlePrintTable = () => {
        printTable('hutchings-challan-table', 'Student Challan List');
    };

    return (
        <CollapsibleSection defaultOpen={true}>
            <div className="rounded-lg border bg-white shadow-xl overflow-hidden">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b bg-gray-50 px-8 py-4 gap-4">
                    <h2 className="whitespace-nowrap font-bold text-2xl text-purple-700">
                        Student Challan List
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-600">Search For:</span>
                            <Select value={searchField} onValueChange={setSearchField}>
                                <SelectTrigger className="w-40 h-8 text-xs bg-white">
                                    <SelectValue placeholder="--Select Field--" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">--Select Field--</SelectItem>
                                    <SelectItem value="studentName">Student Name</SelectItem>
                                    <SelectItem value="className">Class Name</SelectItem>
                                    <SelectItem value="sectionName">Section Name</SelectItem>
                                    <SelectItem value="admNo">Adm No.</SelectItem>
                                    <SelectItem value="challanNo">Challan No.</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative w-44">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Filter..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-8 h-8 text-xs bg-white"
                                />
                            </div>
                        </div>

                        {filteredList.length > 0 && (
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    size="sm"
                                    className="h-8 px-4 text-xs font-semibold bg-[#f25022] hover:bg-[#d84018] text-white rounded-full"
                                    onClick={handleExportExcel}
                                >
                                    Export Excel
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 px-4 text-xs font-semibold rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
                                    onClick={handlePrintTable}
                                >
                                    Export PDF
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table Content Area */}
                <div className="overflow-x-auto px-8 pb-8 pt-4">
                    {paginatedList.length > 0 ? (
                        <div className="space-y-4">
                            <table id="hutchings-challan-table" className="w-full border-collapse border border-gray-300 text-sm">
                                <thead className="bg-[#5c2d91] text-white">
                                    <tr>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">SLNO</th>
                                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">Student Name</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Class Name</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Section Name</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Adm No.</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Challan No.</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Download Date</th>
                                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-xs">Amount</th>
                                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs no-print">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedList.map((row, index) => (
                                        <tr key={row.challanNo + index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-slate-600">
                                                {row.slNo || (currentPage - 1) * pageSize + index + 1}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 font-medium text-slate-800">{row.studentName}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-slate-700">{row.className}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-slate-700">{row.sectionName}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-slate-700 font-mono text-xs">{row.admNo}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-center font-mono text-xs font-semibold text-purple-700">
                                                {row.challanNo}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 text-center text-slate-600 text-xs">{row.downloadDate}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-slate-900">
                                                ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="border border-gray-300 px-3 py-2 text-center no-print">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        title="View Details"
                                                        onClick={() => onViewChallan(row)}
                                                        className="text-sky-600 hover:text-sky-800 p-1"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Delete Challan"
                                                        onClick={() => onDeleteChallan(row.challanNo)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-slate-500">
                                <div>
                                    Showing {filteredList.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                                    {Math.min(currentPage * pageSize, filteredList.length)} of {filteredList.length} entries
                                </div>

                                {totalPages > 1 && (
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => prev - 1)}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={page === currentPage ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className={`h-7 w-7 text-xs ${
                                                    page === currentPage ? 'bg-purple-700 text-white' : ''
                                                }`}
                                            >
                                                {page}
                                            </Button>
                                        ))}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((prev) => prev + 1)}
                                            className="h-7 px-2 text-xs"
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-slate-500 font-medium">
                            No fee challan records found for the selected criteria.
                        </div>
                    )}
                </div>
            </div>
        </CollapsibleSection>
    );
}
