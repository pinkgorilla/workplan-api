var ENV_AUTH_SECRET = process.env.AUTH_SECRET; 
var ENV_DB_CONNECTIONSTRING = process.env.DB_CONNECTIONSTRING;


module.exports = {
    "secret": ENV_AUTH_SECRET,//"23783350655efe9951cc2104e6a597f1",
    "connectionString": ENV_DB_CONNECTIONSTRING,//"mongodb://tris:Standar123@ds017231.mlab.com:17231/auth",
    "env": process.env
}
