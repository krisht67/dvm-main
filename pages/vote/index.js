import React, { Component } from 'react'
// import React from 'react'
import Navbaradmin from '../../components/Navbaradmin'
import Navbarvoter from '../../components/Navbarvoter'
import NotInit from '../../components/NotInit'
import Link from 'next/link'
import Web3 from 'web3'
//Contracts
import getWeb3 from '../../getWeb3'
import Election from '../../client/src/contracts/Election.json'
export default class Voting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      ElectionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      candidateCount: undefined,
      candidates: [],
      isElStarted: false,
      isElEnded: false,
      currentVoter: {
        address: undefined,
        name: null,
        phone: null,
        hasVoted: false,
        isVerified: false,
        isRegistered: false,
      },
    }
  }
  componentDidMount = async () => {
    // refreshing once
    if (!window.location.hash) {
      window.location = window.location + '#loaded'
      window.location.reload()
    }
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3()

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts()

      // Get the contract instance.
      const networkId = await web3.eth.net.getId()
      const deployedNetwork = Election.networks[networkId]
      const instance = new web3.eth.Contract(
        Election.abi,
        deployedNetwork && deployedNetwork.address
      )

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        ElectionInstance: instance,
        account: accounts[0],
      })

       // Total number of candidates
       const candidateCount = await this.state.ElectionInstance.methods
       .getTotalCandidate()
       .call()
       this.setState({ candidateCount: candidateCount })
       const positionCount = await this.state.ElectionInstance.methods
       .getTotalPosition()
       .call()
       const positionList = await this.state.ElectionInstance.methods
       .getPositionList()
       .call()

       console.log("pos",positionList)
       this.setState({positionList:positionList})
       let candidatesTemp = []
       for (let i = 0; i < positionCount; i++) {
         const candidates = await this.state.ElectionInstance.methods
           .getCandidatesByPosition(this.state.positionList[i])
           .call()
           candidatesTemp[i] = {
             pos: this.state.positionList[i],
             candidates: candidates
           }
         
       }

       console.log("final",candidatesTemp)

      // Get start and end values
      const start = await this.state.ElectionInstance.methods.getStart().call()
      this.setState({ isElStarted: start })
      const end = await this.state.ElectionInstance.methods.getEnd().call()
      this.setState({ isElEnded: end })

      this.setState({ candidates: candidatesTemp })

      // Loading current voter
      const voter = await this.state.ElectionInstance.methods
        .voterDetails(this.state.account)
        .call()
      this.setState({
        currentVoter: {
          address: voter.voterAddress,
          name: voter.name,
          phone: voter.phone,
          hasVoted: voter.hasVoted,
          isVerified: voter.isVerified,
          isRegistered: voter.isRegistered,
        },
      })

      // Admin account and verification
      const admin = await this.state.ElectionInstance.methods.getAdmin().call()
      if (this.state.account === admin) {
        this.setState({ isAdmin: true })
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      )
      console.error(error)
    }
  }

  renderCandidates = (candidate,index) => {
    const castVote = async (id,slogan) => {
      console.log(candidate.candidateId)
      try{
        // const isVoted = await this.state.ElectionInstance.methods.isVoted(id,candidate.slogan).call();
        // console.log(isVoted)
        // if (!isVoted){
          console.log(index,candidate.slogan)
          await this.state.ElectionInstance.methods
            .vote(index,candidate.slogan)
            .send({ from: this.state.account, gas: 1000000 })
          window.location.reload()
        // }else{

        // }
      }catch(error){
        alert("You have already voted")
        console.log("error")
      }
    }
    const confirmVote = (id, header,slogan) => {
      var r = window.confirm(
        'Vote for ' + header + ' with Id ' + id + 1 + '.\nAre you sure?'
      )
      if (r === true) {
        castVote(id,slogan)
      }
    }
    return (
      <div className="container-item">
        <div className="candidate-info">
          <h2>
            <small>Candidate Id. #{candidate.candidateId}</small> <br /> Name:{' '}
            {candidate.header}
          </h2>
          <p className="slogan"> Post: {candidate.slogan}</p>
        </div>
        <br />
        <div className="vote-btn-container">
          <button
            onClick={() => confirmVote(candidate.candidateId, candidate.header,candidate.slogan)}
            className="btn btn-success ml-10"
            disabled={
              !this.state.currentVoter.isRegistered ||
              !this.state.currentVoter.isVerified ||
              this.state.currentVoter.hasVoted
            }
          >
            Vote
          </button>
        </div>
      </div>
    )
  }

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <Navbaradmin /> : <Navbarvoter />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      )
    }

    return (
      <>
        {this.state.isAdmin ? <Navbaradmin /> : <Navbarvoter />}
        <div>
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <>
              {this.state.currentVoter.isRegistered ? (
                this.state.currentVoter.isVerified ? (
                  this.state.currentVoter.hasVoted ? (
                    <div className="m-4 flex items-center justify-center rounded-lg bg-teal-500 p-6">
                      <div>
                        <strong className="text-black">
                          You've casted your vote.
                        </strong>
                        <p />
                        <center>
                          <button className="btn-outline btn btn-secondary mt-6">
                            <Link
                              href="/results"
                              style={{
                                color: 'black',
                                textDecoration: 'underline',
                              }}
                            >
                              See Results
                            </Link>
                          </button>
                        </center>
                      </div>
                    </div>
                  ) : (
                    <div className="container-item success text-black">
                      <center>Go ahead and cast your vote.</center>
                    </div>
                  )
                ) : (
                  <div className="m-4 rounded-lg bg-blue-800 p-6 text-black">
                    <center>Please wait for admin to verify.</center>
                  </div>
                )
              ) : (
                <>
                  <div className="mockup-code bg-blue-800">
                    <center>
                      <p>You're not registered. Please register first.</p>
                      <br />
                      <Link href="/registration" className="text-black ">
                        <span className="cursor-pointer text-fuchsia-400">
                          Registration Page
                        </span>
                      </Link>
                    </center>
                  </div>
                </>
              )}
              <div className="container-main">
                <h1 className="align-center justify-center text-lg">
                  Candidates
                </h1>
                <h2 className="align-center flex items-center justify-center text-lg">
                  Total Posts: {this.state.candidates.length}
                </h2>
                {this.state.candidates.length < 1 ? (
                  <div className="container-item attention">
                    <center>Not one to vote for.</center>
                  </div>
                ) : (
                  <>
                    {
                      this.state.candidates.map((item,ind)=>{

                          {
                            return(
                              <div key={ind} className='flex flex-col text-xl font-bold '>
                                <p>{item?.pos}</p>
                                { item?.candidates?.map(this.renderCandidates)}
                              </div>
                            )
                          }
                        
                      })
                    }
                    <div
                      className="container-item"
                      style={{ border: '1px solid black' }}
                    >
                    </div>
                  </>
                )}
              </div>
            </>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            <div className="flex items-center justify-center">
              <div className="align-center m-2  w-fit   rounded-lg bg-teal-500 p-4 text-lg text-black ">
                <center>
                  <h3>The Election ended.</h3>
                  <br />
                  <Link
                    href="/results"
                    style={{ color: 'black', textDecoration: 'underline' }}
                  >
                    <span className="btn btn-success">See results</span>
                  </Link>
                </center>
              </div>
            </div>
          ) : null}
        </div>
      </>
    )
  }
}
