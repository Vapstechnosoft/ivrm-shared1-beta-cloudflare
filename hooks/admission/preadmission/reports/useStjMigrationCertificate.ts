import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getMigrationAcademicYearChange,
    getMigrationLoadData,
    getMigrationSearchFilter,
    getMigrationStudDetails,
    getMigrationStudentStatusChange
} from '../../../../server/admission/preadmission/reports/stj_migration_certificate';

export const useStjMigrationCertificate = () => {
    const loadData = useQuery({
        queryKey: ['stjMigrationCertificateLoadData'],
        queryFn: () => getMigrationLoadData()
    });

    const studentStatusChange = useMutation({
        mutationFn: (data: { AMST_SOL: string }) => getMigrationStudentStatusChange(data)
    });

    const academicYearChange = useMutation({
        mutationFn: (data: { ASMAY_Id: number; AMST_SOL: string }) => getMigrationAcademicYearChange(data)
    });

    const searchFilterMutation = useMutation({
        mutationFn: (data: {
            filterinitialdata: string;
            searchfilter: string;
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMC_Id: number;
            allorindid: string;
        }) => getMigrationSearchFilter(data)
    });

    const studDetailsMutation = useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
            save_flag: string;
        }) => getMigrationStudDetails(data)
    });

    return {
        loadData,
        studentStatusChange,
        academicYearChange,
        searchFilterMutation,
        studDetailsMutation
    };
};
