'use client';

import { useState, useMemo } from 'react';
import {
  COUNTRIES,
  calculateSuggestedPrice,
  calculateForPrice,
  formatCurrency,
  CalculatorInput,
  CountryFee,
} from '../lib/calculator';

export default function Calculator() {
  // 表单状态
  const [country, setCountry] = useState('US');
  const [costPrice, setCostPrice] = useState('');
  const [targetProfit, setTargetProfit] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [shippingCharge, setShippingCharge] = useState('');
  const [useAds, setUseAds] = useState(false);
  const [adsRate, setAdsRate] = useState(0.13);
  const [manualPrice, setManualPrice] = useState('');
  const [showManual, setShowManual] = useState(false);

  const selectedCountry = COUNTRIES.find(c => c.code === country) || COUNTRIES[0];

  // 自动计算建议价格
  const suggestedResult = useMemo(() => {
    if (!costPrice || !targetProfit) return null;
    
    const input: CalculatorInput = {
      country,
      costPrice: parseFloat(costPrice) || 0,
      targetProfit: parseFloat(targetProfit) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      shippingCharge: parseFloat(shippingCharge) || 0,
      useAds,
      adsRate: adsRate / 100,
    };
    
    return calculateSuggestedPrice(input);
  }, [country, costPrice, targetProfit, shippingCost, shippingCharge, useAds, adsRate]);

  // 手动价格计算
  const manualResult = useMemo(() => {
    if (!manualPrice || !costPrice) return null;
    
    const input = {
      country,
      costPrice: parseFloat(costPrice) || 0,
      shippingCost: parseFloat(shippingCost) || 0,
      shippingCharge: parseFloat(shippingCharge) || 0,
      useAds,
      adsRate: adsRate / 100,
    };
    
    return calculateForPrice(parseFloat(manualPrice) || 0, input);
  }, [manualPrice, country, costPrice, shippingCost, shippingCharge, useAds, adsRate]);

  const activeResult = showManual ? manualResult : suggestedResult;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Etsy 费用计算器</h1>
        <p className="text-gray-600">精准计算Etsy平台所有费用，支持15+国家</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 输入表单 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
            输入参数
          </h2>

          {/* 国家选择 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">销售国家</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.nameEn}) - {c.currency}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              当前: {selectedCountry.symbol} {selectedCountry.currency}
            </p>
          </div>

          {/* 成本价 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              产品成本价 <span className="text-gray-500">({selectedCountry.symbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder={`例如: 10.00`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* 目标利润 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              目标利润 <span className="text-gray-500">({selectedCountry.symbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={targetProfit}
              onChange={(e) => setTargetProfit(e.target.value)}
              placeholder={`例如: 5.00`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* 运费成本 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              运费成本 <span className="text-gray-500">({selectedCountry.symbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder={`例如: 3.00`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* 收取运费 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              向买家收取运费 <span className="text-gray-500">({selectedCountry.symbol})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={shippingCharge}
              onChange={(e) => setShippingCharge(e.target.value)}
              placeholder={`例如: 5.00`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* 广告设置 */}
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useAds}
                onChange={(e) => setUseAds(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">使用Etsy广告 (Offsite Ads)</span>
            </label>
            {useAds && (
              <div className="mt-2 pl-6">
                <label className="block text-xs text-gray-600 mb-1">广告费率</label>
                <div className="flex gap-2">
                  {[12, 13, 15].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setAdsRate(rate)}
                      className={`px-3 py-1 text-sm rounded-full ${
                        adsRate === rate
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Etsy根据过去12个月销售额自动适用: &lt;$10K = 15%, $10K-$1M = 12%
                </p>
              </div>
            )}
          </div>

          {/* 手动价格模式 */}
          <div className="border-t pt-4 mt-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showManual}
                onChange={(e) => setShowManual(e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">测试指定售价</span>
            </label>
            {showManual && (
              <div className="mt-2 pl-6">
                <input
                  type="number"
                  step="0.01"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="输入测试售价"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* 结果展示 */}
        <div className="space-y-6">
          {/* 建议售价卡片 */}
          {activeResult && (
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-lg font-semibold mb-4">计算结果</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-orange-100 text-sm">建议售价</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(activeResult.salePrice, selectedCountry.symbol)}
                  </p>
                </div>
                <div>
                  <p className="text-orange-100 text-sm">净利润</p>
                  <p className={`text-2xl font-bold ${activeResult.netProfit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {formatCurrency(activeResult.netProfit, selectedCountry.symbol)}
                  </p>
                </div>
                <div>
                  <p className="text-orange-100 text-sm">利润率</p>
                  <p className="text-xl font-semibold">{activeResult.profitMargin.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-orange-100 text-sm">盈亏平衡价</p>
                  <p className="text-lg">{formatCurrency(activeResult.breakEvenPrice, selectedCountry.symbol)}</p>
                </div>
              </div>
            </div>
          )}

          {/* 费用明细 */}
          {activeResult && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">费用明细</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-700">上架费 (Listing Fee)</p>
                    <p className="text-xs text-gray-500">每次上架收取</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(activeResult.fees.listingFee, selectedCountry.symbol)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-700">交易费 (Transaction Fee)</p>
                    <p className="text-xs text-gray-500">售价 + 运费的 6.5%</p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(activeResult.fees.transactionFee, selectedCountry.symbol)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-700">支付处理费 (Payment Processing)</p>
                    <p className="text-xs text-gray-500">
                      {(selectedCountry.processingRate * 100).toFixed(0)}% + {formatCurrency(selectedCountry.processingFixed, selectedCountry.symbol).replace(/^\D+/, '')}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(activeResult.fees.processingFee, selectedCountry.symbol)}
                  </span>
                </div>

                {selectedCountry.regulatorRate > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-gray-700">监管费 (Regulatory Fee)</p>
                      <p className="text-xs text-gray-500">{selectedCountry.name} - {(selectedCountry.regulatorRate * 100).toFixed(2)}%</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(activeResult.fees.regulatorFee, selectedCountry.symbol)}
                    </span>
                  </div>
                )}

                {useAds && activeResult.fees.adsFee > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium text-gray-700">广告费 (Offsite Ads)</p>
                      <p className="text-xs text-gray-500">售价 + 运费的 {adsRate}%</p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(activeResult.fees.adsFee, selectedCountry.symbol)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-3 mt-2">
                  <p className="font-bold text-gray-800">总费用</p>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">
                      {formatCurrency(activeResult.fees.totalFee, selectedCountry.symbol)}
                    </p>
                    <p className="text-xs text-gray-500">
                      ({(activeResult.fees.totalFeeRate * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 费用说明 */}
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800">
            <h4 className="font-semibold mb-2">💡 费用说明</h4>
            <ul className="space-y-1 text-xs">
              <li>• <strong>上架费:</strong> 每件商品上架收取 {selectedCountry.symbol}{selectedCountry.listingFee.toFixed(2)}，4个月有效期</li>
              <li>• <strong>交易费:</strong> 统一 6.5%（基于售价+运费）</li>
              <li>• <strong>支付处理:</strong> 各国不同，美国 3%+$0.25</li>
              <li>• <strong>监管费:</strong> 英国/欧盟等国家收取 (0.4%-2.24%)</li>
              <li>• <strong>广告费:</strong> 可选，订单通过Etsy广告产生时收取 12-15%</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="text-center mt-8 text-gray-500 text-sm">
        <p>Etsy Fee Calculator © 2024 | 数据仅供参考，以Etsy官方为准</p>
      </div>
    </div>
  );
}
