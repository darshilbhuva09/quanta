console.log('Testing MongoDB connection...');

try {
  const { MongoClient } = require('mongodb');
  
  // Attempt connection
  MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true })
    .then(client => {
      console.log('MongoDB connected successfully!');
      console.log('Available databases:');
      
      return client.db().admin().listDatabases()
        .then(result => {
          console.log(result.databases.map(db => db.name).join(', '));
          client.close();
        });
    })
    .catch(err => {
      console.error('MongoDB connection error:', err.message);
      if (err.name === 'MongoNetworkError') {
        console.error('\nPossible solutions:');
        console.error('1. Make sure MongoDB is installed and running on your system');
        console.error('2. If using MongoDB Atlas, check your internet connection and connection string');
        console.error('3. Check any firewall settings that might be blocking the connection');
      }
    });
} catch (e) {
  console.error('Script error:', e.message);
} 