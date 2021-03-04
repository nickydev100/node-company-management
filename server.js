'use strict'
require('dotenv').config();
const cluster	= require('cluster');
const cache = require('cluster-node-cache')(cluster);
const numCPUs	= require('os').cpus().length || 1;
const port		= process.env.PORT || 3000; // set the port for our app





// START THE SERVER CLUSTER
// =============================================================================
if (numCPUs > 1 && cluster.isMaster) {
	console.log("i am master using schedulingPolicy ==>",cluster.schedulingPolicy);
	//using default round robin scheduling
  // Fork workers in.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
	//notify admin if any cluster down
  });
} else {
	// divide server clusters on multiple CPUs if possible
	console.log("I am slave / single CPU")
	const app = require('./helper/config')(cache); //load app synchronously one time on each cluster
	app.listen(port);
	console.log('Magic happens on port ' + port);
}
