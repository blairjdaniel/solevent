export function logMintContext(wallet: any, candyMachineV3: any, umi?: any) {
  console.log("umi:", umi);
  console.log("wallet:", wallet);
  console.log("candyMachineV3:", candyMachineV3);
  console.log("candyMachineV3.candyMachine:", candyMachineV3?.candyMachine);
}