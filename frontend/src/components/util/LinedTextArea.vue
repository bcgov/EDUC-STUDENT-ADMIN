<template>
  <div class="lined-textarea">
    <div class="lined-textarea__lines"
         v-if="!disabled"
         :style="{ 'padding-right': longestWidth + 'px'}">
      <div class="lined-textarea__lines__inner"
           ref="lines">
        <p v-for="(line, index) in lines"
           :key="index"
           class="lined-textarea__lines__line"
           v-html="line"></p>
      </div>
    </div>
    <div class="lined-textarea__box">
      <label>
        <textarea :disabled="disabled"
                  :placeholder="placeholder"
                  class="lined-textarea__content"
                  :class="{'lined-textarea__content--wrap': !nowrap,
                           'lined-textarea__content--nowrap': nowrap }"
                  v-model="content"
                  v-on:scroll="scrollLines"
                  v-on:input="onInput"
                  v-resize="recalculate"
                  readonly
                  :style="styles"
                  ref="textarea"
        ></textarea>
      </label>
    </div>
    <div class="count-helper" ref="helper"></div>
  </div>
</template>

<script>
export default {
  name: 'LinedTextarea',
  data() {
    return {
      content: '',
      widthPerChar: 8, // Hard coded, adjust when necessary
      numPerLine: 1,
      previousWidth: 0,
      scrolledLength: 0
    };
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    nowrap: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    styles: {
      type: Object,
      default: () => {
        return {
          height: '600px'
        };
      }
    },
    value: {
      type: String,
      default: ''
    },
    validate: {
      type: Function,
      default: () => true
    }
  },
  mounted() {
    this.content = this.value;
    this.syncScroll();
    this.calculateCharactersPerLine();
  },
  computed: {
    lines() {
      if (this.content === '') return [1];
      const lineNumbers = [];
      let num = 1;
      this.content.split('\n').forEach((line) => {
        const wrapTimes = this.getWrapTimes(line, this.numPerLine) - 1;
        if (wrapTimes >= 0) {
          lineNumbers.push(num);
        }
        for(let i = 0; i < wrapTimes; i++) {
          lineNumbers.push('&nbsp;');
        }
        num++;
      });
      return lineNumbers;
    },
    longestWidth() {
      let width = 10;
      for (let i = this.lines.length - 1; i >= 0; i--) {
        if (this.lines[i] === '&nbsp;')
          continue;
        width = (this.lines[i] + '').length * this.widthPerChar + 10; // 10px base padding-right
        break;
      }
      return width;
    }
  },
  watch: {
    // When left area grows/shrinks e.g. 9 => 10; 100 => 99
    longestWidth(val, oldVal) {
      if (val !== oldVal) {
        this.$nextTick(() => this.calculateCharactersPerLine());
      }
    },
    nowrap() {
      this.calculateCharactersPerLine();
    },
    value(val) {
      if (val !== this.content) {
        this.content = val;
        this.recalculate();
      }
    }
  },
  methods: {
    getWrapTimes(sentence, width) { // Number of lines extended. Seems to work with pre-wrap (has problem with dash)
      if (width <= 0) {
        // Protect against infinite loop
        console.warn('Please set the min-width of textarea to allow at least one character per line.');
        return sentence.length + 1; // Seems browser would add one additional space
      }
      const words = sentence.split(' ');
      let currentLine = 1;
      let spaceLeft = width;
      words.forEach((word) => {
        if (spaceLeft === width && word.length >= spaceLeft) {
          currentLine++;
          word = word.slice(width);
        }
        if (spaceLeft === width) {
          spaceLeft -= word.length;
          return;
        }
        if (word.length + 1 > spaceLeft) {
          currentLine++;
          spaceLeft = width;
        }
        spaceLeft -= spaceLeft === width ? word.length : word.length + 1;
      });
      return spaceLeft === width ? currentLine - 1 : currentLine;
    },
    calculateCharactersPerLine() { // May be +-1 off real value >_<
      if (this.nowrap) {
        this.numPerLine = Number.MAX_SAFE_INTEGER;
        return;
      }
      const textarea = this.$refs.textarea;
      const styles = window.getComputedStyle(textarea);
      const paddingLeft = parseFloat(styles.getPropertyValue('padding-left'));
      const paddingRight = parseFloat(styles.getPropertyValue('padding-right'));
      const fontSize = styles.getPropertyValue('font-size');
      const fontFamily = styles.getPropertyValue('font-family');
      const width = textarea.clientWidth - paddingLeft - paddingRight;
      if (!width || width < 0) {
        return;
      }
      const helper = this.$refs.helper;
      helper.style.fontSize = fontSize;
      helper.style.fontFamily = fontFamily;
      helper.innerHTML = '';
      for (let num = 1; num < 999; num++) {
        helper.innerHTML += 'a';
        if (helper.getBoundingClientRect().width > width) {
          this.numPerLine = num - 1;
          break;
        }
      }
    },
    onInput() {
      this.$emit('input', this.content);
      this.recalculate();
    },
    recalculate() {
      const textarea = this.$refs.textarea;
      const width = textarea.clientWidth;
      if (!width) {
        return;
      }
      if (width !== this.previousWidth) {
        this.calculateCharactersPerLine();
      }
      this.previousWidth = width;
    },
    scrollLines(e) {
      this.scrolledLength = e.target.scrollTop;
      this.syncScroll();
    },
    syncScroll() {
      this.$refs.lines.style.transform = `translateY(${-this.scrolledLength}px)`;
    },
  }
};
</script>

<style scoped>
.lined-textarea {
  display: flex;
  font-size: 13px;
  line-height: 150%;
  font-family: Helvetica, monospace;
}
.lined-textarea__lines {
  background-color: #F0F0F0;
  border: 1px solid #D7E2ED;
  border-radius: 10px 0 0 10px;
  border-right-width: 0;
  margin-bottom: 3px;
  padding: 15px 10px 15px 15px;
  overflow: hidden;
  position: relative;
}
.lined-textarea__lines__inner {
  position: absolute;
}
.lined-textarea__lines__line {
  text-align: right;
  margin-bottom: 0;
}
.lined-textarea__box {
  display: block;
  width: 100%;
}
.lined-textarea__content {
  border: 1px solid #D7E2ED;
  border-radius: 0 10px 10px 0;
  border-left-width: 0;
  margin: 0;
  line-height: inherit;
  font-family: monospace;
  padding: 15px;
  width: 100%;
  overflow: auto;
}
.lined-textarea__content--wrap {
  white-space: pre-wrap;
}
.lined-textarea__content--nowrap {
  white-space: pre;
}
@supports (-ms-ime-align:auto) {
  .lined-textarea__content--nowrap {
    white-space: nowrap;
  }
}
.lined-textarea__content:focus {
  outline: none;
}
.count-helper {
  position: absolute;
  visibility: hidden;
  height: auto;
  width: auto;
}
</style>
