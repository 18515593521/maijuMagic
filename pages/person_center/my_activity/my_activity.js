//页面js
var app = getApp();   //获取应用实例
var util = require('../../../utils/util.js');

Page({
  data: {
    isJoinActivity: false,   //是否参与活动

    activityInfo: null,       //活动信息
    codeImage: "about:blank", //二维码 
    logoImage: "about:blank", //logo图片
    talkHistory: [],          //沟通记录
    commentContent: "",       //评论内容
    activity_id:null,        //活动id
    confirm_hidden: true,   //确认框（隐藏）
    modalBox_message: {
      hidden: true,
      infoList: ["评价提交成功", "感谢您的点评！我们会继续努力！"]
    },

    signState: {  //签到状态
      0: "未签到",
      1: "已签到"
    },
    talkState: {  //沟通状态
      1: "已联系",
      2: "已进店",
      3: "已购卡",
      4: "已订单",
      5: "已活动",
      6: "已物流",
      7: "已安装",
      8: "售后中",
      9: "已关闭",
      10: "未接通"
    },

  },

  //页面加载
  onLoad: function (options) { 
    var thisPage = this;
    thisPage.setData({
      activity_id: options.activity_id
    })
    this.getNearestShopActivity();  //获取最近店铺的活动

  },
  //页面显示
  onShow: function () { 
  
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getActivityDetails();    //获取活动详情
  },

  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },

  //评价
  comment: function () {
    this.setData({
      confirm_hidden: false,
      commentContent: ""
    });
  },
  //取消
  cancelComment: function () {
    this.setData({
      confirm_hidden: true
    });
  },
  //设置内容
  setContent: function (e) {
    var content = e.detail.value;

    if (util.isEmojiCharacter(content)) {
      app.showWarnMessage("不支持表情");
      wx.hideKeyboard()
    }
    content = util.filterEmoji(content);

    this.setData({
      commentContent: content
    })
  },
  //确认
  submitComment: function () {
    var thisPage = this;

    if (!thisPage.data.commentContent) {
      app.showWarnMessage('请输入评论');
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/addHelperCommentActivity',  //接口地址
      data: {
        activity_id:thisPage.data.activity_id,
        customer_id: app.globalData.customerInfo.id,
        content: thisPage.data.commentContent
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
            confirm_hidden: true,
            "modalBox_message.hidden": false
          });
          thisPage.getActivityDetails();    //获取活动详情
          setTimeout(function () {
            thisPage.setData({
              "modalBox_message.hidden": true
            });
          }, 2000);
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

  //获取最近店铺的活动
  getNearestShopActivity: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectFilialeActivityById',  //接口地址
      data: {
        filialeId: app.globalData.shopInfo.sys_user_id,
        customer_id: app.globalData.customerInfo.id,
        activity_id: thisPage.data.activity_id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
          app.globalData.activityInfo = returnData.result;
        }

        if (app.globalData.activityInfo.isApply == 1) {
          thisPage.setData({
            isJoinActivity: true
          });
          thisPage.getActivityDetails();    //获取活动详情
          thisPage.getQRCodeImage();        //获取二维码图片
          thisPage.getLogoImage();          //获取Logo图片
          thisPage.getTalkHistory();        //获取沟通记录
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

  //获取活动详情
  getActivityDetails: function (id) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectXCXActivity',  //接口地址
      data: {
        id: thisPage.data.activity_id,
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
            activityInfo: returnData.result
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
  //获取二维码图片
  getQRCodeImage: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/createQRCode',  //接口地址
      data: {
        activityId: thisPage.data.activity_id,
        customerId: app.globalData.customerInfo.id,
        node3: app.globalData.customerInfo.factoryId
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
      }
    })
  },
  //获取Logo图片
  getLogoImage: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectNode3Image',  //接口地址
      data: {
        node3: app.globalData.customerInfo.factoryId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
          thisPage.setData({
            logoImage: returnData.result
          });
        } else {  //失败
          console.log("【获取Logo图片】fail！");
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
  //获取沟通记录
  getTalkHistory: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectRecordOfCommunication',  //接口地址
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
            talkHistory: returnData.result
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
      }
    })
  },

  

})
