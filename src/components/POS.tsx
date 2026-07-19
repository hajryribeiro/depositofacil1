import React, { useState, useMemo } from "react";
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Percent, 
  DollarSign, 
  Printer, 
  AlertTriangle,
  QrCode,
  Tag,
  CheckCircle,
  Truck
} from "lucide-react";
import { 
  FullProduct, 
  Client, 
  Sale, 
  SaleItem, 
  PaymentMethod, 
  SaleStatus, 
  OrderType, 
  CashierSession,
  SalePaymentSplit
} from "../types";

interface POSProps {
  companyId: string;
  unitId: string;
  products: FullProduct[];
  clients: Client[];
  activeSession?: CashierSession;
  currentUser: { id: string; name: string };
  onSaveSale: (sale: Sale) => void;
  onOpenCashierRedirect: () => void;
}

export default function POS({
  companyId,
  unitId,
  products,
  clients,
  activeSession,
  currentUser,
  onSaveSale,
  onOpenCashierRedirect
}: POSProps) {
  // POS States
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [discountType, setDiscountType] = useState<"R$" | "%">("R$");
  const [discountVal, setDiscountVal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>(OrderType.RETIRADA);
  const [orderNotes, setOrderNotes] = useState("");

  // Payment States
  const [paymentSplits, setPaymentSplits] = useState<SalePaymentSplit[]>([
    { method: PaymentMethod.DINHEIRO, amount: 0 }
  ]);
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Active products filter
  const activeProducts = useMemo(() => {
    return products.filter(p => p.companyId === companyId && p.isActive);
  }, [products, companyId]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return activeProducts.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.barcode?.includes(query) ||
      p.internalCode?.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query)
    );
  }, [activeProducts, searchQuery]);

  // Add to cart method
  const addToCart = (product: FullProduct) => {
    const stock = product.stockQty[unitId] || 0;
    
    // Check stock rules (we can warn or prevent depending on stock)
    if (stock <= 0) {
      alert(`Aviso: O produto '${product.name}' está com estoque zerado nesta unidade!`);
    }

    const existingIndex = cart.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = (updated[existingIndex].quantity * updated[existingIndex].unitPrice) - updated[existingIndex].discount;
      setCart(updated);
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellPrice,
        discount: 0,
        total: product.sellPrice,
        costPrice: product.costPrice
      }]);
    }
    setSearchQuery("");
  };

  // Adjust Cart Quantities
  const adjustQty = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.productId === productId) {
        const qty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: qty,
          total: (qty * item.unitPrice) - item.discount
        };
      }
      return item;
    });
    setCart(updated);
  };

  // Adjust Item discount
  const adjustItemDiscount = (productId: string, disc: number) => {
    const updated = cart.map(item => {
      if (item.productId === productId) {
        const d = Math.max(0, Math.min(item.unitPrice * item.quantity, disc));
        return {
          ...item,
          discount: d,
          total: (item.quantity * item.unitPrice) - d
        };
      }
      return item;
    });
    setCart(updated);
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  // Totals calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const itemsDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  
  const generalDiscount = useMemo(() => {
    if (discountType === "R$") {
      return Math.min(subtotal, discountVal);
    } else {
      return (subtotal * Math.min(100, discountVal)) / 100;
    }
  }, [subtotal, discountType, discountVal]);

  const total = Math.max(0, subtotal - itemsDiscount - generalDiscount + deliveryFee);
  
  // Total cost
  const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);

  // Divide Payments handlers
  const handleSplitMethodChange = (index: number, method: PaymentMethod) => {
    const updated = [...paymentSplits];
    updated[index].method = method;
    setPaymentSplits(updated);
  };

  const handleSplitAmountChange = (index: number, val: number) => {
    const updated = [...paymentSplits];
    updated[index].amount = val;
    setPaymentSplits(updated);
  };

  const addSplit = () => {
    setPaymentSplits([...paymentSplits, { method: PaymentMethod.PIX, amount: 0 }]);
  };

  const removeSplit = (index: number) => {
    setPaymentSplits(paymentSplits.filter((_, i) => i !== index));
  };

  // Autocalculate remaining split
  const autoDistributeRemaining = () => {
    const distributed = paymentSplits.reduce((sum, s, i) => i === paymentSplits.length - 1 ? sum : sum + s.amount, 0);
    const remaining = Math.max(0, total - distributed);
    const updated = [...paymentSplits];
    if (updated.length > 0) {
      updated[updated.length - 1].amount = parseFloat(remaining.toFixed(2));
      setPaymentSplits(updated);
    }
  };

  // Change calc
  const changeDue = useMemo(() => {
    const totalCashAllocated = paymentSplits
      .filter(p => p.method === PaymentMethod.DINHEIRO)
      .reduce((sum, p) => sum + p.amount, 0);
    
    if (totalCashAllocated > 0 && cashReceived > totalCashAllocated) {
      return cashReceived - totalCashAllocated;
    }
    return 0;
  }, [paymentSplits, cashReceived]);

  // Complete Venda Handler
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    // Cashier Session validation
    if (!activeSession) {
      alert("ERRO: O caixa está fechado! Abra o caixa antes de realizar vendas.");
      return;
    }

    // Payments validation
    const totalPaymentsSet = paymentSplits.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalPaymentsSet - total) > 0.05) {
      alert(`ERRO: A soma dos pagamentos (R$ ${totalPaymentsSet.toFixed(2)}) deve ser igual ao total da venda (R$ ${total.toFixed(2)}).`);
      return;
    }

    // Check credit limits if there is Fiado
    const hasFiado = paymentSplits.some(p => p.method === PaymentMethod.FIADO);
    if (hasFiado) {
      if (!selectedClient) {
        alert("ERRO: Para realizar uma venda Fiada, você DEVE selecionar um cliente cadastrado!");
        return;
      }
      const fiadoAmount = paymentSplits
        .filter(p => p.method === PaymentMethod.FIADO)
        .reduce((sum, p) => sum + p.amount, 0);

      const availableCredit = selectedClient.creditLimit - selectedClient.currentDebt;
      if (fiadoAmount > availableCredit) {
        alert(`AVISO DE CRÉDITO: O cliente ultrapassou seu limite de crédito! Limite disponível: R$ ${availableCredit.toFixed(2)}. Valor fiado solicitado: R$ ${fiadoAmount.toFixed(2)}.`);
        if (!confirm("Deseja autorizar esta venda fiada acima do limite mesmo assim?")) {
          return;
        }
      }
    }

    // Build sale record
    const sale: Sale = {
      id: `sale_${Date.now()}`,
      companyId,
      unitId,
      clientId: selectedClient?.id,
      clientName: selectedClient?.name,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      items: cart,
      subtotal,
      discount: itemsDiscount + generalDiscount,
      deliveryFee,
      total,
      costTotal: totalCost,
      profitEstimated: total - totalCost,
      payments: paymentSplits,
      status: SaleStatus.FINALIZADA,
      type: orderType,
      notes: orderNotes,
      createdAt: new Date().toISOString()
    };

    onSaveSale(sale);
    setCompletedSale(sale);
    setShowReceiptModal(true);

    // Reset POS for next sale
    setCart([]);
    setSelectedClient(null);
    setDiscountVal(0);
    setDeliveryFee(0);
    setPaymentSplits([{ method: PaymentMethod.DINHEIRO, amount: 0 }]);
    setCashReceived(0);
    setOrderNotes("");
  };

  return (
    <div className="flex-1 p-6 flex flex-col lg:flex-row gap-6 overflow-hidden max-h-[calc(100vh-4rem)]">
      
      {/* LEFT COLUMN: Search & Product catalog */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Search Input with quick simulator scan */}
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, marca ou código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-red-500"
            />
          </div>
          <button 
            onClick={() => {
              // Simulate code scan
              const randomProduct = activeProducts[Math.floor(Math.random() * activeProducts.length)];
              if (randomProduct) {
                addToCart(randomProduct);
                alert(`[BIP!] Código de barras detectado: ${randomProduct.barcode || randomProduct.id}. Adicionado ao carrinho.`);
              }
            }}
            className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-mono font-bold hover:bg-red-500/20 transition-all active:scale-95 shrink-0"
            title="Simular bipe de código de barras pela câmera"
          >
            <QrCode className="w-4 h-4" />
            Bipar Leitor
          </button>
        </div>

        {/* Product listing or Search results catalog */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {searchQuery ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {searchResults.length === 0 ? (
                <p className="text-xs text-neutral-500 font-mono col-span-3">Nenhum produto correspondente.</p>
              ) : (
                searchResults.map((product) => {
                  const stock = product.stockQty[unitId] || 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-left hover:border-red-500 transition-all group"
                    >
                      <div className="aspect-square bg-neutral-950 rounded-lg overflow-hidden mb-2 relative border border-neutral-800">
                        {product.photoUrl ? (
                          <img src={product.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-neutral-600 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-neutral-400">
                          Estoque: {stock}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-red-400 transition-colors">
                        {product.name}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-neutral-500 font-mono">{product.brand}</span>
                        <span className="text-xs font-bold text-neutral-200 font-mono">
                          R$ {product.sellPrice.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Produtos Mais Vendidos</span>
                <span className="text-[10px] text-neutral-500 italic">Clique para adicionar ao carrinho</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {activeProducts.slice(0, 8).map((product) => {
                  const stock = product.stockQty[unitId] || 0;
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl text-left hover:border-red-500 transition-all group"
                    >
                      <div className="aspect-square bg-neutral-950 rounded-lg overflow-hidden mb-2 relative border border-neutral-800">
                        {product.photoUrl ? (
                          <img src={product.photoUrl} alt="" className="w-full h-full object-cover rounded" referrerPolicy="no-referrer" />
                        ) : (
                          <ShoppingCart className="w-6 h-6 text-neutral-600 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                        )}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-neutral-400">
                          Estoque: {stock}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover:text-red-400 transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs font-bold text-neutral-100 font-mono mt-1">
                        R$ {product.sellPrice.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Cart and Checkout */}
      <div className="w-full lg:w-[440px] bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-red-400" />
            <h3 className="font-bold text-neutral-100 text-sm">Cupom Fiscal de Venda</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
            {cart.length} itens
          </span>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/60 p-4 space-y-3 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <ShoppingCart className="w-10 h-10 text-neutral-600 mb-2 animate-bounce" />
              <p className="text-sm text-neutral-400">O carrinho está vazio</p>
              <p className="text-xs text-neutral-500 mt-1">Escolha ou busque produtos para iniciar o atendimento.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-2 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="text-xs font-semibold text-neutral-200 truncate">{item.productName}</p>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      Unidade: R$ {item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 hover:bg-neutral-800 rounded text-neutral-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Adjust item quantities & discount */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
                    <button 
                      onClick={() => adjustQty(item.productId, -1)}
                      className="p-1 text-neutral-400 hover:text-neutral-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2.5 text-xs font-mono font-bold text-neutral-200">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => adjustQty(item.productId, 1)}
                      className="p-1 text-neutral-400 hover:text-neutral-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Individual item discount input */}
                  <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 px-2 py-0.5 rounded-lg">
                    <span className="text-[10px] text-neutral-500 font-mono">Desc R$</span>
                    <input
                      type="number"
                      value={item.discount || ""}
                      placeholder="0.00"
                      onChange={(e) => adjustItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-12 bg-transparent border-none text-xs text-neutral-300 font-mono focus:outline-none p-0 text-right"
                    />
                  </div>

                  <span className="text-xs font-bold font-mono text-neutral-200">
                    R$ {item.total.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout config & customer selector */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-3 shrink-0">
          
          {/* CRM Client Selection */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg flex-1">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={selectedClient?.id || ""}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  setSelectedClient(client || null);
                }}
                className="bg-transparent border-none text-xs text-neutral-300 focus:outline-none w-full cursor-pointer p-0"
              >
                <option value="">Cliente Geral / Balcão</option>
                {clients.filter(c => c.companyId === companyId).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.currentDebt > 0 ? `(Dívida R$ ${c.currentDebt.toFixed(0)})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery/Pickup toggle */}
            <div className="flex bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg shrink-0 text-xs">
              <button
                onClick={() => { setOrderType(OrderType.RETIRADA); setDeliveryFee(0); }}
                className={`px-2 py-1 rounded font-medium ${orderType === OrderType.RETIRADA ? "bg-red-500/10 text-red-400" : "text-neutral-400"}`}
              >
                Balcão
              </button>
              <button
                onClick={() => { setOrderType(OrderType.ENTREGA); setDeliveryFee(7.50); }}
                className={`px-2 py-1 rounded font-medium ${orderType === OrderType.ENTREGA ? "bg-red-500/10 text-red-400" : "text-neutral-400"}`}
              >
                Entrega
              </button>
            </div>
          </div>

          {/* Discounts and delivery fees details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* General discount */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
              <Percent className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[10px] text-neutral-500 font-mono">Desc. Geral</span>
              <input
                type="number"
                placeholder="0"
                value={discountVal || ""}
                onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                className="w-full bg-transparent border-none text-right font-mono focus:outline-none p-0 text-neutral-200"
              />
              <select 
                value={discountType} 
                onChange={(e) => setDiscountType(e.target.value as "R$" | "%")}
                className="bg-transparent border-none p-0 text-[10px] text-neutral-400 focus:outline-none font-mono"
              >
                <option value="R$">R$</option>
                <option value="%">%</option>
              </select>
            </div>

            {/* Delivery fee */}
            {orderType === OrderType.ENTREGA && (
              <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-lg">
                <Truck className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-[10px] text-neutral-500 font-mono">Taxa R$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={deliveryFee || ""}
                  onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent border-none text-right font-mono focus:outline-none p-0 text-neutral-200"
                />
              </div>
            )}
          </div>

          {/* Payment splits list */}
          <div className="border-t border-neutral-800/80 pt-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-mono">Forma de Pagamento</span>
              <button 
                onClick={addSplit}
                className="text-[10px] font-mono text-red-400 hover:underline"
              >
                + Dividir Pagamento
              </button>
            </div>

            {paymentSplits.map((split, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={split.method}
                  onChange={(e) => handleSplitMethodChange(idx, e.target.value as PaymentMethod)}
                  className="bg-neutral-900 border border-neutral-800 rounded text-xs text-neutral-300 py-1 px-2 focus:outline-none"
                >
                  <option value={PaymentMethod.DINHEIRO}>Dinheiro</option>
                  <option value={PaymentMethod.PIX}>Pix</option>
                  <option value={PaymentMethod.CREDITO}>Cartão Crédito</option>
                  <option value={PaymentMethod.DEBITO}>Cartão Débito</option>
                  <option value={PaymentMethod.FIADO}>Fiado (Prazo)</option>
                  <option value={PaymentMethod.VALE}>Vale Alimentação</option>
                </select>

                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500">R$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={split.amount || ""}
                    onChange={(e) => handleSplitAmountChange(idx, parseFloat(e.target.value) || 0)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded py-1 pl-7 pr-2 text-xs text-right text-neutral-200 font-mono focus:outline-none"
                  />
                </div>

                {paymentSplits.length > 1 && (
                  <button 
                    onClick={() => removeSplit(idx)}
                    className="text-red-400 hover:text-red-300 text-xs px-1"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}

            {/* Auto fill split help */}
            <div className="flex justify-between items-center">
              <button
                onClick={autoDistributeRemaining}
                className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded hover:text-neutral-200"
              >
                Autocompletar restante pago
              </button>
            </div>

            {/* Cash change calculator helper */}
            {paymentSplits.some(p => p.method === PaymentMethod.DINHEIRO) && (
              <div className="bg-neutral-950 p-2 rounded-lg border border-neutral-800 flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400">Valor Recebido: R$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cashReceived || ""}
                    onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                    className="w-16 bg-neutral-900 border border-neutral-800 rounded px-1.5 py-0.5 text-right font-mono text-neutral-100"
                  />
                </div>
                <div className="font-mono">
                  <span className="text-neutral-400">Troco: </span>
                  <span className="font-bold text-red-400">R$ {changeDue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Session warning / action block */}
          {!activeSession ? (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-center gap-1 text-red-400 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Venda Desativada: Caixa Fechado
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal">
                Você deve realizar a abertura de caixa com saldo inicial na unidade antes de registrar transações financeiras.
              </p>
              <button 
                onClick={onOpenCashierRedirect}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 rounded text-xs transition-all"
              >
                Ir para Controle de Caixa
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-neutral-800/80">
              <div className="flex justify-between items-baseline font-mono">
                <span className="text-xs text-neutral-400">TOTAL DA VENDA</span>
                <span className="text-xl font-bold text-red-400">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={handleCompleteSale}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.15)] text-sm"
              >
                <CheckCircle className="w-5 h-5" />
                FINALIZAR VENDA
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {showReceiptModal && completedSale && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h4 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-red-400" />
                Comprovante Gerado
              </h4>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Fechar
              </button>
            </div>

            {/* Receipt Content Body */}
            <div className="p-6 overflow-y-auto text-xs font-mono text-neutral-300 space-y-4 bg-neutral-950 border-b border-neutral-800 flex-1">
              <div className="text-center space-y-1">
                <p className="font-bold text-neutral-100 uppercase tracking-wider">DEPÓSITO FÁCIL</p>
                <p className="text-[10px] text-neutral-500">Multitenant Beverage POS Engine</p>
                <p className="text-[10px] text-neutral-400">Unidade: {unitId === "unit_matriz" ? "Matriz Centro" : "Filial Zona Sul"}</p>
                <p className="text-[10px] text-neutral-400">Responsável: {completedSale.sellerName}</p>
                <p className="text-[9px] text-neutral-500">Data: {new Date(completedSale.createdAt).toLocaleString("pt-BR")}</p>
              </div>

              <div className="border-t border-dashed border-neutral-800 pt-3 space-y-2">
                <p className="font-bold text-neutral-200 text-[10px] uppercase">ITENS DO CUPOM:</p>
                {completedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{item.quantity}x {item.productName}</span>
                    <span>R$ {item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-neutral-800 pt-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {completedSale.subtotal.toFixed(2)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Desconto Aplicado:</span>
                    <span>- R$ {completedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                {completedSale.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Taxa Entrega:</span>
                    <span>R$ {completedSale.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-neutral-100 text-xs border-t border-dashed border-neutral-800/60 pt-1.5">
                  <span>TOTAL PAGO:</span>
                  <span>R$ {completedSale.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-800 pt-3 space-y-1 text-[10px] text-neutral-400">
                <p className="font-bold text-neutral-300">PAGAMENTO:</p>
                {completedSale.payments.map((p, i) => (
                  <div key={i} className="flex justify-between uppercase">
                    <span>{p.method}</span>
                    <span>R$ {p.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {completedSale.type === OrderType.ENTREGA && (
                <div className="border-t border-dashed border-neutral-800 pt-3 text-[10px] text-neutral-400 space-y-1">
                  <p className="font-bold text-neutral-300">ENTREGA SOLICITADA:</p>
                  <p>Destinatário: {completedSale.clientName || "Cliente Geral"}</p>
                </div>
              )}

              <div className="text-center pt-4 text-[9px] text-neutral-500">
                <p>Obrigado pela preferência!</p>
                <p>Sistema homologado - Depósito Fácil</p>
              </div>
            </div>

            {/* Actions for Modal */}
            <div className="p-4 bg-neutral-900 flex gap-2">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir Cupom
              </button>
              <button 
                onClick={() => {
                  const msg = encodeURIComponent(`Olá! Segue comprovante da sua compra no valor de R$ ${completedSale.total.toFixed(2)} realizada em ${new Date(completedSale.createdAt).toLocaleDateString("pt-BR")}. Obrigado!`);
                  window.open(`https://api.whatsapp.com/send?text=${msg}`);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                Enviar WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
