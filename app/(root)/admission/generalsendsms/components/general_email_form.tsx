 'use client';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import EmailContentPanel, { type EmailContent } from './email_content_panel';
import { useSendGeneralEmail } from '@/hooks/admission/sms/reports/useGeneralSms';
import EmailInput from './email-input';

const EMPTY: EmailContent = { subject: '', header: '', body: '', footer: '', footerDetails: '' };

export default function GeneralEmailForm() {
    const [emails, setEmails] = useState<string[]>([]);
    const [content, setContent] = useState<EmailContent>(EMPTY);
    const [contactsFile, setContactsFile] = useState<File | null>(null);
    const [attachmentEnabled, setAttachmentEnabled] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);

    const { mutate, isPending } = useSendGeneralEmail();

    const reset = () => {
        setEmails([]);
        setContent(EMPTY);
        setContactsFile(null);
        setAttachmentEnabled(false);
        setAttachment(null);
    };

    const handleSend = () => {
        if (emails.length === 0 && !contactsFile) return toast.error('Add an email address or choose a file');
        if (!content.subject.trim()) return toast.error('Subject is required');
        if (!content.header.trim()) return toast.error('Header is required');
        if (!content.body.trim()) return toast.error('Email body is required');
        if (attachmentEnabled && !attachment) return toast.error('Browse a file or untick Add Attachment');

        mutate(
            {
                emails,
                subject: content.subject.trim(),
                header: content.header.trim(),
                body: content.body.trim(),
                footer: content.footer.trim(),
                footerDetails: content.footerDetails.trim(),
                contactsFile,
                attachment: attachmentEnabled ? attachment : null
            },
            { onSuccess: reset }
        );
    };

    return (
        <div className='space-y-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
                <div className='self-start'>
                    <EmailInput emails={emails} onChange={setEmails} onFileChange={setContactsFile} />
                </div>
                <EmailContentPanel
                    value={content}
                    onChange={setContent}
                    onAttachmentChange={setAttachment}
                    attachmentEnabled={attachmentEnabled}
                    onAttachmentEnabledChange={setAttachmentEnabled}
                />
            </div>

            <div className='flex items-center justify-center gap-3 border-t pt-6'>
                <Button type='button' onClick={handleSend} disabled={isPending} className='gap-2'>
                    <Send className='h-4 w-4' />
                    {isPending ? 'Sending...' : 'Send'}
                </Button>
                <Button type='button' variant='outline' onClick={reset} disabled={isPending}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
