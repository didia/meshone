window.WebSocketDataSource = function(dataSourceAddress) {
    this.socket = new WebSocket(dataSourceAddress);
    this.callbacks = [];
    this.socket.onmessage = function(event) {
        var msg = JSON.parse(event.data);
        this.callbacks.forEach(function(callback) {
            callback(msg);
        });
    }
}

window.WebSocketDataSource.prototype = {
    constructor : window.WebSocketDataSource,

    registerCallback : function(callback) {
        this.callbacks.push(callback);
    }
}

window.AjaxDataSource = function(dataSourceAddress) {
    this.callbacks = [];
    this.dataSource = dataSourceAddress;
    this.update();
    

}

window.AjaxDataSource.prototype = {
    constructor : window.AjaxDataSource,

    registerCallback : function(callback) {
        this.callbacks.push(callback);
    },

    update : function() {
        console.log("UPDATE");
        var that = this;

        $.ajax({
            url: this.dataSource,
            type: "GET",
            dataType: "json",
            success: function(data) {
                console.log("SUCCESS");
                that.callbacks.forEach(function(callback) {
                    callback(data);
                });

                
            },
            complete: function() {
                setTimeout(window.pullDataSource, 3000);
            }
        });

    }
}

window.SensorHistogram = function(dataSource, domElementSelector) {
    this.dataSource = dataSource;
    this.dom = domElementSelector;
    this.data = [];
    this.colors = {};
    this.options = {
        bars:  {
            show: true
        },

        xaxis: {
            min: 0,
            max: 4,
            tickLength: 3, 
            axisLabel: 'Sensors',
            tickSize : [1, 'Sensor'],
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 10

        },

        yaxis : {
            min:0,
            max:3
        },

        grid : {
            borderWidth : 2
        }
    };
      
}

window.SensorHistogram.prototype = {
    constructor : window.SensorHistogram,

    showTime : function() {
        
    },

    update : function(data) {

        data = this.histogramify(data);

        if(this.data.length == 0){
            xMax = data.length + 2;
            this.plot = $.plot(this.dom, this.data, this.options);
        }
        else {
            this.plot.setData(data);
        }
        this.plot.draw();
        this.data = data;
        console.log(this.data);

    },

    histogramify : function(sensorDatas) {
        var sensorDatas = this.groupSensorDataByKey(sensorDatas);
        console.log(sensorDatas);
        var data = [];
        var index = 0
        for(key in sensorDatas)  {
            var sensorData = sensorDatas[key];
            var lastElement = sensorData[sensorData.length - 1]
            console.log("Sensor Data");
            console.log(sensorData);
            data.push(this.getSensorSerieFromSensorData(index++, lastElement));
        }
       
        
        console.log(data);
        return data;
    },

    groupSensorDataByKey : function(sensorDatas) {
        var groups = {};
        for(var i = 0; i < sensorDatas.length; i++) {
            var sensorData = sensorDatas[i];
            var key = sensorData["satId"];
            if(!(key in groups)){
                groups[key] = [];
            }
            groups[key].push(sensorData);
        
        }

        return groups;
    },

    getSensorSerieFromSensorData : function(sensorPosition, sensorData) {
        var sensorId = sensorData["satId"];
        var color;
        if (sensorId in this.colors){
            color = this.colors[sensorId];
        }
        else {
            color = '#'+Math.floor(Math.random()*16777215).toString(16);
            this.colors[sensorId] = color;
        }
                
        var serie = {
            label: "Sensor " + sensorId,
            data: [[sensorPosition, sensorData["value"]]],
            bars: {
                show: true,
                fill: true,
                lineWidth: 0,
                order: sensorPosition + 2,
                fillColor:  color,
                barWidth: 0.8,
                align: 'left'
            },

            color: color
        }
        return serie;
    }

}


