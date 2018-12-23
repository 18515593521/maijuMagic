//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    signPeopleArr: null,    //活动人员
  },
  //页面加载
  onLoad: function (options) { 
    this.setData({
      signPeopleArr: app.globalData.activityInfo.applyImage
    });
  }
})