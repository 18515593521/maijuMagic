// pages/mediaPage/mediaPage.js\

// 视频资讯

var app = getApp();
var Common = require("../../../utils/common.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchMediaText: "",        //媒体资讯输入字
    isAuthorizePhone: false,    //是否授权手机号
    navlists: [],               //导航栏列表
    listWidth: '0',             //导航每个元素宽度
    flag: true,                 //弹出层的显隐
    searchList: [],             //系列本地字段
    flowList: [                 //产品列表
      {
        url: 'https://www.kaolaj.com/file/upload/mofangyun/Banner/153066737915540100banner1530667379143700.jpg?0.4333',
        title: '仿古SOHO石十六宫格花片',
        timer: '2018.05.14',
        heart_num: '1'
      },
    ],
    classId: 0,              //分类id
    currentPage: 1,           //当前页码
    pageSize: 6,              //每页记录数
    total: 0,                 //总记录数
    isSearchNextPage: true,   //是否查询下一页
    searchMediaText: "",          //媒体资讯输入字
    navFontColor: '#474747',       //导航栏标题颜色
    searchActive: [],         //系列被点击样式
    otherClass: [],           //备用样式
    navIndexs: '',            //当前条件index值
    navIndexs2: '',          //记录首级分类的选择和挂在
    sort: 0,
    typeId: null

  },
  //授权手机号
  // authorizePhone: function (e) {
  //   app.authorizePhone(e);
  // },
  //媒体关键字搜索
  searchMedia: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var searchType = dataSet.type;

    if (searchType == 2) {
      var searchMediaText = e.detail.value;
      this.setData({
        searchMediaText: searchMediaText
      })
    }
    thisPage.selectMediaByShopId(1);
  },

  // 媒体资讯（点击显示系列下拉列表）
  navshow: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var indexs = dataSet.navindexs - 1;
    var param = dataSet.param;              //获得当前被点击的
    var classId = param.id                  //分类id
    var searchList = param.list;            //当前被点击的导航栏对应的项
    var navlists = thisPage.data.navlists;
    var active = [];      //分类样式数组

    for (var i = 0; i < navlists.length; i++) {
      if (indexs == i) {
        active.push('active');
      } else {
        active.push('');
      }
    }
    // ???
    if (thisPage.data.navIndexs == indexs) {
      thisPage.setData({
        searchActive: thisPage.data.otherClass
      })

    } else {
      thisPage.setData({
        searchActive: []
      })

    }

    thisPage.setData({
      flag: false,
      searchList: searchList,
      classId: classId,
      active: active,
      navIndexs2: indexs

    })
  },
  navhide: function () {
    var thisPage = this;
    thisPage.setData({
      flag: true,

    })
  },
  //媒体资讯系列搜索
  searchSeries: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;

    var classId = thisPage.data.classId;    //分类id(音频或者视频的id)
    var navIndexs = thisPage.data.navIndexs2; //被点击的当前分类index值（视频：0，音频：1）
    var navlists = thisPage.data.navlists;  //导航栏（视频，音频）

    var indexs = dataSet.indexs;            //当前被点击的index值
    var typeId = dataSet.param.id;          //系列id(下拉列表里的筛选条件id)

    var searchActive = [];                  //系列的样式列表
    var searchList = thisPage.data.searchList;

    for (var i = 0; i < searchList.length; i++) {

      if (searchList[i].id == typeId) {
        searchActive.push('active');

      } else {
        searchActive.push('');
      }
    }
    thisPage.setData({
      searchActive: searchActive,
      otherClass: searchActive,
      navIndexs: navIndexs,
      typeId: typeId
    });


    thisPage.selectMediaByShopId(1, typeId, classId);
  },
  //设置媒体资讯搜索字段
  setMediaText: function (e) {
    var searchMediaText = e.detail.value;
    this.setData({
      searchMediaText: searchMediaText
    })
  },
  //不限事件（下拉筛选：点击不限，清空筛选条件）
  unlimitedEvent: function (e) {
    var thisPage = this;
    thisPage.setData({
      searchActive: [],         //系列被点击样式
      otherClass: [],           //备用样式
    })
    thisPage.selectMediaByShopId(1);
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    thisPage.selectMediaByShopId(1);
    thisPage.selectMediaClassByShopId();
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.selectMediaByShopId(1);  //下拉得到第一页媒体资讯
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var thisPage = this;
    var isSearchNextPage = thisPage.data.isSearchNextPage;

    if (isSearchNextPage) {
      var page = thisPage.data.currentPage + 1;
      thisPage.selectMediaByShopId(page);    //获取产品列表
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 媒体资讯内容
  selectMediaByShopId: function (page, typeId, classId, name) {
    var thisPage = this;    //备份this
    wx.request({
      url: app.globalData.domainName + '/app/selectMediaByShopId',  //接口地址
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数
        page: page,
        pageSize: 6,
        ispage: true,    //是否分页
        param: {
          shopId: app.globalData.shopInfo.sys_user_id,
          classId: classId,
          typeId: typeId,
          name: thisPage.data.searchMediaText,
        }
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {     //成功
        var returnData = res.data;
        var flowList = [];          //视频资讯列表
        if (returnData.code == 0) { //成功
          var flowList = returnData.result.data;            //得到资讯列表
          var isSearchNextPage = true;                      //是否查询下一页

          if (flowList.length < thisPage.data.pageSize) {    //如果list的长度小于每页页数，
            isSearchNextPage = false;                       //那么不加载下一页
          }
          if (page > 1) {   //非第一页
            flowList = thisPage.data.flowList.concat(flowList);    //拼接
          }
          thisPage.setData({
            flowList: flowList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage,    //是否查询下一页
            // wait: true
          });

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
  // 媒体资讯导航
  selectMediaClassByShopId: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectMediaClassByShopId/' + app.globalData.shopInfo.sys_user_id,  //接口地址
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var navlists = [];
        var listWidth;

        if (returnData.code == 0) { //成功
          var result = returnData.result;

          //根据获取的li的个数，确定宽度
          if (result.length >= 2 && result.length < 4) {
            listWidth = parseInt(750 / result.length) + 'rpx';
          } else if (result.length >= 4) {
            listWidth = parseInt(750 / 4) + 'rpx';
          }

          thisPage.setData({
            navlists: result,         //分类导航
            listWidth: listWidth,     //每个分类的宽度
          });

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
  //拨打客服
  callPhone2: function (e) {
    var thisPage = this;

    wx.makePhoneCall({
      phoneNumber: '18618287514'
    })
  },
})