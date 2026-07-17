import React, { useState, useEffect, useMemo } from "react";
import { 
  getCompanies,
  getUnits,
  getUsers,
  getProducts,
  getSales,
  getCashierSessions,
  getFiados,
  getBills,
  getOrders,
  getAuditLogs,
  getClients,
  addSale,
  openCashierSession,
  closeCashierSession,
  addCashierMovement,
  addProduct,
  updateProduct,
  addStockMovement,
  addClient,
  updateClient,
  addSupplier,
  addVasilhame,
  addBill,
  updateBill,
  updateOrderStatus,
  addCompany,
  toggleCompanyActive,
  updateCompanyPlan,
  addUnit,
  addUser,
  updateCompany,
  syncDatabaseWithFirebase
} from "./database";
import { 
  Company, 
  Unit, 
  User, 
  FullProduct, 
  Sale, 
  CashierSession, 
  FiadoAccount, 
  AccountBill, 
  CustomerOrder, 
  AuditLog, 
  OrderStatus, 
  PlanId, 
  SubscriptionStatus,
  UserRole,
  PaymentMethod,
  CashierMovementType,
  StockMovement,
  StockMovementType,
  ReturnableVasilhame,
  Client,
  Supplier
} from "./types";

import { AlertTriangle } from "lucide-react";

