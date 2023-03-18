// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract BookAccessNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    mapping(address => uint256[]) userNftIds;

    constructor() ERC721("BookAccess", "BA") {}

    function mintAccessNFT(address reader, string memory bookId)
        public
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        _mint(reader, newItemId);
        _setTokenURI(newItemId, bookId);

        userNftIds[reader].push(newItemId);


        _tokenIds.increment();
        return newItemId;
    }

    function getAccessedBooks(address reader)
        public view
        returns (string[] memory)
    {
        uint256[] memory nftIds = userNftIds[reader];
        string[] memory bookIds = new string[](nftIds.length);


        for(uint i = 0; i < nftIds.length; i++) {
            bookIds[i] = tokenURI(nftIds[i]);
        }
        return bookIds;
    }
}