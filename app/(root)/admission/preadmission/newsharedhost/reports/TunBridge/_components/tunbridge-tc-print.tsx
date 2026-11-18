'use client';

import { format } from 'date-fns';
import React from 'react';

type Props = {
    reportData: any;
};

const fmt = (d: unknown, pattern: string) => {
    if (!d) return '';
    try {
        return format(new Date(d as string | number | Date), pattern);
    } catch {
        return String(d);
    }
};

export const TunBridgeTcPrint = React.forwardRef<HTMLDivElement, Props>(({ reportData }, ref) => {
    const list = reportData?.result ?? reportData?.studentTCList ?? reportData?.studentTcList ?? [];
    const tc = list?.[0] ?? {};
    const prev = reportData?.previousschool?.[0];

    console.log('tchjbjh', tc);
    // Data Mapping from new JSON structure
    const tcno = tc.astc_tcno ?? tc.astC_TCNO ?? tc.astC_TCNo ?? '';
    const stcsno = tc.govtno ?? '';
    const admno = tc.amst_admno ?? tc.amsT_AdmNo ?? '';
    const studentFullname = (tc.studentname ?? `${tc.amsT_FirstName ?? ''} ${tc.amsT_MiddleName ?? ''} ${tc.amsT_LastName ?? ''}`.trim())
        .toString()
        .toUpperCase();

    const lblfathername = tc.amst_fathername ?? tc.amsT_FatherName ?? '';
    const lblmothername = tc.amst_mothername ?? tc.amsT_MotherName ?? '';
    const lbldoa = tc.amst_date ?? tc.amsT_Date;
    const laststudied = tc.last_class_studied ?? tc.Last_Class_Studied ?? tc.last_Class_Studied ?? '';
    const previousschoolname = (prev?.amstpS_PrvSchoolName ?? '').toString().toUpperCase();
    const last_date_attended = tc.astc_lastattendeddate ?? tc.astC_LastAttendedDate;
    const lblconduct = tc.astc_conduct ?? tc.astC_Conduct ?? '';
    const classname = tc.classname ?? '';
    const lbldob = tc.amst_dob ?? tc.amsT_DOB;
    const lbldobwords = tc.amst_dob_words ?? tc.amsT_DOB_Words ?? '';
    const studcaste = tc.caste ?? '';
    const lblreligioncaste = tc.religion ?? '';
    const AMST_MotherTongue = tc.stumt ?? tc.mediumofinstruction ?? tc.AMST_MotherTongue ?? '';
    const lblPromotion = tc.qualificlass ?? '';
    const todaydate = tc.astc_tcissuedate ?? tc.astC_TCIssueDate ?? tc.tcdatess;
    const jointclass = tc.jointclass ?? '';

    // Prefer dynamic logo from data if available
    const logoUrl = 'https://vapsclg.blob.core.windows.net/files/27/TBHS_Logo.png';

    return (
        <div ref={ref} id='TunBridgeTcReport' className='tunbridge-tc-print bg-white text-black'>
            <style>{`
              .tunbridge-tc-print { 
                font-family: "Times New Roman", Times, serif; 
                font-size: 16px; 
                line-height: 1.6;
                padding: 40px; 
                width: 210mm; 
                min-height: 297mm; 
                margin: 0 auto;
                box-sizing: border-box;
                background-color: white;
                color: black;
              }
              .tunbridge-tc-print .dotted-underline {
                border-bottom: 1.5px dotted #000;
                text-align: center;
                font-weight: 700;
                padding: 0 8px;
                min-height: 24px;
                display: inline-block;
              }
              .tunbridge-tc-print .flex-row-item {
                 display: flex;
                 align-items: flex-end;
                 margin-bottom: 8px;
              }
              @media print {
                @page { 
                    size: A4 portrait; 
                    margin: 0; 
                }
                body {
                  background-color: white !important;
                  -webkit-print-color-adjust: exact !important;
                }
                .tunbridge-tc-print { 
                  padding: 40px !important; 
                  width: 210mm !important; 
                  height: 297mm !important; 
                  margin: 0 !important;
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                  background: white !important;
                  color: black !important;
                  overflow: hidden !important;
                }
                .tunbridge-tc-print * {
                  visibility: visible !important;
                  opacity: 1 !important;
                  print-color-adjust: exact !important;
                  -webkit-print-color-adjust: exact !important;
                }
              }
            `}</style>

            <div className='mb-2 text-center'>
                <h2 className='font-bold text-[24px] tracking-tight'>TUNBRIDGE HIGH SCHOOL</h2>
                <div className='mt-1 font-medium text-[14px] leading-tight'>
                    <p>(Affiliated to the Council for the Indian School Certificate Examinations, New Delhi)</p>
                    <p>86/2, Infantry Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001</p>
                    <p>Telephone: 080-25582813 / 25321785</p>
                </div>
            </div>

            <div className='mt-8 flex items-start justify-between px-4 text-[15px]'>
                <div className='w-[30%] space-y-2'>
                    <p>
                        DISE Code <b>29280601364</b>
                    </p>
                    <p>
                        TC no : <b>{tcno}</b>
                    </p>
                    <p className='whitespace-nowrap'>
                        STS no.: <b>{stcsno}</b>
                    </p>
                </div>
                <div className='-mt-2 flex w-[40%] justify-center'>
                    <img src={logoUrl} alt='TBHS' style={{ width: 140 }} />
                </div>
                <div className='w-[30%] space-y-2 text-right'>
                    <p>
                        CISCE School Code: <b>KA 025</b>
                    </p>
                    <p>
                        Admission No : <b>{admno}</b>
                    </p>
                </div>
            </div>

            <h2 className='mt-10 mb-8 text-center font-bold text-[22px] uppercase tracking-widest'>TRANSFER CERTIFICATE</h2>

            <section className='mt-4 px-2'>
                {/* Row 1 */}
                <div className='flex-row-item'>
                    <span className='mr-2 whitespace-nowrap'>This is to certify that</span>
                    <div className='dotted-underline flex-1'>{studentFullname}</div>
                </div>

                {/* Row 2 */}
                <div className='flex-row-item'>
                    <span className='mr-2 whitespace-nowrap'>Son/Daughter of Mr.</span>
                    <div className='dotted-underline flex-1'>{lblfathername}</div>
                    <span className='ml-2 font-bold'>&</span>
                </div>

                {/* Row 3 */}
                <div className='flex-row-item'>
                    <span className='mr-2 whitespace-nowrap'>Mrs.</span>
                    <div className='dotted-underline flex-1'>{lblmothername}</div>
                    <span className='ml-2 whitespace-nowrap'>was admitted into this school</span>
                </div>

                {/* Row 4 */}
                <div className='flex-row-item'>
                    <span className='mr-1 whitespace-nowrap'>on</span>
                    <div className='dotted-underline flex-1'>{fmt(lbldoa, 'dd/MM/yyyy')}</div>
                    <span className='mx-2'>in</span>
                    <div className='dotted-underline w-[120px]'>{jointclass}</div>
                    <span className='ml-2 whitespace-nowrap'>on a Transfer Certificate from</span>
                </div>

                {/* Row 5 */}
                <div className='-mt-1 flex-row-item leading-none'>
                    <span className='mr-1'>(</span>
                    <div className='dotted-underline flex-1'>{previousschoolname}</div>
                    <span className='ml-1'>)</span>
                </div>

                {/* Row 6 */}
                <div className='flex-row-item'>
                    <span className='mr-2 whitespace-nowrap'>He/She left on the</span>
                    <div className='dotted-underline w-[200px]'>{fmt(last_date_attended, 'dd-MM-yyyy')}</div>
                    <span className='mx-2'>with a</span>
                    <div className='dotted-underline w-[120px] font-bold uppercase'>{lblconduct}</div>
                    <span className='ml-2'>character.</span>
                </div>

                {/* Row 7 */}
                <div className='flex-row-item'>
                    <span className='mr-2 whitespace-nowrap'>He/She was then studying in</span>
                    <div className='dotted-underline w-[120px]'>{classname}</div>
                    <div className='flex-1 text-right font-medium'>All sums due to this school</div>
                </div>

                {/* Row 8 */}
                <div className='mb-3 flex w-full items-end'>
                    <span>On his / her account have been paid.</span>
                </div>

                {/* Row 9 */}
                <div className='mb-3 flex w-full items-end'>
                    <span className='mr-2 whitespace-nowrap'>His/her date of birth as recorded in the school register is</span>
                    <div className='dotted-underline flex-1'>{fmt(lbldob, 'dd/MM/yyyy')}</div>
                </div>

                {/* Row 10 */}
                <div className='mb-3 flex w-full items-end'>
                    <span className='mr-1'>(</span>
                    <div className='dotted-underline flex-1'>{lbldobwords}</div>
                    <span className='ml-1'>)</span>
                </div>

                {/* Row 11 */}
                <div className='mb-3 flex w-full items-end'>
                    <span className='mr-2 whitespace-nowrap'>He/She belongs to</span>
                    <div className='dotted-underline w-[180px] uppercase'>{studcaste}</div>
                    <span className='mx-2'>Caste,</span>
                    <div className='dotted-underline w-[180px] uppercase'>{lblreligioncaste}</div>
                    <span className='ml-2'>Religon.</span>
                </div>

                {/* Row 12 */}
                <div className='mb-3 flex w-full items-end'>
                    <span className='mr-2 whitespace-nowrap'>His/Her mother tongue is</span>
                    <div className='dotted-underline w-[120px]'>{AMST_MotherTongue}</div>
                    <span className='mx-2'>Promotion</span>
                    <div className='dotted-underline flex-1 uppercase'>{lblPromotion}</div>
                </div>

                <div className='mt-12 flex items-end justify-between px-4'>
                    <div className='text-[17px]'>
                        Date : <b>{fmt(todaydate, 'dd/MM/yyyy')}</b>
                    </div>
                    <div className='w-[250px] border-black border-b border-dotted' />
                </div>
            </section>
        </div>
    );
});

TunBridgeTcPrint.displayName = 'TunBridgeTcPrint';
