import {
  Company,
  Unit,
  User,
  FullProduct,
  StockMovement,
  Client,
  Supplier,
  Sale,
  CashierSession,
  CashierMovement,
  FiadoAccount,
  AccountBill,
  PurchaseOrder,
  CustomerOrder,
  VasilhameBalance,
  ReturnableVasilhame,
  AuditLog,
  Notification,
  UserRole,
  SubscriptionStatus,
  PlanId,
  ProductUnit,
  StockMovementType,
  SaleStatus,
  PaymentMethod,
  OrderStatus,
  OrderType,
  FinanceStatus,
  BillType,
  CashierMovementType
} from "./types";
import { collection, doc, writeBatch, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { dbFirestore } from "./firebase";

// Core localStorage keys
const KEYS = {
  COMPANIES: "df_companies",
  UNITS: "df_units",
  USERS: "df_users",
  PRODUCTS: "df_products",
  STOCK_MOVEMENTS: "df_stock_movements",
  CLIENTS: "df_clients",
  SUPPLIERS: "df_suppliers",
  SALES: "df_sales",
  CASHIER_SESSIONS: "df_cashier_sessions",
  CASHIER_MOVEMENTS: "df_cashier_movements",
  FIADO_ACCOUNTS: "df_fiado_accounts",
  ACCOUNT_BILLS: "df_account_bills",
  PURCHASE_ORDERS: "df_purchase_orders",
  CUSTOMER_ORDERS: "df_customer_orders",
  VASILHAME_BALANCES: "df_vasilhame_balances",
  AUDIT_LOGS: "df_audit_logs",
  NOTIFICATIONS: "df_notifications",
  CONFIGURATIONS: "df_configurations"
};

// Default Company Settings Schema
export interface CompanyConfig {
  companyId: string;
  allowSaleWithoutStock: boolean;
  maxDiscountPct: number;
  allowCashierCancelWithoutPermission: boolean;
  requireClientOnSale: boolean;
  trackExpiration: boolean;
  showExpectedBalanceOnClose: boolean;
  autoPrintReceipt: boolean;
  receiptFormat: "80mm" | "A4";
  defaultDeliveryFee: number;
  minimumOrderValue: number;
  businessHours: string;
}

const DEFAULT_PLANS = [
  {
    id: PlanId.BASICO,
    name: "Plano Básico",
    priceMonthly: 79.90,
    priceYearly: 790.00,
    maxUnits: 1,
    maxUsers: 2,
    features: [
      "1 Unidade inclusa",
      "Até 2 usuários de acesso",
      "Cadastro de produtos simplificado",
      "Controle de estoque básico",
      "Frente de Caixa (PDV) rápido",
      "Controle de Caixa",
      "Relatórios básicos de vendas"
    ]
  },
  {
    id: PlanId.PROFISSIONAL,
    name: "Plano Profissional",
    priceMonthly: 149.90,
    priceYearly: 1490.00,
    maxUnits: 3,
    maxUsers: 10,
    features: [
      "Até 3 unidades inclusas",
      "Até 10 usuários de acesso",
      "Tudo do Plano Básico",
      "Controle Financeiro completo (Contas a pagar/receber)",
      "Gestão de Vendas Fiadas (Controle de débito)",
      "Gestão de Pedidos & Entregas (Kanban)",
      "Relatórios avançados (Lucro, curva ABC)",
      "Suporte prioritário"
    ]
  },
  {
    id: PlanId.PREMIUM,
    name: "Plano Premium",
    priceMonthly: 299.90,
    priceYearly: 2990.00,
    maxUnits: 999, // unlimited
    maxUsers: 999,  // unlimited
    features: [
      "Unidades ILIMITADAS",
      "Usuários ILIMITADOS",
      "Tudo do Plano Profissional",
      "Personalização total de marca",
      "Painel de controle customizado",
      "Relatórios sob demanda",
      "Suporte premium por WhatsApp 24/7",
      "Integrações API liberadas"
    ]
  }
];

// KEY TO FIRESTORE COLLECTION MAPPING
export const KEY_TO_COLLECTION: { [key: string]: string } = {
  "df_companies": "companies",
  "df_units": "units",
  "df_users": "users",
  "df_products": "products",
  "df_stock_movements": "stock_movements",
  "df_clients": "clients",
  "df_suppliers": "suppliers",
  "df_sales": "sales",
  "df_cashier_sessions": "cashier_sessions",
  "df_cashier_movements": "cashier_movements",
  "df_fiado_accounts": "fiado_accounts",
  "df_account_bills": "account_bills",
  "df_purchase_orders": "purchase_orders",
  "df_customer_orders": "customer_orders",
  "df_vasilhame_balances": "vasilhame_balances",
  "df_audit_logs": "audit_logs",
  "df_notifications": "notifications",
  "df_configurations": "configurations"
};

// Unique key helper for Firestore documents
function getItemId(item: any): string {
  if (!item) return "";
  if (item.id) return String(item.id);
  if (item.companyId) return String(item.companyId);
  return Math.random().toString(36).substring(2);
}

// Sync single collection to Firestore in the background (handles additions, updates, deletions)
async function syncCollectionToFirebase(key: string, newData: any[]) {
  const collectionName = KEY_TO_COLLECTION[key];
  if (!collectionName) return;

  try {
    const oldDataStr = localStorage.getItem(key);
    const oldData: any[] = oldDataStr ? JSON.parse(oldDataStr) : [];
    
    const oldIds = new Set(oldData.map(getItemId));
    const newIds = new Set(newData.map(getItemId));
    
    const deletedIds = [...oldIds].filter(id => !newIds.has(id));
    
    // Write new or updated items
    for (const item of newData) {
      const id = getItemId(item);
      const docRef = doc(dbFirestore, collectionName, id);
      // Strip out any undefined values (e.g. clientId if it is undefined) to make it safe for Firestore
      const cleanItem = JSON.parse(JSON.stringify(item));
      await setDoc(docRef, cleanItem, { merge: true });
    }
    
    // Delete removed items
    for (const id of deletedIds) {
      const docRef = doc(dbFirestore, collectionName, id);
      await deleteDoc(docRef);
    }
  } catch (error) {
    console.error(`Error syncing collection ${collectionName} to Firebase:`, error);
  }
}

// Helper to safely load data
function getStorage<T>(key: string, defaultData: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultData;
  }
}

// Helper to save data and trigger async cloud sync
function setStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
  if (Array.isArray(data)) {
    syncCollectionToFirebase(key, data).catch(err => {
      console.error(`Failed async sync for key ${key}:`, err);
    });
  }
}

// SEED DATA GENERATOR
const SEED_COMPANIES: Company[] = [
  {
    id: "comp_deposito_facil",
    name: "Depósito Fácil Ltda",
    tradingName: "Depósito Central de Bebidas",
    document: "12.345.678/0001-99",
    email: "contato@depositocentral.com.br",
    phone: "(11) 4002-8922",
    whatsapp: "(11) 98888-7777",
    address: {
      street: "Avenida das Cervejas",
      number: "1500",
      neighborhood: "Polo Industrial",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    },
    logoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120",
    planId: PlanId.PROFISSIONAL,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    expirationDate: "2027-12-31T23:59:59Z",
    maxUsers: 10,
    maxUnits: 3,
    createdAt: "2026-01-10T12:00:00Z"
  },
  {
    id: "comp_adega_sol",
    name: "Adega do Sol Ltda",
    tradingName: "Adega do Sol",
    document: "98.765.432/0001-11",
    email: "adega@adegasol.com.br",
    phone: "(21) 3333-2222",
    whatsapp: "(21) 97777-6666",
    address: {
      street: "Rua do Sol Nascente",
      number: "12",
      neighborhood: "Copacabana",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22000-000"
    },
    logoUrl: "",
    planId: PlanId.BASICO,
    subscriptionStatus: SubscriptionStatus.TRIAL,
    expirationDate: "2026-08-31T23:59:59Z",
    maxUsers: 2,
    maxUnits: 1,
    createdAt: "2026-07-01T10:00:00Z"
  }
];

const SEED_UNITS: Unit[] = [
  {
    id: "unit_matriz",
    companyId: "comp_deposito_facil",
    name: "Matriz Centro",
    phone: "(11) 4002-8922",
    address: "Av. das Cervejas, 1500, São Paulo - SP",
    isActive: true
  },
  {
    id: "unit_filial_sul",
    companyId: "comp_deposito_facil",
    name: "Filial Zona Sul",
    phone: "(11) 4002-8923",
    address: "Rua das Garrafas, 420, São Paulo - SP",
    isActive: true
  },
  {
    id: "unit_adega_main",
    companyId: "comp_adega_sol",
    name: "Adega Principal",
    phone: "(21) 3333-2222",
    address: "Rua do Sol Nascente, 12, Rio de Janeiro - RJ",
    isActive: true
  }
];

