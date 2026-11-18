import { getAcademicYearList } from './actions';
//import { getAcademicYearList } from "./actions";

import CumulativeSubjectClient from './_components/cumulative-subject';

export default async function CumulativeSubjectPage() {
    const result = await getAcademicYearList();

    // Map response to match CumulativeSubjectLoadData interface
    // Based on logic in _components/cumulativesubject.ts which handles data extraction
    const responseData = result?.data;
    const academicYears =
        responseData?.studentYearList || responseData?.data?.studentYearList || (Array.isArray(responseData) ? responseData : []) || [];

    return (
        <div className='container mx-auto py-6'>
            <CumulativeSubjectClient
                initialData={{
                    stuyearlist: academicYears
                }}
            />
        </div>
    );
}
