'use client';

import { format } from 'date-fns';

interface LetterTemplateProps {
    details: any;
    formData: any;
    setValue?: (name: any, value: any) => void;
}

export function TeachingStaffOfferLetter({ details, formData, setValue }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails } = employeeSalaryslipDetails;
    const { hrmE_DOJ, hrmeR_Current_Date } = formData;

    const institutionName = institutiondetails?.mI_Name || 'Notre Dame Academy';
    const institutionAddress = institutiondetails
        ? `${institutiondetails.mI_Address1}, ${institutiondetails.mI_Address2}, ${institutiondetails.mI_Address3}`
        : 'Notre Dame Nagar, Choodasandra, Bangalore';

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    // The JSON shows logo might be in salaryDetails
    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-sans text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 border-b pb-4 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto max-h-24' />
                </div>
            )}

            <div className='mb-6 text-center font-bold text-sm'>
                <p>TEACHER MANAGEMENT CONTRACT</p>
                <p>(PROBATION)</p>
            </div>

            <p className='mb-4 text-justify'>
                This agreement is a contract made on{' '}
                <span className='font-bold'>{hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</span> between{' '}
                <span className='font-bold'>Mrs. {fullName}</span> and {institutionName}, {institutionAddress}.
            </p>

            <div className='mb-4 space-y-2 pl-4 text-justify'>
                <p>
                    1. {institutionName} has agreed to engage <span className='font-bold'>Mrs. {fullName}</span> in the capacity of teaching
                    staff from <span className='font-bold'>{hrmE_DOJ ? format(hrmE_DOJ, 'dd-MM-yyyy') : ''}</span>
                </p>
                <p>
                    2. The teacher hereby certifies that she / he has read the "Staff Service Rules" and that she/he agrees to confirm by
                    them.
                </p>
                <p>
                    3. The decision of the School authority regarding termination of service, salary, benefits and disciplinary action shall
                    be made according to the letter of appointment and the "Staff Service Rules" and the decision of the School authority
                    shall be final.
                </p>
                <p>
                    4. The present appointment shall be on a probationary basis for a minimum of one year and a maximum of two years, at the
                    expiration of which a permanent appointment will be considered.
                </p>
                <p>5. The salary scale will be as follows:</p>
            </div>

            <table className='mb-6 w-full border-collapse border border-gray-400'>
                <tbody>
                    <tr>
                        <td className='w-16 border border-gray-400 p-2 text-center'>a</td>
                        <td className='border border-gray-400 p-2 text-center'>Basic Salary</td>
                        <td className='w-48 border border-gray-400 p-2 text-center'>
                            <input className='w-full bg-transparent text-center outline-none' placeholder='Enter Here' />
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-gray-400 p-2 text-center'>b</td>
                        <td className='border border-gray-400 p-2 text-center'>D.A.</td>
                        <td className='border border-gray-400 p-2 text-center'>
                            <input className='w-full bg-transparent text-center outline-none' placeholder='Enter Here' />
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-gray-400 p-2 text-center'>c</td>
                        <td className='border border-gray-400 p-2 text-center'>H. R. A.</td>
                        <td className='border border-gray-400 p-2 text-center'>
                            <input className='w-full bg-transparent text-center outline-none' placeholder='Enter Here' />
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-gray-400 p-2 text-center'>d</td>
                        <td className='border border-gray-400 p-2 text-center'>C. C. A</td>
                        <td className='border border-gray-400 p-2 text-center'>
                            <input className='w-full bg-transparent text-center outline-none' placeholder='Enter Here' />
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-gray-400 p-2 text-center'></td>
                        <td className='border border-gray-400 p-2 text-center font-bold'>Total</td>
                        <td className='border border-gray-400 p-2 text-center'>
                            <input className='w-full bg-transparent text-center font-bold outline-none' placeholder='Enter Here' />
                        </td>
                    </tr>
                </tbody>
            </table>

            <p className='mb-6 pl-4 text-justify'>
                6. One month's notice will be required by either party for termination of service during this year. In lieu of the notice,
                one month's salary will be given or deducted as the case may be.
            </p>

            <p className='mb-24 text-justify'>In agreement of the parties here place their signature:</p>

            <div className='mt-12 flex items-end justify-between text-sm'>
                <div className='w-1/3 text-gray-600'>
                    <p>(Secretary)</p>
                </div>
                <div className='w-1/3 text-center text-gray-600'>
                    <p>(Principal)</p>
                </div>
                <div className='w-1/3 space-y-4 text-gray-600'>
                    <p className='text-center'>(Staff-member)</p>
                    <p className='pl-8 text-black'>Date : {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                    <p className='pl-8 text-black'>Time:</p>
                </div>
            </div>
        </div>
    );
}

