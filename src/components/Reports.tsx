import React, { useState, useMemo } from "react";
import { 
  FileText, 
  TrendingUp, 
  History, 
  Activity, 
  Search, 
  Calendar, 
  AlertTriangle,
  Award,
  DollarSign,
  UserCheck,
  Beer
} from "lucide-react";
import { 
  Sale, 
  FullProduct, 
  AuditLog, 
  PaymentMethod 
} from "../types";

interface ReportsProps {
  companyId: string;
  sales: Sale[];
  products: FullProduct[];
  auditLogs: AuditLog[];
}

export default function Reports({
  companyId,
  sales,
  products,
  auditLogs
}: ReportsProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "audit">("sales");
  const [searchAudit, setSearchAudit] = useState("");

  const companySales = useMemo(() => {
    return sales.filter(s => s.companyId === companyId && s.status !== "CANCELADA");
  }, [sales, companyId]);

  const companyAuditLogs = useMemo(() => {
    return auditLogs
      .filter(l => l.companyId === companyId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [auditLogs, companyId]);

  // Calculations: Best selling products list
  const bestSellers = useMemo(() => {
    const qtyMap: { [id: string]: { name: string; qty: number; revenue: number } } = {};
    companySales.forEach(sale => {
      sale.items.forEach(item => {
        if (!qtyMap[item.productId]) {
          qtyMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        qtyMap[item.productId].qty += item.quantity;
        qtyMap[item.productId].revenue += item.total;
      });
    });

    return Object.values(qtyMap).sort((a, b) => b.qty - a.qty).slice(0, 10);
  }, [companySales]);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    if (!searchAudit.trim()) return companyAuditLogs;
    const q = searchAudit.toLowerCase();
    return companyAuditLogs.filter(log => 
      log.action.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q)
    );
  }, [companyAuditLogs, searchAudit]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Relatórios & Logs de Auditoria
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Métricas de faturamento, rankings de bebidas mais vendidas e relatórios de rastreamento de fraudes
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "sales" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Métricas de Desempenho
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "audit" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Trilha de Auditoria (Logs)
          </button>
        </div>
      </div>

      {/* TAB 1: METRICS AND RANKINGS */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Best sellers ranking list */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              Ranking de 10 Bebidas Mais Vendidas
            </h3>

            <div className="space-y-3.5">
              {bestSellers.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-6 text-center">Nenhum dado de venda consolidado ainda.</p>
              ) : (
                bestSellers.map((item, idx) => {
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs font-mono border-b border-neutral-850 pb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center font-bold text-[10px] text-emerald-400">
                          {idx + 1}
                        </span>
                        <span className="font-sans font-semibold text-neutral-200 truncate max-w-[200px]">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-6">
                        <span className="text-neutral-400">{item.qty} un vendidas</span>
                        <span className="font-bold text-neutral-300">R$ {item.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick summaries cards */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-neutral-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Resumo Analítico Geral
              </h3>

              <div className="space-y-4 text-xs font-mono">
                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-855 flex justify-between">
                  <span className="text-neutral-500 font-sans">Vendas Totais</span>
                  <span className="font-bold text-neutral-200">{companySales.length} transações</span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-855 flex justify-between">
                  <span className="text-neutral-500 font-sans">Faturamento</span>
                  <span className="font-bold text-emerald-400">R$ {companySales.reduce((sum, s) => sum + s.total, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-855 flex justify-between">
                  <span className="text-neutral-500 font-sans">Ticket Médio</span>
                  <span className="font-bold text-neutral-200">
                    R$ {(companySales.length > 0 ? companySales.reduce((sum, s) => sum + s.total, 0) / companySales.length : 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AUDIT TRAIL LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          
          {/* Warning notice about anti-fraud auditing */}
          <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-xl flex items-center gap-2 text-xs text-neutral-400 leading-normal">
            <AlertTriangle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Rastreabilidade de Segurança (Lei Geral de Proteção e Fraudes):</strong> Todas as ações críticas (Estornos de venda, saídas manuais do estoque, sangria de caixa e aberturas) registram carimbos contendo ID do usuário, carimbo de data e hora e endereço IP/dispositivo fictício para impedir fraudes financeiras na loja.
            </span>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por ação (Ex: SALE, STOCK, CASHIER) ou operador..."
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Audit table logs list */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-x-auto text-xs text-neutral-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                  <th className="py-3">Data & Hora</th>
                  <th className="py-3">Operação</th>
                  <th className="py-3">Responsável</th>
                  <th className="py-3">Descrição Detalhada</th>
                  <th className="py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 font-mono text-xs">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-500 italic">Nenhum log de auditoria correspondente encontrado.</td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => {
                    return (
                      <tr key={log.id} className="hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3.5 text-neutral-400">
                          {new Date(log.createdAt).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3.5">
                          <span className="bg-neutral-950 border border-neutral-800 text-[9px] px-2 py-0.5 rounded text-neutral-300 font-bold">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-neutral-300">{log.userName}</td>
                        <td className="py-3.5 text-neutral-400 max-w-[280px] truncate" title={log.description}>
                          {log.description}
                        </td>
                        <td className="py-3.5 text-right font-semibold text-neutral-300">
                          {log.details || "-"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
