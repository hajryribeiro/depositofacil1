import React, { useState, useMemo } from "react";
import { 
  Warehouse, 
  ExternalLink, 
  Lock, 
  Unlock, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  PlusCircle, 
  AlertTriangle,
  History,
  CheckCircle2,
  DollarSign,
  Briefcase
} from "lucide-react";
import { 
  CashierSession, 
  CashierMovement, 
  CashierMovementType,
  PaymentMethod 
} from "../types";

interface CashierControlProps {
  companyId: string;
  unitId: string;
  activeSession?: CashierSession;
  sessions: CashierSession[];
  currentUser: { id: string; name: string };
  onOpenSession: (initialAmount: number, notes?: string) => void;
  onAddMovement: (amount: number, type: CashierMovementType, reason: string) => void;
  onCloseSession: (realAmounts: { [method in PaymentMethod]?: number }, closingNotes?: string) => void;
}

export default function CashierControl({
  companyId,
  unitId,
  activeSession: rawActiveSession,
  sessions,
  currentUser,
  onOpenSession,
  onAddMovement,
  onCloseSession
}: CashierControlProps) {
  const mappedSessions = useMemo(() => {
    return sessions.map(s => ({
      ...s,
      createdAt: s.openedAt || (s as any).createdAt || new Date().toISOString(),
      openedBy: s.operatorName || (s as any).openedBy || "Operador",
      initialAmount: typeof s.openingBalance === "number" ? s.openingBalance : ((s as any).initialAmount || 0),
      salesRecorded: s.salesRecorded || [],
      movements: s.movements || []
    }));
  }, [sessions]);

  const activeSession = useMemo(() => {
    if (!rawActiveSession) return undefined;
    return {
      ...rawActiveSession,
      createdAt: rawActiveSession.openedAt || (rawActiveSession as any).createdAt || new Date().toISOString(),
      openedBy: rawActiveSession.operatorName || (rawActiveSession as any).openedBy || "Operador",
      initialAmount: typeof rawActiveSession.openingBalance === "number" ? rawActiveSession.openingBalance : ((rawActiveSession as any).initialAmount || 0),
      salesRecorded: rawActiveSession.salesRecorded || [],
      movements: rawActiveSession.movements || []
    };
  }, [rawActiveSession]);

  // Opening flow state
  const [openingAmount, setOpeningAmount] = useState(150);
  const [openingNotes, setOpeningNotes] = useState("");

  // Adjustment movement state (Sangria / Suprimento)
  const [adjAmount, setAdjAmount] = useState<number>(0);
  const [adjType, setAdjType] = useState<CashierMovementType>(CashierMovementType.SANGRIA);
  const [adjReason, setAdjReason] = useState("");

  // Closing flow state
  const [showClosingForm, setShowClosingForm] = useState(false);
  const [declaredAmounts, setDeclaredAmounts] = useState<{ [method in PaymentMethod]?: number }>({
    [PaymentMethod.DINHEIRO]: 0,
    [PaymentMethod.PIX]: 0,
    [PaymentMethod.CREDITO]: 0,
    [PaymentMethod.DEBITO]: 0
  });
  const [closingNotes, setClosingNotes] = useState("");

  // Calculate totals for active session
  const activeTotals = useMemo(() => {
    if (!activeSession) return null;

    // Sum items by method
    const salesTotal = activeSession.salesRecorded.reduce((sum, s) => sum + s.total, 0);
    
    // Sum movements inside active session
    const sangriasTotal = activeSession.movements
      .filter(m => m.type === CashierMovementType.SANGRIA)
      .reduce((sum, m) => sum + m.amount, 0);

    const suprimentosTotal = activeSession.movements
      .filter(m => m.type === CashierMovementType.SUPRIMENTO)
      .reduce((sum, m) => sum + m.amount, 0);

    // Group sales payment methods inside active session
    const methodTotals: { [method in PaymentMethod]?: number } = {
      [PaymentMethod.DINHEIRO]: activeSession.initialAmount + suprimentosTotal - sangriasTotal,
      [PaymentMethod.PIX]: 0,
      [PaymentMethod.CREDITO]: 0,
      [PaymentMethod.DEBITO]: 0,
      [PaymentMethod.FIADO]: 0,
      [PaymentMethod.VALE]: 0
    };

    activeSession.salesRecorded.forEach(sale => {
      sale.payments.forEach(pay => {
        methodTotals[pay.method] = (methodTotals[pay.method] || 0) + pay.amount;
      });
    });

    const expectedTotal = Object.values(methodTotals).reduce((sum, val) => sum + (val || 0), 0);

    return {
      salesTotal,
      sangriasTotal,
      suprimentosTotal,
      methodTotals,
      expectedTotal
    };
  }, [activeSession]);

  // Session history list
  const companyClosedSessions = useMemo(() => {
    return mappedSessions
      .filter(s => s.companyId === companyId && s.unitId === unitId && s.status === "CLOSED")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [mappedSessions, companyId, unitId]);

  // Handle Opening Submission
  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (openingAmount < 0) return;
    onOpenSession(openingAmount, openingNotes || "Abertura automática de caixa");
    setOpeningNotes("");
    alert("Caixa aberto com sucesso! Boas vendas.");
  };

  // Handle Adjustment Submission (Sangria / Suprimento)
  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjAmount <= 0 || !adjReason.trim()) {
      alert("Por favor preencha valor positivo e justificativa!");
      return;
    }
    onAddMovement(adjAmount, adjType, adjReason);
    alert(`${adjType === CashierMovementType.SANGRIA ? "Sangria" : "Suprimento"} registrado com sucesso!`);
    setAdjAmount(0);
    setAdjReason("");
  };

  // Handle Closing Submission
  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCloseSession(declaredAmounts, closingNotes || "Fechamento realizado com conferência física.");
    setShowClosingForm(false);
    setDeclaredAmounts({
      [PaymentMethod.DINHEIRO]: 0,
      [PaymentMethod.PIX]: 0,
      [PaymentMethod.CREDITO]: 0,
      [PaymentMethod.DEBITO]: 0
    });
    setClosingNotes("");
    alert("Caixa fechado com sucesso! Relatório gerado.");
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-emerald-400" />
          Controle & Fechamento de Caixa
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Abertura de turnos, despesas de balcão, sangrias para motoboys e conciliação financeira do PDV
        </p>
      </div>

      {/* ACTIVE SESSION WORKSPACE OR OPENING PROMPT */}
      {!activeSession ? (
        /* NO ACTIVE SESSION: Prompts to OPEN cashier */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-200 text-sm">O caixa está fechado</h3>
                  <p className="text-xs text-neutral-400">Nenhum turno de operador de caixa ativo nesta unidade.</p>
                </div>
              </div>

              <p className="text-xs text-neutral-400 leading-relaxed">
                Para iniciar as operações de venda no PDV (Frente de Caixa), registrar entregas, ou processar pagamentos, você deve abrir o caixa informando o valor do <strong>fundo de troco inicial</strong> (suprimento básico).
              </p>

              <form onSubmit={handleOpenSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Fundo de Troco Inicial (R$)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">R$</span>
                      <input
                        type="number"
                        min={0}
                        required
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(parseFloat(e.target.value) || 0)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Observações de Abertura</label>
                    <input
                      type="text"
                      value={openingNotes}
                      onChange={(e) => setOpeningNotes(e.target.value)}
                      placeholder="Ex: Turno da Tarde - Balcão"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  ABRIR CAIXA COM R$ {openingAmount.toFixed(2)}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">Dicas de Segurança</h4>
              <ul className="text-xs text-neutral-500 space-y-2 list-disc list-inside">
                <li>Nunca inicie vendas sem registrar o saldo inicial para não inviabilizar o batimento financeiro.</li>
                <li>Mantenha um volume máximo de R$ 500 em dinheiro na gaveta. Sempre registre sangrias de segurança.</li>
                <li>As despesas com motoqueiros devem ser lançadas como despesa de Sangria.</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* CAIXA IS OPEN: Displays active operations controls */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active stats card */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute right-4 top-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest font-bold">
                Caixa Aberto / Operacional
              </div>

              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Turno iniciado em {new Date(activeSession.createdAt).toLocaleDateString("pt-BR")}</span>
                <h3 className="text-lg font-bold text-neutral-200 mt-1">Operador Responsável: {activeSession.openedBy}</h3>
              </div>

              {/* Breakdown metrics in drawer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Fundo Inicial</span>
                  <span className="font-mono font-bold text-sm text-neutral-300">R$ {activeSession.initialAmount.toFixed(2)}</span>
                </div>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Vendas Registradas</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">R$ {activeTotals?.salesTotal.toFixed(2)}</span>
                </div>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Reforços (Suprimento)</span>
                  <span className="font-mono font-bold text-sm text-neutral-300">R$ {activeTotals?.suprimentosTotal.toFixed(2)}</span>
                </div>
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850">
                  <span className="text-[9px] text-neutral-500 font-mono block uppercase">Retiradas (Sangria)</span>
                  <span className="font-mono font-bold text-sm text-red-400">R$ {activeTotals?.sangriasTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Real time expected ledger per paymethod */}
              <div className="mt-6 border-t border-neutral-800/60 pt-4">
                <h4 className="text-xs font-bold text-neutral-300 mb-3 uppercase font-mono tracking-wider">Saldo Esperado em Gaveta / Máquinas</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {Object.keys(activeTotals?.methodTotals || {}).map(method => {
                    const amount = activeTotals?.methodTotals[method as PaymentMethod] || 0;
                    return (
                      <div key={method} className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-850/40">
                        <span className="text-neutral-500 text-[10px] block uppercase">{method}</span>
                        <span className="font-bold text-neutral-200">R$ {amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Big closing button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    // Pre-populate declared with expected values to help testing
                    const initialDeclared: { [method in PaymentMethod]?: number } = {};
                    Object.keys(activeTotals?.methodTotals || {}).forEach(k => {
                      initialDeclared[k as PaymentMethod] = parseFloat((activeTotals?.methodTotals[k as PaymentMethod] || 0).toFixed(2));
                    });
                    setDeclaredAmounts(initialDeclared);
                    setShowClosingForm(true);
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                >
                  <Lock className="w-4 h-4" />
                  CONCILIAR E FECHAR CAIXA
                </button>
              </div>
            </div>

            {/* Cash adjustments listing (Sangrias suprimentos inside active session) */}
            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
              <h4 className="font-bold text-neutral-200 text-sm">Lançamentos Avulsos na Sessão</h4>
              <p className="text-xs text-neutral-400">Despesas, troco adicional e retiradas da gaveta</p>

              <div className="divide-y divide-neutral-850 mt-4 max-h-[200px] overflow-y-auto pr-2">
                {activeSession.movements.length === 0 ? (
                  <p className="text-xs text-neutral-500 italic py-4 text-center">Nenhum ajuste registrado neste turno.</p>
                ) : (
                  activeSession.movements.map((mov, i) => (
                    <div key={i} className="py-2.5 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          mov.type === CashierMovementType.SANGRIA ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {mov.type}
                        </span>
                        <span className="text-neutral-300 font-semibold">{mov.reason}</span>
                      </div>
                      <span className={`font-mono font-bold ${mov.type === CashierMovementType.SANGRIA ? "text-red-400" : "text-emerald-400"}`}>
                        {mov.type === CashierMovementType.SANGRIA ? "-" : "+"} R$ {mov.amount.toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Quick Sangria/Suprimento action form */}
          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-fit">
            <h4 className="font-bold text-neutral-200 text-sm border-b border-neutral-800 pb-3">Movimentar Fundo de Caixa</h4>
            <p className="text-xs text-neutral-400 mt-1">Lançar retiradas rápidas (motoboy, lanche) ou troco adicional</p>

            <form onSubmit={handleAdjSubmit} className="space-y-4 mt-4">
              {/* Type */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setAdjType(CashierMovementType.SANGRIA)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      adjType === CashierMovementType.SANGRIA 
                        ? "bg-red-500/10 border-red-500/20 text-red-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    Sangria (Retirada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType(CashierMovementType.SUPRIMENTO)}
                    className={`py-2 rounded-lg font-bold border transition-all ${
                      adjType === CashierMovementType.SUPRIMENTO 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-neutral-950 border-neutral-800 text-neutral-400"
                    }`}
                  >
                    Suprimento (Entrada)
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Valor (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">R$</span>
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    value={adjAmount || ""}
                    onChange={(e) => setAdjAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Justificativa / Destinação *</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="Ex: Pagamento Motoboy Diária ou Troco Moedas"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg py-2 px-3 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-850 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Confirmar Lançamento
              </button>
            </form>
          </div>

        </div>
      )}

      {/* CLOSING RECONCILIATION MODAL */}
      {showClosingForm && activeSession && activeTotals && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <form 
            onSubmit={handleCloseSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                Auditoria e Conciliação de Caixa
              </h3>
              <button 
                type="button"
                onClick={() => setShowClosingForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            {/* Scrollable closure audit items */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono text-neutral-300">
              <p className="text-xs text-neutral-400 font-sans leading-normal">
                Conte física ou digitalmente os valores das gavetas e maquininhas e insira abaixo. O sistema baterá com os valores lógicos registrados.
              </p>

              <div className="divide-y divide-neutral-800/80">
                {Object.keys(declaredAmounts).map(method => {
                  const expected = activeTotals.methodTotals[method as PaymentMethod] || 0;
                  const declared = declaredAmounts[method as PaymentMethod] || 0;
                  const discrepancy = declared - expected;

                  return (
                    <div key={method} className="py-3 flex items-center justify-between gap-4">
                      <span className="font-bold uppercase text-neutral-200">{method}</span>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] text-neutral-500">Esperado: R$ {expected.toFixed(2)}</span>
                        
                        {/* Input declared */}
                        <div className="relative w-28">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-500">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={declared || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setDeclaredAmounts({ ...declaredAmounts, [method as PaymentMethod]: val });
                            }}
                            className="w-full bg-neutral-950 border border-neutral-800 rounded py-1 pl-6 pr-2 text-right font-mono text-xs text-neutral-100"
                          />
                        </div>

                        {/* Discrepancy show */}
                        <span className={`w-20 text-right font-bold ${
                          discrepancy === 0 
                            ? "text-emerald-400" 
                            : discrepancy > 0 
                              ? "text-teal-400" 
                              : "text-red-400"
                        }`}>
                          {discrepancy === 0 ? "Bateu" : discrepancy > 0 ? `+ R$ ${discrepancy.toFixed(2)}` : `- R$ ${Math.abs(discrepancy).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General notes */}
              <div className="space-y-1 pt-3">
                <label className="text-xs font-sans font-semibold text-neutral-400">Observações de Fechamento / Justificativas de Quebra de Caixa</label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  rows={2}
                  placeholder="Se houver diferença, justifique aqui (Ex: Moeda perdida, estorno pendente)"
                  className="w-full font-sans bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowClosingForm(false)}
                className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Voltar ao Painel
              </button>
              <button 
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Confirmar Fechamento e Gravar Relatório
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORIC CLOSED SESSIONS TABLE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <h4 className="font-bold text-neutral-200 text-sm flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-neutral-400" />
          Histórico de Caixas Fechados
        </h4>

        <div className="overflow-x-auto text-xs text-neutral-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                <th className="py-3">Abertura</th>
                <th className="py-3">Fechamento</th>
                <th className="py-3">Operador</th>
                <th className="py-3">Saldo Inicial</th>
                <th className="py-3">Faturamento lícito</th>
                <th className="py-3">Conferido</th>
                <th className="py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850/60 font-mono">
              {companyClosedSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-neutral-500 italic">Nenhum caixa fechado arquivado ainda.</td>
                </tr>
              ) : (
                companyClosedSessions.map((s, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="py-3">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3">{s.closedAt ? new Date(s.closedAt).toLocaleDateString("pt-BR") : "N/A"}</td>
                      <td className="py-3">{s.openedBy}</td>
                      <td className="py-3">R$ {s.initialAmount.toFixed(2)}</td>
                      <td className="py-3">R$ {s.salesRecorded.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</td>
                      <td className="py-3">R$ {(s.reportedBalance || 0).toFixed(2)}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-950 text-neutral-400 border border-neutral-800">
                          FECHADO
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
