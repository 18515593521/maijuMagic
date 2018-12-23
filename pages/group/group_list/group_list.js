// pages/group/group_list/group_list.js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupListData:[],   //拼团信息
    isAuthorizePhone:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    thisPage.getGroupList();   //获取拼团
  },
  //获取拼团
  getGroupList: function (e) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectGroupBuyingPage ',  //接口地址
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数
        page: 1,
        pageSize: 10,
        ispage: true,    //是否分页
        param: {
          shopId: app.globalData.shopInfo.sys_user_id,
          customerId: app.globalData.customerInfo.id
        }
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            groupListData: returnData.result.data,
            isAuthorizePhone: app.globalData.customerInfo.phone ? true : false
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false
    })
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
//跳转
  skinpTo:function(e){
    var current = e.currentTarget.dataset;
    var types = current.type;
    var id = current.id;
    var product_id = current.product_id;
    var isJoin = current.isjoin;
    var urls = '/pages/group/group_info/product_details?product_id=' + product_id + '&id=' + id +'&isJoin=' + isJoin;
    app.pageSkip(urls, types);
  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },

})