// Import modules
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import POS from "./components/POS";
import Products from "./components/Products";
import Stock from "./components/Stock";
import CashierControl from "./components/CashierControl";
import Finance from "./components/Finance";
import SaaSAdmin from "./components/SaaSAdmin";
import SettingsComponent from "./components/Settings";
import Auth from "./components/Auth";
import Reports from "./components/Reports";

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeCompanyId, setActiveCompanyId] = useState<string>("");
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Reactive DB States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<FullProduct[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [sessions, setSessions] = useState<CashierSession[]>([]);
  const [fiados, setFiados] = useState<FiadoAccount[]>([]);
  const [bills, setBills] = useState<AccountBill[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">("idle");

  // Load database arrays on mount
  useEffect(() => {
    reloadDatabase();
    syncDatabaseWithFirebase();

    const handleUpdate = () => {
      reloadDatabase();
    };

    const handleSyncStatus = (e: Event) => {
      const status = (e as CustomEvent).detail;
      setSyncStatus(status);
    };

    window.addEventListener("database-updated", handleUpdate);
    window.addEventListener("database-sync-status", handleSyncStatus as any);

    return () => {
      window.removeEventListener("database-updated", handleUpdate);
      window.removeEventListener("database-sync-status", handleSyncStatus as any);
    };
  }, []);

  const reloadDatabase = () => {
    setCompanies(getCompanies());
    setUnits(getUnits());
    setUsers(getUsers());
    setProducts(getProducts());
    setSales(getSales());
    setSessions(getCashierSessions());
    setFiados(getFiados());
    setBills(getBills());
    setOrders(getOrders());
    setAuditLogs(getAuditLogs());
  };

  // Find active company and session
  const activeCompany = useMemo(() => {
    return companies.find(c => c.id === activeCompanyId);
  }, [companies, activeCompanyId]);

  const activeSession = useMemo(() => {
    if (!currentUser || !currentUnit) return undefined;
    return sessions.find(
      s => s.companyId === activeCompanyId && 
           s.unitId === currentUnit.id && 
           s.status === "OPEN"
    );
  }, [sessions, activeCompanyId, currentUnit, currentUser]);

  // Auth logins
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveCompanyId(user.companyId);
    
    if (user.role === UserRole.SUPERADMIN) {
      setActiveTab("superadmin");
    } else {
      // Find default unit for user
      const companyUnits = getUnits().filter(u => u.companyId === user.companyId);
      const matchedUnit = companyUnits.find(u => u.id === user.unitId) || companyUnits[0];
      if (matchedUnit) setCurrentUnit(matchedUnit);

      // Default role tabs
      if (user.role === UserRole.OPERADOR_CAIXA) {
        setActiveTab("pos");
      } else if (user.role === UserRole.ESTOQUISTA) {
        setActiveTab("products");
      } else if (user.role === UserRole.ENTREGADOR) {
        setActiveTab("logistics");
      } else {
        setActiveTab("dashboard");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUnit(null);
    setActiveCompanyId("");
    setActiveTab("dashboard");
  };

  // Onboarding registration
  const handleRegisterCompany = (companyName: string, adminName: string, adminEmail: string) => {
    const freshCompanyId = `comp_${Date.now()}`;
    const freshCompany: Company = {
      id: freshCompanyId,
      name: companyName,
      tradingName: companyName,
      document: `${Math.floor(10 + Math.random() * 89)}.${Math.floor(100 + Math.random() * 899)}.${Math.floor(100 + Math.random() * 899)}/0001-${Math.floor(10 + Math.random() * 89)}`,
      email: adminEmail,
      phone: "(11) 99999-8888",
      whatsapp: "(11) 99999-8888",
      address: {
        street: "Avenida Central",
        number: "100",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01000-000"
      },
      planId: PlanId.BASICO,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days Trial
      maxUsers: 5,
      maxUnits: 2,
      createdAt: new Date().toISOString()
    };

    const defaultUnit: Unit = {
      id: `unit_${Date.now()}`,
      companyId: freshCompanyId,
      name: "Sede Centro",
      address: "Av. Principal, 100 - Centro",
      phone: "(11) 99999-8888",
      isActive: true
    };

    const adminUser: User = {
      id: `usr_${Date.now()}`,
      companyId: freshCompanyId,
      unitId: defaultUnit.id,
      name: adminName,
      email: adminEmail,
      role: UserRole.ADMIN,
      isActive: true
    };

    addCompany(freshCompany);
    addUnit(defaultUnit);
    addUser(adminUser);
    reloadDatabase();
  };

  // Wrappers to update db & reload state dynamically
  const handleSaveSale = (sale: Sale) => {
    addSale(sale);
    reloadDatabase();
  };

  const handleOpenSession = (initialAmount: number, notes?: string) => {
    if (!currentUser || !currentUnit) return;
    openCashierSession(activeCompanyId, currentUnit.id, currentUser.name, initialAmount, notes);
    reloadDatabase();
  };

  const handleCloseSession = (realAmounts: { [method in PaymentMethod]?: number }, closingNotes?: string) => {
    if (!activeSession) return;
    closeCashierSession(activeSession.id, realAmounts, closingNotes);
    reloadDatabase();
  };

  const handleAddCashierMovement = (amount: number, type: CashierMovementType, reason: string) => {
    if (!activeSession) return;
    addCashierMovement(activeSession.id, amount, type, reason);
    reloadDatabase();
  };

  const handleAddProduct = (p: FullProduct) => {
    addProduct(p);
    reloadDatabase();
  };

  const handleUpdateProduct = (p: FullProduct) => {
    updateProduct(p);
    reloadDatabase();
  };

  const handleAddStockMovement = (m: StockMovement) => {
    addStockMovement(m);
    reloadDatabase();
  };

  const handleAddClient = (c: Client) => {
    addClient(c);
    reloadDatabase();
  };

  const handleUpdateClient = (c: Client) => {
    updateClient(c);
    reloadDatabase();
  };

  const handleAddSupplier = (s: Supplier) => {
    addSupplier(s);
    reloadDatabase();
  };

  const handleAddVasilhame = (v: ReturnableVasilhame) => {
    addVasilhame(v);
    reloadDatabase();
  };

  const handleAddBill = (b: AccountBill) => {
    addBill(b);
    reloadDatabase();
  };

  const handleUpdateBill = (b: AccountBill) => {
    updateBill(b);
    reloadDatabase();
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, deliveryPersonId?: string, deliveryPersonName?: string) => {
    updateOrderStatus(orderId, status, deliveryPersonId, deliveryPersonName);
    reloadDatabase();
  };

  const handleToggleCompanyActive = (compId: string) => {
    toggleCompanyActive(compId);
    reloadDatabase();
  };

  const handleUpdateCompanyPlan = (compId: string, planId: PlanId) => {
    updateCompanyPlan(compId, planId);
    reloadDatabase();
  };

  const handleAddUnit = (u: Unit) => {
    addUnit(u);
    reloadDatabase();
  };

  const handleAddUser = (u: User) => {
    addUser(u);
    reloadDatabase();
  };

  const handleUpdateCompany = (c: Company) => {
    updateCompany(c);
    reloadDatabase();
  };

  // Render Login if no session
  if (!currentUser) {
    return (
      <Auth 
        onLogin={handleLogin}
        onRegisterCompany={handleRegisterCompany}
        allUsers={users}
      />
    );
  }

  // Tenant suspension check
  if (currentUser.role !== UserRole.SUPERADMIN && activeCompany && activeCompany.subscriptionStatus === SubscriptionStatus.CANCELED) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 text-center text-neutral-300">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-tight">Sua Conta foi Suspensa</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            O acesso para o depósito <strong>{activeCompany.name}</strong> foi temporariamente suspenso pelo administrador do SaaS devido a pendências de pagamento ou faturamento expirado.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl text-xs transition-all"
          >
            Sair e Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col lg:flex-row text-neutral-200">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={users}
        currentUnit={currentUnit!}
        setCurrentUnit={setCurrentUnit}
        allUnits={units}
        activeCompanyId={activeCompanyId}
        setActiveCompanyId={setActiveCompanyId}
        onLogout={handleLogout}
        syncStatus={syncStatus}
      />

      {/* Main interactive content frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "dashboard" && (
          <Dashboard 
            companyId={activeCompanyId}
            selectedUnitId={currentUnit?.id || ""}
            products={products}
            sales={sales}
            sessions={sessions}
            fiados={fiados}
            bills={bills}
            orders={orders}
          />
        )}

        {activeTab === "pos" && (
          <POS 
            companyId={activeCompanyId}
            unitId={currentUnit?.id || ""}
            products={products}
            clients={getClients()}
            activeSession={activeSession}
            currentUser={currentUser}
            onSaveSale={handleSaveSale}
            onOpenCashierRedirect={() => setActiveTab("cashier")}
          />
        )}

        {activeTab === "products" && (
          <Products 
            companyId={activeCompanyId}
            unitId={currentUnit?.id || ""}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            planId={activeCompany?.planId || PlanId.BASICO}
          />
        )}

        {activeTab === "stock" && (
          <Stock 
            companyId={activeCompanyId}
            unitId={currentUnit?.id || ""}
            products={products}
            movements={getAuditLogs().map(l => ({
              id: l.id,
              companyId: l.companyId,
              unitId: currentUnit?.id || "",
              productId: "",
              productName: l.details || "Ajuste",
              type: l.action === "STOCK_ADJUSTMENT" ? StockMovementType.AJUSTE_MANUAL : StockMovementType.ENTRADA,
              quantity: 1,
              stockBefore: 0,
              stockAfter: 1,
              costPrice: 0,
              reason: l.details,
              responsibleUser: l.userName,
              operatorId: l.userId,
              operatorName: l.userName,
              createdAt: l.createdAt
            }))} // dynamically mapped mock movements
            units={units}
            onAddMovement={handleAddStockMovement}
          />
        )}

        {activeTab === "cashier" && (
          <CashierControl 
            companyId={activeCompanyId}
            unitId={currentUnit?.id || ""}
            activeSession={activeSession}
            sessions={sessions}
            currentUser={currentUser}
            onOpenSession={handleOpenSession}
            onAddMovement={handleAddCashierMovement}
            onCloseSession={handleCloseSession}
          />
        )}

        {activeTab === "finance" && (
          <Finance 
            companyId={activeCompanyId}
            unitId={currentUnit?.id || ""}
            sales={sales}
            sessions={sessions}
            bills={bills}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
          />
        )}

        {activeTab === "reports" && (
          <Reports 
            companyId={activeCompanyId}
            sales={sales}
            products={products}
            auditLogs={auditLogs}
          />
        )}

        {activeTab === "settings" && activeCompany && (
          <SettingsComponent 
            company={activeCompany}
            units={units}
            users={users}
            onUpdateCompany={handleUpdateCompany}
            onAddUnit={handleAddUnit}
            onAddUser={handleAddUser}
            onUpdateCompanyPlan={handleUpdateCompanyPlan}
          />
        )}

        {activeTab === "superadmin" && currentUser.role === UserRole.SUPERADMIN && (
          <SaaSAdmin 
            companies={companies}
            users={users}
            onToggleCompanyActive={handleToggleCompanyActive}
            onUpdateCompanyPlan={handleUpdateCompanyPlan}
          />
        )}
      </div>

    </div>
  );
}
