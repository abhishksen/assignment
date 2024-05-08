import { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Box } from '@mui/material';

const TransactionsStatistics = () => {
    const [selectedMonth, setSelectedMonth] = useState(3); // Default to March
    const [statistics, setStatistics] = useState({});

    useEffect(() => {
        fetchTransactionStatistics();
    }, [selectedMonth]);

    const fetchTransactionStatistics = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/transactions/statistics?month=${selectedMonth}`);
            const data = response.data;
            setStatistics(data);
        } catch (error) {
            console.error('Error fetching transaction statistics:', error);
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    return (
        <>
            <Typography variant="h5" gutterBottom>Transactions Statistics</Typography>
            <Box display="flex" alignItems="center" marginBottom="1rem">
                <Typography variant="subtitle1" marginRight="0.5rem">Select Month:</Typography>
                <Select
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    size="small"
                >
                    {[...Array(12).keys()].map(month => (
                        <MenuItem key={month + 1} value={month + 1}>{new Date(2000, month).toLocaleDateString('en', { month: 'long' })}</MenuItem>
                    ))}
                </Select>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Statistic</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Total Amount of Sale:</TableCell>
                            <TableCell>{statistics.totalSaleAmount}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Total Sold Items:</TableCell>
                            <TableCell>{statistics.totalSoldItems}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Total Not Sold Items:</TableCell>
                            <TableCell>{statistics.totalNotSoldItems}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export default TransactionsStatistics;
