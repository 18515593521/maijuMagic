//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    headImage: "about:blank",        //用户图像
    nickName: "",         //昵称

    isNeedPay: 2,             //是否需要支付（1：显示；2：关闭；）
    listData: [
      { name: '我的订单', class: 'my_order', check: '1', fixation: '2', url: '/pages/person_center/my_order/my_order', icon: '/images/menu/order.png' },
      { name: '我的活动', class: 'my_activity', check: '1', fixation: '2', url: '/pages/activity/activity_list/activity_list', icon: '/images/menu/activity.png' },
      { name: '我的拼团', class: 'group_list', check: '1', fixation: '2', url: '/pages/group/my_group/my_group', icon: '/images/menu/group.png' },
      { name: '爆款预定', class: 'booking_list', fixation: '2', url: '/pages/person_center/booking/booking_list/booking_list', icon: '/images/menu/hot.png' },
      { name: '我的卡券', class: 'my_card', check: '1', fixation: '2', url: '/pages/person_center/my_card/customer_card_list', icon: '/images/menu/coupons.png',  },
      { name: '我的推广', class: 'extension', check: '1', fixation: '1', url: '/pages/person_center/extension/extension', icon: '/images/menu/extension.png', status: '1' },
      { name: '专属顾问', class: 'adviser', check: '2', fixation: '1', url: '/pages/person_center/adviser/adviser', icon: '/images/menu/adviser.png', status: '1' },
      { name: '我的专属码', class: 'invite', fixation: '1', check: '1', url: '/pages/person_center/invite/invite', icon: '/images/menu/code.png', status: '1' },
      { name: '会员中心', class: 'member', fixation: '2', url: '/pages/member/member/member', icon: '/images/menu/member.png' },
      { name: '收货地址', class: 'address_list', fixation: '2', url: '/pages/person_center/address/address_list/address_list', icon: '/images/menu/address.png' },
      { name: '限购预订', class: 'address_list', fixation: '2', url: '/pages/person_center/booking/limit_buy_booking_list/limit_buy_booking_list', icon: '/images/menu/address.png' },
      { name: '返回首页', class: 'index', fixation: '1', url: '/pages/index/index', icon: '/images/menu/index.png', status: '1' }
    ],
   
  },

  //页面加载
  onLoad: function (options) {
    var avatarUrl = wx.getStorageSync('avatarUrl');
 
    var thisPage = this; 
    thisPage.getModeData();  //请求模块功能
  },
  /* 页面相关事件处理函数--监听用户下拉动作 */
  onPullDownRefresh: function () {
    this.getModeData();  //请求模块功能
    wx.stopPullDownRefresh();  //页面自己回去！！
  },

  //页面显示
  onShow: function () {
    var thisPage = this;
    var userInfo = app.globalData.userInfo;     //微信用户信息
    thisPage.getModeData();  //请求模块功能
    wx.getImageInfo({
      src: userInfo.avatarUrl,
      success: function (res) {
        thisPage.setData({
          headImage: res.path
        })
        console.log('头像' + thisPage.data.headImage);
      }, fail: function (res) {
        thisPage.setData({
          headImage: userInfo.avatarUrl
        })
      }
    });

    thisPage.setData({
      nickName: userInfo.nickName ? userInfo.nickName : '180911'
    });
    thisPage.isHavePayOrder();  //是否有需要支付的订单
  },

  //页面跳转
  pageSkip: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;
    var isCheck = dataSet.check;


    if (isCheck == 2 && !app.globalData.customerInfo.guiderId) {  //无专属导购
      thisPage.getAdviserInfo(skipUrl, skipType);    //获取顾问信息
      return;
    }

    if (skipUrl) {
      app.pageSkip(skipUrl, skipType);
    } else {
      app.showWarnMessage("暂未开通！");
      return;
    }
  },
  //请求功能模块
  getModeData: function (e) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectShopColumn1/' + app.globalData.shopInfo.sys_user_id,  //接口地址

      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
          
          if (returnData.result.userCommissionSet) {
            if (returnData.result.userCommissionSet.customer_commission_status == 1) {
              app.globalData.customer_commission_status = 1
            }
            if (returnData.result.userCommissionSet.horizontal_alliances_commission_status == 1) {
              app.globalData.horizontal_alliances_commission_status = 1
            }
          }

          for (var das = 0; das < returnData.result.shopColumn.length; das++) {
            if (returnData.result.shopColumn[das] == '/pages/person_center/center/commission_center/commission_center') {
              app.globalData.is_horizontal_alliances = true;
              if (returnData.result.userCommissionSet.customer_commission_status == 1 ||
                returnData.result.userCommissionSet.horizontal_alliances_commission_status == 1
              ) {
                app.pageSkip('/pages/person_center/center/commission_center/commission_center', 2)
              }


            }
          }
          
          
          var list1 = thisPage.data.listData;
          // var list2 = thisPage.data.listData2;
          var datas = returnData.result.shopColumn;



          for (var m = 0; m < datas.length; m++) {
            for (var j = 0; j < list1.length; j++) {
              if (list1[j].url == datas[m] && list1[j].fixation == '2') {

                list1[j].status = 1;  //显示 

              } else {
                if (datas[m] == '/pages/activity/activity_list/activity_list?activity=1') {
                  if (list1[j].url == '/pages/activity/activity_list/activity_list') {
                    list1[j].status = 1;  //显示 
                    list1[j].url = '/pages/activity/activity_list/activity_list?activity=2'
                  }
                }
                if (datas[m] == "/pages/group/group_list/group_list") {  //拼团
                  if (list1[j].url == '/pages/group/my_group/my_group') {
                    list1[j].status = 1;  //显示 
                  }
                }
                if (datas[m] == "/pages/product/hot_product_list/hot_product_list") {//爆款
                  if (list1[j].url == '/pages/person_center/booking/booking_list/booking_list') {
                    list1[j].status = 1;  //显示 
                  }
                }
                if (datas[m] == "/pages/card/card_list/card_list") {//卡券
                  if (list1[j].url == '/pages/person_center/my_card/customer_card_list') {
                    list1[j].status = 1;  //显示 
                  }
                }
                if (app.globalData.customerInfo.payState == 1 & (list1[j].url == '/pages/person_center/my_order/my_order')) {
                  list1[j].status = 1;  //显示 
                }
                if (list1[j].url == '/pages/member/member/member') {  //会员

                  if (app.globalData.customerInfo.vipInfo.vip_type) {
                    if (app.globalData.customerInfo.vipInfo.vip_type==1){
                      if (app.globalData.customerInfo.vipInfo.vip_level){
                        list1[j].status = 1;  //显示 
                      }else{
                        list1[j].status = 2;  //显示 
                      }
                    }else{
                      list1[j].status = 1;  //显示 
                    }
                  } else {
                    list1[j].status = 2;  //显示 
                  }
                }
              }
              //fixation 为 1 是 固定的  
              if (list1[j].fixation == '1') {
                list1[j].status = 1;  //显示 
              }

            }
          }
          // for (var m1 = 0; m1 < datas.length; m1++) {
          //   for (var j1 = 0; j1 < list2.length; j1++) {
          //     if (list2[j1].url == datas[m1]) {
          //       list2[j1].status = 1;  //显示 
          //     } 
          //   }
          // }
          thisPage.setData({
            listData: list1
          })
        } else {  //失败
          app.showWarnMessage(res.message);
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
  //获取顾问信息
  getAdviserInfo: function (skipUrl, skipType) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/exclusiveConsultant',  //接口地址
      data: {
        customer_id: app.globalData.customerInfo.id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
          app.globalData.customerInfo.guiderId = returnData.result.id;
          app.pageSkip(skipUrl, skipType);
        } else {  //失败
          app.showWarnMessage("您还没有导购");
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
  //是否有需要支付的订单
  isHavePayOrder: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/isShowRed/' + app.globalData.customerInfo.id,  //接口地址
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            isNeedPay: returnData.result.isShowRed
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

  //拨打客服
  callPhone2: function (e) {
    var thisPage = this;

    wx.makePhoneCall({
      phoneNumber: '18618287514'
    })
  },

  //请求模块
  getModels: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectShopColumn1/' + app.globalData.shopInfo.sys_user_id,
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var resturnData = res.data;
        if (resturnData.code == 0) {

          
        }
      }
    })
  },

})
