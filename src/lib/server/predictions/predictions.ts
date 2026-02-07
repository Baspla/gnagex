import { eq,and, inArray } from 'drizzle-orm';
import { db } from '../db/index'
import * as schema from '../db/schema'
/*
id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    type: text('type', { enum: ['binary_text', 'price_target'] }).notNull(),
    status: text('status', {
        enum: ['pending', 'resolved', 'cancelled']
    }).notNull().default('pending'),
    result: text('result', {
        enum: ['yes', 'no', 'null'] // null is for unresolved/push
    }).default('null'),
    title: text('title').notNull(),

    yesPool: real('yes_pool').notNull(),
    noPool: real('no_pool').notNull(),

    // This is the currency in which shares are bought/sold NOT of the tracked asset (if any)
    currencyId: text('currency_id')
        .notNull()
        .references(() => currency.id),

    // Text Prediction fields
    text: text('text'),
    deciderId: text('decider_id').references(() => user.id, { onDelete: 'set null' }),

    // Asset Prediction fields
    assetId: text('asset_id').references(() => asset.id),
    targetPrice: real('target_price'),
    direction: text('direction', { enum: ['above', 'below'] }),

    endDate: integer('end_date', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .$defaultFn(() => new Date())
        .$onUpdate(() => new Date())
        */

export function createManualPredictionMarket(title: string, text: string, endDate: Date, deciderId: string, poolSize: number, currencyId: string) {
    // Create the market and add an initial history entry for the creation event
    return db.transaction((tx) => {
        const marketId = crypto.randomUUID()
        tx.insert(schema.predictionMarket).values({
            id: marketId,
            type: 'binary_text',
            title,
            text,
            endDate,
            deciderId,
            yesPool: poolSize / 2,
            noPool: poolSize / 2,
            currencyId
        }).run();
        tx.insert(schema.predictionMarketHistory).values({
            id: crypto.randomUUID(),
            predictionMarketId: marketId,
            yesPool: poolSize / 2,
            noPool: poolSize / 2,
            date: new Date(),
            probability: getProbabilityForMarket(poolSize / 2, poolSize / 2, 'yes') // This is always 0.5 at market creation, but we calculate it anyway for consistency and in case we want to change the initial pool distribution in the future
        }).run();
        return marketId
    });
}

