<script lang="ts">
import {defineComponent} from 'vue'
import Parallax from "@/assets/js/parallax.min"
import cssStyle from "@/assets/css/404.css?url"

export default defineComponent({
  name: "NotFound",

  mounted() {
    const consoleImage = function (url: string, scale = 1) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;
        if (ctx){
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
        }
        const base64 = canvas.toDataURL("image/png");
        console.log(
            "%c ",
            `
          padding: ${(height * scale) / 2}px ${(width * scale) / 2}px;
          background-image: url(${base64});
          background-repeat: no-repeat;
          background-size: ${width * scale}px ${height * scale}px;
          color: transparent;
        `
        );
      };
      img.src = url;
    };
    consoleImage("https://pic3.zhimg.com/v2-478e0e44652554c812739fe389d322c3_720w.webp?source=d6434cab");
    console.log("Welcome to WebSite Console, Let's do something interesting.")
    const dare_button: HTMLButtonElement = <HTMLButtonElement>this.$refs["dare-button"];

    dare_button.onclick = function () {
      window.location.href = "https://www.yaonas.space/"
    }
    const scene = document.getElementById('scene');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const parallax = new Parallax(scene);
  },
  data() {
    return {
      cssURL: cssStyle
    }
  },
})
</script>
<template>
  <link type="text/css" rel="stylesheet" :href="cssURL">
  <div id="404Page">
    <div class="about">
      <a class="bg_links social portfolio" href="https://aweb.yaonas.fun/typecho" target="_blank">
        <span class="icon"></span>
      </a>
      <a class="bg_links social dribble" href="https://www.qzone.com/3079593805" target="_blank">
        <span class="icon"></span>
      </a>
      <a class="bg_links social linkedin" href="https://wpa.qq.com/msgrd?v=3&uin=3079593805&site=qq&menu=yes"
         target="_blank">
        <span class="icon"></span>
      </a>
      <a class="bg_links logo"></a>
    </div>
    <!-- end about -->

    <nav id="nav">
      <div class="menu">
        <p class="website_name">Yao's Website</p>
        <div class="menu_links">
          <a href="https://www.yaonas.space/wordpress/a-self-introduction/" class="link" target="_blank">about</a>
          <a href="https://www.github.com/whisper86" class="link" target="_blank">projects</a>
          <!-- <a href="" class="link">contacts</a> -->
          <a class="link" id="contact">contact
            <div id="sweep_code">
              <img src="@/assets/images/Sweep_Code.png" alt="" id="img" width="148" height="148"/>
            </div>
          </a>
        </div>
        <div class="menu_icon">
          <span class="icon"></span>
        </div>
      </div>
    </nav>

    <section class="wrapper">

      <div class="container" style="overflow: hidden">

        <div id="scene" class="scene" data-hover-only="false">

          <div class="circle" data-depth="1.2"></div>

          <div class="one" data-depth="0.9">
            <div class="content">
              <span class="piece"></span>
              <span class="piece"></span>
              <span class="piece"></span>
            </div>
          </div>

          <div class="two" data-depth="0.60">
            <div class="content">
              <span class="piece"></span>
              <span class="piece"></span>
              <span class="piece"></span>
            </div>
          </div>

          <div class="three" data-depth="0.40">
            <div class="content">
              <span class="piece"></span>
              <span class="piece"></span>
              <span class="piece"></span>
            </div>
          </div>

          <p class="p404" data-depth="0.50">404</p>
          <p class="p404" data-depth="0.10">404</p>

        </div>

        <div class="text">
          <article>
            <p>Uh oh! Looks like you got lost. <br>Go back to the homepage if you dare!</p>
            <button ref="dare-button" id="dare_button">i dare!</button>
          </article>
        </div>

      </div>
    </section>
  </div>
</template>