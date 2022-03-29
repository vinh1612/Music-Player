const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'V_PLAYER'

const player =$('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const volumeBtn = $('.volume-btn')
const volume_change = $('#controls_lever_range')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs : [
        {
            name: 'Khuê Mộc Lan',
            singer: 'Hương Ly',
            path: './audio/khue-moc-lang.mp3',
            image: './images/khue-moc-lang.jpeg'
        },
        {
            name: 'Hoa Hải Đường',
            singer: 'Jack',
            path: './audio/hoa-hai-duong.mp3',
            image: './images/hoa-hai-duong.jpeg'
        },
        {
            name: 'Rồi Tới Luôn',
            singer: 'Nal',
            path: './audio/roi-toi-luon.mp3',
            image: './images/roi-toi-luon.jpeg'
        },
        {
            name: 'Sầu Hồng Gai',
            singer: 'Zombie',
            path: './audio/sau-hong-gai.mp3',
            image:'./images/sau-hong-gai.jpeg'
        },
        {
            name: 'Thiên Đàng',
            singer: 'Wowy',
            path: './audio/thien-dang.mp3',
            image: './images/thien-dang.jpeg'
        },
        {
            name: 'Thương Nhau Tới Bến',
            singer: 'Nal',
            path: './audio/thuong-nhau-toi-ben.mp3',
            image: './images/thuong-nhau-toi-ben.jpeg'
        },
        {
            name: 'Y Chang Xuân Sang',
            singer: 'Nal',
            path: './audio/y-chang-xuan-sang.mp3',
            image: './images/y-chang-xuan-sang.jpeg'
        }
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>

                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>

                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvent: function() {
        const _this = this
        const cdWidth = cd.offsetWidth

        //xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        //xử lí phóng to / thu nhỏ CD
        document.onscroll = function() {
            const scrollTop= window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //xử lí khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            }else {
                audio.play()
            }
        }
        //Khi bài hát được Play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi bài hát bị Pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // xử lý âm thanh bài hát 
        volume_change.oninput = function(e){
            audio.volume = e.target.value/100;
        }

        // Xử lý tiến độ bài hát thay đổi 
        audio.ontimeupdate = function() {
            const time_start = $('.controls_time--left');
            const time_count = $('.controls_time--right');
  
            if (audio.duration) {
              const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
              progress.value = progressPercent
  
              // Xử lý tính thời gian của bài hát
                // Time Start
              var e = Math.floor(audio.currentTime) ; // thời gian hiện tại bài hát đang chạy
                      var d = e%60; // số giây
                      var b =  Math.floor(e/60); // số phút
                      if(d < 10){
                         var c = 0; // số chục giây
                      }else{
                          c = "";
                      }
                      time_start.textContent = '0' + b +  ":" + c + d;
                // Time Count
                      var ee = Math.floor( audio.duration) ; // Tổng số thời gian bài hát
                      var dd = ee%60; //số giây
                      var bb =  Math.floor(ee/60); //số phút
                      if(dd < 10){
                         var cc = 0; // số chục giây
                      }else{
                          cc = "";
                      }
  
                      time_count.textContent =  '0' + bb +  ":" + cc + dd;
            }
          }

        //xử lí khi tua bài hát
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //khi next bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //khi prev bài hát
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //xử lí bật / tắt random
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Mute & UnMute
        volumeBtn.addEventListener("click", function(){
            if(audio.muted) {
              audio.muted = false;
              volumeBtn.classList.remove('active', audio.muted)
              volume_change.classList.remove('active', audio.muted)
            } else {
              audio.muted = true;
              volumeBtn.classList.add('active', !audio.muted)
              volume_change.classList.add('active', audio.muted)
            }
          }, false);

        //xử lí lặp lại 1 bài hát
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }

        //xử lí next bài hát khi audio ended / repeat
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        //lắng nghe hành vi click vào playclick
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            
            if(songNode || e.target.closest('.option')) {
                //xử lí khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }

                //xử lí khi click vào song option
                if(e.target.closest('.option')){
                    
                }
            }
        }
    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                 behavior:'smooth',
                 block: 'end'
             })
        },300)
    },

    loadCurrentSong: function() {
        

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function (){

        //gán cấu hình từ config vào app
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        // Lắng nghe / xử lí các sự kiện(DOM events)
        this.handleEvent()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy app
        this.loadCurrentSong()

        // Render play list
        this.render()

        //hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)


    }
}
app.start()