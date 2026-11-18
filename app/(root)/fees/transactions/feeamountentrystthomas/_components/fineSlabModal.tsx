import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Minus, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FineSlabModalProps {
    isOpen: boolean;
    onClose: () => void;
    headId: number;
    installmentId: number;
    feeGroupId: number;
    categoryId: number;
    academicYearId: number;
    selectionType: string;
    selectedInstallment: string;
}

export interface RowData {
    id: number | string;
    date: Date | null;
    type: string;
    amount: string;
}

export interface CartItem {
    headId: number;
    installmentId: number;
    rows: RowData[];
    selectedInstallment: string;
    feeGroupId: number;
    categoryId: number;
    academicYearId: number;
    selectionType: string;
    timestamp: number;
}

const CART_STORAGE_PREFIX = 'fine_slab_cart_';

export default function FineSlabModal({
    isOpen,
    onClose,
    headId,
    installmentId,
    feeGroupId,
    categoryId,
    academicYearId,
    selectionType,
    selectedInstallment
}: FineSlabModalProps) {
    const fineTypeOptions = [
        { value: 'Per Day', label: 'Per Day' },
        { value: 'Day Slab', label: 'Day Slab' }
    ];

    const [rows, setRows] = useState<RowData[]>([
        {
            id: 1,
            date: new Date(),
            type: '',
            amount: ''
        }
    ]);

    const getStorageKey = () => {
        return `${CART_STORAGE_PREFIX}${headId}_${installmentId}`;
    };

    useEffect(() => {
        if (isOpen && headId && installmentId) {
            loadSavedData();
        }
    }, [isOpen, headId, installmentId]);

    useEffect(() => {
        if (isOpen && headId && installmentId && rows.length > 0) {
            saveToSession();
        }
    }, [rows]);

    const loadSavedData = () => {
        try {
            const storageKey = getStorageKey();
            const savedData = sessionStorage.getItem(storageKey);

            if (savedData) {
                const parsedData: CartItem = JSON.parse(savedData);
                const restoredRows = parsedData.rows.map((row) => ({
                    ...row,
                    date: row.date ? new Date(row.date) : null
                }));
                if (restoredRows.length > 0) {
                    toast.success('Data restored from previous session');
                }
                setRows(restoredRows);
                // console.log('✅ Loaded saved data for:', { headId, installmentId }, restoredRows);
            } else {
                if (rows.length === 0 || rows[0]?.type === '') {
                    resetToDefault();
                }
                toast.warning('No Saved Data Found');
                // console.log('ℹ️ No saved data found for:', { headId, installmentId });
            }
        } catch (error) {
            console.error('Error loading data from session storage:', error);
            resetToDefault();
        }
    };

    const resetToDefault = () => {
        setRows([
            {
                id: 1,
                date: new Date(),
                type: '',
                amount: ''
            }
        ]);
    };

    const saveToSession = () => {
        try {
            const cartItem: CartItem = {
                headId,
                installmentId,
                rows: rows.map((row) => ({
                    ...row,
                    date: row.date ? row.date : null
                })),
                selectedInstallment,
                feeGroupId,
                categoryId,
                academicYearId,
                selectionType,
                timestamp: Date.now()
            };

            const storageKey = getStorageKey();
            sessionStorage.setItem(storageKey, JSON.stringify(cartItem));
        } catch (error) {
            console.error('Error saving to session storage:', error);
        }
    };

    const handleAddToCart = () => {
        saveToSession();
        toast.success(`Fine slab added to cart successfully for ${selectedInstallment}!`, {
            duration: 3000
        });
        onClose();
    };

    const handleAddRow = () => {
        const newRow = {
            id: rows.length + 1,
            date: null,
            type: '',
            amount: ''
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (id: any) => {
        if (rows.length > 1) {
            const updatedRows = rows.filter((row) => row.id !== id);
            const renumberedRows = updatedRows.map((row, index) => ({
                ...row,
                id: index + 1
            }));
            setRows(renumberedRows);
        }
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col'>
                <DialogHeader>
                    <DialogTitle className='rounded-t-lg bg-primary p-4 text-white'>Fine Slab Details</DialogTitle>
                </DialogHeader>
                <div className='flex-1 overflow-y-auto rounded-lg border p-4'>
                    <div className='mt-6 w-full overflow-x-auto rounded-md border'>
                        <div className='flex items-center justify-between p-4'>
                            <div>
                                Installment Name : <strong>{selectedInstallment}</strong>
                            </div>
                            <div className='flex gap-2'>
                                <Button variant='outline' size='sm' onClick={loadSavedData}>
                                    Reload Saved Data
                                </Button>
                            </div>
                        </div>
                        <table className='min-w-full border-collapse text-sm'>
                            <thead>
                                <tr>
                                    <th className='border p-2'>SL No</th>
                                    <th className='border p-2'>From Date</th>
                                    <th className='border p-2'>Type</th>
                                    <th className='border p-2'>Amount</th>
                                    <th className='border p-2'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, index) => (
                                    <tr key={row.id} className='border-t text-center'>
                                        <td className='border p-2'>{index + 1}</td>
                                        <td className='border p-2'>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant='outline' className='w-full justify-start text-left font-normal'>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {row.date ? format(row.date, 'PPP') : 'Select Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <Calendar
                                                        mode='single'
                                                        selected={row.date ?? undefined}
                                                        onSelect={(date) => {
                                                            const updatedRows = [...rows];
                                                            updatedRows[index].date = date ?? null;
                                                            setRows(updatedRows);
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </td>
                                        <td className='border p-2'>
                                            <Select
                                                value={row.type}
                                                onValueChange={(val) => {
                                                    const updatedRows = [...rows];
                                                    updatedRows[index].type = val;
                                                    setRows(updatedRows);
                                                }}>
                                                <SelectTrigger className='min-w-[400px] text-center'>
                                                    <SelectValue placeholder='--Select Type--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {fineTypeOptions.map((item: any) => (
                                                        <SelectItem key={item.value} value={item.value.toString()}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className='border p-2'>
                                            <input
                                                type='number'
                                                value={row.amount}
                                                onChange={(e) => {
                                                    const updatedRows = [...rows];
                                                    updatedRows[index].amount = e.target.value;
                                                    setRows(updatedRows);
                                                }}
                                                className='w-full rounded border px-2 py-1 text-center'
                                                placeholder='Enter amount'
                                            />
                                        </td>
                                        <td className='border p-2'>
                                            <div className='flex flex-col-2 items-center justify-center gap-1'>
                                                {rows.length === 1 && index === 0 ? (
                                                    <Plus
                                                        className='mt-1 h-4 w-4 cursor-pointer text-gray-500 hover:text-primary'
                                                        onClick={() => handleAddRow()}
                                                    />
                                                ) : index === rows.length - 1 ? (
                                                    <>
                                                        <Minus
                                                            className='mt-1 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500'
                                                            onClick={() => handleRemoveRow(row.id)}
                                                        />
                                                        <Plus
                                                            className='mt-1 h-4 w-4 cursor-pointer text-gray-500 hover:text-primary'
                                                            onClick={() => handleAddRow()}
                                                        />
                                                    </>
                                                ) : (
                                                    <Minus
                                                        className='mt-1 h-4 w-4 cursor-pointer text-gray-500 hover:text-red-500'
                                                        onClick={() => handleRemoveRow(row.id)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <DialogFooter className='px-6 pb-6'>
                    <Button variant='outline' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddToCart} className='gap-2'>
                        <Plus className='h-4 w-4' />
                        Add to Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
