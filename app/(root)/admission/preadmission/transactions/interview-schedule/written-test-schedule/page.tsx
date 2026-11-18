import { WrittenTestScheduleForm } from '@/app/(root)/admission/preadmission/transactions/interview-schedule/written-test-schedule/_components/written-test-schedule-form';
import { PageHeader } from '@/components/ui/layout/page-header';

export default function WrittenTestSchedulePage() {
    return (
        <div className='flex flex-col gap-4 p-4'>
            <PageHeader
                title='Written/Apptitude Test Schedule'
                description='This page helps the admin to schedule written test for new joining students to know the student skill sets/knowledge basis student admission would be confirmed'
            />
            <WrittenTestScheduleForm />
        </div>
    );
}
