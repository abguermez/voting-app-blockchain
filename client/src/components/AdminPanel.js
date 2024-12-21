import React, { useState, useCallback } from 'react';
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
      await contract.methods.addVoter(voterAddress, voterName).send({ from: account });
      showAlert('success', 'Voter added successfully!');
      setVoterAddress('');
      setVoterName('');
    } catch (error) {
      showAlert('error', error.message);
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
      setVotingStart('');
      setVotingEnd('');
    } catch (error) {
      showAlert('error', error.message);
    } finally {
      setLoading(false);
    }
  }, [contract, account, votingStart, votingEnd]);

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
        <Input
          label="Start Time (YYYY-MM-DD HH:mm:ss)"
          type="datetime-local"
          value={votingStart}
          onChange={(e) => setVotingStart(e.target.value)}
        />
        <Input
          label="End Time (YYYY-MM-DD HH:mm:ss)"
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