export function NonTeachingStaffOfferLetter({ details, formData, setValue }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails, designationName: apiDesignation } = employeeSalaryslipDetails;
    const { hrmeR_DOI, hrmeR_DOR, hrmE_DOJ, hrmeR_Current_Date, staffLevel, startingBasic, staffDesignation } = formData;

    const designationName = staffDesignation || apiDesignation;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold'>{fullName},</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocArea}, {currentEmployeeDetails?.hrmE_LocStreet}
                    </p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocCity}, {currentEmployeeDetails?.hrmE_LocStateId},
                    </p>
                    <p>{currentEmployeeDetails?.hrmE_LocPincode}.</p>
                </div>
                <div>
                    <p className='font-bold'>Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                </div>
            </div>

            <h3 className='mb-6 text-center font-bold underline'>OFFER LETTER</h3>

            <p className='mb-4'>Dear {fullName},</p>

            <p className='mb-4 text-justify'>
                Further to your interview held on {hrmeR_DOI ? format(hrmeR_DOI, 'dd-MM-yyyy') : ''}, I am pleased to inform you that you
                have been selected for appointment as {designationName} in this School w.e.f{' '}
                <span className='font-bold'>{hrmE_DOJ ? format(hrmE_DOJ, 'dd-MM-yyyy') : ''}</span>.
            </p>

            <p className='mb-4 text-justify text-xs italic'>
                As per our requirement for {designationName} for which we had advertised, you are being placed in the appropriate scale for{' '}
                {designationName}, as per the revised pay structure of formulated by the Managing Committee and the Educational Society and
                implemented with effect from 1st April 2022.
            </p>

            <table className='mb-6 w-full border-collapse border border-black'>
                <thead className='bg-gray-100'>
                    <tr>
                        <th className='border border-black p-2'>Staff Category</th>
                        <th className='border border-black p-2'>Level</th>
                        <th className='border border-black p-2'>Starting Basic</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='border border-black p-2 text-center'>{designationName}</td>
                        <td className='border border-black p-2 text-center'>
                            <input
                                className='h-full w-full border-none text-center outline-none focus:bg-gray-50 print:bg-transparent'
                                value={staffLevel || ''}
                                placeholder='[Enter Level]'
                                onChange={(e) => setValue?.('staffLevel', e.target.value)}
                            />
                        </td>
                        <td className='border border-black p-2 text-center'>
                            <input
                                className='h-full w-full border-none text-center outline-none focus:bg-gray-50 print:bg-transparent'
                                value={startingBasic || ''}
                                placeholder='[Enter Salary]'
                                onChange={(e) => setValue?.('startingBasic', e.target.value)}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* Same content as teaching for now, can be adjusted if legacy had unique text */}
            <p className='mb-4 text-justify'>
                Deductions will be made as per the Statuary Rules and as per the Service & Leave Rules of the School.
            </p>

            <p className='mb-4 text-justify'>
                You will be governed by the Service & Leave Rules of the School.{' '}
                <strong>
                    A copy of the Service & Leave Rules of the School is being provided for you to read and understand prior to accepting
                    this offer. If you accept this Offer, it will be deemed that you are willing to abide by the Service Rules &
                    Regulations.
                </strong>
            </p>

            <p className='mb-6 text-justify'>
                Kindly respond to this <strong>Letter of Offer</strong> in writing, explicitly stating your willingness to accept this offer
                or otherwise. Your response should reach us latest by 1 p.m. on {hrmeR_DOR ? format(hrmeR_DOR, 'dd-MM-yyyy') : ''}
            </p>

            <p className='mb-12'>
                A Letter of Appointment will be issued to you on your joining{' '}
                <span className='font-bold uppercase'>{institutiondetails?.mI_Name}</span>.
            </p>

            <div className='space-y-1'>
                <p>Yours Sincerely,</p>
                <div className='h-12'></div>
                <p className='font-bold'>(Raja McGee)</p>
                <p>Principal & Secretary</p>
            </div>
        </div>
    );
}

