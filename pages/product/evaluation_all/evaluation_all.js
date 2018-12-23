var app = getApp();   //获取应用实例

Page({
  data: {
    productId: null,    //产品Id
    level: 0,           //等级

    evaluationList: [], //评论列表
    countInfo: null,    //数量信息

    currentPage: 1,  //当前页码
    pageSize: 5,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页

    levelObj: {
      1: '差评',
      2: '中评',
      3: '好评'
    },

  },
  //页面加载
  onLoad: function (options) {
    this.setData({
      productId: options.productId
    });

    this.getEvaluationList(1);    //获取评论列表
    this.getEvaluationCount();    //获取不同评论数量
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getEvaluationList(1);    //获取评论列表
    this.getEvaluationCount();    //获取不同评论数量   
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getEvaluationList(searchPage);    
    }
  },

  //选择评价
  chooseMenu: function (e) {
    var dataSet = e.currentTarget.dataset;
    var level = dataSet.param;

    this.setData({
      level: level
    })

    this.getEvaluationList(1);
  },
  //获取评论列表
  getEvaluationList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectProductEvaluatePage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          productId: thisPage.data.productId,
          level: thisPage.data.level == 0 ? '' : thisPage.data.level
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
          for (var i = 0; i < dataList.length; i++) {
            var dataObj = dataList[i];
            dataObj.percent = (dataObj.pmgressbar * 100).toFixed(0);
          }

          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.evaluationList.concat(dataList);
          }

          thisPage.setData({
            evaluationList: dataList,
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
  //获取不同评论数量
  getEvaluationCount: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectProductEvaluareLevelNum',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId
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
          thisPage.setData({
            countInfo: returnData.result
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



  
 
 


 


})
