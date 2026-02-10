export function getProbabilityForMarket(yesPool: number, noPool: number, side: 'yes' | 'no') {
    const totalPool = yesPool + noPool
    if (totalPool === 0) return 0.5; // Avoid division by zero
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
