var app = getApp();   //获取应用实例
var app_data = app.globalData;
var request_url = app_data.domainName + app_data.urlSite;  //接口请求位置前缀

/*工具类 */

//获取当前时间
function getCurrentTime(type) {
    var myDate = new Date();
    
    var year = myDate.getFullYear();
    var month = myDate.getMonth();
    month += 1;
    if(month<10){
        month="0"+month;
    }
    
    var day = myDate.getDate();
    if(day<10){
        day="0"+day;
    }
    
    var hour = myDate.getHours();
    if(hour<10){
        hour="0"+hour;
    }
    
    var minute = myDate.getMinutes();
    if(minute<10){
        minute="0"+minute;
    }
    
    var second = myDate.getSeconds();
    if(second<10){
        second="0"+second;
    }
    
    var time = '';
    if(type=="date"){
        time = year+"-"+month+"-"+day;
    }else if(type=="time"){
        time = hour+":"+minute+":"+second;
    }else if(type=="dateTime"){
        time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
    }else{
        time = year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second;
    }
    
    return time;
};

//获取时间间隔
function getTimeRange(startTime,endTime,returnType) {
    var timeRange = null;	//时间间隔
    var startDate = new Date(startTime);	//开始日期
    var endDate = new Date(endTime);		//结束日期
    
    if(returnType=="day"){
        timeRange = (startDate.getTime()-endDate.getTime())/1000/60/60/24;
    }else if(returnType=="hour"){
        timeRange = (startDate.getTime()-endDate.getTime())/1000/60/60;
    }else if(returnType=="minute"){
        timeRange = (startDate.getTime()-endDate.getTime())/1000/60;
    }else if(returnType=="second"){
        timeRange = (startDate.getTime()-endDate.getTime())/1000;
    };
    
    return Math.abs(timeRange);
};

//获取随机色值
function getRandomColor () {
  let rgb = [];
  for (let i = 0 ; i < 3; i++){
    let color = Math.floor(Math.random() * 256).toString(16);
    color = color.length == 1 ? '0' + color : color;
    rgb.push(color);
  };
  return '#' + rgb.join('');
};

//获取路径参数
function getUrlParam(paramStr) {
  let paremObj = {};

  let paramArr = paramStr.split("&");
  for (let i = 0; i < paramArr.length; i++) {
    let keyValue = paramArr[i].split("=");
    paremObj[keyValue[0]] = keyValue[1]; 
  };
  return paremObj;
};

module.exports = {
  getCurrentTime: getCurrentTime,
  getTimeRange: getTimeRange,
  getRandomColor: getRandomColor,
  getUrlParam: getUrlParam
};
