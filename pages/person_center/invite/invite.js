//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    codeImage: "about:blank",    //二维码图片
    headImage: "about:blank",    //图像

  },

  //页面加载
  onLoad: function () { 
    var avatarUrl = wx.getStorageSync('avatarUrl');
    var thisPage = this;
    thisPage.getQRCodeImage();    //获取二维码图片

   

  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    setTimeout(function(){
      wx.getImageInfo({
        src: app.globalData.userInfo.avatarUrl,
        success: function (res) {
          thisPage.setData({
            headImage: res.path
          })

        },
        fail: function (res) {
          thisPage.setData({
            headImage: app.globalData.userInfo.avatarUrl
          })
        }
      });
      console.log('头像++' + app.globalData.userInfo.avatarUrl);
    },200)
    
  },
  //页面分享
  onShareAppMessage: function () {
    var param = "P1=I&P4=" + app.globalData.customerInfo.id ;

    return {
      title: '专属码',
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint("专属码");
      }
    };
  },

  //点击图片
  clickImage: function (e) {
    var imageUrl = this.data.codeImage;

    wx.previewImage({
      urls: [imageUrl] // 需要预览的图片http链接列表
    })
  },
  //获取二维码图片
  getQRCodeImage: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/makeQRCode',  //接口地址
      data: {
        P1: 'I',
        P4: app.globalData.customerInfo.id,
        ishyaline: false,
        node3_id: app.globalData.customerInfo.factoryId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            codeImage: returnData.result
          });
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
  },
  invitationFriend : function(){
    console.log(1111111111)
    this.onShareAppMessage();
  }
})
