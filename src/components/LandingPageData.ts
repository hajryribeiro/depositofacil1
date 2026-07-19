export interface FaqItem {
  q: string;
  a: string;
}

export interface ProblemItem {
  t: string;
  d: string;
  img: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
  iconName: string;
  items: string[];
}

export interface TestimonialItem {
  name: string;
  role: string;
  quote: string;
  img: string;
}

export interface StepItem {
  s: string;
  t: string;
  d: string;
}

// 1. FAQ DATA
export const faqs: FaqItem[] = [
  {
    q: "O Depósito Fácil funciona pelo celular?",
    a: "Sim! O Depósito Fácil é 100% responsivo e otimizado para celulares e tablets. Você pode registrar vendas, conferir o estoque ou gerenciar seu caixa diretamente do celular, de onde estiver, sem perda de recursos."
  },
  {
    q: "Preciso instalar algum programa?",
    a: "Não! O sistema funciona inteiramente em nuvem. Isso significa que você não precisa instalar nada no computador nem se preocupar com backups. Basta acessar o site pelo navegador de qualquer dispositivo e entrar com sua senha."
  },
  {
    q: "Posso controlar mais de um caixa?",
    a: "Sim! No Plano Profissional e Empresarial você pode ter múltiplos operadores de caixa trabalhando simultaneamente. Cada operador tem seu próprio turno e histórico de aberturas, sangrias e fechamentos."
  },
  {
    q: "O estoque é atualizado automaticamente?",
    a: "Com certeza. No momento exato em que uma venda é efetuada no PDV, os produtos são deduzidos do estoque central imediatamente. O sistema também emite alertas visuais de estoque baixo para que você nunca perca uma venda."
  },
  {
    q: "É possível cadastrar produtos com código de barras?",
    a: "Sim! Você pode usar qualquer leitor USB ou sem fio conectado ao seu computador. Ao cadastrar, basta passar o leitor no produto ou preencher o código de barras manual. Na venda do PDV, bipou, vendeu!"
  },
  {
    q: "Consigo controlar as vendas dos funcionários?",
    a: "Sim. Cada colaborador possui um login individual com permissões específicas. Como administrador, você consegue visualizar relatórios de vendas detalhados de cada funcionário e auditar ações como cancelamento de itens."
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Segurança é nossa prioridade máxima. Seus dados são criptografados com certificado SSL (padrão bancário) e salvos em servidores de alta disponibilidade com cópias de segurança (backups) diárias automáticas."
  },
  {
    q: "O sistema possui período de teste?",
    a: "Sim! Oferecemos 7 dias de teste totalmente gratuito com acesso completo a todos os recursos do plano selecionado. Não pedimos cartão de crédito na hora do cadastro — você só paga se decidir continuar."
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim. Não há contratos de fidelidade ou multas de cancelamento. Se você optar pelo plano mensal, pode cancelar a qualquer momento sem custos adicionais."
  },
  {
    q: "Vocês ajudam na configuração inicial?",
    a: "Sim! Nosso suporte especializado oferece videoaulas, manuais interativos e suporte humanizado via WhatsApp para te ajudar a cadastrar os primeiros produtos e começar a vender em poucos minutos."
  }
];

