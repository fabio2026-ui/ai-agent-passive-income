/**
 * Revenue Tracker - 收入追踪系统
 * 用于追踪多渠道收入、成本和利润分析
 */

class RevenueTracker {
  constructor(config = {}) {
    this.config = {
      baseCurrency: config.baseCurrency || 'USD',
      trackExpenses: config.trackExpenses !== false,
      autoCalculateProfit: config.autoCalculateProfit !== false,
      ...config
    };
    
    // 收入记录
    this.revenues = [];
    // 成本记录
    this.expenses = [];
    // 订阅/重复收入
    this.subscriptions = new Map();
    // 收入目标
    this.goals = new Map();
    // 汇率缓存
    this.exchangeRates = new Map();
  }

  // ========== 收入记录 ==========
  
  recordRevenue(data) {
    const revenue = {
      id: this.generateId(),
      timestamp: data.timestamp || Date.now(),
      date: data.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(data.amount),
      currency: data.currency || this.config.baseCurrency,
      source: data.source, // product, service, affiliate, ad, subscription, other
      channel: data.channel, // stripe, paypal, crypto, bank_transfer
      description: data.description,
      customerId: data.customerId,
      productId: data.productId,
      transactionId: data.transactionId,
      metadata: data.metadata || {},
      // 转换为基础货币
      amountBase: this.convertToBase(data.amount, data.currency || this.config.baseCurrency),
      recurring: data.recurring || false,
      subscriptionId: data.subscriptionId || null
    };
    
    this.revenues.push(revenue);
    return revenue;
  }

  recordBulkRevenues(revenues) {
    return revenues.map(r => this.recordRevenue(r));
  }

  // ========== 成本记录 ==========
  
  recordExpense(data) {
    const expense = {
      id: this.generateId(),
      timestamp: data.timestamp || Date.now(),
      date: data.date || new Date().toISOString().split('T')[0],
      amount: parseFloat(data.amount),
      currency: data.currency || this.config.baseCurrency,
      category: data.category, // hosting, marketing, software, salary, tools, other
      subcategory: data.subcategory,
      description: data.description,
      vendor: data.vendor,
      receiptUrl: data.receiptUrl,
      deductible: data.deductible !== false,
      metadata: data.metadata || {},
      amountBase: this.convertToBase(data.amount, data.currency || this.config.baseCurrency)
    };
    
    this.expenses.push(expense);
    return expense;
  }

  recordBulkExpenses(expenses) {
    return expenses.map(e => this.recordExpense(e));
  }

  // ========== 订阅管理 ==========
  
  createSubscription(data) {
    const subscription = {
      id: data.id || this.generateId(),
      customerId: data.customerId,
      plan: data.plan,
      amount: parseFloat(data.amount),
      currency: data.currency || this.config.baseCurrency,
      interval: data.interval, // monthly, yearly, weekly
      status: data.status || 'active', // active, paused, cancelled, expired
      startDate: data.startDate || Date.now(),
      nextBillingDate: data.nextBillingDate,
      metadata: data.metadata || {},
      payments: []
    };
    
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  recordSubscriptionPayment(subscriptionId, paymentData) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;
    
    const payment = {
      timestamp: Date.now(),
      amount: paymentData.amount || subscription.amount,
      currency: paymentData.currency || subscription.currency,
      transactionId: paymentData.transactionId,
      status: paymentData.status || 'success'
    };
    
    subscription.payments.push(payment);
    
    // 计算下次计费日期
    const intervalDays = {
      weekly: 7,
      monthly: 30,
      yearly: 365
    }[subscription.interval] || 30;
    
    subscription.nextBillingDate = Date.now() + intervalDays * 24 * 60 * 60 * 1000;
    
    // 同时记录为收入
    this.recordRevenue({
      amount: payment.amount,
      currency: payment.currency,
      source: 'subscription',
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      recurring: true
    });
    
    return payment;
  }

  cancelSubscription(subscriptionId, reason) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;
    
    subscription.status = 'cancelled';
    subscription.cancelledAt = Date.now();
    subscription.cancelReason = reason;
    
