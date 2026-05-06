import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/AuthStore";
import { useState, useRef, useEffect } from "react";

export default function Topbar() {
  const { accessToken, roles, clearAccessToken } = useAuthStore();
  const location = useLocation();
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

  const handleLogout = () => {
    localStorage.removeItem("refreshToken");
    clearAccessToken();
  };

  const navLinks = [
    { name: "Commissions", path: "/commissions" },
  ];

  const hideTopbarRoutes = ["/login", "/signup"];
  const shouldHide = hideTopbarRoutes.includes(location.pathname);

  if (shouldHide) return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/commissions" className="text-2xl font-extrabold tracking-tighter transition-opacity hover:opacity-80">
                <span className="text-black">
                  AEDN.
                </span>
              </Link>
            </div>

            {/* Left Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`relative px-1 py-2 text-sm font-bold transition-colors duration-200 ${isActive ? "text-black" : "text-gray-500 hover:text-black"
                      }`}
                  >
                    {link.name}
                    {isActive && (
                      <span className="left-0 w-full h-0.5 bg-black rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Section */}
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-600 hover:text-black focus:outline-none transition-colors rounded-lg hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-300 z-50 overflow-hidden">
                {accessToken ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Profile
                    </Link>
                    {roles.includes("ROLE_ADMIN") && (
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
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block hover:font-bold px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