// 2. DEMONSTRATIVE DATA FOR INTERACTIVE DASHBOARD
export const dashboardStats = {
  visao: {
    faturamento: "R$ 48.720,00",
    lucro: "R$ 12.480,00",
    vendas: "1.284",
    estoqueBaixo: "18 produtos",
    ticketMedio: "R$ 37,94",
    chartData: [
      { name: "Semana 1", faturamento: 9800, lucro: 2100 },
      { name: "Semana 2", faturamento: 12500, lucro: 3200 },
      { name: "Semana 3", faturamento: 11400, lucro: 2880 },
      { name: "Semana 4", faturamento: 15020, lucro: 4300 }
    ]
  },
  estoque: {
    totalItens: "3.460 unidades",
    categorias: "12 ativas",
    itensCriticos: "5 produtos",
    chartData: [
      { name: "Cerveja Retornável", qtd: 1450 },
      { name: "Cerveja Lata", qtd: 980 },
      { name: "Bebidas Quentes", qtd: 420 },
      { name: "Carvão & Gelo", qtd: 310 },
      { name: "Refrigerantes", qtd: 300 }
    ]
  },
  vendas: {
    hoje: "R$ 3.820,00",
    pedidosHoje: "94 concluídos",
    ticketHoje: "R$ 40,63",
    chartData: [
      { name: "08:00", vendas: 350 },
      { name: "11:00", vendas: 850 },
      { name: "14:00", vendas: 620 },
      { name: "17:00", vendas: 1240 },
      { name: "20:00", vendas: 1980 },
      { name: "23:00", vendas: 780 }
    ]
  },
  financeiro: {
    receber: "R$ 4.250,00",
    pagar: "R$ 1.890,00",
    caixaDisponivel: "R$ 8.920,50",
    chartData: [
      { name: "Seg", receitas: 2400, despesas: 800 },
      { name: "Ter", receitas: 3100, despesas: 1200 },
      { name: "Qua", receitas: 2800, despesas: 950 },
      { name: "Qui", receitas: 3500, despesas: 1100 },
      { name: "Sex", receitas: 5200, despesas: 1900 },
      { name: "Sab", receitas: 7800, despesas: 2500 },
      { name: "Dom", receitas: 6100, despesas: 1400 }
    ]
  },
  clientes: {
    cadastrados: "542 clientes",
    ativosEsteMes: "318",
    fiadoAtivo: "R$ 1.450,00",
    chartData: [
      { name: "Carlos A.", valor: 850 },
      { name: "Raimundo N.", valor: 620 },
      { name: "Ana Paula", valor: 540 },
      { name: "José M.", valor: 490 },
      { name: "Mariana S.", valor: 430 }
    ]
  }
};

// 3. PROBLEMS DATA
export const problems: ProblemItem[] = [
  { 
    t: "Estoque desatualizado", 
    d: "Não saber o que tem no fardo de gelo, cervejas ou refrigerantes gera vendas perdidas por falta de produto.",
    img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Perda de produtos", 
    d: "Itens vencendo no fundo do depósito ou latas amassadas sem registro de perda drenam seu caixa.",
    img: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Caixa desorganizado", 
    d: "Divergências no fechamento do dia sem rastreio de sangria ou comissões dos atendentes.",
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Vendas sem acompanhamento", 
    d: "Falta de histórico de faturamento para planejar compras com as marcas parceiras.",
    img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Controle frágil de pessoal", 
    d: "Sem registro de quem fez qual venda, cancelou produto ou aplicou descontos indevidos.",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Ausência de relatórios", 
    d: "Operar às cegas sem relatórios diários de faturamento e lucros por canal de venda.",
    img: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Dificuldade para calcular lucro", 
    d: "Não saber o Lucro Líquido descontados os custos de aquisição e impostos de bebidas.",
    img: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?auto=format&fit=crop&w=120&h=120&q=80"
  },
  { 
    t: "Informações espalhadas", 
    d: "Controle de fiados em cadernetas, faturamento no sistema da maquininha e estoque na cabeça.",
    img: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=120&h=120&q=80"
  }
];

