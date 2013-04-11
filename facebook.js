/*
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: '120679088126533',
    clientSecret: 'b52858833d102b23cfc050f5c30a5b67',
    callbackURL: "http://www.example.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));
*/
//BAACEdEose0cBALhTKLo79Y1oBi9uc86JodpeySXoZAd66D9cyOjsAw5ZBJnFmdwFHFZCaJ3nsoV9JhWmPo9C5uexWqrzw5hGucDoxmojXVvgxn0XWYP
/*

var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: 'graph.facebook.com',
  path: '/search?q=cool&type=post'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(JSON.parse(str));
  });
}

http.request(options, callback).end()


*/

/*


var Facebook = require('facebook-node-sdk');

var facebook = new Facebook({ appID: '120679088126533', secret: 'b52858833d102b23cfc050f5c30a5b67', access_token: 'BAACEdEose0cBALhTKLo79Y1oBi9uc86JodpeySXoZAd66D9cyOjsAw5ZBJnFmdwFHFZCaJ3nsoV9JhWmPo9C5uexWqrzw5hGucDoxmojXVvgxn0XWYP' });

facebook.api('/sunysb', function(err, data) {
	if(err){
		console.log(err);
	}else{
		console.log(data); // => { id: ... }
	}
});

*/

/*

var fbsdk = require('facebook-sdk');

var facebook = new fbsdk.Facebook({
  appId  : '120679088126533',
  secret : 'b52858833d102b23cfc050f5c30a5b67'
});

facebook.api('/120679088126533', function(data) {
  console.log(data);
});

console.log(facebook.getAccessToken());

*/



/*
var http = require('http');
var FacebookClient = require("facebook-client").FacebookClient;

http.createServer(function (request, response) {
    var app_id = "120679088126533"; // configure like your fb app page states
    
    var facebook_client = new FacebookClient(
        app_id,
        "b52858833d102b23cfc050f5c30a5b67" // configure like your fb app page states
    );

    facebook_client.getSessionByRequestHeaders(request.headers)(function(facebook_session) {
        if (!facebook_session)
        {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write([
                '<html>',
                '<head><title>node-facebook-client example</title></head><body>',
                '<p>Login please</p> <fb:login-button autologoutlink="true"></fb:login-button>',
                '<div id="fb-root"></div>',
                '<script type="text/javascript">',
                  'window.fbAsyncInit = function() {',

                  '    FB.init({appId: "' + app_id +'", logging:false, status: true, cookie: true, xfbml: true});',
                  '    FB.Event.subscribe(\'auth.sessionChange\', function(response) {',
                  '        document.location = document.location.href;',
                  '    });',
                  '};',
                  '(function() {',
                  '  var e = document.createElement(\'script\'); e.async = true;',
                  '  e.src = document.location.protocol +',
                  '    \'//connect.facebook.net/en_US/all.js\';',
                  '  document.getElementById(\'fb-root\').appendChild(e);',
                  '}());',
                  '</script>',
                  '</body>',
                  '</html>'
            ].join("\n"));
            //response.end();
            //return ;
        }
        

        response.writeHead(200, {'Content-Type': 'text/plain'});
        facebook_session.isValid()(function(is_valid) {
            if (!is_valid)
            {
                response.write('Session expired or user logged out.' + "\n");
                response.end();
                return ;
            }    
            facebook_session.graphCall("/sunysb", {
            })(function(result) {
                response.writeHead(200, {'Content-Type': 'text/plain'});
                response.write('By using Graph API:' + "\n");
                response.write('  Name:' + result.name + "\n");
                response.write('  Id:' + result.id + "\n");
                response.write('  Link:' + result.link + "\n");
                facebook_session.restCall("fql.multiquery", {"queries": {"query1":"SELECT uid FROM user WHERE uid=" + result.id, "query2":"SELECT name, url, pic FROM profile WHERE id IN (SELECT uid FROM #query1)"}}, {})(function() {
                    console.log('multiquery', JSON.stringify(arguments[0]));
                    response.end();
                });
            });    
        });
    });   
    
}).listen(8000);

*/




var url = require('url'),
    express = require('express'),
    FacebookSearch = require('facebook-search');

var app = express.createServer(express.logger());
var port = (process.env.PORT || 3000);
var fb = new FacebookSearch('120679088126533', 'b52858833d102b23cfc050f5c30a5b67',
                            {
                                'redirect_uri': 'http://127.0.0.1:'+port+'/auth/facebook',
                                'scope': 'user_status'
                            });

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({secret: 'secret'}));

app.post('/', function(req, res) {
    // Deal with Facebook Canvas POST
    var tok = fb.handleSignedRequest(req.body.signed_request);
    
    if(tok !== undefined) {
        req.session.token = tok;
        
        res.redirect('/home');
    } else {
        res.redirect(fb.getAuthorizationUrl({'redirect_uri': req.header('referrer')}));
    }
});

app.get('/', function(req, res) {
    if(req.session.token) {
        res.redirect('/home');
    } else {
        res.redirect(fb.getAuthorizationUrl());
    }
});

app.get('/home', function(req, res) {
    if(req.session.token) {
        fb.setAccessToken(req.session.token);
        
        var searchFor = {
            type: 'post',
            q: 'beer',
            center: '48.13708, 11.5756',
            distance: 1000
        };
        
        fb.search(searchFor, function(err, data) {
            res.send(err ? err : data);
        });
    } else {
        res.redirect(fb.getAuthorizationUrl());
    }
});

app.get('/auth/facebook', function(req, res) {
    fb.handleAuthorizationResponse(url.parse(req.url).query, function(err, tok) {        
        if(tok !== undefined) {
            req.session.token = tok;
            
            res.redirect('/home');
        } else {
            res.send(err);
        }
    });
});

app.listen(port, function() {
  console.log("Listening on " + port);
});
