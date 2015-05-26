var express = require('express');
var router = express.Router();

var redis = require("redis");
var client = redis.createClient();

var fs = require('fs');

var avg = function (obj) {
  var sum = 0;
  var count = 0;
  for (var i in obj) {
    sum += parseFloat(obj[i]);
    count++;
  }
  return sum/count;
};

// get data from redis
var get_data = function (callback) {
  var r = {};

  client.hgetall('temperature', function(err, result){
    r.temperature = result;

    client.hgetall('humidity', function(err, result){
      r.humidity = result;

      client.hgetall('pulse', function(err, result){
        r.pulse = result;

        client.hgetall('gas', function(err, result){
          r.gas = result;

          r.avg_temperature = avg(r.temperature);
          r.avg_humidity = avg(r.humidity);
          r.avg_pulse = avg(r.pulse);
          r.avg_gas = avg(r.gas);

          callback(r);
        });

      });
    });
  });
};

var temperature_color = function (value) {
  value = Math.round(value);
  if (value < 25) {
    return 'lightblue';
  } else if (value < 29) {
    return 'lightgreen';
  } else {
    return 'lightyellow';
  }
};

var humidity_color = function (value) {
  if (value < 700) {
    return 'lightblue';
  } else if (value < 750) {
    return 'lightgreen';
  } else {
    return '#FFFF33';
  }
};

var pulse_color = function (value) {
  if (value < 60) {
    return 'lightpink';
  } else if (value < 100) {
    return 'pink';
  } else {
    return 'red';
  }
};

var gas_color = function (value) {
  if (value < 0.12) {
    return '#FFE87C';
  } else if (value < 0.17) {
    return '#FFE5B4';
  } else {
    return '#EE9A4D';
  }
};

var time_converter = function (UNIX_timestamp){
  var a = new Date(UNIX_timestamp*1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
};

var sort_object = function (object) {
  var sorted_object = {};
  var keys = Object.keys(object);
  var len = keys.length;

  keys.sort();

  for (var i = 0; i < len; i++) {
      k = keys[i];
      sorted_object[k] = object[k];
  }

  return sorted_object;

};

/* GET home page. */
router.get('/', function(req, res, next) {
  get_data(function(r) {
    var date = 0;
    var temperature = 0;
    var humidity = 0;
    var pulse = 0;
    var gas = 0;

    for (var i in r.temperature) {
      if (i > date) {
        date = i;
        temperature = r.temperature[i];
      }
    }

    date = 0;
    for (var i in r.humidity) {
      if (i > date) {
        date = i;
        humidity = r.humidity[i];
      }
    }

    date = 0;
    for (var i in r.pulse) {
      if (i > date) {
        date = i;
        pulse = r.pulse[i];
      }
    }

    date = 0;
    for (var i in r.gas) {
      if (i > date) {
        date = i;
        gas = r.gas[i];
      }
    }

    r.temperature = temperature;
    r.humidity = humidity;
    r.pulse = pulse;
    r.gas = gas;
    r.timestamp = time_converter(date);

    r.temperature_color = temperature_color(r.temperature);
    r.avg_temperature_color = temperature_color(r.avg_temperature);

    r.humidity_color = humidity_color(r.humidity);
    r.avg_humidity_color = humidity_color(r.avg_humidity);

    r.pulse_color = pulse_color(r.pulse);
    r.avg_pulse_color = pulse_color(r.avg_pulse);

    r.gas_color = gas_color(r.gas);
    r.avg_gas_color = gas_color(r.avg_gas);

    res.render('index', {
      title: 'Data from sensors',
      result: r,
      active: 'index'
    });
  });
});

router.get('/refresh', function(req, res, next) {
  get_data(function(r) {
    var date = 0;
    var temperature = 0;
    var humidity = 0;
    var pulse = 0;
    var gas = 0;

    for (var i in r.temperature) {
      if (i > date) {
        date = i;
        temperature = r.temperature[i];
      }
    }

    date = 0;
    for (var i in r.humidity) {
      if (i > date) {
        date = i;
        humidity = r.humidity[i];
      }
    }

    date = 0;
    for (var i in r.pulse) {
      if (i > date) {
        date = i;
        pulse = r.pulse[i];
      }
    }

    date = 0;
    for (var i in r.gas) {
      if (i > date) {
        date = i;
        gas = r.gas[i];
      }
    }

    r.timestamp = time_converter(date);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
      {
        timestamp: date,
        avg_temperature: Math.floor(r.avg_temperature),
        temperature: Math.floor(temperature),
        avg_humidity: Math.floor(r.avg_humidity),
        humidity: Math.floor(humidity),
        avg_gas: (Math.floor(r.avg_gas * 100) / 100),
        gas: gas,
        avg_pulse: Math.floor(r.avg_pulse),
        pulse: Math.floor(pulse)
      }
    ));
  });
});

router.get('/temperature', function(req, res, next) {
  get_data(function(r) {
    var time = [];
    var data = [];
    var timestamps = [];
    var lasttime = 0;
    var temp_data = sort_object(r.temperature);

    for (var i in temp_data) {
      if ((i - lasttime) >= 120) {
        lasttime = i;
        time.push(time_converter(i));
        timestamps.push(i);
        data.push(temp_data[i]);
      }
    }

    // data for Chart.js
    var data = {
      timestamps: timestamps,
      labels: time,
      datasets: [
        {
          label: "Temperature",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: data
        },
      ]
    };

    res.render('temperature', {
      title: 'Temperature data',
      data: JSON.stringify(data),
      result: {
        temperature_color: temperature_color(temp_data[lasttime]),
        temperature: temp_data[lasttime],
        avg_temperature_color: temperature_color(r.avg_temperature),
        avg_temperature: r.avg_temperature,
      },
      active: 'temperature'
    });

  });
});