const SEED_USERS: User[] = [
  // Superadmin
  {
    id: "usr_super",
    companyId: "SAAS",
    name: "Dr. Almir Ribeiro",
    email: "super@depositofacil.com.br",
    phone: "(11) 99999-9999",
    role: UserRole.SUPERADMIN,
    isActive: true,
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAocdgrYGUMLbk0cwVy7o1ZUYS3MrIKsERwwxw-Qu3qR7YaqIHDH4JdQBtiBllo-314I5Jb-vi-xSmANMGRqIx8hj9LftmFGxCeRDDi_xANkdm5MEzWEsPTeQphZStHLsXk4Tb8_zHGaQjiUve7c1oqH-co6Z4tzSbwpQ7G1q8-Z2k0kXveXYYVyr8c725jm62JbjEssBIjfBHDxqfNrjFpilqJh8msCEHctZaRBntx2NNVxo6hCN3l"
  },
  // Depósito Central (comp_deposito_facil) Users
  {
    id: "usr_admin",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    name: "Carlos Eduardo (Cadu)",
    email: "admin@depositofacil.com.br",
    phone: "(11) 98888-1111",
    role: UserRole.ADMIN,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120"
  },
  {
    id: "usr_caixa",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    name: "Lucas Caixa",
    email: "caixa@depositofacil.com.br",
    phone: "(11) 98888-2222",
    role: UserRole.OPERADOR_CAIXA,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120"
  },
  {
    id: "usr_estoque",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    name: "Reginaldo Estoquista",
    email: "estoque@depositofacil.com.br",
    phone: "(11) 98888-3333",
    role: UserRole.ESTOQUISTA,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
  },
  {
    id: "usr_financeiro",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    name: "Mariana Financeiro",
    email: "financeiro@depositofacil.com.br",
    phone: "(11) 98888-4444",
    role: UserRole.FINANCEIRO,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120"
  },
  {
    id: "usr_entrega",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    name: "Tiago Entregador",
    email: "entrega@depositofacil.com.br",
    phone: "(11) 98888-5555",
    role: UserRole.ENTREGADOR,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
  },
  // Adega do sol Users
  {
    id: "usr_adega_admin",
    companyId: "comp_adega_sol",
    unitId: "unit_adega_main",
    name: "Solange Silva",
    email: "adega@depositofacil.com.br",
    phone: "(21) 97777-1111",
    role: UserRole.ADMIN,
    isActive: true,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"
  }
];

const SEED_CONFIGS: CompanyConfig[] = [
  {
    companyId: "comp_deposito_facil",
    allowSaleWithoutStock: false,
    maxDiscountPct: 15,
    allowCashierCancelWithoutPermission: false,
    requireClientOnSale: false,
    trackExpiration: true,
    showExpectedBalanceOnClose: false, // operator closed cash blind
    autoPrintReceipt: true,
    receiptFormat: "80mm",
    defaultDeliveryFee: 7.50,
    minimumOrderValue: 30.00,
    businessHours: "Seg-Sab 08h às 22h / Dom 08h às 14h"
  },
  {
    companyId: "comp_adega_sol",
    allowSaleWithoutStock: true,
    maxDiscountPct: 10,
    allowCashierCancelWithoutPermission: true,
    requireClientOnSale: false,
    trackExpiration: false,
    showExpectedBalanceOnClose: true,
    autoPrintReceipt: false,
    receiptFormat: "80mm",
    defaultDeliveryFee: 5.00,
    minimumOrderValue: 20.00,
    businessHours: "Seg-Dom 10h às 23h"
  }
];

// Rich Product Catalog with high-fidelity URLs
const SEED_PRODUCTS: FullProduct[] = [
  {
    id: "prod_salon_champagne",
    companyId: "comp_deposito_facil",
    name: "1996 Salon Le Mesnil Blanc de Blancs",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWso2-kTIL0q1SkR1sJ_nczxWX77ayyAVT_b_eUF_7sujr5RqTnR3L26CfomWHESddG-I2g4WHuGel8XZiMDlB4ai15KVnOLxge7JVJoE-ENcWenyg_Z8W54l_RZQyhLyXFWfLYf1FNjU1zfg_xSEcDzCOZ7lVi6w7QoGYycjh12Fk8yg7iZR3cpSpGa_ZzRUCzoMoLpUVjzaDLuJKxS_7dRP0zU7IGazKuuwObUjmJecp752hD906",
    barcode: "7891234560012",
    internalCode: "CHAMP-01",
    description: "Espumante importado de luxo, uvas selecionadas na região de Champagne, França.",
    category: "Destilados",
    brand: "Salon",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 5,
    maxStock: 30,
    costPrice: 850.00,
    sellPrice: 1240.00,
    locationInStock: "Adega Premium / Prateleira A4",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-01-10T12:30:00Z",
    updatedAt: "2026-07-14T10:00:00Z",
    stockQty: { "unit_matriz": 14, "unit_filial_sul": 8 }
  },
  {
    id: "prod_louis_cognac",
    companyId: "comp_deposito_facil",
    name: "Louis XIII Cognac Rémy Martin",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAikSY94MEMEm00a0tsrnZIF-MvWjRvY2tfaRKOteKZugJdfQtVbVVDUg-qMuvv-n0S8rW5iAvvdY7wLRIY3HwYvv2Jvww_GCMsQ45RUnLGayTALT1oyaryT336Uxv3Ye3EF8Bu5HKRMzOURlsaF59lJTo0QnrhSi_ZxA7lkOdbaD6Zz2QC2_J4XyYcRo8YoTdgEKniGsjPrbrxyc3alR6UA4porUkjwvYhX3uPPVLv8M1njJDus0zM",
    barcode: "7891234560029",
    internalCode: "COGNAC-01",
    description: "Cavalier de Cognac ultra premium, decantado em cristal de alta sofisticação.",
    category: "Destilados",
    brand: "Rémy Martin",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 2,
    maxStock: 10,
    costPrice: 12000.00,
    sellPrice: 18500.00,
    locationInStock: "Cofre de Bebidas",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-01-10T12:35:00Z",
    updatedAt: "2026-07-14T10:05:00Z",
    stockQty: { "unit_matriz": 3, "unit_filial_sul": 1 }
  },
  {
    id: "prod_trappist_beer",
    companyId: "comp_deposito_facil",
    name: "Trappist Westvleteren 12",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuApe9EIGy22YLp0GIvMCQlb0XVH1Oqdpl-5Q6CmeeSZLpHNCLpOX-jW3Tcr1xltnaIJfXib8Z__wGbZzgeu2mE4gU10AI2no21czQqOE0g2ds7O8W8xBlnNSA7d3iorQLT8uaTKKchOmYa36Ea4a15UtxnYSd7xlNby7gbeS2pOTTd9fH7Vy5cNpIVk-1rNyKKfPmxxIyU7dENB5CXmbCEcBqhOPyTYYW6GHuNfA6PjsNSgj6ukVwAR",
    barcode: "7891234560036",
    internalCode: "CERV-TRAP-12",
    description: "Cerveja belga considerada uma das melhores do mundo, fabricada de forma artesanal por monges.",
    category: "Cervejas",
    brand: "Westvleteren",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 10,
    maxStock: 50,
    costPrice: 95.00,
    sellPrice: 145.00,
    locationInStock: "Geladeira Premium",
    isActive: true,
    isReturnable: true,
    vasilhameCost: 4.50,
    createdAt: "2026-01-10T12:40:00Z",
    updatedAt: "2026-07-14T10:10:00Z",
    stockQty: { "unit_matriz": 8, "unit_filial_sul": 12 }
  },
  {
    id: "prod_voss_water",
    companyId: "comp_deposito_facil",
    name: "Água Mineral Voss Still 800ml",
    photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJNRak3LnkOfvecyLB494RnHoHOylLSlDaaFW8aQXOR0_88u1i08qkAo7EUsHxlmtLHOnMQxRFQNroRrAlmscupiGrLxWa1B5qOYMbApZrXrMoDBCt_EHVJ2ynP-b3R3YFscjPmuDSBoVjmaSeP2tMac_RYqNGPcECdE1rnQyiYi3SQb9-y_OfB-68yCvtWzXy9r-edgz0GNDoe3ezED3Pkw7f0iZ0ku-C-iVErdm3DLrNevdxgCAq",
    barcode: "7891234560043",
    internalCode: "AGUA-VOSS",
    description: "Água mineral pura de geleira, importada diretamente das fontes da Noruega.",
    category: "Águas",
    brand: "Voss",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 24,
    maxStock: 200,
    costPrice: 22.00,
    sellPrice: 38.00,
    locationInStock: "Prateleira de Águas",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-01-10T12:45:00Z",
    updatedAt: "2026-07-14T10:15:00Z",
    stockQty: { "unit_matriz": 112, "unit_filial_sul": 65 }
  },
  {
    id: "prod_heineken_fardo",
    companyId: "comp_deposito_facil",
    name: "Fardo Cerveja Heineken Lata 350ml (12 un)",
    photoUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300",
    barcode: "7891234560050",
    internalCode: "CERV-HEIN-LATA",
    description: "Cerveja Heineken premium lager, fardo lacrado com 12 latas.",
    category: "Cervejas",
    brand: "Heineken",
    unitOfMeasure: ProductUnit.FARDO,
    qtyPerPackage: 12,
    minStock: 15,
    maxStock: 100,
    costPrice: 42.00,
    sellPrice: 58.00,
    locationInStock: "Palete central",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-07-14T10:00:00Z",
    stockQty: { "unit_matriz": 42, "unit_filial_sul": 18 }
  },
  {
    id: "prod_coca_2l",
    companyId: "comp_deposito_facil",
    name: "Coca-Cola Original Pet 2L",
    photoUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300",
    barcode: "7891234560067",
    internalCode: "REF-COCA-2L",
    description: "Refrigerante Coca-Cola sabor original garrafa de 2 litros.",
    category: "Refrigerantes",
    brand: "Coca-Cola",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 50,
    maxStock: 500,
    costPrice: 6.20,
    sellPrice: 9.90,
    locationInStock: "Prateleira de Refrigerantes",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-02-01T10:15:00Z",
    updatedAt: "2026-07-14T10:00:00Z",
    stockQty: { "unit_matriz": 230, "unit_filial_sul": 140 }
  },
  {
    id: "prod_heineken_barril",
    companyId: "comp_deposito_facil",
    name: "Barril de Chopp Heineken 5L",
    photoUrl: "https://images.unsplash.com/photo-1584225065152-4a1454aa3d4e?w=300",
    barcode: "7891234560074",
    internalCode: "BAR-HEIN-5L",
    description: "Barril de chopp Heineken pressurizado de 5 litros.",
    category: "Cervejas",
    brand: "Heineken",
    unitOfMeasure: ProductUnit.BARRIL,
    qtyPerPackage: 1,
    minStock: 5,
    maxStock: 30,
    costPrice: 90.00,
    sellPrice: 149.00,
    locationInStock: "Câmara Fria",
    isActive: true,
    isReturnable: true,
    vasilhameCost: 45.00,
    createdAt: "2026-03-01T11:00:00Z",
    updatedAt: "2026-07-14T10:00:00Z",
    stockQty: { "unit_matriz": 12, "unit_filial_sul": 5 }
  },
  {
    id: "prod_red_bull_un",
    companyId: "comp_deposito_facil",
    name: "Energético Red Bull Energy Drink 250ml",
    photoUrl: "https://images.unsplash.com/photo-1622543953490-0b70039a2b19?w=300",
    barcode: "7891234560081",
    internalCode: "ENE-REDBULL",
    description: "Bebida energética estimulante Red Bull lata de 250ml.",
    category: "Energéticos",
    brand: "Red Bull",
    unitOfMeasure: ProductUnit.LATA,
    qtyPerPackage: 1,
    minStock: 48,
    maxStock: 400,
    costPrice: 5.50,
    sellPrice: 8.90,
    locationInStock: "Geladeira expositora",
    isActive: true,
    isReturnable: false,
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-07-14T10:00:00Z",
    stockQty: { "unit_matriz": 184, "unit_filial_sul": 95 }
  },

  // Adega do Sol Products (comp_adega_sol)
  {
    id: "prod_sol_cerva",
    companyId: "comp_adega_sol",
    name: "Cerveja Skol Litrão 1L",
    photoUrl: "",
    barcode: "7891234560098",
    internalCode: "SOL-CERV-SKOL-1L",
    description: "Cerveja pilsen Skol 1 Litro, garrafa retornável.",
    category: "Cervejas",
    brand: "Skol",
    unitOfMeasure: ProductUnit.GARRAFA,
    qtyPerPackage: 1,
    minStock: 20,
    maxStock: 200,
    costPrice: 4.80,
    sellPrice: 7.50,
    locationInStock: "Engradados de vidro",
    isActive: true,
    isReturnable: true,
    vasilhameCost: 3.00,
    createdAt: "2026-07-02T12:00:00Z",
    updatedAt: "2026-07-02T12:00:00Z",
    stockQty: { "unit_adega_main": 140 }
  }
];

