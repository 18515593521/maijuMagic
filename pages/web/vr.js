//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    webUrl: "",   //网页路径
  
  },

  //页面加载
  onLoad: function (options) {
    this.setData({
      webUrl: options.webUrl
    });
  },
  //页面分享
  onShareAppMessage: function () {
    var param = "P1=J&P4=" + app.globalData.customerInfo.id;
    console.log('/images / bgm.jpg转发的图片！');
    return {
      title: '全景图',
      path: "/pages/index/index?" + param,
      imageUrl:'/images/bgm.jpg',
      success: function (res) {
        app.addPageSharePoint("全景图");
      }
    };
  },

  
})