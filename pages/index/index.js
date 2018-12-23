// 引入腾讯地图SDK核心类
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var QQmapsdk;

//页面js
var app = getApp();   //获取应用实例
var Common = require("../../utils/common.js");
Page({
  data: {
    address: "北京市",   //地址
    locationCode: "",   //区域编码

    imgUrls: [],          //轮播图
    searchText: "",       //搜索字段
    shopCardList: [],     //店铺卡券
    hotProductList: [],   //爆款产品列表
    limitBuyProductList: [],   //限时抢购产品列表
    groupListData: [],  //拼团
    H5Info: null,         //H5信息
    productList: [],      //产品列表
    setInfo: null,        //设置信息
    city: '北京市',  //城市
    appModel: null,         //模型
    appColor: null,      //北京颜色
    cartProductCount: 0,      //购物车产品数量
    isNeedPay: 2,             //是否需要支付（1：显示；2：关闭；）
    isCanBuy: null,     //爆款状态
    currentActivityInfo: null,    //正在进行的活动
    showShopInfo: null,  //当前的店铺
    serverInfo: null,           //展示的店铺信息（服务商户）
    nearInfo: null,           //展示的店铺信息（就近）
    shopShowHide: ['', ''],     //附近店铺的显示与隐藏
    serverShowHide: false,     //服务商户的显示与隐藏
    shopBoxShowHide: false,   //整个附近店铺
    storeShowHide: false,      //整块店铺的显示与隐藏
    allShop: false, //所有的商户
    show_near_shop: null,   //1
    wifiInfo: {   //无线信息
      SSID: null,
      password: null
    },
    isNew: true,  //是不是新用户
    isHasSeller:false,
    isWifiConnected: false,   //wifi是否连接上

    paramObj: null,    //二维码跳转参数

    enableDebug: false,   //调试工具状态
    sellerInfo:null,
    isAuthorizePhone: false,    //是否授权手机号
    isAuthorizeInfo: false,  //是否授权个人信息
    accredit_status: null,  //授权头像的信息
    skipParam: null,            //跳转参数
    isShare: null,   //是从哪里来的
    menuList: [
      { name: '精彩活动', icon: '/images/menu/1.png', url: '/pages/activity/activity_list/activity_list?activity=1' },
      { name: '产品中心', icon: '/images/menu/2.png', url: '/pages/product/product_list/product_list' },
      { name: '个人中心', icon: '/images/menu/3.png', url: '/pages/person_center/center/center/center' }
    ],
    menuList2: [
      { name: '首页', icon: '/images/menu/index.png', },
      { name: '精彩活动', icon: '/images/menu/1.png', url: '/pages/activity/activity_list/activity_list?activity=1' },
      { name: '产品中心', icon: '/images/menu/2.png', url: '/pages/product/product_list/product_list' },
      { name: '个人中心', icon: '/images/menu/3.png', url: '/pages/person_center/center/center/center' }
    ],
    menuList3: [
      { name: '首页', icon: '/images/menu/index.png' },
      { name: '产品中心', icon: '/images/menu/2.png', url: '/pages/product/product_list/product_list' },
      { name: '购物车', icon: '/images/menu/shopping1.png', url: '/pages/shopping_cart/shopping_cart' },
      { name: '个人中心', icon: '/images/menu/personal1.png', url: '/pages/person_center/center/center/center' }
    ],
    cardType: {
      1: {  //优惠券
        name: '优惠券',
        fontColor: 'color_green',
        backGroundColor: 'bg_green',
        backGroundImage: 'bg_green.png'
      },
      2: {  //红包
        name: '红包',
        fontColor: 'color_red',
        backGroundColor: 'bg_red',
        backGroundImage: 'bg_red.png'
      },
      3: {  //折扣券
        name: '折扣券',
        fontColor: 'color_blue',
        backGroundColor: 'bg_blue',
        backGroundImage: 'bg_blue.png'
      }
    },
    wait: false,  //等待菊花
    hot_price: false,   //受否是爆款产品
    payStatusInfo: null,  //支付
    payState: null,  //顶级支付状态

    imgLists: [],   //图片列表
    Height: "0",     //图片高度
    Height2: 0,  //轮播图片的高度
    currentIndex: 0,
    pageSize: 4,
    num: 1,
    total: 0, //总条数
    
    
    isSearchNextPage: true,  //是否查询
    newUserInfos: null,   //新用户的卡券信息
    newInfoShow: [], //红包的显示和隐层
    justOne: true,
    otherProducts: null,  //跳转的是那个产品列表
    iconData: null  //获取的icon的数值
  },

  //页面加载
  onLoad: function (options) {

    console.warn("[首页options参数]", options);
    console.log(JSON.stringify(options) + '就是看看看有没有P4');
    if (options.scene || options.P1) {  //options.scene || options.P1
      var paramObj = {};

      if (options.scene) {  //二维码
        var sceneStr = decodeURIComponent(options.scene);
        console.warn("【二维码参数】", sceneStr);
        paramObj = Common.getUrlParam(sceneStr);
      }
      if (options.P1) {  //助手端转发、分享
        paramObj = options;
      }
      this.setData({
        paramObj: paramObj
      });
      if (paramObj.P3) { //导购邀请
        app.globalData.inviterInfo.type = 1;
        app.globalData.inviterInfo.value = paramObj.P3;
      } else if (paramObj.P4) { //消费者邀请
        app.globalData.inviterInfo.type = 2;
        app.globalData.inviterInfo.value = paramObj.P4;
      }


      //wifi连接
      if (paramObj.P1 == "K") {
        this.initWifiModule();  //初始化wifi模块
      }
    }
    console.log('页面加载！！');
    if (options.isShare){
      this.setData({
        isShare: options.isShare
      })
    }
    
    this.getVisitDomainUrl();   //获取访问域名路径
  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    if (app.globalData.customerInfo.phone) {
      thisPage.setData({
        isAuthorizePhone: true
      })
    }
    
    if (thisPage.data.accredit_status == '1') {
      thisPage.setData({
        isAuthorizeInfo: true
      })
    } else {
      thisPage.setData({
        isAuthorizeInfo: false
      })
    }
    if (app.globalData.payOrderInfo.id) {  //支付订单跳转
      var payOrderId = app.globalData.payOrderInfo.id;
      app.globalData.payOrderInfo = {};
      app.pageSkip("/pages/person_center/order_details/order_details?orderId=" + payOrderId, 1);
    }

    if (app.globalData.shopInfo.sys_user_id) {
      thisPage.getShopCardList();     //获取店铺卡券列表
      thisPage.getShoppingCartProductList();    //获取购物车产品列表
      //   thisPage.getShopIndexInfo();    //获取店铺首页信息
    }
    console.log('【app.globalData.states】' + app.globalData.states + '&&' + app.globalData.customerInfo.id);
    if (!app.globalData.states && app.globalData.customerInfo.id) {
      thisPage.getShopInfo(0);
    }

  },
  //监听页面初次渲染完成
  onReady: function () {
    console.log('初次渲染完成！！');
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  //页面隐藏
  onHide: function () {
    this.setData({
      searchText: "",
      paramObj: null
    })

  },
  //下拉刷新
  onPullDownRefresh: function () {
    var thisPage = this;
    thisPage.setData({
      justOne: false
    })
    thisPage.getCurrentCity();      //获取当前城市

    // if (thisPage.data.isSearchNextPage){
    //   var mums = thisPage.data.num+1;
    //   thisPage.getCurrentActivityDetails(mums);
    // } else {
    //   app.showWarnMessage('没有更多活动数据了！');
    // }
  },
  //页面分享
  onShareAppMessage: function (options) {
    console.info("【首页】转发信息", options);

    var thisPage = this;
    var param = "P1=A&P4=" + app.globalData.customerInfo.id;
    return {
      title: app.globalData.appInfo.name,
      path: "/pages/index/index?" + param,
      success: function (res) {
        console.info("【首页】转发信息success", JSON.stringify(res));
        if (res.shareTickets) {
          thisPage.getGroupShareInfo(res.shareTickets[0]);
        }


        app.addPageSharePoint(app.globalData.appInfo.name);
      }
    };
  },
  //获取群分享的信息
  getGroupShareInfo: function (shareTicket) {
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {
        console.info("【群】信息success", res);
      },
      fail: function (res) {
        console.info("【群】信息fail", res);
      },
      complete: function (res) {
        console.info("【群】信息complete", res);
      },
    })
  },
  //切换调试工具
  toggleDebugTool: function () {
    var thisPage = this;
    console.log("调试工具状态：", thisPage.data.enableDebug);

    this.setData({
      enableDebug: !thisPage.data.enableDebug
    })

    wx.setEnableDebug({
      enableDebug: thisPage.data.enableDebug
    })
  },

  // 轮播图图片高度自适应
  imageHeight: function (e) {
    var that = this;
    var winWidth = wx.getSystemInfoSync().windowWidth;  //获取当前屏幕宽度 
    var heights = e.detail.height;    //e.detail可以获取图片的高度，宽度
    var widths = e.detail.width;      //图片的宽度
    var swiperImages = winWidth * heights / widths + "px";
    var swiperImages2 = (winWidth * heights / widths) * 2;


    // setTimeout(function () {

    for (var m = 0; m < that.data.imgUrls.length; m++) {
      that.data.imgUrls[m].imgHeighs = swiperImages2;
      if (that.data.imgUrls[0].imgurl.split(':')[0] == 'http') {
        that.data.imgUrls[m].imgurl = that.data.imgUrls[m].imgurl.replace("http", "https");;
      }
      that.setData({
        Height: swiperImages,
        Height2: swiperImages2,
        imgUrls: that.data.imgUrls
      });
    }
    // }, 100)



  },

  //获取当前城市
  getCurrentCity: function () {
    var thisPage = this;
    var location1 = wx.getStorageSync('location');
    var address1 = wx.getStorageSync('address');
    var regionCode1 = wx.getStorageSync('regionCode');

    if (!(location1 && address1 && regionCode1)) {
      QQmapsdk = new QQMapWX({    // 实例化API核心类
        key: 'G75BZ-Q7RRF-HHHJ2-JGF5S-3XNU3-73BUZ'  //秘钥
      });
      QQmapsdk.reverseGeocoder({
        success: function (res) {
          var regionCode = res.result.ad_info.adcode;
          var address = res.result.address;
          thisPage.setData({
            address: address,
            locationCode: regionCode,
            city: res.result.ad_info.city
          })
          app.globalData.areaInfo.code = regionCode;
          app.globalData.areaInfo.address = address;
          app.globalData.positionInfo = res.result.location;

          // thisPage.weChatLogin();   //微信登录
          app.weChatLogin();  //微信登录
          thisPage.otherRequest();  //微信登陆前奏
        },
        fail: function (res) {
          console.log("【位置信息】fail", res);
          app.pageSkip("/pages/authorize_fail/authorize_fail?failType=1", 2);
        }
      });
    } else {
      app.globalData.areaInfo.code = regionCode1;
      app.globalData.areaInfo.address = address1;
      app.globalData.positionInfo = location1;
      app.weChatLogin();  //微信登录
      thisPage.otherRequest();
    }

  },
  //别的请求
  otherRequest: function (res) {
    var thisPage = this;
    if (app.globalData.userInfoAll) {
      thisPage.setData({
        H5Info: app.globalData.userInfoAll.H5Info,
        setInfo: app.globalData.userInfoAll.userContent,
        appModel: app.globalData.userInfoAll.appModel ? app.globalData.userInfoAll.appModel : 1,
        appColor: app.globalData.userInfoAll.appColor ? app.globalData.userInfoAll.appColor : '#4abcc2',
        wait: true,
        show_near_shop: app.globalData.userInfoAll.show_near_shop,    //
        isNew: app.globalData.customerInfo.isNew == 1 ? true : false,
        server: app.globalData.customerInfo.server
      })
      console.log('【app.globalData.states】' + app.globalData.states);
      if (app.globalData.states) {
        console.log('【别的请求的数据的数据】' + app.globalData.states);
        thisPage.getShopInfo(app.globalData.states);     //获取店铺信息
      } else {
        console.log('【别的请求的数据的数据00000】');
        thisPage.getShopInfo(0);     //获取店铺信息
      }

      thisPage.isHavePayOrder();  //是否有需要支付的订单

    } else {
      setTimeout(function () {
        thisPage.otherRequest();
      }), 1500
    }

  },

  //跳转到获取店铺信息
  getToShop: function (e) {
    var current = e.currentTarget.dataset;
    var indexs = current.indexs;
    var title = current.title;  //店铺名字
    var thisPage = this;
    wx.showModal({
      title: '微信提示',
      content: '是否切换至' + title + '店铺',
      cancelText: '放弃切换',
      confirmText: '立即切换',
      success: function (res) {
        if (res.confirm) {
          thisPage.getShopInfo(indexs);
          app.showSuccessMessage('切换成功！');
        } else if (res.cancel) {

          app.showWarnMessage('已经取消！');
        }
      }
    })

  },
  //获取店铺信息
  getShopInfo: function (state) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + "/app/selectNearestShops",  //接口地址
      data: {
        customerId: app.globalData.customerInfo.id,
        lat: app.globalData.positionInfo.lat,
        lng: app.globalData.positionInfo.lng,
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
          var server = false;   //服务商户的显示与隐藏
          var resturnDatas = [];   //附近商户的显示与隐藏
          var storeBox = false;   //整块显示与隐藏
          var shopBox = false;  //整块店铺的显示

          if (returnData.result.shops.length > 1) {  //有附近店铺 也有服务商户

            if (state == 'server') {

              app.globalData.shopInfo = returnData.result.serverShop;
              showShopInfo = returnData.result.serverShop;

              server = true;
              var dataLength = null;

              for (var m = 0; m < returnData.result.shops.length; m++) {
                if (m > 2) {
                  resturnDatas.push(true);
                } else {
                  resturnDatas.push(false);
                }

              }

            } else {

              showShopInfo = returnData.result.shops[state];
              app.globalData.shopInfo = returnData.result.shops[state];

              //判断进入的第几个            
              for (var m = 0; m < returnData.result.shops.length; m++) {
                if (m == parseInt(state)) {
                  resturnDatas.push(true);
                } else {
                  if (m >= 4) {
                    resturnDatas.push(true);
                  } else {
                    resturnDatas.push(false);
                  }

                }
              }
              //如果没有服务商户
              if (!returnData.result.serverShop) {
                server = true;
              }

            }

          } else {
            var server = false;   //服务商户的显示与隐藏
            var resturnDatas = [];   //附近商户的显示与隐藏

            if ((state == 'server')) {

              app.globalData.shopInfo = returnData.result.serverShop;
              showShopInfo = returnData.result.serverShop;
              server = true;   //服务商户的显示与隐藏
              resturnDatas = [false];  //附近店铺的显示隐藏

            } else {
              showShopInfo = returnData.result.shops[state];
              app.globalData.shopInfo = returnData.result.shops[state];

              if (!returnData.result.serverShop) {  //说明当前店铺就是服务店铺
                storeBox = true;  //整个模板隐藏
              } else {
                shopBox = true;
              }
            }
          }
          app.globalData.states = state;  //切换店铺后要赋值

          thisPage.setData({
            serverShowHide: server,
            shopShowHide: resturnDatas,
            nearInfo: returnData.result.shops,
            serverInfo: returnData.result.serverShop,
            storeShowHide: storeBox,
            shopBoxShowHide: shopBox,
            showShopInfo: showShopInfo,
            isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
            isAuthorizeInfo: app.globalData.customerInfo.accredit_status == '1' ? true : false,
            accredit_status: app.globalData.customerInfo.accredit_status,
          })
          // app.globalData.isAuthorizeInfo = app.globalData.customerInfo.accredit_status == '1' ? true : false;
          thisPage.lookNewUserCardList();  //请求是否是新用户
          app.getPayStatus();   //请求支付关系
          thisPage.getBannerData();  //请求iocn图
          thisPage.getShopIndexInfo();    //获取店铺首页信息
          thisPage.getShopCardList();     //获取店铺卡券列表
          thisPage.getHotProductList();   //获取爆款产品列表
          thisPage.getLimitBuyProductList();   //获取爆款产品列表
          thisPage.getCurrentActivityDetails(1);   //获取当前活动详情
          thisPage.getShoppingCartProductList();    //获取购物车产品列表
          thisPage.getGroupList();   //获取拼团的数据
          thisPage.getModels();  //请求后台添加的模块
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.error('【获取店铺信息】请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        if (app.globalData.customerInfo.sellerInfo) {
          var sellerInfo = app.globalData.customerInfo.sellerInfo;
          if (!sellerInfo.weixinhao){
            sellerInfo.weixinhao = '暂无'
          }
          if (!sellerInfo.sellerPhone) {
            sellerInfo.sellerPhone = '暂无'
          }
          if (!sellerInfo.sellerName) {
            sellerInfo.sellerName = '暂无'
          }
          thisPage.setData({
            sellerInfo: sellerInfo,
            isHasSeller: true
          })
        }
        if (thisPage.data.paramObj) {
          var paramObj = thisPage.data.paramObj;

          var param_type = paramObj.P1;       //类型
          var param_id = paramObj.P2;         //参数值
          var param_guiderId = paramObj.P3;   //导购Id
          var param_inviterId = paramObj.P4;  //邀请人Id
          //活动 
          var param_activityId = paramObj.activity_id; //活动id
          var fromType = paramObj.fromType; //活动来源 2 首页
          var activityType = paramObj.activityType; //活动类型 图文
          //产品列表
          var param_seriesIdList = paramObj.seriesIdList;
          var param_searchText = paramObj.searchText;
          //产品详情   
          var param_productId = paramObj.productId;
          //拼团
          var groupBuyingId = paramObj.groupBuyingId;
          var productId = paramObj.productId;
          var custoneId = paramObj.customerGroupBuyingId;
          var types = paramObj.types;  //拼团类型
          //卡券
          var cardId = paramObj.cardId;
          //限时抢购
          var limitId = paramObj.limitId;
          var imit_buy_time = paramObj.imit_buy_time;
          // //新闻详情   
          // var param_newsId = paramObj.newsId;
          // //活动详情、活动报名
          // var param_activityId = paramObj.activityId;
          // var param_activityTitle = paramObj.activityTitle;
          // //0:招商加盟，1:预约设计
          // var param_pageType = paramObj.pageType;
          //媒体咨询
          var media_url = paramObj.media_url;
          var img_url = paramObj.img_url;
          var namem = paramObj.name;
          var idm = paramObj.id;
          var timem = paramObj.time;
          var lookm = paramObj.look;
          var otherTypem = paramObj.otherType;

          switch (param_type) {
            case 'A':
              break;
            case 'B':
              app.pageSkip("/pages/product/product_list/product_list?seriesIdList=" + param_seriesIdList + "&searchText=" + param_searchText, 1);
              break;
            case 'C':
              app.pageSkip("/pages/product/product_details/product_details?productId=" + (param_id ? param_id : param_productId), 1);
              break;

            case 'G':
              app.pageSkip("/pages/activity/activity_details/activity_details?activity_id=" + param_activityId + '&fromType=' + fromType + '&activityType=' + activityType, 1);
              break;
            case 'GG':
              app.pageSkip("/pages/activity/image_text_detail/image_text_detail?activity_id=" + param_activityId + '&fromType=' + fromType + '&activityType=' + activityType, 1);
            // case 'profile':
            //   app.pageSkip("/pages/brand_profile/profile/profile", 1);
            //   break;
            // case 'join_apply':
            //   app.pageSkip("/pages/join/join_apply/join_apply?pageType=" + (param_id ? param_id : param_pageType), 1);
            //   break;
            // case 'problem_clause':
            //   app.pageSkip("/pages/join/problem_clause/problem_clause", 1);
            //   break;
            case 'H':   //导购邀请
              break;
            case 'I':   //消费者邀请
              break;
            case 'J':   //全景图
              app.pageSkip("/pages/web/vr?webUrl=" + thisPage.data.H5Info.h5_url, 1);

              break;
            case 'K':   //wifi连接
              if (!thisPage.data.isWifiConnected) {
                thisPage.setData({
                  'wifiInfo.SSID': paramObj.P5,
                  'wifiInfo.password': paramObj.P6
                })

                thisPage.beginToConnectWifi();  //开始连接wifi
              }
              break;
            case 'L':
              app.pageSkip("/pages/group/part_in_group/part_in_group?groupBuyingId=" + groupBuyingId + '&productId=' + productId + '&id=' + custoneId + '&status=0' + '&types=' + types, 1);
              break;
            case 'groupDetail':
              app.pageSkip("/pages/group/group_info/product_details?id=" + paramObj.id + '&product_id=' + paramObj.product_id + '&isJoin=' + 2, 1);
              break;
            case 'card':
              app.pageSkip("/pages/card/card_details/card_details?cardId=" + cardId, 1);
              break;
            case 'limit':
              app.pageSkip("/pages/limitbuy/product_details/product_details?productId=" + productId + '&limitId=' + limitId + '&imit_buy_time=' + imit_buy_time, 1);
              break;
            case 'En':  //企业介绍
              app.pageSkip("/pages/enterprise/enterprise", 1);
              break;
            case 'Media':  //媒体资讯
              app.pageSkip("/pages/media/videoDetail/videoDetail" + "?media_url=" + media_url + "&img_url=" + img_url + "&name=" + namem + "&id=" + idm + "&create_time=" + timem + "&look=" + lookm + "&type=" + otherTypem, 1);
              break;
            default:
              console.log("【转发、分享跳转到首页】");
          }
        }
      }
    })
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
    var skipUrl = '/pages/product/product_list/product_list?searchText=' + thisPage.data.searchText;

    app.pageSkip(skipUrl, 1);
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    if (this.data.otherProducts == 1 && !dataSet.url) {
      var skipUrl = '/pages/product/otherproduct_list/product_list';
    } else {
      var skipUrl = dataSet.url;
    }



    var skipType = dataSet.type;
    if (skipUrl) {

      if (skipUrl == '/pages/person_center/center/center/center'){
        if (app.globalData.is_horizontal_alliances && ((app.globalData.customer_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 2) || (app.globalData.horizontal_alliances_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 1))) {
          app.pageSkip("/pages/person_center/center/commission_center/commission_center", 1);
        } else {
          app.pageSkip("/pages/person_center/center/center/center", 1);
        }
      }else{
        app.pageSkip(skipUrl, skipType);
      }
       
    }

  },
  //产品中心查看更多跳转
  productSkip:function(e){
    var dataSet = e.currentTarget.dataset;
    if (app.globalData.customerInfo.productModelType==2){
      var skipUrl = '/pages/product/otherproduct_list/product_list';  //新的产品列表
    }else{
      var skipUrl = '/pages/product/product_list/product_list';  //旧的产品劣列表
    }
    app.pageSkip(skipUrl, 1);
  },
  //产品详情
  pageSkipdetail: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var hotProductVersion = dataSet.hotProductVersion;
    var productid = dataSet.productid;
    if (app.globalData.customerInfo.productModelType == 2) {
      var skipUrl = "/pages/product/other_product_detail/other_product_detail?productId=" + productid + "&hotProductVersion=" + hotProductVersion;  //新的产品列表
    } else {
      var skipUrl = "/pages/product/product_details/product_details?productId=" + productid + "&hotProductVersion=" + hotProductVersion;  //旧的产品劣列表
    }
    app.pageSkip(skipUrl, 1);
  },
  //首页轮播的跳转
  bannerSkip:function(e){
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.urls; //跳转路径  图文活动是3 普通活动是2 1 是banner
    var skipType = dataSet.types;
    var activityId = dataSet.activityid;  //活动id
    if (skipType == 1) {   //1是banner
      if (skipUrl) {
        app.pageSkip(skipUrl, 1);
      }
    } else if (skipType == 2) { //精彩活动是2
      if (activityId){
        skipUrl = "/pages/activity/activity_details/activity_details?activity_id=" + activityId + '&activityType=1&fromType= 1&isType=1&activityType=1'; //路径
        app.pageSkip(skipUrl, 1);
      }
    } else if (skipType == 3){ //图文活动是3 
      if (activityId) {
        skipUrl = "/pages/activity/image_text_detail/image_text_detail?activity_id=" + id + '&fromType=1&isType=1&activityType=2'; //路径; //路径
        app.pageSkip(skipUrl, 1);
      }
    }
   
  },

  //首页活动跳转
  activitySkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = null; ///
    var skipType = dataSet.type;
    var id = dataSet.activity_id;
    var activityType = dataSet.activitytype;
    if (activityType !== 1) {
      if (activityType == 1) {  //精彩活动
        skipUrl = "/pages/activity/activity_details/activity_details?activity_id=" + id + '&activityType=1&fromType= 1&isType=1'; //路径

        var activityType2 = 1;
      } else if (activityType == 2) {   //图文活动
        skipUrl = "/pages/activity/image_text_detail/image_text_detail?activity_id=" + id + '&fromType=1&isType=1'; //路径

        var activityType2 = 2;
      }
      skipUrl = skipUrl + '&activityType=' + activityType2;
      app.pageSkip(skipUrl, skipType);
    }


  },
  //获icon 的图标
  getBannerData: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectUserXcxIconByNode3/' + app.globalData.customerInfo.factoryId,  //接口地址  2467
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var iconData = [];
          if (returnData.result.column1_image) {
            var object1 = {};
            object1.image = returnData.result.column1_image;
            object1.name = returnData.result.column1_name;
            object1.url = returnData.result.column1_address ? returnData.result.column1_address : "";
            iconData.push(object1);
          }
          if (returnData.result.column2_image) {
            var object2 = {};
            object2.image = returnData.result.column2_image;
            object2.name = returnData.result.column2_name;
            object2.url = returnData.result.column2_address ? returnData.result.column2_address : "";
            iconData.push(object2);
          }
          if (returnData.result.column3_image) {
            var object3 = {};
            object3.image = returnData.result.column3_image;
            object3.name = returnData.result.column3_name;
            object3.url = returnData.result.column3_address ? returnData.result.column3_address : "";
            iconData.push(object3);
          }
          if (returnData.result.column4_image) {
            var object4 = {};
            object4.image = returnData.result.column4_image;
            object4.name = returnData.result.column4_name;
            object4.url = returnData.result.column4_address ? returnData.result.column4_address : "";
            iconData.push(object4);
          }
          thisPage.setData({
            iconData: iconData
          })



        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
        console.log('【icon信息】请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('【icon信息】请求完成：', res.errMsg);
        wx.stopPullDownRefresh();
      }
    })
  },
 
  //获取店铺首页信息
  getShopIndexInfo: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectAppBannerAndProduct/' + app.globalData.shopInfo.sys_user_id + '/' + app.globalData.customerInfo.id + '/' + app.globalData.customerInfo.factoryId,  //接口地址  2467
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("【轮播图、推荐产品】", returnData);

        if (returnData.code == 0) { //成功
          var payStatusInfo = app.globalData.payStatusInfo;  //店铺价格显示不显示
          thisPage.setData({
            imgUrls: returnData.result.appBannerList,
            productList: returnData.result.appProductList,
            payStatusInfo: payStatusInfo,
            payState: app.globalData.customerInfo.payState,
            currentIndex: 0
          })



        } else {  //失败
          app.showWarnMessage(returnData.message);
        }
      },
      fail: function (res) {     //失败
        console.log('【首页信息】请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('【首页信息】请求完成：', res.errMsg);
        wx.stopPullDownRefresh();
      }
    })
  },
  //获取店铺卡券列表
  getShopCardList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCouponsPage',  //接口地址
      data: {           //请求参数
        // page: 1,
        // pageSize: 2,
        ispage: false,    //是否分页
        param: {
          customerId: app.globalData.customerInfo.id,
          shopId: app.globalData.shopInfo.sys_user_id,
          card_tpye: "",   //(1:优惠券;2:红包;3:折扣券;)
        }
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("------------ 获取店铺卡券列表 ----------");

        if (returnData.code == 0) { //成功
          thisPage.setData({
            shopCardList: returnData.result.data
          })
        } else {  //失败
          console.log("接口异常！");
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
  //获取爆款产品列表
  getHotProductList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryAppHotProductPage',  //接口地址
      data: {           //请求参数
        // page: 1,
        // pageSize: 2,
        ispage: false,    //是否分页
        param: {
          shop_id: app.globalData.shopInfo.sys_user_id,
          customer_id: app.globalData.customerInfo.id
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
          thisPage.setData({
            hotProductList: returnData.result.data,
            isCanBuy: app.globalData.customerInfo.payState == 1 ? true : false
          })
        } else {  //失败
          console.log("接口异常！");
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
  //获取限时抢购产品列表
  getLimitBuyProductList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryLimitBuy',  //接口地址
      data: {           //请求参数
        shopId: app.globalData.shopInfo.sys_user_id,
        customer_id: app.globalData.customerInfo.id,
        type: 2
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;


        if (returnData.code == 0) { //成功
          if (returnData.result) {
            var productLists = returnData.result.productList;
          } else {
            var productLists = [];
          }
          thisPage.setData({
            limitBuyProductList: productLists,
            isCanBuy: app.globalData.customerInfo.payState == 1 ? true : false
          })
        } else {  //失败
          console.log("接口异常！");
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
  //获取当前活动详情
  getCurrentActivityDetails: function (num) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectActivityPage',  //接口地址
      data: {
        page: num,
        pageSize: thisPage.data.pageSize,
        ispage: true,    //是否分页
        param: {
          shopId: app.globalData.shopInfo.sys_user_id,
          type: 1,//1查询首页活动   2查询全部活动
        }

      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var activityList = returnData.result.data;
        if (returnData.code == 0) { //成功
          var isSearchNextPage = false;
          if (activityList.length > 0) {
            isSearchNextPage = true;
            if (activityList.length <= thisPage.data.pageSize) {
              isSearchNextPage = false;
            }
            if (num > 1) {
              activityList = thisPage.data.currentActivityInfo.concat(activityList);
            }
          }


          thisPage.setData({
            currentActivityInfo: activityList ? activityList : false,
            num: returnData.result.page,
            total: returnData.result.total,   //总条数
            isSearchNextPage: isSearchNextPage,  //是否允许下拉
          });
          app.globalData.currentActivityInfo = activityList;
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
  //拨打电话
  phoneServer: function (e) {
    var thisPage = this;
    var sellerInfo = thisPage.data.sellerInfo;
    var phone ="";
    if (sellerInfo){
      if (sellerInfo.sellerPhone){
        phone = sellerInfo.sellerPhone
      } else {
        phone = thisPage.data.showShopInfo.phone_num
      }
    }else{
      phone = thisPage.data.showShopInfo.phone_num
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },

  //获取访问域名路径
  getVisitDomainUrl: function () {
    var thisPage = this;
    //var domainName_onLine = 'https://www.kaolaj.com/magicCloud';
    var domainName_onLine = 'https://www.kaolaj.com/magic_cloud2.0_test';
    //var domainName_onLine = 'https://www.kaolaj.com/magic_cloud2.0_shenhe';
    // var domainName_onLine = 'http://192.168.1.6:8080/shop-web';
    // var domainName_outLine = 'https://www.kaolaj.com/magic_cloud2.0_test';
    var domainName_outLine = 'https://www.kaolaj.com/magic_cloud2.0_shenhe';
    var domainName_middle = "https://www.kaolaj.com/magic_cloud2.0_shenhe/app/selectVersion/" + app.globalData.appInfo.type;
    console.info(domainName_middle);

    wx.request({
      url: domainName_middle,  //接口地址
      method: 'GET',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info('【版本信息】', returnData);

        var version = app.globalData.appInfo.version;
        if (returnData.code == 0) {
          if (version == returnData.result) {
            app.globalData.domainName = domainName_onLine;
          } else {
            app.globalData.domainName = domainName_outLine;
          }
        }
      },
      fail: function (res) {     //失败
        console.error('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        console.info("【Request路径】", app.globalData.domainName);
        thisPage.getCurrentCity();      //获取当前城市
      }
    })
  },
  //获取购物车产品列表
  getShoppingCartProductList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCartListPage',  //接口地址
      data: {           //请求参数
        ispage: false,    //是否分页
        param: {
          customer_id: app.globalData.customerInfo.id,
          shop_id: app.globalData.shopInfo.sys_user_id,
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

          thisPage.setData({
            cartProductCount: dataList.length
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
  //点击获取头像信息
  getUserInfos: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    if (e.detail.errMsg == "getUserInfo:ok") {  //允许
      var userInfo = e.detail.userInfo;
      var userInfoList = {
        nick_name: userInfo.nickName,
        customerId: app.globalData.customerInfo.id,
        head_url: userInfo.avatarUrl,
        gender: userInfo.gender
      }
      wx.request({
        url: app.globalData.domainName + '/app/updateCustomerInfo ',  //接口地址
        method: 'POST',
        dataType: 'json',
        data: userInfoList,
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {  //成功
          var returnData = res.data;
          app.globalData.userInfo.nickName = userInfo.nickName;
          app.globalData.userInfo.avatarUrl = userInfo.avatarUrl;
          if (returnData.code == 0) { //成功
            app.showSuccessMessage('成功！');
            wx.setStorageSync('avatarUrl', userInfo.avatarUrl);
            thisPage.setData({
              isAuthorizeInfo: true,
              skipParam: dataSet,
              accredit_status: 1

            })
            app.globalData.customerInfo.accredit_status = 1;
            if (app.globalData.is_horizontal_alliances && ((app.globalData.customer_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 2) || (app.globalData.horizontal_alliances_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 1)) ){
              app.pageSkip("/pages/person_center/center/commission_center/commission_center", 1);
            }else{
              app.pageSkip("/pages/person_center/center/center/center", 1);
            }
            
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
    } else {  //拒绝
      thisPage.setData({
        isAuthorizeInfo: true,
        skipParam: dataSet
      })
      if (app.globalData.is_horizontal_alliances && ((app.globalData.customer_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 2) || (app.globalData.horizontal_alliances_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 1))){
        app.pageSkip("/pages/person_center/center/commission_center/commission_center", 1);
      } else {
        app.pageSkip("/pages/person_center/center/center/center", 1);
      }
      
    }

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
        pageSize: 3,
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
            groupListData: returnData.result.data
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
  ////////////////////////////////////////【wifi连接——begin】////////////////////////////////////////
  //初始化wifi模块
  initWifiModule: function () {
    wx.startWifi({
      success: function (res) {
        // console.log("【wifi】success:", res);
      },
      fail: function (res) {
        // console.log("【wifi】fail:", res);
      },
      complete: function (res) {
        console.log("【wifi】complete:", res);
      },
    });
  },
  //开始连接wifi
  beginToConnectWifi: function () {
    var thisPage = this;

    //监听获取wifi列表
    wx.onGetWifiList(function (res) {
      console.log('监听wifi列表：', res);
      var platform = app.globalData.deviceInfo.platform;

      var wifiInfo = null;
      if (res.wifiList.length) {
        wifiInfo = thisPage.getWifiInfo(res.wifiList, thisPage.data.wifiInfo.SSID);
      }
      console.log('wifiInfo', wifiInfo);

      if (platform == 'android') {
        if (wifiInfo) {
          thisPage.connectWifi(wifiInfo);   //连接wifi
        }
      } else if (platform == 'ios') {
        if (wifiInfo) {
          thisPage.connectWifi(wifiInfo);   //连接wifi
        } else {
          wx.setWifiList({
            wifiList: []
          })
        }
      } else {
        console.log("【其他系统】");
      }
    });

    //监听连接上wifi
    wx.onWifiConnected(function (res) {
      console.log('【wifi连接上】', res);
      thisPage.setData({
        isWifiConnected: true
      })
      thisPage.getBannerData();  //请求iocn图
      thisPage.getShopIndexInfo();    //获取店铺首页信息
      thisPage.getShopCardList();     //获取店铺卡券列表
      thisPage.getHotProductList();   //获取爆款产品列表
      thisPage.getCurrentActivityDetails(1);   //获取当前活动详情
      thisPage.getShoppingCartProductList();    //获取购物车产品列表
      thisPage.getGroupList();   //获取拼团的数据
    });

    //获取wifi列表
    wx.getWifiList({
      success: function (res) {
        // console.log("【wifi列表】success:", res);
      },
      fail: function (res) {
        // console.log("【wifi列表】fail:", res);
      },
      complete: function (res) {
        console.log("【获取wifi列表】complete:", res);
      }
    });
  },
  //获取wifi信息
  getWifiInfo: function (dataList, SSID) {
    var wifiInfo = null;

    for (var i = 0; i < dataList.length; i++) {
      var wifiItem = dataList[i];
      if (wifiItem.SSID == SSID) {
        return wifiItem;
      }
    }

    return wifiInfo;
  },
  //连接wifi
  connectWifi: function (wifiInfo) {
    var thisPage = this;

    wx.connectWifi({
      SSID: wifiInfo.SSID,
      BSSID: wifiInfo.BSSID,
      password: thisPage.data.wifiInfo.password,
      success: function (res) {
        // console.log("【wifi列表】success:", res);
      },
      fail: function (res) {
        // console.log("【wifi列表】fail:", res);
      },
      complete: function (res) {
        console.log("【连接wifi】complete:", res);
      }
    })
  },
  ////////////////////////////////////////【wifi连接——end】////////////////////////////////////////

  //获取用户信息学
  getUser: function (e) {
    wx.login({
      success: function (res) {
        app.showSuccessMessage('获取用户信息成功！！！！' + res.detail.code);
      }

    })

  },
  //////////////////////////////////////////////【新用户卡券】//////////////////////////////////////////////////////

  //查询新用户卡券列表
  lookNewUserCardList: function (e) {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectNewCustomerCard/' + app.globalData.shopInfo.sys_user_id,  //接口地址
      method: 'get',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        // console.log('【接口返回数据】',returnData);

        if (returnData.code == 0) { //成功
          var dataList = returnData.result;
          var newInfoShow = [];
          for (var m = 0; m < dataList.length; m++) {
            if (m == 0) {
              newInfoShow.push(false);
            } else {
              newInfoShow.push(true);
            }
          }

          thisPage.setData({
            newUserInfos: dataList,
            newInfoShow: newInfoShow
          })
          thisPage.creatAnimationOpen(); //动画开
          console.log('请求新用户卡券信息' + dataList);
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
  //关闭新用户卡券窗口
  closeCards: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var indexs = dataSet.indexs;
    thisPage.creatAnimationClose(indexs);  //关闭
    ///thisPage.rendererImage(indexs); //渲染下一个


  },

  //查询佣金模块
  lookCommission: function (e) {
    var thisPage = this;

    var data = {};
    data.node3 = app.globalData.customerInfo.factoryId;
    if (app.globalData.customerInfo.is_horizontal_alliances == 1) {
      data.type = 2
    } else {
      data.type = 1
    }

    wx.request({
      url: app.globalData.domainName + '/app/selectCommissionImage',  //接口地址
      method: 'POST',
      data:data,
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        // console.log('【接口返回数据】',returnData);

        if (returnData.code == 0) { //成功
          var dataList = returnData.result;
          var lookCommission = false ;
          if (returnData.result.orderImage && returnData.result.orderImage.image){
            lookCommission = wx.getStorageSync('orderImage' + returnData.result.orderImage.id);
            var imageUrl = returnData.result.orderImage.image

            imageUrl = 'https' + imageUrl.substring(4)
            returnData.result.orderImage.image = imageUrl

            app.globalData.orderImage = returnData.result.orderImage
          }
          var imageUrl1;
          if (returnData.result.spreadImage && returnData.result.spreadImage.image){
            imageUrl1 = returnData.result.spreadImage.image

            imageUrl1 = 'https' + imageUrl1.substring(4)
            returnData.result.spreadImage.image = imageUrl1
            app.globalData.spreadImage = returnData.result.spreadImage
          }
          
          if (!lookCommission && returnData.result.orderImage && app.globalData.is_horizontal_alliances && ((app.globalData.customer_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 2) || (app.globalData.horizontal_alliances_commission_status == 1 && app.globalData.customerInfo.is_horizontal_alliances == 1)) ){
  
            thisPage.setData({
              orderImage: returnData.result.orderImage,
              lookCommission: true
            })
            thisPage.creatAnimationOpen(); //动画开
          }
       
          
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

  //授权后领取卡券
  getCoupon2: function (e) {
    var dataSet = e.currentTarget.dataset;
    this.getCoupon(dataSet);
  },
  //领取卡券
  getCoupon: function (dataSet) {
    var thisPage = this;
    // var dataSet = e.currentTarget.dataset;
    var cardId = dataSet.cardid;
    var exclusiveId = dataSet.exclusiveid;
    var indexs = dataSet.indexs;
    wx.request({
      url: app.globalData.domainName + '/app/addCustomerCoupons',  //接口地址
      data: {           //请求参数
        exclusive_id: exclusiveId,
        couponsId: cardId,
        customer_id: app.globalData.customerInfo.id,
        shop_id: app.globalData.shopInfo.sys_user_id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.showSuccessMessage('领取成功！');
          thisPage.creatAnimationClose(indexs); //动画关闭
          // thisPage.rendererImage();  //渲染下一个

        } else {  //失败
          app.showSuccessMessage("领取失败！");
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
  //动画展开
  creatAnimationOpen: function () {
    var thisPage = this;
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: 'linear',
    })
    thisPage.animation = animation
    animation.scale(1, 1).step();
    thisPage.setData({
      animationData: animation.export()
    })
  },
  //动画关闭
  creatAnimationClose: function (indexs) {
    var thisPage = this;
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 500,
      timingFunction: 'linear',

    })
    thisPage.animation = animation
    animation.scale(0, 0).step();
    thisPage.setData({
      animationData: animation.export()
    })
    thisPage.rendererImage(indexs);
  },
  //循环让动画渲染
  rendererImage: function (index) {
    var thisPage = this;
    var newInfoShow = [];
    var lengths = thisPage.data.newInfoShow.length;
    for (var m = 0; m < lengths; m++) {
      if (m <= index) {
        newInfoShow.push(true);
      } else {
        var indexs = parseInt(index) + 1;
        if (m == indexs && m !== lengths) {
          newInfoShow.push(false);
        } else {
          newInfoShow.push(true);
        }
      }
    }
    if (index == (parseInt(lengths) - 1)) {
      thisPage.setData({
        isNew: false,
        newInfoShow: newInfoShow
      })
    } else {
      thisPage.setData({
        newInfoShow: newInfoShow
      })
      thisPage.creatAnimationOpen();  //打开
    }

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

          if (resturnData.result.userCommissionSet){
            if (resturnData.result.userCommissionSet.customer_commission_status == 1){
              app.globalData.customer_commission_status = 1
            }
            if (resturnData.result.userCommissionSet.horizontal_alliances_commission_status == 1) {
              app.globalData.horizontal_alliances_commission_status = 1
            }
          }

          for (var das = 0; das < resturnData.result.shopColumn.length; das++) {
            if (resturnData.result.shopColumn[das] == '/pages/product/otherproduct_list/product_list') {
              thisPage.setData({
                otherProducts: 1
              })
            } else {
              thisPage.setData({
                otherProducts: 2
              })
            }
            if (resturnData.result.shopColumn[das] =='/pages/person_center/center/commission_center/commission_center'){
              app.globalData.is_horizontal_alliances = true;
              thisPage.lookCommission();
            }
          }
        }
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
  //拨打客服
  callSellerPhone: function (e) {
    var thisPage = this;

    wx.makePhoneCall({
      phoneNumber: thisPage.data.sellerInfo.sellerPhone
    })
  }, 
  //复制
  copy: function () {
    var thisPage = this;
    var wxName = thisPage.data.sellerInfo.weixinhao;

    wx.setClipboardData({
      data: wxName,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data)
            app.showSuccessMessage("复制成功！");
          }
        })
      }
    })
  },
  hideCodeImage :function(){
    var thisPage = this;
    thisPage.setData({
      lookCommission : false
    })
  },
  skipTocenter : function(){
    var thisPage = this;
    wx.setStorageSync('orderImage' + thisPage.data.orderImage.id, true)
    app.pageSkip("/pages/person_center/center/commission_center/commission_center",1)
    thisPage.setData({
      lookCommission : false
    })
  }
})
