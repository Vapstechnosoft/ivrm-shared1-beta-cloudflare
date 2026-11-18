import StudentComplaintsViewClient from './_components/student-complaints-view';

export default async function StudentComplaintsPage() {
    // const loadData = await getStudentComplaintsLoadData();
    // const { data: academicYears, isLoading: isAcademicYearsLoading } = useAcademicStudentCompliants();

    return (
        <div className='w-full p-4'>
            <StudentComplaintsViewClient />
        </div>
    );
}
