import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { getWeb3, getContract } from "./web3";
import AdminPanel from "./components/AdminPanel";
import UserPanel from "./components/UserPanel";
import WalletConnect from "./components/WalletConnect";
import { LoadingSpinner, Alert } from "./components/SharedComponents";
import { Menu, LogOut } from "lucide-react";
import ResultsPanel from "./components/ResultsPanel";
import { useAuth } from './components/AuthContext';
import LoginPage from './components/LoginPage';
import {AuthProvider} from './components/AuthContext'

const Navigation = ({ account, username, isAdmin, onLogout }) => (
  <nav className="bg-gray-800 text-white p-4">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold">Voting DApp</h1>
        {isAdmin && (
          <span className="bg-blue-600 px-2 py-1 rounded text-sm">Admin</span>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm opacity-75">{username}</span>
        <div className="text-sm opacity-75">
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </div>
  </nav>
);

const Layout = ({ children }) => (
  <div className="min-h-screen bg-gray-50">
    {children}
    <footer className="bg-gray-800 text-white text-center p-4 mt-auto">
      <p className="text-sm opacity-75">
        Voting DApp © {new Date().getFullYear()}
      </p>
    </footer>
  </div>
);

const AppContent = () => {
  const { user, logout } = useAuth();
  const [web3Instance, setWeb3Instance] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [contractInitialized, setContractInitialized] = useState(false);

  const initializeContract = async (web3) => {
    try {
      console.log("Getting contract instance...");
      const contractInstance = await getContract(web3);
      console.log("Contract instance obtained:", contractInstance);
      setContract(contractInstance);
      setContractInitialized(true);
      setIsInitialized(true);
      setError(null);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setError("Failed to initialize contract. Please check your connection.");
      setIsInitialized(false);
    }
  };

  const handleConnect = async (selectedAccount) => {
    try {
      console.log("Starting connection process...");
      setLoading(true);
      setError(null);

      console.log("Getting Web3 instance...");
      const web3 = await getWeb3();
      setWeb3Instance(web3);
      
      console.log("Setting account:", selectedAccount);
      setAccount(selectedAccount);

      console.log("Initializing contract...");
      await initializeContract(web3);
    } catch (error) {
      console.error("Connection error:", error);
      setError(error.message || "Failed to connect");
    } finally {
      console.log("Connection process completed");
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: 'eth_accounts'
          });
          if (accounts.length > 0) {
            handleConnect(accounts[0]);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setLoading(false);
      }
    };

    if (user) {
      checkConnection();
    } else {
      setLoading(false);
    }

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          handleConnect(accounts[0]);
        } else {
          setAccount("");
          setContract(null);
          setIsInitialized(false);
        }
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, [user]);

  const handleLogout = () => {
    setAccount("");
    setContract(null);
    setIsInitialized(false);
    setContractInitialized(false);
    logout();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!account || !isInitialized) {
    return <WalletConnect onConnect={handleConnect} />;
  }

  return (
      <Layout>
        {error ? (
          <div className="max-w-2xl mx-auto mt-8 px-4">
            <Alert type="error" message={error} />
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-500"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <Navigation
              account={account}
              username={user.username}
              isAdmin={user.role === 'admin'}
              onLogout={handleLogout}
            />

            <main className="container mx-auto py-8 px-4">
              <Routes>
                <Route
                  path="/admin"
                  element={
                    user.role === 'admin' ? (
                      <AdminPanel contract={contract} account={account} />
                    ) : (
                      <Navigate to="/user" replace />
                    )
                  }
                />
                <Route
                  path="/user"
                  element={
                    user.role === 'user' ? (
                      <UserPanel contract={contract} account={account} />
                    ) : (
                      <Navigate to="/admin" replace />
                    )
                  }
                />
                <Route
                  path="/results"
                  element={
                    <ResultsPanel 
                      contract={contract} 
                      isInitialized={contractInitialized}
                    />
                  }
                />
                <Route
                  path="*"
                  element={
                    <Navigate to={user.role === 'admin' ? "/admin" : "/user"} replace />
                  }
                />
              </Routes>
            </main>
          </>
        )}
      </Layout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;