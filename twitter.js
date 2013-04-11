var util = require('util'),
    twitter = require('twitter'),
	Sequelize = require('sequelize'),
	nodemailer = require('nodemailer'),
	FacebookClient = require('facebook-client').FacebookClient;

/*
var FacebookSearch = require('facebook-search');

var fb = new FacebookSearch('120679088126533', 'b52858833d102b23cfc050f5c30a5b67');
var searchFor = {
    type: 'post',
    q: 'fmcc',
    center: '48.13708, 11.5756',
    distance: 1000
};

fb.search(searchFor, function(err, res) {
    console.log(err ? err : res);

    fb.next(function(err, res) {
        console.log(err ? err : res);
    });
});	
*/





var sequelize = new Sequelize('otcmarkets', 'root', '', {
	host: 'localhost',
	port: 3306,
	dialect: 'mysql'
});
	
var smtp = nodemailer.createTransport('SMTP', {
	use_authentication: false,
	host: 'mail-inbox1.ps',
	port: 25
});


	
function print_tweet(data){
	//console.log('testing2');
	console.log(data.text);
}


	
var twit = new twitter({
	consumer_key: 'E9mQAdfNeWpIEVoO3kM2A',
	consumer_secret: 'iZNYQ2fgp3AqiKlf1yo4RP7SxYjz0kCIIHxVVOzeM',
	access_token_key: '38741413-KOLhpCqd7UKY5wZ6slzmS4PfDXZuLCsSkJtNeNCAk',
	access_token_secret: 'lbhgS7ltJLZTUwXle7vYVRFETL6ioautDPxge4Xw'
});


/* twitter search api
twit.search('$fmcc OR $rhhby', { rpp: 10 }, function(data){
	console.log(util.inspect(data));
	//data.results.forEach(function(data){
	//	console.log(data.text);
	//});
});
*/




