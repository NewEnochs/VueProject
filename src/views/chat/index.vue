<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'
import { VideoCameraOutlined } from '@ant-design/icons-vue'

interface ChatMessage {
  id: number
  role: 'me' | 'other'
  content: string
  time: string
}

interface Conversation {
  id: number
  name: string
  lastMsg: string
  unread: number
}

const conversations = ref<Conversation[]>([
  { id: 1, name: '前端开发群', lastMsg: '记得把页面样式对齐一下', unread: 3 },
  { id: 2, name: '张三', lastMsg: '摄像头接口调通了吗？', unread: 0 },
  { id: 3, name: '李四', lastMsg: '下午开会', unread: 0 },
])

const activeConversation = ref(1)

const messages = ref<ChatMessage[]>([
  { id: 1, role: 'other', content: '你好，欢迎使用视频聊天页面', time: '09:30' },
  { id: 2, role: 'me', content: '你好！我这边可以看到摄像头画面吗？', time: '09:31' },
  { id: 3, role: 'other', content: '可以，点击下方按钮开启摄像头', time: '09:31' },
])

const inputText = ref('')
const videoRef = ref<HTMLVideoElement | null>(null)
const cameraOn = ref(false)
const cameraError = ref('')
let mediaStream: MediaStream | null = null

async function openCamera() {
  cameraError.value = ''
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    cameraOn.value = true
    await nextTick()
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream
      await videoRef.value.play()
    }
  } catch (error) {
    cameraError.value = '无法访问摄像头：请检查浏览器权限设置或设备是否可用'
    console.error('getUserMedia error:', error)
  }
}

function closeCamera() {
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
  cameraOn.value = false
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function toggleCamera() {
  if (cameraOn.value) {
    closeCamera()
  } else {
    openCamera()
  }
}

function sendMessage() {
  const content = inputText.value.trim()
  if (!content) {
    return
  }

  messages.value.push({
    id: Date.now(),
    role: 'me',
    content,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  })
  inputText.value = ''
}

onBeforeUnmount(() => {
  closeCamera()
})
</script>

<template>
  <section class="chat-page">
    <aside class="conversation-panel">
      <div class="panel-title">
        <h3>消息</h3>
        <span class="panel-count">{{ conversations.length }}</span>
      </div>

      <ul class="conversation-list">
        <li
          v-for="item in conversations"
          :key="item.id"
          class="conversation-item"
          :class="{ active: item.id === activeConversation }"
          @click="activeConversation = item.id"
        >
          <a-avatar class="conversation-avatar">{{ item.name.charAt(0) }}</a-avatar>
          <div class="conversation-info">
            <div class="conversation-name">
              <span>{{ item.name }}</span>
              <a-badge v-if="item.unread > 0" :count="item.unread" :offset="[0, 2]" />
            </div>
            <p class="conversation-last">{{ item.lastMsg }}</p>
          </div>
        </li>
      </ul>
    </aside>

    <div class="chat-panel">
      <header class="chat-header">
        <div>
          <h2>{{ conversations.find((item) => item.id === activeConversation)?.name }}</h2>
          <p>支持摄像头实时画面预览</p>
        </div>
        <a-button :type="cameraOn ? 'default' : 'primary'" @click="toggleCamera">
          {{ cameraOn ? '关闭摄像头' : '开启摄像头' }}
        </a-button>
      </header>

      <div class="camera-area">
        <video v-show="cameraOn" ref="videoRef" class="camera-video" autoplay muted playsinline />
        <div v-if="!cameraOn" class="camera-placeholder">
          <VideoCameraOutlined class="placeholder-icon" />
          <p>{{ cameraError || '摄像头未开启，点击右上角按钮开始实时画面' }}</p>
        </div>
      </div>

      <div class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-row"
          :class="msg.role"
        >
          <a-avatar class="message-avatar" :class="msg.role">
            {{ msg.role === 'me' ? '我' : '对' }}
          </a-avatar>
          <div class="message-bubble-wrap">
            <div class="message-bubble">{{ msg.content }}</div>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>
      </div>

      <footer class="chat-input-area">
        <a-input
          v-model:value="inputText"
          placeholder="输入消息，回车发送"
          @press-enter="sendMessage"
        />
        <a-button type="primary" @click="sendMessage">发送</a-button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.chat-page {
  height: 100%;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  min-height: 600px;
}

.conversation-panel {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 12px;
  border-bottom: 1px solid #eef3f2;
}

.panel-title h3,
.panel-title p {
  margin: 0;
}

.panel-title h3 {
  font-size: 16px;
}

.panel-count {
  color: #12a594;
  font-size: 12px;
  background: #e7f7f4;
  border-radius: 10px;
  padding: 1px 8px;
}

.conversation-list {
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.conversation-item:hover {
  background: #f2f9f8;
}

.conversation-item.active {
  background: #e7f7f4;
}

.conversation-avatar {
  flex: 0 0 auto;
  background: #12a594;
  color: #ffffff;
}

.conversation-info {
  min-width: 0;
  flex: 1;
}

.conversation-name {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 600;
  color: #274341;
}

.conversation-last {
  margin: 3px 0 0;
  color: #8ca09e;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #dce7e5;
  border-radius: 8px;
  background: #ffffff;
  overflow: hidden;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid #eef3f2;
}

.chat-header h2,
.chat-header p {
  margin: 0;
}

.chat-header h2 {
  font-size: 16px;
}

.chat-header p {
  margin-top: 4px;
  color: #8ca09e;
  font-size: 12px;
}

.camera-area {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
  width: 350px;
  height: 350px;
  border-radius: 8px;
  overflow: hidden;
  background: #0b2f33;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.camera-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #0b2f33;
}

.camera-placeholder {
  height: 100%;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  text-align: center;
  padding: 0 16px;
}

.camera-placeholder p {
  margin: 0;
}

.placeholder-icon {
  font-size: 36px;
  color: rgba(255, 255, 255, 0.4);
}

.message-list {
  min-height: 0;
  flex: 1;
  padding: 18px;
  overflow-y: auto;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
}

.message-row.me {
  flex-direction: row-reverse;
}

.message-avatar {
  flex: 0 0 auto;
  font-size: 12px;
}

.message-avatar.other {
  background: #12a594;
  color: #ffffff;
}

.message-avatar.me {
  background: #f0a04b;
  color: #ffffff;
}

.message-bubble-wrap {
  max-width: 60%;
  display: flex;
  flex-direction: column;
}

.message-row.me .message-bubble-wrap {
  align-items: flex-end;
}

.message-bubble {
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}

.message-row.other .message-bubble {
  background: #f2f6f5;
  color: #274341;
  border-top-left-radius: 2px;
}

.message-row.me .message-bubble {
  background: #12a594;
  color: #ffffff;
  border-top-right-radius: 2px;
}

.message-time {
  margin-top: 4px;
  color: #a9b8b6;
  font-size: 11px;
}

.chat-input-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
  padding: 14px 18px;
  border-top: 1px solid #eef3f2;
}
</style>
