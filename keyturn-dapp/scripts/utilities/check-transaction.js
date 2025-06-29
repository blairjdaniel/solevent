const { Connection, clusterApiUrl } = require('@solana/web3.js');

async function checkTransaction() {
  const connection = new Connection(clusterApiUrl('devnet'));
  const signature = '3C2BTkBFNy4pv9o1JwUKf6hSyDvqU59W7KjKNQSjGxinEoRJ5FqwJ689wYpZbE4qbbaXnZvZWtRsF3GDdFWvo3f6';
  
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    console.log('Transaction Status:', tx?.meta?.err ? 'Failed' : 'Success');
    console.log('Error:', tx?.meta?.err);
    console.log('Logs:', tx?.meta?.logMessages);
    
  } catch (error) {
    console.error('Error checking transaction:', error);
  }
}

checkTransaction(); 