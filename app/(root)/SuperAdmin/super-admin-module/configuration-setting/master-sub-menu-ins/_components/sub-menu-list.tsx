'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import type { SubMenuOnChangeDTO } from '@/types/super-admin/configuration-setting/master-sub-menu-ins';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Minus, Save, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubMenuListProps {
    data: SubMenuOnChangeDTO[];
    onSelectionChange?: (selectedItems: SubMenuOnChangeDTO[]) => void;
    onSave?: (items: SubMenuOnChangeDTO[]) => void;
    onClear?: () => void;
}

export default function SubMenuList({ data: initialData, onSelectionChange, onSave, onClear }: SubMenuListProps) {
    const [data, setData] = useState<SubMenuOnChangeDTO[]>(initialData);
    const [isOpen, setIsOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    // Filtering
    const filteredData = data.filter((item) => item.ivrmmmI_MenuName?.toLowerCase().includes(searchTerm.toLowerCase()));

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleCheckboxChange = (id: number, checked: boolean) => {
        const newData = data.map((item) => (item.ivrmmM_Id === id ? { ...item, checked } : item));
        setData(newData);
        if (onSelectionChange) {
            onSelectionChange(newData.filter((i) => i.checked));
        }
    };

    const handleSort = (key: keyof SubMenuOnChangeDTO) => {
        // Implement simple client-side sort if needed, simplified for now based on snippet
    };

    const handleNameChange = (id: number, newName: string) => {
        const newData = data.map((item) => (item.ivrmmM_Id === id ? { ...item, ivrmmmI_MenuName: newName } : item));
        setData(newData);
    };

    return (
        <div className='box box-primary mt-4 rounded-md border bg-white shadow-sm'>
            <div className='box-header with-border flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='box-title font-medium text-[#3a0ca3] text-lg'>Sub Menu List</h3>
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
                        {/* Search */}
                        <div className='mb-4 flex justify-end'>
                            <div className='relative w-1/3'>
                                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                                    <Search className='h-4 w-4 text-gray-400' />
                                </div>
                                <Input
                                    type='text'
                                    className='pl-10'
                                    placeholder='search here...'
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className='overflow-x-auto'>
                            <table className='table-hover table-bordered table w-full border-collapse text-left text-sm'>
                                <thead className='bg-gray-100 text-center font-bold'>
                                    <tr>
                                        <th className='w-16 border p-2 text-center'>SL.NO</th>
                                        <th className='cursor-pointer border p-2 hover:text-blue-600'>Sub Menu Name</th>
                                        <th className='w-24 border p-2 text-center'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.length > 0 ? (
                                        paginatedData.map((item, index) => (
                                            <tr key={item.ivrmmM_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className='border p-2 text-center'>{startIndex + index + 1}</td>
                                                <td className='border p-2 text-center'>
                                                    <Input
                                                        value={item.ivrmmmI_MenuName}
                                                        onChange={(e) => handleNameChange(item.ivrmmM_Id, e.target.value)}
                                                        className='w-full text-center'
                                                        // allow-pattern logic is typical regex in React, controlled via onChange
                                                    />
                                                </td>
                                                <td className='border p-2 text-center'>
                                                    <div className='flex justify-center'>
                                                        <Checkbox
                                                            checked={item.checked || false}
                                                            onCheckedChange={(checked) =>
                                                                handleCheckboxChange(item.ivrmmM_Id, checked as boolean)
                                                            }
                                                            title='Add Cart'
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className='p-4 text-center'>
                                                No Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
                                    disabled={currentPage === 1}>
                                    <ChevronsLeft className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}>
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}>
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='h-8 w-8'
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages || totalPages === 0}>
                                    <ChevronsRight className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>

                        <hr className='my-4' />

                        {/* Footer Buttons */}
                        <div className='flex justify-center gap-4'>
                            <Button
                                className='bg-blue-600 text-white hover:bg-blue-700'
                                onClick={() => onSave && onSave(data.filter((i) => i.checked))}>
                                <Save className='mr-2 h-4 w-4' /> Save
                            </Button>
                            <Button variant='destructive' className='bg-red-600 hover:bg-red-700' onClick={onClear}>
                                <X className='mr-2 h-4 w-4' /> Clear
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
