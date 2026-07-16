export enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  ADMIN = "ADMIN",
  GERENTE = "GERENTE",
  OPERADOR_CAIXA = "OPERADOR_CAIXA",
  ESTOQUISTA = "ESTOQUISTA",
  FINANCEIRO = "FINANCEIRO",
  ENTREGADOR = "ENTREGADOR"
}

export enum SubscriptionStatus {
  TRIAL = "TRIAL",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED"
}

export enum PlanId {
  BASICO = "BASICO",
  PROFISSIONAL = "PROFISSIONAL",
  PREMIUM = "PREMIUM"
}

export enum ProductUnit {
  UN = "UN",
  LATA = "LATA",
  GARRAFA = "GARRAFA",
  FARDO = "FARDO",
  CAIXA = "CAIXA",
  BARRIL = "BARRIL",
  KG = "KG"
}

export enum StockMovementType {
  ENTRADA = "ENTRADA",
  SAIDA_VENDA = "SAIDA_VENDA",
  AJUSTE_MANUAL = "AJUSTE_MANUAL",
  PERDA = "PERDA",
  AVARIA = "AVARIA",
  VENCIMENTO = "VENCIMENTO",
  DEVOLUCAO_CLIENTE = "DEVOLUCAO_CLIENTE",
  DEVOLUCAO_FORNECEDOR = "DEVOLUCAO_FORNECEDOR",
  TRANSFERENCIA_SAIDA = "TRANSFERENCIA_SAIDA",
  TRANSFERENCIA_ENTRADA = "TRANSFERENCIA_ENTRADA",
  INVENTARIO_AJUSTE = "INVENTARIO_AJUSTE",
  USO_INTERNO = "USO_INTERNO"
}

export enum SaleStatus {
  PENDENTE = "PENDENTE",
  FINALIZADA = "FINALIZADA",
  CANCELADA = "CANCELADA",
  ESTORNADA = "ESTORNADA",
  PARCIALMENTE_PAGA = "PARCIALMENTE_PAGA",
  EM_ENTREGA = "EM_ENTREGA",
  ENTREGUE = "ENTREGUE"
}

export enum PaymentMethod {
  DINHEIRO = "DINHEIRO",
  PIX = "PIX",
  DEBITO = "DEBITO",
  CREDITO = "CREDITO",
  FIADO = "FIADO",
  VALE = "VALE",
  TRANSFERENCIA = "TRANSFERENCIA",
  COMBINADO = "COMBINADO"
}

export enum OrderStatus {
  RECEBIDO = "RECEBIDO",
  SEPARACAO = "SEPARACAO",
  PRONTO_RETIRADA = "PRONTO_RETIRADA",
  SAIU_ENTREGA = "SAIU_ENTREGA",
  ENTREGUE = "ENTREGUE",
  CANCELADO = "CANCELADO"
}

export enum OrderType {
  RETIRADA = "RETIRADA",
  ENTREGA = "ENTREGA"
}

export enum FinanceStatus {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
  ATRASADO = "ATRASADO",
  CANCELADO = "CANCELADO",
  PARCIALMENTE_PAGO = "PARCIALMENTE_PAGO"
}

export interface Company {
  id: string;
  name: string;
  tradingName: string;
  document: string; // CNPJ or CPF
  email: string;
  phone: string;
  whatsapp: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  logoUrl?: string;
  planId: PlanId;
  subscriptionStatus: SubscriptionStatus;
  expirationDate: string; // ISO date
  maxUsers: number;
  maxUnits: number;
  createdAt: string;
}

export interface Unit {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface User {
  id: string;
  companyId: string; // "SAAS" for Superadmin
  unitId?: string; // Optional connection to a unit
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  photoUrl?: string;
  barcode?: string;
  internalCode?: string;
  description?: string;
  category: string;
  brand: string;
  unitOfMeasure: ProductUnit;
  qtyPerPackage: number; // e.g. 12 units in a fard
  minStock: number;
  maxStock: number;
  costPrice: number;
  sellPrice: number;
  supplierId?: string;
  locationInStock?: string;
  expirationDate?: string; // ISO Date
  isActive: boolean;
  isReturnable: boolean; // Needs empty bottles (vasilhames)
  vasilhameCost?: number; // Optional deposit cost of bottle
  createdAt: string;
  updatedAt: string;
}

export interface StockQtyMap {
  [unitId: string]: number; // Tracks quantities per unit
}

// Complete Product representation with current stock map
export interface FullProduct extends Product {
  stockQty: StockQtyMap; 
}

export interface StockMovement {
  id: string;
  companyId: string;
  unitId: string;
  productId: string;
  productName: string; // cache for history
  quantity: number; // positive or negative
  type: StockMovementType;
  stockBefore?: number;
  stockAfter?: number;
  reason: string;
  responsibleUser?: string; // username/email
  createdAt: string; // ISO timestamp
  documentRef?: string; // saleId, purchaseId, inventoryId, etc.
  costPrice?: number;
  operatorId?: string;
  operatorName?: string;
  targetUnitId?: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  type: "PF" | "PJ"; // PF = Pessoa Física, PJ = Pessoa Jurídica
  document?: string; // CPF or CNPJ
  phone?: string;
  whatsapp?: string;
  email?: string;
  birthDate?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    referencePoint?: string;
  };
  creditLimit: number;
  currentDebt: number;
  status: "ACTIVE" | "INACTIVE";
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyId: string;
  corporateName: string;
  tradingName: string;
  cnpj?: string;
  responsible?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  bankDetails?: string;
  notes?: string;
  isActive: boolean;
  // UI legacy compatibility
  name?: string;
  contactPerson?: string;
  brandsSupplied?: string[];
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number; // in R$
  total: number;
  costPrice: number; // snapshot to calculate exact profit later
}

