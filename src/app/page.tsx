"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error, login, clearError } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(ROUTES.pages.dashboard);
    }
  }, [isAuthenticated, router]);

  const handleGoogleLogin = async () => {
    // For now, using mock credentials since this is a Google OAuth flow
    // In a real implementation, you'd redirect to Google OAuth
    const result = await login({
      email: "mock.user@gmail.com",
      password: "mock-password"
    });
    
    if (result.success) {
      router.replace(ROUTES.pages.dashboard);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="text-sm text-white/70">Access your alert dashboard</p>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-sm text-white/70">Checking session…</p>
          )}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
              {error}
              <button 
                onClick={clearError}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          )}
          {!isLoading && !isAuthenticated && (
            <Button onClick={handleGoogleLogin} className="w-full">
              Continue with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
