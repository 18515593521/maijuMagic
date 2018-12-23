//页面js
var app = getApp();   //获取应用实例
var urls = app.globalData.domainName;        //请求域名   
var util = require('../../utils/util.js');

Page({
  data: {
    name: null,     //姓名
    phone: null,    //手机号

    isPhone_ok: 0,            //手机号是否可用(0：无提示；1：yes；2：no;)
    isPhoneDisabled: false,   //手机号是否禁用
    verificationCode: null,  //验证码
    phoneValue: '点击获取验证码',
    countCode: 60, //记录
    countNum:1,  //第一次输入
    canCall: true,//如果是true 则可以点击验证 
    modalBox_message: {
      hidden: true,
      infoList: ["感谢您的注册"]
    },
    customerId:null,
    shopId:null,
    isShare:null
  },

  //页面加载
  onLoad: function (options) { 
    var customerId = null;
    var shopId = null;
    if (options.isShare&&options.isShare=='1'){
      customerId = options.customerId;
      shopId = options.shopId;
    }else{
      customerId = app.globalData.customerInfo.id;
      shopId =app.globalData.shopInfo.sys_user_id;
    }
    this.setData({
      phone: app.globalData.customerInfo.phone,
      customerId: customerId,
      shopId: shopId,
      isShare: options.isShare
      
    })
  },

  //文本框输入值
  inputValue: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;
    var thisPage = this;
    var obj = {};
    obj[key] = value;
    thisPage.setData(obj);
    if (key == 'phone' && thisPage.data.countNum=='2'){
      thisPage.setData({
        countCode:0

      })
    }
  },
  // 验证手机号
  isPhoneNumber: function (e) {
    var phone = e.detail.value;
    if (phone){
      var phoneStr = /^1[3|4|5|7|8]\d{9}$/;
      if (phoneStr.test(phone)) {
        this.setData({
          isPhone_ok: 1
        })
      } else {
        this.setData({
          isPhone_ok: 2
        })
      }
    }else{
      this.setData({
        isPhone_ok: 0
      })
    }
  },
  //验证
  check: function () {
    var thisPage = this;

    if (!thisPage.data.phone) {
        app.showWarnMessage("请输入手机号！");
        return;
    } else if (thisPage.data.isPhone_ok==2){
      app.showWarnMessage("手机号不规范！");
      return;
    }

    var paramData = {
      name: thisPage.data.name,
      phone: thisPage.data.phone,
      customerId:thisPage.data.customerId ,
      shopId: thisPage.data.shopId,
      needVCode:1,
      vCode: thisPage.data.verificationCode,
      commissionStatus: app.globalData.is_horizontal_alliances ? 1 : 2
    };

    wx.request({
      url: app.globalData.domainName + '/app/registerPhone',  //接口地址
      data: paramData,          //请求参数
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.globalData.customerInfo.id = returnData.result.customerId;
          app.globalData.customerInfo.guiderId = returnData.result.sellerId;
          app.globalData.customerInfo.name = thisPage.data.name;
          app.globalData.customerInfo.phone = thisPage.data.phone;
              
          
          thisPage.setData({
            "modalBox_message.hidden": false
          });
          setTimeout(function () {
            app.pageBack(1);
          }, 2000);
          app.getIsMember();  //请求是否有会员等级
        //   thisPage.setInvitePoint();
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
  //设置邀请积分
  setInvitePoint: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/seller/addPoint',  //接口地址
      data: {           //请求参数
        seller_id: app.globalData.inviterId,
        type_index: 11,
        title: "邀请积分"
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
         
        } else {  //失败
          console.log("设置邀请积分fail");
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        app.pageBack(1);
      }
    })
  },
  //获取验证码
  getCode: function (e) {
    var thisPage = this;
    var value = null;
    var countCode = parseInt(thisPage.data.countCode);
    if (!thisPage.data.phone){
      app.showWarnMessage('请填写手机号');
        return;
    }
    if (thisPage.data.canCall) {
      var thisPage = this;
      wx.request({
        url: urls + '/app/sendSMS',
        data: {           //请求参数      
          phone: thisPage.data.phone,
          shopId: app.globalData.shopInfo.sys_user_id
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        method: 'POST',
        success: function (res) {
          var resData = res.data;
          if (resData.code == 0) {
            app.showWarnMessage('发送成功！');
            thisPage.setData({
              canCall: false,
              countNum:2
            })
          } else {
            app.showWarnMessage('发送失败！重试！');
            thisPage.setData({
              canCall: true,
              countCode:0
            })
          }

        },
        fail: function (res) {
          console.log(res + '失败！');
        }
      })
    }
    if (countCode == 0) {
      value = '重新发送验证码';
      countCode = 60;
      thisPage.setData({
        canCall: true
      })
    } else {
      value = '剩余' + countCode + 's';
      countCode--;
      setTimeout(function () {
        thisPage.getCode();
      }, 1000)
    }
    thisPage.setData({
      phoneValue: value,
      countCode: countCode
    })

  },  
})
