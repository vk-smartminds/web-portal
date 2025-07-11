import LoginWithPassword from "./LoginWithPassword";
import LoginWithOtp from "./LoginWithOtp";
import { Dispatch, SetStateAction } from "react";

interface LoginFormProps {
  mode: 'password' | 'otp';
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  otp: string;
  setOtp: Dispatch<SetStateAction<string>>;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export default function LoginForm(props: LoginFormProps) {
  if (props.mode === 'password') {
    return <LoginWithPassword {...props} />;
  } else {
    return <LoginWithOtp {...props} />;
  }
} 