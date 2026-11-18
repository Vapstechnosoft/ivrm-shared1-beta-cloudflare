import { useMutation, useQuery } from '@tanstack/react-query';
import { getSmartcardLoadData, getSmartcardReportData } from '../../../../server/admission/preadmission/reports/sophia_smartcard_report';

export const useSophiaSmartcardReport = () => {
    const loadData = useQuery({
        queryKey: ['sophiaSmartcardLoadData'],
        queryFn: () => getSmartcardLoadData()
    });

    const reportMutation = useMutation({
        mutationFn: (data: {
            ASMAY_Id: number;
            ASMCL_Id: number;
            ASMS_Id: number;
            SPCCMH_Id?: number;
            stdmobilenumber: string;
        }) => getSmartcardReportData(data)
    });

    return {
        loadData,
        reportMutation
    };
};
