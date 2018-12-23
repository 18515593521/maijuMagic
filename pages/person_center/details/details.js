// pages/person_center/details/details.js 
var app = getApp();   //获取应用实例 
Page({

  /** 
   * 页面的初始数据 
   */
  data: {
    isHaveData: true,   //是否有数据 
    pullNum: 1,    //当前页面的 
    pageSize: 15,    //一页的产品 
    total: 0, //总条数 
    isSearchNextPage: true,  //是否查询 
    groupData: [],
  },

  /** 
   * 生命周期函数--监听页面加载 
   */
  onLoad: function (options) {

    this.groupList(1);
  },

  /** 
   * 生命周期函数--监听页面初次渲染完成 
   */
  onReady: function () {

  },

  /** 
   * 生命周期函数--监听页面显示 
   */
  onShow: function () {

  },

  /** 
   * 生命周期函数--监听页面隐藏 
   */
  onHide: function () {

  },

  /** 
   * 生命周期函数--监听页面卸载 
   */
  onUnload: function () {

  },

  /** 
   * 页面相关事件处理函数--监听用户下拉动作 
   */
  onPullDownRefresh: function () {
    var thisPage = this;
    app.showWarnMessage("刷新中！");
    thisPage.groupList(1);
    wx.stopPullDownRefresh();  //页面自己回去！！ 
  },

  /** 
   * 页面上拉触底事件的处理函数 
   */
  onReachBottom: function () {
    var thisPage = this;
    if (thisPage.data.isSearchNextPage) {
      var pullNum = thisPage.data.pullNum + 1;
      thisPage.setData({
        pullNum: pullNum
      })
      thisPage.groupList(pullNum);
    } else {
      app.showWarnMessage('没有更多数据了！');
    }
  },

  /** 
   * 用户点击右上角分享 
   */
  onShareAppMessage: function () {

  },
  //获取数据信息 
  groupList: function (pullNum) {
    var thisPage = this;

    var data = {};

    data.user_id = app.globalData.customerInfo.id;
    if (app.globalData.customerInfo.is_horizontal_alliances == 1) {
      data.type = 3;
    } else if (app.globalData.customerInfo.is_horizontal_alliances == 2) {
      data.type = 2;
    }

    wx.request({
      url: app.globalData.domainName + '/app/selectCashWithdrawalDetailsPage',  //接口地址 
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数 
        page: pullNum,
        pageSize: thisPage.data.pageSize,
        ispage: true,    //是否分页 
        param: data
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功 
        var returnData = res.data;

        if (returnData.code == 0) { //成功 
          var resDataList = returnData.result.data;

          if (resDataList.length > 0) {
            var isSearchNextPage = true;
            if (resDataList.length < thisPage.data.pageSize) {
              var isSearchNextPage = false;
            }
            if (pullNum > 1) {
              resDataList = thisPage.data.groupData.concat(resDataList);
            }
          }

          var isHaveData = true;
          if (pullNum == 1 && resDataList.length == 0) { //第一页无数据 
            isHaveData = false;
          }

          thisPage.setData({
            'groupData': returnData.result.data,   //总数据 
            'pullNum': returnData.result.page, //当前页 
            'total': returnData.result.total,   //总条数 
            isHaveData :isHaveData,
            'isSearchNextPage': isSearchNextPage   //是否允许下拉 
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
  getMoneyTry: function (e) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/againCashWithdrawal/' + e.currentTarget.dataset.id,  //接口地址 
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功 
        var returnData = res.data;

        if (returnData.code == 0) { //成功 
          app.showSuccessMessage('提现成功')
          setTimeout(function () {
            thisPage.groupList(1);
          }, 2000)

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

  }
})