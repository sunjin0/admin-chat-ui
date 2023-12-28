<template>
  <div class="container">
    <div class="schart-box">
      <div class="content-title">热门帖子历史数据</div>
      <div id="main" style="width: 100%; height: 440px"></div>
    </div>
  </div>
</template>

<script setup lang="ts" name="basecharts">
import { onMounted } from "vue";
import { charstDatas } from "../api/index";
import * as echarts from "echarts/core";
import {
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import {
  LineChart,
  BarChart,
  PieChart,
} from "echarts/charts";
import { UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { EChartsType } from "echarts/core";

echarts.use([
  LegendComponent,
  TooltipComponent,
  PieChart,
  BarChart,
  ToolboxComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

var myChart: EChartsType;
var option = {
  xAxis: {
    name: "日期",
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    name: "浏览量",
    type: "value",
  },
  series: new Array(),
  tooltip: {
    show: true,
    trigger: "axis",
    axisPointer: {
      type: "cross",
    },
  },
  legend: {},
  toolbox: {
    show: true,
    feature: {
      dataZoom: {
        yAxisIndex: "none",
      },
      dataView: { readOnly: false },
      magicType: { type: ["line", "bar", "pie"] },
      restore: {},
      saveAsImage: {},
    },
  },
};

onMounted(() => {
  charstDatas().then(({ data }) => {
    console.log(data);
    const chartDom = document.getElementById("main");
    myChart = echarts.init(chartDom);
    option.xAxis.data = Object.keys(data[0].history);
    data.forEach((item: any) => {
      option.series.push({
        name: `${item.postId} 浏览量  ${item.view_count}`,
        data: Object.values(item.history),
        type: "line",
        smooth: true,
      });
    });
    myChart.setOption(option);
  });
});
</script>

<style scoped>
.schart-box {
  width: 100%;
  margin: 20px;
}
.schart {
  width: 100%;
  height: 430px;
}
.content-title {
  clear: both;
  font-weight: 400;
  line-height: 50px;
  margin: 10px 0;
  font-size: 22px;
  color: #1f2f3d;
}
</style>
