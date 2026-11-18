import type { IUserAccessibleModules } from '@/types';

export const transportModule: IUserAccessibleModules = {
    id: 111,
    name: 'Transport',
    icon: 'BookOpen',
    menu: [
        {
            id: 1,
            name: 'Transport',
            icon: 'BookOpen',
            sub_menu: [
                {
                    id: 3000,
                    name: 'Masters',
                    icon: 'Database',
                    pages: [
                        {
                            id: 30001,
                            name: 'Master Area',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-area',
                            title: 'Master Area / Zone',
                            description: 'Master Area / Zone Details'
                        },
                        {
                            id: 30002,
                            name: 'Master Driver',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-driver',
                            title: 'Master Driver',
                            description: 'Master Driver Details'
                        },
                        {
                            id: 30003,
                            name: 'Master Fuel Type',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-fuel-type',
                            title: 'Master Fuel Type',
                            description: 'Master Fuel Type Details'
                        },
                        {
                            id: 30004,
                            name: 'Master Location',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-location',
                            title: 'Master Location',
                            description: 'Master Location Details'
                        },
                        {
                            id: 30005,
                            name: 'Master Route',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-route',
                            title: 'Master Route',
                            description: 'Master Route Details'
                        },
                        {
                            id: 30006,
                            name: 'Route Area Mapping',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/route-area-mapping',
                            title: 'Route Area Mapping',
                            description: 'Route Area Mapping Details'
                        },
                        {
                            id: 30007,
                            name: 'Master Service Station',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-service-station',
                            title: 'Master Service Station',
                            description: 'Master Service Station Details'
                        },
                        {
                            id: 30008,
                            name: 'Master Session',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-session',
                            title: 'Master Session',
                            description: 'Master Session Details'
                        },
                        {
                            id: 30009,
                            name: 'Master Vehicle Type',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-vehicle-type',
                            title: 'Master Vehicle Type',
                            description: 'Master Vehicle Type Details'
                        },
                        {
                            id: 30010,
                            name: 'Master Route Schedule',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-route-schedule',
                            title: 'Master Route Schedule',
                            description: 'Master Route Schedule Details'
                        },
                        {
                            id: 30011,
                            name: 'Master Vehicle',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/master-vehicle',
                            title: 'Master Vehicle',
                            description: 'Master Vehicle Details'
                        },
                        {
                            id: 30012,
                            name: 'Expiry Settings',
                            icon: 'BookOpen',
                            url: '/Transport/transport-module/masters/expiry-settings',
                            title: 'Expiry Settings',
                            description: 'Transport Expiry Settings'
                        }
                    ]
                },
                {
                    id: 3001,
                    name: 'Transactions',
                    icon: 'BookOpen',
                    pages: [
                        {
                            id: 1,
                            name: 'Route Location Mapping',
                            icon: 'Settings',
                            url: '/Transport/transport-module/transaction/route-location-mapping',
                            title: 'Route Location Mapping',
                            description: 'Manage Route Location Mapping'
                        },
                        {
                            id: 2,
                            name: 'Vehicle Driver Mapping',
                            icon: 'Settings',
                            url: '/Transport/transport-module/transaction/vehicle-driver-mapping',
                            title: 'Vehicle Driver Mapping',
                            description: 'Manage Vehicle Driver Mapping'
                        },
                        {
                            id: 3,
                            name: 'Vehicle Route Mapping',
                            icon: 'Settings',
                            url: '/Transport/transport-module/transaction/vehicle-route-mapping',
                            title: 'Vehicle Route Mapping',
                            description: 'Manage Vehicle Route Mapping'
                        }
                    ]
                },
                {
                    id: 3002,
                    name: 'Reports',
                    icon: 'BookOpen',
                    pages: [
                        {
                            id: 30201,
                            name: 'Month End Report',
                            icon: 'FileText',
                            url: '/Transport/transport-module/reports/month-end-report',
                            title: 'Month End Report',
                            description: 'Transport Month End Report'
                        }
                    ]
                }
            ]
        }
    ]
};