export interface SalePaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  id: string;
  companyId: string;
  unitId: string;
  clientId?: string;
  clientName?: string;
  sellerId: string;
  sellerName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  costTotal: number;
  profitEstimated: number;
  payments: SalePaymentSplit[];
  status: SaleStatus;
  type: OrderType;
  notes?: string;
  createdAt: string;
}

export interface CashierSession {
  id: string;
  companyId: string;
  unitId: string;
  unitName: string;
  operatorId: string;
  operatorName: string;
  openedAt: string;
  closedAt?: string;
  openingBalance: number;
  salesTotal: number; // Sum of closed cashier sales
  salesByMethod: { [key in PaymentMethod]?: number };
  inflows: number; // reinforcements, receipts
  outflows: number; // sangria, expenses, refunds
  expectedBalance: number; // opening + salesInCash + inflows - outflows
  reportedBalance?: number; // reported by operator on close
  difference?: number; // reported - expected
  justification?: string;
  status: "OPEN" | "CLOSED";
  notes?: string;
  // UI legacy compatibility
  salesRecorded?: any[];
  movements?: any[];
  initialAmount?: number;
  openedBy?: string;
  createdAt?: string;
}

export type CashierMovementType = "SALE" | "REINFORCEMENT" | "SANGRIA" | "EXPENSE" | "RECEIPT" | "REFUND" | "ADJUSTMENT";

export const CashierMovementType = {
  SALE: "SALE" as const,
  REINFORCEMENT: "REINFORCEMENT" as const,
  SANGRIA: "SANGRIA" as const,
  EXPENSE: "EXPENSE" as const,
  RECEIPT: "RECEIPT" as const,
  REFUND: "REFUND" as const,
  ADJUSTMENT: "ADJUSTMENT" as const,
  SUPRIMENTO: "REINFORCEMENT" as const // Alias for suprimento
};

export interface CashierMovement {
  id: string;
  sessionId: string;
  companyId: string;
  unitId: string;
  type: CashierMovementType;
  amount: number;
  paymentMethod?: PaymentMethod;
  description: string;
  responsibleUser: string;
  createdAt: string;
}

export interface FiadoAccount {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  saleId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: FinanceStatus;
  notes?: string;
  createdAt: string;
}

export enum BillType {
  PAGAR = "PAGAR",
  RECEBER = "RECEBER"
}

export enum BillStatus {
  PENDENTE = "PENDENTE",
  PAGO = "PAGO",
  ATRASADO = "ATRASADO",
  CANCELADO = "CANCELADO"
}

export interface AccountBill {
  id: string;
  companyId: string;
  unitId?: string;
  unitName?: string;
  description: string;
  supplierId?: string;
  supplierName?: string;
  type: BillType;
  category: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  status: BillStatus | FinanceStatus;
  parcel?: string; // e.g. "1/3" or "Recorrente"
  notes?: string;
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  unitId: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalAmount: number;
  discount: number;
  shippingFee: number;
  paymentMethod: PaymentMethod;
  purchaseDate: string;
  receivedDate?: string;
  invoiceNumber?: string;
  status: "ORCAMENTO" | "PEDIDO_REALIZADO" | "AGUARDANDO_RECEBIMENTO" | "RECEBIDO_PARCIAL" | "RECEBIDO" | "CANCELADO";
  responsibleUser: string;
  notes?: string;
}

export interface CustomerOrder {
  id: string;
  companyId: string;
  unitId: string;
  unitName: string;
  clientId?: string;
  clientName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PENDENTE" | "PAGO";
  type: OrderType;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    zipCode: string;
    referencePoint?: string;
  };
  deliveryDriverId?: string;
  deliveryDriverName?: string;
  estimatedTime?: string;
  status: OrderStatus;
  deliveryPhoto?: string; // simulation reference
  notes?: string;
  createdAt: string;
}

export interface VasilhameBalance {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  vasilhameType: string; // e.g., "Engradado Skol 1L", "Garrafão de Água 20L"
  lentQty: number; // borrowed to client
  receivedQty: number; // returned by client
  balance: number; // lent - received
  notes?: string;
  updatedAt: string;
}

export interface ReturnableVasilhame {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  bottleType: string;
  quantityLoaned: number;
  quantityReturned: number;
  status: "PENDENTE" | "DEVOLVIDO";
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  unitId?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // e.g. "LOGIN", "CREATE_PRODUCT", "CLOSE_CASHIER", "CANCEL_SALE"
  details: string;
  previousState?: string;
  newState?: string;
  ip: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  companyId: string;
  title: string;
  message: string;
  type: "STOCK_LOW" | "EXPIRING_PRODUCT" | "BILL_EXPIRING" | "DEBTOR_ALERT" | "NEW_ORDER" | "CASHIER_DIFFERENCE" | "SAAS_INFO";
  isRead: boolean;
  createdAt: string;
}

export interface SaaSPlan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  maxUnits: number; // -1 for unlimited
  maxUsers: number;  // -1 for unlimited
  features: string[];
}
