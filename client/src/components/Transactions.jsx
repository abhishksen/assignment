import { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Paper, Select, MenuItem, TextField, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, CircularProgress } from '@mui/material';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(3); // Default to March
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [selectedMonth, searchText, page]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/transactions?month=${selectedMonth}&page=${page + 1}&search=${searchText}`);
            const { data, totalPages } = response.data;
            setTransactions(data);
            setTotalPages(totalPages);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonthChange = (e) => {
        const selectedMonthValue = parseInt(e.target.value);
        setSelectedMonth(selectedMonthValue);
        setPage(0); // Reset page when changing the month
    };

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        setPage(0); // Reset page when changing the search text
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom>Transactions</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>Select Month:</Typography>
                        <Select value={selectedMonth} onChange={handleMonthChange} fullWidth>
                            {[...Array(12).keys()].map(month => (
                                <MenuItem key={month + 1} value={month + 1}>{new Date(2000, month).toLocaleDateString('en', { month: 'long' })}</MenuItem>
                            ))}
                        </Select>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>Search Transaction:</Typography>
                        <TextField value={searchText} onChange={handleSearch} fullWidth />
                    </Paper>
                </Grid>
            </Grid>
            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Date of Sale</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : (
                            transactions.map(transaction => (
                                <TableRow key={transaction._id}>
                                    <TableCell>{transaction.product.title}</TableCell>
                                    <TableCell>{transaction.product.description}</TableCell>
                                    <TableCell>{transaction.product.price}</TableCell>
                                    <TableCell>{new Date(transaction.dateOfSale).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={totalPages * 10} // Assuming 10 rows per page
                rowsPerPage={10}
                page={page}
                onPageChange={handleChangePage}
            />
        </Container>
    );
};

export default Transactions;
