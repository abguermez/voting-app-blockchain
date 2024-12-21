import React, { useEffect, useState } from "react";
import { LoadingSpinner, Alert, Card } from "./SharedComponents";

const ResultsPanel = ({ contract, isInitialized }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        console.log("Contract instance:", contract); // Debug log

        // Get total proposals
        const proposalsCount = await contract.methods.getProposalsCount().call();
        console.log("Total proposals:", proposalsCount); // Debug log

        const proposalResults = [];
        let votesSum = 0;

        // Fetch each proposal's details
        for (let i = 0; i < proposalsCount; i++) {
          console.log(`Fetching proposal ${i}`); // Debug log
          const proposal = await contract.methods.proposals(i).call();
          console.log(`Proposal ${i} data:`, proposal); // Debug log

          // Convert voteCount from string to number if needed
          const voteCount = parseInt(proposal.voteCount) || 0;
          votesSum += voteCount;

          proposalResults.push({
            id: i,
            name: proposal.name,
            description: proposal.description,
            voteCount: voteCount
          });
        }

        // Sort by vote count in descending order
        proposalResults.sort((a, b) => b.voteCount - a.voteCount);
        
        setTotalVotes(votesSum);
        setResults(proposalResults);
        setError(null);
      } catch (error) {
        console.error("Error fetching results:", error);
        setError(`Failed to load voting results: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (contract && isInitialized) {
      fetchResults();
    }
  }, [contract, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">Please connect your wallet to view results.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading voting results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Alert type="error" message={error} />
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Voting Results</h1>
        <div className="text-gray-600">
          Total Votes: <span className="font-bold">{totalVotes}</span>
        </div>
      </div>

      {results.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">No proposals available.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{result.name}</h3>
                    <p className="text-gray-600 mt-1">{result.description}</p>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {result.voteCount} votes
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${totalVotes > 0 ? (result.voteCount / totalVotes) * 100 : 0}%` 
                    }}
                  />
                </div>
                
                {/* Percentage */}
                <div className="text-right text-sm text-gray-600">
                  {totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;