import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function LoadingModal({ open }: { open: boolean }) {
    return (
        <Dialog open={open}>
            <DialogContent
                className='max-w-[350px] border-none bg-transparent p-0 shadow-none [&>button]:hidden'
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}>
                <div className='flex flex-col items-center justify-center space-y-6 rounded-2xl border border-primary/20 bg-background p-8 shadow-2xl'>
                    <div className='relative'>
                        <div className='-inset-4 absolute animate-pulse rounded-full bg-primary/10' />
                        <Loader2 className='relative z-10 h-16 w-16 animate-spin text-primary' />
                    </div>
                    <div className='space-y-2 text-center'>
                        <h3 className='font-semibold text-xl tracking-tight'>Processing Calculation</h3>
                        <p className='text-muted-foreground text-sm'>Please wait, marks are being calculated...</p>
                        <div className='flex justify-center gap-1 pt-2'>
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
                            <div className='h-1.5 w-1.5 animate-bounce rounded-full bg-primary' />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
