//
// usage: node contract AddSong Songs
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('AddSong', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
