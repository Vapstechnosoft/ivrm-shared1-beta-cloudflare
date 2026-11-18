'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { useSendGeneralSms } from '@/hooks/admission/sms/reports/useGeneralSms';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import MobileNumberInput from './mobile_number_input';
import MessagePanel from './message_panel';

export default function GeneralSmsForm() {
    const [sendSms, setSendSms] = useState(true);
    const [sendWhatsApp, setSendWhatsApp] = useState(false);
    const [numbers, setNumbers] = useState<string[]>([]);
    const [message, setMessage] = useState('');
    const [contactsFile, setContactsFile] = useState<File | null>(null);
    const [attachment, setAttachment] = useState<File | null>(null);

    const { mutate, isPending } = useSendGeneralSms();

    const reset = () => {
        setSendSms(true);
        setSendWhatsApp(false);
        setNumbers([]);
        setMessage('');
        setContactsFile(null);
        setAttachment(null);
    };

    const handleSend = () => {
        if (!sendSms && !sendWhatsApp) return toast.error('Select at least one message type');
        if (numbers.length === 0 && !contactsFile) return toast.error('Add a mobile number or choose a file');
        if (!message.trim()) return toast.error('Message is required');

        mutate(
            {
                sendSms,
                sendWhatsApp,
                mobileNumbers: numbers,
                message: message.trim(),
                contactsFile,
                whatsAppAttachment: sendWhatsApp ? attachment : null
            },
            { onSuccess: reset }
        );
    };

    return (
        <div className='space-y-6'>
            {/* Message type */}
            <div className='mx-auto flex w-full max-w-2xl items-center justify-center gap-8 rounded-lg border bg-white px-6 py-3 shadow-sm'>
                <Label>Message Type :</Label>
                <div className='flex items-center gap-2'>
                    <Checkbox id='send-sms' checked={sendSms} onCheckedChange={(v) => setSendSms(v === true)} />
                    <Label htmlFor='send-sms' className='cursor-pointer'>
                        Send SMS
                    </Label>
                </div>
                <div className='flex items-center gap-2'>
                    <Checkbox id='send-wa' checked={sendWhatsApp} onCheckedChange={(v) => setSendWhatsApp(v === true)} />
                    <Label htmlFor='send-wa' className='cursor-pointer'>
                        Send WhatsApp Message
                    </Label>
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-2'>
                <MobileNumberInput numbers={numbers} onChange={setNumbers} onFileChange={setContactsFile} />
                <MessagePanel
                    message={message}
                    onMessageChange={setMessage}
                    onAttachmentChange={setAttachment}
                    attachmentEnabled={sendWhatsApp}
                />
            </div>

            <div className='flex items-center justify-center gap-3 border-t pt-6'>
                <Button type='button' onClick={handleSend} disabled={isPending} className='gap-2'>
                    <Send className='h-4 w-4' />
                    {isPending ? 'Sending...' : 'Send SMS'}
                </Button>
                <Button type='button' variant='outline' onClick={reset} disabled={isPending}>
                    Cancel
                </Button>
            </div>
        </div>
    );
}
