import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Card, Alert } from './SharedComponents';

const AdminPanel = ({ contract, account }) => {
  const [voterAddress, setVoterAddress] = useState('');
  const [voterName, setVoterName] = useState('');
  const [proposalName, setProposalName] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [votingStart, setVotingStart] = useState('');
  const [votingEnd, setVotingEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [currentVotingPeriod, setCurrentVotingPeriod] = useState({ start: null, end: null });

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleAddVoter = useCallback(async () => {
    if (!voterAddress || !voterName) {
      showAlert('error', 'Please fill in all voter fields');
      return;
    }
  
    try {
      setLoading(true);
  
      // Check if voter is already registered
      const existingVoter = await contract.methods.voters(voterAddress).call();
      if (existingVoter.isRegistered) {
        showAlert('error', 'This address is already registered');
        return;
      }
  
      // Estimate gas and safely handle BigInt
      const gasEstimate = await contract.methods.addVoter(voterAddress, voterName).estimateGas({ from: account });
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2); // Ensure gasLimit is a number
  
      console.log('Gas Estimate:', gasEstimate, 'Gas Limit:', gasLimit);
  
      // Send the transaction
      await contract.methods.addVoter(voterAddress, voterName).send({
        from: account,
        gas: gasLimit, // Ensure this is a valid number
      });
  
      showAlert('success', 'Voter added successfully!');
      setVoterAddress('');
      setVoterName('');
    } catch (error) {
      console.error('Add voter error:', error);
      showAlert('error', `Failed to add voter: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [contract, account, voterAddress, voterName]);
  
  
  const handleAddProposal = useCallback(async () => {
    if (!proposalName || !proposalDescription) {
      showAlert('error', 'Please fill in all proposal fields');
      return;
    }

    try {
      setLoading(true);
      await contract.methods.addProposal(proposalName, proposalDescription).send({ from: account });
      showAlert('success', 'Proposal added successfully!');
      setProposalName('');
      setProposalDescription('');
    } catch (error) {
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  }, [contract, account, proposalName, proposalDescription]);

  const handleSetVotingPeriod = useCallback(async () => {
    if (!votingStart || !votingEnd) {
      showAlert('error', 'Please set both start and end times');
      return;
    }

    const startTime = Math.floor(new Date(votingStart).getTime() / 1000);
    const endTime = Math.floor(new Date(votingEnd).getTime() / 1000);

    if (startTime >= endTime) {
      showAlert('error', 'End time must be after start time');
      return;
    }

    try {
      setLoading(true);
      await contract.methods.setVotingPeriod(startTime, endTime).send({ from: account });
      showAlert('success', 'Voting period set successfully!');
    //   setVotingStart('');
    //   setVotingEnd('');
      
      // Refresh the current voting period
      const votingActive = await contract.methods.votingActive().call();
      setCurrentVotingPeriod({
        start: new Date(startTime * 1000),
        end: new Date(endTime * 1000),
        active: votingActive
      });
    } catch (error) {
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  }, [contract, account, votingStart, votingEnd]);
  useEffect(() => {
    const fetchVotingPeriod = async () => {
      try {
        const votingStart = await contract.methods.votingStart().call();
        const votingEnd = await contract.methods.votingEnd().call();
        const votingActive = await contract.methods.votingActive().call();
        
        setCurrentVotingPeriod({
          start: new Date(votingStart * 1000),
          end: new Date(votingEnd * 1000),
          active: votingActive
        });
      } catch (error) {
        console.error('Error fetching voting period:', error);
      }
    };

    if (contract) {
      fetchVotingPeriod();
    }
  }, [contract]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <Card title="Add Voter">
        <Input
          label="Voter Address"
          type="text"
          placeholder="0x..."
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
        />
        <Input
          label="Voter Name"
          type="text"
          placeholder="Enter voter name"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
        />
        <Button onClick={handleAddVoter} disabled={loading}>
          {loading ? 'Adding Voter...' : 'Add Voter'}
        </Button>
      </Card>

      <Card title="Add Proposal">
        <Input
          label="Proposal Name"
          type="text"
          placeholder="Enter proposal name"
          value={proposalName}
          onChange={(e) => setProposalName(e.target.value)}
        />
        <Input
          label="Proposal Description"
          type="text"
          placeholder="Enter proposal description"
          value={proposalDescription}
          onChange={(e) => setProposalDescription(e.target.value)}
        />
        <Button onClick={handleAddProposal} disabled={loading}>
          {loading ? 'Adding Proposal...' : 'Add Proposal'}
        </Button>
      </Card>

      <Card title="Set Voting Period">
      {currentVotingPeriod.start && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">Current Voting Period:</h3>
          <p>Start: {currentVotingPeriod.start.toLocaleString()}</p>
          <p>End: {currentVotingPeriod.end.toLocaleString()}</p>
          <p>Status: {currentVotingPeriod.active ? 'Active' : 'Inactive'}</p>
        </div>
      )}
      
      <Input
        label="Start Time"
        type="datetime-local"
        value={votingStart}
        onChange={(e) => setVotingStart(e.target.value)}
      />
      <Input
        label="End Time"
        type="datetime-local"
        value={votingEnd}
        onChange={(e) => setVotingEnd(e.target.value)}
      />
      <Button onClick={handleSetVotingPeriod} disabled={loading}>
        {loading ? 'Setting Period...' : 'Set Voting Period'}
      </Button>
    </Card>
    </div>
  );
};

export default AdminPanel;
