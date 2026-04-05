// Direct Crypto Payment Handler
// 处理直接加密货币支付 (BTC + ETH)

class DirectCryptoPayment {
  constructor() {
    this.btcAddress = process.env.BTC_ADDRESS;
    this.ethAddress = process.env.ETH_ADDRESS;
    
    // 当前汇率 (应通过API实时获取)
    this.rates = {
      BTC: 65000,  // USD per BTC
      ETH: 3200    // USD per ETH
    };
  }

  // 生成支付信息
  generatePaymentInfo(packageType, coin = 'btc') {
    const packages = {
      starter: { usd: 10, credits: 100 },
      pro: { usd: 85, credits: 1000 },
      enterprise: { usd: 750, credits: 10000 }
    };

    const pkg = packages[packageType];
    if (!pkg) throw new Error('Invalid package');

    if (coin === 'btc') {
      const btcAmount = (pkg.usd / this.rates.BTC).toFixed(8);
      return {
        package: packageType,
        usd: pkg.usd,
        credits: pkg.credits,
        coin: 'BTC',
        address: this.btcAddress,
        amount: btcAmount,
        uri: `bitcoin:${this.btcAddress}?amount=${btcAmount}`,
        network: 'Bitcoin Network',
        confirmations: 3
      };
    } else {
      const ethAmount = (pkg.usd / this.rates.ETH).toFixed(6);
      return {
        package: packageType,
        usd: pkg.usd,
        credits: pkg.credits,
        coin: 'ETH',
        address: this.ethAddress,
        amount: ethAmount,
        uri: `ethereum:${this.ethAddress}?value=${ethAmount}`,
        network: 'ERC-20 Network',
        confirmations: 12
      };
    }
  }

  // 获取所有支持的币种
  getSupportedCoins() {
    return [
      { 
        symbol: 'BTC', 
        name: 'Bitcoin', 
        address: this.btcAddress,
        rate: this.rates.BTC
      },
      { 
        symbol: 'ETH', 
        name: 'Ethereum', 
        address: this.ethAddress,
        rate: this.rates.ETH
      }
    ];
  }

  // 验证支付 (通过区块链API)
  async verifyPayment(txid, coin) {
    // 这里应该调用区块链API (如BlockCypher, Etherscan)
    // 简化版：返回待验证状态
    
    const confirmations = coin === 'btc' ? 3 : 12;
    
    return {
      txid,
      coin,
      status: 'pending', // pending, confirmed, failed
      confirmations: 0,
      requiredConfirmations: confirmations,
      estimatedTime: coin === 'btc' ? '10-30 minutes' : '2-5 minutes'
    };
  }

  // Webhook处理 (当收到支付时)
  async handleIncomingPayment(address, amount, txid, coin) {
    // 匹配地址和金额到订单
    const order = await this.findOrderByAddress(address, coin);
    
    if (!order) {
      console.log(`⚠️ ${coin} payment received but no matching order:`, address);
      return { matched: false };
    }

    // 验证金额是否足够
    const rate = this.rates[coin.toUpperCase()];
    const expectedAmount = coin === 'btc' 
      ? (order.usd / rate).toFixed(8)
      : (order.usd / rate).toFixed(6);
    
    const receivedAmount = parseFloat(amount).toFixed(coin === 'btc' ? 8 : 6);
    
    if (receivedAmount >= expectedAmount) {
      await this.fulfillOrder(order, txid, coin);
      return { matched: true, fulfilled: true };
    } else {
      return { 
        matched: true, 
        fulfilled: false, 
        reason: 'Insufficient amount',
        expected: expectedAmount,
        received: receivedAmount
      };
    }
  }

  async findOrderByAddress(address, coin) {
    // 从数据库查询 (简化版)
    // 实际实现需要数据库支持
    return null;
  }

  async fulfillOrder(order, txid, coin) {
    console.log(`✅ ${coin.toUpperCase()} payment confirmed!`);
    console.log(`   Order: ${order.package}`);
    console.log(`   Credits: ${order.credits}`);
    console.log(`   TxID: ${txid}`);
    
    // TODO: Add credits to user account
    return { success: true };
  }
}

module.exports = DirectCryptoPayment;