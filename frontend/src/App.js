import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import api from "@/lib/api";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import WhatsAppFloat from "@/components/WhatsAppFloat";

import Home from "@/pages/Home";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import About from "@/pages/About";
import Portfolio from "@/pages/Portfolio";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import BookingPolicy from "@/pages/BookingPolicy";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminStudio from "@/pages/admin/AdminStudio";
import AdminSettings from "@/pages/admin/AdminSettings";

import { useState } from "react";

function TrackingScripts() {
  useEffect(() => {
    api.get("/settings/public").then(({ data }) => {
      if (data.ga4_id && !document.getElementById("ga4-script")) {
        const s = document.createElement("script");
        s.id = "ga4-script";
        s.async = true;
        s.src = `https://www.googletagmanager.com/gtag/js?id=${data.ga4_id}`;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag("js", new Date());
        window.gtag("config", data.ga4_id);
      }
      if (data.meta_pixel_id && !window.fbq) {
        const n = (window.fbq = function () { n.queue.push(arguments); });
        n.queue = []; n.loaded = true; n.version = "2.0";
        const s = document.createElement("script");
        s.async = true;
        s.src = "https://connect.facebook.net/en_US/fbevents.js";
        document.head.appendChild(s);
        window.fbq("init", data.meta_pixel_id);
        window.fbq("track", "PageView");
      }
    }).catch(() => {});
  }, []);
  return null;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PublicShell({ children }) {
  const [company, setCompany] = useState(null);
  useEffect(() => {
    api.get("/company").then((r) => setCompany(r.data)).catch(() => {});
  }, []);
  const isAdmin = useLocation().pathname.startsWith("/admin");
  if (isAdmin) return children;
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer company={company} />
      <WhatsAppFloat />
      <ChatWidget />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <div className="App min-h-screen bg-[#050B14]">
          <BrowserRouter>
            <ScrollToTop />
            <TrackingScripts />
            <PublicShell>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:slug" element={<ProjectDetail />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/about" element={<About />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/booking-cancellation-policy" element={<BookingPolicy />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="leads" element={<AdminLeads />} />
                  <Route path="studio" element={<AdminStudio />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="*" element={<Home />} />
              </Routes>
            </PublicShell>
            <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: "#101B2E", border: "1px solid rgba(197,160,89,0.3)", color: "#F8FAFC" } }} />
          </BrowserRouter>
        </div>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
