import { Getdetails, get_SportsName, get_class, get_uom_Name, showdetails } from '@/server/sports/reports/srkvs-sports-report';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useSRKVSSportsReport = () => {
    // Initial Load
    const loadData = useQuery({
        queryKey: ['srkvsSportsReportDropdowns'],
        queryFn: async () => {
            const response = await Getdetails({});
            return response.data;
        }
    });

    // Cascading Mutations
    const getClass = useMutation({
        mutationFn: async (data: { asmaY_Id: number }) => {
            const response = await get_class(data);
            return response.data;
        }
    });

    const getSportsName = useMutation({
        mutationFn: async (data: { asmaY_Id: number; spccmsccG_Id: number }) => {
            const response = await get_SportsName(data);
            return response.data;
        }
    });

    const getUomName = useMutation({
        mutationFn: async (data: { asmaY_Id: number; spccmscC_Id: number }) => {
            const response = await get_uom_Name(data);
            return response.data;
        }
    });

    // Generate Report
    const generateReport = useMutation({
        mutationFn: async (data: any) => {
            const response = await showdetails(data);
            return response.data;
        }
    });

    return {
        loadData,
        getClass,
        getSportsName,
        getUomName,
        generateReport
    };
};
