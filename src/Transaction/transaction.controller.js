const transactionService = require('./transaction.service');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/service');

router.post('/transactions', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, customerNumber, paymentMethod } = req.body;

    // Basic validation
    if (!productId || !customerNumber || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: productId, customerNumber, or paymentMethod'
      });
    }

    if (!['wallet', 'bank_transfer', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method. Must be one of: wallet, bank_transfer, card'
      });
    }

    const transactionData = {
      userId,
      productId,
      customerNumber,
      paymentMethod
    };

    const transaction = await transactionService.createTransaction(transactionData);

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    
    const statusCode = error.message.includes('not found') || 
                      error.message.includes('Missing') ||
                      error.message.includes('Invalid') ||
                      error.message.includes('Insufficient') ||
                      error.message.includes('inactive') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create transaction'
    });
  }
});

router.get('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user.id;

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    const transaction = await transactionService.getTransactionDetails(transactionId);

    // Verify ownership
    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get transaction'
    });
  }
});

router.patch('/transactions/:id/status', verifyToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user.id;

    if (isNaN(transactionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      });
    }

    if (!['pending', 'processing', 'success', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, processing, success, failed'
      });
    }

    // First get the transaction to verify ownership
    const transaction = await transactionService.getTransactionDetails(transactionId);
    
    if (transaction.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this transaction'
      });
    }

    const updatedTransaction = await transactionService.updateTransactionStatus(transactionId, status);

    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update transaction status'
    });
  }
});

router.get('/transaction/history', verifyToken, async (req, res) => {
  try {
    
    const userId = req.user.id;

    const transaction = await transactionService.getUserTransactions(userId);

    res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction
    });
  }catch(error){
     console.error('Update transaction status error:', error);
    
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update transaction status'
    });
  }
  
})

module.exports = router;