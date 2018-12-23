var app = getApp();   //获取应用实例

Page({
  data: {
    productList: [],        //收藏商品

  },

  //页面加载
  onLoad: function () {
    this.getProductHistory();    //获取产品足迹
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //获取产品足迹
  getProductHistory: function () { 
    var thisPage = this;
 
    wx.request({
      url: app.globalData.domainName + '/app/queryhistory',  //接口地址
      data: {           //请求参数
        customer_id: customerInfo.id,
        region_code: areaInfo.code
      },
      method: 'POST',  
      dataType: 'json',
      header: {
          'content-type': 'application/json'  
      },
      success: function(res) {  //成功
        var returnData = res.data;

        if(returnData.code==0){ //成功
          thisPage.setData({
            productList: returnData.result
          })
        }
      },
      fail: function(res) {     //失败
        console.log('请求失败：',res.errMsg);
      },
      complete: function(res) { //完成
        console.log('请求完成：',res.errMsg);
      }
    })
  },
  //清空所有历史记录
  clearAllHistory: function () { 
    var thisPage = this;

    wx.showModal({
      title: '清空足迹',
      content: '确定清空所有足迹？',
      success: function(res) {
        if (res.confirm) {
            wx.request({
              url: app.globalData.domainName + '/app/removeallhistory',  //接口地址
              data: {           //请求参数
                customer_id: customerInfo.id
              },
              method: 'POST',  
              dataType: 'json',
              header: {
                  'content-type': 'application/json'  
              },
              success: function(res) {  //成功
                var returnData = res.data;

                if(returnData.code==0){ //成功
                  thisPage.getProductHistory();    //获取产品足迹
                }
              },
              fail: function(res) {     //失败
                console.log('请求失败：',res.errMsg);
              },
              complete: function(res) { //完成
                console.log('请求完成：',res.errMsg);
              }
            })
        }
      }
    })
  },
  


})
