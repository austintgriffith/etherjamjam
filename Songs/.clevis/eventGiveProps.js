//
// usage: node contract GiveProps Songs
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('GiveProps', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
