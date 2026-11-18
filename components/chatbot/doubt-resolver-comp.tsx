'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Calculator, Send, Sparkles, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

function formatMathContent(text: string): string {
    if (!text) return '';
    return text
        // Replace display math \[ ... \] with $$ ... $$
        .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => `\n\n$$\n${math.trim()}\n$$\n\n`)
        // Replace inline math \( ... \) with $ ... $
        .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => `$${math.trim()}$`);
}

type TabType = 'Numbers' | 'Basic Math' | 'Roots' | 'Trigonometry' | 'Logarithms' | 'Factorial' | 'Statistics' | 'Constants' | 'Fractions' | 'Quadratic' | 'X & Y Vars';

const getTabIcon = (tab: TabType, isActive: boolean) => {
    const textClass = isActive 
        ? "text-[9px] font-bold text-white bg-white/20 px-1 rounded flex-shrink-0" 
        : "text-[9px] font-bold text-slate-600 bg-slate-200/60 px-1 rounded flex-shrink-0";

    switch(tab) {
        case 'Numbers':
            return <span className="text-xs flex-shrink-0">🔢</span>;
        case 'Basic Math':
            return <span className="text-xs flex-shrink-0">➕</span>;
        case 'Roots':
            return <span className="text-xs flex-shrink-0">√</span>;
        case 'Trigonometry':
            return <span className="text-xs flex-shrink-0">📐</span>;
        case 'Logarithms':
            return <span className={textClass}>log</span>;
        case 'Factorial':
            return <span className={textClass}>n!</span>;
        case 'Statistics':
            return <span className="text-xs flex-shrink-0">📊</span>;
        case 'Constants':
            return <span className="text-xs flex-shrink-0">∞</span>;
        case 'Fractions':
            return <span className={textClass}>a/b</span>;
        case 'Quadratic':
            return <span className={textClass}>ax²</span>;
        case 'X & Y Vars':
            return <span className={textClass}>x,y</span>;
    }
};

