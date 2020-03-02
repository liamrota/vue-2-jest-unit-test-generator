<template>
  <div>
    <button
      ref="invert-bool-button"
      @click="thing = !thing"
    >test inverting boolean</button>
    <button ref="prop-set-button" @click="thing = true">test prop set</button>
    <button ref="method-call-button" @click="foo">test method call</button>
    <button ref="emit-button" @click="$emit('myEvent')">test emit</button>
    <button @click="hiya()">button without ref</button>
    <button @click="hiya();anotherThing = true" ref="naughty-btn">naughty button</button>
    <button @click="doApiCall()" ref="api-call-btn">call api</button>
  </div>
</template>

<script>
export default {
  name: "Whatever",
  data() {
    return {
      thing: false,
      anotherThing: true
    }
  },
  methods: {
    foo() {
      console.log('it is so good to be alive');
    },
    hiya() {
      console.log('hiya');
    },
    async doApiCall() {

    },
    emptyMethod() {},
    methodWithParams(arg1, arg2) {
      console.log('hi from method with params');
    }
  }
}
