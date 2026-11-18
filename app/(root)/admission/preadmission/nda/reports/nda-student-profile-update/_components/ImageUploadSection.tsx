import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNdaUploadProfilePic } from '@/hooks/admission/preadmission/useNdaStudentProfileUpdate';
import { cn } from '@/lib/utils';
import { Camera, Trash2, Upload, User } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadSectionProps {
    label: string;
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    borderColor?: string;
    statusLabel?: string;
    statusColor?: string;
    variant?: 'default' | 'minimal';
}

export const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
    label,
    value,
    onChange,
    placeholder = 'Upload Photo',
    borderColor = 'border-primary',
    statusLabel,
    statusColor = 'text-black',
    variant = 'default'
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { mutateAsync: uploadPic, isPending: isUploading } = useNdaUploadProfilePic();
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

    const isMinimal = variant === 'minimal';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            toast.error('Please upload a valid image file (JPEG/JPG/PNG)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            // 5MB limit matching legacy
            toast.error('Image size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64String = reader.result as string;

            try {
                const res = await uploadPic({ file: [base64String] });
                if (res) {
                    const uploadedUrl = typeof res === 'string' ? res : (res as any).data;
                    onChange(uploadedUrl);
                    setPreviewUrl(base64String);
                    toast.success(`${label} uploaded successfully`);
                }
            } catch (error) {
                console.error(`Error uploading ${label}:`, error);
                toast.error(`Failed to upload ${label}`);
            }
        };
        reader.onerror = (error) => {
            console.error(`reader error ${label}:`, error);
            toast.error(`Failed to read ${label}`);
        };
    };

    if (isMinimal) {
        return (
            <div className='group flex h-full flex-col overflow-hidden rounded-xl border-2 border-primary/20 bg-white shadow-sm'>
                {/* Photo Box */}
                <div
                    className={cn(
                        'relative flex aspect-square items-center justify-center border-primary/10 border-b bg-neutral-50',
                        isUploading ? 'animate-pulse' : ''
                    )}>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt={label}
                            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        />
                    ) : (
                        <div className='flex flex-col items-center gap-2 opacity-10'>
                            <User className='h-12 w-12' />
                            <span className='font-black text-[10px] uppercase'>No Image</span>
                        </div>
                    )}
                    {isUploading && (
                        <div className='absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
                            <Spinner className='h-5 w-5 text-primary' />
                        </div>
                    )}
                </div>

                {/* Blue Banner Button */}
                <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className='flex w-full items-center justify-center gap-2 bg-[#3c8dbc]/90 py-2.5 font-bold text-[10px] text-white uppercase tracking-widest transition-colors hover:bg-[#3c8dbc]'>
                    <Upload className='h-3 w-3' />
                    {label}
                </button>
                <input type='file' ref={fileInputRef} onChange={handleFileChange} className='hidden' accept='image/*' />
            </div>
        );
    }

    return (
        <div className='group flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-gradient-to-br from-background to-accent/20 p-4 shadow-inner transition-all duration-300 hover:shadow-lg'>
            <span className='font-semibold text-primary/80 text-sm uppercase tracking-wider'>{label}</span>

            <div
                className={cn(
                    'relative flex h-56 w-48 items-center justify-center overflow-hidden rounded-xl border-2 bg-muted transition-all duration-500',
                    borderColor,
                    isUploading ? 'animate-pulse' : ''
                )}>
                {previewUrl ? (
                    <img src={previewUrl} alt={label} className='h-full w-full object-cover' />
                ) : (
                    <div className='flex flex-col items-center gap-2 text-muted-foreground'>
                        <User className='h-12 w-12 opacity-20' />
                        <span className='font-medium text-xs italic opacity-50'>No Image</span>
                    </div>
                )}

                {isUploading && (
                    <div className='absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm'>
                        <Spinner className='h-8 w-8 text-primary' />
                    </div>
                )}

                <div className='absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                    <Button
                        size='icon'
                        variant='secondary'
                        className='h-10 w-10 rounded-full'
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        type='button'>
                        <Upload className='h-5 w-5' />
                    </Button>
                    {previewUrl && (
                        <Button
                            size='icon'
                            variant='destructive'
                            className='h-10 w-10 rounded-full'
                            onClick={() => {
                                setPreviewUrl(null);
                                onChange('');
                            }}
                            disabled={isUploading}
                            type='button'>
                            <Trash2 className='h-5 w-5' />
                        </Button>
                    )}
                </div>
            </div>

            <input type='file' ref={fileInputRef} onChange={handleFileChange} className='hidden' accept='image/*' />

            <Button
                variant='outline'
                size='sm'
                className='w-full rounded-full border-2 border-dashed transition-all duration-300 hover:border-solid hover:bg-primary hover:text-primary-foreground'
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                type='button'>
                <Camera className='mr-2 h-4 w-4' />
                {previewUrl ? 'Change Photo' : 'Upload Photo'}
            </Button>

            {statusLabel && (
                <div className='mt-2 text-center'>
                    <p className={cn('font-bold text-xs uppercase', statusColor)}>STATUS: {statusLabel}</p>
                </div>
            )}
        </div>
    );
};