export function ExperienceLetter({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails, designationName } = employeeSalaryslipDetails;
    const { hrmeR_Current_Date } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();
    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}
            <div className='mb-8 space-y-2 text-center'>
                {/* <h1 className="text-2xl font-bold uppercase">{institutiondetails?.mI_Name}</h1>
                <p className="text-xs uppercase">{institutiondetails?.mI_Address1}, {institutiondetails?.mI_Address2}, {institutiondetails?.mI_Address3} - {institutiondetails?.mI_Pincode}</p>
                <div className="h-4"></div> */}
                <h2 className='border-y py-1 font-bold text-lg tracking-widest'>EXPERIENCE CERTIFICATE</h2>
            </div>

            <div className='mb-8 flex justify-end'>
                <p>
                    Date: <span className='font-bold'>{hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</span>
                </p>
            </div>

            <p className='mb-16 px-4 text-justify leading-loose'>
                This is to certify that Mr/Ms. <span className='font-bold uppercase underline'>{fullName}</span> has worked in this school
                as <span className='font-bold'>{designationName}</span> with effect from{' '}
                <span className='font-bold'>
                    {currentEmployeeDetails?.hrmE_DOJ ? format(new Date(currentEmployeeDetails.hrmE_DOJ), 'dd-MM-yyyy') : '[DOJ]'}
                </span>{' '}
                to{' '}
                <span className='font-bold'>
                    {currentEmployeeDetails?.hrmE_DOL ? format(new Date(currentEmployeeDetails.hrmE_DOL), 'dd-MM-yyyy') : '[DOL]'}
                </span>
                . His/Her conduct during this service was found <span className='italic'>Good</span>. This certificate is being issued on
                request from the staff member.
            </p>

            <div className='mt-20 px-4'>
                <p className='font-bold'>Principal</p>
            </div>
        </div>
    );
}

export function ConfirmationLetter({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails, designationName } = employeeSalaryslipDetails;
    const { hrmeR_DOI, hrmE_DOJ, hrmeR_Current_Date } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold'>{fullName},</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocArea}, {currentEmployeeDetails?.hrmE_LocStreet}
                    </p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocCity}, {currentEmployeeDetails?.hrmE_LocStateId},
                    </p>
                    <p>{currentEmployeeDetails?.hrmE_LocPincode}.</p>
                </div>
                <div>
                    <p className='font-bold'>Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                </div>
            </div>

            <h3 className='mb-6 text-center font-bold underline'>SUB: CONFIRMATION</h3>

            <p className='mb-4'>Dear {fullName},</p>

            <div className='space-y-4 text-justify'>
                <p>
                    The Managing Committee of <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span> at its
                    meeting held on {hrmeR_DOI ? format(hrmeR_DOI, 'dd-MM-yyyy') : ''}, was pleased to confirm your appointment to the post
                    of <span className='font-bold'>{designationName}</span> with effect from{' '}
                    <span className='font-bold'>{hrmE_DOJ ? format(hrmE_DOJ, 'dd-MM-yyyy') : ''}</span>.
                </p>

                <p>
                    We hereby reiterate (as mentioned in the Appointment Letter issued to you) that according to our requirements, we
                    advertised for a Trained Post Graduate and as such, you were placed in the appropriate scale. You are hereby
                    categorically informed that other than the qualifications recognized herein, no other qualifications that you may have
                    at present or those that you may acquire in the future will be considered.
                </p>

                <p>
                    Further, it is reiterated that you will be governed by the Service & Leave Rules of the School, duties and
                    responsibilities as mentioned in your Appointment Letter and any other rules & regulations in force and those that may
                    be introduced/modified/expunged from time to time.
                </p>

                <p className='font-bold'>
                    Termination: Consequent to your Confirmation, your service may be terminated anytime, without assigning any reason, by
                    giving 3 months notice or by payment of salary, in lieu thereof.
                </p>
            </div>

            <div className='mt-12 space-y-1'>
                <p>Yours Sincerely,</p>
                <div className='h-12'></div>
                <p className='font-bold'>(Raja McGee)</p>
                <p>Principal & Secretary</p>
            </div>
        </div>
    );
}

