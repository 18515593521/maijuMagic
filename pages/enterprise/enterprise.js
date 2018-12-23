//页面js
var app = getApp();   //获取应用实例
var WxParse = require('../../plugs/wxParse/wxParse.js');
Page({
  data: {
    details:null

  },
  //页面加载
  onLoad: function (options) { 
    this.getEnterprise();    
  },
  onPullDownRefresh: function () {
    this.getEnterprise();           
  },
  getEnterprise:function(){
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/getEnterprise/' + app.globalData.customerInfo.factoryId,  //接口地址
      //url: app.globalData.domainName + '/app/getEnterprise/177',
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功

          thisPage.setData({

            details: returnData.result.details
          })
          console.log(returnData.result.details)
          WxParse.wxParse('contentDetails', 'html', returnData.result.details, thisPage, 0);
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  }

})