    return subscription;
  }

  // ========== 收入报告 ==========
  
  generateRevenueReport(period = '30d') {
    const periodMs = this.parsePeriod(period);
    const cutoff = Date.now() - periodMs;
    
    const revenues = this.revenues.filter(r => r.timestamp > cutoff);
    const expenses = this.expenses.filter(e => e.timestamp > cutoff);
    
    // 基础统计
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amountBase, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amountBase, 0);
    const profit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : 0;
    
    // 按来源分析收入
    const bySource = this.aggregateBy(revenues, 'source', 'amountBase');
    
    // 按渠道分析收入
    const byChannel = this.aggregateBy(revenues, 'channel', 'amountBase');
    
    // 按类别分析成本
    const byCategory = this.aggregateBy(expenses, 'category', 'amountBase');
    
    // 每日趋势
    const dailyTrend = this.calculateDailyTrend(revenues, expenses, period);
    
    // MRR/ARR计算（基于订阅）
    const mrr = this.calculateMRR();
    const arr = mrr * 12;
    
    // 重复收入占比
    const recurringRevenue = revenues.filter(r => r.recurring).reduce((sum, r) => sum + r.amountBase, 0);
    const recurringPercentage = totalRevenue > 0 ? (recurringRevenue / totalRevenue * 100).toFixed(1) : 0;
    
    // 客户指标
    const customerMetrics = this.calculateCustomerMetrics(revenues, periodMs);
    
    return {
      period,
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        profit: profit.toFixed(2),
        margin: margin + '%',
        mrr: mrr.toFixed(2),
        arr: arr.toFixed(2),
        recurringPercentage: recurringPercentage + '%',
        transactionCount: revenues.length,
        expenseCount: expenses.length
      },
      revenue: {
        bySource,
        byChannel,
        breakdown: this.getRevenueBreakdown(revenues)
      },
      expenses: {
        byCategory,
        breakdown: this.getExpenseBreakdown(expenses)
      },
      dailyTrend,
      customerMetrics,
      comparison: this.compareToPreviousPeriod(revenues, expenses, periodMs),
      goals: this.checkGoalProgress(totalRevenue, period)
    };
  }

  aggregateBy(data, field, valueField) {
    const groups = {};
    data.forEach(item => {
      const key = item[field] || 'other';
      groups[key] = (groups[key] || 0) + (item[valueField] || 0);
    });
    
    const total = Object.values(groups).reduce((sum, v) => sum + v, 0);
    
    return Object.entries(groups)
      .map(([key, value]) => ({
        name: key,
        amount: value.toFixed(2),
        percentage: total > 0 ? ((value / total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
  }

  calculateDailyTrend(revenues, expenses, period) {
    const days = Math.ceil(this.parsePeriod(period) / (24 * 60 * 60 * 1000));
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      
      const dayRevenue = revenues
        .filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd)
        .reduce((sum, r) => sum + r.amountBase, 0);
      
      const dayExpenses = expenses
        .filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd)
        .reduce((sum, e) => sum + e.amountBase, 0);
      
      trend.push({
        date: dateStr,
        revenue: dayRevenue.toFixed(2),
        expenses: dayExpenses.toFixed(2),
        profit: (dayRevenue - dayExpenses).toFixed(2)
      });
    }
    
    return trend;
  }

  calculateMRR() {
    let mrr = 0;
    
    for (const sub of this.subscriptions.values()) {
      if (sub.status === 'active') {
        const monthlyAmount = this.convertToBase(sub.amount, sub.currency);
        
        // 转换为月金额
        const multiplier = {
          weekly: 4.33,
          monthly: 1,
          yearly: 1 / 12
        }[sub.interval] || 1;
        
        mrr += monthlyAmount * multiplier;
      }
    }
    
    return mrr;
  }

  calculateCustomerMetrics(revenues, periodMs) {
    const uniqueCustomers = new Set(revenues.map(r => r.customerId).filter(Boolean));
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amountBase, 0);
    
    // 客户生命周期价值估算
    const avgRevenuePerCustomer = uniqueCustomers.size > 0 ? totalRevenue / uniqueCustomers.size : 0;
    
    // 按客户统计收入
    const customerRevenues = {};
    revenues.forEach(r => {
      if (r.customerId) {
        customerRevenues[r.customerId] = (customerRevenues[r.customerId] || 0) + r.amountBase;
      }
    });
    
    // 按收入排序的客户
    const sortedCustomers = Object.entries(customerRevenues)
      .sort((a, b) => b[1] - a[1]);
    
    // 前10%客户贡献的收入
    const top10Percent = Math.ceil(sortedCustomers.length * 0.1);
    const topRevenue = sortedCustomers
      .slice(0, top10Percent)
      .reduce((sum, [, rev]) => sum + rev, 0);
    
    return {
      totalCustomers: uniqueCustomers.size,
      avgRevenuePerCustomer: avgRevenuePerCustomer.toFixed(2),
      topCustomerRevenue: sortedCustomers[0]?.[1].toFixed(2) || '0',
      top10PercentContribution: totalRevenue > 0 ? ((topRevenue / totalRevenue) * 100).toFixed(1) + '%' : '0%'
    };
  }

  compareToPreviousPeriod(currentRevenues, currentExpenses, periodMs) {
    const previousCutoff = Date.now() - periodMs * 2;
    const currentCutoff = Date.now() - periodMs;
    
    const previousRevenues = this.revenues.filter(
      r => r.timestamp > previousCutoff && r.timestamp <= currentCutoff
    );
    const previousExpenses = this.expenses.filter(
      e => e.timestamp > previousCutoff && e.timestamp <= currentCutoff
    );
    
    const currentRevenue = currentRevenues.reduce((sum, r) => sum + r.amountBase, 0);
    const previousRevenue = previousRevenues.reduce((sum, r) => sum + r.amountBase, 0);
    
    const currentExpense = currentExpenses.reduce((sum, e) => sum + e.amountBase, 0);
    const previousExpense = previousExpenses.reduce((sum, e) => sum + e.amountBase, 0);
    
    const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 0;
    const expenseChange = previousExpense > 0 ? ((currentExpense - previousExpense) / previousExpense * 100).toFixed(1) : 0;
    
    return {
      revenue: {
        current: currentRevenue.toFixed(2),
        previous: previousRevenue.toFixed(2),
        change: revenueChange + '%',
        trend: revenueChange > 0 ? 'up' : revenueChange < 0 ? 'down' : 'flat'
      },
      expenses: {
        current: currentExpense.toFixed(2),
        previous: previousExpense.toFixed(2),
        change: expenseChange + '%',
        trend: expenseChange > 0 ? 'up' : expenseChange < 0 ? 'down' : 'flat'
      }
    };
  }

  // ========== 目标设置与追踪 ==========
  
  setGoal(period, target) {
    const goal = {
      period,
      targetRevenue: target.revenue || 0,
      targetProfit: target.profit || 0,
      targetMargin: target.margin || 0,
      createdAt: Date.now()
    };
    
    this.goals.set(period, goal);
    return goal;
  }

  checkGoalProgress(currentRevenue, period) {
    const goal = this.goals.get(period);
    if (!goal) return null;
    
    const progress = goal.targetRevenue > 0 ? (currentRevenue / goal.targetRevenue * 100).toFixed(1) : 0;
    
    return {
      target: goal.targetRevenue,
      current: currentRevenue.toFixed(2),
      progress: progress + '%',
      status: progress >= 100 ? 'achieved' : progress >= 75 ? 'on-track' : progress >= 50 ? 'behind' : 'at-risk'
    };
  }

  // ========== 预测与规划 ==========
  
  forecastRevenue(days = 30) {
    const recentDays = 30;
    const recentRevenues = this.revenues.filter(
      r => r.timestamp > Date.now() - recentDays * 24 * 60 * 60 * 1000
    );
    
    const dailyAverage = recentRevenues.length > 0
      ? recentRevenues.reduce((sum, r) => sum + r.amountBase, 0) / recentDays
      : 0;
    
    // 考虑MRR增长趋势
    const mrrGrowth = this.calculateMRRGrowth();
    
    const forecast = [];
    let cumulativeRevenue = 0;
    
    for (let i = 1; i <= days; i++) {
      const projectedRevenue = dailyAverage * Math.pow(1 + mrrGrowth, i / 30);
      cumulativeRevenue += projectedRevenue;
      
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      forecast.push({
        date: date.toISOString().split('T')[0],
        projectedRevenue: projectedRevenue.toFixed(2),
        cumulativeRevenue: cumulativeRevenue.toFixed(2)
      });
    }
    
    return {
      dailyAverage: dailyAverage.toFixed(2),
      mrrGrowth: (mrrGrowth * 100).toFixed(2) + '%',
      forecast
    };
  }

  calculateMRRGrowth() {
    const now = Date.now();
    const currentMRR = this.calculateMRR();
    
    // 30天前的MRR
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    let pastMRR = 0;
    
    for (const sub of this.subscriptions.values()) {
      if (sub.payments.length > 0) {
        const firstPayment = sub.payments[0];
        if (firstPayment.timestamp <= thirtyDaysAgo) {
          const monthlyAmount = this.convertToBase(sub.amount, sub.currency);
          const multiplier = { weekly: 4.33, monthly: 1, yearly: 1 / 12 }[sub.interval] || 1;
          pastMRR += monthlyAmount * multiplier;
        }
      }
    }
    
    return pastMRR > 0 ? (currentMRR - pastMRR) / pastMRR : 0;
  }

  // ========== 辅助方法 ==========
  
  convertToBase(amount, currency) {
    if (currency === this.config.baseCurrency) return amount;
    
    // 简化汇率转换（实际使用时应调用汇率API）
    const rates = {
      USD: 1,
      EUR: 1.08,
      GBP: 1.27,
      CNY: 0.14,
      JPY: 0.0067
    };
    
    const rate = rates[currency] || 1;
    return amount * rate;
  }

  parsePeriod(period) {
    const units = { d: 86400000, h: 3600000, m: 60000, w: 604800000, M: 2592000000, y: 31536000000 };
    const match = period.match(/(\d+)([dhmwMy])/);
    if (match) {
      return parseInt(match[1]) * units[match[2]];
    }
    return 30 * 86400000;
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  getRevenueBreakdown(revenues) {
    return revenues.map(r => ({
      id: r.id,
      date: r.date,
      amount: r.amount,
      currency: r.currency,
      amountBase: r.amountBase.toFixed(2),
      source: r.source,
      channel: r.channel,
      description: r.description
    }));
  }

  getExpenseBreakdown(expenses) {
    return expenses.map(e => ({
      id: e.id,
      date: e.date,
      amount: e.amount,
      currency: e.currency,
      amountBase: e.amountBase.toFixed(2),
      category: e.category,
      description: e.description
    }));
  }

  // ========== 数据导出 ==========
  
  exportData(format = 'json') {
    const data = {
      config: this.config,
      revenues: this.revenues,
      expenses: this.expenses,
      subscriptions: Array.from(this.subscriptions.entries()),
      goals: Array.from(this.goals.entries()),
      exportedAt: new Date().toISOString()
    };
    
    if (format === 'csv') {
      const revenueCSV = this.revenues.map(r => 
        `${r.date},${r.amount},${r.currency},${r.source},${r.description || ''}`
      ).join('\n');
      
      const expenseCSV = this.expenses.map(e => 
        `${e.date},${e.amount},${e.currency},${e.category},${e.description || ''}`
      ).join('\n');
      
      return `REVENUES\nDate,Amount,Currency,Source,Description\n${revenueCSV}\n\nEXPENSES\nDate,Amount,Currency,Category,Description\n${expenseCSV}`;
    }
    
    return JSON.stringify(data, null, 2);
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RevenueTracker;
}

if (typeof window !== 'undefined') {
  window.RevenueTracker = RevenueTracker;
}
