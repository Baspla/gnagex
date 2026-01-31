# TODO
## Geplante Features
 - Stock Handel
 - Balanced Betting
 - Prediction Markets


## Was für Prediction Markets zu beachten ist
 - Märkte brauchen eine initiale Liquidität. Diese muss entweder vom Ersteller des Marktes oder dem Haus bereitgestellt werden.
 - Ja und Nein Shares müssen immer im konstanten Verhältnis zueinander stehen. x * Ja Shares + y * Nein Shares = Konstante
 - Wenn die Liquidität vom Haus gestellt wird führt das zu Inflation. Dies kann maybe durch Gebühren wie Dynamic Spread oder Winning Comission ausgeglichen werden.
### Beispiel zum Kaufen
Anfangszustand:
 - Ja Pool x: 100 Shares
 - Nein Pool y: 100 Shares
 - Konstante k: 10.000 (k = x * y)
 - Liquidität L: 100 Punkte (L^2 = x * y)
 - Preis Ja Share: 0.5 Punkte (100 / (100 + 100))
 - Preis Nein Share: 0.5 Punkte (100 / (100 + 100))

Der Preis für 1 Ja Share + 1 Nein Share ist immer 1 Punkt

Nutzer kauft für 10 Punkte. Dabei werden gleichzeitig Ja und Nein Shares neu erzeugt
Sie hat also 10 Ja Shares und 10 Nein Shares gekauft.
Die Ja Shares behält sie, die Nein Shares werden in den Pool verkauft.
Der Nein Pool y erhöht sich also um 10 Shares auf 110 Shares.
Der Ja Pool x muss so angepasst werden, dass die Konstante k erhalten bleibt:
k = x * y
10.000 = x * 110
x = 90,91 Shares (abgerundet)
Die Differenz d_x = 100 - 90,91 = 9,09 Shares werden dem Ja Pool entnommen. und auch dem Nutzer gutgeschrieben.
Neuer Zustand:
 - Ja Pool x: 90,91 Shares
 - Nein Pool y: 110 Shares
 - Konstante k: 10.000 (k = x * y)
 - Liquidität L: 100 Punkte (L^2 = x * y)
 - Preis Ja Share: 0,452 Punkte (90,91 / (90,91 + 110))
 - Preis Nein Share: 0,547 Punkte (110 / (90,91 + 110))
 - Nutzer hat jetzt 19,09 Ja Shares für 10 Punkte gekauft die bei Ja zu 19,09 Punkten ausgezahlt werden oder bei Nein wertlos verfallen.

Die Stichworte hier sind "Conditional Token Framework" und "CPMM - Constant Product Market Maker"

### Zum Verkaufen
Verkaufen geht auf zwei Arten:
- Der Nutzer verkauft seine Shares an einen anderen Nutzer.
- Der Nutzer kauft die Gegenposition im Pool und bekommt dafür Punkte (Collateral) ausgezahlt.
- Also 1 Ja Share + 1 Nein Share = 1 Punkt ausgezahlt.