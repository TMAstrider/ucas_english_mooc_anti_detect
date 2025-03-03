// ==UserScript==
// @name         国科大慕课后台播放器
// @namespace    http://mooc.ucas.edu.cn/
// @version      2.1
// @description  强制后台播放且可拖拽进度
// @author       DeepSeek-R1
// @match        https://mooc.mooc.ucas.edu.cn/*
// @grant        unsafeWindow
// @run-at       document-start
// @require      https://cdn.staticfile.org/jquery/3.4.1/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';

    // 阻断平台检测系统
    const antiDetection = () => {
        // 修改平台指纹
        Object.defineProperties(navigator, {
            userAgent: {
                get: () => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            hardwareConcurrency: { value: 8 }
        });

        // 伪造WebRTC
        unsafeWindow.RTCPeerConnection = undefined;
    };

    // 视频控制增强
    const videoControl = () => {
        // 拦截超星播放器事件
        const originalInit = unsafeWindow.playerInit;
        unsafeWindow.playerInit = function() {
            const player = originalInit.apply(this, arguments);

            // 重写播放器方法
            player.pause = () => player.play();
            player.on('pause', () => player.play());

            // 解除进度条限制
            player.seek = function(time) {
                this.currentTime = Math.max(0, Math.min(time, this.duration));
            };

            return player;
        };

        // 强制启用控制
        setInterval(() => {
            const video = document.querySelector('video');
            if (video) {
                video.controls = true;
                video.removeAttribute('disabled');
                video.style.pointerEvents = 'auto';
            }
        }, 1000);
    };

    // 事件阻断系统
    const eventBlocker = () => {
        // 阻止所有可见性检测
        ['visibilitychange', 'webkitvisibilitychange'].forEach(event => {
            document.addEventListener(event, e => {
                e.stopImmediatePropagation();
                document.dispatchEvent(new Event('focus'));
            }, true);
        });

        // 鼠标事件拦截
        const blockEvents = ['mouseleave', 'mouseout', 'dragleave'];
        blockEvents.forEach(event => {
            window.addEventListener(event, e => {
                e.stopImmediatePropagation();
                document.dispatchEvent(new MouseEvent('mousemove'));
            }, true);
        });
    };

    // 运行所有模块
    antiDetection();
    eventBlocker();
    setTimeout(videoControl, 3000); // 等待播放器初始化

    // 定时心跳维持
    setInterval(() => {
        document.dispatchEvent(new Event('mousemove'));
        document.dispatchEvent(new Event('keypress'));
        if (document.hidden) document.dispatchEvent(new Event('focus'));
    }, 15000);
})();
