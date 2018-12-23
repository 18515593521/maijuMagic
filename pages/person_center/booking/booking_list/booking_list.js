//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    state: "",          //状态
    bookingList: [],    //预约列表

    currentPage: 1,  //当前页码
    pageSize: 6,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页

    stateList: [
      { name: '全部', value: '', choose:'active' },
      { name: '已提交', value: '1', choose: ''},
      { name: '已预订', value: '2', choose: '' },
      { name: '已取消', value: '3', choose: ''},
    ],
    stateMap: {
      1:"已提交",
      2: "已预订",
      3: "已取消"
    },
      active: null, //颜色
  },

  //页面加载
  onLoad: function (options) {
    this.setData({
      active: app.globalData.userInfoAll.appColor
    })
  },
  //页面显示
  onShow: function () {

    this.getBookingList(1);      //获取预约列表
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getBookingList(1);      //获取预约列表
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getBookingList(searchPage);    //获取预约列表
    }
  },

  //选择预约状态
  chooseBookingState: function (e) {
    var dataSet = e.currentTarget.dataset;
    var state = dataSet.param;

    for (var i = 0; i < this.data.stateList.length; i++) {
      var stateObj = this.data.stateList[i];
      if (stateObj.value == state) {
        stateObj.choose = 'active';
      } else {
        stateObj.choose = '';
      }
    }
    this.setData({
      stateList: this.data.stateList,
      state: state
    })
    this.getBookingList(1);      //获取预约列表
  },
  //获取预约列表
  getBookingList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryAppHotProductReservePage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          customer_id: app.globalData.customerInfo.id,
          state: thisPage.data.state
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
          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.bookingList.concat(dataList);
          }

          thisPage.setData({
            bookingList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage    //是否查询下一页
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

  
})