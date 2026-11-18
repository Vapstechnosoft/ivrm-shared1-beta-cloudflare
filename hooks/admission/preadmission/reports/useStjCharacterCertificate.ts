import { useMutation, useQuery } from '@tanstack/react-query';
import {
    getCharacterLoadData,
    getCharacterSearchFilter,
    getCharacterStudDetails
} from '../../../../server/admission/preadmission/reports/stj_character_certificate';

export const useStjCharacterCertificate = () => {
    const loadData = useQuery({
        queryKey: ['stjCharacterCertificateLoadData'],
        queryFn: () => getCharacterLoadData()
    });

    const searchFilterMutation = useMutation({
        mutationFn: (data: {
            filterinitialdata: string;
            searchfilter: string;
            ASMAY_Id: number;
            AMST_SOL: string;
            ASMCL_Id: number;
            ASMS_Id: number;
            allorindid: string;
        }) => getCharacterSearchFilter(data)
    });

    const studDetailsMutation = useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMC_Id: number;
            AMST_Id: number;
        }) => getCharacterStudDetails(data)
    });

    return {
        loadData,
        searchFilterMutation,
        studDetailsMutation
    };
};
