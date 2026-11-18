'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface AlexanderTCPrintProps {
    data: any;
}

const TCCopy = ({ student }: { student: any }) => {
    const formatDate = (dateStr: any) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return format(date, 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    const sex = student.sex || student.AMST_Sex || student.amsT_Sex || '';
    let he_she = 'He/She';
    let his_her = 'His/Her';
    let son_daughter = 'son/daughter';

    if (sex.toLowerCase() === 'male') {
        he_she = 'He';
        his_her = 'His';
        son_daughter = 'son';
    } else if (sex.toLowerCase() === 'female') {
        he_she = 'She';
        his_her = 'Her';
        son_daughter = 'daughter';
    }

    return (
        <div style={{ width: '100%', padding: '15px', boxSizing: 'border-box', position: 'relative', height: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '5px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <img
                    src={student.logo || 'https://vapsclg.blob.core.windows.net/files/3/InstitutionBackgroundImage/e67b1534-8a56-42f5-9b11-0de681bf0321.jpg'}
                    style={{ display: 'block', margin: '0 auto', width: '90%', maxWidth: '350px', height: 'auto' }}
                    alt='Header Logo'
                />
            </div>

            <div style={{ textAlign: 'center', marginTop: '0px', fontFamily: 'serif' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '5px' }}>TRANSFER CERTIFICATE</h3>
            </div>

            <div style={{ marginTop: '10px', fontSize: '13px', fontFamily: 'serif', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                    TC Serial No.{' '}
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 5px', display: 'inline-block', minWidth: '40px', textAlign: 'center' }}>
                        <strong>{student.tcno}</strong>
                    </span>
                </div>
                <div>
                    Admission/Registration No.{' '}
                    <span style={{ borderBottom: '1px dotted #000', padding: '0 5px', display: 'inline-block', minWidth: '60px', textAlign: 'center' }}>
                        <strong>{student.admno}</strong>
                    </span>
                </div>
            </div>

            <div style={{ fontSize: '14px', fontFamily: 'serif', lineHeight: 2.0, marginTop: '15px', padding: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ whiteSpace: 'nowrap', marginLeft: '20px' }}>This is to certify that&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.studentName}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;{son_daughter}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>of&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.fatherName}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;was admitted into</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>this school on the (date)&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{formatDate(student.lbldoa)}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;on a transfer from</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.transfer_from}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;and left on&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{formatDate(student.left_on_date)}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;with a</div>
                </div>

                <div>good moral character.</div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginTop: '5px' }}>
                    <div style={{ whiteSpace: 'nowrap', marginLeft: '20px' }}>{he_she} was then studying in the (in words)&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.classname}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;class of the I.C.S.E.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>stream, the school year being from April 20&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.fromyear}</strong>
                    </div>
                    <div style={{ whiteSpace: 'nowrap' }}>&nbsp;to March 20&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.toyear}</strong>
                    </div>
                </div>

                <div style={{ marginTop: '5px' }}>
                    <div style={{ marginLeft: '20px' }}>All sums due to this school on {his_her.toLowerCase()} account have been remitted or satisfactorily</div>
                    <div>arranged for.</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginTop: '5px' }}>
                    <div style={{ whiteSpace: 'nowrap', marginLeft: '20px' }}>{his_her} date of birth, according to the Admission Register is (in figures)&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{formatDate(student.lbldob)}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>(in words)&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.lbldobwords}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', width: '100%', marginTop: '5px' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>Promotion has been. ($)&nbsp;</div>
                    <div style={{ flexGrow: 1, borderBottom: '1px dotted #000', textAlign: 'center' }}>
                        <strong>{student.lblPromotion}</strong>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '20px', fontSize: '13px', fontFamily: 'serif', padding: 0 }}>
                <div style={{ float: 'left', width: '50%' }}>
                    <div style={{ marginBottom: '30px' }}>
                        Date{' '}
                        <span style={{ borderBottom: '1px dotted #000', padding: '0 5px', display: 'inline-block', minWidth: '80px', textAlign: 'center' }}>
                            <strong>{formatDate(student.todaydate)}</strong>
                        </span>
                    </div>
                    <div>
                        <strong>COUNTERSIGNED</strong>
                        <br />
                        <small>$ granted/refused/not applicable</small>
                    </div>
                </div>
                <div style={{ float: 'right', width: '50%', textAlign: 'right' }}>
                    <div style={{ marginBottom: '5px' }}>Signature ........................................</div>
                    <div>
                        (Head of the School)
                        <br />
                        School Rubber Stamp
                    </div>
                </div>
                <div style={{ clear: 'both' }}></div>
            </div>
        </div>
    );
};

export const AlexanderTCPrint = forwardRef<HTMLDivElement, AlexanderTCPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const students = Array.isArray(data.studentList) ? data.studentList : [];
    if (students.length === 0) return null;

    return (
        <div ref={ref} className='print-container bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { 
                            size: A4 landscape; 
                            margin: 0; 
                        }
                        body { 
                            margin: 0 !important; 
                            padding: 0 !important; 
                            -webkit-print-color-adjust: exact !important; 
                            print-color-adjust: exact !important; 
                            background: white !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            background: white !important;
                        }
                        .page-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 297mm !important;
                            height: 210mm !important;
                            margin: 0 !important;
                            padding: 5mm !important;
                            position: relative !important;
                            overflow: hidden !important;
                            background: white !important;
                            page-break-after: always !important;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                    }
                    .page-container {
                        width: 297mm;
                        height: 210mm;
                        margin: 0 auto;
                        padding: 5mm;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                    }
                `
                }}
            />

            {students.map((student: any, index: number) => {
                return (
                    <div key={student.amsT_Id || index} className='page-container'>
                        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                            <div style={{ flex: 1, borderRight: '1px dashed #ccc' }}>
                                <TCCopy student={student} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <TCCopy student={student} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});

AlexanderTCPrint.displayName = 'AlexanderTCPrint';
