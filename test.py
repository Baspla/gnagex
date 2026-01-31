import math

class PolymarketAMM:
    def __init__(self, ja_reserves, nein_reserves):
        self.x = float(ja_reserves)  # JA Reserves
        self.y = float(nein_reserves) # NEIN Reserves
        self.k = self.x * self.y     # Invariant

    def get_price_ja(self):
        # Price is the ratio of the OTHER side to the total pool
        return self.y / (self.x + self.y)

    def buy_ja(self, points):
        """
        Alice puts in Points (Collateral), gets JA Shares.
        Formula: Shares = (points * (x + y + points)) / (y + points)
        """
        old_price = self.get_price_ja()
        
        # Calculate shares received
        shares_out = (points * (self.x + self.y + points)) / (self.y + points)
        
        # Update Reserves
        # When buying JA, JA reserves decrease, NEIN reserves increase
        self.y += points
        self.x = self.k / self.y
        
        new_price = self.get_price_ja()
        return shares_out, old_price, new_price
    
    def buy_nein(self, points):
        """
        Alice puts in Points (Collateral), gets NEIN Shares.
        Formula: Shares = (points * (x + y + points)) / (x + points)
        """
        old_price = self.get_price_ja()
        
        # Calculate shares received
        shares_out = (points * (self.x + self.y + points)) / (self.x + points)
        
        # Update Reserves
        # When buying NEIN, NEIN reserves decrease, JA reserves increase
        self.x += points
        self.y = self.k / self.x
        
        new_price = self.get_price_ja()
        return shares_out, old_price, new_price

    def sell_ja(self, shares):
        """
        Bob puts in JA Shares, gets Points (Collateral).
        """
        old_price = self.get_price_ja()
        
        # New
        self.x += shares
        
        d_y = self.y - (self.k / self.x)
        self.y = self.k / self.x
        print("self.x:", self.x)
        print("self.y:", self.y)
        print("d_y:", d_y)
        new_price = self.get_price_ja()
        return d_y, old_price, new_price

def main():
    print("--- Polymarket CPMM Simulator ---")
    ja = float(input("Initial JA Reserves (e.g., 110): "))
    nein = float(input("Initial NEIN Reserves (e.g., 90): "))
    amm = PolymarketAMM(ja, nein)

    while True:
        print(f"\n[Current Pool] JA: {amm.x:.2f} | NEIN: {amm.y:.2f} | Price JA: {amm.get_price_ja():.4f}")
        action = input("Action: [B]uy JA, [S]ell JA, [N] Buy NEIN, [Q]uit: ").upper()

        if action == 'B':
            amt = float(input("Spend how many Points? "))
            shares, p1, p2 = amm.buy_ja(amt)
            print(f">> Received: {shares:.4f} JA Shares")
            print(f">> Price moved: {p1:.4f} -> {p2:.4f}")

        elif action == 'S':
            amt = float(input("Sell how many JA Shares? "))
            points, p1, p2 = amm.sell_ja(amt)
            print(f">> Received: {points:.4f} Points")
            print(f">> Price moved: {p1:.4f} -> {p2:.4f}")
            
        elif action == 'N':
            amt = float(input("Spend how many Points? "))
            shares, p1, p2 = amm.buy_nein(amt)
            print(f">> Received: {shares:.4f} NEIN Shares")
            print(f">> Price moved: {p1:.4f} -> {p2:.4f}")

        elif action == 'Q':
            break

if __name__ == "__main__":
    main()