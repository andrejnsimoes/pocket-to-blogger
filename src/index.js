var GetPocket = require("node-getpocket");

const config = {
  consumer_key: "104465-f83d1b4ec297694d2f9ad87",
  redirect_uri: "http://google.com",
};

var pocket = new GetPocket(config);

pocket.getRequestToken(config, function (err, resp, body) {
  if (!err) {
    var json = JSON.parse(body);
    config.request_token = json.code;

    var url = pocket.getAuthorizeURL(config);
    console.log({ url });

    setTimeout(() => {
      pocket.getAccessToken(config, function (err, resp, body) {
        if (!err) {
          var json = JSON.parse(body);
          config.access_token = json.access_token;
          pocket.refreshConfig(config);
          console.log({ config });

          var filteringOptions = { count: "5", detailType: "complete", favorite: "1" };

          pocket.get(filteringOptions, function (err, resp) {
            console.log(resp.list);
          });

          return;
        }

        console.log("Oops; getAccessTokenParams failed: " + err);
      });
    }, 10000);

    return;
  }

  console.log("Oops; getTokenRequest failed: " + err);
});