export default function DoubtResolverComp() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showCalculator, setShowCalculator] = useState(false);

    // Calculator states
    const [calcResult, setCalcResult] = useState('');
    const [activeTab, setActiveTab] = useState<TabType>('Numbers');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState<string>('calc(100vh - 212px)');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const footer = document.querySelector('footer');
                const footerHeight = footer ? footer.offsetHeight : 60;
                const availableHeight = window.innerHeight - rect.top - footerHeight;
                setContainerHeight(`${availableHeight}px`);
            }
        };

        updateHeight();
        const timer = setTimeout(updateHeight, 100);

        window.addEventListener('resize', updateHeight);
        return () => {
            window.removeEventListener('resize', updateHeight);
            clearTimeout(timer);
        };
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (textToSend?: string) => {
        const text = (textToSend || query).trim();
        if (!text) return;

        // Reset query
        setQuery('');

        const userMsg: Message = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: text
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await fetch('https://ai-doubt.vercel.app/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: text })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response from doubt resolver API');
            }

            const data = await response.json();

            if (data.success && data.answer) {
                const assistantMsg: Message = {
                    id: Math.random().toString(36).substring(7),
                    role: 'assistant',
                    content: data.answer
                };
                setMessages((prev) => [...prev, assistantMsg]);
            } else {
                throw new Error(data.answer || 'Something went wrong. Please try again.');
            }
        } catch (error: any) {
            console.error('Error hitting chat API:', error);
            toast.error(error.message || 'Error occurred while contacting resolver service.');
            const errorMsg: Message = {
                id: Math.random().toString(36).substring(7),
                role: 'assistant',
                content: `⚠️ **Error**: ${error.message || 'Could not connect to the doubt resolver service. Please verify your internet connection and try again.'}`
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
            // Re-focus input
            inputRef.current?.focus();
        }
    };

    // Microphone / Speech recognition
    const handleMicClick = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            toast.error('Speech recognition is not supported in this browser.');
            return;
        }

        if (isListening) {
            setIsListening(false);
            return;
        }

        setIsListening(true);
        toast.info('Listening for your query...');

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setQuery(transcript);
            setIsListening(false);
            toast.success('Voice input received!');
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event);
            setIsListening(false);
            toast.error('Voice input error. Please try again.');
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    // Scientific Calculator Logic
    const solveEquationOrMath = (expr: string) => {
        if (!expr.trim()) {
            setCalcResult('');
            return;
        }

        // 1. Check if it's an equation (contains '=')
        if (expr.includes('=')) {
            try {
                const parts = expr.split('=');
                const lhs = parts[0].replace(/\s+/g, '');
                const rhs = parts[1]?.replace(/\s+/g, '') || '0';

                // Try solving quadratic: ax^2 + bx + c = 0
                let a = 0, b = 0, c = 0;

                // Match ax^2 or x^2
                const x2Match = lhs.match(/([+-]?\d*)\*?x\^2/);
                if (x2Match) {
                    const coeff = x2Match[1];
                    if (coeff === '' || coeff === '+') a = 1;
                    else if (coeff === '-') a = -1;
                    else a = parseFloat(coeff);
                }

                // Match bx or x (not x^2)
                const xMatch = lhs.match(/([+-]?\d*)\*?x(?!2|\^2)/);
                if (xMatch) {
                    const coeff = xMatch[1];
                    if (coeff === '' || coeff === '+') b = 1;
                    else if (coeff === '-') b = -1;
                    else b = parseFloat(coeff);
                }

                // Match constants
                const remainder = lhs.replace(/[+-]?\d*\*?x\^2/, '').replace(/[+-]?\d*\*?x/, '');
                if (remainder) {
                    const numbers = remainder.match(/[+-]?\d+(\.\d+)?/g);
                    if (numbers) {
                        c = numbers.reduce((sum, val) => sum + parseFloat(val), 0);
                    }
                }

                // Deduct RHS constant if any
                const rhsVal = parseFloat(rhs);
                if (!isNaN(rhsVal)) {
                    c -= rhsVal;
                }

                if (a !== 0) {
                    const discriminant = b * b - 4 * a * c;
                    if (discriminant > 0) {
                        const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
                        const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
                        const roots = [r1, r2].sort((x, y) => x - y);
                        setCalcResult(`[${roots.map(r => Number(r.toFixed(4))).join(', ')}]`);
                    } else if (discriminant === 0) {
                        const r = -b / (2 * a);
                        setCalcResult(`[${Number(r.toFixed(4))}]`);
                    } else {
                        const real = -b / (2 * a);
                        const imag = Math.sqrt(-discriminant) / (2 * a);
                        setCalcResult(`[${real.toFixed(2)} + ${imag.toFixed(2)}i, ${real.toFixed(2)} - ${imag.toFixed(2)}i]`);
                    }
                } else if (b !== 0) {
                    const xVal = -c / b;
                    setCalcResult(`[${Number(xVal.toFixed(4))}]`);
                } else {
                    setCalcResult('No variable found');
                }
            } catch (err) {
                setCalcResult('Error solving');
            }
            return;
        }

        // 2. Evaluate math expression standard
        try {
            let formatted = expr
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/sin\((.*?)\)/g, (_, val) => `Math.sin((${val}) * Math.PI / 180)`)
                .replace(/cos\((.*?)\)/g, (_, val) => `Math.cos((${val}) * Math.PI / 180)`)
                .replace(/tan\((.*?)\)/g, (_, val) => `Math.tan((${val}) * Math.PI / 180)`)
                .replace(/csc\((.*?)\)/g, (_, val) => `(1 / Math.sin((${val}) * Math.PI / 180))`)
                .replace(/sec\((.*?)\)/g, (_, val) => `(1 / Math.cos((${val}) * Math.PI / 180))`)
                .replace(/cot\((.*?)\)/g, (_, val) => `(1 / Math.tan((${val}) * Math.PI / 180))`)
                .replace(/log\((.*?)\)/g, 'Math.log10($1)')
                .replace(/ln\((.*?)\)/g, 'Math.log($1)')
                .replace(/log2\((.*?)\)/g, 'Math.log2($1)')
                .replace(/cbrt\((.*?)\)/g, 'Math.cbrt($1)')
                .replace(/floor\((.*?)\)/g, 'Math.floor($1)')
                .replace(/ceil\((.*?)\)/g, 'Math.ceil($1)')
                .replace(/round\((.*?)\)/g, 'Math.round($1)')
                .replace(/root\((.*?),(.*?)\)/g, 'Math.pow($1, 1/($2))')
                .replace(/√\((.*?)\)/g, 'Math.sqrt($1)')
                .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)')
                .replace(/variance\((.*?)\)/g, 'variance($1)')
                .replace(/var\((.*?)\)/g, 'variance($1)')
                .replace(/\^/g, '**');

            // Handle factorial !
            formatted = formatted.replace(/(\d+)\!/g, (_, n) => {
                let fact = 1;
                for (let i = 1; i <= parseInt(n); i++) fact *= i;
                return fact.toString();
            });

            const result = new Function(
                'mean', 'med', 'std', 'variance', 'min', 'max', 'sum', 'abs', 'gcd', 'lcm', 'logBase',
                `return ${formatted}`
            )(
                (...args: number[]) => args.reduce((a, b) => a + b, 0) / args.length,
                (...args: number[]) => {
                    const sorted = [...args].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
                },
                (...args: number[]) => {
                    const avg = args.reduce((a, b) => a + b, 0) / args.length;
                    return Math.sqrt(args.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / args.length);
                },
                (...args: number[]) => {
                    const avg = args.reduce((a, b) => a + b, 0) / args.length;
                    return args.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / args.length;
                },
                (...args: number[]) => Math.min(...args),
                (...args: number[]) => Math.max(...args),
                (...args: number[]) => args.reduce((a, b) => a + b, 0),
                Math.abs,
                (x: number, y: number): number => {
                    x = Math.abs(x);
                    y = Math.abs(y);
                    while(y) {
                        var t = y;
                        y = x % y;
                        x = t;
                    }
                    return x;
                },
                (x: number, y: number): number => {
                    if (!x || !y) return 0;
                    const gcdVal = (a: number, b: number): number => {
                        a = Math.abs(a);
                        b = Math.abs(b);
                        while(b) {
                            var t = b;
                            b = a % b;
                            a = t;
                        }
                        return a;
                    };
                    return Math.abs((x * y) / gcdVal(x, y));
                },
                (x: number, base: number) => Math.log(x) / Math.log(base)
            );
            if (typeof result === 'number') {
                if (isNaN(result)) setCalcResult('NaN');
                else if (!isFinite(result)) setCalcResult('Infinity');
                else setCalcResult(Number(result.toFixed(6)).toString());
            } else {
                setCalcResult(result?.toString() || '');
            }
        } catch (err) {
            setCalcResult('Error');
        }
    };

    const handleCalcPress = (value: string) => {
        if (value === '⌫') {
            setQuery((prev) => prev.slice(0, -1));
        } else if (value === 'C') {
            setQuery('');
            setCalcResult('');
        } else {
            setQuery((prev) => prev + value);
        }
    };

    // Recalculate result whenever query changes
    useEffect(() => {
        solveEquationOrMath(query);
    }, [query]);

    const suggestedPrompts = [
        {
            title: 'Explain photosynthesis',
            desc: 'in simple biological terms',
            query: 'Explain photosynthesis in simple biological terms'
        },
        {
            title: 'Solve for x',
            desc: 'in 3x + 7 = 19 with step details',
            query: 'Solve for x in 3x + 7 = 19 with step details'
        }
    ];

    const hasStartedChat = messages.length > 0;

    // Define scientific buttons for each tab category
    const tabKeys: Record<TabType, { label: string; value: string; desc?: string }[]> = {
        'Numbers': [
            { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' }, { label: '(', value: '(', desc: 'open' },
            { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' }, { label: ')', value: ')', desc: 'close' },
            { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' }, { label: '.', value: '.', desc: 'decimal' },
            { label: '0', value: '0' }, { label: '00', value: '00' }, { label: '+', value: '+' }, { label: '-', value: '-' }
        ],
        'Basic Math': [
            { label: '+', value: '+', desc: 'Add' },
            { label: '-', value: '-', desc: 'Subtract' },
            { label: '×', value: '*', desc: 'Multiply' },
            { label: '÷', value: '/', desc: 'Divide' },
            { label: '^', value: '^', desc: 'Power' },
            { label: '%', value: '%', desc: 'Percent' },
            { label: 'mod', value: 'mod', desc: 'Modulo' },
            { label: 'abs', value: 'abs(', desc: 'Absolute' }
        ],
        'Roots': [
            { label: '√', value: '√(', desc: 'Square root' },
            { label: '∛', value: '∛(', desc: 'Cube root' },
            { label: '⁴√', value: '⁴√(', desc: '4th root' }
        ],
        'Trigonometry': [
            { label: 'sin', value: 'sin(', desc: 'Sine' },
            { label: 'cos', value: 'cos(', desc: 'Cosine' },
            { label: 'tan', value: 'tan(', desc: 'Tangent' },
            { label: 'csc', value: 'csc(', desc: 'Cosecant' },
            { label: 'sec', value: 'sec(', desc: 'Secant' },
            { label: 'cot', value: 'cot(', desc: 'Cotangent' },
            { label: 'asin', value: 'asin(', desc: 'Arc sine' },
            { label: 'acos', value: 'acos(', desc: 'Arc cosine' },
            { label: 'atan', value: 'atan(', desc: 'Arc tangent' }
        ],
        'Logarithms': [
            { label: 'log', value: 'log(', desc: 'Log base 10' },
            { label: 'ln', value: 'ln(', desc: 'Natural log' },
            { label: 'log10', value: 'log10(', desc: 'Log base 10' }
        ],
        'Factorial': [
            { label: 'n!', value: '!', desc: 'Factorial' },
            { label: 'nPr', value: 'P', desc: 'Permutations' },
            { label: 'nCr', value: 'C', desc: 'Combinations' }
        ],
        'Statistics': [
            { label: 'mean', value: 'mean(', desc: 'Average' },
            { label: 'med', value: 'med(', desc: 'Median' },
            { label: 'std', value: 'std(', desc: 'Std dev' },
            { label: 'var', value: 'var(', desc: 'Variance' },
            { label: 'min', value: 'min(', desc: 'Minimum' },
            { label: 'max', value: 'max(', desc: 'Maximum' },
            { label: 'sum', value: 'sum(', desc: 'Sum' },
            { label: 'abs', value: 'abs(', desc: 'Absolute' }
        ],
        'Constants': [
            { label: 'π', value: 'π', desc: 'Pi 3.14...' },
            { label: 'e', value: 'e', desc: 'Euler 2.71...' },
            { label: 'φ', value: '1.618033', desc: 'Golden ratio' },
            { label: '√2', value: 'sqrt(2)', desc: 'Root 2' },
            { label: '√3', value: 'sqrt(3)', desc: 'Root 3' },
            { label: '√5', value: 'sqrt(5)', desc: 'Root 5' },
            { label: 'τ', value: '6.28318', desc: 'Tau 6.28...' },
            { label: '∞', value: 'Infinity', desc: 'Infinity' }
        ],
        'Fractions': [
            { label: 'a/b', value: '/', desc: 'Numerator/Denom' },
            { label: '/', value: '/', desc: 'Divide (frac)' },
            { label: '1/2', value: '1/2', desc: 'Half' },
            { label: '1/3', value: '1/3', desc: 'One third' },
            { label: '1/4', value: '1/4', desc: 'One quarter' },
            { label: '3/4', value: '3/4', desc: 'Three quarter' },
            { label: '2/3', value: '2/3', desc: 'Two thirds' },
            { label: '5/4', value: '5/4', desc: 'Five quarter' },
            { label: 'num/', value: '/', desc: 'Custom num' },
            { label: '/den', value: '/', desc: 'Custom den' },
            { label: 'a+b/c', value: '+', desc: 'Mixed' },
            { label: 'a*b/c', value: '*', desc: 'Multiply frac' }
        ],
        'Quadratic': [
            { label: 'x²', value: 'x^2', desc: 'x squared' },
            { label: 'y²', value: 'y^2', desc: 'y squared' },
            { label: 'x²+bx', value: 'x^2+b*x', desc: 'x^2+bx' },
            { label: 'ax²', value: 'a*x^2', desc: 'a times x²' },
            { label: '+bx', value: '+b*x', desc: 'plus bx' },
            { label: '+c', value: '+c', desc: 'plus c' },
            { label: '-b/2a', value: '-b/(2*a)', desc: 'vertex x' },
            { label: 'b²-4ac', value: 'b^2-4*a*c', desc: 'discriminant' },
            { label: '√disc', value: 'sqrt(b^2-4*a*c)', desc: 'sqrt(b²-4ac)' },
            { label: 'X₁', value: '(-b+sqrt(b^2-4*a*c))/(2*a)', desc: '(-b+√D)/2a' },
            { label: 'X₂', value: '(-b-sqrt(b^2-4*a*c))/(2*a)', desc: '(-b-√D)/2a' },
            { label: 'x²-y²', value: 'x^2-y^2', desc: 'diff of sq' }
        ],
        'X & Y Vars': [
            { label: 'x', value: 'x', desc: 'Variable x' },
            { label: 'y', value: 'y', desc: 'Variable y' },
            { label: 'x²', value: 'x^2', desc: 'x squared' },
            { label: 'y²', value: 'y^2', desc: 'y squared' },
            { label: 'x³', value: 'x^3', desc: 'x cubed' },
            { label: 'y³', value: 'y^3', desc: 'y cubed' },
            { label: 'x+y', value: 'x+y', desc: 'x plus y' },
            { label: 'x-y', value: 'x-y', desc: 'x minus y' },
            { label: 'x*y', value: 'x*y', desc: 'x times y' },
            { label: 'x/y', value: 'x/y', desc: 'x divide y' },
            { label: 'x²+y²', value: 'x^2+y^2', desc: 'sum squares' },
            { label: 'x²-y²', value: 'x^2-y^2', desc: 'diff squares' }
        ]
    };

    const renderInputBar = () => {
        return (
            <div className="relative flex items-center bg-card border border-border focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 rounded-[28px] shadow-md px-5 py-3 transition-all duration-300 w-full">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={isListening ? 'Listening...' : 'Type a query or ask a doubt...'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSend();
                    }}
                    disabled={isListening}
                    className="flex-1 bg-transparent text-foreground placeholder-muted-foreground border-none outline-none focus:ring-0 text-sm py-1.5 pr-24"
                />
                
                {/* Right tools inside the chat bar */}
                <div className="absolute right-3 flex items-center gap-1">
                    <button
                        onClick={handleMicClick}
                        title="Voice query input"
                        className={`p-2.5 rounded-full transition-all duration-200 ${
                            isListening 
                                ? 'bg-destructive/10 text-destructive animate-pulse' 
                                : 'hover:bg-slate-100 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Mic className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setShowCalculator((prev) => !prev)}
                        title="Open scientific calculator"
                        className={`p-2.5 rounded-full transition-all duration-200 ${
                            showCalculator 
                                ? 'bg-primary/10 text-primary' 
                                : 'hover:bg-slate-100 text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Calculator className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !query.trim()}
                        className={`p-2.5 rounded-full transition-all duration-200 ${
                            query.trim()
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                : 'text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div 
            ref={containerRef}
            style={{ height: containerHeight }}
            className="relative flex flex-col md:flex-row w-full bg-background text-foreground overflow-hidden font-sans"
        >
            {/* Left/Main Chat Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Main Chat/Initial Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 scrollbar-hide pb-32 bg-slate-50/50">
                    <AnimatePresence mode="wait">
                        {!hasStartedChat ? (
                            <motion.div
                                key="landing"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                                className="flex flex-col items-center pt-8 pb-12 max-w-2xl mx-auto text-center px-4"
                            >
                                <div className="mb-6 p-4 rounded-3xl bg-primary/5 border border-border shadow-sm">
                                    <Sparkles className="h-12 w-12 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">
                                    What would you like to resolve today?
                                </h2>
                                <p className="text-sm text-muted-foreground mb-8 max-w-md">
                                    Ask any academic question, solve mathematical equations, or explain complex concepts instantly.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mb-8">
                                    {suggestedPrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSend(prompt.query || `${prompt.title} ${prompt.desc}`)}
                                            className="text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all hover:bg-slate-50 group"
                                        >
                                            <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                                                {prompt.title}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                {prompt.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {/* Direct child of the landing flex flow: cannot overlap! */}
                                <div className="w-full max-w-xl">
                                    {renderInputBar()}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="max-w-3xl mx-auto space-y-6">
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setMessages([]);
                                            setQuery('');
                                        }}
                                        className="text-xs text-muted-foreground hover:text-foreground rounded-xl bg-card border-border shadow-sm"
                                    >
                                        Reset Chat
                                    </Button>
                                </div>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                                                <Sparkles className="h-4 w-4" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[88%] rounded-3xl px-6 py-4 text-sm leading-relaxed shadow-sm ${
                                                msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                                            }`}
                                        >
                                            {msg.role === 'user' ? (
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                            ) : (
                                                <div className="math-markdown-content overflow-x-auto text-slate-800">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                        components={{
                                                            p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,
                                                            strong: ({ children }) => <strong className="font-bold text-slate-900 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{children}</strong>,
                                                            h1: ({ children }) => <h1 className="text-lg font-black text-purple-800 border-b pb-1.5 mt-4 mb-2">{children}</h1>,
                                                            h2: ({ children }) => <h2 className="text-base font-black text-purple-700 border-b pb-1 mt-3 mb-2">{children}</h2>,
                                                            h3: ({ children }) => <h3 className="text-sm font-bold text-purple-600 mt-3 mb-1.5">{children}</h3>,
                                                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2 pl-1">{children}</ul>,
                                                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2 pl-1">{children}</ol>,
                                                            li: ({ children }) => <li className="text-slate-800">{children}</li>,
                                                            blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-400 bg-purple-50 p-3 rounded-r-lg italic my-2">{children}</blockquote>
                                                        }}
                                                    >
                                                        {formatMathContent(msg.content)}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                        {msg.role === 'user' && (
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 border border-border flex items-center justify-center text-slate-600">
                                                <User className="h-4 w-4" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4 justify-start">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-spin">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <div className="bg-card text-muted-foreground border border-border rounded-3xl rounded-tl-none px-5 py-3.5 text-sm flex items-center gap-2">
                                            <div className="flex space-x-1">
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span>AI is processing your query...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Bottom Input Area Container - Rendered absolutely ONLY after conversation starts */}
                {hasStartedChat && (
                    <div className="absolute left-0 right-0 bottom-6 px-4 z-40">
                        <div className="max-w-2xl mx-auto w-full">
                            {renderInputBar()}
                        </div>
                    </div>
                )}
            </div>

            {/* High-Fidelity Scientific Math Engine Calculator Sidebar */}
            <AnimatePresence>
                {showCalculator && (
                    <motion.div
                        initial={isMobile ? { x: '100%' } : { width: 0, opacity: 0 }}
                        animate={isMobile ? { x: 0 } : { width: 460, opacity: 1 }}
                        exit={isMobile ? { x: '100%' } : { width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className={`${
                            isMobile 
                                ? 'absolute inset-y-0 right-0 z-50 w-full h-full border-l border-slate-200 shadow-2xl' 
                                : 'relative h-full border-l border-slate-200 z-50'
                        } bg-white flex flex-col overflow-hidden`}
                    >
                        <div className="w-full md:w-[460px] h-full p-4 flex flex-col font-sans select-none overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2 flex-shrink-0">
                                <h3 className="text-base font-bold text-slate-800 tracking-tight">AI Math Engine</h3>
                                <button 
                                    onClick={() => setShowCalculator(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex gap-2 mb-2 flex-shrink-0">
                                <button
                                    onClick={() => handleCalcPress('⌫')}
                                    className="flex-1 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
                                    title="Backspace"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                                    </svg>
                                    Backspace
                                </button>
                                <button
                                    onClick={() => handleCalcPress('C')}
                                    className="flex-1 py-1.5 rounded-lg bg-[#801c1c] hover:bg-[#992222] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                    title="Clear"
                                >
                                    Clear All (C)
                                </button>
                            </div>

                            {/* Answer Output Block */}
                            <div className="bg-[#f5f5f5] border border-slate-200 rounded-lg px-3 py-2 mb-2 flex items-center justify-between min-h-[48px] flex-shrink-0">
                                <div className="text-xs text-slate-700 font-mono truncate max-w-[70%]">
                                    {query || ' '}
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-base font-bold text-slate-900 font-mono leading-none">
                                        {calcResult || '—'}
                                    </span>
                                    {!query && (
                                        <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                                            Enter an expression
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Steps Banner */}
                            <div className="bg-[#121212] text-white rounded-lg px-3 py-1.5 text-xs font-bold mb-2 select-none flex-shrink-0">
                                Steps
                            </div>

                            {/* Split scientific controls */}
                            <div className="flex border border-slate-200 rounded-lg overflow-hidden flex-1 min-h-[200px] bg-white">
                                {/* Left tab selector sidebar */}
                                <div className="w-[130px] border-r border-slate-200 bg-[#f8f9fa] flex flex-col overflow-y-auto">
                                    {(Object.keys(tabKeys) as TabType[]).map((tab) => {
                                        const isActive = activeTab === tab;
                                        return (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-2 py-1.5 text-left text-[11px] font-medium transition-all border-b border-slate-200/60 last:border-b-0 flex items-center gap-1.5 ${
                                                    isActive 
                                                        ? 'bg-[#1860a8] text-white' 
                                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                            >
                                                {getTabIcon(tab, isActive)}
                                                <span className="truncate">{tab}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Right button grid */}
                                <div className="flex-1 grid grid-cols-4 gap-[1px] bg-slate-200 overflow-y-auto content-start">
                                    {tabKeys[activeTab].map((btn, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (btn.value === '!') {
                                                    handleCalcPress('!');
                                                } else {
                                                    handleCalcPress(btn.value);
                                                }
                                            }}
                                            className="h-[48px] bg-white hover:bg-slate-50 text-slate-800 transition-colors flex flex-col items-center justify-center p-1 select-none active:bg-slate-100"
                                        >
                                            <span className="text-xs font-bold text-slate-800">{btn.label}</span>
                                            {btn.desc && (
                                                <span className="text-[8px] text-slate-400 font-normal leading-none mt-0.5 text-center truncate w-full px-0.5">
                                                    {btn.desc}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {/* Fill empty grid spots to keep alignment neat */}
                                    {tabKeys[activeTab].length % 4 !== 0 && 
                                        Array.from({ length: 4 - (tabKeys[activeTab].length % 4) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="h-[48px] bg-white border-none" />
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .scrollbar-hide::-webkit-scrollbar {
                    display: none !important;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
            `}} />
        </div>
    );
}
