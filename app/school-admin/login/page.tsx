'use client';

import Logo from '@/components/layout/navigation/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, ShieldCheck, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SchoolAdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Static credential validation
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                toast.success('Login successful! Redirecting...');
                router.push('/school-admin');
            } else {
                toast.error('Invalid credentials. Hint: admin / admin123');
                setIsLoading(false);
            }
        }, 800);
    };

    return (
        <div className='flex min-h-screen items-center justify-center bg-layout p-4'>
            <Card className='card-premium w-full max-w-md overflow-hidden rounded-[32px] border-none bg-white shadow-2xl dark:bg-slate-950'>
                <div className='h-1.5 w-full bg-gradient-to-r from-primary via-purple-500 to-secondary' />

                <CardHeader className='space-y-4 pt-10 pb-6 text-center'>
                    <div className='mb-2 flex justify-center'>
                        <Logo className='h-12' />
                    </div>
                    <div className='space-y-1'>
                        <CardTitle className='font-black text-2xl text-foreground tracking-tight'>Admin Login</CardTitle>
                        <CardDescription className='font-semibold text-muted-foreground'>
                            Enter your credentials to access the portal
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className='px-8 pb-8'>
                    <form onSubmit={handleLogin} className='space-y-6'>
                        <div className='space-y-2'>
                            <Label className='ml-1 font-bold text-foreground'>Username</Label>
                            <div className='group relative'>
                                <User className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary' />
                                <Input
                                    placeholder='admin'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className='h-12 rounded-2xl border-border bg-muted/50 pl-11 font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10'
                                    required
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label className='ml-1 font-bold text-foreground'>Password</Label>
                            <div className='group relative'>
                                <Lock className='-translate-y-1/2 absolute top-1/2 left-4 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary' />
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='••••••••'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='h-12 rounded-2xl border-border bg-muted/50 pr-12 pl-11 font-medium transition-all focus:border-primary focus:ring-4 focus:ring-primary/10'
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='-translate-y-1/2 absolute top-1/2 right-4 text-muted-foreground transition-colors hover:text-primary'>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className='flex items-center justify-between px-1'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox id='remember' className='rounded border-primary text-primary' />
                                <Label htmlFor='remember' className='font-semibold text-muted-foreground text-sm'>
                                    Remember me
                                </Label>
                            </div>
                            {/* <button type="button" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
                                Forgot password?
                            </button> */}
                        </div>

                        <Button
                            type='submit'
                            className='btn-gradient h-12 w-full rounded-2xl bg-primary font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]'>
                            Sign In
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className='flex flex-col items-center border-border border-t bg-muted/30 py-4'>
                    <div className='flex items-center gap-2 font-bold text-[10px] text-muted-foreground uppercase tracking-widest'>
                        <ShieldCheck size={14} className='text-emerald-500' />
                        <span>Secure Enterprise Access</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
