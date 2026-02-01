import { sequence } from '@sveltejs/kit/hooks';
import cron from 'node-cron';
import { handle as authHandle, proxyAuthHandle } from '$lib/server/auth';
import { building } from '$app/environment';
import { ensureBaseCurrencies, ensureAssetCategories, ensureCurrencyConversions, updateMarketData } from '$lib/server/db/actions';

// Combine Auth.js handle with proxy auth middleware
export const handle = sequence(authHandle, proxyAuthHandle);

if (!building) {
  ensureBaseCurrencies().catch((err) => {
    console.error('Error ensuring base currencies:', err);
  });
  ensureAssetCategories().catch((err) => {
    console.error('Error ensuring asset categories:', err);
  });
  ensureCurrencyConversions().catch((err) => {
    console.error('Error ensuring currency conversions:', err);
  });
  cron.schedule('*/15 * * * *', async () => {
    console.log('Fetching market data...');
    updateMarketData().then(() => {
      console.log('Market data updated successfully.');
    }).catch((err) => {
      console.error('Error updating market data:', err);
    })
  }
  );
}