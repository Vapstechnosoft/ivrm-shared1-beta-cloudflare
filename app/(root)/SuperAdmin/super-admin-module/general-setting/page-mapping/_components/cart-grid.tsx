'use client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { usePageMapping } from './mapping-context';

export default function CartGrid() {
    const { cartPages, removeFromCart, saveCart, isLoading, selectedModuleId, availablePages } = usePageMapping();

    return (
        <div className='flex h-full flex-col rounded-md border bg-white shadow-sm'>
            <div className='flex items-center justify-between border-b bg-green-50 p-3'>
                <h3 className='font-semibold text-green-800 text-lg'>Selected Master Pages</h3>
                <span className='text-gray-500 text-sm'>{cartPages.length} item(s)</span>
            </div>
            <div className='flex-1 overflow-auto p-2' style={{ maxHeight: '400px' }}>
                <table className='w-full text-sm'>
                    <thead className='sticky top-0 bg-gray-100 text-left'>
                        <tr>
                            <th className='p-2'>Page Name</th>
                            <th className='p-2 text-right'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartPages.length > 0 ? (
                            cartPages.map((page) => (
                                <tr key={page.ivrmP_Id} className='border-b hover:bg-gray-50'>
                                    <td className='text-wrap p-2'>{page.ivrmP_PageDisplayName}</td>
                                    <td className='p-2 text-right'>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => removeFromCart([page.ivrmP_Id])}
                                            className='h-8 w-8 text-red-500 hover:bg-red-50'>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={2} className='p-4 text-center text-gray-500'>
                                    No pages selected
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className='flex justify-end gap-2 border-t bg-gray-50 p-2'>
                <Button
                    variant='outline'
                    disabled={cartPages.length === 0 || isLoading}
                    onClick={() => removeFromCart(cartPages.map((p) => p.ivrmP_Id))} // Clear all
                >
                    Cancel
                </Button>
                <Button
                    onClick={() => saveCart()}
                    disabled={cartPages.length === 0 || isLoading || !selectedModuleId}
                    className='bg-blue-600 hover:bg-blue-700'>
                    {isLoading ? 'Saving...' : 'Save Mapping'}
                </Button>
            </div>
        </div>
    );
}
