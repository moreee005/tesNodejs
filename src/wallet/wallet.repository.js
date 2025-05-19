const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class WalletRepository {
  async findUserWithWallet(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true }
    });
  }

  async findUserWithWalletMany(userId) {
    return await prisma.user.findMany({
      where: { id: userId },
      include: { wallet: true }
    });
  }

  async createWallet(userId) {
    return await prisma.wallet.create({
      data: {
        userId,
        balance: 0.00
      }
    });
  }


  async updateWalletBalance(walletId, amount) {
    return await prisma.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: amount } },
      select: { balance: true }
    });
  }

  async createWalletTransaction(data) {
    return await prisma.walletTransaction.create({
      data: {
        walletId: data.walletId,
        amount: data.amount,
        transactionType: data.transactionType, // Sesuai enum di schema (lowercase dengan underscore)
        status: 'success', // Sesuai enum TransactionStatus
        referenceId: data.referenceId,
        description: data.description
      }
    });
  }
}

module.exports = new WalletRepository();