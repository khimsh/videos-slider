;(() => {
    ;('use strict')

    const swiper = new Swiper('.swiper', {
        // loop: true,
        // allowTouchMove: false,
        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    })

    const play = (video, icon) => {
        video.play()
        icon.classList.remove('is-paused')
    }

    const pause = (video, icon) => {
        video.pause()
        icon.classList.add('is-paused')
    }

    function handleVideoPlay(video, icon) {
        if (video.paused) {
            play(video, icon)
        } else {
            pause(video, icon)
        }
    }

    const videoStop = (src) => {
        const video = src.querySelector('[video-src]')
        const icon = src.querySelector('.PlayPause')

        pause(video, icon)

        let elemClone = src.cloneNode(true)
        console.log('cloned', elemClone)
        src.parentNode.replaceChild(elemClone, src)
    }

    const toggleMute = (video, button) => {
        if (video.muted) {
            video.muted = false
            button.classList.remove('muted')
        } else {
            video.muted = true
            button.classList.add('muted')
        }
    }

    // rewind
    function rewind(e, ...args) {
        const [video, progress] = args

        const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration
        video.currentTime = scrubTime
    }

    function formatTime(seconds) {
        let minutes = Math.floor(seconds / 60)
        minutes = minutes >= 10 ? minutes : '0' + minutes
        seconds = Math.floor(seconds % 60)
        seconds = seconds >= 10 ? seconds : '0' + seconds
        return minutes + ':' + seconds
    }

    function handleProgress(video, currentTime) {
        currentTime.textContent = formatTime(video.currentTime)
    }

    function setVideoDuration(video, elem) {
        elem.textContent = formatTime(video.duration)
    }

    const handleTimeUpdate = (video, progressFilled = null) => {
        const percent = (video.currentTime / video.duration) * 100
        progressFilled.style.flexBasis = `${percent}%`
    }

    function videoPlay(src) {
        const togglePlayController = src.querySelector('[play-pause]')
        const toggleMuteController = src.querySelector('[mute-unmute]')
        const video = src.querySelector('[video-src]')
        const playPauseIcon = togglePlayController.querySelector('.PlayPause')
        const progressBar = src.querySelector('[progressbar]')
        const progressBarFilled = src.querySelector('[progressbar-filled]')

        const currentTime = src.querySelector('[video-current-time]')
        const videoDuration = src.querySelector('[video-duration]')

        // Play Video
        play(video, playPauseIcon)

        // Play/Pause Video on button click
        togglePlayController.addEventListener('click', () => {
            handleVideoPlay(video, playPauseIcon)
        })

        // Play/Pause video on video click
        video.addEventListener('click', () => {
            handleVideoPlay(video, playPauseIcon)
        })

        // Update video timestamp
        video.addEventListener('timeupdate', () => {
            handleTimeUpdate(video, progressBarFilled)
        })

        video.addEventListener('loadedmetadata', () => setVideoDuration(video, videoDuration))
        setVideoDuration(video, videoDuration)

        // Show video progress
        video.addEventListener('timeupdate', () => handleProgress(video, currentTime))

        // Video finished playing
        video.addEventListener('ended', () => {
            playPauseIcon.classList.add('is-paused')
            swiper.slideNext()

            const nextVideo = document.querySelector('.swiper-slide-active .vd-player [video-src]')
            play(nextVideo, playPauseIcon)
        })

        // Keyboard support
        document.body.onkeyup = function (e) {
            if (e.key == ' ' || e.code == 'Space' || e.code == 32) {
                if (video.paused) {
                    play(video, playPauseIcon)
                } else {
                    pause(video, playPauseIcon)
                }
            }

            if (e.key == 'm' || e.code == 'KeyM' || e.code == 77) {
                toggleMute(video, toggleMuteController)
            }
        }

        // Mute/Unmute Video
        toggleMuteController.addEventListener('click', () => toggleMute(video, toggleMuteController))

        let mousedown = false
        progressBar.addEventListener('click', (e) => rewind(e, video, progressBar))
        progressBar.addEventListener('mousemove', (e) => mousedown && rewind(e, video, progressBar))
        progressBar.addEventListener('mousedown', () => (mousedown = true))
        progressBar.addEventListener('mouseup', () => (mousedown = false))
    }

    document.addEventListener('DOMContentLoaded', () => {
        const displayedVideo = document.querySelector('.swiper-slide-active .vd-player')
        videoPlay(displayedVideo)
    })

    // Slider events
    swiper.on('slideChangeTransitionStart', () => {
        const slides = [...document.querySelectorAll('.swiper-slide')]
        const filteredSlides = slides.filter((slide) => !slide.classList.contains('swiper-slide-active'))
        filteredSlides.forEach((filteredSlide) => {
            const src = filteredSlide.querySelector('.vd-player')
            videoStop(src)
        })
    })

    swiper.on('slideChangeTransitionEnd', () => {
        videoPlay(document.querySelector('.swiper-slide-active .vd-player'))
    })
})()
