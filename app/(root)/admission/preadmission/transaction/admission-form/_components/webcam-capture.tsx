'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Camera, Check, RefreshCw, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Webcam from 'react-webcam';

interface WebcamCaptureProps {
    onCapture: (image: string) => void;
    trigger?: React.ReactNode;
}

const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user'
};

export function WebcamCapture({ onCapture, trigger }: WebcamCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    const handleSave = () => {
        if (imgSrc) {
            onCapture(imgSrc);
            setIsOpen(false);
            setImgSrc(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant='outline' className='flex items-center gap-2'>
                        <Camera className='h-4 w-4' />
                        Take Photo
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <DialogTitle>Capture Student Photo</DialogTitle>
                </DialogHeader>
                <div className='mt-4 flex flex-col items-center gap-4'>
                    <div className='relative aspect-video w-full overflow-hidden rounded-lg border-2 border-primary/20 bg-muted'>
                        {!imgSrc ? (
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat='image/jpeg'
                                videoConstraints={videoConstraints}
                                className='h-full w-full object-cover'
                            />
                        ) : (
                            <img src={imgSrc} alt='captured' className='h-full w-full object-cover' />
                        )}
                    </div>

                    <div className='flex w-full justify-center gap-4'>
                        {!imgSrc ? (
                            <Button onClick={capture} className='w-32 gap-2'>
                                <Camera className='h-4 w-4' />
                                Capture
                            </Button>
                        ) : (
                            <>
                                <Button variant='outline' onClick={retake} className='w-32 gap-2'>
                                    <RefreshCw className='h-4 w-4' />
                                    Retake
                                </Button>
                                <Button onClick={handleSave} className='w-32 gap-2'>
                                    <Check className='h-4 w-4' />
                                    Use Photo
                                </Button>
                            </>
                        )}
                        <Button
                            variant='ghost'
                            onClick={() => {
                                setIsOpen(false);
                                setImgSrc(null);
                            }}
                            className='w-32 gap-2'>
                            <X className='h-4 w-4' />
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
