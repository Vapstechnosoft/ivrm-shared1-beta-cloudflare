'use client';

import { format } from 'date-fns';
import React from 'react';

type Props = {
    data: any;
    selectedDate: Date | null;
};

function genderText(student: any) {
    const gender = (student?.AMST_Sex || student?.Gender || student?.gender || '').toString().toLowerCase();
    if (gender === 'male') {
        return { heOrShe: 'He', he: 'His', sodo: 'S/O' };
    }
    return { heOrShe: 'She', he: 'Her', sodo: 'D/O' };
}

const TunBridgeStudyCertificatePrint = React.forwardRef<HTMLDivElement, Props>(({ data, selectedDate }, ref) => {
    const list: any[] = data?.studentList ?? [];
    const student = list?.[0] ?? null;

    if (!student) {
        return (
            <div ref={ref} className='bg-white p-10 text-center text-gray-400'>
                No student data available for Study Certificate.
            </div>
        );
    }

    const { heOrShe, he, sodo } = genderText(student);

    const currentDate = selectedDate ?? new Date();
    const studentName = (student?.studentnam ?? student?.studentName ?? student?.stuname ?? '').toString();
    const fatherName = (student?.fathername ?? student?.fatherName ?? '').toString();
    const motherName = (student?.mothername ?? student?.motherName ?? '').toString();

    const admitedClass = student?.admitedclass ?? '';
    const presentClass = student?.presentclass ?? student?.class ?? '';
    const admitedYear = student?.admitedyear ?? '';
    const presentYear = student?.presentyear ?? student?.acadamicyear ?? '';

    const dob = student?.dob ? new Date(student.dob) : null;
    const dobWords = (student?.dobwords ?? student?.dobWords ?? '').toString();

    const religion = (student?.religion ?? '').toString();
    const casteName = (student?.caste_name ?? student?.caste_Name ?? '').toString();
    const stuMT = (student?.stumt ?? student?.stuMT ?? '').toString();

    const addressd1 = (student?.addressd1 ?? '').toString();
    const street = (student?.street ?? '').toString();
    const area = (student?.area ?? '').toString();
    const city = (student?.city ?? '').toString();
    const pincode = (student?.pincode ?? '').toString();

    const admNo = student?.admno ?? student?.admNo ?? '';
    const tcNo = student?.TCNo ?? student?.tcno ?? '';

    // Prefer dynamic logo from data if available
    const logoUrl = 'https://vapsclg.blob.core.windows.net/files/27/TBHS_Logo.png';

    return (
        <div ref={ref} className='printable-content bg-white text-black'>
            <style>{`
                    @media print {
                      @page { size: A4 portrait; margin: 12mm; }
                      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                      body { background: #fff !important; }
                    }

                    .tbhs-wrap { font-family: "Times New Roman", Times, serif; }
                    .tbhs-center { text-align: center; }
                    .tbhs-title { font-weight: 700; letter-spacing: 0.5px; }
                    .tbhs-sub { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size: 15px; }
                    .tbhs-row { display: flex; justify-content: space-between; margin-top: 14px; }
                    .tbhs-table { width: 100%; border-collapse: collapse; }
                    .tbhs-td { padding: 6px 0; vertical-align: bottom; }
                    .tbhs-dot { border-bottom: 1px dotted #000; text-transform: uppercase; font-weight: 700; text-align: center; }
                    .tbhs-label { white-space: nowrap; }
                    `}</style>

            <div className='tbhs-wrap min-h-[297mm] w-[210mm] p-8'>
                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-center'>
                                <img src={logoUrl} style={{ width: '20%', margin: '0 auto' }} alt='TBHS Logo' />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className='tbhs-center mt-2'>
                    <div className='tbhs-title text-[24px]'>TUNBRIDGE HIGH SCHOOL</div>
                    <p className='tbhs-sub mt-2 leading-relaxed'>
                        <span>(Affiliated to the Council for the Indian School Certificate Examinations, New Delhi)</span>
                        <br />
                        <span>86/2, Infantry Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001</span>
                        <br />
                        <span>Telephone: 080-25582813 / 25321785</span>
                    </p>
                </div>

                <div className='tbhs-row'>
                    <div style={{ width: '40%' }}>
                        <table className='tbhs-table'>
                            <tbody>
                                <tr>
                                    <td className='tbhs-td' style={{ textAlign: 'right', paddingRight: 8 }}>
                                        No :
                                    </td>
                                    <td className='tbhs-td' style={{ textAlign: 'left' }}>
                                        1
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style={{ width: '60%', textAlign: 'right' }}>
                        <div className='tbhs-td'>Date : {format(currentDate, 'dd MMMM, yyyy')}</div>
                    </div>
                </div>

                <div className='tbhs-center mt-6'>
                    <div className='tbhs-title text-[18px]'>STUDY CERTIFICATE</div>
                </div>

                <table className='tbhs-table mt-6'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '180px' }}>
                                This is to certify that
                            </td>
                            <td className='tbhs-td tbhs-dot'>{studentName}</td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '90px' }}>
                                {sodo} of Mr.
                            </td>
                            <td className='tbhs-td tbhs-dot'>{fatherName}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '20px', textAlign: 'center' }}>
                                &
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '55px' }}>
                                Mrs.
                            </td>
                            <td className='tbhs-td tbhs-dot'>{motherName}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '280px' }}>
                                {heOrShe} was a student of the Institution
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table mt-2'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '120px' }}>
                                From Standard
                            </td>
                            <td className='tbhs-td tbhs-dot'>{admitedClass}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '90px', textAlign: 'center' }}>
                                to Standard
                            </td>
                            <td className='tbhs-td tbhs-dot'>{presentClass}</td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '60px' }}>
                                From
                            </td>
                            <td className='tbhs-td tbhs-dot'>{admitedYear}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '40px', textAlign: 'center' }}>
                                to
                            </td>
                            <td className='tbhs-td tbhs-dot'>{presentYear}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '140px' }}>
                                academic years.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '420px' }}>
                                {he} date of birth as recorded in the school register is
                            </td>
                            <td className='tbhs-td tbhs-dot'>{dob ? format(dob, 'dd MMMM, yyyy') : ''}</td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '20px' }}>
                                (
                            </td>
                            <td className='tbhs-td tbhs-dot'>{dobWords}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '20px', textAlign: 'right' }}>
                                )
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table mt-2'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '140px' }}>
                                {heOrShe} belongs to
                            </td>
                            <td className='tbhs-td tbhs-dot' style={{ width: '160px' }}>
                                {religion}
                            </td>
                            <td className='tbhs-td tbhs-label' style={{ width: '70px', textAlign: 'center' }}>
                                Religion
                            </td>
                            <td className='tbhs-td tbhs-dot' style={{ width: '200px' }}>
                                {casteName}
                            </td>
                            <td className='tbhs-td tbhs-label' style={{ width: '260px' }}>
                                Caste and mother tongue of the
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table mt-2'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label' style={{ width: '140px' }}>
                                Candidate is
                            </td>
                            <td className='tbhs-td tbhs-dot'>{stuMT}</td>
                            <td className='tbhs-td tbhs-label' style={{ width: '360px' }}>
                                as per the Admission register of our institution
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table mt-2'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-label'>{he} Residential address as recorded in the school register is</td>
                        </tr>
                    </tbody>
                </table>

                <table className='tbhs-table'>
                    <tbody>
                        <tr>
                            <td className='tbhs-td tbhs-dot'>
                                ({addressd1 ? addressd1 : `${street}  ${area}  ${city}${pincode ? `  ${pincode}` : ''}`.trim()})
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className='mt-10' style={{ textAlign: 'right', paddingRight: 24 }}>
                    <div className='tbhs-td font-bold' style={{ borderBottom: '1px solid transparent' }}>
                        Principal
                    </div>
                </div>

                <div className='mt-6'>
                    <table className='tbhs-table' style={{ width: '55%' }}>
                        <tbody>
                            <tr>
                                <td className='tbhs-td tbhs-label' style={{ width: '150px', textAlign: 'right', paddingRight: 10 }}>
                                    Admission No.:
                                </td>
                                <td className='tbhs-td tbhs-dot'>{admNo}</td>
                            </tr>
                            <tr>
                                <td className='tbhs-td tbhs-label' style={{ width: '150px', textAlign: 'right', paddingRight: 10 }}>
                                    TC No.:
                                </td>
                                <td className='tbhs-td tbhs-dot'>{tcNo}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

TunBridgeStudyCertificatePrint.displayName = 'TunBridgeStudyCertificatePrint';

export default TunBridgeStudyCertificatePrint;