//twitter stream api tracking specific keywords
twit.stream('statuses/filter', { 'track': '$fmcc,#fmcc,$goff,#goff,$aamrq,$rhhby,$snmyy,@otcmarkets' }, function(stream){
	stream.on('data', function(data){
		console.log(util.inspect(data));
		/*
		sequelize.query('select * from tweets').success(function(mytablerows){
			console.log(util.inspect(data));
		});
		*/
		
		var Tweet = sequelize.define('tweet', {
			tweet_text: Sequelize.STRING,
			tweet_id: Sequelize.BIGINT,
			tweet_timestamp: Sequelize.DATE,
			tweet_username: Sequelize.STRING,
			tweet_source: Sequelize.STRING,
			tweet_tag: Sequelize.STRING,
			is_retweet: Sequelize.BOOLEAN,
			tweet_citystate: Sequelize.STRING,
			tweet_country: Sequelize.STRING,
			user_location: Sequelize.STRING,
			tweet_recount: Sequelize.INTEGER,
		});
		
		// creates the table defined here
		//Tweet.drop();
		Tweet.sync();
		
		var tweet = Tweet.build();
		tweet.tweet_id = data.id;
		tweet.tweet_username = data.user.screen_name;
		var regex = /.*?>(.*?)</;
		var result = data.source.match(regex);
		tweet.tweet_source = (result ? result[1] : data.source);
		tweet.tweet_timestamp = new Date(data.created_at);
		if(data.retweeted_status == null){
			tweet.is_retweet = false;
		}else{
			tweet.is_retweet = true;
		}
		tweet.tweet_recount = (data.retweeted_status ? data.retweeted_status.retweet_count : 0);
		tweet.user_location = data.user.location;
		if(data.place){
			tweet.tweet_citystate = data.place.full_name;
			tweet.tweet_country = data.place.country;
		}
		tweet.tweet_text = data.text;
		regex = /(\$\w+|#\w+)/g;
		result = data.text.match(regex);
		
		var mail_message = {
			from: 'yue@otcmarkets.com',
			to: ['yue@otcmarkets.com', 'bart@otcmarkets.com'],
			//to: 'yue@otcmarkets.com',
		}
		mail_message.subject = 'new tweets';
		result.forEach(function(tag){
			tweet.tweet_tag = tag;
			tweet.save();	
		});
		
		mail_message.html = '<font face="Verdana"><h1>' + result + '</h1><hr/>' + 
							'<b>Tweet Text:</b> ' + tweet.tweet_text + '<br/>' + 
							'<b>Username:</b> ' + tweet.tweet_username + '<br/>' + 
							'<b>User Location:</b> ' + tweet.user_location + '<br/>' + 
							'<b>Source:</b> ' + tweet.tweet_source + '<br/>' + 
							'<b>Tweet Location:</b> ' + (tweet.tweet_citystate ? tweet.tweet_citystate + ' ' + tweet.tweet_country : '') + '<br/>' +
							'<b>Is Retweet:</b> ' + (tweet.is_retweet ? 'Yes' : 'No') + '<br/>' + 
							'<b>Timestamp:</b> ' + tweet.tweet_timestamp + '<br/>' + 
							'<b>Retweet Count:</b> ' + tweet.tweet_recount + '</font><br/><br/>';		
		
		

		


		
		smtp.sendMail(mail_message, function(error, response){
			if(error){
				console.log(error);
			}else{
				console.log(response.message);
			}
		});
	});
});

/*
twit.stream('statuses/filter', { 'follow' : '256340863' }, function(stream){
	stream.on('data', function(data){
		console.log(util.inspect(data));
	});
});

*/



/*var	sys = require('sys'),
	twitter = require('twitter');

var	count = 0,
	lastc = 0;

function tweet(data) {
	count++;
	if ( typeof data === 'string' )
		sys.puts(data);
	else if ( data.text && data.user && data.user.screen_name )
		sys.puts('"' + data.text + '" -- ' + data.user.screen_name);
	else if ( data.message )
		sys.puts('ERROR: ' + sys.inspect(data));
	else
		sys.puts(sys.inspect(data));
}

function memrep() {
	var rep = process.memoryUsage();
	rep.tweets = count - lastc;
	lastc = count;
	console.log(JSON.stringify(rep));
	// next report in 60 seconds
	setTimeout(memrep, 60000);
}

var twit = new twitter({
	consumer_key: 'E9mQAdfNeWpIEVoO3kM2A',
	consumer_secret: 'iZNYQ2fgp3AqiKlf1yo4RP7SxYjz0kCIIHxVVOzeM',
	access_token_key: '38741413-KOLhpCqd7UKY5wZ6slzmS4PfDXZuLCsSkJtNeNCAk',
	access_token_secret: 'lbhgS7ltJLZTUwXle7vYVRFETL6ioautDPxge4Xw'
})
.stream('statuses/sample', function(stream) {
	stream.on('data', tweet);
	// first report in 15 seconds
	setTimeout(memrep, 15000);
})*/



/*var Stream = require('user-stream');
var stream = new Stream({
	consumer_key: 'E9mQAdfNeWpIEVoO3kM2A',
	consumer_secret: 'iZNYQ2fgp3AqiKlf1yo4RP7SxYjz0kCIIHxVVOzeM',
	access_token_key: '38741413-KOLhpCqd7UKY5wZ6slzmS4PfDXZuLCsSkJtNeNCAk',
	access_token_secret: 'lbhgS7ltJLZTUwXle7vYVRFETL6ioautDPxge4Xw'
});

stream.stream();

stream.on('data', function(json){
	console.log(json);
});*/


/*{
	consumer_key: 'E9mQAdfNeWpIEVoO3kM2A',
	consumer_secret: 'iZNYQ2fgp3AqiKlf1yo4RP7SxYjz0kCIIHxVVOzeM',
	access_token_key: '38741413-KOLhpCqd7UKY5wZ6slzmS4PfDXZuLCsSkJtNeNCAk',
	access_token_secret: 'lbhgS7ltJLZTUwXle7vYVRFETL6ioautDPxge4Xw'
//}).stream('search?q=OTCM&include_entities=true&result_type=mixed', function(stream){
//	console.log('testing1');
//	stream.on('data', print_tweet);
//	console.log('testing3');
});*/

//twit.get('search?q=blue%20angels', {include_entities:true}, function(data) {
 //   console.log(util.inspect(data));
//	console.log(data.text);
//});