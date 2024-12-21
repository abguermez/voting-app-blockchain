import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Alert } from './SharedComponents';
import ProposalList from './ProposalList';

const UserPanel = ({ contract, account }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [votingStatus, setVotingStatus] = useState({ active: false, timeRemaining: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all proposals
      const proposalsCount = await contract.methods.getProposalsCount().call();
      const proposalsData = [];
      
      for (let i = 0; i < proposalsCount; i++) {
        const proposal = await contract.methods.proposals(i).call();
        proposalsData.push({
          name: proposal.name,
          description: proposal.description,
          voteCount: proposal.voteCount
        });
      }

      // Get voter info
      const voterInfo = await contract.methods.voters(account).call();
      
      // Get voting status
      const votingStatus = await contract.methods.votingOpen().call();

      setProposals(proposalsData);
      setUserInfo({
        isRegistered: voterInfo.isRegistered,
        hasVoted: voterInfo.hasVoted,
        votedProposalId: voterInfo.votedProposalId
      });
      setVotingStatus({ active: votingStatus });
    } catch (err) {
      setError('Failed to load voting data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract, account]);

  const handleVote = async (proposalIndex) => {
    try {
      setLoading(true);
      await contract.methods.vote(proposalIndex).send({ from: account });
      await fetchData(); // Refresh data after voting
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Voting Dashboard</h1>

      {error && <Alert type="error" message={error} />}

      <Card title="Your Voting Status">
        <div className="space-y-2">
          <p>
            Registration Status:{' '}
            <span className={userInfo?.isRegistered ? 'text-green-600' : 'text-red-600'}>
              {userInfo?.isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </p>
          <p>
            Voting Status:{' '}
            <span className={userInfo?.hasVoted ? 'text-orange-600' : 'text-green-600'}>
              {userInfo?.hasVoted ? 'Already Voted' : 'Not Voted'}
            </span>
          </p>
          {votingStatus.active && (
            <p>
              Time Remaining: {Math.floor(votingStatus.timeRemaining / 3600)}h{' '}
              {Math.floor((votingStatus.timeRemaining % 3600) / 60)}m
            </p>
          )}
        </div>
      </Card>

      <div className="mt-6">
        <ProposalList
          proposals={proposals}
          onVote={handleVote}
          userCanVote={userInfo?.isRegistered && !userInfo?.hasVoted && votingStatus.active}
        />
      </div>
    </div>
  );
};

export default UserPanel;