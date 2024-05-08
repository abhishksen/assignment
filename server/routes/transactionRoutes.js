import express from 'express';
import { getAllTransactions, getBarChartData, getPieChartData, getTransactionStatistics, initializeDatabase } from '../controllers/transactionController.js';

const router = express.Router();

// Initialize the database
router.get('/init', initializeDatabase);

// get all transactions
router.get('/', getAllTransactions);

// Get transaction statistics
router.get('/statistics', getTransactionStatistics);

// Get bar chart data
router.get('/bar-chart', getBarChartData);

// get pie chart data
router.get('/pie-chart', getPieChartData);

// Combined API
router.get('/combined-data', async (req, res) => {
    try {
        // Fetch data from all three APIs concurrently
        const [statistics, barChartData, pieChartData] = await Promise.all([
            fetch(`${process.env.Base_URL}/statistics`).then(res => res.json()),
            fetch(`${process.env.Base_URL}/bar-chart`).then(res => res.json()),
            fetch(`${process.env.Base_URL}/pie-chart`).then(res => res.json())
        ]);

        // Combine the responses
        const combinedData = {
            statistics,
            barChartData,
            pieChartData
        };

        res.status(200).json(combinedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;