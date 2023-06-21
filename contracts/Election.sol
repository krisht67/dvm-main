// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.9.0;
pragma experimental ABIEncoderV2;

contract Election {
    address public admin;
    uint256 candidateCount;
    uint256 positionCount;
    uint256 voterCount;
    bool start;
    bool end;

    constructor() public {
        // Initilizing default values
        admin = msg.sender;
        candidateCount = 0;
        positionCount = 0;
        voterCount = 0;
        start = false;
        end = false;
    }

    function getAdmin() public view returns (address) {
        // Returns account address used to deploy contract (i.e. admin)
        return admin;
    }

    modifier onlyAdmin() {
        // Modifier for only admin access
        require(msg.sender == admin);
        _;
    }
    // Modeling a candidate
    struct Candidate {
        uint256 candidateId;
        string header;
        string slogan;
        uint256 voteCount;
    }

    struct Position {
        string name;
        uint256 candidateCount;
        mapping(uint256 => Candidate) candidates;
    }

    mapping(string => Position) public positions;
    mapping(uint256 => string) public positionsList;

    //mapping(uint256 => Candidate) public candidateDetails;
    //mapping(string => Candidate) public candidates;
    // Adding new candidates


    function addCandidate(string memory _header, string memory _slogan)
        public
        // Only admin can add
        onlyAdmin
    {
        Candidate memory newCandidate =
            Candidate({
                candidateId: candidateCount,
                header: _header,
                slogan: _slogan,
                voteCount: 0
            });

        

        Position storage position = positions[_slogan];
        if (bytes(position.name).length > 0) {
            
             //require(bytes(position.candidates[candidateName].name).length == 0, "Candidate already exists");
            positions[_slogan].candidates[position.candidateCount] = newCandidate;
            positions[_slogan].candidateCount+=1;
        }
        else {
            positionsList[positionCount] = _slogan;
            positions[_slogan].name = _slogan;
            positionCount+=1;
            positions[_slogan].candidateCount=1;
            positions[_slogan].candidates[0] = newCandidate;
        }

        

        //require(bytes(position.name).length != 0, "Invalid position");

        //require(position.candidates[candidateCount].candidateId, "Candidate already exists");
        //candidateDetails[candidateCount] = newCandidate;
        candidateCount += 1;

    }

    // Modeling a Election Details
    struct ElectionDetails {
        string adminName;
        string adminEmail;
        string adminTitle;
        string electionTitle;
        string organizationTitle;
    }
    ElectionDetails electionDetails;

    function setElectionDetails(
        string memory _adminName,
        string memory _adminEmail,
        string memory _adminTitle,
        string memory _electionTitle,
        string memory _organizationTitle
    )
        public
        // Only admin can add
        onlyAdmin
    {
        electionDetails = ElectionDetails(
            _adminName,
            _adminEmail,
            _adminTitle,
            _electionTitle,
            _organizationTitle
        );
        start = true;
        end = false;
    }

    // Get Elections details
   
    function getCandidatesByPosition(string memory _slogan) public view returns (Candidate[] memory) {

        Position storage position = positions[_slogan];

        Candidate[] memory candidatesList = new Candidate[](position.candidateCount);
        
        for (uint256 i=0;i<position.candidateCount;i++){
            Candidate memory cand =
                Candidate({
                candidateId: position.candidates[i].candidateId,
                header: position.candidates[i].header,
                slogan: position.candidates[i].slogan,
                voteCount: position.candidates[i].voteCount
                });
            candidatesList[i] = cand;
        }

        return candidatesList;
    }
    function getPositionList() public view returns (string[] memory) {

        string[] memory ret = new string[](positionCount);
        for (uint256 i=0;i<positionCount;i++){
            ret[i] = positionsList[i];
        }

        return ret;
    }
    function getAdminName() public view returns (string memory) {
        return electionDetails.adminName;
    }

    function getAdminEmail() public view returns (string memory) {
        return electionDetails.adminEmail;
    }

    function getAdminTitle() public view returns (string memory) {
        return electionDetails.adminTitle;
    }

    function getElectionTitle() public view returns (string memory) {
        return electionDetails.electionTitle;
    }

    function getOrganizationTitle() public view returns (string memory) {
        return electionDetails.organizationTitle;
    }

    // Get candidates count
    function getTotalCandidate() public view returns (uint256) {
        // Returns total number of candidates
        return candidateCount;
    }

   // function getCandidates() public view returns (Position[] memory) {
   //     Position[] memory ret = new Position[](positionCount);
   //     for (uint i = 0; i < positionCount; i++) {
   //         ret[i] = positions[i];
   //     }
   //     return ret;
   // }

    // Get voters count
    function getTotalVoter() public view returns (uint256) {
        // Returns total number of voters
        return voterCount;
    }
    function getTotalPosition() public view returns (uint256) {
        // Returns total number of voters
        return positionCount;
    }

    // Modeling a voter
    struct Voter {
        address voterAddress;
        string name;
        string phone;
        bool isVerified;
        //bool hasVoted;
        mapping(string => bool) hasVoted;
        bool isRegistered;
    }
    address[] public voters; // Array of address to store address of voters
    mapping(address => Voter) public voterDetails;

    // Request to be added as voter
    function registerAsVoter(string memory _name, string memory _phone) public {
        Voter memory newVoter =
            Voter({
                voterAddress: msg.sender,
                name: _name,
                phone: _phone,
                //hasVoted: false,
                isVerified: false,
                isRegistered: true
            });
        voterDetails[msg.sender] = newVoter;
        voters.push(msg.sender);
        voterCount += 1;
        
    }


    // Verify voter
    function verifyVoter(bool _verifedStatus, address voterAddress)
        public
        // Only admin can verify
        onlyAdmin
    {
        voterDetails[voterAddress].isVerified = _verifedStatus;
    }

    // Vote
    function vote(uint256 candidateId,string memory _slogan) public {
        
        require(voterDetails[msg.sender].isVerified == true);       
        require(voterDetails[msg.sender].hasVoted[_slogan] == false,"Already voted");       
        require(start == true);
        require(end == false);
        positions[_slogan].candidates[candidateId].voteCount += 1;


        voterDetails[msg.sender].hasVoted[_slogan] = true;

        //candidateDetails[candidateId].voteCount += 1;
        //candidateDe[post].voted == true;
    }

    // End election
    function endElection() public onlyAdmin {
        end = true;
        start = false;
    }

    // Get election start and end values
    function getStart() public view returns (bool) {
        return start;
    }

    function getEnd() public view returns (bool) {
        return end;
    }
}
