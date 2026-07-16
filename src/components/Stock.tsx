import React, { useState, useMemo } from "react";
import { 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  SlidersHorizontal, 
  Plus, 
  Search, 
  Calendar, 
  RefreshCw, 
  Activity, 
  AlertTriangle,
  CheckSquare,
  Sparkles
} from "lucide-react";
import { 
  FullProduct, 
  StockMovement, 
  StockMovementType, 
  Unit 
} from "../types";

interface StockProps {
  companyId: string;
  unitId: string;
  products: FullProduct[];
  movements: StockMovement[];
  units: Unit[];
  onAddMovement: (m: StockMovement) => void;
}

export default function Stock({
  companyId,
  unitId,
  products,
  movements,
  units,
  onAddMovement
}: StockProps) {
  // Stock list states
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);

  // Adjustment form states
  const [selectedProductId, setSelectedProductId] = useState("");
  const [movementType, setMovementType] = useState<StockMovementType>(StockMovementType.ENTRADA);
  const [qty, setQty] = useState(1);
  const [costPrice, setCostPrice] = useState(0);
  const [targetUnitId, setTargetUnitId] = useState(""); // for transferences
  const [reason, setReason] = useState("");

  // Audit state
  const [showAuditPanel, setShowAuditPanel] = useState(false);
  const [auditCounts, setAuditCounts] = useState<{ [productId: string]: number }>({});
  const [auditReasons, setAuditReasons] = useState<{ [productId: string]: string }>({});

  const companyUnits = units.filter(u => u.companyId === companyId);
  const companyProducts = products.filter(p => p.companyId === companyId && p.isActive);

  // Filtered movements log
  const filteredMovements = useMemo(() => {
    let list = movements.filter(m => m.companyId === companyId);

    if (filterType !== "all") {
      list = list.filter(m => m.type === filterType);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => 
        m.productName.toLowerCase().includes(q) ||
        m.reason.toLowerCase().includes(q) ||
        m.operatorName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [movements, companyId, filterType, search]);

  // Handle Adjustment submission
  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    const prod = companyProducts.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Movement build
    const m: StockMovement = {
      id: `mov_${Date.now()}`,
      companyId,
      unitId,
      productId: selectedProductId,
      productName: prod.name,
      type: movementType,
      quantity: qty,
      costPrice: costPrice > 0 ? costPrice : prod.costPrice,
      targetUnitId: movementType === StockMovementType.TRANSFERENCIA_SAIDA ? targetUnitId : undefined,
      reason: reason || "Ajuste manual de estoque",
      operatorId: "usr_1", // Default simulated admin user ID
      operatorName: "Carlos Silva",
      createdAt: new Date().toISOString()
    };

    onAddMovement(m);
    alert(`Ajuste de estoque para '${prod.name}' cadastrado com sucesso!`);
    setShowAdjustmentForm(false);
    setSelectedProductId("");
    setQty(1);
    setCostPrice(0);
    setReason("");
  };

  // Physical Audit Handler
  const handleSaveAudit = () => {
    let auditCreated = false;
    
    Object.keys(auditCounts).forEach(prodId => {
      const prod = companyProducts.find(p => p.id === prodId);
      if (!prod) return;

      const currentStock = prod.stockQty[unitId] || 0;
      const physicalCount = auditCounts[prodId];
      const diff = physicalCount - currentStock;

      if (diff !== 0) {
        auditCreated = true;
        // Build movement to match audit count
        const movType = StockMovementType.INVENTARIO_AJUSTE;
        
        const m: StockMovement = {
          id: `mov_audit_${Date.now()}_${prodId}`,
          companyId,
          unitId,
          productId: prodId,
          productName: prod.name,
          type: movType,
          quantity: diff,
          costPrice: prod.costPrice,
          reason: auditReasons[prodId] || `Diferença encontrada em inventário físico (Diferença: ${diff > 0 ? "+" : ""}${diff})`,
          operatorId: "usr_1",
          operatorName: "Carlos Silva (Inventário)",
          createdAt: new Date().toISOString()
        };
        onAddMovement(m);
      }
    });

    if (auditCreated) {
      alert("Inventário físico finalizado! Ajustes de estoque gravados com sucesso para as divergências encontradas.");
    } else {
      alert("Inventário finalizado! Nenhuma divergência encontrada em relação ao estoque lógico.");
    }

    setAuditCounts({});
    setAuditReasons({});
    setShowAuditPanel(false);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Header and Quick Stats row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            Controle de Estoque & Movimentações
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão de inventário multidepósito, transferências e acertos de contagem
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Reset counts
              const initial: { [id: string]: number } = {};
              companyProducts.forEach(p => {
                initial[p.id] = p.stockQty[unitId] || 0;
              });
              setAuditCounts(initial);
              setShowAuditPanel(true);
            }}
            className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            Auditoria / Inventário Físico
          </button>

          <button
            onClick={() => setShowAdjustmentForm(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <Plus className="w-4 h-4" />
            Novo Ajuste de Estoque
          </button>
        </div>
      </div>

      {/* Audit/Physical inventory Count panel */}
      {showAuditPanel && (
        <div className="bg-neutral-900 border-2 border-emerald-500/20 p-5 rounded-2xl space-y-4 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Painel de Inventário Físico (Auditoria de Depósito)
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Insira as quantidades reais contadas na prateleira. O sistema ajustará as diferenças automaticamente.
              </p>
            </div>
            <button 
              onClick={() => {
                setShowAuditPanel(false);
                setAuditCounts({});
              }}
              className="text-xs text-neutral-400 hover:text-white"
            >
              Cancelar Auditoria
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-neutral-800/60 pr-2">
            {companyProducts.map(p => {
              const currentStock = p.stockQty[unitId] || 0;
              const counted = auditCounts[p.id] !== undefined ? auditCounts[p.id] : currentStock;
              const diff = counted - currentStock;

              return (
                <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-semibold text-neutral-200">{p.name}</span>
                    <span className="text-[10px] text-neutral-500 block">EAN: {p.barcode || "N/A"} | Sistema: {currentStock} {p.unitOfMeasure}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Variance visualization */}
                    {diff !== 0 && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        diff > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        Diferença: {diff > 0 ? "+" : ""}{diff}
                      </span>
                    )}

                    {/* Inputs */}
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 px-2 py-1 rounded">
                      <span className="text-[10px] text-neutral-500 font-mono">Qtd Real:</span>
                      <input
                        type="number"
                        min={0}
                        value={counted}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setAuditCounts({ ...auditCounts, [p.id]: val });
                        }}
                        className="w-14 bg-transparent border-none text-right font-mono focus:outline-none p-0 text-neutral-200"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Motivo (Opcional)"
                      value={auditReasons[p.id] || ""}
                      onChange={(e) => setAuditReasons({ ...auditReasons, [p.id]: e.target.value })}
                      className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-[11px] text-neutral-300 w-32 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-800/60">
            <button
              onClick={handleSaveAudit}
              className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs"
            >
              Confirmar Contagem e Ajustar Estoque
            </button>
          </div>
        </div>
      )}

      {/* GRID LOGS AND MANUAL FORM BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: Movements Log list */}
        <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col h-[550px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4 mb-4">
            <div>
              <h3 className="font-bold text-neutral-200 text-sm">Histórico Detalhado de Movimentos</h3>
              <p className="text-xs text-neutral-400">Rastreamento de auditoria para todas as entradas e saídas</p>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded text-[11px] text-neutral-300 py-1 px-2 focus:outline-none"
              >
                <option value="all">Todas Operações</option>
                <option value={StockMovementType.ENTRADA}>Entrada</option>
                <option value={StockMovementType.SAIDA_VENDA}>Venda</option>
                <option value={StockMovementType.PERDA}>Perda / Descarte</option>
                <option value={StockMovementType.AJUSTE_MANUAL}>Ajuste Manual</option>
                <option value={StockMovementType.TRANSFERENCIA_SAIDA}>Transferência</option>
              </select>

              <input
                type="text"
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded text-[11px] text-neutral-300 py-1 px-2.5 focus:outline-none"
              />
            </div>
          </div>

          {/* Movements Timeline */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-850 pr-2 custom-scrollbar">
            {filteredMovements.length === 0 ? (
              <p className="text-xs text-neutral-500 italic py-8 text-center">Nenhum movimento registrado para os filtros selecionados.</p>
            ) : (
              filteredMovements.map((m) => {
                const isPositive = m.type === StockMovementType.ENTRADA || m.type === StockMovementType.TRANSFERENCIA_ENTRADA || (m.type === StockMovementType.TRANSFERENCIA_SAIDA && m.targetUnitId === unitId) || m.quantity > 0;
                
                return (
                  <div key={m.id} className="py-3 flex justify-between items-center text-xs gap-4">
                    <div className="flex items-center gap-3">
                      {/* Indicator arrow */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        isPositive 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>

                      <div>
                        <p className="font-semibold text-neutral-200">{m.productName}</p>
                        <p className="text-[10px] text-neutral-500">
                          Motivo: {m.reason} | por {m.operatorName}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold text-sm ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                        {isPositive ? "+" : "-"}{m.quantity}
                      </span>
                      <p className="text-[9px] text-neutral-500 font-mono mt-0.5">
                        {new Date(m.createdAt).toLocaleDateString("pt-BR")} às {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT: Quick Manual adjustment Form */}
        <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-[550px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="font-bold text-neutral-200 text-sm">Entrada / Baixa Manual</h3>
              <p className="text-xs text-neutral-400 mt-1">Registrar ajuste pontual no inventário físico</p>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              {/* Product */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Produto</label>
                <select
                  required
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = companyProducts.find(item => item.id === e.target.value);
                    if (p) setCostPrice(p.costPrice);
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="">Selecione o produto...</option>
                  {companyProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.stockQty[unitId] || 0} UN)</option>
                  ))}
                </select>
              </div>

              {/* Movement Type */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Operação</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value={StockMovementType.ENTRADA}>Entrada (Compra/Estorno)</option>
                  <option value={StockMovementType.SAIDA_VENDA}>Saída por Venda</option>
                  <option value={StockMovementType.PERDA}>Perda (Avaria/Vencido)</option>
                  <option value={StockMovementType.AJUSTE_MANUAL}>Ajuste Manual</option>
                  <option value={StockMovementType.TRANSFERENCIA_SAIDA}>Transferência de Unidade</option>
                </select>
              </div>

              {/* Transfer Target Unit (If transfer) */}
              {movementType === StockMovementType.TRANSFERENCIA_SAIDA && (
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Unidade de Destino</label>
                  <select
                    required
                    value={targetUnitId}
                    onChange={(e) => setTargetUnitId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                  >
                    <option value="">Selecione o destino...</option>
                    {companyUnits.filter(u => u.id !== unitId).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Qty */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Quantidade</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={qty}
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>

                {/* Cost Price */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice || ""}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs text-neutral-400 block font-semibold">Justificativa / Motivo</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Nota Fiscal nº 542 ou Brinde Ambev"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-neutral-800 hover:bg-neutral-750 text-emerald-400 border border-emerald-500/20 py-2.5 rounded-xl text-xs font-bold transition-all mt-2"
              >
                Gravar Lançamento
              </button>
            </form>
          </div>

          {/* Bottom tips */}
          <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-[10px] text-neutral-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Qualquer alteração manual nesta tela gera um registro de auditoria permanente no sistema, vinculando seu usuário e hora do ajuste.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
