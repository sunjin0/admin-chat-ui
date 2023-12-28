import goeasy from "goeasy";
import { ElMessage } from "element-plus";
let goEasy: goeasy;
const init = () => {
    goEasy = goeasy.getInstance({
        host: "hangzhou.goeasy.io", //若是新加坡区域：singapore.goeasy.io
        appkey: "BC-5ee15ba8328449e1b0de1bedd97ba14f",
        modules: ["im", "pubsub"], //根据需要，传入'im’或‘pubsub’，或数组方式同时传入
    });
    //建立连接
    goEasy.connect({
        id: "001", //im必填，最大长度60字符
        data: { avatar: "", nickname: "系统信息" }, //必须是一个对象，im必填，最大长度300字符，显示在会话列表中
        onSuccess: function () {
            //连接成功
            console.log("GoEasy connect successfully."); //连接成功
        },
        onFailed: function (error: any) {
            //连接失败
            console.log(
                "Failed to connect GoEasy, code:" +
                error.code +
                ",error:" +
                error.content
            );
        },
        onProgress: function (attempts: any) {
            //连接或自动重连中
            console.log("GoEasy is connecting", attempts);
        },
    });
}
class msg {
    userId: number = 0;
    text: string = "";
    time: Date = new Date();
    name: string = "系统通知";
}
const pubsub = (msg: msg) => {
    goEasy.pubsub.publish({
        channel: "001", //替换为您自己的channel
        message: JSON.stringify(msg), //替换为您想要发送的消息内容
        onSuccess: function () {
            console.log("消息发布成功。");
        },
        onFailed: function (error: any) {
            console.log(
                "消息发送失败，错误编码：" + error.code + " 错误信息：" + error.content
            );
        },
    });
}
export {
    goEasy,
    init,
    pubsub
}