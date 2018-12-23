//页面js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo:null,
    hidden : true,
    cardInfo1:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    var cardInfo ={};
    
    cardInfo.id = options.id;
    cardInfo.card_name = options.card_name;
    cardInfo.balance   = options.balance  ;
    cardInfo.money = options.money;
    cardInfo.image = options.image;
    cardInfo.buy_price = options.buy_price;
    cardInfo.direction = options.direction;
    cardInfo.selleNum = options.selleNum;
    cardInfo.use_type = options.useType;
    cardInfo.sellType = options.sellType;
    cardInfo.buyType = options.buyType;
    var vipType = options.vipType
    thisPage.selectCardInfoById(options.id);

    thisPage.setData({
      cardInfo: cardInfo,
      vipType: vipType
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  //立即支付
  payMoney: function (e) {
    var thisPage = this;
   // var formId = e.detail.formId;     //表单Id
    //console.info('表单Id:', formId);

   var postParam = {
     card_id: thisPage.data.cardInfo.id ,
     customer_id: app.globalData.customerInfo.id,
    };

    if (!(app.globalData.customerInfo.payState == 1 && app.globalData.payStatusInfo.isOpen == 1 && app.globalData.payStatusInfo.pay_status == 1)){
     
      thisPage.setData({
        hidden: false
      })
      return;
    }


    wx.request({
      url: app.globalData.domainName + "/app/buyVipCard",  //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var payParam = returnData.result;
          if (payParam.timeStamp) {
            thisPage.weChatPay(payParam);   //微信支付
          } 
        } else {
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
  //微信支付
  weChatPay: function (payParam) {
    var thisPage = this;
    wx.requestPayment({
      'timeStamp': payParam.timeStamp,
      'nonceStr': payParam.nonceStr,
      'package': payParam.repay_id,
      'signType': 'MD5',
      'paySign': payParam.paySign,
      'success': function (res) {
        var returnData = res.data;
        console.log("微信支付成功！");
        thisPage.paySuccess(payParam.card_id, payParam.customerVipId)
      },
      'fail': function (res) {
        console.log("微信支付取消/失败！", res);
        if (res == 'requestPayment:fail cancel') {  //失败
          app.showWarnMessage("支付取消");
        } else {
          app.showWarnMessage("支付失败");
        }
        app.showWarnMessage("支付失败");
      },
      'complete': function (res) {
        console.log('微信支付结束：', res);
      }
    })
  },
  paySuccess: function (card_id, id){
    var postParam = {
      "card_id": card_id,
      "id":id,
      "customer_id": app.globalData.customerInfo.id
    }

    wx.request({
      url: app.globalData.domainName + "/app/updateCustomerVipStatus",  //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        app.showWarnMessage("支付成功");
        app.pageSkip("/pages/member/member/member", 1);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })

  },
  confirm :function(){
    var thisPage = this;
    thisPage.setData({
      hidden :true
    })
  },
  selectCardInfoById:function(id){
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + "/app/selectCardInfoById/"+id,  //接口地址
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var cardInfo1= res.data.result;
        console.log(cardInfo1)
        if (cardInfo1){
          cardInfo1.reNum = cardInfo1.number - cardInfo1.sellNum
        }
        thisPage.setData({
          cardInfo1: cardInfo1
        })
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