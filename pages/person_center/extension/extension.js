//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    isHaveData: true,   //是否有数据

    searchText: "",       //搜索字段
    peopleList: [],       //人员列表

    currentPage: 1,  //当前页码
    pageSize: 15,     //每页记录数
    total: 0,        //总记录数 
    isSearchNextPage: true,   //是否查询下一页
  
  },

  //页面加载
  onLoad: function (options) {

  },
  //页面显示
  onShow: function () {
    this.getPeopleList(1);
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getPeopleList(searchPage);    
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getPeopleList(1);
  },

  //设置搜索条件
  setSearchText: function (e) {
    var searchText = e.detail.value;
    this.setData({
      searchText: searchText
    })
  },
  //搜索人员
  searchPeople: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var searchType = dataSet.type;

    if (searchType == 1) {
      var searchText = e.detail.value;
      this.setData({
        searchText: searchText
      })
    }

    thisPage.getPeopleList(1);
  },
  //获取人员列表
  getPeopleList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectMyGeneralizePage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          customer_id: app.globalData.customerInfo.id,
          name: thisPage.data.searchText,
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

          for (var i = 0; i < dataList.length; i++){
            var dataObj = dataList[i];
            if (!dataObj.name){
              dataObj.name = '暂无';
            }
            if (!dataObj.phone) {
              dataObj.phone = '暂无';
            }else{
              dataObj.phone = dataObj.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
            }
          }

          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.peopleList.concat(dataList);
          }

          var isHaveData = true;
          if (searchPage == 1 && dataList.length == 0) { //第一页无数据
            isHaveData = false;
          }

          thisPage.setData({
            peopleList: dataList,
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

})