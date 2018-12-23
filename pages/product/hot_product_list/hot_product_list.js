//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    productId: null,      //产品Id
    hotProductList: [],   //爆款产品列表
    isCanBuy: false,      //是否可以购买

    currentPage: 1,  //当前页码
    pageSize: 5,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页
    payState: null,   //顶级支付状态
    payStatusInfo: null,  //店铺支付状态
    isAuthorizePhone:null  //手机号
  },

  //页面加载
  onLoad: function (options) {
    this.setData({
      productId: options.productId,
      isCanBuy: app.globalData.customerInfo.payState==1 ? true : false,
     
    });
  
  },
  //页面显示
  onShow: function () {
    this.getHotProductList(1);      //获取爆款产品列表
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getHotProductList(1);      //获取爆款产品列表
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getHotProductList(searchPage);    //获取爆款产品列表
    }
  },
  //获取爆款产品列表
  getHotProductList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryAppHotProductPage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          shop_id: app.globalData.shopInfo.sys_user_id,
          product_id: thisPage.data.productId,
          customer_id: app.globalData.customerInfo.id
        }
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        // console.log('【接口返回数据】',returnData);

        if (returnData.code == 0) { //成功
          var dataList = returnData.result.data;
          for (var i = 0; i < dataList.length; i++){
            var dataObj = dataList[i];
            dataObj.percent = (dataObj.pmgressbar * 100).toFixed(0);
          }

          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.hotProductList.concat(dataList);
          }

          thisPage.setData({
            hotProductList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage,    //是否查询下一页
            payState: app.globalData.customerInfo.payState,
            payStatusInfo: app.globalData.payStatusInfo,//店铺价格显示不显示
            isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
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
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
 
  
  
})