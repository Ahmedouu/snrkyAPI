const snarkjs = require('snarkjs');
const fs = require('fs');
const { publicDecrypt } = require('crypto');

async function generate_proof() {

  const { proof, publicSignals } = await snarkjs.groth16.fullProve({in: 10}, "build/poseidon_hasher_js/poseidon_hasher.wasm", "circuit_0000.zkey");
  //console.log(publicSignals);
  //console.log(proof)
  return {proof, publicSignals};


}

async function verify(){ //the middleware
  const vkey = JSON.parse(fs.readFileSync("verification_key.json"));
  const {proof, publicSignals} = await generate_proof();
  const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  if ( res === true ){
    console.log("Verifcation okay!")
  }
  else {
    console.log("Invalid proof")
  }
}
verify();