const SEED_CLIENTS: Client[] = [
  {
    id: "cli_botequim_centro",
    companyId: "comp_deposito_facil",
    name: "Botequim do Zé Bar e Restaurante",
    type: "PJ",
    document: "11.222.333/0001-44",
    phone: "(11) 5555-4444",
    whatsapp: "(11) 97777-5555",
    email: "bar@botequimdoze.com.br",
    address: {
      street: "Rua Augusta",
      number: "850",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
      zipCode: "01304-001",
      referencePoint: "Próximo à estação de Metrô"
    },
    creditLimit: 5000.00,
    currentDebt: 1250.00, // already used some credit
    status: "ACTIVE",
    notes: "Cliente fiel, realiza pagamentos quinzenais. Retorna os vasilhames corretamente.",
    createdAt: "2026-02-15T14:20:00Z"
  },
  {
    id: "cli_jose_silva",
    companyId: "comp_deposito_facil",
    name: "José da Silva Oliveira",
    type: "PF",
    document: "333.444.555-22",
    phone: "(11) 98765-4321",
    whatsapp: "(11) 98765-4321",
    email: "jose.silva@gmail.com",
    address: {
      street: "Alameda Santos",
      number: "122",
      complement: "Apto 45B",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "01419-000"
    },
    creditLimit: 500.00,
    currentDebt: 345.50, // debtor
    status: "ACTIVE",
    notes: "Compra fiado para churrascos familiares. Cobra em atraso recorrente.",
    createdAt: "2026-03-01T16:00:00Z"
  },
  {
    id: "cli_condominio_parque",
    companyId: "comp_deposito_facil",
    name: "Condomínio Parque das Flores",
    type: "PJ",
    document: "55.666.777/0001-88",
    phone: "(11) 2222-1111",
    whatsapp: "(11) 96666-5555",
    email: "condominio@parqueflowers.com.br",
    address: {
      street: "Rua das Rosas",
      number: "100",
      neighborhood: "Morumbi",
      city: "São Paulo",
      state: "SP",
      zipCode: "05600-000"
    },
    creditLimit: 10000.00,
    currentDebt: 0.00,
    status: "ACTIVE",
    notes: "Faturamento mensal pós-entrega.",
    createdAt: "2026-04-10T11:00:00Z"
  },
  // Adega do sol client
  {
    id: "cli_sol_marcos",
    companyId: "comp_adega_sol",
    name: "Marcos Vinicius Rezende",
    type: "PF",
    document: "444.555.666-77",
    phone: "(21) 96666-3333",
    whatsapp: "(21) 96666-3333",
    email: "marcos@adegasol.com.br",
    creditLimit: 200.00,
    currentDebt: 45.00,
    status: "ACTIVE",
    createdAt: "2026-07-03T11:00:00Z"
  }
];

const SEED_SUPPLIERS: Supplier[] = [
  {
    id: "sup_ambev",
    companyId: "comp_deposito_facil",
    corporateName: "Ambev S.A. Distribuidora",
    tradingName: "Ambev Cervejaria",
    cnpj: "17.222.333/0001-44",
    responsible: "Gabriel Ambev Representante",
    phone: "(11) 3000-4000",
    whatsapp: "(11) 95555-4444",
    email: "pedidos@ambev.com.br",
    address: "Av. da Cervejaria, 100, Guarulhos - SP",
    bankDetails: "Banco do Brasil - Ag 1234-5 / CC 98765-4",
    notes: "Entrega toda terça-feira se o pedido for fechado até sexta 18h.",
    isActive: true
  },
  {
    id: "sup_coca_cola",
    companyId: "comp_deposito_facil",
    corporateName: "Coca-Cola FEMSA Brasil S.A.",
    tradingName: "Coca-Cola FEMSA",
    cnpj: "54.321.098/0001-77",
    responsible: "Fernanda Representante Coca",
    phone: "(11) 3222-1111",
    whatsapp: "(11) 94444-3333",
    email: "femsa.contato@femsa.com.br",
    notes: "Entrega toda quinta-feira.",
    isActive: true
  }
];

const SEED_CASHIER_SESSIONS: CashierSession[] = [
  {
    id: "sess_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    operatorId: "usr_caixa",
    operatorName: "Lucas Caixa",
    openedAt: "2026-07-14T08:00:00Z",
    closedAt: undefined,
    openingBalance: 250.00,
    salesTotal: 4850.00,
    salesByMethod: {
      [PaymentMethod.DINHEIRO]: 850.00,
      [PaymentMethod.PIX]: 1500.00,
      [PaymentMethod.CREDITO]: 2000.00,
      [PaymentMethod.DEBITO]: 500.00
    },
    inflows: 200.00, // reinforcement
    outflows: 50.00, // sangria
    expectedBalance: 1250.00, // opening (250) + cashSales (850) + inflows (200) - outflows (50) = 1250
    status: "OPEN",
    notes: "Início do expediente normal."
  }
];

const SEED_CASHIER_MOVEMENTS: CashierMovement[] = [
  {
    id: "mov_cash_1",
    sessionId: "sess_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    type: "REINFORCEMENT",
    amount: 200.00,
    description: "Suprimento inicial para troco",
    responsibleUser: "Carlos Eduardo (Cadu)",
    createdAt: "2026-07-14T08:05:00Z"
  },
  {
    id: "mov_cash_2",
    sessionId: "sess_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    type: "SANGRIA",
    amount: 50.00,
    description: "Retirada de excesso de dinheiro para cofre",
    responsibleUser: "Carlos Eduardo (Cadu)",
    createdAt: "2026-07-14T11:30:00Z"
  }
];

