// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract Verify{
    mapping (string => string) public ipfs;
    function addPdfLink(string memory id, string memory link) external { 
        ipfs[id] = link;
    }
    function getPdfLink(string memory id) external view returns (string memory) {
       return ipfs[id];
    } 
    function sendViaCall(address payable _to) external payable {
       _to.transfer(msg.value);
    }   
}
     