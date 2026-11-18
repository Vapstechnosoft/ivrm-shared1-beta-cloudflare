 'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/extension/field';
import { Plus, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    numbers: string[];
    onChange: (numbers: string[]) => void;
    onFileChange: (file: File | null) => void;
}

const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile

export default function MobileNumberInput({ numbers, onChange, onFileChange }: Props) {
    const [search, setSearch] = useState('');
    const [current, setCurrent] = useState('');
    const [fileName, setFileName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const visibleNumbers = useMemo(() => numbers.filter((n) => n.includes(search.trim())), [numbers, search]);

    const addNumber = () => {
        const value = current.trim();
        if (!MOBILE_REGEX.test(value)) return toast.error('Enter a valid 10 digit mobile number');
        if (numbers.includes(value)) return toast.error('Mobile number already added');
        onChange([...numbers, value]);
        setCurrent('');
    };

    const removeNumber = (n: string) => onChange(numbers.filter((x) => x !== n));

    return (
        <div className='space-y-4 rounded-lg border bg-white p-4 shadow-sm'>
            {/* Choose File */}
            <input
                ref={fileRef}
                type='file'
                accept='.xls,.xlsx,.csv'
                className='hidden'
                onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFileName(file?.name ?? '');
                    onFileChange(file);
                }}
            />
            <Button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='h-8 w-full max-w-sm rounded-sm border border-yellow-600 bg-yellow-400 text-sm font-semibold text-black hover:bg-yellow-300'>
                {fileName || 'Choose File'}
            </Button>

            <div className='grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3'>
                <span />
                {/* Search */}
                <div className='flex'>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search mobile no...'
                        className='rounded-r-none'
                    />
                    <Button type='button' variant='outline' className='rounded-l-none border-l-0' aria-label='Search'>
                        <Search className='h-4 w-4' />
                    </Button>
                </div>

                {/* Add */}
                <Label className='whitespace-nowrap'>Mobile No.:</Label>
                <div className='flex'>
                    <Input
                        value={current}
                        inputMode='numeric'
                        maxLength={10}
                        onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addNumber();
                            }
                        }}
                        className='rounded-r-none border-primary'
                    />
                    <Button
                        type='button'
                        variant='outline'
                        onClick={addNumber}
                        className='rounded-l-none border-l-0 border-primary'
                        aria-label='Add mobile number'>
                        <Plus className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Added numbers */}
            {visibleNumbers.length > 0 && (
                <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto'>
                    {visibleNumbers.map((n) => (
                        <span key={n} className='flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm'>
                            {n}
                            <button type='button' onClick={() => removeNumber(n)} aria-label={`Remove ${n}`}>
                                <X className='h-3 w-3 text-destructive' />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
