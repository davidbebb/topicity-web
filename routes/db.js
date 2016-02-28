var express = require('express');
var router = express.Router();


/* GET Userlist page. */
router.get('/data/id/:id', function(req, res) {
    var db = req.db;
    var idNumber = req.params.id;
    db.list(function(err, body){
      var dataLength = body.rows.length;
      if (idNumber >= dataLength) {
        res.send('Not in range');
        return;
      };
      id = body.rows[idNumber].id;

      db.get(id, function(err, body) {
        if (!err) {
          data = processData(body.data, body.time);
          res.json(data);
        }
      });
    });

});

router.get('/data/all', function(req, res) {
    var db = req.db;
      db.list(function(err, body) {
        if (!err) {
          var dataArray = [];
          var gatewayEui =  "1DEE15E85FA7DCEF";
          var length = body.rows.length;
          console.log(length);
          var data = [];
          body.rows.forEach(function(doc) {
            var id = doc.id;
            db.get(id,  function(err, doc) {
                if (doc.payload.gatewayEui != gatewayEui) {
                  length = length-1;
                } else {
                dataArray.push(doc.payload);
                }
                if (dataArray.length === length){
                  dataArray.sort(dynamicSort("time"));
                  dataArray.forEach(function(doc){
                    data.push(processData(doc.data, doc.time));
                    if (data.length === length){
                      res.json(data);
                    };
                  });
                };
            });
          });
        };
      });
});

function split(data) {
  var dataArray = [];
  var timeArray = [];
  l = data.length;
  for (i = 0; i < l; i++) {
    dataArray.push(data[i][0]);
    timeArray.push(data[i][1]);
  }

  return [timeArray, dataArray];
}


function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}


function processData(data, endTime) {
  res = dataToArray(data);
  time =  new Date(endTime);
  res.push(time)
  return res;
};

function dataToArray(data){
  var buf = new Buffer(data, 'base64').toString("ascii");
  var res = buf.split(",");
  var id = res.shift();
  var power = res.shift();
  var credit = res.shift();
  l = res.length;
  foo = res.reduce((a, b) => a + b, 0);
  bar = foo/l;
  return [id, power, credit, bar];
};

function getTimes(time, number) {
  var diff = 0.1;
  endTime = new Date(time);
  timeArray = [endTime];
  for (i = 1; i < number; i++) {
    var d = timeArray[i-1];
    var e = new Date(d.getTime() - diff*60000);;
    timeArray.push(e);
  };
  return timeArray.reverse();
};



module.exports = router;
