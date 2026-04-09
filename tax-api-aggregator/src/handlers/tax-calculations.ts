import type { TaxCalculationRequest, TaxCalculationResponse, ApiResponse } from '../types';

// VAT税率表 (欧盟国家)
const VAT_RATES: Record<string, { standard: number; reduced: number[] }> = {
  AT: { standard: 20, reduced: [13, 10] }, // 奥地利
  BE: { standard: 21, reduced: [12, 6] },  // 比利时
  BG: { standard: 20, reduced: [9] },      // 保加利亚
  HR: { standard: 25, reduced: [13, 5] },  // 克罗地亚
  CY: { standard: 19, reduced: [9, 5] },   // 塞浦路斯
  CZ: { standard: 21, reduced: [15, 10] }, // 捷克
  DK: { standard: 25, reduced: [] },       // 丹麦
  EE: { standard: 22, reduced: [9] },      // 爱沙尼亚
  FI: { standard: 25.5, reduced: [14, 10] }, // 芬兰
  FR: { standard: 20, reduced: [10, 5.5] }, // 法国
  DE: { standard: 19, reduced: [7] },      // 德国
  GR: { standard: 24, reduced: [13, 6] },  // 希腊
  HU: { standard: 27, reduced: [18, 5] },  // 匈牙利
  IE: { standard: 23, reduced: [13.5, 9] }, // 爱尔兰
  IT: { standard: 22, reduced: [10, 5, 4] }, // 意大利
  LV: { standard: 21, reduced: [12, 5] },  // 拉脱维亚
  LT: { standard: 21, reduced: [9, 5] },   // 立陶宛
  LU: { standard  : 17, reduced: [14, 8, 3] }, // 卢森堡
  MT: { standard: 18, reduced: [7, 5] },   // 马耳他
  NL: { standard: 21, reduced: [9] },      // 荷兰
  PL: { standard: 23, reduced: [8, 5] },   // 波兰
  PT: { standard: 23, reduced: [13, 6] },  // 葡萄牙
  RO: { standard: 19, reduced: [9, 5] },   // 罗马尼亚
  SK: { standard: 20, reduced: [10] },     // 斯洛伐克
  SI: { standard: 22, reduced: [9.5] },    // 斯洛文尼亚
  ES: { standard: 21, reduced: [10, 4] },  // 西班牙
  SE: { standard: 25, reduced: [12, 6] },  // 瑞典
};

// 1. 增值税(VAT)计算
export function calculateVAT(request: TaxCalculationRequest): ApiResponse<TaxCalculationResponse> {
  const { amount, country, category = 'standard' } = request;
  const countryCode = country.toUpperCase();
  
  if (!VAT_RATES[countryCode]) {
    return {
      success: false,
      error: { code: 'INVALID_COUNTRY', message: `不支持的国家代码: ${countryCode}` },
      meta: generateMeta(),
    };
  }
  
  const rate = category === 'reduced' 
    ? VAT_RATES[countryCode].reduced[0] || VAT_RATES[countryCode].standard
    : VAT_RATES[countryCode].standard;
    
  const taxAmount = amount * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: parseFloat((amount + taxAmount).toFixed(2)),
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: category === 'reduced' ? 'Reduced VAT' : 'Standard VAT',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 2. 企业所得税计算
export function calculateCorporateTax(request: TaxCalculationRequest): ApiResponse<TaxCalculationResponse> {
  const { amount, country } = request;
  const countryCode = country.toUpperCase();
  
  // 欧盟国家企业所得税率 (简化版)
  const rates: Record<string, number> = {
    DE: 15,      // 德国
    FR: 25,      // 法国
    IT: 24,      // 意大利
    ES: 25,      // 西班牙
    NL: 25.8,    // 荷兰
    BE: 25,      // 比利时
    AT: 25,      // 奥地利
    PL: 19,      // 波兰
    SE: 20.6,    // 瑞典
    IE: 12.5,    // 爱尔兰
  };
  
  const rate = rates[countryCode] || 20;
  const taxAmount = amount * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: 'Corporate Income Tax',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 3. 个人所得税计算
export function calculatePersonalIncomeTax(request: TaxCalculationRequest): ApiResponse<TaxCalculationResponse> {
  const { amount, country } = request;
  const countryCode = country.toUpperCase();
  
  // 简化累进税率计算
  const taxBrackets: Record<string, Array<{ limit: number; rate: number }>> = {
    DE: [
      { limit: 11604, rate: 0 },
      { limit: 66760, rate: 14 },
      { limit: 277825, rate: 24 },
      { limit: Infinity, rate: 42 },
    ],
    FR: [
      { limit: 11294, rate: 0 },
      { limit: 28797, rate: 11 },
      { limit: 82341, rate: 30 },
      { limit: 177106, rate: 41 },
      { limit: Infinity, rate: 45 },
    ],
  };
  
  const brackets = taxBrackets[countryCode] || [{ limit: Infinity, rate: 20 }];
  let taxAmount = 0;
  let remainingAmount = amount;
  let previousLimit = 0;
  const breakdown = [];
  
  for (const bracket of brackets) {
    if (remainingAmount <= 0) break;
    const taxableAtThisRate = Math.min(remainingAmount, bracket.limit - previousLimit);
    if (taxableAtThisRate > 0) {
      const tax = taxableAtThisRate * (bracket.rate / 100);
      taxAmount += tax;
      if (bracket.rate > 0) {
        breakdown.push({
          name: `${bracket.rate}% Bracket`,
          rate: bracket.rate,
          amount: parseFloat(tax.toFixed(2)),
        });
      }
      remainingAmount -= taxableAtThisRate;
    }
    previousLimit = bracket.limit;
  }
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount,
      tax_rate: parseFloat(((taxAmount / amount) * 100).toFixed(2)),
      currency: 'EUR',
      breakdown,
    },
    meta: generateMeta(),
  };
}

