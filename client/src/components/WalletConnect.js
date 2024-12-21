import React, { useState } from 'react';
import { Wallet, AlertCircle, Loader } from 'lucide-react';

const WalletConnect = ({ onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to use this dApp');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Get the network ID
      const networkId = await window.ethereum.request({
        method: 'net_version'
      });

      // Check if we're on the correct network (5777 for Ganache)
      if (networkId !== '5777') {
        throw new Error('Please connect to Ganache network');
      }

      onConnect(accounts[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Voting DApp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connect your wallet to get started
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <button
          onClick={connectWallet}
          disabled={loading}
          className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
        >
          {loading ? (
            <Loader className="animate-spin h-5 w-5" />
          ) : (
            <>
              <Wallet className="h-5 w-5 mr-2" />
              Connect Wallet
            </>
          )}
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Make sure you have:
          </p>
          <ul className="mt-2 text-sm text-gray-500 list-disc list-inside">
            <li>MetaMask installed</li>
            <li>Ganache running locally</li>
            <li>Connected to the correct network</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WalletConnect;