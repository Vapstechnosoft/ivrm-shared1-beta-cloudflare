'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/extension/input-text';
import type { IPrivilegeData } from '@/types/super-admin/super-admin-module/general-setting/privileges';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PrivilegesGridProps {
    data: IPrivilegeData[];
    onChange: (data: IPrivilegeData[]) => void;
    onDelete?: (item: IPrivilegeData) => void;
    title: string;
    isCart?: boolean;
}

export function PrivilegesGrid({ data, onChange, onDelete, title, isCart }: PrivilegesGridProps) {
    if (!data || data.length === 0) return null;

    const handleCheckChange = (index: number, field: keyof IPrivilegeData, checked: boolean) => {
        const newData = [...data];
        newData[index] = { ...newData[index], [field]: checked };
        onChange(newData);
    };

    const toggleAll = (field: keyof IPrivilegeData, checked: boolean) => {
        const newData = data.map((item) => ({ ...item, [field]: checked }));
        onChange(newData);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = data.filter((item) => item.ivrmmP_PageName.toLowerCase().includes(searchTerm.toLowerCase()));

    const isAllChecked = (field: keyof IPrivilegeData) => data.length > 0 && data.every((item) => Boolean(item[field]));

    return (
        <div className='mb-4 rounded-md border bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b bg-gray-50 p-3'>
                <h3 className='font-semibold'>{title}</h3>
                <div className='flex items-center gap-4'>
                    <span className='text-gray-500 text-sm'>{data.length} items</span>
                    <div className='w-64'>
                        <InputText placeholder='Search here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className='max-h-96 overflow-x-auto overflow-y-auto'>
                <table className='w-full text-left text-sm'>
                    <thead className='sticky top-0 bg-gray-50 text-gray-700 text-xs uppercase'>
                        <tr>
                            <th className='px-4 py-3'>SL.NO</th>
                            <th className='px-4 py-3'>Page Name</th>
                            <th className='px-4 py-3 text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <span>Add</span>
                                    {isCart && (
                                        <Checkbox
                                            checked={isAllChecked('ivrmrP_AddFlag')}
                                            onCheckedChange={(c) => toggleAll('ivrmrP_AddFlag', c as boolean)}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className='px-4 py-3 text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <span>Delete</span>
                                    {isCart && (
                                        <Checkbox
                                            checked={isAllChecked('ivrmrP_DeleteFlag')}
                                            onCheckedChange={(c) => toggleAll('ivrmrP_DeleteFlag', c as boolean)}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className='px-4 py-3 text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <span>Update</span>
                                    {isCart && (
                                        <Checkbox
                                            checked={isAllChecked('ivrmrP_UpdateFlag')}
                                            onCheckedChange={(c) => toggleAll('ivrmrP_UpdateFlag', c as boolean)}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className='px-4 py-3 text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <span>Process</span>
                                    {isCart && (
                                        <Checkbox
                                            checked={isAllChecked('ivrmrP_ProcessFlag')}
                                            onCheckedChange={(c) => toggleAll('ivrmrP_ProcessFlag', c as boolean)}
                                        />
                                    )}
                                </div>
                            </th>
                            <th className='px-4 py-3 text-center'>
                                <div className='flex flex-col items-center gap-1'>
                                    <span>Report</span>
                                    {isCart && (
                                        <Checkbox
                                            checked={isAllChecked('ivrmrP_ReportFlag')}
                                            onCheckedChange={(c) => toggleAll('ivrmrP_ReportFlag', c as boolean)}
                                        />
                                    )}
                                </div>
                            </th>
                            {isCart && <th className='px-4 py-3 text-center'>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index} className='border-b hover:bg-gray-50'>
                                <td className='px-4 py-3'>{index + 1}</td>
                                <td className='px-4 py-3 font-medium'>{item.ivrmmP_PageName}</td>
                                <td className='px-4 py-3 text-center'>
                                    <Checkbox
                                        checked={item.ivrmrP_AddFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_AddFlag', c as boolean)}
                                    />
                                </td>
                                <td className='px-4 py-3 text-center'>
                                    <Checkbox
                                        checked={item.ivrmrP_DeleteFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_DeleteFlag', c as boolean)}
                                    />
                                </td>
                                <td className='px-4 py-3 text-center'>
                                    <Checkbox
                                        checked={item.ivrmrP_UpdateFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_UpdateFlag', c as boolean)}
                                    />
                                </td>
                                <td className='px-4 py-3 text-center'>
                                    <Checkbox
                                        checked={item.ivrmrP_ProcessFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_ProcessFlag', c as boolean)}
                                    />
                                </td>
                                <td className='px-4 py-3 text-center'>
                                    <Checkbox
                                        checked={item.ivrmrP_ReportFlag}
                                        onCheckedChange={(c) => handleCheckChange(index, 'ivrmrP_ReportFlag', c as boolean)}
                                    />
                                </td>
                                {isCart && onDelete && (
                                    <td className='px-4 py-3 text-center'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='text-red-500 hover:text-red-700'
                                            onClick={() => onDelete(item)}>
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
