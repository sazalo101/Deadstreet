// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Deadstreet {
    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    struct Paste {
        string content;
        address owner;
        uint256 timestamp;
        uint256 upvotes;
        Comment[] comments;
    }

    mapping(uint256 => Paste) public pastes;
    mapping(uint256 => bool) public pasteExists;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    uint256 public pasteCount;

    event PasteCreated(uint256 indexed pasteId, address indexed owner, string content, uint256 timestamp);
    event PasteDeleted(uint256 indexed pasteId, address indexed owner);
    event PasteUpvoted(uint256 indexed pasteId, address indexed upvoter);
    event CommentAdded(uint256 indexed pasteId, address indexed commenter, string content);

    constructor() {
        pasteCount = 0;
    }

    function createPaste(string memory _content) public {
        require(bytes(_content).length > 0, "Content cannot be empty");
        Paste storage newPaste = pastes[pasteCount];
        newPaste.content = _content;
        newPaste.owner = msg.sender;
        newPaste.timestamp = block.timestamp;
        newPaste.upvotes = 0;
        pasteExists[pasteCount] = true;
        emit PasteCreated(pasteCount, msg.sender, _content, block.timestamp);
        pasteCount++;
    }

    function getPaste(uint256 _pasteId) public view returns (string memory content, address owner, uint256 timestamp, uint256 upvotes, uint256 commentCount) {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has been deleted");
        Paste storage paste = pastes[_pasteId];
        return (paste.content, paste.owner, paste.timestamp, paste.upvotes, paste.comments.length);
    }

    function deletePaste(uint256 _pasteId) public {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has already been deleted");
        require(pastes[_pasteId].owner == msg.sender, "Only the owner can delete this paste");
        
        delete pastes[_pasteId];
        delete pasteExists[_pasteId];
        emit PasteDeleted(_pasteId, msg.sender);
    }

    function upvotePaste(uint256 _pasteId) public {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has been deleted");
        require(!hasUpvoted[_pasteId][msg.sender], "You have already upvoted this paste");

        pastes[_pasteId].upvotes++;
        hasUpvoted[_pasteId][msg.sender] = true;
        emit PasteUpvoted(_pasteId, msg.sender);
    }

    function addComment(uint256 _pasteId, string memory _content) public {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has been deleted");
        require(bytes(_content).length > 0, "Comment cannot be empty");

        Comment memory newComment = Comment({
            commenter: msg.sender,
            content: _content,
            timestamp: block.timestamp
        });

        pastes[_pasteId].comments.push(newComment);
        emit CommentAdded(_pasteId, msg.sender, _content);
    }

    function getComments(uint256 _pasteId) public view returns (Comment[] memory) {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has been deleted");
        return pastes[_pasteId].comments;
    }
}