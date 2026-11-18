'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/**
 * TBSchoolPrimary Report List Component
 * Supports two distinct modes:
 * 1. REPORT: Table with focus areas and emoji-based marks.
 * 2. TEMPLATE: High-fidelity Performance Report Card with signatures and attendance.
 */

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const rawData = data?.data || data || {};

    const { getstudentdetails = [], getstudentwisesubjectlist = [], getstudentwiseattendancedetails = [], uniqueSubjects = [] } = rawData;

    if (!getstudentdetails || getstudentdetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No report data found for the selected criteria.
            </div>
        );
    }

    const reportMode = params.reportMode || 'report';

    const getEmoji = (score: number) => {
        if (score === 1) return '🤩'; // &#129321;
        if (score === 2) return '😊'; // &#128522;
        if (score === 3) return '😃'; // &#128515;
        return '';
    };

    return (
        <div className='mx-auto w-full max-w-[1200px]'>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='report-print-area'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 5mm; }
                        body { visibility: hidden; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        #report-print-area, #report-print-area * { visibility: visible; }
                        #report-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                        .no-print { display: none !important; }
                        .page-break { page-break-after: always; }
                    }
                    .report-card { font-family: 'Poppins', sans-serif; color: #000; width: 100%; margin: 0 auto; box-sizing: border-box; }
                    .primary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #000; font-size: 13px; }
                    .primary-table th, .primary-table td { border: 1px solid #000; padding: 6px; text-align: center; }
                    .text-left { text-align: left !important; }
                    .bg-transparent { background-color: transparent !important; }
                    
                    /* Template Specific Styles */
                    .template-container { display: flex; flex-wrap: wrap; gap: 2%; min-height: 9.5in; border: 1px solid #0043ff; padding: 15px; position: relative; margin-bottom: 20px; }
                    .column-half { width: 48.5%; position: relative; }
                    .divider { width: 1px; border-left: 1px dashed #ccc; }
                    .header-logo { width: 80px; margin: 0 auto; display: block; }
                    .photo-box { width: 100px; height: 100px; border: 1px solid #5cb7ff; margin: 10px auto; overflow: hidden; }
                    .photo-box img { width: 100%; height: 100%; object-fit: cover; }
                    .signature-row { display: flex; justify-content: space-between; position: absolute; bottom: 10px; width: 100%; font-size: 10px; }
                    .sig-item { text-align: center; border-top: 1px solid #000; width: 30%; padding-top: 5px; }
                    .emoji-span { font-size: 20px; }
                `
                    }}
                />

                {reportMode === 'report'
                    ? /* Mode: REPORT (Emoji Table) */
                      getstudentdetails.map((student: any, idx: number) => (
                          <div key={student.AMST_Id} className={`report-card ${idx > 0 ? 'page-break' : ''} p-4`}>
                              <table className='primary-table'>
                                  <thead>
                                      <tr className='bg-transparent font-bold'>
                                          <th colSpan={2}>TUNBRIDGE HIGH SCHOOL</th>
                                          <th colSpan={params.selectedExamsDetails?.length + 1}>AY {params.academicYearName}</th>
                                      </tr>
                                      <tr className='bg-gray-100 font-bold'>
                                          <td colSpan={params.selectedExamsDetails?.length + 3} className='px-4 py-2 text-left'>
                                              NAME: {student.studentname} | CLASS: {params.classname} | SECTION: {params.sectionname}
                                          </td>
                                      </tr>
                                      <tr className='font-bold'>
                                          <th rowSpan={2} style={{ width: '40px' }}>
                                              #
                                          </th>
                                          <th rowSpan={2} style={{ width: '200px' }}>
                                              FOCUS AREA
                                          </th>
                                          <th rowSpan={2}>LEARNING OUTCOMES</th>
                                          {params.selectedExamsDetails?.map((ex: any) => (
                                              <th key={ex.EME_Id}>{ex.EME_ExamName}</th>
                                          ))}
                                      </tr>
                                      <tr>
                                          <td colSpan={params.selectedExamsDetails?.length} className='text-center'>
                                              <span className='emoji-span'>🤩 😊 😃</span>
                                          </td>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {uniqueSubjects
                                          .filter((s: any) => s.AMST_Id === student.AMST_Id)
                                          .map((subj: any, sIdx: number) => {
                                              const outcomes = getstudentwisesubjectlist.filter(
                                                  (sl: any) => sl.AMST_Id === student.AMST_Id && sl.ISMS_Id === subj.ISMS_Id
                                              );
                                              const firstOutcome = outcomes[0] || {};
                                              return (
                                                  <tr key={subj.ISMS_Id}>
                                                      <td>{sIdx + 1}</td>
                                                      <td className='text-left font-bold'>{subj.ISMS_SubjectName}</td>
                                                      <td className='p-0'>
                                                          <table className='w-full border-none' style={{ borderCollapse: 'collapse' }}>
                                                              <tbody>
                                                                  {outcomes.map((out: any, oIdx: number) => (
                                                                      <tr
                                                                          key={oIdx}
                                                                          className={
                                                                              oIdx === outcomes.length - 1
                                                                                  ? 'border-none'
                                                                                  : 'border-black border-b'
                                                                          }>
                                                                          <td className='border-none p-2 text-left'>
                                                                              {out.EMSE_SubExamName}
                                                                          </td>
                                                                      </tr>
                                                                  ))}
                                                              </tbody>
                                                          </table>
                                                      </td>
                                                      {params.selectedExamsDetails?.map((ex: any) => (
                                                          <td key={ex.EME_Id} className='p-0 align-top'>
                                                              <table className='w-full border-none' style={{ borderCollapse: 'collapse' }}>
                                                                  <tbody>
                                                                      {outcomes.map((out: any, oIdx: number) => {
                                                                          const mark = getstudentwisesubjectlist.find(
                                                                              (m: any) =>
                                                                                  m.AMST_Id === student.AMST_Id &&
                                                                                  m.ISMS_Id === subj.ISMS_Id &&
                                                                                  m.EME_Id === ex.EME_Id &&
                                                                                  m.EMSE_SubExamName === out.EMSE_SubExamName
                                                                          );
                                                                          return (
                                                                              <tr
                                                                                  key={oIdx}
                                                                                  className={
                                                                                      oIdx === outcomes.length - 1
                                                                                          ? 'border-none'
                                                                                          : 'border-black border-b'
                                                                                  }>
                                                                                  <td className='border-none p-2'>
                                                                                      <span className='emoji-span'>
                                                                                          {getEmoji(mark?.ESTMPSSS_ObtainedMarks)}
                                                                                      </span>
                                                                                  </td>
                                                                              </tr>
                                                                          );
                                                                      })}
                                                                  </tbody>
                                                              </table>
                                                          </td>
                                                      ))}
                                                  </tr>
                                              );
                                          })}
                                  </tbody>
                              </table>
                          </div>
                      ))
                    : /* Mode: TEMPLATE (Performance Report Card) */
                      getstudentdetails.map((student: any, idx: number) => (
                          <div key={student.AMST_Id} className={`report-card ${idx > 0 ? 'page-break' : ''}`}>
                              <div className='template-container'>
                                  {/* Left Side: Attendance, Marks, Signatures */}
                                  <div className='column-half'>
                                      <div className='mb-4 flex gap-4'>
                                          <div className='w-2/3'>
                                              <table className='primary-table'>
                                                  <thead>
                                                      <tr>
                                                          <th>ATTENDANCE</th>
                                                          {params.selectedExamsDetails?.map((ex: any) => (
                                                              <th key={ex.EME_Id}>{ex.EME_ExamName}</th>
                                                          ))}
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                      <tr>
                                                          <td className='text-left'>Days Present :</td>
                                                          {params.selectedExamsDetails?.map((ex: any) => {
                                                              const att = student.getstudentwiseattendancedetails?.find(
                                                                  (a: any) => a.EME_Id === ex.EME_Id
                                                              );
                                                              return <td key={ex.EME_Id}>{att?.PRESENTDAYS || ''}</td>;
                                                          })}
                                                      </tr>
                                                      <tr>
                                                          <td className='text-left'>Total Days :</td>
                                                          {params.selectedExamsDetails?.map((ex: any) => {
                                                              const att = student.getstudentwiseattendancedetails?.find(
                                                                  (a: any) => a.EME_Id === ex.EME_Id
                                                              );
                                                              return <td key={ex.EME_Id}>{att?.TOTALWORKINGDAYS || ''}</td>;
                                                          })}
                                                      </tr>
                                                      <tr>
                                                          <td className='text-left'>Percentage :</td>
                                                          {params.selectedExamsDetails?.map((ex: any) => {
                                                              const att = student.getstudentwiseattendancedetails?.find(
                                                                  (a: any) => a.EME_Id === ex.EME_Id
                                                              );
                                                              return <td key={ex.EME_Id}>{att?.ATTENDANCEPERCENTAGE || ''}</td>;
                                                          })}
                                                      </tr>
                                                  </tbody>
                                              </table>
                                          </div>
                                          <div className='w-1/3'>
                                              <img
                                                  src='https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/b35f8c5c-b3a5-40b6-8043-13ae78eaf25d.png'
                                                  className='w-full'
                                                  alt='Promo'
                                              />
                                              <div className='mt-2 border border-black p-2 text-sm'>Promotion:</div>
                                          </div>
                                      </div>
                                      <div className='mb-4 min-h-[100px] border border-black p-4'>Teacher's Remarks Term I&ensp;</div>

                                      <div className='signature-row'>
                                          <div className='sig-item'>Class Teacher's Signature | date</div>
                                          <div className='sig-item'>Principal's Signature | date</div>
                                          <div className='sig-item'>Parent's Signature | date</div>
                                      </div>
                                  </div>

                                  <div className='divider'></div>

                                  {/* Right Side: Cover Page Style */}
                                  <div className='column-half text-center'>
                                      <img
                                          src='https://vapsclg.blob.core.windows.net/files/27/TBHS_Logo.png'
                                          className='header-logo'
                                          alt='Logo'
                                      />
                                      <h2 className='mt-2 font-bold text-2xl'>TUNBRIDGE HIGH SCHOOL</h2>
                                      <p className='text-xs'>
                                          86/2, Infantry Road, Tasker Town, Shivaji Nagar, Bengaluru, Karnataka 560001
                                      </p>
                                      <p className='font-bold text-xs'>PERFORMANCE REPORT</p>
                                      <p className='mt-2 font-bold text-lg'>ACADEMIC YEAR : {params.academicYearName}</p>

                                      <div className='photo-box'>
                                          <img src={student.AMST_Photoname || '/placeholder-student.png'} alt={student.studentname} />
                                      </div>

                                      <div className='mt-8 space-y-4 font-bold text-lg'>
                                          <div className='inline-block min-w-[300px] border-black border-b border-dotted pb-1'>
                                              Name: {student.studentname}
                                          </div>
                                          <div className='inline-block min-w-[300px] border-black border-b border-dotted pb-1'>
                                              Admission No: {student.admno}
                                          </div>
                                          <div className='mt-4'>
                                              Class & Section: {params.classname} & {params.sectionname}
                                          </div>
                                          <div>Class Teacher: {student.clastechname || data.clstchname}</div>
                                      </div>

                                      <img
                                          src='https://vapsclg.blob.core.windows.net/files/27/image_2024_03_15T08_35_44_566Z-removebg-preview (1).png'
                                          className='mx-auto mt-10 w-1/3'
                                          alt='Footer'
                                      />
                                  </div>
                              </div>
                          </div>
                      ))}
            </div>
        </div>
    );
};
