// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(address => uint256[]) userNftIds;

    constructor() ERC721("Book", "BK") {}

    function mintBookNFT(address reader, string memory ipfsHash) public {
        uint256 newItemId = _tokenIds.current();
        _mint(reader, newItemId);
        _setTokenURI(newItemId, ipfsHash);

        userNftIds[reader].push(newItemId);
        _tokenIds.increment();
    }

    function updateBookURI(
        address author,
        string memory oldHash,
        string memory newHash
    ) public {
        uint256[] memory nftIds = userNftIds[author];

        for (uint i = 0; i < nftIds.length; i++) {
            if (
                keccak256(abi.encodePacked(tokenURI(nftIds[i]))) ==
                keccak256(abi.encodePacked(oldHash))
            ) {
                _setTokenURI(nftIds[i], newHash);
                break;
            }
        }
    }

    function getAllBookURIs() public view returns (string[] memory) {
        if (_tokenIds.current() != 0) {
            string[] memory allBookURIs = new string[](_tokenIds.current());

            for (uint256 i = 0; i < _tokenIds.current(); i++) {
                allBookURIs[i] = tokenURI(i);
            }

            return allBookURIs;
        }

        string[] memory emptyArr;
        return emptyArr;
    }

    function getAuthorBookURIs(
        address author
    ) public view returns (string[] memory) {
        uint256[] memory nftIds = userNftIds[author];
        string[] memory bookURIs = new string[](nftIds.length);

        for (uint i = 0; i < nftIds.length; i++) {
            bookURIs[i] = tokenURI(nftIds[i]);
        }
        return bookURIs;
    }
}
