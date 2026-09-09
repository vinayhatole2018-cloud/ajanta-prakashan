import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-14 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400" aria-hidden />
      <p className="text-base font-medium text-red-800">Something went wrong</p>
      <p className="max-w-sm text-sm text-red-600">
        {message || "We couldn't load this data. Please check your connection and try again."}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Maps common Firebase error codes to a friendly message. Never expose raw stack traces to users. */
export function friendlyFirebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code || "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/user-not-found": "Incorrect email or password.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "permission-denied": "You don't have permission to do that.",
    unavailable: "Service is temporarily unavailable. Please try again shortly.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