// Seed Audit Logs
const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    userId: "usr_admin",
    userName: "Carlos Eduardo (Cadu)",
    userRole: UserRole.ADMIN,
    action: "LOGIN",
    details: "Usuário logou no painel administrativo",
    ip: "189.100.22.45",
    createdAt: "2026-07-14T07:45:00Z"
  },
  {
    id: "log_2",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    userId: "usr_caixa",
    userName: "Lucas Caixa",
    userRole: UserRole.OPERADOR_CAIXA,
    action: "ABERTURA_CAIXA",
    details: "Caixa aberto com saldo de R$ 250,00",
    ip: "189.100.22.46",
    createdAt: "2026-07-14T08:00:00Z"
  }
];

// Seed Notifications
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "not_1",
    companyId: "comp_deposito_facil",
    title: "Estoque Baixo",
    message: "O estoque de 'Trappist Westvleteren 12' está com apenas 8 unidades. Mínimo é 10.",
    type: "STOCK_LOW",
    isRead: false,
    createdAt: "2026-07-14T09:00:00Z"
  },
  {
    id: "not_2",
    companyId: "comp_deposito_facil",
    title: "Conta Próxima do Vencimento",
    message: "A conta 'Aluguel do Depósito Galpão B' vence amanhã (15/07) no valor de R$ 4.500,00.",
    type: "BILL_EXPIRING",
    isRead: false,
    createdAt: "2026-07-14T10:00:00Z"
  }
];

// Seed Fiado accounts
const SEED_FIADOS: FiadoAccount[] = [
  {
    id: "fia_1",
    companyId: "comp_deposito_facil",
    clientId: "cli_botequim_centro",
    clientName: "Botequim do Zé Bar e Restaurante",
    saleId: "sale_mock_1",
    totalAmount: 1250.00,
    paidAmount: 0.00,
    remainingAmount: 1250.00,
    dueDate: "2026-07-30",
    status: FinanceStatus.PENDENTE,
    createdAt: "2026-07-10T15:00:00Z"
  },
  {
    id: "fia_2",
    companyId: "comp_deposito_facil",
    clientId: "cli_jose_silva",
    clientName: "José da Silva Oliveira",
    saleId: "sale_mock_2",
    totalAmount: 345.50,
    paidAmount: 0.00,
    remainingAmount: 345.50,
    dueDate: "2026-07-10", // overdue!
    status: FinanceStatus.ATRASADO,
    createdAt: "2026-07-01T17:30:00Z"
  }
];

// Seed Account Bills
const SEED_BILLS: AccountBill[] = [
  {
    id: "bill_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    description: "Aluguel Depósito Galpão Central",
    type: BillType.PAGAR,
    category: "ALUGUEL",
    amount: 4500.00,
    dueDate: "2026-07-15",
    status: FinanceStatus.PENDENTE,
    parcel: "Recorrente",
    createdAt: "2026-07-01T08:00:00Z"
  },
  {
    id: "bill_2",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    description: "Conta de Energia Elétrica Enel",
    type: BillType.PAGAR,
    category: "ENERGIA",
    amount: 1240.00,
    dueDate: "2026-07-20",
    status: FinanceStatus.PENDENTE,
    createdAt: "2026-07-05T09:00:00Z"
  },
  {
    id: "bill_3",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    description: "Compra de Cervejas Heineken Palete",
    supplierId: "sup_ambev",
    supplierName: "Ambev S.A. Distribuidora",
    type: BillType.PAGAR,
    category: "COMPRA",
    amount: 3200.00,
    dueDate: "2026-07-14",
    paymentDate: "2026-07-14",
    paymentMethod: PaymentMethod.PIX,
    status: FinanceStatus.PAGO,
    createdAt: "2026-07-12T10:00:00Z"
  }
];

// Seed Vasilhame empty bottle accounts
const SEED_VASILHAMES: VasilhameBalance[] = [
  {
    id: "vas_1",
    companyId: "comp_deposito_facil",
    clientId: "cli_botequim_centro",
    clientName: "Botequim do Zé Bar e Restaurante",
    vasilhameType: "Cerveja Skol Retornável 1L (Engradado)",
    lentQty: 48,
    receivedQty: 36,
    balance: 12, // 12 bottles missing
    updatedAt: "2026-07-12T15:00:00Z"
  },
  {
    id: "vas_2",
    companyId: "comp_deposito_facil",
    clientId: "cli_botequim_centro",
    clientName: "Botequim do Zé Bar e Restaurante",
    vasilhameType: "Barril Chopp Heineken 5L",
    lentQty: 4,
    receivedQty: 4,
    balance: 0,
    updatedAt: "2026-07-13T10:00:00Z"
  }
];

// Seed Customer orders (Kanban / Delivery system)
const SEED_ORDERS: CustomerOrder[] = [
  {
    id: "ord_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    clientId: "cli_botequim_centro",
    clientName: "Botequim do Zé Bar e Restaurante",
    items: [
      {
        productId: "prod_trappist_beer",
        productName: "Trappist Westvleteren 12",
        quantity: 4,
        unitPrice: 145.00,
        discount: 0,
        total: 580.00,
        costPrice: 95.00
      },
      {
        productId: "prod_voss_water",
        productName: "Água Mineral Voss Still 800ml",
        quantity: 12,
        unitPrice: 38.00,
        discount: 0,
        total: 456.00,
        costPrice: 22.00
      }
    ],
    subtotal: 1036.00,
    discount: 36.00,
    deliveryFee: 15.00,
    total: 1015.00,
    paymentMethod: PaymentMethod.PIX,
    paymentStatus: "PAGO",
    type: OrderType.ENTREGA,
    address: {
      street: "Rua Augusta",
      number: "850",
      neighborhood: "Consolação",
      city: "São Paulo",
      zipCode: "01304-001",
      referencePoint: "Próximo à estação de Metrô"
    },
    deliveryDriverId: "usr_entrega",
    deliveryDriverName: "Tiago Entregador",
    estimatedTime: "45 min",
    status: OrderStatus.SAIU_ENTREGA,
    createdAt: "2026-07-14T15:30:00Z"
  },
  {
    id: "ord_2",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    unitName: "Matriz Centro",
    clientName: "Ana Clara Silva",
    items: [
      {
        productId: "prod_red_bull_un",
        productName: "Energético Red Bull Energy Drink 250ml",
        quantity: 10,
        unitPrice: 8.90,
        discount: 0,
        total: 89.00,
        costPrice: 5.50
      },
      {
        productId: "prod_heineken_fardo",
        productName: "Fardo Cerveja Heineken Lata 350ml (12 un)",
        quantity: 2,
        unitPrice: 58.00,
        discount: 0,
        total: 116.00,
        costPrice: 42.00
      }
    ],
    subtotal: 205.00,
    discount: 5.00,
    deliveryFee: 10.00,
    total: 210.00,
    paymentMethod: PaymentMethod.DINHEIRO,
    paymentStatus: "PENDENTE",
    type: OrderType.ENTREGA,
    address: {
      street: "Rua Bela Cintra",
      number: "1230",
      neighborhood: "Cerqueira César",
      city: "São Paulo",
      zipCode: "01415-001"
    },
    status: OrderStatus.RECEBIDO,
    createdAt: "2026-07-14T16:20:00Z"
  }
];

// Seed Purchase Orders
const SEED_PURCHASES: PurchaseOrder[] = [
  {
    id: "pur_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    supplierId: "sup_ambev",
    supplierName: "Ambev S.A. Distribuidora",
    items: [
      {
        productId: "prod_trappist_beer",
        productName: "Trappist Westvleteren 12",
        quantity: 24,
        unitPrice: 90.00
      }
    ],
    totalAmount: 2160.00,
    discount: 160.00,
    shippingFee: 50.00,
    paymentMethod: PaymentMethod.TRANSFERENCIA,
    purchaseDate: "2026-07-10",
    receivedDate: "2026-07-13",
    invoiceNumber: "NF-998811",
    status: "RECEBIDO",
    responsibleUser: "Carlos Eduardo (Cadu)",
    notes: "Tudo entregue em perfeitas condições."
  }
];

// Seed Stock Movements
const SEED_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "move_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    productId: "prod_trappist_beer",
    productName: "Trappist Westvleteren 12",
    quantity: 24,
    type: StockMovementType.ENTRADA,
    stockBefore: 0,
    stockAfter: 24,
    reason: "Entrada de Mercadoria por Compra (Ambev)",
    responsibleUser: "Carlos Eduardo (Cadu)",
    createdAt: "2026-07-13T14:00:00Z",
    documentRef: "pur_1"
  },
  {
    id: "move_2",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    productId: "prod_trappist_beer",
    productName: "Trappist Westvleteren 12",
    quantity: -12,
    type: StockMovementType.TRANSFERENCIA_SAIDA,
    stockBefore: 24,
    stockAfter: 12,
    reason: "Transferência para Filial Zona Sul",
    responsibleUser: "Reginaldo Estoquista",
    createdAt: "2026-07-14T09:30:00Z"
  }
];

