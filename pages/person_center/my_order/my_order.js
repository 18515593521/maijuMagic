//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    isHaveData: true,   //是否有数据

    menuClassArr: ['active', '', '', '', ''], //菜单选中样式

    orderList: [],        //订单列表
    orderState: null,     //订单状态
    searchText: "",       //搜索字段
    payInfoList: [],      //支付明细
    
    payDataList_1: [],   //未支付信息
    payDataList_2: [],   //已支付信息
    unPayMoney: 0.00,
    hasPayMoney: 0.00,
    unPayIds: '',        //未支付key

    operateOrderId: null, //操作的订单Id

    payInfoHidden: true,   //支付明细（隐藏）

    currentPage: 1,  //当前页码
    pageSize: 4,     //每页记录数
    total: 0,        //总记录数 
    isSearchNextPage: true,   //是否查询下一页

    orderStateObj: {
      1: "待支付",
      2: "待发货",
      3: "已完成",
      4: "关闭"
    },
    orderType: [  //订单类型
      { id: null, name: "全部" },
      { id: 3, name: "在线订单" },
      { id: 1, name: "店面订单" },
    ],  
    showOrderType: 0,   //显示的订单类型下标  
    orderType2:null,   //订单类型
    active:null  , //颜色
  },

  //页面加载
  onLoad: function (options) { 
   this.setData({
     orderType2: options.orderType2 ? options.orderType2:'2',
     active: app.globalData.userInfoAll.appColor
   })
  },
  //页面显示
  onShow: function () {
    this.getOrderList(1);
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getOrderList(searchPage);    //获取订单列表
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    if (this.data.payInfoHidden){
      this.getOrderList(1);
    }
  },

  //订单状态选择
  chooseOrderState: function (e) {
    var dataSet = e.currentTarget.dataset;
    var orderState = dataSet.param;

    for (var i = 0; i < this.data.menuClassArr.length; i++) {
      if (i == orderState) {
        this.data.menuClassArr[i] = 'active';
      } else {
        this.data.menuClassArr[i] = '';
      }
    }

    this.setData({
      menuClassArr: this.data.menuClassArr
    })

    if (orderState == 0) {  //全部
      this.setData({
        orderState: ""
      })
    } else {
      this.setData({
        orderState: orderState
      })
    }

    this.getOrderList(1);       //获取订单列表
  },
  //设置搜索条件
  setSearchText: function (e) {
    var searchText = e.detail.value;
    this.setData({
      searchText: searchText
    })
  },
  //搜索订单
  searchOrder: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var searchType = dataSet.type;

    if (searchType == 1) {
      var searchText = e.detail.value;
      this.setData({
        searchText: searchText
      })
    }

    thisPage.getOrderList(1);
  },
  //选择订单类型
  selectOrderType: function (e) {
    var index = e.detail.value;

    this.setData({
      showOrderType: index
    })
    this.getOrderList(1);
  },
  //获取订单列表(所有的)
  getOrderList: function (searchPage) {
    var thisPage = this;
    if (thisPage.data.orderType2==1){
      var urls = 'selectCustomerOrderByActivityIdPage';  //活动
    }else{
      var urls = 'selectCustomerOrderPage';  //所有的
    }
   
    wx.request({
      url: app.globalData.domainName + '/app/' + urls,  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          customerId: app.globalData.customerInfo.id,
          orderState: thisPage.data.orderState,
          search: thisPage.data.searchText,
          orderType: thisPage.data.orderType[thisPage.data.showOrderType].id,
activityId:app.globalData.activityInfo.activity_id
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
          var dataList = returnData.result.data;
          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.orderList.concat(dataList);
          }

          var isHaveData = true;
          if (searchPage==1 && dataList.length==0){ //第一页无数据
            isHaveData = false;
          }

          thisPage.setData({
            orderList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage,    //是否查询下一页
            isHaveData: isHaveData
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
        wx.stopPullDownRefresh();
      }
    })
  },

  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //删除订单
  deleteOrder: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var orderId = dataSet.param;

    wx.showModal({
      title: '提示',
      content: '是否确认删除订单？',
      success: function (res) {
        if (res.confirm) {
          thisPage.deleteOrderForServer(orderId);    //删除地址
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  //删除订单(请求后台)
  deleteOrderForServer: function (orderId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/cancelOrder',  //接口地址
      data: {
        orderId: orderId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.showSuccessMessage("成功！");
          thisPage.getOrderList(1);
        } else {
          app.showWarnMessage("删除失败！");
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
  //支付金额
  payMoney: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var orderId = dataSet.param;
    var payCount = dataSet.paycount;
    var formId = e.detail.formId;     //表单Id

    if (formId){
      thisPage.addFormInfo(formId);   //添加form信息
    }

    if (payCount==1){ //单次
      wx.request({
        url: app.globalData.domainName + '/app/errorPay',  //接口地址
        data: {
          orderId: orderId
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {  //成功
          var returnData = res.data;

          if (returnData.code == 0) { //成功
            var payParam = returnData.result;
            thisPage.weChatPay(payParam,1);   //微信支付
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
    } else if (payCount == 2){  //多次
      wx.request({
        url: app.globalData.domainName + '/app/selectJdkInfo',  //接口地址
        data: {
          orderId: orderId
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {  //成功
          var returnData = res.data;
          var payDataList_1 = [];
          var payDataList_2 = [];
          var unPayMoney = 0;
          var hasPayMoney = 0;
          var unPayIds = [];

          if (returnData.code == 0) { //成功
            for (var i = 0; i < returnData.result.length; i++) {
              var payItem = returnData.result[i];
              if (payItem.status==1){ //待支付
                payDataList_1.push(payItem);
                unPayMoney += payItem.money;
                unPayIds.push(payItem.id);
              } else if (payItem.status == 2){  //已支付
                payDataList_2.push(payItem);
                hasPayMoney += payItem.money;
              }
            }

            thisPage.setData({
              operateOrderId: orderId,
              payInfoHidden: false,
              payInfoList: returnData.result,
              payDataList_1: payDataList_1,
              payDataList_2: payDataList_2,
              unPayMoney: unPayMoney.toFixed(2),
              hasPayMoney: hasPayMoney.toFixed(2),
              unPayIds: unPayIds
            });
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
    }
  },
  //取消支付
  cancelPay: function () {
    this.setData({
      payInfoHidden: true
    });
  },
  //确认支付
  ensurePay: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/addJdk',  //接口地址
      data: {
        customerId: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id,
        jdkIds: thisPage.data.unPayIds.join("_")
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var payParam = returnData.result;
          thisPage.weChatPay(payParam,2);   //微信支付
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
  weChatPay: function (payParam,payCount) {
    var thisPage = this;

    wx.requestPayment({
      'timeStamp': payParam.timeStamp,
      'nonceStr': payParam.nonceStr,
      'package': payParam.repay_id,
      'signType': 'MD5',
      'paySign': payParam.paySign,
      'success': function (res) {
        console.log("微信支付成功！");
        if (payCount == 1){ //单次支付
          thisPage.changeOrderState(payParam.orderId);
        } else if (payCount == 2){  //多次支付
          thisPage.changeProgressMoneyState(thisPage.data.operateOrderId, payParam.jdkIds);
        }
      },
      'fail': function (res) {
        console.log("微信支付取消/失败！", res);
        if (res == 'requestPayment:fail cancel') {  //失败
          app.showWarnMessage("支付取消");
        }else{
          app.showWarnMessage("支付失败");
        }
      },
      'complete': function (res) {
        console.log('微信支付结束：', res);
      }
    })
  },
  //修改订单状态
  changeOrderState: function (orderId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/payIsSuccess',  //接口地址
      data: {   //请求参数
        orderId: orderId,
        commissionStatus: app.globalData.is_horizontal_alliances ? 1 : 2,
        node3: app.globalData.customerInfo.factoryId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("【修改订单状态】", returnData);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        thisPage.getOrderList(1);
      }
    })
  },
  //修改进度款状态
  changeProgressMoneyState: function (orderId, jdkIds) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/jdkPayIsSuccess',  //接口地址
      data: {   //请求参数
        orderId: orderId,
        jdkIds: jdkIds
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("【修改订单状态】", returnData);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        thisPage.setData({
          payInfoHidden: true
        });
        thisPage.getOrderList(1);
      }
    })
  },
  //添加form信息
  addFormInfo: function (formId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/addFormId',  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        formId: formId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("【添加form信息】", returnData);
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
