'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { chatGPT, languageTranslator, whatsAppCall } from '@/server/intelligent-apps';
import { ChevronDown, Play, Sparkles, Square, Volume2 } from 'lucide-react';
import Script from 'next/script';
import { useEffect, useState } from 'react';

export function IntelligentAppsMenu() {
    // Force Rebuild: Intelligent Apps Menu
    const [openDialog, setOpenDialog] = useState<string | null>(null);

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant='ghost'
                        className='group flex items-center gap-2 rounded-full px-4 py-2 text-slate-600 transition-all hover:bg-orange-50 hover:text-orange-600 active:scale-95'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600'>
                            <Sparkles className='h-4 w-4' />
                        </div>
                        <span className='font-bold text-sm tracking-tight'>Intelligent Apps</span>
                        <ChevronDown className='h-3 w-3 text-muted-foreground group-hover:text-orange-600' />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                    <DropdownMenuItem onSelect={() => setOpenDialog('whatsapp')}>Whatsapp</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('chatgpt')}>ChatGPT</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('translator')}>Language Translator</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('speech')}>Text-to-Speech</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('pdf')}>PDF Converter</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('compressor')}>Media Compressor</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setOpenDialog('tour')}>360 Degree Tour</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <WhatsAppDialog open={openDialog === 'whatsapp'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <ChatGPTDialog open={openDialog === 'chatgpt'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <LanguageTranslatorDialog open={openDialog === 'translator'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <TextToSpeechDialog open={openDialog === 'speech'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <PdfConverterDialog open={openDialog === 'pdf'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <MediaCompressorDialog open={openDialog === 'compressor'} onOpenChange={(open) => !open && setOpenDialog(null)} />
            <TourDialog open={openDialog === 'tour'} onOpenChange={(open) => !open && setOpenDialog(null)} />
        </>
    );
}

// ... other components ...

function LanguageTranslatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [fromLang, setFromLang] = useState('en');
    const [toLang, setToLang] = useState('fr');
    const [inputText, setInputText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) {
            setInputText('');
            setTranslatedText('');
        }
    }, [open]);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'kn', name: 'Kannada' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'es', name: 'Spanish' },
        { code: 'ja', name: 'Japanese' },
        { code: 'zh-Hans', name: 'Chinese (Simplified)' },
        { code: 'ru', name: 'Russian' },
        { code: 'ar', name: 'Arabic' }
    ];

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        try {
            const result = await languageTranslator({
                fromlanguage: fromLang,
                tolanguage: toLang,
                fromsource: inputText,
                source: 'source' // Placeholder as per C# structure if needed
            });

            if (result.translateddata && result.translateddata.length > 0) {
                setTranslatedText(result.translateddata[0]);
            } else {
                setTranslatedText('Translation failed or no result returned.');
            }
        } catch (e) {
            setTranslatedText('Error occurred during translation.');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>Language Translator</DialogTitle>
                    <DialogDescription>Translate text between languages.</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='flex flex-col gap-2'>
                        <Label>Text to Translate</Label>
                        <Textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder='Enter text here...'
                            className='min-h-[100px]'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <Label>Translated Text</Label>
                        <div className='min-h-[100px] whitespace-pre-wrap rounded-md border bg-muted p-3 text-sm'>
                            {translatedText || <span className='text-muted-foreground italic'>Translation will appear here...</span>}
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col gap-2'>
                            <Label>From</Label>
                            <Select value={fromLang} onValueChange={setFromLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <Label>To</Label>
                            <Select value={toLang} onValueChange={setToLang}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((l) => (
                                        <SelectItem key={l.code} value={l.code}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleTranslate} disabled={loading || !inputText.trim()}>
                        {loading ? 'Translating...' : 'Translate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ChatGPTDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
        { role: 'assistant', content: 'Hi, welcome to ChatGPT! You can ask anything.' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;

        const userMessage = message;
        setMessage('');
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const result = await chatGPT({ message: userMessage });
            const aiResponse = result.ChatCompletion || 'No response';
            setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (e) {
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Error occurred' }]);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex h-[600px] flex-col gap-0 p-0 sm:max-w-[600px]'>
                <DialogHeader className='flex-shrink-0 border-b px-4 py-3'>
                    <DialogTitle className='text-center font-semibold text-lg'>AIVRM chatgpt</DialogTitle>
                </DialogHeader>

                <div className='flex-1 space-y-4 overflow-y-auto p-4'>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                    msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                }`}>
                                <p className='whitespace-pre-wrap'>{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className='flex justify-start'>
                            <div className='rounded-lg bg-muted px-4 py-2 text-muted-foreground text-sm'>Thinking...</div>
                        </div>
                    )}
                </div>

                <div className='mt-auto border-t p-4'>
                    <div className='flex items-end gap-2'>
                        <Textarea
                            placeholder='Message ChatGPT...'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className='max-h-[100px] min-h-[20px] flex-1 resize-none px-3 py-2 text-sm leading-tight'
                            rows={1}
                            style={{ height: '38px', minHeight: '38px' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                        />
                        <Button
                            size='icon'
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                            className='h-[38px] w-[38px] shrink-0 rounded-full'>
                            <svg
                                width='18'
                                height='18'
                                viewBox='0 0 24 24'
                                fill='none'
                                xmlns='http://www.w3.org/2000/svg'
                                className='text-current'>
                                <path
                                    d='M5.25 12H18.75'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                                <path
                                    d='M12 5.25L18.75 12L12 18.75'
                                    stroke='currentColor'
                                    strokeWidth='2'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                />
                            </svg>
                        </Button>
                    </div>
                    <div className='mt-2 text-center text-[10px] text-muted-foreground'>
                        ChatGPT can make mistakes. Consider checking important information.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function WhatsAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [type, setType] = useState('Birthday');
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [fields, setFields] = useState<Record<string, string>>({});

    const handleSend = async () => {
        if (!mobile) {
            alert('Mobile number is required');
            return;
        }
        setLoading(true);
        // Using 'any' to construct the DTO dynamically
        const data: any = {
            MobileNumber: mobile,
            Typedropdown: type,
            ...fields
        };
        try {
            const res = await whatsAppCall(data);
            if (res === 'success') {
                alert('Message sent successfully!');
                onOpenChange(false);
            } else {
                alert('Failed to send message.');
            }
        } catch (e) {
            alert('Error sending message');
        }
        setLoading(false);
    };

    const renderFields = () => {
        switch (type) {
            case 'Birthday':
                return (
                    <>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label className='text-right'>Name</Label>
                            <Input
                                value={fields.BirthdayName || ''}
                                onChange={(e) => setFields({ ...fields, BirthdayName: e.target.value })}
                                className='col-span-3'
                            />
                        </div>
                        <div className='grid grid-cols-4 items-center gap-4'>
                            <Label className='text-right'>Institute</Label>
                            <Input
                                value={fields.InstituteNameB || ''}
                                onChange={(e) => setFields({ ...fields, InstituteNameB: e.target.value })}
                                className='col-span-3'
                            />
                        </div>
                    </>
                );
            case 'Attendance':
                return [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Att {i}</Label>
                        <Input
                            value={fields[`Attendance${i}`] || ''}
                            onChange={(e) => setFields({ ...fields, [`Attendance${i}`]: e.target.value })}
                            className='col-span-3'
                        />
                    </div>
                ));
            case 'FeeDue':
                return (
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Due Amount</Label>
                        <Input
                            value={fields.FeeDue || ''}
                            onChange={(e) => setFields({ ...fields, FeeDue: e.target.value })}
                            className='col-span-3'
                        />
                    </div>
                );
            case 'FeeTransaction':
                return [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Trans {i}</Label>
                        <Input
                            value={fields[`FeeTransaction${i}`] || ''}
                            onChange={(e) => setFields({ ...fields, [`FeeTransaction${i}`]: e.target.value })}
                            className='col-span-3'
                        />
                    </div>
                ));
            case 'LoginCredentials':
            default:
                if (type === 'Board') return <div>No specific parameters configured for Board.</div>;
                return [1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='grid grid-cols-4 items-center gap-4'>
                        <Label className='text-right'>Cred {i}</Label>
                        <Input
                            value={fields[`LoginCredentials${i}`] || ''}
                            onChange={(e) => setFields({ ...fields, [`LoginCredentials${i}`]: e.target.value })}
                            className='col-span-3'
                        />
                    </div>
                ));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>WhatsApp Sender</DialogTitle>
                    <DialogDescription>Send template messages via WhatsApp.</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='mobile' className='text-right'>
                            Mobile
                        </Label>
                        <Input
                            id='mobile'
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            className='col-span-3'
                            placeholder='Number (e.g. 9199...)'
                        />
                    </div>
                    <div className='grid grid-cols-4 items-center gap-4'>
                        <Label htmlFor='type' className='text-right'>
                            Type
                        </Label>
                        <Select
                            value={type}
                            onValueChange={(val) => {
                                setType(val);
                                setFields({});
                            }}>
                            <SelectTrigger className='col-span-3'>
                                <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='Birthday'>Birthday</SelectItem>
                                <SelectItem value='Attendance'>Attendance</SelectItem>
                                <SelectItem value='FeeDue'>Fee Due</SelectItem>
                                <SelectItem value='FeeTransaction'>Fee Transaction</SelectItem>
                                <SelectItem value='LoginCredentials'>Login Credentials</SelectItem>
                                <SelectItem value='Board'>Board</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {renderFields()}
                </div>
                <DialogFooter>
                    <Button onClick={handleSend} disabled={loading}>
                        {loading ? 'Sending...' : 'Send'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TourDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='flex h-[600px] flex-col items-center sm:max-w-[900px]'>
                <DialogHeader className='relative w-full text-center'>
                    <DialogTitle>360 Virtual Tour</DialogTitle>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='absolute top-0 right-10'
                        onClick={() => window.open('https://www.immersivetourz.com/hutchingshighschool/index.html', '_blank')}
                        title='Open in Full Screen'>
                        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M15 3H21V9' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M9 21H3V15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M21 3L14 10' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                            <path d='M3 21L10 14' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                        </svg>
                    </Button>
                </DialogHeader>
                <div className='flex w-full flex-1 flex-col items-center justify-center p-4'>
                    <iframe
                        src='https://www.immersivetourz.com/hutchingshighschool/index.html'
                        width='100%'
                        height='100%'
                        style={{ border: 0 }}
                        allowFullScreen></iframe>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PdfConverterDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [textPreview, setTextPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getFileType = (file: File) => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type === 'text/plain') return 'text';
        return 'other';
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));

            if (selectedFile.type === 'text/plain') {
                const text = await selectedFile.text();
                setTextPreview(text.substring(0, 500)); // Preview first 500 chars
            } else {
                setTextPreview(null);
            }
        }
    };

    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
        setTextPreview(null);
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handlePreview = () => {
        if (previewUrl) {
            window.open(previewUrl, '_blank');
        }
    };

    const convertToPDF = async () => {
        if (!file) {
            alert('Please select a file');
            return;
        }

        setLoading(true);
        try {
            const { jsPDF } = await import('jspdf');

            if (file.type === 'text/plain') {
                const text = await file.text();
                const doc = new jsPDF();
                doc.setFontSize(12);
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 10, 10);
                doc.save(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
            } else if (file.type.startsWith('image/')) {
                const img = new Image();
                img.src = previewUrl!;
                await new Promise((resolve) => {
                    img.onload = resolve;
                });

                const doc = new jsPDF();
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = doc.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                doc.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight);
                doc.save(`${file.name.replace(/\.[^/.]+$/, '')}.pdf`);
            } else {
                alert('Unsupported file type. Please select text, png, or jpeg.');
            }
        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('Error creating PDF');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[700px]'>
                <DialogHeader>
                    <DialogTitle>Pdf Converter</DialogTitle>
                </DialogHeader>
                <div className='rounded-md border p-4'>
                    <div className='flex items-center justify-between gap-4'>
                        <div className='flex-1 border-r pr-4 text-center'>
                            <label
                                htmlFor='fileInput'
                                className='relative block cursor-pointer rounded-md border-2 border-dashed p-4 hover:bg-slate-50'>
                                <input
                                    id='fileInput'
                                    type='file'
                                    onChange={handleFileChange}
                                    accept='.txt,.png,.jpg,.jpeg,.jfif'
                                    className='hidden'
                                />
                                <div className='text-sm'>
                                    <span className='font-bold text-red-500'>*</span> Select .jpg, .jfif, .jpeg, .png, .txt file
                                </div>
                                {file && <div className='mt-2 font-medium text-muted-foreground text-xs'>{file.name}</div>}
                            </label>
                        </div>

                        <div className='flex min-w-[200px] flex-col items-center justify-center border-r px-6'>
                            {file ? (
                                <div
                                    className='flex cursor-pointer flex-col items-center text-center hover:opacity-80'
                                    onClick={handlePreview}
                                    title='Click to open full preview'>
                                    {getFileType(file) === 'image' && previewUrl ? (
                                        <div className='mb-2 h-20 w-20 overflow-hidden rounded border shadow-sm'>
                                            <img src={previewUrl} alt='Preview' className='h-full w-full object-cover' />
                                        </div>
                                    ) : getFileType(file) === 'text' && textPreview ? (
                                        <div className='mb-2 h-20 w-20 overflow-hidden whitespace-pre-wrap rounded border bg-slate-50 p-1 text-left font-mono text-xs shadow-sm'>
                                            {textPreview}
                                        </div>
                                    ) : (
                                        <div className='mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-lg border bg-slate-100 shadow-sm'>
                                            <svg
                                                width='32'
                                                height='32'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                                className='text-muted-foreground'>
                                                <path
                                                    d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M14 2V8H20'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M8 13H16'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M8 17H16'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M8 9H10'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </div>
                                    )}
                                    <p className='font-medium text-blue-600 text-sm underline decoration-dotted underline-offset-4'>
                                        <span className='flex items-center gap-1'>
                                            <svg width='14' height='14' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path
                                                    d='M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                            Preview {file.name.length > 15 ? file.name.substring(0, 12) + '...' : file.name}
                                        </span>
                                    </p>
                                </div>
                            ) : (
                                <div className='text-center text-muted-foreground opacity-50'>
                                    <div className='mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-lg border border-dashed bg-slate-50'>
                                        <svg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                            <path
                                                d='M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                    </div>
                                    <p className='text-sm'>No File Selected</p>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-1 justify-center pl-4'>
                            <Button
                                onClick={convertToPDF}
                                disabled={loading || !file}
                                className='bg-primary text-primary-foreground hover:bg-primary/90'>
                                {loading ? (
                                    'Converting...'
                                ) : (
                                    <>
                                        <svg
                                            width='16'
                                            height='16'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='mr-2'>
                                            <path
                                                d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M14 2V8H20'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M16 13H8'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M16 17H8'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                            <path
                                                d='M10 9H8'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'
                                            />
                                        </svg>
                                        Convert to PDF
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function MediaCompressorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
        }
    };

    const compressImage = async (file: File, quality: number): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Max dimension check (e.g., 1920)
                const maxDim = 1920;
                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Compression failed'));
                    },
                    'image/jpeg', // Force JPEG for effective compression
                    0.75 // Default 75% quality
                );
            };
            img.onerror = (err) => reject(err);
        });
    };

    const compressPdfClient = async (file: File): Promise<Blob> => {
        const self = window as any;
        if (!self.pdfjsLib || !self.jspdf) {
            throw new Error('PDF libraries are loading (0%). Please wait a moment.');
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await self.pdfjsLib.getDocument(arrayBuffer).promise;
        const { jsPDF } = self.jspdf;
        // Use 'pt' to match PDF coordinates easily
        const doc = new jsPDF({ orientation: 'p', unit: 'pt' });

        // Remove the default first page as we'll add our own with correct dimensions
        doc.deletePage(1);

        const totalPages = pdf.numPages;

        for (let i = 1; i <= totalPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.0 });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            // Compress as JPEG 60% quality
            const imgData = canvas.toDataURL('image/jpeg', 0.6);

            doc.addPage([viewport.width, viewport.height]);
            doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
        }

        return doc.output('blob');
    };

    const handleCompress = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            if (file.type.startsWith('image/')) {
                // Client-side Image Compression (Existing)
                const start = performance.now();
                const compressedBlob = await compressImage(file, 75);
                const end = performance.now();

                const originalSize = file.size;
                const compressedSize = compressedBlob.size;
                const savings = ((originalSize - compressedSize) / originalSize) * 100;

                setResult({
                    original_size_mb: (originalSize / (1024 * 1024)).toFixed(2),
                    compressed_size_mb: (compressedSize / (1024 * 1024)).toFixed(2),
                    savings_percent: savings.toFixed(1),
                    downloadUrl: URL.createObjectURL(compressedBlob),
                    filename: `compressed_${file.name.substring(0, file.name.lastIndexOf('.'))}.jpg`,
                    isClientSide: true
                });
            } else if (file.type === 'application/pdf') {
                // Client-side PDF Compression (New)
                const start = performance.now();
                const compressedBlob = await compressPdfClient(file);
                const end = performance.now();

                const originalSize = file.size;
                const compressedSize = compressedBlob.size;
                const savings = ((originalSize - compressedSize) / originalSize) * 100;

                setResult({
                    original_size_mb: (originalSize / (1024 * 1024)).toFixed(2),
                    compressed_size_mb: (compressedSize / (1024 * 1024)).toFixed(2),
                    savings_percent: savings.toFixed(1),
                    downloadUrl: URL.createObjectURL(compressedBlob),
                    filename: `compressed_${file.name}`,
                    isClientSide: true
                });
            } else {
                setError('Unsupported file type');
            }
        } catch (err: any) {
            console.error('Compression error:', err);
            setError(err.message || 'Compression failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (result && result.downloadUrl) {
            const link = document.createElement('a');
            link.href = result.downloadUrl;
            link.download = result.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleCancel = () => {
        setFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
    };

    useEffect(() => {
        if (!open) handleCancel();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[600px]'>
                <Script
                    src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
                    strategy='lazyOnload'
                    onLoad={() => {
                        if ((window as any).pdfjsLib) {
                            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
                                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                        }
                    }}
                />
                <Script src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js' strategy='lazyOnload' />
                <DialogHeader>
                    <DialogTitle>Media Compressor</DialogTitle>
                    <DialogDescription>Compress Images (Instant) and PDF Files (Server-side).</DialogDescription>
                </DialogHeader>

                <div className='grid gap-6 py-4'>
                    {!result ? (
                        <>
                            <div className='relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors hover:bg-slate-50'>
                                <input
                                    type='file'
                                    className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                                    onChange={handleFileChange}
                                    accept='image/*,.pdf'
                                />
                                {file ? (
                                    <div className='w-full text-center'>
                                        {file.type.startsWith('image/') && previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt='Preview'
                                                className='mx-auto mb-2 h-40 rounded object-contain shadow-sm'
                                            />
                                        ) : file.type === 'application/pdf' ? (
                                            <div className='mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600'>
                                                <svg
                                                    width='32'
                                                    height='32'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <path
                                                        d='M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M14 2V8H20'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M12 18V12'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M9 15H15'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className='mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100'>
                                                <svg
                                                    width='32'
                                                    height='32'
                                                    viewBox='0 0 24 24'
                                                    fill='none'
                                                    xmlns='http://www.w3.org/2000/svg'>
                                                    <path
                                                        d='M15 10L20 6V18L15 14V10Z'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M4 8H11'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                    <path
                                                        d='M4 12H11'
                                                        stroke='currentColor'
                                                        strokeWidth='2'
                                                        strokeLinecap='round'
                                                        strokeLinejoin='round'
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                        <p className='mt-2 font-medium text-sm'>{file.name}</p>
                                        <p className='text-muted-foreground text-xs'>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <div className='text-center'>
                                        <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500'>
                                            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path
                                                    d='M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M17 8L12 3L7 8'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                                <path
                                                    d='M12 3V15'
                                                    stroke='currentColor'
                                                    strokeWidth='2'
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                />
                                            </svg>
                                        </div>
                                        <p className='font-medium'>Click to upload media</p>
                                        <p className='mt-1 text-muted-foreground text-xs'>Images (JPG, PNG) or Files (PDF)</p>
                                    </div>
                                )}
                            </div>

                            {/* Controls removed */}

                            {error && <div className='rounded-md border border-red-200 bg-red-50 p-3 text-red-600 text-sm'>{error}</div>}
                        </>
                    ) : (
                        <div className='flex flex-col items-center justify-center space-y-4 py-6'>
                            <div className='zoom-in flex h-16 w-16 animate-in items-center justify-center rounded-full bg-green-100 text-green-600 duration-300'>
                                <svg width='32' height='32' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M20 6L9 17L4 12'
                                        stroke='currentColor'
                                        strokeWidth='3'
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                    />
                                </svg>
                            </div>
                            <h3 className='font-bold text-green-700 text-xl'>Compression Successful!</h3>

                            <div className='mt-4 grid w-full grid-cols-3 gap-4 text-center'>
                                <div className='rounded-lg border bg-slate-50 p-3'>
                                    <p className='text-muted-foreground text-xs uppercase tracking-wider'>Original</p>
                                    <p className='font-bold text-lg'>{result.original_size_mb} MB</p>
                                </div>
                                <div className='rounded-lg border bg-slate-50 p-3'>
                                    <p className='text-muted-foreground text-xs uppercase tracking-wider'>Compressed</p>
                                    <p className='font-bold text-green-600 text-lg'>{result.compressed_size_mb} MB</p>
                                </div>
                                <div className='rounded-lg border bg-card p-4 text-center shadow-sm'>
                                    <p className='mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wider'>Savings</p>
                                    <p
                                        className={`font-bold text-xl ${Number.parseFloat(result.savings_percent) > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                        {Number.parseFloat(result.savings_percent) <= 0 ? 'Optimized' : `${result.savings_percent}%`}
                                    </p>
                                    {Number.parseFloat(result.savings_percent) <= 0 && (
                                        <p className='mt-1 text-[10px] text-muted-foreground'>(Structure is minimal)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className='sm:justify-between'>
                    {result ? (
                        <>
                            <Button variant='outline' onClick={handleCancel}>
                                Compress Another
                            </Button>
                            <Button onClick={handleDownload} className='bg-green-600 hover:bg-green-700'>
                                Download Result
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant='outline' onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleCompress} disabled={loading || !file} className='bg-blue-600 hover:bg-blue-700'>
                                {loading ? 'Compressing...' : 'Compress Media'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TextToSpeechDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [text, setText] = useState('');

    const handleSpeak = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.0;
            utterance.rate = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Sorry, your browser does not support Text-To-Speech.');
        }
    };

    const handleStop = () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    };

    useEffect(() => {
        if (!open) {
            handleStop();
            setText('');
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        Text To Speech <Volume2 size={20} className='text-blue-500' />
                    </DialogTitle>
                    <DialogDescription>Convert your text into natural sounding speech.</DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <Textarea
                        id='textInput'
                        placeholder='Enter text or news here...!!'
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className='min-h-[150px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500'
                    />
                    <div className='flex gap-3'>
                        <Button onClick={handleSpeak} className='h-11 flex-1 bg-blue-600 hover:bg-blue-700'>
                            <Play className='mr-2 h-4 w-4 fill-current' /> Listen
                        </Button>
                        <Button
                            variant='outline'
                            onClick={handleStop}
                            className='h-11 flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700'>
                            <Square className='mr-2 h-4 w-4 fill-current' /> Stop
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
