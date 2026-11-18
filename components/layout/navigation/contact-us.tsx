'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone } from 'lucide-react';
import { useState } from 'react';

export function ContactUs() {
    const [openDialog, setOpenDialog] = useState(false);

    return (
        <>
            <Button
                variant='ghost'
                className='group flex h-10 w-10 items-center justify-center rounded-full p-0 text-slate-600 transition-all hover:bg-orange-50 hover:text-orange-600 active:scale-95'
                onClick={() => setOpenDialog(true)}
                title='Contact Us'
            >
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-orange-100 group-hover:text-orange-600'>
                    <Phone className='h-4 w-4' />
                </div>
            </Button>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className='sm:max-w-[400px]'>
                    <DialogHeader className='text-center'>
                        <DialogTitle className='text-xl'>Contact Support</DialogTitle>
                        <DialogDescription>
                            Need help? Reach out to our support team directly.
                        </DialogDescription>
                    </DialogHeader>
                    <div className='flex flex-col items-center justify-center gap-3 py-6'>
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                            <Phone size={24} className="fill-current" />
                        </div>
                        <a href="tel:01206901888" className="text-2xl font-bold tracking-wider text-primary transition-colors hover:text-primary/80 hover:underline">
                            0120 690 1888
                        </a>
                        <p className="font-medium text-muted-foreground text-sm">Toll-Free Number</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
