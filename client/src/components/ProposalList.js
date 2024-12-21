import React from 'react';
import { Card } from './SharedComponents';

const ProposalList = ({ proposals, onVote, userCanVote }) => {
  return (
    <Card title="Active Proposals">
      <div className="space-y-4">
        {proposals.map((proposal, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{proposal.name}</h3>
                <p className="text-gray-600 mt-1">{proposal.description}</p>
                <div className="mt-2 text-sm text-gray-500">
                  Votes: {proposal.voteCount}
                </div>
              </div>
              {userCanVote && (
                <button
                  onClick={() => onVote(index)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Vote
                </button>
              )}
            </div>
          </div>
        ))}
        {proposals.length === 0 && (
          <p className="text-gray-500 text-center py-4">No proposals available</p>
        )}
      </div>
    </Card>
  );
};

export default ProposalList;