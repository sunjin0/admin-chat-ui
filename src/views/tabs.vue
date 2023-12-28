
<template>
  <div class="container">
    <el-tabs v-model="message">
      <!-- 未读消息 -->
      <el-tab-pane :label="`未读消息(${state.unread.length})`" name="first">
        <el-table
          :data="state.unread"
          max-height="450"
          border
          style="width: 100%"
        >
          <el-table-column label="用户ID" align="center" width="100px">
            <template #default="scope">
              <span class="message-title">{{ scope.row.senderId }}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="消息"
            prop="text"
            align="center"
          ></el-table-column>
          <el-table-column
            label="时间"
            prop="timestamp"
            align="center"
          ></el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                size="small"
                @click="handleRead(scope.$index, scope.row)"
                >回复</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 已读消息 -->
      <el-tab-pane :label="`已读消息(${state.read.length})`" name="second">
        <template v-if="message === 'second'">
          <el-table
            :data="state.read"
            border
            max-height="450"
            style="width: 100%"
          >
            <el-table-column label="用户ID" align="center" width="100px">
              <template #default="scope">
                <span class="message-title">{{ scope.row.senderId }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="消息"
              prop="text"
              align="center"
            ></el-table-column>
            <el-table-column
              label="时间"
              prop="timestamp"
              align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDel(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </template>
      </el-tab-pane>
      <!-- 回收站 -->
      <el-tab-pane :label="`回收站(${state.recycle.length})`" name="third">
        <template v-if="message === 'third'">
          <el-table
            :data="state.recycle"
            border
            max-height="450"
            style="width: 100%"
          >
            <el-table-column label="用户ID" align="center" width="100px">
              <template #default="scope">
                <span class="message-title">{{ scope.row.senderId }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="消息"
              prop="text"
              align="center"
            ></el-table-column>
            <el-table-column
              label="时间"
              prop="timestamp"
              align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button
                  type="success"
                  size="small"
                  @click="handleRestore(scope.$index)"
                  >返回</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-button
            style="margin-top: 5px"
            @click="removeRecycleAll"
            type="danger"
            >删除全部</el-button
          >
        </template>
      </el-tab-pane>
      <!-- 回复消息 -->
      <el-tab-pane :label="`回复消息(${replys.length})`" name="four">
        <template v-if="message === 'four'">
          <el-table :data="replys" border max-height="450" style="width: 100%">
            <el-table-column label="用户ID" align="center" width="100px">
              <template #default="scope">
                <span class="message-title">{{ scope.row.userId }}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="消息"
              prop="text"
              align="center"
            ></el-table-column>
            <el-table-column
              label="时间"
              prop="time"
              align="center"
            ></el-table-column>
            <el-table-column label="操作" align="center">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDel2(scope.$index)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-button
            style="margin-top: 5px"
            @click="replys = new Array()"
            type="danger"
            >删除全部</el-button
          >
        </template>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="dialogFormVisible" title="回复" draggable>
      <el-form>
        <el-form-item>
          <el-input
            autosize
            v-model="textarea"
            :rows="6"
            type="textarea"
            placeholder="回复内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="reply"> 回复 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="tabs">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { goEasy } from "../utils/chat";
const dialogFormVisible = ref(false);
const message = ref("first");
const textarea = ref("");
let state = ref({
  unread: new Array<Object>(),
  read: new Array<Object>(),
  recycle: new Array<Object>(),
});
let replys = ref(new Array<Object>());
// 方法区
onMounted(() => {
  const state1: any = localStorage.getItem("state");
  if (state1 !== null) state.value = JSON.parse(state1);
  const replys1: any = localStorage.getItem("replys");
  if (replys1 !== null) replys.value = JSON.parse(replys1);
  //   订阅
  goEasy.pubsub.subscribe({
    channel: "001", //替换为您自己的channel
    onMessage: function (message: any) {
      const message2 = JSON.parse(message.content);
      //收到消息
      console.log("Channel:" + message.channel, " content:", message2);
      if (message2.toId + "" !== "001") return;
      state.value.unread.push({
        senderId: message2.userId,
        text: message2.text,
        timestamp:
          new Date(message2.time).toLocaleDateString() +
          " " +
          new Date(message2.time).toLocaleTimeString(),
      });
      localStorage.setItem("state", JSON.stringify(state.value));
    },
    onSuccess: function () {
      console.log("Channel订阅成功。");
    },
    onFailed: function (error: any) {
      console.log(
        "Channel订阅失败, 错误编码：" +
          error.code +
          " 错误信息：" +
          error.content
      );
    },
  });
});
onUnmounted(() => {});

const removeRecycleAll = () => {
  state.value.recycle = new Array();
  localStorage.setItem("state", JSON.stringify(state.value));
};
const reply = () => {
  const msg = {
    userId: replyinfo.value.toId,
    text: textarea.value,
    time: new Date(),
    name: "系统通知",
  };
  goEasy.pubsub.publish({
    channel: "001", //替换为您自己的channel
    message: JSON.stringify(msg), //替换为您想要发送的消息内容
    onSuccess: function () {
      console.log("消息发布成功。");
      replys.value.push(msg);
      const item = state.value.unread.splice(replyinfo.value.index, 1);
      state.value.read = item.concat(state.value.read);
      dialogFormVisible.value = false;
      textarea.value = "";
      localStorage.setItem("replys", JSON.stringify(replys.value));
      localStorage.setItem("state", JSON.stringify(state.value));
    },
    onFailed: function (error: any) {
      console.log(
        "消息发送失败，错误编码：" + error.code + " 错误信息：" + error.content
      );
    },
  });
};
const replyinfo = ref({
  index: 0,
  toId: 0,
});
const handleRead = (index: number, row: any) => {
  dialogFormVisible.value = true;
  replyinfo.value.index = index;
  replyinfo.value.toId = row.senderId;
  localStorage.setItem("state", JSON.stringify(state.value));
};
const handleDel = (index: number) => {
  const item = state.value.read.splice(index, 1);
  state.value.recycle = item.concat(state.value.recycle);
  localStorage.setItem("state", JSON.stringify(state.value));
};
const handleDel2 = (index: number) => {
  replys.value.splice(index, 1);
  localStorage.setItem("replys", JSON.stringify(replys.value));
};
const handleRestore = (index: number) => {
  const item = state.value.recycle.splice(index, 1);
  state.value.read = item.concat(state.value.read);
  localStorage.setItem("state", JSON.stringify(state.value));
};
</script>

<style>
.message-title {
  cursor: pointer;
}
.handle-row {
  margin-top: 30px;
}
</style>
