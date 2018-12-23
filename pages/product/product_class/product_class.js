//页面js
var app = getApp(); //获取应用实例

Page({
  data: {
    productClassList: null, //产品分类列表
    types: null, //是不是新类型  new  old 
    active:null   //选中颜色
  },
  //页面加载
  onLoad: function(options) {
    var thisPage = this;
    var type = options.type;
    thisPage.setData({
      types: type,
      active: app.globalData.userInfoAll.appColor
    })
    this.getProductClass(); //获取产品分类
  },

  //选择系列
  chooseSeries: function(e) {
    var thisPage = this;

    var dataSet = e.currentTarget.dataset;
    var classIndex = dataSet.classindex;
    var seriesIndex = dataSet.seriesindex;

    var productClassList = thisPage.data.productClassList;
    for (var i = 0; i < productClassList[classIndex].brandSeries.length; i++) {
      var seriesObj = productClassList[classIndex].brandSeries[i];
      if (i == seriesIndex) {
        if (seriesObj.choose == "active") {
          seriesObj.choose = "";
        } else {
          seriesObj.choose = "active";
        }
      } else {
        seriesObj.choose = "";
      }
    }

    thisPage.setData({
      productClassList: productClassList
    })
  },
  //页面跳转
  productList: function(e) {
    var dataSet = e.currentTarget.dataset;
    var skipType = dataSet.type;
    if (this.data.types == 'old') {
      var skipUrl = "/pages/product/product_list/product_list";
    } else {
      var skipUrl = "/pages/product/otherproduct_list/product_list";
    }

    if (skipType == 2) {
      var productClassList = this.data.productClassList;
      var seriesIdList = [];

      for (var i = 0; i < productClassList.length; i++) {
        var seriesList = productClassList[i].brandSeries;
        for (var j = 0; j < seriesList.length; j++) {
          var seriesObj = seriesList[j];
          if (seriesObj.choose == "active") {
            seriesIdList.push(seriesObj.id);
          }
        }
      }
      if (seriesIdList.length > 0) {
        if (this.data.types == 'old') {
          skipUrl = '/pages/product/product_list/product_list?seriesIdList=' + JSON.stringify(seriesIdList);
        } else {
          skipUrl = '/pages/product/otherproduct_list/product_list?seriesIdList=' + JSON.stringify(seriesIdList);
        }
      }

    }

    app.pageSkip(skipUrl, 2);
  },

  //获取产品分类
  getProductClass: function() {
    var thisPage = this;

    if (thisPage.data.types == "old") {
      var urls = "/app/getshopcustomcategory";
    } else {
      var urls = "/app/getshopMembercustomcategory";
    }
    wx.request({
      url: app.globalData.domainName + urls, //接口地址
      data: { //请求参数
        shopId: app.globalData.shopInfo.sys_user_id,
      },
      method: 'POST',
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) { //成功
        var returnData = res.data;

        if (returnData.code == 0) { //成功
          thisPage.setData({
            productClassList: returnData.result
          })
        } else { //失败
          console.log("接口异常！");
        }
      },
      fail: function(res) { //失败
        console.log('请求失败：', res.errMsg);
      },
      complete: function(res) { //完成
        console.log('请求完成：', res.errMsg);
      }
    })
  },



})