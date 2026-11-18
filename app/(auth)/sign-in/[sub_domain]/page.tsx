import { ThemeProvider } from 'next-themes';
import SigninForm from '../SigninForm';

export default function Page() {
    return (
        <ThemeProvider forcedTheme='light'>
            <SigninForm />
        </ThemeProvider>
    );
}

