const transactionService = require('./wallet.service');
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../auth/service');


router.post('/topup', verifyToken, async (req, res) => {
  try {
      const userId = req.user.id;
      const { amount } = req.body;

      if (!amount) {
        return res.status(400).json({
          success: false,
          message: 'Amount is required'
        });
      }

      const result = await transactionService.topupWallet(userId, parseFloat(amount));

      res.json({
        success: true,
        message: 'Topup successful',
        data: {
          new_balance: result.newBalance,
          transaction_id: result.transactionId,
          reference_id: result.referenceId
        }
      });
    } catch (error) {
      console.error('Topup error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
});

router.get('/balance', verifyToken, async (req, res) => {
  try{
          const userId = req.user.id;
      const result = await transactionService.getBalance(userId);
res.json({
        success: true,
        message: 'Get Balance berhasil',
        data: result
      });
  }catch (error) {
      console.error('Get Balance error:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
});

module.exports = router;
