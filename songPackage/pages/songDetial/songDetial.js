// 引入
import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../../utils/request'

// 获取全局app实例
let appInstance = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false , //标识音乐是否播放
    song: {} , // 歌曲详情对象
    musicId: '',
    musicLink: '', // 当前音乐播放连接
    currentTime: '00:00', //实时播放时长
    durationTime: '00:00',  // 总时长
    currentWidth: '0', // 实时进度条长度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(options);
    /*    
    options 用来接收路由跳转的参数，默认是空对象
    注意！！！ 原生小程序url有长度限制，如果传参内容过长会自动截取掉
    console.log(options.song);
    let song = JSON.parse(options.song)
     */

    //  获取音乐id
    let musicId = options.musicId;
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId)

    // 判断当前页面是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      // 音乐在播放, 修改当前页面音乐的播放状态 为 true
      this.setData({
        isPlay: true
      })
    }

    // 创建背景音频的实例
    this.backgroundAudioManager =  wx.getBackgroundAudioManager();
    // 监听音乐播放/暂停/停止
    this.backgroundAudioManager.onPlay(() => {
      this.changeIsPlayState(true)
      appInstance.globalData.musicId = musicId;
    });
    this.backgroundAudioManager.onPause(() => {
      this.changeIsPlayState(false)
    });
    this.backgroundAudioManager.onStop(() => {
      this.changeIsPlayState(false)
    });

    // 订阅 recommendSong页面发布的消息：musicId
    PubSub.subscribe('musicId',(msg,musicId) => {
      console.log('来自recommendSong页面发布的消息',musicId);
      // 获取最新的音乐详情页面
      this.getMusicInfo(musicId);
      // 自动播放当前音乐
      this.musicControl(true,musicId)
    })

    // 监听歌曲自然播放结束
    this.backgroundAudioManager.onEnded(() => {
      // 自动切换到下一首音乐,并且自动播放
      // 将切换歌曲的类型发送给recommendSong页面
      PubSub.publish('switchType','next');
      // 还原状态
      this.setData({
        currentTime: '00:00', //实时播放时长
        durationTime: '00:00',  // 总时长
        currentWidth: '0', // 实时进度条长度
      })

    })

    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长: ',this.backgroundAudioManager.duration);
      // console.log('实时播放的时长: ',this.backgroundAudioManager.currentTime);

      // 格式化实时播放的时长
      let currentTime = moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration*450;
      this.setData({
        currentTime,
        currentWidth
      })

    })

  },

  // 封装修改状态的功能函数
  changeIsPlayState(isPlay){
    this.setData({
      isPlay
    })
    // 同步全局状态
    appInstance.globalData.isMusicPlay = isPlay;
  },

  // 获取音乐详情
  async getMusicInfo(musicId){
    let songData = await request('/song/detail',{ids:musicId});
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    // 更新音乐详情对象
    this.setData({
      song:songData.songs[0],
      musicId,
      durationTime
    })
    // 动态修改窗口的标题
    wx.setNavigationBarTitle({
      title:this.data.song.name
    })
  },

  // 点击播放/ 暂停的回调
  handleMusicPlay(){
    let isPlay = !this.data.isPlay;
    // 修改是否播放的状态
    // this.setData({
    //   isPlay
    // })
    let {musicId,musicLink} = this.data
    console.log(musicLink);
    this.musicControl(isPlay,musicId,musicLink);
  },

  // 封装控制音乐播放/暂停的功能函数
  async musicControl(isPlay,musicId,musicLink){

    if(isPlay){ // 播放音乐
      if(!musicLink){
        // 获取音乐播放地址
        let musicLinkData = await request('/song/url',{id: musicId});
        musicLink = musicLinkData.data[0].url;
        // 将获取到的音乐连接更新到data 中
        this.setData({
          musicLink
        })
      }
      // 生成背景音频的实例
      // console.log(musicLink);
      this.backgroundAudioManager.src = musicLink;
      this.backgroundAudioManager.title = this.data.song.name;

      // 修改全局的播放状态
      // appInstance.globalData.isMusicPlay = true;
      // appInstance.globalData.musicId = musicId;
    }else{ // 暂停音乐
      this.backgroundAudioManager.pause();
      // 修改全局的播放状态
      // appInstance.globalData.isMusicPlay = true;
      // appInstance.globalData.musicId = musicId;
    }

  },

  // 点击切换歌曲的回调
  handleSwitch(event){
    // 获取切换歌曲的类型
    let type = event.currentTarget.id;

    // 停止当前音乐播放
    this.backgroundAudioManager.stop();
    
    // 将切换歌曲的类型发送给recommendSong页面
    PubSub.publish('switchType',type);
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