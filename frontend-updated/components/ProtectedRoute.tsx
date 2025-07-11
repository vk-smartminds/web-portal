import { useEffect } from "react";
import { useRouter } from "next/router";
import { isAuthenticated } from "../utils/auth";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/LoginPage");
    }
  }, [router]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
} 