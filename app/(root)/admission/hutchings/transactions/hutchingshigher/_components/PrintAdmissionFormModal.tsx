import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Eye } from 'lucide-react';
import { useState } from 'react';

interface PrintAdmissionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: any;
}

export function PrintAdmissionFormModal({ isOpen, onClose, student }: PrintAdmissionFormModalProps) {
    const [showTutorial, setShowTutorial] = useState(false);

    if (!student) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className='h-[90vh] max-w-[1000px] overflow-y-auto border-none bg-white p-0'>
                    <style type='text/css' media='print'>
                        {`
              @page { size: auto; margin: 10mm; }
              body * { visibility: hidden; }
              #print-area, #print-area * { visibility: visible; }
              
              /* Reset dialog styling to allow multi-page printing */
              [role="dialog"] {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                transform: none !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
              }
              
              #print-area { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100%; 
                height: auto !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
              }
            `}
                    </style>
                    {/* Sticky Header with Action Buttons for the Modal */}
                    <div className='sticky top-0 z-10 flex items-center justify-between border-blue-200 border-b bg-[#e6f0fa] p-2 shadow-sm print:hidden'>
                        <div className='flex items-center gap-2 px-2 font-semibold text-blue-800 text-sm'>
                            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs'>i</span>
                            KINDLY SELECT SAVE AS PDF TO DOWNLOAD APPLICATION AFTER CLICKED ON DOWNLOAD/PRINT
                            <button type='button' onClick={() => setShowTutorial(true)} className='ml-1 text-blue-800 hover:text-blue-600'>
                                <Eye className='h-5 w-5' />
                            </button>
                        </div>
                        <div className='flex gap-2 pr-2'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handlePrint}
                                className='border-gray-300 bg-white text-black hover:bg-gray-100'>
                                Download/Print
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={onClose}
                                className='border-gray-300 bg-white text-black hover:bg-gray-100'>
                                Close
                            </Button>
                        </div>
                    </div>

                    {/* Printable Area */}
                    <div className='bg-white p-8 font-sans text-black print:m-0 print:p-0' id='print-area'>
                        {/* School Header */}
                        <div className='mb-6 flex items-start justify-between'>
                            <div className='h-32 w-24 flex-shrink-0'></div> {/* Spacer for perfect centering */}
                            <div className='flex h-32 flex-1 items-center justify-center px-4'>
                                <img
                                    src='https://hutchingsschoolpune.azurewebsites.net/images/hutchingslogo.png'
                                    alt='Hutchings Logo'
                                    className='h-full w-[700px] object-contain'
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                            <div className='flex h-32 w-24 flex-shrink-0 items-center justify-center border border-gray-300 bg-gray-50'>
                                <span className='text-gray-400 text-xs'>Photo</span>
                            </div>
                        </div>

                        <h2 className='mb-6 text-center font-bold text-[#204085] text-xl uppercase'>ADMISSION FORM - Class :XI</h2>

                        <div className='mb-8 flex justify-between font-bold text-[#204085] text-sm'>
                            <div>Application No : {student.pasR_RegistrationNo || '1962'}</div>
                            <div>Admission Year : [2026-2027]</div>
                        </div>

                        {/* Form Fields Grid */}
                        <div className='space-y-6 font-medium text-sm'>
                            {/* Row 1: Name */}
                            <div className='flex'>
                                <div className='w-40'>1.Name of Student</div>
                                <div className='w-4'>:</div>
                                <div className='grid flex-1 grid-cols-3 gap-8 text-center'>
                                    <div>
                                        <div className='border-black border-b pb-1 uppercase'>{student.name?.split(' ')[0] || '-'}</div>
                                        <div className='mt-1 text-[10px] text-gray-700'>(First Name)</div>
                                    </div>
                                    <div>
                                        <div className='border-black border-b pb-1 uppercase'>{student.name?.split(' ')[1] || '-'}</div>
                                        <div className='mt-1 text-[10px] text-gray-700'>(Middle Name)</div>
                                    </div>
                                    <div>
                                        <div className='border-black border-b pb-1 uppercase'>{student.name?.split(' ')[2] || '-'}</div>
                                        <div className='mt-1 text-[10px] text-gray-700'>(Surname)</div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: DOB & Place of Birth */}
                            <div className='grid grid-cols-2 gap-8'>
                                <div className='flex'>
                                    <div className='w-32'>2. Date of Birth</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2'>
                                        {student.pasR_DOB ? new Date(student.pasR_DOB).toLocaleDateString('en-GB') : '22/09/2010'}
                                    </div>
                                </div>
                                <div className='flex'>
                                    <div className='w-32'>3.Place of Birth</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2 uppercase'>NAZARE</div>
                                </div>
                            </div>

                            {/* Row 3: Nationality & Religion */}
                            <div className='grid grid-cols-2 gap-8'>
                                <div className='flex'>
                                    <div className='w-32'>4.Nationality</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2 uppercase'>Indian</div>
                                </div>
                                <div className='flex'>
                                    <div className='w-32'>5. Religion</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2 uppercase'>Hindu</div>
                                </div>
                            </div>

                            {/* Row 4: Sex & Email */}
                            <div className='grid grid-cols-2 gap-8'>
                                <div className='flex'>
                                    <div className='w-32'>6.Sex M/F</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2'>{student.pasR_Sex || 'Male'}</div>
                                </div>
                                <div className='flex'>
                                    <div className='w-32'>7.Email</div>
                                    <div className='w-4'>:</div>
                                    <div className='flex-1 border-black border-b pb-1 pl-2'>{student.pasR_emailId || '-'}</div>
                                </div>
                            </div>

                            {/* Row 5: Address */}
                            <div className='flex items-start'>
                                <div className='w-40 pt-1'>8.Address</div>
                                <div className='w-4 pt-1'>:</div>
                                <div className='flex-1 space-y-4'>
                                    <div className='border-black border-b pb-1 pl-2'>ShivGanesh SR.7/1/3B Plot no.20,</div>
                                    <div className='border-black border-b pb-1 pl-2'>
                                        Taljai, Dhankawadi, Pune, Maharashtra, India, Pincode-411043
                                    </div>
                                </div>
                            </div>

                            {/* Row 6: Previous School */}
                            <div className='flex items-end'>
                                <div className='w-64'>9.(a) Name Of the School Last Attended</div>
                                <div className='w-4'>:</div>
                                <div className='flex-1 border-black border-b pb-1 pl-2'>Kline Memorial School Of UBS</div>
                            </div>

                            <div className='flex items-end gap-4 pl-8'>
                                <div className=''>(b)Year :</div>
                                <div className='w-32 border-black border-b px-2 pb-1'>2026</div>
                                <div className=''>(c)Board :</div>
                                <div className='flex-1 border-black border-b px-2 pb-1'>ICSE</div>
                                <div className=''>(d)Percentage (ICSE - English + best of 4) :</div>
                                <div className='w-32 border-black border-b px-2 pb-1'>52%</div>
                            </div>

                            {/* Row 7: Co-curricular */}
                            <div className='flex'>
                                <div className='w-48'>10. Co-curricular Activities</div>
                                <div className='w-4'>:</div>
                                <div className='flex-1 border-black border-b px-2 pb-1'>Footballer</div>
                            </div>

                            {/* Row 8: Parents */}
                            <div className='mt-8 flex'>
                                <div className='w-12'>11.</div>
                                <div className='grid flex-1 grid-cols-2 gap-8'>
                                    {/* Father */}
                                    <div className='space-y-4'>
                                        <div className='mb-4 text-center'>Father / Guardian</div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>a.Name</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>Mr Ganesh Jangam</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>b.Occupation</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>Business</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>c.Qualification</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>Diploma</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>d.Phone(Office)</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'></div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>e.Phone(Res)</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'></div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='w-32'>f.Mobile</div>
                                            <div className='w-4'>:</div>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>7499948208</div>
                                        </div>
                                    </div>
                                    {/* Mother */}
                                    <div className='space-y-4'>
                                        <div className='mb-4 text-center'>Mother / Guardian</div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>Smt Shailaja Ganesh Jangam</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>Service</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>B A</div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'></div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'></div>
                                        </div>
                                        <div className='flex items-end'>
                                            <div className='flex-1 border-black border-b pb-1 pl-2'>8888346276</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 9: Siblings */}
                            <div className='mt-8 pt-4'>
                                <div className='mb-4'>12.Mention name,class and section of any sibling of the candidate in the school</div>
                                <table className='mt-2 w-full border-none text-center'>
                                    <thead>
                                        <tr>
                                            <th className='py-2 font-medium'>Name</th>
                                            <th className='py-2 font-medium'>Class</th>
                                            <th className='py-2 font-medium'>Section</th>
                                            <th className='py-2 font-medium'>Admission Number</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='py-2'>---</td>
                                            <td className='py-2'>---</td>
                                            <td className='py-2'>---</td>
                                            <td className='py-2'>---</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Subject Tables */}
                            <div className='mt-8 pt-4'>
                                <div className='mb-2 font-bold text-sm uppercase'>COMMERCE :- Compulsory Subjects</div>
                                <table className='w-full border-collapse border border-gray-300 text-sm'>
                                    <thead className='bg-[#0056b3] text-left font-bold text-white'>
                                        <tr>
                                            <th className='w-12 border border-gray-300 p-2 text-center font-bold'>SLNO</th>
                                            <th className='w-1/3 border border-gray-300 p-2 font-bold'>Compulsory Group</th>
                                            <th className='border border-gray-300 p-2 font-bold'>Compulsory Subjects</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='border border-gray-300 p-2 text-center' rowSpan={4}>
                                                1
                                            </td>
                                            <td className='border border-gray-300 p-2' rowSpan={4}>
                                                XI Commerce Compulsory
                                            </td>
                                            <td className='border border-gray-300 p-2'>Accounts</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-300 p-2'>Economics</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-300 p-2'>English Literature</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-300 p-2'>English Language</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='mt-8'>
                                <div className='mb-2 font-bold text-sm'>Languages Selection / Elective Subjects</div>
                                <table className='w-full border-collapse border border-gray-300 text-sm'>
                                    <thead className='bg-[#0056b3] text-left font-bold text-white'>
                                        <tr>
                                            <th className='w-12 border border-gray-300 p-2 text-center font-bold'>SLNO</th>
                                            <th className='w-1/3 border border-gray-300 p-2 font-bold'>Elective Group</th>
                                            <th className='border border-gray-300 p-2 font-bold'>Subjects</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='border border-gray-300 p-2 text-center'>1</td>
                                            <td className='border border-gray-300 p-2'>XI COMM Elective 1</td>
                                            <td className='border border-gray-300 p-2'>Computer Science</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-300 p-2 text-center'>2</td>
                                            <td className='border border-gray-300 p-2'>XI COMM Elective 2</td>
                                            <td className='border border-gray-300 p-2'>Mathematics</td>
                                        </tr>
                                        <tr>
                                            <td className='border border-gray-300 p-2 text-center'>3</td>
                                            <td className='border border-gray-300 p-2'>XI COMM Elective 3</td>
                                            <td className='border border-gray-300 p-2'>Political Science</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Undertaking */}
                            <div className='mt-8 space-y-6 pt-4'>
                                <div>
                                    <div className='mb-2 font-bold text-[13px] uppercase'>UNDERTAKING BY THE STUDENT:-</div>
                                    <p className='font-normal text-[13px] text-gray-800 leading-relaxed'>
                                        I hereby certify that the above information is true to the best of my knowledge and belief. I also
                                        understand that if the above information is found to be false or incorrect, my admission may be
                                        can-celled without further notice and the school staff shall not be responsible for the same.
                                    </p>
                                </div>
                                <div>
                                    <div className='mb-2 font-bold text-[13px] uppercase'>UNDERTAKING BY THE PARENTS / GUARDIAN:-</div>
                                    <p className='font-normal text-[13px] text-gray-800 leading-relaxed'>
                                        I have read all the rules of the school and declare that they are acceptable to me and my ward. I
                                        shall pay all the school fees and dues as necessary. I am also aware that the school runs a number
                                        of co-curricular activities and as a parent I have no objection in my ward participating in them.
                                    </p>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className='mt-16 flex items-end justify-between text-[13px]'>
                                <div className='space-y-4 font-bold'>
                                    <div className='flex'>
                                        <div className='w-16'>Place :</div>
                                    </div>
                                    <div className='flex'>
                                        <div className='w-16'>Date:</div>
                                    </div>
                                </div>
                                <div className='flex items-end'>
                                    <div className='w-48 pr-4 text-right font-bold'>Signature of Parent / Guardian</div>
                                    <div className='font-bold'>:</div>
                                    <div className='ml-2 w-72 border-black border-b'></div>
                                </div>
                            </div>

                            {/* Note Section */}
                            <div className='mt-12 space-y-4 pt-4 text-[13px]'>
                                <div className='font-bold text-base'>NOTE :</div>
                                <ol className='list-decimal space-y-2 pl-6 font-bold text-gray-800'>
                                    <li>Kindly fill the admission form and submit in the office.</li>
                                    <li>
                                        The printed form along with two photographs and the following documents to be submitted in the
                                        school office.
                                        <ol className='mt-1 list-[lower-alpha] space-y-1 pl-6 font-normal'>
                                            <li>Birth Certificate</li>
                                            <li>Caste Certificate</li>
                                            <li>Medical Certificate (Original)</li>
                                            <li>Transfer Certificate from the last school attended (Original)</li>
                                            <li>Marksheet of the last examination (Photo Copy)</li>
                                        </ol>
                                    </li>
                                    <li>Incomplete form will be rejected. Application fees is non-refundable.</li>
                                    <li>Submission of application form does not guarantee admission.</li>
                                    <li>
                                        Admission will be confirmed once the printed admission form along with the above attested documents
                                        are submitted in the school office.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tutorial Modal */}
            <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
                <DialogContent className='max-w-3xl border-none bg-white p-6'>
                    <div className='flex flex-col items-center'>
                        <div className='flex w-full justify-end'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setShowTutorial(false)}
                                className='text-gray-500 hover:text-black'>
                                Close
                            </Button>
                        </div>
                        <div className='mt-2 flex w-full justify-center border bg-gray-50 p-2 shadow-lg'>
                            {/* Placeholder tutorial image simulating the print dialog screenshot */}
                            <div className='flex h-[600px] w-full flex-col border border-gray-300 bg-white p-4 shadow-sm'>
                                <div className='mb-4 border-b pb-2 font-medium text-xl'>Print</div>
                                <div className='flex gap-4'>
                                    <div className='w-64 space-y-4'>
                                        <div className='font-semibold text-sm'>Destination</div>
                                        <div className='flex justify-between rounded border border-blue-500 bg-blue-50 p-2 text-sm'>
                                            Save as PDF <span className='font-bold text-blue-500'>▼</span>
                                        </div>
                                        <div className='mt-8 border-t pt-4 text-center text-gray-500 text-sm'>
                                            Make sure Destination is set to "Save as PDF" to save a copy.
                                        </div>
                                    </div>
                                    <div className='flex flex-1 items-center justify-center border border-gray-200 bg-gray-100'>
                                        <div className='flex h-80 w-64 items-start justify-center border bg-white pt-8 text-gray-400 shadow-md'>
                                            Preview Area
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
