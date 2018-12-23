//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    orderId: null,        //订单Id
    payNumber: null,      //支付次数（1：单次；2：多次）
    orderDetails: null,   //订单详情

    prizeNumber: 0,   //抽奖次数
    eggNumber: 0,     //砸蛋次数

    orderStateObj: {
      1: "物流",
      2: "安装",
      3: "售后",
      4: "关闭"
    },
    payStatus: {
      1: "未支付",
      2: "已支付"
    }

  },

  //页面加载
  onLoad: function (options) { 
    this.setData({
      orderId: options.orderId,
      payNumber: options.payNumber
    });

    this.getOrderDetails();
  },

  //获取订单详情
  getOrderDetails: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectOrderDetail',  //接口地址
      data: {
        orderId: thisPage.data.orderId,
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var orderDetails = returnData.result;
          var orderType = returnData.result.orderType;  // 2是销售订单 3普通订单 4拼团  5限购 6爆款

          if (orderType==1){  //活动订单
            var numberArr = returnData.result.activityDetail;
            for (var i = 0; i < numberArr.length; i++) {
              if (numberArr[i].itemId == 4) {    //砸蛋次数
                thisPage.setData({
                  eggNumber: numberArr[i].num
                })
              }
              if (numberArr[i].itemId == 5) {    //抽奖次数
                thisPage.setData({
                  prizeNumber: numberArr[i].num
                })
              }
            }
          } else if (orderType == 2) {  //普通订单（无活动）

          } else if (orderType == 3){   //支付订单

          }

          //说明
          var explain = returnData.result.explain;
          if (explain){
            var explainArr = explain.split("\n");
            returnData.result.explainArr = explainArr;
          }
          //将presellTimes的时间变为 字符串
          for (var m = 0; m < orderDetails.productInfoList.length;m++){
            if (orderDetails.productInfoList[m].presellTimes){
              orderDetails.productInfoList[m].presellTimes = orderDetails.productInfoList[m].presellTimes.join(' ');
            }
          }

          thisPage.setData({
            orderDetails: orderDetails
          })
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
  

  

})
