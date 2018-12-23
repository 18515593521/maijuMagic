//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    cardId: "",           //卡券Id
    cardDetails: null,    //卡券详情
    isAuthorizePhone:false,  //手机显示
    modalBox_message: {
      hidden: true,
      infoList: ["领取成功", "可在个人中心我的卡券下查看"]
    },

    cardType: {
      1: {  //优惠券
        name: '优惠券',
        backGroundImage: 'details_green.png'
      },
      2: {  //红包
        name: '红包',
        backGroundImage: 'details_red.png'
      },
      3: {  //折扣券
        name: '折扣券',
        backGroundImage: 'details_blue.png'
      }
    }

  },

  //页面加载
  onLoad: function (options) { 
    this.setData({
      cardId: options.cardId,
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false
    });

    this.getCardDetails();    //获取卡券详情
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    var param = "P1=card&P4=" + app.globalData.customerInfo.id + "&cardId=" + thisPage.data.cardId ;
   
    return {
      title: '卡券详情',
      path: "/pages/index/index?" + param,
      success: function (res) {
        console.log('要进首页！！！' + param);
      }
    };

  },
  //获取卡券详情
  getCardDetails: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCouponsDetails',  //接口地址
      data: {           //请求参数
        couponsId: thisPage.data.cardId,
        customer_id: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          if (returnData.result.explain){
            returnData.result.explainArr = returnData.result.explain.split("\n");
          }
          
          thisPage.setData({
            cardDetails: returnData.result
          })
        } else {  //失败
          app.showWarnMessage(returnData.message);
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
  //领取优惠券
  getCoupon: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var couponId = dataSet.param;

    // if (thisPage.data.isAuthorizePhone) {  //未注册
    //   app.pageSkip("/pages/user_validate/user_validate", 1);
    //   return;
    // }

    wx.request({
      url: app.globalData.domainName + '/app/addCustomerCoupons',  //接口地址
      data: {           //请求参数
        couponsId: thisPage.data.cardId,
        customer_id: app.globalData.customerInfo.id,
        shop_id: app.globalData.shopInfo.sys_user_id
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
            "modalBox_message.hidden": false,
            "cardDetails.isGet": 1
          });
          setTimeout(function () {
            thisPage.setData({
              "modalBox_message.hidden": true
            });
          }, 2000);
        } else {  //失败
          app.showSuccessMessage("领取失败！");
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
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
 
})
