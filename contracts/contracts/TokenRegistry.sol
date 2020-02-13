pragma solidity ^0.5.8;

import "./ReserveBank.sol";
import "./Registry.sol";
import "./lib/EthereumDIDRegistry.sol";
import "./lib/Dai.sol";
import "./lib/Ownable.sol";

contract TokenRegistry is Registry, Ownable {
    using SafeMath for uint256;

    /***************
    GLOBAL CONSTANTS
    ***************/
    // Voting period length for a challenge (in unix seconds)
    uint256 public votingPeriodDuration;
    // Deposit that must be made in order to submit a challenge. Returned if challenge is won
    uint256 public challengeDeposit;
    // Application fee to become a member
    uint256 public applicationFee;
    // IPFS hash for charter, which dicates how token data should be posted
    bytes32 public charter;


    // Approved token contract reference (this version = DAI)
    Dai public approvedToken;
    // Reserve bank contract reference
    ReserveBank public reserveBank;
    // ERC-1056 contract reference
    EthereumDIDRegistry public erc1056Registry;

    /******
    EVENTS
    ******/
    // We rely on NewMember and MemberExited to distingushing between identities on
    // ERC-1056 that are part of TokenRegistry and aren't
    event NewMember(address indexed member, uint256 applicationTime, uint256 fee);
    event MemberExited(address indexed member);
    event CharterUpdated(bytes32 indexed data);
    event Withdrawal(address indexed receiver, uint256 amount);

    event TokenRegistryDeployed(
        address indexed reserveBank,
        address owner,
        address approvedToken,
        uint256 votingPeriodDuration,
        uint256 challengeDeposit,
        uint256 applicationFee,
        bytes32 charter
    );

    event MemberChallenged(
        address indexed member,
        uint256 indexed challengeID,
        address indexed challenger,
        uint256 challengeEndTime,
        bytes32 details
    );

    event SubmitVote(
        uint256 indexed challengeID,
        address indexed submitter, // msg.sender
        address indexed memberOwner,
        VoteChoice voteChoice,
        uint256 voteWeight
    );

    event ChallengeFailed(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes
    );
    event ChallengeSucceeded(
        address indexed member,
        uint256 indexed challengeID,
        uint256 yesVotes,
        uint256 noVotes
    );

    /****
    STATE
    *****/

    enum VoteChoice {
        Null, // Same as not voting at all (i.e. 0 value)
        Yes,
        No
    }

    // Note that challenge deposit and token held constant in global variable
    struct Challenge {
        address challenger;         // The member who submitted the challenge
        address member;             // The member
        uint256 yesVotes;           // The total number of YES votes for this challenge
        uint256 noVotes;            // The total number of NO votes for this challenge
        uint256 voterCount;         // Total count of voters participating in the challenge
        uint256 endTime;            // Ending time of the challenge
        bytes32 details;            // Challenge details - IPFS hash, without Qm, so it is 32 bytes
        mapping (address => VoteChoice) voteChoiceByMember;     // The choice by each member
        mapping (address => uint256) voteWeightByMember;        // The vote weight of each member
    }

    mapping (uint256 => Challenge) challenges;
    // Challenge counter for challenge IDs. Starts at 1 to prevent confusion with zeroed values
    uint256 challengeCounter = 1;

    /********
    MODIFIERS
    ********/

    /**
    @dev                Modifer that allows a function to be called by a member.
                        Only the member can call
    @param _member      Member interacting with TokenRegistry
    */
    modifier onlyMemberOwner(address _member) {
        require(
            isMember(_member),
            "onlyMemberOwner - Address is not a member"
        );
        address owner = erc1056Registry.identityOwner(_member);
        require(
            owner == msg.sender,
            "onlyMemberOwner - Caller must be the owner"
        );
        _;
    }

    /********
    FUNCTIONS
    ********/
    constructor(
        address _approvedToken,
        uint256 _votingPeriodDuration,
        uint256 _challengeDeposit,
        uint256 _applicationFee,
        bytes32 _charter,
        address _DIDregistry
    ) public {
        require(_approvedToken != address(0), "constructor - _approvedToken cannot be 0");
        require(
            _votingPeriodDuration > 0,
            "constructor - _votingPeriodDuration cant be 0"
        );

        approvedToken = Dai(_approvedToken);
        reserveBank = new ReserveBank(_approvedToken);
        erc1056Registry = EthereumDIDRegistry(_DIDregistry);
        charter = _charter;
        votingPeriodDuration = _votingPeriodDuration;
        challengeDeposit = _challengeDeposit;
        applicationFee = _applicationFee;

        emit TokenRegistryDeployed(
            address(reserveBank),
            msg.sender, // owner
            _approvedToken,
            _votingPeriodDuration,
            _challengeDeposit,
            _applicationFee,
            _charter
        );
    }

    /*******************
    ADD MEMBER FUNCTIONS
    *******************/

    /**
    @dev                            Allows a user to apply to add a member to the Registry
    @param _newMember               The address of the new member
    @param _sigV                    V of the apply and permit() signature : [0] = apply, [1] = permit
    @param _sigR                    R of the apply and permit() signature : [0] = apply, [1] = permit
    @param _sigS                    S of the apply and permit() signature : [0] = apply, [1] = permit
    @param _owner                   Owner of the member application
    */
    function applySignedInternal(
        address _newMember,
        uint8[2] memory _sigV,
        bytes32[2] memory _sigR,
        bytes32[2] memory _sigS,
        address _owner
    ) public {
        require(
            getMembershipStartTime(_newMember) == 0,
            "applySignedInternal - This member already exists"
        );
        /* solium-disable-next-line security/no-block-members*/
        uint256 membershipTime = now;
        setMember(_newMember, membershipTime);

        // This event must be emitted before changeOwnerSigned() is called. This creates an identity
        // in TokenRegistry, and from that point on, ethereumDIDRegistry events are relevant to this
        // identity
        emit NewMember(
            _newMember,
            membershipTime,
            applicationFee
        );

        erc1056Registry.changeOwnerSigned(_newMember, _sigV[0], _sigR[0], _sigS[0], _owner);

        // Approve the TokenRegistry to transfer on the owners behalf
        // Nonce starts at 0. Expiry = 0 is infinite. true is unlimited allowance
        // TODO: add me back in once signing problem is fixed
        /*approvedToken.permit(_owner, address(this), 0, 0, true, _sigV[1], _sigR[1], _sigS[1]);

        // Transfers tokens from owner to the reserve bank
        require(
            approvedToken.transferFrom(_owner, address(reserveBank), applicationFee),
            "applySignedInternal - Token transfer failed"
        );*/
    }

    /**
    @dev                            Allows a user to apply to add a member to the Registry
    @param _newMember               The address of the new member
    @param _sigV                    V of the apply and permit() signature : [0] = apply, [1] = permit
    @param _sigR                    R of the apply and permit() signature : [0] = apply, [1] = permit
    @param _sigS                    S of the apply and permit() signature : [0] = apply, [1] = permit
    @param _owner                   Owner of the member application
    */
    function applySigned(
        address _newMember,
        uint8[2] calldata _sigV,
        bytes32[2] calldata _sigR,
        bytes32[2] calldata _sigS,
        address _owner
    ) external {
        applySignedInternal(_newMember, _sigV, _sigR, _sigS, _owner);
    }

    /**
    @dev                            Allows a user to apply to add a member to the Registry and
                                    add off chain data to the DID registry. Important note - the
                                    signature for changeOwner() and permit() are from newMember.
                                    The signature of changeAttribute is the owner. This is because
                                    when it is called, changeOwner() has already been enacted
    @param _newMember               The address of the new member
    @param _sigV                    V of the apply and permit() signature : [0] = apply, [1] = permit.
    @param _sigR                    R of the apply and permit() signature : [0] = apply, [1] = permit
    @param _sigS                    S of the apply and permit() signature : [0] = apply, [1] = permit
    @param _owner                   Owner of the member application
    @param _attributeSigV           V of the attribute signature. (Signature is of the OWNER)
    @param _attributeSigR           R of the attribute signature
    @param _attributeSigS           S of the attribute signature
    @param _offChainDataName        Attribute name. Should be a string less than 32 bytes, converted
                                    to bytes32. example: 'TokenData' = 0x546f6b656e44617461,
                                    with zeros appended to make it 32 bytes. (add 42 zeros)
    @param _offChainDataValue       Attribute data stored offchain (such as IPFS)
    @param _offChainDataValidity    Length of time attribute data is valid
    */
    function applySignedWithAttribute(
        address _newMember,
        uint8[2] calldata _sigV,
        bytes32[2] calldata _sigR,
        bytes32[2] calldata _sigS,
        address _owner,
        uint8 _attributeSigV,
        bytes32 _attributeSigR,
        bytes32 _attributeSigS,
        bytes32 _offChainDataName,
        bytes calldata _offChainDataValue,
        uint256 _offChainDataValidity
    ) external {
        applySignedInternal(_newMember, _sigV, _sigR, _sigS, _owner);
        erc1056Registry.setAttributeSigned(
            _newMember,
            _attributeSigV,
            _attributeSigR,
            _attributeSigS,
            _offChainDataName,
            _offChainDataValue,
            _offChainDataValidity
        );
    }

    /**
    @dev                Allow a member to voluntarily leave
    @param _member      Member exiting the list
    */
    function memberExit(
        address _member
    ) external onlyMemberOwner(_member) {
        require(
            !memberChallengeExists(_member),
            "memberExit - Can't exit during ongoing challenge"
        );
        deleteMember(_member);
        emit MemberExited(_member);
    }

    /******************
    CHALLENGE FUNCTIONS
    ******************/

    /**
    @dev                        Starts a challenge on a member. Challenger deposits a fee.
    @param _challengingMember   The memberName of the member who is challenging another member
    @param _challengedMember    The memberName of the member being challenged
    @param _details             Extra details relevant to the challenge. (IPFS hash without Qm)
    */
    function challenge(
        address _challengingMember,
        address _challengedMember,
        bytes32 _details
    ) external onlyMemberOwner(_challengingMember) returns (uint256 challengeID) {
        uint256 challengeeMemberTime = getMembershipStartTime(_challengedMember);
        require (challengeeMemberTime > 0, "challenge - Challengee must exist");
        uint256 challengerMemberTime = getMembershipStartTime(_challengingMember);

        uint256 currentChallengeID = getChallengeID(_challengedMember);
        if(currentChallengeID > 0){
            require(
                challengeCanBeResolved(currentChallengeID),
                "challenge - Member can't be challenged multiple times at once"
            );
            // Doing this allows us to never get stuck in a state with unresolved challenges
            // Also, the challenge rewards the deposit fee to winner or loser, so they are
            // financially motivated too
            resolveChallenge(currentChallengeID);
        }

        require(
            _challengingMember != _challengedMember,
            "challenge - Can't challenge self"
        );

        uint256 newChallengeID = challengeCounter;
        Challenge memory newChallenge = Challenge({
            challenger: _challengingMember,
            member: _challengedMember,
            /* solium-disable-next-line security/no-block-members*/
            yesVotes: now - challengerMemberTime,
            noVotes: 0,
            voterCount: 1,
            /* solium-disable-next-line security/no-block-members*/
            endTime: now + votingPeriodDuration,
            details: _details
        });
        challengeCounter++;

        challenges[newChallengeID] = newChallenge;

        // Updates member to store most recent challenge
        editChallengeID(_challengedMember, newChallengeID);

        // Takes tokens from challenger
        require(
            approvedToken.transferFrom(msg.sender, address(reserveBank), challengeDeposit),
            "challenge - Token transfer failed"
        );

        emit MemberChallenged(
            _challengedMember,
            newChallengeID,
            _challengingMember,
            /* solium-disable-next-line security/no-block-members*/
            now + votingPeriodDuration,
            newChallenge.details
        );

        // Insert challengers vote into the challenge
        submitVote(newChallengeID, VoteChoice.Yes, _challengingMember);
        return newChallengeID;
    }

    /**
    @dev                    Allow an owner to submit a vote
    @param _challengeID     The challenge ID
    @param _voteChoice      The vote choice (yes or no)
    @param _votingMember    The member who is voting (note owner is msg.sender)
    */
    function submitVote(
        uint256 _challengeID,
        VoteChoice _voteChoice,
        address _votingMember
    ) public onlyMemberOwner(_votingMember) {
        require(
            _voteChoice == VoteChoice.Yes || _voteChoice == VoteChoice.No,
            "submitVote - Vote must be either Yes or No"
        );

        Challenge storage storedChallenge = challenges[_challengeID];
        require(
            storedChallenge.endTime > 0,
            "submitVote - Challenge does not exist"
        );
        require(
            !hasVotingPeriodExpired(storedChallenge.endTime),
            "submitVote - Challenge voting period has expired"
        );
        require(
            storedChallenge.voteChoiceByMember[_votingMember] == VoteChoice.Null,
            "submitVote - Member has already voted on this challenge"
        );

        require(
            storedChallenge.member != _votingMember,
            "submitVote - Member can't vote on their own challenge"
        );

        uint256 memberStartTime = getMembershipStartTime(_votingMember);
        // The lower the member start time (i.e. the older the member) the more vote weight
        uint256 voteWeight = storedChallenge.endTime.sub(memberStartTime);
        storedChallenge.voteChoiceByMember[_votingMember] = _voteChoice;
        storedChallenge.voteWeightByMember[_votingMember] = voteWeight;
        storedChallenge.voterCount += 1;

        // Count vote
        if (_voteChoice == VoteChoice.Yes) {
            storedChallenge.yesVotes = storedChallenge.yesVotes.add(voteWeight);
        } else if (_voteChoice == VoteChoice.No) {
            storedChallenge.noVotes = storedChallenge.noVotes.add(voteWeight);
        }

        emit SubmitVote(_challengeID, msg.sender, _votingMember, _voteChoice, voteWeight);
    }

    // TODO - test gas limit for this, and maybe hard code in the array size
    /**
    @dev                    Submit many votes from owner with multiple members they own
    @param _challengeID     The challenge ID
    @param _voteChoices     The vote choices (yes or no)
    @param _voters          The members who are voting
    */
    function submitVotes(
        uint256 _challengeID,
        VoteChoice[] memory _voteChoices,
        address[] memory _voters
    ) public {
        require(
            _voteChoices.length == _voters.length,
            "SubmitVotes - Arrays must be equal"
        );
        for (uint256 i; i < _voteChoices.length; i++){
            submitVote(_challengeID, _voteChoices[i], _voters[i]);
        }
    }
    /**
    @dev                    Resolve a challenge. Anyone can call this function. A successful
                            challenge means the member is removed.
    @param _challengeID     The challenge ID
    */
    function resolveChallenge(uint256 _challengeID) public {
        challengeCanBeResolved(_challengeID);
        Challenge storage storedChallenge = challenges[_challengeID];

        bool didPass = storedChallenge.yesVotes > storedChallenge.noVotes;
        bool moreThanOneVote = storedChallenge.voterCount > 1;
        if (didPass && moreThanOneVote) {

            // Transfer challenge deposit and losers application fee
            // to challenger for winning challenge
            require(
                withdraw(storedChallenge.challenger, challengeDeposit + applicationFee),
                "resolveChallenge - Rewarding challenger failed"
            );
            deleteMember(storedChallenge.member);
            emit ChallengeSucceeded(
                storedChallenge.member,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes
            );
        } else {
            // Transfer challenge deposit to challengee
            require(
                withdraw(storedChallenge.challenger, challengeDeposit),
                "resolveChallenge - Rewarding challenger failed"
            );
            // Remove challenge ID from registry
            editChallengeID(storedChallenge.member, 0);
            emit ChallengeFailed(
                storedChallenge.member,
                _challengeID,
                storedChallenge.yesVotes,
                storedChallenge.noVotes
            );
        }

        // Delete challenge from TokenRegistry in either case
        delete challenges[_challengeID];
    }

    /***************
    TOKENREGISTRY OWNER FUNCTIONS
    ***************/

    /**
    @dev                Allows the owner of TokenRegistry to withdraw funds from the reserve bank
                        in the case of an emergency, or an upgrade from V1. With plans
                        to decentralize this functionality in the future.
    @param _receiver    The address receiving funds
    @param _amount      The amount of funds being withdrawn
    */
    function withdraw(address _receiver, uint256 _amount) public onlyOwner returns (bool) {
        emit Withdrawal(_receiver, _amount);
        return reserveBank.withdraw(_receiver, _amount);
    }

    /**
    @dev                Updates the charter for the TokenRegistry
    @param _newCharter  The data that point to the new charter
    */
    function updateCharter(bytes32 _newCharter) public onlyOwner {
        charter = _newCharter;
        emit CharterUpdated(charter);
    }

    /***************
    GETTER FUNCTIONS
    ***************/

    /**
    @dev                    Returns true if a challenge vote period has finished
    @param _endTime  The starting period of the challenge
    */
    function hasVotingPeriodExpired(uint256 _endTime) public view returns (bool) {
        /* solium-disable-next-line security/no-block-members*/
        return now >= _endTime;
    }

    /**
    @dev            Returns true if the address is a member
    @param _member  The member name of the member whose status is to be examined
    */
    function isMember(address _member) public view returns (bool){
        uint256 startTime = getMembershipStartTime(_member);
        if (startTime > 0){
            return true;
        }
        return false;
    }

    /**
    @dev            Returns true if the member has an unresolved challenge. False if the challenge
                    does not exist.
    @param _member  The member that is being checked for a challenge.
    */
    function memberChallengeExists(address _member) public view returns (bool) {
        uint256 challengeID = getChallengeID(_member);
        return (challengeID > 0);
    }

    /**
    @dev                Determines whether voting has concluded in a challenge for a given
                        member. Throws if challenge can't be resolved
    @param _challengeID The challenge ID
    */
    function challengeCanBeResolved(uint256 _challengeID) public view returns (bool) {
        Challenge storage storedChallenge = challenges[_challengeID];
        require(
            challenges[_challengeID].endTime > 0,
            "challengeCanBeResolved - Challenge does not exist or was completed"
        );
        require(
            hasVotingPeriodExpired(storedChallenge.endTime),
            "challengeCanBeResolved - Challenge is not ready to be resolved"
        );
        return true;
    }
}
