// imports
const {ethers,run,network} = require ("hardhat")

// async main
async function main(){
  const simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
  console.log("Deploying contract...")
  const simpleStorage =await simpleStorageFactory.deploy()
  await simpleStorage.waitForDeployment()
  console.log(`contract deployed to: ${simpleStorage.target}`)

  // What happens when we deploy to our hardhat network?
  // 4==4 true
  // 4=="4" true 
  // 4==="4" false
  if(network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY){
    console.log("waiting for block txes...")
    await simpleStorage.deploymentTransaction().wait(6)
    await verify(simpleStorage.target,[])
  }

  const currentValue = await simpleStorage.retrieve()
  console.log(`Current value is: ${currentValue}`)

  // Update the current value
  const transactionResponse = await simpleStorage.store(7)
  await transactionResponse.wait(1)
  const updatedValue = await simpleStorage.retrieve()
  console.log(`Updated value is : ${updatedValue}`)
}

async function verify(contractAddress, args){
  console.log("Verifying contract..")
  try {
    await run("verify:verify",{
      address: contractAddress,
      constructorArguments: args,
    })
  } catch (e) {
    if(e.message.toLowerCase().includes("already verified")){
      console.log("Already verified!")
    } else{
      console.log(e)
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })