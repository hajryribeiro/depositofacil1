import React, { useState } from "react";
import { Beer, Lock, Mail, Store, UserPlus, Sparkles } from "lucide-react";
import { User } from "../types";
import SaaSLogo from "./SaaSLogo";

interface AuthProps {
  onLogin: (user: User) => void;
  onRegisterCompany: (companyName: string, adminName: string, adminEmail: string) => void;
  allUsers: User[];
  logoUrl?: string;
}

export default function Auth({ onLogin, onRegisterCompany, allUsers, logoUrl }: AuthProps) {
  const [activeMode, setActiveMode] = useState<"login" | "register">("login");

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
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center p-6 text-neutral-300">
      
      {/* Container */}
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mx-auto">
            <SaaSLogo size={56} logoUrl={logoUrl} />
          </div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-neutral-100">Depósito Fácil</h2>
          <p className="text-xs text-neutral-400">Plataforma de Gestão Completa para Depósitos de Bebidas & Adegas</p>
        </div>

        {/* Form selection tabs */}
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-850 text-xs">
          <button
            onClick={() => setActiveMode("login")}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
              activeMode === "login" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Acessar Sistema
          </button>
          <button
            onClick={() => setActiveMode("register")}
            className={`flex-1 py-1.5 rounded-md font-bold transition-all ${
              activeMode === "register" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Cadastrar Novo Depósito
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-neutral-400 block font-semibold">Seu E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="vendedor@deposito.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-emerald-500 text-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 block font-semibold">Sua Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-emerald-500 text-neutral-200"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] mt-2"
            >
              Fazer Login no Depósito
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
            
            <div className="space-y-1">
              <label className="text-neutral-400 block font-semibold">Nome Fantasia do Depósito *</label>
              <div className="relative">
                <Store className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Adega do Amigo Ltda"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 pl-10 pr-3 text-xs focus:outline-none focus:border-emerald-500 text-neutral-200"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 block font-semibold">Nome do Administrador *</label>
              <input
                type="text"
                required
                placeholder="Ex: Ricardo Souza"
                value={admName}
                onChange={(e) => setAdmName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs focus:outline-none text-neutral-200"
              />
            </div>

            <div className="space-y-1">
              <label className="text-neutral-400 block font-semibold">E-mail de Login Admin *</label>
              <input
                type="email"
                required
                placeholder="Ex: admin@meudeposito.com"
                value={admEmail}
                onChange={(e) => setAdmEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2.5 px-3 text-xs focus:outline-none text-neutral-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] mt-2"
            >
              Criar Conta e Iniciar Demo
            </button>
          </form>
        )}

        {/* REVIEWER ACCELERATED LOGIN PRESETS */}
        <div className="border-t border-neutral-800/80 pt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Acesso Rápido & Login de Teste
          </div>
          <p className="text-[11px] text-neutral-400 leading-normal">
            <strong>E-mail de Teste Recomendado:</strong> <code className="text-emerald-400 font-mono bg-neutral-950 px-1 py-0.5 rounded">admin@depositofacil.com.br</code> (Qualquer senha) ou selecione um dos cargos abaixo para logar instantaneamente:
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            {/* Admin Central */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_admin");
                if (usr) onLogin(usr);
              }}
              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-neutral-300 group-hover:text-emerald-400 font-bold">Depósito Central</span>
              <span className="text-neutral-500 text-[9px]">Cargo: Admin</span>
            </button>

            {/* Caixa Central */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_caixa");
                if (usr) onLogin(usr);
              }}
              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-neutral-300 group-hover:text-emerald-400 font-bold">Operador Caixa</span>
              <span className="text-neutral-500 text-[9px]">Cargo: Caixa</span>
            </button>

            {/* Adega do Sol Admin */}
            <button
              type="button"
              onClick={() => {
                const usr = allUsers.find(u => u.id === "usr_adega_admin");
                if (usr) onLogin(usr);
              }}
              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-neutral-300 group-hover:text-emerald-400 font-bold">Adega do Sol</span>
              <span className="text-neutral-500 text-[9px]">Cargo: Admin</span>
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
              className="bg-neutral-950 hover:bg-neutral-850 border border-neutral-800 hover:border-emerald-500/50 p-2 rounded text-left flex flex-col justify-between h-14 transition-all group"
            >
              <span className="text-amber-400 group-hover:text-amber-300 font-bold">SaaS Superadmin</span>
              <span className="text-neutral-500 text-[9px]">Global Master</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
