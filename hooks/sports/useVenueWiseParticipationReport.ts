import {
    getDetails,
    getInitialData,
    getReportData,
    getSections,
    getStudentData
} from '@/server/sports/transactions/sport-venuewise-participation-report';
import type {
    ISportVenueWiseParticipationReportClass,
    ISportVenueWiseParticipationReportHouse,
    ISportVenueWiseParticipationReportPayload,
    ISportVenueWiseParticipationReportSection,
    ISportVenueWiseParticipationReportStudent,
    ISportVenueWiseParticipationReportVenue,
    ISportVenueWiseParticipationReportYear
} from '@/types/sports/reports/venue-wise-participation-report';
import { useEffect, useState } from 'react';

export const useVenueWiseParticipationReport = () => {
    const [years, setYears] = useState<ISportVenueWiseParticipationReportYear[]>([]);
    const [classes, setClasses] = useState<ISportVenueWiseParticipationReportClass[]>([]);
    const [sections, setSections] = useState<ISportVenueWiseParticipationReportSection[]>([]);
    const [students, setStudents] = useState<ISportVenueWiseParticipationReportStudent[]>([]);
    const [venues, setVenues] = useState<ISportVenueWiseParticipationReportVenue[]>([]);
    const [houses, setHouses] = useState<ISportVenueWiseParticipationReportHouse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const response = await getInitialData();
                if (response.success && response.data) {
                    setYears(response.data.yearlist || []);
                    // Initial load typically only guarantees years based on similar reports,
                    // but we will see if we need to load others.
                } else {
                    setError(response.message || 'Failed to load initial data');
                }
            } catch (err) {
                setError('An error occurred while loading initial data');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const fetchClasses = async (asmaY_Id: number) => {
        try {
            setLoading(true);
            const response = await getDetails({ asmaY_Id });
            if (response.success && response.data) {
                setClasses(response.data.classList || []);
                setVenues(response.data.venueList || []);
                setHouses(response.data.houseList || []);
            }
        } catch (err) {
            console.error('Error fetching classes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (asmaY_Id: number, asmcL_Id: number) => {
        try {
            setLoading(true);
            const response = await getSections({ asmaY_Id, asmcL_Id });
            if (response.success && response.data) {
                setSections(response.data.sectionList || []);
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async (asmaY_Id: number, asmcL_Id: number, asmS_Id: number) => {
        try {
            setLoading(true);
            const response = await getStudentData({ asmaY_Id, asmcL_Id, asmS_Id });
            if (response.success && response.data) {
                setStudents(response.data.studentList1 || []);
            }
        } catch (err) {
            console.error('Error fetching students:', err);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async (payload: ISportVenueWiseParticipationReportPayload) => {
        try {
            setLoading(true);
            const response = await getReportData(payload);
            if (response.success && response.data) {
                return response; // Return the full response for GenericDataTable
            } else {
                setError(response.message || 'Failed to generate report');
                return null;
            }
        } catch (err) {
            console.error('Error generating report:', err);
            setError('An error occurred while generating report');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        years,
        classes,
        sections,
        students,
        venues,
        houses,
        loading,
        error,
        fetchClasses,
        fetchSections,
        fetchStudents,
        generateReport
    };
};
