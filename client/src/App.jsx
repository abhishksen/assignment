import './App.css';
import { Grid } from '@mui/material';
import Transactions from './components/Transactions';
import TransactionsBarChart from './components/TransactionsBarChart';
import TransactionsStatistics from './components/TransactionsStatistics';

function App() {
  return (
    <Grid container spacing={3}>
      {/* Transactions */}
      <Grid item xs={12}>
        <Transactions />
      </Grid>

      {/* TransactionsStatistics and TransactionsBarChart */}
      <Grid item xs={12} md={6}>
        <TransactionsStatistics />
      </Grid>
      <Grid item xs={12} md={6}>
        <TransactionsBarChart />
      </Grid>
    </Grid>
  );
}

export default App;
