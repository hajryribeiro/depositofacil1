import React, { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Plus, 
  User, 
  Phone, 
  Clock, 
  RotateCcw, 
  Search, 
  Smartphone,
  CheckCircle,
  TrendingUp,
  Map
} from "lucide-react";
import { CustomerOrder, OrderStatus, UserRole } from "../types";

interface LogisticsProps {
  companyId: string;
  orders: CustomerOrder[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, deliveryPersonId?: string, deliveryPersonName?: string) => void;
  currentUserRole: UserRole;
}

export default function Logistics({
  companyId,
  orders,
  onUpdateOrderStatus,
  currentUserRole
}: LogisticsProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "routesim" | "driver_portal">("kanban");
  const [selectedDriverId, setSelectedDriverId] = useState("drv_julio");

  const formatAddress = (addr: any) => {
    if (!addr) return "Retirada / Sem Endereço";
    if (typeof addr === "string") return addr;
    const parts = [
      addr.street,
      addr.number,
      addr.neighborhood,
      addr.city,
      addr.state || addr.uf
    ].filter(Boolean);
    return parts.join(", ") || "Sem endereço";
  };

  // Mock Drivers List
  const drivers = [
    { id: "drv_julio", name: "Júlio Motoboy", phone: "(11) 91111-2222", vehicle: "Honda CG 160" },
    { id: "drv_marcos", name: "Marcos Entregador", phone: "(11) 92222-3333", vehicle: "Fiorino Furgão" }
  ];

  const companyOrders = useMemo(() => {
    return orders.filter(o => o.companyId === companyId);
  }, [orders, companyId]);

  // Kanban Stage Filters
  const stages = [
    { key: OrderStatus.RECEBIDO, label: "Recebidos / Balcão", color: "border-sky-500/20 bg-sky-500/5 text-sky-400" },
    { key: OrderStatus.SEPARACAO, label: "Em Separação", color: "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" },
    { key: OrderStatus.SAIU_ENTREGA, label: "Saiu para Entrega", color: "border-teal-500/20 bg-teal-500/5 text-teal-400" },
    { key: OrderStatus.ENTREGUE, label: "Entregue / Concluído", color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" }
  ];

  // Route points for Simulator
  const simulatedRoutePoints = [
    { name: "Depósito Principal (Matriz)", x: 100, y: 150, role: "depot" },
    { name: "Cliente: João - R. Augusta, 105", x: 250, y: 80, role: "client" },
    { name: "Cliente: Maria - Av. Paulista, 1200", x: 380, y: 220, role: "client" },
    { name: "Cliente: Carlos - Al. Lorena, 340", x: 180, y: 280, role: "client" }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            Roteirização & Painel de Entregas
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Controle de motoboys, preparação de fardos de bebidas e rastreamento geográfico simulado das rotas de entrega
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "kanban" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Painel Kanban
          </button>
          <button
            onClick={() => setActiveTab("routesim")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "routesim" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Simulador GPS
          </button>
          <button
            onClick={() => setActiveTab("driver_portal")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === "driver_portal" ? "bg-emerald-500/10 text-emerald-400" : "text-neutral-400"
            }`}
          >
            Portal Celular do Motoboy
          </button>
        </div>
      </div>

      {/* TAB 1: KANBAN DELIVERIES PANEL */}
      {activeTab === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto min-h-[450px]">
          {stages.map((stage) => {
            const stageOrders = companyOrders.filter(o => o.status === stage.key);

            return (
              <div 
                key={stage.key} 
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col h-[520px]"
              >
                {/* Header stage */}
                <div className={`p-3 rounded-xl border flex justify-between items-center mb-4 ${stage.color}`}>
                  <span className="text-xs font-mono font-bold uppercase">{stage.label}</span>
                  <span className="font-mono text-xs font-bold bg-neutral-950/60 px-2 py-0.5 rounded">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Cards stack */}
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                  {stageOrders.length === 0 ? (
                    <div className="h-full flex items-center justify-center border border-dashed border-neutral-800 rounded-xl p-4 text-center">
                      <p className="text-[11px] text-neutral-500 font-mono">Sem pedidos neste status</p>
                    </div>
                  ) : (
                    stageOrders.map((order) => {
                      return (
                        <div 
                          key={order.id} 
                          className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-3 hover:border-neutral-750 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                              #{order.id.substring(6, 11)}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono font-bold">
                              R$ {order.total.toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs font-bold text-neutral-200 truncate">{order.clientName}</p>
                            <p className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              {formatAddress(order.address)}
                            </p>
                          </div>

                          {/* Prepare logistics triggers */}
                          <div className="pt-2 border-t border-neutral-900 flex justify-between items-center gap-1.5 text-[10px]">
                            
                            {/* If Received, can prepare (separar) */}
                            {order.status === OrderStatus.RECEBIDO && (
                              <button
                                onClick={() => onUpdateOrderStatus(order.id, OrderStatus.SEPARACAO)}
                                className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 py-1 rounded font-bold"
                              >
                                Começar Separação
                              </button>
                            )}

                            {/* If Separação, dispatch to driver */}
                            {order.status === OrderStatus.SEPARACAO && (
                              <div className="w-full flex flex-col gap-1">
                                <label className="text-[9px] text-neutral-500 font-mono uppercase block">Escolha o Motoboy</label>
                                <select
                                  onChange={(e) => {
                                    const driverObj = drivers.find(d => d.id === e.target.value);
                                    if (driverObj) {
                                      onUpdateOrderStatus(order.id, OrderStatus.SAIU_ENTREGA, driverObj.id, driverObj.name);
                                      alert(`Pedido despachado! ${driverObj.name} saiu para entrega.`);
                                    }
                                  }}
                                  className="w-full text-[10px] bg-neutral-900 border border-neutral-800 rounded px-1.5 py-1 text-neutral-300"
                                >
                                  <option value="">Despachar...</option>
                                  {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* If Saiu para entrega, complete */}
                            {order.status === OrderStatus.SAIU_ENTREGA && (
                              <div className="w-full space-y-1">
                                <p className="text-[9px] text-teal-400 italic">Em rota com {order.deliveryPersonName}</p>
                                <button
                                  onClick={() => onUpdateOrderStatus(order.id, OrderStatus.ENTREGUE)}
                                  className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-1 rounded font-bold"
                                >
                                  Confirmar Entrega
                                </button>
                              </div>
                            )}

                            {/* If delivered */}
                            {order.status === OrderStatus.ENTREGUE && (
                              <span className="text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Entrega Concluída
                              </span>
                            )}

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INTERACTIVE GPS ROUTING SIMULATOR */}
      {activeTab === "routesim" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-neutral-200 mb-2">Simulação de Roteamento de Entrega</h3>
            <p className="text-xs text-neutral-400">Roteamento otimizado de motoboy simulado com coordenadas geográficas das entregas ativas</p>

            {/* Simulated Canvas Map */}
            <div className="flex-1 h-80 bg-neutral-950 border border-neutral-800 rounded-xl mt-6 relative overflow-hidden flex items-center justify-center">
              
              {/* Interactive Vector Overlay map mockup */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Street Lines background */}
                <line x1="50" y1="0" x2="50" y2="400" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="5" />
                <line x1="150" y1="0" x2="150" y2="400" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="5" />
                <line x1="280" y1="0" x2="280" y2="400" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="5" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="5" />
                <line x1="0" y1="250" x2="500" y2="250" stroke="#1f1f1f" strokeWidth="2" strokeDasharray="5" />

                {/* Route connecting line */}
                <polyline 
                  points="100,150 250,80 380,220 180,280" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3" 
                  strokeDasharray="8"
                  className="animate-pulse"
                />

                {/* Pins */}
                {simulatedRoutePoints.map((pt, idx) => (
                  <g key={idx}>
                    <circle 
                      cx={pt.x} 
                      cy={pt.y} 
                      r={pt.role === "depot" ? "9" : "6"} 
                      fill={pt.role === "depot" ? "#10b981" : "#eab308"} 
                    />
                    <text 
                      x={pt.x + 10} 
                      y={pt.y + 4} 
                      fill="#e5e5e5" 
                      fontSize="9" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {pt.name.split(" - ")[0]}
                    </text>
                  </g>
                ))}
              </svg>

              <div className="absolute bottom-3 left-3 bg-neutral-900/90 border border-neutral-800 px-3 py-1.5 rounded text-[10px] font-mono text-neutral-300">
                <span>Ruta ativa de motoboy: <strong>Julio (Honda 160)</strong></span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-800 pb-2">Lista de Motoristas</h4>
              
              <div className="space-y-3">
                {drivers.map(d => (
                  <div key={d.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-neutral-200">{d.name}</p>
                      <p className="text-[10px] text-neutral-500">{d.vehicle} | {d.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400">
                      Disponível
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STANDALONE DRIVER MOBILE PORTAL VIEW */}
      {activeTab === "driver_portal" && (
        <div className="flex justify-center py-4">
          
          {/* Simulated Mobile Frame */}
          <div className="w-full max-w-[340px] bg-neutral-950 border-8 border-neutral-900 rounded-[32px] overflow-hidden shadow-2xl shrink-0 flex flex-col h-[520px]">
            {/* Speaker & camera slot */}
            <div className="h-6 bg-neutral-900 flex items-center justify-center">
              <div className="w-16 h-3 bg-black rounded-full" />
            </div>

            {/* Mobile screen Header */}
            <div className="p-4 bg-neutral-900 border-b border-neutral-850 flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-mono text-neutral-200 font-bold uppercase">Portal Entregador</span>
              </div>

              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
                className="bg-transparent border-none text-[10px] text-neutral-400 focus:outline-none"
              >
                <option value="drv_julio">Júlio</option>
                <option value="drv_marcos">Marcos</option>
              </select>
            </div>

            {/* Mobile screen Body list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs">
              <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 text-[10px] text-neutral-400">
                Olá {drivers.find(d => d.id === selectedDriverId)?.name}! Segue abaixo suas entregas ativas para despachar agora:
              </div>

              {companyOrders.filter(o => o.status === OrderStatus.SAIU_ENTREGA && o.deliveryPersonId === selectedDriverId).length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle className="w-8 h-8 text-neutral-600 mx-auto" />
                  <p className="text-[10px] text-neutral-500 font-mono">Nenhum pedido despachado para você no momento.</p>
                </div>
              ) : (
                companyOrders.filter(o => o.status === OrderStatus.SAIU_ENTREGA && o.deliveryPersonId === selectedDriverId).map((order) => {
                  return (
                    <div 
                      key={order.id} 
                      className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl space-y-3"
                    >
                      <div className="flex justify-between font-mono text-[9px] text-emerald-400">
                        <span>ENTREGA DE BEBIDAS</span>
                        <span>R$ {order.total.toFixed(2)}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-neutral-200 text-[11px]">{order.clientName}</p>
                        <p className="text-[10px] text-neutral-400 leading-normal">{formatAddress(order.address)}</p>
                        {order.notes && (
                          <p className="text-[9px] text-yellow-500 font-mono">OBS: {order.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          onUpdateOrderStatus(order.id, OrderStatus.ENTREGUE);
                          alert("Parabéns! Entrega concluída no portal do motoboy.");
                        }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold py-2 rounded-lg text-[10px] transition-all"
                      >
                        Confirmar Entrega & Recebimento
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile screen Bottom spacer */}
            <div className="h-4 bg-neutral-900" />
          </div>

        </div>
      )}

    </div>
  );
}
