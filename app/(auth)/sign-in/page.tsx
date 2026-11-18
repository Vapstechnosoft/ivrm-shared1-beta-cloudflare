import { ThemeProvider } from 'next-themes';
import './signin-form.css';
import SigninForm from './SigninForm';

export default function Signin() {
    return (
        <ThemeProvider forcedTheme='light'>
            <SigninForm />
        </ThemeProvider>
    );
}
