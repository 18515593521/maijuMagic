// pages/member/member.js
var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardListInfo:null,
    currentPage: 1,  //当前页码
    pageSize: 3,     //每页记录数
    total: 0,        //总记录数
    isSearchNextPage: true,   //是否查询下一页
    vipType:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var thisPage = this;

    var vipType = options.vip_type;
    var card_id = options.card_id;

    thisPage.selectCardList(1);
    thisPage.setData({
      vipType: vipType,
      card_id: card_id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
   

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
    if (this.data.isSearchNextPage) {
      var searchPage = this.data.currentPage + 1;
      this.selectCardList(searchPage);
    }
  },
//点击
  skinUp:function(e){
    var dataSet = e.currentTarget.dataset;
    var url = dataSet.url;
    var type = dataSet.types;
    app.pageSkip(url, type);
  },
  selectCardList: function (searchPage){

   var thisPage = this;
   wx.request({
     url: app.globalData.domainName + '/app/selectDiscountVipListByNode3',  //接口地址
     method: 'post',
     data: {           //请求参数
       page: searchPage,
       pageSize: thisPage.data.pageSize,
       param: {
         node3: app.globalData.customerInfo.factoryId,
       }
     },
     dataType: 'json',
     header: {
       'content-type': 'application/json'
     },
     success: function (res) {  //成功
       var returnData = res.data;

       if (returnData.code == 0) { //成功
         var dataList = returnData.result.data;
         var isSearchNextPage = true;
         if (dataList.length < thisPage.data.pageSize) {
           isSearchNextPage = false;
         }
         if (searchPage > 1) {   //非第一页
           dataList = thisPage.data.cardListInfo.concat(dataList);
         }
         for (var i = 0; i < dataList.length;i++){
           if (dataList[i].number){
             if (dataList[i].sellNum){
               if (parseInt(dataList[i].number) > parseInt(dataList[i].sellNum)){
                 dataList[i].sellType = 1;
               }else{
                 dataList[i].sellType = 2;
               }
             }else{
               dataList[i].sellType = 1;
             }
           }
           if (thisPage.data.card_id){
             if (thisPage.data.card_id == dataList[i].id) {
               dataList[i].buyType = 1;
             } else {
               dataList[i].buyType = 2;
             }
           } else {
             dataList[i].buyType = 2;
           }
           
         }
         
          thisPage.setData({
             "cardListInfo": dataList,
              currentPage: returnData.result.page,  //当前页码
              total: returnData.result.total,       //总页数
              isSearchNextPage: isSearchNextPage,    //是否查询下一页
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

 }

})