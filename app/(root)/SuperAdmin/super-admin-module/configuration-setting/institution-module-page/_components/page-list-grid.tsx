'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import type { PageDTO } from '@/types/super-admin/configuration-setting/institution-module-page';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Minus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PageListGridProps {
    data: PageDTO[];
    onAddToCart: (item: PageDTO, index: number) => void;
}

export default function PageListGrid({ data: initialData, onAddToCart }: PageListGridProps) {
    const [data, setData] = useState<PageDTO[]>(initialData);
    const [isOpen, setIsOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Filtering
    const filteredData = data.filter((item) =>
        Object.values(item).some((val) => typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (key: keyof PageDTO) => {
        const sorted = [...data].sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });
        setData(sorted);
    };

    const toggleItem = (id: number, checked: boolean) => {
        const newData = data.map((item) => (item.ivrmP_Id === id ? { ...item, checked } : item));
        setData(newData);
        if (checked) {
            const item = data.find((i) => i.ivrmP_Id === id);
            if (item) onAddToCart(item, 0); // Passing 0 index for now, or true index if needed
        }
    };

    return (
        <div className='box box-primary mt-4 rounded-md border shadow-sm'>
            {/* Header */}
            <div className='box-header with-border flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='box-title font-medium text-lg'>Page List</h3>
                <div className='box-tools pull-right'>
                    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant='ghost' size='sm' className='btn-box-tool'>
                                <Minus className='h-4 w-4' />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                </div>
            </div>

            <Collapsible open={isOpen}>
                <CollapsibleContent>
                    <div className='box-body p-4'>
                        {/* Search Bar */}
                        <div className='row mb-4 flex justify-end'>
                            <div className='col-sm-4'>
                                <div className='form-group'>
                                    <div className='relative'>
                                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                            <Search className='h-4 w-4 text-gray-400' />
                                        </div>
                                        <Input
                                            type='text'
                                            className='pl-10'
                                            placeholder='search here..'
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className='overflow-x-auto'>
                            <table className='table-hover table-bordered table w-full border-collapse text-left text-sm'>
                                <thead className='bg-gray-100 text-center font-bold'>
                                    <tr>
                                        <th className='border p-2 text-center'>SL.NO</th>
                                        <th
                                            className='cursor-pointer border p-2 text-center text-blue-600 hover:text-blue-800'
                                            onClick={() => handleSort('ivrmmP_PageName')}>
                                            Page Name
                                        </th>
                                        <th className='border p-2 text-center'>Add/Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.ivrmP_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className='border p-2 text-center'>{startIndex + index + 1}</td>
                                            <td className='border p-2 text-center'>{item.ivrmmP_PageName}</td>
                                            <td className='border p-2 text-center'>
                                                <Checkbox
                                                    checked={item.checked || false}
                                                    onCheckedChange={(checked) => toggleItem(item.ivrmP_Id, checked as boolean)}
                                                    data-toggle='tooltip'
                                                    title='Add Cart'
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className='p-4 text-center'>
                                                No Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className='mt-4 flex items-center justify-between'>
                            <div className='text-muted-foreground text-sm'>
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of{' '}
                                {filteredData.length} entries
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    title='First Page'>
                                    <ChevronsLeft className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    title='Previous Page'>
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let startPage = Math.max(1, currentPage - 2);
                                    if (startPage + 4 > totalPages) {
                                        startPage = Math.max(1, totalPages - 4);
                                    }
                                    return startPage + i;
                                })
                                    .filter((page) => page <= totalPages)
                                    .map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? 'default' : 'outline'}
                                            size='sm'
                                            className='h-8 w-8 p-0'
                                            onClick={() => setCurrentPage(page)}>
                                            {page}
                                        </Button>
                                    ))}

                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    title='Next Page'>
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    title='Last Page'>
                                    <ChevronsRight className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