export function ServiceCertificate({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails, designationName } = employeeSalaryslipDetails;
    const { hrmeR_Current_Date } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();
    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}
            <div className='mb-12 space-y-2 text-center'>
                {/* <h1 className="text-2xl font-bold uppercase">{institutiondetails?.mI_Name}</h1>
                <p className="text-xs">{institutiondetails?.mI_Address1}, {institutiondetails?.mI_Address2}, {institutiondetails?.mI_Address3} - {institutiondetails?.mI_Pincode}</p>
                <div className="h-4"></div> */}
                <h2 className='inline-block border-b-2 px-4 font-bold text-xl'>SERVICE CERTIFICATE</h2>
            </div>

            <div className='mb-8 flex justify-end'>
                <p>
                    Date: <span className='font-bold'>{hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</span>
                </p>
            </div>

            <div className='space-y-6 px-4 text-justify'>
                <p>
                    This is to certify that Mr./Ms. <span className='font-bold uppercase underline'>{fullName}</span>, Date of Birth:{' '}
                    <span className='font-bold'>
                        {currentEmployeeDetails?.hrmE_DOB ? format(new Date(currentEmployeeDetails.hrmE_DOB), 'dd/MM/yyyy') : ''}
                    </span>{' '}
                    is a bonafide employee of <span className='font-bold'>{institutiondetails?.mI_Name}</span>, having its office at{' '}
                    <span className='font-bold'>
                        {institutiondetails?.mI_Address1}, {institutiondetails?.mI_Address2}
                    </span>
                    .
                </p>

                <p>
                    He/She has been working with us as a <span className='font-bold'>{designationName}</span> since{' '}
                    <span className='font-bold'>
                        {currentEmployeeDetails?.hrmE_DOJ ? format(new Date(currentEmployeeDetails.hrmE_DOJ), 'dd-MM-yyyy') : ''}
                    </span>{' '}
                    and is currently serving as a permanent employee of the organization.
                </p>

                <p>
                    His/Her contact address as per our records is:{' '}
                    <span className='font-bold'>
                        {currentEmployeeDetails?.hrmE_LocStreet}, {currentEmployeeDetails?.hrmE_LocArea},{' '}
                        {currentEmployeeDetails?.hrmE_LocCity}, {currentEmployeeDetails?.hrmE_LocStateId} -{' '}
                        {currentEmployeeDetails?.hrmE_LocPincode}
                    </span>
                    .
                </p>

                <p>This certificate is issued upon request for official purpose.</p>
            </div>

            <div className='mt-24 space-y-12 px-4'>
                <p>Faithfully,</p>
                <div>
                    <p className='font-bold'>Principal</p>
                </div>
            </div>
        </div>
    );
}

