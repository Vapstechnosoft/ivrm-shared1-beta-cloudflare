'use client';
import type { EmployeeGatePassRecord, StudentGatePassRecord } from '../types';

interface PrintableGatePassReportProps {
    radioType: 'std' | 'emp';
    studentData: StudentGatePassRecord[];
    employeeData: EmployeeGatePassRecord[];
    dateSubtitle?: string;
}

export default function PrintableGatePassReport({ radioType, studentData, employeeData, dateSubtitle }: PrintableGatePassReportProps) {
    const today = new Date().toLocaleDateString('en-GB');

    return (
        <div id='gate-pass-printable-section' className='hidden bg-white p-8 font-sans text-black print:block'>
            {/* Header */}
            <div className='mb-6 border-b pb-4 text-center'>
                <h1 className='font-bold text-2xl uppercase tracking-wider'>
                    {radioType === 'std' ? 'Student Gate Pass Report' : 'Employee Gate Pass Report'}
                </h1>
                {dateSubtitle && <p className='mt-1 font-medium text-gray-600 text-sm'>{dateSubtitle}</p>}
                <p className='mt-1 text-gray-500 text-xs'>Generated on: {today}</p>
            </div>

            {/* Table */}
            {radioType === 'std' ? (
                <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-400 p-2'>SL. No.</th>
                            <th className='border border-gray-400 p-2'>Adm.No</th>
                            <th className='border border-gray-400 p-2'>Student Name</th>
                            <th className='border border-gray-400 p-2'>Class</th>
                            <th className='border border-gray-400 p-2'>Section</th>
                            <th className='border border-gray-400 p-2'>Mobile</th>
                            <th className='border border-gray-400 p-2'>Gate Pass No</th>
                            <th className='border border-gray-400 p-2'>Card No</th>
                            <th className='border border-gray-400 p-2'>Date</th>
                            <th className='border border-gray-400 p-2'>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentData.map((row, idx) => {
                            const formattedDate = row.gphS_DateTime ? new Date(row.gphS_DateTime).toLocaleDateString('en-GB') : '-';
                            return (
                                <tr key={`print-std-${idx}`} className='even:bg-gray-50'>
                                    <td className='border border-gray-400 p-1.5'>{idx + 1}</td>
                                    <td className='border border-gray-400 p-1.5 font-medium'>{row.amsT_AdmNo || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.amsT_FirstName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.asmcL_ClassName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.asmC_SectionName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.amsT_MobileNo || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 font-mono'>{row.gphS_GatePassNo || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.gphS_IDCardNo || '-'}</td>
                                    <td className='whitespace-nowrap border border-gray-400 p-1.5'>{formattedDate}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.gphS_Remarks || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <table className='w-full border-collapse border border-gray-400 text-center text-xs'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-400 p-2'>SL. No.</th>
                            <th className='border border-gray-400 p-2'>Emp Code</th>
                            <th className='border border-gray-400 p-2'>Name</th>
                            <th className='border border-gray-400 p-2'>Department</th>
                            <th className='border border-gray-400 p-2'>Designation</th>
                            <th className='border border-gray-400 p-2'>Contact No.</th>
                            <th className='border border-gray-400 p-2'>Gate Pass No</th>
                            <th className='border border-gray-400 p-2'>Card No</th>
                            <th className='border border-gray-400 p-2'>Date</th>
                            <th className='border border-gray-400 p-2'>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employeeData.map((row, idx) => {
                            const formattedDate = row.gphsT_DateTime ? new Date(row.gphsT_DateTime).toLocaleDateString('en-GB') : '-';
                            return (
                                <tr key={`print-emp-${idx}`} className='even:bg-gray-50'>
                                    <td className='border border-gray-400 p-1.5'>{idx + 1}</td>
                                    <td className='border border-gray-400 p-1.5 font-medium'>{row.hrmE_EmployeeCode || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.hrmE_EmployeeFirstName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.hrmD_DepartmentName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.hrmdeS_DesignationName || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.hrmE_MobileNo || '-'}</td>
                                    <td className='border border-gray-400 p-1.5 font-mono'>{row.gphsT_GatePassNo || '-'}</td>
                                    <td className='border border-gray-400 p-1.5'>{row.gphsT_IDCardNo || '-'}</td>
                                    <td className='whitespace-nowrap border border-gray-400 p-1.5'>{formattedDate}</td>
                                    <td className='border border-gray-400 p-1.5 text-left'>{row.gphsT_Remarks || '-'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}

            <div className='mt-8 flex justify-between border-t pt-4 text-gray-500 text-xs'>
                <div>Total Records: {radioType === 'std' ? studentData.length : employeeData.length}</div>
                <div>Principal / Authorized Signatory</div>
            </div>
        </div>
    );
}
