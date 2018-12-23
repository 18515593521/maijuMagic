//页面js
var app = getApp();   //获取应用实例
var util = require('../../../utils/util.js');

Page({
  data: {
    _name: null,    //注册姓名
    _phone: null,   //注册手机号

    nickName: null, //昵称
    name: null,     //姓名
    phone: null,    //手机号

    shopId: "",     //店铺Id
    shopName: "",       //店铺名称
    shopAddress: "",    //店铺地址
    shopList: [],
    selectShop: 0,     //选中的店铺下标 
    imgurl: "about:blank",   //活动图

    modalBox_message: {
      hidden: true,
      infoList: ["申请提交成功","我们会尽快跟您取得联系"]
    }, 

  },

  //页面加载
  onLoad: function (options) {
    var nick_name = null;
    if (options.nick_name){
      nick_name = options.nick_name;
    }else{
      nick_name = app.globalData.userInfo.nickName;
    }

    this.setData({
      nickName: nick_name,
      name: app.globalData.customerInfo.name,
      phone: app.globalData.customerInfo.phone,
      imgurl: app.globalData.activityInfo.blockurl,
      _name: app.globalData.userInfo.nickName,
      _phone: app.globalData.customerInfo.phone,
      activity_id: options.activity_id
    })
    this.getShopList();       //获取店铺列表
  },

  //文本框输入值
  inputValue: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;

    var obj = {};
    obj[key] = value;
    this.setData(obj)
  },
  //店铺选择
  shopChoose: function (e) {
    var thisPage = this;
    var value = e.detail.value;

    this.setData({
      shopId: thisPage.data.shopList[value].shop_id,
      shopName: thisPage.data.shopList[value].name,
      shopAddress: thisPage.data.shopList[value].addr
    })
  },
  //获取店铺列表
  getShopList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectActivityShop',  //接口地址
      data: {           //请求参数
        activity_id:thisPage.data.activity_id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var index = util.getIndexFromArray(returnData.result, "shop_id", app.globalData.customerInfo.guiderShopId);
          if (index == -1){
            index = 0;
          }
          thisPage.setData({
            shopList: returnData.result,
            selectShop: index,
            shopId: returnData.result[index].shop_id,
            shopName: returnData.result[index].name,
            shopAddress: returnData.result[index].addr
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
  //参与活动
  joinActivity: function () {
    var thisPage = this;
    var thisData = this.data;

    wx.showModal({
      title: '提示',
      content: '是否确认提交申请？',
      confirmText: '确认',
      success: function (res) {
        if (res.confirm) {
          thisPage.sendActivityInfoToServer();    //向后台发送活动信息
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //向后台发送活动信息
  sendActivityInfoToServer: function () {
    var thisPage = this;
    console.info("【报名店铺id----", thisPage.data.shopId);

    var paramObj = {
      customer_id: app.globalData.customerInfo.id,
      shop_id: thisPage.data.shopId,
      shop_name: thisPage.data.shopName,
      activity_id: thisPage.data.activity_id
    };
    if (!app.globalData.customerInfo.name){  //未注册
      paramObj.customer_name = thisPage.data._name;
      paramObj.phone = thisPage.data._phone;

      if (!paramObj.customer_name) {
        app.showWarnMessage("请输入姓名！");
        return;
      }
      if (!paramObj.phone) {
        app.showWarnMessage("请输入手机号！");
        return;
      }else{
        var phoneStr = /^1[3|4|5|7|8]\d{9}$/;
        if (!phoneStr.test(paramObj.phone)) {
          app.showWarnMessage("手机号不规范！");
          return;
        }
      }
    }

    wx.request({
      url: app.globalData.domainName + '/app/addEntryActivity',  //接口地址
      data: paramObj,           //请求参数
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            "modalBox_message.hidden": false
          });
          app.globalData.activityInfo.isApply = 1;
          if (!app.globalData.customerInfo.name){
            app.globalData.customerInfo.name = thisPage.data._name;
          }
          if (!app.globalData.customerInfo.phone) {
            app.globalData.customerInfo.phone = thisPage.data._phone;
          }
          setTimeout(function () {
            app.pageSkip("/pages/person_center/my_activity/my_activity?activity_id=" + thisPage.data.activity_id, 2);
          }, 1500);
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
