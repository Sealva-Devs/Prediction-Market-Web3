# How to Fix "Wallet not on Polygon Amoy"

Pledgy’s smart contract runs on **Polygon Amoy** (testnet). Your wallet must be connected to this network, or transactions will fail with "Wallet not on Polygon Amoy" or similar errors.

Follow the steps below for your wallet (MetaMask is the most common).

---

## Option A: Add Polygon Amoy via Chainlist (easiest)

1. **Open Chainlist**
   - Go to: **https://chainlist.org**
   - Make sure you’re on the correct site (no typos).

2. **Connect your wallet**
   - Click **“Connect Wallet”** (e.g. MetaMask).
   - Approve the connection in the popup.

3. **Find Polygon Amoy**
   - In the search box, type: **Polygon Amoy** (or **Amoy**).
   - In the results, select **“Polygon Amoy Testnet”** (Chain ID **80002**).

4. **Add the network**
   - Click **“Add to MetaMask”** (or your wallet).
   - In the wallet popup, click **“Approve”** / **“Add network”**.
   - Your wallet will switch to Polygon Amoy.

5. **Use Pledgy**
   - Open Pledgy (local or Vercel).
   - Connect your wallet if needed.
   - You should now be on Polygon Amoy; create wager, pledge, etc. should work (after you have test POL for gas—see below).

---

## Option B: Add Polygon Amoy manually in MetaMask

1. **Open MetaMask**
   - Click the **network dropdown** at the top (it might say “Ethereum Mainnet” or another network).

2. **Add a network**
   - Click **“Add network”** or **“Add a network manually”** at the bottom of the list.

3. **Enter Polygon Amoy details**
   - Use **exactly** these values:

   | Field | Value |
   |-------|--------|
   | **Network name** | Polygon Amoy Testnet |
   | **RPC URL** | `https://rpc-amoy.polygon.technology` |
   | **Chain ID** | `80002` |
   | **Currency symbol** | POL |
   | **Block explorer URL** | `https://amoy.polygonscan.com` |

4. **Save**
   - Click **“Save”**.
   - MetaMask will switch to Polygon Amoy.

5. **Confirm**
   - The network dropdown should show **“Polygon Amoy Testnet”**.
   - Use Pledgy again; the “Wallet not on Polygon Amoy” error should be gone (once you have test POL).

---

## Get test POL for gas (required for transactions)

On Amoy, gas is paid in **test POL** (sometimes still called MATIC in UIs). You need a small amount to create wagers, pledge, resolve, and sign.

1. **Open a faucet** (choose one):
   - **Alchemy:** https://www.alchemy.com/faucets/polygon-amoy  
   - **QuickNode:** https://faucet.quicknode.com/polygon/amoy  
   - **Polygon docs (list):** https://docs.polygon.technology/tools/gas/matic-faucet  

2. **Connect your wallet**
   - Make sure MetaMask (or your wallet) is **on Polygon Amoy** (see above).
   - Connect the same address you use in Pledgy.

3. **Request test tokens**
   - Follow the faucet’s steps (e.g. “Send test MATIC” or “Get POL”).
   - Some faucets require a small amount of ETH on Ethereum Mainnet or social login; use one that works for you.

4. **Wait for balance**
   - After a short delay, your wallet should show test POL on Polygon Amoy.
   - Then try again in Pledgy (create wager, pledge, etc.).

---

## Checklist: “Wallet not on Polygon Amoy” fixed

- [ ] Polygon Amoy Testnet added to your wallet (Chain ID **80002**).
- [ ] Wallet **switched** to Polygon Amoy (network dropdown shows “Polygon Amoy Testnet”).
- [ ] You have a small amount of **test POL** on Amoy for gas.
- [ ] You’re using the **same** wallet address in Pledgy as the one that has test POL.

---

## If the app still says “wrong network”

Some dApps ask the user to switch network via a button or a popup. If Pledgy has a **“Switch to Polygon Amoy”** or **“Wrong network”** message:

- Click it so the app can request the network switch in your wallet.
- In the MetaMask (or wallet) popup, confirm **“Switch network”**.

If there is no such button, always **manually select “Polygon Amoy Testnet”** in your wallet’s network dropdown before using Pledgy.

---

## Summary

| What you need | Where |
|---------------|--------|
| **Network** | Polygon Amoy Testnet (Chain ID **80002**) |
| **Add network** | https://chainlist.org → search “Polygon Amoy” → Add to MetaMask |
| **RPC** | `https://rpc-amoy.polygon.technology` |
| **Explorer** | https://amoy.polygonscan.com |
| **Test POL** | Alchemy/QuickNode/Polygon faucets (see links above) |

Once your wallet is on Polygon Amoy and has test POL, the “Wallet not on Polygon Amoy” issue is fixed and transactions can succeed.
