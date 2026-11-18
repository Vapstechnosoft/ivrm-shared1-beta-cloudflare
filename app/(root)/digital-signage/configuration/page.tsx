'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useSignage } from '@/hooks/digital-signage/useSignage';
import { motion } from 'framer-motion';
import { Clock, Globe, Key, Loader2, Monitor, Save, Settings, ShieldCheck, Zap } from 'lucide-react';
import { useMemo } from 'react';

export default function DigitalSignageConfiguration() {
    const { useDisplays } = useSignage();
    const { data: displaysRes, isLoading: isDisplaysLoading } = useDisplays(1);

    const displayData = useMemo(() => {
        return Array.isArray(displaysRes?.data) ? displaysRes.data : [];
    }, [displaysRes]);

    const activeClients = useMemo(() => {
        return displayData.filter((d: any) => d.statusDescription === 'Logged In').length;
    }, [displayData]);

    const totalDisplays = displayData.length;

    return (
        <div className='container mx-auto space-y-8 p-6'>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='flex items-center justify-between'>
                <div>
                    <h1 className='flex items-center gap-2 font-bold text-3xl text-orange-600 tracking-tight'>
                        <Settings className='h-8 w-8' />
                        Signage Configuration
                    </h1>
                    <p className='mt-1 text-muted-foreground'>Configure the Xibo Flask API and system-wide signage parameters.</p>
                </div>
                <Button className='bg-orange-600 shadow-lg transition-all hover:bg-orange-700 hover:shadow-orange-500/20'>
                    <Save className='mr-2 h-4 w-4' /> Save Configuration
                </Button>
            </motion.div>

            <div className='grid gap-6 md:grid-cols-2'>
                {/* API Settings */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Globe className='h-5 w-5' />
                                API Connection
                            </CardTitle>
                            <CardDescription>Configure connection to the Xibo Flask API service.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='api-url'>API Base URL</Label>
                                <Input
                                    id='api-url'
                                    placeholder='http://172.16.10.77:65501'
                                    defaultValue='http://172.16.10.77:65501'
                                    className='focus-visible:ring-orange-500'
                                />
                            </div>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='client-id'>Client ID</Label>
                                    <Input
                                        id='client-id'
                                        value='b95687d6...4ddb'
                                        readOnly
                                        className='bg-gray-50 focus-visible:ring-orange-500'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='api-key'>Secret Key</Label>
                                    <div className='flex gap-2'>
                                        <Input
                                            id='api-key'
                                            type='password'
                                            value='••••••••••••••••'
                                            readOnly
                                            className='bg-gray-50 focus-visible:ring-orange-500'
                                        />
                                        <Button variant='outline' size='sm' className='border-orange-200'>
                                            <Key className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Display Settings */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Monitor className='h-5 w-5' />
                                Default Display Properties
                            </CardTitle>
                            <CardDescription>Default settings for newly scheduled items.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='def-width'>Width (px)</Label>
                                    <Input
                                        id='def-width'
                                        placeholder='1920'
                                        defaultValue='1920'
                                        className='focus-visible:ring-orange-500'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='def-height'>Height (px)</Label>
                                    <Input
                                        id='def-height'
                                        placeholder='1080'
                                        defaultValue='1080'
                                        className='focus-visible:ring-orange-500'
                                    />
                                </div>
                            </div>
                            <div className='flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-2'>
                                <div className='space-y-0.5'>
                                    <Label>Portrait Mode Default</Label>
                                    <p className='text-muted-foreground text-xs'>Assume portrait orientation if not specified.</p>
                                </div>
                                <Switch className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Automation & Sync */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Clock className='h-5 w-5' />
                                Synchronization
                            </CardTitle>
                            <CardDescription>Manage how often data is refreshed from Xibo CMS.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='sync-interval'>Sync Interval (minutes)</Label>
                                <Input id='sync-interval' type='number' defaultValue='5' className='focus-visible:ring-orange-500' />
                            </div>
                            <div className='flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-2'>
                                <div className='space-y-0.5'>
                                    <Label>Auto-cleanup Media</Label>
                                    <p className='text-muted-foreground text-xs'>Remove expired media from server automatically.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Security */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                    <Card className='border-orange-100 shadow-sm'>
                        <CardHeader className='pb-3'>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <ShieldCheck className='h-5 w-5' />
                                Security Protocols
                            </CardTitle>
                            <CardDescription>Manage access control and authentication.</CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-2'>
                                <div className='space-y-0.5'>
                                    <Label>Force SSL</Label>
                                    <p className='text-muted-foreground text-xs'>Require HTTPS for all API requests.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                            <div className='flex items-center justify-between rounded-lg border border-orange-100 bg-orange-50/50 p-2'>
                                <div className='space-y-0.5'>
                                    <Label>Audit Logging</Label>
                                    <p className='text-muted-foreground text-xs'>Log all upload and schedule actions.</p>
                                </div>
                                <Switch defaultChecked className='data-[state=checked]:bg-orange-500' />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Advanced Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className='md:col-span-2'>
                    <Card className='border-orange-100 bg-gradient-to-br from-white to-orange-50/30'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2 text-orange-900'>
                                <Zap className='h-5 w-5' />
                                System Status & Resources
                            </CardTitle>
                            <CardDescription>Real-time telemetry of the signage service.</CardDescription>
                        </CardHeader>
                        <CardContent className='grid gap-4 md:grid-cols-4'>
                            <div className='rounded-xl border border-orange-100 bg-white/50 p-4 backdrop-blur-sm'>
                                <Label className='font-bold text-orange-600'>API Status</Label>
                                <p className='mt-1 font-bold text-2xl text-green-600'>Online</p>
                                <p className='text-muted-foreground text-xs'>Service reachable</p>
                            </div>
                            <div className='rounded-xl border border-orange-100 bg-white/50 p-4 backdrop-blur-sm'>
                                <Label className='font-bold text-orange-600'>Active Clients</Label>
                                <p className='mt-1 font-bold text-2xl'>
                                    {isDisplaysLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : activeClients}
                                </p>
                                <p className='text-muted-foreground text-xs'>{totalDisplays} total displays</p>
                            </div>
                            <div className='rounded-xl border border-orange-100 bg-white/50 p-4 backdrop-blur-sm'>
                                <Label className='font-bold text-orange-600'>Storage</Label>
                                <p className='mt-1 font-bold text-2xl'>--%</p>
                                <p className='text-muted-foreground text-xs'>Checking resources...</p>
                            </div>
                            <div className='rounded-xl border border-orange-100 bg-white/50 p-4 backdrop-blur-sm'>
                                <Label className='font-bold text-orange-600'>Version</Label>
                                <p className='mt-1 font-bold text-2xl'>v2.4.1</p>
                                <p className='text-muted-foreground text-xs'>System current</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
