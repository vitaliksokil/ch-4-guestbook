import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';
import NearWalletSelector from "@near-wallet-selector/core";
import {setupNearWallet} from "@near-wallet-selector/near-wallet";
import nearWalletIcon from "./assets/near-wallet-icon.png";
import {setupSender} from "@near-wallet-selector/sender";
import senderIcon from "./assets/sender-icon.png";
import {providers} from "near-api-js";

// Initializing contract
async function initContract() {
  // get network configuration values from config.js
  // based on the network ID we pass to getConfig()
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  const walletSelector = await NearWalletSelector.init({
    network: "testnet",
    contractId: nearConfig.contractName,
    wallets: [
      setupNearWallet({iconUrl: nearWalletIcon}),
      setupSender({iconUrl: senderIcon}),
    ],
  });

  const provider = new providers.JsonRpcProvider({
    url: walletSelector.network.nodeUrl,
  });
  let currentUser;
  const setCurrentUser = async ()=> {
    let accounts = await walletSelector.getAccounts();
    if(Array.isArray(accounts) && accounts.length) {
      let accountId = accounts[0].accountId;
      let result = await provider.query({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
      });
      if (result) {
        currentUser = {
          // Gets the accountId as a string
          accountId: accountId,
          // Gets the user's token balance
          balance: result.amount,
        };
      }
    }
  }

  await setCurrentUser();
  walletSelector.on("signIn", async (e) => {
    await setCurrentUser();
    if (currentUser){
      // eslint-disable-next-line no-undef
      document.location.reload();
    }
  });

  return { provider, currentUser, walletSelector};
}

// eslint-disable-next-line no-undef
window.nearInitPromise = initContract().then(
  ({provider, currentUser, walletSelector }) => {
    ReactDOM.render(
      <App
        provider={provider}
        currentUser={currentUser}
        selector={walletSelector}
      />,
      // eslint-disable-next-line no-undef
      document.getElementById('root')
    );
  }
);
