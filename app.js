// OAuth supports 3 legged and 2 legged (aka XAuth) authentication.
// This app demonstrates how to use 2 legged authentication with CartoDB

var   cartodb_username          = '' // your CartoDB username
    , cartodb_password          = '' // your CartoDB password
    , cartodb_consumer_key      = '' // Your CartoDB API Key ('YOUR KEY')
    , cartodb_consumer_secret   = '' // Your CartoDB API Secret ('YOUR SECRET')
    , cartodb_private_query     = '' // An SQL query to run eg. 'SELECT cartodb_id FROM cables LIMIT 20'
    , cartodb_request_url       = 'https://' + cartodb_username + '.cartodb.com/oauth/request_token'
    , cartodb_access_url        = 'https://' + cartodb_username + '.cartodb.com/oauth/access_token'
    , cartodb_api_url           = 'https://' + cartodb_username + '.cartodb.com/api/v1/sql';


var   sys         = require('sys')
    , querystring = require('querystring')
    , OAuth = require('oauth').OAuth
    , oa = new OAuth(cartodb_request_url, cartodb_access_url, cartodb_consumer_key, cartodb_consumer_secret, "1.0", null, "HMAC-SHA1");

// Request temporary request tokens
oa.getOAuthRequestToken(function(error, request_key, request_secret, results){
    if(error) sys.puts('error :' + error);
    else {
        // Output consumer and request tokens (for completeness)
        sys.puts('\n== Consumer Tokens ==');
        sys.puts('consumer key :' + cartodb_consumer_key);
        sys.puts('consumer secret :' + cartodb_consumer_secret);

        sys.puts('\n== Request Tokens ==');
        sys.puts('request key :' + request_key);
        sys.puts('request secret :' + request_secret);

        // Configure XAuth request
        var xauth = {x_auth_mode:"client_auth", x_auth_username: cartodb_username, x_auth_password: cartodb_password };

        // Request access key and secret tokens via XAuth
        // ** NOTE: Do NOT post the request_secret in argument 3 **
        sys.puts("\nRequesting access tokens via XAuth...");
        oa.post(cartodb_access_url, request_key, null, xauth, null, function(error, data) {
            if(error) {
                sys.puts(require('sys').inspect(error));
                throw new Error("...XAuth failed. Please check your password and username.");
            } else {
                sys.puts("...XAuth successful!");

                // Parse access tokens from returned query string
                var access_tokens = querystring.parse(data);
                var access_key    = access_tokens['oauth_token'];
                var access_secret = access_tokens['oauth_token_secret'];

                // Output access tokens
                sys.puts('\n== Access Tokens ==');
                sys.puts('access key:' + access_key);
                sys.puts('access secret :' + access_secret);

                // Do a sample GET query
                var protected_request = cartodb_api_url + "?q=" + querystring.escape(cartodb_private_query);
                oa.get(protected_request, access_key, access_secret,  function (error, data, response) {
                    sys.puts('\n== CartoDB result for GET "' + cartodb_private_query + '" ==');
                    sys.puts(data + '\n');
                });

                // Do a sample POST query
                var protected_request = cartodb_api_url;
                var body = {q: cartodb_private_query}
                oa.post(protected_request, access_key, access_secret, body, null, function (error, data, response) {
                    sys.puts('\n== CartoDB result for POST "' + cartodb_private_query + '" ==');
                    sys.puts(data + '\n');
                });
            }
        });
    }
});