 'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRef, useState } from 'react';

export interface EmailContent {
    subject: string;
    header: string;
    body: string;
    footer: string;
    footerDetails: string;
}

interface Props {
    value: EmailContent;
    onChange: (v: EmailContent) => void;
    onAttachmentChange: (file: File | null) => void;
    attachmentEnabled: boolean;
    onAttachmentEnabledChange: (v: boolean) => void;
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className='grid grid-cols-[7rem_1fr] items-start gap-4'>
            <Label className='pt-2'>
                {label} {required && <span className='text-red-500'>*</span>}
            </Label>
            {children}
        </div>
    );
}

export default function EmailContentPanel({
    value,
    onChange,
    onAttachmentChange,
    attachmentEnabled,
    onAttachmentEnabledChange
}: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState('');
    const set = (k: keyof EmailContent) => (v: string) => onChange({ ...value, [k]: v });

    return (
        <div className='space-y-3 rounded-lg border bg-white p-4 shadow-sm'>
            <Row label='Subject:' required>
                <Input value={value.subject} onChange={(e) => set('subject')(e.target.value)} />
            </Row>
            <Row label='Header:' required>
                <Input value={value.header} onChange={(e) => set('header')(e.target.value)} placeholder='Ex. Dear Parents,' />
            </Row>
            <Row label='Email Body :' required>
                <Textarea
                    value={value.body}
                    onChange={(e) => set('body')(e.target.value)}
                    placeholder='Please write your message here'
                    rows={6}
                />
            </Row>
            <Row label='Footer:'>
                <Input value={value.footer} onChange={(e) => set('footer')(e.target.value)} placeholder='Ex. Thanking you,' />
            </Row>
            <Row label='Footer Details:'>
                <Textarea value={value.footerDetails} onChange={(e) => set('footerDetails')(e.target.value)} rows={3} />
            </Row>

            <div className='flex flex-wrap items-center justify-center gap-4 rounded-md border px-4 py-2 shadow-sm'>
                <div className='flex items-center gap-2'>
                    <Checkbox
                        id='add-attachment'
                        checked={attachmentEnabled}
                        onCheckedChange={(v) => {
                            onAttachmentEnabledChange(v === true);
                            if (v !== true) {
                                setFileName('');
                                onAttachmentChange(null);
                            }
                        }}
                    />
                    <Label htmlFor='add-attachment' className='cursor-pointer uppercase'>
                        Add Attachment
                    </Label>
                </div>
                {attachmentEnabled && (
                    <>
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
                            onClick={() => fileRef.current?.click()}
                            className='h-8 rounded-sm bg-blue-700 text-sm font-semibold hover:bg-blue-600'>
                            {fileName || 'Browse File'}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
