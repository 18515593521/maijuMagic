//页面js
var app = getApp();   //获取应用实例
var Common = require("../../../utils/common.js");

Page({
  data: {
    menuClassArr: ['active', '', ''], //菜单选中样式
    chooseCardType: "1",    //卡券类型
    cardList: [],           //卡券列表
    active:null,  //选定的颜色

    cardType: {
      1: {  //优惠券
        backGroundImage: 'bg_2.png',
        backGroundImage2: 'bg_2.png',
        trueClass: "left_3",
        falseClass: "left_4"
      },
      2: {  //红包
        backGroundImage: 'bg_1.png',
        backGroundImage2: 'bg_1.png',
        trueClass: "left_1",
        falseClass: "left_2"
      },
      3: {  //折扣券
        backGroundImage: 'bg_3_1.png',
        backGroundImage2: 'bg_3_2.png',
        trueClass: "left_5",
        falseClass: "left_5"
      }
    }

  },

  //页面加载
  onLoad: function (options) { 
    this.getCustomerCardList();    //获取消费者卡券列表
    this.setData({
      active: app.globalData.userInfoAll.appColor
    })
  },


  //卡券类型选择
  chooseCardType: function (e) {
    var dataSet = e.currentTarget.dataset;
    var cardType = dataSet.param;

    for (var i = 0; i < this.data.menuClassArr.length; i++) {
      if (i == cardType) {
        this.data.menuClassArr[i] = 'active';
      } else {
        this.data.menuClassArr[i] = '';
      }
    }

    this.setData({
      menuClassArr: this.data.menuClassArr,
      chooseCardType: Number(cardType)+1
    })

    this.getCustomerCardList();    //获取消费者卡券列表
  },
  //获取消费者卡券列表
  getCustomerCardList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + "/app/selectCustomerCouponsPage",  //接口地址
      data: {           //请求参数
        ispage: false,    //是否分页
        param: {
          customerId: app.globalData.customerInfo.id,
          card_tpye: thisPage.data.chooseCardType,   //(1:优惠券;2:红包;3:折扣券;)
        }
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
            cardList: returnData.result.data
            // cardList: thisPage.getCardState(returnData.result)
          })
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.error('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //获取卡券状态
  getCardState: function (dataList) {
    for (var i = 0; i < dataList.length; i++) {
      var item = dataList[i];
      var startTime = item.start_time;
      var endTime = item.end_time;
      var nowTime = Common.getCurrentTime("date");
      if (nowTime < startTime){  
        item.cardState = 1;   //未到有效期
      } else if (nowTime >= startTime && nowTime <= endTime) {   
        if (item.isused) {   
          item.cardState = 2;   //已使用
        } else {    
          var timeRange = Common.getTimeRange(nowTime, endTime,"day");
          if (timeRange<=3){
            item.cardState = 3;   //即将到期
          }else{
            item.cardState = 4;   //有效
          }
        }
      }else{    
        item.cardState = 5;   //已过期
      }
    }

    return dataList;
  },

  

})
