// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint voteIndex;
        string voterName;   // Added voter name
    }

    struct Proposal {
        string name;
        string description; // Added description
        uint voteCount;
        bool isActive;      // Added status
    }

    address public admin;
    mapping(address => Voter) public voters;
    address[] private voterAddresses;
    Proposal[] public proposals;
    
    uint public votingStart;
    uint public votingEnd;
    bool public votingActive;

    event VoterAdded(address indexed voter, string name);
    event VoterRemoved(address indexed voter);
    event Voted(address indexed voter, uint indexed proposalIndex, uint timestamp);
    event ProposalAdded(uint indexed proposalIndex, string name);
    event ProposalStatusChanged(uint indexed proposalIndex, bool isActive);
    event VotingTimeSet(uint startTime, uint endTime);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyDuringVotingPeriod() {
        require(votingActive, "Voting is not currently active");
        require(block.timestamp < votingEnd, "Voting period has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
        votingActive = false;
    }

    function setVotingPeriod(uint _startTime, uint _endTime) public onlyAdmin {
        require(_endTime > _startTime, "Invalid time period");
        require(_startTime >= block.timestamp, "Start time must be in the future");
        
        votingStart = _startTime;
        votingEnd = _endTime;
        votingActive = true;
        
        emit VotingTimeSet(_startTime, _endTime);
    }

    function addVoter(address _voter, string memory _name) public onlyAdmin {
        require(!voters[_voter].isRegistered, "Voter is already registered");
        
        voters[_voter] = Voter({
            isRegistered: true,
            hasVoted: false,
            voteIndex: 0,
            voterName: _name
        });
        
        voterAddresses.push(_voter);
        emit VoterAdded(_voter, _name);
    }

    function removeVoter(address _voter) public onlyAdmin {
        require(voters[_voter].isRegistered, "Voter not registered");
        require(!voters[_voter].hasVoted, "Cannot remove voter who has voted");
        
        delete voters[_voter];
        
        // Remove from voterAddresses array
        for (uint i = 0; i < voterAddresses.length; i++) {
            if (voterAddresses[i] == _voter) {
                voterAddresses[i] = voterAddresses[voterAddresses.length - 1];
                voterAddresses.pop();
                break;
            }
        }
        
        emit VoterRemoved(_voter);
    }

    function addProposal(string memory _name, string memory _description) public onlyAdmin {
        proposals.push(Proposal({
            name: _name,
            description: _description,
            voteCount: 0,
            isActive: true
        }));
        
        emit ProposalAdded(proposals.length - 1, _name);
    }

    function toggleProposalStatus(uint _proposalIndex) public onlyAdmin {
        require(_proposalIndex < proposals.length, "Invalid proposal index");
        proposals[_proposalIndex].isActive = !proposals[_proposalIndex].isActive;
        emit ProposalStatusChanged(_proposalIndex, proposals[_proposalIndex].isActive);
    }

    function vote(uint _proposalIndex) public onlyDuringVotingPeriod {
        require(voters[msg.sender].isRegistered, "You are not registered to vote");
        require(!voters[msg.sender].hasVoted, "You have already voted");
        require(_proposalIndex < proposals.length, "Invalid proposal");
        require(proposals[_proposalIndex].isActive, "Proposal is not active");

        voters[msg.sender].hasVoted = true;
        voters[msg.sender].voteIndex = _proposalIndex;
        proposals[_proposalIndex].voteCount++;

        emit Voted(msg.sender, _proposalIndex, block.timestamp);
    }

    // View functions
    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }

    function getVoterCount() public view returns (uint) {
        return voterAddresses.length;
    }

    function getVotingStatus() public view returns (bool isActive, uint timeRemaining) {
        if (!votingActive || block.timestamp >= votingEnd) {
            return (false, 0);
        }
        return (true, votingEnd - block.timestamp);
    }

    function getVoterInfo(address _voter) public view returns (Voter memory) {
        return voters[_voter];
    }
    
    function getProposalsCount() public view returns (uint256) {
        return proposals.length;
    }

    function votingOpen() public view returns (bool) {
        return true; // Modify based on your voting period logic
    }
}