// Seed Sales (to hydrate reports and dashboards)
const SEED_SALES: Sale[] = [
  {
    id: "sale_mock_1",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    clientId: "cli_botequim_centro",
    clientName: "Botequim do Zé Bar e Restaurante",
    sellerId: "usr_admin",
    sellerName: "Carlos Eduardo (Cadu)",
    items: [
      {
        productId: "prod_heineken_fardo",
        productName: "Fardo Cerveja Heineken Lata 350ml (12 un)",
        quantity: 20,
        unitPrice: 58.00,
        discount: 0,
        total: 1160.00,
        costPrice: 42.00
      },
      {
        productId: "prod_coca_2l",
        productName: "Coca-Cola Original Pet 2L",
        quantity: 10,
        unitPrice: 9.90,
        discount: 0,
        total: 99.00,
        costPrice: 6.20
      }
    ],
    subtotal: 1259.00,
    discount: 9.00,
    deliveryFee: 0,
    total: 1250.00,
    costTotal: 902.00,
    profitEstimated: 348.00,
    payments: [
      { method: PaymentMethod.FIADO, amount: 1250.00 }
    ],
    status: SaleStatus.FINALIZADA,
    type: OrderType.RETIRADA,
    createdAt: "2026-07-10T15:00:00Z"
  },
  {
    id: "sale_mock_2",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    clientId: "cli_jose_silva",
    clientName: "José da Silva Oliveira",
    sellerId: "usr_caixa",
    sellerName: "Lucas Caixa",
    items: [
      {
        productId: "prod_salon_champagne",
        productName: "1996 Salon Le Mesnil Blanc de Blancs",
        quantity: 1,
        unitPrice: 1240.00,
        discount: 100.00,
        total: 1140.00,
        costPrice: 850.00
      }
    ],
    subtotal: 1240.00,
    discount: 100.00,
    deliveryFee: 10.00,
    total: 1150.00,
    costTotal: 850.00,
    profitEstimated: 300.00,
    payments: [
      { method: PaymentMethod.DINHEIRO, amount: 1150.00 }
    ],
    status: SaleStatus.FINALIZADA,
    type: OrderType.ENTREGA,
    createdAt: "2026-07-14T09:40:00Z"
  },
  {
    id: "sale_mock_3",
    companyId: "comp_deposito_facil",
    unitId: "unit_matriz",
    sellerId: "usr_caixa",
    sellerName: "Lucas Caixa",
    items: [
      {
        productId: "prod_red_bull_un",
        productName: "Energético Red Bull Energy Drink 250ml",
        quantity: 24,
        unitPrice: 8.90,
        discount: 13.60,
        total: 200.00,
        costPrice: 5.50
      }
    ],
    subtotal: 213.60,
    discount: 13.60,
    deliveryFee: 0,
    total: 200.00,
    costTotal: 132.00,
    profitEstimated: 68.00,
    payments: [
      { method: PaymentMethod.PIX, amount: 200.00 }
    ],
    status: SaleStatus.FINALIZADA,
    type: OrderType.RETIRADA,
    createdAt: "2026-07-14T10:15:00Z"
  }
];

function getSeedData(key: string): any[] {
  switch (key) {
    case "df_companies": return SEED_COMPANIES;
    case "df_units": return SEED_UNITS;
    case "df_users": return SEED_USERS;
    case "df_products": return SEED_PRODUCTS;
    case "df_stock_movements": return SEED_STOCK_MOVEMENTS;
    case "df_clients": return SEED_CLIENTS;
    case "df_suppliers": return SEED_SUPPLIERS;
    case "df_sales": return SEED_SALES;
    case "df_cashier_sessions": return SEED_CASHIER_SESSIONS;
    case "df_cashier_movements": return SEED_CASHIER_MOVEMENTS;
    case "df_fiado_accounts": return SEED_FIADOS;
    case "df_account_bills": return SEED_BILLS;
    case "df_purchase_orders": return SEED_PURCHASES;
    case "df_customer_orders": return SEED_ORDERS;
    case "df_vasilhame_balances": return SEED_VASILHAMES;
    case "df_audit_logs": return SEED_AUDIT_LOGS;
    case "df_notifications": return SEED_NOTIFICATIONS;
    case "df_configurations": return SEED_CONFIGS;
    default: return [];
  }
}

let isSyncing = false;

export const syncDatabaseWithFirebase = async () => {
  if (isSyncing) return;
  isSyncing = true;

  window.dispatchEvent(new CustomEvent("database-sync-status", { detail: "syncing" }));

  const keysToSync = Object.keys(KEY_TO_COLLECTION);

  for (const key of keysToSync) {
    const colName = KEY_TO_COLLECTION[key];
    try {
      const colRef = collection(dbFirestore, colName);
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const list: any[] = [];
        snapshot.forEach(doc => {
          list.push(doc.data());
        });

        // Safety check: always ensure the Superadmin user is present in the database
        if (key === "df_users") {
          const hasSuper = list.some(u => u.role === UserRole.SUPERADMIN || u.id === "usr_super");
          if (!hasSuper) {
            const superUser = SEED_USERS.find(u => u.role === UserRole.SUPERADMIN || u.id === "usr_super");
            if (superUser) {
              list.push(superUser);
              try {
                // Safely write to Firestore so it's permanently stored on the cloud as well
                const docRef = doc(dbFirestore, "users", superUser.id);
                setDoc(docRef, superUser, { merge: true });
              } catch (err) {
                console.error("Failed to write superuser to firestore:", err);
              }
            }
          }
        }

        localStorage.setItem(key, JSON.stringify(list));
      } else {
        // Upload initial local/seed data to Firestore
        const localData = getStorage(key, getSeedData(key));
        if (localData && localData.length > 0) {
          const batch = writeBatch(dbFirestore);
          localData.forEach(item => {
            const id = getItemId(item);
            const docRef = doc(dbFirestore, colName, id);
            batch.set(docRef, item);
          });
          await batch.commit();
        }
      }
    } catch (e) {
      console.error(`Failed to sync collection ${colName} from Firebase:`, e);
    }
  }

  isSyncing = false;
  window.dispatchEvent(new CustomEvent("database-sync-status", { detail: "done" }));
  window.dispatchEvent(new Event("database-updated"));
};

