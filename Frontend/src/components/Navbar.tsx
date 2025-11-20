import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import DarkModeToggle from "./DarkModeToggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Helper to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path
      ? "border-primary text-foreground"
      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border";
  };

  // Role Helpers
  const isAdmin = user?.role === "Admin";
  const isHOD = user?.role === "HOD";
  const isStudent = user?.role === "Student";

  const NavLinks = () => (
    <>
      <Link
        to="/courses"
        className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(
          "/courses"
        )}`}
      >
        Courses
      </Link>
      {!isStudent && (
        <Link
          to="/students"
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(
            "/students"
          )}`}
        >
          Students
        </Link>
      )}
      {(isAdmin || isHOD) && (
        <Link
          to="/faculty"
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(
            "/faculty"
          )}`}
        >
          Faculty
        </Link>
      )}
      {!isStudent && (
        <Link
          to="/division"
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(
            "/division"
          )}`}
        >
          Division
        </Link>
      )}
      {isAdmin && (
        <Link
          to="/departments"
          className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${isActive(
            "/departments"
          )}`}
        >
          Department
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-background border-b sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Desktop Nav */}
          <div className="flex">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center font-bold text-xl text-primary"
            >
              V-Lab
            </Link>

            {isAuthenticated && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <NavLinks />
              </div>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <DarkModeToggle />

            {isAuthenticated ? (
              <>
                {/* Desktop User Dropdown */}
                <div className="hidden sm:block ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2"
                      >
                        <span className="text-sm font-medium">
                          {user?.username}
                        </span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600 focus:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Trigger */}
                <div className="sm:hidden flex items-center ml-2">
                  <Sheet
                    open={isMobileMenuOpen}
                    onOpenChange={setIsMobileMenuOpen}
                  >
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right">
                      <SheetHeader>
                        <SheetTitle>V-Lab Menu</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col space-y-4 mt-8">
                        <div className="px-2 mb-4">
                          <p className="text-sm text-muted-foreground">
                            Signed in as
                          </p>
                          <p className="font-medium">{user?.username}</p>
                        </div>

                        <Link
                          to="/courses"
                          className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md"
                        >
                          Courses
                        </Link>
                        {!isStudent && (
                          <Link
                            to="/students"
                            className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md"
                          >
                            Students
                          </Link>
                        )}
                        {(isAdmin || isHOD) && (
                          <Link
                            to="/faculty"
                            className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md"
                          >
                            Faculty
                          </Link>
                        )}
                        {!isStudent && (
                          <Link
                            to="/division"
                            className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md"
                          >
                            Division
                          </Link>
                        )}
                        {isAdmin && (
                          <Link
                            to="/departments"
                            className="px-2 py-2 text-lg font-medium hover:bg-muted rounded-md"
                          >
                            Departments
                          </Link>
                        )}

                        <div className="border-t my-4"></div>

                        <Button
                          variant="destructive"
                          className="w-full justify-start"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <Button asChild variant="default" size="sm" className="ml-4">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
