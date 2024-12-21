import React, { useState, useEffect } from 'react';
import { Card, LoadingSpinner, Alert } from './SharedComponents';
import ProposalList from './ProposalList';

const UserPanel = ({ contract, account }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [votingStatus, setVotingStatus] = useState({ active: true, timeRemaining: 0 });
  const [votingPeriod, setVotingPeriod] = useState({
    start: null,
    end: null,
    active: true
  });

  const fetchProposals = async () => {
    if (!contract) return [];
    
    const proposalsCount = await contract.methods.getProposalsCount().call();
    console.log('Proposals count:', proposalsCount);
    
    const proposalsData = [];
    for (let i = 0; i < proposalsCount; i++) {
      const proposal = await contract.methods.proposals(i).call();
      proposalsData.push({
        id: i,
        name: proposal.name,
        description: proposal.description,
        voteCount: proposal.voteCount,
        isActive: proposal.isActive
      });
    }
    return proposalsData;
  };

  const fetchVoterInfo = async () => {
    if (!contract || !account) return null;
    
    const voterInfo = await contract.methods.voters(account).call();
    console.log('Voter info:', voterInfo);
    return {
      isRegistered: voterInfo.isRegistered,
      hasVoted: voterInfo.hasVoted,
      votedProposalId: voterInfo.voteIndex,
      voterName: voterInfo.voterName
    };
  };

  const fetchVotingPeriodInfo = async () => {
    if (!contract) return null;
    
    try {
      const votingStatus = await contract.methods.getVotingStatus().call();
      return {
        active: votingStatus.isActive,
        timeRemaining: parseInt(votingStatus.timeRemaining)
      };
    } catch (err) {
      console.error('Error fetching voting period:', err);
      return { active: true, timeRemaining: 0 };
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching data... Account:', account);

      if (!contract || !account) {
        throw new Error('Contract or account not available');
      }

      // Fetch all data in parallel
      const [proposalsData, voterInfo, votingPeriodInfo] = await Promise.all([
        fetchProposals(),
        fetchVoterInfo(),
        fetchVotingPeriodInfo()
      ]);

      setProposals(proposalsData);
      setUserInfo(voterInfo);
      setVotingStatus(votingPeriodInfo);

    } catch (err) {
      console.error('Fetch data error:', err);
      setError(`Failed to load voting data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateVotingConditions = async (proposalIndex) => {
    const voterInfo = await contract.methods.voters(account).call();
    const proposal = await contract.methods.proposals(proposalIndex).call();
    const votingOpen = await contract.methods.votingOpen().call();

    console.log('Voting conditions:', {
      voterInfo,
      proposal,
      votingOpen,
      proposalIndex,
      account
    });

    if (!voterInfo.isRegistered) throw new Error('You are not registered to vote');
    if (voterInfo.hasVoted) throw new Error('You have already voted');
    if (!proposal.isActive) throw new Error('This proposal is not active');
    if (!votingOpen) throw new Error('Voting is not currently open');

    return true;
  };

  const handleVote = async (proposalIndex) => {
    try {
      if (!contract || !account) {
        throw new Error('Contract or account not available');
      }
  
      setLoading(true);
      setError(null);
  
      // Validate voting conditions
      await validateVotingConditions(proposalIndex);
  
      // Try simulation first
      try {
        await contract.methods.vote(proposalIndex).call({ from: account });
      } catch (callError) {
        console.error('Vote simulation failed:', callError);
        const revertMessage = callError.message.match(/revert\s(.*)"/)?.[1] || 
                              callError.message.match(/execution reverted:\s*(.+)/)?.[1] ||
                              'Transaction would fail';
        throw new Error(`Vote would fail: ${revertMessage}`);
      }
  
      // Estimate gas with safety margin
      const gasEstimate = await contract.methods.vote(proposalIndex)
        .estimateGas({ from: account });
  
      console.log('Gas estimation successful:', gasEstimate);
  
      // Convert gasEstimate to number safely and add buffer
      const gasLimit = Math.ceil(Number(gasEstimate) * 1.2);
  
      // Send transaction with buffer
      const receipt = await contract.methods.vote(proposalIndex)
        .send({
          from: account,
          gas: gasLimit // Ensure this is a valid number
        });
  
      console.log('Vote transaction successful:', receipt);
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Vote error:', err);
      const errorMessage = err.message.includes('revert') 
        ? err.message.match(/revert\s(.*)"/)?.[1] || 
          err.message.match(/execution reverted:\s*(.+)/)?.[1]
        : err.message;
      setError(errorMessage || 'Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [contract, account]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Voting Dashboard</h1>

      {error && (
        <Alert 
          type="error" 
          message={error}
          className="mb-6"
        />
      )}

      <Card title="Voting Status">
        <div className="space-y-2">
          <p>
            Registration Status:{' '}
            <span className={userInfo?.isRegistered ? 'text-green-600' : 'text-red-600'}>
              {userInfo?.isRegistered ? 'Registered' : 'Not Registered'}
            </span>
          </p>
          <p>
            Voting Status:{' '}
            <span className={votingPeriod.active ? 'text-green-600' : 'text-red-600'}>
              {votingPeriod.active ? 'Open' : 'Closed'}
            </span>
          </p>
          <p>
            Have Voted:{' '}
            <span className={userInfo?.hasVoted ? 'text-orange-600' : 'text-green-600'}>
              {userInfo?.hasVoted ? 'Yes' : 'No'}
            </span>
          </p>
        </div>
      </Card>

      <div className="mt-6">
        <ProposalList
          proposals={proposals}
          onVote={handleVote}
          userCanVote={userInfo?.isRegistered && !userInfo?.hasVoted && votingPeriod.active}
        />
      </div>
    </div>
  );
};

export default UserPanel;