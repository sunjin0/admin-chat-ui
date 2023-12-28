import request from '../utils/request';

const chartDatas = () => {
    return request({
        url: "/admin/user/visualizingData",
        method: "get"
    });
}
const charstDatas=()=>{
    return request({
        url: "/admin/post/visualizingData",
        method: "get",
    });
}
const getUser = (query: string | Number) => {
    return request({
        url: '/admin/user/getUserList/' + query,
        method: 'get'
    });
};
const searchUser = (query: any) => {
    return request({
        url: "/admin/user/searchUser/" + query.username + "/" + query.email + "/" + query.current,
        method: "get"
    });
}
const removeUser = (userId: Number) => {
    return request({
        url: "/admin/user/deleteUser/" + userId,
        method: "get"
    });
}

const getPost = (query: string | Number) => {
    return request({
        url: '/admin/post/getPostList/' + query,
        method: 'get'
    });
};
const searchPost = (query:any) => {
    return request({
        url: "/admin/post/searchPost/" + query.postId + "/" + query.userId + "/" + query.current,
        method: "get"
    });
}
const removePost = (postId: Number) => {
    return request({
        url: "/admin/post/deletePost/" + postId,
        method: "get"
    });
}
const sanctionUser=(user:any)=>{
    return request({
        url:"/admin/user/sanctionUser",
        method:"post",
        data:{
            userId:user.userId,
            temporary:user.time
        }
    })
}



export {
    chartDatas,
    charstDatas,
    getUser,
    searchUser,
    removeUser,
    getPost,
    searchPost,
    removePost,
    sanctionUser,
}
