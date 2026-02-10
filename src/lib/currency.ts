export function formatCurrency(value: number, currency?: { symbol: string; id: string }) {
		if (!currency) return value.toLocaleString('de-DE');

		const formattedNumber = value.toLocaleString('de-DE', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});

		if (['USD', 'GBP'].includes(currency.id)) {
			return `${currency.symbol}${formattedNumber}`;
		}

		return `${formattedNumber} ${currency.symbol}`;
	}