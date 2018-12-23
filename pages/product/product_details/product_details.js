var app = getApp();   //获取应用实例
var WxParse = require('../../../plugs/wxParse/wxParse.js');
var Common = require("../../../utils/common.js");


Page({
  data: {
    isShowPrice: null,    //是否显示价格
    isCanBuy: false,      //是否可以购买
    productInfoPrice:null,   //更改规格后更改产品价格
    productId: null,    //产品Id
    productInfo: null,  //产品信息
    contentDetails: null,     //图文详情
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
    productPayStatus: null,  //产品的支付
    appColor:null,  //颜色
    server:null,   //客服消息 （1是开通  2是没开通）
    reserveNum:null,  //区别是爆款价格还是原价格 大于0 就是原价
    videoIndex: 0,  //记录点击的是第几个视频
    videoPlay: true,  //播放视频的显示与隐层
    active:null  //颜色
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
        hotProductVersion: options.hotProductVersion ,
        servicePhone: app.globalData.shopInfo.phone_num,
        isShowPrice: app.globalData.shopInfo.isOpen
      });

      thisPage.getProductDetails();     //获取产品详情
      thisPage.getCodeImage();          //获取二维码图片

      thisPage.getShoppingCartProductList();    //获取购物车产品列表
    }, 1300)

  },
  //页面显示
  onShow: function () {
    var thisPage = this;
    thisPage.getCodeImage();          //获取二维码图片

    thisPage.getShoppingCartProductList();    //获取购物车产品列表
    this.setData({
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
      appColor: app.globalData.userInfoAll.appColor ? app.globalData.userInfoAll.appColor : '#4abcc2',
      server:app.globalData.customerInfo.server,
      active: app.globalData.userInfoAll.appColor
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getProductDetails();             //获取产品详情
    this.getCodeImage();                  //获取二维码图片
    this.getShoppingCartProductList();    //获取购物车产品列表
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    var productTitle = thisPage.data.productInfo.info.product_title;
    var param = "P1=C&P4=" + app.globalData.customerInfo.id + "&productId=" + thisPage.data.productId;

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

      this.setData({
        modelActiveArr: this.data.modelActiveArr,
        chooseModel: modelItem
      })

      this.getProductSaleInfo(model_id);    //获取产品【销售】信息
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
    var thisPage = this;
    if (!app.globalData.customerInfo.id) {  //未登录
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    var productId = thisPage.data.productId;

    if (thisPage.data.productInfo.collect_state == 1) {   //已收藏
      thisPage.cancelCollectThisProduct();    //取消收藏当前产品
    } else if (thisPage.data.productInfo.collect_state == 2) {
      thisPage.collectThisProduct();          //收藏当前产品 
    }
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

        if (returnData.code == 0) { //成功

          var payState = app.globalData.customerInfo.payState;
          var payStatusInfo = app.globalData.payStatusInfo;
          var productPayStatus = returnData.result.info;

          if (payState == 1 && payStatusInfo.isOpen == 1 && payStatusInfo.pay_status == 1 && productPayStatus.isOpen == 1 && productPayStatus.pay_status == 1) {
            var isCanBuy = true;
          } else {
            var isCanBuy = false;
          }

          thisPage.setData({
            productInfo: returnData.result,
            reserveNum: returnData.result.info.reserveNum,
            productInfoPrice: returnData.result.info.min_price,
           
            isCanBuy: isCanBuy,
            sellerPhone: returnData.result.sellerPhone.length <= 0 ? false : true,
            sellerPhone2: returnData.result.sellerPhone,
            weixin: returnData.result.weixinhao ? returnData.result.weixinhao : '暂无',
            wait: true,
            payState: payState,
            payStatusInfo: payStatusInfo,//店铺价格显示不显示
            productPayStatus: productPayStatus
          })
          if (returnData.result.info.hot_price){
            thisPage.setData({
              isHot:1,
            })
          }else{
            thisPage.setData({
              isHot: 2,
            })
          }
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
          shop_id: shopInfo.id,
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
    console.log('获取产品【颜色】数组信息id' + thisPage.data.productId);
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
        console.log('获取产品【颜色】数组信息' + JSON.stringify(returnData));
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
    console.log('获取产品【颜色】数组信息id' + thisPage.data.productId);
    console.log('获取产品【颜色】数组信息color' + color);
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
            saleInfo: returnData.result,  
            productInfoPrice: returnData.result.price
          })
          thisPage.data.productInfo.info.min_price = returnData.result.price;
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
   // var isHot = dataSet.param;
   
    if (thisPage.data.reserveNum == 0 &&thisPage.data.isHot=='1'){  //爆款产品
      var isHot ='1';
    }else{
      var isHot = '2';
    }
    if (!app.globalData.customerInfo.phone) {
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    if (!thisPage.data.chooseColor) {
      thisPage.choseProperty();
      return;
    }

    var param = ('source=product_' + isHot
      + '&standardId=' + thisPage.data.chooseModel.id
      + '&buyCount=' + thisPage.data.buyCount);
    app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1);
  },
  //立即预订
  bookingNow: function () {
    var thisPage = this;
    console.log(thisPage.data.chooseColor +'thisPage.data.chooseColor');
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

    // if (thisData.booking_startTime_1 == "请选择日期") {
    //   app.showWarnMessage("请设置开始日期");
    //   return;
    // }
    // if (thisData.booking_startTime_2 == "请选择时间") {
    //   app.showWarnMessage("请设置开始时间");
    //   return;
    // }
    // if (thisData.booking_endTime_1 == "请选择日期") {
    //   app.showWarnMessage("请设置结束日期");
    //   return;
    // }
    // if (thisData.booking_endTime_2 == "请选择时间") {
    //   app.showWarnMessage("请设置结束时间");
    //   return;
    // }
    //之前的需求是有时间的现在隐藏 thisData.booking_startTime_1 + " " + thisData.booking_startTime_2   thisData.booking_endTime_1 + " " + thisData.booking_endTime_2

    wx.request({
      url: app.globalData.domainName + '/app/addHotProductReserve',  //接口地址
      data: {           //请求参数
        product_id: thisData.productId,
        hot_version: thisPage.data.hotProductVersion,
        colorAndModel: thisData.chooseColor,
        standard: thisData.chooseModel.standard,
        reserve_num: thisData.buyCount,
        customer_id: app.globalData.customerInfo.id
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.log(JSON.stringify(res)+'立即预定~~');
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
