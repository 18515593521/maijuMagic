// pages/group/my_group/my_group.js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    menus: ['active', ''],
    menuHidden: ['', 'true'],
    menus2: ['actives', ''],
    menuHidden2: ['', 'true'],
    pullNum: 1,    //当前页面的
    pageSize: 15,    //一页的产品
    total: 0, //总条数
    isSearchNextPage: true,  //是否查询
    is_creator: 1,  // 创建的拼团1  参与的拼团2
    groupData: null,    //参与拼团的数据
    days: null,   //天数
    hours: null,   //小时
    minutes: null,  //分钟 
    seconds: null,  //秒
    shopInfo:null,  //店铺信息
    isCreator:1 ,  //是不是发起人  1 是  2不是
    difftenType:1,  //线上拼团
    active: null, //颜色
    listType:null  //那个拼团  0 是没有  1 是线上  2是线下
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    thisPage.groupList(1);
    if (options.listType) {
      var listType = options.listType;
    } else {
      var listType = 1;
    }
    thisPage.setData({
      shopInfo: app.globalData.shopInfo.imgurl,
      active: app.globalData.userInfoAll.appColor,
      listType: listType
    })
   // let currents = currentTarget.dataset.types = listType;
    thisPage.isDiffert(listType);  //选中
   
  },
  //获取消费者创建或者参见的拼团列表
  groupList: function (pullNum) {
    var thisPage = this;
    if (thisPage.data.difftenType=='1'){  //线上拼团
      var urls = 'selectCustomerJoinGroupBuyingPage';
    }else{
      var urls = 'selectCustomerOfflineGroupBuyingPage ';
    }
    wx.request({
      url: app.globalData.domainName + '/app/' + urls,  //接口地址
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数
        page: pullNum,
        pageSize: thisPage.data.pageSize,
        ispage: true,    //是否分页
        param: {
          is_creator: thisPage.data.is_creator,
          customerId: app.globalData.customerInfo.id
        }
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
          thisPage.setData({
            'groupData': returnData.result.data,   //总数据
            'pullNum': returnData.result.page, //当前页
            'total': returnData.result.total,   //总条数
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
  //切换状态
  selectState: function (e) {
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.types;
    var thisPage = this;
    var menus = [];
    var menuHidden = [];
    for (var m = 0; m < thisPage.data.menus.length; m++) {
      if (m == types) {
        menus.push('active');
        menuHidden.push("");
      } else {
        menus.push('');
        menuHidden.push("true");
      }
    }
    thisPage.setData({
      menuHidden: menuHidden,
      menus: menus,
      is_creator: parseInt(types) + 1,
      pullNum: 1,
      isCreator: parseInt(types)+1

    })
    thisPage.groupList(1);
  },
  //顶层切换按钮
  isDiffert:function(e){
    var thisPage = this;
    if (e.currentTarget){
      var dataSet = e.currentTarget.dataset;
      var types = dataSet.types;
    }else{
      
      var types = thisPage.data.listType;
    }
   
   
    var menus = [];
    var menuHidden = [];
    var otherType = parseInt(types)-1;
    for (var m = 0; m < thisPage.data.menus.length; m++) {
      if (m == otherType) {
        menus.push('actives');
        menuHidden.push("");
      } else {
        menus.push('');
        menuHidden.push("true");
      }
    }
    thisPage.setData({
      menuHidden2: menuHidden,
      menus2: menus,
      difftenType: types

    })
      thisPage.groupList(1);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.groupList(1);
  },
  //下拉拉加载
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
  //上拉刷新
  onPullDownRefresh: function () {
    var thisPage = this;
    app.showWarnMessage("刷新中！");
    thisPage.groupList(1);
    wx.stopPullDownRefresh();  //页面自己回去！！
  },
  //倒计时
  countDown: function (year1, month1, daty1, hour1, minutes1, secomds1, newTimer) {
    var thisPage = this;

    var year1 = newTimer.split(" ")[0].split('-')[0];
    var month1 = newTimer.split(" ")[0].split('-')[1];
    var daty1 = newTimer.split(" ")[0].split('-')[2];
    var hour1 = newTimer.split(" ")[1].split(':')[0];
    var minutes1 = newTimer.split(" ")[1].split(':')[1];
    var secomds1 = newTimer.split(" ")[1].split(':')[2];

    var leftTime = new Date(year1, month1, daty1, hour1, minutes1, secomds1) - new Date();  //时间差
    var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10);   //计算剩余天数
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10);  //计算剩余小时
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);  //计算剩余分钟
    var secomds = parseInt(leftTime / 1000 % 60, 10);  //剩余秒数
    days = $scope.checkTime(days);
    hours = $scope.checkTime(hours);
    minutes = $scope.checkTime(minutes);
    secomds = $scope.checkTime(secomds);

    if (!(days == '00' && hours == '00' && minutes == '00' && secomds == '00')) {
      $scope.countDown(year1, month1, daty1, hour1, minutes1, secomds1);
    }

    thisPage.setData({
      days: days,
      hours: hours,
      minutes: minutes,
      secomds: secomds
    })
  },
  //将0-9 前边加上0  
  checkTime: function (num) {
    if (num < 10) {
      num = '0' + num;
    }
    return num;
  },
 
  skinUpTo:function(e){
    var dataSet = e.currentTarget.dataset;
    var status = dataSet.status;
    var thisPage = this;
    var id = dataSet.id;
    var customer_info_id = dataSet.customer_info_id;
    var groupBuyingId = dataSet.groupbuyingid; 
    var productId = dataSet.productid;
    var payState = dataSet.paystate;
    var urls = '/pages/group/part_in_group/part_in_group?status=' + status + '&customer_info_id=' + customer_info_id + '&id=' + id + '&groupBuyingId=' + groupBuyingId + '&productId=' + productId + '&payState=' + payState + '&isCreator=' + thisPage.data.isCreator + '&types=' + thisPage.data.difftenType;
    app.pageSkip(urls,1);
  },
  //倒计时
  countDown: function (year1, month1, daty1, hour1, minutes1, secomds1, newTimer) {
    var thisPage = this;
    if (newTimer) {
      var year1 = parseInt(newTimer.split(" ")[0].split('/')[0]);
      var month1 = parseInt(newTimer.split(" ")[0].split('/')[1]);
      var daty1 = parseInt(newTimer.split(" ")[0].split('/')[2]);
      var hour1 = parseInt(newTimer.split(" ")[1].split(':')[0]);
      var minutes1 = parseInt(newTimer.split(" ")[1].split(':')[1]);
      var secomds1 = parseInt(newTimer.split(" ")[1].split(':')[2]);
    }


    var leftTime = new Date(year1 + '/' + month1 + '/' + daty1 + " " + hour1 + ":" + minutes1 + ':' + secomds1) - new Date();  //时间差

    var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10);   //计算剩余天数
    var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10);  //计算剩余小时
    var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);  //计算剩余分钟
    var secomds = parseInt(leftTime / 1000 % 60, 10);  //剩余秒数
    days = parseInt(thisPage.checkTime(days));
    hours = parseInt(thisPage.checkTime(hours));
    minutes = parseInt(thisPage.checkTime(minutes));
    secomds = parseInt(thisPage.checkTime(secomds));

    thisPage.setData({
      days: days,
      hours: hours,
      minutes: minutes,
      secomds: secomds
    })

    if (!(days == '00' && hours == '00' && minutes == '00' && secomds == '00')) {
      setTimeout(function () {
        thisPage.countDown(year1, month1, daty1, hour1, minutes1, secomds1);
      }, 1000)

    }

  },

  //将0-9 前边加上0  
  checkTime: function (num) {
    if (num < 10) {
      num = '0' + num;
    }
    return num;
  },
 
})