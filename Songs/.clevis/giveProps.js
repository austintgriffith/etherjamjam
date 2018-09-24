//
// usage: clevis contract giveProps Songs ##accountindex## _to _song
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running giveProps("+args[5]+","+args[6]+") as account ["+params.accounts[args[3]]+"] sending value ("+args[4]+")")
  return contract.methods.giveProps(args[5],args[6]).send({
    from: params.accounts[args[3]],
    value: args[4],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
