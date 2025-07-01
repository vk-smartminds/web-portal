import useLogin from "./useLogin";
import LoginForm from "./LoginForm";

export default function Login() {
  const loginProps = useLogin();
  return <LoginForm {...loginProps} />;
} 