'use client';

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavbarProps {
  title: string;
  showProfile?: boolean;
  showModels?: boolean;
  showDashboard?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  title, 
  showProfile = true, 
  showModels = true, 
  showDashboard = true 
}) => {
  const router = useRouter();
  const { logout } = useAuthContext();
  const { profile } = useUserProfile();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.replace(ROUTES.pages.home);
    }
  };

  // Check if user is admin for models access
  const isAdmin = profile?.admin === true;

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
      <div className="flex gap-3">
        <ThemeToggle />
        {showDashboard && (
          <Button
            variant="ghost"
            onClick={() => router.push(ROUTES.pages.dashboard)}
          >
            Dashboard
          </Button>
        )}
        {showProfile && (
          <Button
            variant="ghost"
            onClick={() => router.push(ROUTES.pages.profile)}
          >
            Profile
          </Button>
        )}
        {showModels && isAdmin && (
          <Button
            variant="ghost"
            onClick={() => router.push(ROUTES.pages.models)}
          >
            Models
          </Button>
        )}
        <Button variant="ghost" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};
