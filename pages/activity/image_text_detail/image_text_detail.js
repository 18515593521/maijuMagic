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
    need_time:null,  //是否需要时间
    paramObj: null, //二维码跳转参数

    enableDebug: false, //调试工具状态
    appColor: null,  //颜色
    signButtonText: "我要报名",
    isAuthorizePhone: false, //获取电话号码
    nick_name: null, //名字
    wait: false, //菊花
    isImage: false, //是否是图文详情
    isCanApplay: null,  //是否可以报名
    fromType: null,//从哪里进来的
    booking_startTime_1: "请选择日期",    //预约开始时间
    booking_startTime_2: "请选择时间",    //预约开始时间
    booking_endTime_1: "请选择日期",      //预约结束时间
    booking_endTime_2: "请选择时间",      //预约结束时间
    nowDate: "2017-01-01",
    bookingPannelHidden:true ,
    isType:1  //1 当前活动  2 往期活动 
  },

  //页面加载
  onLoad: function (options) {
    var thisPage = this;
    if (options.isShare == '1') {
      options.fromType = 1;
      options.activityType = 2;
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
    options.activityType = 2;
    var timers = 1500;
    if (options.isShare == '1') {
      timers = 1500;
    } else {
      timers = 0;
    }

    setTimeout(function () {
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
        fromType: options.fromType,
        activity_id: options.activity_id,
        activityType: options.activityType,
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
        appColor: app.globalData.userInfoAll.appColor ? app.globalData.userInfoAll.appColor : '#4abcc2',
      
      });
      if (options.isType){
          thisPage.setData({
            isType: options.isType
          })
      }
      thisPage.getActivityDetails(); //获取活动详情

    }, timers)

  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    thisPage.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
    })
  },
  //页面分享
  onShareAppMessage: function () {
    var  thisPage =this ;
    var param = "P1=GG&P4=" + app.globalData.customerInfo.id + '&activity_id=' + this.data.activity_id + '&fromType=' + thisPage.data.fromType + '&activityType='+thisPage.data.activityType;

    return {
      title: '活动内容',
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint("活动内容");
      }
    };
  },


  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //
  //获取活动详情
  getActivityDetails: function () {
    var thisPage = this;

    var requestUrl = '';
    var postParam = {};

    wx.request({
      url: app.globalData.domainName + '/app/selectImageTextActivityDetails', //接口地址
      data: {
        id: thisPage.data.activity_id,
        customerId: app.globalData.customerInfo.id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) { //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
         
          thisPage.setData({
            activityDetails: returnData.result,
            wait: true,
            need_time: returnData.result.need_time
          });
          app.globalData.activityInfo = returnData.result;

          WxParse.wxParse('details', 'html', returnData.result.details, thisPage, 0);

          if (app.globalData.activityInfo.isApply == 1) { //已报名
            thisPage.setData({
              signButtonText: "信息已提交"
            })
          } else {
            thisPage.setData({
              signButtonText: returnData.result.button
            })
          }
        } else { //失败
          if (thisPage.data.activityType == '2'  && thisPage.data.isType == '1') {
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
              wait: true,
              need_time: returnData.result.need_time
            });
            app.globalData.activityInfo = returnData.result;

            WxParse.wxParse('details', 'html', returnData.result.details, thisPage, 0);

            if (app.globalData.activityInfo.isApply == 1) { //已报名
              thisPage.setData({
                signButtonText: "信息已提交"
              })
            } else {
              thisPage.setData({
                signButtonText: returnData.result.button
              })
            }
          }
        }
      },
      fail: function (res) { //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },

  //验证用户报名状态
  checkUserSignState: function () {
    var thisPage = this;
    if (thisPage.data.activityDetails.isApply == 1) { //已报名
        app.pageSkip("/pages/activity/activity_list/activity_list?activity=2", 2);
      return;
    } else {//没有报名
     
        if (thisPage.data.need_time==1){ //需要预约时间
          thisPage.setData({
            bookingPannelHidden:false
          })
      }else{  //不需要预约时间
          wx.showModal({
            title: '提示',
            content: '是否确认提交申请？',
            confirmText: '确认',
            success: function (res) {
              if (res.confirm) {
                thisPage.siganName();  //报名图文活动
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
      }
       
     

    }

  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
  //设置时间
  setTime: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;

    var obj = {};
    obj[key] = value;
    this.setData(obj);
  },
  //取消预约
  cancelBooking: function () {
    this.setData({
      bookingPannelHidden: true
    });
  },
  //提交预约
  submitBooking: function () {
    var thisPage = this;
    var thisData = this.data;

    if (thisData.booking_startTime_1 == "请选择日期") {
      app.showWarnMessage("请设置开始日期");
      return;
    }
    if (thisData.booking_startTime_2 == "请选择时间") {
      app.showWarnMessage("请设置开始时间");
      return;
    }
    
    var myDate = new Date();
    var selectTime = new Date(thisPage.data.booking_startTime_1 + " " + thisPage.data.booking_startTime_2 + ':00');
    if (Date.parse(myDate) > Date.parse(selectTime)){
      app.showWarnMessage("时间应大于当前时间！");
      return;
    }
    //之前的需求是有时间的现在隐藏 thisData.booking_startTime_1 + " " + thisData.booking_startTime_2   thisData.booking_endTime_1 + " " + thisData.booking_endTime_2
    thisPage.siganName();
  
  },
  //报名图文活动
  siganName: function () {
    var thisPage = this;
    var objects = {           //请求参数
      id: thisPage.data.activity_id,
      customerId: app.globalData.customerInfo.id,
      shopId: app.globalData.shopInfo.sys_user_id
    };
    if (thisPage.data.need_time==1){
      objects.shop_time = thisPage.data.booking_startTime_1 +" "+ thisPage.data.booking_startTime_2+':00';
    }
    wx.request({
      url: app.globalData.domainName + '/app/addImageTextActivityApply',  //接口地址
      data: objects ,
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
          setTimeout(function () {
            app.pageSkip("/pages/activity/activity_list/activity_list?activity=2", 2);
          }, 1500);


        } else {  //失败
          app.showWarnMessage('报名失败！');
        }
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