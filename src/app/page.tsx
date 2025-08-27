"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { useSession } from "@/hooks/useSession";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const { data, loading, error, login } = useSession();

  useEffect(() => {
    if (data?.authenticated) router.replace(ROUTES.pages.dashboard);
  }, [data?.authenticated, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-lg font-semibold">Sign in</h1>
          <p className="text-sm text-white/70">Access your alert dashboard</p>
        </CardHeader>
        <CardContent>
          {loading && (
            <p className="text-sm text-white/70">Checking session…</p>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
          {!loading && !data?.authenticated && (
            <Button onClick={async () => login()} className="w-full">
              Continue with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
