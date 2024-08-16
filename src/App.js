import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const contractABI = [
  // Include your full ABI here
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
        "name": "commenter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "content",
        "type": "string"
      }
    ],
    "name": "CommentAdded",
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
        "name": "upvoter",
        "type": "address"
      }
    ],
    "name": "PasteUpvoted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasUpvoted",
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
      },
      {
        "internalType": "uint256",
        "name": "upvotes",
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
      },
      {
        "internalType": "uint256",
        "name": "upvotes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "commentCount",
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_pasteId",
        "type": "uint256"
      }
    ],
    "name": "upvotePaste",
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
      },
      {
        "internalType": "string",
        "name": "_content",
        "type": "string"
      }
    ],
    "name": "addComment",
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
    "name": "getComments",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "commenter",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "content",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct Deadstreet.Comment[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

const contractAddress = '0xCB45A696cA23Fc18dcbF5fe8A5BB7786cb88f06a'; // Replace with your actual contract address

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
      const loadedPastes = [];
      for (let i = 0; i < pasteCount; i++) {
        const exists = await contractInstance.pasteExists(i);
        if (exists) {
          const paste = await contractInstance.getPaste(i);
          const comments = await contractInstance.getComments(i);
          loadedPastes.push({
            id: i,
            content: paste.content,
            owner: paste.owner,
            timestamp: paste.timestamp.toString(),
            upvotes: paste.upvotes.toString(),
            comments: comments.map(c => ({
              commenter: c.commenter,
              content: c.content,
              timestamp: c.timestamp.toString()
            }))
          });
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

  const upvotePaste = async (pasteId) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.upvotePaste(pasteId);
      await tx.wait();
      await loadPastes(contract);
    } catch (error) {
      console.error("Error upvoting paste:", error);
      setError("Failed to upvote paste. Please try again.");
    }
    setLoading(false);
  };

  const addComment = async (pasteId, content) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.addComment(pasteId, content);
      await tx.wait();
      await loadPastes(contract);
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Deadstreet Dapp</h1>
      <p className="mb-4">Connected Account: {account}</p>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}

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
            <p className="text-sm text-gray-600">Upvotes: {paste.upvotes}</p>
            <button
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded mr-2"
              onClick={() => upvotePaste(paste.id)}
              disabled={loading}
            >
              Upvote
            </button>
            {paste.owner === account && (
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                onClick={() => deletePaste(paste.id)}
                disabled={loading}
              >
                Delete Paste
              </button>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-bold">Comments</h3>
              {paste.comments.map((comment, index) => (
                <div key={index} className="border-t pt-2 mt-2">
                  <p>{comment.content}</p>
                  <p className="text-xs text-gray-500">By: {comment.commenter} at {new Date(parseInt(comment.timestamp) * 1000).toLocaleString()}</p>
                </div>
              ))}
              <div className="mt-2">
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Add a comment"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(paste.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}