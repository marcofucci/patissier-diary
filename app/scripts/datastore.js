// var DataStore = exports? and exports or @DataStore = {}
var DataStore = {};

// which kind of database do you want?
// possible alternatives: 
// - "simple" => this will use the browser's localStorage mechanism. Simple, but synchronous/blocking !!
// - "relational" => this will use the browser-internal sqlite implementation, "Web SQL Database"
// - "document" => Use MongoDB's little brother: https://github.com/louischatriot/nedb
DataStore.create = function(type) {
  if (type == 'simple') {
    return createSimpleStore();
  };
  if (type == 'relational') {
    return createRelationalStore();
  };
  if (type == 'document') {
    return createDocumentStore();
  };
  return undefined;
};

// thin wrapper over localStorage
var createSimpleStore = function() {
  // get: (key) -> JSON.parse localStorage.getItem JSON.stringify key
  // set: (key, value) -> localStorage.setItem JSON.stringify(key), JSON.stringify(value)
  // delete: (key) -> localStorage.removeItem JSON.stringify key
  // count: -> localStorage.length
  // clear: -> localStorage.clear()
};

var createRelationalStore = function() {
  // db = openDatabase "nwsqldb", "1.0", "embedded sql database", 1024 * 1024 * 256
  // store = {
  //   run: (query, fn) -> db.transaction (tx) -> tx.executeSql query, [], (tx, result) -> 
  //     fn? (result.rows.item(i) for i in [0 ... result.rows.length])
  // }
  // return store
};

var createDocumentStore = function() {
  try {
    var NeDB = require("nedb");
    // var datapath = require('nw.gui').App.dataPath + "/nedb";
    var store = {
      collection: function(name) {
        return new NeDB({
          filename: Constants.DB_PATH+"///"+name,
          autoload: true
        });
      }
    };
    return store;
  } catch(e) {
    if (e.code == "MODULE_NOT_FOUND")
      console.error("NeDB not found. Try `npm install nedb --save` inside of `/app/assets`.");
    else 
      console.error(e);
  }
};
