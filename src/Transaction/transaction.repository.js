const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class TransactionRepository {
  async createTransaction(transactionData) {
    try {
            
      
      return await prisma.transaction.create({
        data: {
          ...transactionData,
                    status: 'success' // Ensure status is set to pending by default
        }
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error('Failed to create transaction');
    }
  }

  async getTransactionById(id) {
    try {
      return await prisma.transaction.findUnique({
        where: { id },
        include: {
          user: true,
          product: {
            include: {
              service: {
                include: {
                  category: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error('Failed to fetch transaction');
    }
  }

  async getTransactionsByUserId(userId) {
    try {
      return await prisma.transaction.findMany({
        where: { userId },
            select: {
                transactionNumber: true,
                paymentMethod: true,
                product: {
                    select: {
                        name: true
                    }
                },
                totalAmount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
      });
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw new Error('Failed to fetch user transactions');
    }
  }

  async updateTransactionStatus(id, status) {
    try {
      return await prisma.transaction.update({
        where: { id },
        data: { 
          status,
          updatedAt: new Date() 
        }
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw new Error('Failed to update transaction status');
    }
  }

  async transactionHistory(userId) {
  return await prisma.$queryRaw`
    SELECT 
      t.transaction_number,
      w.transaction_type,
      w.description,
      t.total_amount,
      t.created_at
    FROM 
      transactions t
    JOIN 
      users u ON t.user_id = u.id
    JOIN 
      wallet_transactions w ON t.transaction_number = w.reference_id
    WHERE
      t.user_id = ${userId}
    ORDER BY 
      t.id DESC
  `;
}
}


module.exports = new TransactionRepository();