// 4. FEATURES DATA
export const features: FeatureItem[] = [
  {
    title: "CONTROLE DE ESTOQUE",
    desc: "Saiba exatamente o que entrou, o que saiu e quais produtos precisam ser comprados.",
    iconName: "Package",
    items: [
      "Entrada e saída de produtos",
      "Estoque mínimo",
      "Alertas automáticos",
      "Histórico de movimentações",
      "Ajuste de inventário"
    ]
  },
  {
    title: "CAIXA INTELIGENTE",
    desc: "Controle a abertura, o fechamento e todas as movimentações do caixa.",
    iconName: "Database",
    items: [
      "Abertura e fechamento",
      "Sangrias e suprimentos",
      "Histórico por operador",
      "Conferência de valores",
      "Resumo diário"
    ]
  },
  {
    title: "GESTÃO DE VENDAS",
    desc: "Registre vendas com rapidez e acompanhe todos os resultados da operação.",
    iconName: "Zap",
    items: [
      "PDV rápido",
      "Diferentes formas de pagamento",
      "Descontos",
      "Histórico de vendas",
      "Cancelamentos controlados"
    ]
  },
  {
    title: "GESTÃO FINANCEIRA",
    desc: "Visualize receitas, despesas, custos e lucros em um único lugar.",
    iconName: "Coins",
    items: [
      "Contas a pagar",
      "Contas a receber",
      "Fluxo de caixa",
      "Lucro estimado",
      "Controle de despesas"
    ]
  },
  {
    title: "CADASTRO DE PRODUTOS",
    desc: "Cadastre seus produtos com todas as informações necessárias para sua gestão.",
    iconName: "Store",
    items: [
      "Nome, Foto e Categoria",
      "Código de barras",
      "Preço de custo",
      "Preço de venda",
      "Quantidade e Fornecedor"
    ]
  },
  {
    title: "GESTÃO DE CLIENTES",
    desc: "Organize os dados dos seus clientes e acompanhe o histórico de compras.",
    iconName: "Users",
    items: [
      "Dados de contato",
      "Histórico de pedidos",
      "Limite de crédito",
      "Compras recorrentes",
      "Observações gerais"
    ]
  },
  {
    title: "RELATÓRIOS INTELIGENTES",
    desc: "Transforme dados da operação em informações valiosas para faturar mais.",
    iconName: "BarChart3",
    items: [
      "Produtos mais vendidos",
      "Vendas por período",
      "Desempenho por funcionário",
      "Margem de lucro real",
      "Produtos parados"
    ]
  },
  {
    title: "GESTÃO DE USUÁRIOS",
    desc: "Defina o que cada funcionário pode visualizar ou alterar no sistema.",
    iconName: "ShieldCheck",
    items: [
      "Perfis de acesso configuráveis",
      "Permissões personalizadas",
      "Histórico de atividades",
      "Controle por função"
    ]
  }
];

// 5. TESTIMONIALS DATA
export const testimonials: TestimonialItem[] = [
  {
    name: "Carlos Andrade",
    role: "Depósito Central — São Paulo",
    quote: "“Antes do Depósito Fácil, eu só descobria que um produto tinha acabado quando o cliente pedia. Hoje acompanho tudo pelo sistema e consigo comprar no momento certo.”",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    name: "Mariana Souza",
    role: "Distribuidora Prime — Rio de Janeiro",
    quote: "“O fechamento do caixa ficou muito mais rápido e seguro. Também consigo acompanhar as vendas e o estoque em tempo real mesmo quando não estou na loja pelo meu celular.”",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  },
  {
    name: "Rafael Lima",
    role: "Bebidas Express — Belo Horizonte",
    quote: "“Os relatórios do sistema me ajudaram a identificar os produtos que realmente dão lucro no depósito. Hoje compro muito melhor e tenho menos mercadoria parada pegando poeira.”",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  }
];

// 6. TIMELINE STEPS
export const steps: StepItem[] = [
  { s: "Passo 1", t: "Crie sua conta", d: "Faça seu cadastro rápido e configure as informações principais e o nome do seu depósito." },
  { s: "Passo 2", t: "Cadastre seus produtos", d: "Adicione as cervejas, bebidas quentes, gelo, preços de custo, venda e quantidades." },
  { s: "Passo 3", t: "Comece a vender", d: "Registre suas primeiras vendas no PDV com extrema agilidade e o sistema abate do estoque." },
  { s: "Passo 4", t: "Acompanhe os resultados", d: "Visualize os relatórios automáticos de margem de lucro e planeje suas próximas compras." }
];