export function AppointmentLetter({ details, formData, isTeaching, setValue }: LetterTemplateProps & { isTeaching: boolean }) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails, designationName: apiDesignation } = employeeSalaryslipDetails;
    const { hrmE_DOJ, hrmeR_Current_Date, staffLevel, startingBasic, staffDesignation } = formData;

    const designationName = staffDesignation || apiDesignation;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold'>{fullName},</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocArea}, {currentEmployeeDetails?.hrmE_LocStreet}
                    </p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocCity}, {currentEmployeeDetails?.hrmE_LocStateId},
                    </p>
                    <p>{currentEmployeeDetails?.hrmE_LocPincode}.</p>
                </div>
                <div>
                    <p className='font-bold'>Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                </div>
            </div>

            <div className='mb-6 text-center'>
                <p className='font-bold'>
                    Date of Birth: {currentEmployeeDetails?.hrmE_DOB ? format(new Date(currentEmployeeDetails.hrmE_DOB), 'dd-MM-yyyy') : ''}
                </p>
                <p className='font-bold'>Qualification: {currentEmployeeDetails?.hrmE_QualificationName ?? '[Qualification]'}</p>
            </div>

            <p className='mb-4'>Dear {fullName},</p>

            <div className='space-y-4 text-justify'>
                <p>
                    Consequent to your application and interview, I, on behalf of the Managing Committee of{' '}
                    <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span> hereby appoint you as{' '}
                    {isTeaching ? 'a Teacher' : 'an Office Assistant'} of{' '}
                    <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span>, {institutiondetails?.mI_Address1}{' '}
                    with effect from <span className='font-bold'>{hrmE_DOJ ? format(hrmE_DOJ, 'dd-MM-yyyy') : ''}</span>.
                </p>

                <p>
                    <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span> is an English Medium Minority
                    Christian Missionary School owned, controlled and managed by the{' '}
                    <span className='font-bold uppercase'>{institutiondetails?.mI_Name} Educational Society</span>. We naturally would
                    expect you to respect the Christian Idealism of the School and sincerely co-operate with the Discipline that comes from
                    that Idealism.
                </p>

                <table className='my-4 w-full border-collapse border border-black'>
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='border border-black p-2'>Staff Category</th>
                            <th className='border border-black p-2'>Level</th>
                            <th className='border border-black p-2'>Starting Basic</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className='border border-black p-2 text-center'>{designationName}</td>
                            <td className='border border-black p-2 text-center'>
                                <input
                                    className='h-full w-full border-none text-center underline outline-none focus:bg-gray-50 print:bg-transparent'
                                    value={staffLevel || ''}
                                    placeholder='[Enter Level]'
                                    onChange={(e) => setValue?.('staffLevel', e.target.value)}
                                />
                            </td>
                            <td className='border border-black p-2 text-center'>
                                <input
                                    className='h-full w-full border-none text-center underline outline-none focus:bg-gray-50 print:bg-transparent'
                                    value={startingBasic || ''}
                                    placeholder='[Enter Salary]'
                                    onChange={(e) => setValue?.('startingBasic', e.target.value)}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                <p>
                    The terms and conditions of your service will be as per the Service & Leave Rules in force. Rules & Regulations may be
                    introduced / altered / expunged from time to time.
                </p>

                <div className='space-y-1'>
                    <p>Yours Sincerely,</p>
                    <div className='h-12'></div>
                    <p className='font-bold'>(Raja McGee)</p>
                    <p>Principal & Secretary</p>
                </div>

                <div className='mt-8 border-t-2 pt-8'>
                    <h4 className='mb-4 bg-gray-200 py-1 text-center font-bold'>STATEMENT OF ACCEPTANCE</h4>
                    <p className='text-xs'>
                        I, {fullName}, accept all the terms and conditions of service as stated in your letter of appointment to me dated{' '}
                        {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''} and promise to abide by them.
                    </p>
                    <div className='mt-8 flex justify-between'>
                        <p>Signature: ________________</p>
                        <p>Date: ________________</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TerminationLetter({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails } = employeeSalaryslipDetails;
    const { hrmeR_Current_Date, hrmeR_DOd, hrmeR_DOter, hrmeR_DOp } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold'>{fullName},</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocArea}, {currentEmployeeDetails?.hrmE_LocStreet}
                    </p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocCity}, {currentEmployeeDetails?.hrmE_LocStateId},
                    </p>
                    <p>{currentEmployeeDetails?.hrmE_LocPincode}.</p>
                </div>
                <div>
                    <p className='font-bold'>Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                </div>
            </div>

            <p className='mb-4'>Dear {fullName},</p>

            <div className='space-y-4 text-justify'>
                <p className='font-bold italic'>
                    Ref: Your Letter of Appointment on Probation dated {hrmeR_DOp ? format(hrmeR_DOp, 'dd-MM-yyyy') : '[Probation Date]'}.
                </p>

                <p>
                    You were &apos;appointed on probation&apos; as an Assistant Teacher with effect from{' '}
                    <span className='font-bold'>{hrmeR_DOp ? format(hrmeR_DOp, 'dd-MM-yyyy') : ''}</span>. Your services have not been found
                    to be satisfactory and the Managing Committee of{' '}
                    <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span> has decided to terminate your
                    appointment on probation.
                </p>

                <p>
                    As per rules governing appointment on probation, you are being served one month&apos;s notice and will be paid your dues
                    till <span className='font-bold'>{hrmeR_DOd ? format(hrmeR_DOd, 'dd-MM-yyyy') : ''}</span>. However, your last working
                    day will be <span className='font-bold'>{hrmeR_DOter ? format(hrmeR_DOter, 'dd-MM-yyyy') : ''}</span>.
                </p>

                <p>
                    You are to handover all material related to{' '}
                    <span className='font-bold uppercase italic'>{institutiondetails?.mI_Name}</span> to the School Office including student
                    registers, record books, and keys.
                </p>

                <div className='mt-12 space-y-1'>
                    <p>Yours Sincerely,</p>
                    <div className='h-12'></div>
                    <p className='font-bold'>(Raja McGee)</p>
                    <p>Principal & Secretary</p>
                </div>
            </div>
        </div>
    );
}

