const snarkjs = require('snarkjs');
const fs = require('fs');
const express = require('express');
const app = express();

//Generate the proof
async function generate_proof() {

  const { proof, publicSignals } = await snarkjs.groth16.fullProve({in: 10}, "build/poseidon_hasher_js/poseidon_hasher.wasm", "circuit_0000.zkey");
  return {proof, publicSignals};


}

//verify the proof with the key sent by the client.

async function verify(vkey){ //verify the key against the proof
  const {proof, publicSignals} = await generate_proof();
  const res = await snarkjs.groth16.verify(vkey, publicSignals, proof);
  if ( res === true ){
    console.log("Verifcation okay!")
    return true
  }
  else {
    console.log("Invalid proof")
    return false;
  }
}

app.use(express.json()); 

// Middleware for authentication
app.use(async (req, res, next) => {

  const vkey = req.body; 
  if (Object.keys(vkey).length === 0) {
    res.status(400).send('Missing vkey in request body');
  }
  else if (await verify(vkey)) {
    next(); // If the authentication is successful, proceed to the next middleware or route handler
  } else {
    res.status(401).send('Authentication failed'); // If authentication fails, send a 401 Unauthorized response
  }
});

// Now, any route you define here will require your custom authentication to access
app.get('/some_secret', (req, res) => {
  res.send('You accessed this route with successful authentication!');
});

app.listen(4000, ()=>{
  console.log('I am listening')
})