export function buyPredictionMarketShares(marketId: string, portfolioId: string, amount: number, side: 'yes' | 'no') {
    // We need to assert that the market exists, is still open, and that the user has enough balance in the specified currency to buy the shares. Then we calculate how many shares the user gets for their money based on the current pool sizes, update the pools, and create a transaction record for the purchase. Finally, we add a new history entry with the updated pools and probability.
    return db.transaction((tx) => {
        const market = tx.select().from(schema.predictionMarket).where(eq(schema.predictionMarket.id, marketId)).get()
        if (!market) {
            throw new Error('Market not found')
        }
        if (market.status !== "pending") {
            throw new Error('Market is not open for trading')
        }
        const portfolio = tx.select().from(schema.portfolio).where(eq(schema.portfolio.id, portfolioId)).get()
        if (!portfolio) {
            throw new Error('Portfolio not found')
        }
        const portfolioCurrency = tx.select().from(schema.portfolioCurrency).where(and(eq(schema.portfolioCurrency.portfolioId, portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).get()
        if (!portfolioCurrency) {
            throw new Error('Portfolio does not have the required currency')
        }
        if (portfolioCurrency.amount < amount) {
            throw new Error('Insufficient balance in portfolio currency')
        }
        const { userShares, yesPoolAfter, noPoolAfter } = calculateBoughtSharesForAmount(market.yesPool, market.noPool, amount, side)
        // Update market pools
        tx.update(schema.predictionMarket).set({
            yesPool: yesPoolAfter,
            noPool: noPoolAfter
        }).where(eq(schema.predictionMarket.id, marketId)).run()
        // Insert user shares
        const shareId = crypto.randomUUID()
        tx.insert(schema.predictionMarketShare).values({
            id: shareId,
            predictionMarketId: marketId,
            portfolioId,
            choice: side,
            amount: userShares,
            currencyId: market.currencyId,
            createdAt: new Date()
        }).run();
        // Update portfolio currency balance
        tx.update(schema.portfolioCurrency).set({
            amount: portfolioCurrency.amount - amount
        }).where(and(eq(schema.portfolioCurrency.portfolioId, portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).run()
        // Create transaction record
        tx.insert(schema.transaction).values({
            id: crypto.randomUUID(),
            portfolioId,
            type: 'prediction_cost',
            totalValue: -amount,
            amountOfUnits: userShares,
            pricePerUnit: amount / userShares,
            fee: 0,
            predictionMarketShareId: shareId,
            notes: `Purchased ${userShares.toFixed(4)} ${side} shares in prediction market "${market.title}"`,
            fromCurrencyId: market.currencyId,
            toCurrencyId: market.currencyId,
            executedAt: new Date(),
        }).run();
        // Add history entry
        tx.insert(schema.predictionMarketHistory).values({
            id: crypto.randomUUID(),
            predictionMarketId: marketId,
            yesPool: yesPoolAfter,
            noPool: noPoolAfter,
            date: new Date(),
            probability: getProbabilityForMarket(yesPoolAfter, noPoolAfter, 'yes')
        }).run();
        return { shareId, userShares }
    });
}

export function sellPredictionMarketShares(marketId: string, portfolioId: string, shareId: string) {
    // We need to assert that the market exists, is still open, and that the user owns the shares they want to sell. Then we calculate how much money the user gets for selling their shares based on the current pool sizes, update the pools, and create a transaction record for the sale. Finally, we add a new history entry with the updated pools and probability.
    return db.transaction((tx) => {
        const market = tx.select().from(schema.predictionMarket).where(eq(schema.predictionMarket.id, marketId)).get()
        if (!market) {
            throw new Error('Market not found')
        }
        if (market.status !== "pending") {
            throw new Error('Market is not open for trading')
        }
        const share = tx.select().from(schema.predictionMarketShare).where(and(eq(schema.predictionMarketShare.id, shareId), eq(schema.predictionMarketShare.portfolioId, portfolioId))).get()
        if (!share) {
            throw new Error('Shares not found for this portfolio')
        }
        const { salePrice, yesPoolAfter, noPoolAfter } = calculateSaleAmountForShares(market.yesPool, market.noPool, share.amount, share.choice)
        // Update market pools
        tx.update(schema.predictionMarket).set({
            yesPool: yesPoolAfter,
            noPool: noPoolAfter
        }).where(eq(schema.predictionMarket.id, marketId)).run()
        // Delete user shares
        tx.delete(schema.predictionMarketShare).where(eq(schema.predictionMarketShare.id, shareId)).run()
        // Update portfolio currency balance
        const portfolioCurrency = tx.select().from(schema.portfolioCurrency).where(and(eq(schema.portfolioCurrency.portfolioId, portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).get()
        if (!portfolioCurrency) {
            throw new Error('Portfolio does not have the required currency')
        }
        tx.update(schema.portfolioCurrency).set({
            amount: portfolioCurrency.amount + salePrice
        }).where(and(eq(schema.portfolioCurrency.portfolioId, portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).run()
        // Create transaction record
        tx.insert(schema.transaction).values({
            id: crypto.randomUUID(),
            portfolioId,
            type: 'prediction_sale',
            totalValue: salePrice,
            amountOfUnits: share.amount,
            pricePerUnit: salePrice / share.amount,
            fee: 0,
            predictionMarketShareId: shareId,
            notes: `Sold ${share.amount.toFixed(4)} ${share.choice} shares in prediction market "${market.title}"`,
            fromCurrencyId: market.currencyId,
            toCurrencyId: market.currencyId,
            executedAt: new Date(),
        }).run();
        // Add history entry
        tx.insert(schema.predictionMarketHistory).values({
            id: crypto.randomUUID(),
            predictionMarketId: marketId,
            yesPool: yesPoolAfter,
            noPool: noPoolAfter,
            date: new Date(),
            probability: getProbabilityForMarket(yesPoolAfter, noPoolAfter, 'yes')
        }).run();
        return { salePrice }
    });
}

export function resolvePredictionMarket(marketId: string, result: 'yes' | 'no' | 'null') {
    return db.transaction((tx) => {
        const market = tx.select().from(schema.predictionMarket).where(eq(schema.predictionMarket.id, marketId)).get()
        if (!market) {
            throw new Error('Market not found')
        }
        if (market.status !== "pending") {
            throw new Error('Market is not open for resolution')
        }
        tx.update(schema.predictionMarket).set({
            status: 'resolved',
            result
        }).where(eq(schema.predictionMarket.id, marketId)).run()
        // Create history entry for resolution event
        tx.insert(schema.predictionMarketHistory).values({
            id: crypto.randomUUID(),
            predictionMarketId: marketId,
            yesPool: market.yesPool,
            noPool: market.noPool,
            date: new Date(),
            probability: getProbabilityForMarket(market.yesPool, market.noPool, 'yes')
        }).run();
        // Payout winning shares
        if (result === 'yes' || result === 'no') {
            const winningShares = tx.select().from(schema.predictionMarketShare).where(and(eq(schema.predictionMarketShare.predictionMarketId, marketId), eq(schema.predictionMarketShare.choice, result))).all()
            for (const share of winningShares) {
                const payoutPerShare = 1 // In a binary market, each winning share pays out 1 unit of currency
                const totalPayout = share.amount * payoutPerShare
                // Update portfolio currency balance
                const portfolioCurrency = tx.select().from(schema.portfolioCurrency).where(and(eq(schema.portfolioCurrency.portfolioId, share.portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).get()
                if (!portfolioCurrency) {
                    throw new Error('Portfolio does not have the required currency')
                }
                tx.update(schema.portfolioCurrency).set({
                    amount: portfolioCurrency.amount + totalPayout,
                }).where(and(eq(schema.portfolioCurrency.portfolioId, share.portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).run()
                // Create transaction record
                tx.insert(schema.transaction).values({
                    id: crypto.randomUUID(),
                    portfolioId: share.portfolioId,
                    type: 'prediction_win',
                    totalValue: totalPayout,
                    amountOfUnits: share.amount,
                    pricePerUnit: payoutPerShare,
                    fromCurrencyId: market.currencyId,
                    toCurrencyId: market.currencyId,
                    executedAt: new Date(),
                }).run();
            }
        } else if (result === 'null') {
            // Refund all shares. This means 0.5 per share in a binary market.
            const allShares = tx.select().from(schema.predictionMarketShare).where(eq(schema.predictionMarketShare.predictionMarketId, marketId)).all()
            for (const share of allShares) {
                const refundPerShare = 0.5
                const totalRefund = share.amount * refundPerShare
                // Update portfolio currency balance
                const portfolioCurrency = tx.select().from(schema.portfolioCurrency).where(and(eq(schema.portfolioCurrency.portfolioId, share.portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).get()
                if (!portfolioCurrency) {
                    throw new Error('Portfolio does not have the required currency')
                }
                tx.update(schema.portfolioCurrency).set({
                    amount: portfolioCurrency.amount + totalRefund,
                }).where(and(eq(schema.portfolioCurrency.portfolioId, share.portfolioId), eq(schema.portfolioCurrency.currencyId, market.currencyId))).run()
                // Create transaction record
                tx.insert(schema.transaction).values({
                    id: crypto.randomUUID(),
                    portfolioId: share.portfolioId,
                    type: 'prediction_draw',
                    totalValue: totalRefund,
                    amountOfUnits: share.amount,
                    pricePerUnit: refundPerShare,
                    fromCurrencyId: market.currencyId,
                    toCurrencyId: market.currencyId,
                    executedAt: new Date(),
                }).run();
            }
        }
    });
}

export function getPredictionMarketData(marketsIds: string[]) {
    // Fetch market data along with their history
    return db.transaction((tx) => {
        const markets = tx.select().from(schema.predictionMarket).where(inArray(schema.predictionMarket.id, marketsIds)).all()
        const result = []
        for (const market of markets) {
            const history = tx.select().from(schema.predictionMarketHistory).where(eq(schema.predictionMarketHistory.predictionMarketId, market.id)).orderBy(schema.predictionMarketHistory.date).all()
            result.push({
                market,
                history
            })
        }
        return result
    });
}

export function abortPredictionMarket() {
    // TODO: Complex logic to revert all shares at their purchase price
}

export function listPredictionMarkets() {
    return db.select().from(schema.predictionMarket).all();
}

export function getUserPredictionMarketPositions(portfolioId: string, marketIds?: string[]) {
    const filter = marketIds ? and(eq(schema.predictionMarketShare.portfolioId, portfolioId), inArray(schema.predictionMarketShare.predictionMarketId, marketIds)) : eq(schema.predictionMarketShare.portfolioId, portfolioId)
    return db.select().from(schema.predictionMarketShare).where(filter).all();
}

export function getProbabilityForMarket(yesPool: number, noPool: number, side: 'yes' | 'no') {
    const totalPool = yesPool + noPool
    if (side === 'yes') {
        // 2000 / 2500 = 0.8, so 80 cents per yes share
        return noPool / totalPool
    } else {
        // 500 / 2500 = 0.2, so 20 cents per no share
        return yesPool / totalPool
    }
}

export function calculateBoughtSharesForAmount(yesPool: number, noPool: number, amount: number, side: 'yes' | 'no') {

    const buyPool = side === 'yes' ? yesPool : noPool

    const counterPool = side === 'yes' ? noPool : yesPool

    const constant = buyPool * counterPool

    const newCounterPool = counterPool + (amount)

    // Balance yes Pool 

    const newBuyPool = constant / newCounterPool

    const differenceInBuyPool = buyPool - newBuyPool // newBuyPool is always smaller than buyPool, so this is the amount of additional shares bought

    const userShares = amount + differenceInBuyPool

    const yesPoolAfter = side === 'yes' ? newBuyPool : newCounterPool

    const noPoolAfter = side === 'yes' ? newCounterPool : newBuyPool

    return { userShares, yesPoolAfter, noPoolAfter }

}

export function calculateSaleAmountForShares(
    yesPool: number, 
    noPool: number, 
    shareAmount: number, 
    side: 'yes' | 'no'
) {
    // 1. Initialize K (the invariant)
    const k = yesPool * noPool;

    // 2. Add the sold shares to the respective pool
    // In CPMM markets like Manifold/Polymarket, selling shares increases the supply in the pool
    let newYesPool = yesPool;
    let newNoPool = noPool;

    if (side === 'yes') {
        newYesPool += shareAmount;
    } else {
        newNoPool += shareAmount;
    }

    // 3. Solve for the Sale Price (the "money" returned to the user)
    // We need to find an amount 's' such that (newYesPool - s) * (newNoPool - s) = k
    // This expands to the quadratic: s^2 - (newYesPool + newNoPool)s + (newYesPool * newNoPool - k) = 0
    
    const b = -(newYesPool + newNoPool);
    const c = (newYesPool * newNoPool) - k;

    // Quadratic formula: s = [-b - sqrt(b^2 - 4ac)] / 2a
    // Note: We use the minus because we want the smaller root (the realistic price)
    const discriminant = Math.pow(b, 2) - (4 * c);
    
    if (discriminant < 0) {
        throw new Error("Invalid market state: negative discriminant");
    }

    const salePrice = (-b - Math.sqrt(discriminant)) / 2;

    // 4. Update the pools by removing the paid-out amount
    const yesPoolAfter = newYesPool - salePrice;
    const noPoolAfter = newNoPool - salePrice;

    return {
        salePrice,      // The amount of "points" the user receives
        yesPoolAfter,
        noPoolAfter
    };
}