<template>
  <div>
    <div class="container">
      <!-- 查询 -->
      <div class="handle-box">
        <el-input
          v-model="query.userId"
          placeholder="用户ID"
          class="handle-input mr10"
        ></el-input>
        <el-input
          v-model="query.postId"
          placeholder="帖子ID"
          class="handle-input mr10"
        ></el-input>
        <el-button type="primary" :icon="Search" @click="handleSearch">
          搜索
        </el-button>
        <el-button type="primary" :icon="Refresh" @click="resetData">
          重置
        </el-button>
      </div>
      <!-- 数据 -->
      <el-table
        :data="tableData"
        :default-sort="{ prop: 'postId' }"
        border
        class="table"
        ref="multipleTable"
        header-cell-class-name="table-header"
      >
        <el-table-column
          sortable
          prop="postId"
          label="ID"
          width="100"
          align="center"
        ></el-table-column>

        <el-table-column
          prop="userId"
          label="发布人ID"
          width="100"
          align="center"
        ></el-table-column>

        <el-table-column prop="address" label="发布地址" align="center">
        </el-table-column>

        <el-table-column label="发布时间" align="center">
          <template #default="scope">
            {{ new Date(scope.row.publishTime).toLocaleDateString() }}
          </template>
        </el-table-column>

        <el-table-column label="标签" align="center">
          <template #default="scope">
            <el-tag class="ml-2" type="success">{{ scope.row.tag }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="状态">
          <template #default="scope">
            <el-tag class="ml-2" type="success">
              {{ scope.row.state + "" === "1" ? "发布成功" : "未发布" }}</el-tag
            >
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button
              text
              :icon="DocumentRemove"
              @click="handleEdit(scope.$index, scope.row)"
              v-permiss="15"
            >
              查看
            </el-button>
            <el-button
              text
              :icon="Delete"
              class="red"
              @click="handleDelete(scope.$index, scope.row)"
              v-permiss="16"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :current-page="query.pageIndex"
          :page-size="query.pageSize"
          :total="pageTotal"
          @current-change="handlePageChange"
        ></el-pagination>
      </div>
    </div>

    <!-- 编辑弹出框 -->
    <el-dialog title="详情" v-model="editVisible" width="60%">
      <el-form label-width="70px">
        <el-form-item label="内容">
          <el-input
            type="textarea"
            :rows="2"
            disabled
            v-model="form.content"
          ></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <div v-for="(item, index) in imgs" v-bind:key="index">
            <el-image
              style="width: 100px; height: 100px"
              :src="item"
            ></el-image>
          </div>
        </el-form-item>
        <el-form-item label="下架原因">
          <el-input type="textarea" :rows="3" v-model="reason"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="danger" @click="saveEdit">下架</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
  
  <script setup lang="ts" name="basetable">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getPost, searchPost, removePost } from "../api/index";
import { pubsub } from "../utils/chat";
import {
  Delete,
  Edit,
  Search,
  Refresh,
  DocumentRemove,
} from "@element-plus/icons-vue";
import { time } from "echarts/core";

interface TableItem {
  postId: string;
  userId: string;
  publishTime: Date;
  state: string;
  adderess: string;
  tag: string;
}

const query = reactive({
  userId: "",
  postId: "",
  pageIndex: 1,
  pageSize: 10,
  isQuery: false,
});
const tableData = ref<TableItem[]>([]);
const pageTotal = ref(0);
onMounted(() => {
  getData(1);
});
// 获取表格数据
const getData = (current: string | Number) => {
  query.isQuery = false;
  getPost(current).then((res) => {
    console.log(res.data);

    tableData.value = res.data.records;
    pageTotal.value = res.data.total || 50;
    query.pageIndex = res.data.current;
    query.pageSize = res.data.size;
  });
};
const searchData = () => {
  let searchQuery = {
    postId: query.postId,
    userId: query.userId,
    current: query.pageIndex,
  };
  if (query.postId === "" && query.userId === "") {
    getData(1);
    return;
  }
  if (searchQuery.postId === "") searchQuery.postId = "null";
  if (searchQuery.userId === "") searchQuery.userId = "null";
  console.log(searchQuery);

  query.isQuery = true;
  searchPost(searchQuery).then((res) => {
    console.log(res.data);

    tableData.value = res.data.records;
    pageTotal.value = res.data.total || 50;
    query.pageIndex = res.data.current;
    query.pageSize = res.data.size;
  });
};

// 查询操作
const handleSearch = () => {
  query.pageIndex = 1;
  searchData();
};
// 重置
const resetData = () => {
  query.pageIndex = 1;
  (query.userId = ""), (query.postId = ""), getData(query.pageIndex);
};

// 分页导航
const handlePageChange = (val: number) => {
  query.pageIndex = val;
  if (query.isQuery) {
    searchData();
    return;
  }
  getData(query.pageIndex);
};

// 删除操作
const handleDelete = (index: number, row: any) => {
  // 二次确认删除
  ElMessageBox.confirm("确定要删除吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      removePost(row.postId).then((res) => {
        if (res.data) {
          ElMessage.success("删除成功");
        }
      });
      ElMessage.success("删除成功");
      tableData.value.splice(index, 1);
    })
    .catch(() => {});
};

// 表格编辑时弹窗和保存
const editVisible = ref(false);
let form: any = ref({});
let imgs: any = ref([]);
let idx: number = -1;
const handleEdit = (index: number, row: any) => {
  idx = index;
  form.value = row;
  imgs.value = JSON.parse(form.value.img);
  editVisible.value = true;
};
let reason = ref("你的帖子因违反平台规定而被下架处理！");
const saveEdit = () => {
  if (reason.value.trim() === "") {
    ElMessage.warning("下架原因不能为空！");
    return;
  }
  // 二次确认删除
  ElMessageBox.confirm("确定要下架吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      removePost(form.value.postId).then((res) => {
        if (res.data) {
          ElMessage.success("删除成功");
          tableData.value.splice(idx, 1);
        }
      });
    })
    .catch(() => {});
  pubsub({
    userId:form.value.userId,
    text:reason.value,
    time:new Date(),
    name:"系统通知"
  })
  editVisible.value = false;
};
</script>
  
  <style scoped>
.container {
  padding-bottom: 0;
}
.handle-box {
  margin-bottom: 20px;
}

.handle-select {
  width: 120px;
}

.handle-input {
  width: 200px;
}
.table {
  width: 100%;
  font-size: 14px;
}
.red {
  color: #f56c6c;
}
.mr10 {
  margin-right: 10px;
}
.table-td-thumb {
  display: block;
  margin: auto;
  width: 40px;
  height: 40px;
}
</style>
  