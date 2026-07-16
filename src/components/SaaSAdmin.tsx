import React, { useState, useMemo } from "react";
import { 
  Crown, 
  Users, 
  ShieldAlert, 
  DollarSign, 
  Sliders, 
  Power, 
  CheckCircle, 
  AlertTriangle,
  History,
  TrendingUp,
  Activity,
  UserCheck,
  Search
} from "lucide-react";
import { Company, PlanId, User, SubscriptionStatus } from "../types";

interface SaaSAdminProps {
  companies: Company[];
  users: User[];
  onToggleCompanyActive: (companyId: string) => void;
  onUpdateCompanyPlan: (companyId: string, planId: PlanId) => void;
}

export default function SaaSAdmin({
  companies,
  users,
  onToggleCompanyActive,
  onUpdateCompanyPlan
}: SaaSAdminProps) {
  const [search, setSearch] = useState("");

  // Consolidated global SaaS MRR (Monthly Recurring Revenue) calculations
  const saasStats = useMemo(() => {
    let activeTenants = 0;
    let totalMRR = 0;
    let trialCount = 0;
    let professionalCount = 0;

    companies.forEach(c => {
      const isActive = c.subscriptionStatus !== SubscriptionStatus.CANCELED;
      if (isActive) {
        activeTenants++;
        if (c.subscriptionStatus === SubscriptionStatus.TRIAL) {
          trialCount++;
        } else if (c.planId === PlanId.BASICO) {
          totalMRR += 79.90;
        } else if (c.planId === PlanId.PROFISSIONAL) {
          professionalCount++;
          totalMRR += 149.90;
        } else if (c.planId === PlanId.PREMIUM) {
          totalMRR += 299.90;
        }
      }
    });

    return {
      activeTenants,
      totalMRR,
      trialCount,
      professionalCount
    };
  }, [companies]);

  // Filter companies
  const filteredCompanies = useMemo(() => {
    if (!search.trim()) return companies;
    const q = search.toLowerCase();
    return companies.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [companies, search]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Heading */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Crown className="w-5 h-5 text-emerald-400" />
          Painel do Proprietário do SaaS (Superadmin)
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Monitoramento consolidado de assinantes do Depósito Fácil, ativação de planos, faturamento MRR e contenção de vazamentos de dados
        </p>
      </div>

      {/* Consolidation Stats widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* MRR */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">SaaS MRR Ativo</span>
            <p className="text-xl md:text-2xl font-bold text-emerald-400 font-sans tracking-tight mt-2">
              R$ {saasStats.totalMRR.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">Mensalidades recorrentes</span>
        </div>

        {/* Tenants Count */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">Locatários Ativos</span>
            <p className="text-xl md:text-2xl font-bold text-neutral-100 font-sans tracking-tight mt-2">
              {saasStats.activeTenants} / {companies.length}
            </p>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">Empresas ativas</span>
        </div>

        {/* Professional Tier */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-emerald-400">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">Planos Premium</span>
            <p className="text-xl md:text-2xl font-bold text-neutral-100 font-sans tracking-tight mt-2">
              {saasStats.professionalCount} Pro
            </p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Profissional R$ 299/mês</span>
        </div>

        {/* Trials count */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Trials em Demonstração</span>
            <p className="text-xl md:text-2xl font-bold text-yellow-500 font-sans tracking-tight mt-2">
              {saasStats.trialCount} depósitos
            </p>
          </div>
          <span className="text-[10px] font-mono text-yellow-500">Período de teste ativo</span>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar depósitos de bebidas cadastrados no SaaS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
          />
        </div>
      </div>

      {/* DETAILED ACTIVE TENANTS LISTING */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h4 className="font-bold text-neutral-200 text-sm mb-4">Cadastro de Empresas / Licenciados do SaaS</h4>

        <div className="overflow-x-auto text-xs text-neutral-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                <th className="py-3">Empresa / Depósito</th>
                <th className="py-3">Identificação</th>
                <th className="py-3">Plano Contratado</th>
                <th className="py-3">Faturamento Mensal</th>
                <th className="py-3">Vencimento da Licença</th>
                <th className="py-3">Status de Acesso</th>
                <th className="py-3 text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 font-mono">
              {filteredCompanies.map((company) => {
                const companyUsersCount = users.filter(u => u.companyId === company.id).length;
                const isActive = company.subscriptionStatus !== SubscriptionStatus.CANCELED;
                return (
                  <tr key={company.id} className="hover:bg-neutral-950/20 transition-colors text-xs">
                    <td className="py-4">
                      <span className="font-bold text-neutral-200 block">{company.name}</span>
                      <span className="text-[10px] text-neutral-500">Documento: {company.document || "Isento"} | {companyUsersCount} usuários</span>
                    </td>
                    <td className="py-4 text-neutral-400">
                      ID: <span className="text-emerald-400">{company.id}</span>
                    </td>
                    <td className="py-4">
                      <select
                        value={company.planId}
                        onChange={(e) => {
                          onUpdateCompanyPlan(company.id, e.target.value as PlanId);
                          alert(`Plano da empresa '${company.name}' alterado para ${e.target.value}.`);
                        }}
                        className="bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-300 py-1 px-2 focus:outline-none"
                      >
                        <option value={PlanId.BASICO}>Básico (R$ 79,90)</option>
                        <option value={PlanId.PROFISSIONAL}>Profissional (R$ 149,90)</option>
                        <option value={PlanId.PREMIUM}>Premium (R$ 299,90)</option>
                      </select>
                    </td>
                    <td className="py-4 font-semibold text-neutral-200">
                      {company.planId === PlanId.BASICO ? "R$ 79,90" : company.planId === PlanId.PROFISSIONAL ? "R$ 149,90" : "R$ 299,90"}
                    </td>
                    <td className="py-4">
                      {new Date(company.expirationDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}>
                        {isActive ? "ATIVO" : "BLOQUEADO"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          onToggleCompanyActive(company.id);
                          alert(`Sessão do tenant '${company.name}' foi alterada com sucesso.`);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isActive 
                            ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20" 
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isActive ? "Bloquear Tenant" : "Desbloquear Tenant"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
