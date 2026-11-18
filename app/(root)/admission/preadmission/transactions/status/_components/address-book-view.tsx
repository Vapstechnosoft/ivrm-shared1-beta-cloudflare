'use client';

import React from 'react';

interface AddressBookViewProps {
    data: any[];
}

const AddressBookView = React.forwardRef<HTMLDivElement, AddressBookViewProps>(({ data }, ref) => {
    if (!data || data.length === 0) {
        return (
            <div ref={ref} className='bg-white p-5 text-center text-black'>
                No data selected for address book.
            </div>
        );
    }

    return (
        <div ref={ref} className='print-preview-container min-h-full w-full bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            margin: 10mm;
                            size: A4 portrait;
                        }
                        body {
                            visibility: hidden;
                            background: white;
                            margin: 0;
                            padding: 0;
                        }
                        .print-preview-container {
                            visibility: visible !important;
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            background: white;
                            z-index: 9999;
                            color: black;
                        }
                        .print-preview-container * {
                            visibility: visible !important;
                        }
                        .address-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            width: 100%;
                        }
                        .address-card {
                            border: 1px solid #000;
                            padding: 15px;
                            border-radius: 4px;
                            font-size: 12px;
                            break-inside: avoid;
                            background: white;
                        }
                        .header-section {
                            text-align: center;
                            padding-bottom: 20px;
                            border-bottom: 1px solid #000;
                            margin-bottom: 20px;
                        }
                    }
                `
                }}
            />

            <div className='header-section'>
                <h2 className='font-bold text-xl uppercase underline'>Address Book</h2>
                <p className='text-gray-600 text-sm'>Total Records: {data.length}</p>
            </div>

            <div className='address-grid'>
                {data.map((user, index) => (
                    <div key={index} className='address-card'>
                        <div className='mb-2 border-b pb-1 font-bold uppercase'>
                            {user.name} ({user.pasR_RegistrationNo})
                        </div>
                        <div className='space-y-1'>
                            {user.pasR_FatherName && (
                                <div>
                                    <span className='font-semibold'>S/O:</span> <span className='uppercase'>{user.pasR_FatherName}</span>
                                </div>
                            )}
                            <div className='mt-2'>
                                <span className='font-semibold'>Address:</span>
                                <br />
                                {user.pasR_ConStreet && <div>{user.pasR_ConStreet},</div>}
                                {user.pasR_ConArea && <div>{user.pasR_ConArea},</div>}
                                <div>
                                    {user.pasR_ConCity}
                                    {user.pasR_ConPincode && <span> - {user.pasR_ConPincode}</span>}
                                </div>
                            </div>
                            {user.pasR_MobileNo && <div className='mt-2 font-semibold'>Mobile: {user.pasR_MobileNo}</div>}
                            {user.pasR_emailId && <div className='text-gray-600 text-xs'>{user.pasR_emailId}</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

AddressBookView.displayName = 'AddressBookView';
export default AddressBookView;
