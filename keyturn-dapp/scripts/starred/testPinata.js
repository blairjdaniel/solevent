require('dotenv').config({ path: '.env.local' });

const fs = require("fs");
const fetch = require("node-fetch");


const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET_API_KEY;

async function testPinata() {

  console.log("API KEY:", PINATA_API_KEY);
  console.log("SECRET:", PINATA_SECRET);
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const data = JSON.stringify({ hello: "Pinata!" });
  const filePath = "./test.json";
  fs.writeFileSync(filePath, data);

  const FormData = require("form-data");
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET,
        ...form.getHeaders(),
      },
      body: form,
    });

    const result = await res.json();
    if (res.ok) {
      console.log("Success! IPFS Hash:", result.IpfsHash);
    } else {
      console.error("Error:", result);
    }
  } catch (e) {
    console.error("Request failed:", e);
  } finally {
    fs.unlinkSync(filePath);
  }
}

testPinata();