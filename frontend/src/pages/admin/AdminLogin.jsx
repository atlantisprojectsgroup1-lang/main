import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { formatApiError } from "../../lib/api";
import SEO from "../../components/SEO";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(formatApiError(err, "Login failed. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center px-4 bg-[#050B14]">
      <SEO title="Admin Login" path="/admin" />
      <div className="w-full max-w-md glass-card p-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 border border-[#D4AF37]/70 flex items-center justify-center rotate-45">
            <span className="font-serif text-xl text-[#E6C687] -rotate-45">A</span>
          </div>
          <div>
            <p className="font-serif text-xl tracking-[0.25em]">ATLANTIS</p>
            <p className="text-[0.55rem] font-mono tracking-[0.3em] text-[#C5A059]/80 uppercase">Command Center</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4" data-testid="admin-login-form">
          <input data-testid="admin-login-email-input" type="email" required placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 text-sm" />
          <input data-testid="admin-login-password-input" type="password" required placeholder="Password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 text-sm" />
          {error && <p data-testid="admin-login-error" className="text-sm text-red-400">{error}</p>}
          <button data-testid="admin-login-submit-btn" type="submit" disabled={loading} className="gold-btn w-full justify-center disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
