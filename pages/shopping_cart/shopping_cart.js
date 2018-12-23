var app = getApp();   //获取应用实例

Page({
  data: {
    showShopInfo: null,   //展示的店铺信息
    productList: [],      //产品列表
    cardList: [],         //卡券列表

    operateState: 'show', //show:显示；edit:编辑
    couponHidden: true,   //优惠券信息（隐藏）

    allChoose: false,     //是否全选
    allPrice: '0.00',     //产品总价

    currentPage: 1,  //当前页码
    pageSize: 5,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页
  
  },

  //页面加载
  onLoad: function (options) {
    this.setData({
      showShopInfo: app.globalData.shopInfo
    });
  },

  //页面显示
  onShow: function () {
    this.getProductList(1);      //获取产品列表
    this.getShopCardList();      //获取店铺卡券列表
  
  },
  //页面隐藏
  onHide: function () {
    this.setData({
      allChoose: false,
      allPrice: '0.00'
    })
  },
  //下拉刷新
  onPullDownRefresh: function () {
    this.getProductList(1);      //获取产品列表
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getProductList(searchPage);    //获取产品列表
    }
  },

  //获取产品列表
  getProductList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCartListPage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
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
          var isSearchNextPage = true;
          if (dataList.length < thisPage.data.pageSize) {
            isSearchNextPage = false;
          }
          if (searchPage > 1) {   //非第一页
            dataList = thisPage.data.productList.concat(dataList);
          }

          thisPage.setData({
            productList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage    //是否查询下一页
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

        if (returnData.code == 0) { //成功
          thisPage.setData({
            cardList: returnData.result.data
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

    if (!app.globalData.customerInfo.name) {  //未注册
      app.pageSkip("/pages/user_validate/user_validate", 1);
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/addCustomerCoupons',  //接口地址
      data: {           //请求参数
        couponsId: couponId,
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
          for (var i = 0; i < thisPage.data.cardList.length; i++) {
            var cardItem = thisPage.data.cardList[i];
            if (cardItem.couponsId == couponId) {
              cardItem.isGet = 1;
            }
          }
          thisPage.setData({
            cardList: thisPage.data.cardList
          })
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

  //打开优惠券面板
  openCouponPannel: function () {
    this.setData({
      couponHidden: false
    });
  },
  //关闭优惠券面板
  closeCouponPannel: function () {
    this.setData({
      couponHidden: true
    });
  },
  //编辑产品
  editProduct: function () {
    this.setData({
      operateState: 'edit'
    });
  },
  //是否选中产品
  isChooseProduct: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var chooseType = dataSet.type;      //（1：单个；2：全选；）
    var cartId = dataSet.param;         //购物车Id
    var operate = dataSet.operate;      //（1：true；2:false；）

    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      if (chooseType==1){
        if (cartItem.id == cartId) {
          if (operate == '1') {
            cartItem.choose = true;
          } else {
            cartItem.choose = false;
          }
        }
      }else{
        if (thisPage.data.allChoose){
          cartItem.choose = false;
        }else{
          cartItem.choose = true;
        }
      }
    }

    thisPage.setData({
      allChoose: chooseType == 1 ? thisPage.data.allChoose : !thisPage.data.allChoose,
      productList: thisPage.data.productList
    })
    thisPage.getChooseProductTotalPrice();
  },
  //获取选中产品的总价
  getChooseProductTotalPrice: function () {
    var thisPage = this;
    var newAllPrice = 0.00;
    
    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      if (cartItem.choose) {
        newAllPrice += (cartItem.number * cartItem.price);
      }
    }

    thisPage.setData({
      allPrice: newAllPrice.toFixed(2)
    })
  },
  //当前产品数量更改
  thisProductNumberChange: function (e) {
    var thisPage = this;
    var dataSet = e.currentTarget.dataset;
    var cartId = dataSet.param;
    var value = dataSet.value;

    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      var buyCount = cartItem.number;
      if (cartItem.id == cartId) {
        if (value == '1') { //增加
          if (buyCount < cartItem.stock) {
            cartItem.number = buyCount + 1;
          }
        } else if (value == '-1') { //减少
          if (buyCount>1){
            cartItem.number = buyCount - 1;
          }
        }
      }
    }

    thisPage.setData({
      productList: thisPage.data.productList
    })
  },
  //更新产品数量
  updateProductCount: function () {
    var thisPage = this;
    var postParam = [];

    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      postParam.push({
        id: cartItem.id,
        number: cartItem.number
      });
    }

    if (postParam.length==0){
      thisPage.setData({
        operateState: 'show'
      });
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/updateCart',  //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            operateState: 'show'
          });
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
  //删除产品
  deleteProduct: function () {
    var thisPage = this;
    var postParam = [];
    var indexList = [];

    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      if (cartItem.choose) {
        postParam.push({
          id: cartItem.id
        });
        indexList.push(i);
      }
    }

    if (postParam.length == 0) {
      app.showWarnMessage("请选择产品");
      return;
    }

    wx.request({
      url: app.globalData.domainName + '/app/deleteCart',  //接口地址
      data: postParam,
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          for (var j = indexList.length-1; j >= 0; j--) {
            thisPage.data.productList.splice(indexList[j],1);
          }
          thisPage.setData({
            productList: thisPage.data.productList
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
  //结算
  payMoney: function () {
    var thisPage = this;
    var cartIdList = [];

    for (var i = 0; i < thisPage.data.productList.length; i++) {
      var cartItem = thisPage.data.productList[i];
      if (cartItem.choose) {
        cartIdList.push(cartItem.id);
      }
    }

    if (cartIdList.length == 0) {
      app.showWarnMessage("请选择产品");
      return;
    }

    var param = 'source=cart&cartIdList=' + cartIdList;
    app.pageSkip("/pages/order/order_confirm/order_confirm?" + param, 1); 
  },

})