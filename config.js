var ENV_DB_SERV = process.env.DB_SERV;
var ENV_DB_NAME = process.env.DB_NAME;
var ENV_DB_USER = process.env.DB_USER;
var ENV_DB_PASS = process.env.DB_PASS;
var ENV_AUTH_SECRET = process.env.AUTH_SECRET;

var connectionString = "mongodb://" + ENV_DB_USER + ":" + ENV_DB_PASS + "@" + ENV_DB_SERV + "/" + ENV_DB_NAME;

if (process.env.NODE_ENV == "production") {
    module.exports = {
        "secret": ENV_AUTH_SECRET,//"23783350655efe9951cc2104e6a597f1",
        "connectionString": connectionString,//"mongodb://tris:Standar123@ds017231.mlab.com:17231/auth",
        "env": process.env
    }
}
else {
    module.exports = {
        "secret": "23783350655efe9951cc2104e6a597f1",
        "connectionString": "mongodb://jakarta:Standar123.@ds017070.mlab.com:17070/jakarta",
        "env": process.env
    }
}