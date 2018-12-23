var app = getApp();   //获取应用实例

Page({
  data: {
    productList: [],      //收藏商品
    searchText: "",         //搜索条件

    currentPage: 1,  //当前页码
    pageSize: 6,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页

  },

  //页面加载
  onLoad: function () {
    this.getCollectedProductList(1);    //获取收藏商品
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getCollectedProductList(searchPage);    //获取收藏商品
    }
  },
  //设置搜索条件
  setSearchText: function (e) {
    var searchText = e.detail.value;
    this.setData({
      searchText: searchText
    })
  },
  //搜索产品
  searchProduct: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var searchType = dataSet.type;

    if (searchType == 2) {
      var searchText = e.detail.value;
      this.setData({
        searchText: searchText
      })
    }
    this.getCollectedProductList(1);    //获取收藏商品
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //获取收藏商品
  getCollectedProductList: function (searchPage) { 
    var thisPage = this;
 
    wx.request({
      url: app.globalData.domainName + '/app/searchcollectproduct',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          region_code: areaInfo.code,
          customer_id: customerInfo.id,
          search_text: thisPage.data.searchText
        }
      },
      method: 'POST',  
      dataType: 'json',
      header: {
          'content-type': 'application/json'  
      },
      success: function(res) {  //成功
        var returnData = res.data;
        // console.log('【接口返回数据】',returnData);

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
            isSearchNextPage: isSearchNextPage    //是否查询下一页
          })
        } else {  //失败
          console.log("接口异常！");
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
  //取消收藏当前产品
  cancelThisProduct: function (e) { 
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var productId = dataSet.param;

    wx.showModal({
      title: '取消收藏',
      content: '确定取消收藏当前产品？',
      success: function(res) {
        if (res.confirm) {
            wx.request({
              url: app.globalData.domainName + '/app/cancelcollectproduct',  //接口地址
              data: {           //请求参数
                customer_id: customerInfo.id,  
                product_id: productId,
                type: 1
              },
              method: 'POST',  
              dataType: 'json',
              header: {
                  'content-type': 'application/json'  
              },
              success: function(res) {  //成功
                var returnData = res.data;

                if(returnData.code==0){ //成功
                  thisPage.getCollectedProductList(1);    //获取收藏商品       
                }else{  //失败
                  app.showWarnMessage("取消收藏失败！");      
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
  //清空全部产品
  clearAllProduct: function () {
    var thisPage = this;
    
    wx.showModal({
      title: '取消收藏',
      content: '确定清空全部收藏产品？',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalData.domainName + '/app/canclecollectionsByCustomerId',  //接口地址
            data: {           //请求参数
              customer_id: customerInfo.id
            },
            method: 'POST',
            dataType: 'json',
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {  //成功
              var returnData = res.data;

              if (returnData.code == 0) { //成功
                thisPage.getCollectedProductList(1);    //获取收藏商品       
              } else {  //失败
                app.showWarnMessage("清空失败！");
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
      }
    })
  },



})