// 4. 关税计算
export function calculateCustomsDuty(request: TaxCalculationRequest & { productType?: string }): ApiResponse<TaxCalculationResponse> {
  const { amount, productType = 'general' } = request;
  
  // 欧盟共同关税 (简化)
  const dutyRates: Record<string, number> = {
    general: 4.2,
    electronics: 14,
    clothing: 12,
    food: 8,
    machinery: 2,
  };
  
  const rate = dutyRates[productType] || dutyRates.general;
  const taxAmount = amount * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: 'Customs Duty',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 5. 消费税计算
export function calculateExciseTax(request: TaxCalculationRequest & { productCategory?: string; quantity?: number; unit?: string }): ApiResponse<TaxCalculationResponse> {
  const { amount, productCategory = 'alcohol', quantity = 1, unit = 'liter' } = request;
  
  // 欧盟消费税 (简化)
  const exciseRates: Record<string, { rate: number; perUnit: boolean }> = {
    alcohol: { rate: 15, perUnit: true },
    tobacco: { rate: 75, perUnit: true },
    fuel: { rate: 0.5, perUnit: true },
    energy: { rate: 10, perUnit: false },
  };
  
  const config = exciseRates[productCategory] || exciseRates.alcohol;
  let taxAmount;
  
  if (config.perUnit) {
    taxAmount = quantity * config.rate * amount;
  } else {
    taxAmount = amount * (config.rate / 100);
  }
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount,
      tax_rate: config.rate,
      currency: 'EUR',
      breakdown: [{
        name: `${productCategory.charAt(0).toUpperCase() + productCategory.slice(1)} Excise Tax`,
        rate: config.rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 6. 房产税计算
export function calculatePropertyTax(request: TaxCalculationRequest & { propertyValue?: number; propertyType?: string }): ApiResponse<TaxCalculationResponse> {
  const { propertyValue = 0, propertyType = 'residential', country = 'DE' } = request;
  const countryCode = country.toUpperCase();
  
  const rates: Record<string, Record<string, number>> = {
    DE: { residential: 0.35, commercial: 0.5 },
    FR: { residential: 1.2, commercial: 1.5 },
    ES: { residential: 0.4, commercial: 0.6 },
  };
  
  const rate = rates[countryCode]?.[propertyType] || 0.5;
  const taxAmount = propertyValue * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: propertyValue,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: propertyValue,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: 'Property Tax',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 7. 印花税计算
export function calculateStampDuty(request: TaxCalculationRequest & { transactionType?: string }): ApiResponse<TaxCalculationResponse> {
  const { amount, transactionType = 'property', country = 'DE' } = request;
  const countryCode = country.toUpperCase();
  
  const rates: Record<string, Record<string, number>> = {
    DE: { property: 3.5, shares: 1, documents: 0.5 },
    FR: { property: 5.8, shares: 3, documents: 0.5 },
    GB: { property: 2, shares: 0.5, documents: 0 },
  };
  
  const rate = rates[countryCode]?.[transactionType] || 1;
  const taxAmount = amount * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: amount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: 'Stamp Duty',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 8. 车船税计算
export function calculateVehicleTax(request: TaxCalculationRequest & { engineSize?: number; co2Emissions?: number; vehicleType?: string }): ApiResponse<TaxCalculationResponse> {
  const { engineSize = 1500, co2Emissions = 120, vehicleType = 'car', country = 'DE' } = request;
  const countryCode = country.toUpperCase();
  
  // 基于CO2排放计算 (简化)
  let rate = 0;
  if (co2Emissions <= 95) rate = 0;
  else if (co2Emissions <= 115) rate = 2;
  else if (co2Emissions <= 135) rate = 4;
  else if (co2Emissions <= 155) rate = 6;
  else rate = 8;
  
  const baseAmount = 100;
  const taxAmount = baseAmount + (co2Emissions * rate) + (engineSize * 0.02);
  
  return {
    success: true,
    data: {
      original_amount: baseAmount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: baseAmount,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [
        { name: 'Base Tax', rate: 0, amount: baseAmount },
        { name: 'CO2 Surcharge', rate, amount: parseFloat((co2Emissions * rate).toFixed(2)) },
        { name: 'Engine Size Surcharge', rate: 0.02, amount: parseFloat((engineSize * 0.02).toFixed(2)) },
      ],
    },
    meta: generateMeta(),
  };
}

// 9. 资源税计算
export function calculateResourceTax(request: TaxCalculationRequest & { resourceType?: string; volume?: number }): ApiResponse<TaxCalculationResponse> {
  const { resourceType = 'mineral', volume = 1000, amount = 100 } = request;
  
  const rates: Record<string, number> = {
    mineral: 4,
    oil: 6,
    gas: 5,
    coal: 3,
    water: 0.5,
  };
  
  const rate = rates[resourceType] || 4;
  const taxAmount = volume * amount * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: amount * volume,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: amount * volume,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} Resource Tax`,
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 10. 土地增值税计算
export function calculateLandValueTax(request: TaxCalculationRequest & { landValue?: number; holdingPeriod?: number }): ApiResponse<TaxCalculationResponse> {
  const { landValue = 100000, holdingPeriod = 5 } = request;
  
  // 基于持有期的累进税率
  let rate;
  if (holdingPeriod <= 1) rate = 30;
  else if (holdingPeriod <= 3) rate = 20;
  else if (holdingPeriod <= 5) rate = 10;
  else rate = 0;
  
  const taxAmount = landValue * (rate / 100);
  
  return {
    success: true,
    data: {
      original_amount: landValue,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: landValue,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: 'Land Value Tax',
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 11. 城镇土地使用税计算
export function calculateLandUseTax(request: TaxCalculationRequest & { area?: number; locationType?: string }): ApiResponse<TaxCalculationResponse> {
  const { area = 1000, locationType = 'urban', country = 'DE' } = request;
  const countryCode = country.toUpperCase();
  
  const rates: Record<string, Record<string, number>> = {
    DE: { urban: 0.5, suburban: 0.3, rural: 0.1 },
    FR: { urban: 0.8, suburban: 0.4, rural: 0.15 },
  };
  
  const ratePerSqm = rates[countryCode]?.[locationType] || 0.3;
  const taxAmount = area * ratePerSqm;
  
  return {
    success: true,
    data: {
      original_amount: area,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: area,
      tax_rate: ratePerSqm,
      currency: 'EUR',
      breakdown: [{
        name: 'Land Use Tax',
        rate: ratePerSqm,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 12. 环境保护税计算
export function calculateEnvironmentalTax(request: TaxCalculationRequest & { pollutantType?: string; emissionAmount?: number }): ApiResponse<TaxCalculationResponse> {
  const { pollutantType = 'co2', emissionAmount = 100 } = request;
  
  // 欧盟碳税 (简化)
  const rates: Record<string, number> = {
    co2: 80,        // €80/吨 CO2
    so2: 50,
    nox: 40,
    wastewater: 2,
    waste: 15,
  };
  
  const rate = rates[pollutantType] || 80;
  const taxAmount = emissionAmount * rate;
  
  return {
    success: true,
    data: {
      original_amount: emissionAmount,
      tax_amount: parseFloat(taxAmount.toFixed(2)),
      total_amount: emissionAmount,
      tax_rate: rate,
      currency: 'EUR',
      breakdown: [{
        name: `${pollutantType.toUpperCase()} Environmental Tax`,
        rate,
        amount: parseFloat(taxAmount.toFixed(2)),
      }],
    },
    meta: generateMeta(),
  };
}

// 辅助函数：生成响应元数据
function generateMeta() {
  return {
    request_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    version: 'v1',
  };
}