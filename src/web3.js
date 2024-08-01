// src/web3.js
import Web3 from 'web3';
import { ContractKit } from '@celo/contractkit';

const celoNodeUrl = 'https://alfajores-forno.celo-testnet.org';
const web3 = new Web3(celoNodeUrl);
const kit = ContractKit.newKit(celoNodeUrl);

export { web3, kit };
