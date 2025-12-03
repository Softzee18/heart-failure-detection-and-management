import { LogOut } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function LogoutButton({ redirectTo = "/auth/login", label = "Logout" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();

    // Show success message
    toast.success("You’ve been logged out successfully.");

    setTimeout(() => {
      navigate(redirectTo, { replace: true });
    }, 800);
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        className="border text-white bg-red-500 flex items-center justify-start gap-1 cursor-pointer hover:bg-black hover:text-white px-4 py-2 rounded-md font-semibold  transition-all duration-200"
      >
        <span>
          <LogOut className="w-4 h-4 " />
        </span>
        {label}
      </button>
    </div>
  );
}
