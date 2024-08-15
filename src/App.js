import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Smart contract ABI and address
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pasteId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PasteCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "pasteId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "PasteDeleted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "pasteCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pastes",
    "outputs": [
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "pasteExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_content",
        "type": "string"
      }
    ],
    "name": "createPaste",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pasteId",
        "type": "uint256"
      }
    ],
    "name": "getPaste",
    "outputs": [
      {
        "internalType": "string",
        "name": "content",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pasteId",
        "type": "uint256"
      }
    ],
    "name": "deletePaste",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = '0x5312D6956854ecEFFA089e3A789343fdbe171FfA';

export default function DeadstreetDapp() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [pastes, setPastes] = useState([]);
  const [newPasteContent, setNewPasteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          if (window.ethereum.isMetaMask || window.ethereum.isMiniPay) {
            // Request accounts from wallet
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contractInstance);
            const address = await signer.getAddress();
            setAccount(address);
            await loadPastes(contractInstance);
            setLoading(false);
          } else {
            setError("MetaMask or MiniPay is not installed. Please install a compatible wallet to use this dapp.");
            setLoading(false);
          }
        } catch (error) {
          console.error("An error occurred:", error);
          setError("Failed to connect to the blockchain. Please make sure you're connected to MetaMask or MiniPay.");
          setLoading(false);
        }
      } else {
        setError("Please install MetaMask or MiniPay to use this dapp.");
        setLoading(false);
      }
    };

    init();
  }, []);

  const loadPastes = async (contractInstance) => {
    try {
      const pasteCount = await contractInstance.pasteCount();
      console.log("Paste count:", pasteCount.toString());
      const loadedPastes = [];
      for (let i = 0; i < pasteCount; i++) {
        const exists = await contractInstance.pasteExists(i);
        if (exists) {
          const paste = await contractInstance.getPaste(i);
          console.log("Loaded paste:", paste);
          loadedPastes.push({ id: i, content: paste.content, owner: paste.owner, timestamp: paste.timestamp.toString() });
        }
      }
      setPastes(loadedPastes);
    } catch (error) {
      console.error("Error loading pastes:", error);
      setError("Failed to load pastes. Please try again.");
    }
  };

  const createPaste = async () => {
    if (!contract || !newPasteContent) return;
    setLoading(true);
    try {
      const tx = await contract.createPaste(newPasteContent);
      await tx.wait();
      setNewPasteContent('');
      await loadPastes(contract);
    } catch (error) {
      console.error("Error creating paste:", error);
      setError("Failed to create paste. Please try again.");
    }
    setLoading(false);
  };

  const deletePaste = async (pasteId) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.deletePaste(pasteId);
      await tx.wait();
      await loadPastes(contract);
    } catch (error) {
      console.error("Error deleting paste:", error);
      setError("Failed to delete paste. Please try again.");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Deadstreet Dapp</h1>
      <p className="mb-4">Connected Account: {account}</p>
      
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded"
          value={newPasteContent}
          onChange={(e) => setNewPasteContent(e.target.value)}
          placeholder="Enter your paste content"
        />
        <button
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
          onClick={createPaste}
          disabled={loading}
        >
          Create Paste
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-2">Pastes</h2>
      <div className="space-y-4">
        {pastes.map((paste) => (
          <div key={paste.id} className="border p-4 rounded">
            <p className="mb-2">{paste.content}</p>
            <p className="text-sm text-gray-600">Owner: {paste.owner}</p>
            <p className="text-sm text-gray-600">Timestamp: {new Date(parseInt(paste.timestamp) * 1000).toLocaleString()}</p>
            <button
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => deletePaste(paste.id)}
              disabled={loading}
            >
              Delete Paste
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}