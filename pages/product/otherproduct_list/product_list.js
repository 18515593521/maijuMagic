//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    isShowPrice: null,    //是否显示价格

    seriesIdList: [],     //系列Id集合
    searchText: "",         //搜索字段
    productList: null,      //产品列表

    currentPage: 1,  //当前页码
    pageSize: 6,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页
    isAuthorizePhone: false,   //获取电话号码
    wait: false,  //菊花
    payState:null,   //顶级支付状态
    payStatusInfo:null,  //店铺支付状态
      appColor: null  //页面颜色
  },

  //页面加载
  onLoad: function (options) {
    var thisPage = this;
    if (options.isShare=='1'){
      var location = {
        'lat': options.lat,
        'lng': options.lng
      };
      wx.setStorageSync('location', location);
      wx.setStorageSync('address', options.address);
      wx.setStorageSync('regionCode', options.regionCode);
      console.log('绑定' + JSON.stringify(options));
      app.globalData.inviterInfo.type = options.type;
      if (options.type == 1) {
        app.globalData.inviterInfo.value = options.P3;
      } else {
        app.globalData.inviterInfo.value = options.P4;
      }
      app.weChatLogin(1, options.lat, options.lng);
    }  

    var seriesIdList = [];
    
    if (options.seriesIdList) {
      seriesIdList = JSON.parse(options.seriesIdList)
      thisPage.setData({
        seriesIdList: seriesIdList
      })
    }
    if (options.searchText) {
      if (options.searchText=='null'){
        options.searchText = '';
      }
      thisPage.setData({
        searchText: options.searchText ? options.searchText:'',

      })
    }
    setTimeout(function () {
      thisPage.setData({
        isShowPrice: app.globalData.shopInfo.isOpen,
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false
      })
      thisPage.getProductList(1);      //获取产品列表
    }, 1000)

  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    //页面显示
      thisPage.getProductList(1);      //获取产品列表
      thisPage.setData({
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
        appColor: app.globalData.userInfoAll.appColor ? app.globalData.userInfoAll.appColor : '#4abcc2',
      })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getProductList(1);      //获取产品列表
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getProductList(searchPage);    //获取产品列表
    }
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    var param = "P1=otherList&P4=" + app.globalData.customerInfo.id + "&seriesIdList=" + JSON.stringify(thisPage.data.seriesIdList) + "&searchText=" + thisPage.data.searchText ;

    return {
      title: '产品列表',
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint("产品列表");
      }
    };
  },
  //设置搜索条件
  setSearchText: function (e) {
    var searchText = e.detail.value;
    this.setData({
      searchText: searchText
    })
  },
  //搜索
  searchProduct: function (e) {
    var dataSet = e.currentTarget.dataset;
    var searchType = dataSet.type;

    if (searchType == 2) {
      var searchText = e.detail.value;
      this.setData({
        searchText: searchText
      })
    }
    this.getProductList(1);
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //获取产品列表
  getProductList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryshopallMemberproducts',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        // arrModel: {
        //   ids: thisPage.data.seriesIdList
        // },
        param: {
          series_id: thisPage.data.seriesIdList.toString(),
          shopId: app.globalData.shopInfo.sys_user_id,
          product_title: thisPage.data.searchText,
          customerId: app.globalData.customerInfo.id,
          vip_level: app.globalData.customerInfo.vipInfo.vip_level
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
            dataList = thisPage.data.productList.concat(dataList);
          }

          thisPage.setData({
            productList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage,    //是否查询下一页
             wait: true,
             payState: app.globalData.customerInfo.payState,
             payStatusInfo: app.globalData.payStatusInfo//店铺价格显示不显示

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
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },


})
