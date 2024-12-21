import React, { useEffect, useState } from "react";
import { LoadingSpinner, Alert, Card } from "./SharedComponents";


const ResultsPanel = ({ contract, isInitialized }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchResults = async () => {
        try {
          setLoading(true);
          
          // Get total proposals
          const proposalsCount = await contract.methods.getProposalsCount().call();
          const proposalResults = [];
          
          // Fetch each proposal's details
          for (let i = 0; i < proposalsCount; i++) {
            const proposal = await contract.methods.proposals(i).call();
            proposalResults.push({
              name: proposal.name,
              description: proposal.description,
              voteCount: proposal.voteCount
            });
          }
          
          // Sort by vote count in descending order
          proposalResults.sort((a, b) => b.voteCount - a.voteCount);
          
          setResults(proposalResults);
          setError(null);
        } catch (error) {
          console.error("Error fetching results:", error);
          setError("Failed to load voting results");
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
      return <LoadingSpinner />;
    }
  
    if (error) {
      return (
        <div className="max-w-3xl mx-auto">
          <Alert type="error" message={error} />
        </div>
      );
    }
  
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Voting Results</h1>
        {results.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">No proposals available.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{result.name}</h3>
                    <p className="text-gray-600 mt-1">{result.description}</p>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {result.voteCount} votes
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
