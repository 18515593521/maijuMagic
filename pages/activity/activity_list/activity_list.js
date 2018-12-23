//获取应用实例
const app = getApp()
var url = app.globalData.domainName; //请求域名   
Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    activityList: null, //活动列表信息
    activityPage: null, //当前活动
    pullNum: 1, //当前页面的
    pageSize: 4, //一页的产品
    total: 0, //总条数
    isSearchNextPage: true, //是否查询
    isCommercial: false, //扫一扫显示与隐藏
    noActivity: true,
    activityType: null, //从哪里进来的  1 是从首页 2是从个人中心
    isType: 1, //是否是往期活动
    activeArr: ['active', ''], //菜单选中样式
    menuContentHiddenArr: ['', 'true'], //菜单对应内容显示、隐藏
    isOne: true, //正在进行的活动
    isTwo: true, //历史活动
    isAuthorizePhone: false, //获取电话号码
    activity_boxsss: ['', '', 'activity_box'],
    active:null   //颜色
  },

  //列表请求活动数据(个人中心)
  getListData: function(num) {
    var thisPage = this;
    var customerId = null;

    if (thisPage.data.activityType == '1') { //从首页进来的
      var homes = "selectActivityPage";
      var param = {
        shopId: app.globalData.shopInfo.sys_user_id,
        type: 2
      };
    } else if (thisPage.data.activityType == '2') { //个人中心
      var homes = "selectCustomerApplyActivityPage";
      var param = {
        customerId: app.globalData.customerInfo.id,
        type: thisPage.data.isType
      };
      // customerId = app.globalData.customerInfo.id;
    }
    wx.request({
      url: url + '/app/' + homes, //
      data: { //请求参数
        page: num,
        pageSize: thisPage.data.pageSize,
        ispage: true, //是否分页
        param: param
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      method: 'POST',
      success: function(res) {
        var resData = res.data;
        var resDataList = null;
        var isOne = true;
        var isTwo = true;
        if (resData.code == 0) {
          resDataList = resData.result.data;
          if (resDataList.length > 0) {
            var isSearchNextPage = true;
            if (resDataList.length < thisPage.data.pageSize) {
              var isSearchNextPage = false;
            }
            if (num > 1) {
              resDataList = thisPage.data.activityList.concat(resDataList);
            }
            if (thisPage.data.isType == '1') {
              isOne = false;
            } else {
              isTwo = false;
            }

            thisPage.setData({
              'activityList': resDataList, //总数据
              'pullNum': resData.result.page, //当前页
              'total': resData.result.total, //总条数
              'isSearchNextPage': isSearchNextPage, //是否允许下拉
              isOne: isOne,
              isTwo: isTwo

            })
            console.log(thisPage.data.activityList);
          } else if (resDataList.length <= 0 && resDataList.length == 0 && resData.result.page == 1) {
            if (thisPage.data.isType == '1') {
              isOne = true;
            } else {
              isTwo = true;
            }
            thisPage.setData({
              noActivity: false,
              isOne: isOne,
              isTwo: isTwo
            })
          }


        } else if (resData.code == 1) {

        }
      },
      fail: function(res) {
        console.log(res + '失败！');
      }
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //菜单选择
  chooseMenu: function(e) {
    var activeArr_copy = [];
    var menuContentHiddenArr_copy = [];
    var index = e.currentTarget.dataset.value;
    var thisPage = this;

    for (var i = 0; i < thisPage.data.activeArr.length; i++) {
      if (i == index) { //选中
        activeArr_copy.push('active');
        menuContentHiddenArr_copy.push('');
        thisPage.setData({
          isType: parseInt(i) + 1
        })
      } else {
        activeArr_copy.push('');
        menuContentHiddenArr_copy.push('true');
      }
    }

    thisPage.setData({
      activeArr: activeArr_copy,
      menuContentHiddenArr: menuContentHiddenArr_copy
    })
    thisPage.getListData(1);
  },
  //点击页面跳转
  skipUpTo: function(e) {
    var skipUpContent = e.currentTarget.dataset;
    var activity_id = skipUpContent.activity_id;
    var skipType = skipUpContent.type; //类型
    var activityType = skipUpContent.activitytype; //活动类型 1精彩活动  2图文活动
    var thisPage = this;

      if (activityType == '2') { //2图文活动
        var skipUrl = "/pages/activity/image_text_detail/image_text_detail?activity_id=" + activity_id + '&fromType=' + thisPage.data.activityType + '&isType=' + thisPage.data.isType; //路径
      } else { //精彩活动
        if (thisPage.data.activityType == '1') { //从首页进来的
          var skipUrl = "/pages/activity/activity_details/activity_details?activity_id=" + activity_id + '&activityType=' + activityType + '&fromType=' + thisPage.data.activityType + '&isType=' + thisPage.data.isType; //路径

        } else {
          var skipUrl = "/pages/person_center/my_activity/my_activity?activity_id=" + activity_id; //路径   
        }

      }
    app.pageSkip(skipUrl, skipType);
  },
  //下拉拉加载
  onReachBottom: function() {
    var thisPage = this;
    if (thisPage.data.isSearchNextPage) {
      var pullNum = thisPage.data.pullNum + 1;
      this.getListData(pullNum);
    } else {
      app.showWarnMessage('没有更多数据了！');
    }
  },
  //上拉刷新
  onPullDownRefresh: function() {
    // app.showWarnMessage("刷新中！");
    this.getListData(1);
    wx.stopPullDownRefresh(); //页面自己回去！！
  },
  onLoad: function(options) {
    var thisPage = this;
    if (options.activity == 2) {
      var mername = '我的活动';
    } else {
      var mername = '活动列表';
    }
    wx.setNavigationBarTitle({
      title: mername //页面标题为路由参数
    })
    thisPage.setData({
      activityType: options.activity,
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
      active: app.globalData.userInfoAll.appColor
    })
    // this.getListData(1);
  },

  /*生命周期函数--监听页面显示*/
  onShow: function() {
    this.getListData(1);
  },

  //页面分享
  onShareAppMessage: function() {
    var param = "P1=G&P4=" + app.globalData.customerInfo.id;

    return {
      title: '活动内容',
      path: "/pages/index/index?" + param,
      success: function(res) {
        app.addPageSharePoint("活动内容");
      }
    };

  },
  //授权手机号
  authorizePhone: function(e) {
    app.authorizePhone(e);
  },


})