// EXPORT DATABASE ENGINE
export const db = {
  // Plan definition (Read-only for normal tenants)
  getPlans: () => DEFAULT_PLANS,

  // Multitenant companies
  getCompanies: (): Company[] => getStorage(KEYS.COMPANIES, SEED_COMPANIES),
  saveCompanies: (data: Company[]) => setStorage(KEYS.COMPANIES, data),
  getCompany: (id: string): Company | undefined => db.getCompanies().find(c => c.id === id),
  addCompany: (comp: Company) => {
    const list = db.getCompanies();
    list.push(comp);
    db.saveCompanies(list);

    // Bootstrap default units for this new company
    const units = db.getUnits();
    units.push({
      id: `unit_${comp.id}_matriz`,
      companyId: comp.id,
      name: "Depósito Principal",
      phone: comp.phone,
      address: `${comp.address.street}, ${comp.address.number}, ${comp.address.city} - ${comp.address.state}`,
      isActive: true
    });
    db.saveUnits(units);

    // Bootstrap default configuration
    const configs = db.getConfigurations();
    configs.push({
      companyId: comp.id,
      allowSaleWithoutStock: true,
      maxDiscountPct: 10,
      allowCashierCancelWithoutPermission: true,
      requireClientOnSale: false,
      trackExpiration: false,
      showExpectedBalanceOnClose: true,
      autoPrintReceipt: false,
      receiptFormat: "80mm",
      defaultDeliveryFee: 5.00,
      minimumOrderValue: 0.00,
      businessHours: "A definir"
    });
    db.saveConfigurations(configs);
  },
  updateCompany: (comp: Company) => {
    const list = db.getCompanies().map(c => c.id === comp.id ? comp : c);
    db.saveCompanies(list);
  },

  // Units
  getUnits: (): Unit[] => getStorage(KEYS.UNITS, SEED_UNITS),
  saveUnits: (data: Unit[]) => setStorage(KEYS.UNITS, data),
  getUnitsByCompany: (companyId: string) => db.getUnits().filter(u => u.companyId === companyId),
  addUnit: (unit: Unit) => {
    const list = db.getUnits();
    list.push(unit);
    db.saveUnits(list);
  },
  updateUnit: (unit: Unit) => {
    const list = db.getUnits().map(u => u.id === unit.id ? unit : u);
    db.saveUnits(list);
  },

  // Users
  getUsers: (): User[] => {
    const list = getStorage<User[]>(KEYS.USERS, SEED_USERS);
    const hasSuper = list.some(u => u.role === UserRole.SUPERADMIN || u.id === "usr_super");
    if (!hasSuper) {
      const superUser = SEED_USERS.find(u => u.role === UserRole.SUPERADMIN || u.id === "usr_super");
      if (superUser) {
        list.push(superUser);
        localStorage.setItem(KEYS.USERS, JSON.stringify(list));
      }
    }
    return list;
  },
  saveUsers: (data: User[]) => setStorage(KEYS.USERS, data),
  getUsersByCompany: (companyId: string) => db.getUsers().filter(u => u.companyId === companyId),
  addUser: (user: User) => {
    const list = db.getUsers();
    list.push(user);
    db.saveUsers(list);
  },
  updateUser: (user: User) => {
    const list = db.getUsers().map(u => u.id === user.id ? user : u);
    db.saveUsers(list);
  },

  // Configurations
  getConfigurations: (): CompanyConfig[] => getStorage(KEYS.CONFIGURATIONS, SEED_CONFIGS),
  saveConfigurations: (data: CompanyConfig[]) => setStorage(KEYS.CONFIGURATIONS, data),
  getConfig: (companyId: string): CompanyConfig => {
    const list = db.getConfigurations();
    const found = list.find(c => c.companyId === companyId);
    if (!found) {
      const fresh: CompanyConfig = {
        companyId,
        allowSaleWithoutStock: true,
        maxDiscountPct: 10,
        allowCashierCancelWithoutPermission: true,
        requireClientOnSale: false,
        trackExpiration: false,
        showExpectedBalanceOnClose: true,
        autoPrintReceipt: false,
        receiptFormat: "80mm",
        defaultDeliveryFee: 5.00,
        minimumOrderValue: 0.00,
        businessHours: "A definir"
      };
      list.push(fresh);
      db.saveConfigurations(list);
      return fresh;
    }
    return found;
  },
  updateConfig: (config: CompanyConfig) => {
    const list = db.getConfigurations().map(c => c.companyId === config.companyId ? config : c);
    db.saveConfigurations(list);
  },

  // Products
  getProducts: (): FullProduct[] => getStorage(KEYS.PRODUCTS, SEED_PRODUCTS),
  saveProducts: (data: FullProduct[]) => setStorage(KEYS.PRODUCTS, data),
  getProductsByCompany: (companyId: string) => db.getProducts().filter(p => p.companyId === companyId),
  addProduct: (product: FullProduct) => {
    const list = db.getProducts();
    list.push(product);
    db.saveProducts(list);
  },
  updateProduct: (product: FullProduct) => {
    const list = db.getProducts().map(p => p.id === product.id ? product : p);
    db.saveProducts(list);
  },

  // Stock movements
  getStockMovements: (): StockMovement[] => getStorage(KEYS.STOCK_MOVEMENTS, SEED_STOCK_MOVEMENTS),
  saveStockMovements: (data: StockMovement[]) => setStorage(KEYS.STOCK_MOVEMENTS, data),
  getStockMovementsByCompany: (companyId: string) => db.getStockMovements().filter(s => s.companyId === companyId),
  addStockMovement: (move: StockMovement) => {
    const list = db.getStockMovements();
    list.push(move);
    db.saveStockMovements(list);

    // Apply change directly to FullProduct stockQty map
    const prods = db.getProducts();
    const prod = prods.find(p => p.id === move.productId);
    if (prod) {
      if (!prod.stockQty) prod.stockQty = {};
      const current = prod.stockQty[move.unitId] || 0;
      prod.stockQty[move.unitId] = current + move.quantity;
      db.saveProducts(prods);
    }
  },

  // Clients
  getClients: (): Client[] => getStorage(KEYS.CLIENTS, SEED_CLIENTS),
  saveClients: (data: Client[]) => setStorage(KEYS.CLIENTS, data),
  getClientsByCompany: (companyId: string) => db.getClients().filter(c => c.companyId === companyId),
  addClient: (client: Client) => {
    const list = db.getClients();
    list.push(client);
    db.saveClients(list);
  },
  updateClient: (client: Client) => {
    const list = db.getClients().map(c => c.id === client.id ? client : c);
    db.saveClients(list);
  },

  // Suppliers
  getSuppliers: (): Supplier[] => getStorage(KEYS.SUPPLIERS, SEED_SUPPLIERS),
  saveSuppliers: (data: Supplier[]) => setStorage(KEYS.SUPPLIERS, data),
  getSuppliersByCompany: (companyId: string) => db.getSuppliers().filter(s => s.companyId === companyId),
  addSupplier: (sup: Supplier) => {
    const list = db.getSuppliers();
    list.push(sup);
    db.saveSuppliers(list);
  },
  updateSupplier: (sup: Supplier) => {
    const list = db.getSuppliers().map(s => s.id === sup.id ? sup : s);
    db.saveSuppliers(list);
  },

  // Sales
  getSales: (): Sale[] => getStorage(KEYS.SALES, SEED_SALES),
  saveSales: (data: Sale[]) => setStorage(KEYS.SALES, data),
  getSalesByCompany: (companyId: string) => db.getSales().filter(s => s.companyId === companyId),
  addSale: (sale: Sale) => {
    const list = db.getSales();
    list.push(sale);
    db.saveSales(list);

    // If finalizada, apply automatic stock reduction for all items
    if (sale.status === SaleStatus.FINALIZADA || sale.status === SaleStatus.EM_ENTREGA || sale.status === SaleStatus.ENTREGUE) {
      sale.items.forEach(item => {
        const prods = db.getProducts();
        const prod = prods.find(p => p.id === item.productId);
        const currentStock = prod ? (prod.stockQty[sale.unitId] || 0) : 0;
        
        db.addStockMovement({
          id: `move_sale_${sale.id}_${item.productId}`,
          companyId: sale.companyId,
          unitId: sale.unitId,
          productId: item.productId,
          productName: item.productName,
          quantity: -item.quantity,
          type: StockMovementType.SAIDA_VENDA,
          stockBefore: currentStock,
          stockAfter: currentStock - item.quantity,
          reason: `Venda #${sale.id}`,
          responsibleUser: sale.sellerName,
          createdAt: sale.createdAt,
          documentRef: sale.id
        });
      });

      // Handle Cashier updates if paid partially in Cash
      const cashAmount = sale.payments
        .filter(p => p.method === PaymentMethod.DINHEIRO)
        .reduce((sum, p) => sum + p.amount, 0);

      const activeSession = db.getActiveCashierSession(sale.companyId, sale.unitId);
      if (activeSession && cashAmount > 0) {
        db.addCashierMovement({
          id: `mov_cash_sale_${sale.id}`,
          sessionId: activeSession.id,
          companyId: sale.companyId,
          unitId: sale.unitId,
          type: "SALE",
          amount: cashAmount,
          paymentMethod: PaymentMethod.DINHEIRO,
          description: `Venda À Vista #${sale.id}`,
          responsibleUser: sale.sellerName,
          createdAt: sale.createdAt
        });
      }

      // If fiado is selected, register accounts receivable entry
      const fiadoAmount = sale.payments
        .filter(p => p.method === PaymentMethod.FIADO)
        .reduce((sum, p) => sum + p.amount, 0);

      if (fiadoAmount > 0 && sale.clientId) {
        db.addFiado({
          id: `fia_sale_${sale.id}`,
          companyId: sale.companyId,
          clientId: sale.clientId,
          clientName: sale.clientName || "Cliente",
          saleId: sale.id,
          totalAmount: fiadoAmount,
          paidAmount: 0,
          remainingAmount: fiadoAmount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days
          status: FinanceStatus.PENDENTE,
          createdAt: sale.createdAt
        });

        // Update Client total debt balance
        const cls = db.getClients();
        const client = cls.find(c => c.id === sale.clientId);
        if (client) {
          client.currentDebt += fiadoAmount;
          db.saveClients(cls);
        }
      }
    }
  },
  cancelSale: (saleId: string, responsibleName: string) => {
    const list = db.getSales();
    const sale = list.find(s => s.id === saleId);
    if (sale && sale.status !== SaleStatus.CANCELADA) {
      sale.status = SaleStatus.CANCELADA;
      db.saveSales(list);

      // Return items to stock (Positive adjustment)
      sale.items.forEach(item => {
        const prods = db.getProducts();
        const prod = prods.find(p => p.id === item.productId);
        const currentStock = prod ? (prod.stockQty[sale.unitId] || 0) : 0;

        db.addStockMovement({
          id: `move_cancel_${sale.id}_${item.productId}`,
          companyId: sale.companyId,
          unitId: sale.unitId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          type: StockMovementType.DEVOLUCAO_CLIENTE,
          stockBefore: currentStock,
          stockAfter: currentStock + item.quantity,
          reason: `Cancelamento de Venda #${sale.id}`,
          responsibleUser: responsibleName,
          createdAt: new Date().toISOString()
        });
      });

      // Deduct from cashier if paid in cash
      const cashAmount = sale.payments
        .filter(p => p.method === PaymentMethod.DINHEIRO)
        .reduce((sum, p) => sum + p.amount, 0);

      const activeSession = db.getActiveCashierSession(sale.companyId, sale.unitId);
      if (activeSession && cashAmount > 0) {
        db.addCashierMovement({
          id: `mov_cash_cancel_${sale.id}`,
          sessionId: activeSession.id,
          companyId: sale.companyId,
          unitId: sale.unitId,
          type: "REFUND",
          amount: -cashAmount,
          paymentMethod: PaymentMethod.DINHEIRO,
          description: `Cancelamento Venda #${sale.id}`,
          responsibleUser: responsibleName,
          createdAt: new Date().toISOString()
        });
      }

      // Deduct from fiado debt if needed
      const fiadoAmount = sale.payments
        .filter(p => p.method === PaymentMethod.FIADO)
        .reduce((sum, p) => sum + p.amount, 0);

      if (fiadoAmount > 0 && sale.clientId) {
        const fiados = db.getFiados();
        const f = fiados.find(f => f.saleId === sale.id);
        if (f) {
          f.status = FinanceStatus.CANCELADO;
          db.saveFiados(fiados);
        }

        const cls = db.getClients();
        const client = cls.find(c => c.id === sale.clientId);
        if (client) {
          client.currentDebt = Math.max(0, client.currentDebt - fiadoAmount);
          db.saveClients(cls);
        }
      }
    }
  },

  // Cashier sessions & operations
  getCashierSessions: (): CashierSession[] => getStorage(KEYS.CASHIER_SESSIONS, SEED_CASHIER_SESSIONS),
  saveCashierSessions: (data: CashierSession[]) => setStorage(KEYS.CASHIER_SESSIONS, data),
  getCashierSessionsByCompany: (companyId: string) => db.getCashierSessions().filter(c => c.companyId === companyId),
  getActiveCashierSession: (companyId: string, unitId: string): CashierSession | undefined => {
    return db.getCashierSessions().find(s => s.companyId === companyId && s.unitId === unitId && s.status === "OPEN");
  },
  openCashier: (session: CashierSession) => {
    const list = db.getCashierSessions();
    list.push(session);
    db.saveCashierSessions(list);

    // Register opening movement
    db.addCashierMovement({
      id: `mov_cash_open_${session.id}`,
      sessionId: session.id,
      companyId: session.companyId,
      unitId: session.unitId,
      type: "REINFORCEMENT",
      amount: session.openingBalance,
      description: "Abertura de Caixa (Saldo Inicial)",
      responsibleUser: session.operatorName,
      createdAt: session.openedAt
    });
  },
  closeCashier: (sessionId: string, reportedBalance: number, justification?: string, closingNotes?: string) => {
    const list = db.getCashierSessions();
    const session = list.find(s => s.id === sessionId);
    if (session && session.status === "OPEN") {
      session.status = "CLOSED";
      session.closedAt = new Date().toISOString();
      session.reportedBalance = reportedBalance;
      
      // Calculate final expected balance
      const movements = db.getCashierMovementsBySession(sessionId);
      
      // sales cash inflows + reinforcements - sangrias/expenses
      let currentBalance = session.openingBalance;
      let salesSum = 0;
      const salesByMethod: { [key in PaymentMethod]?: number } = {};

      // Get all completed sales for this unit within open period
      const compSales = db.getSalesByCompany(session.companyId).filter(s => {
        return s.unitId === session.unitId && 
          s.createdAt >= session.openedAt && 
          s.createdAt <= (session.closedAt || "");
      });

      compSales.forEach(s => {
        if (s.status !== SaleStatus.CANCELADA) {
          salesSum += s.total;
          s.payments.forEach(p => {
            salesByMethod[p.method] = (salesByMethod[p.method] || 0) + p.amount;
          });
        }
      });

      session.salesTotal = salesSum;
      session.salesByMethod = salesByMethod;

      // Inflows (excluding opening balance reinforcement)
      const otherInflows = movements
        .filter(m => m.type !== "SALE" && m.amount > 0 && !m.description.includes("Saldo Inicial"))
        .reduce((sum, m) => sum + m.amount, 0);

      // Outflows (sangrias, despesas)
      const otherOutflows = movements
        .filter(m => m.amount < 0)
        .reduce((sum, m) => sum + Math.abs(m.amount), 0);

      // expected cash in drawer = opening + cashSales + otherInflows - otherOutflows
      const cashSales = salesByMethod[PaymentMethod.DINHEIRO] || 0;
      session.expectedBalance = session.openingBalance + cashSales + otherInflows - otherOutflows;
      
      session.difference = reportedBalance - session.expectedBalance;
      session.justification = justification;
      session.notes = closingNotes;

      db.saveCashierSessions(list);

      // Send alert notification if there is a discrepancy
      if (Math.abs(session.difference) > 1) {
        db.addNotification({
          id: `not_diff_${session.id}`,
          companyId: session.companyId,
          title: "Diferença de Caixa Encontrada",
          message: `Caixa fechado por ${session.operatorName} na ${session.unitName} com diferença de R$ ${session.difference.toFixed(2)}. Justificativa: ${justification || "Nenhuma"}`,
          type: "CASHIER_DIFFERENCE",
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  },

  // Cashier Movements
  getCashierMovements: (): CashierMovement[] => getStorage(KEYS.CASHIER_MOVEMENTS, SEED_CASHIER_MOVEMENTS),
  saveCashierMovements: (data: CashierMovement[]) => setStorage(KEYS.CASHIER_MOVEMENTS, data),
  getCashierMovementsBySession: (sessionId: string) => db.getCashierMovements().filter(m => m.sessionId === sessionId),
  addCashierMovement: (mov: CashierMovement) => {
    const list = db.getCashierMovements();
    list.push(mov);
    db.saveCashierMovements(list);
  },

  // Fiados / Contas a receber
  getFiados: (): FiadoAccount[] => getStorage(KEYS.FIADO_ACCOUNTS, SEED_FIADOS),
  saveFiados: (data: FiadoAccount[]) => setStorage(KEYS.FIADO_ACCOUNTS, data),
  getFiadosByCompany: (companyId: string) => db.getFiados().filter(f => f.companyId === companyId),
  addFiado: (f: FiadoAccount) => {
    const list = db.getFiados();
    list.push(f);
    db.saveFiados(list);
  },
  receiveFiadoPayment: (fiadoId: string, amount: number, paymentMethod: PaymentMethod, responsibleUser: string) => {
    const list = db.getFiados();
    const f = list.find(x => x.id === fiadoId);
    if (f && f.status !== FinanceStatus.PAGO) {
      f.paidAmount += amount;
      f.remainingAmount = Math.max(0, f.totalAmount - f.paidAmount);
      f.status = f.remainingAmount <= 0 ? FinanceStatus.PAGO : FinanceStatus.PARCIALMENTE_PAGO;
      db.saveFiados(list);

      // Deduct Client balance
      const cls = db.getClients();
      const client = cls.find(c => c.id === f.clientId);
      if (client) {
        client.currentDebt = Math.max(0, client.currentDebt - amount);
        db.saveClients(cls);
      }

      // Add to cashier session if cash Pix/card on physical cashier
      const activeSess = db.getActiveCashierSession(f.companyId, "unit_matriz"); // fallback default
      if (activeSess && paymentMethod === PaymentMethod.DINHEIRO) {
        db.addCashierMovement({
          id: `mov_rec_fiado_${Date.now()}`,
          sessionId: activeSess.id,
          companyId: f.companyId,
          unitId: activeSess.unitId,
          type: "RECEIPT",
          amount: amount,
          paymentMethod,
          description: `Recebimento Fiado - Cliente ${f.clientName}`,
          responsibleUser,
          createdAt: new Date().toISOString()
        });
      }
    }
  },

  // Account Bills (Contas a pagar)
  getBills: (): AccountBill[] => getStorage(KEYS.ACCOUNT_BILLS, SEED_BILLS),
  saveBills: (data: AccountBill[]) => setStorage(KEYS.ACCOUNT_BILLS, data),
  getBillsByCompany: (companyId: string) => db.getBills().filter(b => b.companyId === companyId),
  addBill: (bill: AccountBill) => {
    const list = db.getBills();
    list.push(bill);
    db.saveBills(list);
  },
  payBill: (billId: string, paymentMethod: PaymentMethod, responsibleUser: string) => {
    const list = db.getBills();
    const b = list.find(x => x.id === billId);
    if (b && b.status !== FinanceStatus.PAGO) {
      b.status = FinanceStatus.PAGO;
      b.paymentDate = new Date().toISOString().split("T")[0];
      b.paymentMethod = paymentMethod;
      db.saveBills(list);

      // Register outflow in cashier if paid in cash
      const activeSess = db.getActiveCashierSession(b.companyId, b.unitId);
      if (activeSess && paymentMethod === PaymentMethod.DINHEIRO) {
        db.addCashierMovement({
          id: `mov_cash_bill_${b.id}`,
          sessionId: activeSess.id,
          companyId: b.companyId,
          unitId: b.unitId,
          type: "EXPENSE",
          amount: -b.amount,
          paymentMethod,
          description: `Despesa Paga: ${b.description}`,
          responsibleUser,
          createdAt: new Date().toISOString()
        });
      }
    }
  },

  // Vasilhames
  getVasilhames: (): VasilhameBalance[] => getStorage(KEYS.VASILHAME_BALANCES, SEED_VASILHAMES),
  saveVasilhames: (data: VasilhameBalance[]) => setStorage(KEYS.VASILHAME_BALANCES, data),
  getVasilhamesByCompany: (companyId: string) => db.getVasilhames().filter(v => v.companyId === companyId),
  addVasilhameMovement: (companyId: string, clientId: string, clientName: string, type: string, lentChange: number, receivedChange: number) => {
    const list = db.getVasilhames();
    let balance = list.find(v => v.companyId === companyId && v.clientId === clientId && v.vasilhameType === type);
    if (!balance) {
      balance = {
        id: `vas_${Date.now()}`,
        companyId,
        clientId,
        clientName,
        vasilhameType: type,
        lentQty: 0,
        receivedQty: 0,
        balance: 0,
        updatedAt: new Date().toISOString()
      };
      list.push(balance);
    }

    balance.lentQty += lentChange;
    balance.receivedQty += receivedChange;
    balance.balance = balance.lentQty - balance.receivedQty;
    balance.updatedAt = new Date().toISOString();
    db.saveVasilhames(list);
  },

  // Customer orders / deliveries
  getCustomerOrders: (): CustomerOrder[] => getStorage(KEYS.CUSTOMER_ORDERS, SEED_ORDERS),
  saveCustomerOrders: (data: CustomerOrder[]) => setStorage(KEYS.CUSTOMER_ORDERS, data),
  getCustomerOrdersByCompany: (companyId: string) => db.getCustomerOrders().filter(o => o.companyId === companyId),
  addCustomerOrder: (order: CustomerOrder) => {
    const list = db.getCustomerOrders();
    list.push(order);
    db.saveCustomerOrders(list);
  },
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryDriverId?: string, deliveryDriverName?: string) => {
    const list = db.getCustomerOrders();
    const order = list.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (deliveryDriverId) {
        order.deliveryDriverId = deliveryDriverId;
      }
      if (deliveryDriverName) {
        order.deliveryDriverName = deliveryDriverName;
      }
      db.saveCustomerOrders(list);

      // If finished, convert order to full sales automatically to log financials and stocks
      if (status === OrderStatus.ENTREGUE) {
        order.paymentStatus = "PAGO";
        const sales = db.getSales();
        const saleExists = sales.some(s => s.id === `sale_order_${order.id}`);
        if (!saleExists) {
          const freshSale: Sale = {
            id: `sale_order_${order.id}`,
            companyId: order.companyId,
            unitId: order.unitId,
            clientId: order.clientId,
            clientName: order.clientName,
            sellerId: order.deliveryDriverId || "sistema",
            sellerName: order.deliveryDriverName || "Entregador",
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            deliveryFee: order.deliveryFee,
            total: order.total,
            costTotal: order.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0),
            profitEstimated: order.total - order.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0),
            payments: [{ method: order.paymentMethod, amount: order.total }],
            status: SaleStatus.FINALIZADA,
            type: OrderType.ENTREGA,
            createdAt: new Date().toISOString()
          };
          db.addSale(freshSale);
        }
      }
    }
  },

  // Purchase orders
  getPurchases: (): PurchaseOrder[] => getStorage(KEYS.PURCHASE_ORDERS, SEED_PURCHASES),
  savePurchases: (data: PurchaseOrder[]) => setStorage(KEYS.PURCHASE_ORDERS, data),
  getPurchasesByCompany: (companyId: string) => db.getPurchases().filter(p => p.companyId === companyId),
  addPurchase: (p: PurchaseOrder) => {
    const list = db.getPurchases();
    list.push(p);
    db.savePurchases(list);
  },
  confirmPurchaseDelivery: (purchaseId: string, invoiceNum?: string) => {
    const list = db.getPurchases();
    const p = list.find(x => x.id === purchaseId);
    if (p && p.status !== "RECEBIDO") {
      p.status = "RECEBIDO";
      p.invoiceNumber = invoiceNum;
      p.receivedDate = new Date().toISOString().split("T")[0];
      db.savePurchases(list);

      // Supply Products Stocks and average cost price
      p.items.forEach(item => {
        const prods = db.getProducts();
        const prod = prods.find(pr => pr.id === item.productId);
        const currentStock = prod ? (prod.stockQty[p.unitId] || 0) : 0;

        if (prod) {
          // Update cost price
          prod.costPrice = item.unitPrice;
          db.saveProducts(prods);
        }

        db.addStockMovement({
          id: `move_pur_${p.id}_${item.productId}`,
          companyId: p.companyId,
          unitId: p.unitId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          type: StockMovementType.ENTRADA,
          stockBefore: currentStock,
          stockAfter: currentStock + item.quantity,
          reason: `Recebimento Compra #${p.id}`,
          responsibleUser: p.responsibleUser,
          createdAt: new Date().toISOString(),
          documentRef: p.id
        });
      });

      // Generate accounts payable (contas a pagar) if not fully paid à vista
      if (p.paymentMethod !== PaymentMethod.DINHEIRO) {
        db.addBill({
          id: `bill_pur_${p.id}`,
          companyId: p.companyId,
          unitId: p.unitId,
          unitName: "Matriz Centro",
          description: `Compra realizada Fornecedor ${p.supplierName}`,
          supplierId: p.supplierId,
          supplierName: p.supplierName,
          type: BillType.PAGAR,
          category: "COMPRA",
          amount: p.totalAmount,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 15 days
          status: FinanceStatus.PENDENTE,
          createdAt: new Date().toISOString()
        });
      }
    }
  },

  // Audit logs
  getAuditLogs: (): AuditLog[] => getStorage(KEYS.AUDIT_LOGS, SEED_AUDIT_LOGS),
  saveAuditLogs: (data: AuditLog[]) => setStorage(KEYS.AUDIT_LOGS, data),
  getAuditLogsByCompany: (companyId: string) => db.getAuditLogs().filter(a => a.companyId === companyId),
  addAuditLog: (log: AuditLog) => {
    const list = db.getAuditLogs();
    list.unshift(log); // newest first
    db.saveAuditLogs(list);
  },

  // Notifications
  getNotifications: (): Notification[] => getStorage(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS),
  saveNotifications: (data: Notification[]) => setStorage(KEYS.NOTIFICATIONS, data),
  getNotificationsByCompany: (companyId: string) => db.getNotifications().filter(n => n.companyId === companyId),
  addNotification: (not: Notification) => {
    const list = db.getNotifications();
    list.unshift(not);
    db.saveNotifications(list);
  },
  markNotificationRead: (id: string) => {
    const list = db.getNotifications();
    const not = list.find(n => n.id === id);
    if (not) {
      not.isRead = true;
      db.saveNotifications(list);
    }
  }
};

