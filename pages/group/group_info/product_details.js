var app = getApp();   //获取应用实例
var WxParse = require('../../../plugs/wxParse/wxParse.js');
var Common = require("../../../utils/common.js");


Page({
  data: {
    isShowPrice: null,    //是否显示价格
    isCanBuy: false,      //是否可以购买

    productId: null,    //产品Id
    groupBuyingId: null,  //商户创建的拼团id
    productInfo: null,  //产品信息
    otherGroupData: [],   //其他拼团
    isJoin:null,   //是否已经参与拼团
    contentDetails: null,     //图文详情
    groupBuyingInfo: null,  //拼团 信息
    isHot: 2,     //是否爆款（1：是；2：不是）
    hotProductVersion: null,  //爆款产品版本号

    codeImageHidden: true,      //二维码图片（隐藏）
    codeImage: "",    //二维码图片

    couponPannelHidden: true, //优惠券面板（隐藏）
    couponList: [],    //优惠券列表

    propertyPannelHidden: true, //属相面板（隐藏）
    colorArr: null,         //颜色数组
    colorActiveArr: [],     //颜色数组样式
    modelArr: null,         //规格数组
    modelActiveArr: [],     //规格数组样式
    saleInfo: null,         //销售信息

    chooseColor: null,    //选择的颜色
    chooseModel: null,    //选择的规格
    buyCount: 1,          //购买数量

    bookingPannelHidden: true,    //预约面板（隐藏）
    booking_startTime_1: "请选择日期",    //预约开始时间
    booking_startTime_2: "请选择时间",    //预约开始时间
    booking_endTime_1: "请选择日期",      //预约结束时间
    booking_endTime_2: "请选择时间",      //预约结束时间
    nowDate: "2017-01-01",

    activeArr: ['active', ''],  //菜单选中样式
    menuContentHiddenArr: ['', 'true'], //菜单对应内容显示、隐藏

    servicePhone: "",         //客服电话
    cartProductCount: 0,      //购物车产品数量

    modalBox_message: {
      hidden: true,
      infoList: ["提交成功", "我们会尽快跟您取得联系"]
    },
    groupBook: true,//t弹框的显示与隐藏
    remainTime: null,   //剩余时间
    days: null,   //天数
    hours: null,   //小时
    minutes: null,  //分钟 
    seconds: null,  //秒
    pullNum: 1,    //当前页面的
    pageSize: 3,    //一页的产品
    total: 0, //总条数
    isSearchNextPage: true,  //是否查询
    isAuthorizePhone:true ,  //手机
    appColor:'red',  //颜色
    payState: null,   //顶级支付状态
    payStatusInfo: null,  //店铺支付状态
    productPayStatus: null,  //产品的支付
    isType:null ,  //1 是线上 2是线下
    isTops:true,   //线下弹框
    leftDistance:0 , //客服消息距离左边的距离
    server: null,   //客服消息 （1是开通  2是没开通）
    shareBg1: true,  //分享给好友
    shareBg2: true,  //即将成功
    shareBg3: true,  //成功
    customerGroupBuyingInfoId:null, // 拼团创始id
    payData:null, //拼团产品的详情
    remainingNum:null,  //还剩多少人参加
    videoIndex: 0,  //记录点击的是第几个视频
    videoPlay: true,  //播放视频的显示与隐层
    active: null,  //选定的颜色
  },

  onLoad: function (options) { //页面加载
    console.log(app.globalData.customerInfo.phone +'电话号码！！');
    this.setData({
      productId: options.product_id,
      groupBuyingId: options.id,
      hotProductVersion: options.hotProductVersion,
      servicePhone: app.globalData.shopInfo.phone_num,
      isShowPrice: app.globalData.shopInfo.isOpen,
      isJoin: options.isJoin,
      isAuthorizePhone: app.globalData.customerInfo.phone ? false : false
    });

    this.getProductDetails();     //获取产品详情
    this.getCodeImage();          //获取二维码图片
    this.getShoppingCartProductList();    //获取购物车产品列表
    this.moreCouponList(1);    //获取更多拼团
    // if (app.globalData.customerInfo.id){  //登录
    //   this.addHistory();    //添加产品足迹
    // }
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    var thisPage =this;
    
    thisPage.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
      active: app.globalData.userInfoAll.appColor,
      server: app.globalData.customerInfo.server
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getProductDetails();             //获取产品详情
    this.getCodeImage();                  //获取二维码图片
    this.getShoppingCartProductList();    //获取购物车产品列表
    this.moreCouponList(1);    //获取
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    var productTitle = thisPage.data.productInfo.info.product_title;

    if (thisPage.data.customerGroupBuyingInfoId && thisPage.data.isType == '2'){
      var param = "P1=L&P4=" + app.globalData.customerInfo.id + "&productId=" + thisPage.data.productId + '&groupBuyingId=' + thisPage.data.groupBuyingId + '&types=' + thisPage.data.isType + '&customerGroupBuyingId=' + thisPage.data.customerGroupBuyingInfoId;
    }else{
      var param = "P1=groupDetail&P4=" + app.globalData.customerInfo.id + "&product_id=" + thisPage.data.productId + '&id=' + thisPage.data.groupBuyingId + '&types=' + thisPage.data.isType;
    }
  
    return {
      title: productTitle,
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint(productTitle);
        if (thisPage.data.isType == '2'&&thisPage.data.customerGroupBuyingInfoId ) {
          setTimeout(function () {
            app.pageSkip('/pages/group/my_group/my_group?listType=2', 2);
          }, 2000);
         
        }
      }
    };
  },
  //菜单选择
  chooseMenu: function (e) {
    var activeArr_copy = [];
    var menuContentHiddenArr_copy = [];
    var index = e.currentTarget.dataset.value;

    for (var i = 0; i < this.data.activeArr.length; i++) {
      if (i == index) { //选中
        activeArr_copy.push('active');
        menuContentHiddenArr_copy.push('');
      } else {
        activeArr_copy.push('');
        menuContentHiddenArr_copy.push('true');
      }
    }

    this.setData({
      activeArr: activeArr_copy,
      menuContentHiddenArr: menuContentHiddenArr_copy
    })
  },

  //显示二维码图片
  showCodeImage: function (e) {
    this.setData({
      codeImageHidden: false
    });
  },
  //隐藏二维码图片
  hideCodeImage: function (e) {
    this.setData({
      codeImageHidden: true
    });
  },
  //图片下载
  imageDownload: function () {
    var thisPage = this;

    wx.getImageInfo({   //获取图片信息
      src: thisPage.data.codeImage,
      success: function (res1) {
        if (wx.saveImageToPhotosAlbum) {    //保存图片到系统相册
          wx.saveImageToPhotosAlbum({
            filePath: res1.path,
            success: function (res2) {
              app.showSuccessMessage("图片保存成功");
            },
            fail: function (res2) {
              if (res2.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
                wx.openSetting({
                  success(settingdata) {
                    console.log(settingdata)
                    if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                      app.showWarnMessage("请再次点击下载！");
                    } else {
                      console.log("获取权限失败")
                    }
                  }
                })
              }
            }
          })
        } else {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
          })
        }
      },
      fail: function (res) {
        console.warn("获取图片信息fail", res);
      }
    })
  },
  //选择优惠券
  choseCoupon: function (e) {
    if (!app.globalData.customerInfo.id) {  //未登录
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    this.setData({
      couponPannelHidden: false
    });
    this.getCouponList();   //获取优惠券列表
  },
  //关闭优惠券面板
  closeCouponPannel: function (e) {
    this.setData({
      couponPannelHidden: true
    });
  },
  //选择属性
  choseProperty: function (e) {
    this.setData({
      propertyPannelHidden: false,
      buyCount: 1
    });

    this.getProductColorArr();    //获取产品颜色数组信息
  },
  //选择颜色
  chooseColor: function (e) {
    var dataSet = e.currentTarget.dataset;
    var color = dataSet.param;

    if (this.data.chooseColor != color) {
      for (var i = 0; i < this.data.colorArr.length; i++) {
        var colorItem = this.data.colorArr[i];
        if (colorItem == color) {
          this.data.colorActiveArr[i] = 'active';
        } else {
          this.data.colorActiveArr[i] = '';
        }
      }

      this.setData({
        colorActiveArr: this.data.colorActiveArr,
        chooseColor: color
      })

      this.getProductModelArr(color);    //获取产品规格数组信息
    }
  },
  //选择规格
  chooseModel: function (e) {
    var dataSet = e.currentTarget.dataset;
    var model_id = dataSet.param;
    var modelItem = null;
    var modelItem2 = null;
    var thisPage = this;

    if (thisPage.data.chooseModel.id != model_id) {
      for (var i = 0; i < thisPage.data.modelArr.length; i++) {
        modelItem = thisPage.data.modelArr[i];
        if (modelItem.id == model_id) {
          modelItem2 = thisPage.data.modelArr[i];
          thisPage.data.modelActiveArr[i] = 'active';
        } else {
          thisPage.data.modelActiveArr[i] = '';
        }
      }

      thisPage.setData({
        modelActiveArr: thisPage.data.modelActiveArr,
        chooseModel: modelItem2
      })

      thisPage.getProductSaleInfo(model_id);    //获取产品【销售】信息
    }
  },
  //更改产品数量
  changeProductCount: function (e) {
    var dataSet = e.currentTarget.dataset;
    var method = dataSet.param;

    var count = this.data.buyCount; //当前购买数量
    var productInfo = this.data.productInfo;

    if (method == '-1') {   //减少
      if (count > 1) {
        count--;
      }
    } else if (method == '1') {  //增加
      if (this.data.isHot == 1) {  //爆款
        if (productInfo.info.residue_num > 0) {  //有库存
          if (Number(productInfo.buyNum) < productInfo.info.limitation_num) {  //没有超出限购量
            if (count < productInfo.info.residue_num) {
              if (count < (productInfo.info.limitation_num - Number(productInfo.buyNum))) {
                count++;
              } else {
                app.showWarnMessage("超出限购数量");
                return;
              }
            } else {
              app.showWarnMessage("库存不足");
              return;
            }
          } else {  //超出限购量，原价
            if (count < this.data.saleInfo.stock) {
              count++;
            } else {
              app.showWarnMessage("库存不足");
              return;
            }
          }
        } else {  //没有库存
          if (count < this.data.saleInfo.stock) {
            count++;
          } else {
            app.showWarnMessage("库存不足");
            return;
          }
        }
      } else if (this.data.isHot == 2) {  //非爆款
        if (count < this.data.saleInfo.stock) {
          count++;
        } else {
          app.showWarnMessage("库存不足");
          return;
        }
      }
    }

    this.setData({
      buyCount: count
    })
  },
  //收藏操作
  collectOperate: function (e) {
    if (!app.globalData.customerInfo.id) {  //未登录
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    var productId = this.data.productId;

    if (this.data.productInfo.collect_state == 1) {   //已收藏
      this.cancelCollectThisProduct();    //取消收藏当前产品
    } else if (this.data.productInfo.collect_state == 2) {
      this.collectThisProduct();          //收藏当前产品 
    }
  },
  //拨打客服
  phoneServer: function (e) {
    var thisPage = this;

    wx.makePhoneCall({
      phoneNumber: thisPage.data.servicePhone
    })
  },
  //关闭属性面板
  closeProperty: function (e) {
    this.setData({
      propertyPannelHidden: true
    })
  },
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },

  //获取产品详情
  getProductDetails: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/productdetails',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        customerId: app.globalData.customerInfo.id,
        hot_version: thisPage.data.hotProductVersion
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var leftDistance = 0;
        if (returnData.code == 0) { //成功

          if (!returnData.result.groupBuyingInfo.group_price){
            thisPage.showSubmitBtn();
            returnData.result.groupBuyingInfo.group_price = 0;
          }

          if (!returnData.result.groupBuyingInfo.success_num) {
        
            returnData.result.groupBuyingInfo.success_num = 0;
          }
          
          var payState = app.globalData.customerInfo.payState;
          var payStatusInfo = app.globalData.payStatusInfo;
          var productPayStatus = returnData.result.info;
          var isType = null;
          if (payState==1){  //可以支付 1
            if (payStatusInfo.isOpen == 1 && payStatusInfo.pay_status == 1){
              if (productPayStatus.isOpen == 1 && productPayStatus.pay_status == 1){
                isType = 1;
                leftDistance = '220';
              } else {
                isType = 2;
                leftDistance = '291';
              }
            }else{
              isType = 2;
              leftDistance = '291';
            }
          }else{  //不可以支付 2
            isType = 2;
            leftDistance = '291';
          }
          thisPage.setData({
            productInfo: returnData.result,
            groupBuyingInfo: returnData.result.groupBuyingInfo,
            isHot: returnData.result.info.hot_price ? 1 : 2,
            isCanBuy: (app.globalData.customerInfo.payState == 1 && returnData.result.info.pay_status == 1) ? true : false,
            payState: payState,
            payStatusInfo: payStatusInfo,
            productPayStatus: productPayStatus,
            isType: isType,
            leftDistance: leftDistance
          })
          WxParse.wxParse('contentDetails', 'html', returnData.result.info.description, thisPage, 5);
          //倒计时
          var endTime  ;
          if (returnData.result.groupBuyingInfo.endTime){
            endTime = returnData.result.groupBuyingInfo.endTime.replace(/\-/g, "/")
            thisPage.countDown(null, null, null, null, null, null, endTime);   //倒计时
          }else{
            thisPage.setData({
              days: 0,
              hours: 0,
              minutes: 0,
              secomds: 0
            })
          }
         
         
        
        } else {  //失败
          console.log("接口异常！");
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
  //获取二维码图片
  getCodeImage: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/makeQRCode',  //接口地址
      data: {           //请求参数
        P1: 'C',
        P2: thisPage.data.productId,
        P4: app.globalData.customerInfo.id,
        ishyaline: false,
        node3_id: app.globalData.customerInfo.factoryId
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
            codeImage: returnData.result.replace("http", "https")
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
  //获取优惠券列表
  getCouponList: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/queryFirstPageCouponsList',  //接口地址
      data: {           //请求参数
        // page: 1,
        // pageSize: 2,
        ispage: false,    //是否分页
        param: {
          customer_id: app.globalData.customerInfo.id,
          shop_id: app.globalData.shopInfo.id,
          type: "",   //(1:红包;2:优惠券;3:折扣券;)
          scope_type: 2,   //(1:平台;2:品牌;)
          date_format: "",    //（有：年月日；无：年月日时分秒）
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
            couponList: returnData.result.data
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
  //领取优惠券
  getCoupon: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var couponId = dataSet.param;

    wx.request({
      url: app.globalData.domainName + '/app/receivebrandcoupons',  //接口地址
      data: {           //请求参数
        customer_id: app.globalData.customerInfo.id,
        coupons_id: couponId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.showSuccessMessage("领取成功！");
          thisPage.closeCouponPannel();   //关闭优惠券面板
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
  //获取产品【颜色】数组信息
  getProductColorArr: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getselectproperties',  //接口地址
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

        if (returnData.code == 0) { //成功
          var colorArr = returnData.result;
          thisPage.data.colorActiveArr = [];
          for (var i = 0; i < colorArr.length; i++) {
            if (i == 0) {
              thisPage.data.chooseColor = colorArr[i];
              thisPage.data.colorActiveArr.push("active");
            } else {
              thisPage.data.colorActiveArr.push("");
            }
          }

          thisPage.setData({
            colorArr: colorArr,
            colorActiveArr: thisPage.data.colorActiveArr,
            chooseColor: thisPage.data.chooseColor
          })

          thisPage.getProductModelArr(thisPage.data.chooseColor);    //获取产品规格数组信息
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
  //获取产品【规格】数组信息
  getProductModelArr: function (color) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/getselectpropertiesbycolor',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        color_model: color
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var modelArr = returnData.result;
          thisPage.data.modelActiveArr = [];
          for (var i = 0; i < modelArr.length; i++) {
            if (i == 0) {
              thisPage.data.chooseModel = modelArr[i];
              thisPage.data.modelActiveArr.push("active");
            } else {
              thisPage.data.modelActiveArr.push("");
            }
          }

          thisPage.setData({
            modelArr: modelArr,
            modelActiveArr: thisPage.data.modelActiveArr,
            chooseModel: thisPage.data.chooseModel
          })

          thisPage.getProductSaleInfo(thisPage.data.chooseModel.id);    //获取产品【销售】信息
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
  //获取产品【销售】信息 
  getProductSaleInfo: function (modelId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectproperties',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        id: modelId
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
            saleInfo: returnData.result
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
  //收藏当前产品    
  collectThisProduct: function () {
    var thisPage = this;
    var data = this.data;

    if (!app.globalData.customerInfo.id) {  //未登录
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/collectproduct',  //接口地址
      data: {           //请求参数
        customer_id: app.globalData.customerInfo.id,
        product_id: data.productId,
        type: 1
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.getProductDetails();    //获取产品详情          
        } else {  //失败
          app.showWarnMessage('收藏失败！');
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
  //取消收藏当前产品
  cancelCollectThisProduct: function () {
    var thisPage = this;
    var data = this.data;

    if (!app.globalData.customerInfo.id) {  //未登录
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/cancelcollectproduct',  //接口地址
      data: {           //请求参数
        customer_id: app.globalData.customerInfo.id,
        product_id: data.productId,
        type: 1
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.getProductDetails();    //获取产品详情         
        } else {  //失败
          app.showWarnMessage('取消收藏失败！');
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
  //添加产品足迹
  addHistory: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/addhistory',  //接口地址
      data: {           //请求参数
        customer_id: app.globalData.customerInfo.id,
        product_id: thisPage.data.productId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功

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
  //立即购买
  buyNow: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var isHot = dataSet.param;
    var group = dataSet.group;
    var online = dataSet.online;
    if (!app.globalData.customerInfo.phone) {
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    if (!thisPage.data.chooseColor ) {
      if (thisPage.data.isJoin == 1 && group == 2){
        app.showWarnMessage("您已参与该拼团！");
        return;
      }
      thisPage.choseProperty();
      return;
    }else{
      if (thisPage.data.buyCount> thisPage.data.groupBuyingInfo.limitation_num){
        app.showWarnMessage("超出限购数量！");
          return;
      }
    }
    if (online=='1'){  //拼团线上
      if (isHot == 1 || isHot == 2) {
        var groupId = "";

      } else {
        var groupId = "&groupBuyingId=" + thisPage.data.groupBuyingId + '&sort=1' + "&productId=" + thisPage.data.productId;
      }
      var param = ('source=product_' + isHot
        + '&standardId=' + thisPage.data.chooseModel.id
        + '&buyCount=' + thisPage.data.buyCount + groupId);
      if (group=='1'){  //独自拼团
        wx.request({
          url: app.globalData.domainName + '/app/goOneSettleAccounts ',  //判断是否库存不足
          data: {           //请求参数
            customerId: app.globalData.customerInfo.id,
            num: thisPage.data.buyCount,
            id: thisPage.data.chooseModel.id
          },
          method: 'POST',
          dataType: 'json',
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {  //成功
            var returnData = res.data;

            if (returnData.code == 0) { //成功
              app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1);
            } else {  //失败
              app.showWarnMessage(returnData.message);
              return;
            }
          },
          fail: function (res) {     //失败
            app.showWarnMessage(returnData.message);
            return;
          },
          complete: function (res) { //完成
            thisPage.setData({
              isTops: true
            })
          }
        })

        }else{
        app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1);
        }
     
    } else if (online == '2'){  //线下
      thisPage.setData({
        isTops:false
      })
    }
    

  },
  //线下拼团提交
  submitOrder:function(e){
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.types;
    if (types=='1'){  //取消
      thisPage.setData({
        isTops:true
      })
    }else{  //确定
      wx.request({
        url: app.globalData.domainName + '/app/addOfflineGroupBuying ',  //接口地址
        data: {           //请求参数
          groupBuyingId: thisPage.data.groupBuyingId,
          customerId: app.globalData.customerInfo.id,
          num: thisPage.data.buyCount,
          shopId: app.globalData.shopInfo.sys_user_id,
          productId: thisPage.data.chooseModel.id
        },
        method: 'POST',
        dataType: 'json',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {  //成功
          var returnData = res.data;
        
          if (returnData.code == 0) { //成功
            app.showWarnMessage('拼团成功！');
            thisPage.setData({
              customerGroupBuyingInfoId: returnData.result.customerGroupBuyingInfoId
            })
            thisPage.getDeatails();  //请求线下拼团的详情
          } else {  //失败
            app.showWarnMessage(returnData.message);
          }
        },
        fail: function (res) {     //失败
          console.log('请求失败：', res.errMsg);
        },
        complete: function (res) { //完成
          thisPage.setData({
            isTops: true
          }) 
        }
      })
    }
  },
  //立即预订
  bookingNow: function () {
    var thisPage = this;

    if (!thisPage.data.chooseColor) {
      thisPage.choseProperty();
      return;
    }

    var nowDate = Common.getCurrentTime("date");

    this.setData({
      propertyPannelHidden: true,
      bookingPannelHidden: false,
      nowDate: nowDate
    });
  },
  //设置时间
  setTime: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;

    var obj = {};
    obj[key] = value;
    this.setData(obj);
  },
  //取消预约
  cancelBooking: function () {
    this.setData({
      bookingPannelHidden: true
    });
  },
  //提交预约
  submitBooking: function () {
    var thisPage = this;
    var thisData = this.data;

    if (thisData.booking_startTime_1 == "请选择日期") {
      app.showWarnMessage("请设置开始日期");
      return;
    }
    if (thisData.booking_startTime_2 == "请选择时间") {
      app.showWarnMessage("请设置开始时间");
      return;
    }
    if (thisData.booking_endTime_1 == "请选择日期") {
      app.showWarnMessage("请设置结束日期");
      return;
    }
    if (thisData.booking_endTime_2 == "请选择时间") {
      app.showWarnMessage("请设置结束时间");
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/addHotProductReserve',  //接口地址
      data: {           //请求参数
        product_id: thisData.productId,
        hot_version: thisPage.data.hotProductVersion,
        colorAndModel: thisData.chooseColor,
        standard: thisData.chooseModel.standard,
        reserve_num: thisData.data.buyCount,
        customer_id: app.globalData.customerInfo.id
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
            bookingPannelHidden: true,
            "modalBox_message.hidden": false
          });
          thisPage.getProductDetails();     //获取产品详情

          setTimeout(function () {
            thisPage.setData({
              "modalBox_message.hidden": true
            });
          }, 2000);
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
  //加入购物车
  joinShoppingCart: function () {
    var thisPage = this;

    if (!thisPage.data.chooseColor) {
      thisPage.choseProperty();
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/addCart',  //接口地址
      data: {           //请求参数
        product_id: thisPage.data.chooseModel.id,
        number: thisPage.data.buyCount,
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
          thisPage.setData({
            propertyPannelHidden: true
          })
          app.showSuccessMessage("添加成功");
          thisPage.getShoppingCartProductList();
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
  //查看更多拼团弹框的显示与隐藏
  moreGroupInfo: function (e) {
    var thisPage = this;
    var current = e.currentTarget.dataset;
    var types = current.types;
    if (types == '1') { //1是打开  0 是关闭
      thisPage.setData({
        groupBook: false
      })
    } else {
      thisPage.setData({
        groupBook: true
      })
    }
  },
  //跳转到订单
  joinShoppingCart2: function (e) {

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
    
   
    var leftTime = new Date(year1+'/'+month1+'/'+ daty1 +" "+hour1+":"+ minutes1+':'+secomds1) - new Date();  //时间差

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

  //查看更多参团信息
  moreCouponList: function (pullNum) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCustomerGroupBuyingPage',  //接口地址
      data: {           //请求参数
        page: pullNum,
        pageSize: thisPage.data.pageSize,
        ispage: true,    //是否分页
        param: {
          productId: thisPage.data.productId,
          groupBuyingId: thisPage.data.groupBuyingId,
        }
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var resData = res.data;


        if (resData.code == 0) {
         var resDataList = resData.result.data;
          if (resDataList.length > 0) {
            var isSearchNextPage = true;
            if (resDataList.length < thisPage.data.pageSize) {
              var isSearchNextPage = false;
            }
            if (pullNum > 1) {
              resDataList = thisPage.data.otherGroupData.concat(resDataList);
            }
            thisPage.setData({
              'otherGroupData': resDataList,   //总数据
              'pullNum': resData.result.page, //当前页
              'total': resData.result.total,   //总条数
              'isSearchNextPage': isSearchNextPage  //是否允许下拉
            })

          } else if (resDataList.length == 0) {

          }


        } else if (resData.code == 1) {

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
  //请求线下拼团的详情
  getDeatails: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/selectOfflineGroupBuyingDetail',  //接口地址
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数
        customer_group_buying_id: thisPage.data.customerGroupBuyingInfoId,
        customerId: app.globalData.customerInfo.id
     },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          if (returnData.result.status == 1) {  //成团
            var shareBg = 'shareBg3';
          } else if (returnData.result.status == 2) {  //拼团中
            var shareBg = 'shareBg1';
          } else if (returnData.result.status == 3) {  //失败 （前端页面不展示）
            var shareBg = 'shareBg2';
          }
          thisPage.setData({
            propertyPannelHidden:true,
            payData: returnData.result,
            remainingNum: returnData.result.success_num - returnData.result.joinNum,//还剩给人
            [shareBg]: false,
            customer_group_buying_id: thisPage.data.customerGroupBuyingInfoId
          })
          console.log('joinCustomer' + returnData.result.joinCustomer);
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
  //滚动正在拼单是
  getscrollData: function () {
    var thisPage = this;
    if (thisPage.data.isSearchNextPage) {
      var pullNum = thisPage.data.pullNum + 1;
      thisPage.moreCouponList(pullNum);
    }
  },
  //关闭分享
  closeShare: function (e) {
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.types;
    if (types == 1) {
      this.setData({
        shareBg: true
      })
      var groupList = '/pages/group/my_group/my_group?listType=2';
    } else {
      var groupList = '/pages/group/group_list/group_list';
    }

    //跳转到我的拼团订单
    app.pageSkip(groupList, 2);
  },
  //参加其他的拼团
  selectToGroup:function(e){
    var dataset = e.currentTarget.dataset;
    var id = dataset.id;  
    var types = dataset.types;  
    var thisPage = this;
    if (thisPage.data.isJoin==2){
      var pageUrl = '/pages/group/part_in_group/part_in_group?id=' + id + '&groupBuyingId=' + this.data.groupBuyingId + '&productId=' + this.data.productId + '&status=0' + '&types=' + types;
      app.pageSkip(pageUrl, 1);
    }else{
      app.showWarnMessage('您已参与该拼团！');
      return;
    }

  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },

  //播放视频弹框
  playTo: function (e) {
    var current = e.currentTarget.dataset;
    var indexs = current.indexs;
    var thisPage = this;
    this.videoContext = wx.createVideoContext('myVideo' + indexs)
    thisPage.setData({
      videoIndex: indexs,
      videoPlay: false
    })
    this.videoContext.play();
  },
  //关闭视频
  closePlay: function () {
    var thisPage = this;
    thisPage.setData({
      videoPlay: true
    })
    this.videoContext.pause();
  },
  showSubmitBtn: function () {
    var thisPage = this;
    wx.showModal({

      title: '',
      showCancel: false,//是否显示取消按钮
      content: '当前拼团活动已结束,请退出',

      success: function (res) {

        if (res.confirm) {
          app.pageSkip('/pages/index/index', 2);
          
        } else {

          console.log('用户点击取消')

        }
      }
    })
  }
})
