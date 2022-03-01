// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//import "@openzeppelin/contracts/utils/Counters.sol";

contract Land is ERC721URIStorage {
    uint256 public _tokenIds = 0;
    mapping(uint256 => string) public _games;


    constructor(address addr, string[] memory metadata) ERC721("Land", "LND") {
        for (uint256 i = 0; i < metadata.length; i++) {
            uint256 id = awardItem(addr, metadata[i]);
            _games[id] = "";
            _approve(msg.sender, id);
        }
    }

    function awardItem(address addr, string memory tokenURI)
    public
    returns (uint256)
    {
        uint256 newItemId = _tokenIds;
        _mint(addr, newItemId);
        _setTokenURI(newItemId, tokenURI);
        _tokenIds++;
        return newItemId;
    }

    function setGame(uint256 id, string memory game) public {
        require(ownerOf(id) == msg.sender);
        _games[id] = game;
    }

    function getGame(uint256 id) public view returns (string memory) {
        return _games[id];
    }
}
