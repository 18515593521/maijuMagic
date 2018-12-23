var app = getApp();   //获取应用实例
var WxParse = require('../../../plugs/wxParse/wxParse.js');
var Common = require("../../../utils/common.js");


Page({
  data: {
    isShowPrice: null,    //是否显示价格
    isCanBuy: false,      //是否可以购买

    productId: null,    //产品Id
    productInfo: null,  //产品信息
    contentDetails: null,     //图文详情
    isHot: 2,     //是否爆款（1：是；2：不是） 
    hotProductVersion: null,  //爆款产品版本号
    limitId:null,
    limit_buy_time:null,
    codeImageHidden: true,      //二维码图片（隐藏）
    codeImage: "",    //二维码图片
    time:null,
    couponPannelHidden: true, //优惠券面板（隐藏）
    couponList: [],    //优惠券列表
    limit_type:null,
    propertyPannelHidden: true, //属相面板（隐藏）
    colorArr: null,         //颜色数组
    colorActiveArr: [],     //颜色数组样式
    modelArr: null,         //规格数组
    modelActiveArr: [],     //规格数组样式
    saleInfo: null,         //销售信息
    limit_buy_price:null,
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
    sellerPhone: false,  //有没有导购电话
    sellerPhone2: null,  //导购电话
    weixin: null,  //微信
    modalBox_message: {
      hidden: true,
      infoList: ["提交成功", "我们会尽快跟您取得联系"]
    },
    isAuthorizePhone: null,  //手机
    payState: null,  //是否可以購買
    phone: null,  //電話
    wait: false,  //菊花
    payState: null,   //顶级支付状态
    payStatusInfo: null,  //店铺支付状态
    productPayStatus: null , //产品的支付
    appColor: 'red',  //颜色
    server: null,   //客服消息 （1是开通  2是没开通）
    videoIndex: 0,  //记录点击的是第几个视频
    videoPlay: true,  //播放视频的显示与隐层
    active: null,  //选定的颜色
  },

  onLoad: function (options) { //页面加载
    //页面加载
    var isShowPrice1 = null;
    var thisPage = this;
    if (options.isShare == '1') {
      var location = {
        'lat': options.lat,
        'lng': options.lng
      };
      wx.setStorageSync('location', location);
      wx.setStorageSync('address', options.address);
      wx.setStorageSync('regionCode', options.regionCode);
      console.log('绑定' + JSON.stringify(options));

      app.globalData.inviterInfo.type = options.type;
      if (options.type == 1) {
        app.globalData.inviterInfo.value = options.P3;
      } else {
        app.globalData.inviterInfo.value = options.P4;
      }
      app.weChatLogin(1, options.lat, options.lng);
    }


    setTimeout(function () {
      console.log(options.hotProductVersion +' options.hotProductVersion');
      thisPage.setData({
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
        productId: options.productId,
        limit_buy_time: options.limit_buy_time,
        limitId: options.limitId,
        servicePhone: app.globalData.shopInfo.phone_num,
        isShowPrice: app.globalData.shopInfo.isOpen,
        limit_type: options.limit_type
      });

      thisPage.getProductDetails();     //获取产品详情
      thisPage.getCodeImage();          //获取二维码图片

    }, 1300)

  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    thisPage.getCodeImage();          //获取二维码图片

    this.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
      server: app.globalData.customerInfo.server,
      active: app.globalData.userInfoAll.appColor,
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getProductDetails();             //获取产品详情
    this.getCodeImage();                  //获取二维码图片
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    var productTitle = thisPage.data.productInfo.info.product_title;
    var param = "P1=limit&P4=" + app.globalData.customerInfo.id + "&productId=" + thisPage.data.productId + '&limitId=' + thisPage.data.limit_buy_id + '&imit_buy_time=' + thisPage.data.imit_buy_time;

    return {
      title: productTitle,
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint(productTitle);
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

    if (this.data.chooseModel.id != model_id) {
      for (var i = 0; i < this.data.modelArr.length; i++) {
        
        if (this.data.modelArr[i].id == model_id) {
          modelItem = this.data.modelArr[i];
          this.data.modelActiveArr[i] = 'active';
        } else {
          this.data.modelActiveArr[i] = '';
        }
      }
      console.log(modelItem)
      this.setData({
        modelActiveArr: this.data.modelActiveArr,
        chooseModel: modelItem,
      })

      //this.getProductSaleInfo(model_id);    //获取产品【销售】信息
    }
  },
  //更改产品数量
  changeProductCount: function (e) {
    var dataSet = e.currentTarget.dataset;
    var method = dataSet.param;

    var count = this.data.buyCount; //当前购买数量
    var productInfo = this.data.productInfo;
    var chooseModel = this.data.chooseModel;

    if (method == '-1') {   //减少
      if (count > 1) {
        count--;
      }
    } else if (method == '1') {  //增加
      if (chooseModel.lib_num > 0) {  //有库存
          if (Number(productInfo.buyNum) < chooseModel.buy_num) {  //没有超出限购量
            if (count < chooseModel.lib_num) {
              if (count < (chooseModel.buy_num - Number(productInfo.buyNum))) {
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
      
    }

    this.setData({
      buyCount: count
    })
  },
  //拨打客服
  phoneServer: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.types;

    if (types == '1') {  //无导购
      var phones = thisPage.data.servicePhone;
    } else if (types == '2') {  //有导购
      var phones = thisPage.data.sellerPhone2;
    }
    console.log(phones);
    wx.makePhoneCall({
      phoneNumber: phones
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
      url: app.globalData.domainName + '/app/limitBuyProductdetails',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        limit_buy_time: thisPage.data.limit_buy_time,
        customerId: app.globalData.customerInfo.id,
        limit_buy_id: thisPage.data.limitId,
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

          var payState = app.globalData.customerInfo.payState;
          
          var payStatusInfo = app.globalData.payStatusInfo;
          var productPayStatus = returnData.result.info;
          
          if (payState == 1 && payStatusInfo.isOpen == 1 && payStatusInfo.pay_status == 1 && productPayStatus.isOpen == 1 && productPayStatus.pay_status == 1) {
            var isCanBuy = true;
          } else {
            var isCanBuy = false;
          }
          var start_time = returnData.result.info.start_time;
          var end_time = returnData.result.info.end_time;
          var now = new Date().getTime();
          if (start_time >now){
            returnData.result.info.limit_time_type = 1
            thisPage.setTime(start_time)
          } else if (start_time <= now && end_time >= now){
            returnData.result.info.limit_time_type = 2
            thisPage.setTime(end_time)
          }

          thisPage.setData({
            productInfo: returnData.result,
            //isHot: returnData.result.info.hot_price ? 1 : 2,
            isCanBuy: isCanBuy,
            sellerPhone: returnData.result.sellerPhone.length <= 0 ? false : true,
            sellerPhone2: returnData.result.sellerPhone,
            weixin: returnData.result.weixinhao ? returnData.result.weixinhao : '暂无',
            wait: true,
            payState: payState,
            payStatusInfo: payStatusInfo,//店铺价格显示不显示
            productPayStatus: productPayStatus
          })
          WxParse.wxParse('contentDetails', 'html', returnData.result.info.description, thisPage, 5);
        } else {  //失败
          console.log("接口异常！");
        }
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：');
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
            codeImage: returnData.result.replace("http", "https"),
            wait: true
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
  //获取产品【颜色】数组信息
  getProductColorArr: function () {
    var thisPage = this;
    console.log('获取产品【颜色】数组信息id' + thisPage.data.productId);
    wx.request({
      url: app.globalData.domainName + '/app/queryLimitBuyProperties',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        limit_buy_time: thisPage.data.limit_buy_time,
        limit_buy_id: thisPage.data.limitId,
        shop_id: app.globalData.shopInfo.sys_user_id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.log('获取产品【颜色】数组信息' + JSON.stringify(returnData));
        if (returnData.code == 0) { //成功
          var colorArr1 = returnData.result;
          var colorArr=[];
          for (var i = 0; i < colorArr1.length; i++){
            colorArr.push(colorArr1[i].color_model);
          }
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
      url: app.globalData.domainName + '/app/getLimitBuyselectpropertiesbycolor',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        limit_buy_time: thisPage.data.limit_buy_time,
        limit_buy_id: thisPage.data.limitId,
        type: thisPage.data.limit_type,
        color_model: color,
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
        console.log('returnData' + JSON.stringify(returnData));
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

    if (!app.globalData.customerInfo.phone) {
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    if (!thisPage.data.chooseColor) {
      thisPage.choseProperty();
      return;
    }

    var param = ('source=product_5'
      + '&standardId=' + thisPage.data.chooseModel.id
      + '&buyCount=' + thisPage.data.buyCount
      + '&limit_buy_id=' + thisPage.data.limitId
      + '&type=' + thisPage.data.limit_type
      + '&productId=' + thisPage.data.productId
      + '&sellId=' + thisPage.data.chooseModel.sellId
      + '&limit_buy_time=' + thisPage.data.limit_buy_time)
      ;
    app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1);
  },
  //立即预订
  bookingNow: function () {
    var thisPage = this;
    var param ={
      customerId: app.globalData.customerInfo.id,
      num: thisPage.data.buyCount,
      shopId: app.globalData.shopInfo.sys_user_id,
      productId: thisPage.data.productId,
      limitbuyId: thisPage.data.limitId,
      limitbuytime: thisPage.data.limit_buy_time,
      limitbuytype: thisPage.data.limit_type,
      standardId: thisPage.data.chooseModel.id,
      sellId: thisPage.data.chooseModel.sellId
    }
    wx.request({
      url: app.globalData.domainName + '/app/addLimitBuyPreOrder',  //接口地址
      data: param,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          app.showSuccessMessage("预订成功");
        }else{
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
  //设置时间
  setTime: function (e) {
    var dataSet = e.currentTarget.dataset;
    var key = dataSet.param;
    var value = e.detail.value;

    var obj = {};
    obj[key] = value;
    this.setData(obj);
  },

  
 
  //复制
  copy: function () {
    var thisPage = this;
    if (thisPage.data.weixin !== '暂无') {
      wx.setClipboardData({
        data: thisPage.data.weixin,  //微信
        success: function (res) {
          app.showSuccessMessage('复制成功！');
        },
        fail: function (res) {
          app.showWarnMessage('失败!稍候重试！');
        }
      })
    } else {
      app.showWarnMessage('暂无微信！');
    }


  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
  setTime: function (times, type) {
    var thisPage = this;
    var time = times;
    var now = new Date().getTime();
    var time1;
    if (now > time) {
      time1 = now - time;
    } else if (now < time) {
      time1 = time - now;
    }
    var interval = setInterval(function () {
      time1 = time1 - 1000;
      if (time1 < 0) {
        thisPage.clearTimeInterval();
      }
      var h = parseInt(time1 / (1000 * 60 * 60));
      var m1 = time1 - h * (1000 * 60 * 60);
      var m = parseInt(m1 / (1000 * 60));
      var s1 = m1 - m * 1000 * 60;
      var s = parseInt(s1 / 1000);
      var time2 = {};
      time2.h = h;
      time2.m = m;
      time2.s = s;
      thisPage.setData({
        time: time2
      })

    }, 1000)
    thisPage.setData({
      interval: interval
    })

  },
  clearTimeInterval: function () {
    var thisPage = this;
    var interval = thisPage.data.interval;
    clearInterval(interval)
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
  }
})
