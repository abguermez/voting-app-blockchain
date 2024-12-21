import Web3 from "web3";
import Voting from "./contracts/Voting.json";

const getWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          console.log("MetaMask connected");
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      } else if (window.web3) {
        const web3 = new Web3(window.web3.currentProvider);
        console.log("Legacy web3 detected");
        resolve(web3);
      } else {
        reject("Must install MetaMask!");
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getContract = async (web3) => {
  try {
    const networkId = await web3.eth.net.getId();
    console.log("Network ID ==> " + networkId);
    
    const deployedNetwork = Voting.networks[networkId];
    console.log("Deployed Network ==> ", deployedNetwork);
    
    if (!deployedNetwork) {
      throw new Error("Contract not deployed on the current network!");
    }
    
    const contract = new web3.eth.Contract(
      Voting.abi,
      deployedNetwork.address
    );
    
    console.log("Contract initialized successfully");
    return contract;
  } catch (error) {
    console.error("Error in getContract:", error);
    throw error;
  }
};

export { getWeb3, getContract };