// Module-level exports for App.tsx compatibility
export const getCompanies = db.getCompanies;
export const getUnits = db.getUnits;
export const getUsers = db.getUsers;
export const getProducts = db.getProducts;
export const getSales = db.getSales;
export const getClients = db.getClients;
export const getCashierSessions = db.getCashierSessions;
export const getFiados = db.getFiados;
export const getBills = db.getBills;
export const getOrders = db.getCustomerOrders;
export const getAuditLogs = db.getAuditLogs;
export const addSale = db.addSale;

export const openCashierSession = (
  companyId: string,
  unitId: string,
  operatorName: string,
  initialAmount: number,
  notes?: string
) => {
  const session: CashierSession = {
    id: `sess_${Date.now()}`,
    companyId,
    unitId,
    unitName: "Matriz Centro",
    operatorId: "usr_caixa",
    operatorName,
    openedAt: new Date().toISOString(),
    openingBalance: initialAmount,
    salesTotal: 0,
    salesByMethod: {},
    inflows: 0,
    outflows: 0,
    expectedBalance: initialAmount,
    status: "OPEN",
    notes
  };
  db.openCashier(session);
};

export const closeCashierSession = (
  sessionId: string,
  realAmounts: { [method in PaymentMethod]?: number },
  closingNotes?: string
) => {
  // calculate total reported
  const reportedBalance = Object.values(realAmounts).reduce((sum, val) => sum + (val || 0), 0);
  db.closeCashier(sessionId, reportedBalance, "Conferência física no fechamento", closingNotes);
};

