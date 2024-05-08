import axios from 'axios';
import Transaction from '../models/Transaction.js';

// API to initialize the database
export const initializeDatabase = async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactionsData = response.data;

        // Clear existing data
        await Transaction.deleteMany({});

        // Map the fetched data to the Transaction model schema
        const transactions = transactionsData.map(item => ({
            id: item.id,
            product: {
                title: item.title,
                price: item.price,
                description: item.description,
                category: item.category,
                image: item.image,
            },
            sold: item.sold,
            dateOfSale: new Date(item.dateOfSale), // Ensure date is parsed correctly
        }));

        // Insert new data
        await Transaction.insertMany(transactions);

        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// API to get all transactions
export const getAllTransactions = async (req, res) => {
    try {
        const { month, page = 1, limit = 10, search = '' } = req.query;
        const currentYear = new Date().getFullYear();

        const isSearchNumeric = !isNaN(parseFloat(search)) && isFinite(search);

        const query = {
            $or: [
                {
                    dateOfSale: {
                        $gte: new Date(currentYear, month - 1, 1),
                        $lt: new Date(currentYear, month, 1),
                    },
                },
                { dateOfSale: { $exists: false } },
            ],
            $or: [
                { 'product.title': { $regex: search, $options: 'i' } },
                { 'product.description': { $regex: search, $options: 'i' } },
                ...(isSearchNumeric ? [{ 'product.price': parseFloat(search) }] : []),
            ],
        };

        const skip = (page - 1) * limit;

        const transactions = await Transaction.find(query)
            .skip(skip)
            .limit(limit);

        const totalCount = await Transaction.countDocuments(query);

        res.status(200).json({
            data: transactions,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalCount,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// API to get transaction statistics
export const getTransactionStatistics = async (req, res) => {
    try {
        const { month } = req.query;
        const currentYear = new Date().getFullYear();

        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0); // Get the last day of the month

        console.log(startDate, endDate);

        const allTransactions = await Transaction.find({
            dateOfSale: {
                $gte: new Date(currentYear, 0, 1), // January 1st of the current year
                $lte: endDate, // Last day of the specified month
            }
        });

        console.log(allTransactions);

        const soldItems = allTransactions.filter(item => item.sold && item.dateOfSale >= startDate);

        console.log(soldItems);

        const notSoldItems = allTransactions.filter(item => !item.sold && item.dateOfSale >= startDate);

        console.log(notSoldItems);

        const totalSaleAmount = soldItems.reduce((total, item) => total + item.product.price, 0);
        const totalSoldItems = soldItems.length;
        const totalNotSoldItems = notSoldItems.length;

        console.log(totalSaleAmount, totalSoldItems, totalNotSoldItems);

        const statistics = {
            totalSaleAmount,
            totalSoldItems,
            totalNotSoldItems,
        };

        console.log(statistics);

        res.status(200).json(statistics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller for getting bar chart data for the selected month
export const getBarChartData = async (req, res) => {
    try {
        const { month } = req.query;

        // Validate the month parameter
        const parsedMonth = parseInt(month, 10);
        if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
            return res.status(400).json({ error: 'Invalid month parameter' });
        }

        const startDate = new Date(new Date().getFullYear(), parsedMonth - 1, 1);
        const endDate = new Date(new Date().getFullYear(), parsedMonth, 1);

        // Aggregate to get bar chart data
        const barChartData = await Transaction.aggregate([
            {
                $match: {
                    dateOfSale: {
                        $gte: startDate,
                        $lt: endDate,
                    },
                    'product.price': { $exists: true } // Consider only transactions with product prices
                },
            },
            {
                $group: {
                    _id: null,
                    count0_100: { $sum: { $cond: [{ $lte: ['$product.price', 100] }, 1, 0] } },
                    count101_200: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 100] }, { $lte: ['$product.price', 200] }] }, 1, 0] } },
                    count201_300: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 200] }, { $lte: ['$product.price', 300] }] }, 1, 0] } },
                    count301_400: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 300] }, { $lte: ['$product.price', 400] }] }, 1, 0] } },
                    count401_500: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 400] }, { $lte: ['$product.price', 500] }] }, 1, 0] } },
                    count501_600: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 500] }, { $lte: ['$product.price', 600] }] }, 1, 0] } },
                    count601_700: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 600] }, { $lte: ['$product.price', 700] }] }, 1, 0] } },
                    count701_800: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 700] }, { $lte: ['$product.price', 800] }] }, 1, 0] } },
                    count801_900: { $sum: { $cond: [{ $and: [{ $gt: ['$product.price', 800] }, { $lte: ['$product.price', 900] }] }, 1, 0] } },
                    count901_above: { $sum: { $cond: [{ $gt: ['$product.price', 900] }, 1, 0] } }
                }
            }
        ]);

        console.log(barChartData);

        // If no data found, return 0 for all counts
        const barChartDataResult = barChartData.length > 0 ? barChartData[0] : {
            count0_100: 0,
            count101_200: 0,
            count201_300: 0,
            count301_400: 0,
            count401_500: 0,
            count501_600: 0,
            count601_700: 0,
            count701_800: 0,
            count801_900: 0,
            count901_above: 0
        };

        // Construct the response object
        const response = {
            '0-100': barChartDataResult.count0_100,
            '101-200': barChartDataResult.count101_200,
            '201-300': barChartDataResult.count201_300,
            '301-400': barChartDataResult.count301_400,
            '401-500': barChartDataResult.count401_500,
            '501-600': barChartDataResult.count501_600,
            '601-700': barChartDataResult.count601_700,
            '701-800': barChartDataResult.count701_800,
            '801-900': barChartDataResult.count801_900,
            '901-above': barChartDataResult.count901_above
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Controller for getting pie chart data for the selected month
export const getPieChartData = async (req, res) => {
    try {
        const { month } = req.query;
        const currentYear = new Date().getFullYear();

        const startDate = new Date(currentYear, month - 1, 1);
        const endDate = new Date(currentYear, month, 0); // Get the last day of the month

        const allTransactions = await Transaction.find({
            dateOfSale: {
                $gte: new Date(currentYear, 0, 1), // January 1st of the current year
                $lte: endDate, // Last day of the specified month
            },
            // Filter out documents with null dateOfSale
            dateOfSale: { $ne: null }
        });

        const categoryCount = {};

        allTransactions.forEach(transaction => {
            const category = transaction.product.category;
            if (!categoryCount[category]) {
                categoryCount[category] = 1;
            } else {
                categoryCount[category]++;
            }
        });

        res.status(200).json(categoryCount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
