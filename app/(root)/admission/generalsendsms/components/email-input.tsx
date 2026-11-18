 'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Mail, Plus, Search, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    emails: string[];
    onChange: (emails: string[]) => void;
    onFileChange: (file: File | null) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailInput({ emails, onChange, onFileChange }: Props) {
    const [search, setSearch] = useState('');
    const [current, setCurrent] = useState('');
    const [fileName, setFileName] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const visibleEmails = useMemo(
        () => emails.filter((e) => e.toLowerCase().includes(search.trim().toLowerCase())),
        [emails, search]
    );

    const addEmail = () => {
        const value = current.trim().toLowerCase();
        if (!EMAIL_REGEX.test(value)) return toast.error('Enter a valid email address');
        if (emails.includes(value)) return toast.error('Email already added');
        onChange([...emails, value]);
        setCurrent('');
    };

    return (
        <div className='space-y-4 rounded-lg border bg-white p-4 shadow-sm'>
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
                <div className='flex'>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder='Search email ...'
                        className='rounded-r-none'
                    />
                    <Button type='button' variant='outline' className='rounded-l-none border-l-0' aria-label='Search'>
                        <Search className='h-4 w-4' />
                    </Button>
                </div>

                <Label>EMAIL:</Label>
                <div className='flex'>
                    <span className='flex items-center rounded-l-md border border-r-0 border-primary px-3'>
                        <Mail className='h-4 w-4' />
                    </span>
                    <Input
                        type='email'
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addEmail();
                            }
                        }}
                        className='rounded-none border-primary'
                    />
                    <Button
                        type='button'
                        variant='outline'
                        onClick={addEmail}
                        className='rounded-l-none border-l-0 border-primary'
                        aria-label='Add email'>
                        <Plus className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {visibleEmails.length > 0 && (
                <div className='flex max-h-32 flex-wrap gap-2 overflow-y-auto'>
                    {visibleEmails.map((e) => (
                        <span key={e} className='flex items-center gap-1 rounded-full border bg-muted px-3 py-1 text-sm'>
                            {e}
                            <button type='button' onClick={() => onChange(emails.filter((x) => x !== e))} aria-label={`Remove ${e}`}>
                                <X className='h-3 w-3 text-destructive' />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
