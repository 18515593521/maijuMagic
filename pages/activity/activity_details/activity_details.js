// 引入腾讯地图SDK核心类
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js');
var QQmapsdk;

//页面js
var app = getApp(); //获取应用实例
var Common = require("../../../utils/common.js");
var WxParse = require('../../../plugs/wxParse/wxParse.js');

Page({
  data: {
    modalBox_message: {
      hidden: true,
      infoList: ["申请提交成功", "我们会尽快跟您取得联系"]
    }, 
    isHaveActivity: false, //是否有活动
    isHideSwitchPositin: true, //是否隐藏切换地区

    activityId: null, //活动id(往期活动)
    isHistoryActivity: false, //是否是历史活动

    activityType: null, //活动类型( 1精彩活动  2图文活动 3 往期活动详情)
    activityDetails: null, //活动详情
    activity_id: null, // 活动id
    code: "", //区域编码
    address: "北京市", //地址

    paramObj: null, //二维码跳转参数

    enableDebug: false, //调试工具状态
    appColor:null,  //颜色
    signButtonText: "我要报名",
    isAuthorizePhone: false, //获取电话号码
    nick_name: null, //名字
    wait: false, //菊花
    isImage: false, //是否是图文详情
    isCanApplay:null,  //是否可以报名
    fromType:null,//从哪里进来的
    isType: 1,  //1 当前活动  2 往期活动 
    isApply:null  //是否已经报名  1 是已经报名 2 是未报名
  },

  //页面加载
  onLoad: function(options) {
    var thisPage = this;
    if (options.isShare == '1') {
      options.fromType = 1;
      options.activityType = 1;
      var location = {
        'lat': options.lat,
        'lng': options.lng
      };
      wx.setStorageSync('location', location);
      wx.setStorageSync('address', options.address);
      wx.setStorageSync('regionCode', options.regionCode);

      app.globalData.inviterInfo.type = options.type;
      if (options.type == 1) {
        app.globalData.inviterInfo.value = options.P3;
      } else {
        app.globalData.inviterInfo.value = options.P4;
      }

      app.weChatLogin(1, options.lat, options.lng);

    }
    var timers =1500;
    if (options.isShare == '1') {
      timers = 1500;
    }else{
      timers = 0;
    }

    setTimeout(function() {
      if (options.activityType !== 3) { //往期活动
        thisPage.setData({
          isHistoryActivity: true,
        })
        if (options.activityType == 2) {
          thisPage.setData({
            isImage: true
          })
        }
      }

      thisPage.setData({
        fromType: options.fromType ,
        activity_id: options.activity_id,
        activityType: options.activityType,
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
        appColor: app.globalData.userInfoAll.appColor ? app.globalData.userInfoAll.appColor : '#4abcc2',
    
      });
      if (options.isType) {
        thisPage.setData({
          isType: options.isType
        })
      }
      thisPage.getActivityDetails(); //获取活动详情

    }, timers )

  },
  //页面显示
  onShow: function() {
    var thisPage = this;
    thisPage.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
    })
  },
  //页面分享
  onShareAppMessage: function() {
    var thisPage = this;
    var param = "P1=G&P4=" + app.globalData.customerInfo.id + '&activity_id=' + this.data.activity_id + '&fromType=' + thisPage.data.fromType + '&activityType=' + thisPage.data.activityType;

    return {
      title: '活动内容',
      path: "/pages/index/index?" + param,
      success: function(res) {
        app.addPageSharePoint("活动内容");
      }
    };
  },


  //页面跳转
  pageSkip: function(e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //
  //获取活动详情
  getActivityDetails: function() {
    var thisPage = this;

    var requestUrl = '';
    var postParam = {};

    //精彩活动
    if (thisPage.data.activityType == '1') { //精彩活动
      requestUrl = '/app/selectActivityDetail';
      postParam = {
        activityId: thisPage.data.activity_id,
        shopId: app.globalData.shopInfo.sys_user_id,
        customerId: app.globalData.customerInfo.id
      };
    } else if (thisPage.data.activityType == '3') { //往期活动详情
      requestUrl = '/app/selectPreviousActivityDrtail';
      postParam = {
        activity_id: thisPage.data.activity_id,
        customer_id: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id
      };
    }

    wx.request({
      url: app.globalData.domainName + requestUrl, //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) { //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
         
          thisPage.setData({
            activityDetails: returnData.result,
            wait: true
          });
          app.globalData.activityInfo = returnData.result;

          if (!returnData.result.details) {
            returnData.result.details = "无";
          }
          WxParse.wxParse('details', 'html', returnData.result.details, thisPage, 0);

          if (app.globalData.activityInfo.isApply == 1) { //已报名
            thisPage.setData({
              signButtonText: "我已报名"
            })
          } else {
            thisPage.setData({
              signButtonText: "我要报名"
            })
          }
        } else { //失败
          if (thisPage.data.activityType == '1' && thisPage.data.isType == '1') {
            if (returnData.code == '2') {
              var messages = '该活动已经下架！'
            } else if (returnData.code == '3') {
              var messages = '该活动已经结束！'
            } else if (returnData.code == '4') {
              var messages = '该活动还未开始！'
            }
            wx.showModal({
              title: '提示',
              content: messages,
              success: function (res) {
                if (res.confirm) {
                  app.pageBack(1);
                } else if (res.cancel) {
                  app.pageBack(1);
                }
              }
            })
          }else{
            thisPage.setData({
              activityDetails: returnData.result,
              wait: true
            });
            app.globalData.activityInfo = returnData.result;

            if (!returnData.result.details) {
              returnData.result.details = "无";
            }
            WxParse.wxParse('details', 'html', returnData.result.details, thisPage, 0);

            if (app.globalData.activityInfo.isApply == 1) { //已报名
              thisPage.setData({
                signButtonText: "我已报名",
                isApply:1
              })
            } else {
              thisPage.setData({
                signButtonText: "我要报名",
                isApply: 2
              })
            }
          }
        }
      },
      fail: function(res) { //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function(res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },

  //验证用户报名状态
  checkUserSignState: function() {
    var thisPage = this;
    if (thisPage.data.activityDetails.isApply == 1) { //已报名
    
      app.pageSkip("/pages/person_center/my_activity/my_activity?activity_id=" + thisPage.data.activity_id, 1);
      return;
    }else{
        app.pageSkip("/pages/activity/activity_sign/activity_sign?activityType=" + '&activity_id=' + thisPage.data.activity_id, 1);
      
    }
   
  },
  //授权手机号
  authorizePhone: function(e) {
    app.authorizePhone(e);
  },

})