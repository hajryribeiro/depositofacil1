import React, { useState } from "react";
import { Beer, Lock, Mail, Store, UserPlus, Sparkles } from "lucide-react";
import { User } from "../types";
import SaaSLogo from "./SaaSLogo";

interface AuthProps {
  onLogin: (user: User) => void;
  onRegisterCompany: (companyName: string, adminName: string, adminEmail: string) => void;
  allUsers: User[];
  logoUrl?: string;
  initialMode?: "login" | "register";
  onBackToLanding?: () => void;
}

export default function Auth({ 
  onLogin, 
  onRegisterCompany, 
  allUsers, 
  logoUrl,
  initialMode = "login",
  onBackToLanding
}: AuthProps) {
  const [activeMode, setActiveMode] = useState<"login" | "register">(initialMode);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register form state
  const [compName, setCompName] = useState("");
  const [admName, setAdmName] = useState("");
  const [admEmail, setAdmEmail] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    // Simple mock auth matching the email with a master fallback for Superadmin
    let matched = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matched && cleanEmail === "super@depositofacil.com.br") {
      matched = {
        id: "usr_super",
        companyId: "SAAS",
        name: "Dr. Almir Ribeiro",
        email: "super@depositofacil.com.br",
        phone: "(11) 99999-9999",
        role: "SUPERADMIN" as any,
        isActive: true,
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAocdgrYGUMLbk0cwVy7o1ZUYS3MrIKsERwwxw-Qu3qR7YaqIHDH4JdQBtiBllo-314I5Jb-vi-xSmANMGRqIx8hj9LftmFGxCeRDDi_xANkdm5MEzWEsPTeQphZStHLsXk4Tb8_zHGaQjiUve7c1oqH-co6Z4tzSbwpQ7G1q8-Z2k0kXveXYYVyr8c725jm62JbjEssBIjfBHDxqfNrjFpilqJh8msCEHctZaRBntx2NNVxo6hCN3l"
      };
    }

    if (matched) {
      onLogin(matched);
      alert(`Bem-vindo de volta, ${matched.name}!`);
    } else {
      alert("Usuário não encontrado! Por favor use uma das contas rápidas abaixo.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim() || !admName.trim() || !admEmail.trim()) return;

    onRegisterCompany(compName, admName, admEmail);
    alert("Inscrição de Sucesso! Sua empresa foi criada no banco local SaaS. Faça login utilizando o e-mail informado.");
    setEmail(admEmail);
    setActiveMode("login");
    setCompName("");
    setAdmName("");
    setAdmEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-300">
      
      {onBackToLanding && (
        <button
          onClick={onBackToLanding}
          className="mb-4 text-xs font-medium text-slate-400 hover:text-red-400 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          ← Voltar para a Página Principal
        </button>
      )}
      
      {/* Container */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mx-auto">
            <SaaSLogo size={56} logoUrl={logoUrl} />
          </div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-100">Depósito Fácil</h2>
          <p className="text-xs text-slate-400">Plataforma de Gestão Completa para Depósitos de Bebidas & Adegas</p>
        </div>

        {/* Form selection tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-xs">
          <button
            onClick={() => setActiveMode("login")}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
              activeMode === "login" ? "bg-red-500/10 text-red-400" : "text-slate-400"
            }`}
          >
            Acessar Sistema
          </button>
          <button
            onClick={() => setActiveMode("register")}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
              activeMode === "register" ? "bg-red-500/10 text-red-400" : "text-slate-400"
            }`}
          >
            Cadastrar Novo Depósito
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Seu E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="vendedor@deposito.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Sua Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] mt-2"
            >
              Fazer Login no Depósito
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Nome Fantasia do Depósito *</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Adega do Amigo Ltda"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">Nome do Administrador *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ricardo Souza"
                value={admName}
                onChange={(e) => setAdmName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 block font-semibold">E-mail de Login Admin *</label>
              <input
                type="email"
                required
                placeholder="Ex: admin@meudeposito.com"
                value={admEmail}
                onChange={(e) => setAdmEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] mt-2"
            >
              Criar Conta e Iniciar Demo
            </button>
          </form>
        )}

        {/* REVIEWER ACCELERATED LOGIN PRESETS */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Acesso Rápido & Login de Teste
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            <strong>E-mail de Teste Recomendado:</strong> <code className="text-red-400 font-mono bg-slate-950 px-1 py-0.5 rounded">admin@depositofacil.com.br</code> (Qualquer senha) ou selecione um dos cargos abaixo para logar instantaneamente:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {/* Admin Central */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_admin");
                if (usr) onLogin(usr);
              }}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-slate-300 group-hover:text-red-400 font-bold">Depósito Central</span>
              <span className="text-slate-500 text-[9px]">Cargo: Admin</span>
            </button>

            {/* Caixa Central */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_caixa");
                if (usr) onLogin(usr);
              }}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-slate-300 group-hover:text-red-400 font-bold">Operador Caixa</span>
              <span className="text-slate-500 text-[9px]">Cargo: Caixa</span>
            </button>

            {/* Adega do Sol Admin */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_adega_admin");
                if (usr) onLogin(usr);
              }}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-slate-300 group-hover:text-red-400 font-bold">Adega do Sol</span>
              <span className="text-slate-500 text-[9px]">Cargo: Admin</span>
            </button>

            {/* Superadmin master */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_super") || {
                  id: "usr_super",
                  companyId: "SAAS",
                  name: "Dr. Almir Ribeiro",
                  email: "super@depositofacil.com.br",
                  phone: "(11) 99999-9999",
                  role: "SUPERADMIN" as any,
                  isActive: true,
                  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAocdgrYGUMLbk0cwVy7o1ZUYS3MrIKsERwwxw-Qu3qR7YaqIHDH4JdQBtiBllo-314I5Jb-vi-xSmANMGRqIx8hj9LftmFGxCeRDDi_xANkdm5MEzWEsPTeQphZStHLsXk4Tb8_zHGaQjiUve7c1oqH-co6Z4tzSbwpQ7G1q8-Z2k0kXveXYYVyr8c725jm62JbjEssBIjfBHDxqfNrjFpilqJh8msCEHctZaRBntx2NNVxo6hCN3l"
                };
                onLogin(usr);
              }}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-red-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-amber-400 group-hover:text-amber-300 font-bold">SaaS Superadmin</span>
              <span className="text-slate-500 text-[9px]">Global Master</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
