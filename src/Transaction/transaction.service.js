const transactionRepository = require('./transaction.repository');
const walletRepository = require('../wallet/wallet.repository');
const { v4: uuidv4 } = require('uuid');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TransactionService {
    constructor() {
        this.walletRepository = walletRepository;
      }
  async createTransaction(transactionData) {
          const transactionNumber = `TRX-${uuidv4().split('-').join('').substring(0, 12).toUpperCase()}`;
    
    // Validate required fields
    if (!transactionData.userId || !transactionData.productId) {
      throw new Error('Missing required fields: userId or productId');
    }


    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: transactionData.userId }
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Verify product exists and is active, and get its price
    const product = await prisma.product.findUnique({
  where: { id: transactionData.productId },
  select: {
    id: true,
    price: true,
    isActive: true,
    service: {
      select: {
        isActive: true
      }
    }
  }
});

    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (!product.isActive) {
      throw new Error('Product is inactive');
    }

    // Verify service is active
    if (!product.service.isActive) {
      throw new Error('Service is inactive');
    }

    // Get the product price as the transaction amount
    const amount = product.price;
    const adminFee = 1000; // You can set this dynamically if needed
  const totalAmount = Number(amount) + Number(adminFee || 0);

const wallet = await prisma.wallet.findUnique({
        where: { userId: transactionData.userId }
      });

    // If payment method is wallet, check balance
    if (transactionData.paymentMethod === 'wallet') {
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      if (Number(wallet.balance) < totalAmount) {
    throw new Error(`Insufficient wallet balance. Current balance: ${wallet.balance}, Required: ${totalAmount}`);
  }
    }

    // Create the transaction
    const transaction = await transactionRepository.createTransaction({
      ...transactionData,
      amount,
      adminFee,
      totalAmount,
      transactionNumber
    });

     if (transactionData.paymentMethod === 'wallet') {
        // Kurangi saldo wallet
        await walletRepository.updateWalletBalance(
          wallet.id,
          -totalAmount // Menggunakan nilai negatif untuk mengurangi
        );

        // Catat transaksi wallet
        await walletRepository.createWalletTransaction({
          walletId: wallet.id,
          amount: totalAmount,
          transactionType: 'payment', // sesuai enum di schema
          status: 'success',
          referenceId: transaction.transactionNumber,
          description: `Pembayaran untuk transaksi ${transaction.transactionNumber}`
        });
    }

    return transaction;
}

  async getTransactionDetails(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    const transaction = await transactionRepository.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  async getUserTransactions(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
     const transaction = await transactionRepository.transactionHistory(userId);
    return transaction;
  }

  async updateTransactionStatus(transactionId, status) {
    if (!transactionId || !status) {
      throw new Error('Transaction ID and status are required');
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'success', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid transaction status');
    }

    const transaction = await transactionRepository.getTransactionById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If status is being updated to 'success' and payment method is wallet, deduct balance
    if (status === 'success' && transaction.paymentMethod === 'wallet' && transaction.status !== 'success') {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: transaction.userId }
      });

      if (wallet) {
        await prisma.wallet.update({
          where: { userId: transaction.userId },
          data: {
            balance: wallet.balance - transaction.totalAmount
          }
        });

        // Record wallet transaction
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            amount: transaction.totalAmount,
            transactionType: 'payment',
            status: 'success',
            description: `Payment for transaction ${transaction.transactionNumber}`
          }
        });
      }
    }

    return await transactionRepository.updateTransactionStatus(transactionId, status);
  }
}

module.exports = new TransactionService();