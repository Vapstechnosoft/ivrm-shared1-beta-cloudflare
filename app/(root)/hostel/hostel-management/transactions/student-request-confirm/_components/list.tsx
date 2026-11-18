'use client';
import { Input } from '@/components/ui/input';
import { GenericDataTable } from '@/components/ui/view-data-table/view-generic-data-table';
import { Search } from 'lucide-react';
import { studentRequestConfirmColumns } from './columns';

interface StudentRequestConfirmListProps {
    data: any[];
    onProcess: (data: any) => void;
}

export default function StudentRequestConfirmList({ data, onProcess }: StudentRequestConfirmListProps) {
    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between border-gray-100 border-b py-2'>
                <div className='flex items-center space-x-2'>
                    <span className='font-bold text-gray-700 text-sm'>Total Grid Records :</span>
                    <span className='rounded-full bg-gray-500 px-2 py-0.5 font-bold text-[10px] text-white'>{data.length}</span>
                    {data.length === 0 && <span className='ml-4 font-medium text-red-500 text-sm'>Record Not Found!</span>}
                </div>
                <div className='relative w-72'>
                    <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                        <Search className='h-3.5 w-3.5 text-gray-400' />
                    </div>
                    <Input
                        placeholder='search here...'
                        className='h-9 rounded-full border-gray-200 bg-white pl-10 text-xs shadow-sm focus-visible:ring-[#4255a7]'
                    />
                </div>
            </div>
            <GenericDataTable columns={studentRequestConfirmColumns(onProcess)} data={data} isLoading={false} />
        </div>
    );
}
