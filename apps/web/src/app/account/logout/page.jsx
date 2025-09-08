import useAuth from "@/utils/useAuth";
import { LogOut } from "lucide-react";

function MainComponent() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F6F8FA] dark:bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1E1E1E] rounded-lg border border-[#E4E8EE] dark:border-[#333333] p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#E95D5D] dark:bg-[#EF4444] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#1F2739] dark:text-[#FFFFFF] mb-2">
              Sign Out
            </h1>
            <p className="text-[#5D667E] dark:text-[#B0B0B0]">
              Are you sure you want to sign out?
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-[#E95D5D] dark:bg-[#EF4444] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#DC2626] dark:hover:bg-[#DC2626] active:bg-[#B91C1C] dark:active:bg-[#B91C1C] transition-colors"
            >
              Yes, Sign Out
            </button>
            
            <a
              href="/"
              className="w-full block text-center bg-[#0C8657] dark:bg-[#059669] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#0a6b47] dark:hover:bg-[#047857] active:bg-[#085339] dark:active:bg-[#065f46] transition-colors"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;