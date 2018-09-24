//
// usage: clevis contract addSong Songs ##accountindex## _song
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running addSong("+args[4]+") as account ["+params.accounts[args[3]]+"]")
  return contract.methods.addSong(args[4]).send({
    from: params.accounts[args[3]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
