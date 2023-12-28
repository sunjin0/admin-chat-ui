<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="mgb20" style="height: 252px">
          <div class="user-info">
            <el-avatar :size="120" :src="userInfo.avatar" />
            <div class="user-info-cont">
              <div class="user-info-name">{{ userInfo.username }}</div>
              <div>{{ role }}</div>
            </div>
          </div>
          <div class="user-info-list">
            登录时间：
            <span>{{ formattedTime }}</span>
          </div>
          <div class="user-info-list">
            上次登录地点：
            <span>东莞</span>
          </div>
        </el-card>
        <el-card shadow="hover" style="height: 310px">
          <template #header>
            <div class="clearfix">
              <span>标签热度</span>
            </div>
          </template>
          <div v-for="(i, index) in chartData.tag" :key="index">
            {{ i.name }}
            <el-progress
              :percentage="i.percentage"
              :color="i.color"
            ></el-progress>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-row :gutter="20" class="mgb20">
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-1">
                <el-icon class="grid-con-icon">
                  <User />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ chartData.userCount }}</div>
                  <div>用户数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-2">
                <el-icon class="grid-con-icon">
                  <ChatDotRound />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ chartData.messageCount }}</div>
                  <div>用户消息量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-3">
                <el-icon class="grid-con-icon">
                  <Memo />
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">{{ chartData.postCount }}</div>
                  <div>帖子数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="hover" style="height: 462px">
          <template #header>
            <div class="clearfix">
              <span>实时数据</span>
              <el-icon
                style="cursor: pointer"
                :class="{ rotate: isRotating }"
                @click="rotateIcon"
              >
                <Refresh />
              </el-icon>
            </div>
          </template>
          <el-card shadow="hover">
            <schart
              style="width: 100%"
              ref="line"
              class="schart"
              canvasId="line"
              :options="mainOptions"
            ></schart>
          </el-card>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import Schart from "vue-schart";
import { reactive, onMounted, ref, onBeforeUnmount } from "vue";
import { chartDatas } from "../api/index";
// 变量区

let isRotating = ref(false);
let chartData: any = ref({
  tag: new Array(),
  month: new Array(),
});
let mainOptions = ref({
  type: "line",
  title: {
    text: "截止今日发帖数量趋势图",
  },
  labels: new Array(),
  datasets: [
    {
      label: "帖子数量",
      data: new Array(),
    },
  ],
});
const currentTime: Date = new Date();
const timeOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};
const formattedTime: string = new Intl.DateTimeFormat(
  "zh-CN",
  timeOptions
).format(currentTime);
const userInfo = JSON.parse(localStorage.getItem("ms_username") || "");
const role: string = userInfo.username === "管理员" ? "超级管理员" : "普通用户";
const colors = [
  "#409EFF",
  "#67C23A",
  "#E6A23C",
  "#F56C6C",
  "#fab6b6",
  "#95d475",
];
// 方法区
onMounted(() => {
  initData(false);
});
onBeforeUnmount(() => {});
function initData(isLoad: Boolean): any {
  chartDatas().then((res) => {
    chartData.value = res.data;
    chartData.value.tag.map((i: any, index: any) => {
      i.color = colors[index];
      i.percentage = Number.parseInt(i.percentage);
    });

    console.log(chartData.value.tag);

    mainOptions.value.labels = chartData.value.month.map(
      (i: any) => i.month + "月份"
    );
    mainOptions.value.datasets[0].data = chartData.value.month.map(
      (i: any) => i.total
    );
    if (isLoad) isRotating.value = !isRotating.value;
    return "";
  });
}
function rotateIcon() {
  isRotating.value = !isRotating.value;
  initData(true);
}
</script>

<style scoped>
.rotate {
  animation: spin 2s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.clearfix {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-row {
  margin-bottom: 20px;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #999;
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
}

.grid-con-icon {
  font-size: 50px;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
  color: #fff;
}

.grid-con-1 .grid-con-icon {
  background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
  color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
  background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
  color: rgb(100, 213, 114);
}

.grid-con-3 .grid-con-icon {
  background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
  color: rgb(242, 94, 67);
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ccc;
  margin-bottom: 20px;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: #999;
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: #222;
}

.user-info-list {
  font-size: 14px;
  color: #999;
  line-height: 25px;
}

.user-info-list span {
  margin-left: 70px;
}

.mgb20 {
  margin-bottom: 20px;
}

.todo-item {
  font-size: 14px;
}

.todo-item-del {
  text-decoration: line-through;
  color: #999;
}

.schart {
  width: 100%;
  height: 300px;
}
</style>
