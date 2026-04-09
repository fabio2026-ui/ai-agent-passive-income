// Etsy费用计算器 - 核心数据与逻辑

export interface CountryFee {
  code: string;
  name: string;
  nameEn: string;
  currency: string;
  symbol: string;
  regulatorRate: number; // 监管费率
  processingRate: number; // 支付处理费率
  processingFixed: number; // 支付处理固定费用
  listingFee: number; // 上架费
  transactionRate: number; // 交易费率
}

export interface CalculatorInput {
  country: string;
  costPrice: number; // 成本价
  targetProfit: number; // 目标利润
  shippingCost: number; // 运费成本
  shippingCharge: number; // 向买家收取的运费
  useAds: boolean; // 是否使用广告
  adsRate: number; // 广告费率 (12-15%)
}

export interface FeeBreakdown {
  listingFee: number; // 上架费
  transactionFee: number; // 交易费 (6.5%)
  processingFee: number; // 支付处理费 (3% + 固定)
  regulatorFee: number; // 监管费
  adsFee: number; // 广告费
  totalFee: number; // 总费用
  totalFeeRate: number; // 总费率
}

export interface CalculatorResult {
  salePrice: number; // 建议售价
  revenue: number; // 总收入
  fees: FeeBreakdown; // 费用明细
  netProfit: number; // 净利润
  profitMargin: number; // 利润率
  breakEvenPrice: number; // 盈亏平衡价
}

