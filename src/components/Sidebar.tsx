import React, { useState } from "react";
import { 
  Beer, 
  LayoutDashboard, 
  Calculator, 
  Package, 
  Layers, 
  Warehouse, 
  Users, 
  PhoneCall, 
  DollarSign, 
  Truck, 
  Settings, 
  FileText, 
  Crown, 
  ShieldAlert, 
  UserCircle,
  LogOut,
  Sliders,
  ChevronDown,
  RefreshCcw,
  Menu,
  X
} from "lucide-react";
import { User, UserRole, Unit } from "../types";
import SaaSLogo from "./SaaSLogo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (u: User) => void;
  allUsers: User[];
  currentUnit: Unit;
  setCurrentUnit: (unit: Unit) => void;
  allUnits: Unit[];
  activeCompanyId: string;
  setActiveCompanyId: (id: string) => void;
  onLogout: () => void;
  syncStatus?: "idle" | "syncing" | "done";
  saasLogoUrl?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  allUsers,
  currentUnit,
  setCurrentUnit,
  allUnits,
  activeCompanyId,
  setActiveCompanyId,
  onLogout,
  syncStatus = "idle",
  saasLogoUrl
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter users based on selected company
  const companyUsers = allUsers.filter(u => u.companyId === activeCompanyId);
  // Filter units based on selected company
  const companyUnits = allUnits.filter(u => u.companyId === activeCompanyId);

  // Define navigation items based on role permissions
  const menuItems = [
    {
      id: "dashboard",
      label: "Painel Principal",
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO]
    },
    {
      id: "pos",
      label: "Frente de Caixa (PDV)",
      icon: Calculator,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.OPERADOR_CAIXA]
    },
    {
      id: "cashier",
      label: "Controle de Caixa",
      icon: Warehouse,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.OPERADOR_CAIXA, UserRole.FINANCEIRO]
    },
    {
      id: "products",
      label: "Produtos & Categorias",
      icon: Package,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.ESTOQUISTA]
    },
    {
      id: "stock",
      label: "Controle de Estoque",
      icon: Layers,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.ESTOQUISTA]
    },
    {
      id: "finance",
      label: "Financeiro & Fiados",
      icon: DollarSign,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO]
    },
    {
      id: "reports",
      label: "Relatórios Gerenciais",
      icon: FileText,
      roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.FINANCEIRO]
    },
    {
      id: "settings",
      label: "Configurações",
      icon: Settings,
      roles: [UserRole.ADMIN]
    }
  ];

  // Filter menu items for current user's role
  const allowedMenuItems = menuItems.filter(
    item => currentUser.role === UserRole.SUPERADMIN || item.roles.includes(currentUser.role)
  );

  return (
    <div className="w-full lg:w-[280px] bg-neutral-950 border-b lg:border-b-0 lg:border-r border-neutral-800 flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <SaaSLogo size={42} logoUrl={saasLogoUrl} />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-neutral-100 text-lg">
              Depósito Fácil
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-emerald-400 tracking-wider font-semibold uppercase">
                SaaS Multitenant
              </span>
              <span className="text-neutral-700 text-[9px]">•</span>
              <div className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${syncStatus === 'syncing' ? 'text-amber-400' : 'text-emerald-500'}`}>
                  {syncStatus === 'syncing' ? 'Sync' : 'Cloud'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-all focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Collapsible content area */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block flex-1 flex flex-col min-h-0`}>
        {/* Profile & Unit Picker Widget */}
        {currentUser.role !== UserRole.SUPERADMIN && (
          <div className="p-4 mx-4 my-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 border border-neutral-700 flex-shrink-0">
                {currentUser.avatarUrl ? (
                  <img 
                    src={currentUser.avatarUrl} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserCircle className="w-full h-full text-neutral-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-100 truncate">{currentUser.name}</p>
                <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-emerald-400 border border-neutral-700">
                  {currentUser.role}
                </span>
              </div>
            </div>

            {/* Unit Selector */}
            {companyUnits.length > 0 && (
              <div className="pt-2 border-t border-neutral-800/60">
                <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                  Unidade Ativa
                </label>
                <div className="relative">
                  <select
                    value={currentUnit?.id || ""}
                    onChange={(e) => {
                      const found = companyUnits.find(u => u.id === e.target.value);
                      if (found) setCurrentUnit(found);
                    }}
                    className="w-full text-xs bg-neutral-950 border border-neutral-800 rounded-lg py-1.5 px-2.5 text-neutral-200 focus:outline-none focus:border-emerald-500 appearance-none"
                  >
                    {companyUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
          {currentUser.role === UserRole.SUPERADMIN ? (
            <button
              onClick={() => {
                setActiveTab("superadmin");
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all ${
                activeTab === "superadmin"
                  ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              <Crown className="w-4 h-4" />
              Painel Superadmin
            </button>
          ) : (
            <>
              {allowedMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-medium transition-all ${
                      activeTab === item.id
                        ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-400 shadow-[inset_0_0_12px_rgba(16,185,129,0.04)]"
                        : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* SIMULATOR SWITCHER FOOTER - Extremely helpful for testing & review */}
        <div className="p-4 m-4 rounded-xl bg-neutral-900 border border-neutral-800/80 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            <Sliders className="w-3 h-3 animate-pulse" />
            Simulador de Ambiente
          </div>
          <p className="text-[10px] text-neutral-400 leading-relaxed">
            Troque instantaneamente de perfil ou empresa para simular multilocatários e permissões:
          </p>
          <div className="space-y-1.5 mt-1">
            {/* Company switcher */}
            <div>
              <span className="text-[9px] font-mono text-neutral-500">Locatário/Empresa</span>
              <select
                value={activeCompanyId}
                onChange={(e) => {
                  const targetCompId = e.target.value;
                  setActiveCompanyId(targetCompId);
                  // Auto switch user to match the new company
                  if (targetCompId === "SAAS") {
                    const superUsr = allUsers.find(u => u.role === UserRole.SUPERADMIN);
                    if (superUsr) {
                      setCurrentUser(superUsr);
                      setActiveTab("superadmin");
                    }
                  } else {
                    const firstCompUsr = allUsers.find(u => u.companyId === targetCompId);
                    if (firstCompUsr) {
                      setCurrentUser(firstCompUsr);
                      const defaultUnit = allUnits.find(u => u.companyId === targetCompId);
                      if (defaultUnit) setCurrentUnit(defaultUnit);
                      setActiveTab("dashboard");
                    }
                  }
                }}
                className="w-full text-[11px] bg-neutral-950 border border-neutral-800 rounded py-1 px-2 text-neutral-300"
              >
                <option value="SAAS">SaaS Superadministrador</option>
                <option value="comp_deposito_facil">Depósito Central (Professional)</option>
                <option value="comp_adega_sol">Adega do Sol (Trial/Basic)</option>
              </select>
            </div>

            {/* User switcher */}
            <div>
              <span className="text-[9px] font-mono text-neutral-500">Usuário & Cargo</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const usr = allUsers.find(u => u.id === e.target.value);
                  if (usr) {
                    setCurrentUser(usr);
                    if (usr.role === UserRole.SUPERADMIN) {
                      setActiveTab("superadmin");
                    } else {
                      const dUnit = allUnits.find(u => u.id === usr.unitId) || allUnits.find(u => u.companyId === usr.companyId);
                      if (dUnit) setCurrentUnit(dUnit);
                      // Reset to allowed view
                      if (usr.role === UserRole.OPERADOR_CAIXA) {
                        setActiveTab("pos");
                      } else if (usr.role === UserRole.ESTOQUISTA) {
                        setActiveTab("products");
                      } else if (usr.role === UserRole.ENTREGADOR) {
                        setActiveTab("dashboard");
                      } else {
                        setActiveTab("dashboard");
                      }
                    }
                  }
                }}
                className="w-full text-[11px] bg-neutral-950 border border-neutral-800 rounded py-1 px-2 text-neutral-300"
              >
                {allUsers
                  .filter(u => activeCompanyId === "SAAS" ? u.role === UserRole.SUPERADMIN : u.companyId === activeCompanyId)
                  .map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-neutral-800 flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
              Sistema Ativo
            </span>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
            title="Sair da sessão"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
