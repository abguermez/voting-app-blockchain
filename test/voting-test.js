const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
  it("should deploy the Voting contract successfully", async () => {
    const instance = await Voting.deployed();
    assert(instance.address !== "", "Contract address should not be empty");
  });
});
