"use client";
import dynamic from 'next/dynamic';
const Login = dynamic(() => import('../../pages/Login'), { ssr: false });

export default function LoginPage() {
  return <Login />;
}