export function RelievingLetter({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails } = employeeSalaryslipDetails;
    const { hrmeR_Current_Date, DoResignation } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold font-xs uppercase underline'>TO</p>
                    <p className='font-bold uppercase'>{fullName}</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocStreet}, {currentEmployeeDetails?.hrmE_LocArea}
                    </p>
                </div>
                <div>
                    <p className='font-bold underline underline-offset-4'>
                        Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}
                    </p>
                </div>
            </div>

            <h2 className='mb-12 text-center font-bold text-3xl'>Relieving Letter</h2>

            <div className='space-y-6 text-justify'>
                <p>
                    Dear <span className='font-bold uppercase'>{fullName}</span>,
                </p>

                <p className='leading-relaxed'>
                    This has reference to your resignation letter received through email dated{' '}
                    <span className='font-bold'>{DoResignation ? format(DoResignation, 'dd-MM-yyyy') : '[Resignation Date]'}</span>. This is
                    to inform you that your resignation has been accepted and you are relieved from the services of{' '}
                    <span className='font-bold uppercase'>{institutiondetails?.mI_Name}</span>, {institutiondetails?.mI_Address1}, on the
                    close of working hours on{' '}
                    <span className='font-bold'>
                        {currentEmployeeDetails?.hrmE_DOL
                            ? format(new Date(currentEmployeeDetails.hrmE_DOL), 'dd-MM-yyyy')
                            : '[Date of Leaving]'}
                    </span>
                    .
                </p>

                <p>We wish you all success in your future endeavors.</p>
            </div>

            <div className='mt-32'>
                <p className='font-bold'>Principal</p>
            </div>
        </div>
    );
}

