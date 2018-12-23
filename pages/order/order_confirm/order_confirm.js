//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    source: '',       //来源
    cartIdList: [],   //购物车Ids
    product_id:null,  //产品id
    standardId: null,   //规格Id
    buyCount: 1,        //购买数量

    showAddress: null,  //显示的地址
    addressId:null,  //显示的地址
    showShopInfo: null, //展示的店铺信息
    productList: [],    //产品信息
    cardInfo: null,     //卡券信息
    sellId:null,
    cardHidden: true,   //卡券信息（隐藏）
    showCardType: null, //展示的卡券类型  
    choosedCard: {
      1: null,
      2: null,
      3: null
    },
    groupBuyingId: null,  // 商户创建的拼团ID
    customerGroupBuyingId: null,  //消费者创建id,
    customerGroupBuyingInfoId:null,  //参与id
    limitbuyId: null,
    limitbuytime: null,
    limitbuytype: null,
    cardParam: {        //卡券标题
      1: { title: '红包使用', key: 'hb' },
      2: { title: '优惠券使用', key: 'yhq' },
      3: { title: '折扣券使用', key: 'zkq' },
    },
    isCreator: null,//是否是拼团发起人  1是  2不是
    payData: null,   //支付信息
    shareBg1: true,  //分享给好友
    shareBg2: true,  //即将成功
    shareBg3: true,  //成功
    totalPrice: 0.00,   //总价
    showPrice: 0.00,    //显示的价格
  },

  //页面加载
  onLoad: function (options) {
    var thisPage = this;
    if (options.source == 'cart') {   //购物车
      thisPage.setData({
        source: options.source,
        cartIdList: options.cartIdList.split(','),
        showShopInfo: app.globalData.shopInfo
      });
      thisPage.getOrderInfoFromCart();
    } else if (options.source == 'product_1' || options.source == 'product_2' || options.source == 'product_3' || options.source == 'product_5') {  //产品详情   product_3 是爆款  product_5 是限购产品
      thisPage.setData({
        source: options.source,
        standardId: options.standardId,
        buyCount: options.buyCount,
        showShopInfo: app.globalData.shopInfo
      });
      if (options.source == 'product_3') {   //拼团
        thisPage.setData({
          groupBuyingId: options.groupBuyingId,
          isCreator: options.sort,
          customerGroupBuyingId: options.customerGroupBuyingId,
          product_id:options.productId
        })
        thisPage.orderGroupList();
      } else if (options.source == 'product_5') {   //限购
        thisPage.setData({
          product_id: options.productId,
          limitbuyId: options.limit_buy_id,
          limitbuytime: options.limit_buy_time,
          limitbuytype: options.type,
          standardId: options.standardId,
          sellId: options.sellId
        })
        thisPage.getLimiyBuyOrderInfo();
      } else {
        thisPage.getOrderInfoFromProduct();
      }
    }
  },
  //页面显示
  onShow: function () {
    if (app.globalData.choosedOrderAddress) {
      this.setData({
        showAddress: app.globalData.choosedOrderAddress,
        addressId: app.globalData.choosedOrderAddress.id

      });
    }
  },

  //获取订单信息(购物车)
  getOrderInfoFromCart: function () {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/goSettleAccounts',  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        cartIds: thisPage.data.cartIdList
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
            showAddress: returnData.result.addressInfo,
            productList: returnData.result.productInfo,
            cardInfo: returnData.result.youHui,
            totalPrice: returnData.result.orderPrice.toFixed(2),
            showPrice: returnData.result.orderPrice.toFixed(2),
            addressId: returnData.result.addressInfo.id
          })
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
  //获取订单信息（拼团）
  orderGroupList: function () {
    var thisPage = this;
    wx.request({
      url: app.globalData.domainName + '/app/orderConfirm',  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        id: thisPage.data.standardId,
        num: thisPage.data.buyCount,
        groupBuyingId: thisPage.data.groupBuyingId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var youHui = {};
        if (returnData.result){
          if (returnData.result.yhq) {
            youHui.yhq = returnData.result.yhq;
          }
          if (returnData.result.hb) {
            youHui.hb = returnData.result.hb;
          }
          if (returnData.result.zkq) {
            youHui.zkq = returnData.result.zkq;
          }
        }
   

        if (returnData.code == 0) { //成功
          if (returnData.result.defaultAddress) {
            var defaultAddress = returnData.result.defaultAddress;
            var addressId = returnData.result.defaultAddress.addressId;
          } else {
            var defaultAddress = "";
            var addressId = "";
          }
          thisPage.setData({
            showAddress: defaultAddress ? defaultAddress : '',
            addressId: addressId ? addressId : '',
            productList: returnData.result.productInfo,
            cardInfo: youHui,
            totalPrice: returnData.result.productInfo.num * returnData.result.productInfo.group_price,
            showPrice: returnData.result.productInfo.num * returnData.result.productInfo.group_price

          })
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
  //获取限购订单信息(产品)
  getLimiyBuyOrderInfo: function () {
    var thisPage = this;

    var postUrl = '/app/goLimitBuySettleAccounts';

    wx.request({
      url: app.globalData.domainName + postUrl,  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        num: thisPage.data.buyCount,
        shopId: app.globalData.shopInfo.sys_user_id,
        productId: thisPage.data.product_id,
        limitbuyId: thisPage.data.limitbuyId,
        limitbuytime: thisPage.data.limitbuytime,
        limitbuytype: thisPage.data.limitbuytype,
        standardId: thisPage.data.standardId
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
            showAddress: returnData.result.addressInfo,
            addressId: returnData.result.addressInfo.id,
            productList: returnData.result.productInfo,
            cardInfo: returnData.result.youHui,
            totalPrice: returnData.result.orderPrice.toFixed(2),
            showPrice: returnData.result.orderPrice.toFixed(2)
          })
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
  //获取订单信息(产品)
  getOrderInfoFromProduct: function () {
    var thisPage = this;

    var postUrl = '';
    if (thisPage.data.source == 'product_1') {  // 是爆款
      postUrl = '/app/goHotSettleAccounts';
    } else if (thisPage.data.source == 'product_2') {  //普通产品
      postUrl = '/app/goOneSettleAccounts';
    }

    wx.request({
      url: app.globalData.domainName + postUrl,  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        id: thisPage.data.standardId,
        num: thisPage.data.buyCount
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
            showAddress: returnData.result.addressInfo,
            addressId: returnData.result.addressInfo.id,
            productList: returnData.result.productInfo,
            cardInfo: returnData.result.youHui,
            totalPrice: returnData.result.orderPrice.toFixed(2),
            showPrice: returnData.result.orderPrice.toFixed(2)
          })
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
  //选择地址
  chooseAddress: function (e) {
    app.pageSkip("/pages/person_center/address/address_list/address_list?isChoose=true", 1);
  },
  //选择卡券
  chooseCard: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var cardType = dataSet.param;

    thisPage.setData({
      cardHidden: false,
      showCardType: cardType
    })
  },
  //关闭卡券面板
  closeCardPannel: function () {
    this.setData({
      cardHidden: true
    });
  },
  //选择当前卡券
  chooseThisCard: function (e) {
    var thisPage = this;
    var showCardType = thisPage.data.showCardType;
    var totalPrice = Number(thisPage.data.totalPrice);

    var dataSet = e.currentTarget.dataset;
    var cardId = dataSet.param;
    var operate = dataSet.operate;

    var cardDataList_1 = thisPage.data.cardInfo.hb ? thisPage.data.cardInfo.hb : [];   //红包
    var cardDataList_2 = thisPage.data.cardInfo.yhq ? thisPage.data.cardInfo.yhq : [];  //优惠券
    var cardDataList_3 = thisPage.data.cardInfo.zkq ? thisPage.data.cardInfo.zkq : [];  //折扣券

    for (var i = 0; i < cardDataList_1.length; i++) {
      var cardItem = cardDataList_1[i];
      if (showCardType == 1) {
        if (cardItem.id == cardId) {
          if (operate == '1') { //选中
            if (totalPrice > cardItem.denomination) {
              cardItem.choose = true;
              thisPage.data.choosedCard[1] = cardItem;
              totalPrice -= cardItem.denomination;
            }
          } else {    //取消
            cardItem.choose = false;
            thisPage.data.choosedCard[1] = null;
          }
        } else {
          cardItem.choose = false;
        }
      } else {
        if (cardItem.choose) {
          totalPrice -= cardItem.denomination;
        }
      }
    }
    for (var j = 0; j < cardDataList_2.length; j++) {
      var cardItem = cardDataList_2[j];
      if (showCardType == 1) {
        cardItem.choose = false;
        thisPage.data.choosedCard[2] = null;
      } else if (showCardType == 2) {
        if (cardItem.id == cardId) {
          if (operate == '1') { //选中
            if (cardItem.use_condition <= totalPrice) {  //满足条件
              cardItem.choose = true;
              thisPage.data.choosedCard[2] = cardItem;
              totalPrice -= cardItem.denomination;
            } else {  //不满足条件
              app.showWarnMessage("不满足条件");
              return;
            }
          } else {    //取消
            cardItem.choose = false;
            thisPage.data.choosedCard[2] = null;
          }
        } else {
          cardItem.choose = false;
        }
      } else if (showCardType == 3) {
        if (cardItem.choose) {
          totalPrice -= cardItem.denomination;
        }
      }
    }
    for (var k = 0; k < cardDataList_3.length; k++) {
      var cardItem = cardDataList_3[k];
      if (showCardType == 1 || showCardType == 2) {
        cardItem.choose = false;
        thisPage.data.choosedCard[3] = null;
      } else if (showCardType == 3) {
        if (cardItem.id == cardId) {
          if (operate == '1') { //选中
            if (cardItem.use_condition <= totalPrice) {  //满足条件
              cardItem.choose = true;
              thisPage.data.choosedCard[3] = cardItem;
              totalPrice *= (cardItem.denomination / 10);
            } else {  //不满足条件
              app.showWarnMessage("不满足条件");
              return;
            }
          } else {    //取消
            cardItem.choose = false;
            thisPage.data.choosedCard[3] = null;
          }
        } else {
          cardItem.choose = false;
        }
      }
    }

    thisPage.setData({
      cardInfo: thisPage.data.cardInfo,
      choosedCard: thisPage.data.choosedCard,
      showPrice: totalPrice.toFixed(2)
    })
  },

  //立即支付
  payMoney: function (e) {
    var thisPage = this;
    var showAddress = thisPage.data.showAddress;    //地址信息
    var source = thisPage.data.source;              //来源
    var formId = e.detail.formId;     //表单Id
    console.info('表单Id:', formId);

    if (!showAddress) {
      app.showWarnMessage("请完善收货信息");
      return;
    }
  if (!thisPage.data.addressId){
    app.showWarnMessage("请完善收货信息");
    return;
    }
    if (formId) {
      thisPage.addFormInfo(formId);   //添加form信息
    }

    var postUrl = '';
    var postParam = {};
    if (source == 'cart') {
      postUrl = '/app/addCartOrder';
      postParam = {
        customerId: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id,
        addressId: thisPage.data.addressId,
        cartIds: thisPage.data.cartIdList,
        hbId: thisPage.data.choosedCard[1] ? thisPage.data.choosedCard[1].id : null,
        yhqId: thisPage.data.choosedCard[2] ? thisPage.data.choosedCard[2].id : null,
        zkqId: thisPage.data.choosedCard[3] ? thisPage.data.choosedCard[3].id : null
      };
    } else if (source == 'product_1') {
      postUrl = '/app/addHotProductOrder';
      postParam = {
        customerId: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id,
        addressId: thisPage.data.addressId,
        id: thisPage.data.standardId,
        num: thisPage.data.buyCount,
        hbId: thisPage.data.choosedCard[1] ? thisPage.data.choosedCard[1].id : null,
        yhqId: thisPage.data.choosedCard[2] ? thisPage.data.choosedCard[2].id : null,
        zkqId: thisPage.data.choosedCard[3] ? thisPage.data.choosedCard[3].id : null
      };
    } else if (source == 'product_2') {
      postUrl = '/app/addOneProductOrder';
      postParam = {
        customerId: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id,
        addressId: thisPage.data.addressId,
        id: thisPage.data.standardId,
        num: thisPage.data.buyCount
      };
    } else if (source == 'product_3') {

      postParam = {
        customerId: app.globalData.customerInfo.id,
        num: thisPage.data.buyCount,
        addressId: thisPage.data.addressId,
        shopId: app.globalData.shopInfo.sys_user_id,
        hbId: thisPage.data.choosedCard[1] ? thisPage.data.choosedCard[1].id : null,
        yhqId: thisPage.data.choosedCard[2] ? thisPage.data.choosedCard[2].id : null,
        zkqId: thisPage.data.choosedCard[3] ? thisPage.data.choosedCard[3].id : null,
        productId: thisPage.data.standardId
      };
      if (thisPage.data.isCreator == 1) { //创建拼团
        postUrl = '/app/addGroupBuyingOrder';
        postParam.groupBuyingId = thisPage.data.groupBuyingId;

      } else if (thisPage.data.isCreator == 2) { //参与拼团
        postUrl = '/app/addGroupBuyingOrder1';
        postParam.groupBuyingId = thisPage.data.groupBuyingId;
        postParam.customerGroupBuyingId = thisPage.data.customerGroupBuyingId;

      }
    } else if (source == 'product_5') {

      postParam = {
        customerId: app.globalData.customerInfo.id,
        num: parseInt(thisPage.data.buyCount),
        addressId: parseInt(thisPage.data.addressId),
        shopId:  parseInt(app.globalData.shopInfo.sys_user_id),
        productId:  parseInt(thisPage.data.product_id),
        limitbuyId:  parseInt(thisPage.data.limitbuyId),
        limitbuytime:  parseInt(thisPage.data.limitbuytime),
        limitbuytype:  parseInt(thisPage.data.limitbuytype),
        standardId:  parseInt(thisPage.data.standardId),
        sellId: parseInt(thisPage.data.sellId)
      };
      postUrl = '/app/addLimitBuyProductOrder';
    }

    wx.request({
      url: app.globalData.domainName + postUrl,  //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          var payParam = returnData.result;
          //如果是自己創建
          if (thisPage.data.isCreator == 1){
              thisPage.setData({
                customerGroupBuyingId: payParam.customerGroupBuyingInfoId
              })
          }
          if (payParam.timeStamp) {
            thisPage.weChatPay(payParam);   //微信支付
            
          } else {  //多次支付（进度款）
            app.globalData.payOrderInfo.id = payParam.orderId;
            app.pageBack(5);
          }
        } else {
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
  //微信支付
  weChatPay: function (payParam) {
    var thisPage = this;

    wx.requestPayment({
      'timeStamp': payParam.timeStamp,
      'nonceStr': payParam.nonceStr,
      'package': payParam.repay_id,
      'signType': 'MD5',
      'paySign': payParam.paySign,
      'success': function (res) {
        console.log("微信支付成功！");
        if (thisPage.data.source == 'product_3') {
          thisPage.changeOrderState(payParam.customerGroupBuyingInfoId);

        } else {
          thisPage.changeOrderState(payParam.orderId);
        }
      },
      'fail': function (res) {
        console.log("微信支付取消/失败！", res);
        if (res == 'requestPayment:fail cancel') {  //失败
          app.showWarnMessage("支付取消");
        } else {
          app.showWarnMessage("支付失败");
        }
        //跳转到我的拼团订单
        if (thisPage.data.source == 'product_3') {
          var groupList = '/pages/group/my_group/my_group';
          app.pageSkip(groupList, 2);
        }else{
          var groupList = '/pages/person_center/my_order/my_order'
          app.pageSkip(groupList, 2); 
        }
      },
      'complete': function (res) {
        console.log('微信支付结束：', res);
      }
    })
  },
  //修改订单状态
  changeOrderState: function (orderId) {
    var thisPage = this;

    if (thisPage.data.source == 'product_3') {
      var paySuccess = 'paySuccess';  //拼团
      var payParm = {
        id: orderId,
        isCreator: thisPage.data.isCreator
      };
    } else {
      var paySuccess = 'payIsSuccess';
      var payParm = {
        orderId: orderId,
        commissionStatus: app.globalData.is_horizontal_alliances ? 1 : 2,
        node3: app.globalData.customerInfo.factoryId
      };
    }
    wx.request({
      url: app.globalData.domainName + '/app/' + paySuccess,  //接口地址
      data: payParm,  //请求参数

      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        if (thisPage.data.source == 'product_3') {
          if (returnData.result.isSuccess == 1) {  //成团
            var shareBg = 'shareBg3';
          } else if (returnData.result.isSuccess == 2) {  //拼团中
            var shareBg = 'shareBg1';
          } else if (returnData.result.isSuccess == 3) {  //满员但是有人未付款
            var shareBg = 'shareBg2';
          }
          thisPage.setData({
            payData: returnData.result,
            [shareBg]: false,
            customerGroupBuyingId: returnData.result.customer_group_buying_id
          })
          //跳转到我的拼团订单
          if (thisPage.data.source !== 'product_3') {
            var groupList = '/pages/person_center/my_order/my_order'
            app.pageSkip(groupList, 2);
          } 
        }else{
          var groupList = '/pages/person_center/my_order/my_order'
          app.pageSkip(groupList, 2);
        }
        console.info("【修改订单状态】", returnData);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
        var groupList = '/pages/person_center/my_order/my_order'
        app.pageSkip(groupList, 2);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        // app.globalData.payOrderInfo.id = orderId;
        // app.pageBack(5);
      }
    })
  },
  //添加form信息
  addFormInfo: function (formId) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/addFormId',  //接口地址
      data: {   //请求参数
        customerId: app.globalData.customerInfo.id,
        formId: formId
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        console.info("【添加form信息】", returnData);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },
  //关闭分享
  closeShare: function (e) {
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.types;
    if (types==1){
      this.setData({
        shareBg: true
      })
      var groupList = '/pages/group/my_group/my_group';
    }else{
      var groupList = '/pages/group/group_list/group_list';
    }

    //跳转到我的拼团订单
    app.pageSkip(groupList, 2);
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;
    if (thisPage.data.source == 'product_3') {
      var title = '分享给你一个拼团';
    }else{
      var title = '分享给你一个好的产品';
    }

    var param = "P1=L&groupBuyingId=" + thisPage.data.groupBuyingId + '&productId=' + thisPage.data.product_id + '&P4=' + app.globalData.customerInfo.id + '&customerGroupBuyingId=' + thisPage.data.customerGroupBuyingId ;
    console.log('/images / bgm.jpg转发的图片！');
    return {
      title: title,
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint("全景图");
      }
    };
  },
})