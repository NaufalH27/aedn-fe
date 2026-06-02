import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { logout } from "../services/AuthService";
import useAuthStore from "../store/AuthStore";
import { toast } from "./toast";
import { ChevronDownIcon } from "lucide-react";
import { LoadingIndicator } from "./loading-indicator";

type LogoutState =
  | { status: "loading" }
  | { status: "success"; }
  | { status: "error"; error: string };


export default function Topbar() {
  const authState = useAuthStore((s) => s.authState);

  const [logoutState, setLogoutState] = useState<LogoutState>({status: "loading",});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigate = useNavigate()
  const handleLogout = async() => {
    setLogoutState({status: "loading"});
    try {
       await logout();
       navigate("/")
       toast("success", "Logout Successfully")
      setLogoutState({status: "success"});
    } catch (error) {
      const errMsg =  error instanceof Error ? error.message : "Unknown Error"
      toast("error", errMsg)
      setLogoutState({status: "error", error: errMsg})
    }
  };

  const navLinks = [
    { name: "My Works", path: "/" },
    { name: "About Me", path: "/" },
    { name: "Contact", path: "/" },
    { name: "Open Commissions", path: "/commissions" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-extrabold tracking-tighter transition-opacity hover:opacity-80">
                <span className="text-black">
                  AEDN.
                </span>
              </Link>
            </div>

            {/* Left Navigation */}

            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-1 py-2 text-sm font-bold transition-colors duration-200 text-gray-500 hover:text-black`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            {authState.status === "unauthenticated" ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={() =>
                    authState.status === "authenticated" &&
                    setIsDropdownOpen(!isDropdownOpen)
                  }
                  disabled={authState.status === "init"}
                  className={`flex h-11 w-16 items-center justify-center gap-1 p-2 rounded-lg transition-colors ${
                    authState.status === "init"
                      ? "cursor-not-allowed opacity-60"
                      : "text-gray-600 hover:text-black hover:bg-gray-100"
                  }`}
                  aria-label="Menu"
                >
                  {authState.status === "init" ? (
                    <LoadingIndicator />
                  ) : (
                    <>
                      <img
                        src="/static/placeholder.jpg"
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
                    </>
                  )}
                </button>

                {isDropdownOpen && authState.status === "authenticated" && (
                  <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-300 z-50 overflow-hidden">
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Profile
                    </Link>

                    <Link
                      to="/requests"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      My Requests
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      My Order
                    </Link>

                    {authState.data.roles.includes("ROLE_ADMIN") && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        Admin Page
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                      }}
                      className="block hover:font-bold w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
