import request from '../../utils/request'

// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [], // 轮播图的数据
    recommendList: [],// 推荐歌曲
    topList: [] // 排行榜
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    
    this.getInitData();

  },

  // 封装获取初始化数据函数
  async getInitData(){
    // 发送请求获取数据
    // 获取banner数据
    let result = await request('/banner',{type: 2})
    // console.log(result);
    // 修改banners数据
    this.setData({
      banners: result.banners
    })

    // 获取推荐歌曲数据
    result = await request('/personalized',{type: 2})
    // 修改 数据
    this.setData({
      recommendList: result.result
    })

    // 获取排行榜数据
    /* 
      idx: 0~20
      需求: 1-4
      发请求次数:5次
    */
    let index = 1;
    let resultArr = [];
    let type = '';
    // while(index < 5){
    for(;index < 5;index++){
      // result = await request('/top/list',{idx:index++})
      // console.log(result);
      // 过滤操作
      // resultArr.push({name: result.list.artists[0].name, tracks: result.list.artists[0].picUrl})
      // resultArr = result.list.artists.slice(0,3)

      result = await request('/toplist/artist',{type: index})
      switch (index) {
        case 1:
          type = '华语榜'
          break;
        case 2:
          type = '欧美榜'
          break;
        case 3:
          type = '韩国榜'
          break;
        default:
          type = '日本榜'
          break;
      }
      resultArr.push({type: type, artists: result.list.artists.slice(0,3)})
      // index++;

      // 实时更新 1.优点：用户等待时间短  2.缺点: 多次更新页面  5次
      // this.setData({
        //   topList: resultArr
        // })
      }
      // resultArr.shift()
      console.log(resultArr);
    // 更新 tolist   1.优点: 减少更新的次数  2.缺点: 网络较差时候用户等待时间过长，可能会看到白屏
    this.setData({
      topList: resultArr
    })

  },

  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})