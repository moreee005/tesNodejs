const { TransactionType } = require('@prisma/client');
const walletRepository = require('./wallet.repository');
const { v4: uuidv4 } = require('uuid');
const transactionRepository = require('../Transaction/transaction.repository');

class TransactionService {
  constructor() {
    this.walletRepository = walletRepository;
    this.transactionRepository = transactionRepository;
  }

  generateTransactionNumber() {
    return `${uuidv4().split('-').join('').substring(0, 12).toUpperCase()}`;
  }

  async topupWallet(userId, amount) {
    // Validasi input
    if (!userId || !amount || amount <= 0) {
      throw new Error('Invalid user ID or amount');
    }

    // Cek user dan wallet
    const user = await this.walletRepository.findUserWithWallet(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let walletId;
    
    // Jika user belum punya wallet, buat wallet baru
    if (!user.wallet) {
      const newWallet = await walletRepository.createWallet(userId);
      walletId = newWallet.id;
    } else {
      walletId = user.wallet.id;
    }
    
    var generateId = this.generateTransactionNumber();

    // Lakukan topup
    const updatedWallet = await this.walletRepository.updateWalletBalance(walletId, amount);
    
    
    const adminFee = 1000; // You can set this dynamically if needed
  const totalAmount = Number(amount) + Number(adminFee || 0);
    // Catat transaksi
    const transaction = await this.walletRepository.createWalletTransaction({
      walletId: walletId,
      amount,
      referenceId: `TOPUP-`+generateId,
      description: `Top up wallet sebesar ${amount}`,
      transactionType: 'top_up'
      // transactionType dan status tidak perlu dikirim karena sudah dihandle oleh repository
    });

    const transactionHistory = await this.transactionRepository.createTransaction({
    userId: userId, // pastikan ini valid
    productId: 1,
    transactionNumber: transaction.referenceId,
    amount: amount,
    adminFee: adminFee,
    totalAmount: totalAmount,
    customerNumber: userId.toString(),
    status: 'success',
    paymentMethod: 'bank_transfer'
});

    return {
      newBalance: updatedWallet.balance,
      transactionId: transaction.id,
      referenceId: transaction.referenceId
    };
  }

  async getBalance(userId) {
          const user = await this.walletRepository.findUserWithWallet(userId);
          return user.wallet.balance;
  }


}

module.exports = new TransactionService();