router.get('/temperature/refresh', function(req, res, next) {
  var r = {};
  get_data(function(r) {
    var date = 0;
    var temperature = 0;
    for (var i in r.temperature) {
      if (i > date) {
        date = i;
        temperature = r.temperature[i];
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
      {
        timestamp: date,
        avg_temperature: Math.floor(r.avg_temperature),
        temperature: Math.floor(temperature)
      }
    ));


  });
});

router.get('/humidity', function(req, res, next) {
  get_data(function(r) {
    var time = [];
    var data = [];
    var timestamps = [];
    var lasttime = 0;
    var temp_data = sort_object(r.humidity);

    for (var i in temp_data) {
      if ((i - lasttime) >= 120) {
        lasttime = i;
        time.push(time_converter(i));
        timestamps.push(i);
        data.push(temp_data[i]);
      }
    }

    // data for Chart.js
    var data = {
      timestamps: timestamps,
      labels: time,
      datasets: [
        {
          label: "humidity",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: data
        },
      ]
    };

    res.render('humidity', {
      title: 'Humidity data',
      data: JSON.stringify(data),
      result: {
        humidity_color: humidity_color(temp_data[lasttime]),
        humidity: temp_data[lasttime],
        avg_humidity_color: humidity_color(r.avg_humidity),
        avg_humidity: r.avg_humidity,
      },
      active: 'humidity'
    });

  });
});

router.get('/humidity/refresh', function(req, res, next) {
  var r = {};
  get_data(function(r) {
    var date = 0;
    var humidity = 0;
    for (var i in r.humidity) {
      if (i > date) {
        date = i;
        humidity = r.humidity[i];
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
      {
        timestamp: date,
        avg_humidity: Math.floor(r.avg_humidity),
        humidity: Math.floor(humidity)
      }
    ));
  });
});

router.get('/gas', function(req, res, next) {
  get_data(function(r) {
    var time = [];
    var data = [];
    var timestamps = [];
    var lasttime = 0;
    var temp_data = sort_object(r.gas);

    for (var i in temp_data) {
      if ((i - lasttime) >= 120) {
        lasttime = i;
        time.push(time_converter(i));
        timestamps.push(i);
        data.push(temp_data[i]);
      }
    }

    // data for Chart.js
    var data = {
      timestamps: timestamps,
      labels: time,
      datasets: [
        {
          label: "gas",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: data
        },
      ]
    };

    res.render('gas', {
      title: 'Gas data',
      data: JSON.stringify(data),
      result: {
        gas_color: gas_color(temp_data[lasttime]),
        gas: temp_data[lasttime],
        avg_gas_color: gas_color(r.avg_gas),
        avg_gas: r.avg_gas,
      },
      active: 'gas'
    });

  });
});

router.get('/gas/refresh', function(req, res, next) {
  var r = {};
  get_data(function(r) {
    var date = 0;
    var gas = 0;
    for (var i in r.gas) {
      if (i > date) {
        date = i;
        gas = r.gas[i];
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
      {
        timestamp: date,
        avg_gas: (Math.floor(r.avg_gas * 100) / 100),
        gas: gas
      }
    ));
  });
});

router.get('/pulse', function(req, res, next) {
  get_data(function(r) {
    var time = [];
    var data = [];
    var timestamps = [];
    var lasttime = 0;
    var temp_data = sort_object(r.pulse);

    for (var i in temp_data) {
      if ((i - lasttime) >= 120) {
        lasttime = i;
        time.push(time_converter(i));
        timestamps.push(i);
        data.push(temp_data[i]);
      }
    }

    // data for Chart.js
    var data = {
      timestamps: timestamps,
      labels: time,
      datasets: [
        {
          label: "pulse",
          fillColor: "rgba(220,220,220,0.2)",
          strokeColor: "rgba(220,220,220,1)",
          pointColor: "rgba(220,220,220,1)",
          pointStrokeColor: "#fff",
          pointHighlightFill: "#fff",
          pointHighlightStroke: "rgba(220,220,220,1)",
          data: data
        },
      ]
    };

    res.render('pulse', {
      title: 'pulse data',
      data: JSON.stringify(data),
      result: {
        pulse_color: pulse_color(temp_data[lasttime]),
        pulse: temp_data[lasttime],
        avg_pulse_color: pulse_color(r.avg_pulse),
        avg_pulse: r.avg_pulse,
      },
      active: 'pulse'
    });

  });
});

router.get('/pulse/refresh', function(req, res, next) {
  var r = {};
  get_data(function(r) {
    var date = 0;
    var pulse = 0;
    for (var i in r.pulse) {
      if (i > date) {
        date = i;
        pulse = r.pulse[i];
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(
      {
        timestamp: date,
        avg_pulse: Math.floor(r.avg_pulse),
        pulse: Math.floor(pulse)
      }
    ));
  });
});

module.exports = router;
