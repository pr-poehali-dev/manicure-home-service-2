import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Navbar from "@/components/Navbar";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Ошибка входа",
        description: err instanceof Error ? err.message : "Неверный email или пароль",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-[#d4a843]/10 flex items-center justify-center mx-auto mb-6">
              <Icon name="LogIn" size={24} className="text-[#d4a843]" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white mb-2">
              Вход
            </h1>
            <p className="font-body text-sm text-white/40">
              Войдите в свой аккаунт maninov
            </p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50"
                />
              </div>

              <div>
                <label className="font-body text-xs uppercase tracking-wider text-white/40 mb-2 block">
                  Пароль
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:ring-[#d4a843]/50"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full font-body text-sm uppercase tracking-wider bg-gradient-to-r from-[#d4a843] to-[#b8912e] text-black font-semibold hover:from-[#e0b84d] hover:to-[#d4a843] transition-all duration-300 shadow-lg shadow-[#d4a843]/10 h-12 rounded-xl"
              >
                {loading ? (
                  <Icon name="Loader2" size={18} className="animate-spin" />
                ) : (
                  "Войти"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center font-body text-sm text-white/30 mt-6">
            Нет аккаунта?{" "}
            <Link to="/register" className="text-[#d4a843] hover:text-[#e0b84d] transition-colors duration-300">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
