// pages/videoDetail/videoDetail.js

var app = getApp();   //获取应用实例
Page({

  /**
   * 页面的初始数据
   */
  data: {   
    media_url: "",           //媒体路径
    name: "",                //标题介绍
    create_time: "",         //创建时间
    img_url: "",             //封面图路径
    look: null,              //观看次数
    mediaId: null,           //媒体id
    flashBack : false,
    detailShow : false,       //封面图显隐
    showVBtn : false,
    showABtn : true,          //音频显隐
    showBtn : false,          //视频显隐
    playBtn : false,
    audioCard : true,
    videoType : 1,   //视频：1；音频：2
    videoSrc : 'http://www.kaolaj.com/file/upload/2018-07-18/1234.mp4',
    otherShow:false  //标题的展示与否
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var thisPage = this;
    var media_url = options.media_url;      //媒体路径
    var img_url = options.img_url;          //封面图路径
    var name = options.name;                //标题介绍
    var mediaId = options.id;               //媒体id
    var create_time = options.create_time;  //创建时间
    var look = options.look;                //观看次数
    var videoType = options.type;           //音频视频种类

    var showVBtn;
    var showABtn;
    if (videoType == 1){                    //当type是1的时候，是视频，显示视频按钮
      showVBtn = thisPage.data.showVBtn
      showABtn = thisPage.data.showABtn
    } else if (videoType == 2){
      showVBtn = true;
      showABtn = false;
    }

    thisPage.setData({
      media_url: media_url,                
      img_url: img_url,
      name: name,
      create_time: create_time,
      look: parseInt(look)+1,
      mediaId: mediaId,
      videoType: videoType,
      showVBtn: showVBtn, 
      showABtn: showABtn
    });
    thisPage.updateMedia(mediaId,1);
    var videoContext = wx.createVideoContext('myvideo', thisPage);
    　　videoContext.requestFullScreen();//执行全屏方法
  },
  //点击播放
  bindPlay: function (e) {
    var thisPage = this;
    var videoType = thisPage.data.videoType;
    var detailShow = thisPage.data.detailShow;  //整体显隐(默认显示)
    var showABtn = thisPage.data.showABtn;      //音频显隐
    var showBtn = thisPage.data.showBtn;        //封面图显隐
    detailShow = true;

    if(videoType == 2){
      thisPage.setData({
        detailShow: detailShow,
        audioCard : false
      });
    }
    console.log(showABtn);
    thisPage.setData({
      detailShow : detailShow,
      
    });
    thisPage.videoContext.play();
    
  },
  //点击播放视频的时候要隐藏图标
  palyToVideo:function(){
   
      var thisPage = this;
      thisPage.setData({
        otherShow:true
      })
  },
  //暂停播放视频的时候要显示图标
  pauseVideo:function(){
    var thisPage = this;
  
    thisPage.setData({
      otherShow: false
    })
  },
  //点击暂停
  bindpause : function(){
    var thisPage = this;
    var detailShow = thisPage.data.detailShow;
    var showVBtn = thisPage.data.showVBtn;
    thisPage.setData({
      detailShow: false,
      showVBtn: true
    });
    thisPage.videoContext.pause();
  },
  //当播放结束的时候
  bindended : function(){
    var thisPage = this;
    var detailShow = thisPage.data.detailShow;
    var audioCard = thisPage.data.audioCard;
    
    thisPage.setData({
      detailShow : false,
      audioCard: true
    });
  },
  //音频封面点击播放/暂停
  bindPlayPause : function(){
    var thisPage = this;
    var audioCard = thisPage.data.audioCard;
    if (!audioCard){
      thisPage.bindpause();
    }
  },
  //下拉刷新
  onPullDownRefresh: function () {
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function (res) {
    
    this.videoContext = wx.createVideoContext('myVideo')
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
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  updateMedia:function(id,type){
    wx.request({
      url: app.globalData.domainName + '/app/updateMedia',  //接口地址
      method: 'POST',
      data:{
        id:id,
        mediaType:type
      },
      dataType: 'json',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {  //成功
        
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