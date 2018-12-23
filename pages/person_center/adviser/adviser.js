//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    codeImage: "about:blank",    //二维码图片
    headImage: "about:blank",    //图像
    adviserInfo: null,    //顾问信息

  },

  //页面加载
  onLoad: function (options) { 
    
  },
  //页面显示
  onShow: function () { 
    this.getAdviserInfo();    //获取顾问信息
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getAdviserInfo();    //获取顾问信息
  },

  //拨打电话
  makePhone: function () {
    var thisPage = this;

    wx.makePhoneCall({
      phoneNumber: thisPage.data.adviserInfo.phone
    })
  },
  //复制
  copy: function () {
    var thisPage = this;
    var wxName = thisPage.data.adviserInfo.weixinhao;

    wx.setClipboardData({
      data: wxName,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) 
            app.showSuccessMessage("复制成功！");
          }
        })
      }
    })
  },
  //获取顾问信息
  getAdviserInfo: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/exclusiveConsultant',  //接口地址
      data: {
        customer_id: app.globalData.customerInfo.id
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
            adviserInfo: returnData.result,
            headImage: returnData.result.head_url
          });
          thisPage.getQRCodeImage(returnData.result.id);    //获取二维码图片
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
  //获取二维码图片
  getQRCodeImage: function (id) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/makeQRCode',  //接口地址
      data: {
        P1: 'H',
        P3: app.globalData.customerInfo.guiderId,
        // P4: app.globalData.customerInfo.id,
        ishyaline: true,
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
        wx.stopPullDownRefresh();
      }
    })
  },

  

})
