import React, { useState, useMemo } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Copy, 
  Power, 
  FileDown, 
  FileUp, 
  Tag, 
  Image as ImageIcon,
  DollarSign,
  AlertCircle,
  History,
  Check,
  ChevronDown
} from "lucide-react";
import { FullProduct, ProductUnit, PlanId } from "../types";

interface ProductsProps {
  companyId: string;
  unitId: string;
  products: FullProduct[];
  onAddProduct: (p: FullProduct) => void;
  onUpdateProduct: (p: FullProduct) => void;
  planId: PlanId;
}

export default function Products({
  companyId,
  unitId,
  products,
  onAddProduct,
  onUpdateProduct,
  planId
}: ProductsProps) {
  // Products states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<FullProduct | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [barcode, setBarcode] = useState("");
  const [internalCode, setInternalCode] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Cervejas");
  const [brand, setBrand] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState<ProductUnit>(ProductUnit.UN);
  const [qtyPerPackage, setQtyPerPackage] = useState(1);
  const [minStock, setMinStock] = useState(10);
  const [maxStock, setMaxStock] = useState(100);
  const [costPrice, setCostPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [locationInStock, setLocationInStock] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [isReturnable, setIsReturnable] = useState(false);
  const [vasilhameCost, setVasilhameCost] = useState(0);
  const [initialStock, setInitialStock] = useState(50); // for initial unit stock setup

  // Catalog Filters
  const categories = ["Cervejas", "Refrigerantes", "Águas", "Energéticos", "Destilados", "Sucos", "Gelo", "Carvão", "Petiscos", "Descartáveis", "Outros"];

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.companyId === companyId);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.barcode?.includes(q) ||
        p.internalCode?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      list = list.filter(p => p.category === selectedCategory);
    }

    return list;
  }, [products, companyId, search, selectedCategory]);

  // Open form for fresh product creation
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName("");
    setPhotoUrl("");
    setBarcode(`789${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setInternalCode(`INT-${Math.floor(1000 + Math.random() * 9000)}`);
    setDescription("");
    setCategory("Cervejas");
    setBrand("");
    setUnitOfMeasure(ProductUnit.UN);
    setQtyPerPackage(1);
    setMinStock(10);
    setMaxStock(100);
    setCostPrice(0);
    setSellPrice(0);
    setLocationInStock("");
    setExpirationDate("");
    setIsReturnable(false);
    setVasilhameCost(0);
    setInitialStock(20);
    setShowForm(true);
  };

  // Open form for editing existing product
  const handleOpenEdit = (product: FullProduct) => {
    setEditingProduct(product);
    setName(product.name);
    setPhotoUrl(product.photoUrl || "");
    setBarcode(product.barcode || "");
    setInternalCode(product.internalCode || "");
    setDescription(product.description || "");
    setCategory(product.category);
    setBrand(product.brand);
    setUnitOfMeasure(product.unitOfMeasure);
    setQtyPerPackage(product.qtyPerPackage);
    setMinStock(product.minStock);
    setMaxStock(product.maxStock);
    setCostPrice(product.costPrice);
    setSellPrice(product.sellPrice);
    setLocationInStock(product.locationInStock || "");
    setExpirationDate(product.expirationDate || "");
    setIsReturnable(product.isReturnable);
    setVasilhameCost(product.vasilhameCost || 0);
    setInitialStock(product.stockQty[unitId] || 0);
    setShowForm(true);
  };

  // Duplicate product helper
  const handleDuplicate = (product: FullProduct) => {
    const fresh: FullProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      name: `${product.name} (Cópia)`,
      barcode: `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      internalCode: `${product.internalCode}-DUPL`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onAddProduct(fresh);
    alert(`Produto '${product.name}' duplicado com sucesso!`);
  };

  // Submit product creation/update
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stockQtyMap = editingProduct ? { ...editingProduct.stockQty } : { [unitId]: initialStock };

    const productRecord: FullProduct = {
      id: editingProduct ? editingProduct.id : `prod_${Date.now()}`,
      companyId,
      name,
      photoUrl: photoUrl || undefined,
      barcode,
      internalCode,
      description,
      category,
      brand,
      unitOfMeasure,
      qtyPerPackage,
      minStock,
      maxStock,
      costPrice,
      sellPrice,
      locationInStock,
      expirationDate: expirationDate || undefined,
      isActive: editingProduct ? editingProduct.isActive : true,
      isReturnable,
      vasilhameCost: isReturnable ? vasilhameCost : undefined,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stockQty: stockQtyMap
    };

    if (editingProduct) {
      onUpdateProduct(productRecord);
      alert("Produto atualizado com sucesso!");
    } else {
      onAddProduct(productRecord);
      alert("Produto cadastrado com sucesso!");
    }
    setShowForm(false);
  };

  // Dynamic profit margin calculator
  const markupPct = useMemo(() => {
    if (costPrice > 0) {
      return ((sellPrice - costPrice) / costPrice) * 100;
    }
    return 0;
  }, [costPrice, sellPrice]);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Products list Header with action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            Cadastro de Produtos
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Gerenciamento do catálogo geral de bebidas, vasilhames e apresentações comerciais
          </p>
        </div>

        {/* Buttons for create & imports */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Simulate CSV export
              const headers = "ID,Nome,Marca,Categoria,Estoque,Preço de Custo,Preço de Venda\n";
              const rows = filteredProducts.map(p => `"${p.id}","${p.name}","${p.brand}","${p.category}",${p.stockQty[unitId] || 0},${p.costPrice},${p.sellPrice}`).join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.setAttribute("href", url);
              a.setAttribute("download", `catalogo_produtos_${companyId}.csv`);
              a.click();
              alert("Catálogo exportado para arquivo CSV com sucesso!");
            }}
            className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
          >
            <FileDown className="w-4 h-4" />
            Exportar CSV
          </button>

          <button
            onClick={() => {
              // Simulate Excel/CSV importing
              const numMocked = Math.floor(3 + Math.random() * 5);
              alert(`Simulação de Importação: ${numMocked} novos produtos carregados da planilha 'estoque_matriz.xlsx' com sucesso!`);
            }}
            className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all"
          >
            <FileUp className="w-4 h-4" />
            Importar Excel
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* SEARCH AND QUICK CATEGORY FILTER */}
      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome do produto, marca, código de barras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Category selector */}
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1 shrink-0">
          <span className="text-[10px] text-neutral-500 font-mono">Categoria</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent border-none text-xs text-neutral-300 focus:outline-none pr-1 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCT GRID LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stock = product.stockQty[unitId] || 0;
          const isLowStock = stock <= product.minStock;
          const profit = product.sellPrice - product.costPrice;

          return (
            <div 
              key={product.id}
              className={`bg-neutral-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-neutral-700 relative overflow-hidden ${
                product.isActive ? "border-neutral-800" : "border-neutral-800 opacity-60"
              }`}
            >
              <div className="flex gap-4">
                {/* Image block */}
                <div className="w-20 h-20 rounded-xl bg-neutral-950 overflow-hidden border border-neutral-800 shrink-0 relative">
                  {product.photoUrl ? (
                    <img src={product.photoUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-neutral-600 absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2" />
                  )}
                </div>

                {/* Primary info block */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-neutral-950 text-neutral-400 border border-neutral-800">
                      {product.category}
                    </span>
                    {!product.isActive && (
                      <span className="text-[9px] font-mono bg-red-500/10 text-red-400 px-1 rounded uppercase font-bold">
                        Inativo
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans font-bold text-neutral-200 text-sm mt-1.5 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">{product.brand}</p>
                </div>
              </div>

              {/* Stats & prices */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-neutral-800/60 py-3 my-4 text-xs font-mono">
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Estoque</span>
                  <span className={`font-bold ${isLowStock ? "text-red-400 font-extrabold" : "text-neutral-200"}`}>
                    {stock} {product.unitOfMeasure}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Venda</span>
                  <span className="font-bold text-neutral-200">R$ {product.sellPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-neutral-500 block uppercase">Lucro</span>
                  <span className="font-bold text-emerald-400">R$ {profit.toFixed(1)}</span>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-neutral-500 font-mono">
                  SKU: {product.internalCode || "Não definido"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDuplicate(product)}
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-emerald-400 transition-colors"
                    title="Duplicar Produto"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-emerald-400 transition-colors"
                    title="Editar Produto"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      const updated = { ...product, isActive: !product.isActive };
                      onUpdateProduct(updated);
                      alert(`Produto ${product.name} ${updated.isActive ? "ativado" : "desativado"} com sucesso.`);
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      product.isActive ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10"
                    }`}
                    title={product.isActive ? "Desativar Produto" : "Ativar Produto"}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* COMPREHENSIVE ADD/EDIT PRODUCT MODAL FORM */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <form 
            onSubmit={handleSaveProduct}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="font-bold text-neutral-200 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                {editingProduct ? `Editar: ${editingProduct.name}` : "Cadastrar Novo Produto"}
              </h3>
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            {/* Scrollable form body split into sections */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-300">
              
              {/* SECTION 1: Identificação Básica */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-neutral-800 pb-1">
                  1. Identificação Geral do Produto
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Coca-Cola Lata Sabor Original 350ml"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Brand */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Marca / Fabricante *</label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Ex: Coca-Cola, Heineken, Ambev"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Categoria Principal</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Barcode */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Código de Barras (EAN)</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Código de Barras"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Internal code */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Código Interno / SKU</label>
                    <input
                      type="text"
                      value={internalCode}
                      onChange={(e) => setInternalCode(e.target.value)}
                      placeholder="Código SKU interno"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Descrição / Detalhes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Informações adicionais para nota, prateleira ou ponto de venda..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Product Photo URL */}
                <div className="space-y-1">
                  <label className="text-xs text-neutral-400 block font-semibold">Link da Foto (URL)</label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* SECTION 2: Apresentação e Precificação */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-neutral-800 pb-1">
                  2. Embalagem, Estoque e Precificação
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Unit of measure */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Unidade de Medida</label>
                    <select
                      value={unitOfMeasure}
                      onChange={(e) => setUnitOfMeasure(e.target.value as ProductUnit)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-2 text-xs text-neutral-300 focus:outline-none"
                    >
                      <option value={ProductUnit.UN}>Lata / Garrafa Unitária (UN)</option>
                      <option value={ProductUnit.FARDO}>Fardo Comercial</option>
                      <option value={ProductUnit.CAIXA}>Caixa Fechada</option>
                      <option value={ProductUnit.BARRIL}>Barril de Chopp</option>
                    </select>
                  </div>

                  {/* Quantity per package */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Quantidade por Embalagem</label>
                    <input
                      type="number"
                      min={1}
                      value={qtyPerPackage}
                      onChange={(e) => setQtyPerPackage(parseInt(e.target.value) || 1)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Initial Unit Stock setup (Only for new products) */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Estoque Inicial nesta Unidade</label>
                    <input
                      type="number"
                      min={0}
                      value={initialStock}
                      onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Min Stock */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Estoque Mínimo</label>
                    <input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  {/* Max Stock */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Estoque Máximo</label>
                    <input
                      type="number"
                      value={maxStock}
                      onChange={(e) => setMaxStock(parseInt(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  {/* Cost Price */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={costPrice || ""}
                      onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  {/* Sell Price */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Preço de Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={sellPrice || ""}
                      onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {/* Markup Helper */}
                {costPrice > 0 && (
                  <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex justify-between text-xs text-neutral-400 font-mono">
                    <span>Lucro Bruto: R$ {(sellPrice - costPrice).toFixed(2)}</span>
                    <span className="text-emerald-400">Margem de Lucro: {markupPct.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {/* SECTION 3: Detalhes Fiscais e Retornáveis */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest border-b border-neutral-800 pb-1">
                  3. Logística Fina, Validade & Vasilhames
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stock Location */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Localização Física no Estoque</label>
                    <input
                      type="text"
                      value={locationInStock}
                      onChange={(e) => setLocationInStock(e.target.value)}
                      placeholder="Ex: Corredor B / Prateleira 4"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  {/* Expiration date */}
                  <div className="space-y-1">
                    <label className="text-xs text-neutral-400 block font-semibold">Data de Validade (Se houver)</label>
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Vasilhames toggling */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-200">
                    <input
                      type="checkbox"
                      checked={isReturnable}
                      onChange={(e) => setIsReturnable(e.target.checked)}
                      className="rounded border-neutral-800 bg-neutral-950 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                    />
                    Este produto é retornável? (Exige vasilhame ou casco vazio)
                  </label>

                  {isReturnable && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-800/60 text-xs">
                      <div className="space-y-1">
                        <label className="text-xs text-neutral-400 block font-semibold">Custo do Casco / Vasilhame Avulso (R$)</label>
                        <input
                          type="number"
                          step="0.10"
                          value={vasilhameCost || ""}
                          onChange={(e) => setVasilhameCost(parseFloat(e.target.value) || 0)}
                          placeholder="Ex: R$ 3.00 para casco retornável"
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 leading-normal self-center pt-3">
                        Se ativado, o sistema registrará empréstimos ou cobrará o vasilhame caso o cliente não traga um casco vazio no momento da compra.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Actions for Modal */}
            <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex justify-end gap-2 shrink-0">
              <button 
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-neutral-900 hover:bg-neutral-850 text-neutral-400 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 px-5 py-2.5 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                Salvar Produto
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
