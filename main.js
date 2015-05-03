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
                setTimeout(window.pullDataSource, 500);
            }
        });

    }
}

window.SensorHistogram = function(dataSource, domElementSelector) {
    this.dataSource = dataSource;
    this.port = 0;
    this.dom = domElementSelector;
    this.data = [];
    this.colors = {};
    this.options = {
        xaxis: {
            min:0,
            max:3,
            //tickSize: [1, "month"],
            //monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            tickLength: 0, // hide gridlines
            axisLabel: 'Capteurs',
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 5,
            ticks:[[0.25,'1'],[1.25,'2']]
   
        },
        yaxis: {
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 5
        },
        axisLabels: {
            show: true
        },
        grid : {
            borderWidth : 2
        },
        legend: {
            show: false,
        }
    };
   
}

window.SensorHistogram.prototype = {
    constructor : window.SensorHistogram,

    showTime : function() {
        
    },

    update : function(originalData) {

        var data = this.histogramify(originalData,this.port);

        if(this.data.length == 0){
            var xMax = data.length + 2;
            var yMax = Math.max.apply(null, originalData.map(function(element) {
             
                return element["max"];
            }));
            this.options.xaxis.max = xMax;
            this.options.yaxis.max = yMax;

            console.log(xMax, yMax);
            this.plot = $.plot(this.dom, data, this.options);
        }
        else {
            this.plot.setData(data);
        }
        this.plot.draw();
        this.data = data;
        console.log(this.data);

    },

    histogramify : function(sensorDatas, port) {
        var sensorDatas = this.groupSensorDataByKey(sensorDatas,port);
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

    groupSensorDataByKey : function(sensorDatas, port) {
        var groups = {};
        for(var i = 0; i < sensorDatas.length; i++) {
            var sensorData = sensorDatas[i];
            var key = sensorData["satId"];
            var nport = sensorData["portId"];
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
            var value = Math.random() * 0xFF | 0;
            var grayscale = (value << 16) | (value << 8) | value;
            var color = '#ffc800';
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
                barWidth: 0.5,
                align: 'left'
            },

            color: color
        }
        return serie;
    }

}


