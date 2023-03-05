const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const TronWeb = require('tronweb');

const app = express();
const TRONGRID_API_ENDPOINT = 'https://api.trongrid.io';

app.use(bodyParser.json());

app.get('/', async (req, res) => {
  try {
    const tronWeb = new TronWeb({
      fullHost: TRONGRID_API_ENDPOINT,
    });

    const { privateKey, address } = await tronWeb.createAccount();

    res.status(200).json({ privateKey, address });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error' });
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

    res.status(200).json({ address, balance: balanceInTRX });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'error' });
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

    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error:'error'});
  }
});

app.listen(process.env.PORT || 3000)