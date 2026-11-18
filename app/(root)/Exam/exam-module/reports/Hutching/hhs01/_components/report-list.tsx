'use client';

import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ReportListProps {
    data: any;
    academicYearName: string;
    classNameVal: string;
    sectionNameVal: string;
    reOpenDate: Date | null;
}

export const ReportList = ({ data, academicYearName, classNameVal, sectionNameVal, reOpenDate }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: reportRef,
        documentTitle: `HHS01_Report_${academicYearName}_${classNameVal}_${sectionNameVal}`
    });

    const stuDetails = data?.studentDetails?.[0] || data?.stu_details?.[0] || {};
    const fillTerms = data?.terms || data?.fillterms || [];
    const fillSkills = data?.skills || data?.fillskills || [];
    const fillSkillArea = data?.skillAreas || data?.fillskillarea || [];
    const fillTermMarks = data?.skillMarks || data?.filltermmarks || [];

    // Pre-processing areas for skills
    const processedSkills = fillSkills.map((skill: any) => ({
        ...skill,
        areas: fillSkillArea.filter((area: any) => area.ecS_Id === skill.ecS_Id)
    }));

    return (
        <Card className='w-full rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg'>
            <div className='mb-4 flex justify-end'>
                <Button onClick={handlePrint} className='bg-primary text-white'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <CardContent>
                <div ref={reportRef} id='hhs01-print-area' className='min-h-screen bg-white p-4 text-black print:p-8'>
                    <style>{`
                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 10mm;
                            }
                            body {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            body * {
                                visibility: hidden !important;
                            }
                            #hhs01-print-area,
                            #hhs01-print-area * {
                                visibility: visible !important;
                            }
                            #hhs01-print-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                margin: 0;
                                padding: 0;
                                background: white;
                            }
                            .page-break { page-break-after: always; }
                        }
                    `}</style>

                    {/* First Page */}
                    <section className='page-break flex flex-col items-center'>
                        <div className='mb-6 text-center'>
                            <h1 className='font-bold font-serif text-3xl'>
                                Hutchings
                                <br />
                                High School & Junior College
                            </h1>
                            <h4 className='mt-2 text-sm'>
                                (Affiliated to the Council for the Indian School Certificate Examination, New Delhi)
                            </h4>
                        </div>

                        <div className='my-6'>
                            <img
                                src='/images/Clients/Hutchings/ProgressReports/hhlogo.png'
                                alt='Hutchings Logo'
                                className='mx-auto h-[90px] w-auto object-contain'
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/tunbridge_logo.png';
                                }}
                            />
                        </div>

                        <div className='my-6 text-center'>
                            <h3 className='font-bold text-lg'>ACADEMIC YEAR</h3>
                            <div className='mt-2 inline-block border-2 border-black px-8 py-2 font-semibold'>{academicYearName}</div>
                        </div>

                        <div className='mt-8 mb-12'>
                            {stuDetails?.amsT_Photoname ? (
                                <img
                                    src={stuDetails.amsT_Photoname}
                                    alt='Student Photo'
                                    className='h-[130px] w-[120px] border border-gray-400 bg-white object-cover'
                                />
                            ) : (
                                <div className='flex h-[130px] w-[120px] items-center justify-center border border-gray-400 bg-gray-100 text-sm'>
                                    No Photo
                                </div>
                            )}
                        </div>

                        <div className='mx-auto w-full max-w-md space-y-4'>
                            <div className='flex text-lg'>
                                <div className='w-32 flex-shrink-0'>My Name is</div>
                                <div className='flex-grow border-black border-b-2 text-center font-semibold'>
                                    {stuDetails.stuname || ''}
                                </div>
                            </div>
                            <div className='flex text-lg'>
                                <div className='w-32 flex-shrink-0'>I Study in Class</div>
                                <div className='flex-grow border-black border-b-2 text-center font-semibold'>
                                    {stuDetails.asmcL_ClassName || classNameVal}
                                </div>
                            </div>
                            <div className='flex text-lg'>
                                <div className='w-32 flex-shrink-0'>I was born on</div>
                                <div className='flex-grow border-black border-b-2 text-center font-semibold'>
                                    {stuDetails.amsT_DOB ? format(new Date(stuDetails.amsT_DOB), 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                        </div>

                        <div className='mt-auto pt-20 text-center font-semibold text-sm'>
                            7, Phayre Road, Pune-411040. Tell.: 020-26352764 <br /> website: www.hutchingsschoolpune.in
                        </div>
                    </section>

                    {/* Second Page */}
                    <section className='page-break min-h-screen bg-[#fff8c6] p-4'>
                        <div className='mb-8 flex items-end justify-between'>
                            <div className='w-1/2'>
                                {/* Placeholder for label image */}
                                <div className='mb-2 h-8 bg-gray-200'></div>
                            </div>
                            <div className='flex gap-8 px-8'>
                                {fillTerms.map((term: any) => (
                                    <div key={term.ecT_Id} className='text-center'>
                                        <div className='mb-2 font-bold'>{String(term.ecT_TermName).toUpperCase()}</div>
                                        <div className='mx-auto h-8 w-16 border border-black bg-white'></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='space-y-8'>
                            {processedSkills.map((skill: any, idx: number) => (
                                <div key={skill.ecS_Id} className='w-full'>
                                    <h4 className='mb-2 font-bold text-lg'>{skill.ecS_SkillName}</h4>

                                    <div className='flex gap-4'>
                                        <div className='w-2/5'>
                                            <table className='w-full'>
                                                <tbody>
                                                    {skill.areas.map((area: any, index: number) => (
                                                        <tr key={area.ecsA_Id}>
                                                            <td className='py-1'>
                                                                {index + 1}. &nbsp; {area.ecsA_SkillArea}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className='w-3/5'>
                                            <table className='w-full border-collapse border border-black bg-white'>
                                                <thead>
                                                    <tr>
                                                        {fillTerms.map((term: any) => (
                                                            <th key={term.ecT_Id} className='border border-black p-2 text-center'>
                                                                {term.ecT_TermName}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {skill.areas.map((area: any) => (
                                                        <tr key={area.ecsA_Id}>
                                                            {fillTerms.map((term: any) => {
                                                                const markObj = fillTermMarks.find(
                                                                    (m: any) =>
                                                                        m.ecT_Id === term.ecT_Id &&
                                                                        m.ecS_Id === skill.ecS_Id &&
                                                                        m.ecsA_Id === area.ecsA_Id
                                                                );
                                                                return (
                                                                    <td
                                                                        key={term.ecT_Id}
                                                                        className='h-8 border border-black p-2 text-center'>
                                                                        {markObj ? markObj.ecsT_Score : ''}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='mt-12 w-80'>
                            <div className='flex font-bold'>
                                <div className='w-40'>SCHOOL REOPENS:</div>
                                <div className='flex-grow border-black border-b-2 text-center'>
                                    {reOpenDate ? format(reOpenDate, 'dd/MM/yyyy') : ''}
                                </div>
                            </div>
                        </div>

                        <div className='mt-12 border-2 border-black p-4'>
                            <div className='mb-16 flex font-bold'>
                                <div className='w-32'>Promoted To</div>
                                <div className='max-w-[200px] flex-grow border-black border-b-2'></div>
                            </div>

                            <div className='flex items-end justify-between px-4'>
                                <div className='w-40 text-center'>
                                    <div className='mb-2 h-8 border-black border-b-2'></div>
                                    Teacher's signature
                                </div>
                                <div className='w-40 text-center'>
                                    <div className='mb-2 h-8 border-black border-b-2'></div>
                                    Principal's signature
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </CardContent>
        </Card>
    );
};