export const addCashierMovement = (
  sessionId: string,
  amount: number,
  type: CashierMovementType,
  reason: string
) => {
  const activeSess = db.getCashierSessions().find(s => s.id === sessionId);
  if (activeSess) {
    db.addCashierMovement({
      id: `mov_${Date.now()}`,
      sessionId,
      companyId: activeSess.companyId,
      unitId: activeSess.unitId,
      type: type,
      amount,
      description: reason,
      responsibleUser: activeSess.operatorName,
      createdAt: new Date().toISOString()
    });
  }
};

export const addProduct = db.addProduct;
export const updateProduct = db.updateProduct;
export const addStockMovement = db.addStockMovement;
export const addClient = db.addClient;
export const updateClient = db.updateClient;
export const addSupplier = db.addSupplier;

export const addVasilhame = (v: ReturnableVasilhame) => {
  db.addVasilhameMovement(
    v.companyId,
    v.clientId,
    v.clientName,
    v.bottleType,
    v.quantityLoaned,
    v.quantityReturned
  );
};

export const addBill = db.addBill;
export const updateBill = (bill: AccountBill) => {
  const list = db.getBills();
  const updated = list.map(b => b.id === bill.id ? bill : b);
  db.saveBills(updated);
};

export const updateOrderStatus = db.updateOrderStatus;
export const addCompany = db.addCompany;
export const updateCompany = db.updateCompany;
export const addUnit = db.addUnit;
export const addUser = db.addUser;

export const toggleCompanyActive = (compId: string) => {
  const list = db.getCompanies();
  const c = list.find(x => x.id === compId);
  if (c) {
    c.subscriptionStatus = c.subscriptionStatus === SubscriptionStatus.ACTIVE ? SubscriptionStatus.CANCELED : SubscriptionStatus.ACTIVE;
    db.saveCompanies(list);
  }
};

export const updateCompanyPlan = (compId: string, planId: PlanId) => {
  const list = db.getCompanies();
  const c = list.find(x => x.id === compId);
  if (c) {
    c.planId = planId;
    db.saveCompanies(list);
  }
};
