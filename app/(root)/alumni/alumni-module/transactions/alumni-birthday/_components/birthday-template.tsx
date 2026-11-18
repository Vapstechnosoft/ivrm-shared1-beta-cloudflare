'use client';

import Image from 'next/image';

interface BirthdayTemplateProps {
    participant: any;
    type: string;
    variant?: 'classic' | 'premium';
}

export default function BirthdayTemplate({ participant, type, variant = 'classic' }: BirthdayTemplateProps) {
    const name = type === 'Staff' ? participant.employeeName : participant.studentName;
    const photo = type === 'Staff' ? participant.PhotoPath : participant.photoPath;
    const id = type === 'Staff' ? participant.hrmE_Id : participant.amsT_Id;

    // Template 1 (Classic)
    if (variant === 'classic') {
        return (
            <div
                id={`birthday-card-classic-${id}`}
                className='group relative h-[300px] w-[238px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl'>
                <div className='relative h-full w-full'>
                    {/* Background Image */}
                    <Image
                        src='https://vapsclg.blob.core.windows.net/files/Jan 23 A-01.jpg'
                        alt='Birthday Frame'
                        fill
                        className='object-cover'
                        crossOrigin='anonymous'
                        unoptimized
                    />

                    {/* Overlay Student Image */}
                    <div className='absolute top-[76px] left-[70px] h-[83px] w-[97px] overflow-hidden border-2 border-white/50 bg-slate-100 shadow-md'>
                        {photo ? (
                            <Image src={photo} alt={name} fill className='object-cover' crossOrigin='anonymous' unoptimized />
                        ) : (
                            <div className='flex h-full items-center justify-center text-slate-300'>
                                <span className='text-2xl'>👤</span>
                            </div>
                        )}
                    </div>

                    {/* Student Name Overlay */}
                    <div className='absolute bottom-[20%] left-0 w-full px-2 text-center'>
                        <span className='line-clamp-1 font-bold text-[#df4a00] text-[14px] drop-shadow-sm'>{name}</span>
                    </div>
                </div>
            </div>
        );
    }

    // Template 2 (Premium / With Template)
    return (
        <div
            id={`birthday-card-premium-${id}`}
            className='relative h-[300px] w-[300px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl'>
            <div className='relative h-full w-full'>
                {/* Background Image */}
                <Image
                    src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/b1a74104-2e6f-4b4d-962f-bb22ebfb8677.jpg'
                    alt='Premium Frame'
                    fill
                    className='object-cover'
                    crossOrigin='anonymous'
                    unoptimized
                />

                {/* Overlay Student Image */}
                <div className='absolute top-[78px] left-[101px] h-[83px] w-[97px] overflow-hidden rounded-sm border-2 border-white bg-slate-100 shadow-lg'>
                    {photo ? (
                        <Image
                            src={photo}
                            alt={name}
                            fill
                            className='object-cover opacity-90 transition-opacity hover:opacity-100'
                            crossOrigin='anonymous'
                            unoptimized
                        />
                    ) : (
                        <div className='flex h-full items-center justify-center text-slate-300'>
                            <span className='text-4xl'>🎂</span>
                        </div>
                    )}
                </div>

                {/* Student Name Overlay */}
                <div className='absolute bottom-[25px] left-0 w-full px-4 text-center'>
                    <h4 className='font-black text-[16px] text-slate-800 uppercase tracking-tight drop-shadow-sm'>{name}</h4>
                </div>
            </div>
        </div>
    );
}
