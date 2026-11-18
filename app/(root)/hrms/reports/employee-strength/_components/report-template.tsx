import { format } from 'date-fns';

export function EmployeeStrengthReportTemplate({
    data,
    departmentwise,
    leftEmployee
}: { data: any; departmentwise: boolean; leftEmployee: boolean }) {
    if (!data) return null;

    const { institutionDetails, employeeDetails, totalWorkingEmployees, totalLeftEmployees } = data;
    const totalEmployeesSum = employeeDetails?.reduce((sum: number, item: any) => sum + (item.totalEmployees || 0), 0) || 0;

    const total = totalWorkingEmployees + totalLeftEmployees;

    return (
        <div id='print-content' className='space-y-6 p-8 font-sans'>
            {/* Header */}
            <div className='space-y-2 border-b pb-4 text-center'>
                {institutionDetails?.mI_Logo && <img src={institutionDetails.mI_Logo} alt='Logo' className='mx-auto mb-2 h-16' />}
                <h1 className='font-bold text-2xl uppercase'>{institutionDetails?.mI_Name}</h1>
                <p className='text-sm'>
                    {institutionDetails?.mI_Address1}, {institutionDetails?.mI_Address2}, {institutionDetails?.mI_Address3} -{' '}
                    {institutionDetails?.mI_Pincode}
                </p>
                <h2 className='font-semibold text-lg underline decoration-1 underline-offset-4'>EMPLOYEE STRENGTH REPORT</h2>
                <p className='ml-auto text-xs italic'>Printed on: {format(new Date(), 'dd-MMM-yyyy HH:mm')}</p>
            </div>

            {/* Table */}
            <table className='w-full border-collapse border border-black text-sm'>
                <thead>
                    <tr className='bg-gray-100'>
                        <th className='w-12 border border-black p-2 text-center'>Sl.No</th>
                        <th className='border border-black p-2 text-left'>Group Type</th>
                        <th className='border border-black p-2 text-left'>Department</th>
                        {!departmentwise && !leftEmployee && <th className='border border-black p-2 text-left'>Designation</th>}
                        <th className='w-32 border border-black p-2 text-right'>Total Employees</th>
                    </tr>
                </thead>
                <tbody>
                    {employeeDetails?.map((emp: any, index: number) => (
                        <tr key={index}>
                            <td className='border border-black p-2 text-center'>{index + 1}</td>
                            <td className='border border-black p-2 text-left'>{emp.groupTypeName}</td>
                            <td className='border border-black p-2 text-left'>{emp.departmentName}</td>
                            {!departmentwise && !leftEmployee && (
                                <td className='border border-black p-2 text-left'>{emp.designationName || '-'}</td>
                            )}
                            <td className='border border-black p-2 text-right'>{emp.totalEmployees}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className='font-bold'>
                        <td className='border border-black p-2 text-right' colSpan={!departmentwise && !leftEmployee ? 4 : 3}>
                            Total
                        </td>
                        <td className='border border-black p-2 text-right'>{totalEmployeesSum}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Summary Box */}
            <div className='mt-8 ml-auto grid grid-cols-3 gap-4'>
                <div className='flex gap-2 bg-gray-50 p-2'>
                    <span>Total Working Employees:</span>
                    <span className='font-bold'>{totalWorkingEmployees}</span>
                </div>
                <div className='flex gap-2 bg-gray-50 p-2'>
                    <span>Total Left Employees:</span>
                    <span className='font-bold'>{totalLeftEmployees}</span>
                </div>
            </div>

            {/* Footer Signatures */}
            <div className='mt-20 flex justify-between pt-10 font-semibold text-sm'>
                <div className='w-40 border-black border-t pt-1 text-center'>Prepared By</div>
                <div className='w-40 border-black border-t pt-1 text-center'>H.O.D.</div>
                <div className='w-40 border-black border-t pt-1 text-center'>Principal / Director</div>
            </div>
        </div>
    );
}
