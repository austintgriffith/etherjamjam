pragma solidity ^0.4.24;

contract Songs {
  constructor() public { }

  function addSong(bytes32 _song) public {
    emit AddSong(msg.sender,_song);
  }
  event AddSong(address _sender,bytes32 _song);


  function giveProps(address _to,bytes32 _song) public payable {
    require(
      msg.value>=5000000000000000,
      "Songs:giveProps Not Enough Value"
    );
    _to.send(msg.value);
    emit GiveProps(_to,_song,msg.value);
  }
  event GiveProps(address _to,bytes32 _song,uint256 _value);
}
