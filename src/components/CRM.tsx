import React, { useState, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Phone, 
  Coins, 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Plus, 
  Tag, 
  UserCheck, 
  Wine, 
  ShoppingBag,
  Truck,
  RotateCcw
} from "lucide-react";
import { Client, Supplier, ReturnableVasilhame, PlanId } from "../types";

interface CRMProps {
  companyId: string;
  clients: Client[];
  suppliers: Supplier[];
  vasilhames: ReturnableVasilhame[];
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
  onAddSupplier: (s: Supplier) => void;
  onAddVasilhame: (v: ReturnableVasilhame) => void;
}

export default function CRM({
  companyId,
  clients,
  suppliers,
  vasilhames,
  onAddClient,
  onUpdateClient,
  onAddSupplier,
  onAddVasilhame
}: CRMProps) {
  // Navigation tab inside CRM
  const [activeSubTab, setActiveSubTab] = useState<"clients" | "vasilhames" | "suppliers">("clients");
  const [search, setSearch] = useState("");

  // Modals / Form toggle
  const [showClientForm, setShowClientForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showVasilhameForm, setShowVasilhameForm] = useState(false);

  // Form inputs
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [creditLimit, setCreditLimit] = useState(500);

  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [supplierContactPerson, setSupplierContactPerson] = useState("");
  const [supplierBrandList, setSupplierBrandList] = useState("");

  const [vasClient, setVasClient] = useState("");
  const [vasBottlesLoaned, setVasBottlesLoaned] = useState(12);
  const [vasBottlesReturned, setVasBottlesReturned] = useState(0);
  const [vasBottleType, setVasBottleType] = useState("Garrafa Litrão 1L (Heineken/Antarctica)");

  const companyClients = useMemo(() => {
    return clients.filter(c => c.companyId === companyId);
  }, [clients, companyId]);

  const companySuppliers = useMemo(() => {
    return suppliers.filter(s => s.companyId === companyId);
  }, [suppliers, companyId]);

  const companyVasilhames = useMemo(() => {
    return vasilhames.filter(v => v.companyId === companyId);
  }, [vasilhames, companyId]);

  // Helper to format address
  const formatAddress = (addr: any) => {
    if (!addr) return "";
    if (typeof addr === "string") return addr;
    const parts = [
      addr.street,
      addr.number,
      addr.neighborhood,
      addr.city,
      addr.state
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Filters logic
  const filteredClients = useMemo(() => {
    if (!search.trim()) return companyClients;
    const q = search.toLowerCase();
    return companyClients.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.address && formatAddress(c.address).toLowerCase().includes(q))
    );
  }, [companyClients, search]);

  const filteredSuppliers = useMemo(() => {
    if (!search.trim()) return companySuppliers;
    const q = search.toLowerCase();
    return companySuppliers.filter(s => 
      s.name.toLowerCase().includes(q) ||
      s.brandsSupplied.some(b => b.toLowerCase().includes(q)) ||
      s.phone.toLowerCase().includes(q)
    );
  }, [companySuppliers, search]);

  // Handlers
  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const fresh: Client = {
      id: `client_${Date.now()}`,
      companyId,
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      address: {
        street: clientAddress || "Endereço principal",
        number: "S/N",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000"
      },
      creditLimit,
      currentDebt: 0,
      type: "PF",
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    onAddClient(fresh);
    alert("Cliente cadastrado com sucesso!");
    setShowClientForm(false);
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setClientAddress("");
    setCreditLimit(500);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;

    const fresh: Supplier = {
      id: `supplier_${Date.now()}`,
      companyId,
      name: supplierName,
      corporateName: supplierName,
      tradingName: supplierName,
      phone: supplierPhone,
      contactPerson: supplierContactPerson,
      brandsSupplied: supplierBrandList.split(",").map(b => b.trim()).filter(Boolean),
      isActive: true
    };

    onAddSupplier(fresh);
    alert("Fornecedor cadastrado com sucesso!");
    setShowSupplierForm(false);
    setSupplierName("");
    setSupplierPhone("");
    setSupplierContactPerson("");
    setSupplierBrandList("");
  };

  const handleVasilhameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vasClient) return;

    const client = companyClients.find(c => c.id === vasClient);
    if (!client) return;

    const fresh: ReturnableVasilhame = {
      id: `vas_${Date.now()}`,
      companyId,
      clientId: client.id,
      clientName: client.name,
      bottleType: vasBottleType,
      quantityLoaned: vasBottlesLoaned,
      quantityReturned: vasBottlesReturned,
      status: vasBottlesLoaned > vasBottlesReturned ? "PENDENTE" : "DEVOLVIDO",
      updatedAt: new Date().toISOString()
    };

    onAddVasilhame(fresh);
    alert("Movimentação de Vasilhames gravada com sucesso!");
    setShowVasilhameForm(false);
    setVasClient("");
    setVasBottlesLoaned(12);
    setVasBottlesReturned(0);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* CRM Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            CRM & Controle de Vasilhames
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gestão de clientes fiados, fornecedores de bebidas e controle físico de vasilhames e engradados retornáveis
          </p>
        </div>

        {/* Action Trigger based on current tab */}
        <div className="flex items-center gap-2">
          {activeSubTab === "clients" && (
            <button
              onClick={() => setShowClientForm(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <UserPlus className="w-4 h-4" />
              Novo Cliente
            </button>
          )}

          {activeSubTab === "suppliers" && (
            <button
              onClick={() => setShowSupplierForm(true)}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Plus className="w-4 h-4" />
              Novo Fornecedor
            </button>
          )}

          {activeSubTab === "vasilhames" && (
            <button
              onClick={() => {
                if (companyClients.length === 0) {
                  alert("Cadastre pelo menos um cliente para emprestar vasilhames!");
                  return;
                }
                setShowVasilhameForm(true);
              }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              <Wine className="w-4 h-4" />
              Lançar Empréstimo / Devolução
            </button>
          )}
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex border-b border-neutral-800 gap-1">
        <button
          onClick={() => { setActiveSubTab("clients"); setSearch(""); }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "clients" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Clientes & Fiados ({companyClients.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("vasilhames"); setSearch(""); }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "vasilhames" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Engradados & Vasilhames ({companyVasilhames.length})
        </button>

        <button
          onClick={() => { setActiveSubTab("suppliers"); setSearch(""); }}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
            activeSubTab === "suppliers" 
              ? "border-emerald-400 text-emerald-400" 
              : "border-transparent text-neutral-400 hover:text-neutral-200"
          }`}
        >
          Fornecedores ({companySuppliers.length})
        </button>
      </div>

      {/* FILTER SEARCH INPUT */}
      {activeSubTab !== "vasilhames" && (
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeSubTab === "clients" ? "Buscar por nome do cliente, celular, rua..." : "Buscar fornecedor ou marcas de bebidas..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* CONTENT LIST PANEL */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        
        {/* SUBTAB 1: CLIENTS WITH CREDIT AND DEBT LEVELS */}
        {activeSubTab === "clients" && (
          <div className="overflow-x-auto text-xs text-neutral-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                  <th className="py-3">Nome</th>
                  <th className="py-3">Celular</th>
                  <th className="py-3">Endereço de Entrega</th>
                  <th className="py-3">Dívida Atual</th>
                  <th className="py-3">Limite de Crédito</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500 italic">Nenhum cliente correspondente encontrado.</td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const availableCredit = client.creditLimit - client.currentDebt;
                    const debtRatio = (client.currentDebt / client.creditLimit) * 100;

                    return (
                      <tr key={client.id} className="hover:bg-neutral-950/20 transition-colors">
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center font-bold text-emerald-400">
                              {client.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-neutral-200">{client.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 font-mono">
                          <a href={`tel:${client.phone}`} className="flex items-center gap-1 hover:underline text-neutral-300">
                            <Phone className="w-3.5 h-3.5 text-neutral-500" />
                            {client.phone}
                          </a>
                        </td>
                        <td className="py-3.5 truncate max-w-[200px]" title={formatAddress(client.address)}>
                          {formatAddress(client.address) || <span className="text-neutral-500 italic">Não informado</span>}
                        </td>
                        <td className="py-3.5 font-mono">
                          <span className={`font-bold ${client.currentDebt > 0 ? "text-red-400 font-extrabold" : "text-neutral-400"}`}>
                            R$ {client.currentDebt.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 font-mono">
                          <span>R$ {client.creditLimit.toFixed(2)}</span>
                          <div className="w-24 h-1.5 bg-neutral-850 rounded-full overflow-hidden mt-1.5">
                            <div 
                              style={{ width: `${Math.min(100, debtRatio)}%` }} 
                              className={`h-full ${debtRatio > 80 ? "bg-red-500" : "bg-emerald-400"}`}
                            />
                          </div>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => {
                              const payAmountStr = prompt(`Registrar Pagamento de Dívida (Fiado) para ${client.name}. \nDívida atual: R$ ${client.currentDebt.toFixed(2)} \nInsira o valor pago:`);
                              const amt = parseFloat(payAmountStr || "");
                              if (!isNaN(amt) && amt > 0) {
                                if (amt > client.currentDebt) {
                                  alert("Erro: O valor pago não pode ser maior que a dívida acumulada!");
                                  return;
                                }
                                const updated = { ...client, currentDebt: client.currentDebt - amt };
                                onUpdateClient(updated);
                                alert(`Sucesso! Pagamento de R$ ${amt.toFixed(2)} recebido. Nova dívida: R$ ${updated.currentDebt.toFixed(2)}.`);
                              }
                            }}
                            className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-2.5 py-1 rounded text-[11px] font-semibold"
                          >
                            Abater Dívida
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 2: RETURNABLES LEDGER */}
        {activeSubTab === "vasilhames" && (
          <div className="space-y-4">
            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 text-xs text-neutral-400 flex items-start gap-2.5">
              <RotateCcw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Controle de Cascos e Engradados Retornáveis:</strong> No depósito de bebidas, o controle de vasilhames vazios garante que fardos e engradados não sejam extraviados. A tabela abaixo rastreia empréstimos e saldos devidos por cada cliente.
              </span>
            </div>

            <div className="overflow-x-auto text-xs text-neutral-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                    <th className="py-3">Cliente</th>
                    <th className="py-3">Tipo do Vasilhame</th>
                    <th className="py-3">Quantidade Emprestada</th>
                    <th className="py-3">Quantidade Devolvida</th>
                    <th className="py-3">Saldo Devido (Cascos)</th>
                    <th className="py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {companyVasilhames.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-neutral-500 italic">Nenhum vasilhame em aberto na conta deste locatário.</td>
                    </tr>
                  ) : (
                    companyVasilhames.map((vas, idx) => {
                      const balance = vas.quantityLoaned - vas.quantityReturned;
                      return (
                        <tr key={idx} className="hover:bg-neutral-950/20 transition-colors">
                          <td className="py-3.5 font-semibold text-neutral-200">{vas.clientName}</td>
                          <td className="py-3.5 text-neutral-300">{vas.bottleType}</td>
                          <td className="py-3.5 font-mono">{vas.quantityLoaned} cascos</td>
                          <td className="py-3.5 font-mono">{vas.quantityReturned} cascos</td>
                          <td className="py-3.5 font-mono">
                            <span className={`font-bold ${balance > 0 ? "text-yellow-500" : "text-emerald-400"}`}>
                              {balance} devedores
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            {balance > 0 ? (
                              <button
                                onClick={() => {
                                  const qtyStr = prompt(`Registrar retorno de cascos para ${vas.clientName}.\nCascos devedores: ${balance}\nInsira quantos cascos foram devolvidos:`);
                                  const q = parseInt(qtyStr || "");
                                  if (!isNaN(q) && q > 0) {
                                    if (q > balance) {
                                      alert("Erro: O número de devoluções não pode ser maior que o saldo pendente!");
                                      return;
                                    }
                                    const updated = {
                                      ...vas,
                                      quantityReturned: vas.quantityReturned + q,
                                      status: vas.quantityReturned + q >= vas.quantityLoaned ? "DEVOLVIDO" : "PENDENTE"
                                    };
                                    onAddVasilhame(updated); // triggers re-render via state injection
                                    alert(`Sucesso! ${q} cascos devolvidos pelo cliente.`);
                                  }
                                }}
                                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-[11px]"
                              >
                                Devolver Casco
                              </button>
                            ) : (
                              <span className="text-emerald-400 text-[10px] uppercase font-bold">100% Devolvido</span>
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

        {/* SUBTAB 3: SUPPLIERS */}
        {activeSubTab === "suppliers" && (
          <div className="overflow-x-auto text-xs text-neutral-300">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 font-mono text-neutral-500 uppercase text-[10px]">
                  <th className="py-3">Nome do Fornecedor</th>
                  <th className="py-3">Representante / Contato</th>
                  <th className="py-3">Celular de Pedidos</th>
                  <th className="py-3">Principais Marcas Fornecidas</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850">
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-neutral-500 italic">Nenhum fornecedor correspondente.</td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-neutral-950/20 transition-colors">
                      <td className="py-3.5 font-bold text-neutral-200">{supplier.name}</td>
                      <td className="py-3.5 text-neutral-300">{supplier.contactPerson}</td>
                      <td className="py-3.5 font-mono">{supplier.phone}</td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {supplier.brandsSupplied.map((b, i) => (
                            <span key={i} className="bg-neutral-950 border border-neutral-800 text-[9px] px-1.5 py-0.5 rounded text-neutral-400 uppercase">
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            const note = encodeURIComponent(`Olá ${supplier.contactPerson || supplier.name}! Gostaríamos de fazer uma cotação de compra de bebidas para reposição do estoque. Aguardamos retorno!`);
                            window.open(`https://api.whatsapp.com/send?phone=${supplier.phone}&text=${note}`);
                          }}
                          className="bg-neutral-800 hover:bg-neutral-750 text-neutral-200 px-3 py-1.5 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          Enviar Cotação
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* MODAL 1: NEW CLIENT FORM */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleClientSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Cadastrar Novo Cliente
              </h3>
              <button 
                type="button"
                onClick={() => setShowClientForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Ex: João da Silva Santos"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Celular de Contato *</label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">E-mail</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Email (Opcional)"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Endereço Completo de Entrega</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro, CEP"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Limite de Venda Fiada (Crédito Máximo R$)</label>
                <input
                  type="number"
                  min={0}
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseInt(e.target.value) || 0)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowClientForm(false)}
                className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Cadastrar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: NEW SUPPLIER FORM */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleSupplierSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm">Cadastrar Novo Fornecedor</h3>
              <button 
                type="button"
                onClick={() => setShowSupplierForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Razão Social / Fornecedor *</label>
                <input
                  type="text"
                  required
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ex: Distribuidora Ambev Regional Norte"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Celular / WhatsApp Comercial *</label>
                  <input
                    type="tel"
                    required
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-9999"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Contato Representante</label>
                  <input
                    type="text"
                    value={supplierContactPerson}
                    onChange={(e) => setSupplierContactPerson(e.target.value)}
                    placeholder="Nome do vendedor"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Marcas Fornecidas (Separadas por vírgulas) *</label>
                <input
                  type="text"
                  required
                  value={supplierBrandList}
                  onChange={(e) => setSupplierBrandList(e.target.value)}
                  placeholder="Ex: Skol, Brahma, Budweiser, Stella Artois"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowSupplierForm(false)}
                className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Cadastrar Fornecedor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: NEW VASILHAME (EMPTY) LOAN/RETURN FORM */}
      {showVasilhameForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form 
            onSubmit={handleVasilhameSubmit}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <Wine className="w-4 h-4 text-emerald-400" />
                Lançar Movimento de Vasilhames
              </h3>
              <button 
                type="button"
                onClick={() => setShowVasilhameForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Select Client */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Cliente Destinatário *</label>
                <select
                  required
                  value={vasClient}
                  onChange={(e) => setVasClient(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="">Selecione o cliente...</option>
                  {companyClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Saldo devedor vasilhames: R$ {c.currentDebt.toFixed(0)})</option>
                  ))}
                </select>
              </div>

              {/* Bottle Type */}
              <div className="space-y-1">
                <label className="text-neutral-400 block font-semibold">Tipo do Vasilhame / Casco</label>
                <select
                  value={vasBottleType}
                  onChange={(e) => setVasBottleType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="Garrafa Litrão 1L (Heineken/Antarctica)">Garrafa Litrão 1L (Heineken/Antarctica)</option>
                  <option value="Garrafa 600ml (Skol/Brahma)">Garrafa 600ml (Skol/Brahma)</option>
                  <option value="Caixa de Engradado Plástico de Cerveja">Caixa de Engradado Plástico de Cerveja</option>
                  <option value="Barril de Inox de Chopp 50L (Vazio)">Barril de Inox de Chopp 50L (Vazio)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Quantidade Emprestada</label>
                  <input
                    type="number"
                    min={0}
                    value={vasBottlesLoaned}
                    onChange={(e) => setVasBottlesLoaned(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-400 block font-semibold">Quantidade Devolvida no ato</label>
                  <input
                    type="number"
                    min={0}
                    value={vasBottlesReturned}
                    onChange={(e) => setVasBottlesReturned(parseInt(e.target.value) || 0)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs font-mono text-neutral-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setShowVasilhameForm(false)}
                className="bg-neutral-900 text-neutral-400 px-4 py-2 rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                Registrar Movimento
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
