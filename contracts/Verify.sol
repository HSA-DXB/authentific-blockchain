// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.0;

// contract Verify{
//     mapping (string => string) public ipfs;
//     function addPdfLink(string memory id, string memory link) external { 
//         ipfs[id] = link;
//     }
//     function getPdfLink(string memory id) external view returns (string memory) {
//        return ipfs[id];
//     } 
//     function sendViaCall(address payable _to) external payable {
//        _to.transfer(msg.value);
//     }   
// }

// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

contract Verify{
    mapping (string => string) public ipfs;
    function addPdfLink(string memory id, string memory link, address payable _to) external payable { 
        if(bytes(ipfs[id]).length > 0){
            revert("Error! Already exist.");
        }
         _to.transfer(msg.value);
        ipfs[id] = link;
    }
    function getPdfLink(string memory id) external view returns (string memory) {
       return ipfs[id];
    }  
} 
     
     