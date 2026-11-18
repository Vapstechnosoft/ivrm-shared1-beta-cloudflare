import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className='w-full space-y-6 p-4'>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <Skeleton className='h-8 w-48' />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='flex justify-center'>
                        <div className='w-full max-w-md space-y-2'>
                            <div className='flex items-center space-x-2'>
                                <Skeleton className='h-4 w-12' />
                                <Skeleton className='h-10 w-full' />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>
                        <Skeleton className='h-6 w-24' />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='flex justify-between'>
                            <Skeleton className='h-10 w-1/3' />
                            <Skeleton className='h-10 w-24' />
                        </div>
                        <div className='space-y-2'>
                            <Skeleton className='h-12 w-full' />
                            <Skeleton className='h-12 w-full' />
                            <Skeleton className='h-12 w-full' />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
