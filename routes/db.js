var express = require('express');
var router = express.Router();


/* GET Userlist page. */
router.get('/datapoint/:id', function(req, res) {
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



function processData(data, endTime) {
  res = dataToArray(data);
  time = getTimes(endTime, res.length);
  return [res, time];
};

function dataToArray(data){
  var buf = new Buffer(data, 'base64').toString("ascii");
  var res = buf.split(",");
  return res;
};

function getTimes(time, number) {
  var diff = 15;
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
