'use client';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import type { InstitutionRolePrivilegeDTO } from '@/types/super-admin/configuration-setting/institution-module-page';
import { Minus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DeleteGridProps {
    data: InstitutionRolePrivilegeDTO[];
    onDelete: (items: InstitutionRolePrivilegeDTO[]) => void;
    onCancel: () => void;
}

export default function DeleteGrid({ data: initialData, onDelete, onCancel }: DeleteGridProps) {
    const [data, setData] = useState<InstitutionRolePrivilegeDTO[]>(initialData);
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

    const handleSort = (key: keyof InstitutionRolePrivilegeDTO) => {
        const sorted = [...data].sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return -1;
            if (valA > valB) return 1;
            return 0;
        });
        setData(sorted);
    };

    return (
        <div className='box box-primary mt-4 rounded-md border shadow-sm'>
            <div className='box-header with-border flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='box-title font-medium text-lg'>Deleting Saved Pages</h3>
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
                                        <th className='border p-2'>SL.NO</th>
                                        <th className='cursor-pointer border p-2 text-blue-600' onClick={() => handleSort('mI_Name')}>
                                            Institution Name
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmM_ModuleName')}>
                                            Module
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmmP_PageName')}>
                                            Page Name
                                        </th>
                                        <th className='cursor-pointer border p-2 text-blue-600' onClick={() => handleSort('ivrmrT_Role')}>
                                            Role Name
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_AddFlag')}>
                                            Add
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_DeleteFlag')}>
                                            Delete
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_UpdateFlag')}>
                                            Update
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_ProcessFlag')}>
                                            Process
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_ReportFlag')}>
                                            Report
                                        </th>
                                        <th
                                            className='cursor-pointer border p-2 text-blue-600'
                                            onClick={() => handleSort('ivrmirP_SearchFlag')}>
                                            Search
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedData.map((item, index) => (
                                        <tr key={item.ivrmirP_Id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className='border p-2 text-center'>{startIndex + index + 1}</td>
                                            <td className='border p-2 text-center'>{item.mI_Name}</td>
                                            <td className='border p-2 text-center'>{item.ivrmM_ModuleName}</td>
                                            <td className='border p-2 text-center'>{item.ivrmmP_PageName}</td>
                                            <td className='border p-2 text-center'>{item.ivrmrT_Role}</td>
                                            <td className='border p-2 text-center text-green-600'>{item.ivrmirP_AddFlag ? '✔' : '✖'}</td>
                                            <td className='border p-2 text-center text-green-600'>{item.ivrmirP_DeleteFlag ? '✔' : '✖'}</td>
                                            <td className='border p-2 text-center text-green-600'>{item.ivrmirP_UpdateFlag ? '✔' : '✖'}</td>
                                            <td className='border p-2 text-center text-green-600'>
                                                {item.ivrmirP_ProcessFlag ? '✔' : '✖'}
                                            </td>
                                            <td className='border p-2 text-center text-green-600'>{item.ivrmirP_ReportFlag ? '✔' : '✖'}</td>
                                            <td className='border p-2 text-center text-green-600'>{item.ivrmirP_SearchFlag ? '✔' : '✖'}</td>
                                        </tr>
                                    ))}
                                    {paginatedData.length === 0 && (
                                        <tr>
                                            <td colSpan={11} className='p-4 text-center'>
                                                No Data Found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <hr className='my-4' />

                        {/* Actions */}
                        <div className='flex justify-center gap-4'>
                            <Button className='bg-primary text-white hover:bg-primary-dark' onClick={() => onDelete(data)}>
                                <Trash2 className='mr-2 h-4 w-4' /> Delete
                            </Button>
                            <Button variant='destructive' onClick={onCancel}>
                                <X className='mr-2 h-4 w-4' /> Cancel
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
