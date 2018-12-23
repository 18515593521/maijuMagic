// pages/group/part_in_group/part_in_group.js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customer_group_buying_id: null,  //消费者创建拼团ID
    customer_info_id:null,//消费者参与拼团id
    groupBuyingId: null,   //商户创建的id
    groupData: null, // 拼团的信息
    productId: null, // 产品id

    propertyPannelHidden: true, //属相面板（隐藏）
    colorArr: null,         //颜色数组
    colorActiveArr: [],     //颜色数组样式
    modelArr: null,         //规格数组
    modelActiveArr: [],     //规格数组样式

    propertyPannelHidden: true, //属相面板（隐藏）
    colorArr: null,         //颜色数组
    colorActiveArr: [],     //颜色数组样式
    modelArr: null,         //规格数组
    modelActiveArr: [],     //规格数组样式
    saleInfo: null,         //销售信息

    chooseColor: null,    //选择的颜色
    chooseModel: null,    //选择的规格
    buyCount: 1,          //购买数量

    productInfo: null,  //产品信息
    isCanBuy: false,      //是否可以购买
    groupBuyingInfo: null,  //拼团 信息
    isHot: 2,     //是否爆款（1：是；2：不是）
    shopInfo: null,  //店铺信息
    gapNum: 0,  //差几个人
    status: null,  //是那个状态  0是 要参团 1成功  2拼团中  3拼团失败  4人数够了但是有人未付款
    residueNum: null,    //剩余人数
    isAuthorizePhone: false,   //获取电话号码
    payState:1,   //是否支付了
    isCreator:1,  //是不是发起人
    groupType:1,  //拼团类型  1是 线上  2是线下
    showShopInfo:null  //当前店铺信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;
    var titles = '';
    console.log(JSON.stringify(options)+'参数产品');
    thisPage.setData({
      customer_group_buying_id: options.id,
      customer_info_id: options.customer_info_id,
      groupBuyingId: options.groupBuyingId,
      productId: options.productId,
      shopInfo: app.globalData.shopInfo.imgurl,
      status: options.status,
      isAuthorizePhone: app.globalData.customerInfo.phone ? true : false,
      payState: options.payState,
      isCreator: options.isCreator,
      groupType: options.types ,
      showShopInfo:app.globalData.shopInfo
    })

    if (thisPage.data.status == 2 && thisPage.data.payState==2){
      titles='待支付';
    } else if (thisPage.data.status == 1 && thisPage.data.payState == 2){
      titles = '分享好友参与';
    } else{
      titles = '参与拼团';
    }

    wx.setNavigationBarTitle({
      title: titles
    })
    thisPage.getgroupList();     //获取拼团详情
    thisPage.getProductDetails();  //获取产品详情
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //获取产品详情
  getProductDetails: function () {
    var thisPage = this;
    console.log('产品id' + thisPage.data.productId);
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
          thisPage.setData({
            productInfo: returnData.result,
            groupBuyingInfo: returnData.result.groupBuyingInfo,
            isHot: returnData.result.info.hot_price ? 1 : 2,
            isCanBuy: (app.globalData.customerInfo.payState == 1 && returnData.result.info.pay_status == 1) ? true : false
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
        wx.stopPullDownRefresh();
      }
    })
  },
  //获取拼团详情
  getgroupList: function (e) {
    var thisPage = this;
    if (thisPage.data.groupType=='1'){  //线上拼团
      var urls = 'selectCustomerGroupBuyingDetail';
    } else if (thisPage.data.groupType == '2') {  //线下拼团
      var urls = 'selectOfflineGroupBuyingDetail';
    }
    wx.request({
      url: app.globalData.domainName + '/app/' + urls,  //接口地址
      data: {           //请求参数
        customerId: app.globalData.customerInfo.id,
        customer_group_buying_id: thisPage.data.customer_group_buying_id
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
            groupData: returnData.result,
            residueNum: parseInt(returnData.result.success_num) - parseInt(returnData.result.joinNum),
            gapNum: parseInt(returnData.result.success_num) - parseInt(returnData.result.joinNum)
          })

        } else {  //失败
          app.showSuccessMessage("失败！");
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

  //关闭属性面板
  closeProperty: function (e) {
    this.setData({
      propertyPannelHidden: true
    })
  },
  //我也要参与拼团
  goToGroup: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var types = dataSet.type;
    var isJoin = dataSet.isJoin;
    if (types == 1) {   //参与拼团
      if (isJoin == 1) {
        app.showWarnMessage('您已参与该拼团！');
        return;
      } else {
        thisPage.choseProperty();
      }

    } else if (types == 2) {  //查看更多拼团
      var urls = '/pages/group/group_list/group_list';
      app.pageSkip(urls, 1);
    } else if (types == 3) {  //查看订单
      var urls = '/pages/person_center/my_order/my_order';
      app.pageSkip(urls, 1);
    }

  },
  //选择属性
  choseProperty: function (e) {
    var thisPage = this
    thisPage.setData({
      propertyPannelHidden: false,
      buyCount: 1
    });

    thisPage.getProductColorArr();    //获取产品颜色数组信息
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
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  //我也要参团
  goGrounp: function (e) {
    var thisPage = this;
    var current = e.currentTarget.dataset;
    var isHot = current.ishot;
   
    if (thisPage.data.groupType=='1'){ //线上
      var param = ('source=product_' + isHot
        + '&standardId=' + thisPage.data.chooseModel.id
        + '&buyCount=' + thisPage.data.buyCount + "&customerGroupBuyingId=" + thisPage.data.customer_group_buying_id + "&groupBuyingId=" + thisPage.data.groupBuyingId + '&sort=2' + '&productId=' + thisPage.data.productId);
      app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1);
    }else{

      wx.request({
        url: app.globalData.domainName + '/app/addOfflineGroupBuying1',  //接口地址
        method: 'POST',
        dataType: 'json',
        data: {           //请求参数
          customerId: app.globalData.customerInfo.id,
          shopId: app.globalData.shopInfo.sys_user_id,
          customerGroupBuyingId: thisPage.data.customer_group_buying_id,
          num:thisPage.data.buyCount,
          productId: thisPage.data.chooseModel.id,
          groupBuyingId: thisPage.data.groupBuyingId
        },
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {  //成功
          console.log('res的值不知道' + JSON.stringify(res.data));
          if (res.data.code=='0'){
            app.showSuccessMessage('成功！');
          } else if (res.data.code == '2') {  //  2拼团已经结束
            app.showWarnMessage("拼团已经结束");
          } else if (res.data.code == '3') {  //	3每人限购2件
            app.showWarnMessage("每人限购2件");
          } else if (res.data.code == '4') {  // 4库存不足
            app.showWarnMessage("库存不足");
          } else if (res.data.code == '5') {  // 5您已经参与该拼团
            app.showWarnMessage("您已经参与该拼团");
          }else{
            app.showWarnMessage(res.data.message);
          }
          setTimeout(function () {
            app.pageSkip('/pages/group/my_group/my_group', 2);
          }, 2000);
        },
        fail: function (res) {     //失败
          console.log('请求失败：', res.errMsg);
        },
        complete: function (res) { //完成
          console.log('请求完成：', res.errMsg);
        }
      })
    }
   

  },
  //支付
  aginPayTo: function (e) {
    var thisPage = this;
    var current = e.currentTarget.dataset;
    var id = thisPage.data.customer_info_id;
    var formId = e.detail.formId;     //表单Id
    if (formId) {
      thisPage.addFormInfo(formId);   //添加form信息
    }
    wx.request({
      url: app.globalData.domainName + '/app/againPay ',  //接口地址
      method: 'POST',
      dataType: 'json',
      data: {           //请求参数
        customerId: app.globalData.customerInfo.id,
        shopId: app.globalData.shopInfo.sys_user_id,
        customerGroupBuyingInfoId: id,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        var payParam = returnData.result;
        if (payParam.timeStamp) {
          thisPage.weChatPay(payParam);   //微信支付
        } else {  //多次支付（进度款）
          app.globalData.payOrderInfo.id = payParam.orderId;
          app.pageBack(5);
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
        thisPage.changeOrderState(payParam.customerGroupBuyingInfoId);
      },
      'fail': function (res) {
        console.log("微信支付取消/失败！", res);
        if (res == 'requestPayment:fail cancel') {  //失败
          app.showWarnMessage("支付取消");
        } else {
          app.showWarnMessage("支付失败");
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

    wx.request({
      url: app.globalData.domainName + '/app/paySuccess',  //接口地址
      data: {
        id: orderId,
        isCreator: thisPage.data.isCreator
      },  //请求参数

      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;
        //跳转到我的拼团订单
        var groupList = '/pages/group/my_group/my_group?listType=' + thisPage.data.groupType;
        app.pageSkip(groupList, 2);
      },
      fail: function (res) {     //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function (res) { //完成
        console.log('请求完成：', res.errMsg);
        app.globalData.payOrderInfo.id = orderId;
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
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },
  //页面分享
  onShareAppMessage: function () {
    var thisPage = this;  
    console.log(thisPage.data.groupBuyingId +'groupBuyingId');
    console.log(thisPage.data.productId + 'productId');
    console.log(thisPage.data.groupBuyingId + 'customerGroupBuyingId');

    var param = "P1=L&groupBuyingId=" + thisPage.data.groupBuyingId + '&productId=' + thisPage.data.productId + '&P4=' + app.globalData.customerInfo.id + '&customerGroupBuyingId=' + thisPage.data.customer_group_buying_id + '&types=' + thisPage.data.groupType;
    console.log('/images / bgm.jpg转发的图片！');
    return {
      title: '拼团',
      path: "/pages/index/index?" + param,
      success: function (res) {
        app.addPageSharePoint("全景图");
      }
    };
  },
  //授权手机号
  authorizePhone: function (e) {
    app.authorizePhone(e);
  },
})