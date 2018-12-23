var app = getApp();   //获取应用实例
var WxParse = require('../../../plugs/wxParse/wxParse.js');
var Common = require("../../../utils/common.js");


Page({
  data: {
    isShowPrice: null,    //是否显示价格
    isCanBuy: false,      //是否可以购买
    productInfoPrice: null,   //更改规格后更改产品价格
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

     othersColor:null, //颜色
     otherPrice: null,  //价格
     otherStock: null, //属性
     otherPhone:null,  //电话
     acreImgBorde:[],  //样式数组
      acreIndex:0,  //样式第几个
      screImg22:[]  //请选择的样式  
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
      console.log(options.hotProductVersion + ' options.hotProductVersion');
      thisPage.setData({
        isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
        productId: options.productId,
        hotProductVersion: options.hotProductVersion,
        isShowPrice: app.globalData.shopInfo.isOpen,
        otherPhone: app.globalData.shopInfo.phone_num
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
    var param = "P1=otherDetail&P4=" + app.globalData.customerInfo.id + "&productId=" + thisPage.data.productId;

    return {
      title: productTitle,
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint(productTitle);
      }
    };
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
 
  //拨打电话
  phoneServer: function (e) {
    wx.makePhoneCall({
      phoneNumber: app.globalData.shopInfo.phone_num
    })
  },

 

  //获取产品详情
  getProductDetails: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/productMemberdetails',  //接口地址
      data: {           //请求参数
        productId: thisPage.data.productId,
        customerId: app.globalData.customerInfo.id,
        hot_version: thisPage.data.hotProductVersion,
        vip_level: app.globalData.customerInfo.vipInfo.vip_level
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
            productInfoPrice: returnData.result.info.min_price,
            isHot: returnData.result.info.hot_price ? 1 : 2,
            isCanBuy: isCanBuy,
            sellerPhone: returnData.result.sellerPhone.length <= 0 ? false : true,
            sellerPhone2: returnData.result.sellerPhone,
            weixin: returnData.result.weixinhao ? returnData.result.weixinhao : '暂无',
            wait: true,
            payState: payState,
            payStatusInfo: payStatusInfo,//店铺价格显示不显示
            productPayStatus: productPayStatus
          })
          thisPage.choseProductArr2();  //属性的选择
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
 
  
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
//点击切换属性
  choseProductArr:function(e){
    var thisPage = this;
   
   var acreImgBorde = [];
   if (e) {
     var current = e.currentTarget.dataset;
     var color = current.color;  //颜色
     var price = current.price;  //价格
     var stock = current.stock;  //属性
     var indexs = current.index; 
   }else{
     var color ="";  //颜色
     var price = thisPage.data.productInfo.attr[0].price;  //价格
     var stock = "";  //属性
     var indexs =thisPage.data.acreIndex; 
   }
   for (var m = 0; m < thisPage.data.productInfo.attr.length;m++){
     if (m == indexs){
       acreImgBorde.push("acreImgBorde");
     }else{
       acreImgBorde.push("");
     }
     
   }
   var productInfoImages = thisPage.data.productInfo.attr;
    thisPage.setData({
      othersColor: color, //颜色
      otherPrice: price,  //价格
      otherStock: stock, //属性
      acreImgBorde:acreImgBorde,
      screImg22:[''],
      currentIndex: indexs,
      productInfoImages: productInfoImages
    })

  },
//点击请选择
  choseProductArr2: function(){
    var thisPage = this;
    var screImg2 = [];
    screImg2.push('screImg2');
    var productInfoImages  = [];
    for (var m = 0; m < thisPage.data.productInfo.img.length;m++){
      var objs = {};
      objs.color_url = thisPage.data.productInfo.img[m].imgurl;
      productInfoImages.push(objs);
    }
    var color = "";  //颜色
    var price = thisPage.data.productInfo.attr[0].price;  //价格
    var stock = "";  //属性
    var indexs = thisPage.data.acreIndex; 
    thisPage.setData({
      screImg22: screImg2,
      productInfoImages: productInfoImages,
      currentIndex:0,
      acreImgBorde:[],
      othersColor: color, //颜色
      otherPrice: price,  //价格
      otherStock: stock, //属性
    })
  }

})