export function AccountOpeningLetter({ details, formData }: LetterTemplateProps) {
    if (!details || !details.employeeSalaryslipDetails) return null;

    const { employeeSalaryslipDetails, institutiondetails } = details;
    const { currentEmployeeDetails } = employeeSalaryslipDetails;
    const { hrmeR_Current_Date, bankaddress } = formData;

    const fullName =
        `${currentEmployeeDetails?.hrmE_EmployeeFirstName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeMiddleName ?? ''} ${currentEmployeeDetails?.hrmE_EmployeeLastName ?? ''}`.trim();

    const logo = institutiondetails?.mI_Logo || employeeSalaryslipDetails?.salaryDetails?.mI_Logo;

    return (
        <div className='min-h-[11in] bg-white p-8 font-serif text-black text-sm leading-relaxed'>
            {/* Header Logo */}
            {logo && (
                <div className='mb-6 text-center'>
                    <img src={logo} alt='Logo' className='mx-auto h-32' />
                </div>
            )}

            <div className='mb-8 flex justify-between'>
                <div className='space-y-1'>
                    <p className='font-bold font-xs uppercase underline'>TO</p>
                    <p className='font-bold uppercase'>{fullName}</p>
                    <p>
                        {currentEmployeeDetails?.hrmE_LocStreet}, {currentEmployeeDetails?.hrmE_LocArea}
                    </p>
                </div>
                <div>
                    <p className='font-bold'>Date: {hrmeR_Current_Date ? format(hrmeR_Current_Date, 'dd-MM-yyyy') : ''}</p>
                </div>
            </div>

            <h2 className='mb-12 text-center font-bold text-3xl'>Account Opening Form</h2>

            <div className='space-y-8 text-justify'>
                <p className='leading-loose'>
                    This is to certify that <span className='font-bold uppercase underline underline-offset-2'>{fullName}</span> is working
                    as staff in our institution. Please open a salary account in your bank. As per our office record his residential address
                    is as given below:
                </p>

                <p className='rounded border bg-gray-50 p-4 font-bold'>
                    {currentEmployeeDetails?.hrmE_LocStreet}, {currentEmployeeDetails?.hrmE_LocArea}, {currentEmployeeDetails?.hrmE_LocCity}
                </p>

                <div className='mt-16 pt-8'>
                    <p className='font-bold underline underline-offset-4'>Bank Details/Address:</p>
                    <p className='whitespace-pre-wrap italic'>{bankaddress || '[Bank Address Not Provided]'}</p>
                </div>
            </div>
        </div>
    );
}

export function LetterRenderer({ details, formData, setValue }: LetterTemplateProps) {
    if (!formData.letterType) return null;

    switch (formData.letterType) {
        case 'offerletter':
            return <TeachingStaffOfferLetter details={details} formData={formData} setValue={setValue} />;
        case 'Non Teaching offerletter':
            return <NonTeachingStaffOfferLetter details={details} formData={formData} setValue={setValue} />;
        case 'experienceletter':
            return <ExperienceLetter details={details} formData={formData} />;
        case 'servicecertificate':
            return <ServiceCertificate details={details} formData={formData} />;
        case 'appontmentletter':
            return <AppointmentLetter details={details} formData={formData} isTeaching={true} setValue={setValue} />;
        case 'nonteachingappontmentletter':
            return <AppointmentLetter details={details} formData={formData} isTeaching={false} setValue={setValue} />;
        case 'confirmationletter':
            return <ConfirmationLetter details={details} formData={formData} />;
        case 'Terminationletter':
            return <TerminationLetter details={details} formData={formData} />;
        case 'relievingLetter':
            return <RelievingLetter details={details} formData={formData} />;
        case 'accountopening':
            return <AccountOpeningLetter details={details} formData={formData} />;
        default:
            return (
                <div className='p-8'>
                    Selected letter type "{formData.letterType}" template not fully implemented. Please contact support.
                </div>
            );
    }
}
