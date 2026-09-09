"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/common/Button";
import { FormField, Input } from "@/components/common/FormControls";
import { friendlyFirebaseError } from "@/components/common/ErrorState";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { resetAdminPassword, signInAdmin } from "@/firebase/auth";
import { logAdminAction } from "@/services/adminService";
import { adminLoginSchema, forgotPasswordSchema, type AdminLoginFormValues, type ForgotPasswordFormValues } from "@/schemas/auth";

export function AdminLoginForm() {
  const router = useRouter();
  const { status } = useAdminAuth();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authorized") router.replace("/admin/dashboard");
  }, [status, router]);

  const loginForm = useForm<AdminLoginFormValues>({ resolver: zodResolver(adminLoginSchema) });
  const forgotForm = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onLogin(values: AdminLoginFormValues) {
    setError(null);
    try {
      const cred = await signInAdmin(values.email, values.password);
      await logAdminAction({
        adminUid: cred.user.uid,
        adminEmail: cred.user.email || values.email,
        action: "LOGIN",
        resource: "admin",
        resourceId: cred.user.uid,
      }).catch(() => {});
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(friendlyFirebaseError(err));
    }
  }

  async function onForgot(values: ForgotPasswordFormValues) {
    setError(null);
    setInfo(null);
    try {
      await resetAdminPassword(values.email);
      setInfo("If that email belongs to an admin account, a password reset link has been sent.");
    } catch {
      setInfo("If that email belongs to an admin account, a password reset link has been sent.");
    }
  }

  if (status === "checking" || status === "authorized") {
    return <p className="text-center text-sm text-ink-400">Checking session…</p>;
  }

  if (status === "unauthorized") {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-ink-900">Access Denied</h2>
        <p className="mt-2 text-sm text-ink-500">This account is not authorized to access the admin panel.</p>
        <Button className="mt-6" variant="outline" onClick={() => import("@/firebase/auth").then((m) => m.signOutAdmin())}>
          Back to Login
        </Button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={forgotForm.handleSubmit(onForgot)} className="space-y-4">
        <h2 className="text-lg font-semibold text-ink-900">Reset Password</h2>
        {info && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{info}</p>}
        <FormField label="Admin Email" htmlFor="forgot-email" error={forgotForm.formState.errors.email?.message}>
          <Input id="forgot-email" type="email" {...forgotForm.register("email")} />
        </FormField>
        <Button type="submit" className="w-full" loading={forgotForm.formState.isSubmitting}>
          Send Reset Link
        </Button>
        <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm text-ink-500 hover:text-ink-700">
          Back to Login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink-900">Admin Login</h2>
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <FormField label="Admin Email" htmlFor="email" error={loginForm.formState.errors.email?.message}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input id="email" type="email" className="pl-9" {...loginForm.register("email")} />
        </div>
      </FormField>
      <FormField label="Password" htmlFor="password" error={loginForm.formState.errors.password?.message}>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <Input id="password" type="password" className="pl-9" {...loginForm.register("password")} />
        </div>
      </FormField>
      <Button type="submit" className="w-full" loading={loginForm.formState.isSubmitting}>
        Login
      </Button>
      <button type="button" onClick={() => setMode("forgot")} className="w-full text-center text-sm text-ink-500 hover:text-ink-700">
        Forgot Password?
      </button>
    </form>
  );
}
