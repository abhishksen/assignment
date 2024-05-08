import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart } from '@mui/x-charts';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const TransactionsBarChart = () => {
    const [selectedMonth, setSelectedMonth] = useState(3); // Default to March
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        fetchBarChartData();
    }, [selectedMonth]);

    const fetchBarChartData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/transactions/bar-chart?month=${selectedMonth}`);
            const data = response.data;
            setChartData(data);
        } catch (error) {
            console.error('Error fetching bar chart data:', error);
        }
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const formatChartData = (data) => {
        const formattedData = data.map(item => ({
            range: `${item.min}-${item.max}`,
            count: item.count
        }));
        return formattedData;
    };

    return (
        <>
            <FormControl>
                <InputLabel id="select-month-label">Select Month</InputLabel>
                <Select
                    labelId="select-month-label"
                    id="select-month"
                    value={selectedMonth}
                    onChange={handleMonthChange}
                >
                    <MenuItem value={1}>January</MenuItem>
                    <MenuItem value={2}>February</MenuItem>
                    <MenuItem value={3}>March</MenuItem>
                    <MenuItem value={4}>April</MenuItem>
                    <MenuItem value={5}>May</MenuItem>
                    <MenuItem value={6}>June</MenuItem>
                    <MenuItem value={7}>July</MenuItem>
                    <MenuItem value={8}>August</MenuItem>
                    <MenuItem value={9}>September</MenuItem>
                    <MenuItem value={10}>October</MenuItem>
                    <MenuItem value={11}>November</MenuItem>
                    <MenuItem value={12}>December</MenuItem>

                </Select>
            </FormControl>
            {chartData.length > 0 &&
                <BarChart
                    data={formatChartData(chartData)}
                    xField="range"
                    yField="count"
                    height={300}
                    xAxis={{ label: { text: 'Price Range' } }}
                    yAxis={{ label: { text: 'Number of Items' } }}
                />
            }
        </>
    );
};

export default TransactionsBarChart;
