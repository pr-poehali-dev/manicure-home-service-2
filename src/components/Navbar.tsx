import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Icon from "@/components/ui/icon";

const navLinks = [
  { label: "Главная", to: "/" },
  { label: "Цены", to: "/prices" },
  { label: "Акции", to: "/promos" },
  { label: "О нас", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Отзывы", to: "/reviews" },
  { label: "Поддержка", to: "/support" },
];

function NavLink({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative font-body text-sm tracking-wide uppercase transition-colors duration-300 py-1 group ${
        isActive ? "text-[#d4a843]" : "text-white/70 hover:text-white"
      }`}
    >
      {label}
      <span
        className={`absolute left-0 -bottom-0.5 h-[2px] rounded-full transition-all duration-300 ${
          isActive
            ? "w-full bg-gradient-to-r from-[#d4a843] to-[#8cc63f]"
            : "w-0 group-hover:w-full bg-gradient-to-r from-[#d4a843] to-[#8cc63f]"
        }`}
      />
    </Link>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    closeMobile();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-[#d4a843]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="https://cdn.poehali.dev/files/23115997-b321-4378-aa18-a759fa359f16.png"
              alt="maninov"
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-2xl font-semibold tracking-wider text-[#d4a843]">
              maninov
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    className="font-body text-xs uppercase tracking-wider text-[#8cc63f] hover:text-[#8cc63f]/80 transition-colors duration-300 px-3 py-1.5 border border-[#8cc63f]/30 rounded-full hover:border-[#8cc63f]/60"
                  >
                    Админ-панель
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="font-body text-sm text-white/70 hover:text-white transition-colors duration-300 flex items-center gap-1.5"
                >
                  <Icon name="User" size={16} />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-body text-xs uppercase tracking-wider text-white/40 hover:text-white/70 transition-colors duration-300"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-body text-sm tracking-wide text-white/70 hover:text-white transition-colors duration-300"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="font-body text-xs uppercase tracking-wider px-5 py-2 rounded-full bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/10"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-[#d4a843] transition-colors duration-300"
            aria-label="Toggle menu"
          >
            <Icon name={mobileOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black/95 backdrop-blur-lg border-t border-[#d4a843]/10 px-4 py-6 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={closeMobile}
              className="block font-body text-sm tracking-wide uppercase text-white/70 hover:text-[#d4a843] transition-colors duration-300 py-2.5 px-3 rounded-lg hover:bg-white/[0.03]"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-white/[0.06] space-y-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={closeMobile}
                    className="flex items-center gap-2 font-body text-sm text-[#8cc63f] py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors duration-300"
                  >
                    <Icon name="Shield" size={16} />
                    Админ-панель
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={closeMobile}
                  className="flex items-center gap-2 font-body text-sm text-white/70 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors duration-300"
                >
                  <Icon name="User" size={16} />
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 font-body text-sm text-white/40 hover:text-white/70 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors duration-300 w-full text-left"
                >
                  <Icon name="LogOut" size={16} />
                  Выйти
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 px-3 pt-1">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="font-body text-sm tracking-wide text-white/70 hover:text-white transition-colors duration-300"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="font-body text-xs uppercase tracking-wider px-5 py-2 rounded-full bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
