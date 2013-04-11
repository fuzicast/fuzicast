var restify = require('restify');

var client = restify.createJsonClient({
	url: 'https://api.twitter.com/1.1/statuses/mentions_timeline.json',
	version: '*'
});

client.get(

var server = restify.createServer();

var options = {
	hostname: 

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
}


server.get('/hello/:name', respond);
server.head('/hello/:name', respond);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});



