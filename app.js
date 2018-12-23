//app.js
App({
  globalData: {
    //小程序信息
    appInfo: {
      name: '魔方云智慧门店集客平台',
      appId: 'wx7e89ae5c19f93e80',
      appSecret: '06ed3e6aaccad180b7fa7fdb92920545',

      appKey: '',
      type: 106,
      version: '1.0.0',
    },
    //【域名】//
    // domainName: 'http://192.168.1.6:8080/shop-web',   //域名
     domainName: 'https://www.kaolaj.com/magicCloud',   //域名（线上）
   //  domainName: 'https://www.kaolaj.com/magic_cloud2.0_test',   //域名（测试）
    // domainName: 'https://www.kaolaj.com/magic_cloud2.0_shenhe',   //域名（测试）

    //【设备信息】
    deviceInfo: null,
    //【位置信息】
    positionInfo: null,     
    //【区域信息】
    areaInfo: {   
      code: "",       
      address: ""
    },  
    //【店铺信息】
    shopInfo: {},
    //【活动信息】
    activityInfo: {
      activity_id: null,
      imgurl: null,
      isApply: 2,   //报名状态(1:已报名，2:未报名)
    },
    choosedOrderAddress: null,   //选择的订单地址
    payOrderInfo: { //支付订单信息
      id: null,
    },
    skipParam:null,  // 手机号的携带信息
    currentActivityInfo:null,  //跳转时携带的值
    isAuthorizeInfo:null,//跳转个人中心
    //【微信用户信息】
    userInfo: {}, 
    //【微信用户手机信息】
    userPhoneInfo: {}, 
    //【消费者信息】
    customerInfo: {
      id: "",             //标识
      name: "",           //姓名
      phone: "",          //手机号
      guiderId: null,     //导购Id
      guiderShopId: null, //导购店铺Id
      factoryId: null,    //集团Id
      payState: 2,        //支付状态（1：开通；2未开通）
      accredit_status: 2,   //头像是否授权   1已经授权   2未授权
      vipInfo: {},    //vip 的信息   "vip_type":"商户会员类型    "vip_level":"会员等级"
      server:'',
      sellerInfo:null
    },
    //【邀请人信息】
    inviterInfo:{ 
      type: null,   //1：导购邀请，2：消费者邀请
      value: null   //1：导购Id，2：消费者Id
    },
  //用户登录以后的信息
    userInfoAll:null,
    lat:null,
    lng:null , 
    states: null,   //点击切换店铺的状态,
    is_horizontal_alliances : false //是否拥有佣金管理模块
  },
    show_near_shop:null,   //1 是显示  2是不显示
  //初始化
  onLaunch: function (options) {
    console.info("-----【小程序】初始化-----", options);

    this.getDeviceInfo();   //获取设备信息   
  },
  //显示
  onShow: function (options) {
    console.info("【小程序】显 示-----", options);
    if (this.globalData.states){
      this.globalData.states = '';;
    }
  },
  //隐藏
  onHide: function () {
    // console.info("【小程序】隐藏！");
  },
  //获取设备信息
  getDeviceInfo: function () {
    var thisApp = this;

    try {
      var res = wx.getSystemInfoSync();
      // console.info("【设备信息】", res);
      thisApp.globalData.deviceInfo = res;
    } catch (e) {
      console.info("【getDeviceInfo】：异常！");
    }
  },
  //页面跳转
  pageSkip: function (skipUrl, skipType) {
    var thisPage = this;
  
    if (thisPage.globalData.is_horizontal_alliances && skipUrl.indexOf('/person_center/center/center/center') != -1 && ((thisPage.globalData.customer_commission_status == 1 && thisPage.globalData.customerInfo.is_horizontal_alliances == 2) || (thisPage.globalData.horizontal_alliances_commission_status == 1 && thisPage.globalData.customerInfo.is_horizontal_alliances == 1))){
      skipUrl = '/pages/person_center/center/commission_center/commission_center' + skipUrl.substring(41)
    }
    if (skipType == 1) {  //保留当前页，跳转
      wx.navigateTo({
        url: skipUrl
      })
    } else if (skipType == 2) {  //重定向
      wx.redirectTo({
        url: skipUrl
      })
    } else if (skipType == 3) {  //tabBar页跳转
      wx.switchTab({
        url: skipUrl
      })
    } else if (skipType == 4) {  //关闭所有页面，跳转
      wx.reLaunch({
        url: skipUrl
      })
    }
  },
  //页面返回
  pageBack: function (backCount) {
    wx.navigateBack({
      delta: backCount
    })
  },
  //显示警告信息
  showWarnMessage: function (message) {
    if (message) {
      wx.showToast({
        title: message,
        icon: 'loading',
        image: "/images/warn.png",
        duration: 2000,
        mask: true
      })
    }
  },
  //显示成功信息
  showSuccessMessage: function (message) {
    if (message) {
      wx.showToast({
        title: message,
        icon: 'success',
        duration: 2000,
        mask: true
      })
    }
  },
  //用户登录
  customerLogin: function () {
    if (!this.globalData.customerInfo.id) {
      this.pageSkip("/pages/user_validate/user_validate",1);
    }
  },
  //增加页面分享积分
  addPageSharePoint: function (title) {
    var thisApp = this;
    return;

    wx.request({
      url: thisApp.globalData.domainName + '/app/addsharepoint',  //接口地址
      data: {           //请求参数
        customer_id: thisApp.globalData.customerInfo.id,
        title: title ? title : thisApp.globalData.appInfo.name
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          console.log("分享success");
        } else {  //失败
          console.log("分享fail");
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
  //微信登录
  weChatLogin: function (nums ,lat, lng) {
    var app = this;

    wx.login({  //微信登录
      success: function (result) {
        // console.log("【微信登录信息】：", result);
        if (result.code) {
          app.getCustomerInfo(result.code, nums, lat, lng);
        } else {
          console.log('获取用户登录态失败！' + result.errMsg);
        };
      }
    });
  },
  //获取用户信息
  getCustomerInfo: function (code, nums, lat, lng) {
    var app = this;

    var paramData = {   //获取订单列表数据 请求参数
      js_code: code,
      type: app.globalData.inviterInfo.type,
      value: app.globalData.inviterInfo.value,
      appid: app.globalData.appInfo.appId
    };
    wx.request({
      url: app.globalData.domainName + '/app/getWeiXinInfo',
      data: paramData,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        var returnData = res.data;
        console.info("【消费者信息】", returnData);

        if (returnData.code == 0) {
         
          app.globalData.customerInfo.id = returnData.result.user_id;
          app.globalData.customerInfo.name = returnData.result.name;
          app.globalData.userInfo.nickName = returnData.result.nick_name ? returnData.result.nick_name : returnData.result.name;
          app.globalData.userInfo.avatarUrl = returnData.result.head_url;
          app.globalData.customerInfo.phone = returnData.result.phone;
          app.globalData.customerInfo.guiderId = returnData.result.sellerId;
          app.globalData.customerInfo.sellerInfo = returnData.result.sellerInfo;
          app.globalData.customerInfo.guiderShopId = returnData.result.guiderShopId;
          app.globalData.customerInfo.factoryId = returnData.result.node3;
          app.globalData.customerInfo.payState = returnData.result.payStates;
          app.globalData.customerInfo.accredit_status = returnData.result.accredit_status;
          app.globalData.customerInfo.isNew = returnData.result.isNew;  //是不是新用户
          app.globalData.customerInfo.vipInfo = returnData.result.vipInfo;  //VIP信息
          app.globalData.customerInfo.is_horizontal_alliances = returnData.result.is_horizontal_alliances;  //是否是异业联盟
          app.globalData.customerInfo.server = returnData.result.vipInfo.customer_service_status;  //客服消息
          app.globalData.customerInfo.productModelType = returnData.result.productModelType;   //产品列表路径
            app.globalData.userInfoAll= returnData.result;    
            if (nums){
              app.getShopInfo(0, lat, lng);
            }
        } else {
          console.warn("【消费者信息】失败");
        }
      }
    });
  },
  //获取店铺信息
  getShopInfo: function (state, lat, lng ) {
    var app = this;

    wx.request({
      url: app.globalData.domainName + "/app/selectNearestShops",  //接口地址
      data: {
        customerId: app.globalData.customerInfo.id,
        lat:lat,
        lng: lng,
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var showShopInfo = null;
        console.info("【店铺信息 】", returnData);

        if (returnData.code == 0) {  //成功  默认进入就近店铺 
          app.globalData.shopInfo = returnData.result.shops[0];
          app.getPayStatus();   //请求支付关系
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.error('【获取店铺信息】请求失败：', res.errMsg);
      }
    })
  },
  //获取价格显示和支付开通状态   // 后边拼接的是店铺id
  getPayStatus: function (e) {
    var app = this;
    wx.request({
      url: app.globalData.domainName + "/app/selectShopPayStatus/" + app.globalData.shopInfo.sys_user_id,  //接口地址
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        console.info("【支付信息】", returnData);

        if (returnData.code == 0) {  //成功  默认进入就近店铺 
          app.globalData.payStatusInfo = returnData.result;  //isOpen 1显示  2不显示 pay_status 1开通支付  2未开通支付

        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.error('【获取店铺信息】请求失败：', res.errMsg);
      }
    })
  },
 //授权手机号
  authorizePhone: function (e) {
    var detail = e.detail;
    var dataSet = e.currentTarget.dataset;
    var app = this;
    // thisPage.setData({
    //   skipParam: dataSet
    // });
    this.globalData.skipParam = dataSet;
    console.log("【跳转类型】", dataSet);

    if (detail.errMsg == "getPhoneNumber:ok") {  //允许
      wx.login({
        success: function (result) {
          if (result.code) {
            app.getUserPhone(detail.encryptedData, detail.iv, result.code);
          } else {
            console.log('获取用户登录态失败！' + result.errMsg);
            app.showWarnMessage("获取手机号失败");
          };
        }
      });
    } else {  //拒绝
      console.error("【授权手机号失败】");
      app.pageSkip("/pages/user_validate/user_validate", 1);
    }
  },
  //获取用户手机号
  getUserPhone: function (encryptedData, iv, js_code) {
    var app =  this;
    wx.request({
      url: app.globalData.domainName + "/app/getPhoneNumber",  //接口地址
      data: {
        encryptedData: encryptedData,
        iv: iv,
        js_code: js_code,
        customerId: app.globalData.customerInfo.id,
        node3_id: app.globalData.customerInfo.factoryId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0 && returnData.result) { //成功
          app.globalData.userPhoneInfo = returnData.result;

          app.registerUser(returnData.result.purePhoneNumber);    //注册用户
        } else {  //失败
          app.showWarnMessage("获取手机号失败");
          console.log('【获取手机号失败】', returnData);
        }
      },
      fail: function (res) {     //失败
        console.error('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //注册用户
  registerUser: function (phone) {
    var app = this;
    var paramData = {
      phone: phone,
      customerId: app.globalData.customerInfo.id,
      shopId: app.globalData.shopInfo.sys_user_id,
      commissionStatus: app.globalData.is_horizontal_alliances?1:2
    };

    wx.request({
      url: app.globalData.domainName + '/app/registerPhone',  //接口地址
      data: paramData,          //请求参数
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.log("【注册信息】", returnData);

        if (returnData.code == 0) { //成功
          app.showSuccessMessage('成功！');
          app.globalData.customerInfo.id = returnData.result.customerId;
          app.globalData.customerInfo.guiderId = returnData.result.sellerId;
          app.globalData.customerInfo.phone = phone;

          var pages = getCurrentPages();
          var lengths = parseInt(getCurrentPages().length)-1;
          pages[lengths].setData({
            isAuthorizePhone:true
          })
          app.getIsMember();  //看看会员等级
          var inside = app.globalData.skipParam.inside;
          if (inside!=='inside'){
            app.skipNextPage();    //跳转下一个页面
          }
        
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
  //跳转下一个页面
  skipNextPage: function () {
    var app = this;
    var skipParam = app.globalData.skipParam;
    
    var skipType = skipParam.type;
    var skipParam = skipParam.param;
    console.log(skipParam +'skipParam----');
    switch (skipType) {
      case 'banner':
        if (app.globalData.currentActivityInfo.activity_id == skipParam) {
          app.pageSkip("/pages/activity/activity_details/activity_details", 1);
        }
        break;
      case 'menu':
        // if (skipParam == 1) {
        //   app.pageSkip("/pages/activity/activity_list/activity_list?activity=1", 1);
        // } else if (skipParam == 2) {
        //   app.pageSkip("/pages/product/product_list/product_list", 1);
        // } else if (skipParam == 3) {
        //   if (app.globalData.isAuthorizeInfo) {
        //     app.pageSkip("/pages/person_center/center/center/center", 1);
        //   }

        // }
        break;
      case 'cardList':
        app.pageSkip("/pages/card/card_list/card_list", 1);
        break;
      case 'card':
        app.pageSkip("/pages/card/card_details/card_details?cardId=" + skipParam, 1);
        break;
      case 'hotProduct':
        app.pageSkip("/pages/product/hot_product_list/hot_product_list?productId=" + skipParam, 1);
        break;
      case 'activity':
        app.pageSkip("/pages/activity/activity_details/activity_details?activity_id=" + skipParam, 1);
        break;
      case 'panorama':
        app.pageSkip("/pages/web/vr?webUrl=" + skipParam, 1);
        break;
      case 'recommendProduct':
        app.pageSkip("/pages/product/product_details/product_details?productId=" + skipParam, 1);
        break;
      case 'ProductList':
        app.pageSkip("/pages/product/product_list/product_list", 1);
        break;
      case 'group':
        app.pageSkip("/pages/group/group_info/product_details", 1);
        break;
      case 'groupList':
        app.pageSkip("/pages/group/group_list/group_list", 1);
        break;

      case 'newUserCard':
        var pages = getCurrentPages();
        var lengths = parseInt(getCurrentPages().length) - 1;
        pages[lengths].getCoupon(this.globalData.skipParam);
      default:
        console.log("【无跳转】");
    }
  }, 
  //新注册完以后要看是否是会员
  getIsMember:function(){
    var thisPage = this;
    if (thisPage.globalData.customerInfo.vipInfo.vip_type){
      thisPage.globalData.customerInfo.vipInfo.vip_level =1;
    }  
  }
})
