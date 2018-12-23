var app = getApp();   //获取应用实例

Page({
  data:{
    orderId: null,    //订单Id
    state: null,      //评价状态(1：不能评价；2：能评价；3：已评价；)
    orderType: null,  //订单类型

    orderInfo: null,  //订单信息
    comment: '',      //评论
    score: 3,         //评分

    orderStateObj: {
      1: "待支付",
      2: "待安装",
      3: "已完成",
      4: "关闭"
    },

  },
  //页面加载
  onLoad:function(options){
    this.setData({
      orderId: options.orderId,
      state: options.state,
      orderType: options.orderType
    });
  
    this.getOrderProductList();   //获取订单产品列表
  },

  //获取订单产品列表
  getOrderProductList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectOrderEvaluateInfo',  //接口地址
      data: {   //请求参数
        orderId: thisPage.data.orderId
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
            orderInfo: returnData.result,
            score: thisPage.data.state == 3 ? returnData.result.level : 3
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
  //评论内容
  setContent: function (e) {
    var text = e.detail.value;
    this.setData({
      comment: text
    })
  },
  //设置整体评分
  setScore: function (e) {
    var dataSet = e.currentTarget.dataset;
    var score = dataSet.score;

    if (this.data.state==2){
      this.setData({
        score: score
      })
    }
  },
  //提交
  submit: function () {
    var thisPage = this;

    if (!thisPage.data.comment) {
      app.showWarnMessage("请添加评论");
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/addOrderEvaluate',  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        orderId: thisPage.data.orderId,
        orderType: thisPage.data.orderType,
        details: thisPage.data.comment,
        level: thisPage.data.score
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.pageBack(1);
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
 
})