// 支持的国家数据
export const COUNTRIES: CountryFee[] = [
  {
    code: 'US',
    name: '美国',
    nameEn: 'United States',
    currency: 'USD',
    symbol: '$',
    regulatorRate: 0,
    processingRate: 0.03,
    processingFixed: 0.25,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'GB',
    name: '英国',
    nameEn: 'United Kingdom',
    currency: 'GBP',
    symbol: '£',
    regulatorRate: 0.004,
    processingRate: 0.04,
    processingFixed: 0.20,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'DE',
    name: '德国',
    nameEn: 'Germany',
    currency: 'EUR',
    symbol: '€',
    regulatorRate: 0.0224,
    processingRate: 0.04,
    processingFixed: 0.30,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'FR',
    name: '法国',
    nameEn: 'France',
    currency: 'EUR',
    symbol: '€',
    regulatorRate: 0.016,
    processingRate: 0.04,
    processingFixed: 0.30,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'IT',
    name: '意大利',
    nameEn: 'Italy',
    currency: 'EUR',
    symbol: '€',
    regulatorRate: 0.017,
    processingRate: 0.04,
    processingFixed: 0.30,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'ES',
    name: '西班牙',
    nameEn: 'Spain',
    currency: 'EUR',
    symbol: '€',
    regulatorRate: 0.005,
    processingRate: 0.04,
    processingFixed: 0.30,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'NL',
    name: '荷兰',
    nameEn: 'Netherlands',
    currency: 'EUR',
    symbol: '€',
    regulatorRate: 0.012,
    processingRate: 0.04,
    processingFixed: 0.30,
    listingFee: 0.20,
    transactionRate: 0.065,
  },
  {
    code: 'CA',
    name: '加拿大',
    nameEn: 'Canada',
    currency: 'CAD',
    symbol: 'C$',
    processingRate: 0.03,
    processingFixed: 0.25,
    listingFee: 0.30,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'AU',
    name: '澳大利亚',
    nameEn: 'Australia',
    currency: 'AUD',
    symbol: 'A$',
    processingRate: 0.03,
    processingFixed: 0.30,
    listingFee: 0.30,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'JP',
    name: '日本',
    nameEn: 'Japan',
    currency: 'JPY',
    symbol: '¥',
    processingRate: 0.03,
    processingFixed: 30,
    listingFee: 30,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'SG',
    name: '新加坡',
    nameEn: 'Singapore',
    currency: 'SGD',
    symbol: 'S$',
    processingRate: 0.03,
    processingFixed: 0.35,
    listingFee: 0.30,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'SE',
    name: '瑞典',
    nameEn: 'Sweden',
    currency: 'SEK',
    symbol: 'kr',
    processingRate: 0.03,
    processingFixed: 3.00,
    listingFee: 2.50,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'PL',
    name: '波兰',
    nameEn: 'Poland',
    currency: 'PLN',
    symbol: 'zł',
    regulatorRate: 0.012,
    processingRate: 0.04,
    processingFixed: 1.50,
    listingFee: 1.00,
    transactionRate: 0.065,
  },
  {
    code: 'BR',
    name: '巴西',
    nameEn: 'Brazil',
    currency: 'BRL',
    symbol: 'R$',
    processingRate: 0.03,
    processingFixed: 1.50,
    listingFee: 1.00,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
  {
    code: 'MX',
    name: '墨西哥',
    nameEn: 'Mexico',
    currency: 'MXN',
    symbol: '$',
    processingRate: 0.03,
    processingFixed: 4.00,
    listingFee: 3.50,
    transactionRate: 0.065,
    regulatorRate: 0,
  },
];

// 计算费用明细
export function calculateFees(
  salePrice: number,
  country: CountryFee,
  shippingCharge: number,
  useAds: boolean,
  adsRate: number
): FeeBreakdown {
  const totalAmount = salePrice + shippingCharge;
  
  // 上架费 (单次)
  const listingFee = country.listingFee;
  
  // 交易费 (6.5% - 售价+运费)
  const transactionFee = totalAmount * country.transactionRate;
  
  // 支付处理费 (各国不同 + 固定费用)
  const processingFee = totalAmount * country.processingRate + country.processingFixed;
  
  // 监管费 (欧盟/英国等)
  const regulatorFee = totalAmount * country.regulatorRate;
  
  // 广告费 (可选, 12-15%)
  const adsFee = useAds ? totalAmount * adsRate : 0;
  
  const totalFee = listingFee + transactionFee + processingFee + regulatorFee + adsFee;
  const totalFeeRate = totalFee / totalAmount;
  
  return {
    listingFee,
    transactionFee,
    processingFee,
    regulatorFee,
    adsFee,
    totalFee,
    totalFeeRate,
  };
}

// 计算建议售价 (正向计算)
export function calculateSuggestedPrice(
  input: CalculatorInput
): CalculatorResult {
  const country = COUNTRIES.find(c => c.code === input.country) || COUNTRIES[0];
  
  // 总成本
  const totalCost = input.costPrice + input.shippingCost;
  
  // 盈亏平衡计算 (需要覆盖成本+费用)
  // 设售价为P，总收入 = P + shippingCharge
  // 总费用 = listingFee + 0.065*(P+shippingCharge) + processingRate*(P+shippingCharge) + processingFixed + regulatorRate*(P+shippingCharge) + (useAds ? adsRate*(P+shippingCharge) : 0)
  // 简化: 费用率 = 0.065 + processingRate + regulatorRate + (useAds ? adsRate : 0)
  // 费用 = listingFee + processingFixed + 费用率 * (P + shippingCharge)
  // 净利润 = P + shippingCharge - totalCost - 费用 = 目标利润
  // P + shippingCharge - totalCost - listingFee - processingFixed - 费用率*(P+shippingCharge) = 目标利润
  // (P + shippingCharge) * (1 - 费用率) = totalCost + listingFee + processingFixed + 目标利润 - shippingCharge + shippingCharge * 费用率
  
  const feeRate = country.transactionRate + country.processingRate + country.regulatorRate + (input.useAds ? input.adsRate : 0);
  const fixedFees = country.listingFee + country.processingFixed;
  
  const requiredRevenue = (totalCost + fixedFees + input.targetProfit - input.shippingCharge * (1 - feeRate)) / (1 - feeRate);
  
  const suggestedPrice = Math.max(requiredRevenue - input.shippingCharge, totalCost * 1.2); // 最低20% markup
  
  const fees = calculateFees(suggestedPrice, country, input.shippingCharge, input.useAds, input.adsRate);
  const revenue = suggestedPrice + input.shippingCharge;
  const netProfit = revenue - totalCost - fees.totalFee;
  const profitMargin = netProfit / suggestedPrice * 100;
  
  // 盈亏平衡价
  const breakEvenRevenue = (totalCost + fixedFees) / (1 - feeRate);
  const breakEvenPrice = breakEvenRevenue - input.shippingCharge;
  
  return {
    salePrice: Number(suggestedPrice.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
    fees,
    netProfit: Number(netProfit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2)),
    breakEvenPrice: Number(Math.max(0, breakEvenPrice).toFixed(2)),
  };
}

// 计算给定售价的结果
export function calculateForPrice(
  salePrice: number,
  input: Omit<CalculatorInput, 'targetProfit'>
): CalculatorResult {
  const country = COUNTRIES.find(c => c.code === input.country) || COUNTRIES[0];
  const totalCost = input.costPrice + input.shippingCost;
  
  const fees = calculateFees(salePrice, country, input.shippingCharge, input.useAds, input.adsRate);
  const revenue = salePrice + input.shippingCharge;
  const netProfit = revenue - totalCost - fees.totalFee;
  const profitMargin = netProfit / salePrice * 100;
  
  const feeRate = country.transactionRate + country.processingRate + country.regulatorRate + (input.useAds ? input.adsRate : 0);
  const fixedFees = country.listingFee + country.processingFixed;
  const breakEvenRevenue = (totalCost + fixedFees) / (1 - feeRate);
  const breakEvenPrice = breakEvenRevenue - input.shippingCharge;
  
  return {
    salePrice: Number(salePrice.toFixed(2)),
    revenue: Number(revenue.toFixed(2)),
    fees,
    netProfit: Number(netProfit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2)),
    breakEvenPrice: Number(Math.max(0, breakEvenPrice).toFixed(2)),
  };
}

// 格式化货币
export function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toFixed(2)}`;
}
