var mysql = require('mysql');
var connection =  mysql.createConnection({
  host     : 'sql8.freemysqlhosting.net',
  user     : 'sql8164855',
  password : 'vIaX9H4bp8',
  database : 'sql8164855'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('Success. connected as id ' + connection.threadId);
});