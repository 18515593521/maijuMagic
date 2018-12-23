//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    limit_buy_time:[],
    limit_buy_time_list: [],
    productList: [],   //限购产品列表
    limit_buy_id:null,
    limit_buy_time_id:null,
    type:1,
    time:null,
    shopId:null,
    map:null,
    limit_buy_type:null,
    currentPage: 1,  //当前页码
    pageSize: 5,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页
    payState: null,   //顶级支付状态
    payStatusInfo: null,  //店铺支付状态
    isAuthorizePhone:null,  //手机号
    showLimitTimeStyle:null
  },

  //页面加载
  onLoad: function (options) {
    this.setData({
      shopId: app.globalData.shopInfo.sys_user_id
    });
  
  },
  //页面显示
  onShow: function () {
    this.getLimitBuy();

    //this.getLimitBuyProductList(1);     
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getLimitBuy();      
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getLimitBuyProductList(searchPage);  
    }
  },
  getLimitBuy:function(){
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/queryLimitBuy',  //接口地址
      data: {           //请求参数
        shopId: thisPage.data.shopId,
        type: thisPage.data.type,
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        
        var index1 = 0;
        if (returnData.code == 0) { //成功
          var limit_buy_time_list = returnData.result.list;
          for (var i = 0; i < limit_buy_time_list.length; i++) {

            var time3 = new Date(limit_buy_time_list[i].start_time).getMinutes();
            if (JSON.stringify(time3).length==1){
              time3 = '0' + time3;
            }
            var time4 = new Date(limit_buy_time_list[i].end_time).getMinutes();
            if (JSON.stringify(time4).length == 1) {
              time4 = '0' + time4;
            }
            var time1 = new Date(limit_buy_time_list[i].start_time).getHours() + ':' + time3 ;
            var time2 = new Date(limit_buy_time_list[i].end_time).getHours() + ':' + time4;

            limit_buy_time_list[i].start_time1 = time1;
            limit_buy_time_list[i].end_time1 = time1;
            if (limit_buy_time_list[i].id == returnData.result.map.limit_buy_time){
              limit_buy_time_list[i].color ='#ff1515';
              limit_buy_time_list[i].size = '40rpx';
              limit_buy_time_list[i].top = '0rpx';
            }else{
              limit_buy_time_list[i].top = '12rpx';
            }
            var now1 = new Date().getTime();
            var endTime = new Date(limit_buy_time_list[i].end_time).getTime();
            var startTime = new Date(limit_buy_time_list[i].start_time).getTime();
            if(now1 >endTime){
              limit_buy_time_list[i].type =3
            } else if (startTime > now1){
              if(index1 == 0){
                limit_buy_time_list[i].type = 10
                index1 = 2;
              }else{
                limit_buy_time_list[i].type = 1
              }
              
            }
          }

          var showLimitTimeStyle = null;
          if (limit_buy_time_list.length >=3){
            showLimitTimeStyle = "showLimitTime3";
          } else if (limit_buy_time_list.length == 2){
            showLimitTimeStyle = "showLimitTime2";
          } else if (limit_buy_time_list.length == 1){
            showLimitTimeStyle = "showLimitTime1";
          }

          thisPage.setTime(returnData.result.map.time, returnData.result.map.type);

          thisPage.setData({
            limit_buy_time: limit_buy_time_list,
            limit_buy_time_id: returnData.result.map.limit_buy_time,
            limit_buy_id: returnData.result.id,
            limit_buy_type: returnData.result.type,
            map: returnData.result.map,
            payState: app.globalData.customerInfo.payState,
            payStatusInfo: app.globalData.payStatusInfo,//店铺价格显示不显示
            isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
            showLimitTimeStyle: showLimitTimeStyle
          })
          thisPage.getLimitBuyProductList(1);
          
        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
        
      },
      complete: function (res) { //完成
        
        wx.stopPullDownRefresh();
      }
    })
  },
  //获取产品列表
  getLimitBuyProductList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryLimitBuyProductPage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          shop_id: thisPage.data.shopId,
          type: thisPage.data.limit_buy_type,
          id: thisPage.data.limit_buy_id,
          limit_buy_time: thisPage.data.limit_buy_time_id,
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
            dataList = thisPage.data.productList.concat(dataList);
          }

          thisPage.setData({
            productList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage,    //是否查询下一页
           
          })
        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
       
      },
      complete: function (res) { //完成
       
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
 setTime:function(times,type){
   var thisPage = this;
   var time = new Date(times).getTime();
  var now = new Date().getTime();
  var time1;
  if (now > time){
    time1 = now - time;
  } else if (now < time){
    time1 = time -now;
  }
 if(time1>=0){
   time1 = time1 - 1000;
   var h = parseInt(time1 / (1000 * 60 * 60));
   var m1 = time1 - h * (1000 * 60 * 60);
   var m = parseInt(m1 / (1000 * 60));
   var s1 = m1 - m * 1000 * 60;
   var s = parseInt(s1 / 1000);
   var time2 = {};
   time2.h = h;
   time2.m = m;
   time2.s = s;
   thisPage.setData({
     time: time2
   })
   setTimeout(function () {
     thisPage.setTime(times, type);
   }, 1000)
 }else{
   this.getLimitBuy();
 }
 },

  
})