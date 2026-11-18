'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvailableExams } from '@/server/naac/lp-online-exam/student-exam';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function StudentExamPage() {
    const router = useRouter();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadExams = async () => {
        setLoading(true);
        try {
            const res = await getAvailableExams();
            if (res.success) {
                setExams(res.data || []);
            } else {
                toast.error(`API Error: ${res.message}`);
            }
        } catch (error) {
            toast.error(error?.message || 'Failed to load your exams');
            console.error('PAGE ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, []);

    const startExam = (_examId: number) => {
        router.push('/StudentPortal/student-dashboard/Exam/OnlineMcqQuiz');
    };

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <h1 className='mb-8 font-bold text-3xl tracking-tight'>My Online Exams</h1>

            {loading ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className='animate-pulse'>
                            <CardHeader className='h-24 rounded-t-xl bg-gray-100' />
                            <CardContent className='h-32 bg-gray-50' />
                        </Card>
                    ))}
                </div>
            ) : exams.length > 0 ? (
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {exams.map((exam: any) => (
                        <Card key={exam.lpmoeeX_Id} className='border-t-4 border-t-blue-500 transition-shadow hover:shadow-lg'>
                            <CardHeader>
                                <CardTitle className='text-xl'>{exam.lpmoeeX_ExamName}</CardTitle>
                                <CardDescription>Total Marks: {exam.lpmoeeX_TotalMarks}</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='text-gray-600 text-sm'>
                                    <p>Questions: {exam.lpmoeeX_NoOfQuestion}</p>
                                    <p>Duration: {exam.lpmoeeX_Duration || 'N/A'}</p>
                                </div>
                                <Button className='w-full' onClick={() => startExam(exam.lpmoeeX_Id)}>
                                    Start Exam
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className='py-12 text-center'>
                    <CardContent>
                        <h2 className='font-semibold text-2xl text-gray-600'>No exams available</h2>
                        <p className='mt-2 text-gray-400'>You don't have any active exams assigned to you at the moment.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
