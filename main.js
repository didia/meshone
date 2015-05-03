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
    this.dom = domElementSelector;
    this.data = [];
    this.colors = {};
    this.options = {
        series: {
            bars: {
                show: true
            }
        },
        bars: {
            align: "center",
            barWidth: 0.5
        },

        xaxis: {
            axisLabel: 'Capteurs',
            axisLabelUseCanvas: true,
            axisLabelFontSizePixels: 12,
            axisLabelFontFamily: 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
            axisLabelPadding: 5
        },
        yaxis: {
            axisLabel: 'Distance (cm)',
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
        }
    };
   
}

window.SensorHistogram.prototype = {
    constructor : window.SensorHistogram,

    showTime : function() {
        
    },

    update : function(originalData) {

        var data = this.histogramify(originalData);

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
                barWidth: 0.8,
                align: 'left'
            },

            color: color
        }
        return serie;
    }

}


