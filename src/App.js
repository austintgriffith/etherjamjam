import React, { Component } from 'react';
import './App.css';
import { Dapparatus, Gas, ContractLoader, Transactions, Events, Scaler, Blockie, Address, Button } from "dapparatus"
import Web3 from 'web3';

const METATX = {
  endpoint:"http://0.0.0.0:10001/",
  contract:"0xf5bf6541843D2ba2865e9aeC153F28aaD96F6fbc",
  //accountGenerator: "//account.metatx.io",
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: false,
      account: false,
      gwei: 4,
      addSong: "spotify:track:11NpHoPIRGEQxp0lWB46Ys",
    }
  }
  handleInput(e){
    let update = {}
    update[e.target.name] = e.target.value
    this.setState(update)
  }
  componentDidMount(){

  }
  render() {
    let {web3,account,contracts,tx,gwei,block,avgBlockTime,etherscan} = this.state
    let connectedDisplay = []
    let contractsDisplay = []
    if(web3){
      connectedDisplay.push(
       <Gas
         key="Gas"
         onUpdate={(state)=>{
           console.log("Gas price update:",state)
           this.setState(state,()=>{
             console.log("GWEI set:",this.state)
           })
         }}
       />
      )

      connectedDisplay.push(
        <ContractLoader
         key="ContractLoader"
         config={{DEBUG:true}}
         web3={web3}
         require={path => {return require(`${__dirname}/${path}`)}}
         onReady={(contracts,customLoader)=>{
           console.log("contracts loaded",contracts)
           this.setState({contracts:contracts},async ()=>{

                console.log("====!! Loading dyamic contract "+METATX.contract)
                let metaContract = customLoader("BouncerProxy",METATX.contract)//new this.state.web3.eth.Contract(require("./contracts/BouncerProxy.abi.js"),this.state.address)
                console.log("====!! metaContract:",metaContract)
                this.setState({metaContract:metaContract})

            })
         }}
        />
      )
      connectedDisplay.push(
        <Transactions
          key="Transactions"
          config={{DEBUG:false}}
          account={account}
          gwei={gwei}
          web3={web3}
          block={block}
          avgBlockTime={avgBlockTime}
          etherscan={etherscan}
          metaAccount={this.state.metaAccount}
          metaContract={this.state.metaContract}
          metatx={METATX}
          onReady={(state)=>{
            console.log("Transactions component is ready:",state)
            this.setState(state)
          }}
          onReceipt={(transaction,receipt)=>{
            // this is one way to get the deployed contract address, but instead I'll switch
            //  to a more straight forward callback system above
            console.log("Transaction Receipt",transaction,receipt)
          }}
        />
      )

      if(contracts){

        let songs = []

        for(let s in this.state.AddedSongs){
          let sender = this.state.AddedSongs[s]._sender
          let song = this.state.web3.utils.hexToUtf8(this.state.AddedSongs[s]._song)

          let metaAddress = ""
          if(sender == this.state.metaContract._address){
            console.log("SENDER IS METAACCOUNT, SEARCH FOR ACCOUNT IN FORWARDS!")
            for(let f in this.state.MetaForwards){
              if(this.state.MetaForwards[f].destination==contracts.Songs._address){
                console.log("FOUND ONE GOING TO THIS CONTRACT:",this.state.MetaForwards[f].data,this.state.MetaForwards[f].signer)
                if(this.state.MetaForwards[f].data.indexOf("0x3b639f0e")>=0){
                  console.log("this is the addSong function...")
                  let parts = this.state.MetaForwards[f].data.substring(10)
                  let thisSong = this.state.web3.utils.hexToUtf8("0x"+parts)
                  if(song==thisSong){
                    metaAddress=this.state.MetaForwards[f].signer
                  }
                }
              }
            }
          }

          let extraBlockie = ""
          if(metaAddress){
            extraBlockie = (
              //metaAddress
              <div style={{position:"absolute",left:-25,top:8}}>
                <Blockie config={{size:8}} address={metaAddress}/>
              </div>
            )
          }

          songs.push(
            <div id={s} style={{position:"relative"}}>
              <Blockie config={{size:10}} address={sender}/>
              {extraBlockie}
              <iframe src={"https://open.spotify.com/embed/track/"+song} width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>
              <div style={{position:"absolute",left:380,top:12}}>
                <Button size="2" style={{}} onClick={()=>{
                  let songHex = this.state.web3.utils.toHex(song)
                  tx(
                    contracts.Songs.giveProps(sender,songHex),
                    50000,
                    "0x00",
                    5000000000000000,
                    (receipt)=>{
                      console.log("TX DONE",receipt)
                    })
                  }}>
                  Give Props
                </Button>
              </div>
            </div>
          )
        }

        let metaEventLoader = ""
        if(this.state.metaContract){
          metaEventLoader = (
            <Events
              config={{hide:true}}
                contract={this.state.metaContract}
                eventName={"Forwarded"}
                block={this.state.block}
                onUpdate={(eventData,allEvents)=>{
                  console.log("Forwarded",eventData)
                  this.setState({MetaForwards:allEvents.reverse()})
                }}
            />
          )
        }

        contractsDisplay.push(
          <div key="UI" style={{padding:30}}>
            <div>
              <Address
                {...this.state}
                address={contracts.Songs._address}
              />
            </div>
            Add Song: <input
                style={{verticalAlign:"middle",width:400,margin:6,maxHeight:20,padding:5,border:'2px solid #ccc',borderRadius:5}}
                type="text" name="addSong" value={this.state.addSong} onChange={this.handleInput.bind(this)}
            />
            <Button size="2" onClick={()=>{
                let song = this.state.addSong.replace("spotify:track:","")
                let songHex = this.state.web3.utils.toHex(song)
                console.log("ADD SONG",song,songHex)
                tx(contracts.Songs.addSong(songHex),
                50000,
                (receipt)=>{
                  console.log("TX DONE",receipt)
                })
              }}>
              Add Song
            </Button>
            <div style={{padding:20}}>
              {songs}
            </div>
            <Events
              config={{hide:true}}
              contract={contracts.Songs}
              eventName={"AddSong"}
              block={block}
              onUpdate={(eventData,allEvents)=>{
                console.log("EVENT DATA:",eventData)
                this.setState({AddedSongs:allEvents.reverse()})
              }}
            />
            <Events
              config={{hide:false}}
              contract={contracts.Songs}
              eventName={"GiveProps"}
              block={block}
              onUpdate={(eventData,allEvents)=>{
                console.log("EVENT DATA:",eventData)
                this.setState({GivenProps:allEvents})
              }}
            />
            {metaEventLoader}
          </div>
        )
      }

    }
    return (
      <div className="App">
        <Dapparatus
          config={{
            DEBUG:false,
            requiredNetwork:['Unknown','Rinkeby'],
          }}
          metatx={METATX}
          fallbackWeb3Provider={new Web3.providers.HttpProvider('http://0.0.0.0:8545')}
          onUpdate={(state)=>{
           console.log("metamask state update:",state)
           if(state.web3Provider) {
             state.web3 = new Web3(state.web3Provider)
             this.setState(state)
           }
          }}
        />
        {connectedDisplay}
        {contractsDisplay}
      </div>
    );
  }
}

export default App;