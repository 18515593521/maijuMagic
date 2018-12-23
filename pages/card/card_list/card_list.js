//页面js
var app = getApp();   //获取应用实例

Page({
  data: {
    menuClassArr: ['active', '', '', ''], //菜单选中样式
    choosCardType: "",       //卡券类型(1:红包;2:优惠券;3:折扣券;)
    cardList: [],       //卡列表券

    currentPage: 1,  //当前页码
    pageSize: 5,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页

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
  },

  //页面加载
  onLoad: function () {

  },
  //页面显示
  onShow: function () {
    this.getShopCardList(1);       //获取店铺卡券列表
  },
  //到达底部
  onReachBottom: function (e) {
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.getShopCardList(searchPage);    //获取店铺卡券列表
    }
  },


  //卡券类型选择
  chooseCardType: function (e) {
    var dataSet = e.currentTarget.dataset;
    var cardType = dataSet.param;

    for (var i = 0; i < this.data.menuClassArr.length; i++) {
      if (i == cardType) {
        this.data.menuClassArr[i] = 'active';
      } else {
        this.data.menuClassArr[i] = '';
      }
    }

    this.setData({
      menuClassArr: this.data.menuClassArr
    })

    if (cardType == 0) {  //全部
      this.setData({
        choosCardType: ""
      })
    } else {
      this.setData({
        choosCardType: cardType
      })
    }

    this.getShopCardList(1);       //获取店铺卡券列表
  },

  //获取店铺卡券列表
  getShopCardList: function (searchPage) {
    var thisPage = this;

    wx.request({
      url: app.globalData.domainName + '/app/selectCouponsPage',  //接口地址
      data: {           //请求参数
        page: searchPage,
        pageSize: thisPage.data.pageSize,
        param: {
          customerId: app.globalData.customerInfo.id,
          shopId: app.globalData.shopInfo.sys_user_id,
          card_tpye: thisPage.data.choosCardType,   //(1:优惠券;2:红包;3:折扣券;)
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
            dataList = thisPage.data.cardList.concat(dataList);
          }

          thisPage.setData({
            cardList: dataList,
            currentPage: returnData.result.page,  //当前页码
            total: returnData.result.total,       //总页数
            isSearchNextPage: isSearchNextPage    //是否查询下一页
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
  //页面跳转
  pageSkip: function (e) {
    var dataSet = e.currentTarget.dataset;
    var skipUrl = dataSet.url;
    var skipType = dataSet.type;

    app.pageSkip(skipUrl, skipType);
  },


})
