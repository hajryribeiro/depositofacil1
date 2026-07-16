import React, { useState, useMemo } from "react";
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Percent, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  History,
  FileText,
  Activity,
  Calculator
} from "lucide-react";
import { 
  AccountBill, 
  BillType, 
  BillStatus, 
  Sale, 
  CashierSession,
  CashierMovementType 
} from "../types";

interface FinanceProps {
  companyId: string;
  unitId: string;
  sales: Sale[];
  sessions: CashierSession[];
  bills: AccountBill[];
  onAddBill: (b: AccountBill) => void;
  onUpdateBill: (b: AccountBill) => void;
}

export default function Finance({
  companyId,
  unitId,
  sales,
  sessions,
  bills,
  onAddBill,
  onUpdateBill
}: FinanceProps) {
  // Navigation tabs inside finance hub
  const [activeTab, setActiveTab] = useState<"dre" | "payable" | "receivable">("dre");
  const [search, setSearch] = useState("");
  const [showBillForm, setShowBillForm] = useState(false);

  // Bill creation form state
  const [description, setDescription] = useState("");
  const [type, setType] = useState<BillType>(BillType.PAGAR);
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("Mercadorias / Reposição");
  const [supplierName, setSupplierName] = useState("");

  const companyBills = useMemo(() => {
    return bills.filter(b => b.companyId === companyId);
  }, [bills, companyId]);

  const companySales = useMemo(() => {
    return sales.filter(s => s.companyId === companyId && s.status !== "CANCELADA");
  }, [sales, companyId]);

  // Dynamic DRE (Demonstrativo do Resultado do Exercício) Calculation Engine
  const dreStats = useMemo(() => {
    // 1. Receita Bruta (Sales revenue)
    const grossRevenue = companySales.reduce((sum, s) => sum + s.total, 0);

    // 2. Custo das Mercadorias Vendidas (CMV)
    const cogs = companySales.reduce((sum, s) => sum + s.costTotal, 0);

    // 3. Lucro Bruto
    const grossProfit = grossRevenue - cogs;

    // 4. Despesas Operacionais (Sangrias despesas and active payable bills marked as paid)
    let operatingExpenses = 0;
    
    // Sum active paid bills
    const paidBillsAmount = companyBills
      .filter(b => b.type === BillType.PAGAR && b.status === BillStatus.PAGO)
      .reduce((sum, b) => sum + b.amount, 0);
    operatingExpenses += paidBillsAmount;

    // Sum cashier Sangrias
    sessions.filter(s => s.companyId === companyId).forEach(sess => {
      (sess.movements || []).forEach(m => {
        if (m.type === CashierMovementType.SANGRIA) {
          operatingExpenses += m.amount;
        }
      });
    });

    // 5. EBITDA / Lucro Operacional
    const ebitda = grossProfit - operatingExpenses;

    // Margins
    const grossMargin = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;
    const netMargin = grossRevenue > 0 ? (ebitda / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      cogs,
      grossProfit,
      operatingExpenses,
      ebitda,
      grossMargin,
      netMargin
    };
  }, [companySales, companyBills, sessions, companyId]);

  // Filter bills
  const filteredPayables = useMemo(() => {
    const list = companyBills.filter(b => b.type === BillType.PAGAR);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(b => b.description.toLowerCase().includes(q) || b.supplierName?.toLowerCase().includes(q));
  }, [companyBills, search]);

  const filteredReceivables = useMemo(() => {
    const list = companyBills.filter(b => b.type === BillType.RECEBER);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(b => b.description.toLowerCase().includes(q) || b.supplierName?.toLowerCase().includes(q));
  }, [companyBills, search]);

  // Form submit handler
  const handleBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0 || !dueDate) return;

    const fresh: AccountBill = {
      id: `bill_${Date.now()}`,
      companyId,
      description,
      type,
      category,
      amount,
      dueDate,
      status: BillStatus.PENDENTE,
      supplierName: supplierName || undefined,
      createdAt: new Date().toISOString()
    };

    onAddBill(fresh);
    alert(`${type === BillType.PAGAR ? "Conta a Pagar" : "Conta a Receber"} lançada com sucesso!`);
    setShowBillForm(false);
    setDescription("");
    setAmount(0);
    setDueDate("");
    setSupplierName("");
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Financeiro & Gestão de Contas
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Contas a pagar e receber de fornecedores, batimento de fiados e demonstrativo do resultado operacional (DRE)
          </p>
        </div>

        {/* New bill launcher trigger */}
        <button
          onClick={() => setShowBillForm(true)}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Lançar Conta / Duplicata
        </button>
      </div>

      {/* FINANCE HUB NAVTABS */}
      <div className="flex border-b border-neutral-800 gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("dre")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "dre" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          DRE Simplificada (Análise Operacional)
        </button>

        <button
          onClick={() => setActiveTab("payable")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "payable" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Contas a Pagar ({filteredPayables.filter(b => b.status === BillStatus.PENDENTE).length} abertas)
        </button>

        <button
          onClick={() => setActiveTab("receivable")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "receivable" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Contas a Receber ({filteredReceivables.filter(b => b.status === BillStatus.PENDENTE).length} abertas)
        </button>
      </div>

      {/* TAB 1: DRE SIMPLIFICADA PANEL */}
      {activeTab === "dre" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Visual Statement Column */}
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-neutral-200 flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              Demonstrativo de Fluxo & DRE Operacional
            </h3>
            <p className="text-xs text-neutral-400">Análise sintética calculada sobre vendas líquidas, CMV e despesas do período ativo</p>

            {/* DRE Structure Box */}
            <div className="mt-6 space-y-3 font-mono text-xs">
              
              {/* 1. Gross Revenue */}
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-800">
                <span className="text-neutral-300 font-semibold font-sans">(+) RECEITA BRUTA DE VENDAS</span>
                <span className="text-neutral-200 font-bold">R$ {dreStats.grossRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* 2. COGS (CMV) */}
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-850 text-red-400">
                <span className="font-sans font-medium pl-4">(-) Custo das Bebidas Vendidas (CMV)</span>
                <span>- R$ {dreStats.cogs.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* 3. Gross Margin */}
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-800 bg-neutral-950/40 px-3 rounded-lg text-emerald-400 font-bold">
                <span className="font-sans font-bold">(=) LUCRO BRUTO OPERACIONAL</span>
                <span>R$ {dreStats.grossProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* 4. Expenses */}
              <div className="flex justify-between items-center py-2.5 border-b border-neutral-850 text-red-400">
                <span className="font-sans font-medium pl-4">(-) Despesas Administrativas / Lançamentos Pagos</span>
                <span>- R$ {dreStats.operatingExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* 5. EBITDA Operational profit */}
              <div className="flex justify-between items-center py-3 border-b border-neutral-800 bg-neutral-950 px-3 rounded-lg text-emerald-400 font-extrabold text-sm">
                <span className="font-sans">(=) RESULTADO LÍQUIDO (EBITDA)</span>
                <span>R$ {dreStats.ebitda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Dynamic visual progress indicators */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block uppercase">Margem de Lucro Bruto</span>
                <p className="text-xl font-bold text-neutral-100 font-sans tracking-tight mt-1">
                  {dreStats.grossMargin.toFixed(1)}%
                </p>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div style={{ width: `${Math.min(100, dreStats.grossMargin)}%` }} className="h-full bg-emerald-400" />
                </div>
              </div>

              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                <span className="text-[10px] text-neutral-500 block uppercase">Margem Operacional Líquida</span>
                <p className="text-xl font-bold text-teal-400 font-sans tracking-tight mt-1">
                  {dreStats.netMargin.toFixed(1)}%
                </p>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-2">
                  <div style={{ width: `${Math.min(100, dreStats.netMargin)}%` }} className="h-full bg-teal-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Side quick metrics box */}
          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-2">
                Dicionário Financeiro
              </h4>
              <ul className="space-y-3 text-xs text-neutral-400 leading-relaxed">
                <li>
                  <strong className="text-neutral-200">Receita Bruta:</strong> Soma de todas as vendas processadas no PDV que não foram canceladas.
                </li>
                <li>
                  <strong className="text-neutral-200">CMV (Custo):</strong> A soma das cotações de compra das mercadorias que foram dadas baixa no PDV.
                </li>
                <li>
                  <strong className="text-neutral-200">Resultado Líquido:</strong> O faturamento descontando custos diretos de aquisição de bebidas e sangrias de balcão.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTAS A PAGAR */}
      {activeTab === "payable" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar duplicata por descrição ou fornecedor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-x-auto text-xs text-neutral-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                  <th className="py-3">Duplicata / Despesa</th>
                  <th className="py-3">Fornecedor</th>
                  <th className="py-3">Categoria</th>
                  <th className="py-3">Vencimento</th>
                  <th className="py-3">Valor</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredPayables.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-neutral-500 italic">Nenhuma conta lançada para pagar.</td>
                  </tr>
                ) : (
                  filteredPayables.map((bill) => {
                    const isOverdue = new Date(bill.dueDate).getTime() < Date.now() && bill.status === BillStatus.PENDENTE;
                    
                    return (
                      <tr key={bill.id} className="hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3.5 font-semibold text-neutral-200">{bill.description}</td>
                        <td className="py-3.5">{bill.supplierName || "Geral"}</td>
                        <td className="py-3.5">
                          <span className="bg-neutral-950 border border-neutral-800 text-[9px] px-2 py-0.5 rounded text-neutral-400">
                            {bill.category}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono">
                          {new Date(bill.dueDate).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3.5 font-mono font-bold text-neutral-200">
                          R$ {bill.amount.toFixed(2)}
                        </td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            bill.status === BillStatus.PAGO 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : isOverdue 
                                ? "bg-red-500/10 text-red-400" 
                                : "bg-neutral-800 text-neutral-400"
                          }`}>
                            {bill.status === BillStatus.PAGO ? "Pago" : isOverdue ? "Atrasado" : "Pendente"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {bill.status === BillStatus.PENDENTE && (
                            <button
                              onClick={() => {
                                const updated = { ...bill, status: BillStatus.PAGO };
                                onUpdateBill(updated);
                                alert("Conta marcada como PAGA com sucesso!");
                              }}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                            >
                              Dar Baixa / Pagar
                            </button>
                          )}
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

      {/* TAB 3: CONTAS A RECEBER */}
      {activeTab === "receivable" && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar contas a receber por descrição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-x-auto text-xs text-neutral-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                  <th className="py-3">Título / Parcela</th>
                  <th className="py-3">Cliente / Sacado</th>
                  <th className="py-3">Vencimento</th>
                  <th className="py-3">Valor Esperado</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredReceivables.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500 italic">Nenhum recebimento cadastrado.</td>
                  </tr>
                ) : (
                  filteredReceivables.map((bill) => {
                    const isOverdue = new Date(bill.dueDate).getTime() < Date.now() && bill.status === BillStatus.PENDENTE;

                    return (
                      <tr key={bill.id} className="hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3.5 font-semibold text-neutral-200">{bill.description}</td>
                        <td className="py-3.5">{bill.supplierName || "Geral"}</td>
                        <td className="py-3.5 font-mono">{new Date(bill.dueDate).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3.5 font-mono font-bold text-neutral-200">R$ {bill.amount.toFixed(2)}</td>
                        <td className="py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            bill.status === BillStatus.PAGO 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : isOverdue 
                                ? "bg-red-500/10 text-red-400" 
                                : "bg-neutral-800 text-neutral-400"
                          }`}>
                            {bill.status === BillStatus.PAGO ? "Recebido" : isOverdue ? "Atrasado" : "Pendente"}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          {bill.status === BillStatus.PENDENTE && (
                            <button
                              onClick={() => {
                                const updated = { ...bill, status: BillStatus.PAGO };
                                onUpdateBill(updated);
                                alert("Recebimento liquidado com sucesso!");
                              }}
                              className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                            >
                              Liquidar Título
                            </button>
                          )}
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

      {/* COMPREHENSIVE NEW BILL CREATOR DIALOG */}
      {showBillForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleBillSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm">Lançar Nova Conta Financeira</h3>
              <button 
                type="button"
                onClick={() => setShowBillForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-300">
              
              {/* Type */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setType(BillType.PAGAR)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      type === BillType.PAGAR 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    Conta a Pagar (Despesa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(BillType.RECEBER)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      type === BillType.RECEBER 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    Conta a Receber (Receita)
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Descrição da Duplicata / Título *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Aluguel do Galpão de Bebidas"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Valor Total (R$) *</label>
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    value={amount || ""}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>

                {/* Due date */}
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Categoria de Custo</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="Mercadorias / Reposição">Mercadorias / Reposição</option>
                  <option value="Infraestrutura / Aluguel">Infraestrutura / Aluguel</option>
                  <option value="Logística / Motoboys">Logística / Motoboys</option>
                  <option value="Serviços Públicos (Água/Luz)">Serviços Públicos (Água/Luz)</option>
                  <option value="Outros Administrativos">Outros Administrativos</option>
                </select>
              </div>

              {/* Supplier / Creditor name */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Fornecedor / Sacado Vinculado</label>
                <input
                  type="text"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Nome do credor ou cliente"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowBillForm(false)}
                className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Lançar Título
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
