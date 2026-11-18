 'use client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';

interface Props {
    message: string;
    onMessageChange: (v: string) => void;
    onAttachmentChange: (file: File | null) => void;
    attachmentEnabled: boolean;
}

export default function MessagePanel({ message, onMessageChange, onAttachmentChange, attachmentEnabled }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');

    return (
        <div className='space-y-4 rounded-lg border bg-white p-4 shadow-sm'>
            <div className='grid grid-cols-[auto_1fr] items-start gap-4'>
                <Label className='pt-2'>
                    Message : <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    placeholder='Please write your message here'
                    rows={7}
                    className='resize-y'
                />
            </div>

            <div className='grid grid-cols-[auto_1fr] items-center gap-4'>
                <Label>File Attachment For WhatsApp :</Label>
                <input
                    ref={fileRef}
                    type='file'
                    className='hidden'
                    onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setFileName(file?.name ?? '');
                        onAttachmentChange(file);
                    }}
                />
                <Button
                    type='button'
                    disabled={!attachmentEnabled}
                    onClick={() => fileRef.current?.click()}
                    className='h-8 w-fit min-w-40 rounded-sm bg-blue-700 text-sm font-semibold hover:bg-blue-600'>
                    {fileName || 'Browse File'}
                </Button>
            </div>
        </div>
    );
}
