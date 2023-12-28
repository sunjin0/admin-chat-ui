<template>
  <div>
    <div class="container">
      <!-- 查询 -->
      <div class="handle-box">
        <el-input
          v-model="query.username"
          placeholder="用户名"
          class="handle-input mr10"
        ></el-input>
        <el-input
          v-model="query.email"
          placeholder="邮箱"
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
        :default-sort="{ prop: 'userId' }"
        border
        class="table"
        ref="multipleTable"
        header-cell-class-name="table-header"
      >
        <el-table-column
          sortable
          prop="userId"
          label="ID"
          width="100"
          align="center"
        ></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column align="center" label="性别">
          <template #default="scope">{{
            scope.row.sex === "1" ? "男" : "女"
          }}</template>
        </el-table-column>
        <el-table-column label="头像(查看大图)" align="center">
          <template #default="scope">
            <el-image
              class="table-td-thumb"
              :src="scope.row.avatar"
              :z-index="10"
              :preview-src-list="[scope.row.avatar]"
              preview-teleported
            >
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="email"
          label="邮箱"
        ></el-table-column>
        <el-table-column
          label="个人介绍"
          prop="bio"
          align="center"
        ></el-table-column>

        <el-table-column label="注册时间" align="center">
          <template #default="scope">
            {{ new Date(scope.row.registrationDate).toLocaleDateString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center">
          <template #default="scope">
            <el-button
              text
              :icon="DocumentRemove"
              @click="handleEdit(scope.row)"
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
    <el-dialog title="违规处罚" v-model="editVisible" width="40%">
      <el-form label-width="70px">
        <el-form-item label="ID">
          <el-input disabled v-model="form.userId"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input disabled v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="违规原因">
          <el-input v-model="info.reason"></el-input>
        </el-form-item>
        <el-form-item label="限制时间">
          <el-input v-model="info.time">
            <template #append>小时</template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取 消</el-button>
          <el-button type="danger" @click="saveEdit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="basetable">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUser, searchUser, removeUser, sanctionUser } from "../api/index";
import {
  Delete,
  Edit,
  Search,
  Plus,
  Refresh,
  DocumentRemove,
} from "@element-plus/icons-vue";

interface TableItem {
  userId: number;
  username: string;
  email: string;
  registrationDate: Date;
  sex: string;
  avatar: string;
  bio: string;
}

const query = reactive({
  email: "",
  username: "",
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
  getUser(current).then((res) => {
    tableData.value = res.data.records;
    pageTotal.value = res.data.total || 50;
    query.pageIndex = res.data.current;
    query.pageSize = res.data.size;
  });
};
const searchData = () => {
  let searchQuery = {
    username: query.username,
    email: query.email,
    current: query.pageIndex,
  };
  if (query.username === "" && query.email === "") {
    getData(1);
    return;
  }
  if (searchQuery.username === "") searchQuery.username = "null";
  if (searchQuery.email === "") searchQuery.email = "null";
  console.log(searchQuery);

  query.isQuery = true;
  searchUser(searchQuery).then((res) => {
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
  (query.username = ""), (query.email = ""), getData(query.pageIndex);
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
      removeUser(row.userId).then((res) => {
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
let form = ref({
  userId: "",
  username: "",
});
const info = reactive({
  reason: "由于你发布的内容多次违规，限制你发布帖子。",
  time: "",
});
const handleEdit = (row: any) => {
  console.log(row);
  form.value = row;
  editVisible.value = true;
};
const saveEdit = () => {
  // 二次确认删除
  ElMessageBox.confirm("确定要处罚吗？", "提示", {
    type: "warning",
  })
    .then(() => {
      sanctionUser({
        userId: form.value.userId,
        time: Number.parseInt(info.time) * 3600,
      }).then((res) => {
        if (res.data) {
          ElMessage.success("操作成功");
          info.time = "";
        }
      });
    })
    .catch(() => {});
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
