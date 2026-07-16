import React, { useState, useMemo } from "react";
import { 
  Settings, 
  Store, 
  Users, 
  Crown, 
  Plus, 
  Check, 
  AlertTriangle,
  History,
  Activity,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { Company, Unit, User, UserRole, PlanId, SubscriptionStatus } from "../types";

interface SettingsProps {
  company: Company;
  units: Unit[];
  users: User[];
  onUpdateCompany: (company: Company) => void;
  onAddUnit: (unit: Unit) => void;
  onAddUser: (user: User) => void;
  onUpdateCompanyPlan: (companyId: string, planId: PlanId) => void;
}

export default function SettingsComponent({
  company,
  units,
  users,
  onUpdateCompany,
  onAddUnit,
  onAddUser,
  onUpdateCompanyPlan
}: SettingsProps) {
  const [activeSection, setActiveSection] = useState<"general" | "units" | "users" | "billing">("general");

  // Form states - general
  const [companyName, setCompanyName] = useState(company.name);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(company.logoUrl || "");
  const [companyPhone, setCompanyPhone] = useState(company.phone || "");
  const [companyAddress, setCompanyAddress] = useState(company.address?.street || "");
  const [primaryColor, setPrimaryColor] = useState("#10b981");

  // Form states - units
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitName, setUnitName] = useState("");
  const [unitAddress, setUnitAddress] = useState("");

  // Form states - users
  const [showUserForm, setShowUserForm] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState<UserRole>(UserRole.OPERADOR_CAIXA);
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const companyUnits = useMemo(() => {
    return units.filter(u => u.companyId === company.id);
  }, [units, company.id]);

  const companyUsers = useMemo(() => {
    return users.filter(u => u.companyId === company.id);
  }, [users, company.id]);

  // Save general configs
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompany({
      ...company,
      name: companyName,
      logoUrl: companyLogoUrl || undefined,
      phone: companyPhone,
      address: {
        street: companyAddress,
        number: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: ""
      }
    });
    alert("Configurações gerais atualizadas com sucesso!");
  };

  // Save new unit
  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) return;

    // Check Plan limitations for Multi-lojas
    if (company.planId === PlanId.BASICO && companyUnits.length >= 1) {
      alert("Aviso do Plano Básico: Sua conta é limitada a 1 única unidade operacional. Faça o upgrade de plano para cadastrar filiais adicionais!");
      return;
    }

    const fresh: Unit = {
      id: `unit_${Date.now()}`,
      companyId: company.id,
      name: unitName,
      phone: company.phone,
      address: unitAddress,
      isActive: true
    };

    onAddUnit(fresh);
    alert("Filial / Unidade cadastrada com sucesso!");
    setShowUnitForm(false);
    setUnitName("");
    setUnitAddress("");
  };

  // Save new staff user
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    const fresh: User = {
      id: `usr_${Date.now()}`,
      companyId: company.id,
      name: userName,
      email: userEmail,
      role: userRole,
      isActive: true
    };

    onAddUser(fresh);
    alert(`Usuário '${userName}' cadastrado com sucesso para o cargo de ${userRole}!`);
    setShowUserForm(false);
    setUserName("");
    setUserEmail("");
    setUserPassword("");
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Configurações da Empresa
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Identidade visual, multiloja filial, permissões de funcionários e plano de assinatura do SaaS
        </p>
      </div>

      {/* INTERNAL NAVIGATION TABS */}
      <div className="flex border-b border-neutral-800 gap-1 shrink-0">
        <button
          onClick={() => setActiveSection("general")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSection === "general" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Identidade & Dados Gerais
        </button>

        <button
          onClick={() => setActiveSection("units")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSection === "units" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Filiais / Unidades ({companyUnits.length})
        </button>

        <button
          onClick={() => setActiveSection("users")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSection === "users" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Equipe & Permissões ({companyUsers.length})
        </button>

        <button
          onClick={() => setActiveSection("billing")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSection === "billing" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Minha Assinatura (SaaS Billing)
        </button>
      </div>

      {/* SECTION 1: GENERAL PREFERENCES FORM */}
      {activeSection === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-neutral-200 mb-4 border-b border-neutral-800 pb-2">Preferências de Identidade</h3>

            <form onSubmit={handleSaveGeneral} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Nome do Depósito / Adega *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>

                {/* Primary color */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Cor de Destaque da Marca</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">WhatsApp de Contato Comercial</label>
                  <input
                    type="tel"
                    value={companyPhone}
                    onChange={(e) => setCompanyPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none"
                  />
                </div>

                {/* Logo photo url */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">URL Logotipo (.png / .jpg)</label>
                  <input
                    type="url"
                    value={companyLogoUrl}
                    onChange={(e) => setCompanyLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Endereço Físico Principal</label>
                <input
                  type="text"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-neutral-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                Salvar Configurações
              </button>

            </form>
          </div>

          <div className="lg:col-span-4 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">Tema Customizado</h4>
              <p className="text-xs text-neutral-500 leading-normal">
                Toda a sua equipe e clientes de balcão no PDV verão a logomarca e o estilo definidos nesta tela. É o poder do White-Label integrado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MULTI-UNIDADES / BRANCHES SETUP */}
      {activeSection === "units" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-neutral-200">Unidades Físicas / Lojas Cadastradas</h3>
              <button
                onClick={() => setShowUnitForm(true)}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                + Cadastrar Nova Filial
              </button>
            </div>

            {/* Units grid list */}
            <div className="space-y-3">
              {companyUnits.map((u) => (
                <div key={u.id} className="p-4 bg-neutral-950 border border-neutral-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-200">{u.name}</p>
                      <p className="text-[10px] text-neutral-500">{u.address || "Sem endereço cadastrado"}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400">
                    Ativa
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            {showUnitForm && (
              <form onSubmit={handleSaveUnit} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 text-xs">
                <h4 className="font-bold text-neutral-200 border-b border-neutral-800 pb-2">Nova Filial</h4>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Nome da Filial *</label>
                  <input
                    type="text"
                    required
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="Ex: Filial Zona Sul"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Endereço Completo</label>
                  <input
                    type="text"
                    value={unitAddress}
                    onChange={(e) => setUnitAddress(e.target.value)}
                    placeholder="Av. Getúlio Vargas, 452"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowUnitForm(false)}
                    className="text-neutral-400 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-3.5 py-1.5 rounded-lg"
                  >
                    Salvar Filial
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: STAFF USERS & PERMISSIONS */}
      {activeSection === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3 mb-4">
              <h3 className="text-sm font-bold text-neutral-200">Colaboradores & Cargos Autorizados</h3>
              <button
                onClick={() => setShowUserForm(true)}
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold"
              >
                + Convidar Colaborador
              </button>
            </div>

            <div className="space-y-3">
              {companyUsers.map((usr) => (
                <div key={usr.id} className="p-3.5 bg-neutral-950 border border-neutral-850 rounded-xl flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-neutral-300 uppercase">
                      {usr.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-200">{usr.name}</p>
                      <p className="text-[10px] text-neutral-500">{usr.email}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-neutral-900 text-emerald-400 border border-neutral-800">
                    {usr.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* New User creation form slider */}
          <div className="lg:col-span-4">
            {showUserForm && (
              <form onSubmit={handleSaveUser} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4 text-xs">
                <h4 className="font-bold text-neutral-200 border-b border-neutral-800 pb-2">Adicionar à Equipe</h4>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Ex: Pedro Motoboy"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">E-mail de Login *</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="pedro@seudeposito.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Cargo & Permissões</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-neutral-300 focus:outline-none"
                  >
                    <option value={UserRole.OPERADOR_CAIXA}>Operador de Caixa (PDV)</option>
                    <option value={UserRole.ESTOQUISTA}>Estoquista (Produtos/Movimentos)</option>
                    <option value={UserRole.ENTREGADOR}>Entregador / Motoboy (Logística)</option>
                    <option value={UserRole.GERENTE}>Gerente (Visão Ampla)</option>
                    <option value={UserRole.FINANCEIRO}>Analista Financeiro</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowUserForm(false)}
                    className="text-neutral-400 font-semibold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-3.5 py-1.5 rounded-lg"
                  >
                    Adicionar Colaborador
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: BILLING & SUBSCRIPTIONS SCREEN */}
      {activeSection === "billing" && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-neutral-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-200 text-sm">Meu Plano do Depósito Fácil SaaS</h3>
              <p className="text-xs text-neutral-400">
                Seu plano atual é: <strong className="text-emerald-400 uppercase font-mono">{company.planId}</strong>
              </p>
            </div>
          </div>

          {/* Pricing cards mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Plan 1 */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              company.subscriptionStatus === SubscriptionStatus.TRIAL ? "border-emerald-500 bg-emerald-500/5" : "border-neutral-800"
            }`}>
              <div>
                <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase block">Demonstração</span>
                <h4 className="text-sm font-bold text-neutral-200 mt-1">Plano Trial / Teste</h4>
                <p className="text-xs text-neutral-500 mt-2">Indicado para testes rápidos e validações operacionais de caixa simples.</p>
                
                <p className="text-xl font-bold text-neutral-100 font-sans mt-4">Grátis</p>
                <span className="text-[9px] text-neutral-500">Sem data expiratório</span>
              </div>

              {company.subscriptionStatus === SubscriptionStatus.TRIAL && (
                <span className="mt-6 w-full text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-xs font-bold block">
                  Plano Ativo no momento
                </span>
              )}
            </div>

            {/* Plan 2 */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              company.planId === PlanId.BASICO ? "border-emerald-500 bg-emerald-500/5" : "border-neutral-800"
            }`}>
              <div>
                <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase block">Popular</span>
                <h4 className="text-sm font-bold text-neutral-200 mt-1">Plano Comercial Básico</h4>
                <p className="text-xs text-neutral-500 mt-2">Completo com PDV, Caixa, Produtos, CRM, Controle de Vasilhames.</p>
                
                <p className="text-xl font-bold text-neutral-100 font-sans mt-4">R$ 79,90 <span className="text-xs text-neutral-500">/mês</span></p>
              </div>

              {company.planId === PlanId.BASICO ? (
                <span className="mt-6 w-full text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-xs font-bold block">
                  Plano Ativo no momento
                </span>
              ) : (
                <button
                  onClick={() => {
                    onUpdateCompanyPlan(company.id, PlanId.BASICO);
                    alert("Sucesso! Sua assinatura foi atualizada para o Plano Básico.");
                  }}
                  className="mt-6 w-full text-center bg-neutral-800 hover:bg-neutral-750 text-neutral-200 py-2 rounded-lg text-xs font-bold block"
                >
                  Contratar Assinatura
                </button>
              )}
            </div>

            {/* Plan 3 */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between ${
              company.planId === PlanId.PROFISSIONAL ? "border-emerald-500 bg-emerald-500/5 animate-pulse" : "border-neutral-800"
            }`}>
              <div>
                <span className="text-[10px] text-amber-500 font-mono font-bold uppercase block">Empresas Grandes</span>
                <h4 className="text-sm font-bold text-neutral-200 mt-1">Plano Multiloja Profissional</h4>
                <p className="text-xs text-neutral-500 mt-2">Filiais ilimitadas, roteador avançado de entregas e DRE sintética por loja.</p>
                
                <p className="text-xl font-bold text-neutral-100 font-sans mt-4">R$ 149,90 <span className="text-xs text-neutral-500">/mês</span></p>
              </div>

              {company.planId === PlanId.PROFISSIONAL ? (
                <span className="mt-6 w-full text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 py-2 rounded-lg text-xs font-bold block">
                  Plano Ativo no momento
                </span>
              ) : (
                <button
                  onClick={() => {
                    onUpdateCompanyPlan(company.id, PlanId.PROFISSIONAL);
                    alert("Upgrade de Sucesso! Sua assinatura foi promovida para o Plano Profissional (Múltiplas Lojas Liberadas).");
                  }}
                  className="mt-6 w-full text-center bg-emerald-500 text-neutral-950 hover:bg-emerald-600 py-2 rounded-lg text-xs font-bold block"
                >
                  Upgrade de Plano
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
