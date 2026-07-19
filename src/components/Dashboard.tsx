import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShoppingCart, 
  FileWarning, 
  Users, 
  Activity, 
  Calendar, 
  PackageMinus, 
  Store,
  Filter,
  CheckCircle,
  Truck
} from "lucide-react";
import { 
  FullProduct, 
  Sale, 
  CashierSession, 
  FiadoAccount, 
  AccountBill, 
  CustomerOrder, 
  PaymentMethod,
  OrderStatus
} from "../types";

interface DashboardProps {
  companyId: string;
  selectedUnitId: string;
  products: FullProduct[];
  sales: Sale[];
  sessions: CashierSession[];
  fiados: FiadoAccount[];
  bills: AccountBill[];
  orders: CustomerOrder[];
}

export default function Dashboard({
  companyId,
  selectedUnitId,
  products,
  sales,
  sessions,
  fiados,
  bills,
  orders
}: DashboardProps) {
  // Filter States
  const [period, setPeriod] = useState<"today" | "yesterday" | "7d" | "30d" | "current_month" | "all">("all");
  const [filterUnitId, setFilterUnitId] = useState<string>("all");
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("all");

  // Filter Sales & Data based on parameters
  const filteredSales = useMemo(() => {
    let list = sales.filter(s => s.companyId === companyId && s.status !== "CANCELADA");

    // Unit Filter
    if (filterUnitId !== "all") {
      list = list.filter(s => s.unitId === filterUnitId);
    } else if (selectedUnitId) {
      // default context
      list = list.filter(s => s.unitId === selectedUnitId);
    }

    // Employee Filter
    if (filterEmployeeId !== "all") {
      list = list.filter(s => s.sellerId === filterEmployeeId);
    }

    // Period Filter
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    list = list.filter(s => {
      const saleDate = s.createdAt.split("T")[0];
      const saleTime = new Date(s.createdAt).getTime();

      if (period === "today") {
        return saleDate === todayStr;
      }
      if (period === "yesterday") {
        return saleDate === yesterdayStr;
      }
      if (period === "7d") {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return saleTime >= sevenDaysAgo;
      }
      if (period === "30d") {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        return saleTime >= thirtyDaysAgo;
      }
      if (period === "current_month") {
        const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
        return saleDate.startsWith(currentYearMonth);
      }
      return true;
    });

    return list;
  }, [sales, companyId, filterUnitId, selectedUnitId, filterEmployeeId, period]);

  // Derived metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = filteredSales.reduce((sum, s) => sum + s.costTotal, 0);
    const estimatedProfit = totalRevenue - totalCost;
    const countVendas = filteredSales.length;
    const ticketMedio = countVendas > 0 ? totalRevenue / countVendas : 0;

    // Fiados remaining to receive
    const companyFiados = fiados.filter(f => f.companyId === companyId && f.status === "PENDENTE" || f.status === "ATRASADO");
    const totalFiadosOutstanding = companyFiados.reduce((sum, f) => sum + f.remainingAmount, 0);

    // Active bills payable
    const companyBills = bills.filter(b => b.companyId === companyId && b.status === "PENDENTE" || b.status === "ATRASADO");
    const totalBillsOutstanding = companyBills.reduce((sum, b) => sum + b.amount, 0);

    // Stock alerts
    const activeUnit = filterUnitId !== "all" ? filterUnitId : selectedUnitId;
    const companyProducts = products.filter(p => p.companyId === companyId && p.isActive);
    const lowStockItems = companyProducts.filter(p => {
      const stock = p.stockQty[activeUnit] || 0;
      return stock <= p.minStock;
    });

    // Orders active counts
    const activeOrders = orders.filter(o => o.companyId === companyId && o.status !== OrderStatus.ENTREGUE && o.status !== OrderStatus.CANCELADO);
    const openOrdersCount = activeOrders.filter(o => o.status === OrderStatus.RECEBIDO || o.status === OrderStatus.SEPARACAO).length;
    const deliveryOrdersCount = activeOrders.filter(o => o.status === OrderStatus.SAIU_ENTREGA).length;

    // Cashier states count
    const openCashiersCount = sessions.filter(s => s.companyId === companyId && s.status === "OPEN").length;

    return {
      totalRevenue,
      estimatedProfit,
      countVendas,
      ticketMedio,
      totalFiadosOutstanding,
      totalBillsOutstanding,
      lowStockCount: lowStockItems.length,
      lowStockList: lowStockItems.slice(0, 5),
      openOrdersCount,
      deliveryOrdersCount,
      openCashiersCount
    };
  }, [filteredSales, fiados, bills, products, orders, sessions, companyId, filterUnitId, selectedUnitId]);

  // Dynamic Charting: Group sales by day (for weekly graph)
  const salesByDay = useMemo(() => {
    const map: { [day: string]: number } = {};
    filteredSales.forEach(s => {
      // "2026-07-14T16:20:00Z" -> "14/07"
      const dateObj = new Date(s.createdAt);
      const dayMonth = `${dateObj.getDate().toString().padStart(2, "0")}/${(dateObj.getMonth() + 1).toString().padStart(2, "0")}`;
      map[dayMonth] = (map[dayMonth] || 0) + s.total;
    });

    // Convert to sorted array
    return Object.keys(map).sort().map(key => ({
      day: key,
      value: map[key]
    })).slice(-7); // last 7 points
  }, [filteredSales]);

  // Payment Methods share
  const paymentShare = useMemo(() => {
    const map: { [method in PaymentMethod]?: number } = {};
    filteredSales.forEach(s => {
      s.payments.forEach(p => {
        map[p.method] = (map[p.method] || 0) + p.amount;
      });
    });
    return Object.keys(map).map(k => ({
      method: k,
      amount: map[k as PaymentMethod] || 0
    }));
  }, [filteredSales]);

  // Categories Distribution
  const categoryShare = useMemo(() => {
    const map: { [cat: string]: number } = {};
    filteredSales.forEach(s => {
      s.items.forEach(item => {
        // Find product to check category
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || "Outros";
        map[cat] = (map[cat] || 0) + item.total;
      });
    });
    return Object.keys(map).map(k => ({
      category: k,
      total: map[k]
    }));
  }, [filteredSales, products]);

  // Employees List for filters
  const sellersList = useMemo(() => {
    const map: { [id: string]: string } = {};
    sales.filter(s => s.companyId === companyId).forEach(s => {
      map[s.sellerId] = s.sellerName;
    });
    return Object.keys(map).map(id => ({ id, name: map[id] }));
  }, [sales, companyId]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      {/* Header & Filter Controls bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500" />
            Visão Geral Operacional
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Indicadores gerenciais e performance financeira em tempo real
          </p>
        </div>

        {/* Filter selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selection */}
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setPeriod("today")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                period === "today" ? "bg-red-500/10 text-red-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod("7d")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                period === "7d" ? "bg-red-500/10 text-red-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                period === "30d" ? "bg-red-500/10 text-red-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setPeriod("all")}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                period === "all" ? "bg-red-500/10 text-red-400" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Geral
            </button>
          </div>

          {/* Unit Filter */}
          <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
            <Store className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={filterUnitId}
              onChange={(e) => setFilterUnitId(e.target.value)}
              className="bg-transparent border-none text-xs text-neutral-300 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">Todas Unidades</option>
              <option value="unit_matriz">Matriz</option>
              <option value="unit_filial_sul">Filial Zona Sul</option>
            </select>
          </div>

          {/* Seller Employee Filter */}
          {sellersList.length > 0 && (
            <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              <select
                value={filterEmployeeId}
                onChange={(e) => setFilterEmployeeId(e.target.value)}
                className="bg-transparent border-none text-xs text-neutral-300 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all">Vendedores</option>
                {sellersList.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-red-500/5 p-2 rounded-lg border border-red-500/10 text-red-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">
              Faturamento
            </span>
            <p className="text-xl md:text-2xl font-bold text-neutral-100 font-sans tracking-tight mt-2">
              R$ {metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Receita consolidada
          </span>
        </div>

        {/* Profit */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 text-rose-400">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">
              Lucro Estimado
            </span>
            <p className="text-xl md:text-2xl font-bold text-neutral-100 font-sans tracking-tight mt-2">
              R$ {metrics.estimatedProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[10px] font-mono text-rose-400">
            Margem: {metrics.totalRevenue > 0 ? ((metrics.estimatedProfit / metrics.totalRevenue) * 100).toFixed(1) : 0}%
          </span>
        </div>

        {/* Ticket Medio */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10 text-rose-400">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-semibold block">
              Ticket Médio
            </span>
            <p className="text-xl md:text-2xl font-bold text-neutral-100 font-sans tracking-tight mt-2">
              R$ {metrics.ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[10px] text-neutral-400">
            Total de {metrics.countVendas} vendas
          </span>
        </div>

        {/* Outstanding Fiado */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden shadow-md">
          <div className="absolute right-3 top-3 bg-red-500/5 p-2 rounded-lg border border-red-500/10 text-red-400">
            <FileWarning className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">
              Fiado à Receber
            </span>
            <p className="text-xl md:text-2xl font-bold text-red-400 font-sans tracking-tight mt-2">
              R$ {metrics.totalFiadosOutstanding.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <span className="text-[10px] font-mono text-red-400">
            Inadimplência pendente
          </span>
        </div>
      </div>

      {/* Critical Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Caixas Abertos */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Sessões de Caixa</span>
            <p className="text-lg font-bold text-neutral-100">{metrics.openCashiersCount} PDV ativos</p>
          </div>
        </div>

        {/* Contas a pagar pendentes */}
        <div className="bg-neutral-900/40 border border-neutral-800 p-4 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center">
            <FileWarning className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider block">Contas a Pagar</span>
            <p className="text-lg font-bold text-neutral-100">R$ {metrics.totalBillsOutstanding.toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>

      {/* Charts & Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-neutral-100 text-sm">Velocidade de Vendas</h3>
            <p className="text-xs text-neutral-400">Evolução do faturamento diário (Últimos dias ativos)</p>
          </div>

          {/* SVG Chart */}
          <div className="h-64 w-full relative flex items-end mt-6">
            {salesByDay.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 font-mono">
                Nenhum dado de vendas registrado para os filtros selecionados.
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="flex-1 flex items-end justify-between gap-3 px-2">
                  {salesByDay.map((p, i) => {
                    const maxVal = Math.max(...salesByDay.map(d => d.value)) || 1;
                    const heightPct = `${(p.value / maxVal) * 80}%`;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative cursor-help">
                        {/* Tooltip */}
                        <div className="absolute -top-12 bg-neutral-950 text-white border border-neutral-800 px-2 py-1 rounded text-[10px] font-mono hidden group-hover:block z-20 whitespace-nowrap">
                          R$ {p.value.toFixed(2)}
                        </div>
                        <div 
                          style={{ height: heightPct }}
                          className="w-full bg-red-500/20 border-t-2 border-red-500 hover:bg-red-500/30 transition-all rounded-t-md relative flex justify-center"
                        />
                        <span className="text-[10px] font-mono text-neutral-400 mt-2 block">
                          {p.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods and Category breakdown share */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Payment Methods card */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-neutral-100 text-sm">Meios de Pagamento</h4>
              <p className="text-xs text-neutral-400">Formas de faturamento mais utilizadas</p>
            </div>

            <div className="space-y-3 mt-4">
              {paymentShare.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Sem registros</p>
              ) : (
                paymentShare.map((p, i) => {
                  const total = paymentShare.reduce((sum, item) => sum + item.amount, 0) || 1;
                  const pct = (p.amount / total) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-neutral-300 font-bold uppercase">{p.method}</span>
                        <span className="text-red-400">{pct.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Categories share */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-neutral-100 text-sm">Vendas por Categoria</h4>
              <p className="text-xs text-neutral-400">Principais categorias vendidas</p>
            </div>

            <div className="space-y-3 mt-4">
              {categoryShare.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Sem registros</p>
              ) : (
                categoryShare.map((c, i) => {
                  const total = categoryShare.reduce((sum, item) => sum + item.total, 0) || 1;
                  const pct = (c.total / total) * 100;
                  return (
                    <div key={i}>
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-neutral-300 truncate">{c.category}</span>
                        <span className="text-red-400">R$ {c.total.toFixed(0)} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className="h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Importantes - Low Stock & Expiration alert list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Widget */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
                <PackageMinus className="w-4 h-4 text-red-400" />
                Alerta de Estoque Crítico
              </h4>
              <p className="text-xs text-neutral-400">Produtos com quantidade atual abaixo do mínimo</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 font-bold border border-red-500/20">
              {metrics.lowStockCount} ITENS
            </span>
          </div>

          <div className="divide-y divide-neutral-800">
            {metrics.lowStockList.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">Excelente! Nenhum produto com estoque baixo.</p>
            ) : (
              metrics.lowStockList.map((p, i) => {
                const activeUnit = filterUnitId !== "all" ? filterUnitId : selectedUnitId;
                const stock = p.stockQty[activeUnit] || 0;
                return (
                  <div key={i} className="py-3 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-neutral-800 flex-shrink-0 flex items-center justify-center border border-neutral-700">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 text-neutral-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-200">{p.name}</p>
                        <p className="text-[10px] text-neutral-500">Mínimo: {p.minStock} {p.unitOfMeasure}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-red-400 text-sm bg-red-500/5 px-2 py-1 rounded">
                      {stock} {p.unitOfMeasure}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Expiration warning widget */}
        <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4 className="font-bold text-neutral-100 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-400" />
                Produtos Próximos do Vencimento
              </h4>
              <p className="text-xs text-neutral-400">Monitoramento preventivo de perdas</p>
            </div>
          </div>

          <div className="divide-y divide-neutral-800">
            {products.filter(p => p.expirationDate).length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-4">Nenhum lote com data de validade registrado.</p>
            ) : (
              products.filter(p => p.expirationDate).slice(0, 5).map((p, i) => {
                const daysLeft = Math.ceil((new Date(p.expirationDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const isOverdue = daysLeft <= 0;
                return (
                  <div key={i} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-semibold text-neutral-200">{p.name}</p>
                      <p className="text-[10px] text-neutral-500">Validade: {new Date(p.expirationDate!).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs px-2 py-1 rounded ${
                      isOverdue ? "bg-red-500/10 text-red-400" : daysLeft < 30 ? "bg-yellow-500/10 text-yellow-400" : "bg-neutral-800 text-neutral-400"
                    }`}>
                      {isOverdue ? "Vencido" : `Vence em ${daysLeft} dias`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
