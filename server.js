const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TronWeb = require('tronweb');

const app = express();
const TRONGRID_API_ENDPOINT = 'https://api.trongrid.io';

app.use(bodyParser.json());

app.get('//', async (req, res) => {
  try {
    res.status(200).json({ "Welcome to Tronscape API","Developer - MrBotscape","Owning Company -- Botscape" });
   } catch (error) {
    console.error(error);
    res.status(500).json({ "Welcome to Tronscape API","Developer - MrBotscape","Owning Company -- Botscape" });
  }
});

app.get('/generateaddress', async (req, res) => {
  try {
    const tronWeb = new TronWeb({
      fullHost: TRONGRID_API_ENDPOINT,
    });

    const { privateKey, address } = await tronWeb.createAccount();

    res.status(200).json({ success: "true", data: { privateKey, address } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: "false", error: error.message });
  }
});

app.get('/balance/:address', async (req, res) => {
  try {
    const tronWeb = new TronWeb({
      fullHost: TRONGRID_API_ENDPOINT,
    });

    const { address } = req.params;
    const balanceInSun = await tronWeb.trx.getBalance(address);
    const balanceInTRX = balanceInSun / 1_000_000;

    res.status(200).json({ success: "true", data: { address, balance: balanceInTRX } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: "false", error: error.message });
  }
});

app.get('/send/:privateKey/:fromAddress/:toAddress/:amount', async (req, res) => {
  try {
    const { privateKey, fromAddress, toAddress, amount } = req.params;

    const tronWeb = new TronWeb({
      fullHost: TRONGRID_API_ENDPOINT,
      privateKey,
    });

    const options = {
      feeLimit: 100000000,
    };

    const transaction = await tronWeb.transactionBuilder.sendTrx(toAddress, Number(amount) * 1e6, fromAddress, options);

    const signedTransaction = await tronWeb.trx.sign(transaction);

    const result = await tronWeb.trx.sendRawTraAAnsaction(signedTransaction);

    res.status(200).json({ success: "true", data: { result } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: "false", error: error.message });
  }
});

app.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { data: { data } } = await axios.get(`${TRONGRID_API_ENDPOINT}/v1/accounts/${address}/transactions?only_to=false&only_confirmed=true`);

    const sortedTransactions = data.sort((a, b) => b.block_timestamp - a.block_timestamp);
    const transactionIds = sortedTransactions.slice(0, 10).map(transaction => transaction.txID);

    res.status(200).json({ success: "true", data: { total: data.length, transactionIds } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: "false", error: error.message });
  }
});

app.listen(process.env.PORT || 3000)
