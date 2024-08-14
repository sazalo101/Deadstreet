import Web3 from 'web3';
import { abi as contractAbi } from './abi.json'; // Assuming ABI is stored in a separate JSON file

// Initialize Web3 instance
const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545');

// Contract address (should be configurable)
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || '0x2DdD22AaBFdbb9181c332F8EFA1b90BD7E4075D6';

// Create a contract instance
let contract;
try {
  contract = new web3.eth.Contract(contractAbi, contractAddress);
} catch (error) {
  console.error('Failed to create contract instance:', error);
  throw error;
}

// Utility function for error handling
async function executeContractMethod(method, options = {}) {
  try {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const gasEstimate = await method.estimateGas({ from: account });
    return await method.send({ from: account, gas: gasEstimate, ...options });
  } catch (error) {
    console.error('Error executing contract method:', error);
    throw error;
  }
}

// Function to create a paste with input validation and duplicate check
export async function createPaste(content) {
  if (typeof content !== 'string' || content.trim() === '') {
    throw new Error('Content must be a non-empty string');
  }

  // Optional: Check for duplicate content (requires additional contract support)
  const existingPastes = await contract.methods.pasteCount().call();
  for (let i = 0; i < existingPastes; i++) {
    const paste = await contract.methods.pastes(i).call();
    if (paste.content === content) {
      throw new Error('Duplicate content is not allowed');
    }
  }

  return executeContractMethod(contract.methods.createPaste(content));
}

// Function to delete a paste with ownership check
export async function deletePaste(pasteId) {
  if (!Number.isInteger(pasteId) || pasteId < 0) {
    throw new Error('Paste ID must be a non-negative integer');
  }

  const paste = await contract.methods.getPaste(pasteId).call();
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  if (paste.owner.toLowerCase() !== account.toLowerCase()) {
    throw new Error('Only the owner can delete this paste');
  }

  return executeContractMethod(contract.methods.deletePaste(pasteId));
}

// Function to get paste details
export async function getPaste(pasteId) {
  if (!Number.isInteger(pasteId) || pasteId < 0) {
    throw new Error('Paste ID must be a non-negative integer');
  }

  try {
    return await contract.methods.getPaste(pasteId).call();
  } catch (error) {
    console.error('Error fetching paste details:', error);
    throw error;
  }
}

// Function to update paste content with ownership check
export async function updatePaste(pasteId, newContent) {
  if (typeof newContent !== 'string' || newContent.trim() === '') {
    throw new Error('New content must be a non-empty string');
  }

  const paste = await contract.methods.getPaste(pasteId).call();
  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  if (paste.owner.toLowerCase() !== account.toLowerCase()) {
    throw new Error('Only the owner can update this paste');
  }

  return executeContractMethod(contract.methods.updatePaste(pasteId, newContent));
}

// Event listeners for PasteCreated and PasteDeleted
contract.events.PasteCreated({}, (error, event) => {
  if (error) {
    console.error('Error in PasteCreated event:', error);
  } else {
    console.log('PasteCreated event:', event);
  }
});

contract.events.PasteDeleted({}, (error, event) => {
  if (error) {
    console.error('Error in PasteDeleted event:', error);
  } else {
    console.log('PasteDeleted event:', event);
  }
});

export default contract;
