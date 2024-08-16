// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Deadstreet {
    struct Paste {
        string content;
        address owner;
        uint256 timestamp;
    }

    mapping(uint256 => Paste) public pastes;
    mapping(uint256 => bool) public pasteExists;
    uint256 public pasteCount;

    event PasteCreated(uint256 indexed pasteId, address indexed owner, string content, uint256 timestamp);
    event PasteDeleted(uint256 indexed pasteId, address indexed owner);

    constructor() {
        pasteCount = 0;
    }

    function createPaste(string memory _content) public {
        require(bytes(_content).length > 0, "Content cannot be empty");
        Paste memory newPaste = Paste({
            content: _content,
            owner: msg.sender,
            timestamp: block.timestamp
        });
        pastes[pasteCount] = newPaste;
        pasteExists[pasteCount] = true;
        emit PasteCreated(pasteCount, msg.sender, _content, block.timestamp);
        pasteCount++;
    }

    function getPaste(uint256 _pasteId) public view returns (string memory content, address owner, uint256 timestamp) {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has been deleted");
        Paste memory paste = pastes[_pasteId];
        return (paste.content, paste.owner, paste.timestamp);
    }

    function deletePaste(uint256 _pasteId) public {
        require(_pasteId < pasteCount, "Paste ID does not exist");
        require(pasteExists[_pasteId], "Paste has already been deleted");
        require(pastes[_pasteId].owner == msg.sender, "Only the owner can delete this paste");
        
        delete pastes[_pasteId];
        delete pasteExists[_pasteId];
        emit PasteDeleted(_pasteId, msg.sender);
    }
}